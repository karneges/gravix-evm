import * as React from "react";
import { observer } from 'mobx-react-lite'
import { Button, Typography } from 'antd'
import { useStore } from "../../hooks/useStore.js";
import { EvmWalletStore } from "../../stores/EvmWalletStore.js";

export const EvmWallet: React.FC =  observer(() => {
    const evmWallet = useStore(EvmWalletStore)

    return evmWallet.address ? (
        <Typography.Text>
            {evmWallet.address}
        </Typography.Text>
    ) : (
        <Button onClick={evmWallet.connect}>
            Connect
        </Button>
    )
})
