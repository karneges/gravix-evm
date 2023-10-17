import { makeAutoObservable, reaction, runInAction } from 'mobx'

import { MarketStore } from './MarketStore.js'
import { mapApiSymbol } from '../utils/gravix.js'
import { Reactions } from '../utils/reactions.js'

type State = {
    price?: string
}

export class PriceStore {
    protected state: State = {}

    protected reactions = new Reactions()

    protected timer?: NodeJS.Timeout

    constructor(protected market: MarketStore) {
        makeAutoObservable(
            this,
            {},
            {
                autoBind: true,
            },
        )
    }

    init() {
        this.reactions.create(reaction(() => this.market.market, this.resync, { fireImmediately: true }))
    }

    dispose() {
        clearInterval(this.timer)
    }

    resync() {
        clearInterval(this.timer)

        this.state.price = undefined

        this.timer = setInterval(this.syncPrice, 5000)

        this.syncPrice().catch(console.error)
    }

    async syncPrice(): Promise<void> {
        try {
            const fetchBTCFeed = await fetch(
                `https://api.binance.com/api/v3/avgPrice?symbol=${mapApiSymbol(this.market.market)}`,
            )

            const priceFeed = await fetchBTCFeed.json()

            runInAction(() => {
                this.state.price = priceFeed?.price
            })
        } catch (e) {
            console.error(e)
        }
    }

    get price(): string | undefined {
        return this.state.price
    }
}
