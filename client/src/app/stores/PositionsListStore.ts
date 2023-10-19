import { ethers, Contract, BaseContract } from 'ethers'
import { notification } from 'antd'
import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { EvmWalletStore } from './EvmWalletStore.js'
import { GravixVault } from '../../config.js'
import GravixAbi from '../../assets/abi/Gravix.json'
import { Gravix } from '../../assets/misc/index.js'
import { Reactions } from '../utils/reactions.js'
import { IGravix } from '../../assets/misc/Gravix.js'
import { decimalAmount } from '../utils/decimal-amount.js'
import { GravixStore } from './GravixStore.js'
import { BigNumber } from 'bignumber.js'
import { FullPositionData, PositionViewData, TGravixPosition, WithoutArr } from '../../types.js'
import { lastOfCalls } from '../utils/last-of-calls.js'
import { mapIdxToTicker } from '../utils/gravix.js'
import { BalanceStore } from './BalanceStore.js'
import { MarketStore } from './MarketStore.js'

type State = {
    marketOrders?: WithoutArr<TGravixPosition>[]
    marketOrdersFull?: FullPositionData[]
    marketOrdersPosView?: PositionViewData[]
    closeLoading: { [k: string]: boolean | undefined }
}

const initialState: State = {
    closeLoading: {},
}

export class PositionsListStore {
    protected reactions = new Reactions()
    protected state = initialState
    protected provider?: ethers.BrowserProvider

    constructor(
        protected evmWallet: EvmWalletStore,
        protected gravix: GravixStore,
        protected balance: BalanceStore,
        protected market: MarketStore,
    ) {
        makeAutoObservable(
            this,
            {},
            {
                autoBind: true,
            },
        )
    }

    init() {
        this.reactions.create(
            reaction(() => [this.evmWallet.address, this.evmWallet.chainId], this.reload, { fireImmediately: true }),
        )
    }

    reload() {
        this.state = initialState
        this.initApp().catch(console.error)
    }

    dispose() {
        this.reactions.destroy()
        this.provider?.off(this.event, this.onContract).catch(console.error)
        this.state = initialState
    }

    protected event = {
        address: GravixVault,
    }

    protected onContract = lastOfCalls(() => {
        this.initApp().catch(console.error)
    }, 500)

    async initListener(): Promise<void> {
        try {
            await this.provider?.off(this.event, this.onContract)
            await this.provider?.on(this.event, this.onContract)
        } catch (e) {
            console.error(e)
        }
    }

    async initApp() {
        if (!this.evmWallet.provider || !this.evmWallet.address) return
        this.provider = new ethers.BrowserProvider(this.evmWallet.provider)
        const assetData = await this.market.loadAssetData()

        if (!assetData) {
            throw new Error('no asset data')
        }

        const signer = await this.provider.getSigner()
        const gravixContract = new Contract(GravixVault, GravixAbi.abi, signer) as BaseContract as Gravix

        const position = await gravixContract.getUserPositions(this.evmWallet.address)

        const filteredPositions = position.filter(_ => (_[1].createdAt.toString() !== '0' ? true : false))
        const address = this.evmWallet.address

        const positionsView = await Promise.all(
            filteredPositions.map(async _ => {
                const position = await gravixContract.getPositionView({
                    positionKey: _[0],
                    user: address,
                    assetPrice: assetData.price,
                    funding: {
                        accLongUSDFundingPerShare: 0,
                        accShortUSDFundingPerShare: 0,
                    },
                })

                return position
            }),
        )

        await this.initListener()

        runInAction(() => {
            this.state.marketOrders = filteredPositions.map(_ => mapPosition(_, _[0].toString()))
            this.state.marketOrdersFull = filteredPositions.map(_ => mapFullPosition(_))
            this.state.marketOrdersPosView = positionsView.map((_, i) =>
                mapPositionView(_, filteredPositions[i][0].toString()),
            )
        })
    }

