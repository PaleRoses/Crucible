import React, { useRef, useEffect, useCallback, useMemo } from 'react';

/**
 * Optimized Background Component
 * 
 * Creates an immersive stellar background with realistic star particles
 * with performance optimizations and session persistence.
 */
const Background = () => {
  // Refs for DOM elements and animation state
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(0);
  
  // Use refs instead of state to prevent re-renders during initialization
  const isInitializedRef = useRef(false);
  const firstRenderCompleteRef = useRef(false);
  
  // Store dimensions in a ref to avoid re-renders when they change
  const dimensionsRef = useRef({ width: 0, height: 0, pixelRatio: 1 });
  
  // Configuration - wrapped in useMemo to prevent recreation on each render
  const CONFIG = useMemo(() => ({
    // Reduced star count for better performance
    starCount: 100,
    starSizeMin: 0.8,
    starSizeMax: 2.5,
    starOpacityMin: 0.15,
    starOpacityMax: 0.85,
    
    // Simplified motion parameters
    baseMovementSpeed: 0.00008,  // Reduced movement speed
    pulseFrequency: 0.00003,
    
    // Disabled parallax effect for better performance
    parallaxEnabled: false,
    
    // Performance parameters
    maxFPS: 30,
    useRays: false,  // Disable ray rendering for better performance
    
    // Session persistence
    sessionKey: 'star_background_config'
  }), []);
  
  // Warm, golden color palette - wrapped in useMemo
  const COLORS = useMemo(() => ({
    // Simplified color palette
    stars: [
      'rgba(255, 243, 200, alpha)', // Warm yellow
      'rgba(255, 231, 164, alpha)', // Golden
      'rgba(252, 249, 231, alpha)'  // Off-white gold
    ],
    
    // Background gradient colors
    background: {
      topColor: 'rgb(8, 8, 12)',
      bottomColor: 'rgb(15, 15, 20)'
    }
  }), []);
  
  // Pre-generated color values to avoid string replacements during animation
  const colorCache = useMemo(() => {
    const cache = {};
    COLORS.stars.forEach(baseColor => {
      cache[baseColor] = {};
      for (let opacity = 0; opacity <= 10; opacity++) {
        const value = opacity / 10;
        cache[baseColor][value] = baseColor.replace(/alpha\)$/, `${value})`);
      }
    });
    return cache;
  }, [COLORS.stars]);
  
  // Get color with opacity from cache (faster than string replacement)
  const getColor = useCallback((baseColor, opacity) => {
    const safeOpacity = Math.max(0, Math.min(1, opacity || 0));
    // Round to nearest 0.1 to use cached values
    const roundedOpacity = Math.round(safeOpacity * 10) / 10;
    return colorCache[baseColor][roundedOpacity] || baseColor.replace(/alpha\)$/, `${safeOpacity})`);
  }, [colorCache]);
  
  // Load or generate session-persistent configuration
  const getSessionConfiguration = useCallback(() => {
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
        speedSeed: Math.random() * 0.2 + 0.9,
        pulseSpeedSeed: Math.random() * 0.002 + 0.001,
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
  }, [CONFIG.sessionKey, CONFIG.starCount, COLORS.stars.length]);
  
  // Initialize canvas with proper resolution
  const setupCanvas = useCallback(() => {
    if (!canvasRef.current) return false;
    
    const canvas = canvasRef.current;
    
    // Get viewport dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    
    // Set canvas size accounting for pixel ratio
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    // Ensure canvas is visible with a background color
    const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for non-transparent canvas
    if (ctx) {
      ctx.fillStyle = 'rgb(15, 15, 20)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Update dimensions ref instead of state
    dimensionsRef.current = { width, height, pixelRatio };
    
    return true;
  }, []);
  
  // Initialize stars with session-persistent configuration
  const initializeStars = useCallback(() => {
    const { width, height } = dimensionsRef.current;
    if (!width || !height) return;
    
    // Get or create session-persistent configuration
    const sessionConfig = getSessionConfiguration();
    const { starSeeds } = sessionConfig;
    
    // Clear existing stars
    starsRef.current = [];
    
    // Create stars using the persistent seeds
    for (let i = 0; i < starSeeds.length; i++) {
      const seed = starSeeds[i];
      const star = {};
      
      // Position - use seeds but adapt to current screen dimensions
      star.x = seed.xSeed * width;
      star.y = seed.ySeed * height;
      star.z = seed.zSeed; // Depth (0.1 to 0.9)
      
      // Visual properties
      star.size = (seed.sizeSeed * (CONFIG.starSizeMax - CONFIG.starSizeMin) + CONFIG.starSizeMin) * star.z;
      star.baseOpacity = seed.opacitySeed * (CONFIG.starOpacityMax - CONFIG.starOpacityMin) + CONFIG.starOpacityMin;
      star.opacity = star.baseOpacity;
      
      // Animation properties
      star.pulsePhase = seed.phaseSeed;
      star.pulseSpeed = seed.pulseSpeedSeed;
      star.movementSpeed = seed.speedSeed * CONFIG.baseMovementSpeed * (1.1 - star.z);
      
      // Color variation
      star.color = COLORS.stars[seed.colorIndex];
      
      // Store in ref
      starsRef.current.push(star);
    }
  }, [CONFIG, COLORS.stars, getSessionConfiguration]);
  
  // Optimized star rendering
  const drawStar = useCallback((ctx, star) => {
    // Skip rendering almost invisible stars
    if (star.opacity < 0.05) return;

    // Simplified star rendering without creating new gradients every frame
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fillStyle = getColor(star.color, star.opacity);
    ctx.fill();
    
    // Simplified glow effect without expensive gradient creation
    if (star.opacity > 0.3) {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = getColor(star.color, star.opacity * 0.4);
      ctx.fill();
    }
  }, [getColor]);
  
  // Render the scene - optimized for performance
  const renderScene = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    
    if (!ctx) return;
    
    const { width, height, pixelRatio } = dimensionsRef.current;
    
    // Clear canvas
    ctx.fillStyle = COLORS.background.topColor;
    ctx.fillRect(0, 0, width * pixelRatio, height * pixelRatio);
    
    // Apply device pixel ratio scaling only once
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    
    // Enable global composition for better glow effect
    ctx.globalCompositeOperation = 'lighter';
    
    // Draw stars
    for (let i = 0; i < starsRef.current.length; i++) {
      drawStar(ctx, starsRef.current[i]);
    }
    
    // Reset global composition
    ctx.globalCompositeOperation = 'source-over';
  }, [COLORS.background.topColor, drawStar]);
  
  // Update animation state - optimized for performance
  const updateAnimation = useCallback((deltaTime, timestamp) => {
    const { width, height } = dimensionsRef.current;
    
    // Global time factor for animations
    const timeFactor = timestamp * 0.001;
    
    // Update stars
    for (let i = 0; i < starsRef.current.length; i++) {
      const star = starsRef.current[i];
      
      // Simplified movement based on time
      star.x += Math.sin(timeFactor * 0.2 + star.pulsePhase) * star.movementSpeed * deltaTime;
      star.y += Math.cos(timeFactor * 0.3 + star.pulsePhase * 1.3) * star.movementSpeed * deltaTime;
      
      // Wrap around screen edges
      if (star.x < 0) star.x = width;
      if (star.x > width) star.x = 0;
      if (star.y < 0) star.y = height;
      if (star.y > height) star.y = 0;
      
      // Simplified pulsing effect
      const pulseFactor = Math.sin(timeFactor * star.pulseSpeed + star.pulsePhase) * 0.15 + 0.85;
      star.opacity = star.baseOpacity * pulseFactor;
    }
  }, []);
  
  // Define the animation loop function
  const animate = useCallback(function animationLoop(timestamp) {
    if (!isInitializedRef.current) {
      animationFrameRef.current = requestAnimationFrame(animationLoop);
      return;
    }
    
    // Limit FPS
    const minFrameTime = 1000 / CONFIG.maxFPS;
    const elapsed = timestamp - (lastTimeRef.current || 0);
    
    if (elapsed < minFrameTime) {
      animationFrameRef.current = requestAnimationFrame(animationLoop);
      return;
    }
    
    // Calculate delta time with cap to prevent large jumps
    const deltaTime = lastTimeRef.current ? Math.min(elapsed, 50) : 16;
    lastTimeRef.current = timestamp;
    
    // Update animation state
    updateAnimation(deltaTime, timestamp);
    
    // Render scene
    renderScene();
    
    // Schedule next frame
    animationFrameRef.current = requestAnimationFrame(animationLoop);
  }, [CONFIG.maxFPS, updateAnimation, renderScene]);
  
  // Comprehensive initialization and resize handling
  useEffect(() => {
    // One-time initialization function
    const initialize = () => {
      if (setupCanvas()) {
        // Create stars only after canvas is ready
        initializeStars();
        // Mark as initialized but don't trigger re-render
        isInitializedRef.current = true;
        // Start animation only after everything is ready
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    // Handle resize events
    const handleResize = () => {
      // Only re-initialize if already initialized
      if (isInitializedRef.current) {
        setupCanvas();
        initializeStars();
        // No need to change initialization state
      }
    };
    
    // Throttle resize events
    let resizeTimer;
    const throttledResize = () => {
      if (!resizeTimer) {
        resizeTimer = setTimeout(() => {
          resizeTimer = null;
          handleResize();
        }, 200); // 200ms throttle
      }
    };
    
    // Add resize listener
    window.addEventListener('resize', throttledResize);
    
    // Run initialization after first render is complete
    // This prevents the "double load" effect
    requestAnimationFrame(() => {
      firstRenderCompleteRef.current = true;
      initialize();
    });
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', throttledResize);
      if (resizeTimer) clearTimeout(resizeTimer);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [setupCanvas, initializeStars, animate]);
  
  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        zIndex: -1,
        pointerEvents: 'none'
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
};

export default Background;