import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { EvmWalletStore } from './EvmWalletStore.js'
import { Gravix, StgUsdtToken, UsdtToken } from '../../config.js'
import { Reactions } from '../utils/reactions.js'
import { getTokenBalance } from '../utils/gravix.js'
import { ethers } from 'ethers'
import { GravixAbi } from '../../assets/abi/Gravix.js'
import { normalizeAmount } from '../utils/normalize-amount.js'

export enum EarnAction {
    Deposit = 'deposit',
    Withdraw = 'withdraw',
}

type State = {
    amount?: string
    action: EarnAction
    usdtBalance?: string
    stgUsdtBalance?: string
    loading?: boolean
}

const initialState: State = {
    action: EarnAction.Deposit,
}

export class EarnStore {
    protected state = initialState

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

    init() {
        this.reactions.create(
            reaction(() => [this.wallet.address, !!this.wallet.provider], this.syncBalance, {
                fireImmediately: true,
            }),
        )
    }

    dispose() {
        this.reactions.destroy()
    }

    get loading(): boolean {
        return !!this.state.loading
    }

    setAction(val: EarnAction): void {
        this.state.action = val
    }

    get action(): EarnAction {
        return this.state.action
    }

    setAmount(val: string): void {
        this.state.amount = val
    }

    get amount(): string | undefined {
        return this.state.amount
    }

    get usdtBalance(): string | undefined {
        return this.state.usdtBalance
    }

    get stgUsdtBalance(): string | undefined {
        return this.state.stgUsdtBalance
    }

    syncBalance(): void {
        this.syncUsdtBalance().catch(console.error)
        this.syncStgUsdtBalance().catch(console.error)
    }

    async syncUsdtBalance(): Promise<void> {
        let usdtBalance: string

        try {
            if (this.wallet.provider && this.wallet.address) {
                usdtBalance = await getTokenBalance(UsdtToken, this.wallet.address, this.wallet.provider)
            }
        } catch (e) {
            console.error(e)
        }

        runInAction(() => {
            this.state.usdtBalance = usdtBalance
        })
    }

    async syncStgUsdtBalance(): Promise<void> {
        let stgUsdtBalance: string

        try {
            if (this.wallet.provider && this.wallet.address) {
                stgUsdtBalance = await getTokenBalance(StgUsdtToken, this.wallet.address, this.wallet.provider)
            }
        } catch (e) {
            console.error(e)
        }

        runInAction(() => {
            this.state.stgUsdtBalance = stgUsdtBalance
        })
    }

    submit(): void {
        if (this.action === EarnAction.Deposit) {
            this.deposit().catch(console.error)
        } else if (this.action === EarnAction.Withdraw) {
            this.withdraw().catch(console.error)
        }
    }

    async deposit(): Promise<void> {
        runInAction(() => {
            this.state.loading = true
        })

        try {
            if (!this.wallet.provider) {
                throw new Error('wallet.provider must be defined')
            }

            if (!this.amount) {
                throw new Error('amount must be defined')
            }

            const browserProvider = new ethers.BrowserProvider(this.wallet.provider)
            const signer = await browserProvider.getSigner()
            const gravix = new ethers.Contract(Gravix, GravixAbi, signer)
            const amount = normalizeAmount(this.amount, 6)
            await gravix.depositLiquidity(amount)
        } catch (e) {
            console.error(e)
        }

        runInAction(() => {
            this.state.loading = false
        })
    }

    async withdraw(): Promise<void> {}
}
