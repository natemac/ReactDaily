import React from 'react';
import '../GameStyles.css';

/**
 * Displays a "COMPLETED" stamp with color matching the category
 * 
 * @param {Object} props Component props
 * @param {boolean} props.isHardMode Whether the puzzle was completed in hard mode
 * @param {boolean} props.isEarlyCompletion Whether the puzzle was completed before drawing finished
 * @param {string} props.categoryColor The color of the category (yellow, green, blue, red)
 */
const CompletionStamp = ({ isHardMode, categoryColor = 'red' }) => {
  return (
    <div className={`completion-stamp completion-stamp-${categoryColor}`}>
      <div className="stamp-text">
        COMPLETED
        {isHardMode && (
          <span className="hard-badge">
            HARD
          </span>
        )}
      </div>
    </div>
  );
};

export default CompletionStamp; 