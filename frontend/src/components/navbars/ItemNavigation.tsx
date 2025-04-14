'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useAnimation, AnimatePresence, AnimationControls } from 'framer-motion';
// Note: This import assumes PandaCSS is set up in your project environment.
// You might need to adjust the path based on your project structure.
import { css, cx } from "../../../styled-system/css";

// ==========================================================
// CUSTOM HOOKS
// ==========================================================

/**
 * Manages keyboard navigation for a grid layout
 * @param {object} options - Configuration options
 * @param {number} options.itemCount - Total number of items in the grid
 * @param {React.RefObject<HTMLDivElement | null>} options.gridContainerRef - Reference to the grid container element
 * @param {React.RefObject<(HTMLElement | null)[]>} options.itemRefs - Array of refs to item elements
 * @param {(index: number) => void} [options.onItemActivate] - Callback for when an item is activated via keyboard
 * @param {boolean} options.isScrolling - Whether the page is currently scrolling
 * @returns {object} - Keyboard navigation state and props
 */
const useKeyboardNavigation = ({
  itemCount,
  gridContainerRef,
  itemRefs,
  onItemActivate,
  isScrolling
}: {
  itemCount: number;
  gridContainerRef: React.RefObject<HTMLDivElement | null>;
  itemRefs: React.RefObject<(HTMLElement | null)[]>;
  onItemActivate?: (index: number) => void;
  isScrolling: boolean;
}) => {
  const [columnCount, setColumnCount] = useState(1);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [isKeyboardNavigating, setIsKeyboardNavigating] = useState(false);

  // Calculate grid geometry using ResizeObserver
  useEffect(() => {
    const gridElement = gridContainerRef.current;
    if (!gridElement) return;

    const calculateColumnCount = () => {
      // Try to get the first item's width to calculate columns
      const gridComputedStyle = window.getComputedStyle(gridElement);
      const gridTemplateColumns = gridComputedStyle.gridTemplateColumns;
      
      // If we can get direct column information from computed style
      if (gridTemplateColumns && gridTemplateColumns !== 'none') {
        // Count the number of columns defined in the grid
        return gridTemplateColumns.split(' ').length;
      }
      
      // Fallback: calculate based on container and item widths
      const firstItem = itemRefs.current?.[0];
      if (!firstItem) return 1; // Default to 1 if no items
      
      const containerWidth = gridElement.getBoundingClientRect().width;
      const itemWidth = firstItem.getBoundingClientRect().width;
      const gap = parseFloat(gridComputedStyle.gap) || 0;
      
      if (itemWidth > 0) {
        const columnsCount = Math.max(1, Math.floor((containerWidth + gap) / (itemWidth + gap)));
        return columnsCount;
      }
      
      return 1; // Default fallback
    };

    // Initial calculation
    setColumnCount(calculateColumnCount());

    // Set up observer for container size changes
    const observer = new ResizeObserver(() => {
      setColumnCount(calculateColumnCount());
    });

    observer.observe(gridElement);
    return () => observer.disconnect();
  }, [gridContainerRef, itemRefs]);

  // Handle focus management - updated to work with the new tabIndex model
  useEffect(() => {
    if (focusedIndex !== null && isKeyboardNavigating) {
      const targetElement = itemRefs.current?.[focusedIndex];
      if (!targetElement) return;
      
      // Check if the element already has focus to avoid unnecessary focus events
      const activeElement = document.activeElement;
      if (activeElement !== targetElement) {
        // Use requestAnimationFrame to ensure element is ready after render
        requestAnimationFrame(() => {
          targetElement?.focus({ preventScroll: false });
        });
      }
    }
  }, [focusedIndex, isKeyboardNavigating, itemRefs]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (isScrolling) return; // Prevent navigation during scroll

    const { key } = event;
    const validKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", " ", "Home", "End"];
    
    if (!validKeys.includes(key)) return;
    
    // Mark as keyboard interaction and prevent default behavior
    setIsKeyboardNavigating(true);
    event.preventDefault();
    
    let nextIndex = focusedIndex ?? 0; // Start from first item if nothing focused
    
    switch (key) {
      case "ArrowDown":
        nextIndex = Math.min(itemCount - 1, nextIndex + columnCount);
        break;
      case "ArrowUp":
        nextIndex = Math.max(0, nextIndex - columnCount);
        break;
      case "ArrowRight":
        // If at the end of a row, don't wrap to next row
        if ((nextIndex + 1) % columnCount !== 0 && nextIndex < itemCount - 1) {
          nextIndex++;
        }
        break;
      case "ArrowLeft":
        // If at the start of a row, don't wrap to previous row
        if (nextIndex % columnCount !== 0) {
          nextIndex--;
        }
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = itemCount - 1;
        break;
      case "Enter":
      case " ":
        if (focusedIndex !== null) {
          onItemActivate?.(focusedIndex);
          return; // Don't change focus on activation
        }
        break;
    }
    
    // Update focus if it changed and is valid
    if (nextIndex !== focusedIndex && nextIndex >= 0 && nextIndex < itemCount) {
      setFocusedIndex(nextIndex);
    }
  }, [focusedIndex, columnCount, itemCount, onItemActivate, isScrolling]);

  // Mouse interaction can disable keyboard navigation mode
  const handleMouseInteraction = useCallback(() => {
    setIsKeyboardNavigating(false);
  }, []);

  // Handle focus on container to initiate keyboard navigation
  const handleContainerFocus = useCallback((event: React.FocusEvent) => {
    // Only handle direct focus on container, not bubbled events
    if (event.target === gridContainerRef.current) {
      setIsKeyboardNavigating(true);
      // Focus first item if nothing is currently focused
      if (focusedIndex === null && itemCount > 0) {
        setFocusedIndex(0);
      }
    }
  }, [focusedIndex, itemCount, gridContainerRef]);

  return {
    focusedIndex,
    isKeyboardNavigating,
    columnCount,
    keyboardNavProps: {
      onKeyDown: handleKeyDown,
      onMouseDown: handleMouseInteraction,
      onFocus: handleContainerFocus,
      tabIndex: focusedIndex === null ? 0 : -1, // Make container focusable only when no item is focused
      role: "grid",
      "aria-colcount": columnCount,
      "aria-rowcount": Math.ceil(itemCount / columnCount)
    },
    // Method to reset keyboard navigation
    resetKeyboardNavigation: () => {
      setIsKeyboardNavigating(false);
      setFocusedIndex(null);
    }
  };
};

