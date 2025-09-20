import React from 'react';
import './GameStyles.css';

function VirtualKeyboard({ onKeyPress, guessTimeRemaining, maxGuessTime }) {
  // QWERTY layout in rows
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  // Calculate progress percentage for the timer
  const timerPercentage = (guessTimeRemaining / maxGuessTime) * 100;

  return (
    <div className="virtual-keyboard">
      <div className="keyboard-timer">
        <div 
          className="timer-progress"
          style={{ width: `${timerPercentage}%` }}
        ></div>
      </div>
      
      <div className="keyboard-container">
        {rows.map((row, rowIndex) => (
          <div 
            key={`row-${rowIndex}`} 
            className={`keyboard-row ${rowIndex === rows.length - 1 ? 'keyboard-row-last' : ''}`}
          >
            {row.map((key) => (
              <button
                key={key}
                className="keyboard-key clean-key"
                onClick={() => onKeyPress(key)}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VirtualKeyboard; 