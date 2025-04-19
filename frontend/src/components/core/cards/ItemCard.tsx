'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { css, cx } from "../../../../styled-system/css"; // Adjust path as needed
import { usePressAndHold } from '../../../../moonlight-ui/hooks/usePressAndHold'; // Import the extracted hook
import { useRippleEffect } from "../../../../moonlight-ui/hooks/useRippleEffect"; // Updated import without Ripple type
import { useHoverEffects } from '../../../../moonlight-ui/hooks/useHoverEffects'; // Import the hover effects hook
import { useActivationHandler } from "../../../../moonlight-ui/hooks/useActivationHandler"; // Import the new hook

// Type to handle motion.button props correctly
type MotionButtonProps = HTMLMotionProps<"button">;

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

// Use native React button event types instead of hand-rolling our own
type NativeButtonEvents = React.ButtonHTMLAttributes<HTMLButtonElement>;
type CombinedEventHandlersResult = Omit<NativeButtonEvents, 'style' | 'className'>;

// Update all event handler interfaces to use HTMLButtonElement consistently
interface MouseEventHandlerProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseDown?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseUp?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseMove?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

interface TouchEventHandlerProps {
  onTouchStart?: (event: React.TouchEvent<HTMLButtonElement>) => void;
  onTouchEnd?: (event: React.TouchEvent<HTMLButtonElement>) => void;
}

interface FocusEventHandlerProps {
    onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;
}


export interface ItemCardProps {
  /** The data for the navigation item */
  item: NavigationItem;
  /** Optional click handler. If not provided and item.href exists, it will navigate. */
  onClick?: (item: NavigationItem) => void;
  /** Visual style variant of the card */
  variant?: 'transparent' | 'glass' | 'solid';
  /** Is the card displayed in a mobile context? Affects animations/styles. */
  isMobile?: boolean;
  /** Is the page currently scrolling? Disables some effects. */
  isScrolling?: boolean;
  /** When true, shows the description text below the header elements (if description exists) */
  showDescription?: boolean;
  /** Should the icon glow effect be shown on hover/focus? */
  showGlowEffect?: boolean;
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
  /** Optional card elevation/shadow level (0-5). */
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  /** Optional padding override */
  padding?: string;
  /** Duration for the press-and-hold animation in milliseconds */
  pressAnimationDuration?: number;
  /** Initial height of the golden tab indicator (as percentage) */
  initialTabHeight?: string;
  /** Minimum height the tab can shrink to when pressed (as percentage) */
  minTabHeight?: string;
}

// Input type for useComponentStyling
interface ComponentStylingOptions {
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    height?: string;
    minHeight?: string;
    padding?: string;
    elevation?: ItemCardProps['elevation'];
    isPressed?: boolean;
    shouldShowDescription?: boolean;
    isHovered?: boolean;
    isFocused?: boolean;
    variant?: ItemCardProps['variant'];
}

// Return type for useComponentStyling
interface ComponentStylingResult {
    customElementStyles: React.CSSProperties;
    shadowStyle: React.CSSProperties;
    backgroundStyles: React.CSSProperties;
    zIndex: number;
}

// Input type for useAnimationVariants
interface AnimationVariantsOptions {
    motionIsReduced?: boolean;
    isMobile?: boolean;
    isScrolling?: boolean;
    isFocused?: boolean;
    initialAnimation?: boolean;
    showDescription?: boolean;
    hasDescription?: boolean;
}

// Return type for useAnimationVariants
interface AnimationVariantsResult {
    descriptionInitialVariant: string;
    itemVariant: string;
    hoverVariant: string | undefined;
}

// Input type for useCombinedEventHandlers
interface CombinedEventHandlersOptions {
    baseEventHandlers: CombinedEventHandlersResult; // Use updated type (no keyboard)
    triggerRipple: (event: React.MouseEvent<HTMLButtonElement>) => void; // Updated to HTMLButtonElement
    handleActivation: () => void; // Still needed for ripple + custom logic
}

// Return type for useCombinedEventHandlers is CombinedEventHandlersResult

// Animation variant literal types for better type safety
type AnimationVariant = "initial" | "hover" | "press";

// Return type for useItemInteractionState
interface ItemInteractionStateResult {
    isHovered: boolean;
    isFocused: boolean;
    isPressed: boolean;
    pressProgress: number;
    tabStyles: { height: string; top: string };
    getAnimationVariant: (componentType: string) => AnimationVariant;
    eventHandlers: CombinedEventHandlersResult; // Uses NativeButtonEvents
    showHoverEffects: boolean;
}


// ==========================================================
// ANIMATION VARIANTS (Keep as is)
// ==========================================================
const ANIMATIONS = {
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
    },
    press: { 
      scale: 0.95, 
      rotate: 0, 
      transition: { 
        duration: 0.3, 
        ease: [0.19, 1, 0.22, 1] 
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
    press: { 
      opacity: 0.7, 
      scale: 0.9, 
      transition: { 
        duration: 0.3 
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
    },
    press: { 
      y: 1, 
      transition: { 
        duration: 0.2, 
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
    },
    press: { 
      opacity: 0.7, 
      transition: { 
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
    },
    press: { 
      opacity: 0.2, 
      width: '100%', 
      height: '100%', 
      transition: { 
        opacity: { 
          duration: 0.2 
        } 
      } 
    }
  },
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
        opacity: { 
          duration: 0.4, 
          ease: "easeOut" 
        }, 
        height: { 
          duration: 0.35, 
          type: "spring", 
          stiffness: 300, 
          damping: 25 
        }, 
        marginTop: { 
          duration: 0.3, 
          ease: "easeOut" 
        } 
      } 
    },
    exit: { 
      opacity: 0, 
      height: 0, 
      marginTop: 0, 
      transition: { 
        opacity: { 
          duration: 0.2, 
          ease: "easeIn" 
        }, 
        height: { 
          duration: 0.25, 
          ease: "easeIn" 
        }, 
        marginTop: { 
          duration: 0.2, 
          ease: "easeIn" 
        } 
      } 
    }
  }
};