/**
 * Detects if the user is currently scrolling, with debouncing.
 * @param {number} [debounceMs=200] - Debounce time in milliseconds.
 * @returns {boolean} - True if the user is currently scrolling.
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
 * Media query hook - reusable for any breakpoint.
 * @param {string} query - The media query string (e.g., '(max-width: 768px)').
 * @returns {boolean} - True if the media query matches.
 */
const useMediaQuery = (query: string): boolean => {
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
 * Mobile detection hook using useMediaQuery.
 * @returns {boolean} - True if the viewport width is 768px or less.
 */
const useIsMobile = (): boolean => {
  return useMediaQuery('(max-width: 768px)');
};

/**
 * Checks if the user prefers reduced motion via media query.
 * @param {boolean} [override] - Optional override to force a specific return value.
 * @returns {boolean} - True if reduced motion is preferred or overridden, false otherwise.
 */
const useReducedMotion = (override?: boolean): boolean => {
    const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
    return override !== undefined ? override : prefersReducedMotion;
};


/**
 * Manages hover state and relative mouse position for an element.
 * @param {React.RefObject<HTMLDivElement | null>} ref - Ref to the target element.
 * @param {object} [options] - Configuration options.
 * @param {boolean} [options.isMobile=false] - Is the device mobile?
 * @param {boolean} [options.isScrolling=false] - Is the user scrolling?
 * @param {boolean} [options.disableHoverOnScroll=true] - Disable hover effects while scrolling?
 * @param {boolean} [options.trackMouseMoveOnMobile=false] - Track mouse movement on mobile?
 * @returns {{ isHovered: boolean; mousePosition: { x: number; y: number }; eventHandlers: object }} - Hover state, mouse position, and event handlers.
 */
const useItemHoverEffects = (
    ref: React.RefObject<HTMLDivElement | null>,
    options: {
        isMobile?: boolean;
        isScrolling?: boolean;
        disableHoverOnScroll?: boolean;
        trackMouseMoveOnMobile?: boolean;
    } = {}
) => {
  const {
    isMobile = false,
    isScrolling = false,
    disableHoverOnScroll = true,
    trackMouseMoveOnMobile = false,
  } = options;

  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = useCallback(() => {
    const blockHover = (isScrolling && disableHoverOnScroll);
    if (!blockHover) {
      setIsHovered(true);
    }
  }, [isScrolling, disableHoverOnScroll]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
      const blockTracking = !isHovered || (!trackMouseMoveOnMobile && isMobile) || !ref.current;
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
    [ isHovered, isMobile, trackMouseMoveOnMobile, ref, mousePosition.x, mousePosition.y ]
  );

  useEffect(() => {
    const shouldExitHover = (isScrolling && disableHoverOnScroll);
    if (isHovered && shouldExitHover) {
      setIsHovered(false);
      setMousePosition({ x: 0, y: 0 });
    }
  }, [isScrolling, disableHoverOnScroll, isHovered]);

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
 * useResponsiveValue Hook: Simplifies selecting a value based on a boolean condition.
 * @template T - The type of the value being selected.
 * @param {T} mobileValue - The value to use when the condition is true (e.g., isMobile).
 * @param {T} desktopValue - The value to use when the condition is false.
 * @param {boolean} isMobileCondition - The boolean condition to check.
 * @returns {T} - The selected value.
 */
function useResponsiveValue<T>(
  mobileValue: T,
  desktopValue: T,
  isMobileCondition: boolean
): T {
  return useMemo(() => {
    return isMobileCondition ? mobileValue : desktopValue;
  }, [mobileValue, desktopValue, isMobileCondition]);
}


/**
 * useItemAnimationVariants Hook: Calculates animation variant names based on mobile/scroll state.
 * @param {boolean} isMobile - Whether the component is currently in mobile view.
 * @param {boolean} isScrolling - Whether the user is currently scrolling.
 * @returns {{ animateVariant: string; hoverVariant: string | undefined }} - Object containing variant names.
 */
const useItemAnimationVariants = (isMobile: boolean, isScrolling: boolean) => {
  const animateVariant = useMemo(() => {
    const base = isMobile ? "visibleMobile" : "visible";
    return isMobile && isScrolling ? "staticMobile" : base;
  }, [isMobile, isScrolling]);

  const hoverVariant = useMemo(() => {
    const base = isMobile ? "hoverMobile" : "hover";
    return isScrolling ? undefined : base;
  }, [isMobile, isScrolling]);

  return { animateVariant, hoverVariant };
};

/**
 * Interface for useDynamicStyle hook options.
 */
interface UseDynamicStyleOptions {
  isHovered: boolean;
  mousePosition: { x: number; y: number };
  isMobile: boolean;
  isScrolling: boolean;
  config?: {
    baseHeight: string;
    baseTop: string;
    mobileHeight: string;
    mobileTop: string;
    desktopBaseHeight: number;
    desktopHeightRange: number;
    desktopMinTop: number;
    desktopMaxTop: number;
  };
}

/**
 * Interface for the returned styles from useDynamicStyle.
 */
interface TabStyles {
  height: string;
  top: string;
}

/**
 * Calculates dynamic CSS styles (height, top) for the golden tab indicator.
 * @param {UseDynamicStyleOptions} options - Input state and configuration.
 * @returns {TabStyles} - Calculated height and top CSS values.
 */
const useDynamicStyle = (
  options: UseDynamicStyleOptions
): TabStyles => {
  const {
    isHovered,
    mousePosition,
    isMobile,
    isScrolling,
    config = {
      baseHeight: '20%',
      baseTop: '40%',
      mobileHeight: '60%',
      mobileTop: '20%',
      desktopBaseHeight: 60,
      desktopHeightRange: 10,
      desktopMinTop: 15,
      desktopMaxTop: 85
    }
  } = options;

  return useMemo(() => {
    if (!isHovered || isScrolling) {
      return { height: config.baseHeight, top: config.baseTop };
    }
    if (isMobile) {
      return { height: config.mobileHeight, top: config.mobileTop };
    }
    const calculatedHeight = `${config.desktopBaseHeight + (mousePosition.y * config.desktopHeightRange)}%`;
    const effectiveHeight = parseFloat(calculatedHeight);
    const maxPossibleTop = config.desktopMaxTop - effectiveHeight;
    const rawPosition = Math.max(config.desktopMinTop, Math.min(maxPossibleTop, mousePosition.y * 100));
    return { height: calculatedHeight, top: `${rawPosition}%` };
  }, [ isHovered, mousePosition.y, isMobile, isScrolling, config ]);
};


/**
 * useItemInteraction Hook: Centralizes direct user interaction logic (hover, click).
 */
interface UseItemInteractionOptions {
  item: NavigationItem;
  onItemClick?: (item: NavigationItem) => void;
  ref: React.RefObject<HTMLDivElement | null>;
  isMobile: boolean;
  isScrolling: boolean;
}

interface UseItemInteractionResult {
  isHovered: boolean;
  mousePosition: { x: number; y: number };
  interactionProps: {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => void;
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => void;
    onMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
    onClick: (e: React.MouseEvent<HTMLElement>) => void;
  };
}

/**
 * Manages user interaction logic (hover, mouse tracking, click).
 * @param {UseItemInteractionOptions} options - Configuration and state.
 * @returns {UseItemInteractionResult} - Interaction state and event handlers.
 */
const useItemInteraction = (
  options: UseItemInteractionOptions
): UseItemInteractionResult => {
  const { item, onItemClick, ref, isMobile, isScrolling } = options;
  const router = useRouter();

  const { isHovered, mousePosition, eventHandlers } = useItemHoverEffects(
    ref,
    { isMobile, isScrolling, disableHoverOnScroll: true, trackMouseMoveOnMobile: false }
  );

  // Activation Logic (handles click only now)
  const handleActivation = useCallback(() => {
    if (isMobile && ref.current) {
      ref.current.style.transform = 'scale(0.98)';
      setTimeout(() => { if (ref.current) ref.current.style.transform = ''; }, 100);
      setTimeout(() => {
        if (onItemClick) onItemClick(item);
        else if (item.href) router.push(item.href);
      }, 100);
    } else {
      if (onItemClick) onItemClick(item);
      else if (item.href) router.push(item.href);
    }
  }, [item, onItemClick, router, isMobile, ref]);

  // Combine event handlers (onClick and hover handlers only)
  const interactionProps = useMemo(() => ({
    ...eventHandlers,
    onClick: handleActivation,
  }), [eventHandlers, handleActivation]);

  return {
    isHovered,
    mousePosition,
    interactionProps,
  };
};


/**
 * Interface for useConditionalAnimation hook options.
 */
interface UseConditionalAnimationOptions {
  controls: AnimationControls;
  initialAnimation: boolean;
  reducedMotionOverride?: boolean;
  isEnabled: boolean;
  variants: {
    enabled: string;
    disabled?: string;
    hidden: string;
  };
  triggerDependency?: any;
  delayMs?: number;
}

/**
 * Manages the conditional execution of an initial Framer Motion animation.
 * @param {UseConditionalAnimationOptions} options - Configuration for the animation.
 */
const useConditionalAnimation = (
    options: UseConditionalAnimationOptions
): void => {
  const {
    controls,
    initialAnimation,
    reducedMotionOverride,
    isEnabled,
    variants,
    triggerDependency,
    delayMs = 100,
  } = options;

  const motionIsReduced = useReducedMotion(reducedMotionOverride);

  useEffect(() => {
    const targetVariant = isEnabled ? variants.enabled : (variants.disabled ?? variants.enabled);
    let timerId: number | null = null;

    if (initialAnimation && !motionIsReduced) {
        timerId = window.setTimeout(() => { controls.start(targetVariant); }, delayMs);
    } else {
        controls.set(targetVariant);
    }

    return () => { if (timerId !== null) { window.clearTimeout(timerId); } };
  }, [ controls, initialAnimation, motionIsReduced, isEnabled, variants.enabled, variants.disabled, variants.hidden, triggerDependency, delayMs ]);
};


// ==========================================================
// ANIMATION VARIANTS (Framer Motion)
// ==========================================================

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
        scale: { 
          duration: 0.4, 
          ease: [0.25, 0.1, 0.25, 1.0] 
        }, 
        boxShadow: { 
          duration: 0.4, 
          ease: "easeOut" 
        } 
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
        opacity: { 
          duration: 0.2, 
          ease: "easeOut" 
        }, 
        scale: { 
          duration: 0.3, 
          ease: "easeOut" 
        },
      } 
    },
    staticMobile: { 
      y: 0, 
      opacity: 1, 
      scale: 1, 
      rotateX: '0deg', 
      transition: { 
        duration: 0 
      } 
    },
    hover: { 
      scale: 1.04, 
      boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.1)" 
    },
    hoverMobile: { 
      scale: 1.02 
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
        scale: { 
          type: "spring", 
          stiffness: 400, 
          damping: 10 
        }, 
        rotate: { 
          duration: 0.4, 
          ease: [0.34, 1.56, 0.64, 1] 
        } 
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
        opacity: { 
          duration: 0.8, 
          ease: [0.19, 1, 0.22, 1] 
        }, 
        scale: { 
          duration: 0.9, 
          ease: [0.34, 1.56, 0.64, 1] 
        } 
      } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.6, 
      transition: { 
        opacity: { 
          duration: 0.5, 
          ease: "easeOut" 
        }, 
        scale: { 
          duration: 0.5, 
          ease: "easeOut" 
        } 
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
      opacity: 0.9 
    },
    hover: { 
      height: '70%', 
      top: '15%', 
      opacity: 1, 
      transition: { 
        height: { 
          type: "spring", 
          stiffness: 300, 
          damping: 20, 
          duration: 0.5 
        }, 
        top: { 
          type: "spring", 
          stiffness: 300, 
          damping: 20, 
          duration: 0.5 
        }, 
        opacity: { 
          duration: 0.3 
        } 
      } 
    }
  },
  
  tabGlow: {
    initial: { 
      opacity: 0.2, 
      width: '100%', 
      height: '100%' 
    },
    hover: { 
      opacity: 0.4, 
      width: '100%', 
      height: '100%', 
      transition: { 
        opacity: { 
          duration: 0.3, 
          ease: "easeOut" 
        } 
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
        opacity: { 
          duration: 0.4, 
          ease: "easeOut" 
        }, 
        y: { 
          duration: 0.4, 
          ease: [0.19, 1, 0.22, 1] 
        } 
      } 
    }
  }
};

