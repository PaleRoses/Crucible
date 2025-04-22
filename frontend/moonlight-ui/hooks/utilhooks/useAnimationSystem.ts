/**
 * Animation System Hook
 * 
 * This hook provides a comprehensive animation system for interactive components,
 * with special focus on responsive animations, accessibility (reduced motion),
 * and state-based animation variants.
 * 
 * It's designed to work with Framer Motion but can be adapted for other animation libraries.
 * This system helps create consistent animations across components while respecting
 * user preferences and device capabilities.
 * 
 * Examples of what you can do with this hook:
 * 
 * 1. Create state-aware animations (hover, focus, pressed states)
 * 2. Build responsive animations that adapt to mobile/desktop
 * 3. Create accessible animations that respect reduced motion preferences
 * 4. Handle element entrance/exit animations
 * 5. Manage complex animation sequences like expanding panels, nav items, etc.
 * 6. Create consistent timing and easing across your application
 */

import { useRef, useEffect, useMemo } from 'react';
import useMediaQuery from './useMediaQuery';

/**
 * Detects if the user prefers reduced motion
 * Can be overridden by passing a boolean value.
 * 
 * @param override - Optional boolean to override the user's preference
 * @returns Boolean indicating whether to reduce motion
 */
export const useReducedMotion = (override?: boolean): boolean => {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  return override !== undefined ? override : prefersReducedMotion;
};

/**
 * Options for useAnimationVariants hook
 */
export interface AnimationVariantsOptions {
  /** Whether motion should be reduced (via media query or override) */
  motionIsReduced?: boolean;
  /** Whether the component is displayed in a mobile context */
  isMobile?: boolean;
  /** Whether the page is currently scrolling */
  isScrolling?: boolean;
  /** Whether the component is currently focused */
  isFocused?: boolean;
  /** Whether initial animations should play on mount */
  initialAnimation?: boolean;
  /** Whether description content should be shown */
  showDescription?: boolean;
  /** Whether the component has a description that can be shown */
  hasDescription?: boolean;
}

/**
 * Result returned by useAnimationVariants hook
 */
export interface AnimationVariantsResult {
  /** Initial animation variant for the description element */
  descriptionInitialVariant: string;
  /** Animation variant for the main item */
  itemVariant: string;
  /** Animation variant for hover state (undefined if hover effects disabled) */
  hoverVariant: string | undefined;
}

/**
 * Determines the appropriate animation variants for components based on state and preferences
 * 
 * @example
 * // Simple usage
 * const { itemVariant, hoverVariant } = useAnimationVariants({ 
 *   motionIsReduced: false,
 *   isMobile: false
 * });
 *
 * @example
 * // With full options for a card with description
 * const { descriptionInitialVariant, itemVariant, hoverVariant } = useAnimationVariants({
 *   motionIsReduced: useReducedMotion(),
 *   isMobile: isMobileView,
 *   isScrolling: isPageScrolling,
 *   isFocused: isFocusVisible,
 *   initialAnimation: true,
 *   showDescription: isExpanded,
 *   hasDescription: !!item.description
 * });
 */
export const useAnimationVariants = (options: AnimationVariantsOptions): AnimationVariantsResult => {
  const {
    motionIsReduced = false, 
    isMobile = false, 
    isScrolling = false, 
    isFocused = false,
    initialAnimation = true, 
    showDescription = false, 
    hasDescription = false
  } = options;

  const isInitialRender = useRef(true);
  
  useEffect(() => {
    const timer = setTimeout(() => { isInitialRender.current = false; }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Determine the initial variant for description animations
  const descriptionInitialVariant = useMemo(() => {
    if (initialAnimation && !motionIsReduced && showDescription && hasDescription && isInitialRender.current) {
      return "initialVisible";
    }
    return "initial";
  }, [initialAnimation, motionIsReduced, showDescription, hasDescription]);

  // Determine the main item animation variant
  const itemVariant = useMemo(() => {
    if (motionIsReduced) return isMobile ? "staticMobile" : "visible";
    if (isScrolling) return isMobile ? "staticMobile" : "visible";
    return isMobile ? "visibleMobile" : "visible";
  }, [isMobile, isScrolling, motionIsReduced]);

  // Determine the hover animation variant (or disable it)
  const hoverVariant = useMemo(() => {
    if (motionIsReduced || isScrolling || isFocused) return undefined;
    return isMobile ? "hoverMobile" : "hover";
  }, [isMobile, isScrolling, motionIsReduced, isFocused]);

  return { descriptionInitialVariant, itemVariant, hoverVariant };
};

// Example default animation variants that work with this system
export const DEFAULT_ANIMATIONS = {
  item: {
    hidden: { 
      opacity: 0, 
      y: 0, 
      scale: 1, 
      rotateX: '0deg' 
    },
    visible: { 
      y: 0, 
      opacity: 1, 
      scale: 1, 
      rotateX: '0deg', 
      transition: { 
        duration: 0.4, 
        ease: [0.25, 0.1, 0.25, 1.0],
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
        } 
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
  // These are partial examples - additional animations would be defined for icons, 
  // descriptions, and other components as needed
  description: {
    initial: { 
      opacity: 0, 
      height: 0, 
      marginTop: 0 
    },
    initialVisible: { 
      opacity: 0, 
      height: 'auto', 
      marginTop: '0.7rem' 
    },
    visible: { 
      opacity: 1, 
      height: 'auto', 
      marginTop: '0.7rem', 
      transition: { 
        opacity: { duration: 0.4, ease: "easeOut" },
        height: { 
          duration: 0.35, 
          type: "spring", 
          stiffness: 300, 
          damping: 25 
        },
        marginTop: { duration: 0.3, ease: "easeOut" }
      } 
    },
    exit: { 
      opacity: 0, 
      height: 0, 
      marginTop: 0, 
      transition: { 
        opacity: { duration: 0.2, ease: "easeIn" },
        height: { duration: 0.25, ease: "easeIn" },
        marginTop: { duration: 0.2, ease: "easeIn" }
      } 
    }
  }
};