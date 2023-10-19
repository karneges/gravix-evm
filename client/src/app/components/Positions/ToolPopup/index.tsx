import * as React from 'react'

import styles from './index.module.scss'

export function ToolPopup({ children, ...props }: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
    return (
        <div className={styles.toolPopup} {...props}>
            {children}
        </div>
    )
}
