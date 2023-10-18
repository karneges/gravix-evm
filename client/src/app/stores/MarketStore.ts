import { makeAutoObservable } from 'mobx'
import { MarketsStore } from './MarketsStore.js'
import { MarketInfo } from '../../types.js'
import { decimalPercent } from '../utils/gravix.js'

type State = {
    idx: string
}

const initialState: State = {
    idx: '0',
}

export class MarketStore {
    protected state = initialState

    constructor(protected markets: MarketsStore) {
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

    get idx(): string {
        return this.state.idx
    }

    get market(): MarketInfo | undefined {
        return this.markets.byIdx[this.idx]
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

    public get maxTotalShortsUSD(): string | undefined {
        return this.market?.market.maxTotalShortsUSD.toString()
    }
}
