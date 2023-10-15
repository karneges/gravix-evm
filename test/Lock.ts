import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { MarketConfig } from "./types";
import { USDT_DECIMALS } from "./constants";
const basic_config: MarketConfig = {
  priceSource: 1,
  maxLongsUSD: 100_000 * USDT_DECIMALS, // 100k
  maxShortsUSD: 100_000 * USDT_DECIMALS, // 100k
  noiWeight: 100,
  maxLeverage: 100_000_000, // 100x
  depthAsset: 15 * USDT_DECIMALS, // 25k
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
    const [owner, otherAccount] = await ethers.getSigners();

    const Gravix = await ethers.getContractFactory("Gravix");
    const usdt = await ethers
      .getContractFactory("ERC20Tokens")
      .then((res) => res.deploy("USDT", "USDT"));
    const stg = await ethers
      .getContractFactory("ERC20Tokens")
      .then((res) => res.deploy("STG_USDT", "STG_USDT"));
    const gravix = await Gravix.deploy(usdt.getAddress(), stg.getAddress());
    await Promise.all(
      [stg].map((el) => el.transferOwnership(gravix.getAddress())),
    );
    await usdt.mint(owner.getAddress(), 100_000_000 * USDT_DECIMALS);
    return {
      gravix,
      owner,
      otherAccount,
      usdt,
      stg,
    };
  }

  describe("Deployment", function () {
    it("Should set the right owner and tokens", async function () {
      const { gravix, owner, stg, usdt } = await loadFixture(
        deployOneYearLockFixture,
      );

      expect(await gravix.owner()).to.equal(owner.address);
      expect(await gravix.usdt()).to.equal(await usdt.getAddress());
      expect(await gravix.stgUsdt()).to.equal(await stg.getAddress());
    });

    it("Should set new market config", async function () {
      const { gravix } = await loadFixture(deployOneYearLockFixture);

      await gravix.addMarkets([basic_config]).then((res) => res.wait());
      const firstMarket = await gravix.markets(0);
      expect(firstMarket.maxLeverage).to.equal(100_000_000);
    });
  });

  describe("Deposit liquidity", function () {
    describe("Validations", function () {
      it("Should revert with the right error if called too soon", async function () {
        const { gravix, usdt } = await loadFixture(deployOneYearLockFixture);
        await usdt.approve(gravix.getAddress(), 100_000_000 * USDT_DECIMALS);
        await gravix.depositLiquidity(100_000_000 * USDT_DECIMALS);
      });

      it("Should revert with the right error if called from another account", async function () {
        const { lock, unlockTime, otherAccount } = await loadFixture(
          deployOneYearLockFixture,
        );

        // We can increase the time in Hardhat Network
        await time.increaseTo(unlockTime);

        // We use lock.connect() to send a transaction from another account
        await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
          "You aren't the owner",
        );
      });

      it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
        const { lock, unlockTime } = await loadFixture(
          deployOneYearLockFixture,
        );

        // Transactions are sent using the first signer by default
        await time.increaseTo(unlockTime);

        await expect(lock.withdraw()).not.to.be.reverted;
      });
    });

    describe("Events", function () {
      it("Should emit an event on withdrawals", async function () {
        const { lock, unlockTime, lockedAmount } = await loadFixture(
          deployOneYearLockFixture,
        );

        await time.increaseTo(unlockTime);

        await expect(lock.withdraw())
          .to.emit(lock, "Withdrawal")
          .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
      });
    });

    describe("Transfers", function () {
      it("Should transfer the funds to the owner", async function () {
        const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
          deployOneYearLockFixture,
        );

        await time.increaseTo(unlockTime);

        await expect(lock.withdraw()).to.changeEtherBalances(
          [owner, lock],
          [lockedAmount, -lockedAmount],
        );
      });
    });
  });
});
