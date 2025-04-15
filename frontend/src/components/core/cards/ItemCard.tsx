'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { css, cx } from "../../../../styled-system/css"; // Adjust path as needed

// ==========================================================
// TYPES & INTERFACES
// ==========================================================

export interface NavigationItem {
  id: string;
  label: string;
  href?: string; // Optional if onClick is provided
  icon?: React.ReactNode;
  description?: string;
  color?: string; // For theming the card
}

export interface ItemCardProps {
  /** The data for the navigation item */
  item: NavigationItem;
  /** Optional click handler. If not provided and item.href exists, it will navigate. */
  onClick?: (item: NavigationItem) => void;
  /** Is the card displayed in a mobile context? Affects animations/styles. */
  isMobile?: boolean;
  /** Is the page currently scrolling? Disables some effects. */
  isScrolling?: boolean;
  /** When true, shows the description text below the header elements (if description exists) */
  showDescription?: boolean;
  /** Should the icon glow effect be shown on hover/focus? */
  showGlowEffect?: boolean;
  /** Use a transparent background instead of the solid variant? */
  isTransparent?: boolean;
  /** Optional className to pass to the outer container */
  className?: string;
  /** Optional style object for the outer container */
  style?: React.CSSProperties;
  /** Should the component animate on initial mount? */
  initialAnimation?: boolean;
  /** Delay for the initial mount animation (if enabled) */
  animationDelay?: number;
  /** Override reduced motion preference */
  reducedMotion?: boolean;
  /** Optional width of the card - can be any CSS width value */
  width?: string;
  /** Optional min-width of the card */
  minWidth?: string;
  /** Optional max-width of the card */
  maxWidth?: string;
  /** Optional height of the card - will be ignored when description is showing */
  height?: string;
  /** Optional minimum height of the card */
  minHeight?: string;
  /** Optional card elevation/shadow level (0-5). Aligns with MUI's elevation concept (Section 4.1) */
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  /** Optional padding override */
  padding?: string;
}

// ==========================================================
// ANIMATION VARIANTS (Framer Motion)
// Aligns with MUI's "Motion Provides Meaning" principle (Section 4.3)
// ==========================================================

const ANIMATIONS = {
  item: {
    hidden: { opacity: 0, y: 0, scale: 1, rotateX: '0deg' },
    visible: { y: 0, opacity: 1, scale: 1, rotateX: '0deg', transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0], boxShadow: { duration: 0.4, ease: "easeOut" } } },
    visibleMobile: { y: 0, opacity: 1, scale: 1, rotateX: '0deg', transition: { duration: 0.3, ease: "easeOut", opacity: { duration: 0.2, ease: "easeOut" } } },
    staticMobile: { y: 0, opacity: 1, scale: 1, rotateX: '0deg', transition: { duration: 0 } },
    hover: { scale: 1.04, boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.1)" },
    hoverMobile: { scale: 1.02 },
    tap: { scale: 0.97, transition: { duration: 0.1, ease: [0.19, 1, 0.22, 1] } }
  },
  icon: {
    initial: { scale: 1, rotate: 0 },
    hover: { scale: 1.1, rotate: 5, transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1], scale: { type: "spring", stiffness: 400, damping: 10 }, rotate: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] } } }
  },
  glow: {
    initial: { opacity: 0, scale: 0.6 },
    hover: { opacity: 1, scale: 1, transition: { opacity: { duration: 0.8, ease: [0.19, 1, 0.22, 1] }, scale: { duration: 0.9, ease: [0.34, 1.56, 0.64, 1] } } },
    exit: { opacity: 0, scale: 0.6, transition: { opacity: { duration: 0.5, ease: "easeOut" }, scale: { duration: 0.5, ease: "easeOut" } } }
  },
  label: {
    initial: { y: 0 },
    hover: { y: -3, transition: { duration: 0.3, ease: "easeOut" } }
  },
  goldenTab: {
    initial: { height: '20%', top: '40%', opacity: 0.9 },
    hover: { height: '70%', top: '15%', opacity: 1, transition: { height: { type: "spring", stiffness: 300, damping: 20, duration: 0.5 }, top: { type: "spring", stiffness: 300, damping: 20, duration: 0.5 }, opacity: { duration: 0.3 } } }
  },
  tabGlow: {
    initial: { opacity: 0.2, width: '100%', height: '100%' },
    hover: { opacity: 0.4, width: '100%', height: '100%', transition: { opacity: { duration: 0.3, ease: "easeOut" } } }
  },
  description: {
    initial: { opacity: 0, height: 0, marginTop: 0 },
    initialVisible: { opacity: 0, height: 'auto', marginTop: '0.7rem' },
    visible: { opacity: 1, height: 'auto', marginTop: '0.7rem', transition: { opacity: { duration: 0.4, ease: "easeOut" }, height: { duration: 0.35, type: "spring", stiffness: 300, damping: 25 }, marginTop: { duration: 0.3, ease: "easeOut" } } },
    exit: { opacity: 0, height: 0, marginTop: 0, transition: { opacity: { duration: 0.2, ease: "easeIn" }, height: { duration: 0.25, ease: "easeIn" }, marginTop: { duration: 0.2, ease: "easeIn" } } }
  }
};

