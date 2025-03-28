/**
 * @file ScrollAwareSpacer.tsx
 * @description A high-performance spacer component that handles scroll-aware behavior
 * for fixed elements like navigation bars while maintaining proper document flow.
 * 
 * This is not a navbar itself, but rather a wrapper that adds scroll behavior to any content
 * without affecting the visual styling.
 * 
 * @example
 * import { ScrollAwareSpacer } from './components/ScrollAwareSpacer';
 * import NavigationBar from './components/NavigationBar';
 * 
 * function App() {
 *   return (
 *     <>
 *       <ScrollAwareSpacer height={70}>
 *         <NavigationBar />
 *       </ScrollAwareSpacer>
 *       <main>Page content here</main>
 *     </>
 *   );
 * }
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - React nodes to be rendered inside the spacer
 * @param {number} [props.height=64] - Height of the spacer in pixels
 * @param {number} [props.topOffset=0] - Distance from the top of the viewport
 * @param {number} [props.zIndex=1000] - Z-index of the spacer for stacking context
 * @param {number} [props.transitionDuration=0.3] - Duration of show/hide animations in seconds
 * @param {boolean} [props.showOnScrollUp=true] - Whether to show the spacer when scrolling up
 * @param {boolean} [props.hideOnScrollDown=true] - Whether to hide the spacer when scrolling down past threshold
 * @param {number} [props.threshold=100] - Scroll distance in pixels before animations fully apply
 * @param {boolean} [props.shrinkOnScroll=false] - Whether to slightly shrink the spacer on scroll (disabled by default)
 * @param {boolean} [props.fadeOnScroll=true] - Whether to slightly fade the spacer on scroll
 * @param {string} [props.className=''] - Additional class names for the spacer
 * @param {React.CSSProperties} [props.style={}] - Additional inline styles for the spacer
 * @param {string} [props.spacerClassName=''] - Additional class names for the spacer element
 * @param {React.CSSProperties} [props.spacerStyle={}] - Additional inline styles for the spacer element
 * @param {boolean} [props.disableOnMobile=true] - Whether to use simplified behavior on mobile devices
 * @param {number} [props.mobileBreakpoint=768] - Screen width threshold in pixels for mobile detection
 */

