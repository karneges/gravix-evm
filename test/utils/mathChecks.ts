import { expect } from "chai";
import { GravixVault } from "./Vault";
import { AddressLike } from "ethers";
import { PositionType } from "../types";
import { IGravix } from "../../typechain-types/contracts/Gravix";
import { PERCENT_100 } from "../constants";

export const checkOpenedPositionMath = async ({
  vault,
  collateral,
  openFeeExpected,
  user,
  positionKey,
  assetPrice,
  leverage,
  expectedOpenPrice,
  posType,
  marketIdx,
  vaultPrevDetails,
}: {
  vault: GravixVault;
  user: AddressLike;
  collateral: bigint;
  openFeeExpected: bigint;
  vaultPrevDetails: IGravix.DetailsStructOutput;
  positionKey: string;
  assetPrice: bigint;
  leverage: bigint;
  expectedOpenPrice: bigint;
  posType: PositionType;
  marketIdx: bigint;
}): Promise<{ colUp: bigint; posUp: bigint; liqPrice: bigint }> => {
  const details = await vault.contract.getDetails();
  const market = await vault.contract.markets(marketIdx);
  const colUp = collateral - openFeeExpected;

  let poolIncrease = openFeeExpected;

  expect(details.collateralReserve).to.be.eq(
    vaultPrevDetails.collateralReserve + colUp,
  );
  expect(details.poolAssets.balance).to.be.eq(
    vaultPrevDetails.poolAssets.balance + poolIncrease,
  );

  const posView = await vault.contract.getPositionView({
    positionKey: positionKey,
    assetPrice,
    user,
    funding: {
      accLongUSDFundingPerShare: 0,
      accShortUSDFundingPerShare: 0,
    },
  });

  const leveraged_usd =
    ((posView.position.initialCollateral - posView.position.openFee) *
      posView.position.leverage) /
    BigInt(1000000);

  const time_passed = posView.viewTime - posView.position.createdAt;
  const borrowFee =
    (((time_passed * posView.position.borrowBaseRatePerHour) / 3600n) *
      leveraged_usd) /
    PERCENT_100;

  const posUp = (colUp * leverage) / 1000000n;
  const liqPriceDist =
    (((expectedOpenPrice *
      ((colUp * 9n) / 10n - borrowFee - posView.fundingFee)) /
      colUp) *
      1000000n) /
    leverage;

  let liqPrice =
    posType == 0
      ? expectedOpenPrice - liqPriceDist
      : expectedOpenPrice + liqPriceDist;
  liqPrice =
    posType == 0
      ? (liqPrice * PERCENT_100) / (PERCENT_100 - market.fees.baseSpreadRate)
      : (liqPrice * PERCENT_100) / (PERCENT_100 + market.fees.baseSpreadRate);
  liqPrice = liqPrice < 0 ? 0n : liqPrice;

  expect(posView.liquidationPrice.toString()).to.be.eq(liqPrice.toString());
  return {
    colUp,
    posUp,
    liqPrice,
  };
};
