import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { Reactions } from '../utils/reactions.js'
import { EvmWalletStore } from './EvmWalletStore.js'
import { UsdtToken } from '../../config.js'
import { getTokenBalance } from '../utils/gravix.js'

type State = {
    usdtBalance?: string
}

export class BalanceStore {
    protected reactions = new Reactions()

    protected state: State = {}

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
            reaction(() => [this.wallet.address, this.wallet.chainId], this.syncUsdtBalance, { fireImmediately: true }),
        )
    }

    dispose() {
        this.reactions.destroy()
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

    get usdtBalance(): string | undefined {
        return this.state.usdtBalance?.toString()
    }
}
