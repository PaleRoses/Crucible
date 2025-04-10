'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { css, cx } from "../../../styled-system/css"; // PandaCSS import

// ==========================================================
// ANIMATION VARIANTS - ENHANCED
// ==========================================================

/**
 * Animation variants with improved transitions and mobile optimizations
 */
const ANIMATIONS = {
  grid: {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08, // Slightly faster stagger for a more fluid appearance
        delayChildren: 0.15,
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1.0]
      }
    },
    // New mobile variant with reduced animation complexity
    visibleMobile: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03, // Much faster stagger for mobile
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
      rotateX: '3deg', // Slight 3D rotation for more dynamic entry
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      rotateX: '0deg',
      transition: { // This transition will now apply when returning FROM hover
        duration: 0.4, // Slightly faster return
        ease: [0.25, 0.1, 0.25, 1.0], // Standard ease out
        // Explicitly define transitions for properties changed on hover
        scale: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] },
        boxShadow: { duration: 0.4, ease: "easeOut" }
      }
    },
    // New simplified mobile variant
    visibleMobile: {
      y: 0,
      opacity: 1,
      scale: 1,
      rotateX: '0deg',
      transition: { // This transition will now apply when returning FROM hover (mobile)
        duration: 0.3, // Faster duration for mobile
        ease: "easeOut", // Simpler easing function
        opacity: { duration: 0.2, ease: "easeOut" },
        // Explicitly define transitions for properties changed on hover (mobile)
        scale: { duration: 0.3, ease: "easeOut" },
      }
    },
    // No animation during scrolling for better performance
    staticMobile: {
      y: 0,
      opacity: 1,
      scale: 1, // Ensure scale is explicitly 1
      rotateX: '0deg',
      transition: {
        duration: 0, // No duration = no animation
      }
    },
    hover: {
      // y: -6, // Removed y translation to prevent layout shift
      scale: 1.04,
      boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.1)",
      // Removed specific transition block - will use 'visible' transition on exit
    },
    // Simpler hover for mobile
    hoverMobile: {
      // y: -2, // Removed y translation
      scale: 1.02, // Reduced scale
      // Removed specific transition block - will use 'visibleMobile' transition on exit
    },
    tap: {
      scale: 0.97,
      // y: -2, // Removed y translation
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
      scale: 1.1, // Ensure scale increases
      rotate: 5, // Slight rotation for more playful effect
      transition: { // Keep icon transition specific if desired
        duration: 0.4,
        ease: [0.34, 1.56, 0.64, 1], // Elastic easing for bounce effect
        scale: { type: "spring", stiffness: 400, damping: 10 },
        rotate: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
      }
    }
  },

  // Updated glow animation to work with the new pseudo-element approach and include exit animation
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
      y: -3, // Keep label lift as it doesn't affect layout much
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  },

  // Removed the shine effect animation completely
  shine: {
    initial: {
      opacity: 0,
    },
    hover: {
      opacity: 0, // Keep it invisible
      transition: {
        duration: 0.1,
      },
    },
  },

  // New animation for the golden tab
  goldenTab: {
    initial: {
      height: '20%',
      top: '40%',
      opacity: 0.9,
    },
    hover: {
      height: '70%', // Expand more dramatically
      top: '15%', // Position higher for better visual impact
      opacity: 1,
      transition: {
        height: { type: "spring", stiffness: 300, damping: 20, duration: 0.5 },
        top: { type: "spring", stiffness: 300, damping: 20, duration: 0.5 },
        opacity: { duration: 0.3 }
      }
    }
  },

  // Simplified tab glow animation - no pulsing, single color
  tabGlow: {
    initial: {
      opacity: 0.2,
      width: '100%',
      height: '100%',
    },
    hover: {
      opacity: 0.4, // Fixed opacity, no animation
      width: '100%',
      height: '100%',
      transition: {
        opacity: { duration: 0.3, ease: "easeOut" },
      }
    }
  },

  // Modified animation for description text - no height animation to prevent layout shifts
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
// STYLE DEFINITIONS - ENHANCED
// ==========================================================

// Container styles
const containerStyle = css({
  width: '90%',
  maxWidth: 'min(95vw, 2200px)',
  margin: '0 auto',
  padding: '1.5rem 1rem',
  marginLeft: '2.5%',
  marginRight: '5%',

  '@media (min-width: 1400px)': {
    maxWidth: 'min(90vw, 2200px)'
  },

  '@media (max-width: 640px)': {
    width: '95%',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: '1rem 0.5rem'
  }
});

