export interface MarketConfig {
  priceSource: 0 | 1 | 2;
  maxLongsUSD: bigint;
  maxShortsUSD: bigint;
  noiWeight: number;
  maxLeverage: number;
  depthAsset: bigint;
  fees: {
    openFeeRate: number;
    closeFeeRate: number;
    baseSpreadRate: number;
    baseDynamicSpreadRate: number;
    borrowBaseRatePerHour: number;
    fundingBaseRatePerHour: number;
  };
}
export enum PositionType {
  Long,
  Short,
}
