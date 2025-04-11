'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useAnimation, AnimatePresence, AnimationControls } from 'framer-motion'; // Import AnimationControls
import { css, cx } from "../../../styled-system/css"; // PandaCSS import

// ==========================================================
// CUSTOM HOOKS
// ==========================================================

/**
 * Detects if the user is currently scrolling, with debouncing.
 */
const useScrollDetection = (debounceMs: number = 200): boolean => {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(prev => !prev ? true : prev);
      if (scrollTimerRef.current !== null) {
        window.clearTimeout(scrollTimerRef.current);
      }
      scrollTimerRef.current = window.setTimeout(() => {
        setIsScrolling(false);
        scrollTimerRef.current = null;
      }, debounceMs);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimerRef.current !== null) {
        window.clearTimeout(scrollTimerRef.current);
        scrollTimerRef.current = null;
      }
    };
  }, [debounceMs]);

  return isScrolling;
};


/**
 * Media query hook - reusable for any breakpoint
 */
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia(query);
    const updateMatch = () => setMatches(media.matches);
    updateMatch();
    media.addEventListener('change', updateMatch);
    return () => media.removeEventListener('change', updateMatch);
  }, [query]);

  return matches;
};

/**
 * Mobile detection hook
 */
const useIsMobile = () => {
  return useMediaQuery('(max-width: 768px)');
};

/**
 * Checks if the user prefers reduced motion via media query.
 * @param {boolean} [override=false] - Optional override to force a specific return value.
 * @returns {boolean} - True if reduced motion is preferred or overridden, false otherwise.
 */
const useReducedMotion = (override?: boolean): boolean => {
    const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

    // Return the override if provided, otherwise return the media query result
    return override !== undefined ? override : prefersReducedMotion;
};


/**
 * Manages hover state and relative mouse position for an element.
 */
const useItemHoverEffects = (
    ref: React.RefObject<HTMLDivElement | null>,
    options: {
        isMobile?: boolean;
        isScrolling?: boolean;
        isDisabled?: boolean;
        disableHoverOnScroll?: boolean;
        trackMouseMoveOnMobile?: boolean;
    } = {}
) => {
  const {
    isMobile = false,
    isScrolling = false,
    isDisabled = false,
    disableHoverOnScroll = true,
    trackMouseMoveOnMobile = false,
  } = options;

  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = useCallback(() => {
    const blockHover = isDisabled || (isScrolling && disableHoverOnScroll);
    if (!blockHover) {
      setIsHovered(true);
    }
  }, [isDisabled, isScrolling, disableHoverOnScroll]);

  const handleMouseLeave = useCallback(() => {
    if (!isDisabled) {
      setIsHovered(false);
      setMousePosition({ x: 0, y: 0 });
    }
  }, [isDisabled]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
      const blockTracking = isDisabled || !isHovered || (!trackMouseMoveOnMobile && isMobile) || !ref.current;
      if (blockTracking) {
         if (mousePosition.x !== 0 || mousePosition.y !== 0) {
            setMousePosition({ x: 0, y: 0 });
         }
         return;
      }
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const normalizedX = Math.min(1, Math.max(0, x / rect.width));
      const normalizedY = Math.min(1, Math.max(0, y / rect.height));
      setMousePosition({ x: normalizedX, y: normalizedY });
    },
    [ isHovered, isMobile, isDisabled, trackMouseMoveOnMobile, ref, mousePosition.x, mousePosition.y ]
  );

  useEffect(() => {
    const shouldExitHover = isDisabled || (isScrolling && disableHoverOnScroll);
    if (isHovered && shouldExitHover) {
      setIsHovered(false);
      setMousePosition({ x: 0, y: 0 });
    }
  }, [isScrolling, isDisabled, disableHoverOnScroll, isHovered]);

  return {
    isHovered,
    mousePosition,
    eventHandlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onMouseMove: handleMouseMove,
    },
  };
};

/**
 * Interface for keyboard navigation hook options.
 */
interface UseKeyboardNavigationOptions {
  itemCount: number;
  debug?: boolean;
}

/**
 * Interface for the return value of the keyboard navigation hook.
 */
interface UseKeyboardNavigationResult {
  focusedIndex: number; // Expose focusedIndex
  containerProps: {
    onKeyDown: (event: React.KeyboardEvent) => void;
  };
  getItemProps: (index: number) => {
    ref: (element: HTMLElement | null) => void;
    tabIndex: 0 | -1;
  };
}

/**
 * Manages keyboard navigation (focus) within a list or grid.
 */