const titleContainerStyle = css({
  marginLeft: '1rem',
  marginTop: '2.5rem',
  textAlign: 'left',
  marginBottom: '2.5rem',

  '@media (max-width: 640px)': {
    marginLeft: '0.5rem',
    marginTop: '1.5rem',
    marginBottom: '1.5rem'
  }
});

const titleStyle = css({
  fontFamily: 'var(--font-heading, "system-ui")',
  fontSize: 'clamp(1.5rem, 1.2rem + 1.5vw, 2.5rem)',
  fontWeight: '200',
  letterSpacing: '0.2em',
  color: 'primary',
  textTransform: 'uppercase',
  marginBottom: '0.5rem'
});

const subtitleStyle = css({
  fontSize: 'clamp(0.875rem, 0.8rem + 0.5vw, 1.125rem)',
  color: 'textMuted',
  maxWidth: '700px',
  margin: '0 auto',
  lineHeight: '1.6'
});

  // Mobile optimized grid container style with improved spacing to prevent layout shifts
const gridContainerStyle = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(1, minmax(120px, 1fr))', // Default for smallest screens
  gap: '1.5rem',
  width: '100%',
  maxWidth: '100%',
  willChange: 'transform', // Hardware acceleration hint for smoother animations
  transform: 'translateZ(0)', // Force GPU rendering
  
  // Add padding at the bottom to account for description overflow
  paddingBottom: '1.5rem',

  '@media (min-width: 640px)': {
    gridTemplateColumns: 'repeat(1, minmax(min(250px, 30vw), 1fr))',
    gap: '1.5rem'
  },

  '@media (min-width: 768px)': {
    gridTemplateColumns: 'repeat(2, minmax(min(220px, 30vw), 1fr))',
    gap: '1.5rem'
  },

  '@media (min-width: 1024px)': {
    gridTemplateColumns: 'repeat(3, minmax(min(250px, 22vw), 1fr))',
    gap: '1.5rem'
  },

  '@media (min-width: 1400px)': {
    gridTemplateColumns: 'repeat(3, minmax(min(280px, 24vw), 1fr))',
    gap: '1.5rem'
  }
});

// Enhanced card style with fixed height to prevent layout shifts
const cardStyle = css({
  position: 'relative',
  backgroundColor: 'transparent',
  borderRadius: '12px', // Slightly larger border radius for modern look
  padding: '0.85rem 1rem',
  overflow: 'visible', // Changed to visible to allow description to overflow without shifting layout
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  minHeight: '54px',
  height: '54px', // Fixed height to prevent layout shifts
  textAlign: 'left',
  cursor: 'pointer',
  // Removed transition here, will rely on motion component transitions
  // transition: 'all 0.45s cubic-bezier(0.19, 1, 0.22, 1)',
  borderWidth: '0.1px',
  borderStyle: 'solid',
  borderColor: 'primary',
  boxShadow: 'rgba(0, 0, 0, 0.05) 0px 2px 6px 0px, rgba(27, 31, 35, 0.08) 0px 0px 0px 1px',
  willChange: 'transform, opacity, box-shadow', // Added box-shadow
  transform: 'translateZ(0)', // Force GPU rendering
  backfaceVisibility: 'hidden', // Prevent flickering on some mobile browsers
  transformOrigin: 'center center', // Ensure scaling happens from center

  // Modified to have tab-like left border
  borderLeftWidth: '4px',

  // Focus styles
  _focusVisible: {
    outline: 'none',
    boxShadow: '0 0 0 3px var(--colors-primary), 0 4px 8px rgba(0, 0, 0, 0.1)',
    borderColor: 'text',
    background: 'rgba(255, 255, 255, 0.07)'
  },

  '@media (min-width: 1400px)': {
    padding: '0.9rem 1.25rem',
    minHeight: '60px',
    height: '60px', // Fixed height for larger screens
  },

  '@media (max-width: 640px)': {
    padding: '0.75rem',
    minHeight: '50px',
    height: '50px', // Fixed height for mobile
    opacity: '1',
    borderWidth: '0.2px',
    borderLeftWidth: '4px',
    boxShadow: 'rgba(0, 0, 0, 0.05) 0px 1px 3px 0px',
  }
});

