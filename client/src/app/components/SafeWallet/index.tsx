import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { Button, Select, Typography } from 'antd'
import { useStore } from '../../hooks/useStore.js'
import { EvmWalletStore } from '../../stores/EvmWalletStore.js'
import { sliceAddress } from '../../utils/slice-address.js'

import styles from './index.module.scss'
import { networks } from '../../../config.js'
import { GravixStore } from '../../stores/GravixStore.js'
import { formatEther, parseUnits } from 'ethers'
import { AccountAbstractionStore } from '../../stores/accountAbstractionContext-v2.js'

export const SafeWallet: React.FC = observer(() => {
    const accountAbstraction = useStore(AccountAbstractionStore)
    console.log(`is authenticated: ${accountAbstraction.isAuthenticated}`)
    return (
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
            {!accountAbstraction.isAuthenticated ? (
                <Button onClick={accountAbstraction.onLoginWeb3Auth}>Connect SafeWallet</Button>
            ) : (
                <Typography.Text>
                    SafeWallet: {sliceAddress(accountAbstraction.wallets.safe)}{' '}
                    {formatEther(accountAbstraction.safeBalance.amount || 0).slice(0, 5)} eth
                </Typography.Text>
            )}
        </div>
    )
})
