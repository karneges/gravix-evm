import React, { useCallback } from 'react'

import styles from './index.module.scss'
import { useProvider, useStore } from '../../hooks/useStore.js'
import { EarnStore } from '../../stores/EarnStore.js'
import { EarnForm } from './Form.js'
import { EvmWalletStore } from '../../stores/EvmWalletStore.js'
import { GravixStore } from '../../stores/GravixStore.js'
import { AccountAbstractionStore } from '../../stores/accountAbstractionContext-v2.js'

export const Earn: React.FC = () => {
    const wallet = useStore(EvmWalletStore)
    const gravix = useStore(GravixStore)
    const accountAbstraction = useStore(AccountAbstractionStore)

    const EarnProvider = useProvider(
        EarnStore,
        accountAbstraction.wallets,
        accountAbstraction,
        wallet.provider!,
        gravix,
    )

    return (
        <EarnProvider>
            <div className={styles.earn}>
                <EarnForm />
            </div>
        </EarnProvider>
    )
}
