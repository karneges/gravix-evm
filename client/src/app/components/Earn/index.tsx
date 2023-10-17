import React from 'react'

import styles from './index.module.scss'
import { useProvider, useStore } from '../../hooks/useStore.js'
import { EarnStore } from '../../stores/EarnStore.js'
import { EarnForm } from './Form.js'
import { EvmWalletStore } from '../../stores/EvmWalletStore.js'

export const Earn: React.FC = () => {
    const wallet = useStore(EvmWalletStore)
    const EarnProvider = useProvider(EarnStore, wallet)

    return (
        <EarnProvider>
            <div className={styles.earn}>
                <EarnForm />
            </div>
        </EarnProvider>
    )
}
