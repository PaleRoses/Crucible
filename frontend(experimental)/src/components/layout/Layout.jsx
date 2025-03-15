import React, { useEffect, useState } from 'react';
import CosmicStars from '../effects/cosmic/CosmicStars';

/**
 * Background Component
 * 
 * Container for cosmic background effects.
 * Acts as a coordinator for multiple cosmic effects,
 * each handling their own state and rendering.
 * 
 * Fixes iOS viewport height issues by using a combination of approaches.
 */
const Background = ({ config = {} }) => {
  // Colors configuration with defaults
  const backgroundColors = {
    topColor: config.colors?.background?.topColor || 'rgb(8, 8, 12)',
    bottomColor: config.colors?.background?.bottomColor || 'rgb(15, 15, 20)'
  };

  // State to store the real viewport height
  const [viewportHeight, setViewportHeight] = useState('100vh');

  // Effect to handle viewport height on iOS
  useEffect(() => {
    // Function to update the viewport height
    const updateHeight = () => {
      // Set viewport height to window inner height
      setViewportHeight(`${window.innerHeight}px`);
    };

    // Set initial height
    updateHeight();

    // Update height on resize and orientation change
    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);

    return () => {
      // Clean up event listeners
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
    };
  }, []);

  return (
    <>
      {/* Main background with gradient */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: viewportHeight,
          overflow: 'hidden',
          zIndex: -1,
          pointerEvents: 'none',
          background: `linear-gradient(to bottom, ${backgroundColors.topColor}, ${backgroundColors.bottomColor})`
        }}
        aria-hidden="true"
      >
        {/* Cosmic Stars - fully self-contained component */}
        <CosmicStars config={config.stars} />
        
        {/* Add additional cosmic effects here, each handling their own canvas and state */}
        {/* Example:
        <CosmicNebula config={config.nebula} />
        <CosmicDust config={config.dust} />
        */}
      </div>
      
      {/* Additional element to ensure background extends past viewport */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: '100vh',
          width: '100%',
          height: '100vh', // Extra height beyond viewport
          zIndex: -2,
          backgroundColor: backgroundColors.bottomColor,
        }}
        aria-hidden="true"
      />
    </>
  );
};

export default Background;