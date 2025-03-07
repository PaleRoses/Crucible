import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  animatedContainer: {
    position: 'relative',
    width: '100%',
    textAlign: props => props.textAlign || 'center',
    margin: props => props.margin || '0 0 3rem 0',
    zIndex: 2,
    willChange: 'transform, opacity',
    backfaceVisibility: 'hidden', // Prevents flickering in some browsers
    perspective: 1000, // Improves GPU acceleration
    transform: 'translate3d(0,0,0)', // Force GPU rendering
    '-webkit-font-smoothing': 'antialiased', // Sharper text rendering
    '-moz-osx-font-smoothing': 'grayscale', // Sharper text rendering
    // Disable subpixel rendering to eliminate trailing artifacts
    '-webkit-transform-style': 'preserve-3d',
    transformStyle: 'preserve-3d',
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
    throttleAmount = 0, // Disable throttling for maximum frame updates
    enableReducedMotion = true, // Respect user's reduced motion preferences
    disableOnMobile = false // Option to disable complex animations on mobile
  } = scrollConfig;

  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Calculate the actual Y values considering direction
  const yInputRange = [startPosition, endPosition];
  const yOutputRange = reverseDirection ? [finalY, initialY] : [initialY, finalY];
  
  // Detect mobile devices and motion preferences
  useEffect(() => {
    // Check for mobile devices
    const checkMobile = () => {
      setIsMobile(
        typeof window !== 'undefined' && 
        (window.innerWidth <= 768 || 
         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
      );
    };
    
    // Check for reduced motion preference
    const checkReducedMotion = () => {
      setPrefersReducedMotion(
        typeof window !== 'undefined' && 
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
    };
    
    checkMobile();
    checkReducedMotion();
    
    // Update on resize
    const handleResize = () => {
      checkMobile();
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      
      // Clean up
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);
  
  // Custom high-precision scroll tracking
  const { scrollY } = useScroll({
    container: typeof window !== 'undefined' ? window : undefined,
    layoutEffect: false,
    offset: ['start', 'end'],
    throttleDelay: throttleAmount,
    smooth: 0.05 // Add slight smoothing to prevent jitter without reducing frame rate
  });
  
  // Create high-precision transform values with physics-based smoothing
  const rawTranslateY = useTransform(
    scrollY,
    yInputRange,
    yOutputRange,
    { clamp: clampValues }
  );
  
  // Optional spring physics for smoother motion without trailing
  // Low stiffness and damping provide smoothing without visible lag
  const translateY = useSpring(rawTranslateY, {
    stiffness: 1000,
    damping: 100,
    mass: 0.2
  });
  
  // Create opacity transform with same approach
  const rawOpacity = useTransform(
    scrollY,
    opacityScrollPositions,
    opacityValues,
    { clamp: clampValues }
  );
  
  const opacity = useSpring(rawOpacity, {
    stiffness: 1000,
    damping: 100,
    mass: 0.2
  });
  
  // Highly optimized intersection observer setup
  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === 'undefined') return;
    
    // Store the current ref value to avoid closure issues
    const currentRef = containerRef.current;
    
    // Create observer with optimized settings
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          // Use requestAnimationFrame to sync with browser render cycle
          requestAnimationFrame(() => {
            setIsInView(entry.isIntersecting);
          });
        });
      },
      {
        root: null,
        // Larger rootMargin to start animations before element comes into view
        rootMargin: '100px 0px',
        threshold: 0.1
      }
    );
    
    observer.observe(currentRef);
    
    // Cleanup using captured ref value
    return () => {
      observer.unobserve(currentRef);
    };
  }, []);
  
  // Determine if we should use simplified animations
  const shouldUseSimplifiedAnimations = 
    (enableReducedMotion && prefersReducedMotion) || 
    (disableOnMobile && isMobile);
  
  // Create styles for component
  const styleProps = {
    textAlign,
    margin,
    showDivider,
    dividerWidth,
    dividerHeight,
    dividerBackground,
    dividerMargin
  };
  
  const classes = useStyles(styleProps);
  
  // Memoize style calculations to prevent recalculations on every render
  const getAnimationStyle = useCallback(() => {
    if (!isInView) {
      // Initial static position when not in view
      return {
        y: reverseDirection ? finalY : initialY,
        opacity: opacityValues[0],
      };
    }
    
    if (shouldUseSimplifiedAnimations) {
      // Simplified animation for reduced motion or mobile
      return {
        y: finalY,
        opacity: 1,
        transition: {
          duration: 0.5,
          ease: [0.25, 0.1, 0.25, 1.0], // Cubic bezier for smooth easing
        }
      };
    }
    
    // Full animation with GPU acceleration
    return {
      y: translateY,
      opacity: opacity,
      // Remove explicit transition to eliminate trailing effect
      // This allows direct position updates without interpolation artifacts
    };
  }, [isInView, shouldUseSimplifiedAnimations, translateY, opacity, reverseDirection, finalY, initialY, opacityValues]);
  
  const animationStyle = getAnimationStyle();
  
  return (
    <motion.div 
      ref={containerRef}
      className={`${classes.animatedContainer} ${className}`}
      style={{ 
        ...style,
        ...animationStyle,
      }}
      // Additional Framer Motion optimizations
      transformTemplate={(_, transform) => `${transform} translateZ(0)`}
      layoutId={undefined} // Prevent layout animations
      initial={false} // Disable initial animation to prevent flashing
      skipExitTransition={true} // Skip exit transitions
      forceFallback={true} // Force consistent rendering approach
    >
      <div className={classes.content}>
        {children}
      </div>
      {showDivider && <div className={classes.divider} />}
    </motion.div>
  );
};

export default ScrollingTextAnimation;