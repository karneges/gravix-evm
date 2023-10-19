import { ethers, Contract, BaseContract } from 'ethers'
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

export type WithoutArr<T> = {
    [Key in {
        [key in keyof T]: key extends keyof Array<any> ? never : key extends `${number}` ? never : key
    }[keyof T]]: T[Key]
}

export type TGravixPosition = WithoutArr<IGravix.PositionStructOutput> & { index: string }

type State = {
    marketOrders?: WithoutArr<TGravixPosition>[]
    marketOrdersFull?: WithoutArr<IGravix.UserPositionInfoStructOutput>[]
    marketOrdersPosView?: WithoutArr<IGravix.PositionViewStructOutput>[]
}

export class PositionsListStore {
    protected reactions = new Reactions()
    protected state: State = {}

    constructor(
        protected evmWallet: EvmWalletStore,
        protected gravix: GravixStore,
    ) {
        makeAutoObservable(
            this,
            {},
            {
                autoBind: true,
            },
        )

        this.reactions.create(reaction(() => [this.evmWallet.address], this.initApp, { fireImmediately: true }))
    }

    async initApp() {
        if (!this.evmWallet.provider || !this.evmWallet.address) return
        const browserProvider = new ethers.BrowserProvider(this.evmWallet.provider)
        const signer = await browserProvider.getSigner()
        const gravixContract = new Contract(GravixVault, GravixAbi.abi, signer) as BaseContract as Gravix

        const position = await gravixContract.getUserPositions(this.evmWallet.address)

        const filteredPositions = position.filter(_ => (_[1].createdAt.toString() !== '0' ? true : false))
        const assetData = await (
            await fetch('https://api-cc35d.ondigitalocean.app/api/signature', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    marketIdx: 0,
                    chainId: 59140,
                }),
            })
        ).json()
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
                console.log(position, 'positionsView')

                return position
            }),
        )

        runInAction(() => {
            this.state.marketOrders = filteredPositions.map(_ => mapPosition(_, _[0].toString()))
            this.state.marketOrdersFull = filteredPositions.map(_ => {
                return {
                    position: mapPosition(_, _[0].toString()),
                    positionIdx: [_[0]],
                }
            }) as any
            // positionKey: BigNumberish;
            // user: AddressLike;
            // assetPrice: BigNumberish;
            // funding: IGravix.FundingStruct;
            this.state.marketOrdersPosView = positionsView.map(mapPositionView)
        })
    }

    async closePos(key: string) {
        if (!this.evmWallet.provider || !this.evmWallet.address) return
        console.log('333')

        try {
            const browserProvider = new ethers.BrowserProvider(this.evmWallet.provider)
            const signer = await browserProvider.getSigner()
            const gravixContract = new Contract(GravixVault, GravixAbi.abi, signer) as BaseContract as Gravix

            const assetData = await (
                await fetch('https://api-cc35d.ondigitalocean.app/api/signature', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        marketIdx: 0,
                        chainId: 59140,
                    }),
                })
            ).json()

            await gravixContract.closeMarketPosition(0, key, assetData.price, assetData.timestamp, assetData.signature)

            console.log('closePos')
        } catch (e) {
            console.log(e)
        }
    }

    countSize(collateral: string, leverage: string) {
        const normLeverage = decimalAmount(leverage, this.gravix.baseNumber)
        console.log(normLeverage, 'normLeverage')
        return new BigNumber(collateral)
            .times(normLeverage)
            .div(10 ** 6)
            .toFixed(2)
    }

    public get allUserViewPositions(): WithoutArr<IGravix.PositionViewStructOutput>[] {
        return this.state.marketOrdersPosView ?? []
    }

    public get allUserPositions(): WithoutArr<TGravixPosition>[] {
        return this.state.marketOrders ?? []
    }

    public get positionsById(): { [k: string]: WithoutArr<TGravixPosition> | undefined } {
        console.log(Object.fromEntries(this.state.marketOrdersFull as any), 'filteredPositionsfromEntries')
        return this.state.marketOrdersFull ? Object.fromEntries(this.state.marketOrdersFull as any) : {}
    }
}

const mapPositionView = (item: IGravix.PositionViewStructOutput): WithoutArr<IGravix.PositionViewStructOutput> => ({
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
})

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
