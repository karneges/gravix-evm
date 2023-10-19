import { makeAutoObservable, runInAction } from 'mobx'
import { notification } from 'antd'
import { BigNumber } from 'bignumber.js'
import { Reactions } from '../utils/reactions.js'
import { ethers } from 'ethers'
import { EvmWalletStore } from './EvmWalletStore.js'
import GravixAbi from '../../assets/abi/Gravix.json'
import { Gravix } from '../../assets/misc/index.js'
import { PriceStore } from './PriceStore.js'
import { GravixStore } from './GravixStore.js'
import { normalizeAmount } from '../utils/normalize-amount.js'
import { normalizePercent } from '../utils/mix.js'
import { GravixVault, UsdtToken } from '../../config.js'
import { approveTokens, mapIdxToTicker, normalizeLeverage } from '../utils/gravix.js'
import { decimalAmount } from '../utils/decimal-amount.js'
import { MarketStore } from './MarketStore.js'
import { BalanceStore } from './BalanceStore.js'
import { MarketStatsStore } from './MarketStatsStore.js'

export enum DepositType {
    Long = '0',
    Short = '1',
}

type State = {
    loading?: boolean
    depositType: DepositType
    leverage: string
    collateral?: string
    slippage?: string
    position?: string
}

const initialState: State = {
    depositType: DepositType.Long,
    leverage: '1',
    slippage: '1',
}

export class DepositStore {
    protected reactions = new Reactions()

    protected state = initialState

    constructor(
        protected wallet: EvmWalletStore,
        protected price: PriceStore,
        protected gravix: GravixStore,
        protected market: MarketStore,
        protected marketStats: MarketStatsStore,
        protected balance: BalanceStore,
    ) {
        makeAutoObservable(
            this,
            {},
            {
                autoBind: true,
            },
        )
    }

    setType(val: DepositType): void {
        this.state.depositType = val
    }

    setCollateral(value: string): void {
        this.state.collateral = value
        this.calcPosition()
    }

    setPosition(value: string): void {
        this.state.position = value
        this.calcCollateral()
    }

    setLeverage(value: string): void {
        this.state.leverage = value
        this.calcPosition()
    }

    setSlippage(value: string): void {
        this.state.slippage = value
    }

    calcCollateral(): void {
        this.state.collateral =
            this.position && this.leverage && this.market.openFeeRate
                ? new BigNumber(this.position)
                      .dividedBy(
                          new BigNumber(1)
                              .minus(new BigNumber(this.leverage).times(this.market.openFeeRate).dividedBy(100))
                              .times(this.leverage),
                      )
                      .decimalPlaces(6)
                      .toString()
                : undefined
    }

    calcPosition(): void {
        this.state.position =
            this.collateral && this.openFee && this.leverage
                ? new BigNumber(this.collateral).minus(this.openFee).times(this.leverage).decimalPlaces(6).toString()
                : undefined
    }

    async submit(): Promise<void> {
        let success = false,
            gravix: Gravix | undefined

        runInAction(() => {
            this.state.loading = true
        })

        try {
            if (!this.wallet.provider) {
                throw new Error('wallet.provider must be defined')
            }

            if (!this.collateral) {
                throw new Error('amount must be defined')
            }

            if (!this.wallet.address) {
                throw new Error('wallet.address must be defined')
            }

            if (!this.collateralNormalized) {
                throw new Error('collateralNormalized must be defined')
            }

            if (!this.openPriceNormalized) {
                throw new Error('openPriceNormalized must be defined')
            }

            if (!this.leverageNormalized) {
                throw new Error('leverageNormalized must be defined')
            }

            if (!this.slippageNormalized) {
                throw new Error('slippageNormalized must be defined')
            }

            if (!this.market.idx) {
                throw new Error('market.idx must be defined')
            }

            const provider = new ethers.BrowserProvider(this.wallet.provider)
            const signer = await provider.getSigner()
            gravix = new ethers.Contract(GravixVault, GravixAbi.abi, signer) as ethers.BaseContract as Gravix
            const assetData = await this.market.loadAssetData()

            if (!assetData) {
                throw new Error('assetData empty')
            }

            await approveTokens(
                UsdtToken,
                this.wallet.address,
                GravixVault,
                this.collateralNormalized,
                this.wallet.provider,
            )

            const successListener = new Promise<boolean>((resolve, reject) => {
                gravix!
                    .addListener('MarketOrderExecution', (address, data) => {
                        if (address === this.wallet.address) {
                            const price = decimalAmount(data.openPrice, 8)
                            const type = data.positionType.toString() === '0' ? 'Long' : 'Short'
                            notification.success({
                                message: 'Market order executed',
                                description: `${mapIdxToTicker(data.marketIdx.toString())} ${type} open at $${price}`,
                                placement: 'bottomRight',
                            })
                            resolve(true)
                        }
                    })
                    .catch(reject)
            })

            await gravix.openMarketPosition(
                this.market.idx,
                this.state.depositType,
                this.collateralNormalized,
                this.openPriceNormalized,
                this.leverageNormalized,
                this.slippageNormalized,
                assetData.price,
                assetData.timestamp,
                assetData.signature,
            )

            success = await successListener
        } catch (e) {
            console.error(e)
            notification.error({
                message: 'Market order canceled',
                placement: 'bottomRight',
            })
        }

        gravix?.removeAllListeners().catch(console.error)
        await this.balance.syncUsdtBalance()

        runInAction(() => {
            this.state.collateral = success ? '' : this.collateral
            this.state.leverage = success ? '1' : this.leverage
            this.state.position = success ? '' : this.position
            this.state.loading = false
        })
    }

