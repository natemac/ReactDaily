import React from 'react';
import { useBuilderContext } from '../../../contexts/BuilderContext';
import styles from './ModeControls.module.css';

const ModeControls = () => {
  const { state, dispatch } = useBuilderContext();
  
  // Set mode and handle recording state
  const handleModeChange = (mode) => {
    // Don't change mode if we're recording
    if (state.recording.isRecording && mode !== 'record') {
      console.log("Can't change mode during recording");
      return;
    }
    
    dispatch({ type: 'SET_MODE', mode });
  };
  
  // Handle recording toggle
  const handleRecordToggle = () => {
    if (state.recording.isRecording) {
      // Stop recording but stay in record mode
      dispatch({ type: 'SET_RECORDING_STATE', isRecording: false });
    } else {
      // Switch to record mode if not already
      dispatch({ type: 'SET_MODE', mode: 'record' });
      
      // Clear ALL previous recording data when starting a new recording
      dispatch({ type: 'RESET_RECORDING' });
      
      // Start recording
      dispatch({ type: 'SET_RECORDING_STATE', isRecording: true });
    }
  };
  
  // Handle preview button click
  const handlePreviewClick = () => {
    if (state.recording.sequence.length === 0) {
      alert('Please record a drawing sequence first.');
      return;
    }
    
    dispatch({ type: 'SET_MODE', mode: 'preview' });
    dispatch({ type: 'SET_PLAYING_STATE', isPlaying: true });
  };
  
  // Determine button classes based on active mode
  const getButtonClass = (mode) => {
    if (mode === state.mode) {
      return styles.primaryBtn;
    }
    return styles.tertiaryBtn;
  };
  
  return (
    <div className={styles.modeControls}>
      <button 
        className={getButtonClass('sketch')} 
        onClick={() => handleModeChange('sketch')}
      >
        Sketch
      </button>
      
      <button 
        className={getButtonClass('edit')} 
        onClick={() => handleModeChange('edit')}
      >
        Edit
      </button>
      
      <button 
        className={state.recording.isRecording ? styles.secondaryBtn : getButtonClass('record')} 
        onClick={handleRecordToggle}
      >
        {state.recording.isRecording ? 'Stop' : 'Record'}
      </button>
      
      <button 
        className={getButtonClass('preview')} 
        onClick={handlePreviewClick}
      >
        Preview
      </button>
    </div>
  );
};

export default ModeControls; 