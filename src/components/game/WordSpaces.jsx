import React, { useEffect, useRef, useState } from 'react';

function WordSpaces({ word = '', revealedLetters = [], activeIndex = -1, hideSpaces = false }) {
  const containerRef = useRef(null);
  const [letterWidth, setLetterWidth] = useState(30); // Default letter width
  const [spaceWidth, setSpaceWidth] = useState(15); // Default space width
  const [isMobile, setIsMobile] = useState(false);
  
  // If no word is provided, render an empty container
  if (!word) {
    return <div className="word-spaces empty-word-spaces"></div>;
  }
  
  // If hideSpaces is true (hard mode), only show revealed letters
  if (hideSpaces) {
    const nonSpaceChars = word.split('').filter(char => char !== ' ');
    const revealedChars = revealedLetters.map(index => nonSpaceChars[index] || '');
    
    // Map between non-space indices and original word indices
    const nonSpaceToOriginalMap = [];
    word.split('').forEach((char, index) => {
      if (char !== ' ') {
        nonSpaceToOriginalMap.push(index);
      }
    });
    
    if (revealedChars.length === 0) {
      return <div className="word-spaces hard-mode"></div>;
    }
    
    // Format revealed characters with spaces
    const formattedRevealed = [];
    let currentWordChars = [];
    
    // Reconstruct the revealed text with proper spaces
    word.split('').forEach((char, originalIndex) => {
      // If this is a space character
      if (char === ' ') {
        // If we have characters in the current word, add them
        if (currentWordChars.length > 0) {
          formattedRevealed.push(
            <span key={`word-${formattedRevealed.length}`} className="revealed-word">
              {currentWordChars}
            </span>
          );
          currentWordChars = [];
        }
        // Add a space
        formattedRevealed.push(
          <span key={`space-${originalIndex}`} className="revealed-space">&nbsp;</span>
        );
      } else {
        // Find the non-space index for this character
        const nonSpaceIndex = nonSpaceToOriginalMap.indexOf(originalIndex);
        
        // Only include this character if it's been revealed
        if (revealedLetters.includes(nonSpaceIndex)) {
          currentWordChars.push(
            <span key={`char-${originalIndex}`} className="revealed-letter">{char}</span>
          );
        }
      }
    });
    
    // Add any remaining characters
    if (currentWordChars.length > 0) {
      formattedRevealed.push(
        <span key={`word-${formattedRevealed.length}`} className="revealed-word">
          {currentWordChars}
        </span>
      );
    }
    
    return (
      <div className="word-spaces hard-mode">
        <div className="revealed-letters-container">
          {formattedRevealed}
        </div>
      </div>
    );
  }
  
  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 480);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // Calculate sizing factors when word changes or on resize
  useEffect(() => {
    const calculateSize = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const containerWidth = container.parentElement.clientWidth - 30; // Account for padding
      
      // Count characters
      const nonSpaceCount = word.split('').filter(char => char !== ' ').length;
      const spaceCount = word.split(' ').length - 1;
      
      // Use different sizes for mobile/desktop
      const defaultLetterWidth = isMobile ? 26 : 30;
      const defaultSpaceWidth = isMobile ? 10 : 15;
      const defaultGap = isMobile ? 3 : 5;
      const minLetterWidth = isMobile ? 16 : 20;
      const minSpaceWidth = isMobile ? 6 : 8;
      
      // Calculate default sizes with margins
      const defaultLetterTotal = nonSpaceCount * (defaultLetterWidth + 4); // width + margins
      const defaultSpaceTotal = spaceCount * (defaultSpaceWidth + 4); // width + margins
      const defaultGapTotal = defaultGap * (nonSpaceCount - 1 + spaceCount); // gaps
      
      const totalDefaultWidth = defaultLetterTotal + defaultSpaceTotal + defaultGapTotal;
      
      // If word fits with default sizes, use them
      if (totalDefaultWidth <= containerWidth) {
        setLetterWidth(defaultLetterWidth);
        setSpaceWidth(defaultSpaceWidth);
        return;
      }
      
      // Otherwise, calculate new dimensions to fit
      // Start by trying to maintain aspect ratio
      const ratio = containerWidth / totalDefaultWidth;
      const newLetterWidth = Math.max(Math.floor(defaultLetterWidth * ratio), minLetterWidth);
      const newSpaceWidth = Math.max(Math.floor(defaultSpaceWidth * ratio), minSpaceWidth);
      
      setLetterWidth(newLetterWidth);
      setSpaceWidth(newSpaceWidth);
    };
    
    calculateSize();
    window.addEventListener('resize', calculateSize);
    
    return () => {
      window.removeEventListener('resize', calculateSize);
    };
  }, [word, isMobile]);
  
  // Convert word to array of characters and track non-space characters
  const characters = word.split('');
  const nonSpaceIndices = characters.map((char, index) => 
    char !== ' ' ? index : null).filter(index => index !== null);
  
  // Define gap size depending on device
  const gapSize = isMobile ? 3 : 5;
    
  return (
    <div 
      ref={containerRef} 
      className="word-spaces"
      style={{ gap: `${gapSize}px` }}
    >
      {characters.map((char, index) => {
        // Skip rendering spaces
        if (char === ' ') {
          return (
            <div 
              key={index} 
              className="space-separator"
              style={{ width: `${spaceWidth}px` }}
            ></div>
          );
        }
        
        // Find position in non-space letters for revealing
        const nonSpaceIndex = nonSpaceIndices.indexOf(index);
        
        let letterClass = "letter-space";
        
        // Add filled class if letter is revealed
        if (revealedLetters.includes(nonSpaceIndex)) {
          letterClass += " filled";
        }
        
        // Add active class if this is the active letter
        if (nonSpaceIndex === activeIndex) {
          letterClass += " active";
        }
        
        return (
          <div 
            key={index} 
            className={letterClass}
            style={{ 
              width: `${letterWidth}px`, 
              margin: isMobile ? '0 1px' : '0 2px'
            }}
          >
            {revealedLetters.includes(nonSpaceIndex) && (
              <span className="letter-span">{char}</span>
            )}
            {nonSpaceIndex === activeIndex && (
              <div className="cursor"></div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default WordSpaces; 