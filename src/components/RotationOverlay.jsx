import React, { useState, useEffect } from 'react';
import '../styles/RotationOverlay.css';

const RotationOverlay = () => {
  const [isLandscape, setIsLandscape] = useState(false);
  const [allowLandscape, setAllowLandscape] = useState(false);
  
  useEffect(() => {
    // Check localStorage for user preference on component mount
    const storedAllowLandscape = localStorage.getItem('allowLandscape') === 'true';
    setAllowLandscape(storedAllowLandscape);
    
    // Initial orientation check
    checkOrientation();
    
    // Add event listeners for orientation/resize changes
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleResize);
    
    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Handle orientation change with a slight delay to ensure dimensions are updated
  const handleOrientationChange = () => {
    setTimeout(checkOrientation, 100);
  };
  
  // Only trigger on actual orientation changes
  const handleResize = () => {
    const newIsLandscape = window.innerWidth > window.innerHeight;
    if (newIsLandscape !== isLandscape) {
      checkOrientation();
    }
  };
  
  // Check current orientation and update state
  const checkOrientation = () => {
    const newIsLandscape = window.innerWidth > window.innerHeight;
    setIsLandscape(newIsLandscape);
    
    // Reset allowLandscape when returning to portrait
    if (!newIsLandscape) {
      localStorage.removeItem('allowLandscape');
      setAllowLandscape(false);
    }
  };
  
  // Handle close button click
  const handleClose = () => {
    localStorage.setItem('allowLandscape', 'true');
    setAllowLandscape(true);
    
    // Recheck after a delay for transition effects
    setTimeout(checkOrientation, 300);
  };
  
  // Determine if overlay should be shown
  const showOverlay = isLandscape && !allowLandscape;
  
  // Check if device is tablet or desktop (won't show overlay)
  const isTabletOrDesktop = window.innerWidth >= 768;
  
  // Don't render anything if we're on a tablet/desktop or if overlay shouldn't be shown
  if (isTabletOrDesktop || !showOverlay) {
    return null;
  }
  
  return (
    <div className="rotation-overlay">
      <button className="close-rotation-message" onClick={handleClose}>✕</button>
      <svg className="rotation-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        {/* Phone outline */}
        <rect x="35" y="10" width="30" height="50" rx="5" ry="5" stroke="#666" strokeWidth="2" fill="white" />
        {/* Screen */}
        <rect x="38" y="15" width="24" height="40" rx="2" ry="2" fill="#f0f0f0" />
        {/* Home button */}
        <circle cx="50" cy="55" r="3" fill="#ccc" />
        {/* Rotation arrow */}
        <path d="M75,35 A30,30 0 0,1 50,65" stroke="#666" strokeWidth="3" fill="none" strokeDasharray="5,3" />
        <polygon points="50,65 45,55 55,55" fill="#666" />
      </svg>
      <div className="rotation-message">Oh no! We can't fit everything on your screen.</div>
      <div className="rotation-instruction">Please rotate your device.</div>
    </div>
  );
};

export default RotationOverlay; 