// Enhanced solid card variant
const cardSolidStyle = css({
  background: 'backgroundAlt',
  backdropFilter: 'blur(10px)', // Increased blur for more depth
  boxShadow: '0 6px 22px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.08)',
});

// Enhanced golden tab style - more dynamic and interactive (with left offset)
const goldenTabStyle = css({
  position: 'absolute',
  left: '10px', // Maintaining the original left offset as mentioned
  top: '40%',
  width: '4px', // Slightly thicker for better visibility
  height: '20%',
  background: 'primary',
  borderTopRightRadius: '6px', // More rounded caps
  borderBottomRightRadius: '6px',

  // Enhanced properties
  boxShadow: '0 0 6px 0 rgba(var(--colors-primary), 0.3)', // Stronger ambient glow
  transition: 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)', // Spring-like transition

  // Pseudo-element for additional glow
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

  // Enhanced hover state
  '[role="link"]:hover &, [role="button"]:hover &': {
    height: '70%',
    top: '15%',
    boxShadow: '0 0 12px 3px rgba(var(--colors-primary), 0.4), 0 0 4px 1px rgba(var(--colors-primary), 0.6)', // Intensified glow

    _before: {
      opacity: '0.7',
    }
  }
});

// New tab glow container
const tabGlowContainerStyle = css({
  position: 'absolute',
  left: '0px', // Match the golden tab position
  top: '0',
  borderRadius: '8px',
  width: '20px',
  height: '100%',
  overflow: 'hidden',
  zIndex: '0',
});

// Tab glow effect style
const tabGlowStyle = css({
  position: 'absolute',
  left: '-5px',
  top: '0',
  width: '10px',
  height: '100%',
  background: 'var(--colors-primary)', // Solid color
  filter: 'blur(8px)',
  opacity: '0.3',
  zIndex: '-1',
});

// Enhanced icon container style
const iconContainerStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '26px',
  height: '26px',
  marginRight: '0.8rem',
  marginLeft: '1rem', // Slightly more margin for better spacing with enhanced tab
  color: 'primary',
  position: 'relative', // For positioning the glow effect
  zIndex: '2', // Ensure it's above the glow

  '& svg': {
    width: '100%',
    height: '100%'
  },

  '@media (min-width: 1400px)': {
    width: '28px',
    height: '28px'
  }
});

// Completely redesigned glow effect with explicit positioning
const glowEffectStyle = css({
  position: 'absolute',
  inset: '0', // Covers the entire card
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
  }
});

// Shine effect style - for the diagonal shine animation (fixed gradient)
const shineEffectStyle = css({
  position: 'absolute',
  top: '-50%',
  left: '-100%',
  width: '60%',
  height: '200%',
  background: 'rgba(255, 255, 255, 0.1)', // Solid color instead of gradient
  transform: 'rotate(25deg)', // Diagonal angle
  zIndex: '1',
  pointerEvents: 'none', // Ensure it doesn't interfere with interactions
});

// Text container style - modified to handle absolutely positioned description
const textContainerStyle = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  zIndex: '2',
  position: 'relative',
  overflow: 'visible', // Changed to visible to allow description to be visible outside container
  width: '100%', // Ensure it takes full width for proper description positioning
});

  // Enhanced label style - no spring physics for text
const labelStyle = css({
  fontFamily: 'var(--font-heading, "system-ui")',
  fontSize: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.9rem)',
  fontWeight: '300',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'text',
  position: 'relative', // For the shine effect to be positioned relative to this
  zIndex: '2',
  // No letter-spacing transition to avoid spring physics on text
});

// Enhanced description style - absolutely positioned to prevent layout shifts
const descriptionStyle = css({
  fontSize: 'clamp(0.65rem, 0.6rem + 0.25vw, 0.75rem)',
  color: 'textMuted',
  lineHeight: '1.4',
  maxWidth: '95%', // Slightly wider
  position: 'absolute', // Changed to absolute to prevent layout shifts
  top: '100%',        // Position below the label
  left: '0',
  paddingTop: '0.3rem',
  zIndex: '2',

  '@media (max-width: 640px)': {
    display: 'block',
  }
});

// ==========================================================
// TYPES & INTERFACES
// ==========================================================

/**
 * Navigation item interface
 */
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  description?: string;
  color?: string;
}

/**
 * Props for the ItemNavigation component
 */
