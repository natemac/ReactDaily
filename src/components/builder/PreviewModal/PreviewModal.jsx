import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { useBuilderContext } from '../../../contexts/BuilderContext';
import useAnimation from '../../../hooks/useAnimation';
import './PreviewModal.css';

const PreviewModal = () => {
  const { state, dispatch } = useBuilderContext();
  const canvasRef = useRef(null);
  
  // Use memoized value to prevent unnecessary re-renders
  const showModal = useMemo(() => state.mode === 'preview', [state.mode]);
  
  // Only create animation hooks when modal is shown
  const { startPreviewAnimation, stopPreviewAnimation } = useAnimation(canvasRef);
  
  // Memoize the close handler to prevent recreating on every render
  const handleClose = useCallback(() => {
    stopPreviewAnimation();
    dispatch({ type: 'SET_PLAYING_STATE', isPlaying: false });
    dispatch({ type: 'SET_MODE', mode: 'record' }); // Return to record mode
  }, [dispatch, stopPreviewAnimation]);
  
  // Start animation when modal becomes visible
  useEffect(() => {
    if (showModal && canvasRef.current) {
      // Start animation on a slight delay to ensure DOM updates are complete
      const timer = setTimeout(() => {
        startPreviewAnimation();
      }, 50);
      
      return () => {
        clearTimeout(timer);
        stopPreviewAnimation();
      };
    }
  }, [showModal, startPreviewAnimation, stopPreviewAnimation]);
  
  // Don't render anything if the modal shouldn't be shown
  if (!showModal) {
    return null;
  }
  
  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-title">Preview Animation</div>
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={400} 
          className="preview-canvas"
        />
        <div className="modal-buttons">
          <button 
            className="tertiary-btn" 
            onClick={handleClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PreviewModal); 