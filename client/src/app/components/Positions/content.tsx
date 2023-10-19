import React, { useMemo } from 'react'

import styles from './index.module.scss'
import { useStore } from '../../hooks/useStore.js'
import { PositionsListStore } from '../../stores/PositionsListStore.js'
import { observer } from 'mobx-react-lite'
import { Typography, Table } from 'antd'
import { formatDate } from '../../utils/format-date.js'
import { BigNumber } from 'bignumber.js'
import { GravixStore } from '../../stores/GravixStore.js'
import { decimalAmount } from '../../utils/decimal-amount.js'
import { PositionItemClose } from './Close/index.js'
import { PositionItemType } from './PositionItemType/index.js'
import { NetValueInfoProvider } from './NetValueInfo/index.js'
import { TGravixPosition } from '../../../types.js'
import { mapIdxToTicker } from '../../utils/gravix.js'

const { Title } = Typography

export const PositionsContent: React.FC = observer(() => {
    const positionsList = useStore(PositionsListStore)
    const gravix = useStore(GravixStore)

    const columns = useMemo(
        () => [
            {
                title: 'Created',
                dataIndex: 'createdAt',
                key: 'createdAt',
                render: (_: any, item: TGravixPosition) => (
                    <div className={styles.flexCol}>
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
                title: 'Net value',
                dataIndex: '',
                key: 'netValue',
                render: (_: any, item: TGravixPosition) => {
                    return <NetValueInfoProvider index={item.index} />
                },
            },
            {
                title: 'Type',
                dataIndex: 'positionType',
                key: 'positionType',
                render: (_: any, item: TGravixPosition) => (
                    <>
                        {item.marketIdx !== undefined ? (
                            <PositionItemType
                                leverage={item.leverage.toString()}
                                symbol={mapIdxToTicker(item.marketIdx.toString())}
                                type={item.positionType.toString()}
                            />
                        ) : null}
                    </>
                ),
            },
            {
                title: 'Size',
                dataIndex: 'initialCollateral',
                key: 'initialCollateral',
                render: (_: any, item: TGravixPosition) => (
                    <span>{positionsList.countSize(item.initialCollateral.toString(), item.leverage.toString())}$</span>
                ),
            },
            {
                title: 'Collateral',
                dataIndex: 'initialCollateral',
                key: 'initialCollateral',
                render: (_: any, item: TGravixPosition) => (
                    <span>{decimalAmount(item.initialCollateral.toString(), gravix.baseNumber)}$</span>
                ),
            },
            {
                title: 'Market price',
                dataIndex: 'markPrice',
                key: 'markPrice',
                render: (_: any, item: TGravixPosition) => (
                    <span>{decimalAmount(item.markPrice.toString(), gravix.priceDecimals, 0)}$</span>
                ),
            },
            {
                title: 'Open price',
                dataIndex: 'openPrice',
                key: 'openPrice',
                render: (_: any, item: TGravixPosition) => (
                    <span>{decimalAmount(item.openPrice.toString(), gravix.priceDecimals, 0)}$</span>
                ),
            },
            {
                title: 'Liq. price',
                dataIndex: '',
                key: 'liquidation',
                render: (_: any, item: TGravixPosition) => (
                    <span>
                        {decimalAmount(
                            positionsList.positionsViewById[item.index]?.liquidationPrice?.toString() ?? '0',
                            gravix.priceDecimals,
                            0,
                        )}
                        $
                    </span>
                ),
            },
            {
                title: '',
                dataIndex: '',
                key: 'action',
                render: (_: any, item: TGravixPosition) => <PositionItemClose index={item.index} />,
            },
        ],
        [positionsList, gravix.baseNumber, gravix.priceDecimals],
    )

    return (
        <div className={styles.positions}>
            <Title level={3}>Positions</Title>
            <Table
                dataSource={positionsList.allUserPositions}
                columns={columns}
                loading={false}
                scroll={{ x: true }}
                rowKey={record => record.createdAt.toString()}
            />
        </div>
    )
})
