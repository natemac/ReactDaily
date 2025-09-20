import React, { useRef, useEffect, useCallback } from 'react';
import { useBuilderContext } from '../../../contexts/BuilderContext';
import useBuilderActions from '../../../hooks/useBuilderActions';
import useMouseKeyboardControls from '../../../hooks/useMouseKeyboardControls';
import useTouchControls from '../../../hooks/useTouchControls';
import { GRID_SIZE, DOT_RADIUS, MIN_DRAW_GRID, MAX_DRAW_GRID } from '../../../utils/constants';
import ReferenceImageButton from '../Controls/ReferenceImageButton';
import styles from './GridCanvas.module.css';

const GridCanvas = () => {
  const { state, dispatch } = useBuilderContext();
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const referenceImageRef = useRef(null);
  
  // Get actions and controls from our hooks
  const { isPointOnEdge } = useBuilderActions();
  
  // Mouse/keyboard controls
  const {
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
    setupGlobalListeners
  } = useMouseKeyboardControls(canvasRef);
  
  // Touch controls
  const {
    touchPreviewPoint,
    showEdgeWarning,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  } = useTouchControls(canvasRef);
  
  // Draw grid lines
  const drawGrid = useCallback((ctx) => {
    if (!ctx || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const { width, height } = canvas;
    const { gridPointSize } = state;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw grid lines
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let i = 0; i <= GRID_SIZE; i++) {
      const x = i * gridPointSize;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let i = 0; i <= GRID_SIZE; i++) {
      const y = i * gridPointSize;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw grid points (skip edge points)
    for (let x = 0; x <= GRID_SIZE; x++) {
      for (let y = 0; y <= GRID_SIZE; y++) {
        // Skip drawing points on the edges
        if (x === 0 || x === GRID_SIZE || y === 0 || y === GRID_SIZE) {
          continue;
        }
        
        const pointX = x * gridPointSize;
        const pointY = y * gridPointSize;
        
        ctx.fillStyle = '#bbb';
        ctx.beginPath();
        ctx.arc(pointX, pointY, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Highlight hovered grid point
    if (state.hoveredGridPoint) {
      // Check if we're on an edge
      const isOnEdge = isPointOnEdge(state.hoveredGridPoint);
      
      ctx.fillStyle = isOnEdge ? '#f88' : '#aaa';
      ctx.beginPath();
      ctx.arc(
        state.hoveredGridPoint.x * gridPointSize,
        state.hoveredGridPoint.y * gridPointSize,
        4, 0, Math.PI * 2
      );
      ctx.fill();
    }
  }, [state.gridPointSize, state.hoveredGridPoint, isPointOnEdge]);

  // Draw sketch function
  const drawSketch = useCallback((ctx, opacity = 1.0) => {
    if (!ctx) return;
    
    ctx.globalAlpha = opacity;
    
    // Draw lines
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    
    state.sketch.lines.forEach(line => {
      const from = state.sketch.dots[line.from];
      const to = state.sketch.dots[line.to];
      
      if (!from || !to) return;
      
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    });
    
    // Draw dots
    state.sketch.dots.forEach((dot, index) => {
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw dot index
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '8px Arial';
      ctx.fillText(index.toString(), dot.x, dot.y);
    });
    
    // Highlight selected dot
    if (state.sketch.selectedDot !== null && state.sketch.dots[state.sketch.selectedDot]) {
      ctx.globalAlpha = 1.0;
      const dot = state.sketch.dots[state.sketch.selectedDot];
      
      ctx.strokeStyle = '#f00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, DOT_RADIUS + 3, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Reset opacity
    ctx.globalAlpha = 1.0;
  }, [state.sketch.dots, state.sketch.lines, state.sketch.selectedDot]);

  // Draw recording function
  const drawRecording = useCallback((ctx) => {
    if (!ctx) return;
    
    // Draw lines
    state.recording.lines.forEach(line => {
      const from = state.recording.dots[line.from];
      const to = state.recording.dots[line.to];
      
      if (!from || !to) return;
      
      // Check if this line is in the recording sequence
      const inSequence = state.recording.sequence.some(
        seqLine => seqLine.from === line.from && seqLine.to === line.to
      );
      
      if (inSequence) {
        ctx.strokeStyle = '#4CAF50'; // Green for recorded lines
        ctx.lineWidth = 4; // Double thickness
      } else {
        ctx.strokeStyle = '#000'; // Black for non-recorded lines
        ctx.lineWidth = 2;
      }
      
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    });
    
    // Draw dots
    state.recording.dots.forEach((dot, index) => {
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw dot index
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '8px Arial';
      ctx.fillText(index.toString(), dot.x, dot.y);
    });
  }, [state.recording.dots, state.recording.lines, state.recording.sequence]);

  // Draw reference image
  const drawReferenceImage = useCallback((ctx) => {
    if (!ctx || !state.referenceImage.src || !state.referenceImage.isVisible) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const img = referenceImageRef.current;
    if (!img || !img.complete) return;
    
    // Calculate dimensions to fit the image within the canvas while maintaining aspect ratio
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imgWidth = img.width;
    const imgHeight = img.height;
    
    const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight);
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;
    
    // Center the image
    const x = (canvasWidth - scaledWidth) / 2;
    const y = (canvasHeight - scaledHeight) / 2;
    
    // Save context state
    ctx.save();
    
    // Set opacity to 30%
    ctx.globalAlpha = 0.3;
    
    // Draw the image
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
    
    // Restore context state
    ctx.restore();
  }, [state.referenceImage.src, state.referenceImage.isVisible]);

  // Draw preview line
  const drawPreviewLine = useCallback((ctx) => {
    if (!ctx) return;
    
    // Draw the touch preview point if it exists
    if (touchPreviewPoint && (state.mode === 'sketch' || state.mode === 'record')) {
      const x = touchPreviewPoint.x * state.gridPointSize;
      const y = touchPreviewPoint.y * state.gridPointSize;
      
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.arc(x, y, DOT_RADIUS + 5, 0, Math.PI * 2);
      ctx.stroke();
      
      // If we have a pending point, draw the preview line
      if (state.sketch.pendingPoint !== null) {
        const dotsArray = state.mode === 'sketch' ? state.sketch.dots : state.recording.dots;
        
        if (state.sketch.pendingPoint < dotsArray.length) {
          const fromDot = dotsArray[state.sketch.pendingPoint];
          
          ctx.strokeStyle = 'rgba(0, 0, 255, 0.7)';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          
          ctx.beginPath();
          ctx.moveTo(fromDot.x, fromDot.y);
          ctx.lineTo(x, y);
          ctx.stroke();
          
          ctx.setLineDash([]);
        }
      }
    }
    
    // Original preview line code for mouse interaction
    if (state.sketch.pendingPoint !== null && state.hoveredGridPoint) {
      const dotsArray = state.mode === 'sketch' ? state.sketch.dots : state.recording.dots;
      
      if (state.sketch.pendingPoint < dotsArray.length) {
        const fromDot = dotsArray[state.sketch.pendingPoint];
        const toPoint = {
          x: state.hoveredGridPoint.x * state.gridPointSize,
          y: state.hoveredGridPoint.y * state.gridPointSize
        };
        
        ctx.strokeStyle = 'rgba(0, 0, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        ctx.beginPath();
        ctx.moveTo(fromDot.x, fromDot.y);
        ctx.lineTo(toPoint.x, toPoint.y);
        ctx.stroke();
        
        ctx.setLineDash([]);
      }
    }
    
    // Highlight pending point if it exists
    if (state.sketch.pendingPoint !== null) {
      const dotsArray = state.mode === 'sketch' ? state.sketch.dots : state.recording.dots;
      
      if (state.sketch.pendingPoint < dotsArray.length) {
        const dot = dotsArray[state.sketch.pendingPoint];
        
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, DOT_RADIUS + 5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    
    // Show green circle around mouse cursor when hovering over a grid point
    if (state.hoveredGridPoint) {
      const onEdge = isPointOnEdge(state.hoveredGridPoint);
                      
      if (!onEdge) {
        const hoverX = state.hoveredGridPoint.x * state.gridPointSize;
        const hoverY = state.hoveredGridPoint.y * state.gridPointSize;
        
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(hoverX, hoverY, DOT_RADIUS + 5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }, [state.mode, state.sketch.pendingPoint, state.hoveredGridPoint, state.gridPointSize, state.sketch.dots, state.recording.dots, touchPreviewPoint, isPointOnEdge]);
  
  // Resize canvas to match container
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        
        // Set canvas dimensions
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        
        // Calculate cell size
        const newGridPointSize = canvas.width / GRID_SIZE;
        dispatch({ type: 'SET_GRID_POINT_SIZE', size: newGridPointSize });
        
        // Immediately redraw the grid after resize
        const ctx = canvas.getContext('2d');
        drawGrid(ctx);
        drawSketch(ctx);
        if (state.mode === 'record') {
          drawRecording(ctx);
        }
        if (state.sketch.pendingPoint !== null) {
          drawPreviewLine(ctx);
        }
      }
    };

    // Initial setup
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [dispatch, drawGrid, drawSketch, drawRecording, drawPreviewLine, state.mode, state.sketch.pendingPoint]);

  // Main render function
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw grid
    drawGrid(ctx);
    
    // Draw reference image first (behind everything else)
    drawReferenceImage(ctx);
    
    // Draw content based on current mode
    if (state.mode === 'sketch' || state.mode === 'edit') {
      drawSketch(ctx);
    } else if (state.mode === 'record') {
      // Draw sketch with reduced opacity
      drawSketch(ctx, 0.3);
      
      // Draw recording data on top at full opacity
      drawRecording(ctx);
    } else if (state.mode === 'preview') {
      // Only draw recording in preview mode
      drawRecording(ctx);
    }
    
    // Draw any preview lines
    drawPreviewLine(ctx);
  }, [state.mode, drawGrid, drawReferenceImage, drawSketch, drawRecording, drawPreviewLine]);

  // Load reference image when src changes
  useEffect(() => {
    if (state.referenceImage.src) {
      const img = new Image();
      img.onload = () => {
        referenceImageRef.current = img;
        redrawCanvas();
      };
      img.src = state.referenceImage.src;
    } else {
      referenceImageRef.current = null;
    }
  }, [state.referenceImage.src, redrawCanvas]);

  // Update canvas when relevant state changes
  useEffect(() => {
    redrawCanvas();
  }, [
    redrawCanvas,
    state.mode,
    state.sketch.dots,
    state.sketch.lines,
    state.recording.dots,
    state.recording.lines,
    state.recording.sequence,
    state.sketch.selectedDot,
    state.sketch.pendingPoint,
    state.hoveredGridPoint,
    touchPreviewPoint,
    state.referenceImage.isVisible
  ]);

  // Add mouseup and mouseleave handlers to stop dragging
  useEffect(() => {
    const handleGlobalMouseUp = (e) => {
      handleMouseUp(e);
    };
    
    const handleMouseLeave = () => {
      if (state.isDragging) {
        dispatch({
          type: 'SET_DRAGGING',
          isDragging: false,
          dotIndex: null,
          startTime: null,
        });
      }
    };
    
    // Use our helper to set up and clean up global listeners
    return setupGlobalListeners(handleGlobalMouseUp, handleMouseLeave);
  }, [state.isDragging, handleMouseUp, dispatch, setupGlobalListeners]);

  return (
    <div ref={containerRef} className={styles.gridContainer}>
      <canvas 
        ref={canvasRef} 
        className={styles.gridCanvas}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      
      <div className={styles.positionDisplay}>
        Grid: {state.hoveredGridPoint ? `${state.hoveredGridPoint.x},${state.hoveredGridPoint.y}` : '0,0'}
      </div>
      
      {state.recording.isRecording && (
        <div className={styles.recordingIndicator}>
          RECORDING
        </div>
      )}
      
      {showEdgeWarning && (
        <div className={styles.edgeWarning}>
          Cannot draw on edges
        </div>
      )}
      
      {!state.recording.isRecording && <ReferenceImageButton />}
    </div>
  );
};

export default GridCanvas; 