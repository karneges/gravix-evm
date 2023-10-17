import { ethers, Contract, BaseContract } from 'ethers'
import { makeAutoObservable, reaction } from 'mobx'
import { EvmWalletStore } from './EvmWalletStore.js'
import { GravixVault } from '../../config.js'
import GravixAbi from '../../assets/abi/Gravix.json'
import { Gravix } from '../../assets/misc/index.js'
import { Reactions } from '../utils/reactions.js'

export class PositionsListStore {
    protected reactions = new Reactions()

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

    positionsList = []

    async initApp() {
        console.log(this.evmWallet.provider, this.evmWallet.address, '2222')
        if (!this.evmWallet.provider || !this.evmWallet.address) return
        console.log('333')
        const browserProvider = new ethers.BrowserProvider(this.evmWallet.provider)
        const signer = await browserProvider.getSigner()
        const gravixContract = new Contract(GravixVault, GravixAbi.abi, signer) as BaseContract as Gravix
        this.evmWallet.address

        const arr = await gravixContract.getUserPositions(this.evmWallet.address)
        console.log(arr, 'arr')
        console.log(arr[0][1][3].toString(), 'arr2')
    }

    public get allUserPositions(): any[] {
        return this.positionsList ?? []
    }
}