// ==========================================================
// STYLE DEFINITIONS (PandaCSS)
// ==========================================================

// Focus ring styles - Important for Accessibility (Section 6.3)
const focusRingStyles = css({
  outline: 'none',
  position: 'relative',
  zIndex: '10',
  transform: 'translateY(-2px) scale(1.03)',
  transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
});

// Card styles - base
const cardStyle = css({
  position: 'relative', // Needed for ripple positioning
  backgroundColor: 'transparent',
  borderRadius: '12px',
  padding: '0.85rem 1rem',
  overflow: 'hidden', // Changed from 'visible' to contain ripple effect
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  minHeight: '54px',
  width: '100%',
  textAlign: 'left',
  cursor: 'pointer',
  borderWidth: '0.1px',
  borderStyle: 'solid',
  borderColor: 'primary', // Uses theme token
  boxShadow: 'rgba(0, 0, 0, 0.05) 0px 2px 6px 0px, rgba(27, 31, 35, 0.08) 0px 0px 0px 1px',
  willChange: 'transform, opacity, box-shadow',
  transform: 'translateZ(0)', // Promotes to composite layer for animations
  backfaceVisibility: 'hidden',
  transformOrigin: 'center center',
  borderLeftWidth: '4px',
  outline: 'none',
  transition: 'all 0.3s ease-out',
  // Responsive styles using standard CSS media queries (Section 2.3)
  // Note: MUI defaults are xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 (Section 2.2)
  // These values (1400px, 640px) might be project-specific.
  '@media (min-width: 1400px)': {
    padding: 'clamp(0.9rem, calc(0.6rem + 0.5vw), 1.1rem) clamp(1.25rem, calc(0.9rem + 0.6vw), 1.5rem)',
    minHeight: 'clamp(60px, calc(4px + 4vw), 100px)',
    borderLeftWidth: 'clamp(4px, calc(3px + 0.167vw), 5px)',
  },
  '@media (max-width: 640px)': {
    padding: '0.75rem',
    minHeight: '50px',
    opacity: '1',
    borderWidth: '0.2px',
    borderLeftWidth: '4px',
    boxShadow: 'rgba(0, 0, 0, 0.05) 0px 1px 3px 0px',
  },
});

// Styles for card with description visible
const cardWithDescriptionStyle = css({
  flexDirection: 'column',
  alignItems: 'flex-start',
  height: 'auto',
  minHeight: '120px',
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06)',
});

// Solid card variant styles
const cardSolidStyle = css({
  background: 'backgroundAlt', // Uses theme token
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
  background: 'primary', // Uses theme token
  borderTopRightRadius: '6px',
  borderBottomRightRadius: '6px',
  boxShadow: '0 0 6px 0 rgba(var(--colors-primary-rgb), 0.3)', // Assuming primary-rgb token exists
  transition: 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
  pointerEvents: 'none', // Ensure it doesn't interfere with clicks
  zIndex: 1, // Below content but above background
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
    boxShadow: '0 0 12px 3px rgba(var(--colors-primary-rgb), 0.4), 0 0 4px 1px rgba(var(--colors-primary-rgb), 0.6)',
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
  zIndex: '0', // Behind content
  pointerEvents: 'none',
});

// Tab glow effect styles
const tabGlowStyle = css({
  position: 'absolute',
  left: '-5px',
  top: '0',
  width: '10px',
  height: '100%',
  background: 'var(--colors-primary)', // Uses theme token
  filter: 'blur(8px)',
  opacity: '0.3',
  zIndex: '-1',
  pointerEvents: 'none',
});

