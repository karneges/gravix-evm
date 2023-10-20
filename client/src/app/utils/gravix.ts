import { ethers } from 'ethers'
import { MetaMaskInpageProvider } from '@metamask/providers'
import { ERC20Abi } from '../../assets/abi/ERC20.js'
import { BigNumber } from 'bignumber.js'
import { delay } from './delay.js'

export type WithoutArr<T> = {
    [Key in {
        [key in keyof T]: key extends keyof Array<any> ? never : key extends `${number}` ? never : key
    }[keyof T]]: T[Key]
}

export const mapTickerToTicker = (ticker: string) => {
    switch (ticker) {
        case 'BTCUSDT':
            return 'BTC/USD'
        case 'ETHUSDT':
            return 'BTC/USD'
        case 'BNBUSDT':
            return 'BNB/USD'
        default:
            throw new Error('Unknown idx')
    }
}

export const mapChartSymbol = (ticker: string) => {
    switch (ticker) {
        case 'BTCUSDT':
            return 'BINANCE:BTCUSDT'
        case 'ETHUSDT':
            return 'BINANCE:ETHUSDT'
        case 'BNBUSDT':
            return 'BINANCE:BNBUSDT'
        default:
            throw new Error('Unknown market')
    }
}

export const mapApiSymbol = (ticker: string) => {
    console.log(ticker)
    switch (ticker) {
        case 'BTCUSDT':
            return 'BTCUSDT'
        case 'ETHUSDT':
            return 'ETHUSDT'
        case 'BNBUSDT':
            return 'BNBUSDT'
        default:
            throw new Error('Unknown market')
    }
}

export const getTokenBalance = async (token: string, user: string, provider: MetaMaskInpageProvider) => {
    try {
        const browserProvider = new ethers.BrowserProvider(provider)
        const signer = await browserProvider.getSigner()
        const ERC20Token = new ethers.Contract(token, ERC20Abi, signer)
        const balance = await ERC20Token.balanceOf(user)
        return balance.toString()
    } catch (e) {
        console.error(e)
    }
}

export const approveTokens = async (
    token: string,
    user: string,
    vault: string,
    amount: string,
    provider: MetaMaskInpageProvider,
) => {
    const browserProvider = new ethers.BrowserProvider(provider)
    const signer = await browserProvider.getSigner()
    const ERC20Token = new ethers.Contract(token, ERC20Abi, signer)
    const allowance = await ERC20Token.allowance(user, vault)
    const delta = new BigNumber(allowance.toString()).minus(amount)

    if (delta.lt(0)) {
        await ERC20Token.approve(vault, amount)

        let count = 0
        let ready = false
        while (!ready && count < 25) {
            await delay(1000)
            const allowance = await ERC20Token.allowance(user, vault)
            const delta = new BigNumber(allowance.toString()).minus(amount)
            ready = delta.gte(0)
            count += 1
        }
    }
}

export const decimalPercent = (value: string): string =>
    new BigNumber(value)
        .dividedBy(10 ** 12)
        .times(100)
        .toFixed()

export const normalizePercent = (value: string): string =>
    new BigNumber(value)
        .dividedBy(100)
        .times(10 ** 12)
        .toFixed()

export const decimalLeverage = (value: string | number): string => new BigNumber(value).dividedBy(1000000).toFixed()

export const normalizeLeverage = (value: string | number): string =>
    new BigNumber(value).times(1000000).decimalPlaces(0, BigNumber.ROUND_DOWN).toFixed()
