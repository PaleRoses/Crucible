import React, { useRef, useState, useEffect, useCallback, useMemo, RefObject, createContext, useContext } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import styled, { css } from 'styled-components';
// Import for virtualization
import { FixedSizeList as List } from 'react-window';

// =============================================================================
// DESIGN SYSTEM & THEME CONSTANTS
// =============================================================================

const spacing = {
  xs: '0.5rem',
  sm: '1rem',
  md: '2rem',
  lg: '3rem',
};

const transitions = {
  fast: '0.2s ease',
  medium: '0.3s ease',
  slow: '0.5s ease',
};

// Typography and text styling
const typography = {
  heading: css`
    letter-spacing: 0.1em;
    font-weight: 300;
  `,
  
  subheading: css`
    letter-spacing: 0.05em;
    font-weight: 100;
    font-style: italic;
  `,
  
  bodyText: css`
    line-height: 1.8;
    font-weight: 100;
    
    @media (max-width: 480px) {
      line-height: 1.6;
    }
  `,
  
  label: css`
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  `,
};

// =============================================================================
// TYPE DEFINITIONS & INTERFACES
// =============================================================================

// Base style types
type ColorProps = {
  $highlightColor: string;
  $textColor?: string;
};

type ResponsiveProps = {
  $isMobile: boolean;
};

// Mobile context for consistent mobile state across components
const MobileContext = createContext<boolean>(false);

// Context for ElementCard configuration settings
interface ElementCardContextType {
  mobileSectionTextAlign: 'center' | 'left' | 'right';
  mobileSectionContentPadding: number;
  mobileFontSizeFactor: number;
  handleMobileOverflow: boolean;
  mobileContentMaxWidth: number;
}

const ElementCardContext = createContext<ElementCardContextType>({
  mobileSectionTextAlign: 'center',
  mobileSectionContentPadding: 0.5,
  mobileFontSizeFactor: 1,
  handleMobileOverflow: true,
  mobileContentMaxWidth: 95
});

// Core data interfaces
interface StatItem {
  value: string | number;
  label: string;
}

// Unified base interfaces for composition
interface WithStats {
  stats?: StatItem[];
}

interface WithContent {
  content?: React.ReactNode | string | (React.ReactNode | string)[];
}

interface WithIdentifier {
  id: string;
}

interface WithTitle {
  title?: string;
}

interface WithLabel {
  label: string;
}

// Component interfaces composed from base interfaces
interface NavigationItem extends WithIdentifier, WithLabel, WithContent, WithStats {
  sectionTitle?: string; // Optional title to display above section content
}

interface AdditionalSection extends WithTitle, WithContent {
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
  
  /** Left and right margin for mobile content (rem, default: 2) */
  mobileContentMargin?: number;
  
  /** Whether to use sticky navigation in mobile view (default: false) */
  useStickyMobileNav?: boolean;
  
  /** Breakpoint for mobile view (px, default: 768) */
  mobileBreakpoint?: number;
  
  /** Enable enhanced accessibility features (default: true) */
  enhancedAccessibility?: boolean;
  
  /** Mobile content text alignment ('center', 'left', 'right', default: 'center') */
  mobileSectionTextAlign?: 'center' | 'left' | 'right';
  
  /** Maximum width for mobile content as percentage (default: 95) */
  mobileContentMaxWidth?: number;
  
  /** Padding for section content in mobile mode (rem, default: 0.5) */
  mobileSectionContentPadding?: number;
  
  /** Mobile fade-in animation duration override (seconds, default: inherits from animationConfig) */
  mobileFadeDuration?: number;
  
  /** Whether to handle overflow in mobile mode (default: true) */
  handleMobileOverflow?: boolean;
  
  /** Mobile font size adjustment factor (0.8-1.2, default: 1) */
  mobileFontSizeFactor?: number;
}

/**
 * Layout configuration values derived from props
 */
interface LayoutValues {
  sidebarWidth: number;
  contentWidth: number;
  contentPadding: number;
}

