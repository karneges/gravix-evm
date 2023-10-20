import { IGravix } from './assets/misc/Gravix.js'

export type WithoutArr<T> = {
    [Key in {
        [key in keyof T]: key extends keyof Array<any> ? never : key extends `${number}` ? never : key
    }[keyof T]]: T[Key]
}

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

export type FullPositionData = {
    '1': WithoutArr<IGravix.PositionStructOutput>
    '0': string
}

export type PositionViewData = {
    '1': WithoutArr<IGravix.PositionViewStructOutput>
    '0': string
}

export type TGravixPosition = WithoutArr<IGravix.PositionStructOutput> & { index: string }
