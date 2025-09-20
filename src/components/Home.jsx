import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../contexts/GameContext';
import { useMenuContext } from '../contexts/MenuContext';
import { useState, useEffect } from 'react';
import yellowJson from '../assets/items/yellow.json';
import greenJson from '../assets/items/green.json';
import blueJson from '../assets/items/blue.json';
import redJson from '../assets/items/red.json';
import CategoryCard from './game/CompletionUI/CategoryCard';
import { debugResetStats } from '../utils/dailyReset';
import WelcomePopup from './WelcomePopup';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const { state, dispatch, ActionTypes } = useGameContext();
  const { state: menuState } = useMenuContext();
  const { completedCategories, config } = state;

  // Check if we're in development mode (temporarily enabled for production testing)
  const isDevelopment = true; // import.meta.env.DEV;

  // Debug logging
  console.log('Environment check:', {
    DEV: import.meta.env.DEV,
    MODE: import.meta.env.MODE,
    PROD: import.meta.env.PROD,
    isDevelopment
  });
  const [categories] = useState([
    { color: 'yellow', name: yellowJson.categoryName },
    { color: 'green', name: greenJson.categoryName },
    { color: 'blue', name: blueJson.categoryName },
    { color: 'red', name: redJson.categoryName }
  ]);
  const [musicAssignments, setMusicAssignments] = useState({});
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  // Ensure music is preloaded and assigned to categories when the home screen loads
  useEffect(() => {
    // The music preloading happens in the MenuContext when it's initialized,
    // so we just need to extract the music assignments for display purposes
    setMusicAssignments(menuState.categoryMusic);

    // We can log the assignments to console for debugging
    if (menuState.categoryMusic && Object.values(menuState.categoryMusic).some(v => v)) {
      console.log('Music assignments for categories:', menuState.categoryMusic);
    }
  }, [menuState.categoryMusic]);

  // Check if welcome popup should be shown on first visit
  useEffect(() => {
    const welcomeShown = localStorage.getItem('reactDaily_welcomeShown');
    if (!welcomeShown) {
      setShowWelcomePopup(true);
    }

    // Listen for custom event to show welcome popup from menu
    const handleShowWelcomeEvent = () => {
      setShowWelcomePopup(true);
    };

    window.addEventListener('showWelcome', handleShowWelcomeEvent);

    return () => {
      window.removeEventListener('showWelcome', handleShowWelcomeEvent);
    };
  }, []);

  const handleCategoryClick = (category) => {
    // Don't navigate if the category is already completed
    if (completedCategories[category]?.completed) {
      console.log(`Category ${category} is already completed`);
      return;
    }

    dispatch({ type: ActionTypes.SET_CATEGORY, payload: category });
    navigate(`/game/${category}`);
  };

  const toggleDifficulty = () => {
    const newDifficulty = config.difficulty === 'easy' ? 'hard' : 'easy';
    dispatch({ type: ActionTypes.SET_DIFFICULTY, payload: newDifficulty });
  };

  const goToBuilder = () => {
    navigate('/builder');
  };

  const handleShowWelcome = () => {
    setShowWelcomePopup(true);
  };

  const handleCloseWelcome = () => {
    setShowWelcomePopup(false);
  };

  return (
    <div className="home">
      <h1>React Daily</h1>
      
      <div className="categories-grid">
        {categories.map(category => (
          <CategoryCard
            key={category.color}
            category={category}
            isCompleted={completedCategories[category.color]?.completed}
            stats={completedCategories[category.color]?.stats}
            achievements={completedCategories[category.color]?.achievements}
            onClick={() => handleCategoryClick(category.color)}
            music={musicAssignments[category.color]}
          />
        ))}
      </div>

      <div className="controls-container">
        <div className="difficulty-container">
          <div className="difficulty-header">
            <h3 className="difficulty-title">Difficulty Mode</h3>
            <div className="slider-container">
              <span 
                className="difficulty-label" 
                id="easyLabel"
                style={{ opacity: config.difficulty === 'easy' ? 1 : 0.5 }}
              >
                Easy
              </span>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={config.difficulty === 'hard'}
                  onChange={toggleDifficulty}
                />
                <span className="slider"></span>
              </label>
              <span 
                className="difficulty-label" 
                id="hardLabel"
                style={{ opacity: config.difficulty === 'hard' ? 1 : 0.5 }}
              >
                Hard
              </span>
            </div>
          </div>
        </div>
      </div>

      <button className="builder-button" onClick={goToBuilder}>
        Create and Share your own Drawings
      </button>

      {/* Debug reset button - only show in development */}
      {isDevelopment && (
        <button className="debug-reset-button" onClick={debugResetStats}>
          🔧 DEBUG: Reset All Stats
        </button>
      )}

      {/* Footer */}
      <footer className="app-footer">
        React Daily created by Nathan McGraw - Version {(() => {
          const now = new Date();
          const year = now.getFullYear().toString().slice(-2);
          const month = (now.getMonth() + 1).toString().padStart(2, '0');
          const day = now.getDate().toString().padStart(2, '0');
          const hours = now.getHours().toString().padStart(2, '0');
          const minutes = now.getMinutes().toString().padStart(2, '0');
          return `${year}${month}${day}-${hours}${minutes}`;
        })()}
      </footer>

      {/* Welcome Popup */}
      <WelcomePopup
        isVisible={showWelcomePopup}
        onClose={handleCloseWelcome}
      />
    </div>
  );
}

export default Home; 