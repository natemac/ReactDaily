import { useCallback } from 'react';
import { CONFIG } from '../../utils/config.js';

/**
 * Custom hook that provides visual effect utilities for the game.
 * These effects help enhance the user experience with visual feedback.
 */
const useVisualEffects = () => {
  /**
   * Returns a CSS animation style for pulsing an element.
   * @param {boolean} active - Whether the animation should be active
   * @param {string} color - The color to pulse (default: '#4CAF50')
   * @param {number} duration - Duration in milliseconds (default: 500ms)
   * @returns {Object} - CSS style object for the animation
   */
  const getPulseAnimation = useCallback((active, color = '#4CAF50', duration = 500) => {
    if (!active) return {};
    
    return {
      animation: `pulse ${duration}ms ease-in-out`,
      boxShadow: `0 0 0 2px ${color}`,
      transition: 'box-shadow 0.3s ease-in-out'
    };
  }, []);
  
  /**
   * Returns a CSS animation style for highlighting hint reveals.
   * @param {boolean} isHighlighted - Whether this element should be highlighted
   * @param {string} color - The highlight color (default: gold)
   * @returns {Object} - CSS style object for the highlight
   */
  const getHintHighlight = useCallback((isHighlighted, color = 'gold') => {
    if (!isHighlighted) return {};
    
    return {
      animation: `highlight ${CONFIG.HINT_HIGHLIGHT_DURATION}ms ease-out`,
      backgroundColor: isHighlighted ? color : 'transparent',
      boxShadow: isHighlighted ? `0 0 10px ${color}` : 'none'
    };
  }, []);
  
  /**
   * Returns a CSS animation style for shake effect on wrong answers.
   * @param {boolean} active - Whether the shake effect should be active
   * @returns {Object} - CSS style object for the shake effect
   */
  const getShakeEffect = useCallback((active) => {
    if (!active) return {};
    
    return {
      animation: `shake 0.5s cubic-bezier(.36,.07,.19,.97) both`,
      transform: 'translate3d(0, 0, 0)',
      backfaceVisibility: 'hidden',
      perspective: '1000px'
    };
  }, []);
  
  /**
   * Returns a CSS animation style for fading an element in/out.
   * @param {boolean} visible - Whether the element should be visible
   * @param {number} duration - Duration in milliseconds (default: 300ms)
   * @returns {Object} - CSS style object for the fade effect
   */
  const getFadeEffect = useCallback((visible, duration = 300) => {
    return {
      opacity: visible ? 1 : 0,
      transition: `opacity ${duration}ms ease-in-out`,
      visibility: visible ? 'visible' : 'hidden'
    };
  }, []);
  
  return {
    getPulseAnimation,
    getHintHighlight,
    getShakeEffect,
    getFadeEffect
  };
};

export default useVisualEffects; 