// ==========================================================
// STYLE DEFINITIONS (PandaCSS)
// ==========================================================

// Focus ring styles (color will be applied dynamically)
const focusRingStyles = css({
  outline: 'none',  // Outline will be applied via inline style
  position: 'relative',
  zIndex: '10',
  transform: 'translateY(-2px) scale(1.03)',
  transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
});

// Container styles
const containerStyle = css({
  width: '90%',
  margin: '0 auto',
  padding: '1.5rem 1rem',
  marginLeft: '2.5%',
  marginRight: '5%',
  '@media (min-width: 1400px)': {
    // No max-width clamp here, allowing horizontal expansion with 90% width
  },
  '@media (max-width: 640px)': {
    width: '95%',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: '1rem 0.5rem',
    maxWidth: '100%',
  },
});

// Title container styles
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

// Title styles
const titleStyle = css({
  fontFamily: 'var(--font-heading, "system-ui")',
  fontSize: 'clamp(1.5rem, 1.2rem + 1.5vw, 3rem)',
  fontWeight: '200',
  letterSpacing: '0.2em',
  color: 'primary',
  textTransform: 'uppercase',
  marginBottom: '0.5rem',
});

// Subtitle styles
const subtitleStyle = css({
  fontSize: 'clamp(0.875rem, 0.8rem + 0.5vw, 1.25rem)',
  color: 'textMuted',
  maxWidth: '700px',
  margin: '0 auto',
  lineHeight: '1.6',
});

