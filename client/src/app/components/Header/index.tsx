import { Typography , Layout, Button, Row } from 'antd'
import { observer } from 'mobx-react-lite'
import { generatePath } from 'react-router-dom'
import { IoMoonOutline, IoSunny } from "react-icons/io5/index.js";
import { useStore } from '../../hooks/useStore.js'
import { GravixStore } from '../../stores/GravixStore.js'

const headerStyle: React.CSSProperties = {
    width: '100%',
    padding: '0px 20px',
}

export const Header = observer(() => {
    const gravixStore = useStore(GravixStore)

    return (
        <Layout.Header style={headerStyle}>
            <Row style={{ height: '100%' }} justify="space-between" align="middle">
                <div style={{ cursor: 'pointer' }} onClick={() => generatePath('/')}>
                    <Typography.Text>
                        AztecGravix
                    </Typography.Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
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
