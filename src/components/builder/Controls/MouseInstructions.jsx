import React, { useEffect, useState } from 'react';
import { useBuilderContext } from '../../../contexts/BuilderContext';
import styles from './MouseInstructions.module.css';

const MouseInstructions = () => {
  const { state } = useBuilderContext();
  const { mode } = state;
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  // Check for touch support on component mount
  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || 
                  navigator.maxTouchPoints > 0 || 
                  navigator.msMaxTouchPoints > 0;
    
    setIsTouchDevice(hasTouch);
  }, []);
  
  // Don't show instructions on touch devices or in preview mode
  if (isTouchDevice || mode === 'preview') {
    return null;
  }
  
  let instructions = '';
  
  switch(mode) {
    case 'sketch':
      instructions = 'Left click to set point • Double-click to cancel next point';
      break;
    case 'record':
      if (state.recording.isRecording) {
        instructions = 'Left click to record connections • Double-click to cancel current connection';
      } else {
        instructions = 'Click "Record" to start recording your drawing sequence';
      }
      break;
    case 'edit':
      instructions = 'Click on a point to remove it • Click and drag to move points';
      break;
    default:
      return null;
  }
  
  return (
    <div className={styles.mouseInstructions}>
      <p>{instructions}</p>
    </div>
  );
};

export default MouseInstructions; 