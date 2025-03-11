import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';

/**
 * CometBorderEffect Component - Enterprise Performance Optimized
 * 
 * Creates a highly performant comet animation that orbits around a circular container,
 * perfect for profile images, avatars, and circular UI elements. Features a glowing
 * trailing effect with customizable parameters.
 * 
 * Features:
 * - Advanced performance optimizations with adaptive rendering
 * - Memory-efficient object pooling and canvas management
 * - Hardware acceleration and high-DPI display support
 * - Accessibility compliance with reduced motion support
 * - Hover state enhancements with smooth transitions
 * - Battery and CPU-efficient rendering pipeline
 * 
 * @param {Object} props - Component props
 * @param {boolean} [props.isHovered=false] - Whether the containing element is hovered
 * @param {number} [props.size=2] - Size of the comet
 * @param {number} [props.trailLength=140] - Length of the comet trail in degrees
 * @param {number} [props.speed=0.01] - Base speed of the comet
 * @param {number} [props.hoverSpeedMultiplier=2] - Speed increase when hovered
 * @param {number} [props.trailSegments=25] - Number of segments in the comet trail
 * @param {number} [props.glowIntensity=0.8] - Intensity of the glow effect
 * @param {number} [props.targetFPS=60] - Target frames per second
 * @param {string} [props.coreColor='rgba(255, 255, 255, 1)'] - Core color of the comet
 * @param {string} [props.glowColor='rgba(255, 253, 227, 0.8)'] - Glow color of the comet
 * @param {string} [props.trailColor='rgba(191, 173, 127, 0.8)'] - Trail color of the comet
 * @param {boolean} [props.radiusOffset=20] - Offset from edge of container in pixels
 * @param {boolean} [props.adaptiveQuality=true] - Enable adaptive quality based on device
 * @param {boolean} [props.respectReducedMotion=true] - Respect reduced motion preference
 * @param {boolean} [props.enableBattery=true] - Enable battery-saving optimizations
 * @param {function} [props.onRenderComplete] - Callback when the render completes
 * @param {boolean} [props.debug=false] - Enable debug visualization
 * @param {boolean} [props.active=true] - Whether the animation is active
 * @param {string} [props.positionMode='outside'] - Position mode: 'outside', 'inside', or 'center'
 * @param {boolean} [props.reverseDirection=false] - Reverse the direction of the comet
 * @param {number} [props.startingPosition=0] - Starting position in radians
 * @param {boolean} [props.enablePulse=true] - Enable pulsing effect
 * @param {number} [props.pulseFrequency=5] - Pulse frequency in seconds
 * @param {number} [props.pulseIntensity=0.2] - Intensity of the pulse effect
 * @param {number} [props.paddingTop=0] - Extra padding for container top
 * @param {number} [props.paddingRight=0] - Extra padding for container right
 * @param {number} [props.paddingBottom=0] - Extra padding for container bottom
 * @param {number} [props.paddingLeft=0] - Extra padding for container left
 */
