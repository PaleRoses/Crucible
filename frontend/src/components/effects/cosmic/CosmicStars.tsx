'use client'

import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { useScroll, useSpring } from 'framer-motion';
// Import the refined utility
import { memoizedGetVariableColor, clearVariableColorCache } from '../utility/getVariableColor'; // Adjust path as needed
import type { GetVariableColorOptions } from '../utility/getVariableColor'; // Import type

// ---[[ Previous interfaces (ColorConfig, StarConfig, Star, StarSeed, etc.) remain the same ]]--
// Define types for our configuration
interface ColorConfig {
  stars: string[]; // Can be direct colors or var(--name)
  background: {
    topColor: string; // Can be direct color or var(--name)
    bottomColor: string; // Can be direct color or var(--name)
  };
}

// State for resolved colors
interface ResolvedColorConfig {
    stars: string[]; // Will hold only resolved CSS colors (e.g., 'rgb(R, G, B)')
    background: {
        topColor: string;
        bottomColor: string;
    }
}

interface StarConfig {
  // Star appearance
  starCount: number;
  starSizeMin: number;
  starSizeMax: number;
  starOpacityMin: number;
  starOpacityMax: number;

  // Parallax and movement parameters
  baseMovementSpeed: number;
  pulseFrequency: number; // Note: This seems unused in the update/draw logic now
  parallaxEnabled: boolean;
  parallaxFactor: number;

  // Trail effect parameters
  trailEnabled: boolean;
  trailLength: number; // Note: Trail length isn't explicitly used in drawStar, trail is based on last pos
  trailOpacityFactor: number;

  // Twinkling effect parameters (Note: Twinkling logic seems incomplete in the original updateAnimation)
  twinkleEnabled: boolean;
  twinkleProbability: number;
  twinkleDuration: [number, number];

  // Random fading parameters
  randomFadingEnabled: boolean;
  randomFadeOutProbability: number;
  maxSimultaneousFading: number;

  // Drifting movement parameters
  driftEnabled: boolean;
  driftSpeed: number;
  driftSpeedVariation: number;
  directionChangeFrequency: number;
  directionChangeAmount: number;

  // Star regeneration parameters
  regenerateOffscreenStars: boolean;
  fadeInDuration: number;
  fadeOutDuration: number;
  offscreenBuffer: number;

  // Physics parameters for bouncy effect
  springStrength: number;
  dampingFactor: number;

  // Star distribution parameters
  verticalSpreadFactor: number;
  offscreenBufferFactor: number;

  // Performance parameters
  maxFPS: number;

  // Enhanced persistence settings
  persistenceEnabled: boolean;
  persistenceInterval: number;
  timeBasedFallback: boolean;
  persistenceMaxAge: number;

  // Session persistence keys
  sessionKey: string;
  scrollPositionKey: string;
  lastVisitKey: string;

  // --- Input Colors Config ---
  colors: ColorConfig; // Can contain CSS variables

  // --- Options for Color Resolution ---
  colorResolutionOptions?: GetVariableColorOptions;
}

// Define Star object structure
interface Star {
  x: number;
  y: number;
  baseY: number;
  z: number; // Depth factor (affects size, speed, parallax)
  size: number;
  baseOpacity: number;
  opacity: number; // Current opacity (0-1)
  color: string; // Will store the *resolved* CSS color string
  pulsePhase: number; // For pulsing effect
  pulseSpeed: number; // Speed of pulsing
  movementSpeed: number; // Base movement speed (currently unused directly)
  driftDirectionX: number; // Normalized direction vector
  driftDirectionY: number; // Normalized direction vector
  driftSpeed: number; // Pixels per second
  parallaxFactor: number; // How much the star moves with scroll (0-1)
  state: 'visible' | 'fading-in' | 'fading-out';
  fadeProgress: number; // 0 to 1 for fade transitions
  fadeStart?: number; // Timestamp when fade started
  originalSeed?: number; // For deterministic regeneration
  velocity: number; // Vertical velocity for spring effect
  targetY: number; // Target y-position based on scroll and baseY
  lastX: number; // Previous frame's x position (for trails)
  lastY: number; // Previous frame's y position (for trails)
  // Note: Twinkle properties were present but logic wasn't fully implemented in update
  twinkleState: 'visible' | 'fading-in' | 'fading-out' | 'hidden';
  twinkleProgress: number;
  twinkleDuration: number;
  directionChangeTimer: number; // Timer for drift direction changes
  // Seed properties (used only during initial random generation)
  xSeed?: number;
  ySeed?: number;
}

// Define StarSeed for the session configuration (simplified)
interface StarSeed {
  // Properties loaded from storage or time-based generation
  x?: number;
  y?: number;
  baseY?: number;
  z?: number;
  size?: number;
  baseOpacity?: number;
  opacity?: number;
  colorIndex?: number; // Store index relative to *resolved* colors array
  pulsePhase?: number;
  pulseSpeed?: number;
  driftDirectionX?: number;
  driftDirectionY?: number;
  driftSpeed?: number;
  movementSpeed?: number;
  parallaxFactor?: number;
  state?: 'visible' | 'fading-in' | 'fading-out';
  fadeProgress?: number;
  fadeStart?: number;
  originalSeed?: number;

  // Properties generated by generateStarSeeds (for random init)
  xSeed?: number;
  ySeed?: number;
  zSeed?: number;
  sizeSeed?: number;
  opacitySeed?: number;
  phaseSeed?: number;
  speedSeed?: number;
  pulseSpeedSeed?: number;
  parallaxFactorSeed?: number;
  driftDirectionXSeed?: number;
  driftDirectionYSeed?: number;
  driftSpeedSeed?: number;
}


