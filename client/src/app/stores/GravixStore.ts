import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { EvmWalletStore } from './EvmWalletStore.js'
import { ethers } from 'ethers'
import { GravixVault } from '../../config.js'
import GravixAbi from '../../assets/abi/Gravix.json'
import { Gravix } from '../../assets/misc/index.js'
import { Reactions } from '../utils/reactions.js'
import { MarketInfo } from '../../types.js'
import { IGravix } from '../../assets/misc/Gravix.js'
import { lastOfCalls } from '../utils/last-of-calls.js'

enum ETheme {
    DARK = 'dark',
    LIGHT = 'light',
}

type State = {
    maxPnlRate?: bigint
    minPositionCollateral?: bigint
    markets: MarketInfo[]
}

const initialState: State = {
    markets: [],
}

export class GravixStore {
    protected state = initialState

    protected reactions = new Reactions()

    readonly priceDecimals = 8

    readonly baseNumber = 6

    isDarkMode = false

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

    init() {
        this.reactions.create(
            reaction(() => this.wallet.address, this.initListener, { fireImmediately: true }),
            reaction(() => this.wallet.address, this.syncData, { fireImmediately: true }),
        )
    }

    dispose() {
        this.reactions.destroy()
        this.wallet.ethers?.off(this.event, this.onContract).catch(console.error)
        this.state = initialState
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

    async initListener(): Promise<void> {
        try {
            await this.wallet.ethers?.off(this.event, this.onContract)
            await this.wallet.ethers?.on(this.event, this.onContract)
        } catch (e) {
            console.error(e)
        }
    }

    protected event = {
        address: GravixVault,
    }

    protected onContract = lastOfCalls(() => {
        this.syncData().catch(console.error)
    }, 500)

    async syncData(): Promise<void> {
        if (!this.wallet.ethers) {
            return
        }

        try {
            const signer = await this.wallet.ethers.getSigner()
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
