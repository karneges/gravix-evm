import React from 'react'

import styles from './index.module.scss'
import { useStore } from '../../hooks/useStore.js'
import { PositionsListStore } from '../../stores/PositionsListStore.js'
import { observer } from 'mobx-react-lite'

export const PositionsContent: React.FC = observer(() => {
    const positionsList = useStore(PositionsListStore)

    return (
        <div className={styles.positions}>
            {positionsList.allUserPositions.map(_ => JSON.stringify(_))}
            <span>1</span>
        </div>
    )
})
