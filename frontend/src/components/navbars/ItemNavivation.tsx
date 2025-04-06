'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';

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
 * Color theme interface
 */
export interface Colors {
  primary: string;    // Main accent color
  secondary: string;  // Background color
  tertiary: string;   // Border color
  text: string;       // Text color
  textSecondary: string; // Secondary text color (for descriptions)
  glow: string;       // Glow effect color
}

/**
 * Default color scheme
 */
const DEFAULT_COLORS: Colors = {
  primary: 'var(--color-primary)',
  secondary: 'var(--color-secondary)',
  tertiary: 'var(--color-primary)',
  text: 'var(--color-text)',
  textSecondary: 'var(--color-text)',
  glow: 'var(--color-glow)',
};

/**
 * Props for the ItemNavigation component
 * 
 * @property {NavigationItem[]} items - Array of navigation items to display
 * @property {string} [title] - Optional title displayed above the navigation grid
 * @property {string} [subtitle] - Optional subtitle/description displayed below the title
 * @property {number} [columns=3] - Number of columns in the grid on desktop
 * @property {number} [mobileColumns=1] - Number of columns in the grid on mobile devices
 * @property {number} [tabletColumns=2] - Number of columns in the grid on tablet devices
 * @property {number} [gapSize=1.5] - Gap size between grid items in rem units
 * @property {boolean} [initialAnimation=true] - Whether to animate items on initial render
 * @property {number} [animationStagger=0.05] - Delay between each item's animation in seconds
 * @property {Function} [onItemClick] - Optional callback function when an item is clicked
 * @property {string} [className] - Optional CSS class name for the container
 * @property {boolean} [showSubtitle=false] - Whether to show the subtitle
 * @property {boolean} [transparentCards=true] - Whether to use transparent card backgrounds
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
}

/**
 * Styled component props
 */
interface GridContainerProps {
  $columns: number;
  $mobileColumns: number;
  $tabletColumns: number;
  $gapSize: number;
}

interface CardProps {
  $isHovered: boolean;
  $color?: string;
  $transparent: boolean;
}

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
// STYLED COMPONENTS
// ==========================================================

const Container = styled.div`
  width: 90%;
  max-width: 95vw;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  margin-left: 2.5%;
  margin-right: 5%;
  
  @media (min-width: 1400px) {
    max-width: 90vw;
  }
`;

const TitleContainer = styled.div`
  margin-left: 1rem;
  margin-top: 2.5rem;
  text-align: left;
  margin-bottom: 2.5rem;
`;

const Title = styled.h2`
  font-family: var(--font-heading, 'system-ui');
  font-size: min(2.5rem, 5vw);
  font-weight: 200;
  letter-spacing: 0.2em;
  color: ${DEFAULT_COLORS.primary};
  text-transform: uppercase;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: min(1.125rem, 2.5vw);
  color: ${DEFAULT_COLORS.textSecondary};
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
`;

const GridContainer = styled(motion.div)<GridContainerProps>`
  display: grid;
  grid-template-columns: repeat(${props => props.$columns}, minmax(min(250px, 22vw), 1fr));
  gap: ${props => props.$gapSize}rem;
  width: 100%;
  max-width: 100%;
  
  @media (min-width: 1400px) {
    grid-template-columns: repeat(${props => props.$columns}, minmax(min(280px, 24vw), 1fr));
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(${props => props.$tabletColumns}, minmax(min(220px, 30vw), 1fr));
  }
  
  @media (max-width: 640px) {
    grid-template-columns: repeat(${props => props.$mobileColumns}, 1fr);
    gap: ${props => props.$gapSize * 0.75}rem;
  }
`;

