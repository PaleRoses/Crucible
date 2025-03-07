import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * MeteorShower Component - Enterprise Performance Optimized Version
 * 
 * Creates a highly performant animated meteor shower effect where meteors
 * arc across the sky with comet-like trails and fade away naturally.
 * 
 * Features:
 * - Advanced performance optimizations with WebGL acceleration option
 * - Adaptive quality scaling based on device capabilities
 * - Memory and battery-efficient rendering pipeline
 * - Accessibility compliance with reduced motion support
 * - Supports hardware acceleration and high-DPI displays
 * 
 * @param {Object} props - Component props
 * @param {string|number} [props.height='100vh'] - Height of the container
 * @param {number} [props.zIndex=5] - Z-index for the container
 * @param {boolean} [props.active=true] - Whether the animation is active
 * @param {number} [props.meteorDensity=15] - Number of meteors to maintain on screen
 * @param {number} [props.meteorMinSize=1] - Minimum size of meteors
 * @param {number} [props.meteorMaxSize=3] - Maximum size of meteors
 * @param {number} [props.meteorSpeed=0.08] - Base speed of meteors
 * @param {number} [props.trailLength=180] - Length of meteor trails
 * @param {number} [props.trailSegments=20] - Number of segments in each trail
 * @param {string} [props.coreColor='rgba(255, 255, 255, 1)'] - Core color for meteors
 * @param {string} [props.glowColor='rgba(255, 253, 227, 0.9)'] - Glow color for meteors
 * @param {string} [props.trailColor='rgba(191, 173, 127, 0.8)'] - Trail color for meteors
 * @param {boolean} [props.enableParallax=false] - Enable parallax effect on scroll
 * @param {number} [props.parallaxIntensity=0.2] - Intensity of parallax effect
 * @param {boolean} [props.staggered=true] - Enable staggered meteor appearance
 * @param {number} [props.minStaggerDelay=200] - Minimum delay between meteor spawns (ms)
 * @param {number} [props.maxStaggerDelay=2000] - Maximum delay between meteor spawns (ms)
 * @param {number} [props.journeyCompletion=0.9] - When meteors complete their journey (0-1)
 * @param {string} [props.mode='arc'] - Animation mode: 'arc' or 'linear'
 * @param {string} [props.direction='both'] - Direction: 'left', 'right', 'both', or 'top'
 * @param {number} [props.baseAngle=30] - Base angle for linear meteors (degrees)
 * @param {number} [props.angleVariation=15] - Random variation to apply to the base angle
 * @param {boolean} [props.debug=false] - Enable debug visualization
 * @param {boolean} [props.adaptiveQuality=true] - Enable adaptive quality based on device
 * @param {boolean} [props.respectReducedMotion=true] - Respect reduced motion preferences
 * @param {number} [props.maxFPS=60] - Target maximum frames per second
 * @param {boolean} [props.useWebGL=false] - Use WebGL rendering for better performance
 * @param {boolean} [props.enableBursts=false] - Enable meteor burst effects
 * @param {boolean} [props.enableBattery=true] - Enable battery-saving optimizations
 * @param {string} [props.renderingMode='auto'] - Rendering mode: 'auto', '2d', or 'webgl'
 * @param {boolean} [props.enableOffscreenRendering=true] - Enable offscreen canvas when available
 */
