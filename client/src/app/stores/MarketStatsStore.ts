import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { BigNumber } from 'bignumber.js'
import { PriceStore } from './PriceStore.js'
import { MarketStore } from './MarketStore.js'
import { Reactions } from '../utils/reactions.js'
import { EvmWalletStore } from './EvmWalletStore.js'

type TAssetData = {
    price: number
    timestamp: number
    signature: string
}

type State = {
    assetData?: TAssetData
}

export class MarketStatsStore {
    protected reactions = new Reactions()
    protected state: State = {}

    constructor(
        protected price: PriceStore,
        protected market: MarketStore,
        protected wallet: EvmWalletStore,
    ) {
        makeAutoObservable(
            this,
            {},
            {
                autoBind: true,
            },
        )
    }

    init() {
        this.reactions.create(
            reaction(() => [this.wallet.address, this.wallet.chainId], this.loadAssetData, { fireImmediately: true }),
        )
    }

    async loadAssetData() {
        const assetData = await (
            await fetch('https://api-cc35d.ondigitalocean.app/api/signature', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    marketIdx: 0,
                    chainId: 59140,
                }),
            })
        ).json()

        runInAction(() => {
            this.state.assetData = assetData
        })
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

    public get marketAssetData(): TAssetData | undefined {
        return this.state.assetData
    }
}
