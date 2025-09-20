import React from 'react';
import '../GameStyles.css';

/**
 * Displays completion statistics with achievements
 * 
 * @param {Object} props Component props
 * @param {number} props.time Time taken to complete the puzzle in centiseconds
 * @param {number} props.guesses Number of guesses made
 * @param {Object} props.achievements Achievement flags (hardMode, earlyCompletion, firstGuess)
 */
const CompletionStats = ({ time, guesses, achievements }) => {
  const { hardMode, earlyCompletion } = achievements || {};
  const formattedTime = (time / 100).toFixed(2); // Convert centiseconds to seconds with 2 decimal places
  
  return (
    <div className="completion-stats">
      <p className="stat-time">Time: {formattedTime}s</p>

      {guesses === 1 ? (
        <p className="stat-first-guess achievement">Got it in one ☝️</p>
      ) : (
        <p className="stat-guesses">Guesses: {guesses}</p>
      )}

      {earlyCompletion && (
        <p className="stat-early achievement">Fast Fingers! ⚡</p>
      )}

      {hardMode && (
        <p className="stat-hard achievement">Hard mode! 🏆</p>
      )}
    </div>
  );
};

export default CompletionStats; 