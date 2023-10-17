import { BigNumber } from 'bignumber.js'

export function normalizeAmount(amount: string, decimals: number): string {
    return new BigNumber(amount).decimalPlaces(decimals).shiftedBy(decimals).dp(0, BigNumber.ROUND_DOWN).toFixed()
}
