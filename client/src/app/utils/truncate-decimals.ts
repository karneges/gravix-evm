import { BigNumber } from 'bignumber.js'
import { isGoodBignumber } from './is-good-bignumber.js'

export function truncateDecimals(value: string, decimals?: number): string | undefined {
    const result = new BigNumber(value || 0)

    if (!isGoodBignumber(result)) {
        return value
    }

    if (decimals !== undefined && (result.decimalPlaces() ?? 0) > decimals) {
        return result.dp(decimals, BigNumber.ROUND_DOWN).toFixed()
    }

    return result.toFixed()
}
