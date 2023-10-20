import * as React from 'react'
import { Tabs, Card, Input, Typography, Button } from 'antd'

import styles from './index.module.scss'
import { useStore } from '../../hooks/useStore.js'
import { EarnAction, EarnStore } from '../../stores/EarnStore.js'
import { observer } from 'mobx-react-lite'
import { decimalAmount } from '../../utils/decimal-amount.js'
import { onChangeFn, onSubmitFn } from '../../utils/input.js'

export const EarnForm: React.FC = observer(() => {
    const form = useStore(EarnStore)

    const onChangeTab = (e: string) => {
        form.setAction(e as EarnAction)
    }
    debugger
    console.log(form.loading)
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

                <form onSubmit={onSubmitFn(form.submit)}>
                    <Input
                        className={styles.input}
                        value={form.amount}
                        onChange={onChangeFn(form.setAmount)}
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

                    <Button
                        htmlType="submit"
                        type="primary"
                        block
                        disabled={form.loading || !form.amountIsValid}
                        loading={form.loading}
                    >
                        {form.action === EarnAction.Deposit ? 'Deposit' : 'Withdraw'}
                    </Button>
                </form>
            </Card>
        </div>
    )
})
