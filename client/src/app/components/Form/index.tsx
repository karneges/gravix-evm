import * as React from 'react'
import { BigNumber } from 'bignumber.js'

import styles from './index.module.scss'
import { observer } from 'mobx-react-lite'
import { useStore } from '../../hooks/useStore.js'
import { Tabs, Input, Typography, Col, Card, Slider, Button } from 'antd'
import { DepositStore, DepositType } from '../../stores/DepositStore.js'
import classNames from 'classnames'
import { PriceStore } from '../../stores/PriceStore.js'
import { decimalAmount } from '../../utils/decimal-amount.js'
import { onChangeFn, onSubmitFn } from '../../utils/input.js'

const { Title, Paragraph } = Typography

export const Form: React.FC = observer(() => {
    const deposit = useStore(DepositStore)
    const price = useStore(PriceStore)

    const items = [
        {
            key: DepositType.Long.toString(),
            label: 'Long',
        },
        {
            key: DepositType.Short.toString(),
            label: 'Short',
        },
    ]

    const onChangeTab = (tab: string) => {
        deposit.setType(tab as DepositType)
    }

    const onChangeSlider = (value: number | number[]) => {
        deposit.setLeverage(value.toString())
    }

    return (
        <Card type="inner" className={styles.form}>
            <form onSubmit={onSubmitFn(deposit.submit)} className={styles.inner}>
                <Tabs
                    className={classNames(
                        styles.tabs,
                        deposit.depositType === DepositType.Long ? styles.longTab : styles.shortTab,
                    )}
                    defaultActiveKey={deposit.depositType.toString()}
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
                    onChange={onChangeTab}
                />

                <Col>
                    <Title level={5}>Collateral</Title>
                    <Input
                        className={styles.bigInput}
                        addonAfter="USDT"
                        value={deposit.collateral}
                        onChange={onChangeFn(deposit.setCollateral)}
                        disabled={deposit.loading}
                    />
                    <Typography.Text className={styles.balance}>
                        Balance: {deposit.usdtBalance ? `${decimalAmount(deposit.usdtBalance, 6)} USDT` : ''}
                    </Typography.Text>
                </Col>

                <Col>
                    <Title level={5}>Position</Title>
                    <Input
                        className={styles.bigInput}
                        addonAfter="USDT"
                        value={deposit.position}
                        onChange={onChangeFn(deposit.setPosition)}
                        disabled={deposit.loading}
                    />
                </Col>

                <Col>
                    <div className={styles.leverage}>
                        <Title className={styles.title} level={5}>
                            Leverage
                        </Title>
                        <Input
                            prefix="x"
                            className={styles.smallInput}
                            value={deposit.leverage}
                            onChange={onChangeFn(deposit.setLeverage)}
                            disabled={deposit.loading}
                        />
                    </div>

                    <Slider
                        className={styles.slider}
                        min={1}
                        max={150}
                        onChange={onChangeSlider}
                        value={Number(deposit.leverage)}
                        disabled={deposit.loading}
                    />
                </Col>

                <Col className={styles.slippage}>
                    <Title level={5} className={styles.title}>
                        Slippage
                    </Title>
                    <Input
                        prefix="%"
                        className={styles.smallInput}
                        value={deposit.slippage}
                        onChange={onChangeFn(deposit.setSlippage)}
                        disabled={deposit.loading}
                    />
                </Col>

                <Col className={styles.price}>
                    <Title className={styles.title} level={5}>
                        Open Price
                    </Title>

                    <Paragraph className={styles.value}>
                        {price.price ? `$${new BigNumber(price.price).toFixed(2)}` : '\u200B'}
                    </Paragraph>
                </Col>
                <Button
                    htmlType="submit"
                    style={{ width: '100%' }}
                    type="primary"
                    size="large"
                    disabled={deposit.loading || !deposit.amountIsValid}
                    loading={deposit.loading}
                >
                    {deposit.depositType === DepositType.Long ? 'Long' : 'Short'}
                </Button>
            </form>
        </Card>
    )
})
