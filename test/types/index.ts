export interface MarketConfig {
  priceSource: 0 | 1 | 2;
  maxLongsUSD: number;
  maxShortsUSD: number;
  noiWeight: number;
  maxLeverage: number;
  depthAsset: number;
  fees: {
    openFeeRate: number;
    closeFeeRate: number;
    baseSpreadRate: number;
    baseDynamicSpreadRate: number;
    borrowBaseRatePerHour: number;
    fundingBaseRatePerHour: number;
  };
}
