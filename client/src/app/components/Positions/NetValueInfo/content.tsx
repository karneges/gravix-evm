import classNames from 'classnames'
import * as React from 'react'
import { observer } from 'mobx-react-lite'

import { Tooltip } from '../Tooltip/index.js'

import styles from './index.module.scss'
import { useStore } from '../../../hooks/useStore.js'
import { formattedTokenAmount } from '../../../utils/formatted-token-amount.js'
import { formattedAmount } from '../../../utils/formatted-amount.js'
import { percentSign, usdSign } from '../../../utils/sign.js'
import { GravixStore } from '../../../stores/GravixStore.js'

type Props = {
    initialCollateral?: string
    pnl?: string | null
    borrowFee?: string | null
    fundingFeeInverted?: string
    openFee?: string
    pnlAfterFees?: string
    pnlAfterFeesPercent?: string
    closeFee?: string | null
    children?: React.ReactNode
}

function NetValueInfoInner({
    initialCollateral,
    pnl,
    borrowFee,
    fundingFeeInverted,
    openFee,
    pnlAfterFees,
    pnlAfterFeesPercent,
    closeFee,
    children,
}: Props): JSX.Element {
    const gravix = useStore(GravixStore)

    const initialCollateralFormatted = React.useMemo(
        () => (initialCollateral ? formattedTokenAmount(initialCollateral, gravix.baseNumber) : undefined),
        [initialCollateral],
    )

    const pnlFormatted = React.useMemo(() => (pnl ? formattedTokenAmount(pnl, gravix.baseNumber) : undefined), [pnl])

    const borrowFeeFormatted = React.useMemo(
        () => (borrowFee ? formattedTokenAmount(borrowFee, gravix.baseNumber) : undefined),
        [borrowFee],
    )

    const fundingFeeFormatted = React.useMemo(
        () => (fundingFeeInverted ? formattedTokenAmount(fundingFeeInverted, gravix.baseNumber) : undefined),
        [fundingFeeInverted],
    )

    const openFeeFormatted = React.useMemo(
        () => (openFee ? formattedTokenAmount(openFee, gravix.baseNumber) : undefined),
        [openFee],
    )

    const pnlAfterFeesFormatted = React.useMemo(
        () => (pnlAfterFees ? formattedTokenAmount(pnlAfterFees, gravix.baseNumber) : undefined),
        [pnlAfterFees],
    )

    const pnlAfterFeesPercentFormatted = React.useMemo(
        () => (pnlAfterFeesPercent ? formattedAmount(pnlAfterFeesPercent) : undefined),
        [pnlAfterFeesPercent],
    )

    const closeFeeFormatted = React.useMemo(
        () => (closeFee ? formattedTokenAmount(closeFee, gravix.baseNumber) : undefined),
        [closeFee],
    )

    return (
        <Tooltip
            positions={['bottom', 'bottom']}
            content={
                <>
                    <div className={styles.title}>Net value calc</div>

                    <dl className={classNames('info', styles.data)}>
                        <dt>Initial Collateral</dt>
                        <dd>{initialCollateralFormatted ? usdSign(initialCollateralFormatted) : '\u200B'}</dd>

                        <dt>PnL</dt>
                        <dd>{pnlFormatted ? usdSign(pnlFormatted) : '\u200B'}</dd>

                        <dt>Borrow fee</dt>
                        <dd>{borrowFeeFormatted ? usdSign(`-${borrowFeeFormatted}`) : '\u200B'}</dd>

                        <dt>Funding fee</dt>
                        <dd>{fundingFeeFormatted ? usdSign(fundingFeeFormatted) : '\u200B'}</dd>

                        <dt>Open fee</dt>
                        <dd>{openFeeFormatted ? usdSign(`-${openFeeFormatted}`) : '\u200B'}</dd>

                        {closeFeeFormatted && (
                            <>
                                <dt>Close fee</dt>
                                <dd>{closeFeeFormatted ? usdSign(`-${closeFeeFormatted}`) : '\u200B'}</dd>
                            </>
                        )}

                        <dt>Pnl after fees</dt>
                        <dd>
                            {pnlAfterFeesFormatted && pnlAfterFeesPercentFormatted ? (
                                <>
                                    <span className={styles.muted}>{percentSign(pnlAfterFeesPercentFormatted)}</span>{' '}
                                    {usdSign(pnlAfterFeesFormatted)}
                                </>
                            ) : (
                                '\u200B'
                            )}
                        </dd>
                    </dl>
                </>
            }
        >
            {children}
        </Tooltip>
    )
}

export const NetValueInfoContent = observer(NetValueInfoInner)
