import { AddressLike } from "ethers";
import { ERC20Tokens, Gravix } from "../../typechain-types";
import { PERCENT_100, PRICE_DECIMALS } from "../constants";
import { PositionType } from "../types";
import Bignumber from "bignumber.js";

export class GravixVault {
  constructor(
    public readonly contract: Gravix,
    public readonly usdtToken: ERC20Tokens,
    public readonly stgUsdtToken: ERC20Tokens,
  ) {}
  depositLiquidity = async ({
    from,
    amount,
  }: {
    from?: AddressLike;
    amount: bigint;
  }) => {
    await this.usdtToken.approve(this.contract, amount);
    return this.contract.depositLiquidity(amount, { from });
  };
  withdrawLiquidity = async ({
    from,
    amount,
  }: {
    from?: AddressLike;
    amount: bigint;
  }) => {
    await this.stgUsdtToken.approve(this.contract, amount);
    return this.contract.withdrawLiquidity(amount, { from });
  };
}
export function bn(num: number | string | bigint) {
  return new Bignumber(Number(num));
}
export const getOpenPositionInfo = async ({
  initialPrice,
  marketIdx,
  gravixVault,
  collateral,
  leverage,
  positionType,
}: {
  initialPrice: bigint;
  marketIdx: number;
  collateral: bigint;
  leverage: bigint;
  positionType: PositionType;
  gravixVault: GravixVault;
}) => {
  const market = await gravixVault.contract.markets(marketIdx);
  const position = (collateral * leverage) / 1000000n;
  const positionInAssets =
    (BigInt(position) * BigInt(PRICE_DECIMALS)) / BigInt(initialPrice);

  let newNoi;
  if (positionType === PositionType.Long) {
    const newLongsTotal = market.totalLongsAsset + positionInAssets / BigInt(2);
    newNoi = newLongsTotal - market.totalShortsAsset;
  } else {
    const newShortsTotal =
      market.totalShortsAsset + positionInAssets / BigInt(2);
    newNoi = newShortsTotal - market.totalLongsAsset;
  }

  newNoi = newNoi < 0 ? BigInt(0) : newNoi;

  const dynamic_spread =
    (newNoi * market.fees.baseDynamicSpreadRate) / market.depthAsset;
  const totalSpread = market.fees.baseSpreadRate + dynamic_spread;

  const priceMultiplier =
    positionType === PositionType.Long
      ? PERCENT_100 + totalSpread
      : PERCENT_100 - totalSpread;

  return {
    expectedPrice: (priceMultiplier * BigInt(initialPrice)) / PERCENT_100,
    position,
    market,
    initialPrice,
    totalSpread,
  };
};
