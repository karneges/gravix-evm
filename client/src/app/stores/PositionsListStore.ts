import { ethers, Contract, BaseContract } from 'ethers'
import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { EvmWalletStore } from './EvmWalletStore.js'
import { GravixVault } from '../../config.js'
import GravixAbi from '../../assets/abi/Gravix.json'
import { Gravix } from '../../assets/misc/index.js'
import { Reactions } from '../utils/reactions.js'
import { IGravix } from '../../assets/misc/Gravix.js'

export type WithoutArr<T> = {
    [Key in {
        [key in keyof T]: key extends keyof Array<any> ? never : key extends `${number}` ? never : key
    }[keyof T]]: T[Key]
}

type State = {
    marketOrders?: WithoutArr<IGravix.PositionStructOutput>[]
}

export class PositionsListStore {
    protected reactions = new Reactions()
    protected state: State = {}

    constructor(protected evmWallet: EvmWalletStore) {
        makeAutoObservable(
            this,
            {},
            {
                autoBind: true,
            },
        )

        this.reactions.create(reaction(() => [this.evmWallet.address], this.initApp, { fireImmediately: true }))
    }

    async initApp() {
        console.log(this.evmWallet.provider, this.evmWallet.address, '2222')
        if (!this.evmWallet.provider || !this.evmWallet.address) return
        console.log('333')
        const browserProvider = new ethers.BrowserProvider(this.evmWallet.provider)
        const signer = await browserProvider.getSigner()
        const gravixContract = new Contract(GravixVault, GravixAbi.abi, signer) as BaseContract as Gravix
        this.evmWallet.address

        const arr: WithoutArr<IGravix.UserPositionInfoStructOutput>[] = await gravixContract.getUserPositions(
            this.evmWallet.address,
        )

        console.log(arr[0], '111')
        runInAction(() => {
            this.state.marketOrders = arr.map(_ => _.position as WithoutArr<IGravix.PositionStructOutput>)
            setTimeout(() => {
                console.log(this.allUserPositions[0].toString(), 'this.state.marketOrders')
            }, 500)
        })
    }

    public get allUserPositions(): WithoutArr<IGravix.PositionStructOutput>[] {
        return this.state.marketOrders ?? []
    }
}