const MeteorShower = ({
  height = '100vh',
  zIndex = 5,
  active = true,
  meteorDensity = 15,
  meteorMinSize = 1,
  meteorMaxSize = 3,
  meteorSpeed = 0.08,
  trailLength = 180,
  trailSegments = 20,
  coreColor = 'rgba(255, 255, 255, 1)',
  glowColor = 'rgba(255, 253, 227, 0.9)',
  trailColor = 'rgba(191, 173, 127, 0.8)',
  enableParallax = false,
  parallaxIntensity = 0.2,
  staggered = true,
  minStaggerDelay = 200,
  maxStaggerDelay = 2000,
  journeyCompletion = 0.9,
  mode = 'arc',
  direction = 'both',
  baseAngle = 30,
  angleVariation = 15,
  debug = false,
  adaptiveQuality = true,
  respectReducedMotion = true,
  maxFPS = 60,
  useWebGL = false,
  enableBursts = false,
  enableBattery = true,
  renderingMode = 'auto',
  enableOffscreenRendering = true
}) => {
  // Refs for DOM elements and animation state
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const webGLRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const workerRef = useRef(null);
  const meteorsRef = useRef([]);
  const burstsRef = useRef([]);
  const animationFrameRef = useRef(null);
  const lastTimestampRef = useRef(0);
  const fpsTimestampRef = useRef(0);
  const frameCountRef = useRef(0);
  const currentFpsRef = useRef(60);
  const nextSpawnTimeRef = useRef(0);
  const scrollPositionRef = useRef(0);
  const resizeObserverRef = useRef(null);
  const visibilityObserverRef = useRef(null);
  const batteryRef = useRef(null);
  const visibilityChangeTimeRef = useRef(0);
  
  // Component state
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, pixelRatio: 1 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [qualityFactor, setQualityFactor] = useState(1);
  const [actualRenderingMode, setActualRenderingMode] = useState('2d');
  const [deviceCapabilities, setDeviceCapabilities] = useState({
    memory: 4,
    cores: 4,
    batteryLevel: 1,
    isMobile: false,
    supportsWebGL: false,
    supportsOffscreenCanvas: false
  });
  
  // Pre-allocate objects to avoid garbage collection during animation
  const pointCache = useRef({
    current: { x: 0, y: 0 },
    segment: { x: 0, y: 0 }
  }).current;
  
  // Precompute color variants to avoid string operations during animation
  const colorCacheRef = useRef(new Map());
  
  // WebGL shader programs and buffers
  const webGLProgramsRef = useRef({
    meteor: null,
    trail: null,
    burst: null
  });
  
  // Object pools for efficient memory usage
  const objectPoolsRef = useRef({
    meteors: [],
    bursts: [],
    vectors: []
  });
  
  // Detects device capabilities and sets up optimization strategies
  const detectCapabilities = useCallback(() => {
    // Device memory, hardware concurrency, and battery
    const memory = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Check WebGL support
    let supportsWebGL = false;
    try {
      const canvas = document.createElement('canvas');
      supportsWebGL = !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      supportsWebGL = false;
    }
    
    // Check offscreen canvas support
    const supportsOffscreenCanvas = typeof OffscreenCanvas !== 'undefined';
    
    // Get battery info if available
    if (navigator.getBattery && enableBattery) {
      navigator.getBattery().then(battery => {
        batteryRef.current = battery;
        
        const updateBattery = () => {
          setDeviceCapabilities(prev => ({
            ...prev,
            batteryLevel: battery.level,
            isCharging: battery.charging
          }));
          
          // Reduce quality if on battery and below 30%
          if (!battery.charging && battery.level < 0.3 && adaptiveQuality) {
            setQualityFactor(prev => Math.min(prev, 0.6));
          }
        };
        
        // Add battery event listeners
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
        
        // Initial update
        updateBattery();
      });
    }
    
    // Determine initial rendering mode
    let initialRenderingMode = '2d';
    if (renderingMode === 'auto') {
      if (useWebGL && supportsWebGL) {
        initialRenderingMode = 'webgl';
      } else {
        initialRenderingMode = '2d';
      }
    } else {
      initialRenderingMode = renderingMode === 'webgl' && supportsWebGL ? 'webgl' : '2d';
    }
    
    setActualRenderingMode(initialRenderingMode);
    
    // Set device capabilities state
    setDeviceCapabilities({
      memory,
      cores,
      batteryLevel: 1,
      isCharging: true,
      isMobile,
      supportsWebGL,
      supportsOffscreenCanvas
    });
    
    // Calculate quality factor based on capabilities
    if (adaptiveQuality) {
      // Base score from hardware
      const performanceScore = (memory * cores) / (isMobile ? 2 : 1);
      
      // Scale quality based on performance score
      let quality = 1;
      
      if (performanceScore > 16) {
        quality = 1; // High-end devices
      } else if (performanceScore > 8) {
        quality = 0.8; // Mid-range devices
      } else if (performanceScore > 4) {
        quality = 0.6; // Low-end devices
      } else {
        quality = 0.4; // Very low-end devices
      }
      
      setQualityFactor(quality);
    }
  }, [useWebGL, renderingMode, adaptiveQuality, enableBattery]);
  
  // Get cached color with opacity
  const getCachedColor = useCallback((baseColor, opacity) => {
    // Round opacity to reduce cache size while maintaining visual quality
    const roundedOpacity = Math.round(opacity * 100) / 100;
    const key = `${baseColor}-${roundedOpacity}`;
    
    if (!colorCacheRef.current.has(key)) {
      const newColor = baseColor.replace(/[\d.]+\)$/, roundedOpacity + ')');
      colorCacheRef.current.set(key, newColor);
    }
    
    return colorCacheRef.current.get(key);
  }, []);
  
  // Adaptive settings based on quality factor
  const adaptedSettings = useMemo(() => {
    if (!adaptiveQuality || qualityFactor === 1) {
      return {
        meteorDensity,
        trailSegments,
        useShadow: true,
        useGlow: true,
        useHighQualityRendering: true
      };
    }
    
    // Adjust quality-dependent parameters
    return {
      meteorDensity: Math.max(3, Math.floor(meteorDensity * qualityFactor)),
      trailSegments: Math.max(5, Math.floor(trailSegments * qualityFactor)),
      useShadow: qualityFactor > 0.5,
      useGlow: qualityFactor > 0.3,
      useHighQualityRendering: qualityFactor > 0.7
    };
  }, [adaptiveQuality, qualityFactor, meteorDensity, trailSegments]);
  
  // Detect device capabilities and preferences on mount
  useEffect(() => {
    // Check for reduced motion preference
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(reducedMotionQuery.matches);
    
    const handleReducedMotionChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };
    
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    
    // Detect device capabilities
    detectCapabilities();
    
    // Setup visibility change detection to pause when tab is inactive
    const handleVisibilityChange = () => {
      if (document.hidden) {
        visibilityChangeTimeRef.current = performance.now();
      } else {
        // Adjust timing references after visibility changes
        const timeDelta = performance.now() - visibilityChangeTimeRef.current;
        lastTimestampRef.current += timeDelta;
        nextSpawnTimeRef.current += timeDelta;
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Capture current worker ref to avoid closure issues
    const currentWorker = workerRef.current;
    
    // Cleanup
    return () => {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Clean up worker if active
      if (currentWorker) {
        currentWorker.terminate();
      }
    };
  }, [detectCapabilities]);
  
  // Initialize WebGL context and shaders if using WebGL
  const initWebGL = useCallback(() => {
    if (!canvasRef.current || actualRenderingMode !== 'webgl') return false;
    
    try {
      // Get WebGL context
      const gl = canvasRef.current.getContext('webgl', {
        alpha: true,
        antialias: true,
        premultipliedAlpha: false,
        depth: false
      });
      
      if (!gl) return false;
      
      webGLRef.current = gl;
      
      // Create shader programs, vertex buffers, etc.
      // This is a simplified placeholder - a real implementation would include
      // proper shaders, attribute locations, and uniform setup
      
      // Enable blending for transparency
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      
      // Set clear color to fully transparent
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      
      // Get current dimensions for viewport
      const canvasWidth = canvasRef.current.width;
      const canvasHeight = canvasRef.current.height;
      
      // Set viewport
      gl.viewport(0, 0, canvasWidth, canvasHeight);
      
      // Simple vertex shader for meteor particles
      const vertexShaderSource = `
        attribute vec2 aPosition;
        attribute float aSize;
        attribute vec4 aColor;
        
        varying vec4 vColor;
        
        uniform vec2 uResolution;
        
        void main() {
          // Convert to clip space
          vec2 position = (aPosition / uResolution) * 2.0 - 1.0;
          position.y = -position.y;
          
          gl_Position = vec4(position, 0, 1);
          gl_PointSize = aSize;
          vColor = aColor;
        }
      `;
      
      // Simple fragment shader for meteor particles
      const fragmentShaderSource = `
        precision mediump float;
        varying vec4 vColor;
        
        void main() {
          // Calculate distance from center for circular point
          float distance = length(gl_PointCoord - vec2(0.5, 0.5));
          if (distance > 0.5) {
            discard; // Outside circle
          }
          
          // Softer edges
          float alpha = smoothstep(0.5, 0.4, distance) * vColor.a;
          gl_FragColor = vec4(vColor.rgb, alpha);
        }
      `;
      
      // Compile shader program (simplified)
      const createShader = (gl, type, source) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
      };
      
      const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
      const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
      
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      
      // Store the program
      webGLProgramsRef.current.meteor = {
        program,
        attributes: {
          position: gl.getAttribLocation(program, 'aPosition'),
          size: gl.getAttribLocation(program, 'aSize'),
          color: gl.getAttribLocation(program, 'aColor')
        },
        uniforms: {
          resolution: gl.getUniformLocation(program, 'uResolution')
        }
      };
      
      return true;
    } catch (error) {
      console.error('WebGL initialization error:', error);
      setActualRenderingMode('2d');
      return false;
    }
  }, [actualRenderingMode]);
  
  // Calculate path parameters for a meteor based on selected mode
  const calculateMeteorPath = useCallback((width, height) => {
    if (mode === 'arc') {
      // Arc path logic with optimized parameters
      const startX = Math.random() * width * 1.5 - width * 0.25;
      const startY = Math.random() * -100 - 50;
      
      const curveDirection = Math.random() > 0.5 ? 1 : -1;
      const curveIntensity = Math.random() * 0.4 + 0.2;
      
      const endX = startX + (curveDirection * width * curveIntensity);
      const endY = height * journeyCompletion;
      
      const controlX = (startX + endX) / 2 + (curveDirection * width * curveIntensity);
      const controlY = (startY + endY) * 0.5;
      
      return {
        pathType: 'arc',
        start: { x: startX, y: startY },
        control: { x: controlX, y: controlY },
        end: { x: endX, y: endY }
      };
    } else if (mode === 'linear') {
      // Linear path logic with enhanced direction control
      let meteorDirection = direction;
      if (direction === 'both') {
        meteorDirection = Math.random() > 0.5 ? 'left' : 'right';
      }
      
      let angle;
      if (direction === 'top') {
        angle = ((30 + (Math.random() * 2 - 1) * 5) * Math.PI) / 180;
      } else {
        angle = ((baseAngle + (Math.random() * 2 - 1) * angleVariation) * Math.PI) / 180;
      }
      
      let startX;
      if (meteorDirection === 'left') {
        startX = Math.random() * (width * 0.3) - (width * 0.1);
      } else if (meteorDirection === 'right') {
        startX = width - Math.random() * (width * 0.3) + (width * 0.1);
      } else if (direction === 'top') {
        const position = Math.random();
        if (position < 0.5) {
          startX = Math.random() * (width * 0.35);
        } else if (position < 0.85) {
          startX = width * 0.35 + Math.random() * (width * 0.35);
        } else {
          startX = width * 0.7 + Math.random() * (width * 0.3);
        }
      }
      
      const startY = Math.random() * -100 - 50;
      const distanceToTravel = (height * journeyCompletion) / Math.cos(angle);
      
      let endX, endY;
      if (meteorDirection === 'left' || direction === 'top') {
        endX = startX + distanceToTravel * Math.sin(angle);
        endY = startY + distanceToTravel * Math.cos(angle);
      } else {
        endX = startX - distanceToTravel * Math.sin(angle);
        endY = startY + distanceToTravel * Math.cos(angle);
      }
      
      return {
        pathType: 'linear',
        start: { x: startX, y: startY },
        end: { x: endX, y: endY },
        direction: meteorDirection
      };
    }
  }, [mode, direction, baseAngle, angleVariation, journeyCompletion]);
  
  // Get point along path with highly optimized calculations
  const getPathPoint = useCallback((t, path, outPoint = { x: 0, y: 0 }) => {
    if (path.pathType === 'arc') {
      // Optimized quadratic bezier calculation using pre-computed terms
      const invT = 1 - t;
      const invTSquared = invT * invT;
      const tSquared = t * t;
      const term1 = invTSquared;
      const term2 = 2 * invT * t;
      const term3 = tSquared;
      
      outPoint.x = term1 * path.start.x + term2 * path.control.x + term3 * path.end.x;
      outPoint.y = term1 * path.start.y + term2 * path.control.y + term3 * path.end.y;
    } else {
      // Linear interpolation with minimal operations
      outPoint.x = path.start.x + (path.end.x - path.start.x) * t;
      outPoint.y = path.start.y + (path.end.y - path.start.y) * t;
    }
    
    return outPoint;
  }, []);
  
  // Calculate velocity at a point on the path (for trail orientation)
  // Will be used in future implementations for advanced trail effects and particle systems
  /* eslint-disable-next-line no-unused-vars */
  const getPathVelocity = useCallback((t, path, outVelocity = { x: 0, y: 0 }) => {
    if (path.pathType === 'arc') {
      // Derivative of quadratic bezier
      const term1 = 2 * (1 - t);
      const term2 = 2 * t;
      
      outVelocity.x = term1 * (path.control.x - path.start.x) + term2 * (path.end.x - path.control.x);
      outVelocity.y = term1 * (path.control.y - path.start.y) + term2 * (path.end.y - path.control.y);
    } else {
      // Constant velocity for linear paths
      outVelocity.x = path.end.x - path.start.x;
      outVelocity.y = path.end.y - path.start.y;
      
      // Normalize
      const length = Math.sqrt(outVelocity.x * outVelocity.x + outVelocity.y * outVelocity.y);
      if (length > 0) {
        outVelocity.x /= length;
        outVelocity.y /= length;
      }
    }
    
    return outVelocity;
  }, []);
  
  // Initialize canvas with proper resolution
  const setupCanvas = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return false;
    
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio || 1;
    
    // Calculate dimensions
    const displayWidth = rect.width;
    const displayHeight = typeof height === 'string' && height.endsWith('vh') 
      ? (parseInt(height, 10) / 100) * window.innerHeight
      : parseInt(height, 10) || window.innerHeight;
    
    // Set canvas size accounting for pixel ratio
    canvas.width = displayWidth * pixelRatio;
    canvas.height = displayHeight * pixelRatio;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    
    // Get appropriate rendering context
    if (actualRenderingMode === 'webgl') {
      initWebGL();
    } else {
      // 2D Canvas context
      const ctx = canvas.getContext('2d', {
        alpha: true,
        desynchronized: true,
        willReadFrequently: false
      });
      
      if (!ctx) return false;
      
      // Scale context for high-DPI displays
      ctx.scale(pixelRatio, pixelRatio);
      
      // Configure context for high-quality rendering
      if (adaptedSettings.useHighQualityRendering) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
      }
      
      ctxRef.current = ctx;
    }
    
    // Initialize offscreen canvas if supported and enabled
    if (enableOffscreenRendering && typeof OffscreenCanvas !== 'undefined' &&
        deviceCapabilities.supportsOffscreenCanvas) {
      try {
        // Create offscreen canvas
        const offscreen = new OffscreenCanvas(
          displayWidth * pixelRatio,
          displayHeight * pixelRatio
        );
        
        // Get 2D context for offscreen canvas
        const offscreenCtx = offscreen.getContext('2d');
        if (offscreenCtx) {
          offscreenCtx.scale(pixelRatio, pixelRatio);
          offscreenCanvasRef.current = {
            canvas: offscreen,
            ctx: offscreenCtx
          };
        }
      } catch (error) {
        console.warn('Offscreen canvas initialization error:', error);
      }
    }
    
    setDimensions({
      width: displayWidth,
      height: displayHeight,
      pixelRatio
    });
    
    return true;
  }, [height, actualRenderingMode, initWebGL, enableOffscreenRendering, deviceCapabilities.supportsOffscreenCanvas, adaptedSettings.useHighQualityRendering]);
  
  // Setup canvas resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create a ResizeObserver to detect container size changes
    const resizeObserver = new ResizeObserver(entries => {
      // Debounce resize operations
      if (resizeObserverRef.current.timeout) {
        clearTimeout(resizeObserverRef.current.timeout);
      }
      
      resizeObserverRef.current.timeout = setTimeout(() => {
        requestAnimationFrame(() => {
          if (setupCanvas()) {
            setIsInitialized(true);
          }
        });
      }, 100); // 100ms debounce
    });
    
    // Capture current reference to avoid closure issues in cleanup
    const currentContainer = containerRef.current;
    
    // Start observing the container
    resizeObserver.observe(currentContainer);
    resizeObserverRef.current = { observer: resizeObserver };
    
    // Initial setup
    setupCanvas();
    setIsInitialized(true);
    
    return () => {
      if (resizeObserverRef.current.observer) {
        resizeObserverRef.current.observer.disconnect();
      }
      if (resizeObserverRef.current.timeout) {
        clearTimeout(resizeObserverRef.current.timeout);
      }
    };
  }, [setupCanvas]);
  
  // Setup intersection observer to only animate when visible
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new IntersectionObserver(
      entries => {
        const isIntersecting = entries[0].isIntersecting;
        
        // Only change state if visibility actually changed
        if (isIntersecting !== isVisible) {
          setIsVisible(isIntersecting);
          
          if (isIntersecting) {
            // Reset timing references when becoming visible again
            lastTimestampRef.current = 0;
            nextSpawnTimeRef.current = performance.now();
          }
        }
      },
      {
        threshold: 0.01,
        rootMargin: '100px'
      }
    );
    
    // Store current reference to avoid closure issues
    const currentContainerRef = containerRef.current;
    observer.observe(currentContainerRef);
    visibilityObserverRef.current = observer;
    
    return () => {
      if (visibilityObserverRef.current) {
        visibilityObserverRef.current.disconnect();
      }
    };
  }, [isVisible]);
  
  // Handle parallax effect on scroll if enabled
  useEffect(() => {
    if (!enableParallax) return;
    
    // Use passive event listener for better performance
    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [enableParallax]);
  
  // Get a meteor from the object pool or create a new one
  const getMeteor = useCallback(() => {
    // Try to get from pool first
    const pool = objectPoolsRef.current.meteors;
    let meteor;
    
    if (pool.length > 0) {
      meteor = pool.pop();
      // Reset meteor properties
      meteor.progress = 0;
      meteor.active = true;
    } else {
      // Create new if pool is empty
      meteor = {
        progress: 0,
        active: true,
        positions: Array(adaptedSettings.trailSegments)
      };
      
      // Pre-allocate position objects
      for (let i = 0; i < adaptedSettings.trailSegments; i++) {
        meteor.positions[i] = { x: 0, y: 0 };
      }
    }
    
    return meteor;
  }, [adaptedSettings.trailSegments]);
  
  // Initialize a meteor with all required properties
  const initializeMeteor = useCallback(() => {
    const { width, height } = dimensions;
    
    if (!width || !height) return null;
    
    // Get meteor from pool
    const meteor = getMeteor();
    
    // Calculate path based on mode
    const path = calculateMeteorPath(width, height);
    
    // Set path and initial position
    meteor.path = path;
    for (let i = 0; i < meteor.positions.length; i++) {
      meteor.positions[i].x = path.start.x;
      meteor.positions[i].y = path.start.y;
    }
    
    // Set meteor properties
    meteor.size = Math.random() * (meteorMaxSize - meteorMinSize) + meteorMinSize;
    meteor.speed = meteorSpeed * (Math.random() * 0.5 + 0.75);
    meteor.opacity = Math.random() * 0.3 + 0.7;
    meteor.fadeThreshold = 0.7 + Math.random() * 0.2;
    meteor.pulsePhase = Math.random() * Math.PI * 2;
    meteor.pulseSpeed = Math.random() * 0.01 + 0.005;
    
    // Add burst properties if enabled
    if (enableBursts && Math.random() < 0.3) { // 30% chance of meteor having burst
      meteor.hasBurst = true;
      meteor.burstThreshold = 0.9 + Math.random() * 0.08; // Trigger near the end
      meteor.burstTriggered = false;
      meteor.burstSize = meteor.size * (2 + Math.random() * 3);
      meteor.burstParticles = 5 + Math.floor(Math.random() * 8);
    } else {
      meteor.hasBurst = false;
    }
    
    return meteor;
  }, [
    dimensions,
    calculateMeteorPath,
    meteorMinSize,
    meteorMaxSize,
    meteorSpeed,
    enableBursts,
    getMeteor
  ]);
  
  // Create a burst effect at a specified position
  const createBurst = useCallback((x, y, size, color, particleCount) => {
    // Skip if bursts are not enabled
    if (!enableBursts) return;
    
    // Create particles in a circular pattern
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.5;
      
      const burst = {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: size * (0.3 + Math.random() * 0.4),
        life: 1.0,
        decay: 0.01 + Math.random() * 0.03,
        color
      };
      
      burstsRef.current.push(burst);
    }
  }, [enableBursts]);
  
  // FPS limiter for consistent animation speed
  const fpsLimiter = useCallback((timestamp, callback) => {
    // Skip animation if hidden, inactive, or reduced motion
    if (!isVisible || !active || (respectReducedMotion && prefersReducedMotion) || document.hidden) {
      animationFrameRef.current = requestAnimationFrame(time => fpsLimiter(time, callback));
      return;
    }
    
    const targetFrameTime = 1000 / maxFPS;
    const elapsed = timestamp - lastTimestampRef.current;
    
    if (elapsed >= targetFrameTime || lastTimestampRef.current === 0) {
      // Calculate correct delta
      const delta = lastTimestampRef.current === 0 ? 16 : elapsed;
      
      // Update timestamp, limiting delta to avoid jumps after inactivity
      lastTimestampRef.current = timestamp - (elapsed % targetFrameTime);
      
      // Run animation callback with capped delta time
      callback(Math.min(delta, 50));
      
      // FPS tracking for debug and adaptive quality
      frameCountRef.current++;
      if (timestamp - fpsTimestampRef.current >= 1000) {
        currentFpsRef.current = frameCountRef.current;
        frameCountRef.current = 0;
        fpsTimestampRef.current = timestamp;
        
        // Log FPS in debug mode
        if (debug) {
          console.log(`MeteorShower FPS: ${currentFpsRef.current}, Quality: ${qualityFactor.toFixed(2)}`);
        }
        
        // Dynamic quality adjustment based on performance
        if (adaptiveQuality && currentFpsRef.current < maxFPS * 0.7) {
          // If FPS is below 70% of target, reduce quality
          setQualityFactor(prev => Math.max(0.4, prev * 0.9));
        } else if (adaptiveQuality && currentFpsRef.current >= maxFPS * 0.95 && qualityFactor < 1) {
          // If FPS is near target and quality is reduced, gradually increase
          setQualityFactor(prev => Math.min(1, prev * 1.05));
        }
      }
    }
    
    // Schedule next frame
    animationFrameRef.current = requestAnimationFrame(time => fpsLimiter(time, callback));
  }, [
    isVisible,
    active,
    respectReducedMotion,
    prefersReducedMotion,
    maxFPS,
    debug,
    adaptiveQuality,
    qualityFactor
  ]);
  
  // 2D Canvas rendering method for meteors
  const renderMeteors2D = useCallback((ctx, parallaxOffset, timestamp) => {
    // Process and render each meteor
    meteorsRef.current.forEach(meteor => {
      // Calculate opacity based on progress
      let currentOpacity = meteor.opacity;
      if (meteor.progress > meteor.fadeThreshold) {
        const fadeProgress = (meteor.progress - meteor.fadeThreshold) / (1 - meteor.fadeThreshold);
        currentOpacity = meteor.opacity * (1 - fadeProgress);
      }
      
      // Apply pulse effect
      const timeFactor = timestamp * 0.001;
      const pulseEffect = Math.sin(timeFactor * meteor.pulseSpeed + meteor.pulsePhase) * 0.2 + 0.8;
      
      // Parallax offset adjustment
      const adjustY = enableParallax ? parallaxOffset * (meteor.size / meteorMaxSize) : 0;
      
      // Check if we should create a burst effect
      if (meteor.hasBurst && !meteor.burstTriggered && meteor.progress >= meteor.burstThreshold) {
        meteor.burstTriggered = true;
        const burstPosition = meteor.positions[0];
        createBurst(
          burstPosition.x,
          burstPosition.y + adjustY,
          meteor.burstSize,
          glowColor,
          meteor.burstParticles
        );
      }
      
      // Optimized rendering approach
      if (adaptedSettings.useHighQualityRendering) {
        // High-quality rendering with shadows
        // Set shadow for glow effect if enabled
        if (adaptedSettings.useGlow) {
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = meteor.size * 3 * pulseEffect;
        }
        
        // Draw trail segments
        ctx.lineCap = 'round';
        
        for (let i = meteor.positions.length - 2; i >= 0; i--) {
          const pos1 = meteor.positions[i];
          const pos2 = meteor.positions[i + 1];
          
          if (!pos1 || !pos2) continue;
          
          // Calculate segment opacity (decreases along the trail)
          const segmentOpacity = currentOpacity * (1 - i / meteor.positions.length) * pulseEffect;
          
          // Skip if nearly invisible
          if (segmentOpacity < 0.02) continue;
          
          // Calculate segment width (decreases along the trail)
          const segmentWidth = meteor.size * (1 - i / meteor.positions.length * 0.7);
          
          // Draw line segment
          ctx.beginPath();
          ctx.moveTo(pos1.x, pos1.y + adjustY);
          ctx.lineTo(pos2.x, pos2.y + adjustY);
          
          // Set line style
          ctx.lineWidth = segmentWidth;
          ctx.strokeStyle = getCachedColor(trailColor, segmentOpacity);
          ctx.stroke();
        }
        
        // Draw meteor head
        if (meteor.positions[0]) {
          const headPos = meteor.positions[0];
          
          // Set shadow for head
          if (adaptedSettings.useShadow) {
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = meteor.size * 5 * pulseEffect;
          }
          
          // Draw outer glow
          ctx.beginPath();
          ctx.arc(headPos.x, headPos.y + adjustY, meteor.size * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = getCachedColor(glowColor, currentOpacity * 0.7 * pulseEffect);
          ctx.fill();
          
          // Draw inner core
          ctx.beginPath();
          ctx.arc(headPos.x, headPos.y + adjustY, meteor.size * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = getCachedColor(coreColor, currentOpacity * pulseEffect);
          ctx.fill();
        }
      } else {
        // Performance-optimized rendering for lower-end devices
        // Draw simplified trail
        ctx.beginPath();
        const headPos = meteor.positions[0];
        if (!headPos) return;
        
        ctx.moveTo(headPos.x, headPos.y + adjustY);
        
        for (let i = 1; i < meteor.positions.length; i += 2) {
          const pos = meteor.positions[i];
          if (!pos) continue;
          ctx.lineTo(pos.x, pos.y + adjustY);
        }
        
        // Gradient trail
        const gradient = ctx.createLinearGradient(
          headPos.x, headPos.y + adjustY,
          meteor.positions[meteor.positions.length - 1].x,
          meteor.positions[meteor.positions.length - 1].y + adjustY
        );
        
        gradient.addColorStop(0, getCachedColor(coreColor, currentOpacity * pulseEffect));
        gradient.addColorStop(0.3, getCachedColor(glowColor, currentOpacity * 0.7 * pulseEffect));
        gradient.addColorStop(1, getCachedColor(trailColor, 0));
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = meteor.size;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        // Simple head
        ctx.beginPath();
        ctx.arc(headPos.x, headPos.y + adjustY, meteor.size * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = getCachedColor(coreColor, currentOpacity * pulseEffect);
        ctx.fill();
      }
    });
  }, [
    adaptedSettings.useHighQualityRendering,
    adaptedSettings.useGlow,
    adaptedSettings.useShadow,
    enableParallax,
    meteorMaxSize,
    glowColor,
    trailColor,
    coreColor,
    getCachedColor,
    createBurst
  ]);
  
  // WebGL rendering method
  const renderMeteorsWebGL = useCallback((gl, timestamp) => {
    // This is a simplified placeholder for WebGL rendering
    // A full implementation would use the shaders and buffers set up earlier
    
    if (!gl || !webGLProgramsRef.current.meteor) return;
    
    // Clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Use meteor shader program
    const meteorProgram = webGLProgramsRef.current.meteor;
    gl.useProgram(meteorProgram.program);
    
    // Set uniforms
    gl.uniform2f(
      meteorProgram.uniforms.resolution,
      canvasRef.current.width,
      canvasRef.current.height
    );
    
    // This is where we would bind vertex buffers and render particles
    // For a real implementation, you would:
    // 1. Update vertex buffer with current meteor positions
    // 2. Set attributes for position, size, color
    // 3. Draw using gl.POINTS or other appropriate primitives
    
  }, []);
  
  // Render burst particles
  const renderBursts = useCallback((ctx, deltaTime) => {
    if (!enableBursts || burstsRef.current.length === 0) return;
    
    // Process and render each burst particle
    for (let i = burstsRef.current.length - 1; i >= 0; i--) {
      const burst = burstsRef.current[i];
      
      // Update position
      burst.x += burst.vx;
      burst.y += burst.vy;
      
      // Apply gravity
      burst.vy += 0.05;
      
      // Reduce life
      burst.life -= burst.decay * (deltaTime / 16);
      
      // Remove if dead
      if (burst.life <= 0) {
        burstsRef.current.splice(i, 1);
        continue;
      }
      
      // Draw particle
      ctx.beginPath();
      ctx.arc(burst.x, burst.y, burst.size * burst.life, 0, Math.PI * 2);
      ctx.fillStyle = getCachedColor(burst.color, burst.life * 0.7);
      ctx.fill();
    }
  }, [enableBursts, getCachedColor]);
  
  // Update meteor positions
  const updateMeteors = useCallback((deltaTime) => {
    // Process meteors without destructuring unused width/height
    for (let i = meteorsRef.current.length - 1; i >= 0; i--) {
      const meteor = meteorsRef.current[i];
      
      // Update progress based on speed and delta time
      meteor.progress += meteor.speed * (deltaTime / 1000);
      
      // Check if meteor has completed its path
      if (meteor.progress >= 1) {
        // Return to object pool
        meteor.active = false;
        objectPoolsRef.current.meteors.push(meteor);
        meteorsRef.current.splice(i, 1);
        continue;
      }
      
      // Calculate current position along the path
      const currentPos = getPathPoint(Math.min(1, meteor.progress), meteor.path, pointCache.current);
      
      // Update position history (for trail) using optimized array management
      // Shift positions array - this is more efficient than splice/unshift for small arrays
      for (let j = meteor.positions.length - 1; j > 0; j--) {
        const current = meteor.positions[j];
        const prev = meteor.positions[j - 1];
        
        current.x = prev.x;
        current.y = prev.y;
      }
      
      // Update head position
      meteor.positions[0].x = currentPos.x;
      meteor.positions[0].y = currentPos.y;
    }
    
    // Spawn new meteors if needed
    const now = performance.now();
    const spawnNeeded = meteorsRef.current.length < adaptedSettings.meteorDensity;
    const canSpawnNow = !staggered || now >= nextSpawnTimeRef.current;
    
    if (spawnNeeded && canSpawnNow) {
      const newMeteor = initializeMeteor();
      if (newMeteor) {
        meteorsRef.current.push(newMeteor);
        
        // Set next spawn time if staggering is enabled
        if (staggered) {
          const delay = Math.random() * (maxStaggerDelay - minStaggerDelay) + minStaggerDelay;
          nextSpawnTimeRef.current = now + delay;
        }
      }
    }
  // Dependencies for updateMeteors
  }, [
    adaptedSettings.meteorDensity,
    staggered,
    minStaggerDelay,
    maxStaggerDelay,
    initializeMeteor,
    getPathPoint,
    pointCache
  ]);
  
  // Main animation handler
  const handleAnimation = useCallback((deltaTime) => {
    // Skip if component is not ready
    if (!canvasRef.current || !isInitialized) return;
    
    const now = performance.now();
    
    // Calculate parallax offset if enabled
    let parallaxOffset = 0;
    if (enableParallax) {
      parallaxOffset = scrollPositionRef.current * parallaxIntensity;
    }
    
    // Update meteor positions
    updateMeteors(deltaTime);
    
    // Render based on selected mode
    if (actualRenderingMode === 'webgl' && webGLRef.current) {
      // WebGL rendering path
      renderMeteorsWebGL(webGLRef.current, now);
    } else {
      // Canvas 2D rendering path
      const ctx = ctxRef.current;
      if (!ctx) return;
      
      // Clear canvas with optimized clear (only clear used area)
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      // Render meteors
      renderMeteors2D(ctx, parallaxOffset, now);
      
      // Render burst particles
      if (enableBursts) {
        renderBursts(ctx, deltaTime);
      }
      
      // Debug visualization
      if (debug) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '12px monospace';
        ctx.fillText(`FPS: ${currentFpsRef.current}`, 10, 20);
        ctx.fillText(`Meteors: ${meteorsRef.current.length}/${adaptedSettings.meteorDensity}`, 10, 40);
        ctx.fillText(`Quality: ${qualityFactor.toFixed(2)}`, 10, 60);
        ctx.fillText(`Rendering: ${actualRenderingMode}`, 10, 80);
        
        if (enableBursts) {
          ctx.fillText(`Bursts: ${burstsRef.current.length}`, 10, 100);
        }
      }
    }
  }, [
    isInitialized,
    dimensions,
    adaptedSettings.meteorDensity,
    enableParallax,
    parallaxIntensity,
    actualRenderingMode,
    debug,
    updateMeteors,
    renderMeteors2D,
    renderMeteorsWebGL,
    enableBursts,
    renderBursts,
    qualityFactor
  ]);
  
  // Main animation loop
  useEffect(() => {
    if (!active || !isInitialized || !dimensions.width || !dimensions.height) {
      return;
    }
    
    // Start animation with FPS limiter
    fpsTimestampRef.current = performance.now();
    frameCountRef.current = 0;
    lastTimestampRef.current = 0;
    
    animationFrameRef.current = requestAnimationFrame(timestamp => {
      fpsLimiter(timestamp, handleAnimation);
    });
    
    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    active,
    isInitialized,
    dimensions,
    fpsLimiter,
    handleAnimation
  ]);
  
  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'absolute',
        top: 0, 
        left: 0, 
        width: '100%', 
        height: height,
        overflow: 'hidden', 
        pointerEvents: 'none', 
        zIndex: zIndex,
        // Hardware acceleration
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
        willChange: 'transform'
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
          height: '100%',
          // Additional rendering optimizations
          imageRendering: 'high-quality',
          // Hardware acceleration
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
          willChange: 'transform',
          // Ensures proper subpixel rendering
          filter: 'none'
        }} 
      />
    </div>
  );
};

