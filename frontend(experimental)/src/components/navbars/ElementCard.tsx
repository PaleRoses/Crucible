import React, { useRef, useState, useEffect, useCallback, useMemo, RefObject } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import styled from 'styled-components';
// Import for virtualization
import { FixedSizeList as List } from 'react-window';

/**
 * ElementCard Component - Information Display with Advanced Scroll Behavior
 * 
 * Creates a sophisticated display with a three-phase scroll behavior:
 * 1. Normal Flow: Initially scrolls with the page
 * 2. Fixed Position: Sticks to viewport when scrolling through content
 * 3. Release: Returns to normal flow after scrolling past component
 * 
 * Features:
 * - Responsive design with mobile navigation
 * - Optimized scroll and rendering performance
 * - Memory-efficient component lifecycle
 * - Smooth animations and interactions
 * - Highly parameterizable for customization
 * - Advanced memoization for better performance
 * - Virtualization for long content lists
 * - Optimized scroll and resize handling with proper batching
 * - ENHANCED: Information-agnostic design for various content types
 * - ENHANCED: Stats system decoupled from navigation
 * 
 * @param {Object} props - Component props
 * @param {Object} props.data - Main data object
 * @param {string} props.data.title - Main title 
 * @param {string} props.data.subheader - Subtitle or description
 * @param {string} [props.data.tagline] - Short tagline or subtitle
 * @param {Array<string|React.ReactNode>} [props.data.description] - Description paragraphs
 * @param {Array<{value: string|number, label: string}>} [props.data.stats] - Global statistics to display
 * @param {Object} [props.animationConfig] - Animation configuration
 * @param {number} [props.animationConfig.threshold=0.5] - Visibility threshold to trigger animation
 * @param {boolean} [props.animationConfig.once=true] - Whether animation should only run once
 * @param {number} [props.animationConfig.initialY=30] - Initial Y offset for animation
 * @param {number} [props.animationConfig.duration=0.8] - Animation duration in seconds
 * @param {Array<{title?: string, content: string|React.ReactNode}>} [props.additionalSections=[]] - Additional content sections
 * @param {Function} [props.onSectionChange=null] - Callback when active section changes
 * @param {number} [props.topOffset=100] - Top offset for fixed positioning phase
 * @param {string} [props.highlightColor='#bfad7f'] - Primary highlight color
 * @param {string} [props.textColor='rgba(224, 224, 224, 0.7)'] - Text color
 * @param {number} [props.minLineWidth=10] - Minimum width for navigation lines
 * @param {number} [props.maxLineWidth=40] - Maximum width for navigation lines
 * @param {string} [props.fontFamily='"Garamond", "Adobe Caslon Pro", serif'] - Font family for text
 * @param {Array<{id: string, label: string, content?: string|React.ReactNode, stats?: Array<{value: string|number, label: string}>, sectionTitle?: string}>} [props.navigationItems] - Navigation items with optional per-section stats and titles
 * @param {number} [props.contentCompression=0] - Content compression factor (0-10)
 * @param {number} [props.maxSections=8] - Maximum number of sections to support
 * @param {number} [props.columnSpacing=2] - Spacing between sidebar and content columns (rem)
 * @param {number} [props.taglineNavSpacing=3] - Space between tagline and navigation (rem)
 * @param {boolean} [props.useVirtualization=true] - Whether to use virtualization for long lists
 * @param {number} [props.virtualItemHeight=140] - Height for virtualized list items (px)
 * @param {number} [props.virtualListThreshold=10] - Minimum items to use virtualization
 * @param {string} [props.statsPosition='bottom'] - Position for global stats: 'top', 'bottom', or 'none'
 * @param {boolean} [props.showOverview=true] - Whether to show the overview/about section
 */

/**
 * =====================================================================
 * TYPE DEFINITIONS & INTERFACES
 * Comprehensive type system for component props and data structures
 * =====================================================================
 */

interface StatItem {
  value: string | number;
  label: string;
}

interface NavigationItemStats {
  stats?: StatItem[];
}

interface NavigationItem extends NavigationItemStats {
  id: string;
  label: string;
  content?: React.ReactNode | string;
  sectionTitle?: string; // Optional title to display above section content
}

interface AdditionalSection {
  title?: string;
  content: React.ReactNode | string;
}

interface InfoData {
  title: string;
  subheader: string;
  tagline?: string;
  description?: (React.ReactNode | string)[];
  stats?: StatItem[];
}

interface AnimationConfig {
  threshold?: number;
  once?: boolean;
  initialY?: number;
  duration?: number;
}

/**
 * Main component props with extended parameterization options
 * Each parameter is documented with its purpose and default value
 */
interface ElementCardProps {
  /** Core data object containing information */
  data: InfoData;
  
  /** Animation configuration for initial appearance */
  animationConfig?: AnimationConfig;
  
  /** Additional sections to display after the main navigation sections */
  additionalSections?: AdditionalSection[];
  
  /** Callback function triggered when active section changes */
  onSectionChange?: ((sectionId: string) => void) | null;
  
  /** Distance from top of viewport when sidebar switches to fixed position (px) */
  topOffset?: number;
  
  /** Primary color for highlights, headings, and active elements */
  highlightColor?: string;
  
  /** Main color for regular text content */
  textColor?: string;
  
  /** Minimum width for navigation indicator lines (px) */
  minLineWidth?: number;
  
  /** Maximum width for navigation indicator lines when active (px) */
  maxLineWidth?: number;
  
  /** Font family for text content */
  fontFamily?: string;
  
  /** Navigation sections to display - determines content structure */
  navigationItems?: NavigationItem[];
  
  /** Content compression factor (0-10) affecting column widths and spacing */
  contentCompression?: number;
  
  /** Maximum number of sections to support (default: 8) */
  maxSections?: number;
  
  /** Column spacing between sidebar and content (in rem, default: 2) */
  columnSpacing?: number;
  
  /** Space between tagline and navigation (in rem, default: 3) */
  taglineNavSpacing?: number;
  
  /** Whether to use virtualization for long lists */
  useVirtualization?: boolean;
  
  /** Height for virtualized list items (px) */
  virtualItemHeight?: number;
  
  /** Minimum items to use virtualization */
  virtualListThreshold?: number;
  
  /** Position for global stats: 'top', 'bottom', or 'none' */
  statsPosition?: 'top' | 'bottom' | 'none';
  
  /** Whether to show the overview/about section (default: true) */
  showOverview?: boolean;
}

/**
 * Layout configuration values derived from props
 */
interface LayoutValues {
  sidebarWidth: number;
  contentWidth: number;
  contentPadding: number;
}

/**
 * Utility Functions
 * Extracted utility functions for better organization and reuse
 */

/**
 * Throttle function to limit the rate at which a function can fire
 * @param fn - The function to throttle
 * @param wait - The rate limit in milliseconds
 */
