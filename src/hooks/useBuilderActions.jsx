import { useCallback } from 'react';
import { useBuilderContext } from '../contexts/BuilderContext';
import { GRID_SIZE, MIN_DRAW_GRID, MAX_DRAW_GRID } from '../utils/constants';

/**
 * useBuilderActions - Centralized hook for all builder actions
 * This hook provides actions that can be used by both mouse/keyboard and touch interfaces
 */
const useBuilderActions = () => {
  const { state, dispatch } = useBuilderContext();
  
  // Find nearest grid point to coordinates
  const findNearestGridPoint = useCallback((x, y) => {
    const { gridPointSize } = state;
    
    if (gridPointSize <= 0) return null;
    
    const gridX = Math.round(x / gridPointSize);
    const gridY = Math.round(y / gridPointSize);
    
    // Ensure we're within grid bounds
    const boundedGridX = Math.max(0, Math.min(GRID_SIZE, gridX));
    const boundedGridY = Math.max(0, Math.min(GRID_SIZE, gridY));
    
    return {
      x: boundedGridX,
      y: boundedGridY,
      canvasX: boundedGridX * gridPointSize,
      canvasY: boundedGridY * gridPointSize
    };
  }, [state.gridPointSize]);
  
  // Check if a point is on the edge
  const isPointOnEdge = useCallback((point) => {
    return point.x < MIN_DRAW_GRID || 
           point.x > MAX_DRAW_GRID || 
           point.y < MIN_DRAW_GRID || 
           point.y > MAX_DRAW_GRID;
  }, []);

  // Update hover state with grid point
  const updateHoverState = useCallback((gridPoint) => {
    dispatch({ 
      type: 'SET_TOUCH_INFO', 
      touch: { 
        lastTouchX: gridPoint.canvasX, 
        lastTouchY: gridPoint.canvasY 
      } 
    });
    
    dispatch({ 
      type: 'SET_HOVERED_GRID_POINT', 
      point: { x: gridPoint.x, y: gridPoint.y } 
    });
  }, [dispatch]);
  
  // Find if there's an existing dot at the current hover position
  const findExistingDot = useCallback((gridX, gridY, dotsArray) => {
    return dotsArray.findIndex(
      dot => dot.gridX === gridX && dot.gridY === gridY
    );
  }, []);
  
  // Create a new dot at position
  const createDot = useCallback((gridX, gridY) => {
    const { gridPointSize } = state;
    
    return {
      gridX,
      gridY,
      x: gridX * gridPointSize,
      y: gridY * gridPointSize
    };
  }, [state.gridPointSize]);
  
  // --- SKETCH MODE ACTIONS ---
  
  // Set a point in sketch mode
  const handleSetPoint = useCallback(() => {
    const { mode, sketch, hoveredGridPoint, gridPointSize } = state;
    
    // Validate grid point
    if (!hoveredGridPoint) return;
    
    // Check if we're on an edge
    if (isPointOnEdge(hoveredGridPoint)) {
      console.log('Cannot draw on edges');
      return;
    }
    
    // Process based on mode - we now only use this for sketch mode
    if (mode === 'sketch') {
      // Check if we have a pending point
      if (sketch.pendingPoint !== null) {
        // We're connecting to another dot
        const fromIndex = sketch.pendingPoint;
        
        // Look for an existing dot at this location
        const existingDotIndex = findExistingDot(
          hoveredGridPoint.x, 
          hoveredGridPoint.y, 
          sketch.dots
        );
        
        if (existingDotIndex !== -1 && existingDotIndex !== fromIndex) {
          // Connect to existing dot
          dispatch({ 
            type: 'ADD_LINE', 
            line: { from: fromIndex, to: existingDotIndex } 
          });
          
          // Set the existing dot as the new pending point for continuous drawing
          dispatch({ type: 'SET_PENDING_POINT', index: existingDotIndex });
        } else {
          // Create a new dot and connect
          const newDot = createDot(hoveredGridPoint.x, hoveredGridPoint.y);
          
          dispatch({ type: 'ADD_DOT', dot: newDot });
          
          // Connect to the new dot (it will be the last one in the array)
          dispatch({ 
            type: 'ADD_LINE', 
            line: { from: fromIndex, to: sketch.dots.length } 
          });
          
          // Set the new dot as the pending point to continue the line
          dispatch({ type: 'SET_PENDING_POINT', index: sketch.dots.length });
        }
      } else {
        // Look for an existing dot at this location
        const existingDotIndex = findExistingDot(
          hoveredGridPoint.x, 
          hoveredGridPoint.y, 
          sketch.dots
        );
        
        if (existingDotIndex !== -1) {
          // Start a line from this dot
          dispatch({ type: 'SET_PENDING_POINT', index: existingDotIndex });
        } else {
          // Create a new dot
          const newDot = createDot(hoveredGridPoint.x, hoveredGridPoint.y);
          
          dispatch({ type: 'ADD_DOT', dot: newDot });
          
          // Start a line from this new dot
          dispatch({ type: 'SET_PENDING_POINT', index: sketch.dots.length });
        }
      }
    }
  }, [state, dispatch, findExistingDot, createDot, isPointOnEdge]);
  
  // --- RECORD MODE ACTIONS ---
  
  // Connect to or create a recording dot
  const handleRecordingOperation = useCallback(() => {
    if (state.mode !== 'record' || !state.recording.isRecording || !state.hoveredGridPoint) {
      return;
    }
    
    // Check if we're on an edge
    if (isPointOnEdge(state.hoveredGridPoint)) {
      return;
    }
    
    // First check if there's a recording dot at this position
    const existingRecordingDotIndex = findExistingDot(
      state.hoveredGridPoint.x, 
      state.hoveredGridPoint.y, 
      state.recording.dots
    );
    
    // If we found a recording dot
    if (existingRecordingDotIndex !== -1) {
      // Either start a line from this dot or connect to it
      if (state.sketch.pendingPoint === null) {
        // Start a line from this dot
        dispatch({ type: 'SET_PENDING_POINT', index: existingRecordingDotIndex });
      } else {
        // Connect to this dot if it's not the same as the pending point
        if (state.sketch.pendingPoint !== existingRecordingDotIndex) {
          // Create line in recording
          const newLine = { from: state.sketch.pendingPoint, to: existingRecordingDotIndex };
          
          // Check if line already exists
          const lineExists = state.recording.lines.some(
            line => (line.from === newLine.from && line.to === newLine.to) ||
                   (line.from === newLine.to && line.to === newLine.from)
          );
          
          if (!lineExists) {
            dispatch({ type: 'ADD_RECORDING_LINE', line: newLine });
          }
          
          // Always add to sequence
          dispatch({ type: 'ADD_TO_SEQUENCE', line: newLine });
          
          // Set this dot as the new pending point for continuous drawing
          dispatch({ type: 'SET_PENDING_POINT', index: existingRecordingDotIndex });
        }
      }
      return true; // Handled the recording dot
    }
    
    // If no recording dot, check for sketch dot at this position
    const existingSketchDotIndex = findExistingDot(
      state.hoveredGridPoint.x, 
      state.hoveredGridPoint.y, 
      state.sketch.dots
    );
    // Check if a recording dot at this grid position already exists
    const existingRecordingDotIndex2 = findExistingDot(
      state.hoveredGridPoint.x,
      state.hoveredGridPoint.y,
      state.recording.dots
    );
    if (existingSketchDotIndex !== -1) {
      // If a recording dot already exists at this position, use it
      if (existingRecordingDotIndex2 !== -1) {
        if (state.sketch.pendingPoint !== null) {
          const newLine = { from: state.sketch.pendingPoint, to: existingRecordingDotIndex2 };
          dispatch({ type: 'ADD_RECORDING_LINE', line: newLine });
          dispatch({ type: 'ADD_TO_SEQUENCE', line: newLine });
        }
        dispatch({ type: 'SET_PENDING_POINT', index: existingRecordingDotIndex2 });
        return true;
      }
      // Copy the sketch dot to recording dots
      const sketchDot = state.sketch.dots[existingSketchDotIndex];
      const newDot = { ...sketchDot };
      dispatch({ type: 'ADD_RECORDING_DOT', dot: newDot });
      const newDotIndex = state.recording.dots.length;
      if (state.sketch.pendingPoint !== null) {
        const newLine = { from: state.sketch.pendingPoint, to: newDotIndex };
        dispatch({ type: 'ADD_RECORDING_LINE', line: newLine });
        dispatch({ type: 'ADD_TO_SEQUENCE', line: newLine });
      }
      dispatch({ type: 'SET_PENDING_POINT', index: newDotIndex });
      return true;
    }
    
    // If we reach here, there's no dot at this position, create a new one
    if (state.sketch.pendingPoint !== null) {
      // We have a pending point, create new dot and connect
      const newDot = createDot(state.hoveredGridPoint.x, state.hoveredGridPoint.y);
      
      dispatch({ type: 'ADD_RECORDING_DOT', dot: newDot });
      const newDotIndex = state.recording.dots.length;
      
      // Connect to the new dot
      const newLine = { from: state.sketch.pendingPoint, to: newDotIndex };
      
      dispatch({ type: 'ADD_RECORDING_LINE', line: newLine });
      dispatch({ type: 'ADD_TO_SEQUENCE', line: newLine });
      
      // Make this new dot the pending point
      dispatch({ type: 'SET_PENDING_POINT', index: newDotIndex });
    } else {
      // No pending point, just create a new dot
      const newDot = createDot(state.hoveredGridPoint.x, state.hoveredGridPoint.y);
      
      dispatch({ type: 'ADD_RECORDING_DOT', dot: newDot });
      
      // Make this new dot the pending point
      dispatch({ type: 'SET_PENDING_POINT', index: state.recording.dots.length });
    }
    
    return true; // Handled record mode
  }, [state, dispatch, findExistingDot, createDot, isPointOnEdge]);
  
  // --- EDIT MODE ACTIONS ---
  
  // Select a dot in edit mode
  const handleDotSelect = useCallback((gridX, gridY) => {
    if (state.mode !== 'edit') return false;
    
    const existingDotIndex = findExistingDot(gridX, gridY, state.sketch.dots);
    
    if (existingDotIndex !== -1) {
      // Select this dot
      dispatch({ type: 'SET_SELECTED_DOT', index: existingDotIndex });
      return true;
    }
    
    return false;
  }, [state.mode, state.sketch.dots, dispatch, findExistingDot]);
  
  // Start dragging a dot in edit mode
  const handleStartDrag = useCallback((gridX, gridY) => {
    if (state.mode !== 'edit') return false;
    
    const existingDotIndex = findExistingDot(gridX, gridY, state.sketch.dots);
    
    if (existingDotIndex !== -1) {
      // Start drag operation in edit mode
      dispatch({
        type: 'SET_DRAGGING',
        isDragging: true,
        dotIndex: existingDotIndex,
        startTime: Date.now(),
      });
      
      dispatch({ type: 'SET_SELECTED_DOT', index: existingDotIndex });
      return true;
    }
    
    return false;
  }, [state.mode, state.sketch.dots, dispatch, findExistingDot]);
  
  // Update dot position during drag
  const handleDragMove = useCallback((gridX, gridY) => {
    if (!state.isDragging || state.draggedDotIndex === null) return false;
    
    if (isPointOnEdge({ x: gridX, y: gridY })) return false;
    
    dispatch({
      type: 'UPDATE_DOT_POSITION',
      index: state.draggedDotIndex,
      x: gridX * state.gridPointSize,
      y: gridY * state.gridPointSize,
      gridX: gridX,
      gridY: gridY,
    });
    
    return true;
  }, [state.isDragging, state.draggedDotIndex, state.gridPointSize, dispatch, isPointOnEdge]);
  
  // End dragging a dot
  const handleEndDrag = useCallback((shouldRemove = false) => {
    if (!state.isDragging) return;
    
    if (shouldRemove && state.mode === 'edit' && state.draggedDotIndex !== null) {
      // Remove the dot
      dispatch({ type: 'REMOVE_DOT', index: state.draggedDotIndex });
    }
    
    // End drag operation
    dispatch({
      type: 'SET_DRAGGING',
      isDragging: false,
      dotIndex: null,
      startTime: null,
    });
  }, [state.isDragging, state.mode, state.draggedDotIndex, dispatch]);
  
  // SHARED ACTIONS
  
  // Cancel current point operation
  const handleCancelPoint = useCallback(() => {
    // In any mode, if there's a pending point, clear it
    if (state.sketch.pendingPoint !== null) {
      dispatch({ type: 'SET_PENDING_POINT', index: null });
      return true;
    } 
    
    return false;
  }, [state.sketch.pendingPoint, dispatch]);
  
  // Remove selected dot (used in edit mode)
  const handleRemoveDot = useCallback((dotIndex = null) => {
    const { mode, sketch } = state;
    const indexToRemove = dotIndex !== null ? dotIndex : sketch.selectedDot;
    
    if (mode === 'edit' && indexToRemove !== null) {
      dispatch({ type: 'REMOVE_DOT', index: indexToRemove });
      return true;
    }
    
    return false;
  }, [state, dispatch]);
  
  return {
    // Point utilities
    findNearestGridPoint,
    isPointOnEdge,
    updateHoverState,
    findExistingDot,
    createDot,
    
    // Sketch mode actions
    handleSetPoint,
    
    // Record mode actions
    handleRecordingOperation,
    
    // Edit mode actions
    handleDotSelect,
    handleStartDrag,
    handleDragMove,
    handleEndDrag,
    
    // Shared actions
    handleCancelPoint,
    handleRemoveDot
  };
};

export default useBuilderActions; 