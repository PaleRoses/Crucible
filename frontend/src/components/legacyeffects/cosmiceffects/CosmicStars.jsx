import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { useScroll, useSpring } from 'framer-motion';

/**
 * CosmicStars Component
 * 
 * Renders an immersive, performance-optimized starry background
 * with parallax scrolling, gentle random drifting, and state persistence.
 */
const CosmicStars = ({ config = {} }) => {
  // Refs for DOM elements and animation state
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const lastScrollYRef = useRef(0);
  
  // Use refs instead of state to prevent re-renders
  const isInitializedRef = useRef(false);
  const firstRenderCompleteRef = useRef(false);
  
  // Store dimensions in a ref to avoid re-renders when they change
  const dimensionsRef = useRef({ width: 0, height: 0, pixelRatio: 1 });
  
  // Get scroll position using framer-motion
  const { scrollY } = useScroll({
    smooth: 0.05  // Smoother scrolling for high-framerate animations
  });
  
  // Use spring physics for smoother scrolling effect
  const springScrollY = useSpring(scrollY, {
    stiffness: 1,
    damping: 5,
    mass: 0.5,
    restDelta: 0.001,
    restSpeed: 0.001
  });
  
  // Track spring scrollY value without causing re-renders
  const springScrollYRef = useRef(0);
  useEffect(() => {
    const unsubscribe = springScrollY.onChange(value => {
      springScrollYRef.current = value;
    });
    return () => unsubscribe();
  }, [springScrollY]);
  
  // Configuration - wrapped in useMemo to prevent recreation on each render
  // Merge default config with user-provided config
  const CONFIG = useMemo(() => ({
    // Star appearance
    starCount: 100,
    starSizeMin: 1.0,
    starSizeMax: 1.9,
    starOpacityMin: 0.2,
    starOpacityMax: 0.55,
    
    // Parallax and movement parameters
    baseMovementSpeed: 0.00001,  // Reduced for slower movement
    pulseFrequency: 0.00002,     // Slower pulsing
    parallaxEnabled: true,
    parallaxFactor: 0.2,  // How much stars move relative to scroll (0-1)
    
    // Trail effect parameters
    trailEnabled: true,          // Enable subtle trails
    trailLength: 2,              // Very short trail length (in pixels)
    trailOpacityFactor: 0.5,     // Trail opacity relative to star opacity
    
    // Twinkling effect parameters
    twinkleEnabled: true,        // Enable stars to fade in and out
    twinkleProbability: 0.01,    // Probability of a star beginning to twinkle each frame
    twinkleDuration: [2000, 4000], // Min and max duration of a twinkle cycle in ms
    
    // Random fading parameters
    randomFadingEnabled: true,    // Enable random fading of stars
    randomFadeOutProbability: 0.0003, // Probability of a star randomly starting to fade out per frame
    maxSimultaneousFading: 10,    // Maximum number of stars that can be fading at once
    
    // Drifting movement parameters
    driftEnabled: true,            // Enable slow drifting movement
    driftSpeed: 0.01,              // Base speed of drift movement (pixels per second)
    driftSpeedVariation: 0.005,    // Variation in drift speed between stars
    directionChangeFrequency: 0.0005, // Probability of changing direction each frame
    directionChangeAmount: 0.05,   // How much direction can change at once (lower = smoother)
    
    // Star regeneration parameters
    regenerateOffscreenStars: true, // Replace off-screen stars instead of wrapping
    fadeInDuration: 2000,          // Duration for new stars to fade in (ms)
    fadeOutDuration: 1500,         // Duration for off-screen stars to fade out (ms)
    offscreenBuffer: 50,           // Distance beyond viewport to trigger regeneration (px)
    
    // Physics parameters for bouncy effect
    springStrength: 0.03,  // Higher = snappier
    dampingFactor: 0.95,    // Higher = less bouncy (0-1)
    
    // Star distribution parameters
    verticalSpreadFactor: 3,  // How many screen heights to spread stars across
    offscreenBufferFactor: 1, // How many screen heights above viewport to generate stars
    
    // Performance parameters
    maxFPS: 60,
    
    // Enhanced persistence settings
    persistenceEnabled: true,        // Enable persistence features
    persistenceInterval: 3000,       // Save every 3 seconds (milliseconds)
    timeBasedFallback: true,         // Use time-based generation as fallback
    persistenceMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days before regenerating (milliseconds)
    
    // Session persistence keys - CHANGED BACK to match original for compatibility
    sessionKey: 'scrolling_star_background_config',
    scrollPositionKey: 'scrolling_star_background_scroll',
    lastVisitKey: 'scrolling_star_background_last_visit',
    
    // Override with user config
    ...config
  }), [config]);
  
  // Warm, golden color palette - wrapped in useMemo
  const COLORS = useMemo(() => ({
    // Star colors
    stars: [
      'var(--color-cosmic1)', // Warm yellow
      'var(--color-cosmic2)', // Golden
      'var(--color-cosmic3)'  // Off-white gold
    ],
    
    // Background gradient colors
    background: {
      topColor: 'rgb(8, 8, 12)',
      bottomColor: 'rgb(15, 15, 20)'
    },
    
    // Override with user config if provided
    ...(config.colors || {})
  }), [config.colors]);
  
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
  
  // Create a deterministic seeded random function
  const seededRandom = useCallback((seed) => {
    return () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }, []);

  // Get a seed based on current date (changes daily)
  const getDateSeed = useCallback(() => {
    const now = new Date();
    return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  }, []);
  
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
    
    // Ensure canvas is visible with a background color (use alpha: false for no flicker)
    const ctx = canvas.getContext('2d', { alpha: false });
    if (ctx) {
      // Fill with background color immediately to prevent flickering
      ctx.fillStyle = COLORS.background.topColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Update dimensions ref instead of state
    dimensionsRef.current = { width, height, pixelRatio };
    
    return true;
  }, [canvasRef, COLORS.background]);
  
  // Generate a new star configuration
  const generateStarSeeds = useCallback(() => {
    const { width, height } = dimensionsRef.current;
    if (!width || !height) return [];
    
    const starSeeds = [];
    
    for (let i = 0; i < CONFIG.starCount; i++) {
      starSeeds.push({
        xSeed: Math.random(),
        // Distribute stars vertically across multiple screen heights
        // Including above the viewport for continuous scrolling effect
        ySeed: Math.random() * CONFIG.verticalSpreadFactor - CONFIG.offscreenBufferFactor,
        zSeed: Math.random() * 0.8 + 0.1,
        sizeSeed: Math.random(),
        opacitySeed: Math.random(),
        phaseSeed: Math.random() * Math.PI * 2,
        speedSeed: Math.random() * 0.2 + 0.9,
        pulseSpeedSeed: Math.random() * 0.002 + 0.001,
        colorIndex: Math.floor(Math.random() * COLORS.stars.length),
        // Parallax factor determines how much this star moves with scrolling
        // Deeper stars (higher z) move less for realistic parallax
        parallaxFactorSeed: Math.random() * 0.5 + 0.1,
        // Drift movement properties
        driftDirectionXSeed: Math.random() * 2 - 1,
        driftDirectionYSeed: Math.random() * 2 - 1,
        driftSpeedSeed: Math.random()
      });
    }
    
    return starSeeds;
  }, [CONFIG, COLORS.stars.length]);
  
  // Enhanced time-based star generation for consistency
  const generateTimeBasedStars = useCallback(() => {
    const { width, height } = dimensionsRef.current;
    if (!width || !height) return [];
    
    // Create seed based on date
    const dateSeed = getDateSeed();
    
    // Generate new stars with deterministic positioning
    const stars = [];
    
    for (let i = 0; i < CONFIG.starCount; i++) {
      // Generate a seed for this specific star (that will be the same each day)
      const starSeed = dateSeed + i;
      const starRandom = seededRandom(starSeed);
      
      // Create the star using deterministic properties
      const star = {};
      
      // Position with some variance but tied to the date
      star.x = starRandom() * width;
      star.baseY = (starRandom() * CONFIG.verticalSpreadFactor - CONFIG.offscreenBufferFactor) * height;
      star.y = star.baseY;
      star.z = starRandom() * 0.8 + 0.1;
      
      // Visual properties
      star.size = (starRandom() * (CONFIG.starSizeMax - CONFIG.starSizeMin) + CONFIG.starSizeMin) * star.z;
      star.baseOpacity = starRandom() * (CONFIG.starOpacityMax - CONFIG.starOpacityMin) + CONFIG.starOpacityMin;
      star.opacity = star.baseOpacity;
      star.color = COLORS.stars[Math.floor(starRandom() * COLORS.stars.length)];
      
      // Animation properties
      star.pulsePhase = starRandom() * Math.PI * 2;
      star.pulseSpeed = starRandom() * 0.002 + 0.001;
      star.movementSpeed = (starRandom() * 0.2 + 0.9) * CONFIG.baseMovementSpeed * (1.1 - star.z);
      
      // Drift properties
      star.driftDirectionX = starRandom() * 2 - 1;
      star.driftDirectionY = starRandom() * 2 - 1;
      // Normalize direction
      const dirMagnitude = Math.sqrt(star.driftDirectionX ** 2 + star.driftDirectionY ** 2) || 1;
      star.driftDirectionX /= dirMagnitude;
      star.driftDirectionY /= dirMagnitude;
      star.driftSpeed = CONFIG.driftSpeed + (starRandom() * 2 - 1) * CONFIG.driftSpeedVariation;
      star.directionChangeTimer = 0;
      
      // Initial state
      star.state = 'visible';
      star.fadeProgress = 1;
      star.targetY = star.y;
      star.velocity = 0;
      star.lastX = star.x;
      star.lastY = star.y;
      
      // Parallax properties
      star.parallaxFactor = starRandom() * 0.5 * CONFIG.parallaxFactor * (1 - star.z * 0.5);
      
      // Initialize twinkling properties
      star.twinkleState = 'visible';
      star.twinkleProgress = 0;
      star.twinkleDuration = starRandom() * 
        (CONFIG.twinkleDuration[1] - CONFIG.twinkleDuration[0]) + 
        CONFIG.twinkleDuration[0];
      
      // Store original seed for future reference
      star.originalSeed = starSeed;
      
      stars.push(star);
    }
    
    return stars;
  }, [CONFIG, COLORS.stars, getDateSeed, seededRandom]);
  
  // Save the current star state and scroll position
  const saveCurrentState = useCallback(() => {
    if (!starsRef.current.length || !dimensionsRef.current.width || !CONFIG.persistenceEnabled) {
      return;
    }
    
    try {
      // Record current time
      const currentTime = Date.now();
      
      // Save current scroll position separately for quick access
      sessionStorage.setItem(CONFIG.scrollPositionKey, springScrollYRef.current.toString());
      
      // Save last visit time
      sessionStorage.setItem(CONFIG.lastVisitKey, currentTime.toString());
      
      // Prepare complete star state 
      const completeState = {
        version: "1.0", // For future compatibility
        timestamp: currentTime,
        dateSeed: getDateSeed(), // Store the seed for time-based fallback
        scrollY: springScrollYRef.current,
        viewport: {
          width: dimensionsRef.current.width,
          height: dimensionsRef.current.height,
          pixelRatio: dimensionsRef.current.pixelRatio
        },
        stars: starsRef.current.map(star => ({
          // Position data
          x: star.x,
          y: star.y, 
          baseY: star.baseY,
          z: star.z,
          
          // Visual properties
          size: star.size,
          baseOpacity: star.baseOpacity,
          opacity: star.opacity,
          color: COLORS.stars.indexOf(star.color),
          
          // Animation data
          pulsePhase: star.pulsePhase,
          pulseSpeed: star.pulseSpeed,
          driftDirectionX: star.driftDirectionX,
          driftDirectionY: star.driftDirectionY,
          driftSpeed: star.driftSpeed,
          movementSpeed: star.movementSpeed,
          parallaxFactor: star.parallaxFactor,
          
          // State
          state: star.state,
          fadeProgress: star.fadeProgress,
          fadeStart: star.fadeStart ? currentTime - (currentTime - star.fadeStart) : null,
          
          // For fallback/time consistency
          originalSeed: star.originalSeed || Math.random()
        }))
      };
      
      // Save complete state
      sessionStorage.setItem(CONFIG.sessionKey, JSON.stringify(completeState));
      
    } catch (error) {
      console.warn('Could not save star state to session storage', error);
    }
  }, [CONFIG, COLORS.stars, getDateSeed]);
  
  // Create a new star at random position
  const createNewStar = useCallback((offScreenStar = null) => {
    const { width, height } = dimensionsRef.current;
    const star = {};
    
    // If replacing an existing star, preserve some properties
    if (offScreenStar) {
      star.z = offScreenStar.z;
      star.size = offScreenStar.size;
      star.baseOpacity = offScreenStar.baseOpacity;
      star.pulsePhase = Math.random() * Math.PI * 2; // New phase
      star.color = offScreenStar.color;
      star.parallaxFactor = offScreenStar.parallaxFactor;
      star.originalSeed = offScreenStar.originalSeed; // Preserve seed if available
    } else {
      // Otherwise generate new properties
      star.z = Math.random() * 0.8 + 0.1;
      star.size = (Math.random() * (CONFIG.starSizeMax - CONFIG.starSizeMin) + CONFIG.starSizeMin) * star.z;
      star.baseOpacity = Math.random() * (CONFIG.starOpacityMax - CONFIG.starOpacityMin) + CONFIG.starOpacityMin;
      star.pulsePhase = Math.random() * Math.PI * 2;
      star.color = COLORS.stars[Math.floor(Math.random() * COLORS.stars.length)];
      star.parallaxFactor = Math.random() * 0.5 * CONFIG.parallaxFactor * (1 - star.z * 0.5);
      star.originalSeed = Math.random(); // New random seed
    }
    
    // Generate position
    // Avoid edges by using 10% inset from the viewport dimensions
    const edgeBuffer = Math.min(width, height) * 0.1;
    star.x = edgeBuffer + Math.random() * (width - 2 * edgeBuffer);
    star.baseY = edgeBuffer + Math.random() * (height - 2 * edgeBuffer);
    star.y = star.baseY;
    star.targetY = star.y;
    
    // For new stars during runtime, fade them in
    // For initial stars, start them fully visible
    const isInitialCreation = !isInitializedRef.current;
    if (isInitialCreation) {
      star.opacity = star.baseOpacity;
      star.state = 'visible';
      star.fadeProgress = 1;
    } else {
      star.opacity = 0;
      star.state = 'fading-in';
      star.fadeProgress = 0;
      star.fadeStart = Date.now();
    }
    
    // Movement properties
    star.pulseSpeed = Math.random() * 0.002 + 0.001;
    star.movementSpeed = (Math.random() * 0.2 + 0.9) * CONFIG.baseMovementSpeed * (1.1 - star.z);
    
    // Drift movement properties
    star.driftDirectionX = Math.random() * 2 - 1;
    star.driftDirectionY = Math.random() * 2 - 1;
    // Normalize the direction vector
    const dirMagnitude = Math.sqrt(star.driftDirectionX ** 2 + star.driftDirectionY ** 2);
    star.driftDirectionX /= dirMagnitude;
    star.driftDirectionY /= dirMagnitude;
    // Vary the drift speed between stars
    star.driftSpeed = CONFIG.driftSpeed + (Math.random() * 2 - 1) * CONFIG.driftSpeedVariation;
    star.directionChangeTimer = 0;
    
    // Initialize velocity and position tracking for trails
    star.velocity = 0;
    star.lastX = star.x;
    star.lastY = star.y;
    
    // Initialize twinkling properties
    star.twinkleState = 'visible';
    star.twinkleProgress = 0;
    star.twinkleDuration = Math.random() * 
      (CONFIG.twinkleDuration[1] - CONFIG.twinkleDuration[0]) + 
      CONFIG.twinkleDuration[0];
    
    // Physics properties
    star.velocity = 0;
    
    return star;
  }, [CONFIG, COLORS.stars]);
  
  // Enhanced version of getSessionConfiguration with time-based fallback
  const getSessionConfiguration = useCallback(() => {
    // First ensure dimensions are set
    if (!dimensionsRef.current.width) return { starSeeds: [] };
    
    // Check if we have a valid stored configuration
    if (CONFIG.persistenceEnabled) {
      try {
        // Try to load existing configuration from sessionStorage
        const storedState = sessionStorage.getItem(CONFIG.sessionKey);
        
        if (storedState) {
          const savedState = JSON.parse(storedState);
          
          // Check if the saved state is still valid and not too old
          const currentTime = Date.now();
          const stateAge = currentTime - savedState.timestamp;
          
          // Use saved state if it's not too old and has the right number of stars
          if (stateAge < CONFIG.persistenceMaxAge && 
              savedState.stars && 
              savedState.stars.length === CONFIG.starCount) {
            
            // Retrieve stored scroll position if available
            if (savedState.scrollY !== undefined) {
              // Store in ref to use in animation
              springScrollYRef.current = savedState.scrollY;
            }
            
            // Calculate scaling factors if viewport changed
            const prevViewport = savedState.viewport || { 
              width: dimensionsRef.current.width, 
              height: dimensionsRef.current.height 
            };
            
            const scaleX = dimensionsRef.current.width / prevViewport.width;
            const scaleY = dimensionsRef.current.height / prevViewport.height;
            
            // Return a starSeeds-compatible object for our existing code
            return {
              source: 'sessionStorage',
              timestamp: savedState.timestamp,
              starSeeds: savedState.stars.map(star => ({
                // Convert saved stars to the seed format our initialization expects
                x: star.x * scaleX,
                y: star.y * scaleY,
                baseY: star.baseY * scaleY,
                z: star.z,
                size: star.size,
                baseOpacity: star.baseOpacity,
                opacity: star.opacity,
                color: star.color,
                pulsePhase: star.pulsePhase,
                pulseSpeed: star.pulseSpeed,
                driftDirectionX: star.driftDirectionX,
                driftDirectionY: star.driftDirectionY,
                driftSpeed: star.driftSpeed,
                movementSpeed: star.movementSpeed,
                parallaxFactor: star.parallaxFactor,
                state: star.state,
                fadeProgress: star.fadeProgress,
                fadeStart: star.fadeStart,
                originalSeed: star.originalSeed
              }))
            };
          }
        }
      } catch (error) {
        console.warn('Could not load star configuration from session storage', error);
      }
    }
    
    // If no valid saved state or persistence disabled, use time-based approach
    if (CONFIG.timeBasedFallback) {
      const timeBasedStars = generateTimeBasedStars();
      
      // Convert to starSeeds format
      return {
        source: 'timeBasedGeneration',
        timestamp: Date.now(),
        starSeeds: timeBasedStars.map(star => ({
          x: star.x,
          y: star.y,
          baseY: star.baseY,
          z: star.z,
          size: star.size,
          baseOpacity: star.baseOpacity,
          opacity: star.opacity,
          color: COLORS.stars.indexOf(star.color),
          pulsePhase: star.pulsePhase,
          pulseSpeed: star.pulseSpeed,
          driftDirectionX: star.driftDirectionX,
          driftDirectionY: star.driftDirectionY,
          driftSpeed: star.driftSpeed,
          movementSpeed: star.movementSpeed,
          parallaxFactor: star.parallaxFactor,
          state: star.state,
          fadeProgress: star.fadeProgress,
          originalSeed: star.originalSeed
        }))
      };
    }
    
    // Fallback to completely random if all else fails
    const starSeeds = generateStarSeeds();
    return { source: 'random', starSeeds, timestamp: Date.now() };
  }, [CONFIG, COLORS.stars, generateStarSeeds, generateTimeBasedStars]);
  
  // Enhanced initializeStars function with improved persistence
  const initializeStars = useCallback(() => {
    const { width, height } = dimensionsRef.current;
    if (!width || !height) return;
    
    // First check if we already have stars that should be preserved
    if (starsRef.current.length > 0 && isInitializedRef.current) {
      // Only reinitialize if screen dimensions have significantly changed
      const existingWidth = starsRef.current[0].x / starsRef.current[0].xSeed;
      const existingHeight = starsRef.current[0].baseY / (starsRef.current[0].ySeed + CONFIG.offscreenBufferFactor);
      
      const widthChange = Math.abs(existingWidth - width) / width;
      const heightChange = Math.abs(existingHeight - height) / height;
      
      // If dimensions haven't changed much, preserve existing stars
      if (widthChange < 0.2 && heightChange < 0.2) {
        // Just update target positions based on new dimensions
        for (let i = 0; i < starsRef.current.length; i++) {
          const star = starsRef.current[i];
          // Scale position to new dimensions
          star.x = (star.x / existingWidth) * width;
          star.baseY = (star.baseY / existingHeight) * height;
          star.y = star.baseY;
          star.targetY = star.y;
        }
        return; // Keep existing stars
      }
    }
    
    // Get session configuration using our enhanced logic
    const sessionConfig = getSessionConfiguration();
    const { starSeeds, source } = sessionConfig;
    
    // Clear existing stars
    starsRef.current = [];
    
    // Create stars using the retrieved configuration
    for (let i = 0; i < starSeeds.length; i++) {
      const seed = starSeeds[i];
      const star = {};
      
      if (source === 'sessionStorage') {
        // We have exact star data from session storage
        star.x = seed.x;
        star.y = seed.y;
        star.baseY = seed.baseY;
        star.z = seed.z;
        star.size = seed.size;
        star.baseOpacity = seed.baseOpacity;
        star.opacity = seed.opacity;
        star.color = COLORS.stars[seed.color];
        star.pulsePhase = seed.pulsePhase;
        star.pulseSpeed = seed.pulseSpeed;
        star.movementSpeed = seed.movementSpeed;
        star.driftDirectionX = seed.driftDirectionX;
        star.driftDirectionY = seed.driftDirectionY;
        star.driftSpeed = seed.driftSpeed;
        star.parallaxFactor = seed.parallaxFactor;
        star.state = seed.state || 'visible';
        star.fadeProgress = seed.fadeProgress || 1;
        star.fadeStart = seed.fadeStart;
        star.originalSeed = seed.originalSeed;
      } else if (source === 'timeBasedGeneration') {
        // We have stars generated from a time-based seed
        star.x = seed.x;
        star.baseY = seed.baseY;
        star.y = seed.y;
        star.z = seed.z;
        star.size = seed.size;
        star.baseOpacity = seed.baseOpacity;
        star.opacity = seed.opacity;
        star.color = COLORS.stars[seed.color];
        star.pulsePhase = seed.pulsePhase;
        star.pulseSpeed = seed.pulseSpeed;
        star.movementSpeed = seed.movementSpeed;
        star.driftDirectionX = seed.driftDirectionX;
        star.driftDirectionY = seed.driftDirectionY;
        star.driftSpeed = seed.driftSpeed;
        star.parallaxFactor = seed.parallaxFactor;
        star.originalSeed = seed.originalSeed;
        star.state = 'visible';
        star.fadeProgress = 1;
      } else {
        // Original random generation code path
        // Store original seeds for future reference
        star.xSeed = seed.xSeed;
        star.ySeed = seed.ySeed;
        
        // Position - use seeds but adapt to current screen dimensions
        star.x = seed.xSeed * width;
        // Initial y position - distributed vertically across multiple screen heights
        star.baseY = (seed.ySeed + CONFIG.offscreenBufferFactor) * height;
        star.y = star.baseY;
        star.z = seed.zSeed; // Depth (0.1 to 0.9)
        
        // Visual properties
        star.size = (seed.sizeSeed * (CONFIG.starSizeMax - CONFIG.starSizeMin) + CONFIG.starSizeMin) * star.z;
        star.baseOpacity = seed.opacitySeed * (CONFIG.starOpacityMax - CONFIG.starOpacityMin) + CONFIG.starOpacityMin;
        star.opacity = star.baseOpacity; // Start fully visible
        
        // Animation properties
        star.pulsePhase = seed.phaseSeed;
        star.pulseSpeed = seed.pulseSpeedSeed;
        star.movementSpeed = seed.speedSeed * CONFIG.baseMovementSpeed * (1.1 - star.z);
        
        // Initialize velocity and position tracking for trails
        star.velocity = 0;
        star.lastX = star.x;
        star.lastY = star.y;
        
        // Initialize twinkling properties
        star.twinkleState = 'visible'; // 'fading-in', 'visible', 'fading-out', 'hidden'
        star.twinkleProgress = 0;
        star.twinkleDuration = Math.random() * 
          (CONFIG.twinkleDuration[1] - CONFIG.twinkleDuration[0]) + 
          CONFIG.twinkleDuration[0];
        
        // Drift movement properties (enhanced)
        star.driftDirectionX = seed.driftDirectionXSeed;
        star.driftDirectionY = seed.driftDirectionYSeed;
        // Normalize the direction vector
        const dirMagnitude = Math.sqrt(star.driftDirectionX ** 2 + star.driftDirectionY ** 2) || 1;
        star.driftDirectionX /= dirMagnitude;
        star.driftDirectionY /= dirMagnitude;
        // Vary the drift speed between stars
        star.driftSpeed = CONFIG.driftSpeed + (seed.driftSpeedSeed * 2 - 1) * CONFIG.driftSpeedVariation;
        star.directionChangeTimer = 0;
        
        // Star state tracking (new)
        star.state = 'visible'; // Start visible, not fading in
        star.fadeProgress = 1; // Fully visible
        
        // Parallax properties (for scrolling effect)
        // Make deeper stars (higher z) move less for realistic parallax
        star.parallaxFactor = seed.parallaxFactorSeed * CONFIG.parallaxFactor * (1 - star.z * 0.5);
        
        // Physics properties for bouncy effect
        star.velocity = 0;
        star.targetY = star.y;
        
        // Color variation
        star.color = COLORS.stars[seed.colorIndex];
      }
      
      // Common initialization for all stars
      star.directionChangeTimer = 0;
      star.velocity = 0;
      star.targetY = star.y;
      star.lastX = star.x || star.lastX;
      star.lastY = star.y || star.lastY;
      
      // Initialize twinkling properties if not already set
      if (!star.twinkleState) {
        star.twinkleState = 'visible';
        star.twinkleProgress = 0;
        star.twinkleDuration = Math.random() * 
          (CONFIG.twinkleDuration[1] - CONFIG.twinkleDuration[0]) + 
          CONFIG.twinkleDuration[0];
      }
      
      // Add to collection
      starsRef.current.push(star);
    }
  }, [CONFIG, COLORS.stars, getSessionConfiguration]);
  
  // Check if a star is off-screen
  const isStarOffScreen = useCallback((star) => {
    const { width, height } = dimensionsRef.current;
    const buffer = CONFIG.offscreenBuffer;
    
    return (
      star.x < -buffer ||
      star.x > width + buffer ||
      star.y < -buffer ||
      star.y > height + buffer
    );
  }, [CONFIG.offscreenBuffer]);
  
  // Optimized star rendering with subtle trail effect
  const drawStar = useCallback((ctx, star) => {
    // Skip rendering completely invisible stars
    if (star.opacity < 0.02) return;
    
    // Draw subtle trail if enabled and star is moving
    if (CONFIG.trailEnabled && (Math.abs(star.velocity) > 0.001 || Math.abs(star.lastX - star.x) > 0.1)) {
      // Calculate trail direction based on movement
      const trailX = star.lastX !== undefined ? star.lastX : star.x - star.velocity * 5;
      const trailY = star.lastY !== undefined ? star.lastY : star.y - star.velocity * 5;
      
      // Ensure the trail is very subtle
      ctx.beginPath();
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(trailX, trailY);
      ctx.strokeStyle = getColor(star.color, star.opacity * CONFIG.trailOpacityFactor);
      ctx.lineWidth = star.size * 0.6;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
    
    // Store current position for next frame's trail
    star.lastX = star.x;
    star.lastY = star.y;
    
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
  }, [CONFIG.trailEnabled, CONFIG.trailOpacityFactor, getColor]);
  
  // Render the stars on the canvas
  const renderStars = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    
    if (!ctx) return;
    
    const { width, height, pixelRatio } = dimensionsRef.current;
    
    // Fill with background color instead of clearing to prevent flickering
    ctx.fillStyle = COLORS.background.topColor;
    ctx.fillRect(0, 0, width * pixelRatio, height * pixelRatio);
    
    // Apply device pixel ratio scaling only once
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    
    // Enable global composition for better glow effect
    ctx.globalCompositeOperation = 'lighter';
    
    // Draw stars
    for (let i = 0; i < starsRef.current.length; i++) {
      const star = starsRef.current[i];
      drawStar(ctx, star);
    }
    
    // Reset global composition
    ctx.globalCompositeOperation = 'source-over';
  }, [drawStar, canvasRef, COLORS.background]);
  
  // Update animation state - optimized for performance
  const updateAnimation = useCallback((deltaTime, timestamp) => {
    const currentScrollY = springScrollYRef.current;
    lastScrollYRef.current = currentScrollY;
    
    // Global time factor for animations
    const timeFactor = timestamp * 0.001;
    const currentTime = Date.now();
    
    // Track stars to replace (avoid modifying array during iteration)
    const starsToReplace = [];
    
    // Count currently fading stars to manage random fading
    let fadingCount = 0;
    if (CONFIG.randomFadingEnabled) {
      fadingCount = starsRef.current.filter(star => star.state === 'fading-out' || star.state === 'fading-in').length;
    }
    
    // Update stars
    for (let i = 0; i < starsRef.current.length; i++) {
      const star = starsRef.current[i];
      
      // Handle star state transitions
      if (star.state === 'fading-in') {
        // Calculate progress for fade-in
        const elapsed = currentTime - star.fadeStart;
        star.fadeProgress = Math.min(1, elapsed / CONFIG.fadeInDuration);
        star.opacity = star.baseOpacity * star.fadeProgress;
        
        // Complete fade-in
        if (star.fadeProgress >= 1) {
          star.state = 'visible';
          star.opacity = star.baseOpacity;
        }
      } else if (star.state === 'fading-out') {
        // Calculate progress for fade-out
        const elapsed = currentTime - star.fadeStart;
        star.fadeProgress = Math.max(0, 1 - (elapsed / CONFIG.fadeOutDuration));
        star.opacity = star.baseOpacity * star.fadeProgress;
        
        // Complete fade-out - mark for replacement
        if (star.fadeProgress <= 0) {
          starsToReplace.push(i);
        }
      } else {
        // Normal visible state
        
        // Random fading (new feature)
        if (CONFIG.randomFadingEnabled && 
            fadingCount < CONFIG.maxSimultaneousFading && 
            Math.random() < CONFIG.randomFadeOutProbability * deltaTime) {
          // Start fade-out process for random star
          star.state = 'fading-out';
          star.fadeStart = currentTime;
          fadingCount++;
          continue; // Skip the rest of the loop for this star
        }
        
        // Calculate parallax effect based on scroll position
        if (CONFIG.parallaxEnabled) {
          // Update target position based on scroll (parallax effect)
          star.targetY = star.baseY - (currentScrollY * star.parallaxFactor);
        }
        
        // Apply spring physics for bouncy effect
        const displacement = star.targetY - star.y;
        const springForce = displacement * CONFIG.springStrength;
        
        // Update velocity with spring force
        star.velocity += springForce;
        
        // Apply damping to velocity
        star.velocity *= CONFIG.dampingFactor;
        
        // Add velocity clamping to prevent extreme bouncing
        const maxVelocity = 1.0; // Maximum allowed velocity
        star.velocity = Math.max(-maxVelocity, Math.min(maxVelocity, star.velocity));
        
        // Update position based on velocity (for parallax)
        star.y += star.velocity;
        
        // Apply drift movement if enabled
        if (CONFIG.driftEnabled) {
          // Apply movement with additional smoothing to prevent jumps
          // Calculate the intended movement
          const dx = star.driftDirectionX * star.driftSpeed * deltaTime;
          const dy = star.driftDirectionY * star.driftSpeed * deltaTime;
          
          // Apply a maximum movement limit to prevent jumps
          const maxMove = 0.5; // Maximum pixels to move per frame
          const actualDx = Math.abs(dx) > maxMove ? Math.sign(dx) * maxMove : dx;
          const actualDy = Math.abs(dy) > maxMove ? Math.sign(dy) * maxMove : dy;
          
          // Move star based on limited movement
          star.x += actualDx;
          // Add the drift to baseY (which is the reference point for parallax)
          star.baseY += actualDy;
          star.targetY = star.baseY - (currentScrollY * star.parallaxFactor);
          
          // Occasionally change drift direction with smoother transitions
          star.directionChangeTimer += deltaTime;
          if (Math.random() < CONFIG.directionChangeFrequency * deltaTime) {
            // Gradually change direction by adding a small random vector
            // Use the directionChangeAmount to limit the magnitude of the change
            const changeX = (Math.random() * 2 - 1) * CONFIG.directionChangeAmount;
            const changeY = (Math.random() * 2 - 1) * CONFIG.directionChangeAmount;
            
            // Apply a small percentage of the change for smoother transitions
            star.driftDirectionX += changeX;
            star.driftDirectionY += changeY;
            
            // Re-normalize the direction vector with safety checks
            const dirMagnitude = Math.sqrt(star.driftDirectionX ** 2 + star.driftDirectionY ** 2) || 1;
            
            // Prevent jittery movement by ensuring minimum magnitude
            if (dirMagnitude < 0.01) {
              // If direction vector is too small, reset to a random direction
              star.driftDirectionX = Math.random() * 2 - 1;
              star.driftDirectionY = Math.random() * 2 - 1;
              const newMagnitude = Math.sqrt(star.driftDirectionX ** 2 + star.driftDirectionY ** 2) || 1;
              star.driftDirectionX /= newMagnitude;
              star.driftDirectionY /= newMagnitude;
            } else {
              star.driftDirectionX /= dirMagnitude;
              star.driftDirectionY /= dirMagnitude;
            }
          }
        }
        
        // Check if star is now off-screen
        if (CONFIG.regenerateOffscreenStars && isStarOffScreen(star) && star.state === 'visible') {
          // Start fade-out process
          star.state = 'fading-out';
          star.fadeStart = currentTime;
        }
        
        // Simplified pulsing effect
        const pulseFactor = Math.sin(timeFactor * star.pulseSpeed + star.pulsePhase) * 0.15 + 0.85;
        // Only apply pulsing if not in a transition state
        if (star.state === 'visible') {
          star.opacity = star.baseOpacity * pulseFactor;
        }
      }
    }
    
    // Replace stars that have completed fade-out (in reverse order to avoid index issues)
    for (let i = starsToReplace.length - 1; i >= 0; i--) {
      const index = starsToReplace[i];
      // Create a new star to replace the off-screen one
      const newStar = createNewStar(starsRef.current[index]);
      // Replace the star in the array
      starsRef.current[index] = newStar;
    }
    
    // Save state periodically for persistence
    if (CONFIG.persistenceEnabled && timestamp % CONFIG.persistenceInterval < 16) {
      saveCurrentState();
    }
  }, [CONFIG, isStarOffScreen, createNewStar, saveCurrentState]);
  
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
    renderStars();
    
    // Schedule next frame
    animationFrameRef.current = requestAnimationFrame(animationLoop);
  }, [CONFIG.maxFPS, updateAnimation, renderStars]);
  
  // Initialize the stars when component mounts or dimensions change
  useEffect(() => {
    // One-time initialization function
    const initialize = () => {
      if (setupCanvas()) {
        // Synchronously restore scroll position before first render if available
        if (CONFIG.persistenceEnabled) {
          try {
            const savedScrollY = sessionStorage.getItem(CONFIG.scrollPositionKey);
            if (savedScrollY !== null) {
              // Set both the spring value and the ref value immediately
              springScrollY.set(parseFloat(savedScrollY));
              springScrollYRef.current = parseFloat(savedScrollY);
            }
          } catch (error) {
            console.warn('Could not restore scroll position', error);
          }
        }
        
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
  }, [
    setupCanvas, 
    initializeStars, 
    animate, 
    canvasRef, 
    CONFIG.persistenceEnabled, 
    CONFIG.scrollPositionKey, 
    springScrollY
  ]);
  
  // Add navigation event handlers to save state when user leaves
  useEffect(() => {
    if (!CONFIG.persistenceEnabled) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveCurrentState();
      }
    };
    
    const handleBeforeUnload = () => {
      saveCurrentState();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveCurrentState();
    };
  }, [CONFIG.persistenceEnabled, saveCurrentState]);
  
  // Calculate background colors
  const backgroundColors = useMemo(() => ({
    topColor: COLORS.background?.topColor || 'rgb(8, 8, 12)',
    bottomColor: COLORS.background?.bottomColor || 'rgb(15, 15, 20)'
  }), [COLORS.background]);
  
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

export default CosmicStars;