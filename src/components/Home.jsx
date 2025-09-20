import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../contexts/GameContext';
import { useMenuContext } from '../contexts/MenuContext';
import { useState, useEffect } from 'react';
import yellowJson from '../assets/items/yellow.json';
import greenJson from '../assets/items/green.json';
import blueJson from '../assets/items/blue.json';
import redJson from '../assets/items/red.json';
import CategoryCard from './game/CompletionUI/CategoryCard';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const { state, dispatch, ActionTypes } = useGameContext();
  const { state: menuState } = useMenuContext();
  const { completedCategories, config } = state;
  const [categories] = useState([
    { color: 'yellow', name: yellowJson.categoryName },
    { color: 'green', name: greenJson.categoryName },
    { color: 'blue', name: blueJson.categoryName },
    { color: 'red', name: redJson.categoryName }
  ]);
  const [musicAssignments, setMusicAssignments] = useState({});

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
    </div>
  );
}

export default Home; 