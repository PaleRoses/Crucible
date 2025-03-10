import React from 'react';
import CosmicStars from '../core/effects/cosmiceffects/CosmicStars';

/**
 * Background Component
 * 
 * Container for cosmic background effects.
 * Acts as a coordinator for multiple cosmic effects,
 * each handling their own state and rendering.
 */
const Background = ({ config = {} }) => {
  // Colors configuration with defaults
  const backgroundColors = {
    topColor: config.colors?.background?.topColor || 'rgb(8, 8, 12)',
    bottomColor: config.colors?.background?.bottomColor || 'rgb(15, 15, 20)'
  };
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
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
  );
};

export default Background;