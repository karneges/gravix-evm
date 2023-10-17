import { makeAutoObservable, reaction } from 'mobx'
import { BigNumber } from 'bignumber.js'
import { Reactions } from '../utils/reactions.js'
import { Contract, ethers } from 'ethers'
import { EvmWalletStore } from './EvmWalletStore.js'
import { GravixAbi } from '../../assets/abi/Gravix.js'

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

    constructor(protected evmWallet: EvmWalletStore) {
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
        if (!this.evmWallet?.provider) return
        const browserProvider = new ethers.BrowserProvider(this.evmWallet.provider)
        const signer = await browserProvider.getSigner()
        const gravixContract = new Contract(GRAVIX_VAULT, GravixAbi, signer)
        // const iface = new ethers.utils.Interface(contract.abi)
        console.log(gravixContract, 'SUBMIT')
    }

    get test() {
        return 'test'
    }

    public get getThemeMode(): boolean {
        return this.isDarkMode ?? false
    }
}
