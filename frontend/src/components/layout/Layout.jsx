import React, { useEffect, useState } from 'react';
import CosmicStars from '../effects/cosmic/CosmicStars'; // Adjust import path if needed
// Assuming StarConfig is exported from CosmicStars or a types file
// import type { StarConfig } from '../effects/cosmic/CosmicStars';

/**
 * @typedef {object} BackgroundProps
 * @property {Partial<import('../effects/cosmic/CosmicStars').StarConfig>} [config] - Configuration object.
 * Settings like `colorResolutionOptions`, `starCount`, etc., will be passed down,
 * but `colors.stars` and `colors.background` will be overridden by this component
 * to use specific CSS variables.
 */

/**
 * Background Component
 *
 * Container for the CosmicStars effect.
 * Handles iOS viewport height adjustments. It explicitly sets the star colors
 * (--color-cosmic1, etc.) AND background colors (--color-background, --color-background-alt)
 * for CosmicStars using CSS variables, while passing down other configurations.
 *
 * @param {BackgroundProps} props
 */
const Background = ({ config = {} }) => {
  // Use the specific CSS variable for the extension div background
  const bottomBackgroundColor = 'var(--color-background)';

  // State to store the real viewport height for iOS fix
  const [viewportHeight, setViewportHeight] = useState('100vh'); // Default to CSS value

  // Effect to handle viewport height changes
  useEffect(() => {
    let resizeTimeout;
    const updateHeight = () => {
      const height = window.innerHeight;
      setViewportHeight(`${height}px`);
    };
    const debouncedUpdateHeight = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateHeight, 150);
    };
    updateHeight(); // Initial height
    window.addEventListener('resize', debouncedUpdateHeight);
    window.addEventListener('orientationchange', debouncedUpdateHeight);
    return () => { // Cleanup
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', debouncedUpdateHeight);
      window.removeEventListener('orientationchange', debouncedUpdateHeight);
    };
  }, []);

  // --- Prepare Config for CosmicStars ---
  // Start with the config passed to Background...
  const cosmicStarsConfig = {
    ...config, // Pass down all non-color settings from the parent config initially
    // ...then explicitly define the colors object...
    colors: {
      // ...specifically set the star colors...
      stars: [
        'var(--color-cosmic1)',
        'var(--color-cosmic2)',
        'var(--color-cosmic3)',
      ],
      // ...and specifically set the background colors using CSS variables.
      background: {
        topColor: 'var(--color-background)',
        bottomColor: 'var(--color-background)',
      }
    },
    // ...and ensure colorResolutionOptions are passed through or defaulted.
    colorResolutionOptions: {
        fallback: '#FFFFFF', // Default fallback within Background
        debug: false,
        ...(config?.colorResolutionOptions || {}) // Merge options from parent config
    }
  };

  // Remove potential undefined keys if config was empty - ensure clean object
  // No longer need to delete background colors as they are explicitly set now.
   if (!config?.colorResolutionOptions) {
      delete cosmicStarsConfig.colorResolutionOptions; // Allow CosmicStars default if not in parent
   }


  return (
    <>
      {/* Main container for the background effect */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: viewportHeight, // Use dynamic height state
          overflow: 'hidden',
          zIndex: -100,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
        className="background-container"
      >
        {/*
         * Render Cosmic Stars effect.
         * Pass the specifically constructed config object down.
         */}
        <CosmicStars config={cosmicStarsConfig} />

        {/* Placeholder for potential future background effects */}
      </div>

      {/* Background Extension Div */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: '100vh',
          width: '100%',
          height: '100vh',
          zIndex: -101,
          // Use the specific variable for consistency
          backgroundColor: bottomBackgroundColor,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
        className="background-extension"
      />
    </>
  );
};

export default Background;
