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
 * - Enhanced burst effects with realistic particle physics
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
 * @param {boolean} [props.enableBursts=true] - Enable meteor burst effects
 * @param {boolean} [props.enableBattery=true] - Enable battery-saving optimizations
 * @param {string} [props.renderingMode='auto'] - Rendering mode: 'auto', '2d', or 'webgl'
 * @param {boolean} [props.enableOffscreenRendering=true] - Enable offscreen canvas when available
 * @param {number} [props.burstParticleCount=12] - Number of particles in each burst
 * @param {number} [props.burstParticleSize=2] - Size of burst particles
 * @param {number} [props.burstProbability=0.4] - Probability of meteor having a burst (0-1)
 * @param {string} [props.burstColorVariation='0.2'] - Amount of color variation in burst particles
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
  glowColor = 'rgba(255, 245, 158, 0.9)',
  trailColor = 'rgba(207, 181, 59, 0.8)',
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
  enableBursts = true, // Enabled by default now
  enableBattery = true,
  renderingMode = 'auto',
  enableOffscreenRendering = true,
  burstParticleCount = 12,
  burstParticleSize = 2,
  burstProbability = 0.4,
  burstColorVariation = 0.2
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
  const lastBurstCountRef = useRef(0);
  const qualityChangeTimerRef = useRef(null);
  const lastQualityFactorRef = useRef(1);
  const stableFrameCountRef = useRef(0);
  
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
  
  // Fix 1: Limit trail segments to a reasonable number to prevent performance issues
  const safeTrailSegments = useMemo(() => {
    // If trail segments are extremely high, cap them based on device capability
    const maxSegments = Math.min(
      deviceCapabilities.isMobile ? 40 : 80, 
      trailSegments
    );
    
    return maxSegments;
  }, [trailSegments, deviceCapabilities.isMobile]);
  
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
      }).catch(() => {
        // Fallback if battery API is not available or fails
        setDeviceCapabilities(prev => ({
          ...prev,
          batteryLevel: 1,
          isCharging: true
        }));
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
      lastQualityFactorRef.current = quality;
    }
  }, [useWebGL, renderingMode, adaptiveQuality, enableBattery]);
  
  // Get cached color with opacity
  const getCachedColor = useCallback((baseColor, opacity) => {
    // Fix 2: Ensure opacity is always valid to prevent rendering glitches
    const safeOpacity = Math.max(0, Math.min(1, opacity || 0));
    
    // Round opacity to reduce cache size while maintaining visual quality
    const roundedOpacity = Math.round(safeOpacity * 100) / 100;
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
        trailSegments: safeTrailSegments,
        burstParticleCount,
        useShadow: true,
        useGlow: true,
        useHighQualityRendering: true
      };
    }
    
    // Fix 3: Smoother quality adjustments to prevent visual jarring
    // Adjust quality-dependent parameters
    return {
      meteorDensity: Math.max(3, Math.floor(meteorDensity * qualityFactor)),
      trailSegments: Math.max(5, Math.floor(safeTrailSegments * qualityFactor)),
      burstParticleCount: Math.max(4, Math.floor(burstParticleCount * qualityFactor)),
      useShadow: qualityFactor > 0.5,
      useGlow: qualityFactor > 0.3,
      useHighQualityRendering: qualityFactor > 0.7
    };
  }, [adaptiveQuality, qualityFactor, meteorDensity, safeTrailSegments, burstParticleCount]);
  
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
        depth: false,
        // Fix 4: Add WebGL context attributes for better stability
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false
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
      
      // Compile shader program
      const createShader = (gl, type, source) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        // Check for compilation errors
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
          gl.deleteShader(shader);
          return null;
        }
        
        return shader;
      };
      
      const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
      const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
      
      if (!vertexShader || !fragmentShader) {
        return false;
      }
      
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      
      // Check for linking errors
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program linking error:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return false;
      }
      
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
      
      // Now create shader program for burst particles
      // This can be similar to the meteor program but with different parameters
      
      // Simple vertex shader for burst particles
      const burstVertexShaderSource = `
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
      
      // Simple fragment shader for burst particles with softer edges
      const burstFragmentShaderSource = `
        precision mediump float;
        varying vec4 vColor;
        
        void main() {
          // Calculate distance from center for circular point
          float distance = length(gl_PointCoord - vec2(0.5, 0.5));
          if (distance > 0.5) {
            discard; // Outside circle
          }
          
          // Very soft edges for burst particles
          float alpha = smoothstep(0.5, 0.2, distance) * vColor.a;
          gl_FragColor = vec4(vColor.rgb, alpha);
        }
      `;
      
      const burstVertexShader = createShader(gl, gl.VERTEX_SHADER, burstVertexShaderSource);
      const burstFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, burstFragmentShaderSource);
      
      if (!burstVertexShader || !burstFragmentShader) {
        return false;
      }
      
      const burstProgram = gl.createProgram();
      gl.attachShader(burstProgram, burstVertexShader);
      gl.attachShader(burstProgram, burstFragmentShader);
      gl.linkProgram(burstProgram);
      
      // Check for linking errors
      if (!gl.getProgramParameter(burstProgram, gl.LINK_STATUS)) {
        console.error('Burst program linking error:', gl.getProgramInfoLog(burstProgram));
        gl.deleteProgram(burstProgram);
      } else {
        // Store the burst program
        webGLProgramsRef.current.burst = {
          program: burstProgram,
          attributes: {
            position: gl.getAttribLocation(burstProgram, 'aPosition'),
            size: gl.getAttribLocation(burstProgram, 'aSize'),
            color: gl.getAttribLocation(burstProgram, 'aColor')
          },
          uniforms: {
            resolution: gl.getUniformLocation(burstProgram, 'uResolution')
          }
        };
      }
      
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
        // Fix 5: More consistent angle calculation for top direction
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
        // Fix 6: Better distribution to prevent clustering
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
    // Fix 7: Ensure t is always within valid range
    const safeT = Math.max(0, Math.min(1, t));
    
    if (path.pathType === 'arc') {
      // Optimized quadratic bezier calculation using pre-computed terms
      const invT = 1 - safeT;
      const invTSquared = invT * invT;
      const tSquared = safeT * safeT;
      const term1 = invTSquared;
      const term2 = 2 * invT * safeT;
      const term3 = tSquared;
      
      outPoint.x = term1 * path.start.x + term2 * path.control.x + term3 * path.end.x;
      outPoint.y = term1 * path.start.y + term2 * path.control.y + term3 * path.end.y;
    } else {
      // Linear interpolation with minimal operations
      outPoint.x = path.start.x + (path.end.x - path.start.x) * safeT;
      outPoint.y = path.start.y + (path.end.y - path.start.y) * safeT;
    }
    
    return outPoint;
  }, []);
  
  // Calculate velocity at a point on the path (for trail orientation)
  const getPathVelocity = useCallback((t, path, outVelocity = { x: 0, y: 0 }) => {
    // Fix 8: Ensure t is always within valid range
    const safeT = Math.max(0, Math.min(1, t));
    
    if (path.pathType === 'arc') {
      // Derivative of quadratic bezier
      const term1 = 2 * (1 - safeT);
      const term2 = 2 * safeT;
      
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
    
    // Fix 9: Ensure canvas dimensions are valid integers to prevent rendering issues
    // Calculate dimensions
    const displayWidth = Math.floor(rect.width);
    const displayHeight = typeof height === 'string' && height.endsWith('vh') 
      ? Math.floor((parseInt(height, 10) / 100) * window.innerHeight)
      : Math.floor(parseInt(height, 10) || window.innerHeight);
    
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
    
    // Fix 10: Ensure all positions are initialized properly to prevent flickering
    const initialPoint = { x: path.start.x, y: path.start.y };
    for (let i = 0; i < meteor.positions.length; i++) {
      if (!meteor.positions[i]) {
        meteor.positions[i] = { x: initialPoint.x, y: initialPoint.y };
      } else {
        meteor.positions[i].x = initialPoint.x;
        meteor.positions[i].y = initialPoint.y;
      }
    }
    
    // Set meteor properties
    meteor.size = Math.random() * (meteorMaxSize - meteorMinSize) + meteorMinSize;
    meteor.speed = meteorSpeed * (Math.random() * 0.5 + 0.75);
    meteor.opacity = Math.random() * 0.3 + 0.7;
    meteor.fadeThreshold = 0.7 + Math.random() * 0.2;
    meteor.pulsePhase = Math.random() * Math.PI * 2;
    meteor.pulseSpeed = Math.random() * 0.01 + 0.005;
    
    // Add burst properties if enabled
    if (enableBursts && Math.random() < burstProbability) {
      meteor.hasBurst = true;
      
      // Vary the burst threshold - occasionally have early bursts for variety
      const earlyBurst = Math.random() < 0.15; // 15% chance for early burst
      meteor.burstThreshold = earlyBurst 
        ? 0.3 + Math.random() * 0.4 // Early burst range (0.3-0.7)
        : 0.85 + Math.random() * 0.13; // Normal late burst range (0.85-0.98)
      
      meteor.burstTriggered = false;
      
      // Adjust burst size based on when it occurs
      meteor.burstSize = earlyBurst
        ? meteor.size * (3 + Math.random() * 4) // Larger for early bursts
        : meteor.size * (2 + Math.random() * 2); // More controlled for end bursts
      
      // Adjust particle count based on when it occurs
      meteor.burstParticles = Math.floor(
        adaptedSettings.burstParticleCount * 
        (earlyBurst ? 1.2 : 0.8) * // More particles for early bursts
        (0.8 + Math.random() * 0.4)
      );
      
      // Use custom gold-centric colors for dark fantasy aesthetic
      // No need to use createColorVariant here since we're using specific themed colors
      meteor.burstColors = [
        'rgba(255, 215, 0, 1)', // Gold
        'rgba(218, 165, 32, 1)', // Goldenrod
        'rgba(212, 175, 55, 1)', // Metallic gold
        'rgba(207, 181, 59, 1)', // Old gold
        earlyBurst ? 'rgba(255, 255, 220, 1)' : 'rgba(192, 192, 192, 1)' // Bright for early, silver for late
      ];
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
    burstProbability,
    adaptedSettings.burstParticleCount,
    getMeteor
  ]);
  
  // Get a burst particle from the object pool or create a new one
  const getBurstParticle = useCallback(() => {
    const pool = objectPoolsRef.current.bursts;
    
    if (pool.length > 0) {
      const burst = pool.pop();
      // Reset properties
      burst.life = 1.0;
      return burst;
    }
    
    // Create new if pool is empty
    return {};
  }, []);
  
  // Create a burst effect at a specified position
  const createBurst = useCallback((x, y, size, colors, particleCount, velocityInfluence = { x: 0, y: 0 }) => {
    // Skip if bursts are not enabled
    if (!enableBursts) return;
    
    // Fix 11: Limit bursts to prevent overloading and causing flickering
    // Limit the number of active burst particles to avoid performance issues
    const maxBurstParticles = adaptedSettings.useHighQualityRendering ? 300 : 150;
    
    // If we're already close to the limit, reduce the number of particles
    let actualParticleCount = particleCount;
    if (burstsRef.current.length > maxBurstParticles - particleCount) {
      actualParticleCount = Math.max(4, Math.floor(particleCount * 0.5));
    }
    
    // Skip burst creation completely if we're already over the limit
    if (burstsRef.current.length > maxBurstParticles) {
      // Remove older bursts to make room
      const toRemove = Math.min(20, burstsRef.current.length - maxBurstParticles + actualParticleCount);
      for (let i = 0; i < toRemove; i++) {
        const oldBurst = burstsRef.current.shift();
        if (oldBurst) {
          objectPoolsRef.current.bursts.push(oldBurst);
        }
      }
    }
    
    // Track burst counts for debug
    lastBurstCountRef.current = actualParticleCount;
    
    // Create fragments that look like pieces of the meteor breaking apart
    for (let i = 0; i < actualParticleCount; i++) {
      // Create directional burst effect following the meteor's trajectory
      const baseAngle = Math.atan2(velocityInfluence.y, velocityInfluence.x);
      
      // Calculate particle direction - within a forward-facing cone
      const angleSpread = 1.2; // Narrower spread for more focused effect
      const angleVariance = (Math.random() * angleSpread - angleSpread/2);
      const angle = baseAngle + angleVariance;
      
      // Speed - slower for a more elegant effect
      const speedVariance = Math.random() * 0.4 + 0.7;
      const baseSpeed = 0.4 + Math.random() * 0.8; // Slower overall
      const speed = baseSpeed * speedVariance;
      
      // Calculate velocity components
      const vx = Math.cos(angle) * speed + velocityInfluence.x * 0.4;
      const vy = Math.sin(angle) * speed + velocityInfluence.y * 0.4;
      
      // Create fragments of different sizes
      const sizeVariance = 0.2 + Math.random() * 0.8;
      const particleSize = size * sizeVariance * burstParticleSize * 0.6;
      
      // Use meteor's colors for the fragments
      const colorIndex = Math.random() < 0.7 ? 0 : 1; // 70% core color, 30% glow color
      const color = colorIndex === 0 ? coreColor : glowColor;
      
      // Create the burst particle
      const burst = getBurstParticle();
      
      // Set properties
      burst.x = x;
      burst.y = y;
      burst.vx = vx;
      burst.vy = vy;
      burst.size = particleSize;
      burst.life = 1.0;
      burst.decay = 0.006 + Math.random() * 0.01; // Slower decay
      burst.color = color;
      burst.trailLength = 2 + Math.random() * 6; // Length of trail behind fragment
      
      // More elegantly diminishing velocity
      burst.damping = 0.95 + Math.random() * 0.03;
      
      // Add to active bursts
      burstsRef.current.push(burst);
    }
  }, [enableBursts, adaptedSettings.useHighQualityRendering, getBurstParticle, burstParticleSize, coreColor, glowColor]);
  
  // Render burst particles with WebGL
  const renderBurstsWebGL = useCallback((gl, deltaTime) => {
    if (!enableBursts || burstsRef.current.length === 0 || !webGLProgramsRef.current.burst) return;
    
    const burstProgram = webGLProgramsRef.current.burst;
    
    // Use burst shader program
    gl.useProgram(burstProgram.program);
    
    // Set resolution uniform
    gl.uniform2f(
      burstProgram.uniforms.resolution,
      canvasRef.current.width,
      canvasRef.current.height
    );
    
    // Create float32 arrays to hold position, size, and color data
    // 2 floats per position (x, y)
    const positions = new Float32Array(burstsRef.current.length * 2);
    // 1 float per size
    const sizes = new Float32Array(burstsRef.current.length);
    // 4 floats per color (r, g, b, a)
    const colors = new Float32Array(burstsRef.current.length * 4);
    
    // Process each burst particle and update its data
    for (let i = 0; i < burstsRef.current.length; i++) {
      const burst = burstsRef.current[i];
      
      // Update position
      burst.x += burst.vx * (deltaTime / 16);
      burst.y += burst.vy * (deltaTime / 16);
      
      // Apply gravity if present
      if (burst.gravity) {
        burst.vy += burst.gravity * (deltaTime / 16);
      }
      
      // Apply damping to velocity
      burst.vx *= burst.damping;
      burst.vy *= burst.damping;
      
      // Update rotation
      if (burst.rotationSpeed) {
        burst.rotation += burst.rotationSpeed * (deltaTime / 16);
      }
      
      // Reduce life
      burst.life -= burst.decay * (deltaTime / 16);
      
      // Map burst data to arrays
      const posIndex = i * 2;
      positions[posIndex] = burst.x;
      positions[posIndex + 1] = burst.y;
      
      sizes[i] = burst.size * Math.pow(burst.life, 0.7) * dimensions.pixelRatio;
      
      // Parse color components from rgba string
      // Fix 12: Safer color handling for WebGL
      const colorIndex = i * 4;
      colors[colorIndex] = 1.0;     // r
      colors[colorIndex + 1] = 0.9; // g
      colors[colorIndex + 2] = 0.7; // b
      colors[colorIndex + 3] = Math.max(0, Math.min(1, burst.life * 0.7)); // a - clamped for safety
    }
    
    // Create and bind position buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(burstProgram.attributes.position);
    gl.vertexAttribPointer(burstProgram.attributes.position, 2, gl.FLOAT, false, 0, 0);
    
    // Create and bind size buffer
    const sizeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(burstProgram.attributes.size);
    gl.vertexAttribPointer(burstProgram.attributes.size, 1, gl.FLOAT, false, 0, 0);
    
    // Create and bind color buffer
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(burstProgram.attributes.color);
    gl.vertexAttribPointer(burstProgram.attributes.color, 4, gl.FLOAT, false, 0, 0);
    
    // Draw points
    gl.drawArrays(gl.POINTS, 0, burstsRef.current.length);
    
    // Clean up
    gl.disableVertexAttribArray(burstProgram.attributes.position);
    gl.disableVertexAttribArray(burstProgram.attributes.size);
    gl.disableVertexAttribArray(burstProgram.attributes.color);
    gl.deleteBuffer(positionBuffer);
    gl.deleteBuffer(sizeBuffer);
    gl.deleteBuffer(colorBuffer);
    
    // Filter out dead particles
    let j = 0;
    for (let i = 0; i < burstsRef.current.length; i++) {
      const burst = burstsRef.current[i];
      if (burst.life > 0) {
        // Keep alive particles, compact array
        if (i !== j) {
          burstsRef.current[j] = burst;
        }
        j++;
      } else {
        // Return to object pool
        objectPoolsRef.current.bursts.push(burst);
      }
    }
    
    // Truncate array to remove dead particles
    if (j < burstsRef.current.length) {
      burstsRef.current.length = j;
    }
  }, [enableBursts, dimensions.pixelRatio]);
  
  // Render burst particles with Canvas 2D
  const renderBursts2D = useCallback((ctx, deltaTime) => {
    if (!enableBursts || burstsRef.current.length === 0) return;
    
    // Fix 13: Use a more efficient approach to avoid array splicing during rendering
    // Process and render each burst particle
    let j = 0;
    for (let i = 0; i < burstsRef.current.length; i++) {
      const burst = burstsRef.current[i];
      
      // Update position
      burst.x += burst.vx * (deltaTime / 16);
      burst.y += burst.vy * (deltaTime / 16);
      
      // Apply damping to velocity
      burst.vx *= burst.damping;
      burst.vy *= burst.damping;
      
      // Reduce life
      burst.life -= burst.decay * (deltaTime / 16);
      
      // Keep alive particles
      if (burst.life > 0) {
        // Draw particle
        ctx.save();
        
        // Get velocity direction for trail orientation
        const angle = Math.atan2(burst.vy, burst.vx);
        
        if (adaptedSettings.useHighQualityRendering) {
          // Draw trail behind fragment
          const trailLength = (burst.trailLength || 4) * burst.life;
          const fragmentSize = burst.size * burst.life;
          
          // Create trail gradient
          const trailGradient = ctx.createLinearGradient(
            burst.x, 
            burst.y,
            burst.x - Math.cos(angle) * trailLength,
            burst.y - Math.sin(angle) * trailLength
          );
          
          // Get the base color with varying opacity
          trailGradient.addColorStop(0, getCachedColor(burst.color, burst.life * 0.8));
          trailGradient.addColorStop(0.5, getCachedColor(burst.color, burst.life * 0.4));
          trailGradient.addColorStop(1, getCachedColor(burst.color, 0));
          
          // Draw trail
          ctx.beginPath();
          ctx.moveTo(burst.x, burst.y);
          ctx.lineTo(
            burst.x - Math.cos(angle) * trailLength,
            burst.y - Math.sin(angle) * trailLength
          );
          ctx.lineWidth = fragmentSize * 0.8;
          ctx.lineCap = 'round';
          ctx.strokeStyle = trailGradient;
          ctx.stroke();
          
          // Draw fragment
          if (adaptedSettings.useGlow) {
            ctx.shadowColor = burst.color;
            ctx.shadowBlur = fragmentSize * 2;
          }
          
          ctx.beginPath();
          ctx.arc(burst.x, burst.y, fragmentSize * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = getCachedColor(burst.color, burst.life);
          ctx.fill();
        } else {
          // Simplified rendering for lower performance devices
          const trailLength = (burst.trailLength || 3) * burst.life;
          const fragmentSize = burst.size * burst.life;
          
          // Draw simple tapered line
          ctx.beginPath();
          ctx.moveTo(burst.x, burst.y);
          ctx.lineTo(
            burst.x - Math.cos(angle) * trailLength,
            burst.y - Math.sin(angle) * trailLength
          );
          ctx.lineWidth = fragmentSize * 0.7;
          ctx.lineCap = 'round';
          ctx.strokeStyle = getCachedColor(burst.color, burst.life * 0.6);
          ctx.stroke();
        }
        
        ctx.restore();
        
        // Compact alive particles
        if (i !== j) {
          burstsRef.current[j] = burst;
        }
        j++;
      } else {
        // Return to object pool
        objectPoolsRef.current.bursts.push(burst);
      }
    }
    
    // Truncate array to remove dead particles
    if (j < burstsRef.current.length) {
      burstsRef.current.length = j;
    }
  }, [enableBursts, adaptedSettings.useHighQualityRendering, adaptedSettings.useGlow, getCachedColor]);
  
  // 2D Canvas rendering method for meteors
  const renderMeteors2D = useCallback((ctx, parallaxOffset, timestamp) => {
    // Process and render each meteor
    meteorsRef.current.forEach(meteor => {
      // Fix 14: Ensure position array is valid to prevent flickering
      if (!meteor.positions || !meteor.positions[0]) return;
      
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
        
        // Get velocity at burst point for influence on particles
        const velocityPoint = { x: 0, y: 0 };
        getPathVelocity(meteor.progress, meteor.path, velocityPoint);
        
        // Scale velocity for better visual effect
        velocityPoint.x *= 0.8;
        velocityPoint.y *= 0.8;
        
        // Create burst with velocity influence
        createBurst(
          burstPosition.x,
          burstPosition.y + adjustY,
          meteor.burstSize,
          meteor.burstColors,
          meteor.burstParticles,
          velocityPoint
        );
        
        // Start fading process after burst
        meteor.burstFadeStartTime = timestamp;
        meteor.fadeAfterBurst = true;
        meteor.initialOpacity = meteor.opacity; // Store original opacity for smooth fade
      }
      
      // Apply fading effect after burst
      if (meteor.fadeAfterBurst) {
        // Calculate fade progress over 600ms (adjust for desired fade duration)
        const fadeDuration = 600; 
        const fadeProgress = Math.min(1, (timestamp - meteor.burstFadeStartTime) / fadeDuration);
        
        // Apply eased fade out
        const fadeEase = 1 - fadeProgress * fadeProgress; // Quadratic ease out
        currentOpacity *= fadeEase;
        
        // If almost completely faded, mark for removal
        if (fadeProgress >= 0.95) {
          meteor.terminateAfterBurst = true;
        }
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
    createBurst,
    getPathVelocity
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
    
    // Check for burst triggers in WebGL mode too
    meteorsRef.current.forEach(meteor => {
      if (meteor.hasBurst && !meteor.burstTriggered && meteor.progress >= meteor.burstThreshold) {
        meteor.burstTriggered = true;
        const burstPosition = meteor.positions[0];
        
        // Get velocity at burst point for influence on particles
        const velocityPoint = { x: 0, y: 0 };
        getPathVelocity(meteor.progress, meteor.path, velocityPoint);
        
        // Create burst with velocity influence
        // This will add particles to be rendered by renderBurstsWebGL
        createBurst(
          burstPosition.x,
          burstPosition.y,
          meteor.burstSize,
          meteor.burstColors,
          meteor.burstParticles,
          velocityPoint
        );
      }
    });
    
  }, [createBurst, getPathVelocity]);
  
  // Update meteor positions
  const updateMeteors = useCallback((deltaTime) => {
    // Fix 15: More stable progress calculation to prevent position jumps
    // Apply a maximum delta time to prevent large jumps after tab switching or lag spikes
    const cappedDeltaTime = Math.min(deltaTime, 50);
    
    // Process meteors without destructuring unused width/height
    for (let i = meteorsRef.current.length - 1; i >= 0; i--) {
      const meteor = meteorsRef.current[i];
      
      // Update progress based on speed and delta time
      meteor.progress += meteor.speed * (cappedDeltaTime / 1000);
      
      // Check if meteor has completed its path or has fully faded after burst
      if (meteor.progress >= 1 || (meteor.terminateAfterBurst && meteor.burstTriggered)) {
        // Return to object pool
        meteor.active = false;
        meteor.terminateAfterBurst = false; // Reset for reuse
        meteor.burstTriggered = false; // Reset for reuse
        meteor.fadeAfterBurst = false; // Reset fade state
        meteor.burstFadeStartTime = 0; // Reset fade timing
        objectPoolsRef.current.meteors.push(meteor);
        meteorsRef.current.splice(i, 1);
        continue;
      }
      
      // Calculate current position along the path
      const currentPos = getPathPoint(Math.min(1, meteor.progress), meteor.path, pointCache.current);
      
      // Fix 16: More stable position history update to prevent flickering
      // Update position history (for trail) using optimized array management
      // First, check if the position array exists and has enough elements
      if (!meteor.positions || meteor.positions.length < 2) continue;
      
      // Shift positions array one by one to maintain proper history
      for (let j = meteor.positions.length - 1; j > 0; j--) {
        const current = meteor.positions[j];
        const prev = meteor.positions[j - 1];
        
        if (!current || !prev) continue;
        
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
        
        // Fix 17: More stable quality adjustment to prevent flickering during quality changes
        // Dynamic quality adjustment based on performance with debouncing
        if (adaptiveQuality) {
          // Check if FPS is stable by counting consecutive frames within target range
          if (currentFpsRef.current >= maxFPS * 0.95) {
            stableFrameCountRef.current += 1;
          } else if (currentFpsRef.current < maxFPS * 0.7) {
            stableFrameCountRef.current = 0;
          }
          
          // Avoid frequent quality changes by using a timer
          if (qualityChangeTimerRef.current) {
            clearTimeout(qualityChangeTimerRef.current);
          }
          
          qualityChangeTimerRef.current = setTimeout(() => {
            // Only change quality if FPS has been stable or is very low
            if (currentFpsRef.current < maxFPS * 0.7) {
              // If FPS is below 70% of target, reduce quality
              setQualityFactor(prev => {
                const newQuality = Math.max(0.4, prev * 0.9);
                lastQualityFactorRef.current = newQuality;
                return newQuality;
              });
            } else if (stableFrameCountRef.current >= 3 && qualityFactor < 1) {
              // If FPS has been high for several frames, gradually increase quality
              setQualityFactor(prev => {
                const newQuality = Math.min(1, prev * 1.05);
                lastQualityFactorRef.current = newQuality;
                return newQuality;
              });
            }
          }, 500); // Wait 500ms before changing quality to avoid rapid oscillation
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
      
      // Render burst particles with WebGL
      if (enableBursts) {
        renderBurstsWebGL(webGLRef.current, deltaTime);
      }
    } else {
      // Canvas 2D rendering path
      const ctx = ctxRef.current;
      if (!ctx) return;
      
      // Fix 18: More reliable canvas clearing to prevent flickering artifacts
      // Clear canvas with optimized clear method
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      // Render meteors
      renderMeteors2D(ctx, parallaxOffset, now);
      
      // Render burst particles
      if (enableBursts) {
        renderBursts2D(ctx, deltaTime);
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
          ctx.fillText(`Last Burst: ${lastBurstCountRef.current}`, 10, 120);
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
    renderBursts2D,
    renderBurstsWebGL,
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
      
      // Fix 19: Clear quality adjustment timer on unmount
      if (qualityChangeTimerRef.current) {
        clearTimeout(qualityChangeTimerRef.current);
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
    glowColor: 'rgba(255, 245, 158, 0.9)',
    trailColor: 'rgba(207, 181, 59, 0.8)',
    meteorMinSize: 1,
    meteorMaxSize: 3,
    meteorSpeed: 0.08,
    trailLength: 180,
    trailSegments: 20,
    journeyCompletion: 0.9,
    staggered: true,
    minStaggerDelay: 200,
    maxStaggerDelay: 2000,
    enableBursts: true,
    burstProbability: 0.4,
    burstParticleSize: 1.8,
    burstParticleCount: 14
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
    enableBursts: true,
    burstProbability: 0.35
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
    enableBursts: true,
    burstProbability: 0.45
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
    enableBursts: true,
    burstProbability: 0.5,
    burstParticleCount: 15
  };
  
  return <MeteorShower {...topPreset} {...props} />;
};

export default MeteorShower;