// Styled component specific props
interface ContentSectionProps extends ResponsiveProps {
  $width: number;
  $contentPadding: number;
  $mobileContentMargin: number;
  $mobileContentMaxWidth?: number;
  $handleMobileOverflow?: boolean;
}

interface SectionTitleProps extends ColorProps {
  $isMobile?: boolean;
}

interface TitleProps extends ResponsiveProps, ColorProps {}

interface TextProps extends ResponsiveProps {
  $color: string;
  $fontFamily: string;
}

interface TaglineProps extends TextProps {
  $spacing: number;
}

// Common navigation interfaces
interface ActiveStateProps {
  $active: boolean;
}

interface ExpandedStateProps {
  $expanded: boolean; 
}

interface LineProps {
  $activeColor: string;
  $inactiveColor: string;
  $minWidth: number;
  $maxWidth: number;
}

interface NavButtonProps extends ActiveStateProps {
  $activeColor: string;
  $inactiveColor: string;
}

interface ColoredTextProps {
  $color: string;
}

// Mobile text alignment styles
interface MobileTextProps extends ColoredTextProps {
  $fontFamily: string;
  $isMobile?: boolean;
  $mobileSectionTextAlign?: 'center' | 'left' | 'right';
  $mobileSectionContentPadding?: number;
  $mobileFontSizeFactor?: number;
}

interface MarginStyleProps {
  $marginTop?: number;
  $marginBottom?: number;
}

interface MarginProps {
  marginTop?: number;
  marginBottom?: number;
}

interface StatsContainerProps extends ResponsiveProps, MarginStyleProps {}

interface StatItemProps extends ResponsiveProps {
  $isHovering: boolean;
}

interface StatValueProps extends ResponsiveProps, ColoredTextProps {}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

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

// Container mixins
const containerMixins = {
  responsiveContainer: css<ResponsiveProps>`
    display: flex;
    flex-direction: ${props => props.$isMobile ? 'column' : 'row'};
    width: 90%;
    max-width: 1300px;
    margin: 0 auto;
    position: relative;
    
    @media (prefers-reduced-motion: reduce) {
      transition: none !important;
    }
  `,
};

// Consolidated styled components using composition
const Container = styled(motion.div)<ResponsiveProps>`
  ${containerMixins.responsiveContainer}
  min-height: ${props => props.$isMobile ? 'auto' : '70vh'};
  padding-top: ${props => props.$isMobile ? '1.5rem' : '0'};
`;

const SidebarWrapper = styled.div<{$width: number}>`
  width: ${props => `${props.$width}%`};
  position: relative;
`;

const Sidebar = styled.div`
  padding: ${spacing.lg} ${spacing.md} ${spacing.md} 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  top: 0;
`;

// Common style mixins
const mixins = {
  // Mobile content overflow styles
  mobileOverflow: css`
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
  `,
  
  // Responsive font sizing
  responsiveFontSize: (mobileSizePx: number, desktopSizePx: number) => css`
    font-size: ${mobileSizePx / 16}rem;
    
    @media (min-width: 768px) {
      font-size: ${desktopSizePx / 16}rem;
    }
  `,
  
  // Focus visible style
  focusVisible: (color: string) => css`
    &:focus-visible {
      outline: 2px solid ${color};
      outline-offset: 2px;
    }
  `,
  
  // Scrollbar styling
  customScrollbar: css`
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(120, 120, 120, 0.5);
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
      background: rgba(120, 120, 120, 0.8);
    }
  `,
};

interface ContentSectionProps extends ResponsiveProps {
  $width: number;
  $contentPadding: number;
  $mobileContentMargin: number;
  $mobileContentMaxWidth?: number;
  $handleMobileOverflow?: boolean;
}

