import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * MeteorShower Component - Enhanced Version
 * 
 * Creates an animated meteor shower effect where meteors arc across the sky
 * with comet-like trails and fade away naturally.
 * Features staggered appearance and configurable journey completion.
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
 * @param {number} [props.journeyCompletion=0.9] - When meteors complete their journey (0-1, where 1 is the container height)
 * @param {string} [props.mode='arc'] - Animation mode: 'arc' (curved paths) or 'linear' (straight angled paths)
 * @param {string} [props.direction='both'] - Direction for linear mode: 'left', 'right', 'both', or 'top'
 * @param {number} [props.baseAngle=30] - Base angle for linear meteors (degrees)
 * @param {number} [props.angleVariation=15] - Random variation to apply to the base angle (±degrees)
 * @param {boolean} [props.debug=false] - Enable debug visualization
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
  journeyCompletion = 0.9, // Default: complete at 90% of container height
  mode = 'arc', // 'arc' or 'linear'
  direction = 'both', // 'left', 'right', 'both', or 'top'
  baseAngle = 30, // Base angle for linear meteors (degrees)
  angleVariation = 15, // Variation to apply to the angle (±degrees)
  debug = false
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const meteorsRef = useRef([]);
  const animationFrameRef = useRef(null);
  const lastTimestampRef = useRef(0);
  const scrollPositionRef = useRef(0);
  const nextSpawnTimeRef = useRef(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Calculate path parameters for a meteor based on selected mode
  const calculateMeteorPath = (width, height) => {
    if (mode === 'arc') {
      // Original arc path logic
      // Start point: somewhere along the top of the canvas with randomization
      const startX = Math.random() * width * 1.5 - width * 0.25;
      
      // Control how far meteors can start from outside the visible area
      const startY = Math.random() * -100 - 50;
      
      // Randomize arc curvature and direction
      const curveDirection = Math.random() > 0.5 ? 1 : -1;
      const curveIntensity = Math.random() * 0.4 + 0.2;
      
      // Calculate control points for quadratic path
      // End point: adjusted to complete journey according to journeyCompletion parameter
      const endX = startX + (curveDirection * width * curveIntensity);
      const endY = height * journeyCompletion;
      
      // Control point: creates the arc shape
      const controlX = (startX + endX) / 2 + (curveDirection * width * curveIntensity);
      const controlY = (startY + endY) * 0.5;
      
      return {
        pathType: 'arc',
        start: { x: startX, y: startY },
        control: { x: controlX, y: controlY },
        end: { x: endX, y: endY }
      };
    } else if (mode === 'linear') {
      // New linear path logic for traditional meteor shower
      
      // Determine direction (from left, right, top, or random)
      let meteorDirection = direction;
      if (direction === 'both') {
        meteorDirection = Math.random() > 0.5 ? 'left' : 'right';
      }
      
      // Calculate angle with variation (convert to radians)
      let angle;
      
      if (direction === 'top') {
        // For 'top' direction, maintain consistent 30 degree downward angle to the right
        // with minimal variation to keep them all falling in a similar direction
        angle = ((30 + (Math.random() * 2 - 1) * 5) * Math.PI) / 180;
      } else {
        angle = ((baseAngle + (Math.random() * 2 - 1) * angleVariation) * Math.PI) / 180;
      }
      
      // Set starting positions based on direction
      let startX;
      if (meteorDirection === 'left') {
        // Start from top-left portion of the screen
        startX = Math.random() * (width * 0.3) - (width * 0.1);
      } else if (meteorDirection === 'right') {
        // Start from top-right portion of the screen
        startX = width - Math.random() * (width * 0.3) + (width * 0.1);
      } else if (direction === 'top') {
        // For 'top' direction, distribute meteors across the top with emphasis on left and center
        const position = Math.random();
        if (position < 0.5) {
          // 50% chance: top-left
          startX = Math.random() * (width * 0.35);
        } else if (position < 0.85) {
          // 35% chance: top-center
          startX = width * 0.35 + Math.random() * (width * 0.35);
        } else {
          // 15% chance: top-right
          startX = width * 0.7 + Math.random() * (width * 0.3);
        }
      }
      
      // Start slightly above the screen
      const startY = Math.random() * -100 - 50;
      
      // Calculate distance meteor will travel based on angle and screen dimensions
      const distanceToTravel = (height * journeyCompletion) / Math.cos(angle);
      
      // Calculate end position using angle
      let endX, endY;
      if (meteorDirection === 'left' || direction === 'top') {
        // Meteor moves from left to right (or top to bottom-right for 'top' direction)
        endX = startX + distanceToTravel * Math.sin(angle);
        endY = startY + distanceToTravel * Math.cos(angle);
      } else {
        // Meteor moves from right to left
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
  };
  
  // Calculate position along a path
  const getPathPoint = (t, path) => {
    if (path.pathType === 'arc') {
      // Quadratic bezier curve for arc mode
      return getQuadraticBezierPoint(t, path.start, path.control, path.end);
    } else {
      // Linear interpolation for linear mode
      return {
        x: path.start.x + (path.end.x - path.start.x) * t,
        y: path.start.y + (path.end.y - path.start.y) * t
      };
    }
  };
  
  // Calculate position along a quadratic bezier curve
  const getQuadraticBezierPoint = (t, p0, p1, p2) => {
    const x = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
    const y = Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y;
    return { x, y };
  };
  
  // Update canvas dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current && containerRef.current) {
        const container = containerRef.current;
        const rect = container.getBoundingClientRect();
        const width = rect.width;
        const containerHeight = typeof height === 'string' && height.endsWith('vh') 
          ? (parseInt(height, 10) / 100) * window.innerHeight
          : parseInt(height, 10) || window.innerHeight;
          
        if (debug) {
          console.log('Setting canvas dimensions:', width, containerHeight);
        }
        
        setDimensions({ width, height: containerHeight });
        canvasRef.current.width = width;
        canvasRef.current.height = containerHeight;
        setIsInitialized(true);
      }
    };
    
    setTimeout(updateDimensions, 100);
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [height, debug]);
  
  // Handle parallax effect on scroll if enabled
  useEffect(() => {
    if (!enableParallax) return;
    
    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY;
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [enableParallax]);
  
  // Memoize the path calculation and position functions to avoid dependency issues
  const calculateMeteorPathMemoized = useCallback(calculateMeteorPath, [
    mode, direction, baseAngle, angleVariation, journeyCompletion
  ]);
  
  const getPathPointMemoized = useCallback(getPathPoint, []);
  
  // Memoize the meteor initialization function
  const initializeMeteorMemoized = useCallback(() => {
    const width = dimensions.width;
    const height = dimensions.height;
    
    if (!width || !height) return null;
    
    // Calculate path based on mode
    const path = calculateMeteorPathMemoized(width, height);
    
    // Randomize meteor properties
    const baseSpeed = meteorSpeed * (Math.random() * 0.5 + 0.75);
    
    return {
      path,
      progress: 0,
      size: Math.random() * (meteorMaxSize - meteorMinSize) + meteorMinSize,
      speed: baseSpeed,
      active: true,
      positions: new Array(trailSegments).fill({ x: path.start.x, y: path.start.y }),
      opacity: Math.random() * 0.3 + 0.7,
      fadeThreshold: 0.7 + Math.random() * 0.2, // When to start fading (70-90% of journey)
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.01 + 0.005
    };
  }, [
    dimensions, 
    meteorSpeed, 
    meteorMinSize, 
    meteorMaxSize, 
    trailSegments,
    calculateMeteorPathMemoized
  ]);
  
  // Main animation loop
  useEffect(() => {
    if (!active || !dimensions.width || !dimensions.height || !isInitialized) {
      if (debug) {
        console.log('Animation not starting. Active:', active, 'Dimensions:', dimensions, 'Initialized:', isInitialized);
      }
      return;
    }
    
    if (debug) {
      console.log('Starting animation with dimensions:', dimensions);
    }
    
    // Animation function
    const animate = (timestamp) => {
      if (!canvasRef.current) return;
      
      const ctx = canvasRef.current.getContext('2d');
      const width = dimensions.width;
      const height = dimensions.height;
      
      // Initialize lastTimestamp on first run
      if (lastTimestampRef.current === 0) {
        lastTimestampRef.current = timestamp;
        nextSpawnTimeRef.current = timestamp;
      }
      
      // Calculate delta time (capped to prevent jumps after tab switching)
      const deltaTime = Math.min(timestamp - lastTimestampRef.current, 50);
      lastTimestampRef.current = timestamp;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Debug mode - draw canvas bounds
      if (debug) {
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, width, height);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '12px monospace';
        ctx.fillText(`Canvas: ${width}×${height}`, 10, 20);
        ctx.fillText(`Meteors: ${meteorsRef.current.length}/${meteorDensity}`, 10, 40);
        ctx.fillText(`Mode: ${mode}`, 10, 60);
        ctx.fillText(`Direction: ${direction}`, 10, 80);
        if (staggered) {
          ctx.fillText(`Next Spawn: ${Math.max(0, (nextSpawnTimeRef.current - timestamp) / 1000).toFixed(2)}s`, 10, 100);
        }
      }
      
      // Apply parallax offset
      let parallaxOffset = 0;
      if (enableParallax) {
        parallaxOffset = scrollPositionRef.current * parallaxIntensity;
      }
      
      // Spawn new meteors if needed, with staggering if enabled
      if (meteorsRef.current.length < meteorDensity) {
        const canSpawnNow = !staggered || timestamp >= nextSpawnTimeRef.current;
        
        if (canSpawnNow) {
          const newMeteor = initializeMeteorMemoized();
          if (newMeteor) {
            meteorsRef.current.push(newMeteor);
            
            // If staggering is enabled, set the next spawn time
            if (staggered) {
              const delay = Math.random() * (maxStaggerDelay - minStaggerDelay) + minStaggerDelay;
              nextSpawnTimeRef.current = timestamp + delay;
            }
          }
        }
      }
      
      // Update and draw meteors
      meteorsRef.current = meteorsRef.current.filter(meteor => {
        // Skip if not active
        if (!meteor.active) return false;
        
        // Update progress based on speed and delta time
        meteor.progress += meteor.speed * (deltaTime / 1000);
        
        // Calculate current position along the path
        const currentPos = getPathPointMemoized(Math.min(1, meteor.progress), meteor.path);
        
        // Update position history (for trail)
        meteor.positions.unshift({ x: currentPos.x, y: currentPos.y });
        meteor.positions = meteor.positions.slice(0, trailSegments);
        
        // Check if meteor has completed its path
        if (meteor.progress >= 1) {
          return false;
        }
        
        // Calculate opacity based on progress
        // Start fading out after reaching the fadeThreshold
        let currentOpacity = meteor.opacity;
        if (meteor.progress > meteor.fadeThreshold) {
          // Map progress from fadeThreshold-1.0 to 1.0-0.0 for opacity
          const fadeProgress = (meteor.progress - meteor.fadeThreshold) / (1 - meteor.fadeThreshold);
          currentOpacity = meteor.opacity * (1 - fadeProgress);
        }
        
        // Apply pulse/flicker effect
        const timeFactor = timestamp * 0.001;
        const pulseEffect = Math.sin(timeFactor * meteor.pulseSpeed + meteor.pulsePhase) * 0.2 + 0.8;
        
        // Adjust for parallax if enabled
        const adjustY = enableParallax ? parallaxOffset * (meteor.size / meteorMaxSize) : 0;
        
        // Draw trail segments
        for (let i = 0; i < meteor.positions.length - 1; i++) {
          if (!meteor.positions[i] || !meteor.positions[i+1]) continue;
          
          // Calculate segment opacity (decreases along the trail)
          const segmentOpacity = currentOpacity * (1 - i / meteor.positions.length) * pulseEffect;
          
          // Skip if nearly invisible
          if (segmentOpacity < 0.02) continue;
          
          // Calculate segment width (decreases along the trail)
          const segmentWidth = meteor.size * (1 - i / meteor.positions.length * 0.7);
          
          // Set shadow/glow effect
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = meteor.size * 3 * pulseEffect;
          
          // Draw line segment
          ctx.beginPath();
          ctx.moveTo(meteor.positions[i].x, meteor.positions[i].y + adjustY);
          ctx.lineTo(meteor.positions[i+1].x, meteor.positions[i+1].y + adjustY);
          
          // Set line style
          ctx.lineCap = 'round';
          ctx.lineWidth = segmentWidth;
          ctx.strokeStyle = trailColor.replace(/[\d.]+\)$/, segmentOpacity + ')');
          ctx.stroke();
        }
        
        // Draw meteor head (brightest part)
        if (meteor.positions[0]) {
          // Set shadow/glow for head
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = meteor.size * 5 * pulseEffect;
          
          // Draw outer glow
          ctx.beginPath();
          ctx.arc(meteor.positions[0].x, meteor.positions[0].y + adjustY, meteor.size * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = glowColor.replace(/[\d.]+\)$/, currentOpacity * 0.7 * pulseEffect + ')');
          ctx.fill();
          
          // Draw inner core
          ctx.beginPath();
          ctx.arc(meteor.positions[0].x, meteor.positions[0].y + adjustY, meteor.size * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = coreColor.replace(/[\d.]+\)$/, currentOpacity * pulseEffect + ')');
          ctx.fill();
        }
        
        return true;
      });
      
      // Continue animation
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);
    
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
    meteorDensity,
    meteorMinSize,
    meteorMaxSize,
    meteorSpeed,
    trailLength,
    trailSegments,
    coreColor,
    glowColor,
    trailColor,
    enableParallax,
    parallaxIntensity,
    staggered,
    minStaggerDelay,
    maxStaggerDelay,
    journeyCompletion,
    mode,
    direction,
    baseAngle,
    angleVariation,
    debug,
    getPathPointMemoized,
    initializeMeteorMemoized
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
        zIndex: zIndex
      }}
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
 * EmeraldMeteorShower Component
 * 
 * A preset version of the MeteorShower with a green color scheme.
 * 
 * @param {Object} props - Same props as MeteorShower with presets
 */
export const EmeraldMeteorShower = (props) => {
  const emeraldPreset = {
    coreColor: 'rgba(255, 255, 255, 1)',
    glowColor: 'rgba(215, 255, 230, 0.9)',
    trailColor: 'rgba(100, 220, 150, 0.8)',
    meteorMinSize: 1,
    meteorMaxSize: 3,
    meteorSpeed: 0.08,
    trailLength: 180,
    trailSegments: 20,
    journeyCompletion: 0.9,
    staggered: true,
    minStaggerDelay: 250,
    maxStaggerDelay: 1500,
  };
  
  return <MeteorShower {...emeraldPreset} {...props} />;
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
 * ClassicMeteorShower Component
 * 
 * A preset version of the MeteorShower with linear paths for a more traditional meteor shower effect.
 * 
 * @param {Object} props - Same props as MeteorShower with presets
 */
export const ClassicMeteorShower = (props) => {
  const classicPreset = {
    mode: 'linear',
    direction: 'both',
    baseAngle: 30,
    angleVariation: 15,
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
  
  return <MeteorShower {...classicPreset} {...props} />;
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