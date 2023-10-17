import { makeAutoObservable, runInAction } from 'mobx'
// import { createPXEClient, getSandboxAccountsWallets, AztecAddress, Wallet, AccountWalletWithPrivateKey } from '@aztec/aztec.js';
// import {VaultContract} from '../../artifacts/Vault.js'

// account - кошелек, полученный выше

enum ETheme {
    DARK = 'dark',
    LIGHT = 'light',
}

// const PXE_URL = "http://167.99.212.95:8080"
// const VAULT_ADDRESS = '0x1180f988c7d36ac2cac05ebba83b8fa224074cff1cba541528db143083b03f20';

export class GravixStore {
    constructor() {
        makeAutoObservable(
            this,
            {},
            {
                autoBind: true,
            },
        )

        this.initApp()
    }

    isDarkMode = false
    gravixAccounts: `0x${string}`[] = []
    // gravixAccountsCompleted: AccountWalletWithPrivateKey[] = []

    get test() {
        return 'test'
    }

    initApp() {
        const themeType = localStorage.getItem('theme-type')
        if (themeType === ETheme.DARK) this.toggleTheme(true)

        // this.initGravix().catch(() => console.log("initGravix error"))
    }

    // async initGravix() {
    //     const pxe = createPXEClient(PXE_URL); // адрес нашей ноды
    //     const { chainId } = await pxe.getNodeInfo();
    //     console.log(`Connected to chain ${chainId}`);
    //     const gravixAccsFull = await getSandboxAccountsWallets(pxe);
    //     const gravixAccs = gravixAccsFull.map(i => i.getAddress().toString());

    //     console.log(await this.getVault(gravixAccsFull[0]), 'VAULT')
    //     runInAction(() => {
    //         this.gravixAccounts = gravixAccs
    //         this.gravixAccountsCompleted = gravixAccsFull
    //     })
    // }

    toggleTheme(isDark?: boolean) {
        if (isDark) {
            this.isDarkMode = true
            return
        }
        this.isDarkMode = !this.isDarkMode

        this.isDarkMode
            ? localStorage.setItem('theme-type', ETheme.DARK)
            : localStorage.setItem('theme-type', ETheme.LIGHT)
    }

    // async getVault(account: Wallet) {
    //     return await VaultContract.at(AztecAddress.fromString(VAULT_ADDRESS), account);
    // }

    public get getThemeMode(): boolean {
        return this.isDarkMode ?? false
    }
}
