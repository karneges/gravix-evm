import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { Button, Select, Typography } from 'antd'
import { useStore } from '../../hooks/useStore.js'
import { EvmWalletStore } from '../../stores/EvmWalletStore.js'
import { sliceAddress } from '../../utils/slice-address.js'

import styles from './index.module.scss'
import { networks } from '../../../config.js'
import { GravixStore } from '../../stores/GravixStore.js'

export const EvmWallet: React.FC = observer(() => {
    const evmWallet = useStore(EvmWalletStore)
    const gravix = useStore(GravixStore)

    const onChainId = () => {
        evmWallet.changeNetwork(gravix.chainId).catch(console.error)
    }

    return (
        <div className={styles.connect}>
            {evmWallet.address && (
                <Select
                    className={styles.select}
                    value={gravix.chainId}
                    onChange={gravix.setChainId}
                    options={networks.map(item => ({
                        label: item.name,
                        value: item.chainId,
                    }))}
                />
            )}

            {evmWallet.address ? (
                evmWallet.chainId && evmWallet.chainId !== gravix.chainId ? (
                    <Button onClick={onChainId}>Change network</Button>
                ) : (
                    <Typography.Text>{sliceAddress(evmWallet.address)}</Typography.Text>
                )
            ) : (
                <Button onClick={evmWallet.connect}>Connect</Button>
            )}
        </div>
    )
})
