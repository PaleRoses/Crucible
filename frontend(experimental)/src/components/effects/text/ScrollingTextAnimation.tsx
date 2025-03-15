import React, { useRef, useEffect, useMemo, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion, type MotionStyle } from 'framer-motion';

// Define TypeScript interfaces for component props
interface SpringConfig {
  stiffness?: number;
  damping?: number;
  mass?: number;
  restDelta?: number;
  restSpeed?: number;
}

interface ScrollConfig {
  startPosition?: number;
  endPosition?: number;
  initialY?: number;
  finalY?: number;
  clampValues?: boolean;
  opacityValues?: number[];
  opacityScrollPositions?: number[];
  reverseDirection?: boolean;
  springConfig?: SpringConfig;
  maxVelocity?: number;
  disableOnMobile?: boolean;
}

interface ScrollingTextAnimationProps {
  children: React.ReactNode;
  scrollConfig?: ScrollConfig;
  textAlign?: 'left' | 'center' | 'right';
  margin?: string;
  showDivider?: boolean;
  dividerWidth?: string;
  dividerHeight?: string;
  dividerBackground?: string;
  dividerMargin?: string;
  styleProp?: React.CSSProperties; // Renamed from 'style' to avoid conflict
  className?: string;
}

/**
 * ScrollingTextAnimation Component
 * 
 * A highly optimized, butter-smooth scroll-based animation component
 * for text elements with exceptional performance on both mobile and desktop.
 */
const ScrollingTextAnimation: React.FC<ScrollingTextAnimationProps> = ({
  children,
  scrollConfig = {},
  textAlign = 'center',
  margin = '0 0 3rem 0',
  showDivider = true,
  dividerWidth = '150px',
  dividerHeight = '1px',
  dividerBackground,
  dividerMargin = '1rem auto',
  styleProp = {}, // Renamed from 'style'
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
    springConfig = {
      stiffness: 50,
      damping: 25,
      mass: 0.5,
      restDelta: 0.001,
      restSpeed: 0.001,
    },
    disableOnMobile = false
  } = scrollConfig;

  // Use Framer Motion's built-in reduced motion hook
  const prefersReducedMotion = useReducedMotion();
  
  // State to track if component is in view
  const [isInView, setIsInView] = useState(false);
  
  // Ref for the container element
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Check if we should use mobile mode (using a ref to avoid rerenders)
  const isMobileRef = useRef(false);
  
  // Initialize and update mobile detection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkMobile = (): void => {
      isMobileRef.current = 
        window.innerWidth <= 768 || 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };
    
    checkMobile();
    
    const handleResize = (): void => {
      checkMobile();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Determine if simplified animations should be used
  const shouldUseSimplifiedAnimations = useMemo(() => {
    return Boolean(prefersReducedMotion) || (disableOnMobile && isMobileRef.current);
  }, [prefersReducedMotion, disableOnMobile]);
  
  // Optimized scroll tracking
  const { scrollY } = useScroll();
  
  // Create transformed Y value from scroll position
  const yRange = useTransform(
    scrollY,
    [startPosition, endPosition],
    reverseDirection ? [finalY, initialY] : [initialY, finalY],
    { clamp: clampValues }
  );
  
  // Apply spring physics to the animation
  const ySpring = useSpring(yRange, springConfig);
  
  // Create opacity animation
  const opacityRange = useTransform(
    scrollY,
    opacityScrollPositions,
    opacityValues,
    { clamp: clampValues }
  );
  
  // Apply spring physics to opacity
  const opacitySpring = useSpring(opacityRange, springConfig);
  
  // Optimized intersection observer with frame synchronization
  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === 'undefined') return;
    
    let animationFrameId: number | null = null;
    const currentRef = containerRef.current;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        
        animationFrameId = window.requestAnimationFrame(() => {
          if (entries[0]) {
            setIsInView(entries[0].isIntersecting);
          }
        });
      },
      {
        root: null,
        rootMargin: '20% 0%',
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
  
  // Prepare container style classes
  const containerClasses = useMemo(() => {
    const baseClasses = "relative w-full z-[2] backface-hidden";
    const alignmentClass = textAlign === 'left' ? 'text-left' : textAlign === 'right' ? 'text-right' : 'text-center';
    
    return `${baseClasses} ${alignmentClass} ${className}`;
  }, [textAlign, className]);
  
  // Prepare divider style classes
  const dividerClasses = useMemo(() => {
    return showDivider ? 'block' : 'hidden';
  }, [showDivider]);
  
  // Set combined style for the motion component
  const style = useMemo((): MotionStyle => {
    const baseStyle: MotionStyle = {
      margin,
      willChange: 'transform, opacity',
      WebkitFontSmoothing: 'antialiased',
      ...styleProp,
    };
    
    if (isInView && !shouldUseSimplifiedAnimations) {
      baseStyle.y = ySpring;
      baseStyle.opacity = opacitySpring;
    }
    
    return baseStyle;
  }, [margin, styleProp, isInView, shouldUseSimplifiedAnimations, ySpring, opacitySpring]);
  
  // Set inline styles for the divider
  const dividerStyle = useMemo((): React.CSSProperties => ({
    width: dividerWidth,
    height: dividerHeight,
    background: dividerBackground || 'linear-gradient(to right, rgba(160, 142, 97, 0), rgba(160, 142, 97, 0.6), rgba(160, 142, 97, 0))',
    margin: dividerMargin
  }), [dividerWidth, dividerHeight, dividerBackground, dividerMargin]);

  // Define animation variants
  const variants = {
    hidden: {
      y: reverseDirection ? finalY : initialY,
      opacity: opacityValues[0],
    },
    visible: shouldUseSimplifiedAnimations
      ? {
          y: finalY,
          opacity: 1,
          transition: {
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1.0],
          },
        }
      : {},
  };

  return (
    <motion.div 
      ref={containerRef}
      className={containerClasses}
      style={style}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
    >
      <div className="w-full">
        {children}
      </div>
      {showDivider && <div className={dividerClasses} style={dividerStyle} />}
    </motion.div>
  );
};

// Set display name for better debugging
ScrollingTextAnimation.displayName = 'ScrollingTextAnimation';

export default ScrollingTextAnimation;