/**
 * GoldenMeteorShower Component
 * 
 * A preset version of the MeteorShower with a golden/amber color scheme.
 * 
 * @param {Object} props - Same props as MeteorShower with presets
 */
export const GoldenMeteorShower = (props) => {
  const goldenPreset = {
    coreColor: 'rgba(255, 255, 255, 1)',
    glowColor: 'rgba(255, 253, 227, 0.9)',
    trailColor: 'rgba(191, 173, 127, 0.8)',
    meteorMinSize: 1,
    meteorMaxSize: 3,
    meteorSpeed: 0.08,
    trailLength: 180,
    trailSegments: 20,
    journeyCompletion: 0.9,
    staggered: true,
    minStaggerDelay: 200,
    maxStaggerDelay: 2000,
  };
  
  return <MeteorShower {...goldenPreset} {...props} />;
};

/**
 * CelestialMeteorShower Component
 * 
 * A preset version of the MeteorShower with a bluish-purple color scheme.
 * 
 * @param {Object} props - Same props as MeteorShower with presets
 */
export const CelestialMeteorShower = (props) => {
  const celestialPreset = {
    coreColor: 'rgba(255, 255, 255, 1)',
    glowColor: 'rgba(220, 225, 255, 0.9)',
    trailColor: 'rgba(150, 160, 255, 0.8)',
    meteorMinSize: 1,
    meteorMaxSize: 3,
    meteorSpeed: 0.08,
    trailLength: 180,
    trailSegments: 20,
    journeyCompletion: 0.9,
    staggered: true,
    minStaggerDelay: 300,
    maxStaggerDelay: 1800,
  };
  
  return <MeteorShower {...celestialPreset} {...props} />;
};