const useKeyboardNavigation = (
    options: UseKeyboardNavigationOptions
): UseKeyboardNavigationResult => {
  const { itemCount, debug = false } = options;
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const isInitializedRef = useRef<boolean>(false);

  // Initialize refs array when component mounts or itemCount changes
  useEffect(() => {
    // Initialize the refs array with the correct length
    if (itemRefs.current.length !== itemCount) {
      itemRefs.current = Array(itemCount).fill(null);
      isInitializedRef.current = true;
      if (debug) console.log('Keyboard navigation: Initialized refs array', { itemCount });
    }
  }, [itemCount, debug]);

  // Effect to reset focus if the focused item disappears
  useEffect(() => {
    if (focusedIndex >= itemCount) {
      setFocusedIndex(-1); // Reset if focused item index is out of bounds
      if (debug) console.log('Keyboard navigation: Reset focus index (out of bounds)');
    }
  }, [itemCount, focusedIndex, debug]);

  // More robust ref registration
  const registerRef = useCallback((index: number, element: HTMLElement | null) => {
    if (index >= 0 && index < itemCount) {
      if (element !== itemRefs.current[index]) {
        itemRefs.current[index] = element;
        if (debug) console.log(`Keyboard navigation: Registered ref for item ${index}`, { element });
      }
    }
  }, [itemCount, debug]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (itemCount === 0) return;
    const { key } = e;
    let nextIndex = focusedIndex;

    if (debug) console.log('Keyboard navigation: Key pressed', { key, currentFocus: focusedIndex });

    switch (key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        nextIndex = (focusedIndex === -1 || focusedIndex >= itemCount - 1) ? 0 : focusedIndex + 1;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        nextIndex = focusedIndex <= 0 ? itemCount - 1 : focusedIndex - 1;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = itemCount - 1;
        break;
      default:
        return;
    }

    if (nextIndex !== focusedIndex) {
      if (debug) console.log(`Keyboard navigation: Moving focus to index ${nextIndex}`);
      
      // Update state directly
      setFocusedIndex(nextIndex);
      
      // Immediately focus the element in a more reliable way
      setTimeout(() => {
        const nextElement = itemRefs.current[nextIndex];
        if (nextElement) {
          if (debug) console.log('Keyboard navigation: Focusing element', { nextElement });
          nextElement.focus({ preventScroll: false });
        } else if (debug) {
          console.warn(`Keyboard navigation: Element at index ${nextIndex} not found in refs`, itemRefs.current);
        }
      }, 0);
    }
  }, [itemCount, focusedIndex, debug]);

  // Enhanced props getter with better tabIndex handling
  const getItemProps = useCallback((index: number): { ref: (element: HTMLElement | null) => void; tabIndex: 0 | -1 } => {
    const isFirst = index === 0;
    const isFocused = focusedIndex === index;
    const tabIndex = (focusedIndex === -1 && isFirst) || isFocused ? 0 : -1;
    
    if (debug && isFocused) {
      console.log(`Keyboard navigation: Item ${index} has focus, tabIndex=${tabIndex}`);
    }
    
    return {
      ref: (element: HTMLElement | null) => registerRef(index, element),
      tabIndex,
    };
  }, [focusedIndex, registerRef, debug]);

  return {
    focusedIndex,
    containerProps: {
      onKeyDown: handleKeyDown,
    },
    getItemProps,
  };
};

/**
 * Interface for conditional animation hook options.
 */
interface UseConditionalAnimationOptions {
  controls: AnimationControls;
  initialAnimation: boolean;
  reducedMotionOverride?: boolean; // Prop to manually override reduced motion preference
  isEnabled: boolean; // Condition to use 'enabled' variant (vs 'disabled')
  variants: {
    enabled: string; // Variant name for the main animated state
    disabled?: string; // Optional variant name for the alternative state (e.g., mobile)
    hidden: string; // Variant name for the initial/hidden state
  };
  triggerDependency?: any; // Re-run effect if this changes
  delayMs?: number; // Delay before starting animation
}

/**
 * Manages the conditional execution of an initial Framer Motion animation
 * based on props, user preferences (reduced motion), and component state.
 * Uses the useReducedMotion hook internally.
 */
const useConditionalAnimation = (
    options: UseConditionalAnimationOptions
): void => {
  const {
    controls,
    initialAnimation,
    reducedMotionOverride, // Receive the override prop
    isEnabled,
    variants,
    triggerDependency,
    delayMs = 100,
  } = options;

  // Use the dedicated hook to check reduced motion preference, passing the override
  const motionIsReduced = useReducedMotion(reducedMotionOverride);

  useEffect(() => {
    const targetVariant = isEnabled
                            ? variants.enabled
                            : (variants.disabled ?? variants.enabled);

    let timerId: number | null = null;

    // Use the motionIsReduced value from the hook
    if (initialAnimation && !motionIsReduced) {
       timerId = window.setTimeout(() => {
            controls.start(targetVariant);
       }, delayMs);
    } else {
      // Set immediately if no initial animation or if motion is reduced
      controls.set(targetVariant);
    }

    return () => {
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
    };
  }, [
      controls, initialAnimation, motionIsReduced, isEnabled, // Use motionIsReduced from hook
      variants.enabled, variants.disabled, variants.hidden, // Use stable strings
      triggerDependency, delayMs
  ]);
};


