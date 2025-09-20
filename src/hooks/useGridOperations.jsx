import { useCallback } from 'react';
import { useBuilderContext } from '../contexts/BuilderContext';
import { MIN_DRAW_GRID, MAX_DRAW_GRID } from '../utils/constants';

const useGridOperations = () => {
  const { state, dispatch } = useBuilderContext();
  
  // Find nearest grid point to coordinates
  const findNearestGridPoint = useCallback((x, y) => {
    const { gridPointSize } = state;
    
    if (gridPointSize <= 0) return null;
    
    const gridX = Math.round(x / gridPointSize);
    const gridY = Math.round(y / gridPointSize);
    
    // Ensure we're within grid bounds
    const boundedGridX = Math.max(0, Math.min(16, gridX));
    const boundedGridY = Math.max(0, Math.min(16, gridY));
    
    return {
      x: boundedGridX,
      y: boundedGridY,
      canvasX: boundedGridX * gridPointSize,
      canvasY: boundedGridY * gridPointSize
    };
  }, [state.gridPointSize]);
  
  // Set a point (used in sketch and record modes)
  const handleSetPoint = useCallback(() => {
    const { mode, sketch, hoveredGridPoint, gridPointSize } = state;
    
    // Validate grid point
    if (!hoveredGridPoint) return;
    
    // Check if we're on an edge
    const isOnEdge = hoveredGridPoint.x < MIN_DRAW_GRID || 
                     hoveredGridPoint.x > MAX_DRAW_GRID || 
                     hoveredGridPoint.y < MIN_DRAW_GRID || 
                     hoveredGridPoint.y > MAX_DRAW_GRID;
    
    if (isOnEdge) {
      console.log('Cannot draw on edges');
      return;
    }
    
    // Process based on mode - we now only use this for sketch mode
    // Record mode is handled directly in GridCanvas.jsx
    if (mode === 'sketch') {
      // Check if we have a pending point
      if (sketch.pendingPoint !== null) {
        // We're connecting to another dot
        const fromIndex = sketch.pendingPoint;
        
        // Look for an existing dot at this location
        const existingDotIndex = sketch.dots.findIndex(
          dot => dot.gridX === hoveredGridPoint.x && dot.gridY === hoveredGridPoint.y
        );
        
        if (existingDotIndex !== -1 && existingDotIndex !== fromIndex) {
          // Connect to existing dot
          dispatch({ 
            type: 'ADD_LINE', 
            line: { from: fromIndex, to: existingDotIndex } 
          });
          
          // Set the existing dot as the new pending point to continue the line
          dispatch({ type: 'SET_PENDING_POINT', index: existingDotIndex });
        } else {
          // Create a new dot and connect
          const newDot = {
            gridX: hoveredGridPoint.x,
            gridY: hoveredGridPoint.y,
            x: hoveredGridPoint.x * gridPointSize,
            y: hoveredGridPoint.y * gridPointSize
          };
          
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
        const existingDotIndex = sketch.dots.findIndex(
          dot => dot.gridX === hoveredGridPoint.x && dot.gridY === hoveredGridPoint.y
        );
        
        if (existingDotIndex !== -1) {
          // Start a line from this dot
          dispatch({ type: 'SET_PENDING_POINT', index: existingDotIndex });
        } else {
          // Create a new dot
          const newDot = {
            gridX: hoveredGridPoint.x,
            gridY: hoveredGridPoint.y,
            x: hoveredGridPoint.x * gridPointSize,
            y: hoveredGridPoint.y * gridPointSize
          };
          
          dispatch({ type: 'ADD_DOT', dot: newDot });
          
          // Start a line from this new dot
          dispatch({ type: 'SET_PENDING_POINT', index: sketch.dots.length });
        }
      }
    }
    // Record mode handling has been moved to GridCanvas.jsx
  }, [state, dispatch]);
  
  // Cancel current point operation
  const handleCancelPoint = useCallback(() => {
    const { mode, sketch, recording } = state;
    
    // In any mode, if there's a pending point, clear it
    if (sketch.pendingPoint !== null) {
      dispatch({ type: 'SET_PENDING_POINT', index: null });
    } else if (mode === 'edit' && sketch.selectedDot !== null) {
      dispatch({ type: 'SET_SELECTED_DOT', index: null });
    }
  }, [state, dispatch]);
  
  // Handle dot selection in edit mode
  const handleDotSelect = useCallback((index) => {
    const { mode } = state;
    
    if (mode === 'edit') {
      dispatch({ type: 'SET_SELECTED_DOT', index });
    }
  }, [state, dispatch]);
  
  // Remove selected dot
  const handleRemoveDot = useCallback((dotIndex = null) => {
    const { mode, sketch } = state;
    const indexToRemove = dotIndex !== null ? dotIndex : sketch.selectedDot;
    
    if (mode === 'edit' && indexToRemove !== null) {
      dispatch({ type: 'REMOVE_DOT', index: indexToRemove });
    }
  }, [state, dispatch]);
  
  return {
    findNearestGridPoint,
    handleSetPoint,
    handleCancelPoint,
    handleDotSelect,
    handleRemoveDot
  };
};

export default useGridOperations; 