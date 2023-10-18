import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { EvmWalletStore } from './EvmWalletStore.js'
import { GravixVault, StgUsdtToken, UsdtToken } from '../../config.js'
import { Reactions } from '../utils/reactions.js'
import { approveTokens, getTokenBalance } from '../utils/gravix.js'
import { ethers, BaseContract } from 'ethers'
import GravixAbi from '../../assets/abi/Gravix.json'
import { normalizeAmount } from '../utils/normalize-amount.js'
import { Gravix } from '../../assets/misc/Gravix.js'
import { BigNumber } from 'bignumber.js'

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
    poolBalance?: string
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

    get amountNormalized(): string | undefined {
        return this.amount ? normalizeAmount(this.amount, 6) : undefined
    }

    get usdtBalance(): string | undefined {
        return this.state.usdtBalance
    }

    get stgUsdtBalance(): string | undefined {
        return this.state.stgUsdtBalance
    }

    get poolBalance(): string | undefined {
        return this.state.poolBalance
    }

    get depositAmountValid(): boolean {
        if (this.usdtBalance && this.amountNormalized) {
            return new BigNumber(this.usdtBalance).gte(this.amountNormalized)
        }

        return false
    }

    get withdrawAmountValid(): boolean {
        if (this.stgUsdtBalance && this.amountNormalized) {
            return new BigNumber(this.stgUsdtBalance).gte(this.amountNormalized)
        }

        return false
    }

    get amountIsValid(): boolean {
        if (this.action === EarnAction.Deposit) {
            return this.depositAmountValid
        }
        if (this.action === EarnAction.Withdraw) {
            return this.withdrawAmountValid
        }
        return false
    }

    syncBalance(): void {
        this.syncUsdtBalance().catch(console.error)
        this.syncStgUsdtBalance().catch(console.error)
        this.syncPoolBalance().catch(console.error)
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

    async syncPoolBalance(): Promise<void> {
        let poolBalance: string

        try {
            if (this.wallet.provider) {
                poolBalance = await getTokenBalance(UsdtToken, GravixVault, this.wallet.provider)
            }
        } catch (e) {
            console.error(e)
        }

        runInAction(() => {
            this.state.poolBalance = poolBalance
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

            if (!this.wallet.address) {
                throw new Error('wallet.address must be defined')
            }

            const amount = normalizeAmount(this.amount, 6)
            await approveTokens(UsdtToken, this.wallet.address, GravixVault, amount, this.wallet.provider)
            const browserProvider = new ethers.BrowserProvider(this.wallet.provider)
            const signer = await browserProvider.getSigner()
            const gravix = new ethers.Contract(GravixVault, GravixAbi.abi, signer) as BaseContract as Gravix
            await gravix.depositLiquidity(amount)
        } catch (e) {
            console.error(e)
        }

        runInAction(() => {
            this.state.loading = false
        })
    }

    async withdraw(): Promise<void> {
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

            if (!this.wallet.address) {
                throw new Error('wallet.address must be defined')
            }

            const amount = normalizeAmount(this.amount, 6)
            await approveTokens(StgUsdtToken, this.wallet.address, GravixVault, amount, this.wallet.provider)
            const browserProvider = new ethers.BrowserProvider(this.wallet.provider)
            const signer = await browserProvider.getSigner()
            const gravix = new ethers.Contract(GravixVault, GravixAbi.abi, signer) as BaseContract as Gravix
            await gravix.withdrawLiquidity(amount)
        } catch (e) {
            console.error(e)
        }

        runInAction(() => {
            this.state.loading = false
        })
    }
}
