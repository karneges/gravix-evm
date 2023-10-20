import React from 'react'
import { Web3AuthModalPack } from '@safe-global/auth-kit'
import { OpenloginAdapter } from '@web3auth/openlogin-adapter'
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from '@web3auth/base'
import { Web3AuthOptions } from '@web3auth/modal'

type Store = {
    init?(): void
    dispose?(): void
    [key: string]: any
}

const ctxs = new Map<any, React.Context<any>>()

export function useStore<S extends Store>(store: { new (...args: any[]): S }): S {
    const ctx = ctxs.get(store)

    if (!ctx) {
        throw new Error(`${store.name} context not found`)
    }

    const result = React.useContext(ctx)

    if (result === undefined) {
        throw new Error(`${store.name} must be defined`)
    }

    return result
}

type ProviderProps<S> = {
    children: React.ReactNode | ((store: S) => React.ReactNode)
}

export function useProvider<S extends Store, A extends any[]>(
    Store: { new (...args: A): S },
    ...deps: A
): (props: ProviderProps<S>) => JSX.Element {
    let ctx = ctxs.get(Store)

    if (!ctx) {
        ctx = React.createContext<S | undefined>(undefined)
        ctx.displayName = Store.name
        ctxs.set(Store, ctx)
    }

    const CtxProvider = ctx.Provider

    return React.useCallback(({ children }: ProviderProps<S>) => {
        const ref = React.useRef<S>()
        ref.current = ref.current || new Store(...deps)

        React.useEffect(() => {
            ref.current?.init?.()
            return () => {
                ref.current?.dispose?.()
            }
        }, [])

        return (
            <CtxProvider value={ref.current}>
                {typeof children === 'function' ? children(ref.current) : children}
            </CtxProvider>
        )
    }, deps)
}

export const useSafe = (): any => {
    const options: Web3AuthOptions = {
        clientId: 'BEyQBpAwXY9Ag0AC304Absb7Wmklj3qG8GbD6hIG1n32k9NEbDZjJuZq-_sv5jmLbT3Lr5rFkAPWHSxeXIdc_vQ',
        web3AuthNetwork: 'testnet',
        chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: 'chainId',
            rpcTarget: 'rpcTarget',
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
    openloginAdapter.authenticateUser()
    const web3AuthModalPack = new Web3AuthModalPack({
        txServiceUrl: 'https://safe-transaction-80001.safe.global',
    })
    web3AuthModalPack.signIn()

    return web3AuthModalPack.init({
        options,
        adapters: [openloginAdapter],
        modalConfig,
    })
}