// ==========================================================
// STYLES (Updated to use CSS Variables & Button Resets)
// ==========================================================
// Add CSS variable for responsive ripple scaling
const rippleScaleCSS = `
:root {
  --ripple-scale: clamp(0.8, 0.8 + ((100vw - 400px) * 0.7 / 2000), 1.5);
}
`;

// Add the CSS to the document head
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = rippleScaleCSS;
  document.head.appendChild(styleEl);
}

const fluid = {
  // Spacing values - adjusted for more subtle scaling to match reduced font sizes
  space: {
    '2xs': 'clamp(0.25rem, 0.225rem + 0.1vw, 0.375rem)',   // Reduced scaling
    'xs': 'clamp(0.5rem, 0.425rem + 0.15vw, 0.75rem)',     // Reduced scaling
    'sm': 'clamp(0.75rem, 0.65rem + 0.2vw, 1rem)',         // Reduced scaling
    'md': 'clamp(1rem, 0.85rem + 0.3vw, 1.375rem)',        // Reduced scaling
    'lg': 'clamp(1.5rem, 1.25rem + 0.4vw, 2rem)',          // Reduced scaling
    'xl': 'clamp(2rem, 1.75rem + 0.5vw, 2.75rem)',         // Reduced scaling
  },

  // Fluid typography system - adjusted for faster scaling up to 22px
  text: {
    'xs': 'clamp(0.75rem, 0.6rem + 0.5vw, 1.15rem)',       // Faster scaling, larger max
    'sm': 'clamp(0.825rem, 0.7rem + 0.6vw, 1.25rem)',      // Faster scaling, larger max
    'base': 'clamp(0.925rem, 0.75rem + 0.7vw, 1.375rem)',  // 14.8px to 22px
    'lg': 'clamp(1rem, 0.85rem + 0.8vw, 1.5rem)',          // Faster scaling, larger max
    'xl': 'clamp(1.125rem, 0.9rem + 0.9vw, 1.75rem)',      // Faster scaling, larger max
    'label': 'clamp(0.925rem, 0.75rem + 0.7vw, 1.375rem)', // 14.8px to 22px for desktop
    'description': 'clamp(0.8125rem, 0.65rem + 0.6vw, 1.25rem)', // Proportionally adjusted
  },

  // Border radiuses - subtle scaling
  radius: {
    'sm': 'clamp(4px, 3px + 0.2vw, 6px)',                 // 4px to 6px
    'md': 'clamp(8px, 6px + 0.3vw, 12px)',                // 8px to 12px
    'lg': 'clamp(12px, 9px + 0.4vw, 16px)',               // 12px to 16px
  },

  // Icon and element sizes - adjusted for more subtle scaling
  size: {
    'xs': 'clamp(16px, 14px + 0.4vw, 24px)',              // Reduced scaling
    'sm': 'clamp(24px, 21px + 0.5vw, 36px)',              // Reduced scaling
    'md': 'clamp(32px, 28px + 0.6vw, 48px)',              // Reduced scaling
    'lg': 'clamp(48px, 40px + 0.8vw, 64px)',              // Reduced scaling
  },

  // Letter spacing - adjusted for more subtle scaling
  letterSpacing: {
    'tight': 'clamp(0.01em, 0.005em + 0.01vw, 0.025em)',  // Reduced scaling
    'normal': 'clamp(0.03em, 0.025em + 0.02vw, 0.05em)',  // Reduced scaling
    'wide': 'clamp(0.05em, 0.04em + 0.03vw, 0.09em)',     // Reduced scaling for headings/labels
  },

  // Line heights - adjusted for more subtle scaling
  lineHeight: {
    'tight': 'clamp(1.1, 1.05 + 0.05vw, 1.2)',            // Reduced scaling for headings
    'normal': 'clamp(1.4, 1.35 + 0.1vw, 1.5)',            // Reduced scaling for body text
    'loose': 'clamp(1.6, 1.5 + 0.1vw, 1.7)',              // Reduced scaling for description text
  },

  // Border widths - very subtle scaling
  border: {
    'thin': 'clamp(0.5px, 0.25px + 0.05vw, 1px)',         // 0.5px to 1px
    'normal': 'clamp(1px, 0.75px + 0.05vw, 1.5px)',       // 1px to 1.5px
    'thick': 'clamp(1.5px, 1px + 0.1vw, 2.5px)',          // 1.5px to 2.5px
    'feature': 'clamp(2px, 1.5px + 0.15vw, 4px)',         // 2px to 4px (accent borders, like golden tab)
  },

  // Blur effects
  blur: {
    'sm': 'clamp(4px, 3px + 0.3vw, 8px)',                 // 4px to 8px
    'md': 'clamp(8px, 6px + 0.5vw, 15px)',                // 8px to 15px
    'lg': 'clamp(16px, 12px + 0.8vw, 28px)',              // 16px to 28px
  }
};
const getShadow = (level: 'sm' | 'md' | 'lg' | 'xl' | 'focus') => {
  switch(level) {
    case 'sm':
      return `0 ${fluid.space['2xs']} ${fluid.space.xs} rgba(0, 0, 0, 0.05)`;
    case 'md':
      return `0 ${fluid.space.xs} ${fluid.space.sm} rgba(0, 0, 0, 0.1)`;
    case 'lg':
      return `0 ${fluid.space.sm} ${fluid.space.md} rgba(0, 0, 0, 0.15), 0 ${fluid.space['2xs']} ${fluid.space.xs} rgba(0, 0, 0, 0.08)`;
    case 'xl':
      return `0 ${fluid.space.md} ${fluid.space.lg} rgba(0, 0, 0, 0.2), 0 ${fluid.space.xs} ${fluid.space.md} rgba(0, 0, 0, 0.15)`;
    case 'focus':
      // Use CSS variable for focus color
      return `0 0 0 ${fluid.space.xs} var(--card-focus-shadow-color)`;
    default:
      return `0 ${fluid.space.xs} ${fluid.space.sm} rgba(0, 0, 0, 0.1)`;
  }
};
const focusRingStyles = css({
  // Base styles for focus state (applied via inline style logic now)
  outline: 'none', // Base outline removal
  position: 'relative',
  zIndex: '10', // Ensure focus state is prominent
  // Transform is now handled conditionally in the component's style prop
  transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)', // Keep transition
});
const cardStyle = css({
  // Button Resets
  appearance: 'none',
  border: 'none', // Reset border before applying custom border
  background: 'transparent', // Reset background before applying variant background
  font: 'inherit',
  color: 'inherit',
  textAlign: 'inherit', // Reset text align

  // Original Card Styles
  position: 'relative',
  borderRadius: fluid.radius.md,
  // Reduced left padding to bring content closer to golden tab
  padding: `clamp(0.85rem, 0.75rem + 0.2vw, 1.15rem) ${fluid.space.sm} clamp(0.85rem, 0.75rem + 0.2vw, 1.15rem) clamp(1.5rem, 1.25rem + 0.4vw, 2rem)`,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  minHeight: 'clamp(64px, 56px + 0.8vw, 80px)', // Maintained height
  width: '100%', // Ensure button takes full width
  cursor: 'pointer',
  borderWidth: fluid.border.thin,
  borderStyle: 'solid',
  borderColor: 'var(--card-border-color)', // Use CSS variable
  boxShadow: getShadow('sm'), // Base shadow, elevation prop overrides this
  willChange: 'transform, opacity, box-shadow, background-color',
  transform: 'translateZ(0)', // Base transform
  backfaceVisibility: 'hidden',
  transformOrigin: 'center center',
  borderLeftWidth: 'clamp(3px, 2.5px + 0.15vw, 5px)',
  borderLeftColor: 'var(--card-border-color)', // Use CSS variable
  outline: 'none', // Ensure outline is none by default
  transition: 'all 0.3s ease-out',

  // Pressed State (applies to button)
  '&[data-pressed="true"]': { // Use data attribute selector
    transform: 'translateZ(0) scale(0.985)',
    transition: 'transform 0.2s cubic-bezier(0.19, 1, 0.22, 1)'
  }
});
const cardWithDescriptionStyle = css({
  flexDirection: 'column',
  alignItems: 'flex-start',
  height: 'auto',
  minHeight: 'clamp(120px, 100px + 1.2vw, 160px)', // Maintained height
  // Reduced left padding to match standard card
  padding: `clamp(1.1rem, 0.95rem + 0.3vw, 1.5rem) ${fluid.space.sm} clamp(1.1rem, 0.95rem + 0.3vw, 1.5rem) clamp(1.5rem, 1.25rem + 0.4vw, 2rem)`,
});
const goldenTabStyle = css({
  position: 'absolute',
  // Moved the tab closer to the content
  left: 'clamp(0.75rem, 0.65rem + 0.97vw, 1rem)',
  top: '40%',
  width: 'clamp(3px, 2.5px + 0.2vw, 5px)',
  height: '20%', // Dynamic height controlled by animation
  background: 'var(--card-tab-color)', // Use CSS variable
  borderTopRightRadius: fluid.radius.sm,
  borderBottomRightRadius: fluid.radius.sm,
  boxShadow: `0 0 ${fluid.space['2xs']} 0 rgba(var(--colors-primary-rgb), 0.3)`,
  transition: 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
  pointerEvents: 'none',
  zIndex: 1,
  _before: {
    content: '""',
    position: 'absolute',
    left: `calc(-1 * ${fluid.border.thin})`,
    top: '-50%',
    width: `calc(1.8 * ${fluid.border.feature})`,
    height: '200%',
    background: 'linear-gradient(to bottom, transparent, var(--card-tab-color), transparent)', // Use CSS variable
    opacity: '0.2',
    filter: `blur(${fluid.blur.sm})`,
    transition: 'opacity 0.5s ease',
  },
  // Use data attribute selectors for hover/press on parent button
  '[data-hovered="true"] &': {
    boxShadow: `0 0 ${fluid.space.xs} ${fluid.space['2xs']} rgba(var(--colors-primary-rgb), 0.4)`,
    _before: {
      opacity: '0.7',
    },
  },
  '[data-pressed="true"] &': {
    boxShadow: `0 0 ${fluid.space['2xs']} ${fluid.border.thin} rgba(var(--colors-primary-rgb), 0.3)`,
    _before: {
      opacity: '0.3',
    },
    transition: 'all 0.2s ease-out'
  }
});
const tabGlowContainerStyle = css({
  position: 'absolute',
  left: '0px',
  top: '0',
  borderRadius: fluid.radius.sm,
  width: 'clamp(12px, 12px + 0.5vw, 20px)',
  height: '100%',
  overflow: 'hidden',
  zIndex: '0',
  pointerEvents: 'none',
});
const tabGlowStyle = css({
  position: 'absolute',
  left: `calc(-1 * ${fluid.space['2xs']})`,
  top: '0',
  width: 'clamp(6px, 4px + 0.2vw, 8px)',
  height: '100%',
  background: 'var(--card-tab-color)', // Use CSS variable
  filter: `blur(${fluid.blur.sm})`,
  opacity: '0.25',
  zIndex: '-1',
  pointerEvents: 'none',
});
const headerContainerStyle = css({
  // This container holds icon and label within the button
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%',
  minHeight: 'auto',
  paddingTop: fluid.space.xs,
  marginBottom: '0',
  zIndex: '5', // Ensure header is above background/glows
  pointerEvents: 'none', // Allow clicks to pass through to the button
  '& + div': { // Adjust spacing if description follows
    marginTop: '-0.3rem',
  }
});
const iconContainerStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'clamp(20px, 18px + 0.3vw, 26px)', // Maintained size
  height: 'clamp(20px, 18px + 0.3vw, 26px)', // Maintained size
  // Reduced right margin to bring text closer to icon
  marginRight: 'clamp(0.6rem, 0.5rem + 0.2vw, 0.9rem)', 
  // Reduced left margin to bring icon closer to tab
  marginLeft: 'clamp(0.875rem, 0.75rem + 0.25vw, 1.25rem)', 
  color: 'var(--card-icon-color)', // Use CSS variable
  position: 'relative',
  zIndex: '2', // Above tab/glows
  '& svg': {
    width: '100%',
    height: '100%',
    display: 'block', // Prevent extra space below SVG
  },
});
const glowEffectStyle = css({
  position: 'absolute',
  inset: '0',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
  zIndex: '10', // Above other decorative elements
  color: 'var(--card-glow-color)', // Use CSS variable for base color
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '50%',
    height: '50%',
    borderRadius: '50%',
    filter: `blur(${fluid.blur.lg})`,
    background: 'currentColor', // Inherits color from parent
    opacity: '0.4',
  },
});
// textContainerStyle removed - no longer used
const labelStyle = css({
  fontFamily: 'var(--font-heading, "system-ui")',
  fontSize: 'clamp(0.8rem, 0.5rem + 1.2vw, 1.4rem)',
  fontWeight: '300',
  textTransform: 'uppercase',
  letterSpacing: fluid.letterSpacing.wide,
  lineHeight: '1',
  color: 'var(--card-text-color)', // Use CSS variable
  position: 'relative',
  zIndex: '2',
  marginBottom: '-0.15rem',
  display: 'flex',
  alignItems: 'center',
});
const descriptionStyle = css({
  // Styles for the description div itself
  fontSize: 'clamp(0.8rem, 1.2vw, 1.25rem)', // Simplified fluid typography
  color: 'var(--card-muted-text-color)', // Use CSS variable
  lineHeight: '1.15',
  width: '100%',
  paddingLeft: fluid.space.sm, // Add padding within the description div
  paddingRight: fluid.space.xs,
  zIndex: '2', // Ensure description is above background elements
  wordWrap: 'break-word',
  overflowWrap: 'break-word',
  whiteSpace: 'normal',
  marginTop: '0',
  paddingTop: '0',
  pointerEvents: 'none', // Allow clicks on button below
});
const expandedDescriptionStyle = css({
  // Styles applied when description is expanded
  position: 'relative', // Keep relative positioning within the flow
  top: 'auto',
  paddingTop: '0',
  paddingBottom: fluid.space.xs,
  marginTop: '0', // Ensure no extra margin when expanded
  opacity: '1',
  width: '100%',
  display: 'block',
});
const getElevationShadow = (level: ItemCardProps['elevation']): string => {
  // These shadow values use our fluid space system for responsive scaling
  switch(level) {
    case 0:
      return 'none';
    case 1:
      return `0 ${fluid.space['2xs']} ${fluid.space.xs} -${fluid.space['2xs']} rgba(0,0,0,0.2),
              0 ${fluid.border.thin} ${fluid.border.normal} 0 rgba(0,0,0,0.14),
              0 ${fluid.border.normal} ${fluid.space['2xs']} 0 rgba(0,0,0,0.12)`;
    case 2:
      return `0 ${fluid.space.xs} ${fluid.space.xs} -${fluid.space['2xs']} rgba(0,0,0,0.2),
              0 ${fluid.space['2xs']} ${fluid.space.sm} 0 rgba(0,0,0,0.14),
              0 ${fluid.border.normal} ${fluid.space.xs} 0 rgba(0,0,0,0.12)`;
    case 3:
      return `0 ${fluid.space.sm} ${fluid.space.sm} -${fluid.space.xs} rgba(0,0,0,0.2),
              0 ${fluid.space.xs} ${fluid.space.md} ${fluid.space['2xs']} rgba(0,0,0,0.14),
              0 ${fluid.space.xs} ${fluid.space.md} ${fluid.space['2xs']} rgba(0,0,0,0.12)`;
    case 4:
      return `0 ${fluid.space.sm} ${fluid.space.md} -${fluid.space.sm} rgba(0,0,0,0.2),
              0 ${fluid.space.sm} ${fluid.space.lg} ${fluid.space.sm} rgba(0,0,0,0.14),
              0 ${fluid.space.sm} ${fluid.space.lg} ${fluid.space.sm} rgba(0,0,0,0.12)`;
    case 5:
      return `0 ${fluid.space.md} ${fluid.space.md} -${fluid.space.md} rgba(0,0,0,0.2),
              0 ${fluid.space.md} ${fluid.space.xl} ${fluid.space.md} rgba(0,0,0,0.14),
              0 ${fluid.space.sm} ${fluid.space.lg} ${fluid.space.md} rgba(0,0,0,0.12)`;
    default: // Default to elevation 1 if undefined or invalid
      return `0 ${fluid.space['2xs']} ${fluid.space.xs} -${fluid.space['2xs']} rgba(0,0,0,0.2),
              0 ${fluid.border.thin} ${fluid.border.normal} 0 rgba(0,0,0,0.14),
              0 ${fluid.border.normal} ${fluid.space['2xs']} 0 rgba(0,0,0,0.12)`;
  }
};

