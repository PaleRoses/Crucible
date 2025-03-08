import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { createUseStyles } from 'react-jss';

// Optimized styles with improved mobile responsiveness
const useStyles = createUseStyles({
  profile: {
    backgroundColor: 'rgba(15, 15, 15, 0.7)',
    border: '1px solid rgba(160, 142, 97, 0.2)',
    borderRadius: '3px',
    padding: '3rem',
    margin: '4rem auto',
    maxWidth: '1000px',
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '3rem',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    position: 'relative',
    overflow: 'hidden', // Ensure content doesn't overflow
    boxSizing: 'border-box', // Include padding in width calculation
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      padding: '2rem',
      gap: '2rem',
      margin: '2rem auto',
      width: 'calc(100% - 2rem)', // Ensure proper width accounting for margins
      maxWidth: '480px' // Cap width on mobile
    }
  },
  profileBorder: {
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: 0,
      height: '1px',
      background: 'linear-gradient(to right, rgba(160, 142, 97, 0.7), rgba(160, 142, 97, 0))',
      transition: 'width 1s ease 0.5s'
    },
    '&$inView::before': {
      width: '100%'
    }
  },
  inView: {},
  profileImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: '1/1',
    borderRadius: '50%',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
    transition: 'box-shadow 0.3s ease',
    overflow: 'hidden', // Fixed from 'false' to 'hidden'
    boxSizing: 'border-box', // Include padding in width calculation
    minHeight: '200px', // Ensure minimum height
    '&:hover': {
      boxShadow: '0 5px 20px rgba(191, 173, 127, 0.4)'
    },
    '@media (max-width: 768px)': {
      maxWidth: '250px',
      margin: '0 auto',
      minHeight: '250px' // Explicit height for mobile
    },
    // Force aspect ratio for Chrome
    '&::before': {
      content: '""',
      display: 'block',
      paddingTop: '100%', // 1:1 aspect ratio
    }
  },
  cometCanvasContainer: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    pointerEvents: 'none',
    zIndex: 10,
    // Hardware acceleration
    transform: 'translateZ(0)',
    willChange: 'transform',
    width: 'calc(100% + 40px)', // Explicit width for Chrome
    height: 'calc(100% + 40px)', // Explicit height for Chrome
  },
  profileImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    overflow: 'hidden',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      boxShadow: 'inset 0 0 20px rgba(191, 173, 127, 0.3)',
      borderRadius: '50%',
      pointerEvents: 'none'
    }
  },
  imageWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: '50%'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.6s ease, object-position 0.6s ease',
    display: 'block' // Explicit for Chrome
  },
  profileDetails: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%', // Ensure full width containment
    '@media (max-width: 768px)': {
      textAlign: 'center',
      marginTop: '1rem',
      alignItems: 'center' // Center children on mobile
    }
  },
  profileName: {
    fontSize: '2.2rem',
    color: '#bfad7f',
    fontWeight: 300,
    letterSpacing: '0.1em',
    marginBottom: '0.5rem',
    '@media (max-width: 480px)': {
      fontSize: '1.8rem'
    }
  },
  profileRole: {
    fontSize: '1.1rem',
    color: 'rgba(191, 173, 127, 0.7)',
    marginBottom: '2rem',
    letterSpacing: '0.05em',
    fontWeight: 300,
    fontFamily: '"Garamond", "Adobe Caslon Pro", serif',
    fontStyle: 'italic'
  },
  profileBio: {
    fontSize: '1rem',
    color: 'rgba(224, 224, 224, 0.7)',
    lineHeight: 1.8,
    marginBottom: '2rem',
    fontFamily: '"Garamond", "Adobe Caslon Pro", serif',
    fontWeight: 300
  },
  profileStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
    marginTop: '2rem',
    borderTop: '1px solid rgba(160, 142, 97, 0.2)',
    paddingTop: '1.5rem',
    width: '100%', // Ensure full width
    boxSizing: 'border-box', // Include padding and border in width calculation
    '@media (max-width: 768px)': {
      gridTemplateColumns: 'repeat(3, 1fr)', // Keep 3 columns on tablet
      gap: '1rem',
      padding: '1.5rem 0.5rem 0' // Add horizontal padding
    },
    '@media (max-width: 480px)': {
      gridTemplateColumns: '1fr', // Stack on mobile
      gap: '1.5rem',
      maxWidth: '100%', // Ensure it doesn't overflow container
      margin: '1.5rem auto 0'
    }
  },
  stat: {
    textAlign: 'center',
    width: '100%', // Ensure full width
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    '@media (max-width: 480px)': {
      marginBottom: '0.5rem'
    }
  },
  statValue: {
    fontSize: '2.5rem',
    color: 'rgba(191, 173, 127, 0.9)',
    fontWeight: 300
  },
  statLabel: {
    fontSize: '0.85rem',
    color: 'rgba(224, 224, 224, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginTop: '0.5rem'
  }
});

