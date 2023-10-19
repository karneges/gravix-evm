import React from 'react'

import { useProvider, useStore } from '../../hooks/useStore.js'
import { EvmWalletStore } from '../../stores/EvmWalletStore.js'
import { PositionsListStore } from '../../stores/PositionsListStore.js'
import { PositionsContent } from './content.js'
import { observer } from 'mobx-react-lite'
import { GravixStore } from '../../stores/GravixStore.js'
import { BalanceStore } from '../../stores/BalanceStore.js'

export const Positions: React.FC = observer(() => {
    const EvmWalletS = useStore(EvmWalletStore)
    const Gravix = useStore(GravixStore)
    const balance = useStore(BalanceStore)
    const PositionsProvider = useProvider(PositionsListStore, EvmWalletS, Gravix, balance)

    return (
        <PositionsProvider>
            <PositionsContent />
        </PositionsProvider>
    )
})