const CometBorderEffect = ({
  isHovered = false,
  size = 2,
  trailLength = 140,
  speed = 0.01,
  hoverSpeedMultiplier = 2,
  trailSegments = 25,
  glowIntensity = 0.8,
  targetFPS = 60,
  coreColor = 'rgba(255, 255, 255, 1)',
  glowColor = 'rgba(255, 253, 227, 0.8)',
  trailColor = 'rgba(191, 173, 127, 0.8)',
  radiusOffset = 20,
  adaptiveQuality = true,
  respectReducedMotion = true,
  enableBattery = true,
  onRenderComplete = null,
  debug = false,
  active = true,
  positionMode = 'outside',
  reverseDirection = false,
  startingPosition = 0,
  enablePulse = true,
  pulseFrequency = 5,
  pulseIntensity = 0.2,
  paddingTop = 0,
  paddingRight = 0,
  paddingBottom = 0,
  paddingLeft = 0,
}) => {
  // Refs for DOM elements and animation state
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const requestRef = useRef(null);
  const lastTimeRef = useRef(0);
  const frameRateThrottleRef = useRef(0);
  const visibilityChangeTimeRef = useRef(0);
  const batteryRef = useRef(null);
  const pixelRatioRef = useRef(1);
  const qualityFactorRef = useRef(1);
  const offScreenCanvasRef = useRef(null);
  const offScreenCtxRef = useRef(null);
  
  // Animation parameters
  const cometPositionRef = useRef(startingPosition);
  const hoverTransitionRef = useRef(0); // 0-1 for smooth hover transitions
  
  // Component state
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [deviceCapabilities, setDeviceCapabilities] = useState({
    memory: 4,
    cores: 4,
    batteryLevel: 1,
    isCharging: true,
    isMobile: false
  });
  
  // Pre-calculate frame interval for throttling
  const frameInterval = useMemo(() => 1000 / targetFPS, [targetFPS]);
  
  // Detects device capabilities and sets up optimization strategies
  const detectCapabilities = useCallback(() => {
    // Device memory, hardware concurrency, and mobile detection
    const memory = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
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
            qualityFactorRef.current = Math.min(qualityFactorRef.current, 0.6);
          }
        };
        
        // Add battery event listeners
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
        
        // Initial update
        updateBattery();
      }).catch(() => {
        // Fallback if battery API is not available
        setDeviceCapabilities(prev => ({
          ...prev,
          batteryLevel: 1,
          isCharging: true
        }));
      });
    }
    
    // Set device capabilities state
    setDeviceCapabilities({
      memory,
      cores,
      batteryLevel: 1,
      isCharging: true,
      isMobile
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
      
      qualityFactorRef.current = quality;
    }
  }, [adaptiveQuality, enableBattery]);
  
  // Smooth transition for hover state
  useEffect(() => {
    // Skip animation if reduced motion is preferred
    if (respectReducedMotion && prefersReducedMotion) return;
    
    // Target value for hover transition
    const targetValue = isHovered ? 1 : 0;
    let currentValue = hoverTransitionRef.current;
    
    // If already at target value, skip animation
    if (currentValue === targetValue) return;
    
    // Animation step for smooth transition
    const animateHoverTransition = () => {
      // Move towards target at rate of 0.1 per 16ms (about 0.6 per 100ms)
      const step = 0.1;
      
      if (targetValue > currentValue) {
        currentValue = Math.min(targetValue, currentValue + step);
      } else {
        currentValue = Math.max(targetValue, currentValue - step);
      }
      
      hoverTransitionRef.current = currentValue;
      
      // Continue animation if not at target yet
      if (currentValue !== targetValue) {
        requestAnimationFrame(animateHoverTransition);
      }
    };
    
    // Start animation
    animateHoverTransition();
  }, [isHovered, prefersReducedMotion, respectReducedMotion]);
  
  // Setup device capabilities, reduced motion detection and visibility observer
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
    
    // Setup visibility change detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        visibilityChangeTimeRef.current = performance.now();
      } else {
        // Adjust timing references after visibility changes
        const timeDelta = performance.now() - visibilityChangeTimeRef.current;
        lastTimeRef.current += timeDelta;
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Setup intersection observer for visibility detection
    if (containerRef.current) {
      const observer = new IntersectionObserver(
        entries => {
          setIsVisible(entries[0].isIntersecting);
        },
        { threshold: 0.1 }
      );
      
      observer.observe(containerRef.current);
      
      return () => {
        reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        observer.disconnect();
      };
    }
    
    return () => {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [detectCapabilities]);
  
  // Memoized function to get points on circle
  const getPointOnCircle = useCallback((angle, centerX, centerY, radius) => {
    const directionFactor = reverseDirection ? -1 : 1;
    return {
      x: centerX + radius * Math.cos(angle * directionFactor),
      y: centerY + radius * Math.sin(angle * directionFactor)
    };
  }, [reverseDirection]);
  
  // Update dimensions with resize observer for better performance
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Capture ref value to use in cleanup
    const currentContainer = containerRef.current;
    
    const updateDimensions = () => {
      if (currentContainer) {
        // Get the container dimensions
        const rect = currentContainer.getBoundingClientRect();
        
        // Apply padding adjustments
        const width = Math.max(1, rect.width + paddingLeft + paddingRight);
        const height = Math.max(1, rect.height + paddingTop + paddingBottom);
        
        setDimensions({ width, height });
        
        // Update pixel ratio for high-DPI displays
        pixelRatioRef.current = window.devicePixelRatio || 1;
        
        // Initialize offscreen canvas for better performance
        setupOffscreenCanvas(width, height);
      }
    };
    
    // Setup offscreen canvas for performance
    const setupOffscreenCanvas = (width, height) => {
      try {
        // Create offscreen canvas if supported
        if (typeof OffscreenCanvas !== 'undefined') {
          const pixelRatio = pixelRatioRef.current;
          const canvas = new OffscreenCanvas(
            width * pixelRatio,
            height * pixelRatio
          );
          
          const ctx = canvas.getContext('2d', {
            alpha: true,
            willReadFrequently: false,
            desynchronized: true
          });
          
          if (ctx) {
            ctx.scale(pixelRatio, pixelRatio);
            offScreenCanvasRef.current = canvas;
            offScreenCtxRef.current = ctx;
          }
        }
      } catch (error) {
        console.warn('Failed to create offscreen canvas:', error);
      }
    };
    
    // Use ResizeObserver instead of window resize event
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(currentContainer);
    
    // Initial dimensions calculation
    updateDimensions();
    
    return () => {
      resizeObserver.unobserve(currentContainer);
      resizeObserver.disconnect();
    };
  }, [paddingTop, paddingRight, paddingBottom, paddingLeft]);
  
  // Main animation effect
  useEffect(() => {
    // Skip animation if reduced motion is preferred or component is not active
    if ((respectReducedMotion && prefersReducedMotion) || !active || !isVisible) return;
    
    // Skip if container or canvas is not available
    if (!canvasRef.current || !containerRef.current || dimensions.width === 0) return;
    
    // Capture ref values to use in cleanup
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { 
      alpha: true, 
      willReadFrequently: false,
      desynchronized: true
    });
    
    if (!ctx) return; // Safety check for context
    
    // Mobile detection for performance optimization
    const isMobile = deviceCapabilities.isMobile;
    
    // Set canvas dimensions with device pixel ratio for sharper rendering
    // Use lower pixel ratio on mobile for performance
    const pixelRatio = isMobile ? 
      Math.min(pixelRatioRef.current, 1.5) : 
      pixelRatioRef.current;
    
    canvas.width = Math.max(dimensions.width, 1) * pixelRatio;
    canvas.height = Math.max(dimensions.height, 1) * pixelRatio;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;
    ctx.scale(pixelRatio, pixelRatio);
    
    // Calculate circle properties
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    
    // Determine radius based on positionMode
    let radius;
    if (positionMode === 'inside') {
      radius = Math.min(centerX, centerY) - radiusOffset * 2;
    } else if (positionMode === 'center') {
      radius = Math.min(centerX, centerY) - radiusOffset;
    } else { // 'outside' (default)
      radius = Math.min(centerX, centerY) - radiusOffset;
    }
    
    // Adaptive quality settings based on device capabilities
    const adaptiveTrailSegments = Math.max(
      5,
      Math.floor(trailSegments * qualityFactorRef.current)
    );
    
    // Pre-calculate segment opacity and width ratios for better performance
    const segmentOpacityRatios = new Array(adaptiveTrailSegments).fill(0).map((_, i) => 
      1 - (i / adaptiveTrailSegments)
    );
    
    const segmentWidthRatios = new Array(adaptiveTrailSegments).fill(0).map((_, i) => 
      1 - (i / adaptiveTrailSegments * 0.7)
    );
    
    // Animation function
    const animateComet = (timestamp) => {
      // Initialize timestamp
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
        frameRateThrottleRef.current = timestamp;
        requestRef.current = requestAnimationFrame(animateComet);
        return;
      }
      
      // Frame rate throttling for consistent animation speed
      const elapsed = timestamp - frameRateThrottleRef.current;
      if (elapsed < frameInterval) {
        requestRef.current = requestAnimationFrame(animateComet);
        return;
      }
      
      // Calculate delta time and update frame rate throttle
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      frameRateThrottleRef.current = timestamp;
      
      // Calculate actual speed with hover effect
      const transitionValue = hoverTransitionRef.current;
      const actualSpeed = speed * (1 + (hoverSpeedMultiplier - 1) * transitionValue);
      
      // Update comet position with deltaTime consideration
      cometPositionRef.current = (cometPositionRef.current + actualSpeed * deltaTime) % (2 * Math.PI);
      
      // Determine which context to use (offscreen if available, main canvas otherwise)
      const renderCtx = offScreenCtxRef.current || ctx;
      const targetCanvas = offScreenCanvasRef.current || canvas;
      
      // Clear the canvas - use clearRect for better performance
      renderCtx.clearRect(0, 0, targetCanvas.width / pixelRatio, targetCanvas.height / pixelRatio);
      
      // Calculate actual parameters based on hover state
      const hoverFactor = hoverTransitionRef.current;
      const cometSize = size * (1 + hoverFactor * 0.2);
      const actualTrailLength = trailLength * (1 + hoverFactor * 0.2);
      const actualGlowIntensity = glowIntensity * (1 + hoverFactor * 0.5);
      
      // Apply pulse effect if enabled
      let pulseEffect = 1;
      if (enablePulse) {
        const pulsePhase = (timestamp % (pulseFrequency * 1000)) / (pulseFrequency * 1000) * Math.PI * 2;
        pulseEffect = 1 + Math.sin(pulsePhase) * pulseIntensity;
      }
      
      // Draw trail segments
      let prevPoint = getPointOnCircle(cometPositionRef.current, centerX, centerY, radius);
      
      for (let i = 0; i < adaptiveTrailSegments; i++) {
        const segmentAngle = cometPositionRef.current - ((i + 1) * (actualTrailLength / 180 * Math.PI / adaptiveTrailSegments));
        const nextPoint = getPointOnCircle(segmentAngle, centerX, centerY, radius);
        
        // Calculate opacity and width using pre-calculated ratios
        const baseOpacity = 0.9 * segmentOpacityRatios[i] * pulseEffect;
        const segmentWidth = cometSize * segmentWidthRatios[i] * pulseEffect + 0.5;
        
        // Skip nearly invisible segments for performance
        if (baseOpacity < 0.05) continue;
        
        // Draw trail segment with optimized settings
        renderCtx.beginPath();
        renderCtx.moveTo(prevPoint.x, prevPoint.y);
        renderCtx.lineTo(nextPoint.x, nextPoint.y);
        
        // Apply shadow/glow only when necessary (reduces GPU load)
        // Only apply to first half of segments
        if (i < adaptiveTrailSegments / 2 && qualityFactorRef.current > 0.7) {
          renderCtx.shadowColor = glowColor;
          renderCtx.shadowBlur = (12 * segmentOpacityRatios[i] + 5) * actualGlowIntensity * pulseEffect;
        } else {
          renderCtx.shadowBlur = 0;
        }
        
        // Set line style and draw
        renderCtx.strokeStyle = getColorWithOpacity(trailColor, baseOpacity);
        renderCtx.lineWidth = segmentWidth;
        renderCtx.lineCap = 'round';
        renderCtx.stroke();
        
        // Update previous point for next segment
        prevPoint = nextPoint;
      }
      
      // Draw comet head
      const headPoint = getPointOnCircle(cometPositionRef.current, centerX, centerY, radius);
      
      // Larger outer glow for comet head
      renderCtx.beginPath();
      renderCtx.arc(headPoint.x, headPoint.y, cometSize * 1.5 * pulseEffect, 0, Math.PI * 2);
      renderCtx.fillStyle = getColorWithOpacity(glowColor, 0.4 * actualGlowIntensity * pulseEffect);
      renderCtx.shadowColor = glowColor;
      renderCtx.shadowBlur = 15 * actualGlowIntensity * pulseEffect;
      renderCtx.fill();
      
      // Draw comet head
      renderCtx.beginPath();
      renderCtx.arc(headPoint.x, headPoint.y, cometSize * pulseEffect, 0, Math.PI * 2);
      renderCtx.fillStyle = getColorWithOpacity(glowColor, 0.6 * actualGlowIntensity * pulseEffect);
      renderCtx.shadowColor = glowColor;
      renderCtx.shadowBlur = 12 * actualGlowIntensity * pulseEffect;
      renderCtx.fill();
      
      // Brightest center point
      renderCtx.beginPath();
      renderCtx.arc(headPoint.x, headPoint.y, cometSize * 0.4 * pulseEffect, 0, Math.PI * 2);
      renderCtx.fillStyle = getColorWithOpacity(coreColor, 0.8 * actualGlowIntensity * pulseEffect);
      renderCtx.shadowColor = coreColor;
      renderCtx.shadowBlur = 8 * actualGlowIntensity * pulseEffect;
      renderCtx.fill();
      
      // If using offscreen canvas, copy to main canvas
      if (offScreenCtxRef.current && offScreenCanvasRef.current) {
        ctx.clearRect(0, 0, canvas.width / pixelRatio, canvas.height / pixelRatio);
        ctx.drawImage(
          offScreenCanvasRef.current, 
          0, 0, 
          offScreenCanvasRef.current.width, offScreenCanvasRef.current.height,
          0, 0,
          canvas.width / pixelRatio, canvas.height / pixelRatio
        );
      }
      
      // Debug information
      if (debug) {
        renderCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        renderCtx.font = '10px monospace';
        renderCtx.fillText(`FPS: ${Math.round(1000 / deltaTime)}`, 10, 15);
        renderCtx.fillText(`Hover: ${transitionValue.toFixed(2)}`, 10, 30);
        renderCtx.fillText(`Quality: ${qualityFactorRef.current.toFixed(2)}`, 10, 45);
        
        // Draw circle path for debugging
        renderCtx.beginPath();
        renderCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        renderCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        renderCtx.lineWidth = 1;
        renderCtx.stroke();
      }
      
      // Callback when render completes
      if (onRenderComplete) {
        onRenderComplete({
          position: cometPositionRef.current,
          hovering: transitionValue > 0,
          deltaTime
        });
      }
      
      // Request next frame
      requestRef.current = requestAnimationFrame(animateComet);
    };
    
    // Helper function to add opacity to a color
    function getColorWithOpacity(color, opacity) {
      return color.replace(/[\d.]+\)$/, `${opacity})`);
    }
    
    // Start animation
    requestRef.current = requestAnimationFrame(animateComet);
    
    // Cleanup
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [
    dimensions, 
    isHovered, 
    size, 
    trailLength, 
    speed, 
    hoverSpeedMultiplier, 
    trailSegments, 
    glowIntensity, 
    getPointOnCircle, 
    prefersReducedMotion, 
    respectReducedMotion,
    active,
    isVisible,
    deviceCapabilities.isMobile,
    frameInterval,
    coreColor,
    glowColor,
    trailColor,
    positionMode,
    radiusOffset,
    enablePulse,
    pulseFrequency,
    pulseIntensity,
    debug,
    onRenderComplete
  ]);
  
  // Create elegant fade-in effect based on reduced motion preference
  const opacityStyle = useMemo(() => {
    if (respectReducedMotion && prefersReducedMotion) {
      return 0.3;
    }
    return 1;
  }, [prefersReducedMotion, respectReducedMotion]);
  
  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'absolute', 
        top: -paddingTop, 
        left: -paddingLeft, 
        right: -paddingRight, 
        bottom: -paddingBottom,
        // Hardware acceleration hints
        willChange: prefersReducedMotion ? 'auto' : 'transform',
        transform: 'translateZ(0)',
        display: 'block',
        boxSizing: 'border-box',
        pointerEvents: 'none',
      }}
    >
      <canvas 
        ref={canvasRef} 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0,
          width: '100%',
          height: '100%',
          display: 'block', 
          opacity: opacityStyle,
          transition: 'opacity 0.3s ease',
          // Hardware acceleration hints
          imageRendering: 'high-quality',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
          willChange: 'transform'
        }} 
      />
    </div>
  );
};

