import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from '@web3auth/base'
import { Web3AuthOptions } from '@web3auth/modal'
import { OpenloginAdapter } from '@web3auth/openlogin-adapter'

import AccountAbstraction from '@safe-global/account-abstraction-kit-poc'
import { Web3AuthModalPack } from '@safe-global/auth-kit'
import { GelatoRelayPack } from '@safe-global/relay-kit'
import { MetaTransactionData, MetaTransactionOptions } from '@safe-global/safe-core-sdk-types'
import chains, { initialChain } from '../chains/chains.js'
import usePolling from '../hooks/usePolling.js'
import { ethers, parseUnits } from 'ethers'
const getChain = (chainId?: string) => {
    const chain = chains.find(chain => chain.id === chainId)

    return chain
}
export type Chain = {
    id: string
    token: string
    rpcUrl: string
    shortName: string
    label: string
    color?: string
    icon?: string
    blockExplorerUrl: string
    transactionServiceUrl?: string
    isStripePaymentsEnabled: boolean // only available in Mumbai chain
    isMoneriumPaymentsEnabled: boolean // only available in Goerli chain
    faucetUrl?: string
}
type accountAbstractionContextValue = {
    ownerAddress?: string
    chainId: string
    safes: string[]
    chain?: Chain
    isAuthenticated: boolean
    loginWeb3Auth: () => void
    logoutWeb3Auth: () => void
    setChainId: (chainId: string) => void
    safeSelected?: string
    safeBalance?: string
    setSafeSelected: React.Dispatch<React.SetStateAction<string>>
    isRelayerLoading: boolean
    relayTransaction: () => Promise<void>
    gelatoTaskId?: string
    openStripeWidget: () => Promise<void>
}

const initialState = {
    isAuthenticated: false,
    loginWeb3Auth: () => {},
    logoutWeb3Auth: () => {},
    relayTransaction: async () => {},
    setChainId: () => {},
    setSafeSelected: () => {},
    onRampWithStripe: async () => {},
    safes: [],
    chainId: initialChain.id,
    isRelayerLoading: true,
    openStripeWidget: async () => {},
    closeStripeWidget: async () => {},
    startMoneriumFlow: async () => {},
    closeMoneriumFlow: () => {},
}

const accountAbstractionContext = createContext<accountAbstractionContextValue>(initialState)

const useAccountAbstraction = () => {
    const context = useContext(accountAbstractionContext)

    if (!context) {
        throw new Error('useAccountAbstraction should be used within a AccountAbstraction Provider')
    }

    return context
}

