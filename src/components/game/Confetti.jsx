import { useEffect, useRef, useState } from 'react';
import './GameStyles.css';

/**
 * Confetti component for celebration animations
 * @param {Object} props - Component props
 * @param {boolean} props.show - Whether to show the confetti
 * @param {Function} props.onComplete - Callback when animation completes
 */
function Confetti({ show = false, onComplete = () => {} }) {
  const canvasRef = useRef(null);
  const [particles, setParticles] = useState([]);
  const animationRef = useRef(null);
  
  // Initialize particles when show changes to true
  useEffect(() => {
    if (show) {
      // Get canvas dimensions
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Resize canvas to fit parent container
      resizeCanvas();
      
      // Create particles
      const newParticles = [];
      for (let i = 0; i < 150; i++) {
        newParticles.push({
          x: Math.random() * canvas.width,
          y: -20 - Math.random() * 100,
          size: 5 + Math.random() * 10,
          color: getRandomConfettiColor(),
          speed: 1 + Math.random() * 3,
          angle: Math.random() * Math.PI * 2,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 2
        });
      }
      
      setParticles(newParticles);
    } else {
      // Clean up animation on hide
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  }, [show]);
  
  // Handle window resize for canvas
  useEffect(() => {
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Animate particles
  useEffect(() => {
    if (show && particles.length > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      function animate() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Track if any particles are still active
        let stillActive = false;
        
        // Update and draw each particle
        const updatedParticles = particles.map(particle => {
          // Update position
          const updatedParticle = {
            ...particle,
            y: particle.y + particle.speed,
            x: particle.x + Math.sin(particle.angle) * 0.5,
            rotation: particle.rotation + particle.rotationSpeed
          };
          
          // Check if particle is still on screen
          if (updatedParticle.y < canvas.height + 20) {
            stillActive = true;
            
            // Draw particle
            ctx.save();
            ctx.translate(updatedParticle.x, updatedParticle.y);
            ctx.rotate(updatedParticle.rotation * Math.PI / 180);
            
            ctx.fillStyle = updatedParticle.color;
            ctx.fillRect(
              -updatedParticle.size / 2, 
              -updatedParticle.size / 2,
              updatedParticle.size, 
              updatedParticle.size
            );
            
            ctx.restore();
          }
          
          return updatedParticle;
        });
        
        // Update particle state
        setParticles(updatedParticles);
        
        // Continue animation if particles are still active
        if (stillActive) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          onComplete();
        }
      }
      
      // Start animation
      animationRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [particles, show, onComplete]);
  
  // Resize canvas to fit parent container
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const parent = canvas.parentElement;
    if (!parent) return;
    
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
  };
  
  // Get random color for confetti
  const getRandomConfettiColor = () => {
    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7',
      '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
      '#009688', '#4CAF50', '#8bc34a', '#cddc39',
      '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  return (
    <canvas 
      ref={canvasRef}
      className={`confetti-canvas ${show ? 'active' : ''}`}
    />
  );
}

export default Confetti; 