// Grid container styles
const gridContainerStyle = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(1, minmax(120px, 1fr))',
  gap: '1.5rem',
  width: '100%',
  maxWidth: '100%',
  willChange: 'transform',
  transform: 'translateZ(0)',
  paddingBottom: '1.5rem',
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
    gridTemplateColumns: 'repeat(3, minmax(min(280px, 24vw), 1fr))',
    gap: 'clamp(1.5rem, calc(1.1rem + 0.8vw), 2rem)',
  },
});

// Card styles
const cardStyle = css({
  position: 'relative',
  backgroundColor: 'transparent',
  borderRadius: '12px',
  padding: '0.85rem 1rem',
  overflow: 'visible',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  minHeight: '54px',
  height: '54px',
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
  borderLeftWidth: '4px',
  outline: 'none',
  '@media (min-width: 1400px)': {
    padding: 'clamp(0.9rem, calc(0.6rem + 0.5vw), 1.1rem) clamp(1.25rem, calc(0.9rem + 0.6vw), 1.5rem)',
    minHeight: 'clamp(60px, calc(4px + 4vw), 100px)',
    height: 'clamp(60px, calc(4px + 4vw), 100px)',
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

// Solid card variant styles
const cardSolidStyle = css({
  background: 'backgroundAlt',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 6px 22px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.08)',
});

// Golden tab indicator styles
const goldenTabStyle = css({
  position: 'absolute',
  left: '10px',
  top: '40%',
  width: '4px',
  height: '20%',
  background: 'primary',
  borderTopRightRadius: '6px',
  borderBottomRightRadius: '6px',
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
    left: 'clamp(10px, calc(5px + 0.83vw), 15px)',
    width: 'clamp(4px, calc(3px + 0.167vw), 5px)',
  },

  '[data-hovered="true"] &': {
    boxShadow: '0 0 12px 3px rgba(var(--colors-primary), 0.4), 0 0 4px 1px rgba(var(--colors-primary), 0.6)',
    _before: {
      opacity: '0.7',
    },
  },
});


// Tab glow container styles
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

// Tab glow effect styles
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
  width: '26px',
  height: '26px',
  marginRight: '0.8rem',
  marginLeft: '1rem',
  color: 'primary',
  position: 'relative',
  zIndex: '2',
  '& svg': {
    width: '100%',
    height: '100%',
  },
  '@media (min-width: 1400px)': {
    width: 'clamp(28px, calc(20px + 1.33vw), 36px)',
    height: 'clamp(28px, calc(20px + 1.33vw), 36px)',
    marginRight: 'clamp(0.8rem, calc(0.6rem + 0.33vw), 1rem)',
    marginLeft: 'clamp(1rem, calc(0.8rem + 0.33vw), 1.2rem)',
  },
});