const AccountAbstractionProvider = ({
    children,
    web3Provider,
}: {
    children: JSX.Element
    web3Provider: ethers.BrowserProvider
}) => {
    // owner address from the email  (provided by web3Auth)
    const [ownerAddress, setOwnerAddress] = useState<string>('')

    // safes owned by the user
    const [safes, setSafes] = useState<string[]>([])

    // chain selected
    const [chainId, setChainId] = useState<string>(() => {
        return initialChain.id
    })

    // web3 provider to perform signatures

    const isAuthenticated = !!ownerAddress && !!chainId
    const chain = getChain(chainId) || initialChain

    // reset React state when you switch the chain
    useEffect(() => {
        setOwnerAddress('')
        setSafes([])
        setChainId(chain.id)
        setSafeSelected('')
    }, [chain])

    // authClient
    const [web3AuthModalPack, setWeb3AuthModalPack] = useState<Web3AuthModalPack>()

    // onRampClient

    useEffect(() => {
        ;(async () => {
            const options: Web3AuthOptions = {
                clientId:
                    process.env.REACT_APP_WEB3AUTH_CLIENT_ID ||
                    'BEyQBpAwXY9Ag0AC304Absb7Wmklj3qG8GbD6hIG1n32k9NEbDZjJuZq-_sv5jmLbT3Lr5rFkAPWHSxeXIdc_vQ',
                web3AuthNetwork: 'testnet',
                chainConfig: {
                    chainNamespace: CHAIN_NAMESPACES.EIP155,
                    chainId: chain.id,
                    rpcTarget: chain.rpcUrl,
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
                },
                adapterSettings: {
                    uxMode: 'popup',
                    whiteLabel: {
                        name: 'Safe',
                    },
                },
            })

            const web3AuthModalPack = new Web3AuthModalPack({
                txServiceUrl: chain.transactionServiceUrl,
            })

            await web3AuthModalPack.init({
                options,
                adapters: [openloginAdapter],
                modalConfig,
            })

            setWeb3AuthModalPack(web3AuthModalPack)
        })()
    }, [chain])

    // auth-kit implementation
    const loginWeb3Auth = useCallback(async () => {
        if (!web3AuthModalPack) return

        try {
            const { safes, eoa } = await web3AuthModalPack.signIn()

            // we set react state with the provided values: owner (eoa address), chain, safes owned & web3 provider
            setChainId(chain.id)
            setOwnerAddress(eoa)
            setSafes(safes || [])
        } catch (error) {
            console.log('error: ', error)
        }
    }, [chain, web3AuthModalPack])

    useEffect(() => {
        if (web3AuthModalPack && web3AuthModalPack.getProvider()) {
            ;(async () => {
                await loginWeb3Auth()
            })()
        }
    }, [web3AuthModalPack, loginWeb3Auth])

    const logoutWeb3Auth = () => {
        web3AuthModalPack?.signOut()
        setOwnerAddress('')
        setSafes([])
        setChainId(chain.id)
        setSafeSelected('')
        setGelatoTaskId(undefined)
    }

    // current safe selected by the user
    const [safeSelected, setSafeSelected] = useState<string>('')

    // TODO: add disconnect owner wallet logic ?

    // conterfactual safe Address if its not deployed yet
    useEffect(() => {
        const getSafeAddress = async () => {
            if (web3Provider) {
                const signer = await web3Provider.provider.getSigner('0x1450FE54AdF040f12c8202ba0b112BE9f5d2D7e0')

                const relayPack = new GelatoRelayPack()
                //@ts-ignore

                const safeAccountAbstraction = new AccountAbstraction(signer)

                await safeAccountAbstraction.init({ relayPack })

                const hasSafes = safes.length > 0

                const safeSelected = hasSafes ? safes[0] : await safeAccountAbstraction.getSafeAddress()

                setSafeSelected(safeSelected)
            }
        }

        getSafeAddress()
    }, [safes, web3Provider])

    const [isRelayerLoading, setIsRelayerLoading] = useState<boolean>(false)
    const [gelatoTaskId, setGelatoTaskId] = useState<string>()

    // refresh the Gelato task id
    useEffect(() => {
        setIsRelayerLoading(false)
        setGelatoTaskId(undefined)
    }, [chainId])

    // relay-kit implementation using Gelato
    const relayTransaction = async () => {
        if (web3Provider) {
            setIsRelayerLoading(true)

            const signer = web3Provider.getSigner()
            const relayPack = new GelatoRelayPack()
            //@ts-ignore
            const safeAccountAbstraction = new AccountAbstraction(signer)

            await safeAccountAbstraction.init({ relayPack })

            // we use a dump safe transfer as a demo transaction
            const dumpSafeTransafer: MetaTransactionData[] = [
                {
                    to: safeSelected,
                    data: '0x',
                    value: parseUnits('0.01', 'ether').toString(),
                    operation: 0, // OperationType.Call,
                },
            ]

            const options: MetaTransactionOptions = {
                isSponsored: false,
                gasLimit: '600000', // in this alfa version we need to manually set the gas limit
                gasToken: '0x0000000000000000000000000000000000000000', // native token
            }

            const gelatoTaskId = await safeAccountAbstraction.relayTransaction(dumpSafeTransafer, options)

            setIsRelayerLoading(false)
            setGelatoTaskId(gelatoTaskId)
        }
    }

    // onramp-kit implementation
    const openStripeWidget = async () => {}

    // we can pay Gelato tx relayer fees with native token & USDC
    // TODO: ADD native Safe Balance polling
    // TODO: ADD USDC Safe Balance polling

    // fetch safe address balance with polling
    const fetchSafeBalance = useCallback(async () => {
        const balance = await web3Provider?.getBalance(safeSelected)

        return balance?.toString()
    }, [web3Provider, safeSelected])

    const safeBalance = usePolling(fetchSafeBalance)

    const state = {
        ownerAddress,
        chainId,
        chain,
        safes,

        isAuthenticated,

        web3Provider,

        loginWeb3Auth,
        logoutWeb3Auth,

        setChainId,

        safeSelected,
        safeBalance,
        setSafeSelected,

        isRelayerLoading,
        relayTransaction,
        gelatoTaskId,

        openStripeWidget,
    }

    return <accountAbstractionContext.Provider value={state}>{children}</accountAbstractionContext.Provider>
}

export { useAccountAbstraction, AccountAbstractionProvider }
