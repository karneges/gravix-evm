import './styles/main.scss'
import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { Root } from './components/Root/index.js'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
    <React.StrictMode>
        <Root />
    </React.StrictMode>,
)
