import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { EvmWalletStore } from './EvmWalletStore.js'
import { ethers } from 'ethers'
import { GravixVault } from '../../config.js'
import GravixAbi from '../../assets/abi/Gravix.json'
import { Gravix } from '../../assets/misc/index.js'
import { IGravix } from '../../assets/misc/Gravix.js'
import { Reactions } from '../utils/reactions.js'
import { MarketInfo } from '../../types.js'

type State = {
    markets: MarketInfo[]
}

export class MarketsStore {
    protected state: State = {
        markets: [],
    }

    protected reactions = new Reactions()

    constructor(protected wallet: EvmWalletStore) {
        makeAutoObservable(
            this,
            {},
            {
                autoBind: true,
            },
        )
    }

    init(): void {
        this.reactions.create(reaction(() => this.wallet.address, this.sync, { fireImmediately: true }))
    }

    async sync(): Promise<void> {
        if (!this.wallet.provider) {
            return
        }

        try {
            const provider = new ethers.BrowserProvider(this.wallet.provider)
            const signer = await provider.getSigner()
            const gravix = new ethers.Contract(GravixVault, GravixAbi.abi, signer) as ethers.BaseContract as Gravix
            const markets = await gravix.getAllMarkets()

            runInAction(() => {
                this.state.markets = markets.map(mapMarketInfo)
            })
        } catch (e) {
            console.error(e)
        }
    }

    get markets(): MarketInfo[] {
        return this.state.markets ?? []
    }

    get byIdx(): { [k: string]: MarketInfo | undefined } {
        return Object.fromEntries(this.state.markets.map(item => [item.marketIdx.toString(), item]))
    }
}

export const mapMarketInfo = (item: IGravix.MarketInfoStructOutput): MarketInfo => ({
    marketIdx: item.marketIdx,
    ticker: item.ticker,
    market: {
        depthAsset: item.market.depthAsset,
        lastFundingUpdateTime: item.market.lastFundingUpdateTime,
        lastNoiUpdatePrice: item.market.lastNoiUpdatePrice,
        maxLeverage: item.market.maxLeverage,
        maxTotalLongsUSD: item.market.maxTotalLongsUSD,
        maxTotalShortsUSD: item.market.maxTotalShortsUSD,
        noiWeight: item.market.noiWeight,
        paused: item.market.paused,
        totalLongsAsset: item.market.totalLongsAsset,
        totalShortsAsset: item.market.totalShortsAsset,
        fees: {
            baseDynamicSpreadRate: item.market.fees.baseDynamicSpreadRate,
            baseSpreadRate: item.market.fees.baseSpreadRate,
            borrowBaseRatePerHour: item.market.fees.borrowBaseRatePerHour,
            closeFeeRate: item.market.fees.closeFeeRate,
            fundingBaseRatePerHour: item.market.fees.fundingBaseRatePerHour,
            openFeeRate: item.market.fees.openFeeRate,
        },
        funding: {
            accLongUSDFundingPerShare: item.market.funding.accLongUSDFundingPerShare,
            accShortUSDFundingPerShare: item.market.funding.accShortUSDFundingPerShare,
        },
    },
})