    async closePos(key: string) {
        if (!this.evmWallet.provider || !this.evmWallet.address) return

        runInAction(() => {
            this.state.closeLoading[key] = true
        })

        try {
            const browserProvider = new ethers.BrowserProvider(this.evmWallet.provider)
            const signer = await browserProvider.getSigner()
            const gravixContract = new Contract(GravixVault, GravixAbi.abi, signer) as BaseContract as Gravix
            const assetData = await this.market.loadAssetData()

            if (!assetData) {
                throw new Error('no asset data')
            }

            const successListener = new Promise<boolean>((resolve, reject) => {
                gravixContract!
                    .addListener('ClosePosition', (address, _, data) => {
                        if (address === this.evmWallet.address) {
                            const price = decimalAmount(data.closePrice.toString(), 8)
                            const type = data.position.positionType.toString() === '0' ? 'Long' : 'Short'
                            const ticker = mapIdxToTicker(data.position.marketIdx.toString())
                            notification.success({
                                message: 'Position closed',
                                description: `${ticker} ${type} closed at $${price}`,
                                placement: 'bottomRight',
                            })
                            this.balance.syncUsdtBalance().catch(console.error)
                            resolve(true)
                        }
                    })
                    .catch(reject)
            })

            await gravixContract.closeMarketPosition(0, key, assetData.price, assetData.timestamp, assetData.signature)

            await successListener
        } catch (e) {
            console.error(e)
            runInAction(() => {
                this.state.closeLoading[key] = false
            })
        }
    }

    countSize(collateral: string, leverage: string) {
        const normLeverage = decimalAmount(leverage, this.gravix.baseNumber)
        return new BigNumber(collateral)
            .times(normLeverage)
            .div(10 ** 6)
            .toFixed(2)
    }

    public get allUserPositions(): WithoutArr<TGravixPosition>[] {
        return this.state.marketOrders ?? []
    }

    public get positionsViewById(): { [k: string]: WithoutArr<IGravix.PositionViewStructOutput> | undefined } {
        return this.state.marketOrdersPosView ? Object.fromEntries(this.state.marketOrdersPosView as any) : {}
    }

    public get positionsById(): { [k: string]: WithoutArr<TGravixPosition> | undefined } {
        return this.state.marketOrdersFull ? Object.fromEntries(this.state.marketOrdersFull as any) : {}
    }

    public get closeLoading(): State['closeLoading'] {
        return this.state.closeLoading
    }
}

const mapPositionView = (item: IGravix.PositionViewStructOutput, positionKey: string): PositionViewData => {
    return {
        '1': {
            position: item.position,
            positionSizeUSD: item.positionSizeUSD,
            closePrice: item.closePrice,
            borrowFee: item.borrowFee,
            fundingFee: item.fundingFee,
            closeFee: item.closeFee,
            liquidationPrice: item.liquidationPrice,
            pnl: item.pnl,
            liquidate: item.liquidate,
            viewTime: item.viewTime,
        },
        '0': positionKey,
    }
}
const mapFullPosition = (item: IGravix.UserPositionInfoStructOutput): FullPositionData => {
    return {
        '1': {
            accUSDFundingPerShare: item[1].accUSDFundingPerShare,
            baseSpreadRate: item[1].baseSpreadRate,
            borrowBaseRatePerHour: item[1].borrowBaseRatePerHour,
            closeFeeRate: item[1].closeFeeRate,
            createdAt: item[1].createdAt,
            initialCollateral: item[1].initialCollateral,
            leverage: item[1].leverage,
            liquidationThresholdRate: item[1].liquidationThresholdRate,
            marketIdx: item[1].marketIdx,
            markPrice: item[1].markPrice,
            openFee: item[1].openFee,
            openPrice: item[1].openPrice,
            positionType: item[1].positionType,
        },
        '0': item[0].toString(),
    }
}

const mapPosition = (item: IGravix.UserPositionInfoStructOutput, index: string): TGravixPosition => {
    return {
        index,
        accUSDFundingPerShare: item[1].accUSDFundingPerShare,
        baseSpreadRate: item[1].baseSpreadRate,
        borrowBaseRatePerHour: item[1].borrowBaseRatePerHour,
        closeFeeRate: item[1].closeFeeRate,
        createdAt: item[1].createdAt,
        initialCollateral: item[1].initialCollateral,
        leverage: item[1].leverage,
        liquidationThresholdRate: item[1].liquidationThresholdRate,
        marketIdx: item[1].marketIdx,
        markPrice: item[1].markPrice,
        openFee: item[1].openFee,
        openPrice: item[1].openPrice,
        positionType: item[1].positionType,
    }
}