// ==========================================================
// ANIMATION VARIANTS - REFORMATTED FOR READABILITY
// ==========================================================

// No changes needed to animation variants for scaling via CSS clamp()
const ANIMATIONS = {
  grid: {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1.0]
      }
    },
    visibleMobile: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    }
  },
  item: {
    hidden: {
      y: 15,
      opacity: 0,
      scale: 0.95,
      rotateX: '3deg',
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      rotateX: '0deg',
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1.0],
        scale: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] },
        boxShadow: { duration: 0.4, ease: "easeOut" }
      }
    },
    visibleMobile: {
      y: 0,
      opacity: 1,
      scale: 1,
      rotateX: '0deg',
      transition: {
        duration: 0.3,
        ease: "easeOut",
        opacity: { duration: 0.2, ease: "easeOut" },
        scale: { duration: 0.3, ease: "easeOut" },
      }
    },
    staticMobile: {
      y: 0,
      opacity: 1,
      scale: 1,
      rotateX: '0deg',
      transition: {
        duration: 0,
      }
    },
    hover: {
      scale: 1.04,
      boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.1)",
    },
    hoverMobile: {
      scale: 1.02,
    },
    tap: {
      scale: 0.97,
      transition: {
        duration: 0.1,
        ease: [0.19, 1, 0.22, 1]
      }
    }
  },
  icon: {
    initial: {
      scale: 1,
      rotate: 0
    },
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: {
        duration: 0.4,
        ease: [0.34, 1.56, 0.64, 1],
        scale: { type: "spring", stiffness: 400, damping: 10 },
        rotate: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
      }
    }
  },
  glow: {
    initial: {
      opacity: 0,
      scale: 0.6
    },
    hover: {
      opacity: 1,
      scale: 1,
      transition: {
        opacity: { duration: 0.8, ease: [0.19, 1, 0.22, 1] },
        scale: { duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }
      }
    },
    exit: {
      opacity: 0,
      scale: 0.6,
      transition: {
        opacity: { duration: 0.5, ease: "easeOut" },
        scale: { duration: 0.5, ease: "easeOut" }
      }
    }
  },
  label: {
    initial: {
      y: 0
    },
    hover: {
      y: -3,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  },
  goldenTab: {
    initial: {
      height: '20%',
      top: '40%',
      opacity: 0.9,
    },
    hover: {
      height: '70%',
      top: '15%',
      opacity: 1,
      transition: {
        height: { type: "spring", stiffness: 300, damping: 20, duration: 0.5 },
        top: { type: "spring", stiffness: 300, damping: 20, duration: 0.5 },
        opacity: { duration: 0.3 }
      }
    }
  },
  tabGlow: {
    initial: {
      opacity: 0.2,
      width: '100%',
      height: '100%',
    },
    hover: {
      opacity: 0.4,
      width: '100%',
      height: '100%',
      transition: {
        opacity: { duration: 0.3, ease: "easeOut" },
      }
    }
  },
  description: {
    initial: {
      opacity: 0,
      y: 5
    },
    hover: {
      opacity: 1,
      y: 0,
      transition: {
        opacity: { duration: 0.4, ease: "easeOut" },
        y: { duration: 0.4, ease: [0.19, 1, 0.22, 1] }
      }
    }
  }
};

// ==========================================================
// STYLE DEFINITIONS - UPDATED WITH clamp() FOR SCALING
// ==========================================================

// Define the desired focus style properties using css function
// Enhanced focus ring styles for better keyboard navigation visibility
const focusRingStyles = css({
  outline: 'none',
  boxShadow: '0 0 0 3px var(--colors-primary), 0 4px 12px rgba(0, 0, 0, 0.15)',
  borderColor: 'text',
  background: 'rgba(255, 255, 255, 0.1)',
  position: 'relative',
  zIndex: '10',
  transform: 'translateY(-2px) scale(1.02)',
  transition: 'all 0.2s ease-out',
});

