import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameContext } from '../../contexts/GameContext';
import { useMenuContext } from '../../contexts/MenuContext';
import './GameStyles.css';
import DrawingCanvas from './DrawingCanvas.jsx';
import WordSpaces from './WordSpaces.jsx';
import Confetti from './Confetti.jsx';
import VirtualKeyboard from './VirtualKeyboard.jsx';
import { CONFIG } from '../../utils/config.js';
import useAudioEffects from './useAudioEffects.js';
import useVisualEffects from './useVisualEffects.js';

const CATEGORY_COLORS = {
  yellow: '#FFD700',
  green: '#4CAF50',
  blue: '#2196F3',
  red: '#F44336'
};

function formatTime(centiseconds) {
  const seconds = Math.floor(centiseconds / 100);
  const csecs = centiseconds % 100;
  return `${seconds.toString().padStart(2, '0')}.${csecs.toString().padStart(2, '0')}`;
}

function Game() {
  const navigate = useNavigate();
  const { category } = useParams();
  const { state, dispatch, ActionTypes } = useGameContext();
  const { playMusicForCategory, stopAllMusic, stopCategoryMusic, testMusicTrack, state: menuState } = useMenuContext();
  const [centiseconds, setCentiseconds] = useState(0);
  const [pausedCentiseconds, setPausedCentiseconds] = useState(0); // Store paused time
  const [categoryData, setCategoryData] = useState(null);
  const [word, setWord] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [revealedLetters, setRevealedLetters] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [wrongGuess, setWrongGuess] = useState(false);
  const [hintCooldown, setHintCooldown] = useState(false);
  const [hintCooldownEndTime, setHintCooldownEndTime] = useState(0); // Track when cooldown should end
  const [hintCooldownRemaining, setHintCooldownRemaining] = useState(0); // Track remaining cooldown time
  const [guessMode, setGuessMode] = useState(false);
  const [guessTimeRemaining, setGuessTimeRemaining] = useState(CONFIG.GUESS_TIME_LIMIT);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastRevealedLetter, setLastRevealedLetter] = useState(-1); // For visual effects
  const [isMobile, setIsMobile] = useState(false); // Track if user is on mobile
  const [showKeyboard, setShowKeyboard] = useState(false); // Track keyboard visibility
  const timerRef = useRef(null);
  const animationRef = useRef(null);
  const cooldownRef = useRef(null);
  const guessTimerRef = useRef(null);
  const difficultyMode = state.config.difficulty || 'easy';
  
  // Initialize audio with config from context
  const { playSound, getAudio, getAudioDuration } = useAudioEffects({
    enabled: menuState.audioEnabled,
    volume: menuState.sfxVolume / 100
  });
  
  // Get visual effects
  const { getPulseAnimation, getHintHighlight } = useVisualEffects();
  
  // Set background color based on category
  useEffect(() => {
    document.documentElement.style.setProperty('overflow', 'hidden');
    document.documentElement.style.setProperty('position', 'fixed');
    document.documentElement.style.setProperty('width', '100%');
    document.documentElement.style.setProperty('height', '100%');
    document.documentElement.style.setProperty('touch-action', 'none');
    document.documentElement.style.setProperty('-webkit-overflow-scrolling', 'none');
    
    const categoryColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.green;
    document.body.style.backgroundColor = categoryColor;
    
    // Cleanup when unmounting
    return () => {
      document.documentElement.style.removeProperty('overflow');
      document.documentElement.style.removeProperty('position');
      document.documentElement.style.removeProperty('width');
      document.documentElement.style.removeProperty('height');
      document.documentElement.style.removeProperty('touch-action');
      document.documentElement.style.removeProperty('-webkit-overflow-scrolling');
      document.body.style.backgroundColor = '';
      
      // Clear timers if running
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (cooldownRef.current) {
        clearTimeout(cooldownRef.current);
      }
      if (guessTimerRef.current) {
        clearInterval(guessTimerRef.current);
      }
      
      // Only stop category music when leaving the game, preserve any test music playing
      stopCategoryMusic();
    };
  }, [category, stopCategoryMusic]);
  
  // Load category data from JSON file
  useEffect(() => {
    async function loadCategoryData() {
      try {
        // Reset game state
        setGameStarted(false);
        setAnimationProgress(0);
        setRevealedLetters([]);
        setActiveIndex(-1);
        setHintCooldown(false);
        setHintCooldownEndTime(0);
        setHintCooldownRemaining(0);
        setCentiseconds(0);
        setPausedCentiseconds(0); // Reset paused time
        setGuessMode(false);
        setGuessTimeRemaining(CONFIG.GUESS_TIME_LIMIT);
        setShowConfetti(false);
        setLastRevealedLetter(-1);
        
        // Reset guess attempts in the context
        dispatch({ type: ActionTypes.RESET_GAME });
        
        if (category) {
          console.log(`Loading category data for: ${category}`);
          
          // Update category in game context
          dispatch({ type: ActionTypes.SET_CATEGORY, payload: category });
          
          // Use dynamic import to load the JSON files
          try {
            // Dynamic import method
            let data;
            
            // Each category needs to be handled explicitly for dynamic imports to work
            if (category === 'yellow') {
              const module = await import('../../assets/items/yellow.json');
              data = module.default;
            } else if (category === 'blue') {
              const module = await import('../../assets/items/blue.json');
              data = module.default;
            } else if (category === 'green') {
              const module = await import('../../assets/items/green.json');
              data = module.default;
            } else if (category === 'red') {
              const module = await import('../../assets/items/red.json');
              data = module.default;
            } else {
              throw new Error(`Unknown category: ${category}`);
            }
            
            console.log('Category data loaded:', data);
            setCategoryData(data);
            setCategoryName(data.categoryName || '');
            setWord((data.name || '').toUpperCase());
            
            // Store drawing data in context
            dispatch({ type: ActionTypes.SET_DRAWING_DATA, payload: {
              dots: data.dots || [],
              sequence: data.sequence || []
            }});
            console.log('Drawing data stored in context');
          } catch (loadError) {
            console.error('Error loading category JSON:', loadError);
          }
        }
      } catch (error) {
        console.error('Error in loadCategoryData:', error);
      }
    }
    
    loadCategoryData();
  }, [category, dispatch, ActionTypes]);
  
  // Function to start timer in centiseconds
  const startTimer = (continueFromTime = 0) => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Reset or continue from previous centiseconds
    if (continueFromTime > 0) {
      setCentiseconds(continueFromTime);
    } else {
      setCentiseconds(0);
    }
    
    // Start a new timer in centiseconds (10ms = 1/100th of a second)
    timerRef.current = setInterval(() => {
      setCentiseconds(prev => prev + 1);
    }, 10);
  };

  // Function to pause timer
  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };
  
  // Start hint cooldown
  const startHintCooldown = () => {
    // Start a new cooldown
    setHintCooldown(true);
    
    // Clear any existing cooldown
    if (cooldownRef.current) {
      clearTimeout(cooldownRef.current);
    }
    
    // Set end time for cooldown
    const duration = CONFIG.HINT_COOLDOWN_TIME * 1000;
    const endTime = Date.now() + duration;
    setHintCooldownEndTime(endTime);
    setHintCooldownRemaining(duration);
    
    // Start the cooldown timer
    console.log(`Starting hint cooldown: ${duration}ms`);
    cooldownRef.current = setTimeout(() => {
      console.log("Hint cooldown expired");
      setHintCooldown(false);
    }, duration);
  };
  
  // Pause hint cooldown
  const pauseHintCooldown = () => {
    if (hintCooldown && cooldownRef.current) {
      // Clear the current timeout
      clearTimeout(cooldownRef.current);
      
      // Calculate remaining time
      const now = Date.now();
      const remaining = Math.max(0, hintCooldownEndTime - now);
      setHintCooldownRemaining(remaining);
      
      console.log(`Paused hint cooldown with ${remaining}ms remaining`);
    }
  };
  
  // Resume hint cooldown
  const resumeHintCooldown = () => {
    if (hintCooldown) {
      console.log(`Resuming hint cooldown with ${hintCooldownRemaining}ms remaining`);
      
      // If no time remains, end the cooldown
      if (hintCooldownRemaining <= 0) {
        console.log("Cooldown expired during pause, ending cooldown");
        setHintCooldown(false);
        return;
      }
      
      // Set a new end time based on the remaining duration
      const newEndTime = Date.now() + hintCooldownRemaining;
      setHintCooldownEndTime(newEndTime);
      
      // Start a new timeout with the remaining time
      cooldownRef.current = setTimeout(() => {
        console.log("Hint cooldown expired after resume");
        setHintCooldown(false);
      }, hintCooldownRemaining);
    }
  };
  
  // Start animation with consistent speed based on drawing length
  const startAnimation = (continueFromProgress = 0) => {
    // Reset animation progress if not continuing
    if (continueFromProgress === 0) {
      setAnimationProgress(0);
    } else {
      // Continue from current progress
      setAnimationProgress(continueFromProgress);
    }
    
    // Animation start time
    const startTime = performance.now();
    
    // Get total length from categoryData
    let totalDrawingLength = 0;
    if (categoryData && categoryData.dots && categoryData.sequence) {
      const { dots, sequence } = categoryData;
      
      // Calculate total length of all paths
      totalDrawingLength = sequence.reduce((total, { from, to }) => {
        if (from === undefined || to === undefined || !dots[from] || !dots[to]) {
          return total;
        }
        
        const dx = dots[to].x - dots[from].x;
        const dy = dots[to].y - dots[from].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return total + distance;
      }, 0);
    }
    
    // Calculate duration based on pixel speed
    // Ensure a minimum duration and apply a scaling factor for screen size
    const minDuration = CONFIG.MINIMUM_LINE_TIME * 10; // Min 1 second (10 * 100ms)
    const pixelSpeed = CONFIG.PIXELS_PER_SECOND; // Pixels per second
    const scalingFactor = 1.0; // Adjust based on screen scaling if needed
    
    const duration = Math.max(
      minDuration,
      (totalDrawingLength / pixelSpeed) * 1000 * scalingFactor
    );
    
    // Calculate adjusted start time to account for existing progress
    const adjustedStartTime = continueFromProgress > 0 
      ? startTime - (duration * continueFromProgress)
      : startTime;
    
    console.log(`Drawing length: ${totalDrawingLength}px, Animation duration: ${duration}ms, Continuing from: ${continueFromProgress}`);
    
    // Animation loop function
    const animate = (currentTime) => {
      // Calculate progress (0 to 1), accounting for existing progress
      const elapsed = currentTime - adjustedStartTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Update animation progress
      setAnimationProgress(progress);
      
      // Continue animation if not complete
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate);
  };
  
  const handleBeginClick = () => {
    setGameStarted(true);
    
    // No letters should be revealed initially
    setRevealedLetters([]);
    
    // Set active index to first letter
    const letters = word.split('').filter(char => char !== ' ');
    setActiveIndex(0); // Point to first letter
    
    startTimer();
    startAnimation();
    startHintCooldown(); // Start initial hint cooldown
    
    // Only play music if audio is enabled
    if (menuState.audioEnabled) {
      // Play the music assigned to this category
      playMusicForCategory(category);
    }
    
    // Update game state in context
    dispatch({ type: ActionTypes.START_GAME });
  };
  
  const handleHintClick = () => {
    // Don't allow hints in hard mode
    if (difficultyMode === 'hard' || hintCooldown) return;
    
    // Start hint cooldown
    startHintCooldown();
    
    // Play hint sound - use correct sound since we're revealing a correct letter
    playSound('correct');
    
    // Get non-space letters for revealing
    const nonSpaceLetters = word.split('').filter(char => char !== ' ');
    
    // Reveal the next letter
    if (revealedLetters.length < nonSpaceLetters.length) {
      const nextIndex = revealedLetters.length;
      
      // Store for visual effect
      setLastRevealedLetter(nextIndex);
      
      setRevealedLetters([...revealedLetters, nextIndex]);
      
      // Move active index to next position or to the end if no more letters
      const newActiveIndex = nextIndex + 1 < nonSpaceLetters.length ? nextIndex + 1 : -1;
      setActiveIndex(newActiveIndex);
    }
  };

  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      // Check for both screen size and touch capability
      const isMobileDevice = window.innerWidth <= 768 || 
        (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Show/hide keyboard based on guess mode and device type
  useEffect(() => {
    if (isMobile && guessMode) {
      setShowKeyboard(true);
      // Add class to body for layout adjustments
      document.body.classList.add('keyboard-visible');
    } else {
      setShowKeyboard(false);
      document.body.classList.remove('keyboard-visible');
    }
    
    return () => {
      document.body.classList.remove('keyboard-visible');
    };
  }, [isMobile, guessMode]);

  // Handle guess click
  const handleGuessClick = () => {
    // Enter guess mode
    setGuessMode(true);
    setGuessTimeRemaining(CONFIG.GUESS_TIME_LIMIT);
    
    // Play guess sound
    playSound('guess');
    
    // Save current time before pausing
    setPausedCentiseconds(centiseconds);
    
    // Pause the timer and animation
    pauseTimer();
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Pause hint cooldown
    if (hintCooldown) {
      pauseHintCooldown();
    }
    
    // Increment guess attempts in game context
    dispatch({ type: ActionTypes.INCREMENT_GUESSES });
    
    // Start the guess timer countdown
    if (guessTimerRef.current) {
      clearInterval(guessTimerRef.current);
    }
    
    guessTimerRef.current = setInterval(() => {
      setGuessTimeRemaining(prev => {
        const newTime = prev - 0.1; // Decrement by 0.1 seconds
        if (newTime <= 0) {
          // Time's up
          clearInterval(guessTimerRef.current);
          handleGuessTimeout();
          return 0;
        }
        return newTime;
      });
    }, 100); // Update every 100ms for smooth countdown
  };

  // Handle guess timeout
  const handleGuessTimeout = () => {
    // Exit guess mode
    setGuessMode(false);
    setWrongGuess(true);
    
    // Play wrong sound
    playSound('incorrect');
    
    // Resume timer and animation
    startTimer(pausedCentiseconds); // Resume from saved time
    if (animationProgress < 1) {
      startAnimation(animationProgress); // Continue from current progress
    }
    
    // Resume hint cooldown if it was active
    if (hintCooldown) {
      resumeHintCooldown();
    }
    
    // Hide the wrong message after a delay
    setTimeout(() => {
      setWrongGuess(false);
    }, CONFIG.WRONG_MESSAGE_DURATION);
  };
  
  // Handle word completion
  const handleWordComplete = () => {
    // Clear any active timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (guessTimerRef.current) {
      clearInterval(guessTimerRef.current);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Only stop category music, preserve any test music playing
    stopCategoryMusic();
    
    // Play completion sound and get the audio element
    const completionSound = playSound('completion');
    
    // Calculate the duration of the completion sound
    let soundDuration = getAudioDuration('completion');
    
    // If we couldn't get the duration, use a reasonable default
    if (!soundDuration) {
      soundDuration = 3500; // Assume 3.5 seconds for completion sound
    }
    
    // Use the longer of CONFIG.CELEBRATION_DURATION or soundDuration + 500ms
    const celebrationTime = Math.max(CONFIG.CELEBRATION_DURATION, soundDuration + 500);
    
    console.log(`Completion sound duration: ${soundDuration}ms, celebration time: ${celebrationTime}ms`);
    
    // Show confetti
    setShowConfetti(true);
    
    // Determine achievements
    const achievements = {
      hardMode: difficultyMode === 'hard',
      earlyCompletion: animationProgress < 1,
      firstGuess: state.guessAttempts === 1  // First guess means exactly 1 guess was made
    };
    
    // Statistics 
    const stats = {
      time: centiseconds,
      guesses: state.guessAttempts // Use the actual count from state instead of adding 1
    };
    
    console.log('Completion with stats:', stats, 'and achievements:', achievements);
    
    // Mark current category as completed in game context
    if (category) {
      dispatch({ 
        type: ActionTypes.COMPLETE_CATEGORY, 
        payload: {
          category,
          stats,
          achievements
        }
      });
    }
    
    // Add a listener for the completion sound ending if we have the audio element
    if (completionSound) {
      completionSound.addEventListener('ended', () => {
        console.log('Completion sound finished playing');
      });
    }
    
    // After celebration period, return to menu
    const timeoutId = setTimeout(() => {
      console.log('Celebration time complete, returning to menu');
      navigate('/');
    }, celebrationTime);
    
    // Return cleanup function
    return () => {
      clearTimeout(timeoutId);
    };
  };

  // Handle virtual keyboard key press
  const handleVirtualKeyPress = (key) => {
    // Only process if in guess mode and have an active index
    if (!guessMode || activeIndex === -1) return;
    
    // Get all characters including spaces
    const allCharacters = word.split('');
    // Get only non-space characters for letter matching
    const nonSpaceChars = allCharacters.filter(char => char !== ' ');
    
    // Check if the guessed letter matches the expected letter
    if (key === nonSpaceChars[activeIndex]) {
      // Correct letter
      const newRevealedLetters = [...revealedLetters, activeIndex];
      setRevealedLetters(newRevealedLetters);
      
      // Store for visual effect
      setLastRevealedLetter(activeIndex);
      
      // Play tick sound for correct letter
      playSound('correct');
      
      // Move to next letter
      const newActiveIndex = activeIndex + 1;
      
      // Check if we've completed the word
      if (newActiveIndex >= nonSpaceChars.length) {
        // Word is complete!
        setActiveIndex(-1);
        clearInterval(guessTimerRef.current);
        setGuessMode(false);
        
        // Show completion celebration
        handleWordComplete();
      } else {
        // Set the active index to the next letter
        setActiveIndex(newActiveIndex);
      }
    } else {
      // Wrong letter - show wrong message and end the user's turn
      setWrongGuess(true);
      
      // Play wrong sound
      playSound('incorrect');
      
      // End the guessing session
      clearInterval(guessTimerRef.current);
      setGuessMode(false);
      
      // Resume the game
      startTimer(pausedCentiseconds); // Resume from saved time
      if (animationProgress < 1) {
        startAnimation(animationProgress); // Continue from current progress
      }
      
      // Resume hint cooldown if it was active
      if (hintCooldown) {
        resumeHintCooldown();
      }
      
      setTimeout(() => {
        setWrongGuess(false);
      }, CONFIG.WRONG_MESSAGE_DURATION);
    }
  };
  
  // Keyboard event handler for letter inputs
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only process keyboard inputs in guess mode
      if (!guessMode || activeIndex === -1) return;
      
      const key = e.key.toUpperCase();
      
      // Get all characters including spaces
      const allCharacters = word.split('');
      // Get only non-space characters for letter matching
      const nonSpaceChars = allCharacters.filter(char => char !== ' ');
      
      // Create a mapping between non-space indices and original word indices
      const nonSpaceToOriginalMap = [];
      allCharacters.forEach((char, index) => {
        if (char !== ' ') {
          nonSpaceToOriginalMap.push(index);
        }
      });
      
      // If Enter key is pressed, check if the word is complete
      if (key === 'ENTER') {
        // If all letters are correct, consider it a win
        if (revealedLetters.length === nonSpaceChars.length) {
          // Word is complete!
          setActiveIndex(-1);
          clearInterval(guessTimerRef.current);
          setGuessMode(false);
          
          // Show completion celebration
          handleWordComplete();
        } else {
          // Not all letters are filled in - show wrong message
          setWrongGuess(true);
          
          // Play wrong sound
          playSound('incorrect');
          
          // End the user's turn
          clearInterval(guessTimerRef.current);
          setGuessMode(false);
          
          // Resume the game
          startTimer(pausedCentiseconds); // Resume from saved time
          if (animationProgress < 1) {
            startAnimation(animationProgress); // Continue from current progress
          }
          
          // Resume hint cooldown if it was active
          if (hintCooldown) {
            resumeHintCooldown();
          }
          
          setTimeout(() => {
            setWrongGuess(false);
          }, CONFIG.WRONG_MESSAGE_DURATION);
        }
        return;
      }
      
      // If Backspace/Delete key is pressed, remove the last letter
      if (key === 'BACKSPACE' || key === 'DELETE') {
        // Only if we have revealed letters and we're not at the beginning
        if (revealedLetters.length > 0 && activeIndex > 0) {
          // Remove the last letter
          const newRevealedLetters = [...revealedLetters];
          newRevealedLetters.pop();
          setRevealedLetters(newRevealedLetters);
          
          // Move the cursor back one position
          setActiveIndex(activeIndex - 1);
        }
        return;
      }
      
      // Check if the key is a letter A-Z and we're within bounds
      if (/^[A-Z]$/.test(key) && activeIndex < nonSpaceChars.length) {
        // Check if the guessed letter matches the expected letter
        if (key === nonSpaceChars[activeIndex]) {
          // Correct letter
          const newRevealedLetters = [...revealedLetters, activeIndex];
          setRevealedLetters(newRevealedLetters);
          
          // Store for visual effect
          setLastRevealedLetter(activeIndex);
          
          // Play tick sound for correct letter
          playSound('correct');
          
          // Move to next letter
          const newActiveIndex = activeIndex + 1;
          
          // Check if we've completed the word
          if (newActiveIndex >= nonSpaceChars.length) {
            // Word is complete!
            setActiveIndex(-1);
            clearInterval(guessTimerRef.current);
            setGuessMode(false);
            
            // Show completion celebration
            handleWordComplete();
          } else {
            // Set the active index to the next letter
            setActiveIndex(newActiveIndex);
          }
        } else {
          // Wrong letter - show wrong message and end the user's turn
          setWrongGuess(true);
          
          // Play wrong sound
          playSound('incorrect');
          
          // End the guessing session
          clearInterval(guessTimerRef.current);
          setGuessMode(false);
          
          // Resume the game
          startTimer(pausedCentiseconds); // Resume from saved time
          if (animationProgress < 1) {
            startAnimation(animationProgress); // Continue from current progress
          }
          
          // Resume hint cooldown if it was active
          if (hintCooldown) {
            resumeHintCooldown();
          }
          
          setTimeout(() => {
            setWrongGuess(false);
          }, CONFIG.WRONG_MESSAGE_DURATION);
        }
      }
    };
    
    // Only add the event listener in guess mode
    if (guessMode) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [guessMode, activeIndex, word, revealedLetters, animationProgress, hintCooldown, pausedCentiseconds, hintCooldownRemaining, playSound]);
  
  // Handle confetti completion
  const handleConfettiComplete = () => {
    setShowConfetti(false);
  };

  // Clear wrong guess feedback after animation duration (0.4s)
  useEffect(() => {
    let timer;
    if (wrongGuess) {
      timer = setTimeout(() => {
        setWrongGuess(false);
      }, 400); // Match the animation duration in CSS
    }
    return () => clearTimeout(timer);
  }, [wrongGuess]);

  return (
    <div className="app-content">
      <div className="game-container">
        <div className="game-header">
          <div className="category-display">
            <span className="category-label">Category:</span> 
            <span className="category-name">{categoryName}</span>
          </div>
          <div className="timer-display">{formatTime(centiseconds)}</div>
        </div>
        
        <div className="game-screen">
          <div className="drawing-area">
            <DrawingCanvas 
              isPlaying={gameStarted && !guessMode} 
              animationProgress={animationProgress}
              drawingData={categoryData} 
              showDots={gameStarted && difficultyMode === 'easy'}
              pauseMode={guessMode}
              wrongGuess={wrongGuess}
            />
          </div>
          
          <div className="word-area">
            {gameStarted ? (
              <WordSpaces 
                word={word} 
                revealedLetters={revealedLetters}
                activeIndex={activeIndex}
                hideSpaces={difficultyMode === 'hard'}
                highlightIndex={lastRevealedLetter}
              />
            ) : (
              <div className="empty-word-spaces"></div>
            )}
          </div>
          
          {/* Only show controls if not in mobile guess mode with keyboard */}
          {!(isMobile && showKeyboard) && (
            <div className="controls-area">
              <div className="button-container">
                {!gameStarted ? (
                  <button className="begin-button" onClick={handleBeginClick}>
                    <span className="button-text">Begin</span>
                  </button>
                ) : (
                  <>
                    <button 
                      className="guess-button" 
                      onClick={guessMode ? null : handleGuessClick}
                      disabled={guessMode}
                    >
                      {guessMode && (
                        <div className={`button-timer active`} style={{ width: `${guessTimeRemaining / CONFIG.GUESS_TIME_LIMIT * 100}%` }}></div>
                      )}
                      <span className="button-text">Guess</span>
                    </button>
                    
                    {difficultyMode === 'easy' && (
                      <button 
                        className={`hint-button ${hintCooldown ? 'cooldown' : ''}`} 
                        onClick={handleHintClick}
                        disabled={hintCooldown || guessMode}
                      >
                        Hint?
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Confetti overlay for celebration */}
          {showConfetti && (
            <Confetti show={showConfetti} onComplete={handleConfettiComplete} />
          )}
          
          {/* Virtual Keyboard for Mobile */}
          {showKeyboard && (
            <VirtualKeyboard 
              onKeyPress={handleVirtualKeyPress} 
              guessTimeRemaining={guessTimeRemaining}
              maxGuessTime={CONFIG.GUESS_TIME_LIMIT}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Game; 