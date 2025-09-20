import { useEffect, useRef } from 'react';
import { useGameContext } from '../contexts/GameContext';

/**
 * A hook for managing a game timer
 * @returns {void}
 */
export function useTimer() {
  const { state, dispatch, ActionTypes } = useGameContext();
  const timerRef = useRef(null);
  const lastTickRef = useRef(0);

  useEffect(() => {
    // Start timer when timerActive is true
    if (state.timerActive) {
      lastTickRef.current = Date.now();
      
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = now - lastTickRef.current;
        lastTickRef.current = now;
        
        dispatch({ 
          type: ActionTypes.UPDATE_TIMER, 
          payload: state.elapsedTime + elapsed 
        });
      }, 100); // Update every 100ms
    } else if (timerRef.current) {
      // Clear timer when timerActive is false
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Clean up on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.timerActive, state.elapsedTime, dispatch, ActionTypes]);
} 