// Glow effect styles (for hover)
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
    width: '50%',
    height: '50%',
    borderRadius: '50%',
    filter: 'blur(20px)',
    background: 'currentColor',
    opacity: '0.4',
  },
});

// Text container styles
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
  fontSize: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.9rem)',
  fontWeight: '300',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'text',
  position: 'relative',
  zIndex: '2',
  '@media (min-width: 1400px)': {
    fontSize: 'clamp(0.9rem, calc(0.7rem + 0.33vw), 1.1rem)',
  }
});

// Description styles
const descriptionStyle = css({
  fontSize: 'clamp(0.65rem, 0.6rem + 0.25vw, 0.75rem)',
  color: 'textMuted',
  lineHeight: '1.4',
  maxWidth: '95%',
  position: 'absolute',
  top: '100%',
  left: '0',
  paddingTop: '0.3rem',
  zIndex: '2',
  '@media (min-width: 1400px)': {
    fontSize: 'clamp(0.75rem, calc(0.6rem + 0.25vw), 0.9rem)',
    paddingTop: 'clamp(0.3rem, calc(0.2rem + 0.167vw), 0.4rem)',
  },
  '@media (max-width: 640px)': {
    display: 'block',
  },
});


// ==========================================================
// TYPES & INTERFACES
// ==========================================================

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  description?: string;
  color?: string;
}

