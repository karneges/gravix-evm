export type Fees = {
    openFeeRate: bigint
    closeFeeRate: bigint
    baseSpreadRate: bigint
    baseDynamicSpreadRate: bigint
    borrowBaseRatePerHour: bigint
    fundingBaseRatePerHour: bigint
}

export type Funding = {
    accLongUSDFundingPerShare: bigint
    accShortUSDFundingPerShare: bigint
}

export type Market = {
    totalLongsAsset: bigint
    totalShortsAsset: bigint
    maxTotalLongsUSD: bigint
    maxTotalShortsUSD: bigint
    lastNoiUpdatePrice: bigint
    noiWeight: bigint
    funding: Funding
    lastFundingUpdateTime: bigint
    maxLeverage: bigint
    depthAsset: bigint
    fees: Fees
    paused: boolean
}

export type MarketInfo = {
    marketIdx: bigint
    ticker: string
    market: Market
}
