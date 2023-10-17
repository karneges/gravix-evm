import { BigNumber } from 'bignumber.js'
import memoize from 'just-memoize'

export const normalizePercent = memoize((value: string): string =>
    new BigNumber(value)
        .dividedBy(100)
        .times(10 ** 12)
        .toFixed(),
)