/**
 * Optimized Comet Animation Component
 * Renders a comet that orbits around the circular profile image
 */
const CometBorderAnimation = ({ isHovered = false, config = {} }) => {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Check for reduced motion preference
  const prefersReducedMotion = useReducedMotion();
  
  // Animation parameters with useRef to avoid re-renders
  const cometPositionRef = useRef(0);
  const lastTimeRef = useRef(0);
  const frameRateThrottleRef = useRef(0);
  
  // Default configuration with prop overrides
  const {
    size = 2,
    trailLength = 140,
    speed = 0.01,
    hoverSpeedMultiplier = 2,
    trailSegments = 25,
    glowIntensity = 0.8,
    targetFPS = 60
  } = config;
  
  // Calculate frame interval for throttling
  const frameInterval = useMemo(() => 1000 / targetFPS, [targetFPS]);
  
  // Memoized function to get points on circle
  const getPointOnCircle = useCallback((angle, centerX, centerY, radius) => {
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  }, []);
  
  // Update dimensions with resize observer for better performance
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Capture ref value to use in cleanup
    const currentContainer = containerRef.current;
    
    const updateDimensions = () => {
      if (currentContainer) {
        const width = currentContainer.offsetWidth;
        const height = currentContainer.offsetHeight;
        setDimensions({ width, height });
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
  }, []);
  
  // Main animation effect
  useEffect(() => {
    // Skip animation if reduced motion is preferred
    if (!canvasRef.current || dimensions.width === 0 || 
        (prefersReducedMotion && config.respectReducedMotion)) return;
    
    // Capture ref value to use in cleanup  
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { 
      alpha: true, 
      willReadFrequently: false,
      desynchronized: true // Potential performance improvement in Chrome
    });
    
    if (!ctx) return; // Safety check for context
    
    // Mobile detection for performance optimization
    const isMobile = window.innerWidth <= 768 || 
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Set canvas dimensions with device pixel ratio for sharper rendering
    // Use lower pixel ratio on mobile for performance
    const pixelRatio = isMobile ? Math.min(window.devicePixelRatio || 1, 1.5) : (window.devicePixelRatio || 1);
    canvas.width = Math.max(dimensions.width, 1) * pixelRatio; // Prevent zero-width canvas
    canvas.height = Math.max(dimensions.height, 1) * pixelRatio; // Prevent zero-height canvas
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;
    ctx.scale(pixelRatio, pixelRatio);
    
    // Calculate circle properties
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const radius = Math.min(centerX, centerY) - 20; // 20px padding
    
    // Comet parameters with hover enhancement
    const cometSize = isHovered ? size * 1.2 : size;
    const actualTrailLength = isHovered ? trailLength * 1.2 : trailLength;
    const actualSpeed = isHovered ? speed * hoverSpeedMultiplier : speed;
    const actualGlowIntensity = isHovered ? glowIntensity * 1.5 : glowIntensity;
    
    // Pre-calculate segment opacity and width ratios for better performance
    const segmentOpacityRatios = new Array(trailSegments).fill(0).map((_, i) => 
      1 - (i / trailSegments)
    );
    
    const segmentWidthRatios = new Array(trailSegments).fill(0).map((_, i) => 
      1 - (i / trailSegments * 0.7)
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
      
      // Update comet position with deltaTime consideration
      cometPositionRef.current = (cometPositionRef.current + actualSpeed * deltaTime) % (2 * Math.PI);
      
      // Clear the canvas - use clearRect for better performance
      ctx.clearRect(0, 0, canvas.width / pixelRatio, canvas.height / pixelRatio);
      
      // Draw trail segments
      let prevPoint = getPointOnCircle(cometPositionRef.current, centerX, centerY, radius);
      
      for (let i = 0; i < trailSegments; i++) {
        const segmentAngle = cometPositionRef.current - ((i + 1) * (actualTrailLength / (2 * Math.PI * radius)));
        const nextPoint = getPointOnCircle(segmentAngle, centerX, centerY, radius);
        
        // Calculate opacity and width using pre-calculated ratios
        const baseOpacity = 0.9 * segmentOpacityRatios[i];
        const segmentWidth = 3 * segmentWidthRatios[i] + 0.5;
        
        // Skip nearly invisible segments for performance
        if (baseOpacity < 0.05) continue;
        
        // Draw trail segment with optimized settings
        ctx.beginPath();
        ctx.moveTo(prevPoint.x, prevPoint.y);
        ctx.lineTo(nextPoint.x, nextPoint.y);
        
        // Apply shadow/glow only when necessary (reduces GPU load)
        if (i < trailSegments / 2) {
          ctx.shadowColor = `rgba(255, 253, 227, ${baseOpacity * actualGlowIntensity})`;
          ctx.shadowBlur = (12 * segmentOpacityRatios[i] + 5) * actualGlowIntensity;
        } else {
          ctx.shadowBlur = 0;
        }
        
        // Set line style and draw
        ctx.strokeStyle = `rgba(191, 173, 127, ${baseOpacity})`;
        ctx.lineWidth = segmentWidth;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        // Update previous point for next segment
        prevPoint = nextPoint;
      }
      
      // Draw comet head
      const headPoint = getPointOnCircle(cometPositionRef.current, centerX, centerY, radius);
      
      // Larger outer glow for comet head
      ctx.beginPath();
      ctx.arc(headPoint.x, headPoint.y, cometSize * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 253, 227, ${0.4 * actualGlowIntensity})`;
      ctx.shadowColor = `rgba(255, 253, 227, ${0.6 * actualGlowIntensity})`;
      ctx.shadowBlur = 15 * actualGlowIntensity;
      ctx.fill();
      
      // Draw comet head
      ctx.beginPath();
      ctx.arc(headPoint.x, headPoint.y, cometSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 253, 227, ${0.6 * actualGlowIntensity})`;
      ctx.shadowColor = `rgba(255, 253, 227, ${0.7 * actualGlowIntensity})`;
      ctx.shadowBlur = 12 * actualGlowIntensity;
      ctx.fill();
      
      // Brightest center point
      ctx.beginPath();
      ctx.arc(headPoint.x, headPoint.y, cometSize * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * actualGlowIntensity})`;
      ctx.shadowColor = `rgba(255, 255, 255, ${0.9 * actualGlowIntensity})`;
      ctx.shadowBlur = 8 * actualGlowIntensity;
      ctx.fill();
      
      // Request next frame
      requestRef.current = requestAnimationFrame(animateComet);
    };
    
    // Start animation
    requestRef.current = requestAnimationFrame(animateComet);
    
    // Cleanup
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [dimensions, isHovered, size, trailLength, speed, hoverSpeedMultiplier, 
      trailSegments, glowIntensity, frameInterval, getPointOnCircle, prefersReducedMotion, config.respectReducedMotion]);
  
  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%',
        // Hardware acceleration hints
        willChange: prefersReducedMotion ? 'auto' : 'transform',
        transform: 'translateZ(0)',
        display: 'block', // Explicit for Chrome
        boxSizing: 'border-box' // Include padding in dimensions
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
          display: 'block', // Explicit display type for Chrome
          opacity: prefersReducedMotion && config.respectReducedMotion ? 0.3 : 1,
          transition: 'opacity 0.3s ease'
        }} 
      />
    </div>
  );
};

/**
 * Enhanced PersonProfileCard Component with Circular Profile Image and Orbiting Comet Animation
 * Cross-browser compatible (Chrome, Firefox, Safari, Edge)
 * 
 * @param {Object} props - Component props
 * @param {Object} props.person - Person data object
 * @param {string} props.person.name - Person's name
 * @param {string} props.person.role - Person's role or title
 * @param {string} props.person.image - URL to person's image
 * @param {string[]} props.person.bio - Array of bio paragraphs
 * @param {Object[]} props.person.stats - Array of statistic objects
 * @param {Object} [props.animationConfig] - Optional animation configuration
 * @param {Object} [props.cometConfig] - Optional comet configuration
 * @param {Object} [props.imagePosition] - Optional image position configuration
 */
const PersonProfileCard = ({ 
  person,
  animationConfig = {
    useInternalRef: true,
    threshold: 0.2,
    once: true,
    initialY: 50,
    duration: 0.8,
    ease: "easeOut"
  },
  cometConfig = {
    size: 1,
    trailLength: 80,
    speed: 0.001,
    targetFPS: 30, // Lower FPS target for better performance
    // Based on MeteorShower component for mobile optimization
    adaptiveQuality: true, // Enable adaptive quality based on device
    respectReducedMotion: true // Respect user's reduced motion preference
  },
  imagePosition = {
    x: 50,
    y: 0,
    scale: 1
  }
}) => {
  const classes = useStyles();
  const [isHovered, setIsHovered] = useState(false);
  
  // Set up ref and inView detection
  const internalRef = useRef(null);
  
  // Use memoized animation config
  const safeAnimConfig = useMemo(() => ({
    threshold: animationConfig?.threshold ?? 0.2,
    once: animationConfig?.once ?? true
  }), [animationConfig?.threshold, animationConfig?.once]);
  
  // Always call useInView (to follow React hook rules)
  const internalInView = useInView(internalRef, safeAnimConfig);
  
  // Use either internal or external ref/inView based on config
  const ref = animationConfig?.useInternalRef !== false ? internalRef : animationConfig?.ref;
  const isInView = animationConfig?.useInternalRef !== false ? internalInView : animationConfig?.isInView;
  
  // Optimize events for touch devices
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  
  // Precompute image style for better performance
  const imageStyle = useMemo(() => ({
    objectPosition: `${imagePosition?.x ?? 50}% ${imagePosition?.y ?? 50}%`,
    transform: `scale(${imagePosition?.scale ?? 1})`
  }), [imagePosition?.x, imagePosition?.y, imagePosition?.scale]);
  
  return (
    <motion.div 
      ref={ref}
      className={`${classes.profile} ${classes.profileBorder} ${isInView ? classes.inView : ''}`}
      initial={{ opacity: 0, y: animationConfig?.initialY ?? 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: animationConfig?.initialY ?? 50 }}
      transition={{ 
        duration: animationConfig?.duration ?? 0.8, 
        ease: animationConfig?.ease ?? "easeOut" 
      }}
      layout // Improve layout transitions
    >
      <div 
        className={classes.profileImageContainer}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Comet animation around the border */}
        <div className={classes.cometCanvasContainer}>
          <CometBorderAnimation 
            isHovered={isHovered} 
            config={cometConfig}
          />
        </div>
        
        <div className={classes.profileImage}>
          <div className={classes.imageWrapper}>
            <img 
              src={person.image} 
              alt={person.name} 
              className={classes.image}
              style={imageStyle}
              loading="lazy"
              onLoad={() => {
                // Force layout recalculation after image loads
                setTimeout(() => {
                  if (window.requestAnimationFrame) {
                    window.requestAnimationFrame(() => {
                      const event = new Event('resize');
                      window.dispatchEvent(event);
                    });
                  }
                }, 100);
              }}
            />
          </div>
        </div>
      </div>
      
      <div className={classes.profileDetails}>
        <h2 className={classes.profileName}>{person.name}</h2>
        <p className={classes.profileRole}>{person.role}</p>
        
        {person.bio.map((paragraph, index) => (
          <p key={index} className={classes.profileBio}>{paragraph}</p>
        ))}
        
        {person.stats && person.stats.length > 0 && (
          <motion.div 
            className={classes.profileStats}
            layout // Smooth layout transitions
            transition={{ 
              layout: { duration: 0.3, ease: "easeOut" } 
            }}
          >
            {person.stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className={classes.stat}
                layout // Individual stat layout animation
              >
                <div className={classes.statValue}>{stat.value}</div>
                <div className={classes.statLabel}>{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default PersonProfileCard;