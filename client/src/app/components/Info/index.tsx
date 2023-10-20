import * as React from 'react'
import { BigNumber } from 'bignumber.js'
import { Select, Flex, Typography } from 'antd'

import styles from './index.module.scss'
import { observer } from 'mobx-react-lite'
import { useStore } from '../../hooks/useStore.js'
import { MarketStore } from '../../stores/MarketStore.js'
import { PriceStore } from '../../stores/PriceStore.js'
import { mapTickerToTicker } from '../../utils/gravix.js'
import { MarketStatsStore } from '../../stores/MarketStatsStore.js'
import { abbrNumber } from '../../utils/abbr-number.js'
import { decimalAmount } from '../../utils/decimal-amount.js'
import { GravixStore } from '../../stores/GravixStore.js'

export const Info: React.FC = observer(() => {
    const market = useStore(MarketStore)
    const price = useStore(PriceStore)
    const gravix = useStore(GravixStore)
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
                    disabled={gravix.markets.length === 0}
                    className={styles.select}
                    size="large"
                    value={gravix.markets.length > 0 ? market.idx : undefined}
                    onChange={market.setIdx}
                    options={gravix.markets.map(item => ({
                        label: mapTickerToTicker(item.ticker.toString()),
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
                    <Typography.Text className={styles.value} strong>
                        {openInterestL && maxTotalLongsUSD ? (
                            <>
                                ${openInterestL}
                                {' / '}
                                {maxTotalLongsUSD}
                            </>
                        ) : (
                            '\u200B'
                        )}
                    </Typography.Text>
                </Flex>

                <Flex className={styles.item} vertical>
                    <Typography.Text className={styles.label}>Open Interest, s</Typography.Text>
                    <Typography.Text className={styles.value} strong>
                        {openInterestS && maxTotalShortsUSD ? (
                            <>
                                ${openInterestS}
                                {' / '}
                                {maxTotalShortsUSD}
                            </>
                        ) : (
                            '\u200B'
                        )}
                    </Typography.Text>
                </Flex>
            </Flex>
        </div>
    )
})