const throttle = <T extends (...args: unknown[]) => unknown>(fn: T, wait: number): ((...args: Parameters<T>) => void) => {
  let lastCalled = 0;
  let timeout: number | null = null;
  let lastArgs: Parameters<T> | null = null;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = wait - (now - lastCalled);
    
    lastArgs = args;
    
    if (remaining <= 0 || remaining > wait) {
      if (timeout !== null) {
        window.clearTimeout(timeout);
        timeout = null;
      }
      lastCalled = now;
      fn(...args);
    } else if (timeout === null) {
      timeout = window.setTimeout(() => {
        lastCalled = Date.now();
        timeout = null;
        if (lastArgs) fn(...lastArgs);
      }, remaining);
    }
  };
};

/**
 * Debounce function to delay invoking a function until after a specific time
 * @param fn - The function to debounce
 * @param wait - The delay in milliseconds
 */
const debounce = <T extends (...args: unknown[]) => unknown>(fn: T, wait: number): ((...args: Parameters<T>) => void) => {
  let timeout: number | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout !== null) {
      window.clearTimeout(timeout);
    }
    
    timeout = window.setTimeout(() => {
      fn(...args);
    }, wait);
  };
};

/**
 * =====================================================================
 * STYLED COMPONENTS
 * CSS-in-JS implementation with TypeScript props typing
 * =====================================================================
 */

interface ContainerProps {
  $isMobile: boolean;
}

const Container = styled(motion.div)<ContainerProps>`
  display: flex;
  flex-direction: ${props => props.$isMobile ? 'column' : 'row'};
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
  min-height: ${props => props.$isMobile ? 'auto' : '70vh'};
  position: relative;
  padding-top: ${props => props.$isMobile ? '80px' : '0'};
`;

interface SidebarWrapperProps {
  $width: number;
}

const SidebarWrapper = styled.div<SidebarWrapperProps>`
  width: ${props => `${props.$width}%`};
  position: relative;
`;

const Sidebar = styled.div`
  padding: 3rem 2rem 2rem 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  top: 0;
`;

interface ContentSectionProps {
  $isMobile: boolean;
  $width: number;
  $contentPadding: number;
}

const ContentSection = styled.div<ContentSectionProps>`
  width: ${props => props.$isMobile ? '100%' : `${props.$width}%`};
  padding: ${props => props.$isMobile ? 
    '2rem 1.5rem' : 
    `3rem 0 2rem ${props.$contentPadding}rem`};
  margin-left: ${props => props.$isMobile ? '0' : 'auto'};
  
`;

interface SectionProps {
  $isMobile: boolean;
}

const Section = styled.div<SectionProps>`
  margin-bottom: 3rem;
  scroll-margin-top: ${props => props.$isMobile ? '80px' : '2rem'};
`;

interface SectionTitleProps {
  $highlightColor: string;
}

const SectionTitle = styled.h3<SectionTitleProps>`
  font-size: 1.4rem;
  color: ${props => props.$highlightColor};
  margin-bottom: 1rem;
  font-weight: 100;
`;

interface InfoContainerProps {
  $isMobile: boolean;
}

const InfoContainer = styled.div<InfoContainerProps>`
  margin-bottom: 2rem;
  padding-left: 5px;
  text-align: ${props => props.$isMobile ? 'center' : 'left'};
  width: 100%;
`;

interface TitleProps {
  $isMobile: boolean;
  $highlightColor: string;
}

const Title = styled.h1<TitleProps>`
  font-weight: 30000;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
  font-size: ${props => props.$isMobile ? '2.2rem' : '2.8rem'};
  color: ${props => props.$highlightColor};
`;

interface SubheaderProps {
  $isMobile: boolean;
  $color: string;
  $fontFamily: string;
}

const Subheader = styled.h2<SubheaderProps>`
  font-weight: 100;
  margin-bottom: 2rem;
  letter-spacing: 0.05em;
  font-style: italic;
  font-size: ${props => props.$isMobile ? '1.1rem' : '1.2rem'};
  color: ${props => props.$color};
  font-family: ${props => props.$fontFamily};
`;

interface TaglineProps {
  $isMobile: boolean;
  $color: string;
  $fontFamily: string;
  $spacing: number;
}

const Tagline = styled.p<TaglineProps>`
  line-height: 1.6;
  margin-bottom: ${props => `${props.$spacing}rem`};
  font-weight: 100;
  font-size: 1.1rem;
  max-width: ${props => props.$isMobile ? '100%' : '90%'};
  color: ${props => props.$color};
  font-family: ${props => props.$fontFamily};
`;

const NavLinks = styled.div`
  display: flex;
  flex-direction: column;
`;

const NavLinkContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
`;

interface NavLineProps {
  $expanded: boolean;
  $activeColor: string;
  $inactiveColor: string;
  $minWidth: number;
  $maxWidth: number;
}

const NavLine = styled.div<NavLineProps>`
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 0.75px;
  width: ${props => props.$expanded ? `${props.$maxWidth}px` : `${props.$minWidth}px`};
  background-color: ${props => props.$expanded ? props.$activeColor : props.$inactiveColor};
  transition: width 0.3s ease, background-color 0.3s ease;
`;

interface NavButtonProps {
  $active: boolean;
  $activeColor: string;
  $inactiveColor: string;
}

const NavButton = styled.button<NavButtonProps>`
  position: relative;
  display: block;
  padding: 0.5rem 0 0.5rem 40px;
  font-size: 0.85rem;
  letter-spacing: 0.2em;
  background: transparent;
  border: none;
  text-align: left;
  outline: none;
  box-shadow: none;
  transition: color 0.5s ease, transform 0.5s ease;
  cursor: pointer;
  width: fit-content;
  color: ${props => props.$active ? props.$activeColor : props.$inactiveColor};
  transform: ${props => props.$active ? 'translateX(10px)' : 'none'};
`;

interface MobileNavProps {
  $visible: boolean;
}

const MobileNav = styled.div<MobileNavProps>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-around;
  align-items: center;
  transform: ${props => props.$visible ? 'translateY(0)' : 'translateY(-100%)'};
  opacity: ${props => props.$visible ? 1 : 0};
`;

const MobileNavItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MobileNavButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  outline: none;
`;

interface MobileNavLineProps {
  $active: boolean;
  $activeColor: string;
  $inactiveColor: string;
  $minWidth: number;
  $maxWidth: number;
}

const MobileNavLine = styled.div<MobileNavLineProps>`
  width: ${props => props.$active ? `${props.$maxWidth}px` : `${props.$minWidth}px`};
  height: 2px;
  background-color: ${props => props.$active ? props.$activeColor : props.$inactiveColor};
  transition: width 0.3s ease, background-color 0.3s ease;
  margin-bottom: 0.5rem;
