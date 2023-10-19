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
import { onSubmitFn } from '../../utils/input.js'
import { MarketStore } from '../../stores/MarketStore.js'
import { decimalPercent } from '../../utils/gravix.js'
import { GravixStore } from '../../stores/GravixStore.js'
import { useAmountField } from '../../hooks/useAmountField.js'

const { Title, Paragraph } = Typography

export const Form: React.FC = observer(() => {
    const deposit = useStore(DepositStore)
    const price = useStore(PriceStore)
    const market = useStore(MarketStore)
    const gravix = useStore(GravixStore)

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

    const leverageField = useAmountField({
        decimals: 2,
        defaultValue: '1',
        max: market.maxLeverage,
        min: '1',
        onBlur: value => {
            if (value !== deposit.leverage) {
                deposit.setLeverage(value)
            }
        },
        onChange: deposit.setLeverage,
    })

    const collateralField = useAmountField({
        decimals: 6,
        onBlur: value => {
            if (value !== deposit.collateral) {
                deposit.setCollateral(value)
            }
        },
        onChange: deposit.setCollateral,
    })

    const positionField = useAmountField({
        decimals: 6,
        onBlur: value => {
            if (value !== deposit.position) {
                deposit.setPosition(value)
            }
        },
        onChange: deposit.setPosition,
    })

    const slippageField = useAmountField({
        decimals: 4,
        defaultValue: '1',
        onBlur: deposit.setSlippage,
        onChange: deposit.setSlippage,
    })

    return (
        <div className={styles.form}>
            <Card type="inner">
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
                                        <span style={{ marginRight: '4px' }}>{item?.label.toUpperCase()}</span>
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
                            onChange={collateralField.onChange}
                            onBlur={collateralField.onBlur}
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
                            onChange={positionField.onChange}
                            onBlur={positionField.onBlur}
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
                                onChange={leverageField.onChange}
                                onBlur={leverageField.onBlur}
                                disabled={deposit.loading}
                            />
                        </div>

                        <Slider
                            className={styles.slider}
                            min={1}
                            max={market.maxLeverage ? parseFloat(market.maxLeverage) : undefined}
                            onChange={onChangeSlider}
                            value={Number(deposit.leverage)}
                            disabled={deposit.loading || !market.maxLeverage}
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
                            onChange={slippageField.onChange}
                            onBlur={slippageField.onBlur}
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

                    {deposit.isSpreadValid === false ? (
                        <Typography.Text type="danger">Spread too high</Typography.Text>
                    ) : deposit.isValid === false && gravix.minPositionCollateral ? (
                        <Typography.Text type="danger">
                            Min position — {decimalAmount(gravix.minPositionCollateral, 6)}$
                        </Typography.Text>
                    ) : null}

                    <Button
                        htmlType="submit"
                        style={{ width: '100%' }}
                        type="primary"
                        size="large"
                        disabled={deposit.loading || !deposit.isEnabled}
                        loading={deposit.loading}
                    >
                        {deposit.depositType === DepositType.Long ? 'Long' : 'Short'}
                    </Button>
                </form>
            </Card>

            <div className={styles.stats}>
                <div className={styles.row}>
                    <Typography.Text>Position size</Typography.Text>
                    <Typography.Text>{deposit.position ? `$${deposit.position}` : ''}</Typography.Text>
                </div>
                <div className={styles.row}>
                    <Typography.Text>Fees</Typography.Text>
                    <Typography.Text>{deposit.openFee ? `$${deposit.openFee}` : ''}</Typography.Text>
                </div>
                <div className={styles.row}>
                    <Typography.Text>Liq. price</Typography.Text>
                    <Typography.Text>
                        {deposit.liquidationPrice ? `$${new BigNumber(deposit.liquidationPrice).toFixed(2)}` : ''}
                    </Typography.Text>
                </div>
                <div className={styles.row}>
                    <Typography.Text>Borrow fee</Typography.Text>
                    <Typography.Text>
                        {market.borrowBaseRatePerHour ? `${market.borrowBaseRatePerHour}%/h` : ''}
                    </Typography.Text>
                </div>
                <div className={styles.row}>
                    <Typography.Text>Max pnl</Typography.Text>
                    <Typography.Text>
                        {gravix.maxPnlRate ? `${decimalPercent(gravix.maxPnlRate)}%` : ''}
                    </Typography.Text>
                </div>
            </div>
        </div>
    )
})