// Container for the header content (icon + label)
const headerContainerStyle = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%',
  minHeight: '26px',
  zIndex: '5', // Ensure header is above description and effects
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
  color: 'primary', // Uses theme token
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

// Glow effect styles (for hover) - Aligns with MUI's motion principles
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
  whiteSpace: 'normal',
  wordBreak: 'break-word',
  overflowWrap: 'break-word',
});

// Label styles
const labelStyle = css({
  fontFamily: 'var(--font-heading, "system-ui")', // Uses theme token potentially
  fontSize: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.9rem)',
  fontWeight: '300',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'text', // Uses theme token
  position: 'relative',
  zIndex: '2',
  '@media (min-width: 1400px)': {
    fontSize: 'clamp(0.9rem, calc(0.7rem + 0.33vw), 1.1rem)',
  }
});

// Description styles
const descriptionStyle = css({
  fontSize: 'clamp(0.65rem, 0.6rem + 0.25vw, 0.75rem)',
  color: 'textMuted', // Uses theme token
  lineHeight: '1.5',
  width: '100%',
  paddingLeft: '0.4rem',
  paddingRight: '0.4rem',
  zIndex: '2',
  wordWrap: 'break-word',
  overflowWrap: 'break-word',
  whiteSpace: 'normal',
  '@media (min-width: 1400px)': {
    fontSize: 'clamp(0.75rem, calc(0.6rem + 0.25vw), 0.9rem)',
  },
});

// Expanded description style (used when description is visible)
const expandedDescriptionStyle = css({
  position: 'relative',
  top: 'auto',
  paddingTop: '0.5rem',
  paddingBottom: '0.5rem',
  marginBottom: '0.3rem',
  opacity: '1',
  width: '100%',
  display: 'block',
});

// Generate elevation shadows - Aligns with MUI's Elevation concept (Section 4.1)
const getElevationShadow = (level: number): string => {
  // These shadow values aim to replicate standard material elevation levels.
  switch(level) {
    case 0: return 'none';
    case 1: return '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)';
    case 2: return '0px 3px 3px -2px rgba(0,0,0,0.2), 0px 2px 6px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)';
    case 3: return '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 3px 14px 2px rgba(0,0,0,0.14), 0px 3px 16px 2px rgba(0,0,0,0.12)';
    case 4: return '0px 8px 10px -5px rgba(0,0,0,0.2), 0px 6px 30px 5px rgba(0,0,0,0.14), 0px 6px 28px 8px rgba(0,0,0,0.12)';
    case 5: return '0px 11px 15px -7px rgba(0,0,0,0.2), 0px 9px 46px 8px rgba(0,0,0,0.14), 0px 8px 38px 7px rgba(0,0,0,0.12)';
    default: return '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)'; // Default to level 1
  }
};

// Ripple effect styles - Added based on MUI standard for interaction feedback (Section 4.2)
const rippleStyle = css({
  position: 'absolute',
  borderRadius: '50%',
  transform: 'scale(0)',
  animation: 'ripple 600ms linear',
  backgroundColor: 'rgba(var(--colors-primary-rgb, 0, 0, 0), 0.3)', // Use primary color with alpha, fallback to black
  pointerEvents: 'none', // Ensure ripple doesn't interfere with events
  zIndex: 5, // Above content but below potential absolute positioned children
});

// Ripple animation keyframes
// Note: PandaCSS doesn't directly support `@keyframes` in `css()`.
// This would typically be defined globally or injected via GlobalStyles/css prop.
// For this example, we assume `@keyframes ripple` is defined elsewhere, e.g., in global CSS:
/*
@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
*/

// ==========================================================
// CUSTOM HOOKS
// ==========================================================

// Media query hook (already present, aligns with MUI's useMediaQuery concept - Section 2.3)
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

// Reduced motion hook (already present)
const useReducedMotion = (override?: boolean): boolean => {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  return override !== undefined ? override : prefersReducedMotion;
};