    get loading(): boolean {
        return !!this.state.loading
    }

    get collateral(): string | undefined {
        return this.state.collateral
    }

    get collateralNormalized(): string | undefined {
        return this.state.collateral ? normalizeAmount(this.state.collateral, this.gravix.baseNumber) : undefined
    }

    get amountIsValid(): boolean {
        if (this.balance.usdtBalance && this.collateralNormalized) {
            return new BigNumber(this.balance.usdtBalance).gte(this.collateralNormalized)
        }

        return false
    }

    get depositType(): DepositType {
        return this.state.depositType
    }

    get slippage(): string | undefined {
        return this.state.slippage
    }

    get leverage(): string {
        return this.state.leverage
    }

    get leverageNormalized(): string | undefined {
        return this.leverage ? normalizeLeverage(this.leverage) : undefined
    }

    get openFee(): string | undefined {
        return this.collateral && this.leverage && this.market.openFeeRate
            ? new BigNumber(this.collateral)
                  .times(this.leverage)
                  .times(this.market.openFeeRate)
                  .dividedBy(100)
                  .toFixed()
            : undefined
    }

    get liquidationPrice(): string | undefined {
        if (
            this.collateral &&
            this.openFee &&
            this.openPrice &&
            this.leverage &&
            this.market.baseSpreadRate &&
            new BigNumber(this.collateral).gt(0)
        ) {
            const isLong = this.depositType === DepositType.Long

            const collateral = new BigNumber(this.collateral).minus(this.openFee)

            const liqPriceDistance = new BigNumber(this.openPrice)
                .times(collateral)
                .times(0.9)
                .dividedBy(this.collateral)
                .dividedBy(this.leverage)

            return new BigNumber(this.openPrice)
                .plus(new BigNumber(liqPriceDistance).times(isLong ? -1 : 1))
                .dividedBy(
                    new BigNumber(1).plus(
                        new BigNumber(this.market.baseSpreadRate).dividedBy(100).times(isLong ? -1 : 1),
                    ),
                )
                .decimalPlaces(this.gravix.priceDecimals, BigNumber.ROUND_DOWN)
                .toFixed()
        }
        return undefined
    }

    get position(): string | undefined {
        return this.state.position
    }

    get positionNormalized(): string | undefined {
        return this.position ? normalizeAmount(this.position, 6) : undefined
    }

    get dynamicSpread(): string | undefined {
        const isLong = this.depositType === DepositType.Long

        return this.market.totalLongs &&
            this.positionNormalized &&
            this.market.totalShorts &&
            this.market.depth &&
            this.price.priceNormalized
            ? BigNumber.max(
                  0,
                  new BigNumber(isLong ? this.market.totalLongs : this.market.totalShorts)
                      .plus(
                          new BigNumber(this.positionNormalized)
                              .times(10 ** 6)
                              .dividedBy(this.price.priceNormalized)
                              .times(0.5),
                      )
                      .minus(isLong ? this.market.totalShorts : this.market.totalLongs)
                      .dividedBy(this.market.depth)
                      .times(0.1),
              ).toFixed()
            : undefined
    }

    get spread(): string | undefined {
        return this.market.baseSpreadRate && this.dynamicSpread
            ? new BigNumber(this.market.baseSpreadRate).plus(this.dynamicSpread).toFixed()
            : undefined
    }

    get openPrice(): string | undefined {
        const isLong = this.depositType === DepositType.Long

        return this.price.price && this.spread
            ? new BigNumber(this.price.price)
                  .plus(
                      new BigNumber(this.price.price)
                          .times(this.spread)
                          .dividedBy(100)
                          .times(isLong ? 1 : -1),
                  )
                  .decimalPlaces(this.gravix.priceDecimals, BigNumber.ROUND_DOWN)
                  .toString()
            : undefined
    }

    get openPriceNormalized(): string | undefined {
        return this.openPrice ? normalizeAmount(this.openPrice, 8) : undefined
    }

    get slippageNormalized(): string | undefined {
        return this.state.slippage ? normalizePercent(this.state.slippage) : undefined
    }

    get isValid(): boolean | undefined {
        if (this.collateral) {
            return this.gravix.minPositionCollateral && this.collateralNormalized
                ? new BigNumber(this.collateralNormalized).gte(this.gravix.minPositionCollateral)
                : undefined
        }
        return undefined
    }

    get isSpreadValid(): boolean | undefined {
        return this.price.price && this.liquidationPrice
            ? this.depositType === DepositType.Long
                ? new BigNumber(this.price.price).gt(this.liquidationPrice)
                : new BigNumber(this.price.price).lt(this.liquidationPrice)
            : undefined
    }

    get isEnabled(): boolean | undefined {
        return this.isValid && this.amountIsValid && this.isSpreadValid === true
    }
}