// ==========================================================
// CORE/UTILITY CUSTOM HOOKS (Types updated)
// ==========================================================
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const media = window.matchMedia(query);
    const updateMatch = () => setMatches(media.matches);
    
    updateMatch(); // Initial check
    
    // Safari ≤ 14 compatibility check
    if (typeof media.addEventListener === 'function') {
      // Modern browsers including Safari 14+
      media.addEventListener('change', updateMatch);
      return () => media.removeEventListener('change', updateMatch);
    } else {
      // Older browsers including Safari ≤ 14
      media.addListener(updateMatch);
      return () => media.removeListener(updateMatch);
    }
  }, [query]);
  
  return matches;
};
const useReducedMotion = (override?: boolean): boolean => {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  return override !== undefined ? override : prefersReducedMotion;
};
const useItemInteractionState = (
  ref: React.RefObject<HTMLButtonElement | null>, // Updated ref type
  options: {
    isMobile?: boolean;
    isScrolling?: boolean;
    initialTabHeight?: string;
    minTabHeight?: string;
    pressAnimationDuration?: number;
  } = {}
): ItemInteractionStateResult => { // Return type uses CombinedEventHandlersResult
  const {
    isMobile = false,
    isScrolling = false,
    initialTabHeight = '20%',
    minTabHeight = '10%',
    pressAnimationDuration = 800,
  } = options;

  // Focus state tracking
  const [hasDomFocus, setHasDomFocus] = useState(false);
  const focusEventHandlers: FocusEventHandlerProps = useMemo(() => ({
      onFocus: () => setHasDomFocus(true),
      onBlur: () => setHasDomFocus(false),
  }), []);


  // Hover state tracking
  const { isHovered, mousePosition, eventHandlers: hoverHandlers } =
    useHoverEffects(ref, { isMobile, isScrolling });

  // Press-and-hold state tracking using the imported hook
  const {
    isPressed,
    pressProgress,
    tabStyles: pressTabStyles,
    eventHandlers: pressHandlers // Contains mouse & touch handlers
  } = usePressAndHold({
    initialHeight: initialTabHeight,
    minHeight: minTabHeight,
    duration: pressAnimationDuration,
  });

  // Combine all event handlers (No keyboard handlers needed here)
  const combinedHandlers: CombinedEventHandlersResult = useMemo(() => ({
    ...hoverHandlers,
    ...pressHandlers,
    ...focusEventHandlers,
  }), [hoverHandlers, pressHandlers, focusEventHandlers]);

  // Calculate final tab styles based on interaction state priority
  const tabStyles = useMemo(() => {
    // Press state has highest priority
    if (isPressed) {
      return pressTabStyles;
    }
    // Focus state has next priority
    if (hasDomFocus) {
      return { height: '70%', top: '15%' };
    }
    // Hover state next
    if (isHovered && !isScrolling) {
      if (isMobile) {
        return { height: '60%', top: '20%' };
      }
      // Desktop hover with mouse position effect
      const baseHeight = 60;
      const heightRange = 10;
      const calculatedHeight = `${baseHeight + (mousePosition.y * heightRange)}%`;
      const effectiveHeight = baseHeight + (mousePosition.y * heightRange);
      const minTop = 15;
      const maxTop = 85 - effectiveHeight;
      const rawPosition = Math.max(minTop, Math.min(maxTop, mousePosition.y * 100));
      return { height: calculatedHeight, top: `${rawPosition}%` };
    }
    // Default/idle state
    return { height: initialTabHeight, top: '40%' };
  }, [
    isPressed, pressTabStyles, hasDomFocus, isHovered,
    isScrolling, isMobile, mousePosition.y, initialTabHeight
  ]);

  // Generate the appropriate animation variant name
  const getAnimationVariant = useCallback((componentType: string): AnimationVariant => {
    if (isPressed) return "press";
    if (hasDomFocus || isHovered) return "hover";
    return "initial";
  }, [isPressed, hasDomFocus, isHovered]);

  // Calculate showHoverEffects based on internal state
  const showHoverEffects = useMemo(() => isHovered && !hasDomFocus && !isScrolling && !isPressed,
    [isHovered, hasDomFocus, isScrolling, isPressed]
  );

  return {
    isHovered,
    isFocused: hasDomFocus,
    isPressed,
    pressProgress,
    tabStyles,
    getAnimationVariant,
    eventHandlers: combinedHandlers, // Return combined handlers (mouse, touch, focus)
    showHoverEffects,
  };
};

