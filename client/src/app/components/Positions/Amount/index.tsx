import { BigNumber } from 'bignumber.js'
import classNames from 'classnames'
import * as React from 'react'

import styles from './index.module.scss'

type Props = {
    prefix?: React.ReactNode
    colorize?: boolean
    value?: string
    muted?: boolean
    gray?: boolean
}

function AmountInner({ prefix, colorize, value, muted, gray }: Props): JSX.Element | null {
    const parts = value?.split('.')
    const intPartBN = parts ? new BigNumber(parts[0].replace(/[^0-9-]/g, '')) : undefined
    const intBN = value ? new BigNumber(value.replace(/[^0-9-]/g, '')) : undefined

    const className = classNames(styles.root, {
        [styles.muted]: muted,
        [styles.red]: colorize && intBN?.lt(0),
        [styles.green]: colorize && intBN?.gt(0),
        [styles.gray]: gray,
    })

    const sign = colorize && intBN?.gt(0) ? '+' : ''

    if (parts && parts?.length === 2 && intPartBN && !intPartBN.isNaN() && intPartBN.abs().gt(0)) {
        return (
            <span className={className}>
                {prefix}
                {sign}
                {parts[0]}
                <span className={styles.decimals}>.{parts[1]}</span>
            </span>
        )
    }

    return (
        <span className={className}>
            {prefix}
            {sign}
            {value}
        </span>
    )
}

export const Amount = React.memo(AmountInner)
