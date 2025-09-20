import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/ThemeTest.css';

function ThemeTest() {
  const [theme, setTheme] = useState('modern');
  const [difficulty, setDifficulty] = useState('easy');
  
  // Categories data
  const categories = [
    { id: 'food', label: 'Food', color: 'food' },
    { id: 'travel', label: 'Travel', color: 'travel' },
    { id: 'emoji', label: 'Emoji', color: 'emoji' },
    { id: 'manmade', label: 'Man-Made', color: 'manmade' }
  ];
  
  // Toggle between modern and 8-bit themes
  const toggleTheme = () => {
    const newTheme = theme === 'modern' ? '8bit' : 'modern';
    setTheme(newTheme);
  };
  
  // Toggle difficulty
  const toggleDifficulty = () => {
    setDifficulty(difficulty === 'easy' ? 'hard' : 'easy');
  };
  
  // Apply theme attribute to body element
  useEffect(() => {
    document.body.setAttribute('data-test-theme', theme);
    return () => {
      document.body.removeAttribute('data-test-theme');
    };
  }, [theme]);
  
  return (
    <div className="theme-test-container">
      <div className="menu-icon">≡</div>
      <h1>Daily Anticipation</h1>
      
      {/* Theme toggle for easy comparison */}
      <div className="theme-toggle">
        <span>Theme:</span>
        <button 
          className={`theme-button ${theme === 'modern' ? 'active' : ''}`}
          onClick={() => setTheme('modern')}
        >
          Modern
        </button>
        <button 
          className={`theme-button ${theme === '8bit' ? 'active' : ''}`}
          onClick={() => setTheme('8bit')}
        >
          8-Bit
        </button>
      </div>
      
      <div className="grid">
        {categories.map(category => (
          <div 
            key={category.id}
            className={`box ${category.color}`}
          >
            {category.label}
          </div>
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
                style={{ opacity: difficulty === 'easy' ? 1 : 0.5 }}
              >
                Easy
              </span>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={difficulty === 'hard'}
                  onChange={toggleDifficulty}
                />
                <span className="slider"></span>
              </label>
              <span 
                className="difficulty-label" 
                id="hardLabel"
                style={{ opacity: difficulty === 'hard' ? 1 : 0.5 }}
              >
                Hard
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <a className="share-button" href="#">
        Create and Share your own Drawings
      </a>
      
      <div className="back-link">
        <Link to="/">Back to Home</Link>
      </div>
    </div>
  );
}

export default ThemeTest; 