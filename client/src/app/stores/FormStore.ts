import { makeAutoObservable, reaction } from 'mobx'
import { BigNumber } from 'bignumber.js'
import { Reactions } from '../utils/reactions.js'

export enum DepositType {
    LONG = '0',
    SHORT = '1',
}

export class FormStore {
    protected reactions = new Reactions()

    isDarkMode = false
    formDepositType = DepositType.LONG
    leverageVal = 1
    collateralVal = 1
    positionSizeVal = '1'

    constructor() {
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

    get test() {
        return 'test'
    }

    public get getThemeMode(): boolean {
        return this.isDarkMode ?? false
    }
}