// Container styles
const containerStyle = css({
  width: '90%', // Set base width
  // *** REMOVED maxWidth clamp for horizontal expansion ***
  margin: '0 auto',
  padding: '1.5rem 1rem', // Base padding, could be scaled if needed
  marginLeft: '2.5%',
  marginRight: '5%',
  '@media (min-width: 1400px)': {
     // *** REMOVED maxWidth clamp for horizontal expansion ***
     // No maxWidth needed here, width: 90% applies
  },
  '@media (max-width: 640px)': {
    width: '95%',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: '1rem 0.5rem',
    maxWidth: '100%', // Keep max-width for small screens to prevent overflow
  },
});

// Title container styles - Margins could be scaled if desired
const titleContainerStyle = css({
  marginLeft: '1rem',
  marginTop: '2.5rem',
  textAlign: 'left',
  marginBottom: '2.5rem',
  '@media (max-width: 640px)': {
    marginLeft: '0.5rem',
    marginTop: '1.5rem',
    marginBottom: '1.5rem',
  },
});

// Title styles - Adjusting clamp range slightly as per guide example
const titleStyle = css({
  fontFamily: 'var(--font-heading, "system-ui")',
  fontSize: 'clamp(1.5rem, 1.2rem + 1.5vw, 3rem)', // Increased max slightly
  fontWeight: '200',
  letterSpacing: '0.2em', // Could scale: clamp(0.15em, calc(...), 0.25em)
  color: 'primary',
  textTransform: 'uppercase',
  marginBottom: '0.5rem', // Could scale
});

// Subtitle styles - Adjusting clamp range slightly as per guide example
const subtitleStyle = css({
  fontSize: 'clamp(0.875rem, 0.8rem + 0.5vw, 1.25rem)', // Increased max slightly
  color: 'textMuted',
  maxWidth: '700px', // Keep max-width on subtitle for readability
  margin: '0 auto', // Centering the subtitle text block
  lineHeight: '1.6',
});

// Grid container styles
const gridContainerStyle = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(1, minmax(120px, 1fr))',
  gap: '1.5rem', // Base gap for smaller screens
  width: '100%', // Grid takes full width of its container
  maxWidth: '100%', // Ensure grid doesn't exceed container
  willChange: 'transform',
  transform: 'translateZ(0)',
  paddingBottom: '1.5rem', // Could scale this
  '@media (min-width: 640px)': {
    gridTemplateColumns: 'repeat(1, minmax(min(250px, 30vw), 1fr))',
    gap: '1.5rem',
  },
  '@media (min-width: 768px)': {
    gridTemplateColumns: 'repeat(2, minmax(min(220px, 30vw), 1fr))',
    gap: '1.5rem',
  },
  '@media (min-width: 1024px)': {
    gridTemplateColumns: 'repeat(3, minmax(min(250px, 22vw), 1fr))',
    gap: '1.5rem',
  },
  '@media (min-width: 1400px)': {
    // Base styles for 1400px (will be overridden by clamp below)
    gridTemplateColumns: 'repeat(3, minmax(min(280px, 24vw), 1fr))',
    // Apply clamp for gap scaling from 1.5rem (at 1400px) to 2rem (at 2000px)
    // Using the guide's example calculation
    gap: 'clamp(1.5rem, calc(1.1rem + 0.8vw), 2rem)',
  },
});

// Card styles
const cardStyle = css({
  position: 'relative',
  backgroundColor: 'transparent',
  borderRadius: '12px', // Could scale slightly: clamp(12px, calc(...), 16px)
  padding: '0.85rem 1rem', // Base padding
  overflow: 'visible',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  minHeight: '54px', // Base height for smaller screens
  height: '54px', // Base height for smaller screens
  textAlign: 'left',
  cursor: 'pointer',
  borderWidth: '0.1px',
  borderStyle: 'solid',
  borderColor: 'primary',
  boxShadow: 'rgba(0, 0, 0, 0.05) 0px 2px 6px 0px, rgba(27, 31, 35, 0.08) 0px 0px 0px 1px',
  willChange: 'transform, opacity, box-shadow',
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden',
  transformOrigin: 'center center',
  borderLeftWidth: '4px', // Base border
  outline: 'none',

  '@media (min-width: 1400px)': {
    // Apply clamp *here* to override the base values for > 1400px
    // Scale padding from 0.9rem 1.25rem (at 1400px) up to 1.1rem 1.5rem (at 2000px)
    // Note: Padding scaling kept the same as before, adjust if needed.
    padding: 'clamp(0.9rem, calc(0.6rem + 0.5vw), 1.1rem) clamp(1.25rem, calc(0.9rem + 0.6vw), 1.5rem)',

    // *** UPDATED HEIGHT SCALING ***
    // Scale height more aggressively: from 60px (at 1400px) up to 100px (at 2400px)
    // New preferred value calc(4px + 4vw) achieves this range.
    minHeight: 'clamp(60px, calc(4px + 4vw), 100px)',
    height: 'clamp(60px, calc(4px + 4vw), 100px)',

    // Scale border from 4px (at 1400px) up to 5px (at 2000px) - kept the same
    borderLeftWidth: 'clamp(4px, calc(3px + 0.167vw), 5px)',
  },
  '@media (max-width: 640px)': {
    padding: '0.75rem',
    minHeight: '50px',
    height: '50px',
    opacity: '1',
    borderWidth: '0.2px',
    borderLeftWidth: '4px',
    boxShadow: 'rgba(0, 0, 0, 0.05) 0px 1px 3px 0px',
  },
});

