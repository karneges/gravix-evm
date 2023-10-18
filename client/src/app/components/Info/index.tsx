import * as React from 'react'
import { BigNumber } from 'bignumber.js'
import { Select, Flex, Typography } from 'antd'

import styles from './index.module.scss'
import { observer } from 'mobx-react-lite'
import { useStore } from '../../hooks/useStore.js'
import { MarketStore } from '../../stores/MarketStore.js'
import { PriceStore } from '../../stores/PriceStore.js'
import { MarketsStore } from '../../stores/MarketsStore.js'
import { mapIdxToTicker } from '../../utils/gravix.js'
import { MarketStatsStore } from '../../stores/MarketStatsStore.js'
import { abbrNumber } from '../../utils/abbr-number.js'
import { decimalAmount } from '../../utils/decimal-amount.js'

export const Info: React.FC = observer(() => {
    const market = useStore(MarketStore)
    const price = useStore(PriceStore)
    const markets = useStore(MarketsStore)
    const stats = useStore(MarketStatsStore)

    const openInterestS = React.useMemo(
        () => (stats.openInterestS ? abbrNumber(stats.openInterestS) : undefined),
        [stats.openInterestS],
    )

    const maxTotalShortsUSD = React.useMemo(
        () => (stats.maxTotalShortsUSD ? abbrNumber(decimalAmount(stats.maxTotalShortsUSD, 6)) : undefined),
        [stats.maxTotalShortsUSD],
    )

    const openInterestL = React.useMemo(
        () => (stats.openInterestL ? abbrNumber(stats.openInterestL) : undefined),
        [stats.openInterestL],
    )

    const maxTotalLongsUSD = React.useMemo(
        () => (stats.maxTotalLongsUSD ? abbrNumber(decimalAmount(stats.maxTotalLongsUSD, 6)) : undefined),
        [stats.maxTotalLongsUSD],
    )

    return (
        <div className={styles.info}>
            <Flex align="center" gap="large">
                <Select
                    className={styles.select}
                    size="large"
                    value={market.idx}
                    onChange={market.setIdx}
                    options={markets.markets.map(item => ({
                        label: mapIdxToTicker(item.marketIdx.toString()),
                        value: item.marketIdx.toString(),
                    }))}
                />

                <Flex className={styles.item} vertical>
                    <Typography.Text className={styles.label}>Price</Typography.Text>
                    <Typography.Text className={styles.value} strong>
                        {price.price ? `$${new BigNumber(price.price).toFixed(2)}` : '\u200B'}
                    </Typography.Text>
                </Flex>

                <Flex className={styles.item} vertical>
                    <Typography.Text className={styles.label}>Open Interest, l</Typography.Text>
                    {openInterestL && maxTotalLongsUSD && (
                        <Typography.Text className={styles.value} strong>
                            ${openInterestL}
                            {' / '}
                            {maxTotalLongsUSD}
                        </Typography.Text>
                    )}
                </Flex>

                <Flex className={styles.item} vertical>
                    <Typography.Text className={styles.label}>Open Interest, 2</Typography.Text>
                    {openInterestS && maxTotalShortsUSD && (
                        <Typography.Text className={styles.value} strong>
                            ${openInterestS}
                            {' / '}
                            {maxTotalShortsUSD}
                        </Typography.Text>
                    )}
                </Flex>
            </Flex>
        </div>
    )
})
