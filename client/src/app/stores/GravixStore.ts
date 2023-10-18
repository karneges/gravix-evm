import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { EvmWalletStore } from './EvmWalletStore.js'
import { ethers } from 'ethers'
import { GravixVault } from '../../config.js'
import GravixAbi from '../../assets/abi/Gravix.json'
import { Gravix } from '../../assets/misc/index.js'
import { Reactions } from '../utils/reactions.js'

enum ETheme {
    DARK = 'dark',
    LIGHT = 'light',
}

type State = {
    maxPnlRate?: bigint
}

export class GravixStore {
    protected state: State = {}

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

    public readonly priceDecimals = 8
    public readonly baseNumber = 6

    isDarkMode = false
    gravixAccounts: `0x${string}`[] = []

    get test() {
        return 'test'
    }

    init() {
        this.reactions.create(reaction(() => !!this.wallet.provider, this.syncDetails, { fireImmediately: true }))
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

            runInAction(() => {
                this.state.maxPnlRate = details.maxPnlRate
            })
        } catch (e) {
            console.error(e)
        }
    }

    get getThemeMode(): boolean {
        return this.isDarkMode ?? false
    }

    get maxPnlRate(): string | undefined {
        return this.state.maxPnlRate?.toString()
    }
}
