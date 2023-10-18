import { BigNumber } from 'bignumber.js'

export function normalizeAmount(amount: string, decimals: number): string {
    if (!amount) return '0'
    return new BigNumber(amount).decimalPlaces(decimals).shiftedBy(decimals).dp(0, BigNumber.ROUND_DOWN).toFixed()
}
