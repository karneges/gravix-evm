/* eslint-disable react-hooks/rules-of-hooks */
import * as React from 'react'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import { RootContent } from './content.js'
import { GravixStore } from '../../stores/GravixStore.js'
import { useProvider, useStore } from '../../hooks/useStore.js'
import { DepositStore } from '../../stores/DepositStore.js'
import { MarketStore } from '../../stores/MarketStore.js'
import { PriceStore } from '../../stores/PriceStore.js'
import { EvmWalletStore } from '../../stores/EvmWalletStore.js'
import { routes } from '../../routes/index.js'
import { MarketStatsStore } from '../../stores/MarketStatsStore.js'
import { BalanceStore } from '../../stores/BalanceStore.js'

export const Root: React.FC = () => {
    const EvmWalletProvider = useProvider(EvmWalletStore)

    return (
        <EvmWalletProvider>
            {evmWallet => {
                const GravixProvider = useProvider(GravixStore, evmWallet)
                const BalanceProvider = useProvider(BalanceStore, evmWallet)
                return (
                    <BalanceProvider>
                        <GravixProvider>
                            {gravix => {
                                const MarketProvider = useProvider(MarketStore, gravix)
                                return (
                                    <MarketProvider>
                                        {market => {
                                            const PriceProvider = useProvider(PriceStore, market)
                                            return (
                                                <PriceProvider>
                                                    {price => {
                                                        const balance = useStore(BalanceStore)
                                                        const MarketStatsProvider = useProvider(
                                                            MarketStatsStore,
                                                            price,
                                                            market,
                                                            evmWallet,
                                                        )
                                                        return (
                                                            <MarketStatsProvider>
                                                                {marketStats => {
                                                                    const DepositProvider = useProvider(
                                                                        DepositStore,
                                                                        evmWallet,
                                                                        price,
                                                                        gravix,
                                                                        market,
                                                                        marketStats,
                                                                        balance,
                                                                    )

                                                                    return (
                                                                        <DepositProvider>
                                                                            <Router>
                                                                                <Switch>
                                                                                    <Route path={routes.main}>
                                                                                        <RootContent />
                                                                                    </Route>
                                                                                </Switch>
                                                                            </Router>
                                                                        </DepositProvider>
                                                                    )
                                                                }}
                                                            </MarketStatsProvider>
                                                        )
                                                    }}
                                                </PriceProvider>
                                            )
                                        }}
                                    </MarketProvider>
                                )
                            }}
                        </GravixProvider>
                    </BalanceProvider>
                )
            }}
        </EvmWalletProvider>
    )
}
