import React from 'react'

import { useProvider, useStore } from '../../hooks/useStore.js'
import { EvmWalletStore } from '../../stores/EvmWalletStore.js'
import { PositionsListStore } from '../../stores/PositionsListStore.js'
import { PositionsContent } from './content.js'
import { observer } from 'mobx-react-lite'

export const Positions: React.FC = observer(() => {
    const EvmWalletS = useStore(EvmWalletStore)
    const PositionsProvider = useProvider(PositionsListStore, EvmWalletS)

    return (
        <PositionsProvider>
            <PositionsContent />
        </PositionsProvider>
    )
})