// ==========================================================
// FEATURE-SPECIFIC CUSTOM HOOKS (Types updated)
// ==========================================================
// useActivationHandler has been moved to its own file:
// ../../../../moonlight-ui/hooks/useActivationHandler

// ==========================================================
// EXTRACTED: COMPONENT-SPECIFIC LOGIC HOOKS (Updated)
// ==========================================================

/**
 * Calculates dynamic styling for the card element based on props and state.
 */
const useComponentStyling = (options: ComponentStylingOptions): ComponentStylingResult => {
    const {
        width, minWidth, maxWidth, height, minHeight, padding,
        elevation = 1,
        variant = 'transparent',
        isPressed = false, shouldShowDescription = false,
        isHovered = false, isFocused = false
    } = options;

    // Custom width/height/padding styles
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

    // Outer shadow based on elevation and press state
    const shadowStyle = useMemo(() => ({
        boxShadow: isPressed
            ? getElevationShadow(Math.max(0, (elevation ?? 1) - 1) as ItemCardProps['elevation'])
            : getElevationShadow(elevation)
    }), [elevation, isPressed]);

    // Background styles based on variant (Glass only adds inset shadow now)
    const backgroundStyles = useMemo(() => {
        switch (variant) {
            case 'glass':
                return {
                    background: 'var(--colors-backgroundAlt, rgba(255, 255, 255, 0.1))',
                    backdropFilter: `blur(${fluid.blur.sm})`,
                    // Only inset shadow here
                    boxShadow: `inset 0 ${fluid.border.thin} ${fluid.border.thin} rgba(255, 255, 255, 0.08)`,
                };
            case 'solid':
                return {
                    background: 'var(--colors-background, #ffffff)',
                    backdropFilter: 'none',
                };
            case 'transparent':
            default:
                return {
                    background: 'transparent',
                    backdropFilter: 'none',
                };
        }
    }, [variant]);


    // Z-index based on interaction
    const zIndex = useMemo(() => (isHovered || isFocused || shouldShowDescription || isPressed) ? 5 : 1,
        [isHovered, isFocused, shouldShowDescription, isPressed]
    );

    // Combine outer shadow and background shadow (if any)
    const combinedShadow = useMemo(() => {
        // If glass variant has an inset shadow, combine it with the outer shadow
        if (variant === 'glass' && backgroundStyles.boxShadow) {
            // Ensure outer shadow exists before prepending comma
            return `${shadowStyle.boxShadow ? shadowStyle.boxShadow + ', ' : ''}${backgroundStyles.boxShadow}`;
        }
        // Otherwise, just use the outer shadow
        return shadowStyle.boxShadow;
    }, [variant, backgroundStyles.boxShadow, shadowStyle.boxShadow]);


    return {
        customElementStyles,
        shadowStyle: { boxShadow: combinedShadow }, // Return combined shadow here
        backgroundStyles: { // Return background styles without shadow
             background: backgroundStyles.background,
             backdropFilter: backgroundStyles.backdropFilter
        },
        zIndex
    };
};

