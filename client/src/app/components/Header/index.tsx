import React from 'react'
import { Typography, Layout, Button, Row } from 'antd'
import { observer } from 'mobx-react-lite'
import { NavLink, generatePath } from 'react-router-dom'
import { IoMoonOutline, IoSunny } from 'react-icons/io5/index.js'
import { useStore } from '../../hooks/useStore.js'
import { GravixStore } from '../../stores/GravixStore.js'
import { EvmWallet } from '../EvmWallet/index.js'
import { routes } from '../../routes/index.js'
import styles from './index.module.scss'
import { useAccountAbstraction } from '../../stores/accountAbstractionContext.js'

const headerStyle: React.CSSProperties = {
    width: '100%',
    padding: '0px 20px',
}

export const Header = observer(() => {
    const gravixStore = useStore(GravixStore)
    const {
        loginWeb3Auth,
        chainId,
        isAuthenticated,
        chain,
        logoutWeb3Auth,
        safeSelected,
        setSafeSelected,
        safes,
        setChainId,
        safeBalance,
        isRelayerLoading,
        relayTransaction,
        ownerAddress,
        gelatoTaskId,
    } = useAccountAbstraction()
    debugger
    return (
        <Layout.Header style={headerStyle}>
            <Row style={{ height: '100%' }} justify="space-between" align="middle">
                <div className={styles.menu}>
                    <Typography.Text>Gravix</Typography.Text>
                    <NavLink to={generatePath(routes.main)}>Trade</NavLink>
                    <NavLink to={generatePath(routes.earn)}>Earn</NavLink>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {chainId === '0x13881' && !isAuthenticated ? (
                        <Button onClick={loginWeb3Auth}>Connect AO</Button>
                    ) : (
                        <div>safeSelected {safes}</div>
                    )}
                    <EvmWallet />

                    {gravixStore.isDarkMode ? (
                        <Button
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginLeft: '20px',
                            }}
                            onClick={() => gravixStore.toggleTheme()}
                            type="primary"
                            shape="circle"
                            icon={<IoMoonOutline />}
                        />
                    ) : (
                        <Button
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginLeft: '20px',
                            }}
                            onClick={() => gravixStore.toggleTheme()}
                            type="primary"
                            shape="circle"
                            icon={<IoSunny />}
                        />
                    )}
                </div>
            </Row>
        </Layout.Header>
    )
})
