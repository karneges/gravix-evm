import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { EvmWalletStore } from './EvmWalletStore.js'
import { ethers } from 'ethers'
import { GravixVault } from '../../config.js'
import GravixAbi from '../../assets/abi/Gravix.json'
import { Gravix } from '../../assets/misc/index.js'
import { Reactions } from '../utils/reactions.js'
import { MarketInfo } from '../../types.js'
import { IGravix } from '../../assets/misc/Gravix.js'

enum ETheme {
    DARK = 'dark',
    LIGHT = 'light',
}

type State = {
    maxPnlRate?: bigint
    minPositionCollateral?: bigint
    markets: MarketInfo[]
}

export class GravixStore {
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

        this.initTheme()
    }

    readonly priceDecimals = 8
    readonly baseNumber = 6

    isDarkMode = false

    init() {
        this.reactions.create(reaction(() => this.wallet.address, this.syncDetails, { fireImmediately: true }))
    }

    initTheme() {
        const themeType = localStorage.getItem('theme-type')
        if (themeType === ETheme.DARK) this.toggleTheme(true)
    }

    toggleTheme(isDark?: boolean) {
        if (isDark) {
            this.isDarkMode = true
            return
        }
        this.isDarkMode = !this.isDarkMode

        this.isDarkMode
            ? localStorage.setItem('theme-type', ETheme.DARK)
            : localStorage.setItem('theme-type', ETheme.LIGHT)
    }

    async syncDetails(): Promise<void> {
        if (!this.wallet.provider) {
            return
        }

        try {
            const provider = new ethers.BrowserProvider(this.wallet.provider)
            const signer = await provider.getSigner()
            const gravix = new ethers.Contract(GravixVault, GravixAbi.abi, signer) as ethers.BaseContract as Gravix
            const details = await gravix.getDetails()
            const markets = await gravix.getAllMarkets()

            runInAction(() => {
                this.state.maxPnlRate = details.maxPnlRate
                this.state.minPositionCollateral = details.minPositionCollateral
                this.state.markets = markets.map(mapMarketInfo)
            })
        } catch (e) {
            console.error(e)
        }
    }

    get markets(): MarketInfo[] {
        return this.state.markets
    }

    get byIdx(): { [k: string]: MarketInfo | undefined } {
        return Object.fromEntries(this.markets.map(item => [item.marketIdx.toString(), item]))
    }

    get getThemeMode(): boolean {
        return this.isDarkMode ?? false
    }

    get maxPnlRate(): string | undefined {
        return this.state.maxPnlRate?.toString()
    }

    get minPositionCollateral(): string | undefined {
        return this.state.minPositionCollateral?.toString()
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
