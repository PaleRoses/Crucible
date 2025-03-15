// Background.tsx
'use client'

import React, { useEffect, useState } from 'react';
import CosmicStars, { StarConfig } from '../effects/cosmic/CosmicStars';

interface BackgroundConfig {
  colors?: {
    background?: {
      topColor?: string;
      bottomColor?: string;
    };
  };
  stars?: StarConfig;
}

const Background: React.FC<{ config?: BackgroundConfig }> = ({ config = {} }) => {
  const backgroundColors = {
    topColor: config.colors?.background?.topColor || 'rgb(8, 8, 12)',
    bottomColor: config.colors?.background?.bottomColor || 'rgb(15, 15, 20)',
  };

  const [viewportHeight, setViewportHeight] = useState('100vh');

  useEffect(() => {
    const updateHeight = () => setViewportHeight(`${window.innerHeight}px`);
    updateHeight();
    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);
    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 w-full h-full pointer-events-none" 
      style={{ 
        zIndex: -1000,
        height: viewportHeight,
        background: `linear-gradient(to bottom, ${backgroundColors.topColor}, ${backgroundColors.bottomColor})`,
      }}
      aria-hidden="true"
    >
      <CosmicStars config={config.stars} />
      
      {/* Extended background below viewport */}
      <div
        className="fixed left-0 w-full h-screen"
        style={{
          top: '100vh',
          backgroundColor: backgroundColors.bottomColor,
        }}
      />
    </div>
  );
};

export default Background;