import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GameProvider } from './contexts/GameContext.jsx'

// Import component styles
import './components/game/GameStyles.css'
import './components/builder/BuilderStyles.css'

// Preload theme CSS
import './styles/themes/themeBase.css'
import './styles/themes/modern.css'
import './styles/themes/8bit.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </React.StrictMode>,
)