export interface ItemNavigationProps {
  items: NavigationItem[];
  title?: string;
  subtitle?: string;
  initialAnimation?: boolean;
  animationStagger?: number;
  onItemClick?: (item: NavigationItem) => void;
  className?: string;
  showSubtitle?: boolean;
  transparentCards?: boolean;
  reducedMotion?: boolean;
  showDescriptions?: boolean;
}

// ==========================================================
// ITEM COMPONENT
// ==========================================================

/**
 * Props for the Item component.
 */
interface ItemProps {
    item: NavigationItem;
    onItemClick?: (item: NavigationItem) => void;
    index: number;
    animationStagger: number;
    transparentCards: boolean;
    isMobile: boolean;
    isScrolling: boolean;
    showDescriptions?: boolean;
    // Focus/keyboard navigation related props
    isFocused?: boolean;
    isKeyboardNavigating?: boolean;
    registerRef?: (el: HTMLDivElement | null) => void;
}

/**
 * Item Component: Renders a single navigation item.
 */
const Item = React.memo((props: ItemProps) => {
  const {
    item,
    onItemClick,
    index,
    animationStagger,
    transparentCards,
    isMobile,
    isScrolling,
    showDescriptions,
    isFocused = false,
    isKeyboardNavigating = false,
    registerRef,
  } = props;

  // --- Refs ---
  const itemRef = useRef<HTMLDivElement>(null);
  // Track DOM focus state separate from keyboard navigation focus
  const [hasDomFocus, setHasDomFocus] = useState(false);
  
  // Determine if the item should show focus styles from either source
  const shouldShowFocusStyles = (isFocused && isKeyboardNavigating) || hasDomFocus;

  // Register ref with parent component if needed
  useEffect(() => {
    if (registerRef) {
      registerRef(itemRef.current);
    }
  }, [registerRef]);

  // Handle focus and blur events
  const handleFocus = useCallback(() => {
    setHasDomFocus(true);
  }, []);
  
  const handleBlur = useCallback(() => {
    setHasDomFocus(false);
  }, []);

  // --- Hooks ---
  const { isHovered, mousePosition, interactionProps } = useItemInteraction({
    item,
    onItemClick,
    ref: itemRef,
    isMobile,
    isScrolling,
  });
  const animationDelay = useResponsiveValue(index * (animationStagger / 2), index * animationStagger, isMobile);
  const tabStyles = useDynamicStyle({ isHovered, mousePosition, isMobile, isScrolling });
  
  // Determine if we should show hover effects
  const showHoverEffects = useMemo(() => 
    isHovered && !shouldShowFocusStyles && !isScrolling, 
    [isHovered, shouldShowFocusStyles, isScrolling]
  );
  
  // Calculate z-index based on hover/focus state
  const zIndex = useMemo(() => 
    (isHovered || shouldShowFocusStyles) ? 5 : 1, 
    [isHovered, shouldShowFocusStyles]
  );
  
  const { animateVariant, hoverVariant } = useItemAnimationVariants(isMobile, isScrolling);
  
  // Combine all interaction handlers
  const combinedInteractionProps = useMemo(() => ({
    ...interactionProps,
    onFocus: handleFocus,
    onBlur: handleBlur,
  }), [interactionProps, handleFocus, handleBlur]);

  // --- Render ---
  return (
    <motion.div
      variants={ANIMATIONS.item}
      initial="hidden"
      animate={animateVariant}
      whileHover={shouldShowFocusStyles ? undefined : hoverVariant}
      whileTap="tap"
      custom={animationDelay}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
      style={{
        transform: "translateZ(0)", backfaceVisibility: "hidden", transformOrigin: "center center",
        height: "auto", margin: "0", zIndex: zIndex
      }}
      layout
    >
      {/* Inner div: The actual card element */}
      <div
        ref={itemRef}
        className={cx(
            cardStyle,
            !transparentCards && cardSolidStyle,
            shouldShowFocusStyles && focusRingStyles,
            'navigation-item'
        )}
        style={{
            borderColor: item.color || 'var(--colors-primary)',
            borderLeftColor: item.color || 'var(--colors-primary)',
            // Apply dynamic focus ring styles when focused
            ...(shouldShowFocusStyles && {
              outline: `2px solid ${item.color || 'var(--colors-primary)'}`,
              boxShadow: `0 0 0 4px ${item.color ? `${item.color}40` : 'rgba(var(--colors-primary-rgb), 0.25)'}, 0 4px 16px rgba(0, 0, 0, 0.2)`,
              background: 'rgba(255, 255, 255, 0.08)',
            })
        }}
        {...combinedInteractionProps}
        data-hovered={isHovered}
        data-focused={shouldShowFocusStyles}
        tabIndex={0} // Make item naturally focusable for keyboard users
        role="gridcell"
        aria-selected={shouldShowFocusStyles}
      >
        {/* --- Internal Card Elements --- */}

        {/* Icon Glow */}
        <AnimatePresence>
          {!isScrolling && (showHoverEffects || shouldShowFocusStyles) && item.icon && (
            <motion.div
              className={glowEffectStyle}
              style={{ color: item.color || 'var(--colors-primary)' }}
              variants={ANIMATIONS.glow}
              initial="initial" animate="hover" exit="exit"
            />
          )}
        </AnimatePresence>

        {/* Golden Tab Indicator */}
        <motion.div
          className={goldenTabStyle}
          style={{ 
            background: item.color || 'var(--colors-primary)', 
            height: shouldShowFocusStyles ? '70%' : tabStyles.height, 
            top: shouldShowFocusStyles ? '15%' : tabStyles.top, 
          }}
          variants={ANIMATIONS.goldenTab}
          initial="initial" 
          animate={(showHoverEffects || shouldShowFocusStyles) ? "hover" : "initial"}
        />

        {/* Subtle Tab Edge Glow */}
        <div className={tabGlowContainerStyle} >
          <motion.div
            className={tabGlowStyle}
            style={{ background: item.color || 'var(--colors-primary)' }}
            variants={ANIMATIONS.tabGlow}
            initial="initial" 
            animate={(showHoverEffects || shouldShowFocusStyles) ? "hover" : "initial"}
          />
        </div>

        {/* Icon */}
        {item.icon && (
          <motion.div
            className={iconContainerStyle}
            style={{ color: item.color || 'var(--colors-primary)' }}
            variants={ANIMATIONS.icon}
            initial="initial" 
            animate={(showHoverEffects || shouldShowFocusStyles) ? "hover" : "initial"}
          >
            {item.icon}
          </motion.div>
        )}

        {/* Text Container */}
        <div className={textContainerStyle}>
          {/* Label */}
          <motion.div
            className={labelStyle}
            style={{ color: item.color || 'var(--colors-text)' }}
            variants={ANIMATIONS.label}
            initial="initial" 
            animate={(showHoverEffects || shouldShowFocusStyles) ? "hover" : "initial"}
          >
            {item.label}
          </motion.div>

          {/* Description */}
          {item.description && !isMobile && !isScrolling && (showHoverEffects || shouldShowFocusStyles) && showDescriptions && (
            <AnimatePresence>
              <motion.div
                className={descriptionStyle}
                style={{ color: item.color ? `${item.color}99` : 'var(--colors-textMuted)' }}
                variants={ANIMATIONS.description}
                initial="initial" animate="hover" exit="initial"
              >
                {item.description}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
});
Item.displayName = 'NavigationItem';

// ==========================================================
// MAIN COMPONENT (ItemNavigation)
// ==========================================================

/**
 * ItemNavigation Component: Renders a grid of navigation items.
 */
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
  reducedMotion = false,
  showDescriptions = false
}) => {
  // --- HOOKS ---
  const containerRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const router = useRouter();
  
  const isScrolling = useScrollDetection(200);
  const isMobile = useIsMobile();
  const gridControls = useAnimation();

  // Ensure the itemRefs array has the correct length
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, items.length);
    while (itemRefs.current.length < items.length) {
      itemRefs.current.push(null);
    }
  }, [items.length]);

  // Initialize keyboard navigation
  const { 
    focusedIndex, 
    isKeyboardNavigating, 
    keyboardNavProps,
    resetKeyboardNavigation
  } = useKeyboardNavigation({
    itemCount: items.length,
    gridContainerRef,
    itemRefs,
    onItemActivate: (index) => {
      const item = items[index];
      if (item) {
        if (onItemClick) {
          onItemClick(item);
        } else if (item.href) {
          router.push(item.href);
        }
      }
    },
    isScrolling
  });

  // Reset keyboard navigation when scrolling starts
  useEffect(() => {
    if (isScrolling) {
      resetKeyboardNavigation();
    }
  }, [isScrolling, resetKeyboardNavigation]);

  // Conditional Grid Animation
  useConditionalAnimation({
    controls: gridControls, 
    initialAnimation: initialAnimation, 
    reducedMotionOverride: reducedMotion,
    isEnabled: !isMobile, 
    variants: { enabled: "visible", disabled: "visibleMobile", hidden: "hidden" },
    triggerDependency: isMobile,
  });

  // Memoize Items Array
  const memoizedItems = useMemo(() => items, [items]);

  // Responsive Animation Stagger
  const itemAnimationStagger = useResponsiveValue(animationStagger / 3, animationStagger, isMobile);

  // Register individual item refs
  const registerItemRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    itemRefs.current[index] = el;
  }, []);

  // --- RENDER ---
  return (
    // Outermost container div
    <div
      className={cx(containerStyle, className)}
      ref={containerRef}
    >
      {/* Title and Subtitle Section */}
      {(title || (subtitle && showSubtitle)) && (
        <div className={titleContainerStyle}>
          {title && <h2 className={titleStyle}>{title}</h2>}
          {subtitle && showSubtitle && <p className={subtitleStyle}>{subtitle}</p>}
        </div>
      )}

      {/* Grid Container */}
      <motion.div
        ref={gridContainerRef}
        className={gridContainerStyle}
        variants={ANIMATIONS.grid}
        initial={initialAnimation ? "hidden" : (isMobile ? "visibleMobile" : "visible")}
        animate={gridControls}
        style={{ willChange: "transform, opacity", transform: "translateZ(0)", backfaceVisibility: "hidden" }}
        aria-label={title || "Navigation items"}
        {...keyboardNavProps}
      >
        {/* Map over items */}
        {memoizedItems.map((item, index) => {
          return (
            <Item
              key={item.id}
              item={item}
              onItemClick={onItemClick}
              index={index}
              animationStagger={itemAnimationStagger}
              transparentCards={transparentCards}
              isMobile={isMobile}
              isScrolling={isScrolling}
              showDescriptions={showDescriptions}
              isFocused={focusedIndex === index}
              isKeyboardNavigating={isKeyboardNavigating}
              registerRef={registerItemRef(index)}
            />
          );
        })}
      </motion.div>
    </div>
  );
};

export default ItemNavigation;