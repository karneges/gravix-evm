export function usdSign(amount: string): string {
    return amount[0] === '-' ? `-$${amount.substring(1)}` : `$${amount}`
}

export function percentSign(amount: string): string {
    return `${amount}%`
}