`;

interface MobileNavLabelProps {
  $active: boolean;
  $activeColor: string;
  $inactiveColor: string;
}

const MobileNavLabel = styled.div<MobileNavLabelProps>`
  font-size: 0.75rem;
  color: ${props => props.$active ? props.$activeColor : props.$inactiveColor};
  letter-spacing: 0.1em;
  transition: color 0.3s ease;
`;

interface StatsContainerProps {
  $isMobile: boolean;
  $marginTop?: number;
  $marginBottom?: number;
}

const StatsContainer = styled.div<StatsContainerProps>`
  display: flex;
  justify-content: ${props => props.$isMobile ? 'center' : 'space-between'};
  flex-wrap: wrap;
  margin-top: ${props => props.$marginTop !== undefined ? `${props.$marginTop}rem` : '3rem'};
  margin-bottom: ${props => props.$marginBottom !== undefined ? `${props.$marginBottom}rem` : '0'};
  width: 100%;
  gap: ${props => props.$isMobile ? '2rem' : '0'};
`;

interface StatItemProps {
  $isMobile: boolean;
  $isHovering: boolean;
}

const StatItem = styled.div<StatItemProps>`
  flex: ${props => props.$isMobile ? '0 0 auto' : '1'};
  text-align: center;
  padding: 0 1rem;
  min-width: ${props => props.$isMobile ? '140px' : '100px'};
  transition: transform 0.3s ease;
  transform: ${props => props.$isHovering ? 'translateY(-5px)' : 'none'};
`;

interface StatValueProps {
  $isMobile: boolean;
  $color: string;
}

const StatValue = styled.div<StatValueProps>`
  font-size: ${props => props.$isMobile ? '2.2rem' : '2.5rem'};
  font-weight: 300;
  color: ${props => props.$color};
  margin-bottom: 0.5rem;
`;

interface StatLabelProps {
  $color: string;
}

const StatLabel = styled.div<StatLabelProps>`
  font-size: 0.85rem;
  color: ${props => props.$color};
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

interface SectionContentProps {
  $color: string;
  $fontFamily: string;
}

const SectionContent = styled.p<SectionContentProps>`
  line-height: 1.8;
  margin-bottom: 1.5rem;
  font-weight: 100;
  font-size: 1rem;
  color: ${props => props.$color};
  font-family: ${props => props.$fontFamily};
`;

// Styling for virtualized list container
const VirtualListContainer = styled.div`
  width: 100%;
  margin-bottom: 1.5rem;
  
  /* Style the scrollbar for better UX */
  & .react-window-list::-webkit-scrollbar {
    width: 6px;
  }
  
  & .react-window-list::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
  
  & .react-window-list::-webkit-scrollbar-thumb {
    background: rgba(120, 120, 120, 0.5);
    border-radius: 3px;
  }
  
  & .react-window-list::-webkit-scrollbar-thumb:hover {
    background: rgba(120, 120, 120, 0.8);
  }
`;

/**
 * =====================================================================
 * CHILD COMPONENT PROPS
 * Type definitions for child components
 * =====================================================================
 */

interface InfoHeaderProps {
  data: InfoData;
  isMobile: boolean;
  highlightColor: string;
  textColor: string;
  fontFamily: string;
  taglineNavSpacing: number;
}

interface MobileNavItemComponentProps {
  navItem: NavigationItem;
  activeSection: string;
  highlightColor: string;
  textColor: string;
  minLineWidth: number;
  maxLineWidth: number;
}

interface NavLinkComponentProps {
  navItem: NavigationItem;
  activeSection: string;
  expandedNavItem: string | null;
  onMouseEnter: (id: string) => void;
  onMouseLeave: () => void;
  highlightColor: string;
  textColor: string;
  minLineWidth: number;
  maxLineWidth: number;
}

interface StatItemComponentProps {
  stat: StatItem;
  isMobile: boolean;
  highlightColor: string;
  textColor: string;
}

interface SectionContentComponentProps {
  content: React.ReactNode | string | null;
  textColor: string;
  fontFamily: string;
}

interface StatsComponentProps {
  stats: StatItem[] | undefined;
  isMobile: boolean;
  highlightColor: string;
  textColor: string;
  marginTop?: number;
  marginBottom?: number;
}

// Props for virtualized list component
interface VirtualizedListProps {
  items: (React.ReactNode | string)[];
  height?: number;
  itemHeight: number;
  textColor: string;
  fontFamily: string;
  className?: string;
}

/**
 * =====================================================================
 * CHILD COMPONENTS
 * Memoized sub-components for performance optimization
 * =====================================================================
 */

/**
 * InfoHeader Component
 * Renders the top section of the sidebar with title, subheader and tagline
 */
const InfoHeader = React.memo(({ 
  data, 
  isMobile, 
  highlightColor, 
  textColor, 
  fontFamily,
  taglineNavSpacing 
}: InfoHeaderProps) => {
  return (
    <InfoContainer $isMobile={isMobile}>
      <Title 
        $isMobile={isMobile} 
        $highlightColor={highlightColor}
      >
        {data.title}
      </Title>
      
      <Subheader 
        $isMobile={isMobile} 
        $color={`${highlightColor}B3`} 
        $fontFamily={fontFamily}
      >
        {data.subheader}
      </Subheader>
      
      {data.tagline && (
        <Tagline 
          $isMobile={isMobile} 
          $color={textColor} 
          $fontFamily={fontFamily}
          $spacing={taglineNavSpacing}
        >
          {data.tagline}
        </Tagline>
      )}
    </InfoContainer>
  );
});

InfoHeader.displayName = 'InfoHeader';

/**
 * MobileNavItemComponent
 * Renders a navigation item in the mobile top navigation bar
 */
const MobileNavItemComponent = React.memo(({ 
  navItem, 
  activeSection, 
  highlightColor, 
  textColor,
  minLineWidth,
  maxLineWidth 
}: MobileNavItemComponentProps) => {
  return (
    <MobileNavItem>
      <MobileNavButton data-section-id={navItem.id}>
        <MobileNavLine 
          $active={activeSection === navItem.id}
          $activeColor={highlightColor}
          $inactiveColor={`${highlightColor}80`}
          $minWidth={minLineWidth}
          $maxWidth={maxLineWidth}
        />
        <MobileNavLabel 
          $active={activeSection === navItem.id}
          $activeColor={highlightColor}
          $inactiveColor={textColor}
        >
          {navItem.label}
        </MobileNavLabel>
      </MobileNavButton>
    </MobileNavItem>
  );
});

MobileNavItemComponent.displayName = 'MobileNavItemComponent';

/**
 * NavLinkComponent
 * Renders a navigation item in the desktop sidebar
 */
