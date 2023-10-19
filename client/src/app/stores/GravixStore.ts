import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { EvmWalletStore } from './EvmWalletStore.js'
import { ethers } from 'ethers'
import { GravixVault, defaultChainId, networks } from '../../config.js'
import GravixAbi from '../../assets/abi/Gravix.json'
import { Gravix } from '../../assets/misc/index.js'
import { Reactions } from '../utils/reactions.js'
import { MarketInfo } from '../../types.js'
import { IGravix } from '../../assets/misc/Gravix.js'
import { lastOfCalls } from '../utils/last-of-calls.js'

enum ETheme {
    DARK = 'dark-theme',
    LIGHT = 'light-theme',
}

type State = {
    maxPnlRate?: bigint
    minPositionCollateral?: bigint
    markets: MarketInfo[]
    chainId: number
}

const initialState: State = {
    markets: [],
    chainId: defaultChainId,
}

export class GravixStore {
    protected state = initialState

    protected reactions = new Reactions()

    protected provider?: ethers.BrowserProvider

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
            reaction(() => [this.wallet.address, this.wallet.chainId], this.syncData, { fireImmediately: true }),
            reaction(() => this.wallet.chainId, this.syncChainId, { fireImmediately: true }),
        )
    }

    dispose() {
        this.reactions.destroy()
        this.provider?.off(this.event, this.onContract).catch(console.error)
        this.state = initialState
    }

    initTheme() {
        const themeType = localStorage.getItem('theme-type')
        if (themeType === ETheme.DARK) this.toggleTheme(true)
        document.body.className = this.isDarkMode ? ETheme.DARK : ETheme.LIGHT
    }

    toggleTheme(isDark?: boolean) {
        if (isDark) {
            this.isDarkMode = true
            document.body.className = ETheme.DARK
            return
        }
        this.isDarkMode = !this.isDarkMode

        this.isDarkMode
            ? localStorage.setItem('theme-type', ETheme.DARK)
            : localStorage.setItem('theme-type', ETheme.LIGHT)

        document.body.className = this.isDarkMode ? ETheme.DARK : ETheme.LIGHT
    }

    async initListener(): Promise<void> {
        try {
            await this.provider?.off(this.event, this.onContract)
            await this.provider?.on(this.event, this.onContract)
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
        let maxPnlRate: bigint,
            minPositionCollateral: bigint,
            markets: MarketInfo[] = []

        if (this.wallet.provider) {
            try {
                this.provider = new ethers.BrowserProvider(this.wallet.provider)
                const signer = await this.provider.getSigner()
                const gravix = new ethers.Contract(GravixVault, GravixAbi.abi, signer) as ethers.BaseContract as Gravix
                const details = await gravix.getDetails()
                const _markets = await gravix.getAllMarkets()

                await this.initListener()

                maxPnlRate = details.maxPnlRate
                minPositionCollateral = details.minPositionCollateral
                markets = _markets.map(mapMarketInfo)
            } catch (e) {
                console.error(e)
            }
        }

        runInAction(() => {
            this.state.maxPnlRate = maxPnlRate
            this.state.minPositionCollateral = minPositionCollateral
            this.state.markets = markets
        })
    }

    syncChainId(): void {
        if (this.wallet.chainId) {
            const network = networks.find(item => item.chainId === this.wallet.chainId) ?? networks[0]
            this.state.chainId = network.chainId
        }
    }

    setChainId(val: number): void {
        this.state.chainId = val
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

    get chainId(): number {
        return this.state.chainId
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
