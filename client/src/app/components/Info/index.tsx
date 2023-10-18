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

export const Info: React.FC = observer(() => {
    const market = useStore(MarketStore)
    const price = useStore(PriceStore)
    const markets = useStore(MarketsStore)

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
                    <Typography.Text className={styles.value} strong>
                        12/100k$
                    </Typography.Text>
                </Flex>

                <Flex className={styles.item} vertical>
                    <Typography.Text className={styles.label}>Open Interest, 2</Typography.Text>
                    <Typography.Text className={styles.value} strong>
                        23.3K/100k$
                    </Typography.Text>
                </Flex>
            </Flex>
        </div>
    )
})
