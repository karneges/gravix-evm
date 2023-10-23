import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { ethers } from 'ethers-v5'
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from '@web3auth/base'
import { Web3AuthOptions } from '@web3auth/modal'
import { OpenloginAdapter } from '@web3auth/openlogin-adapter'

import { Web3AuthModalPack } from '@safe-global/auth-kit'
import { GelatoRelayPack } from '@safe-global/relay-kit'
import { MetaTransactionData, MetaTransactionOptions } from '@safe-global/safe-core-sdk-types'

import chains, { initialChain } from '../chains/chains.js'
import usePolling from '../hooks/usePolling.js'
import AccountAbstraction from '@safe-global/account-abstraction-kit-poc'
import { comparer, makeAutoObservable, reaction } from 'mobx'
import { Reactions } from '../utils/reactions.js'
import { EvmWalletStore } from './EvmWalletStore.js'

const getChain = (chainId?: string) => {
    const chain = chains.find(chain => chain.id === chainId)

    return chain
}

export class AccountAbstractionStore {
    protected reactions = new Reactions()

    chainId = initialChain.id
    //@ts-ignore

    web3Provider: ethers.providers.Web3Provider = 10
    safes: string[] = []
    //@ts-ignore
    web3AuthModalPack: Web3AuthModalPack | undefined = 10

    safe: string = ''
    isRelayerLoading = false
    gelatoTaskId: string | undefined
    safeBalance = {
        amount: '0',
    }

    constructor(private readonly evmWalletStore: EvmWalletStore) {
        this.wallets.owner = evmWalletStore.address || ''
        makeAutoObservable(this, {}, { autoBind: true })
    }

    init() {
        this.reactions.create(
            reaction(
                () => [this.chain, this.evmWalletStore.chainId],
                () => {
                    this.onChainChanged()
                    this.isRelayerLoading = false
                    this.gelatoTaskId = undefined
                },
                {
                    fireImmediately: true,
                    equals: comparer.structural,
                },
            ),
            reaction(() => [this.safes, this.web3Provider, this.web3AuthModalPack], this.getSafeAddress, {
                fireImmediately: true,
                equals: comparer.structural,
            }),
            reaction(() => this.web3AuthModalPack, this.tryAutoLogin, { equals: comparer.structural }),
            reaction(() => this.wallets.safe, this.fetchSafeBalance, { equals: comparer.structural }),
        )

        setInterval(() => {
            this.fetchSafeBalance()
        }, 3000)
    }

    get wallets() {
        return {
            safe: this.evmWalletStore.chainId || '' === initialChain.id ? this.safe : '',
            owner: this.evmWalletStore.state.address || '',
        }
    }
    get isAuthenticated() {
        const isAuth = !!this.wallets.safe && this.chainId === initialChain.id
        console.log('isAuthenticated: ', isAuth)
        return isAuth
    }

    get chain() {
        return getChain(this.chainId) || initialChain
    }

    onChainChanged = async () => {
        const options: Web3AuthOptions = {
            clientId:
                process.env.REACT_APP_WEB3AUTH_CLIENT_ID ||
                'BJViPsH8rX2x6JKTdrX-1W8DIUbOEPg3R_Wcx9ESz0nR6IP01RC9vXdlZ0LQddtTKT_F1gnsLaZ83j9mesnTP1s',
            web3AuthNetwork: 'testnet',
            chainConfig: {
                chainNamespace: CHAIN_NAMESPACES.EIP155,
                chainId: this.chain.id,
                rpcTarget: this.chain.rpcUrl,
            },
            uiConfig: {
                theme: 'dark',
                loginMethodsOrder: ['google', 'facebook'],
            },
        }

        const modalConfig = {
            [WALLET_ADAPTERS.TORUS_EVM]: {
                label: 'torus',
                showOnModal: false,
            },
            [WALLET_ADAPTERS.METAMASK]: {
                label: 'metamask',
                showOnDesktop: true,
                showOnMobile: false,
            },
        }

        const openloginAdapter = new OpenloginAdapter({
            loginSettings: {
                mfaLevel: 'mandatory',
                redirectUrl: window.location.origin,
            },
            adapterSettings: {
                redirectUrl: window.location.origin,
                uxMode: 'popup',
                whiteLabel: {
                    name: 'Safe',
                },
            },
        })

        const web3AuthModalPack = new Web3AuthModalPack({
            txServiceUrl: this.chain.transactionServiceUrl,
        })

        await web3AuthModalPack.init({
            options,
            adapters: [openloginAdapter],
            modalConfig,
        })

        this.web3AuthModalPack = web3AuthModalPack
    }

