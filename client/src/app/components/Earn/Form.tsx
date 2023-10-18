import React from 'react'
import { Tabs, Card, Input, Typography, Button } from 'antd'

import styles from './index.module.scss'
import { useStore } from '../../hooks/useStore.js'
import { EarnAction, EarnStore } from '../../stores/EarnStore.js'
import { observer } from 'mobx-react-lite'
import { decimalAmount } from '../../utils/decimal-amount.js'

export const EarnForm: React.FC = observer(() => {
    const form = useStore(EarnStore)

    const onChangeAmount: React.ChangeEventHandler<HTMLInputElement> = e => {
        form.setAmount(e.currentTarget.value)
    }

    const onChangeTab = (e: string) => {
        form.setAction(e as EarnAction)
    }

    const onSubmit: React.FormEventHandler<HTMLFormElement> = e => {
        e.preventDefault()
        form.submit()
    }

    return (
        <div className={styles.earn}>
            <Card className={styles.form}>
                Pool balance: {form.poolBalance ? `$${decimalAmount(form.poolBalance, 6)}` : ''}
            </Card>

            <Card className={styles.form} bodyStyle={{ paddingTop: 0 }}>
                <Tabs
                    activeKey={form.action}
                    onChange={onChangeTab}
                    items={[
                        {
                            label: 'Deposit',
                            key: EarnAction.Deposit,
                        },
                        {
                            label: 'Withdraw',
                            key: EarnAction.Withdraw,
                        },
                    ]}
                />

                <form onSubmit={onSubmit}>
                    <Input
                        className={styles.input}
                        value={form.amount}
                        onChange={onChangeAmount}
                        disabled={form.loading}
                    />

                    <div className={styles.info}>
                        {form.action === EarnAction.Deposit ? (
                            <Typography.Text>
                                Balance: {form.usdtBalance ? `${decimalAmount(form.usdtBalance, 6)} USDT` : ''}
                            </Typography.Text>
                        ) : form.action === EarnAction.Withdraw ? (
                            <Typography.Text>
                                Balance: {form.stgUsdtBalance ? `${decimalAmount(form.stgUsdtBalance, 6)} stgUSDT` : ''}
                            </Typography.Text>
                        ) : null}
                    </div>

                    <Button htmlType="submit" type="primary" block disabled={form.loading || !form.amountIsValid}>
                        {form.action === EarnAction.Deposit ? 'Deposit' : 'Withdraw'}
                    </Button>
                </form>
            </Card>
        </div>
    )
})