/**
 * Determines the appropriate animation variants for Framer Motion elements.
 */
const useAnimationVariants = (options: AnimationVariantsOptions): AnimationVariantsResult => {
    const {
        motionIsReduced = false, isMobile = false, isScrolling = false, isFocused = false,
        initialAnimation = true, showDescription = false, hasDescription = false
    } = options;

    const isInitialRender = useRef(true);
    useEffect(() => {
        const timer = setTimeout(() => { isInitialRender.current = false; }, 0);
        return () => clearTimeout(timer);
    }, []);

    const descriptionInitialVariant = useMemo(() => {
        if (initialAnimation && !motionIsReduced && showDescription && hasDescription && isInitialRender.current) {
            return "initialVisible";
        }
        return "initial";
    }, [initialAnimation, motionIsReduced, showDescription, hasDescription]);

    const itemVariant = useMemo(() => {
        if (motionIsReduced) return isMobile ? "staticMobile" : "visible";
        if (isScrolling) return isMobile ? "staticMobile" : "visible";
        return isMobile ? "visibleMobile" : "visible";
    }, [isMobile, isScrolling, motionIsReduced]);

    const hoverVariant = useMemo(() => {
        if (motionIsReduced || isScrolling || isFocused) return undefined;
        return isMobile ? "hoverMobile" : "hover";
    }, [isMobile, isScrolling, motionIsReduced, isFocused]);

    return { descriptionInitialVariant, itemVariant, hoverVariant };
};