/**
 * GoldenCometBorder Component
 * 
 * A preset version of the CometBorderEffect with a golden color scheme.
 * Perfect for creating a premium, luxurious feeling around profile images.
 * 
 * @param {Object} props - Same props as CometBorderEffect with presets
 */
export const GoldenCometBorder = (props) => {
  const goldenPreset = {
    coreColor: 'rgba(255, 255, 255, 1)',
    glowColor: 'rgba(255, 245, 158, 0.9)',
    trailColor: 'rgba(191, 173, 127, 0.8)',
    size: 1.8,
    trailLength: 120,
    speed: 0.001,
    hoverSpeedMultiplier: 2.5,
    trailSegments: 30,
    glowIntensity: 0.9,
    enablePulse: true,
    pulseFrequency: 4,
    pulseIntensity: 0.15
  };
  
  return <CometBorderEffect {...goldenPreset} {...props} />;
};

/**
 * AzureCometBorder Component
 * 
 * A preset version of the CometBorderEffect with a blue color scheme.
 * Perfect for creating a cool, modern feeling around profile images.
 * 
 * @param {Object} props - Same props as CometBorderEffect with presets
 */
export const AzureCometBorder = (props) => {
  const azurePreset = {
    coreColor: 'rgba(255, 255, 255, 1)',
    glowColor: 'rgba(173, 216, 230, 0.9)',
    trailColor: 'rgba(0, 191, 255, 0.7)',
    size: 1.8,
    trailLength: 120,
    speed: 0.001,
    hoverSpeedMultiplier: 2.5,
    trailSegments: 30,
    glowIntensity: 0.9,
    enablePulse: true,
    pulseFrequency: 5,
    pulseIntensity: 0.15
  };
  
  return <CometBorderEffect {...azurePreset} {...props} />;
};