// Hover effects hook (already present)
const useItemHoverEffects = (
  ref: React.RefObject<HTMLDivElement | null>,
  options: { isMobile?: boolean; isScrolling?: boolean; disableHoverOnScroll?: boolean; trackMouseMoveOnMobile?: boolean; } = {}
) => {
  const { isMobile = false, isScrolling = false, disableHoverOnScroll = true, trackMouseMoveOnMobile = false } = options;
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = useCallback(() => { if (!(isScrolling && disableHoverOnScroll)) setIsHovered(true); }, [isScrolling, disableHoverOnScroll]);
  const handleMouseLeave = useCallback(() => { setIsHovered(false); setMousePosition({ x: 0, y: 0 }); }, []);
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!isHovered || (!trackMouseMoveOnMobile && isMobile) || !ref.current) {
      if (mousePosition.x !== 0 || mousePosition.y !== 0) setMousePosition({ x: 0, y: 0 });
      return;
    }
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    const normalizedX = Math.min(1, Math.max(0, x / rect.width)); const normalizedY = Math.min(1, Math.max(0, y / rect.height));
    setMousePosition({ x: normalizedX, y: normalizedY });
  }, [isHovered, isMobile, trackMouseMoveOnMobile, ref, mousePosition.x, mousePosition.y]);

  useEffect(() => { if (isHovered && isScrolling && disableHoverOnScroll) { setIsHovered(false); setMousePosition({ x: 0, y: 0 }); } }, [isScrolling, disableHoverOnScroll, isHovered]);

  return { isHovered, mousePosition, eventHandlers: { onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, onMouseMove: handleMouseMove } };
};

// Dynamic style hook for tab (already present)
const useDynamicStyle = (
  options: { isHovered: boolean; mousePosition: { x: number; y: number }; isMobile: boolean; isScrolling: boolean; config?: { baseHeight: string; baseTop: string; mobileHeight: string; mobileTop: string; desktopBaseHeight: number; desktopHeightRange: number; desktopMinTop: number; desktopMaxTop: number; }; }
): { height: string; top: string } => {
  const { isHovered, mousePosition, isMobile, isScrolling, config = { baseHeight: '20%', baseTop: '40%', mobileHeight: '60%', mobileTop: '20%', desktopBaseHeight: 60, desktopHeightRange: 10, desktopMinTop: 15, desktopMaxTop: 85 } } = options;
  return useMemo(() => {
    if (!isHovered || isScrolling) return { height: config.baseHeight, top: config.baseTop };
    if (isMobile) return { height: config.mobileHeight, top: config.mobileTop };
    const calculatedHeight = `${config.desktopBaseHeight + (mousePosition.y * config.desktopHeightRange)}%`;
    const effectiveHeight = parseFloat(calculatedHeight);
    const maxPossibleTop = config.desktopMaxTop - effectiveHeight;
    const rawPosition = Math.max(config.desktopMinTop, Math.min(maxPossibleTop, mousePosition.y * 100));
    return { height: calculatedHeight, top: `${rawPosition}%` };
  }, [isHovered, mousePosition.y, isMobile, isScrolling, config]);
};

// Animation variants hook (already present)
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

// ==========================================================
// MAIN COMPONENT (ItemCard)
// ==========================================================

