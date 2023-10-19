import * as React from 'react'
import { Popover, PopoverProps } from 'react-tiny-popover'

import { ToolPopup } from '../ToolPopup/index.js'

import styles from './index.module.scss'

type Props = {
    positions?: PopoverProps['positions']
    align?: PopoverProps['align']
    content?: React.ReactNode
    children?: React.ReactNode | ((show: () => void, hide: () => void) => JSX.Element)
}

export function Tooltip({ positions = ['bottom', 'top'], align = 'start', content, children }: Props): JSX.Element {
    const hideTimeoutRef = React.useRef<NodeJS.Timeout>()
    const [active, setActive] = React.useState(false)

    const show = () => {
        clearTimeout(hideTimeoutRef.current)
        setActive(true)
    }

    const hide = () => {
        hideTimeoutRef.current = setTimeout(() => {
            setActive(false)
        }, 100)
    }

    return (
        <Popover
            isOpen={active}
            align={align}
            positions={positions}
            padding={4}
            containerStyle={{
                zIndex: '9999',
            }}
            content={
                <ToolPopup onMouseEnter={show} onMouseLeave={hide}>
                    {content}
                </ToolPopup>
            }
        >
            {typeof children === 'function' ? (
                children(show, hide)
            ) : (
                <span onMouseEnter={show} onMouseLeave={hide} className={styles.toggler}>
                    {children}
                </span>
            )}
        </Popover>
    )
}
