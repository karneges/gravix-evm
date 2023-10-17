import * as React from 'react'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import { useStore } from '../../hooks/useStore.js'
import { GravixStore } from '../../stores/GravixStore.js'
import { Header } from '../Header/index.js'
import { routes } from '../../routes/index.js'
import { Layout, ConfigProvider, theme } from 'antd'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { Earn } from '../Earn/index.js'
import { Trade } from '../Trade/index.js'

export const RootContent: React.FC = observer(() => {
    const gravixData = useStore(GravixStore)
    const { defaultAlgorithm, darkAlgorithm } = theme

    return (
        <ConfigProvider
            theme={{
                algorithm: gravixData.getThemeMode ? darkAlgorithm : defaultAlgorithm,
            }}
        >
            <main className={classNames('main', gravixData.getThemeMode ? 'main--dark' : 'main--light')}>
                <Router>
                    <Layout>
                        <Header />

                        <Switch>
                            <Route exact path={routes.main}>
                                <Trade />
                            </Route>
                            <Route exact path={routes.earn}>
                                <Earn />
                            </Route>
                        </Switch>
                    </Layout>
                </Router>
            </main>
        </ConfigProvider>
    )
})
