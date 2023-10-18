import React, { useEffect } from 'react'

import styles from './index.module.scss'
import { useStore } from '../../hooks/useStore.js'
import { observer } from 'mobx-react-lite'
import { MarketStore } from '../../stores/MarketStore.js'
import { mapChartSymbol } from '../../utils/gravix.js'
import { GravixStore } from '../../stores/GravixStore.js'
import classNames from 'classnames'

let tvScriptLoadingPromise: Promise<void>

export const TradingView: React.FC = observer(() => {
    const market = useStore(MarketStore)
    const gravix = useStore(GravixStore)

    useEffect(() => {
        let widget: any

        if (!tvScriptLoadingPromise) {
            tvScriptLoadingPromise = new Promise(resolve => {
                const script = document.createElement('script')
                script.id = 'tradingview-widget-loading-script'
                script.src = 'https://s3.tradingview.com/tv.js'
                script.type = 'text/javascript'
                script.onload = () => {
                    resolve()
                }

                document.head.appendChild(script)
            })
        }

        tvScriptLoadingPromise
            .then(() => {
                widget = new (window as any).TradingView.widget({
                    autosize: true,
                    symbol: mapChartSymbol(market.idx),
                    interval: 'D',
                    timezone: 'Etc/UTC',
                    theme: gravix.isDarkMode ? 'dark' : 'light',
                    style: '1',
                    locale: 'en',
                    enable_publishing: false,
                    allow_symbol_change: true,
                    container_id: 'tradingview_06042',
                })
            })
            .catch(console.error)

        return () => {
            if (widget) {
                try {
                    widget.remove()
                } catch (e) {
                    console.error(e)
                }
            }
        }
    }, [market.idx, gravix.isDarkMode])

    return (
        <div
            className={classNames(styles.container, gravix.isDarkMode ? styles.dark : undefined)}
            id="tradingview_06042"
        />
    )
})
