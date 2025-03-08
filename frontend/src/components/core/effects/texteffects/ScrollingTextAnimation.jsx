import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import { createUseStyles } from 'react-jss';

// Optimized styles with simplified GPU acceleration properties
const useStyles = createUseStyles({
  animatedContainer: {
    position: 'relative',
    width: '100%',
    textAlign: props => props.textAlign || 'center',
    margin: props => props.margin || '0 0 3rem 0',
    zIndex: 2,
    willChange: 'transform, opacity',
    // Streamlined GPU acceleration properties to avoid layer conflicts
    transform: 'translate3d(0,0,0)',
    backfaceVisibility: 'hidden',
    '-webkit-font-smoothing': 'antialiased',
  },
  content: {
    width: '100%',
  },
  divider: props => ({
    width: props.dividerWidth || '150px',
    height: props.dividerHeight || '1px',
    background: props.dividerBackground || 'linear-gradient(to right, rgba(160, 142, 97, 0), rgba(160, 142, 97, 0.6), rgba(160, 142, 97, 0))',
    margin: props.dividerMargin || '1rem auto',
    display: props.showDivider ? 'block' : 'none'
  })
});

/**
 * ScrollingTextAnimation Component
 * 
 * A highly optimized, butter-smooth scroll-based animation component
 * for text elements with exceptional performance on both mobile and desktop.
 */
const ScrollingTextAnimation = ({
  children,
  scrollConfig = {},
  textAlign = 'center',
  margin = '0 0 3rem 0',
  showDivider = true,
  dividerWidth = '150px',
  dividerHeight = '1px',
  dividerBackground,
  dividerMargin = '1rem auto',
  style = {},
  className = ''
}) => {
  // Set default scroll configuration with performance-optimized defaults
  const {
    startPosition = 0,
    endPosition = 300,
    initialY = -100,
    finalY = 0,
    clampValues = true,
    opacityValues = [1, 0.95, 0.9],
    opacityScrollPositions = [startPosition, endPosition, endPosition + 100],
    reverseDirection = false,
    // Enhanced spring configuration for smoother, higher framerate animations
    springConfig = {
      stiffness: 50,      // Lower stiffness for smoother motion
      damping: 25,        // Balanced damping 
      mass: 0.5,          // Slightly higher mass for momentum
      restDelta: 0.001,   // Higher precision for position
      restSpeed: 0.001,   // Higher precision for velocity
    },
    maxVelocity = 2000,   // Maximum velocity cap (pixels per second)
    disableOnMobile = false
  } = scrollConfig;

  // Use Framer Motion's built-in reduced motion hook
  const prefersReducedMotion = useReducedMotion();
  
  // Single state to track if in view (more efficient than multiple states)
  const [isInView, setIsInView] = useState(false);
  
  // Ref for the container element
  const containerRef = useRef(null);
  
  // Check if we should use mobile mode (using a ref to avoid rerenders)
  const isMobileRef = useRef(false);
  
  // Initialize and update mobile detection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkMobile = () => {
      isMobileRef.current = 
        window.innerWidth <= 768 || 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };
    
    checkMobile();
    
    const handleResize = () => {
      checkMobile();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Determine if simplified animations should be used
  const shouldUseSimplifiedAnimations = useMemo(() => {
    return prefersReducedMotion || (disableOnMobile && isMobileRef.current);
  }, [prefersReducedMotion, disableOnMobile]);
  
  // Optimized scroll tracking with improved performance
  const { scrollY } = useScroll({
    smooth: 0.05  // Smoother scrolling for high-framerate animations
  });
  
  // Create transformed Y value from scroll position
  const rawTranslateY = useTransform(
    scrollY,
    [startPosition, endPosition],
    reverseDirection ? [finalY, initialY] : [initialY, finalY],
    { clamp: clampValues }
  );
  
  // Apply velocity limiting to the spring for more controlled animations
  const translateY = useSpring(rawTranslateY, {
    ...springConfig,
    // Add velocity limiter function to cap maximum speed
    velocity: current => Math.min(Math.max(current, -maxVelocity), maxVelocity)
  });
  
  // Create opacity animation with the same optimized approach
  const rawOpacity = useTransform(
    scrollY,
    opacityScrollPositions,
    opacityValues,
    { clamp: clampValues }
  );
  
  const opacity = useSpring(rawOpacity, springConfig);
  
  // Optimized intersection observer with frame synchronization
  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === 'undefined') return;
    
    let animationFrameId = null;
    const currentRef = containerRef.current;
    
    const observer = new IntersectionObserver(
      entries => {
        // Cancel any pending frame
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        
        // Schedule update on next animation frame for better synchronization
        animationFrameId = requestAnimationFrame(() => {
          if (entries[0]) {
            setIsInView(entries[0].isIntersecting);
          }
        });
      },
      {
        root: null,
        rootMargin: '20% 0%', // Larger margin to start animation earlier
        threshold: 0.1
      }
    );
    
    observer.observe(currentRef);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      observer.unobserve(currentRef);
    };
  }, []);
  
  // Create styles for component
  const styleProps = useMemo(() => ({
    textAlign,
    margin,
    showDivider,
    dividerWidth,
    dividerHeight,
    dividerBackground,
    dividerMargin
  }), [textAlign, margin, showDivider, dividerWidth, dividerHeight, dividerBackground, dividerMargin]);
  
  const classes = useStyles(styleProps);
  
  // Memoize animation style to prevent recalculations
  const animationStyle = useMemo(() => {
    // No animation if not in view
    if (!isInView) {
      return {
        y: reverseDirection ? finalY : initialY,
        opacity: opacityValues[0]
      };
    }
    
    // Simplified animation for reduced motion or mobile
    if (shouldUseSimplifiedAnimations) {
      return {
        y: finalY,
        opacity: 1,
        transition: {
          duration: 0.5,
          ease: [0.25, 0.1, 0.25, 1.0]
        }
      };
    }
    
    // Full high-performance animation
    return {
      y: translateY,
      opacity: opacity
    };
  }, [isInView, shouldUseSimplifiedAnimations, translateY, opacity, reverseDirection, finalY, initialY, opacityValues]);
  
  // Optimized transform template for GPU rendering
  const optimizedTransformTemplate = useCallback((_, transform) => {
    return `${transform} translateZ(0)`;
  }, []);
  
  return (
    <motion.div 
      ref={containerRef}
      className={`${classes.animatedContainer} ${className}`}
      style={{ 
        ...style,
        ...animationStyle,
      }}
      transformTemplate={optimizedTransformTemplate}
    >
      <div className={classes.content}>
        {children}
      </div>
      {showDivider && <div className={classes.divider} />}
    </motion.div>
  );
};

export default ScrollingTextAnimation;