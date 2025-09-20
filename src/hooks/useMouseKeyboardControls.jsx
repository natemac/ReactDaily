import { useCallback, useRef } from 'react';
import { useBuilderContext } from '../contexts/BuilderContext';
import useBuilderActions from './useBuilderActions';

/**
 * useMouseKeyboardControls - Hook for mouse and keyboard interactions
 * This hook provides mouse and keyboard specific controls for the builder
 * canvas, leveraging the shared actions from useBuilderActions
 */
const useMouseKeyboardControls = (canvasRef) => {
  const { state } = useBuilderContext();
  const lastClickTimeRef = useRef(0);

  const {
    findNearestGridPoint,
    isPointOnEdge, 
    updateHoverState,
    handleSetPoint,
    handleRecordingOperation,
    handleDotSelect,
    handleStartDrag,
    handleDragMove,
    handleEndDrag,
    handleCancelPoint
  } = useBuilderActions();

  // Convert client coordinates to grid coordinates
  const clientToGridCoords = useCallback((clientX, clientY) => {
    if (!canvasRef.current) return null;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    return { x, y };
  }, [canvasRef]);
  
  // Handle mouse movement
  const handleMouseMove = useCallback((e) => {
    const canvasCoords = clientToGridCoords(e.clientX, e.clientY);
    if (!canvasCoords) return;
    
    const gridPoint = findNearestGridPoint(canvasCoords.x, canvasCoords.y);
    if (!gridPoint) return;
    
    // Update hover state
    updateHoverState(gridPoint);
    
    // Handle dragging in edit mode
    if (state.isDragging && state.draggedDotIndex !== null) {
      handleDragMove(gridPoint.x, gridPoint.y);
    }
  }, [findNearestGridPoint, updateHoverState, state.isDragging, state.draggedDotIndex, handleDragMove, clientToGridCoords]);
  
  // Handle mouse down 
  const handleMouseDown = useCallback((e) => {
    // Only process left clicks
    if (e.button !== 0) return;
    
    // Check if this is a touch device being emulated
    const isTouchEmulation = window.navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
    if (isTouchEmulation) return; // Let touch handlers handle it
    
    const canvasCoords = clientToGridCoords(e.clientX, e.clientY);
    if (!canvasCoords) return;
    
    const gridPoint = findNearestGridPoint(canvasCoords.x, canvasCoords.y);
    if (!gridPoint || !state.hoveredGridPoint) return;
    
    // Check for edge clicks
    if (isPointOnEdge(gridPoint)) {
      return; // Don't process edge clicks
    }
    
    // Double click detection
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;
    lastClickTimeRef.current = now;
    
    if (timeSinceLastClick < 300) { // 300ms is typical double-click threshold
      // Double click detected - cancel pending point
      if ((state.mode === 'sketch' || (state.mode === 'record' && state.recording.isRecording)) 
          && state.sketch.pendingPoint !== null) {
        handleCancelPoint();
        return;
      }
    }
    
    // Process based on current mode
    if (state.mode === 'record' && state.recording.isRecording) {
      handleRecordingOperation();
    } else if (state.mode === 'sketch') {
      handleSetPoint();
    } else if (state.mode === 'edit') {
      handleStartDrag(gridPoint.x, gridPoint.y);
    }
  }, [
    state.hoveredGridPoint, 
    state.mode, 
    state.sketch.pendingPoint, 
    state.recording.isRecording,
    findNearestGridPoint, 
    isPointOnEdge,
    handleRecordingOperation,
    handleSetPoint,
    handleStartDrag,
    handleCancelPoint,
    clientToGridCoords
  ]);
  
  // Handle mouse up
  const handleMouseUp = useCallback((e) => {
    if (state.isDragging) {
      const dragDuration = Date.now() - (state.dragStartTime || 0);
      
      // Short click (less than 200ms) in edit mode removes the dot
      const shouldRemove = dragDuration < 200 && state.mode === 'edit';
      handleEndDrag(shouldRemove);
    }
  }, [state.isDragging, state.dragStartTime, state.mode, handleEndDrag]);
  
  // Setup and cleanup global mouse handlers
  const setupGlobalListeners = useCallback((handleGlobalMouseUp, handleMouseLeave) => {
    window.addEventListener('mouseup', handleGlobalMouseUp);
    canvasRef.current?.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      canvasRef.current?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [canvasRef]);
  
  return {
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
    setupGlobalListeners
  };
};

export default useMouseKeyboardControls; 