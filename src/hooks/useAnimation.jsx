import { useCallback, useRef, useEffect } from 'react';
import { useBuilderContext } from '../contexts/BuilderContext';

const useAnimation = (canvasRef) => {
  const { state, dispatch } = useBuilderContext();
  const animationFrameRef = useRef(null);
  const animationStateRef = useRef({
    currentLineIndex: 0,
    completedLines: [],
    animationProgress: 0
  });
  
  // Calculate scale for preview canvas
  const calculateScale = useCallback(() => {
    if (!canvasRef.current) return 1;
    
    const canvas = canvasRef.current;
    // Original grid is designed for a 560x560 area
    const baseSize = 560;
    
    return Math.min(canvas.width, canvas.height) / baseSize;
  }, []);
  
  // Draw preview frame - use refs for state to avoid dependency issues
  const drawPreviewFrame = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // --- Bounding box calculation ---
    const { recording } = state;
    const usedDotIndices = new Set();
    recording.sequence.forEach(line => {
      usedDotIndices.add(line.from);
      usedDotIndices.add(line.to);
    });
    const usedDots = Array.from(usedDotIndices)
      .map(idx => recording.dots[idx])
      .filter(Boolean);
    let minX = 0, minY = 0, maxX = 1, maxY = 1;
    if (usedDots.length > 0) {
      minX = Math.min(...usedDots.map(d => d.x));
      minY = Math.min(...usedDots.map(d => d.y));
      maxX = Math.max(...usedDots.map(d => d.x));
      maxY = Math.max(...usedDots.map(d => d.y));
    }
    // Add padding (10% of width/height)
    const padX = (maxX - minX) * 0.1;
    const padY = (maxY - minY) * 0.1;
    minX -= padX;
    maxX += padX;
    minY -= padY;
    maxY += padY;
    const drawWidth = maxX - minX;
    const drawHeight = maxY - minY;
    const scale = Math.min(canvas.width / drawWidth, canvas.height / drawHeight);
    const offsetX = (canvas.width - drawWidth * scale) / 2 - minX * scale;
    const offsetY = (canvas.height - drawHeight * scale) / 2 - minY * scale;
    // --- End bounding box calculation ---
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw dots
    ctx.fillStyle = '#333';
    usedDotIndices.forEach(dotIndex => {
      if (recording.dots[dotIndex]) {
        const dot = recording.dots[dotIndex];
        ctx.beginPath();
        ctx.arc(dot.x * scale + offsetX, dot.y * scale + offsetY, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    // Draw completed lines
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 4;
    for (let i = 0; i < animationStateRef.current.completedLines.length; i++) {
      const lineIndex = animationStateRef.current.completedLines[i];
      const line = recording.sequence[lineIndex];
      const from = recording.dots[line.from];
      const to = recording.dots[line.to];
      ctx.beginPath();
      ctx.moveTo(from.x * scale + offsetX, from.y * scale + offsetY);
      ctx.lineTo(to.x * scale + offsetX, to.y * scale + offsetY);
      ctx.stroke();
    }
    // Draw animated line (if we're still animating)
    if (animationStateRef.current.currentLineIndex < recording.sequence.length) {
      const line = recording.sequence[animationStateRef.current.currentLineIndex];
      const from = recording.dots[line.from];
      const to = recording.dots[line.to];
      const startX = from.x * scale + offsetX;
      const startY = from.y * scale + offsetY;
      const endX = to.x * scale + offsetX;
      const endY = to.y * scale + offsetY;
      const currentEndX = startX + (endX - startX) * animationStateRef.current.animationProgress;
      const currentEndY = startY + (endY - startY) * animationStateRef.current.animationProgress;
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(currentEndX, currentEndY);
      ctx.stroke();
    }
  }, [state]);
  
  // Store the drawPreviewFrame function in a ref to avoid dependencies
  const drawPreviewFrameRef = useRef(drawPreviewFrame);
  
  // Update the ref when drawPreviewFrame changes
  useEffect(() => {
    drawPreviewFrameRef.current = drawPreviewFrame;
  }, [drawPreviewFrame]);
  
  // Animation frame function
  const animateFrame = useCallback(() => {
    if (!state.recording.isPlaying || 
        animationStateRef.current.currentLineIndex >= state.recording.sequence.length) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }
    
    // Increment progress
    animationStateRef.current.animationProgress += 0.05; // Adjust for speed
    
    // If line is complete
    if (animationStateRef.current.animationProgress >= 1) {
      // Add to completed lines
      animationStateRef.current.completedLines.push(animationStateRef.current.currentLineIndex);
      
      // Move to next line
      animationStateRef.current.currentLineIndex++;
      animationStateRef.current.animationProgress = 0;
      
      // Draw the current state
      drawPreviewFrameRef.current();
      
      // Pause briefly between lines
      setTimeout(() => {
        if (state.recording.isPlaying) {
          animationFrameRef.current = requestAnimationFrame(animateFrame);
        }
      }, 200);
      
      return;
    }
    
    // Draw the current frame
    drawPreviewFrameRef.current();
    
    // Continue animation
    animationFrameRef.current = requestAnimationFrame(animateFrame);
  }, [state.recording.isPlaying, state.recording.sequence.length]);
  
  // Start preview animation
  const startPreviewAnimation = useCallback(() => {
    // Reset animation state
    animationStateRef.current = {
      currentLineIndex: 0,
      completedLines: [],
      animationProgress: 0
    };
    
    // Start by drawing the initial frame with all dots
    drawPreviewFrameRef.current();
    
    // Start the animation
    dispatch({ type: 'SET_PLAYING_STATE', isPlaying: true });
    animationFrameRef.current = requestAnimationFrame(animateFrame);
  }, [dispatch, animateFrame]);
  
  // Stop preview animation
  const stopPreviewAnimation = useCallback(() => {
    dispatch({ type: 'SET_PLAYING_STATE', isPlaying: false });
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [dispatch]);
  
  // Clean up animations on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  return {
    startPreviewAnimation,
    stopPreviewAnimation,
    drawPreviewFrame
  };
};

export default useAnimation; 