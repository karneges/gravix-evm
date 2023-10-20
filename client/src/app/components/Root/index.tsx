/* eslint-disable react-hooks/rules-of-hooks */
import * as React from 'react'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import { RootContent } from './content.js'
import { GravixStore } from '../../stores/GravixStore.js'
import { useProvider, useSafe } from '../../hooks/useStore.js'
import { DepositStore } from '../../stores/DepositStore.js'
import { MarketStore } from '../../stores/MarketStore.js'
import { PriceStore } from '../../stores/PriceStore.js'
import { EvmWalletStore } from '../../stores/EvmWalletStore.js'
import { routes } from '../../routes/index.js'
import { MarketsStore } from '../../stores/MarketsStore.js'
import { MarketStatsStore } from '../../stores/MarketStatsStore.js'
import { AccountAbstractionProvider, useAccountAbstraction } from '../../stores/accountAbstractionContext.js'
import { ethers } from 'ethers'

export const Root: React.FC = () => {
    const EvmWalletProvider = useProvider(EvmWalletStore)
    const {} = useSafe()

    return (
        <EvmWalletProvider>
            {evmWallet => {
                const MarketsProvider = useProvider(MarketsStore, evmWallet)
                const GravixProvider = useProvider(GravixStore, evmWallet)
                return (
                    <AccountAbstractionProvider web3Provider={new ethers.BrowserProvider(evmWallet.provider!)}>
                        <MarketsProvider>
                            {markets => {
                                // loginWeb3Auth()
                                const MarketProvider = useProvider(MarketStore, markets)
                                return (
                                    <GravixProvider>
                                        {gravix => (
                                            <MarketProvider>
                                                {market => {
                                                    const PriceProvider = useProvider(PriceStore, market)
                                                    return (
                                                        <PriceProvider>
                                                            {price => {
                                                                const MarketStatsProvider = useProvider(
                                                                    MarketStatsStore,
                                                                    price,
                                                                    market,
                                                                )
                                                                const DepositProvider = useProvider(
                                                                    DepositStore,
                                                                    evmWallet,
                                                                    price,
                                                                    gravix,
                                                                    market,
                                                                )

                                                                return (
                                                                    <MarketStatsProvider>
                                                                        <DepositProvider>
                                                                            <Router>
                                                                                <Switch>
                                                                                    <Route path={routes.main}>
                                                                                        <RootContent />
                                                                                    </Route>
                                                                                </Switch>
                                                                            </Router>
                                                                        </DepositProvider>
                                                                    </MarketStatsProvider>
                                                                )
                                                            }}
                                                        </PriceProvider>
                                                    )
                                                }}
                                            </MarketProvider>
                                        )}
                                    </GravixProvider>
                                )
                            }}
                        </MarketsProvider>
                    </AccountAbstractionProvider>
                )
            }}
        </EvmWalletProvider>
    )
}