const ContentSection = styled.div<ContentSectionProps>`
  width: ${props => props.$isMobile ? '100%' : `${props.$width}%`};
  padding: ${props => props.$isMobile ? 
    `0rem ${props.$mobileContentMargin}rem` : 
    `${spacing.lg} 0 ${spacing.md} ${props.$contentPadding}rem`};
  margin-left: ${props => props.$isMobile ? '0' : 'auto'};
  text-align: ${props => props.$isMobile ? 'center' : 'left'};
  
  ${props => props.$isMobile && `
    max-width: ${props.$mobileContentMaxWidth || 95}%;
    margin: 0 auto;
    ${props.$handleMobileOverflow ? mixins.mobileOverflow : ''}
  `}
  
  @media (max-width: 480px) {
    padding: ${props => `1.5rem ${props.$mobileContentMargin * 0.75}rem`};
  }
`;

const Section = styled.div<ResponsiveProps>`
  margin-bottom: 3rem;
  scroll-margin-top: ${props => props.$isMobile ? '80px' : '2rem'};
`;

interface SectionTitleProps extends ColorProps {
  $isMobile?: boolean;
}

const SectionTitle = styled.h3<SectionTitleProps>`
  font-size: clamp(1.2rem, 2vw, 1.4rem);
  color: ${props => props.$highlightColor};
  margin-bottom: 1rem;
  font-weight: 100;
  text-align: ${props => props.$isMobile ? 'center' : 'left'};
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const InfoContainer = styled.div<ResponsiveProps>`
  margin-bottom: 2rem;
  padding-left: 5px;
  text-align: ${props => props.$isMobile ? 'center' : 'left'};
  width: 100%;
`;

interface TitleProps extends ResponsiveProps, ColorProps {}

const Title = styled.h1<TitleProps>`
  margin-bottom: 0.5rem;
  font-size: ${props => props.$isMobile ? '2.2rem' : '2.8rem'};
  color: ${props => props.$highlightColor};
  ${typography.heading}
`;

interface TextProps extends ResponsiveProps {
  $color: string;
  $fontFamily: string;
}

const Subheader = styled.h2<TextProps>`
  margin-bottom: ${spacing.md};
  font-size: ${props => props.$isMobile ? '1.1rem' : '1.2rem'};
  color: ${props => props.$color};
  font-family: ${props => props.$fontFamily};
  ${typography.subheading}
`;

interface TaglineProps extends TextProps {
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

// Common navigation interfaces
interface ActiveStateProps {
  $active: boolean;
}

interface ExpandedStateProps {
  $expanded: boolean; 
}

interface LineProps {
  $activeColor: string;
  $inactiveColor: string;
  $minWidth: number;
  $maxWidth: number;
}

// Navigation styled components
const NavLine = styled.div<LineProps & ExpandedStateProps>`
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 0.75px;
  width: ${props => props.$expanded ? `${props.$maxWidth}px` : `${props.$minWidth}px`};
  background-color: ${props => props.$expanded ? props.$activeColor : props.$inactiveColor};
  transition: width 0.3s ease, background-color 0.3s ease;
`;

interface NavButtonProps extends ActiveStateProps {
  $activeColor: string;
  $inactiveColor: string;
}

// Navigation and interactive element mixins
const navMixins = {
  buttonBase: css`
    background: transparent;
    border: none;
    outline: none;
    box-shadow: none;
    cursor: pointer;
  `,
  
  horizontalHover: css<NavButtonProps>`
    &:hover:not(:active) {
      transform: translateX(5px);
      color: ${props => props.$active ? props.$activeColor : props.$activeColor + 'CC'};
    }
    
    &:active {
      transform: translateX(7px);
    }
  `,
  
  verticalHover: css`
    &:hover {
      transform: translateY(-2px);
    }
    
    &:active {
      transform: translateY(1px);
    }
  `,
};

const NavButton = styled.button<NavButtonProps>`
  position: relative;
  display: block;
  padding: 0.5rem 0 0.5rem 40px;
  font-size: clamp(0.7rem, 1vw, 0.85rem);
  letter-spacing: 0.2em;
  width: fit-content;
  text-align: left;
  transition: color ${transitions.medium}, transform ${transitions.medium};
  color: ${props => props.$active ? props.$activeColor : props.$inactiveColor};
  transform: ${props => props.$active ? 'translateX(10px)' : 'none'};
  
  ${navMixins.buttonBase}
  ${props => mixins.focusVisible(props.$activeColor)}
  ${navMixins.horizontalHover}
