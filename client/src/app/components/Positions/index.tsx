import React from 'react'

import { useProvider, useStore } from '../../hooks/useStore.js'
import { EvmWalletStore } from '../../stores/EvmWalletStore.js'
import { PositionsListStore } from '../../stores/PositionsListStore.js'
import { PositionsContent } from './content.js'
import { observer } from 'mobx-react-lite'
import { GravixStore } from '../../stores/GravixStore.js'

export const Positions: React.FC = observer(() => {
    const EvmWalletS = useStore(EvmWalletStore)
    const Gravix = useStore(GravixStore)
    const PositionsProvider = useProvider(PositionsListStore, EvmWalletS, Gravix)

    return (
        <PositionsProvider>
            <PositionsContent />
        </PositionsProvider>
    )
})