const ItemCard: React.FC<ItemCardProps> = React.memo((props) => {
  const {
    item, onClick, isMobile = false, isScrolling = false, showDescription = false,
    showGlowEffect = true, isTransparent = true, className, style, initialAnimation = true,
    animationDelay = 0, reducedMotion: reducedMotionOverride, width, minWidth, maxWidth,
    height, minHeight, elevation = 1, padding,
  } = props;

  const router = useRouter();
  const itemRef = useRef<HTMLDivElement>(null);
  const [hasDomFocus, setHasDomFocus] = useState(false);
  const isInitialRender = useRef(true);
  const [ripples, setRipples] = useState<React.CSSProperties[]>([]); // State for ripple elements

  // --- Effect for initial render flag ---
  useEffect(() => {
    const timer = setTimeout(() => { isInitialRender.current = false; }, 0);
    return () => clearTimeout(timer);
  }, []);

  const motionIsReduced = useReducedMotion(reducedMotionOverride);
  const { isHovered, mousePosition, eventHandlers } = useItemHoverEffects(itemRef, { isMobile, isScrolling, disableHoverOnScroll: true, trackMouseMoveOnMobile: false });
  const handleFocus = useCallback(() => setHasDomFocus(true), []);
  const handleBlur = useCallback(() => setHasDomFocus(false), []);
  const shouldShowDescription = useMemo(() => showDescription && item.description, [showDescription, item.description]);

  // --- Ripple Effect Logic ---
  const createRipple = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!itemRef.current || motionIsReduced) return;

    const rect = itemRef.current.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple: React.CSSProperties = {
      top: y + 'px',
      left: x + 'px',
      height: size + 'px',
      width: size + 'px',
      // Use item color for ripple if available, otherwise default
      backgroundColor: item.color ? `${item.color}4D` : 'rgba(var(--colors-primary-rgb, 0, 0, 0), 0.3)',
    };

    setRipples(prev => [...prev, newRipple]);
  };

  // Clean up ripples after animation
  useEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        setRipples(prev => prev.slice(1));
      }, 600); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [ripples]);

  // --- Activation Logic ---
  const handleActivation = useCallback(() => {
    const performAction = () => {
      if (onClick) onClick(item);
      else if (item.href) router.push(item.href);
      itemRef.current?.blur(); // Blur after action
    };

    if (isMobile && itemRef.current) {
      itemRef.current.style.transform = 'scale(0.98)';
      setTimeout(() => { if (itemRef.current) itemRef.current.style.transform = ''; }, 100);
      setTimeout(performAction, 100); // Delay action slightly for visual feedback
    } else {
      performAction(); // Perform action immediately on desktop
    }
  }, [item, onClick, router, isMobile]);

  // Combined interaction props including ripple trigger
  const combinedInteractionProps = useMemo(() => ({
    ...eventHandlers,
    onClick: (e: React.MouseEvent<HTMLDivElement>) => {
      createRipple(e); // Create ripple on click
      handleActivation(); // Then handle the main activation logic
    },
    onFocus: handleFocus,
    onBlur: handleBlur,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // Optionally trigger a visual cue for keyboard activation if desired
        handleActivation();
      }
    }
  }), [eventHandlers, handleActivation, handleFocus, handleBlur, createRipple]); // Added createRipple

  const tabStyles = useDynamicStyle({ isHovered, mousePosition, isMobile, isScrolling });
  const { animateVariant, hoverVariant } = useItemAnimationVariants(isMobile, isScrolling);
  const shouldShowFocusStyles = hasDomFocus;
  const showHoverEffects = useMemo(() => isHovered && !shouldShowFocusStyles && !isScrolling, [isHovered, shouldShowFocusStyles, isScrolling]);
  const zIndex = useMemo(() => (isHovered || shouldShowFocusStyles || shouldShowDescription) ? 5 : 1, [isHovered, shouldShowFocusStyles, shouldShowDescription]);

  const customElementStyles = useMemo(() => {
    const styles: React.CSSProperties = {};
    if (width) styles.width = width;
    if (minWidth) styles.minWidth = minWidth;
    if (maxWidth) styles.maxWidth = maxWidth;
    if (!shouldShowDescription && height) styles.height = height;
    if (minHeight) styles.minHeight = minHeight;
    if (padding) styles.padding = padding;
    return styles;
  }, [width, minWidth, maxWidth, height, minHeight, padding, shouldShowDescription]);

  const shadowStyle = useMemo(() => ({ boxShadow: getElevationShadow(elevation) }), [elevation]);

  const descriptionInitialVariant = useMemo(() => {
    if (initialAnimation && !motionIsReduced && showDescription && item.description && isInitialRender.current) {
      return "initialVisible";
    }
    return "initial";
  }, [initialAnimation, motionIsReduced, showDescription, item.description]);

  // Developer Accessibility Responsibility Note (Section 6.3):
  // Ensure sufficient color contrast when setting `item.color` and that `item.label`
  // provides a meaningful accessible name. For icon-only cards, ensure `item.label` is still provided.

  return (
    <motion.div
      className={className}
      style={{ ...style, zIndex }}
      variants={ANIMATIONS.item}
      initial={initialAnimation && !motionIsReduced ? "hidden" : animateVariant}
      animate={animateVariant}
      whileHover={shouldShowFocusStyles || motionIsReduced ? undefined : hoverVariant}
      whileTap={motionIsReduced ? undefined : "tap"}
      transition={{ delay: initialAnimation ? animationDelay : 0, duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
      layout={!motionIsReduced}
    >
      {/* Inner div: The actual card element */}
      <div
        ref={itemRef}
        className={cx(
          cardStyle,
          shouldShowDescription && cardWithDescriptionStyle,
          !isTransparent && cardSolidStyle,
          shouldShowFocusStyles && focusRingStyles,
          'item-card'
        )}
        style={{
          ...customElementStyles,
          ...shadowStyle,
          borderColor: item.color || 'var(--colors-primary)', // Theming (Section 3)
          borderLeftColor: item.color || 'var(--colors-primary)',
          ...(shouldShowFocusStyles && { // Accessibility: Visible focus state (Section 6.3)
            outline: `2px solid ${item.color || 'var(--colors-primary)'}`,
            boxShadow: `0 0 0 4px ${item.color ? `${item.color}40` : 'rgba(var(--colors-primary-rgb), 0.25)'}, ${getElevationShadow(elevation + 2)}`, // Slightly increased shadow on focus
            background: 'rgba(var(--colors-primary-rgb, 255, 255, 255), 0.08)', // Slight background highlight
          })
        }}
        {...combinedInteractionProps}
        data-hovered={isHovered}
        data-focused={shouldShowFocusStyles}
        tabIndex={0} // Accessibility: Keyboard navigable (Section 6.2)
        role="button" // Accessibility: ARIA role (Section 6.2)
        aria-pressed={shouldShowFocusStyles} // Accessibility: ARIA state (Section 6.2)
        aria-label={item.label} // Accessibility: Ensure label provides accessible name (Section 6.3)
      >
        {/* Ripple Container */}
        {ripples.map((style, index) => (
          <span key={index} className={rippleStyle} style={style} />
        ))}

        {/* Icon Glow Effect */}
        <AnimatePresence>
          {showGlowEffect && !shouldShowDescription && !motionIsReduced && (showHoverEffects || shouldShowFocusStyles) && item.icon && (
            <motion.div
              className={glowEffectStyle}
              style={{ color: item.color || 'var(--colors-primary)' }}
              variants={ANIMATIONS.glow} initial="initial" animate="hover" exit="exit"
            />
          )}
        </AnimatePresence>

        {/* Golden Tab Indicator */}
        <motion.div
          className={goldenTabStyle}
          style={{
            background: item.color || 'var(--colors-primary)',
            height: shouldShowFocusStyles || motionIsReduced ? '70%' : tabStyles.height,
            top: shouldShowFocusStyles || motionIsReduced ? '15%' : tabStyles.top,
          }}
          variants={ANIMATIONS.goldenTab} initial="initial"
          animate={(showHoverEffects || shouldShowFocusStyles) && !motionIsReduced ? "hover" : "initial"}
        />

        {/* Subtle Tab Edge Glow */}
        <div className={tabGlowContainerStyle}>
          <motion.div
            className={tabGlowStyle}
            style={{ background: item.color || 'var(--colors-primary)' }}
            variants={ANIMATIONS.tabGlow} initial="initial"
            animate={(showHoverEffects || shouldShowFocusStyles) && !motionIsReduced ? "hover" : "initial"}
          />
        </div>

        {/* Header Container (icon + label) */}
        <div className={headerContainerStyle}>
          {item.icon && (
            <motion.div
              className={iconContainerStyle}
              style={{ color: item.color || 'var(--colors-primary)' }}
              variants={ANIMATIONS.icon} initial="initial"
              animate={(showHoverEffects || shouldShowFocusStyles) && !motionIsReduced ? "hover" : "initial"}
            >
              {item.icon}
            </motion.div>
          )}
          <motion.div
            className={labelStyle}
            style={{ color: item.color || 'var(--colors-text)' }} // Theming
            variants={ANIMATIONS.label} initial="initial"
            animate={(showHoverEffects || shouldShowFocusStyles) && !motionIsReduced ? "hover" : "initial"}
          >
            {item.label}
          </motion.div>
        </div>

        {/* Description - Animated version */}
        {item.description && (
          <AnimatePresence>
            {shouldShowDescription && !motionIsReduced && (
              <motion.div
                key={item.id + "-desc"}
                className={cx(descriptionStyle, expandedDescriptionStyle)}
                style={{ color: item.color ? `${item.color}99` : 'var(--colors-textMuted)' }} // Theming
                variants={ANIMATIONS.description}
                initial={descriptionInitialVariant}
                animate="visible"
                exit="exit"
              >
                {item.description}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Description - Static version for reduced motion */}
        {item.description && shouldShowDescription && motionIsReduced && (
          <div
            className={cx(descriptionStyle, expandedDescriptionStyle)}
            style={{ color: item.color ? `${item.color}99` : 'var(--colors-textMuted)', marginTop: '0.7rem' }}
          >
            {item.description}
          </div>
        )}
      </div>
    </motion.div>
  );
});

ItemCard.displayName = 'ItemCard';

export default ItemCard;

// Global Keyframes needed for ripple (define in your global CSS or inject via PandaCSS global styles)
/*
@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
*/
