import React from 'react'
import { BigNumber } from 'bignumber.js'

import styles from './index.module.scss'
import { observer } from 'mobx-react-lite'
import { useStore } from '../../hooks/useStore.js'
import { Tabs, InputNumber, Typography, Col, Card, Slider, Row, Button } from 'antd'
import { FormStore, DepositType } from '../../stores/FormStore.js'
import classNames from 'classnames'
import { PriceStore } from '../../stores/PriceStore.js'

const { Title, Paragraph } = Typography

export const Form: React.FC = observer(() => {
    const formStore = useStore(FormStore)
    const price = useStore(PriceStore)

    const items = [
        {
            key: DepositType.LONG.toString(),
            label: 'Long',
        },
        {
            key: DepositType.SHORT.toString(),
            label: 'Short',
        },
    ]

    return (
        <Card type="inner" className={styles.form}>
            <Tabs
                className={formStore.formDepositType === DepositType.LONG ? styles.longTab : styles.shortTab}
                defaultActiveKey={formStore.formDepositType.toString()}
                items={items.map(item => {
                    return {
                        label: (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ marginRight: '4px' }}>{item?.label}</span>
                            </div>
                        ),
                        key: item.key,
                    }
                })}
                onChange={val => formStore.onTabChange(val)}
            />
            <Col className={styles.collateral}>
                <Title level={4}>Collateral</Title>
                <InputNumber
                    className={styles.bigInput}
                    addonAfter="$"
                    defaultValue={formStore.collateralVal}
                    value={formStore.collateralVal}
                    onChange={formStore.onCollateralChange}
                />
            </Col>
            <Col className={styles.block}>
                <Title level={4}>Leverage</Title>
                <Row justify="space-between" align="middle">
                    <Col span={12}>
                        <Slider min={1} max={150} onChange={formStore.onLeverageChange} value={formStore.leverageVal} />
                    </Col>
                    <Col>
                        <InputNumber
                            className={styles.leverInput}
                            min={1}
                            max={150}
                            value={formStore.leverageVal}
                            onChange={formStore.onLeverageChange}
                        />
                    </Col>
                </Row>
            </Col>
            <Col className={styles.block}>
                <Title level={4}>Size</Title>
                <InputNumber
                    className={classNames(styles.bigInput, styles.disabledInput)}
                    addonAfter="$"
                    disabled
                    defaultValue={formStore.positionSizeVal}
                    value={formStore.positionSizeVal}
                />
            </Col>
            <Col className={styles.block}>
                <Title level={4}>Price</Title>
                <Paragraph className={styles.price}>
                    {price.price ? (
                        `${new BigNumber(price.price).toFixed(2)} $`
                    ) : '\u200B'}
                </Paragraph>
            </Col>
            <Button style={{ width: '100%' }} type="primary" size="large" onClick={() => console.log('submit')}>
                {formStore.formDepositType === DepositType.LONG ? 'Long' : 'Short'}
            </Button>
        </Card>
    )
})
