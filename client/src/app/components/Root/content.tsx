import React from 'react'
import { useStore } from '../../hooks/useStore.js'
import { GravixStore } from '../../stores/GravixStore.js'
import { Header } from '../Header/index.js'

import { Chart } from '../Chart/index.js'
import { Form } from '../Form/index.js'
import { Info } from '../Info/index.js'
import { Positions } from '../Positions/index.js'
import { Layout, ConfigProvider, theme } from 'antd'
import styles from './index.module.scss'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'

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
                <Layout>
                    <Header />
                    <Layout style={{ padding: "20px 12px"}}>
                        <div className={styles.layout}>
                            <Info />
                            <Chart />
                            <Form />
                            <Positions />
                        </div>
                    </Layout>
                </Layout>
            </main>
        </ConfigProvider>
    )
})
