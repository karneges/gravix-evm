import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { MarketConfig, PositionType } from "./types";
import { LEVERAGE_DECIMALS, PERCENT_100, USDT_DECIMALS } from "./constants";
import { getOpenPositionInfo, GravixVault } from "./utils/Vault";
import { PriceService } from "./priceService";
import { EventLog, getBytes } from "ethers";
import { checkOpenedPositionMath } from "./utils/mathChecks";
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
};
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
      const firstMarket = await gravix.markets(0);
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
    it("should open market position", async () => {
      const { gravixVault, usdt, stg, owner, priceNode } = await loadFixture(
        deployOneYearLockFixture,
      );

      await gravixVault.contract
        .addMarkets([basic_config])
        .then((res) => res.wait());
      const collateral = 100n * USDT_DECIMALS;

      await usdt.approve(gravixVault.contract, collateral);
      const leverage = LEVERAGE_DECIMALS;
      const price = 100n * USDT_DECIMALS;
      const timestamp = await time.latest();
      const signature = await PriceService.getPriceSignature({
        price,
        timestamp,
        signer: priceNode,
      });
      const vaultPrevDetails = await gravixVault.contract.getDetails();
      const { expectedPrice, position, market } = await getOpenPositionInfo({
        initialPrice: price,
        leverage,
        collateral,
        gravixVault,
        positionType: PositionType.Long,
        marketIdx: 0,
      });
      await expect(
        gravixVault.contract.openMarketPosition(
          0,
          PositionType.Long,
          collateral,
          expectedPrice,
          leverage,
          100,
          price,
          timestamp,
          signature,
        ),
      ).to.emit(gravixVault.contract, "MarketOrderExecution");
      const userPosition = await gravixVault.contract.positions(owner, 0);
      const openFeeExpected =
        (position * market.fees.openFeeRate) / PERCENT_100;

      expect(userPosition.openFee).to.equal(openFeeExpected);

      const {} = await checkOpenedPositionMath({
        vault: gravixVault,
        collateral,
        leverage,
        marketIdx: 0n,
        openFeeExpected,
        expectedOpenPrice: expectedPrice,
        posType: PositionType.Long,
        user: owner.address,
        assetPrice: BigInt(price),
        vaultPrevDetails,
        positionKey: "0",
      });
    });
  });
});
