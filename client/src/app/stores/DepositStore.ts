import { makeAutoObservable, reaction, runInAction } from 'mobx'
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
import { GravixVault, UsdtToken } from '../../config.js'
import { ERC20Abi } from '../../assets/abi/ERC20.js'
import { approveTokens, getTokenBalance } from '../utils/gravix.js'

export enum DepositType {
    LONG = '0',
    SHORT = '1',
}

type State = {
    usdtBalance?: string
    loading?: boolean
}

export class DepositStore {
    protected reactions = new Reactions()

    protected state: State = {}

    isDarkMode = false
    formDepositType = DepositType.LONG
    leverageVal = 1
    collateralVal = '1'
    positionSizeVal = '1'
    slippage = '1'

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

        this.reactions.create(
            reaction(() => [this.leverageVal, this.collateralVal], this.onSizeChange),
            reaction(() => this.evmWallet.address, this.syncUsdtBalance, { fireImmediately: true }),
        )
    }

    onTabChange = (key: string) => {
        const val: DepositType = key === DepositType.LONG ? DepositType.LONG : DepositType.SHORT
        this.formDepositType = val
    }

    onCollateralChange = (val: string) => {
        this.collateralVal = val
    }

    onSizeChange = () => {
        this.positionSizeVal = new BigNumber(this.collateralVal).times(this.leverageVal).toFixed(2)
    }

    onLeverageChange = (val: number | null) => {
        this.leverageVal = val ? val : 1
    }

    approveToken = async () => {
        if (!this.evmWallet?.provider) return
        const browserProvider = new ethers.BrowserProvider(this.evmWallet.provider)
        const signer = await browserProvider.getSigner()
        const ERC20Token = new ethers.Contract(UsdtToken, ERC20Abi, signer)
        const allowance = await ERC20Token.allowance(this.evmWallet.address, GravixVault)
        const approvalDelta = new BigNumber(allowance.toString()).minus(
            normalizeAmount('100000', this.gravix.baseNumber),
        )
        if (approvalDelta.lt(0)) {
            await ERC20Token.approve(GravixVault, approvalDelta.abs().toFixed())
        }
    }

    submitMarketOrder = async () => {
        if (!this.evmWallet?.provider || !this.evmWallet.address) return
        if (
            !this.collateralNormalized ||
            !this.openPriceNormalized ||
            !this.leverageNormalized ||
            !this.slippageNormalized ||
            !this.priceStore.price
        )
            return

        try {
            await approveTokens(UsdtToken, this.evmWallet.address, GravixVault, '100000', this.evmWallet.provider)
            const browserProvider = new ethers.BrowserProvider(this.evmWallet.provider)
            const signer = await browserProvider.getSigner()
            const gravixContract = new Contract(GravixVault, GravixAbi.abi, signer) as BaseContract as Gravix
            const assetData = await (
                await fetch('https://api-cc35d.ondigitalocean.app/signature', {
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
            // const iface = new ethers.utils.Interface(contract.abi)
            console.log(1, 'SUBMIT')
            console.log(assetData, 'assetPrice')
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
            const btcMarket = markets[0][0].toString()
            // const collateral = new BigNumber(this.collateralVal).shiftedBy(6)
            console.log(markets[0][0].toString(), 'markets')
            console.log(markets, 'markets')
            console.log(
                {
                    market: btcMarket,
                    type: this.formDepositType,
                    collateral: this.collateralNormalized,
                    openPrice: this.openPriceNormalized,
                    leverage: this.leverageNormalized,
                    slippage: this.slippageNormalized,
                    price: assetData.price,
                    timestamp: assetData.timestamp,
                    sig: assetData.signature,
                },
                'PAYLOAD',
            )
            await gravixContract
                .openMarketPosition(
                    btcMarket,
                    this.formDepositType,
                    this.collateralNormalized,
                    this.openPriceNormalized,
                    this.leverageNormalized,
                    this.slippageNormalized,
                    assetData.price,
                    assetData.timestamp,
                    assetData.signature,
                )
                .catch(err => console.log(err))
        } catch {
            console.log('err submitMarketOrder')
        }
    }

    async syncUsdtBalance(): Promise<void> {
        let usdtBalance: string

        try {
            if (this.evmWallet.provider && this.evmWallet.address) {
                usdtBalance = await getTokenBalance(UsdtToken, this.evmWallet.address, this.evmWallet.provider)
            }
        } catch (e) {
            console.error(e)
        }

        runInAction(() => {
            this.state.usdtBalance = usdtBalance
        })
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

    get loading(): boolean {
        return !!this.state.loading
    }

    get usdtBalance(): string | undefined {
        return this.state.usdtBalance
    }

    get amountIsValid(): boolean {
        if (this.state.usdtBalance && this.collateralNormalized) {
            return new BigNumber(this.state.usdtBalance).gte(this.collateralNormalized)
        }

        return false
    }
}