export interface ItemNavigationProps {
  items: NavigationItem[];
  title?: string;
  subtitle?: string;
  columns?: number;
  mobileColumns?: number;
  tabletColumns?: number;
  gapSize?: number;
  initialAnimation?: boolean;
  animationStagger?: number;
  onItemClick?: (item: NavigationItem) => void;
  className?: string;
  showSubtitle?: boolean;
  transparentCards?: boolean;
  ariaLabel?: string;
  reducedMotion?: boolean;
  showDescriptions?: boolean; // New prop to control description visibility
}

// ==========================================================
// CUSTOM HOOKS
// ==========================================================

/**
 * Media query hook - reusable for any breakpoint
 * Returns whether the current viewport matches the provided query
 */
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Avoid referencing window during SSR
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    const updateMatch = () => setMatches(media.matches);

    // Initial check
    updateMatch();

    // Add listener - using addEventListener for better compatibility
    media.addEventListener('change', updateMatch);

    // Cleanup
    return () => media.removeEventListener('change', updateMatch);
  }, [query]);

  return matches;
};

/**
 * Mobile detection hook - properly placed within component structure
 * Detects if the current viewport is mobile sized
 */
const useIsMobile = () => {
  return useMediaQuery('(max-width: 768px)');
};

// ITEM COMPONENT - ENHANCED
// ==========================================================

interface ItemProps {
  item: NavigationItem;
  onItemClick?: (item: NavigationItem) => void;
  index: number;
  animationStagger: number;
  transparentCards: boolean;
  isFocused?: boolean;
  isMobile: boolean; // Add isMobile as a prop instead of using the hook
  isScrolling: boolean; // Add scrolling state for mobile optimization
  showDescriptions?: boolean; // New prop to control description visibility
}

