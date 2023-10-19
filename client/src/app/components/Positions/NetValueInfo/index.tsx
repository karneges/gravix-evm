import React from 'react'

import { useProvider, useStore } from '../../../hooks/useStore.js'
import { NetValueInfoContent } from './content.js'
import { observer } from 'mobx-react-lite'
import { GravixStore } from '../../../stores/GravixStore.js'
import { PositionStore } from '../../../stores/PositionStore.js'
import { formattedTokenAmount } from '../../../utils/formatted-token-amount.js'
import { formattedAmount } from '../../../utils/formatted-amount.js'
import { Amount } from '../Amount/index.js'
import classNames from 'classnames'
import { percentSign, usdSign } from '../../../utils/sign.js'
import styles from './index.module.scss'
import { MarketStore } from '../../../stores/MarketStore.js'
import { PriceStore } from '../../../stores/PriceStore.js'
import { PositionsListStore } from '../../../stores/PositionsListStore.js'

const NetValueInfo: React.FC = observer(() => {
    const position = useStore(PositionStore)
    const gravix = useStore(GravixStore)

    const netValueFormatted = React.useMemo(
        () => (position.netValue ? formattedTokenAmount(position.netValue, gravix.baseNumber) : undefined),
        [position.netValue],
    )

    const netValueChangeFormatted = React.useMemo(
        () => (position.netValueChange ? formattedTokenAmount(position.netValueChange, gravix.baseNumber) : undefined),
        [position.netValueChange],
    )

    const netValueChangePercentFormatted = React.useMemo(
        () => (position.netValueChangePercent ? formattedAmount(position.netValueChangePercent) : undefined),
        [position.netValueChangePercent],
    )

    return (
        <>
            {netValueFormatted ? (
                <>
                    <NetValueInfoContent
                        borrowFee={position.borrowFee}
                        fundingFeeInverted={position.fundingFeeInverted}
                        initialCollateral={position.initialCollateral}
                        openFee={position.openFee}
                        pnl={position.limitedPnl}
                        pnlAfterFees={position.pnlAfterFees}
                        pnlAfterFeesPercent={position.pnlAfterFeesPercent}
                    >
                        <Amount value={usdSign(netValueFormatted)} />
                    </NetValueInfoContent>

                    {netValueChangeFormatted && netValueChangePercentFormatted && (
                        <div className={classNames(styles.line, styles.extra)}>
                            <Amount colorize value={usdSign(netValueChangeFormatted)} />

                            <Amount muted colorize value={percentSign(netValueChangePercentFormatted)} />
                        </div>
                    )}
                </>
            ) : null}
        </>
    )
})

export const NetValueInfoProvider: React.FC<{ index: string }> = observer(({ index }) => {
    const gravix = useStore(GravixStore)
    const market = useStore(MarketStore)
    const price = useStore(PriceStore)
    const positionsList = useStore(PositionsListStore)
    const PositionProvider = useProvider(PositionStore, gravix, market, price, positionsList, index)

    return (
        <PositionProvider>
            <NetValueInfo />
        </PositionProvider>
    )
})