const Card = styled(motion.div)<CardProps>`
  position: relative;
  background: ${props => props.$transparent 
    ? 'transparent' 
    : DEFAULT_COLORS.secondary};
  backdrop-filter: ${props => props.$transparent ? 'none' : 'blur(8px)'};
  border-radius: 8px;
  padding: 0.85rem 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  min-height: 54px;
  height: auto;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.$transparent 
    ? 'rgba(0, 0, 0, 0.05) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px'
    : '0 4px 20px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.05)'};
  border: ${props => props.$isHovered ? '0.3px' : '0.1px'} solid ${props => 
    props.$color 
      ? props.$color 
      : DEFAULT_COLORS.tertiary};
  
  /* Add glow effect */
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    background: ${props => 
      props.$color 
        ? `${props.$color}` 
        : DEFAULT_COLORS.primary};
    filter: blur(30px);
    z-index: -1;
    opacity: ${props => props.$isHovered ? 0.15 : 0};
    transform: translate(-50%, -50%) scale(${props => props.$isHovered ? 1 : 0.8});
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  
  /* Shine effect overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    z-index: 2;
    transform: translateX(-100%);
    transition: transform 0s;
  }
  
  &:hover::before {
    transform: translateX(100%);
    transition: transform 1.2s cubic-bezier(0.19, 1, 0.22, 1);
  }
  
  /* Keyboard focus styles */
  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${props => 
      props.$color 
        ? `${props.$color}` 
        : DEFAULT_COLORS.primary};
    border-color: ${props => 
      props.$color 
        ? `${props.$color}` 
        : DEFAULT_COLORS.primary};
  }
  
  @media (min-width: 1400px) {
    padding: 0.9rem 1.25rem;
    min-height: 60px;
  }
  
  @media (max-width: 640px) {
    padding: 0.75rem;
    height: 100%;
    background: ${props => 
      props.$color 
        ? `${props.$color}` 
        : DEFAULT_COLORS.primary};
    filter: blur(30px);
    z-index: -1;
    opacity: ${props => props.$isHovered ? 0.15 : 0};
    transform: translate(-50%, -50%) scale(${props => props.$isHovered ? 1 : 0.8});
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  
  /* Shine effect overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    z-index: 2;
    transform: translateX(-100%);
    transition: transform 0s;
  }
  
  &:hover::before {
    transform: translateX(100%);
    transition: transform 1.2s cubic-bezier(0.19, 1, 0.22, 1);
  }
  
  /* Keyboard focus styles */
  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${props => 
      props.$color 
        ? `${props.$color}` 
        : DEFAULT_COLORS.primary};
    border-color: ${props => 
      props.$color 
        ? `${props.$color}` 
        : DEFAULT_COLORS.primary};
  }
  
  @media (min-width: 1400px) {
    padding: 0.9rem 1.25rem;
    min-height: 60px;
  }
  
  @media (max-width: 640px) {
    padding: 0.75rem;
    min-height: 50px;
  }
`;