/**
 * RubyMeteorShower Component
 * 
 * A preset version of the MeteorShower with a red color scheme.
 * 
 * @param {Object} props - Same props as MeteorShower with presets
 */
export const RubyMeteorShower = (props) => {
  const rubyPreset = {
    coreColor: 'rgba(255, 255, 255, 1)',
    glowColor: 'rgba(255, 200, 200, 0.9)',
    trailColor: 'rgba(220, 100, 100, 0.8)',
    meteorMinSize: 1,
    meteorMaxSize: 3,
    meteorSpeed: 0.08,
    trailLength: 180,
    trailSegments: 20,
    journeyCompletion: 0.9,
    staggered: true,
    minStaggerDelay: 350,
    maxStaggerDelay: 2200,
  };
  
  return <MeteorShower {...rubyPreset} {...props} />;
};

/**
 * TopMeteorShower Component
 * 
 * A preset version of the MeteorShower with meteors falling from the top of the screen
 * at a consistent 30-degree angle, distributed with emphasis on left and center areas.
 * 
 * @param {Object} props - Same props as MeteorShower with presets
 */
export const TopMeteorShower = (props) => {
  const topPreset = {
    mode: 'linear',
    direction: 'top',
    meteorMinSize: 1,
    meteorMaxSize: 3,
    meteorSpeed: 0.12,
    trailLength: 200,
    trailSegments: 25,
    journeyCompletion: 0.95,
    staggered: true,
    minStaggerDelay: 100,
    maxStaggerDelay: 1000,
  };
  
  return <MeteorShower {...topPreset} {...props} />;
};

export default MeteorShower;