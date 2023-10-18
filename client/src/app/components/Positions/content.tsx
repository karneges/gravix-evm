import React, { useMemo } from 'react'

import styles from './index.module.scss'
import { useStore } from '../../hooks/useStore.js'
import { PositionsListStore, WithoutArr } from '../../stores/PositionsListStore.js'
import { observer } from 'mobx-react-lite'
import { Typography, Table } from 'antd'
import { formatDate } from '../../utils/format-date.js'
import { IGravix } from '../../../assets/misc/Gravix.js'
import { BigNumber } from 'bignumber.js'

const { Title } = Typography

export const PositionsContent: React.FC = observer(() => {
    const positionsList = useStore(PositionsListStore)

    const columns = useMemo(
        () => [
            {
                title: 'Created',
                dataIndex: '0',
                key: '0',
                render: (_: any, item: WithoutArr<IGravix.PositionStructOutput>) => (
                    <div className={styles.flexCol}>
                        {[1].map(() => {
                            console.log(item, 'test')
                            return 1
                        })}
                        <span>
                            {item.createdAt
                                ? formatDate(new BigNumber(item.createdAt.toString()).times(1000).toNumber(), 'HH:mm')
                                : null}
                        </span>
                        <span className={styles.date}>
                            {item.createdAt
                                ? formatDate(
                                      new BigNumber(item.createdAt.toString()).times(1000).toNumber(),
                                      'dd.LL.yyyy',
                                  )
                                : null}
                        </span>
                    </div>
                ),
            },
            {
                title: 'Type',
                dataIndex: 'positionType',
                key: 'positionType',
            },
        ],
        [],
    )

    return (
        <div className={styles.positions}>
            <Title level={3}>Positions</Title>
            <Table
                dataSource={positionsList.allUserPositions}
                columns={columns}
                loading={false}
                scroll={{ x: true }}
                rowKey={record => record.toString()}
            />
        </div>
    )
})
