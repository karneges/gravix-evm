import * as React from 'react'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import { RootContent } from './content.js'
import { GravixStore } from '../../stores/GravixStore.js'
import { useProvider } from '../../hooks/useStore.js'
import { DepositStore } from '../../stores/DepositStore.js'
import { MarketStore } from '../../stores/MarketStore.js'
import { PriceStore } from '../../stores/PriceStore.js'
import { EvmWalletStore } from '../../stores/EvmWalletStore.js'
import { routes } from '../../routes/index.js'

export const Root: React.FC = () => {
    const GravixProvider = useProvider(GravixStore)
    const MarketProvider = useProvider(MarketStore)
    const EvmWalletProvider = useProvider(EvmWalletStore)

    return (
        <EvmWalletProvider>
            {evmWallet => {
                return (
                    <GravixProvider>
                        {gravix => (
                            <MarketProvider>
                                {market => {
                                    // eslint-disable-next-line react-hooks/rules-of-hooks
                                    const PriceProvider = useProvider(PriceStore, market)
                                    return (
                                        <PriceProvider>
                                            {price => {
                                                // eslint-disable-next-line react-hooks/rules-of-hooks
                                                const DepositProvider = useProvider(
                                                    DepositStore,
                                                    evmWallet,
                                                    price,
                                                    gravix,
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
                                        </PriceProvider>
                                    )
                                }}
                            </MarketProvider>
                        )}
                    </GravixProvider>
                )
            }}
        </EvmWalletProvider>
    )
}
