import { useEffect } from 'react';

/**
 * A utility component that adds orientation classes to the body
 * This doesn't render anything, just adds/manages classes
 */
const OrientationHandler = () => {
  useEffect(() => {
    // Function to update body classes based on screen orientation
    const updateOrientationClass = () => {
      if (window.innerWidth > window.innerHeight) {
        document.body.classList.add('landscape');
        document.body.classList.remove('portrait');
      } else {
        document.body.classList.add('portrait');
        document.body.classList.remove('landscape');
      }
    };

    // Set initial orientation class
    updateOrientationClass();

    // Add listeners for orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(updateOrientationClass, 100);
    });

    // Add listener for resize (which happens on orientation change)
    window.addEventListener('resize', updateOrientationClass);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('orientationchange', updateOrientationClass);
      window.removeEventListener('resize', updateOrientationClass);
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default OrientationHandler; 