// Solid card variant styles - No scaling needed here
const cardSolidStyle = css({
  background: 'backgroundAlt',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 6px 22px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.08)',
});

// Golden tab indicator styles - Scaling position/size
const goldenTabStyle = css({
  position: 'absolute',
  left: '10px', // Base position
  top: '40%', // Base position (percentage based, might not need scaling)
  width: '4px', // Base width
  height: '20%', // Base height (percentage based)
  background: 'primary',
  borderTopRightRadius: '6px', // Optional scale
  borderBottomRightRadius: '6px', // Optional scale
  boxShadow: '0 0 6px 0 rgba(var(--colors-primary), 0.3)',
  transition: 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
  _before: {
    content: '""',
    position: 'absolute',
    left: '-2px',
    top: '-50%',
    width: '8px',
    height: '200%',
    background: 'linear-gradient(to bottom, transparent, var(--colors-primary), transparent)',
    opacity: '0.2',
    filter: 'blur(3px)',
    transition: 'opacity 0.5s ease',
  },

  '@media (min-width: 1400px)': {
    // Apply clamp for scaling above 1400px
    // Scale left from 10px (at 1400px) to 15px (at 2000px)
    // Using the guide's example calculation
    left: 'clamp(10px, calc(5px + 0.83vw), 15px)',
    // Scale width from 4px (at 1400px) to 5px (at 2000px)
    // Using the guide's example calculation
    width: 'clamp(4px, calc(3px + 0.167vw), 5px)',
    // Note: Scaling % heights/tops with clamp based on vw is less direct.
    // Keeping these percentage-based for now. Adjust if needed.
  },

  // Hover state - check if visual looks okay with scaling
  '[role="link"]:hover &, [role="button"]:hover &': {
    height: '70%',
    top: '15%',
    boxShadow: '0 0 12px 3px rgba(var(--colors-primary), 0.4), 0 0 4px 1px rgba(var(--colors-primary), 0.6)',
    _before: {
      opacity: '0.7',
    },
  },
});

// Tab glow container styles - No direct scaling needed
const tabGlowContainerStyle = css({
  position: 'absolute',
  left: '0px',
  top: '0',
  borderRadius: '8px',
  width: '20px',
  height: '100%',
  overflow: 'hidden',
  zIndex: '0',
});

// Tab glow effect styles - No direct scaling needed
const tabGlowStyle = css({
  position: 'absolute',
  left: '-5px',
  top: '0',
  width: '10px',
  height: '100%',
  background: 'var(--colors-primary)',
  filter: 'blur(8px)',
  opacity: '0.3',
  zIndex: '-1',
});

// Icon container styles
const iconContainerStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '26px', // Base size
  height: '26px', // Base size
  marginRight: '0.8rem', // Base margin
  marginLeft: '1rem', // Base margin
  color: 'primary',
  position: 'relative',
  zIndex: '2',
  '& svg': {
    width: '100%',
    height: '100%',
  },
  '@media (min-width: 1400px)': {
    // Apply clamp *here* for scaling > 1400px
    // Scale size from 28px (at 1400px) up to 36px (at 2000px)
    // Using the guide's example calculation
    width: 'clamp(28px, calc(20px + 1.33vw), 36px)',
    height: 'clamp(28px, calc(20px + 1.33vw), 36px)',
    // Scale margin from 0.8rem (at 1400px) up to 1rem (at 2000px)
    // Using the guide's example calculation
    marginRight: 'clamp(0.8rem, calc(0.6rem + 0.33vw), 1rem)',
    // Scale margin from 1rem (at 1400px) up to 1.2rem (at 2000px)
    // Using the guide's example calculation
    marginLeft: 'clamp(1rem, calc(0.8rem + 0.33vw), 1.2rem)',
  },
});

// Glow effect styles (for hover) - Check if blur/size needs adjustment
const glowEffectStyle = css({
  position: 'absolute',
  inset: '0',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
  zIndex: '10',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '50%', // Percentage based, should adapt to icon size
    height: '50%', // Percentage based, should adapt to icon size
    borderRadius: '50%',
    filter: 'blur(20px)', // Fixed blur, could be scaled if needed: clamp(20px, calc(...), 30px)
    background: 'currentColor',
    opacity: '0.4',
  },
});

