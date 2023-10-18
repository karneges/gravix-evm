import { BigNumber } from 'bignumber.js'

export function decimalAmount(amount: string, decimals: number, fixed = 0): string {
    if (!amount) return '0'
    return new BigNumber(amount).shiftedBy(-decimals).toFixed(fixed)
}
