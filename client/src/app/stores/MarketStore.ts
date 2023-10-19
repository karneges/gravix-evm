import { makeAutoObservable } from 'mobx'
import { MarketInfo } from '../../types.js'
import { decimalLeverage, decimalPercent } from '../utils/gravix.js'
import { GravixStore } from './GravixStore.js'

type State = {
    idx?: string
}

const initialState: State = {}

export class MarketStore {
    protected state = initialState

    constructor(protected gravix: GravixStore) {
        makeAutoObservable(
            this,
            {},
            {
                autoBind: true,
            },
        )
    }

    setIdx(val: string): void {
        this.state.idx = val
    }

    get idx(): string | undefined {
        return this.state.idx ?? this.gravix.markets[0]?.marketIdx.toString()
    }

    get market(): MarketInfo | undefined {
        return this.idx ? this.gravix.byIdx[this.idx] : undefined
    }

    get totalLongs(): string | undefined {
        return this.market?.market.totalLongsAsset.toString()
    }

    get openFeeRate(): string | undefined {
        if (this.market?.market.fees.openFeeRate !== undefined) {
            return decimalPercent(this.market?.market.fees.openFeeRate.toString())
        }
        return undefined
    }

    get totalShorts(): string | undefined {
        return this.market?.market.totalShortsAsset.toString()
    }

    get depth(): string | undefined {
        return this.market?.market.depthAsset.toString()
    }

    get baseSpreadRate(): string | undefined {
        if (this.market?.market.fees.baseSpreadRate !== undefined) {
            return decimalPercent(this.market.market.fees.baseSpreadRate.toString())
        }
        return undefined
    }

    get borrowBaseRatePerHour(): string | undefined {
        return this.market?.market.fees.borrowBaseRatePerHour !== undefined
            ? decimalPercent(this.market.market.fees.borrowBaseRatePerHour.toString())
            : undefined
    }

    get maxTotalLongsUSD(): string | undefined {
        return this.market?.market.maxTotalLongsUSD.toString()
    }

    get maxTotalShortsUSD(): string | undefined {
        return this.market?.market.maxTotalShortsUSD.toString()
    }

    get maxLeverage(): string | undefined {
        return this.market?.market.maxLeverage ? decimalLeverage(this.market.market.maxLeverage.toString()) : undefined
    }
}