// Text container styles - No direct scaling needed
const textContainerStyle = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  zIndex: '2',
  position: 'relative',
  overflow: 'visible',
  width: '100%',
});

// Label styles
const labelStyle = css({
  fontFamily: 'var(--font-heading, "system-ui")',
  // Base size uses clamp already
  fontSize: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.9rem)',
  fontWeight: '300',
  textTransform: 'uppercase',
  letterSpacing: '0.1em', // Could scale: clamp(0.1em, calc(...), 0.13em)
  color: 'text',
  position: 'relative',
  zIndex: '2',
  '@media (min-width: 1400px)': {
     // Apply extended clamp *here* for different scaling > 1400px
     // Scale from 0.9rem (at 1400px) to 1.1rem (at 2000px)
     // Using the guide's example calculation
     fontSize: 'clamp(0.9rem, calc(0.7rem + 0.33vw), 1.1rem)',
     // Optional: Scale letter spacing slightly
     // letterSpacing: 'clamp(0.1em, calc(0.05em + 0.08vw), 0.13em)',
  }
});

// Description styles
const descriptionStyle = css({
  // Base size uses clamp
  fontSize: 'clamp(0.65rem, 0.6rem + 0.25vw, 0.75rem)',
  color: 'textMuted',
  lineHeight: '1.4', // Keep line-height stable for readability
  maxWidth: '95%',
  position: 'absolute',
  top: '100%', // Positioning might need slight adjustment if parent height scales a lot
  left: '0',
  paddingTop: '0.3rem', // Base padding
  zIndex: '2',
  '@media (min-width: 1400px)': {
     // Apply extended clamp *here* for scaling > 1400px
     // Scale from 0.75rem (at 1400px) to 0.9rem (at 2000px)
     // Using the guide's example calculation
     fontSize: 'clamp(0.75rem, calc(0.6rem + 0.25vw), 0.9rem)',
     // Scale paddingTop from 0.3rem (at 1400px) to 0.4rem (at 2000px)
     // Using the guide's example calculation
     paddingTop: 'clamp(0.3rem, calc(0.2rem + 0.167vw), 0.4rem)',
  },
  '@media (max-width: 640px)': {
    display: 'block',
  },
});


// ==========================================================
// TYPES & INTERFACES (No changes needed)
// ==========================================================

export interface NavigationItem { id: string; label: string; href: string; icon?: React.ReactNode; description?: string; color?: string; }
export interface ItemNavigationProps { items: NavigationItem[]; title?: string; subtitle?: string; initialAnimation?: boolean; animationStagger?: number; onItemClick?: (item: NavigationItem) => void; className?: string; showSubtitle?: boolean; transparentCards?: boolean; ariaLabel?: string; reducedMotion?: boolean; showDescriptions?: boolean; }

// ==========================================================
// ITEM COMPONENT (No changes needed in component logic)
// ==========================================================

interface ItemProps {
    item: NavigationItem;
    onItemClick?: (item: NavigationItem) => void;
    index: number;
    animationStagger: number;
    transparentCards: boolean;
    isMobile: boolean;
    isScrolling: boolean;
    showDescriptions?: boolean;
    tabIndex?: 0 | -1;
    isFocused: boolean;
}