    onLoginWeb3Auth = async () => {
        if (!this.web3AuthModalPack) return

        try {
            const { safes, eoa } = await this.web3AuthModalPack.signIn()
            const provider = this.web3AuthModalPack.getProvider() as ethers.providers.ExternalProvider

            // we set react state with the provided values: owner (eoa address), chain, safes owned & web3 provider
            this.chainId = this.chain.id
            this.wallets.owner = eoa
            this.safes = safes || []
            this.web3Provider = new ethers.providers.Web3Provider(provider)
        } catch (error) {
            console.log('error: ', error)
        }
    }

    tryAutoLogin = async () => {
        if (this.web3AuthModalPack && this.web3AuthModalPack.getProvider()) {
            await this.onLoginWeb3Auth()
        }
    }

    getSafeAddress = async () => {
        // @ts-ignore
        if (this.web3Provider !== 10 && this.web3AuthModalPack != 10) {
            const signer = this.web3Provider.getSigner()

            const relayPack = new GelatoRelayPack()
            //@ts-ignore

            const safeAccountAbstraction = new AccountAbstraction(signer)

            await safeAccountAbstraction.init({ relayPack })

            const hasSafes = this.safes.length > 0

            this.safe = hasSafes ? this.safes[0] : await safeAccountAbstraction.getSafeAddress()
        }
    }

    relayTransaction = async ({
        to,
        data,
        value,
    }: {
        data: string
        value: string
        to: string
    }): Promise<string | undefined> => {
        if (this.web3Provider) {
            this.isRelayerLoading = true
            const signer = this.web3Provider.getSigner()
            const relayPack = new GelatoRelayPack()
            //@ts-ignore
            const safeAccountAbstraction = new AccountAbstraction(signer)

            await safeAccountAbstraction.init({ relayPack })

            // we use a dump safe transfer as a demo transaction
            const dumpSafeTransafer: MetaTransactionData[] = [
                {
                    to,
                    data,
                    value,
                    operation: 0, // OperationType.Call,
                },
            ]

            const options: MetaTransactionOptions = {
                isSponsored: false,
                gasLimit: '600000', // in this alfa version we need to manually set the gas limit
                gasToken: ethers.constants.AddressZero, // native token
            }

            const gelatoTaskId = await safeAccountAbstraction.relayTransaction(dumpSafeTransafer, options)

            this.isRelayerLoading = false
            this.gelatoTaskId = gelatoTaskId
            return transactionStatusFetcher(gelatoTaskId)
        }
    }
    fetchSafeBalance = async () => {
        //@ts-ignore
        if (this.web3Provider === 10) {
            return
        }
        const balance = await this.web3Provider?.getBalance(this.wallets.safe)

        this.safeBalance.amount = balance?.toString()
    }
}

const transactionStatusFetcher = (taskId: string): Promise<string> => {
    return new GelatoRelayPack().getTaskStatus(taskId).then(res => {
        if (res?.taskState === 'ExecReverted' || res?.taskState === 'Blacklisted' || res?.taskState === 'Cancelled') {
            throw new Error('Transaction failed')
        }
        if (res?.taskState === 'ExecSuccess') {
            return res.transactionHash!
        }
        return transactionStatusFetcher(taskId)
    })
}
