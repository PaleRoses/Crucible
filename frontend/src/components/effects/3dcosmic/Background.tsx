import React, { useState, useEffect, useMemo } from 'react';
import CelestialScene from './CelestialScene'; // Adjust path as needed

// --- Background Component ---
const Background: React.FC = () => {
  // State to store the calculated viewport height for iOS fix
  const [viewportHeight, setViewportHeight] = useState('100vh'); // Default to CSS vh unit

  // Effect to calculate and update the actual viewport height on resize/orientation change
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout; // Use NodeJS.Timeout for type safety with setTimeout

    // Function to update the height state
    const updateHeight = () => {
      // window.innerHeight gives the actual viewport height, unaffected by browser UI
      const height = window.innerHeight;
      setViewportHeight(`${height}px`);
    };

    // Debounce the update function to avoid excessive recalculations during resize
    const debouncedUpdateHeight = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateHeight, 150); // Adjust delay as needed
    };

    updateHeight(); // Set initial height on mount

    // Add event listeners
    window.addEventListener('resize', debouncedUpdateHeight);
    window.addEventListener('orientationchange', debouncedUpdateHeight);

    // Cleanup function to remove listeners when the component unmounts
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', debouncedUpdateHeight);
      window.removeEventListener('orientationchange', debouncedUpdateHeight);
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount

  // --- Define Configurations for CelestialScene ---
  // Keep configurations defined here or pass them as props if needed elsewhere
  const sceneConfig = useMemo(() => ({
    backgroundColor: 'var(--color-background)', // Use CSS variable for color
    cameraPosition: [0, 0, 250] as [number, number, number], // Explicitly type tuple
    // Other sceneConfig properties will use defaults from CelestialScene.tsx
  }), []);

  const moonConfig = useMemo(() => ({
    color1: 'var(--color-accent1)',
    color2: 'var(--color-accent1)',
    color3: 'var(--color-accent1)',
    noiseSpeed: 0.1,
    // Other moonConfig properties will use defaults from DarkMoon.tsx
  }), []);

  const starsConfig = useMemo(() => ({
    count: 3000,
    twinkleSpeed: 0.0008,
    // Other starsConfig properties will use defaults from DarkStars.tsx
  }), []);

  const postProcessingConfig = useMemo(() => ({
    bloomStrength: 0.7,
    // Other postProcessingConfig properties will use defaults from Effects.tsx
  }), []);

  // Extract the background color for the extension div
  const bottomBackgroundColor = sceneConfig.backgroundColor;

  return (
    // Use React Fragment as we now have two sibling divs
    <>
      {/* Main container for the CelestialScene effect */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: viewportHeight, // Use dynamic height state for iOS fix
          overflow: 'hidden', // Prevent content overflow
          zIndex: -100, // Lower z-index to ensure it's behind content
          pointerEvents: 'none', // Prevent background from intercepting clicks/hovers
        }}
        aria-hidden="true" // Hide from accessibility tree
        className="background-container" // Optional class for styling/targeting
      >
        <CelestialScene
          width="100%" // Fill the container div
          height="100%" // Fill the container div
          // Pass down the configurations
          moonConfig={moonConfig}
          starsConfig={starsConfig}
          sceneConfig={sceneConfig}
          postProcessingConfig={postProcessingConfig}
          // Explicitly enable/disable features if needed (defaults are true)
          // enableMoon={true}
          // enableStars={true}
          // enableEffects={true}
        />
      </div>

      {/* Background Extension Div */}
      {/* This div ensures a solid background color continues below the main viewport */}
      {/* Useful for preventing white flashes during overscroll on some devices */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: '100vh', // Positioned directly below the initial viewport
          width: '100%',
          height: '100vh', // Make it tall enough to cover overscroll
          zIndex: -101, // Place it even further behind the main background
          pointerEvents: 'none', // Prevent interactions
        }}
        aria-hidden="true"
        className="background-extension" // Optional class
      />
    </>
  );
};

export default Background;