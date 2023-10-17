import React from 'react'
import { Tabs, Card, Input, Typography, Button } from 'antd'

import styles from './index.module.scss'
import { useStore } from '../../hooks/useStore.js'
import { EarnAction, EarnStore } from '../../stores/EarnStore.js'
import { observer } from 'mobx-react-lite'

export const EarnForm: React.FC = observer(() => {
    const form = useStore(EarnStore)

    const onChangeAmount: React.ChangeEventHandler<HTMLInputElement> = e => {
        form.setAmount(e.currentTarget.value)
    }

    const onChangeTab = (e: string) => {
        console.log(e)
        form.setAction(e as EarnAction)
    }

    return (
        <div className={styles.earn}>
            <Card className={styles.form}>
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

                <form>
                    <Input className={styles.input} value={form.amount} onChange={onChangeAmount} />

                    <div className={styles.info}>
                        {form.action === EarnAction.Deposit ? (
                            <Typography.Text>
                                Balance: {form.usdtBalance ? `${form.usdtBalance} USDT` : ''}
                            </Typography.Text>
                        ) : form.action === EarnAction.Withdraw ? (
                            <Typography.Text>
                                Balance: {form.stgUsdtBalance ? `${form.stgUsdtBalance} stgUSDT` : ''}
                            </Typography.Text>
                        ) : null}
                    </div>

                    <Button type="primary" block>
                        Deposit
                    </Button>
                </form>
            </Card>
        </div>
    )
})