// Define session configuration
interface SessionConfig {
  source: 'sessionStorage' | 'timeBasedGeneration' | 'random';
  timestamp: number;
  starSeeds: StarSeed[]; // Uses StarSeed with added optional properties
}

// Define dimensions
interface Dimensions {
  width: number;
  height: number;
  pixelRatio: number;
}

// Define component props
interface CosmicStarsProps {
  config?: Partial<StarConfig>;
}

// Default configuration values
const DEFAULT_RAW_COLORS: ColorConfig = {
  stars: [
    'red', 
    'red', 
    'red'  
  ],
  background: {
    topColor: 'rgb(8, 8, 12)',
    bottomColor: 'rgb(15, 15, 20)'
  }
};

// Initial state for resolved colors (use defaults initially)
const INITIAL_RESOLVED_COLORS: ResolvedColorConfig = {
    stars: DEFAULT_RAW_COLORS.stars, // Assume defaults are already resolved
    background: {
        topColor: DEFAULT_RAW_COLORS.background.topColor,
        bottomColor: DEFAULT_RAW_COLORS.background.bottomColor,
    }
}

const DEFAULT_CONFIG: StarConfig = {
  // Star appearance
  starCount: 100,
  starSizeMin: 1.0,
  starSizeMax: 1.9,
  starOpacityMin: 0.5,
  starOpacityMax: 0.95,
  // Parallax and movement
  baseMovementSpeed: 0.00001,
  pulseFrequency: 0.00002,
  parallaxEnabled: true,
  parallaxFactor: 0.2,
  // Trail effect
  trailEnabled: true,
  trailLength: 2,
  trailOpacityFactor: 0.5,
  // Twinkling
  twinkleEnabled: true,
  twinkleProbability: 0.01,
  twinkleDuration: [2000, 4000],
  // Random fading
  randomFadingEnabled: true,
  randomFadeOutProbability: 0.0003,
  maxSimultaneousFading: 10,
  // Drifting
  driftEnabled: true,
  driftSpeed: 0.01,
  driftSpeedVariation: 0.005,
  directionChangeFrequency: 0.0005,
  directionChangeAmount: 0.05,
  // Regeneration
  regenerateOffscreenStars: true,
  fadeInDuration: 2000,
  fadeOutDuration: 1500,
  offscreenBuffer: 50,
  // Physics
  springStrength: 0.03,
  dampingFactor: 0.95,
  // Distribution
  verticalSpreadFactor: 3,
  offscreenBufferFactor: 1,
  // Performance
  maxFPS: 60,
  // Persistence
  persistenceEnabled: true,
  persistenceInterval: 3000,
  timeBasedFallback: true,
  persistenceMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  // Session keys (use v3 due to potential color index changes)
  sessionKey: 'scrolling_star_background_config_v3',
  scrollPositionKey: 'scrolling_star_background_scroll_v3',
  lastVisitKey: 'scrolling_star_background_last_visit_v3',
  // --- Default RAW Colors ---
  colors: DEFAULT_RAW_COLORS,
  // --- Default Color Resolution Options ---
  colorResolutionOptions: { fallback: '#FFFFFF', debug: false } // Default fallback white
};


/**
 * CosmicStars Component
 * Integrates CSS variable resolution for colors.
 */