`;

// Mobile navigation components
const MobileNav = styled.div<{$highlightColor: string}>`
  width: 100%;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1rem 0 2rem 0;
  flex-wrap: wrap;
  gap: 1rem;
  position: relative;
  z-index: 1;
`;

const MobileNavItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 0.75rem;
  position: relative;
`;

const MobileNavButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  transition: transform ${transitions.fast};
  
  ${navMixins.buttonBase}
  ${mixins.focusVisible('currentColor')}
  ${navMixins.verticalHover}
`;

// Reuse LineProps and add active state
const MobileNavLine = styled.div<LineProps & ActiveStateProps>`
  width: ${props => props.$active ? `${props.$maxWidth}px` : `${props.$minWidth}px`};
  height: 2px;
  background-color: ${props => props.$active ? props.$activeColor : props.$inactiveColor};
  transition: width 0.3s ease, background-color 0.3s ease;
  margin-bottom: 0.5rem;
`;

// Reuse with active state
const MobileNavLabel = styled.div<NavButtonProps>`
  font-size: 0.75rem;
  color: ${props => props.$active ? props.$activeColor : props.$inactiveColor};
  letter-spacing: 0.1em;
  transition: color 0.3s ease;
  font-weight: ${props => props.$active ? '500' : '400'};
  white-space: nowrap;
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
  }
`;

// Stats and content components
// Layout mixins
const layoutMixins = {
  flexContainer: css<ResponsiveProps>`
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    justify-content: ${props => props.$isMobile ? 'center' : 'space-between'};
  `,
};

interface MarginStyleProps {
  $marginTop?: number;
  $marginBottom?: number;
}

interface MarginProps {
  marginTop?: number;
  marginBottom?: number;
}

// Margin style mixin
const marginMixin = css<MarginStyleProps>`
  margin-top: ${props => props.$marginTop !== undefined ? `${props.$marginTop}rem` : spacing.lg};
  margin-bottom: ${props => props.$marginBottom !== undefined ? `${props.$marginBottom}rem` : '0'};
`;

interface StatsContainerProps extends ResponsiveProps, MarginStyleProps {}

const StatsContainer = styled.div<StatsContainerProps>`
  ${layoutMixins.flexContainer}
  ${marginMixin}
  gap: ${props => props.$isMobile ? spacing.md : '0'};
`;

interface StatItemProps extends ResponsiveProps {
  $isHovering: boolean;
}

const StatItem = styled.div<StatItemProps>`
  flex: ${props => props.$isMobile ? '0 0 auto' : '1'};
  text-align: center;
  padding: 0 ${spacing.sm};
  min-width: ${props => props.$isMobile ? '140px' : '100px'};
  transition: transform ${transitions.medium};
  transform: ${props => props.$isHovering ? 'translateY(-5px)' : 'none'};
`;

interface ColoredTextProps {
  $color: string;
}

interface StatValueProps extends ResponsiveProps, ColoredTextProps {}

const StatValue = styled.div<StatValueProps>`
  font-size: ${props => props.$isMobile ? '2.2rem' : '2.5rem'};
  font-weight: 300;
  color: ${props => props.$color};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div<ColoredTextProps>`
  font-size: 0.85rem;
  color: ${props => props.$color};
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

// Typography mixins
const textMixins = {
  mobileText: css<MobileTextProps>`
    ${props => props.$isMobile && `
      padding: ${props.$mobileSectionContentPadding || 0.5}rem 0;
      width: 100%;
      font-size: calc(clamp(0.9rem, 1.1vw, 1rem) * ${props.$mobileFontSizeFactor || 1});
      display: block;
      margin-left: auto;
      margin-right: auto;
    `}
  `,
  
  responsiveAlignment: css<MobileTextProps>`
    text-align: ${props => props.$isMobile 
      ? (props.$mobileSectionTextAlign || 'center') 
      : 'left'};
  `,
};

const SectionContent = styled.p<MobileTextProps>`
  margin-bottom: 1.5rem;
  font-size: clamp(0.9rem, 1.1vw, 1rem);
  color: ${props => props.$color};
  font-family: ${props => props.$fontFamily};
  
  ${typography.bodyText}
  ${textMixins.responsiveAlignment}
  ${textMixins.mobileText}
