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

const headerStyle: React.CSSProperties = {
    width: '100%',
    padding: '0px 20px',
}

export const Header = observer(() => {
    const gravixStore = useStore(GravixStore)

    return (
        <Layout.Header style={headerStyle}>
            <Row style={{ height: '100%' }} justify="space-between" align="middle">
                <div className={styles.menu}>
                    <Typography.Text>Gravix</Typography.Text>
                    <NavLink to={generatePath(routes.main)}>Trade</NavLink>
                    <NavLink to={generatePath(routes.earn)}>Earn</NavLink>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <EvmWallet />

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
                        icon={gravixStore.isDarkMode ? <IoMoonOutline /> : <IoSunny />}
                    />
                </div>
            </Row>
        </Layout.Header>
    )
})
