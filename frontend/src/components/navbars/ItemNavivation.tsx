'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useAnimation } from 'framer-motion';
import { css, cx } from "../../../styled-system/css"; // Adjust path as needed

// ==========================================================
// ANIMATION VARIANTS
// ==========================================================

/**
 * Animation variants for different components
 */
const ANIMATIONS = {
  grid: {
    hidden: { 
      opacity: 0
    },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2,
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1.0] 
      }
    }
  },
  
  item: {
    hidden: { 
      y: 15, 
      opacity: 0,
      scale: 0.95
    },
    visible: { 
      y: 0, 
      opacity: 1,
      scale: 1,
      transition: { 
        duration: 0.4,
        ease: [0.19, 1, 0.22, 1] 
      }
    },
    hover: {
      y: -4,
      scale: 1.04,
      transition: { 
        duration: 0.25,
        ease: [0.19, 1, 0.22, 1] 
      }
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
      scale: 1 
    },
    hover: { 
      scale: 1.08, 
      transition: { 
        duration: 0.3, 
        ease: [0.19, 1, 0.22, 1] 
      } 
    }
  },
  
  glow: {
    initial: { 
      opacity: 0.3,
      scale: 0.9
    },
    hover: { 
      opacity: 0.7,
      scale: 1.1,
      transition: { 
        duration: 0.5, 
        ease: [0.19, 1, 0.22, 1] 
      } 
    }
  },
  
  label: {
    initial: { 
      y: 0 
    },
    hover: { 
      y: -2, 
      transition: { 
        duration: 0.3, 
        ease: [0.19, 1, 0.22, 1] 
      } 
    }
  },
  
  shine: {
    initial: {
      opacity: 0,
      x: '-100%',
    },
    hover: {
      opacity: 0.3,
      x: '100%',
      transition: {
        duration: 1.2,
        ease: 'easeInOut',
      },
    },
  }
};

// ==========================================================
// STYLE DEFINITIONS
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

// Card style
const cardStyle = css({
  position: 'relative',
  backgroundColor: 'transparent',
  borderRadius: '8px',
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
  transition: 'all 0.3s ease',
  borderWidth: '0.1px',
  borderStyle: 'solid',
  borderColor: 'primary',
  boxShadow: 'rgba(0, 0, 0, 0.05) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px',
  
  // Modified to have tab-like left border
  borderLeftWidth: '4px',
  
  // Focus styles
  _focusVisible: {
    outline: 'none',
    boxShadow: '0 0 0 2px var(--colors-primary)',
    borderColor: 'text',
    background: 'rgba(255, 255, 255, 0.05)'
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
    boxShadow: 'rgba(0, 0, 0, 0.05) 0px 1px 2px 0px',
  }
});

// Solid card variant
const cardSolidStyle = css({
  background: 'backgroundAlt',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
});

// Golden tab style (the expandable line element)
const goldenTabStyle = css({
  // Current properties
  position: 'absolute',
  left: '10px',
  top: '40%',
  width: '3px',
  height: '20%',
  background: 'primary',
  borderTopRightRadius: '2px',
  borderBottomRightRadius: '2px',
  
  // Enhanced properties
  boxShadow: '0 0 4px 0 rgba(var(--colors-primary), 0.1)', // Subtle ambient glow
  transition: 'height 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), boxShadow 0.5s ease',
  
  // Hover state with enhanced glow
  '[role="link"]:hover &, [role="button"]:hover &': {
    height: '60%',
    top: '20%',
    boxShadow: '0 0 8px 2px rgba(var(--colors-primary), 0.25), 0 0 2px 0px rgba(var(--colors-primary), 0.5)', // Intensified glow
  }
});

// Icon container style
const iconContainerStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '26px',
  height: '26px',
  marginRight: '0.8rem',
  marginLeft: '0.8rem', // Added margin to make space for the golden tab
  color: 'primary',
  
  '& svg': {
    width: '100%',
    height: '100%'
  },
  
  '@media (min-width: 1400px)': {
    width: '28px',
    height: '28px'
  }
});

// Glow effect style
const glowEffectStyle = css({
  position: 'absolute',
  top: '50%',
  left: '15%',
  transform: 'translate(-50%, -50%)',
  width: '35px',
  height: '35px',
  borderRadius: '50%',
  filter: 'blur(20px)',
  zIndex: '-1'
});

// Text container style
const textContainerStyle = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center'
});

// Label style
const labelStyle = css({
  fontFamily: 'var(--font-heading, "system-ui")',
  fontSize: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.9rem)',
  fontWeight: '300',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'text'
});

// Description style
const descriptionStyle = css({
  fontSize: 'clamp(0.65rem, 0.6rem + 0.25vw, 0.75rem)',
  color: 'textMuted',
  marginTop: '0.25rem',
  lineHeight: '1.4',
  maxWidth: '90%',
  opacity: '0',
  maxHeight: '0',
  overflow: 'hidden',
  transition: 'opacity 0.3s ease, max-height 0.3s ease, margin-top 0.3s ease',
  
  '@media (max-width: 640px)': {
    opacity: '0.7',
    maxHeight: '40px',
    marginTop: '0.25rem',
  }
});

// Description visible style (used with Framer Motion)
const descriptionVisibleStyle = css({
  opacity: '1',
  maxHeight: '60px',
  marginTop: '0.25rem'
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
// ITEM COMPONENT
// ==========================================================

interface ItemProps {
  item: NavigationItem;
  onItemClick?: (item: NavigationItem) => void;
  index: number;
  animationStagger: number;
  transparentCards: boolean;
  isFocused?: boolean;
}

// Item component to render each navigation item
const Item = React.memo(React.forwardRef<HTMLElement, ItemProps>(({ 
  item, 
  onItemClick, 
  index, 
  animationStagger,
  transparentCards,
}, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  
  // Calculate staggered animation delay
  const animationDelay = useMemo(() => {
    return index * animationStagger;
  }, [index, animationStagger]);
  
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
        {/* Golden tab indicator that expands on hover */}
        <div 
          className={goldenTabStyle}
          style={{ background: item.color || 'var(--colors-primary)' }}
          aria-hidden="true"
        />
        
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
            
            {isHovered && (
              <motion.div
                className={glowEffectStyle}
                style={{ background: item.color || 'var(--colors-glow)' }}
                variants={ANIMATIONS.glow}
                initial="initial"
                animate="hover"
                aria-hidden="true"
              />
            )}
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
            <div 
              className={cx(
                descriptionStyle,
                isHovered && descriptionVisibleStyle
              )}
              style={{ color: item.color ? `${item.color}99` : 'var(--colors-textMuted)' }}
              id={`desc-${item.id}`}
            >
              {item.description}
            </div>
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
 * ItemNavigation Component
 * 
 * A responsive grid-based navigation component with smooth animations
 * and hover effects. Designed to provide a rich, interactive experience.
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