import { createContext, useContext, useReducer, useEffect } from 'react';
import { shouldResetStats, getCurrentDateString } from '../utils/dailyReset';

// Initial state
const initialState = {
  // Game configuration
  config: {
    pixelsPerSecond: 300,
    minimumLineTime: 100,
    difficulty: localStorage.getItem('difficulty') || 'easy',
    audioEnabled: true,
    musicVolume: 0.4,
    sfxVolume: 0.5,
  },
  
  // Current game state
  currentCategory: null,
  drawingData: null,
  drawingProgress: 0,
  guessMode: false,
  gameStarted: false,
  currentInput: '',
  correctLetters: [],
  guessAttempts: 0,
  elapsedTime: 0,
  timerActive: false,
  
  // Completion state
  completedCategories: {
    yellow: { completed: false, stats: null, achievements: null },
    green: { completed: false, stats: null, achievements: null },
    blue: { completed: false, stats: null, achievements: null },
    red: { completed: false, stats: null, achievements: null }
  }
};

// Action types
const ActionTypes = {
  SET_DIFFICULTY: 'SET_DIFFICULTY',
  TOGGLE_AUDIO: 'TOGGLE_AUDIO',
  SET_VOLUME: 'SET_VOLUME',
  SET_CATEGORY: 'SET_CATEGORY',
  SET_DRAWING_DATA: 'SET_DRAWING_DATA',
  UPDATE_PROGRESS: 'UPDATE_PROGRESS',
  START_GAME: 'START_GAME',
  TOGGLE_GUESS_MODE: 'TOGGLE_GUESS_MODE',
  UPDATE_INPUT: 'UPDATE_INPUT',
  UPDATE_CORRECT_LETTERS: 'UPDATE_CORRECT_LETTERS',
  INCREMENT_GUESSES: 'INCREMENT_GUESSES',
  UPDATE_TIMER: 'UPDATE_TIMER',
  TOGGLE_TIMER: 'TOGGLE_TIMER',
  COMPLETE_CATEGORY: 'COMPLETE_CATEGORY',
  RESET_GAME: 'RESET_GAME',
  DAILY_RESET: 'DAILY_RESET',
  LOAD_SAVED_STATE: 'LOAD_SAVED_STATE'
};

// Reducer function
function gameReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_DIFFICULTY:
      // Also save to localStorage
      localStorage.setItem('difficulty', action.payload);
      return {
        ...state,
        config: {
          ...state.config,
          difficulty: action.payload
        }
      };
      
    case ActionTypes.TOGGLE_AUDIO:
      return {
        ...state,
        config: {
          ...state.config,
          audioEnabled: !state.config.audioEnabled
        }
      };
      
    case ActionTypes.SET_VOLUME:
      return {
        ...state,
        config: {
          ...state.config,
          [action.payload.type]: action.payload.value
        }
      };
      
    case ActionTypes.SET_CATEGORY:
      return {
        ...state,
        currentCategory: action.payload
      };
      
    case ActionTypes.SET_DRAWING_DATA:
      return {
        ...state,
        drawingData: action.payload
      };
      
    case ActionTypes.UPDATE_PROGRESS:
      return {
        ...state,
        drawingProgress: action.payload
      };
      
    case ActionTypes.START_GAME:
      return {
        ...state,
        gameStarted: true,
        timerActive: true,
        elapsedTime: 0
      };
      
    case ActionTypes.TOGGLE_GUESS_MODE:
      return {
        ...state,
        guessMode: !state.guessMode
      };
      
    case ActionTypes.UPDATE_INPUT:
      return {
        ...state,
        currentInput: action.payload
      };
      
    case ActionTypes.UPDATE_CORRECT_LETTERS:
      return {
        ...state,
        correctLetters: action.payload
      };
      
    case ActionTypes.INCREMENT_GUESSES:
      return {
        ...state,
        guessAttempts: state.guessAttempts + 1
      };
      
    case ActionTypes.UPDATE_TIMER:
      return {
        ...state,
        elapsedTime: action.payload
      };
      
    case ActionTypes.TOGGLE_TIMER:
      return {
        ...state,
        timerActive: action.payload
      };
      
    case ActionTypes.COMPLETE_CATEGORY:
      return {
        ...state,
        completedCategories: {
          ...state.completedCategories,
          [action.payload.category]: {
            completed: true,
            stats: action.payload.stats,
            achievements: action.payload.achievements
          }
        },
        gameStarted: false,
        timerActive: false
      };
      
    case ActionTypes.RESET_GAME:
      return {
        ...state,
        drawingProgress: 0,
        guessMode: false,
        gameStarted: false,
        currentInput: '',
        correctLetters: [],
        guessAttempts: 0,
        elapsedTime: 0,
        timerActive: false
      };

    case ActionTypes.DAILY_RESET:
      return {
        ...state,
        completedCategories: {
          yellow: { completed: false, stats: null, achievements: null },
          green: { completed: false, stats: null, achievements: null },
          blue: { completed: false, stats: null, achievements: null },
          red: { completed: false, stats: null, achievements: null }
        }
      };

    case ActionTypes.LOAD_SAVED_STATE:
      return {
        ...state,
        ...action.payload
      };

    default:
      return state;
  }
}

// Create context
const GameContext = createContext();

// Provider component
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load saved state from localStorage on mount and check for daily reset
  useEffect(() => {
    const lastReset = localStorage.getItem('reactDaily_lastReset');
    const savedState = localStorage.getItem('gameState');

    // Check if we need to reset stats for a new day
    if (shouldResetStats(lastReset)) {
      console.log('🌅 New day detected! Resetting completed categories...');

      // Perform daily reset
      dispatch({ type: ActionTypes.DAILY_RESET });

      // Update last reset timestamp
      localStorage.setItem('reactDaily_lastReset', getCurrentDateString());

      // If there was saved state, load only the config (not completed categories)
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          if (parsedState.config) {
            dispatch({
              type: ActionTypes.LOAD_SAVED_STATE,
              payload: { config: parsedState.config }
            });
          }
        } catch (error) {
          console.error('Error loading saved config after reset:', error);
        }
      }
    } else {
      // Normal load - no reset needed
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          dispatch({ type: ActionTypes.LOAD_SAVED_STATE, payload: parsedState });
        } catch (error) {
          console.error('Error loading saved state:', error);
        }
      }
    }
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    const stateToSave = {
      config: state.config,
      completedCategories: state.completedCategories
    };
    localStorage.setItem('gameState', JSON.stringify(stateToSave));
  }, [state.config, state.completedCategories]);

  // Periodic check for daily reset (every 5 minutes)
  useEffect(() => {
    const checkForReset = () => {
      const lastReset = localStorage.getItem('reactDaily_lastReset');
      if (shouldResetStats(lastReset)) {
        console.log('🌅 Periodic check: New day detected! Resetting completed categories...');
        dispatch({ type: ActionTypes.DAILY_RESET });
        localStorage.setItem('reactDaily_lastReset', getCurrentDateString());
      }
    };

    // Check every 5 minutes (300000 ms)
    const interval = setInterval(checkForReset, 300000);

    return () => clearInterval(interval);
  }, []);
  
  return (
    <GameContext.Provider value={{ state, dispatch, ActionTypes }}>
      {children}
    </GameContext.Provider>
  );
}

// Custom hook for using the game context
export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
} 