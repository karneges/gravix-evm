import { makeAutoObservable, reaction } from 'mobx'
import { BigNumber } from 'bignumber.js'
import { Reactions } from '../utils/reactions.js'
import { Contract, ethers, BaseContract } from 'ethers'
import { EvmWalletStore } from './EvmWalletStore.js'
import GravixAbi from '../../assets/abi/Gravix.json'
import { Gravix } from '../../assets/misc/index.js'
import { PriceStore } from './PriceStore.js'
import { GravixStore } from './GravixStore.js'
import { normalizeAmount } from '../utils/normalize-amount.js'
import { normalizePercent } from '../utils/mix.js'

export enum DepositType {
    LONG = '0',
    SHORT = '1',
}

const GRAVIX_VAULT = '0x10e5E8f37f77c9E886D388B313787A2DE6246180'

export class DepositStore {
    protected reactions = new Reactions()

    isDarkMode = false
    formDepositType = DepositType.LONG
    leverageVal = 1
    collateralVal = 1
    positionSizeVal = '1'
    slippage = '0'

    constructor(
        protected evmWallet: EvmWalletStore,
        protected priceStore: PriceStore,
        protected gravix: GravixStore,
    ) {
        makeAutoObservable(
            this,
            {},
            {
                autoBind: true,
            },
        )

        this.reactions.create(reaction(() => [this.leverageVal, this.collateralVal], this.onSizeChange))
    }

    onTabChange = (key: string) => {
        const val: DepositType = key === DepositType.LONG ? DepositType.LONG : DepositType.SHORT
        this.formDepositType = val
    }

    onCollateralChange = (val: number | null) => {
        this.collateralVal = val ? val : 0.1
    }

    onSizeChange = () => {
        this.positionSizeVal = new BigNumber(this.collateralVal).times(this.leverageVal).toFixed(2)
    }

    onLeverageChange = (val: number | null) => {
        this.leverageVal = val ? val : 1
    }

    submitMarketOrder = async () => {
        if (!this.evmWallet?.provider || !this.priceStore.price) return
        const browserProvider = new ethers.BrowserProvider(this.evmWallet.provider)
        const signer = await browserProvider.getSigner()
        const gravixContract = new Contract(GRAVIX_VAULT, GravixAbi.abi, signer) as BaseContract as Gravix
        // const iface = new ethers.utils.Interface(contract.abi)
        console.log(1, 'SUBMIT')
        // uint marketIdx
        // PositionType positionType, // long(0)/Short(1)
        // uint collateral, // 6 decimals number // тоже самое как в обычном гравиксе
        // uint expectedPrice, // 8 decimals number // тоже самое как в обычном гравиксе
        // uint leverage, // 6 decimals number // тоже самое как в обычном гравиксе
        // uint maxSlippageRate, // % // тоже самое как в обычном гравиксе
        // uint _assetPrice,  // данные поля вернёт ручка, по конкретному маркету
        // uint timestamp,  //
        // bytes calldata  signature //
        const markets = await gravixContract.getAllMarkets()
        // const btcMarket = markets[0][0].toString()
        // const collateral = new BigNumber(this.collateralVal).shiftedBy(6)
        console.log(markets[0][0].toString(), 'markets')
        console.log(markets, 'markets')
        // gravixContract.openMarketPosition(
        //     btcMarket,
        //     this.formDepositType,
        //     collateral,
        //     this.openPriceNormalized,
        //     this.leverageNormalized,
        //     this.slippageNormalized,
        // )
    }

    get test() {
        return 'test'
    }

    public get getThemeMode(): boolean {
        return this.isDarkMode ?? false
    }

    public get leverageNormalized(): string | undefined {
        return this.leverageVal ? normalizeAmount(this.leverageVal.toString(), this.gravix.baseNumber) : undefined
    }

    public get collateralNormalized(): string | undefined {
        return this.collateralVal ? normalizeAmount(this.collateralVal.toString(), this.gravix.baseNumber) : undefined
    }

    public get openPriceNormalized(): string | undefined {
        return this.priceStore.price ? normalizeAmount(this.priceStore.price, this.gravix.priceDecimals) : undefined
    }

    public get slippageNormalized(): string | undefined {
        return this.slippage ? normalizePercent(this.slippage) : undefined
    }
}