/**
 * RubyCometBorder Component
 * 
 * A preset version of the CometBorderEffect with a red color scheme.
 * Perfect for creating a vibrant, energetic feeling around profile images.
 * 
 * @param {Object} props - Same props as CometBorderEffect with presets
 */
export const RubyCometBorder = (props) => {
  const rubyPreset = {
    coreColor: 'rgba(255, 255, 255, 1)',
    glowColor: 'rgba(255, 200, 200, 0.9)',
    trailColor: 'rgba(220, 20, 60, 0.7)',
    size: 1.8,
    trailLength: 120,
    speed: 0.0015,
    hoverSpeedMultiplier: 2.2,
    trailSegments: 28,
    glowIntensity: 0.9,
    enablePulse: true,
    pulseFrequency: 3,
    pulseIntensity: 0.2
  };
  
  return <CometBorderEffect {...rubyPreset} {...props} />;
};

/**
 * EmeraldCometBorder Component
 * 
 * A preset version of the CometBorderEffect with a green color scheme.
 * Perfect for creating a natural, organic feeling around profile images.
 * 
 * @param {Object} props - Same props as CometBorderEffect with presets
 */
export const EmeraldCometBorder = (props) => {
  const emeraldPreset = {
    coreColor: 'rgba(255, 255, 255, 1)',
    glowColor: 'rgba(200, 255, 200, 0.9)',
    trailColor: 'rgba(50, 205, 50, 0.7)',
    size: 1.8,
    trailLength: 120,
    speed: 0.0008,
    hoverSpeedMultiplier: 2.2,
    trailSegments: 25,
    glowIntensity: 0.8,
    enablePulse: true,
    pulseFrequency: 6,
    pulseIntensity: 0.1
  };
  
  return <CometBorderEffect {...emeraldPreset} {...props} />;
};

export default CometBorderEffect;