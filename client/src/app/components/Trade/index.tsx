import * as React from 'react'
import { Chart } from '../Chart/index.js'
import { Form } from '../Form/index.js'
import { Info } from '../Info/index.js'
import { Positions } from '../Positions/index.js'
import styles from './index.module.scss'
import { observer } from 'mobx-react-lite'

export const Trade: React.FC = observer(() => {
    return (
        <div className={styles.layout}>
            <Info />
            <Chart />
            <Form />
            <Positions />
        </div>
    )
})
