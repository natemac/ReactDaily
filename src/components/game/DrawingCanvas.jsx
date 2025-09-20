import { useRef, useEffect, useState } from 'react';
import { CONFIG } from '../../utils/config.js';

function DrawingCanvas({ isPlaying = false, animationProgress = 0, drawingData = null, showDots = true, pauseMode = false, wrongGuess = false }) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [lineLengths, setLineLengths] = useState([]);
  const [totalLength, setTotalLength] = useState(0);
  
  // Calculate line lengths when drawing data changes
  useEffect(() => {
    if (!drawingData || !drawingData.dots || !drawingData.sequence) return;
    
    const { dots, sequence } = drawingData;
    
    // Calculate each line's length and store
    const lengths = sequence.map(({ from, to }) => {
      if (from === undefined || to === undefined || !dots[from] || !dots[to]) {
        return 0;
      }
      
      const dx = dots[to].x - dots[from].x;
      const dy = dots[to].y - dots[from].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      return distance;
    });
    
    // Calculate total length of all lines
    const total = lengths.reduce((sum, length) => sum + length, 0);
    
    setLineLengths(lengths);
    setTotalLength(total);
  }, [drawingData]);
  
  // Set up the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas size to be a 1:1 ratio
    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (!container) return;
      
      // Get the computed width of the container
      const containerWidth = container.clientWidth;
      
      // Use the container width for a perfect square
      // but limit to 90% of container height for very tall screens
      const size = Math.min(containerWidth, window.innerHeight * 1);
      
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      
      // Scale the context to account for high DPI displays
      ctx.scale(dpr, dpr);
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    // Draw canvas background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    
    // Draw a subtle border
    drawBorder(ctx, canvas.width / dpr, canvas.height / dpr);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  // Helper function to draw a consistent border
  const drawBorder = (ctx, width, height) => {
    ctx.strokeStyle = '#ddd'; // Light gray border
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.stroke();
  };
  
  // Draw the animation based on drawing data and progress
  useEffect(() => {
    if (!drawingData) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    
    // Draw border
    drawBorder(ctx, width, height);
    
    // Only proceed if we have valid drawing data
    if (!drawingData.dots || !drawingData.sequence) {
      console.log('Drawing data missing dots or sequence:', drawingData);
      return;
    }
    
    const { dots, sequence } = drawingData;
    if (!dots.length || !sequence.length) {
      console.log('Empty dots or sequence arrays:', { dots, sequence });
      return;
    }
    
    try {
      // Scale dots to fit canvas (fit bounding box to canvas)
      const usedDots = dots.filter(dot => dot && typeof dot.x === 'number' && typeof dot.y === 'number');
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
      const scale = Math.min(width / drawWidth, height / drawHeight);
      const offsetX = (width - drawWidth * scale) / 2 - minX * scale;
      const offsetY = (height - drawHeight * scale) / 2 - minY * scale;
      const scaleDot = (dot) => {
        if (!dot || typeof dot.x !== 'number' || typeof dot.y !== 'number') {
          console.error('Invalid dot coordinates:', dot);
          return { x: 0, y: 0 };
        }
        return {
          x: dot.x * scale + offsetX,
          y: dot.y * scale + offsetY
        };
      };
      
      // Draw dots only if showDots is true AND the game is playing or paused
      if (showDots && (isPlaying || pauseMode)) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        
        dots.forEach(dot => {
          const scaledDot = scaleDot(dot);
          ctx.beginPath();
          ctx.arc(scaledDot.x, scaledDot.y, CONFIG.DOT_RADIUS, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      
      // Don't draw lines if not playing yet and not in pause mode
      if (!isPlaying && !pauseMode) return;
      
      // Drawing style for lines
      ctx.strokeStyle = 'black';
      ctx.lineWidth = CONFIG.LINE_WIDTH;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Calculate pixel-based drawing progress
      if (totalLength <= 0) return;
      
      // Total pixels to be drawn at current progress
      const pixelsToDraw = totalLength * animationProgress;
      
      // Keep track of pixels drawn
      let pixelsDrawn = 0;
      let currentLine = 0;
      
      // Handle per-line minimum time
      // This ensures short lines are still visible for the minimum time
      const minTimePerLine = CONFIG.MINIMUM_LINE_TIME;
      const pixelsPerSecond = CONFIG.PIXELS_PER_SECOND;
      
      // Adjust drawing progress to account for minimum line time
      const adjustedTotalLength = sequence.reduce((total, _, i) => {
        // Get the actual line length
        const lineLength = lineLengths[i] || 0;
        
        // Calculate time this line should take based on pixel speed
        const lineTimeBySpeed = lineLength / pixelsPerSecond * 1000;
        
        // Use the max of calculated time or minimum time
        const adjustedLength = lineLength * Math.max(1, minTimePerLine / lineTimeBySpeed);
        
        return total + adjustedLength;
      }, 0);
      
      // Recalculate drawing target with adjusted lengths
      const adjustedPixelsToDraw = adjustedTotalLength * animationProgress;
      
      // Draw complete lines until we reach our pixel budget
      let adjustedPixelsDrawn = 0;
      while (currentLine < sequence.length) {
        // Get the actual line length
        const lineLength = lineLengths[currentLine] || 0;
        
        // Calculate time this line should take based on pixel speed
        const lineTimeBySpeed = lineLength / pixelsPerSecond * 1000;
        
        // Adjust line length based on minimum time
        const adjustedLineLength = lineLength * Math.max(1, minTimePerLine / lineTimeBySpeed);
        
        // If drawing this line would exceed our pixel budget, draw part of it
        if (adjustedPixelsDrawn + adjustedLineLength > adjustedPixelsToDraw) {
          break;
        }
        
        // Draw the complete line
        const { from, to } = sequence[currentLine];
        
        if (from === undefined || to === undefined || !dots[from] || !dots[to]) {
          currentLine++;
          continue;
        }
        
        const fromDot = scaleDot(dots[from]);
        const toDot = scaleDot(dots[to]);
        
        ctx.beginPath();
        ctx.moveTo(fromDot.x, fromDot.y);
        ctx.lineTo(toDot.x, toDot.y);
        ctx.stroke();
        
        // Update pixels drawn and move to next line
        pixelsDrawn += lineLength;
        adjustedPixelsDrawn += adjustedLineLength;
        currentLine++;
      }
      
      // Draw partial line if needed
      if (currentLine < sequence.length) {
        const { from, to } = sequence[currentLine];
        
        if (from !== undefined && to !== undefined && dots[from] && dots[to]) {
          const fromDot = scaleDot(dots[from]);
          const toDot = scaleDot(dots[to]);
          
          // Calculate how much of this line to draw
          const lineLength = lineLengths[currentLine];
          
          // Calculate time this line should take based on pixel speed
          const lineTimeBySpeed = lineLength / pixelsPerSecond * 1000;
          
          // Adjust line length based on minimum time
          const adjustedLineLength = lineLength * Math.max(1, minTimePerLine / lineTimeBySpeed);
          
          // Calculate what's left of our pixel budget
          const remainingAdjustedPixels = adjustedPixelsToDraw - adjustedPixelsDrawn;
          
          // Calculate the line progress (0-1)
          const lineProgress = remainingAdjustedPixels / adjustedLineLength;
          
          // Calculate the endpoint of the partial line
          const x = fromDot.x + (toDot.x - fromDot.x) * lineProgress;
          const y = fromDot.y + (toDot.y - fromDot.y) * lineProgress;
          
          ctx.beginPath();
          ctx.moveTo(fromDot.x, fromDot.y);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      }
    } catch (error) {
      console.error('Error drawing animation:', error);
    }
  }, [isPlaying, animationProgress, drawingData, showDots, lineLengths, totalLength, pauseMode]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className={`drawing-canvas ${wrongGuess ? 'incorrect-guess' : ''}`}
    />
  );
}

export default DrawingCanvas; 