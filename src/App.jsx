import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Game from './components/game/Game'
import Builder from './components/builder/Builder'
import AIBuilderAssistant from './components/AIBuilderAssistant/AIBuilderAssistant'
import RotationOverlay from './components/RotationOverlay'
import OrientationHandler from './components/OrientationHandler'
import HamburgerMenu from './components/HamburgerMenu'
import ThemeTest from './components/ThemeTest'
import { MenuProvider } from './contexts/MenuContext'
import './App.css'

function App() {
  return (
    <MenuProvider>
      <Router>
        {/* Handle orientation classes */}
        <OrientationHandler />
        
        {/* Show rotation overlay when in landscape mode on mobile */}
        <RotationOverlay />
        
        {/* Global hamburger menu */}
        <HamburgerMenu />
        
        <div className="app-container">

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game/:category" element={<Game />} />
            <Route path="/builder" element={<Builder />} />
            <Route path="/ai-builder" element={<AIBuilderAssistant />} />
            <Route path="/theme-test" element={<ThemeTest />} />
          </Routes>
        </div>
      </Router>
    </MenuProvider>
  )
}

export default App
