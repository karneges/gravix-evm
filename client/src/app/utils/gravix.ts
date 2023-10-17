import { Market } from "../stores/MarketStore.js"

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