const Item = React.memo(React.forwardRef<HTMLDivElement, ItemProps>(({
  item,
  onItemClick,
  index,
  animationStagger,
  transparentCards,
  isMobile,
  isScrolling,
  showDescriptions,
  tabIndex,
  isFocused
}, ref) => {
  // --- State and Refs ---
  const itemHoverRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // --- Hooks ---
  const { isHovered, mousePosition, eventHandlers } = useItemHoverEffects(
      itemHoverRef,
      { isMobile, isScrolling }
  );

  // --- Memoized Calculations ---
  // These calculations should adapt correctly as the base CSS sizes change
  const animationDelay = useMemo(() => {
      return isMobile ? index * (animationStagger / 2) : index * animationStagger;
  }, [index, animationStagger, isMobile]);

  // Note: These tabHeight/tabTop calculations are percentage-based and might need
  // adjustment if the new card height scaling causes visual issues on hover.
  const tabHeight = useMemo(() => {
      if (!isHovered || isScrolling) return '20%';
      if (isMobile) return '60%';
      const baseHeight = 60;
      const variableHeight = 10;
      return `${baseHeight + (mousePosition.y * variableHeight)}%`;
  }, [isHovered, mousePosition.y, isMobile, isScrolling]);

  const tabTop = useMemo(() => {
      if (!isHovered || isScrolling) return '40%';
      if (isMobile) return '20%';
      const position = Math.max(15, Math.min(85 - parseFloat(tabHeight), mousePosition.y * 100));
      return `${position}%`;
  }, [isHovered, mousePosition.y, tabHeight, isMobile, isScrolling]);

  const itemAnimateVariant = useMemo(() => {
      return isMobile ? (isScrolling ? "staticMobile" : "visibleMobile") : "visible";
  }, [isMobile, isScrolling]);

  const itemHoverVariant = useMemo(() => {
      return isScrolling ? undefined : (isMobile ? "hoverMobile" : "hover");
  }, [isMobile, isScrolling]);

  // Container height is now controlled by clamp() in CSS, so this memo might be less critical
  // but doesn't hurt to keep for potential JS logic based on mobile state.
  const containerHeight = useMemo(() => {
      return isMobile ? "50px" : "auto"; // Use 'auto' on desktop as CSS clamp controls it
  }, [isMobile]);

  // --- Event Handlers ---
  const handleClick = useCallback(() => {
    if (isMobile) {
      if (itemHoverRef.current) {
          itemHoverRef.current.style.transform = 'scale(0.98)';
          setTimeout(() => { if(itemHoverRef.current) itemHoverRef.current.style.transform = ''; }, 100);
      }
      setTimeout(() => {
          if (onItemClick) onItemClick(item);
          else if (item.href) router.push(item.href);
      }, 100);
    } else {
      if (onItemClick) onItemClick(item);
      else if (item.href) router.push(item.href);
    }
  }, [item, onItemClick, router, isMobile]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
      }
      // Let other key events bubble up to the container for navigation
  };

  // --- Render ---
  return (
    // The motion.div itself doesn't need direct style changes for clamp,
    // as the inner div with cardStyle handles the sizing.
    // Setting height to 'auto' here allows the inner div's clamp() to dictate height.
    <motion.div
      variants={ANIMATIONS.item}
      initial="hidden"
      animate={itemAnimateVariant}
      whileHover={itemHoverVariant}
      whileTap="tap"
      custom={animationDelay}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
      style={{
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        transformOrigin: "center center",
        height: "auto", // Let inner div control height
        margin: "0",
        zIndex: isHovered ? 5 : 1
      }}
      layout // Keep layout animation enabled
    >
      <div
        ref={(node) => {
            // First register with keyboard navigation system for reliable focus
            if (typeof ref === 'function') {
                ref(node);
            } else if (ref) {
                ref.current = node;
            }
            // Then use for hover effects
            itemHoverRef.current = node;
        }}
        className={cx(
            cardStyle, // Base card styles (including updated clamp() for height)
            !transparentCards && cardSolidStyle,
            isFocused && focusRingStyles, // Conditional focus styles
            'navigation-item' // Add a class for easier debugging
        )}
        style={{
            // Use item color for border, respects the scaled borderLeftWidth
            borderColor: item.color || 'var(--colors-primary)',
            borderLeftColor: item.color || 'var(--colors-primary)',
        }}
        {...eventHandlers}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={tabIndex}
        role={item.href ? "link" : "button"}
        aria-label={item.label}
        aria-describedby={item.description ? `desc-${item.id}` : undefined}
      >
        {/* Inner elements: Glow, Tab, Icon, Text */}
        {/* These should position correctly within the scaled parent */}
        <AnimatePresence>
          {!isScrolling && isHovered && (
            <motion.div
              className={glowEffectStyle} // Includes potentially scaled blur/size
              style={{ color: item.color || 'var(--colors-primary)' }}
              variants={ANIMATIONS.glow}
              initial="initial"
              animate="hover"
              exit="exit"
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        <motion.div
          className={goldenTabStyle} // Includes scaled left/width
          style={{
            background: item.color || 'var(--colors-primary)',
            // Hover height/top are percentage-based, should adapt
            height: isHovered ? tabHeight : '20%',
            top: isHovered ? tabTop : '40%',
            // Left is now controlled by clamp() in CSS
          }}
          variants={ANIMATIONS.goldenTab}
          initial="initial"
          animate={isHovered ? "hover" : "initial"}
          aria-hidden="true"
        />

        <div className={tabGlowContainerStyle} aria-hidden="true">
          <motion.div
            className={tabGlowStyle}
            style={{ background: item.color || 'var(--colors-primary)' }}
            variants={ANIMATIONS.tabGlow}
            initial="initial"
            animate={isHovered ? "hover" : "initial"}
          />
        </div>

        {item.icon && (
          <motion.div
            className={iconContainerStyle} // Includes scaled size/margins
            style={{ color: item.color || 'var(--colors-primary)' }}
            variants={ANIMATIONS.icon}
            initial="initial"
            animate={isHovered && !isScrolling ? "hover" : "initial"}
            aria-hidden="true"
          >
            {item.icon}
          </motion.div>
        )}

        <div className={textContainerStyle}>
          <motion.div
            className={labelStyle} // Includes scaled font size
            style={{ color: item.color || 'var(--colors-text)' }}
            variants={ANIMATIONS.label}
            initial="initial"
            animate={isHovered && !isScrolling ? "hover" : "initial"}
            id={`label-${item.id}`}
          >
            {item.label}
          </motion.div>

          {/* Description appearance logic remains the same */}
          {/* Ensure description position updates correctly if card height changes significantly */}
          {item.description && !isMobile && !isScrolling && isHovered && showDescriptions && (
            <AnimatePresence>
              <motion.div
                className={descriptionStyle} // Includes scaled font size / padding top
                style={{ color: item.color ? `${item.color}99` : 'var(--colors-textMuted)' }}
                id={`desc-${item.id}`}
                variants={ANIMATIONS.description}
                initial="initial"
                animate="hover"
                exit="initial"
              >
                {item.description}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
}));
Item.displayName = 'NavigationItem';

// ==========================================================
// MAIN COMPONENT (Updated for better keyboard navigation)
// ==========================================================

const ItemNavigation: React.FC<ItemNavigationProps> = ({
  items,
  title,
  subtitle,
  initialAnimation = true,
  animationStagger = 0.05,
  onItemClick,
  className,
  showSubtitle = false,
  transparentCards = true,
  ariaLabel,
  reducedMotion = false,
  showDescriptions = false
}) => {
  // --- HOOKS ---
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useScrollDetection(200);
  const isMobile = useIsMobile();
  const gridControls = useAnimation();
  const [keyboardMode, setKeyboardMode] = useState(false);

  // Enable debug mode to troubleshoot keyboard navigation issues
  const { focusedIndex, containerProps, getItemProps } = useKeyboardNavigation({
    itemCount: items.length,
    debug: false // Set to true to enable console debugging
  });

  // Detect keyboard navigation mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setKeyboardMode(true);
      }
    };
    
    const handleMouseDown = () => {
      setKeyboardMode(false);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  useConditionalAnimation({
      controls: gridControls,
      initialAnimation: initialAnimation,
      reducedMotionOverride: reducedMotion,
      isEnabled: !isMobile,
      variants: {
          enabled: "visible",
          disabled: "visibleMobile",
          hidden: "hidden"
      },
      triggerDependency: isMobile,
  });

  // --- STATE & MEMOIZATION ---
  const memoizedItems = useMemo(() => items, [items]);

  // --- EFFECTS ---
  useEffect(() => {
    const handleResize = () => { /* Placeholder */ };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // --- RENDER ---
  return (
    <div
      className={cx(containerStyle, className)} // containerStyle now has no max-width clamp
      ref={containerRef}
      {...containerProps}
      role="navigation"
      aria-label={ariaLabel || title || "Navigation Menu"}
    >
      {(title || (subtitle && showSubtitle)) && (
        <div className={titleContainerStyle}>
           {/* Title/Subtitle styles now include adjusted clamp() */}
          {title && <h2 className={titleStyle} id="navigation-title">{title}</h2>}
          {subtitle && showSubtitle && <p className={subtitleStyle}>{subtitle}</p>} {/* Removed subtitle id */}
        </div>
      )}

      <motion.div
        className={gridContainerStyle} // gridContainerStyle now includes clamp() for gap
        variants={ANIMATIONS.grid}
        initial={initialAnimation ? "hidden" : (isMobile ? "visibleMobile" : "visible")}
        animate={gridControls}
        aria-labelledby={title ? "navigation-title" : undefined}
        // aria-describedby removed as subtitle id was removed
        style={{
            willChange: "transform, opacity",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden"
        }}
      >
        {memoizedItems.map((item, index) => {
          const itemNavProps = getItemProps(index);
          const isFocused = focusedIndex === index;
          return (
            // Item component receives same props, but its internal styles (cardStyle, etc.)
            // will now apply the updated clamp() scaling based on viewport width.
            <Item
              key={item.id}
              item={item}
              onItemClick={onItemClick}
              index={index}
              isFocused={isFocused}
              animationStagger={isMobile ? animationStagger / 3 : animationStagger}
              transparentCards={transparentCards}
              isMobile={isMobile}
              isScrolling={isScrolling}
              showDescriptions={showDescriptions}
              ref={itemNavProps.ref}
              tabIndex={itemNavProps.tabIndex}
            />
          );
        })}
      </motion.div>
    </div>
  );
};

export default ItemNavigation;