import React from 'react';
import CompletionStamp from './CompletionStamp';
import CompletionStats from './CompletionStats';
import { CONFIG } from '../../../utils/config';
import '../GameStyles.css';

/**
 * Category card component for displaying a game category with completion status
 * 
 * @param {Object} props Component props
 * @param {Object} props.category Category data with name and color
 * @param {boolean} props.isCompleted Whether the category is completed
 * @param {Object} props.stats Statistics for completed categories (time, guesses)
 * @param {Object} props.achievements Achievement data for the category
 * @param {Function} props.onClick Click handler for the category
 * @param {string} props.music Optional path to the music file assigned to this category
 * @param {number} props.progress Optional completion progress (0-100)
 */
const CategoryCard = ({ 
  category, 
  isCompleted, 
  stats, 
  achievements, 
  onClick, 
  music,
  progress = 0 
}) => {
  // Extract song number from path if available
  const getSongNumber = (path) => {
    if (!path) return null;
    const match = path.match(/song_(\d+)\.mp3$/);
    return match ? match[1] : null;
  };

  const songNumber = getSongNumber(music);

  return (
    <div 
      className={`category-card ${category.color} ${isCompleted ? 'completed' : ''}`}
      onClick={isCompleted ? undefined : onClick}
      style={isCompleted ? { cursor: 'default' } : undefined}
      aria-disabled={isCompleted}
    >
      <h3 className="category-title">{category.name}</h3>
      
      {CONFIG.SHOW_SONG_INFO && songNumber && (
        <div className="category-music-label">
          Song #{songNumber}
        </div>
      )}

      {!isCompleted && progress > 0 && (
        <div className="category-progress-container">
          <div 
            className="category-progress-bar"
            style={{ width: `${progress}%` }}
          />
          <span className="category-progress-text">{progress}%</span>
        </div>
      )}

      {isCompleted && (
        <div className="completion-overlay">
          <CompletionStamp
            isHardMode={achievements?.hardMode}
            isEarlyCompletion={achievements?.earlyCompletion}
            categoryColor={category.color}
          />
          <CompletionStats
            time={stats?.time || 0}
            guesses={stats?.guesses || 0}
            achievements={achievements || {}}
          />
        </div>
      )}
    </div>
  );
};

export default CategoryCard; 