import React from 'react'

import { useProvider, useStore } from '../../hooks/useStore.js'
import { EvmWalletStore } from '../../stores/EvmWalletStore.js'
import { PositionsListStore } from '../../stores/PositionsListStore.js'
import { PositionsContent } from './content.js'
import { observer } from 'mobx-react-lite'
import { GravixStore } from '../../stores/GravixStore.js'
import { BalanceStore } from '../../stores/BalanceStore.js'
import { MarketStore } from '../../stores/MarketStore.js'

export const Positions: React.FC = observer(() => {
    const EvmWalletS = useStore(EvmWalletStore)
    const Gravix = useStore(GravixStore)
    const balance = useStore(BalanceStore)
    const market = useStore(MarketStore)
    const PositionsProvider = useProvider(PositionsListStore, EvmWalletS, Gravix, balance, market)

    return (
        <PositionsProvider>
            <PositionsContent />
        </PositionsProvider>
    )
})
