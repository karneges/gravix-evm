import React from 'react'

import styles from './index.module.scss'
import { TradingView } from './TradingView.js'

export const Chart: React.FC = () => {
    return (
        <div className={styles.chart}>
            <TradingView />
        </div>
    )
}
