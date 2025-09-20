import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMenuContext } from '../contexts/MenuContext';
import { useGameContext } from '../contexts/GameContext';
import styles from './HamburgerMenu.module.css';

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  const { 
    state, 
    dispatch, 
    ActionTypes, 
    playTestSound, 
    selectPreviousSong, 
    selectNextSong, 
    playTestMusic,
    stopTestMusic,
    getSongNumber,
    testMusicTrack,
    toggleShuffle
  } = useMenuContext();
  const { state: gameState } = useGameContext();
  
  // Song progress states
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const progressTimerRef = useRef(null);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
    
    // We no longer stop the music when closing the menu
    // The music will now continue playing even when the menu is closed
  };
  
  const closeMenu = () => {
    setIsOpen(false);
    // We no longer stop the music when closing the menu
    // stopTestMusic(); // Commented out to keep music playing when menu is closed
  };
  
  const navigateTo = (path) => {
    navigate(path);
    closeMenu();
  };
  
  const toggleAudio = () => {
    dispatch({ type: ActionTypes.TOGGLE_AUDIO });
  };
  
  const handleMusicVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    
    // Update state through dispatch
    dispatch({ 
      type: ActionTypes.SET_MUSIC_VOLUME, 
      payload: newVolume
    });
    
    // Immediately apply volume change to currently playing music if any
    if (testMusicTrack) {
      testMusicTrack.volume = newVolume / 100;
    }
  };
  
  const handleSfxVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    
    // Update state through dispatch
    dispatch({ 
      type: ActionTypes.SET_SFX_VOLUME, 
      payload: newVolume
    });
    
    // Global variable for instant access by new sound effects
    window.globalSfxVolume = newVolume / 100;
  };
  
  const setTheme = (theme) => {
    // Check if we're in a game and the timer is active
    if (gameState.gameStarted && gameState.timerActive) {
      // Don't allow theme change during active game
      closeMenu();
      return;
    }
    
    dispatch({ type: ActionTypes.SET_THEME, payload: theme });
    closeMenu();
  };
  
  // Check if current path matches the given path
  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  // Function to get CSS variables from theme
  const getCSSVariable = (varName, themeName) => {
    const tempElement = document.createElement('div');
    tempElement.setAttribute('data-theme', themeName);
    document.body.appendChild(tempElement);
    const value = getComputedStyle(tempElement).getPropertyValue(varName).trim().replace(/['"]+/g, '');
    document.body.removeChild(tempElement);
    return value;
  };

  // Track song progress
  useEffect(() => {
    if (testMusicTrack && !testMusicTrack.paused) {
      // Clear any existing timer
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      
      // Update duration once we have it
      if (testMusicTrack.duration && !isNaN(testMusicTrack.duration)) {
        setDuration(testMusicTrack.duration);
      }
      
      // Start tracking progress
      progressTimerRef.current = setInterval(() => {
        if (testMusicTrack) {
          setCurrentTime(testMusicTrack.currentTime);
          
          // Update duration if it becomes available
          if (testMusicTrack.duration && !isNaN(testMusicTrack.duration)) {
            setDuration(testMusicTrack.duration);
          }
        }
      }, 1000);
    } else {
      // Clear timer when not playing
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
      
      // Reset current time when stopped
      if (!testMusicTrack || testMusicTrack.paused) {
        setCurrentTime(0);
      }
    }
    
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, [testMusicTrack]);

  // Close the menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);
  
  // Format time for display (mm:ss)
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle progress bar click
  const handleProgressClick = (e) => {
    if (!testMusicTrack) return;
    
    const progressContainer = e.currentTarget;
    const clickPosition = e.clientX - progressContainer.getBoundingClientRect().left;
    const containerWidth = progressContainer.clientWidth;
    const percentage = clickPosition / containerWidth;
    
    // Set the current time based on percentage of total duration
    const newTime = percentage * duration;
    testMusicTrack.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  return (
    <div className={styles.menuContainer}>
      {/* Hamburger Icon - Keep visible even when menu is open */}
      <div 
        className={`${styles.hamburgerIcon} ${isOpen ? styles.open : ''}`} 
        onClick={toggleMenu} 
        aria-label="Toggle Menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
      
      {/* Menu Panel */}
      <div className={`${styles.menuPanel} ${isOpen ? styles.open : ''}`}>
        <div className={styles.menuContent}>
          {/* Navigation Section */}
          <div className={styles.menuSection}>
            <h3 className={styles.sectionTitle}>Navigation</h3>
            
            <button 
              className={`${styles.menuItem} ${isActivePath('/') && !isActivePath('/builder') ? styles.active : ''}`}
              onClick={() => navigateTo('/')}
            >
              <span className={styles.menuItemIcon}>🏠</span>
              <span className={styles.menuItemText}>Home</span>
            </button>
            
            <button 
              className={`${styles.menuItem} ${isActivePath('/builder') ? styles.active : ''}`}
              onClick={() => navigateTo('/builder')}
            >
              <span className={styles.menuItemIcon}>🎨</span>
              <span className={styles.menuItemText}>Builder</span>
            </button>
            
            <button 
              className={`${styles.menuItem} ${isActivePath('/ai-builder') ? styles.active : ''}`}
              onClick={() => navigateTo('/ai-builder')}
            >
              <span className={styles.menuItemIcon}>🤖</span>
              <span className={styles.menuItemText}>AI Assistant</span>
            </button>
          </div>
          
          {/* Divider */}
          <div className={styles.divider}></div>
          
          {/* Audio Section */}
          <div className={styles.menuSection}>
            <h3 className={styles.sectionTitle}>Audio</h3>
            
            <div className={styles.toggleContainer}>
              <span className={styles.toggleLabel}>
                Audio {state.audioEnabled ? 'ON' : 'OFF'}
              </span>
              <label className={styles.toggleSwitch}>
                <input 
                  type="checkbox" 
                  checked={state.audioEnabled}
                  onChange={toggleAudio}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            {state.audioEnabled && (
              <>
                <div className={styles.modernMusicPlayer}>
                  <div className={styles.songDetails}>
                    <div className={styles.songTitle}>
                      Song_{getSongNumber(state.selectedSong)?.padStart(5, '0') || '00000'}
                    </div>
                    
                    <div className={styles.progressContainer} onClick={handleProgressClick}>
                      <div 
                        className={styles.progressBar} 
                        style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                      ></div>
                    </div>
                    
                    <div className={styles.timeInfo}>
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                  
                  <div className={styles.playerControls}>
                    <div className={styles.controlButtons}>
                      <button 
                        className={styles.modernControlButton}
                        onClick={selectPreviousSong}
                        aria-label="Previous Song"
                      >
                        {state.currentTheme === '8bit' ? (
                          // 8-bit style previous icon
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="4" y="6" width="4" height="12" />
                            <polygon points="8,12 20,4 20,20" />
                          </svg>
                        ) : (
                          // Standard previous icon
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                          </svg>
                        )}
                      </button>
                      
                      <button 
                        className={`${styles.modernControlButton}`}
                        onClick={() => {
                          if (testMusicTrack && !testMusicTrack.paused) {
                            stopTestMusic();
                          } else {
                            playTestMusic();
                          }
                        }}
                      >
                        {testMusicTrack && !testMusicTrack.paused ? (
                          state.currentTheme === '8bit' ? (
                            // 8-bit style stop icon
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                              <rect x="6" y="6" width="12" height="12" />
                            </svg>
                          ) : (
                            // Standard stop icon
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M6 6h12v12H6z"/>
                            </svg>
                          )
                        ) : (
                          state.currentTheme === '8bit' ? (
                            // 8-bit style play icon
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                              <polygon points="8,5 8,19 20,12" />
                            </svg>
                          ) : (
                            // Standard play icon
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          )
                        )}
                      </button>
                      
                      <button 
                        className={styles.modernControlButton}
                        onClick={selectNextSong}
                        aria-label="Next Song"
                      >
                        {state.currentTheme === '8bit' ? (
                          // 8-bit style next icon
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="16" y="6" width="4" height="12" />
                            <polygon points="16,12 4,4 4,20" />
                          </svg>
                        ) : (
                          // Standard next icon
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 6l8.5 6-8.5 6V6zm9.5 0h2v12h-2z"/>
                          </svg>
                        )}
                      </button>
                      
                      <button 
                        className={`${styles.shuffleButton} ${state.shuffleEnabled ? styles.active : ''}`}
                        onClick={toggleShuffle}
                        aria-label="Toggle Shuffle"
                      >
                        {state.currentTheme === '8bit' ? (
                          // 8-bit style shuffle icon
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="4" y="4" width="2" height="2" />
                            <rect x="6" y="6" width="2" height="2" />
                            <rect x="8" y="8" width="2" height="2" />
                            <rect x="10" y="10" width="2" height="2" />
                            <rect x="14" y="4" width="2" height="2" />
                            <rect x="16" y="6" width="2" height="2" />
                            <rect x="18" y="8" width="2" height="2" />
                            <rect x="4" y="18" width="2" height="2" />
                            <rect x="6" y="16" width="2" height="2" />
                            <rect x="8" y="14" width="2" height="2" />
                            <rect x="14" y="18" width="2" height="2" />
                            <rect x="16" y="16" width="2" height="2" />
                            <rect x="18" y="14" width="2" height="2" />
                          </svg>
                        ) : (
                          // Standard shuffle icon
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className={styles.volumeControl}>
                  <label>Music Volume</label>
                  <div className={styles.sliderContainer}>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={state.musicVolume} 
                      onChange={handleMusicVolumeChange}
                      className={styles.volumeSlider}
                    />
                    <span className={styles.volumeValue}>{state.musicVolume}%</span>
                  </div>
                </div>
                
                <div className={styles.volumeControl}>
                  <label>SFX Volume</label>
                  <div className={styles.sliderContainer}>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={state.sfxVolume} 
                      onChange={handleSfxVolumeChange}
                      className={styles.volumeSlider}
                    />
                    <span className={styles.volumeValue}>{state.sfxVolume}%</span>
                  </div>
                </div>
                
                <button 
                  className={styles.testSoundButton}
                  onClick={playTestSound}
                >
                  Test Sound FX
                </button>
              </>
            )}
          </div>
          
          {/* Divider */}
          <div className={styles.divider}></div>
          
          {/* Appearance Section */}
          <div className={styles.menuSection}>
            <h3 className={styles.sectionTitle}>Appearance</h3>
            
            <div className={styles.themeContainer}>
              <button
                className={`${styles.themeButton} ${state.currentTheme === 'modern' ? styles.active : ''} ${gameState.gameStarted && gameState.timerActive ? styles.disabled : ''}`}
                onClick={() => setTheme('modern')}
                aria-disabled={gameState.gameStarted && gameState.timerActive}
              >
                {getCSSVariable('--theme-name', 'modern') || 'Modern'}
              </button>
              <button
                className={`${styles.themeButton} ${state.currentTheme === '8bit' ? styles.active : ''} ${gameState.gameStarted && gameState.timerActive ? styles.disabled : ''}`}
                onClick={() => setTheme('8bit')}
                aria-disabled={gameState.gameStarted && gameState.timerActive}
              >
                {getCSSVariable('--theme-name', '8bit') || '8-Bit'}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className={styles.divider}></div>

          {/* Help Section */}
          <div className={styles.menuSection}>
            <button
              className={styles.howToButton}
              onClick={() => {
                window.dispatchEvent(new CustomEvent('showWelcome'));
                closeMenu();
              }}
            >
              <span className={styles.menuItemIcon}>❓</span>
              <span className={styles.menuItemText}>How To Play</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Overlay to catch clicks outside menu */}
      {isOpen && (
        <div 
          className={styles.overlay}
          onClick={closeMenu}
        ></div>
      )}
    </div>
  );
};

export default HamburgerMenu; 