const IconContainer = styled(motion.div)<{ $color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  margin-right: 0.8rem;
  color: ${props => props.$color || DEFAULT_COLORS.primary};
  
  svg {
    width: 100%;
    height: 100%;
  }
  
  @media (min-width: 1400px) {
    width: 28px;
    height: 28px;
  }
`;

const GoldenTab = styled.div<{ $color?: string }>`
  position: absolute;
  left: 10px;
  top: 40%;
  width: 3px;
  height: 20%;
  background: ${props => props.$color || DEFAULT_COLORS.primary};
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;
  transition: height 0.3s ease, top 0.3s ease;
  opacity: 1;
  
  ${Card}:hover &, ${Card}:focus-visible & {
    height: 60%;
    top: 20%;
  }
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
`;

const GlowEffect = styled(motion.div)<{ $color?: string }>`
  position: absolute;
  top: 50%;
  left: 15%;
  transform: translate(-50%, -50%);
  width: 35px;
  height: 35px;
  background: ${props => props.$color || DEFAULT_COLORS.glow};
  border-radius: 50%;
  filter: blur(20px);
  z-index: -1;
`;

const Label = styled(motion.div)<{ $color?: string }>`
  font-family: var(--font-heading, 'system-ui');
  font-size: 0.85rem;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${props => props.$color || DEFAULT_COLORS.text};
  
  @media (min-width: 1400px) {
    font-size: 0.9rem;
  }
`;

const Description = styled(motion.div)<{ $color?: string }>`
  font-size: 0.7rem;
  color: ${props => props.$color ? `${props.$color}99` : DEFAULT_COLORS.textSecondary};
  margin-top: 0.25rem;
  line-height: 1.4;
  max-width: 90%;
  opacity: 0;
  max-height: 0;
  overflow: hidden;
  transition: opacity 0.3s ease, max-height 0.3s ease, margin-top 0.3s ease;
  
  ${Card}:hover & {
    opacity: 1;
    max-height: 60px;
    margin-top: 0.25rem;
  }
  
  @media (min-width: 1400px) {
    font-size: 0.75rem;
  }
`;

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
  ref?: React.Ref<HTMLElement>;
}

// Use React.forwardRef to handle the ref
const Item = React.memo(React.forwardRef<HTMLElement, ItemProps>(({ 
  item, 
  onItemClick, 
  index, 
  animationStagger,
  transparentCards,
}, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const controls = useAnimation();
  
  // Calculate staggered animation delay
  const animationDelay = useMemo(() => {
    return index * animationStagger;
  }, [index, animationStagger]);
  
  // Handle hover events
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    controls.start('hover');
  }, [controls]);
  
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    controls.start('visible');
  }, [controls]);
  
  // Handle item click
  const handleClick = useCallback(() => {
    if (onItemClick) {
      onItemClick(item);
    } else if (item.href) {
      router.push(item.href);
    }
  }, [item, onItemClick, router]);
  
  return (
    <motion.div
      variants={ANIMATIONS.item}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      custom={animationDelay}
      transition={{
        delay: animationDelay,
      }}
      ref={ref as React.RefObject<HTMLDivElement>}
    >
      <Card
        $isHovered={isHovered}
        $color={item.color}
        $transparent={transparentCards}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        tabIndex={0}
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
          }
        }}
      >
        <GoldenTab $color={item.color} />
        
        {item.icon && (
          <>
        <IconContainer 
          variants={ANIMATIONS.icon}
          $color={item.color}
        >
          {item.icon}
        </IconContainer>
        {isHovered && <GlowEffect variants={ANIMATIONS.glow} $color={item.color} />}
          </>
        )}
        
        <TextContainer>
          <Label variants={ANIMATIONS.label} $color={item.color}>
        {item.label}
          </Label>
          
          {item.description && (
        <Description $color={item.color}>
          {item.description}
        </Description>
          )}
        </TextContainer>
      </Card>
    </motion.div>
  );
}));

// Ensure we add displayName to the forwarded ref component
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
  tabletColumns = 1,
  gapSize = 1.5,
  initialAnimation = true,
  animationStagger = 0.05,
  onItemClick,
  className,
  showSubtitle = false,
  transparentCards = true,
}) => {
  const gridControls = useAnimation();
  
  // useRef for accessing the container element DOM node
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Refs to store navigation items for keyboard navigation
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  
  // State to track the currently focused item index
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  
  // This effect runs on client-side only, ensuring proper hydration in Next.js
  useEffect(() => {
    // Initialize any client-side specific functionality
    if (containerRef.current) {
      // Ensure we have access to the DOM element
      containerRef.current.dataset.hydrated = 'true';
      
      // Initialize refs array with the correct length
      itemRefs.current = itemRefs.current.slice(0, items.length);
    }
  }, [items.length]);
  
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
  
  // Start animation when component mounts
  useEffect(() => {
    if (initialAnimation) {
      gridControls.start('visible');
    }
  }, [initialAnimation, gridControls]);
  
  // Memoize items array to prevent unnecessary re-renders
  const memoizedItems = useMemo(() => items, [items]);
  
  return (
    <Container 
      className={className} 
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      {(title || (subtitle && showSubtitle)) && (
        <TitleContainer>
          {title && <Title>{title}</Title>}
          {subtitle && showSubtitle && <Subtitle>{subtitle}</Subtitle>}
        </TitleContainer>
      )}
      
      <GridContainer
        $columns={columns}
        $mobileColumns={mobileColumns}
        $tabletColumns={tabletColumns}
        $gapSize={gapSize}
        variants={ANIMATIONS.grid}
        initial={initialAnimation ? "hidden" : "visible"}
        animate={gridControls}
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
      </GridContainer>
    </Container>
  );
};

export default ItemNavigation;