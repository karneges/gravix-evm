import { ethers, Contract, BaseContract } from 'ethers'
import { makeAutoObservable } from 'mobx'
import { EvmWalletStore } from './EvmWalletStore.js'
import { GravixVault } from '../../config.js'
import GravixAbi from '../../assets/abi/Gravix.json'
import { Gravix } from '../../assets/misc/index.js'

export class PositionsListStore {
    constructor(protected evmWallet: EvmWalletStore) {
        makeAutoObservable(
            this,
            {},
            {
                autoBind: true,
            },
        )

        console.log(evmWallet, '!@@@')
        this.initApp().catch(() => console.log('1'))
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

        const arr = gravixContract.getUserPositions(this.evmWallet.address[0])
        console.log(arr, 'arr')
    }

    public get allUserPositions(): any[] {
        return this.positionsList ?? []
    }
}
