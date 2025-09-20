import { useCallback, useState } from 'react';
import { useBuilderContext } from '../contexts/BuilderContext';
import useBuilderActions from './useBuilderActions';

/**
 * useTouchControls - Hook for touch interactions
 * This hook provides touch-specific controls for the builder canvas,
 * leveraging the shared actions from useBuilderActions
 */
const useTouchControls = (canvasRef) => {
  const { state } = useBuilderContext();
  const [touchPreviewPoint, setTouchPreviewPoint] = useState(null);
  const [showEdgeWarning, setShowEdgeWarning] = useState(false);
  
  const {
    findNearestGridPoint,
    isPointOnEdge,
    updateHoverState,
    handleSetPoint,
    handleRecordingOperation,
    handleDotSelect,
    handleCancelPoint,
    handleRemoveDot
  } = useBuilderActions();
  
  // Convert touch coordinates to canvas coordinates
  const touchToCanvasCoords = useCallback((touchX, touchY) => {
    if (!canvasRef.current) return null;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = touchX - rect.left;
    const y = touchY - rect.top;
    
    return { x, y };
  }, [canvasRef]);
  
  // Handle touch start - just sets preview and hover state
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const canvasCoords = touchToCanvasCoords(touch.clientX, touch.clientY);
      if (!canvasCoords) return;
      
      const gridPoint = findNearestGridPoint(canvasCoords.x, canvasCoords.y);
      if (!gridPoint) return;
      
      // Check for edge touches
      if (isPointOnEdge(gridPoint)) {
        setShowEdgeWarning(true);
        setTimeout(() => setShowEdgeWarning(false), 1500);
        return;
      }
      
      // Update preview point
      setTouchPreviewPoint({ x: gridPoint.x, y: gridPoint.y });
      
      // Update hover state for visual feedback
      updateHoverState(gridPoint);
      
      // In edit mode, select dots when touched
      if (state.mode === 'edit') {
        handleDotSelect(gridPoint.x, gridPoint.y);
      }
    }
  }, [state.mode, findNearestGridPoint, isPointOnEdge, updateHoverState, handleDotSelect, touchToCanvasCoords]);
  
  // Handle touch move - update preview point
  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const canvasCoords = touchToCanvasCoords(touch.clientX, touch.clientY);
      if (!canvasCoords) return;
      
      const gridPoint = findNearestGridPoint(canvasCoords.x, canvasCoords.y);
      if (!gridPoint) return;
      
      // Skip edge points during touch move
      if (isPointOnEdge(gridPoint)) return;
      
      // Update preview point
      setTouchPreviewPoint({ x: gridPoint.x, y: gridPoint.y });
      
      // Update hover state for visual feedback
      updateHoverState(gridPoint);
    }
  }, [findNearestGridPoint, isPointOnEdge, updateHoverState, touchToCanvasCoords]);
  
  // Handle touch end - keep the preview state for the "Set Point" button
  const handleTouchEnd = useCallback(() => {
    // Keep preview visible until Set Point is pressed
  }, []);
  
  // Handle the "Set Point" button press
  const handleSetPointBtn = useCallback(() => {
    if (state.mode === 'sketch') {
      handleSetPoint();
    } else if (state.mode === 'record' && state.recording.isRecording) {
      handleRecordingOperation();
    }
  }, [state.mode, state.recording.isRecording, handleSetPoint, handleRecordingOperation]);
  
  // Handle the "Cancel Point" / "Remove Point" button press
  const handleCancelPointBtn = useCallback(() => {
    if (state.mode === 'edit') {
      handleRemoveDot();
    } else {
      handleCancelPoint();
    }
  }, [state.mode, handleCancelPoint, handleRemoveDot]);
  
  return {
    touchPreviewPoint,
    showEdgeWarning,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleSetPointBtn,
    handleCancelPointBtn
  };
};

export default useTouchControls; 