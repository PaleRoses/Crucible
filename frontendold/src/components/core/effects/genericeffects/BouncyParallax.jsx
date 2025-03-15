import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';

/**
 * BouncyParallax Component
 * 
 * A highly optimized, type-agnostic scroll-based animation component
 * that can be applied to any element with exceptional performance.
 * Extracted from the ScrollingTextAnimation component to create
 * a more versatile animation utility.
 */
const BouncyParallax = ({
  children,
  scrollConfig = {},
  style = {},
  className = '',
  as = 'div',
}) => {
  // Set default scroll configuration with performance-optimized defaults
  const {
    startPosition = 0,
    endPosition = 300,
    initialY = -100,
    finalY = 0,
    initialX = 0,
    finalX = 0,
    initialScale = 1,
    finalScale = 1,
    initialRotate = 0,
    finalRotate = 0,
    clampValues = true,
    opacityValues = [0, 1, 1],
    opacityScrollPositions = [startPosition, startPosition + 100, endPosition],
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
  
  // Create transformed values from scroll position
  const rawTranslateY = useTransform(
    scrollY,
    [startPosition, endPosition],
    reverseDirection ? [finalY, initialY] : [initialY, finalY],
    { clamp: clampValues }
  );

  const rawTranslateX = useTransform(
    scrollY,
    [startPosition, endPosition],
    reverseDirection ? [finalX, initialX] : [initialX, finalX],
    { clamp: clampValues }
  );
  
  const rawScale = useTransform(
    scrollY,
    [startPosition, endPosition],
    reverseDirection ? [finalScale, initialScale] : [initialScale, finalScale],
    { clamp: clampValues }
  );

  const rawRotate = useTransform(
    scrollY,
    [startPosition, endPosition],
    reverseDirection ? [finalRotate, initialRotate] : [initialRotate, finalRotate],
    { clamp: clampValues }
  );
  
  // Apply velocity limiting to the springs for more controlled animations
  const translateY = useSpring(rawTranslateY, {
    ...springConfig,
    // Add velocity limiter function to cap maximum speed
    velocity: current => Math.min(Math.max(current, -maxVelocity), maxVelocity)
  });

  const translateX = useSpring(rawTranslateX, {
    ...springConfig,
    velocity: current => Math.min(Math.max(current, -maxVelocity), maxVelocity)
  });

  const scale = useSpring(rawScale, {
    ...springConfig
  });

  const rotate = useSpring(rawRotate, {
    ...springConfig
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
  
  // Memoize animation style to prevent recalculations
  const animationStyle = useMemo(() => {
    // No animation if not in view
    if (!isInView) {
      return {
        y: reverseDirection ? finalY : initialY,
        x: reverseDirection ? finalX : initialX,
        scale: reverseDirection ? finalScale : initialScale,
        rotate: reverseDirection ? finalRotate : initialRotate,
        opacity: opacityValues[0]
      };
    }
    
    // Simplified animation for reduced motion or mobile
    if (shouldUseSimplifiedAnimations) {
      return {
        y: finalY,
        x: finalX,
        scale: finalScale,
        rotate: finalRotate,
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
      x: translateX,
      scale: scale,
      rotate: rotate,
      opacity: opacity
    };
  }, [
    isInView, shouldUseSimplifiedAnimations, 
    translateY, translateX, scale, rotate, opacity, 
    reverseDirection, finalY, initialY, finalX, initialX,
    finalScale, initialScale, finalRotate, initialRotate, 
    opacityValues
  ]);
  
  // Optimized transform template for GPU rendering
  const optimizedTransformTemplate = useCallback((_, transform) => {
    return `${transform} translateZ(0)`;
  }, []);
  
  // Default element style optimized for GPU acceleration
  const baseStyle = {
    position: 'relative',
    willChange: 'transform, opacity',
    transform: 'translate3d(0,0,0)',
    backfaceVisibility: 'hidden',
    WebkitFontSmoothing: 'antialiased',
    ...style
  };

  // Create the motion component with the appropriate element type
  const MotionComponent = motion[as];
  
  return (
    <MotionComponent
      ref={containerRef}
      className={className}
      style={baseStyle}
      transformTemplate={optimizedTransformTemplate}
      {...animationStyle}
    >
      {children}
    </MotionComponent>
  );
};

export default BouncyParallax;