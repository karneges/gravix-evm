import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { MarketConfig, PositionType } from "./types";
import {
  LEVERAGE_DECIMALS,
  PERCENT_100,
  PRICE_DECIMALS,
  SCALING_FACTOR,
  USDT_DECIMALS,
} from "./constants";
import { getOpenPositionInfo, GravixVault } from "./utils/Vault";
import { PriceService } from "./priceService";
import { Signer } from "ethers";
import { checkOpenedPositionMath } from "./utils/mathChecks";
import { ERC20Tokens } from "../typechain-types";

const basic_config: MarketConfig = {
  priceSource: 1,
  maxLongsUSD: 100_000n * USDT_DECIMALS, // 100k
  maxShortsUSD: 100_000n * USDT_DECIMALS, // 100k
  noiWeight: 100,
  maxLeverage: 100_000_000, // 100x
  depthAsset: 15n * USDT_DECIMALS, // 25k
  fees: {
    openFeeRate: 1000000000, // 0.1%
    closeFeeRate: 1000000000, // 0.1%
    baseSpreadRate: 1000000000, // 0.1%
    baseDynamicSpreadRate: 1000000000, // 0.1%
    borrowBaseRatePerHour: 0, // disable by default
    fundingBaseRatePerHour: 0, // disable by default
  },
  ticker: "BTC/USDT",
};
const MARKET_IDX = 0;
describe("Lock", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployOneYearLockFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, priceNode, otherAccount] = await ethers.getSigners();

    const Gravix = await ethers.getContractFactory("Gravix");
    const usdt = await ethers
      .getContractFactory("ERC20Tokens")
      .then((res) => res.deploy("USDT", "USDT"));
    const stg = await ethers
      .getContractFactory("ERC20Tokens")
      .then((res) => res.deploy("STG_USDT", "STG_USDT"));
    const gravix = await Gravix.deploy(
      usdt.getAddress(),
      stg.getAddress(),
      priceNode.address,
    );
    await Promise.all(
      [stg].map((el) => el.transferOwnership(gravix.getAddress())),
    );
    const gravixVault = new GravixVault(gravix, usdt, stg);
    await usdt.mint(owner.getAddress(), 100_000_000n * USDT_DECIMALS);
    return {
      gravixVault,
      owner,
      priceNode,
      otherAccount,
      usdt,
      stg,
    };
  }

  describe("Deployment", function () {
    it("Should set the right owner and tokens", async function () {
      const {
        gravixVault: { contract: gravix },
        owner,
        stg,
        usdt,
      } = await loadFixture(deployOneYearLockFixture);

      expect(await gravix.owner()).to.equal(owner.address);
      expect(await gravix.usdt()).to.equal(await usdt.getAddress());
      expect(await gravix.stgUsdt()).to.equal(await stg.getAddress());
    });

    it("Should set new market config", async function () {
      const {
        gravixVault: { contract: gravix },
      } = await loadFixture(deployOneYearLockFixture);

      await gravix.addMarkets([basic_config]).then((res) => res.wait());
      const firstMarket = await gravix.markets(MARKET_IDX);
      expect(firstMarket.maxLeverage).to.equal(100_000_000);
    });
  });

  describe("Deposit/Withdraw liquidity", function () {
    it("Should deposit usdt and receive the same amount of stg", async function () {
      const { gravixVault, usdt, stg, owner } = await loadFixture(
        deployOneYearLockFixture,
      );
      const DEPOSIT_AMOUNT = 100_000_000n * USDT_DECIMALS;
      await expect(gravixVault.depositLiquidity({ amount: DEPOSIT_AMOUNT }))
        .to.emit(gravixVault.contract, "LiquidityPoolDeposit")
        .withArgs(owner.address, DEPOSIT_AMOUNT, DEPOSIT_AMOUNT);

      const { balance, stgUsdtSupply, targetPrice } =
        await gravixVault.contract.poolAssets();
      expect(balance).to.equal(DEPOSIT_AMOUNT);
      expect(stgUsdtSupply).to.equal(DEPOSIT_AMOUNT);

      await expect(gravixVault.withdrawLiquidity({ amount: DEPOSIT_AMOUNT }))
        .to.emit(gravixVault.contract, "LiquidityPoolWithdraw")
        .withArgs(owner.address, DEPOSIT_AMOUNT, DEPOSIT_AMOUNT);
    });
  });
  describe("Market position", function () {
    let context: {
      gravixVault: GravixVault;
      usdt: ERC20Tokens;
      stg: ERC20Tokens;
      owner: Signer;
      priceNode: Signer;
    };
    const initialPrice = 100n * USDT_DECIMALS;
    const closePrice = 101n * USDT_DECIMALS;

    before(async () => {
      context = await loadFixture(deployOneYearLockFixture);
    });
    it("should open market position", async () => {
      const { gravixVault, usdt, stg, owner, priceNode } = context;
      await gravixVault.depositLiquidity({
        amount: 1000n * USDT_DECIMALS,
      });
      await gravixVault.contract
        .addMarkets([basic_config])
        .then((res) => res.wait());
      const collateral = 10n * USDT_DECIMALS;

      await usdt.approve(gravixVault.contract, collateral);
      const leverage = LEVERAGE_DECIMALS;

      const timestamp = await time.latest();
      const signature = await PriceService.getPriceSignature({
        price: initialPrice,
        timestamp,
        signer: priceNode,
        marketIdx: MARKET_IDX,
      });
      const vaultPrevDetails = await gravixVault.contract.getDetails();
      const { expectedPrice, position, market } = await getOpenPositionInfo({
        initialPrice,
        leverage,
        collateral,
        gravixVault,
        positionType: PositionType.Long,
        marketIdx: MARKET_IDX,
      });
      await expect(
        gravixVault.contract.openMarketPosition(
          MARKET_IDX,
          PositionType.Long,
          collateral,
          expectedPrice,
          leverage,
          100,
          initialPrice,
          timestamp,
          signature,
        ),
      ).to.emit(gravixVault.contract, "MarketOrderExecution");

      const userPosition = await gravixVault.contract.positions(owner, 0);
      const openFeeExpected =
        (position * market.fees.openFeeRate) / PERCENT_100;

      expect(userPosition.openFee).to.equal(openFeeExpected);

      await checkOpenedPositionMath({
        vault: gravixVault,
        collateral,
        leverage,
        marketIdx: 0n,
        openFeeExpected,
        expectedOpenPrice: expectedPrice,
        posType: PositionType.Long,
        user: await owner.getAddress(),
        assetPrice: initialPrice,
        vaultPrevDetails,
        positionKey: 0,
      });
    });
    it("should close market position", async () => {
      const { gravixVault, usdt, stg, owner, priceNode } = context;

      const posType: PositionType = await gravixVault.contract
        .getPositionView({
          positionKey: 0,
          assetPrice: closePrice,
          user: await owner.getAddress(),
          funding: {
            accLongUSDFundingPerShare: 0,
            accShortUSDFundingPerShare: 0,
          },
        })
        .then((res) => Number(res.position.positionType));

      const market = await gravixVault.contract.markets(MARKET_IDX);
      const timestamp = await time.latest();
      const signature = await PriceService.getPriceSignature({
        price: closePrice,
        timestamp,
        signer: priceNode,
        marketIdx: MARKET_IDX,
      });

      const closePositionTx = await gravixVault.contract
        .closeMarketPosition(MARKET_IDX, 0, closePrice, timestamp, signature)
        .then((res) => res.wait());

      const closePositionEvent = await gravixVault.contract
        .queryFilter(gravixVault.contract.getEvent("ClosePosition"))
        .then((res) => res[0]);
      const positionView = closePositionEvent.args.positionView;
      const priceMultiplier =
        posType === PositionType.Long
          ? PERCENT_100 - market.fees.baseSpreadRate
          : PERCENT_100 + market.fees.baseSpreadRate;

      const expectedClosePrice = (priceMultiplier * closePrice) / PERCENT_100;

      const leveraged_usd =
        positionView.position.initialCollateral -
        (positionView.position.openFee * positionView.position.leverage) /
          1000000n;
      const timePassed =
        positionView.viewTime - positionView.position.createdAt;

      const borrowFee =
        (((timePassed * positionView.position.borrowBaseRatePerHour) / 3600n) *
          leveraged_usd) /
        PERCENT_100;
      expect(borrowFee).to.be.eq(positionView.borrowFee);
      const colUp =
        positionView.position.initialCollateral - positionView.position.openFee;

      let expectedPnl =
        (((expectedClosePrice * SCALING_FACTOR) /
          positionView.position.openPrice -
          SCALING_FACTOR) *
          BigInt(posType == PositionType.Long ? 1 : -1) *
          leveraged_usd) /
        SCALING_FACTOR;

      const liqPriceDist =
        (positionView.position.openPrice *
          ((colUp * 9n) / 10n - borrowFee - positionView.fundingFee)) /
        leveraged_usd;

      let liqPrice =
        posType == PositionType.Long
          ? positionView.position.openPrice - liqPriceDist
          : positionView.position.openPrice + liqPriceDist;

      liqPrice =
        posType == PositionType.Long
          ? (liqPrice * PERCENT_100) /
            (PERCENT_100 - market.fees.baseSpreadRate)
          : (liqPrice * PERCENT_100) /
            (PERCENT_100 + market.fees.baseSpreadRate);
      liqPrice = liqPrice < 0 ? 0n : liqPrice;

      let upPos =
        (colUp * positionView.position.leverage) / 1000000n +
        expectedPnl -
        borrowFee -
        positionView.fundingFee;

      const expectedCloseFee =
        (upPos * positionView.position.closeFeeRate) / PERCENT_100;

      expect(liqPrice).to.be.eq(positionView.liquidationPrice);

      expect(positionView.closePrice).to.be.eq(expectedClosePrice);
      expect(positionView.pnl).to.be.eq(expectedPnl);
      expect(positionView.liquidate).to.be.false;

      expect(positionView.closePrice).to.be.eq(expectedClosePrice);
      expect(positionView.closeFee).to.be.eq(expectedCloseFee);

      const maxPnlRate = await gravixVault.contract
        .getDetails()
        .then((res) => res.maxPnlRate);
      const maxPnl = (colUp * maxPnlRate) / PERCENT_100;

      const netPnl = expectedPnl - expectedCloseFee;
      const percentDiff =
        (netPnl /
          (positionView.position.initialCollateral -
            positionView.position.openFee)) *
        1000000n;

      const limitedPnl = maxPnl > expectedPnl ? expectedPnl : maxPnl;
      const pnlWithFees = limitedPnl - borrowFee - positionView.fundingFee;
      const userPayout = pnlWithFees - expectedCloseFee + colUp;

      const {
        args: { to, from, value },
      } = (
        await usdt.queryFilter(
          usdt.getEvent("Transfer"),
          closePositionTx!.blockNumber,
        )
      )[0];
      expect(from).to.be.eq(await gravixVault.contract.getAddress());
      expect(to).to.be.eq(await owner.getAddress());
      expect(value).to.be.eq(userPayout);
    });
  });
  describe("Liquidate position", function () {
    let context: {
      gravixVault: GravixVault;
      usdt: ERC20Tokens;
      stg: ERC20Tokens;
      owner: Signer;
      priceNode: Signer;
      otherAccount: Signer;
    };
    const initialPrice = 1000n * USDT_DECIMALS;

    before(async () => {
      context = await loadFixture(deployOneYearLockFixture);
    });
    it("should open market position", async () => {
      const { gravixVault, usdt, stg, owner, priceNode } = context;
      await gravixVault.depositLiquidity({
        amount: 1000n * USDT_DECIMALS,
      });
      await gravixVault.contract
        .addMarkets([basic_config])
        .then((res) => res.wait());
      const collateral = 10n * USDT_DECIMALS;

      await usdt.approve(gravixVault.contract, collateral);
      const leverage = LEVERAGE_DECIMALS * 10n;

      const timestamp = await time.latest();
      const signature = await PriceService.getPriceSignature({
        price: initialPrice,
        timestamp,
        signer: priceNode,
        marketIdx: MARKET_IDX,
      });
      const { expectedPrice, position, market } = await getOpenPositionInfo({
        initialPrice,
        leverage,
        collateral,
        gravixVault,
        positionType: PositionType.Long,
        marketIdx: MARKET_IDX,
      });
      await expect(
        gravixVault.contract.openMarketPosition(
          MARKET_IDX,
          PositionType.Long,
          collateral,
          expectedPrice,
          leverage,
          100,
          initialPrice,
          timestamp,
          signature,
        ),
      ).to.emit(gravixVault.contract, "MarketOrderExecution");
    });
    it("Liquidate position", async () => {
      const { gravixVault, usdt, stg, owner, priceNode, otherAccount } =
        context;
      const positionView = await gravixVault.contract.getPositionView({
        positionKey: 0,
        assetPrice: initialPrice * 100n,
        user: await owner.getAddress(),
        funding: {
          accLongUSDFundingPerShare: 0,
          accShortUSDFundingPerShare: 0,
        },
      });
      const updatedLiquidationPrice =
        positionView.liquidationPrice - PRICE_DECIMALS;
      const liquidationSignature = await PriceService.getPriceSignature({
        price: updatedLiquidationPrice,
        marketIdx: MARKET_IDX,
        signer: priceNode,
        timestamp: await time.latest(),
      });

      {
        const positionView = await gravixVault.contract.getPositionView({
          positionKey: 0,
          assetPrice: updatedLiquidationPrice,
          user: await owner.getAddress(),
          funding: {
            accLongUSDFundingPerShare: 0,
            accShortUSDFundingPerShare: 0,
          },
        });
        expect(positionView.liquidate).to.be.true;
      }

      const tx = await gravixVault.contract
        .connect(otherAccount)
        .liquidatePositions([
          {
            assetPrice: updatedLiquidationPrice,
            timestamp: await time.latest(),
            marketIdx: MARKET_IDX,
            signature: liquidationSignature,
            positions: [
              {
                positionKey: 0,
                user: await owner.getAddress(),
              },
            ],
          },
        ])
        .then((res) => res.wait());

      const liquidationEvent = await gravixVault.contract
        .queryFilter(
          gravixVault.contract.getEvent("LiquidatePosition"),
          tx!.blockNumber,
        )
        .then((res) => res[0]);
      expect(liquidationEvent.args.liquidator).to.be.eq(
        await otherAccount.getAddress(),
      );
      expect(liquidationEvent.args.user).to.be.eq(await owner.getAddress());
      const updatedCollateral =
        positionView.position.initialCollateral - positionView.position.openFee;

      const vaultDetails = await gravixVault.contract.getDetails();

      const liquidationReward =
        (updatedCollateral * vaultDetails.liquidation.rewardShare) /
        PERCENT_100;
      const usdtTransferEvent = await usdt
        .queryFilter(usdt.getEvent("Transfer"), tx!.blockNumber)
        .then((res) => res[0]);

      expect(usdtTransferEvent.args.to).to.be.eq(
        await otherAccount.getAddress(),
      );
      expect(usdtTransferEvent.args.value).to.be.eq(liquidationReward);
    });
  });
});