import React, { useRef, useState, useMemo, memo, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';

/**
 * Props interface for the ScrollAwareSpacer component
 */
interface ScrollAwareSpacerProps {
  /** React nodes to be rendered inside the spacer */
  children: React.ReactNode;
  
  /** Height of the spacer in pixels */
  height?: number;
  
  /** Distance from the top of the viewport */
  topOffset?: number;
  
  /** Z-index of the spacer for stacking context */
  zIndex?: number;
  
  /** Duration of show/hide animations in seconds */
  transitionDuration?: number;
  
  /** Whether to show the spacer when scrolling up */
  showOnScrollUp?: boolean;
  
  /** Whether to hide the spacer when scrolling down past threshold */
  hideOnScrollDown?: boolean;
  
  /** Scroll distance in pixels before animations fully apply */
  threshold?: number;
  
  /** Whether to slightly shrink the spacer on scroll */
  shrinkOnScroll?: boolean;
  
  /** Whether to slightly fade the spacer on scroll */
  fadeOnScroll?: boolean;
  
  /** Additional class names for the spacer */
  className?: string;
  
  /** Additional inline styles for the spacer */
  style?: React.CSSProperties;
  
  /** Additional class names for the spacer element */
  spacerClassName?: string;
  
  /** Additional inline styles for the spacer element */
  spacerStyle?: React.CSSProperties;
  
  /** Whether to use simplified behavior on mobile devices */
  disableOnMobile?: boolean;
  
  /** Screen width threshold in pixels for mobile detection */
  mobileBreakpoint?: number;
}

/**
 * ScrollAwareSpacer component implementation
 * Memoized to prevent unnecessary re-renders
 */
const ScrollAwareSpacer = memo((props: ScrollAwareSpacerProps) => {
  const {
    children,
    height = 64,                              // Default height of 64px
    topOffset = 0,                            // Default to top of viewport
    zIndex = 1000,                            // High z-index to stay above content
    transitionDuration = 0.3,                 // Animation speed in seconds
    showOnScrollUp = true,                    // Show when scrolling up by default
    hideOnScrollDown = true,                  // Hide when scrolling down by default
    threshold = 100,                          // Scroll distance before animations fully apply
    shrinkOnScroll = false,                   // Disable shrink effect by default
    fadeOnScroll = true,                      // Enable fade effect by default
    className = '',                           // Optional additional classes
    style = {},                               // Optional additional styles
    spacerClassName = '',                     // Optional spacer classes
    spacerStyle = {},                         // Optional spacer styles
    disableOnMobile = true,                   // Use simplified version on mobile by default
    mobileBreakpoint = 768,                   // Default mobile breakpoint (tablets and smaller)
  } = props;
  
  // Base spacer styling (maintains document flow)
  const defaultSpacerStyle: React.CSSProperties = {
    height: `${height}px`,
    width: '100%',
    marginBottom: '0px',
  };
  
  // Merge default and custom spacer styles
  const combinedSpacerStyle = { ...defaultSpacerStyle, ...spacerStyle };
  
  // State to track if the device is mobile
  const [isMobile, setIsMobile] = useState<boolean>(false);
  // State for visibility - used by both mobile and desktop
  const [isVisible, setIsVisible] = useState<boolean>(true);
  // Refs to track scroll position - used by both
  const containerRef = useRef<HTMLDivElement>(null);
  const prevScrollY = useRef<number>(0);
  
  // Effect to detect mobile devices on mount and window resize
  useEffect(() => {
    const checkIfMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < mobileBreakpoint);
      }
    };
    
    // Check initially
    checkIfMobile();
    
    // Add resize listener if in browser
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkIfMobile);
      
      // Clean up
      return () => {
        window.removeEventListener('resize', checkIfMobile);
      };
    }
  }, [mobileBreakpoint]);
  
  // Effect for handling scroll on mobile
  useEffect(() => {
    if (isMobile && disableOnMobile) {
      const handleScroll = () => {
        if (typeof window === 'undefined') return;
        
        const currentScrollY = window.scrollY;
        
        // Skip if direction-based visibility is disabled
        if (!showOnScrollUp && !hideOnScrollDown) return;
        
        const direction = currentScrollY > prevScrollY.current ? "down" : "up";
        
        // Show when scrolling up if enabled
        if (direction === "up" && showOnScrollUp) {
          setIsVisible(true);
        } 
        // Hide when scrolling down past threshold if enabled
        else if (direction === "down" && hideOnScrollDown && currentScrollY > threshold) {
          setIsVisible(false);
        }
        
        // Save current position for next comparison
        prevScrollY.current = currentScrollY;
      };
      
      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isMobile, disableOnMobile, showOnScrollUp, hideOnScrollDown, threshold]);
  
  // Get scroll information from Framer Motion - always call this hook
  const { scrollY } = useScroll();
  
  // Create transforms based on scroll position - always call these hooks
  const opacityScrollEffect = useTransform(scrollY, [0, threshold], [1, 0.85]);
  const opacityNoEffect = useTransform(scrollY, [0, 1], [1, 1]);
  const scaleScrollEffect = useTransform(scrollY, [0, threshold], [1, 0.97]);
  const scaleNoEffect = useTransform(scrollY, [0, 1], [1, 1]);
  
  // Then use the values conditionally
  const opacity = fadeOnScroll ? opacityScrollEffect : opacityNoEffect;
  const scale = shrinkOnScroll ? scaleScrollEffect : scaleNoEffect;
  
  // Track scroll direction for showing/hiding behavior on desktop
  useMotionValueEvent(scrollY, "change", (latest) => {
    // Only apply this for desktop
    if (isMobile && disableOnMobile) return;
    
    // Skip if direction-based visibility is disabled
    if (!showOnScrollUp && !hideOnScrollDown) return;
    
    const previous = prevScrollY.current;
    const direction = latest > previous ? "down" : "up";
    
    // Show when scrolling up if enabled
    if (direction === "up" && showOnScrollUp) {
      setIsVisible(true);
    } 
    // Hide when scrolling down past threshold if enabled
    else if (direction === "down" && hideOnScrollDown && latest > threshold) {
      setIsVisible(false);
    }
    
    // Save current position for next comparison
    prevScrollY.current = latest;
  });
  
  // Memoized animation variants to prevent recalculation
  const variants = useMemo(() => ({
    visible: { 
      y: 0,
      transition: { duration: transitionDuration, ease: "easeOut" }
    },
    hidden: { 
      y: -height - 20, // Move above viewport to ensure it's hidden
      transition: { duration: transitionDuration, ease: "easeIn" }
    }
  }), [height, transitionDuration]);
  
  // Base container styling - designed for full-width navigation bars
  const defaultContainerStyle: React.CSSProperties = {
    position: 'fixed',
    top: topOffset,
    left: 0,
    width: '100%',
    height: `${height}px`,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    zIndex,
  };
  
  // Conditionally add will-change property only for desktop
  if (!isMobile || !disableOnMobile) {
    defaultContainerStyle.willChange = 'transform, opacity';
  }
  
  // Merge default and custom styles
  const combinedContainerStyle = { ...defaultContainerStyle, ...style };
  
  // Render different versions based on device type
  if (isMobile && disableOnMobile) {
    // Mobile version with simplified behavior
    return (
      <>
        {/* 
          Invisible spacer div that maintains document flow
          This ensures content below the spacer is properly pushed down
        */}
        <div 
          className={`scroll-aware-spacer ${spacerClassName}`}
          style={combinedSpacerStyle}
        />
        
        {/* 
          Simple container with CSS transitions for mobile
          This avoids performance-intensive Framer Motion animations
        */}
        <div
          className={`scroll-aware-spacer-container ${className}`}
          style={{
            ...combinedContainerStyle,
            top: isVisible ? topOffset : -height - 20,
            transition: `top ${transitionDuration}s ease`,
          }}
        >
          {children}
        </div>
      </>
    );
  }
  
  // Desktop version with full animations
  return (
    <>
      {/* 
        Invisible spacer div that maintains document flow
        This ensures content below the spacer is properly pushed down
      */}
      <div 
        className={`scroll-aware-spacer ${spacerClassName}`}
        style={combinedSpacerStyle}
      />
      
      {/* 
        Motion-enhanced container with scroll effects
        This is the visible element with all animations
      */}
      <motion.div
        ref={containerRef}
        className={`scroll-aware-spacer-container ${className}`}
        style={{
          ...combinedContainerStyle,
          opacity,
          scale,
        }}
        initial="visible"
        animate={isVisible ? "visible" : "hidden"}
        variants={variants}
        transition={{ duration: transitionDuration }}
      >
        {children}
      </motion.div>
    </>
  );
});

// Display name for React DevTools
ScrollAwareSpacer.displayName = 'ScrollAwareSpacer';

export default ScrollAwareSpacer;