// Enhanced Item component with better animations and interactivity
const Item = React.memo(React.forwardRef<HTMLElement, ItemProps>(({
  item,
  onItemClick,
  index,
  animationStagger,
  transparentCards,
  isFocused,
  isMobile, // Use the passed prop instead of the hook
  isScrolling,
  showDescriptions // Added this prop to fix TypeScript error
}, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isMobileViewport = useMediaQuery('(max-width: 640px)');

  // Effect-based detection for touch devices - runs once on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(touchDevice);
    }
  }, []);

  // Calculate staggered animation delay
  const animationDelay = useMemo(() => {
    // Reduce animation delay for mobile to prevent flickering during scrolling
    return isMobile ? index * (animationStagger / 2) : index * animationStagger;
  }, [index, animationStagger, isMobile]);

  // Handle mouse movement for dynamic effects
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || !itemRef.current) return; // Skip on mobile for better performance

    const rect = itemRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element
    const y = e.clientY - rect.top; // y position within the element

    // Calculate normalized position (0 to 1)
    const normalizedX = x / rect.width;
    const normalizedY = y / rect.height;

    setMousePosition({ x: normalizedX, y: normalizedY });
  }, [isMobile]);

  // Handle hover events - Disable hover effect if scrolling
  const handleMouseEnter = useCallback(() => {
    if (!isScrolling) { // Only set hover if not scrolling
        setIsHovered(true);
    }
  }, [isScrolling]); // Depend on isScrolling

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // If scrolling starts while hovered, explicitly exit hover state
  useEffect(() => {
      if (isScrolling) {
          setIsHovered(false);
      }
  }, [isScrolling]);


  // Handle item click
  const handleClick = useCallback(() => {
    // Add a touch feedback for mobile
    if (isMobile) {
      setIsHovered(true);
      // Add a small delay for touch feedback
      setTimeout(() => {
        if (onItemClick) {
          onItemClick(item);
        } else if (item.href) {
          router.push(item.href);
        }
        // Reset hover state after navigation
        setTimeout(() => setIsHovered(false), 50); // Reduced timeout for mobile
      }, 100); // Reduced timeout for mobile
    } else {
      if (onItemClick) {
        onItemClick(item);
      } else if (item.href) {
        router.push(item.href);
      }
    }
  }, [item, onItemClick, router, isMobile]);

  // Calculate dynamic tab height based on mouse position
  const tabHeight = useMemo(() => {
    if (!isHovered || isScrolling) return '20%'; // Keep tab minimal if scrolling or not hovered

    // Simplified calculation for mobile
    if (isMobile) return '60%';

    // Make the tab height respond to mouse Y position - limited effect to preserve design
    const baseHeight = 60; // Base height percentage
    const variableHeight = 10; // Reduced additional height based on mouse position
    return `${baseHeight + (mousePosition.y * variableHeight)}%`;
  }, [isHovered, mousePosition.y, isMobile, isScrolling]); // Added isScrolling dependency

  // Calculate dynamic tab position based on mouse position
  const tabTop = useMemo(() => {
    if (!isHovered || isScrolling) return '40%'; // Keep tab minimal if scrolling or not hovered

    // Simplified calculation for mobile
    if (isMobile) return '20%';

    // Center the tab around the mouse Y position, with constraints
    const position = Math.max(15, Math.min(85 - parseFloat(tabHeight), mousePosition.y * 100));
    return `${position}%`;
  }, [isHovered, mousePosition.y, tabHeight, isMobile, isScrolling]); // Added isScrolling dependency

  // Determine the correct animation variant based on mobile and scrolling states
  const itemAnimateVariant = useMemo(() => {
    if (isMobile) {
      return isScrolling ? "staticMobile" : "visibleMobile";
    }
    return "visible";
  }, [isMobile, isScrolling]);

  // Determine the correct hover variant, disabling hover during scroll
  const itemHoverVariant = useMemo(() => {
      if (isScrolling) return undefined; // No hover effect during scroll
      return isMobile ? "hoverMobile" : "hover";
  }, [isMobile, isScrolling]);
  
  // Set a fixed container height for layout stability
  const containerHeight = useMemo(() => {
    if (isMobile) {
      return isMobileViewport ? "50px" : "54px";
    }
    return "54px";
  }, [isMobile, isMobileViewport]);


  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      variants={ANIMATIONS.item}
      initial="hidden"
      animate={itemAnimateVariant} // Use memoized variant
      whileHover={itemHoverVariant} // Use memoized variant (disables hover during scroll)
      whileTap="tap"
      custom={animationDelay}
      // Define default transition for the main item div
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
      style={{
        // Hardware acceleration hints for smoother animation
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        transformOrigin: "center center", // Ensure scaling happens from center
        // Fixed height container to prevent layout shifts
        height: containerHeight,
        margin: "0", // Prevent margin changes on hover
        zIndex: isHovered ? "5" : "1" // Bring hovered items to front to prevent z-index issues with descriptions
      }}
    >
      <div
        ref={itemRef}
        className={cx(
          cardStyle,
          !transparentCards && cardSolidStyle
        )}
        style={{
          borderColor: item.color || 'var(--colors-primary)',
          borderLeftColor: item.color || 'var(--colors-primary)',
        }}
        onMouseEnter={handleMouseEnter} // Updated handler
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        tabIndex={0}
        role={item.href ? "link" : "button"}
        aria-label={item.label}
        aria-describedby={item.description ? `desc-${item.id}` : undefined}
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {/* Centered glow effect for the entire card - AnimatePresence always rendered */}
        <AnimatePresence>
          {!isScrolling && isHovered && (
            <motion.div
              className={glowEffectStyle}
              style={{ color: item.color || 'var(--colors-primary)' }}
              variants={ANIMATIONS.glow}
              initial="initial"
              animate="hover"
              exit="exit" // Use the new exit animation variant
              aria-hidden="true"
            />
          )}
        </AnimatePresence>
        {/* No glow effect during scrolling */}

        {/* Enhanced golden tab indicator - animation depends on hover state (which is disabled during scroll) */}
        <motion.div
          className={goldenTabStyle}
          style={{
            background: item.color || 'var(--colors-primary)',
            // Style directly depends on isHovered state, which is false during scroll
            height: isHovered ? tabHeight : '20%',
            top: isHovered ? tabTop : '40%',
            left: '10px', // Ensuring the left offset is applied here as well
          }}
          variants={ANIMATIONS.goldenTab}
          initial="initial"
          animate={isHovered ? "hover" : "initial"} // Animation depends on hover state
          aria-hidden="true"
        />

        {/* Tab glow effect - animation depends on hover state */}
        <div className={tabGlowContainerStyle} aria-hidden="true">
          <motion.div
            className={tabGlowStyle}
            style={{ background: item.color || 'var(--colors-primary)' }}
            variants={ANIMATIONS.tabGlow}
            initial="initial"
            animate={isHovered ? "hover" : "initial"} // Animation depends on hover state
          />
        </div>

        {/* Icon container - Explicitly control animation based on parent hover state */}
        {item.icon && (
          <motion.div
            className={iconContainerStyle}
            style={{ color: item.color || 'var(--colors-primary)' }}
            variants={ANIMATIONS.icon}
            initial="initial" // Set initial state
            animate={isHovered && !isScrolling ? "hover" : "initial"} // Animate to 'hover' only if parent is hovered AND not scrolling
            aria-hidden="true"
          >
            {item.icon}
          </motion.div>
        )}

        <div className={textContainerStyle}>
          {/* Label - Explicitly control animation based on parent hover state */}
          <motion.div
            className={labelStyle}
            style={{ color: item.color || 'var(--colors-text)' }}
            variants={ANIMATIONS.label}
            initial="initial" // Set initial state
            animate={isHovered && !isScrolling ? "hover" : "initial"} // Animate to 'hover' only if parent is hovered AND not scrolling
            id={`label-${item.id}`}
          >
            {item.label}
          </motion.div>

          {/* Description - only render if:
              1. Item has a description
              2. NOT on mobile
              3. NOT scrolling
              4. Is hovered
              5. showDescriptions prop is true */}
          {item.description && !isMobile && !isScrolling && isHovered && showDescriptions && (
            <AnimatePresence>
              <motion.div
                className={descriptionStyle}
                style={{ color: item.color ? `${item.color}99` : 'var(--colors-textMuted)' }}
                id={`desc-${item.id}`}
                variants={ANIMATIONS.description}
                initial="initial"
                animate={"hover"} // Animate only appears if isHovered is true
                exit="initial"
              >
                {item.description}
              </motion.div>
            </AnimatePresence>
          )}
          {/* No description during scrolling or if not hovered or if descriptions are disabled */}
        </div>
      </div>
    </motion.div>
  );
}));

