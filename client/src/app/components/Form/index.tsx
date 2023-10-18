import * as React from 'react'
import { BigNumber } from 'bignumber.js'

import styles from './index.module.scss'
import { observer } from 'mobx-react-lite'
import { useStore } from '../../hooks/useStore.js'
import { Tabs, InputNumber, Input, Typography, Col, Card, Slider, Row, Button } from 'antd'
import { DepositStore, DepositType } from '../../stores/DepositStore.js'
import classNames from 'classnames'
import { PriceStore } from '../../stores/PriceStore.js'
import { decimalAmount } from '../../utils/decimal-amount.js'
import { onChangeFn } from '../../utils/input.js'

const { Title, Paragraph } = Typography

export const Form: React.FC = observer(() => {
    const deposit = useStore(DepositStore)
    const price = useStore(PriceStore)

    console.log(deposit.amountIsValid)

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
                className={deposit.formDepositType === DepositType.LONG ? styles.longTab : styles.shortTab}
                defaultActiveKey={deposit.formDepositType.toString()}
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
                onChange={val => deposit.onTabChange(val)}
            />
            <Col className={styles.collateral}>
                <Title level={4}>Collateral</Title>
                <Input
                    className={classNames(styles.bigInput, styles.amount)}
                    addonAfter="$"
                    defaultValue={deposit.collateralVal}
                    value={deposit.collateralVal}
                    onChange={onChangeFn(deposit.onCollateralChange)}
                />
                <Typography.Text>
                    Balance: {deposit.usdtBalance ? `${decimalAmount(deposit.usdtBalance, 6)} USDT` : ''}
                </Typography.Text>
            </Col>
            <Col className={styles.block}>
                <Title level={4}>Leverage</Title>
                <Row justify="space-between" align="middle">
                    <Col span={12}>
                        <Slider min={1} max={150} onChange={deposit.onLeverageChange} value={deposit.leverageVal} />
                    </Col>
                    <Col>
                        <InputNumber
                            className={styles.leverInput}
                            min={1}
                            max={150}
                            value={deposit.leverageVal}
                            onChange={deposit.onLeverageChange}
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
                    defaultValue={deposit.positionSizeVal}
                    value={deposit.positionSizeVal}
                />
            </Col>
            <Col className={styles.block}>
                <Title level={4}>Price</Title>
                <Paragraph className={styles.price}>
                    {price.price ? `${new BigNumber(price.price).toFixed(2)} $` : '\u200B'}
                </Paragraph>
            </Col>
            <Button
                style={{ width: '100%' }}
                type="primary"
                size="large"
                onClick={deposit.submitMarketOrder}
                disabled={deposit.loading || !deposit.amountIsValid}
            >
                {deposit.formDepositType === DepositType.LONG ? 'Long' : 'Short'}
            </Button>
        </Card>
    )
})