const CosmicStars: React.FC<CosmicStarsProps> = ({ config: userConfig = {} }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<Star[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const lastScrollYRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);
  const dimensionsRef = useRef<Dimensions>({ width: 0, height: 0, pixelRatio: 1 });
  const { scrollY } = useScroll();
  const springScrollY = useSpring(scrollY, { stiffness: 100, damping: 20, mass: 1, restDelta: 0.01, restSpeed: 0.01 });
  const springScrollYRef = useRef<number>(0);

  useEffect(() => {
    const unsubscribe = springScrollY.onChange(value => springScrollYRef.current = value);
    return () => unsubscribe();
  }, [springScrollY]);

  // --- Configuration ---
  const CONFIG = useMemo<StarConfig>(() => {
    const mergeDeep = (target: any, source: any): any => { /* ... merge logic ... */
        const output = { ...target };
        if (isObject(target) && isObject(source)) {
            Object.keys(source).forEach(key => {
                if (isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = mergeDeep(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    };
    const isObject = (item: any): boolean => (item && typeof item === 'object' && !Array.isArray(item));
    let mergedConfig = mergeDeep(DEFAULT_CONFIG, userConfig);

    // Ensure colors object structure exists
    mergedConfig.colors = {
        stars: mergedConfig.colors?.stars?.length ? mergedConfig.colors.stars : DEFAULT_RAW_COLORS.stars,
        background: {
            topColor: mergedConfig.colors?.background?.topColor || DEFAULT_RAW_COLORS.background.topColor,
            bottomColor: mergedConfig.colors?.background?.bottomColor || DEFAULT_RAW_COLORS.background.bottomColor,
        }
    };
     // Ensure color resolution options exist
    mergedConfig.colorResolutionOptions = {
        ...DEFAULT_CONFIG.colorResolutionOptions,
        ...(userConfig.colorResolutionOptions || {})
    };


    return mergedConfig as StarConfig;
  }, [userConfig]);

  // --- State for Resolved Colors ---
  const [resolvedColors, setResolvedColors] = useState<ResolvedColorConfig>(INITIAL_RESOLVED_COLORS);
  const resolutionOptions = CONFIG.colorResolutionOptions; // Get options from config

  // --- Effect to Resolve Input Colors ---
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    let isMounted = true; // Track mount status for async operations

    // Function to perform resolution
    const resolveAllColors = () => {
        if (!isMounted) return; // Don't update if unmounted
        // console.log("[CosmicStars] Resolving colors...");

        const newResolved: ResolvedColorConfig = {
            stars: CONFIG.colors.stars.map(color =>
                memoizedGetVariableColor(color, resolutionOptions)
            ),
            background: {
                topColor: memoizedGetVariableColor(CONFIG.colors.background.topColor, resolutionOptions),
                bottomColor: memoizedGetVariableColor(CONFIG.colors.background.bottomColor, resolutionOptions),
            }
        };

        // Only update state if resolved colors actually changed
        setResolvedColors(currentResolved => {
            if (JSON.stringify(currentResolved) !== JSON.stringify(newResolved)) {
                // console.log("[CosmicStars] Resolved colors updated:", newResolved);
                return newResolved;
            }
            return currentResolved;
        });
    };

    // Initial resolution
    clearVariableColorCache(); // Clear cache before initial resolve on config change/mount
    resolveAllColors();

    // --- Observer for Dynamic Theme Changes ---
    const observerCallback = () => {
        if (!isMounted) return;
        // console.log("[CosmicStars] Mutation observed, re-resolving colors...");
        // Clear cache to ensure fresh values are fetched
        clearVariableColorCache();
        resolveAllColors();
    }
    const observer = new MutationObserver(observerCallback);
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['style', 'class']
    });
    // console.log("[CosmicStars] Color observer attached.");


    // Cleanup
    return () => {
      isMounted = false;
      observer.disconnect();
      // console.log("[CosmicStars] Color observer disconnected.");
    };
    // Rerun when the raw input colors or resolution options change
  }, [CONFIG.colors, resolutionOptions]);


  // --- Utility Functions (seededRandom, getDateSeed) ---
  const seededRandom = useCallback((seed: number): () => number => { /* ... unchanged ... */
      let state = seed; return () => { state = (state * 1103515245 + 12345) % 2147483648; return state / 2147483648; };
  }, []);
  const getDateSeed = useCallback((): number => { /* ... unchanged ... */
      const now = new Date(); return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
   }, []);

  // --- Canvas Setup ---
  const setupCanvas = useCallback((): boolean => { /* ... unchanged ... */
      if (!canvasRef.current) return false;
      const canvas = canvasRef.current; const width = window.innerWidth; const height = window.innerHeight; const pixelRatio = window.devicePixelRatio || 1;
      const currentDims = dimensionsRef.current;
      if (width === currentDims.width && height === currentDims.height && pixelRatio === currentDims.pixelRatio) return true;
      canvas.width = width * pixelRatio; canvas.height = height * pixelRatio; canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (ctx) {
          // Use RESOLVED color for initial fill
          ctx.fillStyle = resolvedColors.background.topColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      dimensionsRef.current = { width, height, pixelRatio }; return true;
  }, [canvasRef, resolvedColors.background.topColor]); // Depends on resolved color

  // --- Star Generation (Uses resolvedColors) ---

  const generateStarSeeds = useCallback((): StarSeed[] => { /* ... unchanged ... */
        const starSeeds: StarSeed[] = [];
        // Important: colorIndex here is based on the *input* CONFIG.colors.stars length
        // but will be mapped to resolvedColors later. Let's simplify and remove colorIndex from here.
        const numInputColors = CONFIG.colors.stars.length; // Base index on input array length

        for (let i = 0; i < CONFIG.starCount; i++) {
          starSeeds.push({
            xSeed: Math.random(), ySeed: Math.random() * CONFIG.verticalSpreadFactor - CONFIG.offscreenBufferFactor,
            zSeed: Math.random() * 0.8 + 0.1, sizeSeed: Math.random(), opacitySeed: Math.random(),
            phaseSeed: Math.random() * Math.PI * 2, speedSeed: Math.random(), pulseSpeedSeed: Math.random(),
            // Generate a random index based on the *resolved* colors length for immediate use
            colorIndex: Math.floor(Math.random() * resolvedColors.stars.length),
            parallaxFactorSeed: Math.random(), driftDirectionXSeed: Math.random() * 2 - 1,
            driftDirectionYSeed: Math.random() * 2 - 1, driftSpeedSeed: Math.random()
          });
        }
        return starSeeds;
    // Depend on resolvedColors length for generating correct indices
  }, [CONFIG.starCount, CONFIG.verticalSpreadFactor, CONFIG.offscreenBufferFactor, resolvedColors.stars.length]);


  const generateTimeBasedStars = useCallback((): Star[] => { /* ... uses resolvedColors ... */
    const { width, height } = dimensionsRef.current; if (!width || !height) return [];
    const dateSeed = getDateSeed(); const stars: Star[] = [];
    const numColors = resolvedColors.stars.length; // Use resolved length
    if (numColors === 0) return []; // Avoid error if no resolved colors

    for (let i = 0; i < CONFIG.starCount; i++) {
      const starSeed = dateSeed + i; const starRandom = seededRandom(starSeed);
      const z = starRandom() * 0.8 + 0.1;
      const colorIndex = Math.floor(starRandom() * numColors); // Index for resolvedColors
      const driftDirX = starRandom() * 2 - 1; const driftDirY = starRandom() * 2 - 1;
      const dirMagnitude = Math.sqrt(driftDirX**2 + driftDirY**2) || 1;
      const star: Star = {
        x: starRandom() * width, baseY: (starRandom() * CONFIG.verticalSpreadFactor - CONFIG.offscreenBufferFactor) * height, y: 0, z: z,
        size: (starRandom() * (CONFIG.starSizeMax - CONFIG.starSizeMin) + CONFIG.starSizeMin) * z,
        baseOpacity: starRandom() * (CONFIG.starOpacityMax - CONFIG.starOpacityMin) + CONFIG.starOpacityMin, opacity: 0,
        color: resolvedColors.stars[colorIndex], // Assign resolved color string
        pulsePhase: starRandom() * Math.PI * 2, pulseSpeed: (starRandom() * 0.002 + 0.001),
        movementSpeed: (starRandom() * 0.2 + 0.9) * CONFIG.baseMovementSpeed * (1.1 - z),
        driftDirectionX: driftDirX / dirMagnitude, driftDirectionY: driftDirY / dirMagnitude,
        driftSpeed: CONFIG.driftSpeed + (starRandom() * 2 - 1) * CONFIG.driftSpeedVariation,
        parallaxFactor: (starRandom() * 0.5 + 0.1) * CONFIG.parallaxFactor * (1 - z * 0.5),
        state: 'visible', fadeProgress: 1, targetY: 0, velocity: 0, lastX: 0, lastY: 0,
        twinkleState: 'visible', twinkleProgress: 0,
        twinkleDuration: starRandom() * (CONFIG.twinkleDuration[1] - CONFIG.twinkleDuration[0]) + CONFIG.twinkleDuration[0],
        directionChangeTimer: 0, originalSeed: starSeed
      };
      star.y = star.baseY; star.opacity = star.baseOpacity; star.targetY = star.y; star.lastX = star.x; star.lastY = star.y;
      stars.push(star);
    } return stars;
  }, [CONFIG, getDateSeed, seededRandom, resolvedColors.stars]); // Depends on resolvedColors


  const createNewStar = useCallback((replaceIndex: number | null = null): Star => { /* ... uses resolvedColors ... */
    const { width, height } = dimensionsRef.current;
    const numColors = resolvedColors.stars.length; // Use resolved length
    if (numColors === 0) { // Handle case with no resolved colors gracefully
        console.error("Cannot create star, no resolved colors available.");
        // Return a dummy star or throw an error? Returning dummy for now.
        return { x:0,y:0,baseY:0,z:0,size:0,baseOpacity:0,opacity:0,color:'white',pulsePhase:0,pulseSpeed:0,movementSpeed:0,driftDirectionX:0,driftDirectionY:0,driftSpeed:0,parallaxFactor:0,state:'fading-in',fadeProgress:0,targetY:0,velocity:0,lastX:0,lastY:0,twinkleState:'visible',twinkleProgress:0,twinkleDuration:0,directionChangeTimer:0 };
    }
    const oldStar = replaceIndex !== null ? starsRef.current[replaceIndex] : null;
    const z = oldStar?.z ?? (Math.random() * 0.8 + 0.1);
    // Generate index based on resolved colors length
    const colorIndex = Math.floor(Math.random() * numColors);
    const driftDirX = Math.random() * 2 - 1; const driftDirY = Math.random() * 2 - 1;
    const dirMagnitude = Math.sqrt(driftDirX**2 + driftDirY**2) || 1;
    const star: Star = {
        x: Math.random() * width, baseY: (Math.random() * CONFIG.verticalSpreadFactor - CONFIG.offscreenBufferFactor) * height, y: 0, z: z,
        size: oldStar?.size ?? ((Math.random() * (CONFIG.starSizeMax - CONFIG.starSizeMin) + CONFIG.starSizeMin) * z),
        baseOpacity: oldStar?.baseOpacity ?? (Math.random() * (CONFIG.starOpacityMax - CONFIG.starOpacityMin) + CONFIG.starOpacityMin),
        opacity: 0, // Start invisible
        color: resolvedColors.stars[colorIndex], // Assign resolved color
        pulsePhase: Math.random() * Math.PI * 2, pulseSpeed: Math.random() * 0.002 + 0.001,
        movementSpeed: (Math.random() * 0.2 + 0.9) * CONFIG.baseMovementSpeed * (1.1 - z),
        driftDirectionX: driftDirX / dirMagnitude, driftDirectionY: driftDirY / dirMagnitude,
        driftSpeed: CONFIG.driftSpeed + (Math.random() * 2 - 1) * CONFIG.driftSpeedVariation,
        parallaxFactor: oldStar?.parallaxFactor ?? ((Math.random() * 0.5 + 0.1) * CONFIG.parallaxFactor * (1 - z * 0.5)),
        state: 'fading-in', fadeProgress: 0, fadeStart: Date.now(), targetY: 0, velocity: 0, lastX: 0, lastY: 0,
        twinkleState: 'visible', twinkleProgress: 0,
        twinkleDuration: Math.random() * (CONFIG.twinkleDuration[1] - CONFIG.twinkleDuration[0]) + CONFIG.twinkleDuration[0],
        directionChangeTimer: 0, originalSeed: oldStar?.originalSeed
    };
    star.y = star.baseY; star.targetY = star.y; star.lastX = star.x; star.lastY = star.y;
    return star;
  }, [CONFIG, resolvedColors.stars]); // Depends on resolvedColors


  // --- Persistence (Uses resolvedColors for color index lookup) ---

  const saveCurrentState = useCallback(() => { /* ... uses resolvedColors ... */
    if (!starsRef.current.length || !dimensionsRef.current.width || !CONFIG.persistenceEnabled) return;
    try {
      const currentTime = Date.now();
      sessionStorage.setItem(CONFIG.scrollPositionKey, springScrollYRef.current.toString());
      sessionStorage.setItem(CONFIG.lastVisitKey, currentTime.toString());
      const stateToSave = {
        version: "3.0", // Increment version due to changes
        timestamp: currentTime, dateSeed: getDateSeed(), scrollY: springScrollYRef.current,
        viewport: { ...dimensionsRef.current },
        stars: starsRef.current.map(star => ({
          x: star.x, y: star.y, baseY: star.baseY, z: star.z, size: star.size, baseOpacity: star.baseOpacity,
          opacity: star.opacity,
          // Save the index relative to the CURRENT resolvedColors array
          colorIndex: resolvedColors.stars.indexOf(star.color),
          pulsePhase: star.pulsePhase, pulseSpeed: star.pulseSpeed, driftDirectionX: star.driftDirectionX,
          driftDirectionY: star.driftDirectionY, driftSpeed: star.driftSpeed, parallaxFactor: star.parallaxFactor,
          state: star.state, fadeProgress: star.fadeProgress,
          fadeStart: star.fadeStart ? currentTime - (currentTime - star.fadeStart) : undefined,
          originalSeed: star.originalSeed
        }))
      };
      sessionStorage.setItem(CONFIG.sessionKey, JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Could not save star state to session storage', error);
      sessionStorage.removeItem(CONFIG.sessionKey); sessionStorage.removeItem(CONFIG.scrollPositionKey); sessionStorage.removeItem(CONFIG.lastVisitKey);
    }
  }, [CONFIG, getDateSeed, resolvedColors.stars]); // Depends on resolvedColors


  const getSessionConfiguration = useCallback((): SessionConfig => { /* ... uses resolvedColors ... */
    if (!dimensionsRef.current.width) return { source: 'random', starSeeds: [], timestamp: Date.now() };
    if (CONFIG.persistenceEnabled) {
      try {
        const storedStateJSON = sessionStorage.getItem(CONFIG.sessionKey);
        const lastVisitTime = parseInt(sessionStorage.getItem(CONFIG.lastVisitKey) || '0', 10);
        const currentTime = Date.now();
        if (storedStateJSON && lastVisitTime) {
          const storedState = JSON.parse(storedStateJSON);
          // Check version - accept v3+ (or adjust as needed)
          if (storedState.version >= "3.0" && storedState.stars && storedState.timestamp) {
            const stateAge = currentTime - storedState.timestamp;
            if (stateAge < CONFIG.persistenceMaxAge && storedState.stars.length > 0) {
              if (storedState.scrollY !== undefined) {
                springScrollY.set(storedState.scrollY, false); springScrollYRef.current = storedState.scrollY; lastScrollYRef.current = storedState.scrollY;
              }
              const prevViewport = storedState.viewport || dimensionsRef.current;
              const scaleX = dimensionsRef.current.width / prevViewport.width; const scaleY = dimensionsRef.current.height / prevViewport.height;
              const loadedSeeds = storedState.stars.slice(0, CONFIG.starCount).map((starData: any): StarSeed => ({
                x: typeof starData.x === 'number' ? starData.x * scaleX : undefined, y: typeof starData.y === 'number' ? starData.y * scaleY : undefined,
                baseY: typeof starData.baseY === 'number' ? starData.baseY * scaleY : undefined, z: starData.z, size: starData.size,
                baseOpacity: starData.baseOpacity, opacity: starData.opacity,
                // Keep the loaded colorIndex - initializeStars will map it to the *current* resolvedColors
                colorIndex: starData.colorIndex,
                pulsePhase: starData.pulsePhase, pulseSpeed: starData.pulseSpeed, driftDirectionX: starData.driftDirectionX,
                driftDirectionY: starData.driftDirectionY, driftSpeed: starData.driftSpeed, parallaxFactor: starData.parallaxFactor,
                state: starData.state, fadeProgress: starData.fadeProgress,
                fadeStart: starData.fadeStart ? currentTime - (storedState.timestamp - starData.fadeStart) : undefined,
                originalSeed: starData.originalSeed
              }));
              while (loadedSeeds.length < CONFIG.starCount) loadedSeeds.push(generateStarSeeds()[0]);
              return { source: 'sessionStorage', timestamp: storedState.timestamp, starSeeds: loadedSeeds };
            }
          }
        }
      } catch (error) { console.warn('Could not load V3 star config', error); /* ... clear storage ... */ }
    }
    if (CONFIG.timeBasedFallback) {
      const timeBasedStars = generateTimeBasedStars();
      const timeBasedSeeds = timeBasedStars.map((star): StarSeed => ({
        x: star.x, y: star.y, baseY: star.baseY, z: star.z, size: star.size, baseOpacity: star.baseOpacity, opacity: star.opacity,
        // Get index relative to current resolved colors
        colorIndex: resolvedColors.stars.indexOf(star.color),
        pulsePhase: star.pulsePhase, pulseSpeed: star.pulseSpeed, driftDirectionX: star.driftDirectionX,
        driftDirectionY: star.driftDirectionY, driftSpeed: star.driftSpeed, parallaxFactor: star.parallaxFactor,
        state: star.state, fadeProgress: star.fadeProgress, originalSeed: star.originalSeed
      }));
      return { source: 'timeBasedGeneration', starSeeds: timeBasedSeeds, timestamp: Date.now() };
    }
    return { source: 'random', starSeeds: generateStarSeeds(), timestamp: Date.now() };
  }, [CONFIG, generateTimeBasedStars, generateStarSeeds, springScrollY, resolvedColors.stars]); // Depends on resolvedColors


  const initializeStars = useCallback(() => { /* ... uses resolvedColors ... */
    const { width, height } = dimensionsRef.current; if (!width || !height) return;
    const sessionConfig = getSessionConfiguration(); const { starSeeds, source } = sessionConfig;
    starsRef.current = [];
    const numColors = resolvedColors.stars.length; // Use resolved length
    if (numColors === 0) { console.error("No resolved star colors!"); return; }

    for (let i = 0; i < starSeeds.length; i++) {
      const seed = starSeeds[i]; let star: Star;
      const zValue = seed.z ?? (seed.zSeed !== undefined ? seed.zSeed * 0.8 + 0.1 : Math.random() * 0.8 + 0.1);
      // Map loaded/generated colorIndex to the current resolvedColors array safely
      const colorIndex = (seed.colorIndex !== undefined && seed.colorIndex >= 0 && seed.colorIndex < numColors)
          ? seed.colorIndex : Math.floor(Math.random() * numColors);
      const driftDirX = seed.driftDirectionX ?? (seed.driftDirectionXSeed !== undefined ? seed.driftDirectionXSeed : Math.random() * 2 - 1);
      const driftDirY = seed.driftDirectionY ?? (seed.driftDirectionYSeed !== undefined ? seed.driftDirectionYSeed : Math.random() * 2 - 1);
      const dirMagnitude = Math.sqrt(driftDirX**2 + driftDirY**2) || 1;
      star = {
        x: seed.x ?? (seed.xSeed !== undefined ? seed.xSeed * width : Math.random() * width),
        baseY: seed.baseY ?? (seed.ySeed !== undefined ? (seed.ySeed + CONFIG.offscreenBufferFactor) * height : (Math.random() * CONFIG.verticalSpreadFactor - CONFIG.offscreenBufferFactor) * height),
        y: 0, z: zValue,
        size: seed.size ?? (seed.sizeSeed !== undefined ? (seed.sizeSeed * (CONFIG.starSizeMax - CONFIG.starSizeMin) + CONFIG.starSizeMin) * zValue : CONFIG.starSizeMin * zValue),
        baseOpacity: seed.baseOpacity ?? (seed.opacitySeed !== undefined ? seed.opacitySeed * (CONFIG.starOpacityMax - CONFIG.starOpacityMin) + CONFIG.starOpacityMin : CONFIG.starOpacityMin),
        opacity: seed.opacity ?? 0,
        color: resolvedColors.stars[colorIndex], // Assign resolved color string
        pulsePhase: seed.pulsePhase ?? (seed.phaseSeed !== undefined ? seed.phaseSeed * Math.PI * 2 : Math.random() * Math.PI * 2),
        pulseSpeed: seed.pulseSpeed ?? (seed.pulseSpeedSeed !== undefined ? seed.pulseSpeedSeed * 0.002 + 0.001 : Math.random() * 0.002 + 0.001),
        movementSpeed: seed.movementSpeed ?? (seed.speedSeed !== undefined ? seed.speedSeed * CONFIG.baseMovementSpeed * (1.1 - zValue) : CONFIG.baseMovementSpeed * (1.1 - zValue)),
        driftDirectionX: driftDirX / dirMagnitude, driftDirectionY: driftDirY / dirMagnitude,
        driftSpeed: seed.driftSpeed ?? (CONFIG.driftSpeed + ( (seed.driftSpeedSeed ?? Math.random()) * 2 - 1) * CONFIG.driftSpeedVariation),
        parallaxFactor: seed.parallaxFactor ?? (seed.parallaxFactorSeed !== undefined ? (seed.parallaxFactorSeed * 0.5 + 0.1) * CONFIG.parallaxFactor * (1 - zValue * 0.5) : CONFIG.parallaxFactor * 0.5 * (1 - zValue * 0.5)),
        state: seed.state ?? 'visible', fadeProgress: seed.fadeProgress ?? 1, fadeStart: seed.fadeStart,
        originalSeed: seed.originalSeed, targetY: 0, velocity: 0, lastX: 0, lastY: 0,
        twinkleState: 'visible', twinkleProgress: 0,
        twinkleDuration: Math.random() * (CONFIG.twinkleDuration[1] - CONFIG.twinkleDuration[0]) + CONFIG.twinkleDuration[0],
        directionChangeTimer: 0, xSeed: source === 'random' ? seed.xSeed : undefined, ySeed: source === 'random' ? seed.ySeed : undefined,
      };
      star.y = star.baseY; star.targetY = star.y; star.lastX = star.x; star.lastY = star.y;
      // Set initial opacity based on state
      if (star.state === 'fading-in') { /* ... set opacity based on progress ... */
          const elapsed = star.fadeStart ? Date.now() - star.fadeStart : 0; star.fadeProgress = Math.min(1, elapsed / CONFIG.fadeInDuration); star.opacity = star.baseOpacity * star.fadeProgress;
          if (star.fadeProgress >= 1) { star.state = 'visible'; star.opacity = star.baseOpacity; star.fadeProgress = 1; star.fadeStart = undefined; }
      } else if (star.state === 'fading-out') { /* ... set opacity based on progress ... */
          const elapsed = star.fadeStart ? Date.now() - star.fadeStart : 0; star.fadeProgress = Math.max(0, 1 - (elapsed / CONFIG.fadeOutDuration)); star.opacity = star.baseOpacity * star.fadeProgress;
          if (star.fadeProgress <= 0) { star.opacity = 0; }
      } else { star.opacity = star.baseOpacity; star.fadeProgress = 1; star.fadeStart = undefined; }
      starsRef.current.push(star);
    }
    while (starsRef.current.length < CONFIG.starCount) {
        const newStar = createNewStar(); newStar.state = 'visible'; newStar.opacity = newStar.baseOpacity; newStar.fadeProgress = 1; newStar.fadeStart = undefined; starsRef.current.push(newStar);
    }
    isInitializedRef.current = true;
  }, [CONFIG, getSessionConfiguration, createNewStar, resolvedColors.stars]); // Depends on resolvedColors


  // --- Animation and Rendering (Uses resolvedColors) ---

  const isStarOffScreen = useCallback((star: Star): boolean => { /* ... unchanged ... */
      const { width, height } = dimensionsRef.current; if (!width || !height) return false; const buffer = CONFIG.offscreenBuffer; return ( star.x < -buffer || star.x > width + buffer || star.y < -buffer - (CONFIG.offscreenBufferFactor * height) || star.y > height + buffer + (CONFIG.verticalSpreadFactor * height) );
  }, [CONFIG.offscreenBuffer, CONFIG.verticalSpreadFactor, CONFIG.offscreenBufferFactor]);

  const drawStar = useCallback((ctx: CanvasRenderingContext2D, star: Star): void => { /* ... unchanged (already used star.color which is now resolved) ... */
      if (star.opacity <= 0.01) return;
      if (CONFIG.trailEnabled && (star.x !== star.lastX || star.y !== star.lastY)) {
          const trailAlpha = star.opacity * CONFIG.trailOpacityFactor;
          if (trailAlpha > 0.01) {
              let trailColor = `rgba(255, 255, 255, ${trailAlpha.toFixed(3)})`;
              try { const match = star.color.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:,\s*[\d.]+)?\)/); if (match) { trailColor = `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${trailAlpha.toFixed(3)})`; } else if (star.color.startsWith('#')) { let r = 0, g = 0, b = 0; if (star.color.length === 4) { r = parseInt(star.color[1] + star.color[1], 16); g = parseInt(star.color[2] + star.color[2], 16); b = parseInt(star.color[3] + star.color[3], 16); } else if (star.color.length === 7) { r = parseInt(star.color.substring(1, 3), 16); g = parseInt(star.color.substring(3, 5), 16); b = parseInt(star.color.substring(5, 7), 16); } if (!isNaN(r) && !isNaN(g) && !isNaN(b)) { trailColor = `rgba(${r}, ${g}, ${b}, ${trailAlpha.toFixed(3)})`; } } } catch (e) { }
              ctx.beginPath(); ctx.moveTo(star.x, star.y); ctx.lineTo(star.lastX, star.lastY); ctx.strokeStyle = trailColor; ctx.lineWidth = star.size * 0.6; ctx.lineCap = 'round'; ctx.stroke();
          }
      }
      ctx.globalAlpha = star.opacity; ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2); ctx.fillStyle = star.color; ctx.fill();
      if (star.opacity > 0.1) { ctx.globalAlpha = star.opacity * 0.4; ctx.beginPath(); ctx.arc(star.x, star.y, star.size * 1.8, 0, Math.PI * 2); ctx.fillStyle = star.color; ctx.fill(); }
      star.lastX = star.x; star.lastY = star.y;
   }, [CONFIG.trailEnabled, CONFIG.trailOpacityFactor]);

  const renderStars = useCallback(() => { /* ... uses resolvedColors ... */
    if (!canvasRef.current || !isInitializedRef.current) return; const canvas = canvasRef.current; const ctx = canvas.getContext('2d', { alpha: false }); if (!ctx) return;
    const { width, height, pixelRatio } = dimensionsRef.current; if (!width || !height) return;
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, resolvedColors.background.topColor); // Use resolved
    gradient.addColorStop(1, resolvedColors.background.bottomColor); // Use resolved
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save(); ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < starsRef.current.length; i++) drawStar(ctx, starsRef.current[i]);
    ctx.restore(); ctx.globalAlpha = 1.0;
  }, [drawStar, resolvedColors.background]); // Depends on resolved background colors

  const updateAnimation = useCallback((deltaTime: number, timestamp: number) => { /* ... unchanged ... */
      if (!isInitializedRef.current) return;
      const currentScrollY = springScrollYRef.current; const currentTime = Date.now(); let starsToReplace: number[] = []; let fadingCount = 0;
      if (CONFIG.randomFadingEnabled) { fadingCount = starsRef.current.reduce((count, star) => count + (star.state === 'fading-out' ? 1 : 0), 0); }
      const { width, height } = dimensionsRef.current; if (!width || !height) return;
      for (let i = 0; i < starsRef.current.length; i++) { const star = starsRef.current[i]; const deltaTimeSeconds = deltaTime / 1000.0;
          if (star.state === 'fading-in') { /*...*/ const elapsed = star.fadeStart ? currentTime - star.fadeStart : deltaTime; star.fadeProgress = Math.min(1, elapsed / CONFIG.fadeInDuration); star.opacity = star.baseOpacity * star.fadeProgress; if (star.fadeProgress >= 1) { star.state = 'visible'; star.opacity = star.baseOpacity; star.fadeProgress = 1; star.fadeStart = undefined; } }
          else if (star.state === 'fading-out') { /*...*/ const elapsed = star.fadeStart ? currentTime - star.fadeStart : deltaTime; star.fadeProgress = Math.max(0, 1 - (elapsed / CONFIG.fadeOutDuration)); star.opacity = star.baseOpacity * star.fadeProgress; if (star.fadeProgress <= 0) { starsToReplace.push(i); star.opacity = 0; continue; } }
          else { if (CONFIG.randomFadingEnabled && fadingCount < CONFIG.maxSimultaneousFading && Math.random() < CONFIG.randomFadeOutProbability * deltaTime) { star.state = 'fading-out'; star.fadeStart = currentTime; star.fadeProgress = 1.0; fadingCount++; star.opacity = star.baseOpacity * star.fadeProgress; continue; }
              if (CONFIG.parallaxEnabled) { star.targetY = star.baseY - (currentScrollY * star.parallaxFactor); } else { star.targetY = star.baseY; }
              const displacement = star.targetY - star.y; const springForce = displacement * CONFIG.springStrength; star.velocity += springForce * deltaTimeSeconds; star.velocity *= Math.pow(CONFIG.dampingFactor, deltaTimeSeconds); star.y += star.velocity * deltaTimeSeconds;
              if (CONFIG.driftEnabled) { const driftDistX = star.driftDirectionX * star.driftSpeed * deltaTimeSeconds; const driftDistY = star.driftDirectionY * star.driftSpeed * deltaTimeSeconds; star.x += driftDistX; star.baseY += driftDistY; star.targetY = star.baseY - (currentScrollY * star.parallaxFactor); star.directionChangeTimer += deltaTime; const changeThreshold = 1000 / (CONFIG.directionChangeFrequency * 60); if (star.directionChangeTimer > changeThreshold) { if (Math.random() < 0.5) { const changeX = (Math.random() * 2 - 1) * CONFIG.directionChangeAmount; const changeY = (Math.random() * 2 - 1) * CONFIG.directionChangeAmount; star.driftDirectionX += changeX; star.driftDirectionY += changeY; const dirMagnitude = Math.sqrt(star.driftDirectionX ** 2 + star.driftDirectionY ** 2) || 1; star.driftDirectionX /= dirMagnitude; star.driftDirectionY /= dirMagnitude; } star.directionChangeTimer = 0; } }
              const pulseTime = timestamp * 0.001; const pulseFactor = 0.5 * Math.sin(pulseTime * star.pulseSpeed + star.pulsePhase) + 0.5; const pulseRange = 0.3; star.opacity = star.baseOpacity * (1 - pulseRange + pulseFactor * pulseRange);
              if (CONFIG.regenerateOffscreenStars && isStarOffScreen(star)) { star.state = 'fading-out'; star.fadeStart = currentTime; star.fadeProgress = 1.0; star.opacity = star.baseOpacity * star.fadeProgress; } }
          star.opacity = Math.max(0, Math.min(1, star.opacity)); }
      if (starsToReplace.length > 0) { for (let i = starsToReplace.length - 1; i >= 0; i--) { const index = starsToReplace[i]; starsRef.current[index] = createNewStar(index); } }
      lastScrollYRef.current = currentScrollY;
      if (CONFIG.persistenceEnabled) { const saveInterval = CONFIG.persistenceInterval || 3000; const lastInterval = Math.floor((lastTimeRef.current || 0) / saveInterval); const currentInterval = Math.floor(timestamp / saveInterval); if (currentInterval > lastInterval) { saveCurrentState(); } }
   }, [CONFIG, isStarOffScreen, createNewStar, saveCurrentState]); // Exclude resolvedColors here as update depends on CONFIG

  const animate = useCallback((timestamp: number) => { /* ... unchanged ... */
      if (!isInitializedRef.current || !canvasRef.current) { animationFrameRef.current = requestAnimationFrame(animate); return; }
      const elapsed = timestamp - (lastTimeRef.current || timestamp); const deltaTime = Math.min(elapsed, 1000 / (CONFIG.maxFPS / 3) );
      const minFrameTime = 1000 / CONFIG.maxFPS; if (deltaTime < minFrameTime && lastTimeRef.current !== 0) { animationFrameRef.current = requestAnimationFrame(animate); return; }
      lastTimeRef.current = timestamp; updateAnimation(deltaTime, timestamp); renderStars(); animationFrameRef.current = requestAnimationFrame(animate);
   }, [CONFIG.maxFPS, updateAnimation, renderStars]); // renderStars dependency is okay

  // --- Effects ---

  // Initialize and handle resize
  useEffect(() => { /* ... mostly unchanged, ensure initializeStars depends on resolvedColors indirectly via getSessionConfig ... */
    let resizeTimer: ReturnType<typeof setTimeout> | null = null; let startTimeout: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => { const didSetup = setupCanvas(); if (didSetup && isInitializedRef.current) { initializeStars(); } else if (!isInitializedRef.current) { if(dimensionsRef.current.width > 0) { initializeStars(); if (isInitializedRef.current && !animationFrameRef.current) { animationFrameRef.current = requestAnimationFrame(animate); } } } };
    const throttledResize = () => { if (resizeTimer) clearTimeout(resizeTimer); resizeTimer = setTimeout(handleResize, 200); };
    const initialSetupDone = setupCanvas(); if (initialSetupDone) { initializeStars(); } else { throttledResize(); }
    window.addEventListener('resize', throttledResize);
    if (isInitializedRef.current && !animationFrameRef.current) { animationFrameRef.current = requestAnimationFrame(animate); }
    else if (!isInitializedRef.current) { startTimeout = setTimeout(() => { startTimeout = null; if (isInitializedRef.current && !animationFrameRef.current) { animationFrameRef.current = requestAnimationFrame(animate); } else if (!isInitializedRef.current) { console.warn("Animation not started after delay."); } }, 100); }
    return () => { window.removeEventListener('resize', throttledResize); if (resizeTimer) clearTimeout(resizeTimer); if (startTimeout) clearTimeout(startTimeout); if (animationFrameRef.current) { cancelAnimationFrame(animationFrameRef.current); animationFrameRef.current = null; } isInitializedRef.current = false; lastTimeRef.current = 0; };
  }, [setupCanvas, initializeStars, animate]); // Keep these dependencies

  // Handle page visibility and unload for persistence
  useEffect(() => { /* ... unchanged ... */
      if (!CONFIG.persistenceEnabled) return;
      const handleVisibilityChange = () => { if (document.visibilityState === 'hidden' && isInitializedRef.current) { saveCurrentState(); } };
      const handleBeforeUnload = () => { if (isInitializedRef.current) { saveCurrentState(); } };
      document.addEventListener('visibilitychange', handleVisibilityChange); window.addEventListener('beforeunload', handleBeforeUnload);
      return () => { document.removeEventListener('visibilitychange', handleVisibilityChange); window.removeEventListener('beforeunload', handleBeforeUnload); };
   }, [CONFIG.persistenceEnabled, saveCurrentState]);

  // --- Render Component ---
  const backgroundStyle = useMemo(() => ({
      // Use RESOLVED colors for the style
      background: `linear-gradient(to bottom, ${resolvedColors.background.topColor}, ${resolvedColors.background.bottomColor})`
  }), [resolvedColors.background.topColor, resolvedColors.background.bottomColor]); // Depends on resolved colors


  return (
    <div
      className="fixed inset-0 w-screen h-screen overflow-hidden -z-10 pointer-events-none"
      style={backgroundStyle}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />
    </div>
  );
};

export type { StarConfig, ColorConfig }; // Export types if needed

export default CosmicStars;