const NavLinkComponent = React.memo(({ 
  navItem, 
  activeSection, 
  expandedNavItem,
  onMouseEnter,
  onMouseLeave, 
  highlightColor, 
  textColor,
  minLineWidth,
  maxLineWidth 
}: NavLinkComponentProps) => {
  const isActive = activeSection === navItem.id || expandedNavItem === navItem.id;
  
  return (
    <NavLinkContainer 
      data-section-id={navItem.id}
      onMouseEnter={() => onMouseEnter(navItem.id)}
      onMouseLeave={onMouseLeave}
    >
      <NavLine 
        $expanded={isActive}
        $activeColor={`${highlightColor}E6`}
        $inactiveColor={`${highlightColor}80`}
        $minWidth={minLineWidth}
        $maxWidth={maxLineWidth}
      />
      <NavButton 
        $active={isActive}
        $activeColor={highlightColor}
        $inactiveColor={textColor}
      >
        {navItem.label}
      </NavButton>
    </NavLinkContainer>
  );
});

NavLinkComponent.displayName = 'NavLinkComponent';

/**
 * StatsComponent
 * Renders a collection of statistics
 * Now a separate component that can be used in multiple places
 */
const StatsComponent = React.memo(({ 
  stats, 
  isMobile, 
  highlightColor, 
  textColor,
  marginTop,
  marginBottom
}: StatsComponentProps) => {
  if (!stats || stats.length === 0) return null;
  
  return (
    <StatsContainer 
      $isMobile={isMobile}
      $marginTop={marginTop}
      $marginBottom={marginBottom}
    >
      {stats.map((stat, statIdx) => (
        <StatItemComponent
          key={statIdx}
          stat={stat}
          isMobile={isMobile}
          highlightColor={highlightColor}
          textColor={textColor}
        />
      ))}
    </StatsContainer>
  );
});

StatsComponent.displayName = 'StatsComponent';

/**
 * StatItemComponent
 * Renders a single statistic item with value and label
 */
const StatItemComponent = React.memo(({ 
  stat, 
  isMobile, 
  highlightColor, 
  textColor 
}: StatItemComponentProps) => {
  const [isHovering, setIsHovering] = useState<boolean>(false);

  const handleMouseEnter = useCallback(() => {
    if (!isMobile) {
      setIsHovering(true);
    }
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (!isMobile) {
      setIsHovering(false);
    }
  }, [isMobile]);

  return (
    <StatItem 
      $isMobile={isMobile}
      $isHovering={isHovering}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <StatValue 
        $isMobile={isMobile} 
        $color={highlightColor}
      >
        {stat.value}
      </StatValue>
      <StatLabel $color={`${textColor}CC`}>
        {stat.label}
      </StatLabel>
    </StatItem>
  );
});

StatItemComponent.displayName = 'StatItemComponent';

/**
 * SectionContentComponent
 * Renders content for a section - handles both string and React node content
 */
const SectionContentComponent = React.memo(({ 
  content, 
  textColor, 
  fontFamily 
}: SectionContentComponentProps) => {
  if (!content) return null;
  
  if (typeof content === 'string') {
    return (
      <SectionContent 
        $color={textColor}
        $fontFamily={fontFamily}
      >
        {content}
      </SectionContent>
    );
  }
  
  return <>{content}</>;
});

SectionContentComponent.displayName = 'SectionContentComponent';

/**
 * VirtualizedList Component
 * Renders a virtualized list of items for better performance with large datasets
 */
const VirtualizedList = React.memo(({
  items,
  height = 400,
  itemHeight,
  textColor,
  fontFamily,
  className
}: VirtualizedListProps) => {
  // Calculate actual list height based on number of items
  // but keep it reasonable if there are many items
  const calculatedHeight = useMemo(() => {
    return Math.min(
      height, 
      items.length * itemHeight + 20 // Small padding to account for scrollbar
    );
  }, [items.length, itemHeight, height]);
  
  // Memoize the item renderer function to avoid recreating on each render
  const itemRenderer = useCallback(({ index, style }: { index: number, style: React.CSSProperties }) => {
    const content = items[index];
    
    return (
      <div style={style}>
        {typeof content === 'string' ? (
          <SectionContent 
            $color={textColor}
            $fontFamily={fontFamily}
          >
            {content}
          </SectionContent>
        ) : (
          content
        )}
      </div>
    );
  }, [items, textColor, fontFamily]);
  
  return (
    <VirtualListContainer>
      <List
        className={`react-window-list ${className || ''}`}
        height={calculatedHeight}
        itemCount={items.length}
        itemSize={itemHeight}
        width="100%"
        overscanCount={3} // Render items just outside the viewport for smoother scrolling
      >
        {itemRenderer}
      </List>
    </VirtualListContainer>
  );
});

VirtualizedList.displayName = 'VirtualizedList';

/**
 * =====================================================================
 * MAIN COMPONENT: ElementCard
 * An information display component with scroll phases and responsive design
 * =====================================================================
 */
/**
 * ElementCard Component - Main implementation
 * 
 * The component accepts a variety of parameters to customize its behavior and appearance.
 * All parameters have sensible defaults to provide a good starting experience.
 */