// Set display name for forwardRef component
Item.displayName = 'NavigationItem';

// ==========================================================
// MAIN COMPONENT
// ==========================================================

/**
 * Enhanced ItemNavigation Component
 *
 * A responsive grid-based navigation component with advanced animations
 * and interactive hover effects. Designed to provide a rich, engaging experience.
 */
const ItemNavigation: React.FC<ItemNavigationProps> = ({
  items,
  title,
  subtitle,
  columns = 3,
  mobileColumns = 1,
  tabletColumns = 2,
  gapSize = 1.5,
  initialAnimation = true,
  animationStagger = 0.05,
  onItemClick,
  className,
  showSubtitle = false,
  transparentCards = true,
  ariaLabel,
  reducedMotion = false,
  showDescriptions = false // Default is false - descriptions are disabled
}) => {
  // useRef for accessing the container element DOM node
  const containerRef = useRef<HTMLDivElement>(null);

  // Refs to store navigation items for keyboard navigation
  const itemRefs = useRef<Array<HTMLElement | null>>([]);

  // State to track the currently focused item index
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  // State to track if the items are currently being scrolled
  const [isScrolling, setIsScrolling] = useState(false);

  // Scroll timer ref to persist between renders and properly handle cleanup
  const scrollTimerRef = useRef<number | null>(null);

  // Detect if we're on mobile
  const isMobile = useIsMobile();

  // State to track touch device status
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Framer Motion controls
  const gridControls = useAnimation();

  // This effect runs on client-side only, ensuring proper hydration in Next.js
  useEffect(() => {
    // Initialize any client-side specific functionality
    if (containerRef.current) {
      // Ensure we have access to the DOM element
      containerRef.current.dataset.hydrated = 'true';

      // Initialize refs array with the correct length
      itemRefs.current = itemRefs.current.slice(0, items.length);

      // Check if current device is a touch device - done once in an effect
      if (typeof window !== 'undefined') {
        const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (touchDevice) {
          setIsTouchDevice(true);
          containerRef.current.classList.add('touch-device');
        }
      }
    }

    // Check if user prefers reduced motion
    const prefersReducedMotion = reducedMotion ||
      (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    // Start animation when component mounts, unless reduced motion is preferred
    if (initialAnimation && !prefersReducedMotion) {
      setTimeout(() => {
        // Use different animation variant for mobile
        gridControls.start(isMobile ? "visibleMobile" : "visible");
      }, 100);
    } else {
      // If reduced motion is preferred, immediately show the content
      gridControls.set(isMobile ? "visibleMobile" : "visible");
    }

    // Add resize event listener to handle orientation changes on mobile
    const handleResize = () => {
      if (initialAnimation && !prefersReducedMotion) {
        // Reset animation on resize for smoother transitions
        gridControls.set("hidden");
        setTimeout(() => {
          gridControls.start(isMobile ? "visibleMobile" : "visible");
        }, 100);
      }
    };

    // Add scroll event listener to detect scrolling with proper debouncing
    const handleScroll = () => {
      // Set scrolling state to true immediately if not already
      // Use functional update to avoid stale state issues if events fire rapidly
      setIsScrolling(prev => {
          if (!prev) { // Only update if currently false
              return true;
          }
          return prev; // Otherwise keep it true
      });

      // Clear any existing timeout to implement debouncing
      if (scrollTimerRef.current !== null) {
        window.clearTimeout(scrollTimerRef.current);
      }

      // Set new timeout to detect when scrolling stops
      scrollTimerRef.current = window.setTimeout(() => {
        setIsScrolling(false);
        scrollTimerRef.current = null;
      }, 200); // 200ms debounce timeout
    };


    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);

      // Clear any pending timeout during cleanup
      if (scrollTimerRef.current !== null) {
        window.clearTimeout(scrollTimerRef.current);
        scrollTimerRef.current = null;
      }
    };
    // Ensure useEffect re-runs if key props change, including isMobile for animation target
  }, [initialAnimation, gridControls, items.length, reducedMotion, isMobile]); // Removed isScrolling from here, handled internally now

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const { key } = e;

    // Skip if no items
    if (items.length === 0) return;

    switch (key) {
      case 'ArrowRight':
      case 'ArrowDown': {
        e.preventDefault();
        setFocusedIndex(prevIndex => {
          const nextIndex = prevIndex < items.length - 1 ? prevIndex + 1 : 0;
          itemRefs.current[nextIndex]?.focus();
          return nextIndex;
        });
        break;
      }
      case 'ArrowLeft':
      case 'ArrowUp': {
        e.preventDefault();
        setFocusedIndex(prevIndex => {
          const nextIndex = prevIndex > 0 ? prevIndex - 1 : items.length - 1;
          itemRefs.current[nextIndex]?.focus();
          return nextIndex;
        });
        break;
      }
      case 'Home': {
        e.preventDefault();
        itemRefs.current[0]?.focus();
        setFocusedIndex(0);
        break;
      }
      case 'End': {
        e.preventDefault();
        itemRefs.current[items.length - 1]?.focus();
        setFocusedIndex(items.length - 1);
        break;
      }
    }
  }, [items.length]);

  // Memoize items array to prevent unnecessary re-renders
  const memoizedItems = useMemo(() => items, [items]);

  return (
    <div
      className={cx(containerStyle, className)}
      ref={containerRef}
      onKeyDown={handleKeyDown}
      role="navigation"
      aria-label={ariaLabel || title || "Navigation Menu"}
    >
      {(title || (subtitle && showSubtitle)) && (
        <div className={titleContainerStyle}>
          {title && <h2 className={titleStyle} id="navigation-title">{title}</h2>}
          {subtitle && showSubtitle && <p className={subtitleStyle} id="navigation-subtitle">{subtitle}</p>}
        </div>
      )}

      <motion.div
        className={gridContainerStyle}
        variants={ANIMATIONS.grid}
        initial={initialAnimation ? "hidden" : (isMobile ? "visibleMobile" : "visible")}
        animate={gridControls}
        aria-labelledby={title ? "navigation-title" : undefined}
        aria-describedby={subtitle && showSubtitle ? "navigation-subtitle" : undefined}
        style={{
          // Add performance optimizations
          willChange: "transform, opacity",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
        }}
      >
        {memoizedItems.map((item, index) => (
          <Item
            key={item.id}
            item={item}
            onItemClick={onItemClick}
            index={index}
            animationStagger={isMobile ? animationStagger / 3 : animationStagger} // Reduced stagger for mobile
            transparentCards={transparentCards}
            isMobile={isMobile} // Pass the isMobile state from the hook
            isScrolling={isScrolling} // Pass the scrolling state
            ref={(el: HTMLElement | null) => {
              // Store the element reference in the refs array
              if (el) {
                itemRefs.current[index] = el;
              }
            }}
            isFocused={focusedIndex === index}
            showDescriptions={showDescriptions} // Pass the showDescriptions prop to each Item
          />
        ))}
      </motion.div>
    </div>
  );
};

export default ItemNavigation;