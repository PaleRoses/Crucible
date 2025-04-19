'use client'

import React, { useEffect, useState, useRef } from 'react';
import CosmicStars from '../effects/cosmic/CosmicStars';

// --- Type Definitions ---

/**
 * Options for color resolution in the CosmicStars component
 */
interface ColorResolutionOptions {
  fallback?: string; // Fallback color if CSS variable resolution fails
  debug?: boolean;   // Enable debugging logs for color resolution
}

/**
 * ColorConfig matching what the CosmicStars component expects
 * Note: Both stars array and background object with non-optional properties are required
 */
interface ColorConfig {
  stars: string[]; // Non-optional stars array
  background: {    // Non-optional background object
    topColor: string;    // Non-optional top color
    bottomColor: string; // Non-optional bottom color
  };
}

/**
 * Main configuration structure for the CosmicStars component
 */
interface StarConfig {
  colors?: ColorConfig;
  colorResolutionOptions?: ColorResolutionOptions;
  // Other potential config options can be added here
}

/**
 * Props for the Background component
 */
interface BackgroundProps {
  config?: Partial<StarConfig>;
}

/**
 * Background Component
 *
 * Renders a dynamic star background using the CosmicStars effect.
 * Handles iOS viewport height adjustments and ensures proper color configuration.
 */
const Background: React.FC<BackgroundProps> = ({ config = {} }) => {
  // State to store the real viewport height (for iOS fix)
  const [viewportHeight, setViewportHeight] = useState('100vh');
  
  // Ref to store the timeout ID for debouncing resize events
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to handle viewport height updates on resize and orientation change
  useEffect(() => {
    // Function to update the viewport height state
    const updateHeight = () => {
      setViewportHeight(`${window.innerHeight}px`);
    };

    // Debounced version of updateHeight to avoid excessive calls during resize
    const debouncedUpdateHeight = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(updateHeight, 150);
    };

    // Initial height calculation on mount
    updateHeight();

    // Add event listeners for resize and orientation change
    window.addEventListener('resize', debouncedUpdateHeight);
    window.addEventListener('orientationchange', debouncedUpdateHeight);

    // Cleanup function
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      window.removeEventListener('resize', debouncedUpdateHeight);
      window.removeEventListener('orientationchange', debouncedUpdateHeight);
    };
  }, []);

  // Create config that matches what CosmicStars expects with non-optional properties
  const cosmicStarsConfig: Partial<StarConfig> = {
    ...config,
    colors: {
      // Non-optional stars array
      stars: [
        'var(--color-accent1)',
        'var(--color-accent2)',
        'var(--color-accent3)',
      ],
      // Non-optional background object with required properties
      background: {
        topColor: 'var(--color-background)',
        bottomColor: 'var(--color-background-alt)',
      }
    },
    colorResolutionOptions: {
      fallback: '#FFFFFF',
      debug: false,
      ...(config?.colorResolutionOptions || {}),
    }
  };

  return (
    <>
      {/* Main container for the CosmicStars effect */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: viewportHeight, // Use dynamic height state for iOS compatibility
          overflow: 'hidden',
          zIndex: -100,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
        className="background-container"
      >
        <CosmicStars config={cosmicStarsConfig} />
      </div>

      {/* Background Extension Div */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: '50vh',
          width: '100%',
          height: '100vh',
          zIndex: -101,
          backgroundColor: 'var(--color-background)',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
        className="background-extension"
      />
    </>
  );
};

export default Background;