const ElementCard = ({
  // Core data
  data,
  
  // Animation configuration
  animationConfig = {
    threshold: 0.5,
    once: true,
    initialY: 30,
    duration: 0.8
  },
  
  // Content configuration
  additionalSections = [],
  onSectionChange = null as ((sectionId: string) => void) | null,
  
  // Positioning configuration
  topOffset = 100,
  
  // Color and styling
  highlightColor = '#bfad7f',
  textColor = 'rgba(224, 224, 224, 0.7)',
  fontFamily = '"Garamond", "Adobe Caslon Pro", serif',
  
  // Navigation styling
  minLineWidth = 10,
  maxLineWidth = 40,
  
  // Content structure
  navigationItems = [
    { id: 'overview', label: 'OVERVIEW', content: null },
    { id: 'details', label: 'DETAILS', content: null },
    { id: 'examples', label: 'EXAMPLES', content: null }
  ],
  
  // Layout parameters
  contentCompression = 0,
  maxSections = 8,
  columnSpacing = 2,
  taglineNavSpacing = 3,
  
  // Virtualization options
  useVirtualization = true,
  virtualItemHeight = 140,
  virtualListThreshold = 10,
  
  // Stats options
  statsPosition = 'bottom',
  
  // Show overview section
  showOverview = true
}: ElementCardProps) => {
  
  /**
   * =====================================================================
   * STATE MANAGEMENT
   * Component state definitions
   * =====================================================================
   */
  // Set the initial active section, accounting for showOverview option
  const [activeSection, setActiveSection] = useState<string>(() => {
    // If overview should be hidden and it's the first item, use the next available section
    if (!showOverview && navigationItems[0]?.id === 'overview') {
      return navigationItems[1]?.id || 'overview';
    } else {
      // Otherwise use the first navigation item
      return navigationItems[0]?.id || 'overview';
    }
  });
  const [expandedNavItem, setExpandedNavItem] = useState<string | null>(null);
  const [sidebarMode, setSidebarMode] = useState<'normal' | 'fixed' | 'end'>('normal');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mobileNavVisible, setMobileNavVisible] = useState<boolean>(false);
  const [lastScrollY, setLastScrollY] = useState<number>(0);

  /**
   * =====================================================================
   * REFS
   * DOM references for components
   * =====================================================================
   */
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarWrapperRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const navLinksRef = useRef<HTMLDivElement>(null);
  
  /**
   * Dynamic section refs generation based on maxSections parameter
   */
  const sectionRefs = useMemo<Array<RefObject<HTMLDivElement>>>(() => {
    return Array.from({ length: maxSections }, () => React.createRef() as RefObject<HTMLDivElement>);
  }, [maxSections]);
  
  /**
   * =====================================================================
   * ANIMATION CONTROLS
   * Framer Motion animation setup
   * =====================================================================
   */
  const controls = useAnimation();
  
  /**
   * =====================================================================
   * PARAMETERIZED SECTION HANDLING
   * Dynamic section creation based on maxSections parameter
   * =====================================================================
   */
  
  // Memoize the section refs map to avoid recreating on every render
  const sectionRefsMap = useMemo<Record<string, RefObject<HTMLDivElement>>>(() => {
    const refsMap: Record<string, RefObject<HTMLDivElement>> = {};
    let refIndex = 0;
    
    // Process the navigationItems array but limit to maxSections
    // Skip overview section if showOverview is false
    navigationItems.forEach((item) => {
      // Skip overview section if showOverview is false
      if ((!showOverview && item.id === 'overview') || refIndex >= maxSections) {
        return;
      }
      
      refsMap[item.id] = sectionRefs[refIndex];
      refIndex++;
    });
    
    return refsMap;
  }, [navigationItems, sectionRefs, maxSections, showOverview]);
  
  /**
   * =====================================================================
   * LAYOUT CALCULATIONS
   * Dynamic layout values based on contentCompression and columnSpacing
   * =====================================================================
   */
  
  // Memoize calculation of compression-based layout values
  const layoutValues = useMemo<LayoutValues>(() => {
    // Convert compression factor (0-10) to a 0-1 scale
    const compressionFactor = Math.min(Math.max(contentCompression, 0), 10) / 10;
    
    // Calculate layout values based on compression factor and column spacing
    return {
      sidebarWidth: 45 - (compressionFactor * 5) - (columnSpacing / 2),
      contentWidth: 55 - (compressionFactor * 5) + (columnSpacing / 2),
      contentPadding: columnSpacing + (compressionFactor * 2),
    };
  }, [contentCompression, columnSpacing]);

  /**
   * =====================================================================
   * IN-VIEW DETECTION
   * For animation triggers based on visibility
   * =====================================================================
   */
  const isInView = useInView(containerRef, {
    amount: animationConfig?.threshold ?? 0.2,
    once: animationConfig?.once ?? true
  });

  /**
   * =====================================================================
   * UTILITY FUNCTIONS
   * Memoized handlers and utility functions
   * =====================================================================
   */
  
  // Check if we're on mobile
  const checkMobile = useCallback((): void => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  // Memoized scroll to section handler
  const scrollToSection = useCallback((sectionId: string): void => {
    // Skip if trying to navigate to overview section when it's hidden
    if (!showOverview && sectionId === 'overview') {
      return;
    }
    
    setActiveSection(sectionId);
    
    if (onSectionChange) {
      onSectionChange(sectionId);
    }
    
    const sectionRef = sectionRefsMap[sectionId];
    if (sectionRef?.current) {
      // Use different scroll methods for mobile vs desktop
      if (isMobile) {
        // For mobile, calculate position and use window.scrollTo
        const offsetTop = sectionRef.current.getBoundingClientRect().top + window.pageYOffset;
        const mobileNavHeight = mobileNavRef.current ? mobileNavRef.current.offsetHeight : 0;
        
        window.scrollTo({
          top: offsetTop - mobileNavHeight - 20, // Additional offset for spacing
          behavior: 'smooth'
        });
      } else {
        // For desktop, use the original scrollIntoView method
        sectionRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  }, [onSectionChange, sectionRefsMap, isMobile, mobileNavRef, showOverview]);

  // Memoized event delegation for all navigation items with proper dependency array
  const handleNavEvent = useCallback((e: Event): void => {
    const target = (e.target as HTMLElement).closest('[data-section-id]');
    if (target) {
      const sectionId = target.getAttribute('data-section-id');
      if (sectionId) {
        e.preventDefault();
        scrollToSection(sectionId);
      }
    }
  }, [scrollToSection]);
  
  // Navigation item hover handlers with proper dependency arrays
  const handleNavItemHover = useCallback((section: string): void => {
    if (!isMobile) {
      setExpandedNavItem(section);
    }
  }, [isMobile]);
  
  const handleNavItemLeave = useCallback((): void => {
    if (!isMobile) {
      setExpandedNavItem(null);
    }
  }, [isMobile]);

  /**
   * Optimized scroll handler with Animation Frame Batching
   * Separates DOM reads and writes to prevent layout thrashing
   */
  const handleScroll = useCallback(() => {
    if (!containerRef.current || !sidebarRef.current || !sidebarWrapperRef.current) {
      return;
    }
    
    // Use requestAnimationFrame to batch our DOM reads
    requestAnimationFrame(() => {
      // All DOM reads are performed together
      const container = containerRef.current;
      const sidebar = sidebarRef.current;
      const sidebarWrapper = sidebarWrapperRef.current;
      
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const wrapperRect = sidebarWrapper ? sidebarWrapper.getBoundingClientRect() : null;
      if (!wrapperRect) return;
      const sidebarHeight = sidebar ? sidebar.offsetHeight : 0;
      
      // Calculate phase transition points
      const startFixPoint = containerRect.top <= topOffset;
      const endFixPoint = containerRect.bottom <= (sidebarHeight + topOffset);
      
      // Determine the current scroll phase
      let newMode: 'normal' | 'fixed' | 'end';
      if (!startFixPoint) {
        newMode = 'normal';
      } else if (startFixPoint && !endFixPoint) {
        newMode = 'fixed';
      } else {
        newMode = 'end';
      }
      
      // Only update DOM if the mode changes
      if (sidebarMode !== newMode) {
        // Use a nested requestAnimationFrame to batch DOM writes
        requestAnimationFrame(() => {
          // Update state
          setSidebarMode(newMode);
          
          // All DOM writes are performed together
          if (newMode === 'normal') {
            // Phase 1: Normal flow
            if (sidebar) {
              sidebar.style.position = 'relative';
              sidebar.style.top = '0';
              sidebar.style.left = '0';
              sidebar.style.width = '';
              sidebar.style.bottom = '';
            }
          } 
          else if (newMode === 'fixed') {
            // Phase 2: Fixed position
            if (sidebar) {
              sidebar.style.position = 'fixed';
              sidebar.style.top = `${topOffset}px`;
              sidebar.style.width = `${wrapperRect.width}px`;
              sidebar.style.left = `${wrapperRect.left}px`;
              sidebar.style.bottom = '';
            }
          } 
          else if (newMode === 'end') {
            // Phase 3: End position
            if (sidebar) {
              sidebar.style.position = 'absolute';
              sidebar.style.top = 'auto'; 
              sidebar.style.bottom = '0'; 
              sidebar.style.left = '0';
              sidebar.style.width = '';
            }
          }
        });
      }
    });
  }, [sidebarMode, topOffset]);
  
  // Throttled scroll handler
  const throttledScrollHandler = useMemo(() => 
    throttle(handleScroll, 16), // ~60fps
  [handleScroll]);
  
  /**
   * Optimized resize handler with Animation Frame Batching
   */
  const handleResize = useCallback(() => {
    // Skip for mobile
    if (window.innerWidth <= 768) return;
    
    // Update measurements and apply current mode
    if (containerRef.current && sidebarRef.current && sidebarWrapperRef.current) {
      requestAnimationFrame(() => {
        // Trigger the scroll handler which already has animation frame batching
        handleScroll();
      });
    }
  }, [handleScroll]);
  
  // Debounced resize handler
  const debouncedResizeHandler = useMemo(() => 
    debounce(handleResize, 100),
  [handleResize]);
  
  /**
   * Mobile nav scroll handler with Animation Frame Batching
   */
  const handleMobileNavScroll = useCallback(() => {
    if (!isMobile || !mobileNavRef.current) {
      return;
    }
    
    // Use requestAnimationFrame to batch our DOM reads
    requestAnimationFrame(() => {
      // All DOM reads are performed together
      const currentScrollY = window.scrollY;
      const mobileNav = mobileNavRef.current;
      
      // Process data and prepare for DOM writes
      const shouldShowNavbar = currentScrollY < lastScrollY || currentScrollY < 50;
      const bgOpacity = currentScrollY > 50 ? 0.95 : 0.7;
      const showShadow = currentScrollY > 50;
      
      // Use a nested requestAnimationFrame to batch DOM writes
      requestAnimationFrame(() => {
        // All DOM writes are performed together
        setMobileNavVisible(shouldShowNavbar);
        setLastScrollY(currentScrollY);
        
        if (mobileNav) {
          mobileNav.style.backgroundColor = `rgba(17, 17, 17, ${bgOpacity})`;
        }
        if (mobileNav) {
          mobileNav.style.boxShadow = showShadow ? '0 2px 10px rgba(0, 0, 0, 0.1)' : 'none';
        }
      });
    });
  }, [isMobile, lastScrollY, mobileNavRef]);
  
  // Throttled mobile nav scroll handler
  const throttledMobileNavScrollHandler = useMemo(() => 
    throttle(handleMobileNavScroll, 100),
  [handleMobileNavScroll]);

  /**
   * =====================================================================
   * RESIZE OBSERVER IMPLEMENTATION
   * Memoized ResizeObserver with inline debounced callback
   * =====================================================================
   */
  const resizeObserver = useMemo(() => new ResizeObserver(
    debounce(() => {
      if (containerRef.current) {
        requestAnimationFrame(() => {
          debouncedResizeHandler();
        });
      }
    }, 100)
  ), [debouncedResizeHandler]);

  /**
   * =====================================================================
   * EFFECT HOOKS
   * Side effects for component lifecycle and interactions
   * =====================================================================
   */
  
  // Check mobile on mount and window resize
  useEffect(() => {
    // Initial check
    checkMobile();
    
    // Add resize event listener
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [checkMobile]);

  // Set up event delegation for navigation
  useEffect(() => {
    // Store current ref values
    const mobileNavElement = mobileNavRef.current;
    const navLinksElement = navLinksRef.current;
    
    // Add click event listeners with event delegation
    if (mobileNavElement) {
      mobileNavElement.addEventListener('click', handleNavEvent);
    }
    
    if (navLinksElement) {
      navLinksElement.addEventListener('click', handleNavEvent);
    }
    
    return () => {
      if (mobileNavElement) {
        mobileNavElement.removeEventListener('click', handleNavEvent);
      }
      
      if (navLinksElement) {
        navLinksElement.removeEventListener('click', handleNavEvent);
      }
    };
  }, [handleNavEvent]);

  // Initial animation effect
  useEffect(() => {
    if (isInView) {
      controls.start({ 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: animationConfig?.duration ?? 0.8,
          ease: "easeOut",
          delay: 0.1 // Small delay to ensure DOM is settled
        }
      });
      
      // Mark as initialized after animation completes
      const timeout = setTimeout(() => {
        setIsInitialized(true);
      }, (animationConfig?.duration ?? 0.8) * 1000 + 100);
      
      return () => clearTimeout(timeout);
    }
  }, [isInView, controls, animationConfig?.duration]);

  // Set up intersection observer for section detection
  useEffect(() => {
    const sectionElements = Object.values(sectionRefsMap)
      .map(ref => ref.current)
      .filter(Boolean);
    
    if (sectionElements.length === 0) return;
    
    // Optimized rootMargin values for better scroll-spy
    const options = {
      root: null,
      rootMargin: isMobile 
        ? '-80px 0px -70% 0px'  // For mobile with fixed nav
        : '-10% 0px -90% 0px',  // Optimized detection range for desktop
      threshold: [0, 0.25, 0.5, 0.75] // Multiple thresholds for smoother transitions
    };
    
    const callback = (entries: IntersectionObserverEntry[]): void => {
      // Find the most visible section
      const visibleEntries = entries.filter(entry => entry.isIntersecting);
      
      if (visibleEntries.length > 0) {
        // Sort by visibility ratio, highest first
        visibleEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const topEntry = visibleEntries[0];
        
        const sectionId = topEntry.target.getAttribute('data-section');
        if (sectionId && sectionId !== activeSection) {
          setActiveSection(sectionId);
          
          if (onSectionChange) {
            onSectionChange(sectionId);
          }
        }
      }
    };
    
    const observer = new IntersectionObserver(callback, options);
    sectionElements.forEach(element => observer.observe(element));
    
    return () => observer.disconnect();
  }, [activeSection, onSectionChange, sectionRefsMap, isMobile]);

  /**
   * Optimized scroll behavior for desktop with enhanced performance
   * Uses the memoized ResizeObserver and passive event options
   */
  useEffect(() => {
    if (!isInitialized || !containerRef.current || !sidebarRef.current || 
        !sidebarWrapperRef.current || isMobile) {
      return;
    }
    
    const sidebar = sidebarRef.current;
    const container = containerRef.current;
    
    // Add will-change to hint browser about upcoming transforms
    sidebar.style.willChange = 'position, top, left, width, bottom';
    
    // Initial setup
    handleResize();
    handleScroll();
    
    // Add optimized event listeners with passive option
    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    window.addEventListener('resize', debouncedResizeHandler, { passive: true });
    
    // Use memoized ResizeObserver
    resizeObserver.observe(container);
    
    return () => {
      window.removeEventListener('scroll', throttledScrollHandler);
      window.removeEventListener('resize', debouncedResizeHandler);
      resizeObserver.unobserve(container);
      
      // Remove will-change to free up resources
      sidebar.style.willChange = 'auto';
    };
  }, [
    isInitialized, 
    isMobile, 
    throttledScrollHandler, 
    debouncedResizeHandler, 
    handleResize, 
    handleScroll,
    resizeObserver
  ]);

  /**
   * Mobile nav scroll behavior with enhanced performance
   */
  useEffect(() => {
    if (!isInitialized || !isMobile || !mobileNavRef.current) {
      return;
    }
    
    const mobileNav = mobileNavRef.current;
    
    // Add will-change to hint browser about transforms
    mobileNav.style.willChange = 'transform, opacity, background-color';
    
    // Add scroll event listener with passive option for better performance
    window.addEventListener('scroll', throttledMobileNavScrollHandler, { passive: true });
    
    // Initial state
    mobileNav.style.backgroundColor = 'rgba(17, 17, 17, 0.7)';
    mobileNav.style.boxShadow = 'none';
    
    return () => {
      window.removeEventListener('scroll', throttledMobileNavScrollHandler);
      
      // Remove will-change to free up resources
      mobileNav.style.willChange = 'auto';
    };
  }, [isInitialized, isMobile, throttledMobileNavScrollHandler]);

  /**
   * =====================================================================
   * MEMOIZED CONTENT RENDERING
   * Optimized section content rendering
   * =====================================================================
   */
  
  /**
   * Function to determine if virtualization should be used
   * Considers the number of items and the user's preference
   */
  const shouldUseVirtualization = useCallback((items: (React.ReactNode | string)[] | undefined): boolean => {
    return useVirtualization && 
           !!items && 
           items.length >= virtualListThreshold;
  }, [useVirtualization, virtualListThreshold]);
  
  // Overview section with description and optional stats based on statsPosition
  const renderOverviewSection = useMemo(() => {
    const showStatsHere = statsPosition === 'top' && data.stats && data.stats.length > 0;
    
    return (
      <>
        {showStatsHere && (
          <StatsComponent
            stats={data.stats}
            isMobile={isMobile}
            highlightColor={highlightColor}
            textColor={textColor}
            marginTop={0}
            marginBottom={3}
          />
        )}
        
        {data.description && (
          shouldUseVirtualization(data.description) ? (
            <VirtualizedList
              items={data.description}
              itemHeight={virtualItemHeight}
              textColor={textColor}
              fontFamily={fontFamily}
            />
          ) : (
            data.description.map((paragraph, idx) => (
              <SectionContentComponent
                key={idx}
                content={paragraph}
                textColor={textColor}
                fontFamily={fontFamily}
              />
            ))
          )
        )}
        
        {statsPosition === 'bottom' && data.stats && data.stats.length > 0 && (
          <StatsComponent
            stats={data.stats}
            isMobile={isMobile}
            highlightColor={highlightColor}
            textColor={textColor}
            marginTop={3}
            marginBottom={0}
          />
        )}
      </>
    );
  }, [
    data.description, 
    data.stats, 
    statsPosition, 
    isMobile, 
    highlightColor, 
    textColor, 
    fontFamily,
    shouldUseVirtualization,
    virtualItemHeight
  ]);

  // Main section renderer with section-specific stats support
  const getRenderedSection = useCallback((sectionId: string) => {
    // Find section from navigationItems
    const section = navigationItems.find(item => item.id === sectionId);
    if (!section) return null;
    
    return (
      <>
        {/* Section title if provided */}
        {section.sectionTitle && (
          <SectionTitle $highlightColor={highlightColor}>
            {section.sectionTitle}
          </SectionTitle>
        )}
        
        {/* Section content */}
        {section.content ? (
          // Handle array content for virtualization
          Array.isArray(section.content) && shouldUseVirtualization(section.content) ? (
            <VirtualizedList
              items={section.content}
              itemHeight={virtualItemHeight}
              textColor={textColor}
              fontFamily={fontFamily}
            />
          ) : (
            <SectionContentComponent
              content={section.content}
              textColor={textColor}
              fontFamily={fontFamily}
            />
          )
        ) : (
          // Default content for overview section only if showOverview is true
          sectionId === 'overview' ? renderOverviewSection : null
        )}
        
        {/* Section-specific stats (if available) - now below content */}
        {section.stats && section.stats.length > 0 && (
          <StatsComponent
            stats={section.stats}
            isMobile={isMobile}
            highlightColor={highlightColor}
            textColor={textColor}
            marginTop={3}
            marginBottom={0}
          />
        )}
      </>
    );
  }, [
    navigationItems, 
    renderOverviewSection, 
    isMobile,
    highlightColor,
    textColor, 
    fontFamily,
    shouldUseVirtualization,
    virtualItemHeight
  ]);

  /**
   * =====================================================================
   * COMPONENT RENDER
   * Main JSX structure for the component
   * =====================================================================
   */
  return (
    <>
      {/* Mobile navigation with event delegation */}
      {isMobile && (
        <MobileNav
          ref={mobileNavRef}
          $visible={mobileNavVisible}
        >
          {navigationItems
            .filter(navItem => showOverview || navItem.id !== 'overview')
            .map((navItem) => (
              <MobileNavItemComponent
                key={navItem.id}
                navItem={navItem}
                activeSection={activeSection}
                highlightColor={highlightColor}
                textColor={textColor}
                minLineWidth={minLineWidth}
                maxLineWidth={maxLineWidth}
              />
            ))}
        </MobileNav>
      )}
      
      <Container 
        ref={containerRef}
        $isMobile={isMobile}
        initial={{ opacity: 0, y: animationConfig?.initialY ?? 30 }}
        animate={controls}
      >
        {/* Left sidebar wrapper - desktop only */}
        {!isMobile && (
          <SidebarWrapper 
            ref={sidebarWrapperRef}
            $width={layoutValues.sidebarWidth}
          >
            {/* Info sidebar */}
            <Sidebar ref={sidebarRef}>
              <InfoHeader
                data={data}
                isMobile={isMobile}
                highlightColor={highlightColor}
                textColor={textColor}
                fontFamily={fontFamily}
                taglineNavSpacing={taglineNavSpacing}
              />
              
              {/* Navigation links with event delegation */}
              {!isMobile && (
                <NavLinks ref={navLinksRef}>
                  {navigationItems
                    .filter(navItem => showOverview || navItem.id !== 'overview')
                    .map((navItem) => (
                      <NavLinkComponent
                        key={navItem.id}
                        navItem={navItem}
                        activeSection={activeSection}
                        expandedNavItem={expandedNavItem}
                        onMouseEnter={handleNavItemHover}
                        onMouseLeave={handleNavItemLeave}
                        highlightColor={highlightColor}
                        textColor={textColor}
                        minLineWidth={minLineWidth}
                        maxLineWidth={maxLineWidth}
                      />
                    ))}
                </NavLinks>
              )}
            </Sidebar>
          </SidebarWrapper>
        )}
        
        {/* Info Header for mobile */}
        {isMobile && (
          <InfoHeader
            data={data}
            isMobile={isMobile}
            highlightColor={highlightColor}
            textColor={textColor}
            fontFamily={fontFamily}
            taglineNavSpacing={taglineNavSpacing}
          />
        )}
        
        {/* Right content section */}
        <ContentSection 
          ref={contentRef}
          $isMobile={isMobile}
          $width={layoutValues.contentWidth}
          $contentPadding={layoutValues.contentPadding}
        >
          {navigationItems.slice(0, maxSections)
            .filter(section => showOverview || section.id !== 'overview') // Filter out overview if showOverview is false
            .map((section, index) => {
              return (
                <Section 
                  key={section.id}
                  ref={sectionRefs[index]}
                  data-section={section.id}
                  id={section.id}
                  $isMobile={isMobile}
                >
                  {getRenderedSection(section.id)}
                </Section>
              );
            })}
          
          {/* Additional sections with virtualization support */}
          {additionalSections.map((section, index) => {
            // Check if section content is an array that should be virtualized
            const shouldVirtualize = 
              Array.isArray(section.content) && 
              shouldUseVirtualization(section.content as (React.ReactNode | string)[]);
            
            return (
              <Section 
                key={`additional-${index}`}
                $isMobile={isMobile}
              >
                {section.title && (
                  <SectionTitle $highlightColor={highlightColor}>
                    {section.title}
                  </SectionTitle>
                )}
                
                {shouldVirtualize ? (
                  <VirtualizedList
                    items={section.content as (React.ReactNode | string)[]}
                    itemHeight={virtualItemHeight}
                    textColor={textColor}
                    fontFamily={fontFamily}
                  />
                ) : (
                  <SectionContentComponent
                    content={section.content}
                    textColor={textColor}
                    fontFamily={fontFamily}
                  />
                )}
              </Section>
            );
          })}
        </ContentSection>
      </Container>
    </>
  );
};

// Using memo to prevent unnecessary re-renders
// Removed unused MemoizedElementCard
ElementCard.displayName = 'ElementCard';

/**
 * GoldenElementCard Component
 * 
 * A preset version of ElementCard with a golden/amber color scheme.
 * 
 * @param {Object} props - Same props as InfoCard with color presets
 */
export const GoldenElementCard: React.FC<ElementCardProps> = (props) => {
  const goldenPreset = {
    highlightColor: '#bfad7f',
    textColor: 'rgba(224, 224, 224, 0.7)',
    fontFamily: '"Garamond", "Adobe Caslon Pro", serif',
  };
  
  return <ElementCard {...goldenPreset} {...props} />;
};

/**
 * NightElementCard Component
 * 
 * A preset version of ElementCard with a blue-tinted dark color scheme.
 * 
 * @param {Object} props - Same props as ElementCard with color presets
 */
export const NightElementCard: React.FC<ElementCardProps> = (props) => {
  const nightPreset = {
    highlightColor: '#6f8cba',
    textColor: 'rgba(200, 210, 230, 0.8)',
    fontFamily: '"Helvetica Neue", "Arial", sans-serif',
  };
  
  return <ElementCard {...nightPreset} {...props} />;
};

/**
 * ElgeantElementCard Component
 * 
 * A preset version of ElementCard with an elegant maroon/burgundy color scheme.
 * 
 * @param {Object} props - Same props as ElementCard with color presets
 */
export const ElegantElementCard: React.FC<ElementCardProps> = (props) => {
  const elegantPreset = {
    highlightColor: '#8a2731', // Burgundy red
    textColor: 'rgba(235, 225, 215, 0.8)', // Warm light color
    fontFamily: '"Baskerville", "Times New Roman", serif',
    minLineWidth: 8,
    maxLineWidth: 35,
  };
  
  return <ElementCard {...elegantPreset} {...props} />;
};

/**
 * Usage example with fantasy world data
 * 
 * const mythicRealmsData = {
 *   title: "Mythic Realms",
 *   subheader: "Fantasy World Encyclopedia",
 *   tagline: "A vast fantasy world comprising diverse regions, each with unique environments, creatures, and magic systems.",
 *   stats: [
 *     { label: "Regions", value: "6" },
 *     { label: "Creatures", value: "1000+" },
 *     { label: "Magic Systems", value: "12" }
 *   ]
 * };
 * 
 * const mythicRealmsNavItems = [
 *   { 
 *     id: "overview", 
 *     label: "OVERVIEW", 
 *     content: "Mythic Realms is a vast fantasy world where magic and mundane coexist in a delicate balance..." 
 *   },
 *   { 
 *     id: "regions", 
 *     label: "REGIONS", 
 *     sectionTitle: "Geographical Regions",  // Optional section title that appears above content
 *     content: "There are six main regions in Mythic Realms: The Enchanted Forest, The Mystic Mountains, The Shadowed Vale, The Crystal Caves, The Eternal Desert, and The Floating Isles.",
 *     stats: [
 *       { label: "Area", value: "1.2M sq km" },
 *       { label: "Kingdoms", value: "24" },
 *       { label: "Languages", value: "18" }
 *     ]
 *   },
 *   { 
 *     id: "magic", 
 *     label: "MAGIC SYSTEMS", 
 *     sectionTitle: "Arcane Systems",  // Optional section title
 *     content: "The world features twelve distinct magic systems, each with its own rules, limitations, and cultural impacts...",
 *     stats: [
 *       { label: "Elements", value: "8" },
 *       { label: "Schools", value: "12" },
 *       { label: "Artifacts", value: "137" }
 *     ]
 *   }
 * ];
 * 
 * <ElementCard 
 *   data={mythicRealmsData}
 *   navigationItems={mythicRealmsNavItems}
 *   statsPosition="top"
 *   showOverview={true} // Set to false to hide the overview section
 * />
 */

export default ElementCard;