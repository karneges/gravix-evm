import { makeAutoObservable } from 'mobx'

export enum Market {
    BTC = 'BTC',
    ETH = 'ETH',
    BNB = 'BNB',
}

type State = {
    market: Market
}

const initialState: State = {
    market: Market.BTC,
}

export class MarketStore {
    protected state = initialState

    constructor() {
        makeAutoObservable(
            this,
            {},
            {
                autoBind: true,
            },
        )
    }

    setMarket(val: Market): void {
        this.state.market = val
    }

    get market(): Market {
        return this.state.market
    }
}
