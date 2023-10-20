import { comparer, makeAutoObservable, reaction, runInAction } from 'mobx'
import { Reactions } from '../utils/reactions.js'
import { EvmWalletStore } from './EvmWalletStore.js'
import { getTokenBalance } from '../utils/gravix.js'
import { GravixStore } from './GravixStore.js'
import { AccountAbstractionStore } from './accountAbstractionContext-v2.js'

type State = {
    usdtBalance?: string
}

export class BalanceStore {
    protected reactions = new Reactions()

    protected state: State = {}

    constructor(
        protected accountAbstractionStore: AccountAbstractionStore,
        protected evmWallet: EvmWalletStore,
        private gravix: GravixStore,
    ) {
        makeAutoObservable(
            this,
            {},
            {
                autoBind: true,
            },
        )
    }
    get wallet() {
        return this.accountAbstractionStore.isAuthenticated
            ? this.accountAbstractionStore.wallets.safe
            : this.accountAbstractionStore.wallets.owner
    }
    init() {
        this.reactions.create(
            reaction(() => [this.wallet, this.gravix.network], this.syncUsdtBalance, {
                fireImmediately: true,
                equals: comparer.structural,
            }),
        )
    }

    dispose() {
        this.reactions.destroy()
    }

    async syncUsdtBalance(): Promise<void> {
        let usdtBalance: string
        try {
            if (this.wallet && this.evmWallet.provider && this.gravix.network) {
                usdtBalance = await getTokenBalance(
                    this.gravix.network.UsdtToken,
                    this.wallet!,
                    this.evmWallet.provider,
                )
                console.log(`address: ${this.wallet}, usdtBalance: ${usdtBalance}`)
            }
        } catch (e) {
            console.error(e)
        }

        runInAction(() => {
            this.state.usdtBalance = usdtBalance
        })
    }

    get usdtBalance(): string | undefined {
        return this.state.usdtBalance?.toString()
    }
}