`;

// Styling for virtualized list container
const VirtualListContainer = styled.div`
  width: 100%;
  margin-bottom: 1.5rem;
  
  /* Style the scrollbar for better UX */
  & .react-window-list {
    ${mixins.customScrollbar}
  }
`;

/**
 * =============================================================================
 * COMPONENT DECLARATIONS
 * =============================================================================
 */

/**
 * ElementCard Component - Information Display with Advanced Scroll Behavior
 * 
 * Creates a display with a three-phase scroll behavior:
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
 */

// Base component props
interface BaseComponentProps {
  highlightColor: string;
  textColor: string;
}

interface AccessibilityProps {
  enhancedAccessibility?: boolean;
}

// Specialized component props using composition
interface InfoHeaderProps extends BaseComponentProps {
  data: InfoData;
  isMobile: boolean;
  fontFamily: string;
  taglineNavSpacing: number;
  enhancedAccessibility?: boolean;
}

interface MobileNavItemComponentProps extends BaseComponentProps, AccessibilityProps {
  navItem: NavigationItem;
  activeSection: string;
  minLineWidth: number;
  maxLineWidth: number;
}

interface NavLinkComponentProps extends BaseComponentProps {
  navItem: NavigationItem;
  activeSection: string;
  expandedNavItem: string | null;
  onMouseEnter: (id: string) => void;
  onMouseLeave: () => void;
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

interface StatsComponentProps extends BaseComponentProps, MarginProps {
  stats: StatItem[] | undefined;
  isMobile: boolean;
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
  const isMobile = useContext(MobileContext);
  const { 
    mobileSectionTextAlign, 
    mobileSectionContentPadding,
    mobileFontSizeFactor
  } = useContext(ElementCardContext);
  
  if (!content) return null;
  
  if (typeof content === 'string') {
    return (
      <SectionContent 
        $color={textColor}
        $fontFamily={fontFamily}
        $isMobile={isMobile}
        $mobileSectionTextAlign={mobileSectionTextAlign}
        $mobileSectionContentPadding={mobileSectionContentPadding}
        $mobileFontSizeFactor={mobileFontSizeFactor}
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
 * Default props for the ElementCard component
 * Centralizing all defaults in one object improves maintainability
 */
const defaultElementCardProps: Partial<ElementCardProps> = {
  // Animation configuration
  animationConfig: {
    threshold: 0.5,
    once: true,
    initialY: 30,
    duration: 0.8
  },
  
  // Content configuration
  additionalSections: [],
  onSectionChange: null,
  
  // Positioning configuration
  topOffset: 100,
  
  // Color and styling
  highlightColor: '#bfad7f',
  textColor: 'rgba(224, 224, 224, 0.7)',
  fontFamily: '"Garamond", "Adobe Caslon Pro", serif',
  
  // Navigation styling
  minLineWidth: 10,
  maxLineWidth: 40,
  
  // Content structure
  navigationItems: [
    { id: 'overview', label: 'OVERVIEW', content: null },
    { id: 'details', label: 'DETAILS', content: null },
    { id: 'examples', label: 'EXAMPLES', content: null }
  ],
  
  // Layout parameters
  contentCompression: 0,
  maxSections: 8,
  columnSpacing: 2,
  taglineNavSpacing: 3,
  
  // Virtualization options
  useVirtualization: true,
  virtualItemHeight: 140,
  virtualListThreshold: 10,
  
  // Stats options
  statsPosition: 'bottom',
  
  // Show overview section
  showOverview: true,
  
  // Enhanced mobile experience
  mobileContentMargin: 2,
  useStickyMobileNav: false,
  mobileBreakpoint: 768,
  enhancedAccessibility: true,
  
  // Mobile styling parameters
  mobileSectionTextAlign: 'center',
  mobileContentMaxWidth: 95,
  mobileSectionContentPadding: 0.5,
  handleMobileOverflow: true,
  mobileFontSizeFactor: 1
};

/**
 * ElementCard Component - Main implementation
 * 
 * The component accepts a variety of parameters to customize its behavior and appearance.
 * All parameters have sensible defaults provided by the defaultProps object.
 */
const ElementCard = (props: ElementCardProps) => {
  // Merge default props with provided props
  const {
    // Core data (required, so no default)
    data,
    
    // Merged configuration props
    animationConfig,
    additionalSections,
    onSectionChange,
    topOffset,
    highlightColor,
    textColor,
    fontFamily,
    minLineWidth,
    maxLineWidth,
    navigationItems,
    contentCompression,
    maxSections,
    columnSpacing,
    taglineNavSpacing,
    useVirtualization,
    virtualItemHeight,
    virtualListThreshold,
    statsPosition,
    showOverview,
    mobileContentMargin,
    mobileBreakpoint,
    enhancedAccessibility,
    mobileSectionTextAlign,
    mobileContentMaxWidth,
    mobileSectionContentPadding,
    mobileFadeDuration,
    handleMobileOverflow,
    mobileFontSizeFactor
  } = { ...defaultElementCardProps, ...props } as Required<ElementCardProps>;
  
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
    amount: isMobile ? 0.1 : (animationConfig?.threshold ?? 0.2), // Lower threshold for mobile
    once: animationConfig?.once ?? true,
    margin: isMobile ? "-5px 0px" : "0px" // Additional margin for mobile detection
  });

  /**
   * =====================================================================
   * UTILITY FUNCTIONS
   * Memoized handlers and utility functions
   * =====================================================================
   */
  
  // Check if we're on mobile with enhanced handling for mode changes
  const checkMobile = useCallback((): void => {
    const isMobileView = window.innerWidth <= mobileBreakpoint;
    
    // Only update if there's a change in state to avoid unnecessary renders
    if (isMobile !== isMobileView) {
      setIsMobile(isMobileView);
      
      // Reset animation when switching between mobile and desktop
      // This ensures proper animation when switching modes
      if (controls && isInitialized) {
        // First reset to initial state
        controls.set({ opacity: 0, y: animationConfig?.initialY ?? 30 });
        
        // Then immediately start the animation again with appropriate timing
        controls.start({ 
          opacity: 1, 
          y: 0,
          transition: { 
            duration: isMobileView ? 
              (mobileFadeDuration || animationConfig?.duration || 0.6) : 
              (animationConfig?.duration || 0.8),
            ease: "easeOut"
          }
        });
      }
    }
  }, [mobileBreakpoint, isMobile, controls, isInitialized, animationConfig, mobileFadeDuration]);

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
  
  // Mobile nav functionality uses simplified approach without sticky behavior

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
      // Different duration and delay for mobile to improve appearance
      const duration = isMobile ? 
        (mobileFadeDuration || animationConfig?.duration || 0.6) : 
        (animationConfig?.duration || 0.8);
      
      controls.start({ 
        opacity: 1, 
        y: 0,
        transition: { 
          duration,
          ease: "easeOut",
          delay: isMobile ? 0 : 0.1 // No delay on mobile for immediate feedback
        }
      });
      
      // Mark as initialized after animation completes
      const timeout = setTimeout(() => {
        setIsInitialized(true);
      }, duration * 1000 + 100);
      
      return () => clearTimeout(timeout);
    }
  }, [isInView, controls, animationConfig?.duration, isMobile, mobileFadeDuration]);

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

  // Mobile navigation uses simple positioning without scroll behavior

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
          <SectionTitle 
            $highlightColor={highlightColor}
            $isMobile={isMobile}
            id={`section-title-${sectionId}`}
          >
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
    <MobileContext.Provider value={isMobile}>
      <ElementCardContext.Provider value={{
        mobileSectionTextAlign: mobileSectionTextAlign || 'center',
        mobileSectionContentPadding: mobileSectionContentPadding || 0.5,
        mobileFontSizeFactor: mobileFontSizeFactor || 1,
        handleMobileOverflow: handleMobileOverflow !== false,
        mobileContentMaxWidth: mobileContentMaxWidth || 95
      }}>
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
                enhancedAccessibility={enhancedAccessibility}
              />
              
              {/* Navigation links with event delegation */}
              {!isMobile && (
                <NavLinks ref={navLinksRef} role={enhancedAccessibility ? "navigation" : undefined}>
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
          <>
            <InfoHeader
              data={data}
              isMobile={isMobile}
              highlightColor={highlightColor}
              textColor={textColor}
              fontFamily={fontFamily}
              taglineNavSpacing={0.5} /* Reduced spacing before nav */
              enhancedAccessibility={enhancedAccessibility}
            />
          
            {/* Mobile navigation below tagline */}
            <MobileNav
              ref={mobileNavRef}
              $highlightColor={highlightColor}
              role={enhancedAccessibility ? "navigation" : undefined}
              aria-label={enhancedAccessibility ? "Section navigation" : undefined}
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
                    enhancedAccessibility={enhancedAccessibility}
                  />
                ))}
            </MobileNav>
          </>
        )}
        
        {/* Right content section */}
        <ContentSection 
          ref={contentRef}
          $isMobile={isMobile}
          $width={layoutValues.contentWidth}
          $contentPadding={layoutValues.contentPadding}
          $mobileContentMargin={mobileContentMargin}
          $mobileContentMaxWidth={mobileContentMaxWidth || 95}
          $handleMobileOverflow={handleMobileOverflow !== false}
          role={enhancedAccessibility ? "main" : undefined}
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
      </ElementCardContext.Provider>
  </MobileContext.Provider>
  );
};

// Using memo to prevent unnecessary re-renders
// Removed unused MemoizedElementCard
ElementCard.displayName = 'ElementCard';

/**
 * Theme presets for ElementCard component variants
 */
const ElementCardThemes = {
  golden: {
    highlightColor: '#bfad7f',
    textColor: 'rgba(224, 224, 224, 0.7)',
    fontFamily: '"Garamond", "Adobe Caslon Pro", serif',
  },
  
  night: {
    highlightColor: '#6f8cba',
    textColor: 'rgba(200, 210, 230, 0.8)',
    fontFamily: '"Helvetica Neue", "Arial", sans-serif',
  },
  
  elegant: {
    highlightColor: '#8a2731', // Burgundy red
    textColor: 'rgba(235, 225, 215, 0.8)', // Warm light color
    fontFamily: '"Baskerville", "Times New Roman", serif',
    minLineWidth: 8,
    maxLineWidth: 35,
  }
};

/**
 * GoldenElementCard Component
 * A preset version of ElementCard with a golden/amber color scheme.
 */
export const GoldenElementCard: React.FC<ElementCardProps> = (props) => {
  return <ElementCard {...ElementCardThemes.golden} {...props} />;
};

/**
 * NightElementCard Component
 * A preset version of ElementCard with a blue-tinted dark color scheme.
 */
export const NightElementCard: React.FC<ElementCardProps> = (props) => {
  return <ElementCard {...ElementCardThemes.night} {...props} />;
};

/**
 * ElegantElementCard Component
 * A preset version of ElementCard with an elegant maroon/burgundy color scheme.
 */
export const ElegantElementCard: React.FC<ElementCardProps> = (props) => {
  return <ElementCard {...ElementCardThemes.elegant} {...props} />;
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