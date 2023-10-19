import { makeAutoObservable, runInAction } from 'mobx'
import { MetaMaskInpageProvider } from '@metamask/providers'
import { Web3 } from 'web3'
import { ethers } from 'ethers'

type State = {
    chainId?: string
    address?: string
    balance?: string
}

export class EvmWalletStore {
    protected state: State = {}

    public provider?: MetaMaskInpageProvider

    public ethers?: ethers.BrowserProvider

    public web3?: Web3

    constructor() {
        makeAutoObservable(
            this,
            {},
            {
                autoBind: true,
            },
        )
    }

    async init(): Promise<void> {
        try {
            this.provider?.removeListener('accountsChanged', this.syncData)
            this.provider?.removeListener('chainChanged', this.syncData)
            this.provider?.removeListener('disconnect', this.disconnect)

            this.provider = EvmWalletStore.getProvider()
            this.ethers = new ethers.BrowserProvider(this.provider)

            this.provider.on('accountsChanged', this.syncData)
            this.provider.on('chainChanged', this.syncData)
            this.provider.on('disconnect', this.disconnect)

            await this.connect()
        } catch (e) {
            console.error(e)
        }
    }

    async connect(): Promise<void> {
        await this.provider?.request({ method: 'eth_requestAccounts' })
        await this.syncData()
    }

    disconnect(): void {
        runInAction(() => {
            this.state.address = undefined
            this.state.balance = undefined
            this.state.chainId = undefined
        })
    }

    async syncData(): Promise<void> {
        let address: string, chainId: string, balance: string

        if (this.provider) {
            try {
                const web3 = new Web3(this.provider)
                const _address = (await web3.eth.getAccounts())[0]
                const _chainId = (await web3.eth.getChainId()).toString()
                const _balance = (await web3.eth.getBalance(_address)).toString()

                address = _address
                chainId = _chainId
                balance = _balance
            } catch (e) {
                console.error('evm sync data', e)
            }
        }

        runInAction(() => {
            this.state.address = address
            this.state.chainId = chainId
            this.state.balance = balance
        })
    }

    get address(): string | undefined {
        return this.state.address
    }

    get balance(): string | undefined {
        return this.state.balance
    }

    static getProvider(): MetaMaskInpageProvider {
        let provider = Web3.givenProvider

        if (typeof window.ethereum !== 'undefined') {
            provider = window.ethereum.providers?.find((p: any) => p.isMetaMask)

            if (provider == null && window.ethereum.isMetaMask) {
                provider = window.ethereum
            }
        }

        if (!provider) {
            throw new Error('No MetaMask Provider found')
        }

        return provider as MetaMaskInpageProvider
    }
}
