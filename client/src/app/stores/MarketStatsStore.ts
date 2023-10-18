import { makeAutoObservable } from 'mobx'
import { BigNumber } from 'bignumber.js'
import { PriceStore } from './PriceStore.js'
import { MarketStore } from './MarketStore.js'
import { Reactions } from '../utils/reactions.js'

export class MarketStatsStore {
    protected reactions = new Reactions()

    constructor(
        protected price: PriceStore,
        protected market: MarketStore,
    ) {
        makeAutoObservable(
            this,
            {},
            {
                autoBind: true,
            },
        )
    }

    public get openInterestL(): string | undefined {
        return this.market.totalLongs && this.price.price
            ? new BigNumber(this.market.totalLongs)
                  .times(this.price.price)
                  .dividedBy(10 ** 6)
                  .toFixed(0)
            : undefined
    }

    public get maxTotalLongsUSD(): string | undefined {
        return this.market.maxTotalLongsUSD
    }

    public get openInterestS(): string | undefined {
        return this.market.totalShorts && this.price.price
            ? new BigNumber(this.market.totalShorts)
                  .times(this.price.price)
                  .dividedBy(10 ** 6)
                  .toFixed(0)
            : undefined
    }

    public get maxTotalShortsUSD(): string | undefined {
        return this.market.maxTotalShortsUSD
    }
}
