'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { css, cx } from "../../../styled-system/css"; // PandaCSS import

// ==========================================================
// ANIMATION VARIANTS - ENHANCED
// ==========================================================

/**
 * Animation variants with improved transitions and effects
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
      transition: { 
        duration: 0.5,
        ease: [0.19, 1, 0.22, 1],
        y: { duration: 0.5, ease: [0.19, 1, 0.22, 1] },
        opacity: { duration: 0.4, ease: "easeOut" },
        scale: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
        rotateX: { duration: 0.5, ease: [0.19, 1, 0.22, 1] }
      }
    },
    hover: {
      y: -6, // Slightly more pronounced lift
      scale: 1.04,
      boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.1)",
      transition: { 
        duration: 0.4,
        ease: [0.19, 1, 0.22, 1],
        y: { type: "spring", stiffness: 300, damping: 15 }, // Spring physics for natural movement
        scale: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }, // Elastic ease for scale
        boxShadow: { duration: 0.4, ease: "easeOut" }
      }
    },
    tap: {
      scale: 0.97,
      y: -2, // Maintain some lift even when pressed
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
      rotate: 5, // Slight rotation for more playful effect
      transition: { 
        duration: 0.4, 
        ease: [0.34, 1.56, 0.64, 1], // Elastic easing for bounce effect
        scale: { type: "spring", stiffness: 400, damping: 10 },
        rotate: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
      } 
    }
  },
  
  glow: {
    initial: { 
      opacity: 0.2,
      scale: 0.8
    },
    hover: { 
      opacity: 0.6,
      scale: 1.1,
      transition: { 
        duration: 2.5, 
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse" as const // Type assertion to fix the error
      } 
    }
  },
  
  label: {
    initial: { 
      y: 0
      // Removed letterSpacing to avoid affecting text with spring physics
    },
    hover: { 
      y: -3, // Slightly more pronounced lift
      // No letterSpacing animation
      transition: { 
        duration: 0.3, 
        ease: "easeOut" // Simpler easing for text movement
      } 
    }
  },
  
  // Enhanced shine effect - diagonal sweep animation
  shine: {
    initial: {
      opacity: 0,
      x: '-100%',
    },
    hover: {
      opacity: 0.3, // Fixed value for opacity
      x: '200%', // Move further for complete exit
      transition: {
        duration: 1.8,
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: 2, // Wait between sweeps
        repeatType: "loop" as const
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
  
  // New animation for tab glow
  tabGlow: {
    initial: {
      opacity: 0.3,
      width: '100%',
      height: '100%',
    },
    hover: {
      opacity: 0.7, // Fixed value instead of array to avoid type issues
      width: '110%', // Fixed value instead of array
      height: '110%', // Fixed value instead of array
      transition: {
        opacity: { duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" as const },
        width: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" as const },
        height: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" as const }
      }
    }
  },
  
  // New animation for description text
  description: {
    initial: {
      opacity: 0,
      height: 0,
      y: 5
    },
    hover: {
      opacity: 1,
      height: "auto",
      y: 0,
      transition: {
        opacity: { duration: 0.4, ease: "easeOut" },
        height: { duration: 0.4, ease: [0.19, 1, 0.22, 1] },
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

// Grid container style
const gridContainerStyle = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(1, minmax(120px, 1fr))', // Default for smallest screens
  gap: '1.5rem',
  width: '100%',
  maxWidth: '100%',
  
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

// Enhanced card style with better transitions
const cardStyle = css({
  position: 'relative',
  backgroundColor: 'transparent',
  borderRadius: '12px', // Slightly larger border radius for modern look
  padding: '0.85rem 1rem',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  minHeight: '54px',
  height: 'auto',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'all 0.45s cubic-bezier(0.19, 1, 0.22, 1)', // Improved transition curve
  borderWidth: '0.1px',
  borderStyle: 'solid',
  borderColor: 'primary',
  boxShadow: 'rgba(0, 0, 0, 0.05) 0px 2px 6px 0px, rgba(27, 31, 35, 0.08) 0px 0px 0px 1px',
  willChange: 'transform, box-shadow, border-color', // Optimizes animations for these properties
  
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
    minHeight: '60px'
  },
  
  '@media (max-width: 640px)': {
    padding: '0.75rem',
    minHeight: '50px',
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
  left: '0',
  top: '0',
  width: '10px',
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
  background: 'primary',
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

// Enhanced glow effect style - more dynamic
const glowEffectStyle = css({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  filter: 'blur(15px)',
  zIndex: '1',
  background: 'radial-gradient(circle, var(--colors-glow) 0%, transparent 70%)', // Gradient for better glow
});

// Shine effect style - for the diagonal shine animation
const shineEffectStyle = css({
  position: 'absolute',
  top: '-50%',
  left: '-100%',
  width: '60%',
  height: '200%',
  background: 'linear-gradient(to right, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
  transform: 'rotate(25deg)', // Diagonal angle
  zIndex: '1',
  pointerEvents: 'none', // Ensure it doesn't interfere with interactions
});

// Text container style
const textContainerStyle = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  zIndex: '2',
  position: 'relative',
  overflow: 'hidden', // For the description animation
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

// Enhanced description style - using Framer Motion instead of CSS transitions
const descriptionStyle = css({
  fontSize: 'clamp(0.65rem, 0.6rem + 0.25vw, 0.75rem)',
  color: 'textMuted',
  lineHeight: '1.4',
  maxWidth: '95%', // Slightly wider
  position: 'relative',
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
}

// ==========================================================
// ITEM COMPONENT - ENHANCED
// ==========================================================

interface ItemProps {
  item: NavigationItem;
  onItemClick?: (item: NavigationItem) => void;
  index: number;
  animationStagger: number;
  transparentCards: boolean;
  isFocused?: boolean;
}

// Enhanced Item component with better animations and interactivity
const Item = React.memo(React.forwardRef<HTMLElement, ItemProps>(({ 
  item, 
  onItemClick, 
  index, 
  animationStagger,
  transparentCards,
  isFocused
}, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const itemRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Calculate staggered animation delay
  const animationDelay = useMemo(() => {
    return index * animationStagger;
  }, [index, animationStagger]);
  
  // Handle mouse movement for dynamic effects
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!itemRef.current) return;
    
    const rect = itemRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element
    const y = e.clientY - rect.top; // y position within the element
    
    // Calculate normalized position (0 to 1)
    const normalizedX = x / rect.width;
    const normalizedY = y / rect.height;
    
    setMousePosition({ x: normalizedX, y: normalizedY });
  }, []);
  
  // Handle hover events
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);
  
  // Handle item click
  const handleClick = useCallback(() => {
    // Add a touch feedback for mobile
    const isTouchDevice = window.matchMedia('(max-width: 640px)').matches;
    
    if (isTouchDevice) {
      setIsHovered(true);
      // Add a small delay for touch feedback
      setTimeout(() => {
        if (onItemClick) {
          onItemClick(item);
        } else if (item.href) {
          router.push(item.href);
        }
        // Reset hover state after navigation
        setTimeout(() => setIsHovered(false), 100);
      }, 150);
    } else {
      if (onItemClick) {
        onItemClick(item);
      } else if (item.href) {
        router.push(item.href);
      }
    }
  }, [item, onItemClick, router]);
  
  // Calculate dynamic tab height based on mouse position
  const tabHeight = useMemo(() => {
    if (!isHovered) return '20%';
    // Make the tab height respond to mouse Y position - limited effect to preserve design
    const baseHeight = 60; // Base height percentage
    const variableHeight = 10; // Reduced additional height based on mouse position
    return `${baseHeight + (mousePosition.y * variableHeight)}%`;
  }, [isHovered, mousePosition.y]);
  
  // Calculate dynamic tab position based on mouse position
  const tabTop = useMemo(() => {
    if (!isHovered) return '40%';
    // Center the tab around the mouse Y position, with constraints
    const position = Math.max(15, Math.min(85 - parseFloat(tabHeight), mousePosition.y * 100));
    return `${position}%`;
  }, [isHovered, mousePosition.y, tabHeight]);
  
  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      variants={ANIMATIONS.item}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      custom={animationDelay}
      transition={{
        delay: animationDelay,
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
        onMouseEnter={handleMouseEnter}
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
        {/* Enhanced golden tab indicator that responds to mouse position */}
        <motion.div 
          className={goldenTabStyle}
          style={{ 
            background: item.color || 'var(--colors-primary)',
            height: isHovered ? tabHeight : '20%', 
            top: isHovered ? tabTop : '40%',
            left: '10px', // Ensuring the left offset is applied here as well
          }}
          variants={ANIMATIONS.goldenTab}
          initial="initial"
          animate={isHovered ? "hover" : "initial"}
          aria-hidden="true"
        />
        
        {/* Tab glow effect */}
        <div className={tabGlowContainerStyle} aria-hidden="true">
          <motion.div
            className={tabGlowStyle}
            style={{ background: item.color || 'var(--colors-primary)' }}
            variants={ANIMATIONS.tabGlow}
            initial="initial"
            animate={isHovered ? "hover" : "initial"}
          />
        </div>
        
        {/* Diagonal shine effect */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className={shineEffectStyle}
              variants={ANIMATIONS.shine}
              initial="initial"
              animate="hover"
              exit="initial"
              aria-hidden="true"
            />
          )}
        </AnimatePresence>
        
        {item.icon && (
          <>
            <motion.div 
              className={iconContainerStyle}
              style={{ color: item.color || 'var(--colors-primary)' }}
              variants={ANIMATIONS.icon}
              aria-hidden="true"
            >
              {item.icon}
            </motion.div>
            
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  className={glowEffectStyle}
                  style={{ background: item.color || 'var(--colors-glow)' }}
                  variants={ANIMATIONS.glow}
                  initial="initial"
                  animate="hover"
                  exit="initial"
                  aria-hidden="true"
                />
              )}
            </AnimatePresence>
          </>
        )}
        
        <div className={textContainerStyle}>
          <motion.div
            className={labelStyle}
            style={{ color: item.color || 'var(--colors-text)' }}
            variants={ANIMATIONS.label}
            id={`label-${item.id}`}
          >
            {item.label}
          </motion.div>
          
          {item.description && (
            <AnimatePresence>
              <motion.div 
                className={descriptionStyle}
                style={{ color: item.color ? `${item.color}99` : 'var(--colors-textMuted)' }}
                id={`desc-${item.id}`}
                variants={ANIMATIONS.description}
                initial="initial"
                animate={isHovered || window.matchMedia('(max-width: 640px)').matches ? "hover" : "initial"}
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
  reducedMotion = false
}) => {
  // useRef for accessing the container element DOM node
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Refs to store navigation items for keyboard navigation
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  
  // State to track the currently focused item index
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  
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
      
      // Add class to handle touch devices
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (isTouchDevice) {
        containerRef.current.classList.add('touch-device');
      }
    }
    
    // Check if user prefers reduced motion
    const prefersReducedMotion = reducedMotion || 
      (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    
    // Start animation when component mounts, unless reduced motion is preferred
    if (initialAnimation && !prefersReducedMotion) {
      setTimeout(() => {
        gridControls.start('visible');
      }, 100);
    } else {
      // If reduced motion is preferred, immediately show the content
      gridControls.set('visible');
    }
    
    // Add resize event listener to handle orientation changes on mobile
    const handleResize = () => {
      if (initialAnimation && !prefersReducedMotion) {
        // Reset animation on resize for smoother transitions
        gridControls.set("hidden");
        setTimeout(() => {
          gridControls.start("visible");
        }, 100);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [initialAnimation, gridControls, items.length, reducedMotion]);
  
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
        initial={initialAnimation ? "hidden" : "visible"}
        animate={gridControls}
        aria-labelledby={title ? "navigation-title" : undefined}
        aria-describedby={subtitle && showSubtitle ? "navigation-subtitle" : undefined}
      >
        {memoizedItems.map((item, index) => (
          <Item
            key={item.id}
            item={item}
            onItemClick={onItemClick}
            index={index}
            animationStagger={animationStagger}
            transparentCards={transparentCards}
            ref={(el: HTMLElement | null) => {
              // Store the element reference in the refs array
              if (el) {
                itemRefs.current[index] = el;
              }
            }}
            isFocused={focusedIndex === index}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default ItemNavigation;