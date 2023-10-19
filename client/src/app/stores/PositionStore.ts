import { makeAutoObservable, reaction } from 'mobx'
import { BigNumber } from 'bignumber.js'
import {
    calcCollateral,
    calcLimitedPnl,
    calcNetValue,
    calcNetValueChange,
    calcNetValueChangePercent,
    calcPnlAfterFees,
    calcPnlAfterFeesPercent,
} from './utils/index.js'
import { decimalLeverage } from '../utils/gravix.js'
import { PositionsListStore } from './PositionsListStore.js'
import { PriceStore } from './PriceStore.js'
import { MarketStore } from './MarketStore.js'
import { GravixStore } from './GravixStore.js'
import { IGravix } from '../../assets/misc/Gravix.js'
import { WithoutArr } from '../../types.js'
import { Reactions } from '../utils/reactions.js'

type State = {
    funding?: any
    positionView?: WithoutArr<IGravix.PositionViewStructOutput>
}

export class PositionStore {
    protected state: State = {}
    protected reactions = new Reactions()

    constructor(
        protected gravix: GravixStore,
        protected market: MarketStore,
        protected price: PriceStore,
        protected positions: PositionsListStore,
        public readonly positionIdx: string,
    ) {
        makeAutoObservable(
            this,
            {},
            {
                autoBind: true,
            },
        )

        this.reactions.create(
            reaction(() => [this.positions.allUserPositions.length], this.init, { fireImmediately: true }),
        )
    }

    init() {
        this.state.positionView = this.positions.positionsViewById[this.positionIdx]
    }

    public dispose(): void {
        this.state = {}
    }

    public get position(): WithoutArr<IGravix.PositionStructOutput> | undefined {
        return this.positions.positionsById[this.positionIdx]
    }

    public get leverage(): string | undefined {
        return this.position ? decimalLeverage(this.position.leverage?.toString()) : undefined
    }

    public get type(): string | undefined {
        return this.position?.positionType?.toString()
    }

    public get netValue(): string | undefined {
        return this.initialCollateral && this.openFee && this.borrowFee && this.fundingFee && this.limitedPnl
            ? calcNetValue(this.initialCollateral, this.openFee, this.borrowFee, this.fundingFee, this.limitedPnl)
            : undefined
    }

    public get netValueChange(): string | undefined {
        return this.borrowFee && this.fundingFee && this.limitedPnl
            ? calcNetValueChange(this.borrowFee, this.fundingFee, this.limitedPnl)
            : undefined
    }

    public get receiveValue(): string | undefined {
        return this.initialCollateral && this.fees && this.limitedPnl
            ? new BigNumber(this.initialCollateral).plus(this.limitedPnl).minus(this.fees).toFixed()
            : undefined
    }

    public get receiveValuePercent(): string | undefined {
        return this.receiveValue && this.initialCollateral
            ? new BigNumber(this.receiveValue)
                  .minus(this.initialCollateral)
                  .times(100)
                  .dividedBy(this.initialCollateral)
                  .decimalPlaces(2)
                  .toFixed()
            : undefined
    }

    public get netValueChangePercent(): string | undefined {
        return this.collateral && this.netValueChange
            ? calcNetValueChangePercent(this.collateral, this.netValueChange)
            : undefined
    }

    public get size(): string | undefined {
        return this.state.positionView?.positionSizeUSD?.toString()
    }

    public get collateral(): string | undefined {
        return this.position && this.position.openFee
            ? calcCollateral(this.position.initialCollateral?.toString(), this.position.openFee?.toString())
            : undefined
    }

    public get fundingFee(): string | undefined {
        return this.state.positionView?.fundingFee?.toString()
    }

    public get fundingFeeInverted(): string | undefined {
        return this.state.positionView?.fundingFee
            ? new BigNumber(this.state.positionView.fundingFee?.toString()).times(-1).toFixed()
            : undefined
    }

    public get fees(): string | undefined {
        return this.openFee && this.borrowFee && this.state.positionView && this.closeFee
            ? new BigNumber(this.openFee)
                  .plus(this.closeFee)
                  .plus(this.borrowFee)
                  .plus(this.state.positionView.fundingFee?.toString())
                  .toFixed()
            : undefined
    }

    public get feesInverted(): string | undefined {
        return this.fees ? new BigNumber(this.fees).times(-1).toFixed() : undefined
    }

    public get pnlAfterFees(): string | undefined {
        return this.limitedPnl && this.openFee && this.borrowFee && this.state.positionView && this.initialCollateral
            ? calcPnlAfterFees(
                  this.limitedPnl,
                  this.openFee,
                  this.borrowFee,
                  this.state.positionView.fundingFee?.toString(),
                  this.initialCollateral,
              )
            : undefined
    }

    public get pnlAfterFeesPercent(): string | undefined {
        return this.initialCollateral && this.pnlAfterFees
            ? calcPnlAfterFeesPercent(this.pnlAfterFees, this.initialCollateral)
            : undefined
    }

    public get borrowFee(): string | undefined {
        return this.state.positionView?.borrowFee?.toString()
    }

    public get borrowFeeInverted(): string | undefined {
        return this.borrowFee ? new BigNumber(this.borrowFee).times(-1).toFixed() : undefined
    }

    public get closeFee(): string | undefined {
        return this.state.positionView?.closeFee?.toString()
    }

    public get closeFeeInverted(): string | undefined {
        return this.closeFee ? new BigNumber(this.closeFee).times(-1).toFixed() : undefined
    }

    public get closePrice(): string | undefined {
        return this.state.positionView?.closePrice?.toString()
    }

    public get initialCollateral(): string | undefined {
        return this.position?.initialCollateral?.toString()
    }

    public get pnl(): string | undefined {
        return this.state.positionView ? this.state.positionView.pnl.toString() : undefined
    }

    public get limitedPnl(): string | undefined {
        return this.pnl && this.initialCollateral && this.openFee
            ? calcLimitedPnl(this.initialCollateral, this.openFee, this.pnl, this.gravix.maxPnlRate)
            : undefined
    }

    public get limitedPnlPercent(): string | undefined {
        return this.initialCollateral && this.limitedPnl
            ? new BigNumber(this.limitedPnl).times(100).dividedBy(this.initialCollateral).decimalPlaces(2).toFixed()
            : undefined
    }

    public get marketPrice(): string | undefined {
        return this.price.priceNormalized?.toString()
    }

    public get openPrice(): string | undefined {
        return this.position?.openPrice?.toString()
    }

    public get openFee(): string | undefined {
        return this.position?.openFee?.toString()
    }

    public get openFeeInverted(): string | undefined {
        return this.openFee ? new BigNumber(this.openFee).times(-1).toFixed() : undefined
    }

    public get liquidationPrice(): string | undefined {
        return this.state.positionView?.liquidationPrice?.toString()
    }

    public get marketIdx(): string | undefined {
        return this.market.market?.marketIdx?.toString() ?? undefined
    }

    public get createdAt(): number | undefined {
        return this.position?.createdAt ? parseInt(this.position.createdAt?.toString(), 10) : undefined
    }
}
