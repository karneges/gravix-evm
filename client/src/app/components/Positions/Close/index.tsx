import * as React from 'react'
import { observer } from 'mobx-react-lite'

import styles from './index.module.scss'
import { Button, Spin } from 'antd'
import { useStore } from '../../../hooks/useStore.js'
import { PositionsListStore } from '../../../stores/PositionsListStore.js'
import { IoClose } from 'react-icons/io5/index.js'

function PositionItemCloseInner(): JSX.Element {
    const positionClose = useStore(PositionsListStore)
    const [isLoading, setLoading] = React.useState(false)

    const handleClose = async () => {
        if (isLoading) return
        setLoading(true)
        await positionClose.closePos()
        // setLoading(false)
    }

    return (
        <>
            <Button className={styles.btn} onClick={handleClose}>
                {isLoading && <Spin size="small" className={styles.closeWrap} />}
                {!isLoading && <IoClose />}
            </Button>
        </>
    )
}

export const PositionItemClose = observer(PositionItemCloseInner)
