import classNames from 'classnames'
import * as React from 'react'

import styles from './index.module.scss'
import { DepositType } from '../../../stores/DepositStore.js'
import { formattedAmount } from '../../../utils/formatted-amount.js'
import { decimalAmount } from '../../../utils/decimal-amount.js'

type Props = {
    symbol: string
    leverage: string
    type: string
}

export function PositionItemType({ symbol, leverage, type }: Props): JSX.Element {
    const leverageFormatted = React.useMemo(
        () => (leverage ? formattedAmount(decimalAmount(leverage, 6)) : undefined),
        [leverage],
    )

    return (
        <>
            {symbol}

            <div className={styles.root}>
                {leverageFormatted && <span className={styles.x}>x{leverageFormatted}</span>}
                {type && (
                    <span
                        className={classNames({
                            [styles.short]: type === DepositType.Short,
                            [styles.long]: type === DepositType.Long,
                        })}
                    >
                        {type === DepositType.Long ? 'Long' : 'Short'}
                    </span>
                )}
            </div>
        </>
    )
}
