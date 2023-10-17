import { ethers } from 'ethers'
import { Market } from '../stores/MarketStore.js'
import { MetaMaskInpageProvider } from '@metamask/providers'
import { ERC20Abi } from '../../assets/abi/ERC20.js'

export const mapChartSymbol = (market: Market) => {
    switch (market) {
        case Market.BTC:
            return 'BINANCE:BTCUSDT'
        case Market.ETH:
            return 'BINANCE:ETHUSDT'
        case Market.BNB:
            return 'BINANCE:BNBUSDT'
        default:
            throw new Error('Unknown market')
    }
}

export const mapApiSymbol = (market: Market) => {
    switch (market) {
        case Market.BTC:
            return 'BTCUSDT'
        case Market.ETH:
            return 'ETHUSDT'
        case Market.BNB:
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
