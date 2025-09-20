import React, { useEffect, useState } from 'react';
import { useBuilderContext } from '../../../contexts/BuilderContext';
import useTouchControls from '../../../hooks/useTouchControls';
import styles from './TouchControls.module.css';

const TouchControls = () => {
  const { state } = useBuilderContext();
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  // Get the touch control handlers from our hook
  const { handleSetPointBtn, handleCancelPointBtn } = useTouchControls(null);
  
  // Check for touch support on component mount
  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || 
                  navigator.maxTouchPoints > 0 || 
                  navigator.msMaxTouchPoints > 0;
    
    setIsTouchDevice(hasTouch);
  }, []);
  
  // If not a touch device, don't render anything
  if (!isTouchDevice) {
    return null;
  }
  
  // Determine button states based on mode and recording state
  const setPointEnabled = (state.mode === 'sketch') || 
                         (state.mode === 'record' && state.recording.isRecording);
  
  const cancelPointText = state.mode === 'edit' ? 'Remove Point' : 'Cancel Point';
  
  return (
    <div className={styles.touchControls}>
      <button 
        className={`${styles.touchBtn} ${styles.setPointBtn}`}
        onClick={handleSetPointBtn}
        disabled={!setPointEnabled}
        style={{ opacity: setPointEnabled ? 1 : 0.5 }}
      >
        Set Point
      </button>
      
      <button 
        className={`${styles.touchBtn} ${styles.cancelPointBtn}`}
        onClick={handleCancelPointBtn}
        disabled={state.mode === 'record' && !state.recording.isRecording}
        style={{ 
          opacity: (state.mode === 'record' && !state.recording.isRecording) ? 0.5 : 1 
        }}
      >
        {cancelPointText}
      </button>
    </div>
  );
};

export default TouchControls; 