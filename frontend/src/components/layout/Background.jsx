import React, { useRef, useEffect, useState, useMemo } from 'react';
import BouncyParallax from '../core/effects/genericeffects/BouncyParallax';

/**
 * Star Component - Individual star with parallax effects
 */
const Star = ({ star, index }) => {
  // Calculate scroll configuration based on star properties
  const scrollConfig = useMemo(() => {
    // Depth-based scroll effects (deeper stars move more)
    const depthFactor = star.z * 1.5;
    
    return {
      // Start position based on star position in the list (staggered effect)
      startPosition: Math.max(0, index * 5 - 200),
      // Different end positions create layered effect
      endPosition: 400 + index * 15,
      // Stars move in varying distances based on their depth
      initialY: 20 * depthFactor,
      finalY: 0,
      initialX: -15 * depthFactor,
      finalX: 0,
      // Deeper stars have more prominent scaling effects
      initialScale: 0.8,
      finalScale: 1 + (star.z * 0.2),
      // Opacity effects synchronize with the pulse behavior
      opacityValues: [0.3 * star.baseOpacity, star.baseOpacity, star.baseOpacity],
      opacityScrollPositions: [0, 200, 500],
      // Spring configuration affects how "bouncy" the star feels
      springConfig: {
        stiffness: 40 + (star.z * 20),  // Stiffer for closer stars
        damping: 15 + (star.z * 10),     // More damping for closer stars
        mass: 0.3 + (star.z * 0.4),      // More mass for deeper stars
      },
      // Stars deeper in the background move in the opposite direction
      reverseDirection: star.z < 0.3
    };
  }, [star, index]);

  // Star styling
  const starStyle = useMemo(() => {
    // Base size from star properties
    const size = star.size * 2;
    
    // Dynamic styles based on star properties
    return {
      position: 'absolute',
      left: `${star.x}px`,
      top: `${star.y}px`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: star.color.replace('alpha', star.baseOpacity),
      boxShadow: `0 0 ${size * 2}px ${size * 0.8}px ${star.color.replace('alpha', star.baseOpacity * 0.5)}`,
      zIndex: Math.floor(star.z * 10)
    };
  }, [star]);

  return (
    <BouncyParallax
      scrollConfig={scrollConfig}
      style={starStyle}
      className="star"
    >
      <div className="star-core" />
    </BouncyParallax>
  );
};

/**
 * Background Component
 * 
 * Creates a stellar background with stars that have parallax scrolling effects
 * using DOM elements instead of canvas for individual star control.
 */
const Background = () => {
  // State to store star data
  const [stars, setStars] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  
  // Configuration parameters
  const CONFIG = useMemo(() => ({
    starCount: 50,  // Reduced for better DOM performance
    starSizeMin: 1,
    starSizeMax: 3,
    starOpacityMin: 0.15,
    starOpacityMax: 0.85,
    sessionKey: 'parallax_star_background_config'
  }), []);

  // Color palette
  const COLORS = useMemo(() => ({
    stars: [
      'rgba(255, 243, 200, alpha)', // Warm yellow
      'rgba(255, 231, 164, alpha)', // Golden
      'rgba(252, 249, 231, alpha)'  // Off-white gold
    ],
    background: {
      topColor: 'rgb(8, 8, 12)',
      bottomColor: 'rgb(15, 15, 20)'
    }
  }), []);

  // Load or generate session-persistent configuration
  const getSessionConfiguration = () => {
    try {
      // Try to load existing configuration from sessionStorage
      const storedConfig = sessionStorage.getItem(CONFIG.sessionKey);
      
      if (storedConfig) {
        return JSON.parse(storedConfig);
      }
    } catch (error) {
      console.warn('Could not load star configuration from session storage', error);
    }
    
    // Generate new configuration if none exists
    const starSeeds = [];
    for (let i = 0; i < CONFIG.starCount; i++) {
      starSeeds.push({
        xSeed: Math.random(),
        ySeed: Math.random(),
        zSeed: Math.random() * 0.8 + 0.1,
        sizeSeed: Math.random(),
        opacitySeed: Math.random(),
        phaseSeed: Math.random() * Math.PI * 2,
        colorIndex: Math.floor(Math.random() * COLORS.stars.length)
      });
    }
    
    // Store new configuration in sessionStorage
    const newConfig = { starSeeds, timestamp: Date.now() };
    try {
      sessionStorage.setItem(CONFIG.sessionKey, JSON.stringify(newConfig));
    } catch (error) {
      console.warn('Could not save star configuration to session storage', error);
    }
    
    return newConfig;
  };

  // Initialize stars and handle resizing
  useEffect(() => {
    if (!containerRef.current) return;
    
    const initializeStars = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Get or create session-persistent configuration
      const sessionConfig = getSessionConfiguration();
      const { starSeeds } = sessionConfig;
      
      // Create stars using the persistent seeds
      const newStars = starSeeds.map(seed => {
        // Position - use seeds but adapt to current screen dimensions
        const x = seed.xSeed * width;
        const y = seed.ySeed * height;
        const z = seed.zSeed; // Depth (0.1 to 0.9)
        
        // Visual properties
        const size = (seed.sizeSeed * (CONFIG.starSizeMax - CONFIG.starSizeMin) + CONFIG.starSizeMin) * z;
        const baseOpacity = seed.opacitySeed * (CONFIG.starOpacityMax - CONFIG.starOpacityMin) + CONFIG.starOpacityMin;
        
        // Color variation
        const color = COLORS.stars[seed.colorIndex];
        
        return {
          x,
          y,
          z,
          size,
          baseOpacity,
          pulsePhase: seed.phaseSeed,
          color
        };
      });
      
      setStars(newStars);
      setDimensions({ width, height });
    };
    
    // Initialize stars
    initializeStars();
    
    // Handle resize
    const handleResize = () => {
      initializeStars();
    };
    
    // Add resize listener with throttling
    let resizeTimer;
    const throttledResize = () => {
      if (!resizeTimer) {
        resizeTimer = setTimeout(() => {
          resizeTimer = null;
          handleResize();
        }, 200);
      }
    };
    
    window.addEventListener('resize', throttledResize);
    
    return () => {
      window.removeEventListener('resize', throttledResize);
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, [CONFIG, COLORS.stars]);

  // Create gradient background style
  const backgroundStyle = useMemo(() => ({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    zIndex: -1,
    pointerEvents: 'none',
    background: `linear-gradient(to bottom, ${COLORS.background.topColor}, ${COLORS.background.bottomColor})`
  }), [COLORS.background]);

  return (
    <div
      ref={containerRef}
      style={backgroundStyle}
      aria-hidden="true"
    >
      {stars.map((star, index) => (
        <Star 
          key={`star-${index}`} 
          star={star} 
          index={index} 
        />
      ))}
    </div>
  );
};

export default Background;