/**
 * Combines base event handlers with activation and ripple triggers.
 * (Keyboard handler removed)
 */
const useCombinedEventHandlers = (options: CombinedEventHandlersOptions): CombinedEventHandlersResult => {
    const { baseEventHandlers, triggerRipple, handleActivation } = options;

    // Merges interaction handlers with activation/ripple logic
    const combinedInteractionProps: CombinedEventHandlersResult = useMemo(() => {
        const handlers: CombinedEventHandlersResult = {
            ...baseEventHandlers, // Includes mouse, touch, focus handlers
            onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
                // Trigger ripple and activation logic on click
                triggerRipple(e);
                handleActivation();
                if (baseEventHandlers.onClick) baseEventHandlers.onClick(e);
            },
            // onKeyDown is removed - handled by <button>
        };
        
        return handlers;
    }, [baseEventHandlers, handleActivation, triggerRipple]);

    return combinedInteractionProps;
};


// ==========================================================
// MAIN COMPONENT (ItemCard) - Final Refinements Applied
// ==========================================================
const ItemCard: React.FC<ItemCardProps> = React.memo((props) => {
  const {
    item,
    onClick,
    variant = 'transparent',
    isMobile = false,
    isScrolling = false,
    showDescription = false,
    showGlowEffect = true,
    className,
    style,
    initialAnimation = true,
    animationDelay = 0,
    reducedMotion: reducedMotionOverride,
    width, minWidth, maxWidth, height, minHeight,
    elevation = 1,
    padding,
    pressAnimationDuration = 800,
    initialTabHeight = '20%',
    minTabHeight = '10%',
  } = props;

  // --- Refs (Renamed to 'ref') ---
  const ref = useRef<HTMLButtonElement>(null); // Changed ref type to HTMLButtonElement

  // --- Core Hooks ---
  const motionIsReduced = useReducedMotion(reducedMotionOverride);

  // --- Interaction State Hook ---
  const {
    isHovered, isFocused, isPressed, pressProgress, tabStyles, getAnimationVariant, eventHandlers,
    showHoverEffects
  } = useItemInteractionState(ref, { // Pass renamed ref
    isMobile, isScrolling, initialTabHeight, minTabHeight, pressAnimationDuration,
  });

  // --- UI Effect Hooks ---
  const { triggerRipple } = useRippleEffect(ref, { // Pass renamed ref
      color: item.color,
      isEnabled: !motionIsReduced,
      colorVariable: '--card-tab-color',
      opacity: 0.8, // Increased from default 0.2
      duration: 600, // Increased from default 600ms
      zIndex: 10, // Higher z-index for more prominence
      autoTrigger: false // Disable automatic trigger on pointerdown
  });

  // --- Activation Hook ---
  const handleActivation = useActivationHandler({
      item,
      onClick,
      isMobile,
      elementRef: ref as React.RefObject<HTMLElement>, // Type assertion to fix type compatibility
      feedbackDuration: 100,
      blurAfterActivation: true
  });

  // --- Derived State ---
  const shouldShowDescription = useMemo(() => !!(showDescription && item.description), [showDescription, item.description]);
  const descriptionId = useMemo(() => item.id + "-desc", [item.id]);

  // --- Component Styling Hook ---
  const { customElementStyles, shadowStyle, backgroundStyles, zIndex } = useComponentStyling({
      width, minWidth, maxWidth, height, minHeight, padding,
      elevation, variant, isPressed, shouldShowDescription,
      isHovered, isFocused
  });

  // --- Animation Variants Hook ---
  const { descriptionInitialVariant, itemVariant, hoverVariant } = useAnimationVariants({
      motionIsReduced, isMobile, isScrolling, isFocused, initialAnimation,
      showDescription, hasDescription: !!item.description
  });

  // --- Combined Event Handlers Hook ---
  const combinedInteractionProps = useCombinedEventHandlers({
      baseEventHandlers: eventHandlers, // Pass mouse, touch, focus handlers
      triggerRipple: triggerRipple,
      handleActivation: handleActivation
  });

   // --- CSS Variables for Inline Styling ---
   const cssVariables = useMemo(() => ({
        '--card-border-color': item.color || 'var(--colors-primary)',
        '--card-focus-outline-color': item.color || 'var(--colors-primary)', // Already derived correctly
        '--card-focus-shadow-color': item.color ? `${item.color}40` : 'rgba(var(--colors-primary-rgb), 0.25)',
        '--card-focus-background': 'rgba(var(--colors-primary-rgb, 255, 255, 255), 0.08)',
        '--card-text-color': item.color || 'var(--colors-text)',
        '--card-muted-text-color': item.color ? `${item.color}99` : 'var(--colors-textMuted)',
        '--card-icon-color': item.color || 'var(--colors-primary)',
        '--card-tab-color': item.color || 'var(--colors-primary)',
        '--card-glow-color': item.color || 'var(--colors-primary)',
   } as React.CSSProperties), [item.color]);


  // --- Render ---
  return (
    // Outer container for layout and motion
    <motion.div
      className={className}
      style={{ ...style, zIndex }} // Apply zIndex here
      variants={{
        ...ANIMATIONS.item,
        // Override transform in variants to prevent conflicts with inline styles
        hover: {
          ...ANIMATIONS.item.hover,
          scale: isFocused ? undefined : ANIMATIONS.item.hover.scale, // Don't apply scale if focused
        },
        tap: {
          ...ANIMATIONS.item.tap,
          scale: undefined, // Remove scale from tap variant to avoid conflicts
        }
      }}
      initial={initialAnimation && !motionIsReduced ? "hidden" : itemVariant}
      animate={itemVariant}
      whileHover={hoverVariant}
      whileTap={motionIsReduced ? undefined : "tap"}
      transition={{ delay: initialAnimation ? animationDelay : 0, duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
      layout={!motionIsReduced}
    >
      {/* Use motion.button as the interactive element with proper typing */}
      <motion.button
        ref={ref} // Use renamed ref
        type="button" // Explicit button type
        className={cx(
          cardStyle, // Base styles including resets
          shouldShowDescription && cardWithDescriptionStyle,
          // focusRingStyles class is not needed as styles are inline
          'item-card'
        )}
        style={{
          ...cssVariables,
          ...customElementStyles,
          ...backgroundStyles, // Background/backdrop only
          ...shadowStyle, // Combined outer + inset shadows
          // Conditional transform: Press overrides focus
          transform: isPressed
                ? 'translateZ(0) scale(0.985)' // Press transform
                : isFocused
                ? `translateY(calc(-1 * ${fluid.space['2xs']})) scale(1.03)` // Focus transform
                : undefined, // Default transform (from cardStyle or motion)
          // Conditional focus outline/shadow: Press state shadow overrides focus shadow
          ...(isFocused && !isPressed && { // Apply only if focused BUT NOT pressed
            outline: `2px solid var(--card-focus-outline-color)`,
            // Combine focus ring shadow with the existing shadow (outer or outer+inset)
            boxShadow: `0 0 0 4px var(--card-focus-shadow-color), ${shadowStyle.boxShadow || getElevationShadow(elevation)}`,
            background: 'var(--card-focus-background)', // Apply focus background if needed (might override variant)
          }),
        }}
        // Convert event handlers to MotionButtonProps compatible handlers
        {...(combinedInteractionProps as unknown as MotionButtonProps)}
        data-hovered={isHovered}
        data-focused={isFocused}
        data-pressed={isPressed}
        // tabIndex removed (default for button)
        // role removed (default for button)
        aria-pressed={isPressed} // Only reflect actual press state
        aria-label={item.label}
        aria-describedby={shouldShowDescription ? descriptionId : undefined}
      >
        {/* Ripple effects are now handled directly by the useRippleEffect hook */}
        {/* No need to render ripple elements manually */}

        {/* Icon Glow Effect */}
        <AnimatePresence>
           {showGlowEffect && !shouldShowDescription && !motionIsReduced &&
            (showHoverEffects || isFocused || isPressed) && item.icon && (
            <motion.div
              className={glowEffectStyle}
              style={{
                opacity: isPressed ? 0.5 : 1,
                scale: isPressed ? 0.9 : 1
              }}
              variants={ANIMATIONS.glow}
              initial="initial"
              animate={getAnimationVariant("glow")}
              exit="exit"
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {/* Golden Tab Indicator */}
        <motion.div
            className={goldenTabStyle}
            style={{
              height: motionIsReduced ?
                (isFocused ? '70%' : initialTabHeight) :
                tabStyles.height,
              top: motionIsReduced ?
                (isFocused ? '15%' : '40%') :
                tabStyles.top,
              opacity: isPressed ?
                0.7 + (0.3 * (1 - pressProgress)) :
                1,
            }}
            variants={ANIMATIONS.goldenTab}
            initial="initial"
            animate={getAnimationVariant("goldenTab")}
            aria-hidden="true"
        />

        {/* Subtle Tab Edge Glow */}
        <div className={tabGlowContainerStyle} aria-hidden="true">
          <motion.div
            className={tabGlowStyle}
            variants={ANIMATIONS.tabGlow}
            initial="initial"
            animate={getAnimationVariant("tabGlow")}
          />
        </div>

        {/* Header Container (Wraps Icon and Label) */}
        {/* Pointer events none allows button underneath to capture clicks */}
        <div className={headerContainerStyle} aria-hidden="true">
          {item.icon && (
            <motion.div
              className={iconContainerStyle}
              variants={ANIMATIONS.icon}
              initial="initial"
              animate={getAnimationVariant("icon")}
            >
              {item.icon}
            </motion.div>
          )}
          <motion.div
            className={labelStyle}
            variants={ANIMATIONS.label}
            initial="initial"
            animate={getAnimationVariant("label")}
          >
            {item.label}
          </motion.div>
        </div>

        {/* Description - Animated version */}
        {item.description && (
          <AnimatePresence>
            {shouldShowDescription && !motionIsReduced && (
              <motion.div
                key={descriptionId} // Use stable key
                id={descriptionId}
                className={cx(descriptionStyle, expandedDescriptionStyle)}
                style={{ opacity: isPressed ? 0.8 : 1 }}
                variants={ANIMATIONS.description}
                initial={descriptionInitialVariant}
                animate="visible"
                exit="exit"
                aria-hidden="true" // Hide from AT as it's described-by parent
              >
                {item.description}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Description - Static version */}
        {item.description && shouldShowDescription && motionIsReduced && (
          <div
            id={descriptionId}
            className={cx(descriptionStyle, expandedDescriptionStyle)}
            style={{ marginTop: '0.7rem' }}
            aria-hidden="true" // Hide from AT as it's described-by parent
          >
            {item.description}
          </div>
        )}

      </motion.button> {/* Close motion.button */}
    </motion.div> // Close outer motion.div
  );
});

ItemCard.displayName = 'ItemCard';

export default ItemCard;