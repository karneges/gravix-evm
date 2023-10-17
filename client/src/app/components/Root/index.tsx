import React from 'react'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import { routes } from '../../routes/index.js'
import { RootContent } from './content.js'
import { GravixStore } from '../../stores/GravixStore.js'
import { useProvider } from '../../hooks/useStore.js'
import { FormStore } from '../../stores/FormStore.js'
import { MarketStore } from '../../stores/MarketStore.js'
import { PriceStore } from '../../stores/PriceStore.js'

export const Root: React.FC = () => {
    const GravixProvider = useProvider(GravixStore)
    const FormProvider = useProvider(FormStore)
    const MarketProvider = useProvider(MarketStore)

    return (
        <GravixProvider>
            <MarketProvider>
                {market => {
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    const PriceProvider = useProvider(PriceStore, market)
                    return (
                        <PriceProvider>
                            <FormProvider>
                                <Router>
                                    <Switch>
                                        <Route path={routes.main}>
                                            <RootContent />
                                        </Route>
                                    </Switch>
                                </Router>
                            </FormProvider>
                        </PriceProvider>
                    )
                }}
            </MarketProvider>
        </GravixProvider>
    )
}
