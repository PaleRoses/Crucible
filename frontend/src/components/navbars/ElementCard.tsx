import { motion, useAnimation, useInView } from 'framer-motion';
import React, {
  RefObject,
  createContext,
  createRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { FixedSizeList as List } from 'react-window';
import styled, { css } from 'styled-components';

// =============================================================================
// DESIGN SYSTEM & THEME CONSTANTS
// =============================================================================

const spacing = {
  xs: '0.5rem',
  sm: '1rem',
  md: '2rem',
  lg: '3rem'
};

const transitions = {
  fast: '0.2s ease',
  medium: '0.3s ease',
  slow: '0.5s ease'
};

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

// Type for props indicating mobile view
type ResponsiveProps = {
  $isMobile: boolean;
};

// Context to provide mobile state down the component tree
const MobileContext = createContext<boolean>(false);

// Context type for mobile-specific styling overrides within sections
interface ElementCardContextType {
  $mobileSectionTextAlign: 'center' | 'left' | 'right';
  $mobileSectionContentPadding: number;
  $mobileFontSizeFactor: number;
  $handleMobileOverflow: boolean;
  $mobileContentMaxWidth: number;
}

// Context for mobile styling overrides
const ElementCardContext = createContext<ElementCardContextType>({
  $mobileSectionTextAlign: 'center',
  $mobileSectionContentPadding: 0.5,
  $mobileFontSizeFactor: 1,
  $handleMobileOverflow: true,
  $mobileContentMaxWidth: 95
});

// Interface for individual statistic items
interface StatItemData {
  value: string | number; // The value of the stat
  label: string;          // The label for the stat
}

// Mixin interfaces for common data structures
interface WithStats { stats?: StatItemData[]; } // Component can have stats
interface WithContent { content?: React.ReactNode | string | (React.ReactNode | string)[]; } // Component can have content
interface WithIdentifier { id: string; } // Component has a unique ID
interface WithTitle { title?: string; } // Component can have a title
interface WithLabel { label: string; } // Component has a label

// Interface for navigation items (used in sidebar/mobile nav)
interface NavigationItem extends WithIdentifier, WithLabel, WithContent, WithStats {
  sectionTitle?: string; // Optional title displayed above the section content
}

// Interface for additional content sections (not tied to navigation)
interface AdditionalSection extends WithTitle, WithContent { }

// Interface for the main data structure passed to ElementCard
interface InfoData extends WithStats {
  title: string;                // Main title
  subheader: string;            // Subheader text
  tagline?: string;               // Optional tagline
  description?: (React.ReactNode | string)[]; // Main description content (can be array)
}

// Interface for animation configuration
interface AnimationConfig {
  threshold?: number; // Intersection observer threshold
  once?: boolean;     // Animate only once
  initialY?: number;  // Initial vertical offset for animation
  duration?: number;  // Animation duration
}

// Interface for margin props in styled components
interface MarginProps {
  $marginTop?: number;
  $marginBottom?: number;
}

// Main props interface for the ElementCard component
interface ElementCardProps {
  data: InfoData;                     // Core data for the card
  animationConfig?: AnimationConfig;    // Animation settings
  additionalSections?: AdditionalSection[]; // Extra sections at the end
  onSectionChange?: ((sectionId: string) => void) | null; // Callback when active section changes
  topOffset?: number;                   // Offset for sticky sidebar
  highlightColor?: string;              // Primary highlight color (e.g., '#FF5733' or 'var(--primary)')
  textColor?: string;                   // Default text color (e.g., 'rgba(224, 224, 224, 0.7)' or 'var(--text-secondary)')
  minLineWidth?: number;                // Min width for nav lines
  maxLineWidth?: number;                // Max width for nav lines
  fontFamily?: string;                  // Font family for text
  navigationItems?: NavigationItem[];   // Data for navigation sections
  contentCompression?: number;          // Adjusts sidebar/content width ratio (0-10)
  maxSections?: number;                 // Max number of nav sections to render
  columnSpacing?: number;               // Space between sidebar and content
  taglineNavSpacing?: number;           // Space between tagline and nav links
  useVirtualization?: boolean;          // Enable react-window virtualization
  virtualItemHeight?: number;           // Height of items in virtualized lists
  virtualListThreshold?: number;        // Min items needed to trigger virtualization
  statsPosition?: 'top' | 'bottom' | 'none'; // Where to display main stats (top/bottom/none)
  showOverview?: boolean;               // Whether to include the 'overview' section
  mobileContentMargin?: number;         // Horizontal margin for content on mobile
  useStickyMobileNav?: boolean;         // (Currently unused) Future: Make mobile nav sticky
  mobileBreakpoint?: number;            // Viewport width to switch to mobile layout
  enhancedAccessibility?: boolean;      // Add ARIA roles and attributes
  mobileSectionTextAlign?: 'center' | 'left' | 'right'; // Text alignment for sections on mobile
  mobileContentMaxWidth?: number;       // Max width percentage for content on mobile
  mobileSectionContentPadding?: number; // Vertical padding within mobile sections
  mobileFadeDuration?: number;          // Fade-in duration on mobile
  handleMobileOverflow?: boolean;       // Apply word-break styles on mobile
  mobileFontSizeFactor?: number;        // Multiplier for font size on mobile
  navTextPadding?: number;              // Left padding for desktop nav link text
  contentAlignment?: 'left' | 'center' | 'right'; // Alignment for content and sidebar
  appearImmediately?: boolean;          // Whether to appear immediately without viewport check
}

// Calculated layout values based on props
interface LayoutValues {
  sidebarWidth: number;
  contentWidth: number;
  contentPadding: number;
}

// --- DerivedColors: Simplified ---
// This interface maps the base highlightColor and textColor props
// to specific roles for clearer prop passing to children.
interface DerivedColors {
    lineColor: string; // Base color for nav lines (uses highlightColor)
    activeNavTextColor: string; // Color for active/hovered nav text (uses highlightColor)
    inactiveNavTextColor: string; // Color for inactive nav text (uses textColor)
    statValueColor: string; // Color for stat values (uses highlightColor)
    statLabelColor: string; // Color for stat labels (uses textColor)
    sectionTitleColor: string; // Color for section titles (uses highlightColor)
    subheaderColor: string; // Color for subheader (uses highlightColor)
    titleColor: string; // Color for main title (uses highlightColor)
    taglineColor: string; // Color for tagline (uses textColor)
    contentTextColor: string; // Color for general paragraph content (uses textColor)
}

// Styled component specific props interfaces
interface ContentSectionProps extends ResponsiveProps {
  $width: number;               // Width percentage
  $contentPadding: number;      // Left padding (desktop)
  $mobileContentMargin: number; // Horizontal margin (mobile)
  $mobileContentMaxWidth?: number; // Max width constraint (mobile)
  $handleMobileOverflow?: boolean; // Word break flag (mobile)
}

// Props for section titles
interface SectionTitleProps {
  $color: string; // Direct color prop
  $isMobile?: boolean; // Inherited via context, used for alignment
}

// Props for the main title H1
interface TitleProps extends ResponsiveProps {
    $color: string; // Direct color prop
}

// Props for general text elements (Subheader, Tagline)
interface TextProps extends ResponsiveProps {
  $color: string;
  $fontFamily: string;
}
// Props for the Tagline paragraph
interface TaglineProps extends TextProps {
  $spacing: number; // Bottom margin spacing
}

// Props indicating an active state (e.g., nav links)
interface ActiveStateProps {
  $active: boolean;
}
// Props indicating an expanded state (e.g., nav lines on hover/active)
interface ExpandedStateProps {
  $expanded: boolean;
}

// --- LineProps: Updated ---
// Defines props for the NavLine and MobileNavLine components.
interface LineProps {
  $lineColor: string; // The base color for the line (typically highlightColor)
  $minWidth: number;
  $maxWidth: number;
}
// Props for navigation buttons (desktop and mobile label)
interface NavButtonProps extends ActiveStateProps {
  $activeColor: string;   // Direct color prop for active text
  $inactiveColor: string; // Direct color prop for inactive text
}
// Props for simple colored text elements (e.g., stat labels)
interface ColoredTextProps {
  $color: string;
}
// Props for text elements specifically styled for mobile context
interface MobileTextProps extends ColoredTextProps {
  $fontFamily: string;
  $isMobile?: boolean;
  $mobileSectionTextAlign?: 'center' | 'left' | 'right';
  $mobileSectionContentPadding?: number;
  $mobileFontSizeFactor?: number;
}
// Props for the container holding stats
interface StatsContainerProps extends ResponsiveProps, MarginProps {}
// Props for individual stat items
interface StatItemComponentProps extends ResponsiveProps {
  $isHovering: boolean; // Hover state for desktop animation
}
// Props for the stat value display
interface StatValueProps extends ResponsiveProps, ColoredTextProps {}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
/**
 * Throttles a function call.
 */
const throttle = <T extends (...args: unknown[]) => unknown>(fn: T, wait: number): ((...args: Parameters<T>) => void) => {
  let lastCalled = 0, timeout: number | null = null, lastArgs: Parameters<T> | null = null;
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
 * Debounces a function call.
 */
const debounce = <T extends (...args: unknown[]) => unknown>(fn: T, wait: number): ((...args: Parameters<T>) => void) => {
  let timeout: number | null = null;
  return (...args: Parameters<T>) => {
    if (timeout !== null) window.clearTimeout(timeout);
    timeout = window.setTimeout(() => fn(...args), wait);
  };
};

// =============================================================================
// STYLED COMPONENTS (Updates for Lines)
// =============================================================================

// Reusable CSS mixins for styled-components
const containerMixins = {
  // Basic flex container layout, switches to column on mobile
  responsiveContainer: css<ExtendedContainerProps>`
    display: flex;
    flex-direction: ${props => props.$isMobile ? 'column' : 'row'};
    width: 90%; /* Adjust overall width */
    max-width: 1300px; /* Max width constraint */
    margin: 0 auto; /* Center the container */
    position: relative; /* Needed for absolute positioning inside */
    @media (prefers-reduced-motion: reduce) {
      transition: none !important; /* Disable transitions if user prefers reduced motion */
    }
  `,
};

// Extended ResponsiveProps to include content alignment
interface ExtendedContainerProps extends ResponsiveProps {
  $contentAlignment?: 'left' | 'center' | 'right';
}

// Main container for the entire component
const Container = styled(motion.div)<ExtendedContainerProps>`
  ${containerMixins.responsiveContainer}
  min-height: ${props => props.$isMobile ? 'auto' : '70vh'}; /* Minimum height on desktop */
  padding-top: ${props => props.$isMobile ? '1.5rem' : '0'}; /* Add padding top on mobile */
  
  /* Handle container alignment */
  ${props => !props.$isMobile && props.$contentAlignment === 'center' && `
    justify-content: center;
    align-items: flex-start;
  `}
  
  /* Right alignment for desktop view */
  ${props => !props.$isMobile && props.$contentAlignment === 'right' && `
    justify-content: flex-end;
    align-items: flex-start;
  `}
`;

// Extended SidebarWrapper props with alignment
interface SidebarWrapperProps {
  $width: number;
  $contentAlignment?: 'left' | 'center' | 'right';
}

// Wrapper for the sidebar content (used for width calculation)
const SidebarWrapper = styled.div<SidebarWrapperProps>`
  width: ${props => `${props.$width}%`}; /* Dynamically set width */
  position: relative; /* Needed for sticky positioning calculation */
  
  /* Handle sidebar alignment based on content alignment */
  ${props => props.$contentAlignment === 'center' && `
    display: flex;
    justify-content: center;
  `}
  
  ${props => props.$contentAlignment === 'right' && `
    display: flex;
    justify-content: flex-end;
  `}
`;

// The actual sidebar element that can become sticky
const Sidebar = styled.div`
  padding: ${spacing.lg} ${spacing.md} ${spacing.md} 0; /* Padding */
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative; /* Default position */
  top: 0; /* Default position */
`;

// General utility mixins
const mixins = {
  // Handles text overflow on mobile
  mobileOverflow: css`
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
  `,
  // Adds a visible focus outline for accessibility
  focusVisible: (color: string) => css`
    &:focus-visible {
      outline: 2px solid ${color};
      outline-offset: 2px;
    }
  `,
};

// Extended ContentSectionProps to include content alignment
interface ExtendedContentSectionProps extends ContentSectionProps {
  $contentAlignment?: 'left' | 'center' | 'right';
}

// Wrapper for the main content area
const ContentSection = styled.div<ExtendedContentSectionProps>`
  width: ${props => props.$isMobile ? '100%' : `${props.$width}%`}; /* Full width on mobile, dynamic on desktop */
  padding: ${props => props.$isMobile
    ? `0rem ${props.$mobileContentMargin}rem` /* Mobile padding */
    : `${spacing.lg} 0 ${spacing.md} ${props.$contentPadding}rem` /* Desktop padding */
  };
  
  /* Handle content alignment */
  ${props => {
    if (props.$isMobile) {
      return 'margin: 0 auto; text-align: center;';
    }
    
    switch (props.$contentAlignment) {
      case 'center':
        return 'margin-left: auto; margin-right: auto; text-align: center;';
      case 'right':
        return 'margin-left: auto; margin-right: 0; text-align: right;';
      case 'left':
      default:
        return 'margin-left: 0; margin-right: auto; text-align: left;';
    }
  }}

  /* Mobile specific overrides */
  ${props => props.$isMobile && `
    max-width: ${props.$mobileContentMaxWidth || 95}%; /* Max width constraint */
    ${props.$handleMobileOverflow ? mixins.mobileOverflow : ''} /* Apply overflow handling */
  `}

  /* Further adjustments for very small screens */
  @media (max-width: 480px) {
    padding: ${props => `1.5rem ${props.$mobileContentMargin * 0.75}rem`}; /* Reduce padding */
  }
`;

// Wrapper for individual content sections (Overview, Details, etc.)
const Section = styled.div<ResponsiveProps>`
  margin-bottom: 3rem; /* Spacing between sections */
  /* Adjust scroll target position to account for fixed headers/nav */
  scroll-margin-top: ${props => props.$isMobile ? '80px' : '2rem'};
`;

// Title for individual sections within the content area
const SectionTitle = styled.h3<SectionTitleProps>`
  font-size: clamp(1.2rem, 2vw, 1.4rem); /* Responsive font size */
  color: ${props => props.$color}; // Use direct color prop from derivedColors.sectionTitleColor
  margin-bottom: 1rem;
  font-weight: 100; /* Lighter weight */
  text-align: ${props => props.$isMobile ? 'center' : 'left'}; /* Alignment based on view */
  @media (max-width: 480px) {
    font-size: 1.1rem; /* Slightly smaller on very small screens */
  }
`;

// Container for the main header info (Title, Subheader, Tagline)
const InfoContainer = styled.div<ResponsiveProps>`
  margin-bottom: 2rem;
  padding-left: 5px; /* Slight indent */
  text-align: ${props => props.$isMobile ? 'center' : 'left'};
  width: 100%;
`;

// Main title H1
const Title = styled.h1<TitleProps>`
  margin-bottom: 0.5rem;
  font-size: ${props => props.$isMobile ? '2.2rem' : '2.8rem'}; /* Different sizes for mobile/desktop */
  color: ${props => props.$color}; // Use direct color prop from derivedColors.titleColor
  ${typography.heading} /* Apply heading typography styles */
`;

// Subheader H2
const Subheader = styled.h2<TextProps>`
  margin-bottom: ${spacing.md};
  font-size: ${props => props.$isMobile ? '1.1rem' : '1.2rem'};
  font-family: ${props => props.$fontFamily};
  ${typography.subheading} /* Apply subheading typography styles */
  color: ${props => props.$color}; // Use direct color prop from derivedColors.subheaderColor
`;

// Tagline paragraph
const Tagline = styled.p<TaglineProps>`
  line-height: 1.6;
  margin-bottom: ${props => `${props.$spacing}rem`}; /* Configurable bottom margin */
  font-weight: 100;
  font-size: 1.1rem;
  max-width: ${props => props.$isMobile ? '100%' : '90%'}; /* Limit width on desktop */
  color: ${props => props.$color}; // Use direct color prop from derivedColors.taglineColor
  font-family: ${props => props.$fontFamily};
`;

// Container for desktop navigation links
const NavLinks = styled.div`
  display: flex;
  flex-direction: column;
`;

// Container for a single desktop navigation link (line + button)
const NavLinkContainer = styled.div`
  position: relative; /* For absolute positioning of the line */
  margin-bottom: 1rem; /* Spacing between nav items */
`;

// --- NavLine: Uses opacity for active state ---
// The line's color is set by the $lineColor prop (derived from highlightColor).
// Active/inactive state is indicated by changing width and opacity.
const NavLine = styled.div<LineProps & ExpandedStateProps>`
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 0.75px;
  width: ${props => props.$expanded ? `${props.$maxWidth}px` : `${props.$minWidth}px`};
  /* Use the single base line color passed via $lineColor prop */
  background-color: ${props => props.$lineColor};
  /* Control opacity based on expanded state (active or hovered) */
  opacity: ${props => props.$expanded ? 1 : 0.5}; /* Active: 100%, Inactive: 50% */
  /* Transition width and opacity */
  transition: width ${transitions.medium}, opacity ${transitions.medium};
`;

// Mixins specific to navigation elements
const navMixins = {
  // Base styles for button elements used in navigation
  buttonBase: css`
    background: transparent; border: none; outline: none; box-shadow: none;
    cursor: pointer; margin: 0; appearance: none;
    /* Padding is applied specifically in NavButton/MobileNavButton */
  `,
  // Hover/active effects for horizontal (desktop) nav buttons
  horizontalHover: css<NavButtonProps>`
    &:hover:not(:active) {
      transform: translateX(5px);
      color: ${props => props.$activeColor}; // Use active color on hover
    }
    &:active {
      transform: translateX(7px);
    }
  `,
  // Hover/active effects for vertical (mobile) nav buttons
  verticalHover: css`
    &:hover { transform: translateY(-2px); } /* Slight lift on hover */
    &:active { transform: translateY(1px); } /* Press down on click */
  `,
};

// Interface extending NavButtonProps to include padding
interface NavButtonPropsWithPadding extends NavButtonProps {
  $navTextPadding?: number; // Optional padding prop
}

// Desktop navigation button
const NavButton = styled.button<NavButtonPropsWithPadding>`
  position: relative; /* Ensure text is above the line */
  display: block;
  /* Configurable left padding to position text relative to the line */
  padding: 0.5rem 0 0.5rem ${props => props.$navTextPadding || 40}px;
  font-size: clamp(0.7rem, 1vw, 0.85rem); /* Responsive font size */
  letter-spacing: 0.2em; /* Wide letter spacing */
  width: fit-content; /* Only take up needed width */
  text-align: left;
  transition: color ${transitions.medium}, transform ${transitions.medium};
  /* Change color and position based on active state */
  color: ${props => props.$active ? props.$activeColor : props.$inactiveColor}; // Uses derived active/inactive colors
  transform: ${props => props.$active ? 'translateX(10px)' : 'none'};
  ${navMixins.buttonBase} /* Apply base button styles */
  ${props => mixins.focusVisible(props.$activeColor)} /* Apply focus style using active color */
  ${navMixins.horizontalHover} /* Apply hover/active effects */
`;

// Container for the mobile navigation bar
const MobileNav = styled.div`
  width: 100%;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: center; /* Center items */
  align-items: center;
  margin: 1rem 0 2rem 0; /* Spacing around the nav */
  flex-wrap: wrap; /* Allow items to wrap on smaller screens */
  gap: 1rem; /* Spacing between nav items */
  position: relative; /* Needed if implementing sticky behavior */
  z-index: 1; /* Ensure it's above content if sticky */
`;

// Container for a single mobile navigation item (line + label)
const MobileNavItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 0.75rem; /* Spacing between items */
  position: relative;
`;

// Clickable area for a mobile navigation item
const MobileNavButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem; /* Clickable area padding */
  transition: transform ${transitions.fast};
  ${navMixins.buttonBase} /* Apply base button styles */
  ${mixins.focusVisible('currentColor')} /* Use current text color for focus */
  ${navMixins.verticalHover} /* Apply hover/active effects */
`;

// --- MobileNavLine: Uses opacity for active state ---
// The line's color is set by the $lineColor prop (derived from highlightColor).
// Active/inactive state is indicated by changing width and opacity.
const MobileNavLine = styled.div<LineProps & ActiveStateProps>`
  width: ${props => props.$active ? `${props.$maxWidth}px` : `${props.$minWidth}px`};
  height: 2px;
  /* Use the single base line color passed via $lineColor prop */
  background-color: ${props => props.$lineColor};
  /* Control opacity based on active state */
  opacity: ${props => props.$active ? 1 : 0.5}; /* Active: 100%, Inactive: 50% */
  /* Transition width and opacity */
  transition: width ${transitions.medium}, opacity ${transitions.medium};
  margin-bottom: 0.5rem;
`;

// Text label for mobile navigation items
const MobileNavLabel = styled.div<NavButtonProps>`
  font-size: 0.75rem;
  /* Change color and weight based on active state */
  color: ${props => props.$active ? props.$activeColor : props.$inactiveColor}; // Uses derived active/inactive colors
  font-weight: ${props => props.$active ? '500' : '400'};
  letter-spacing: 0.1em;
  transition: color ${transitions.medium};
  white-space: nowrap; /* Prevent labels from breaking */
  @media (max-width: 480px) {
    font-size: 0.7rem; /* Slightly smaller on very small screens */
  }
`;

// Mixins for layout elements like the stats container
const layoutMixins = {
  // Flex container for stats, centers on mobile, space-between on desktop
  flexContainer: css<ResponsiveProps>`
    display: flex;
    flex-wrap: wrap; /* Allow stats to wrap */
    width: 100%;
    justify-content: ${props => props.$isMobile ? 'center' : 'space-between'};
  `,
};

// Container for the statistics section
const StatsContainer = styled.div<StatsContainerProps>`
  ${layoutMixins.flexContainer}
  /* Configurable top/bottom margins */
  margin-top: ${props => props.$marginTop !== undefined ? `${props.$marginTop}rem` : spacing.lg};
  margin-bottom: ${props => props.$marginBottom !== undefined ? `${props.$marginBottom}rem` : '0'};
  gap: ${props => props.$isMobile ? spacing.md : '0'}; /* Add gap between stats on mobile */
`;

// Wrapper for a single statistic item
const StatItem = styled.div<StatItemComponentProps>`
  flex: ${props => props.$isMobile ? '0 0 auto' : '1'}; /* Allow flex grow on desktop */
  text-align: center;
  padding: 0 ${spacing.sm}; /* Horizontal padding */
  min-width: ${props => props.$isMobile ? '140px' : '100px'}; /* Minimum width */
  transition: transform ${transitions.medium};
  /* Add hover effect on desktop */
  transform: ${props => props.$isHovering ? 'translateY(-5px)' : 'none'};
`;

// The numerical value of a statistic
const StatValue = styled.div<StatValueProps>`
  font-size: ${props => props.$isMobile ? '2.2rem' : '2.5rem'};
  font-weight: 300; /* Lighter weight */
  color: ${props => props.$color}; // Use direct color prop from derivedColors.statValueColor
  margin-bottom: 0.5rem;
`;

// The label for a statistic
const StatLabel = styled.div<ColoredTextProps>`
  ${typography.label} /* Apply label typography styles */
  color: ${props => props.$color}; // Use direct color prop from derivedColors.statLabelColor
`;

// Mixins for text content within sections
const textMixins = {
  // Applies mobile-specific padding, font size adjustments
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
  // Applies text alignment based on mobile context values
  responsiveAlignment: css<MobileTextProps>`
    text-align: ${props => props.$isMobile
      ? (props.$mobileSectionTextAlign || 'center')
      : 'left'
    };
  `,
};

// Paragraph text content within sections
const SectionContent = styled.p<MobileTextProps>`
  margin-bottom: 1.5rem;
  font-size: clamp(0.9rem, 1.1vw, 1rem); /* Responsive base font size */
  color: ${props => props.$color}; // Use direct color prop from derivedColors.contentTextColor
  font-family: ${props => props.$fontFamily};
  ${typography.bodyText} /* Apply body text line-height etc. */
  ${textMixins.responsiveAlignment} /* Apply alignment */
  ${textMixins.mobileText} /* Apply mobile text overrides */
`;

// Container for the react-window virtualized list
const VirtualListContainer = styled.div`
  width: 100%;
  margin-bottom: 1.5rem; /* Spacing below the list */
`;

// =============================================================================
// HOOKS (Unchanged)
// =============================================================================
// --- useThreePhaseScroll Hook ---
interface UseThreePhaseScrollOptions {
  topOffset?: number;
  disabled?: boolean;
  isMobile?: boolean;
  isInitialized?: boolean;
  throttleMs?: number;
  debounceMs?: number;
  useWillChange?: boolean;
}
function useThreePhaseScroll({
  topOffset = 100,
  disabled = false,
  isMobile = false,
  isInitialized = true,
  throttleMs = 8,
  debounceMs = 100,
  useWillChange = true
}: UseThreePhaseScrollOptions = {}): {
  phase: 'normal' | 'fixed' | 'end';
  containerRef: RefObject<HTMLDivElement | null>;
  stickyElRef: RefObject<HTMLDivElement | null>;
  stickyElWrapperRef: RefObject<HTMLDivElement | null>;
  updatePositioning: () => void;
} {
  type ScrollPhase = 'normal' | 'fixed' | 'end';
  const [phase, setPhase] = useState<ScrollPhase>('normal');
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyElRef = useRef<HTMLDivElement>(null);
  const stickyElWrapperRef = useRef<HTMLDivElement>(null);

  const updatePositioning = useCallback(() => {
    if (!containerRef.current || !stickyElRef.current || !stickyElWrapperRef.current || typeof window === 'undefined') return;
    requestAnimationFrame(() => {
      const container = containerRef.current;
      const stickyEl = stickyElRef.current;
      const wrapper = stickyElWrapperRef.current;
      if (!container || !stickyEl || !wrapper) return;

      const containerRect = container.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();
      const stickyElHeight = stickyEl.offsetHeight;
      
      // Calculate positions in viewport coordinates for more precise detection
      const wrapperTop = wrapperRect.top;
      const containerBottom = containerRect.bottom;
      
      // Use precise thresholds for phase transitions
      // We switch to fixed exactly when the wrapper's top reaches our offset
      const startFixPoint = wrapperTop <= topOffset;
      // Switch to end phase when container bottom reaches the end of our element
      const endFixPoint = containerBottom <= (topOffset + stickyElHeight);
      
      let newPhase: ScrollPhase = 'normal';
      if (startFixPoint) {
        newPhase = endFixPoint ? 'end' : 'fixed';
      }

      if (phase !== newPhase) {
        setPhase(newPhase);
        
        if (newPhase === 'normal') {
          // Normal flow positioning
          stickyEl.style.position = 'relative';
          stickyEl.style.top = '0';
          stickyEl.style.left = '0';
          stickyEl.style.width = '';
          stickyEl.style.bottom = '';
        } 
        else if (newPhase === 'fixed') {
          // Fixed positioning - ensure exact placement at threshold point
          stickyEl.style.position = 'fixed';
          stickyEl.style.top = `${topOffset}px`;
          stickyEl.style.width = `${wrapperRect.width}px`;
          stickyEl.style.left = `${wrapperRect.left}px`;
          stickyEl.style.bottom = '';
        } 
        else if (newPhase === 'end') {
          // End positioning
          stickyEl.style.position = 'absolute';
          stickyEl.style.top = 'auto'; // Unset top
          stickyEl.style.bottom = '0'; // Stick to bottom of container
          stickyEl.style.left = '0';
          stickyEl.style.width = '100%'; // Full width of wrapper
        }
      } 
      else if (newPhase === 'fixed') {
        // If already fixed, ensure width and left position are correct (can change on resize)
        const targetWidth = `${wrapperRect.width}px`;
        const targetLeft = `${wrapperRect.left}px`;
        if (stickyEl.style.width !== targetWidth) stickyEl.style.width = targetWidth;
        if (stickyEl.style.left !== targetLeft) stickyEl.style.left = targetLeft;
      }
    });
  }, [phase, topOffset]);

  const throttledScrollHandler = useMemo(() => throttle(updatePositioning, throttleMs), [updatePositioning, throttleMs]);
  const debouncedResizeHandler = useMemo(() => debounce(updatePositioning, debounceMs), [updatePositioning, debounceMs]);

  useEffect(() => {
    if (disabled || isMobile || !isInitialized || !containerRef.current || !stickyElRef.current || !stickyElWrapperRef.current) return;
    const stickyEl = stickyElRef.current; // Already checked
    const container = containerRef.current; // Already checked
    if (useWillChange && stickyEl) stickyEl.style.willChange = 'position, top, left, width, bottom';
    updatePositioning(); // Initial position check
    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    window.addEventListener('resize', debouncedResizeHandler, { passive: true });
    const resizeObserver = new ResizeObserver(debounce(() => {
      if (containerRef.current) requestAnimationFrame(() => debouncedResizeHandler()); // Update position on resize
    }, debounceMs));
    if (container) resizeObserver.observe(container);
    return () => {
      window.removeEventListener('scroll', throttledScrollHandler);
      window.removeEventListener('resize', debouncedResizeHandler);
      if (container) resizeObserver.unobserve(container); // Clean up observer
      resizeObserver.disconnect();
      if (useWillChange && stickyEl) stickyEl.style.willChange = 'auto'; // Remove will-change
    };
  }, [disabled, isMobile, isInitialized, throttledScrollHandler, debouncedResizeHandler, updatePositioning, useWillChange, debounceMs]);

  return { phase, containerRef, stickyElRef, stickyElWrapperRef, updatePositioning };
}


// --- useSectionNavigation Hook ---
interface UseSectionNavigationOptions {
  initialSection?: string;
  onSectionChange?: ((sectionId: string) => void) | null;
  isMobile?: boolean;
  mobileNavRef?: RefObject<HTMLDivElement | null>;
  observerRootMargin?: string;
  scrollBehavior?: ScrollBehavior;
  showOverview?: boolean;
  navigationItems?: NavigationItem[];
  maxSections?: number;
}
function useSectionNavigation({
  initialSection = 'overview',
  onSectionChange = null,
  isMobile = false,
  mobileNavRef, // No default assignment here, handled in useCallback
  observerRootMargin, // Defaults set in IntersectionObserver options
  scrollBehavior = 'smooth' as ScrollBehavior,
  showOverview = true,
  navigationItems = [] as NavigationItem[],
  maxSections = 8
}: UseSectionNavigationOptions = {}) {
  const firstAvailableSectionId = useMemo(() => (
    showOverview || navigationItems.length === 0
      ? navigationItems[0]?.id // If showing overview or no items, use the first one
      : navigationItems.find(item => item.id !== 'overview')?.id // Otherwise, find the first non-overview item
  ) ?? initialSection, [initialSection, navigationItems, showOverview]); // Fallback to initialSection prop

  const [activeSection, setActiveSection] = useState(firstAvailableSectionId);
  const [expandedNavItem, setExpandedNavItem] = useState<string | null>(null);

  const sectionRefs = useMemo(() => {
    const numSectionsToRender = navigationItems
      .filter(item => showOverview || item.id !== 'overview') // Apply overview filter
      .slice(0, maxSections) // Apply max sections limit
      .length;
    return Array.from({ length: numSectionsToRender }, () => createRef<HTMLDivElement>());
  }, [navigationItems, maxSections, showOverview]);

  const sectionRefsMap = useMemo<Record<string, RefObject<HTMLDivElement>>>(() => {
    const refsMap: Record<string, RefObject<HTMLDivElement>> = {};
    let refIndex = 0;
    navigationItems
      .filter(item => showOverview || item.id !== 'overview') // Apply same filtering
      .slice(0, maxSections) // Apply same slicing
      .forEach((item) => {
        refsMap[item.id] = sectionRefs[refIndex++] as RefObject<HTMLDivElement>; // Assign ref
      });
    return refsMap;
  }, [navigationItems, sectionRefs, maxSections, showOverview]);

  const scrollToSection = useCallback((sectionId: string): void => {
    if (!showOverview && sectionId === 'overview') return;
    const sectionRef = sectionRefsMap[sectionId]; // Get the ref
    if (sectionRef?.current) { // Check ref
      setActiveSection(sectionId); // Update active state
      if (onSectionChange) onSectionChange(sectionId); // Callback
      const elementTop = sectionRef.current.getBoundingClientRect().top + window.pageYOffset;
      let offset = isMobile
        ? ((mobileNavRef?.current ? mobileNavRef.current.offsetHeight : 60) + 20) // Mobile offset
        : 20; // Desktop offset
      window.scrollTo({ top: elementTop - offset, behavior: scrollBehavior }); // Scroll
    } else {
      console.warn(`[useSectionNavigation] Could not find section element for ID: ${sectionId}`);
    }
  }, [onSectionChange, sectionRefsMap, isMobile, mobileNavRef, showOverview, scrollBehavior]);

  const handleNavEvent = useCallback((e: Event): void => {
    const target = (e.target as HTMLElement).closest('[data-section-id]');
    if (target) {
      const sectionId = target.getAttribute('data-section-id');
      if (sectionId) {
        e.preventDefault(); // Prevent default
        scrollToSection(sectionId); // Scroll
      }
    }
  }, [scrollToSection]);

  const handleNavItemHover = useCallback((sectionId: string): void => {
    if (!isMobile) setExpandedNavItem(sectionId); // Set hovered on desktop
  }, [isMobile]);
  const handleNavItemLeave = useCallback((): void => {
    if (!isMobile) setExpandedNavItem(null); // Clear hovered on desktop
  }, [isMobile]);

  useEffect(() => {
    const sectionElements = Object.values(sectionRefsMap)
      .map(ref => ref.current)
      .filter((el): el is HTMLDivElement => el !== null); // Get elements
    if (sectionElements.length === 0) return; // Exit if no elements
    const options: IntersectionObserverInit = {
      root: null, // Viewport
      rootMargin: observerRootMargin || (isMobile ? '-100px 0px -65% 0px' : '-50px 0px -85% 0px'), // Active zone
      threshold: 0 // Trigger immediately
    };
    const callback: IntersectionObserverCallback = (entries) => {
      const intersectingEntries = entries.filter(entry => entry.isIntersecting);
      if (intersectingEntries.length > 0) {
        intersectingEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top); // Sort by position
        const topEntry = intersectingEntries[0]; // Topmost is active
        const sectionId = topEntry.target.getAttribute('data-section');
        if (sectionId && sectionId !== activeSection) { // Update if changed
          setActiveSection(sectionId);
          if (onSectionChange) onSectionChange(sectionId);
        }
      }
    };
    const observer = new IntersectionObserver(callback, options);
    sectionElements.forEach(element => observer.observe(element)); // Observe elements
    return () => observer.disconnect(); // Cleanup observer
  }, [sectionRefsMap, activeSection, onSectionChange, observerRootMargin, isMobile]);

  return {
    activeSection, expandedNavItem, sectionRefsMap,
    scrollToSection, handleNavEvent, handleNavItemHover, handleNavItemLeave
  };
}

// =============================================================================
// CHILD COMPONENTS (Color Props Clarified)
// =============================================================================

// Props related to accessibility features
interface AccessibilityProps {
  enhancedAccessibility?: boolean;
}

// --- InfoHeader Props ---
interface InfoHeaderProps {
  data: InfoData;
  isMobile: boolean;
  fontFamily: string;
  taglineNavSpacing: number;
  enhancedAccessibility?: boolean;
  // Direct colors passed from parent's derivedColors
  titleColor: string;
  subheaderColor: string;
  taglineColor: string;
}

// --- MobileNavItemComponent Props ---
interface MobileNavItemComponentProps extends AccessibilityProps {
  navItem: NavigationItem;
  activeSection: string;
  minLineWidth: number;
  maxLineWidth: number;
  // Direct colors passed from parent's derivedColors
  lineColor: string; // Base color for the line (highlightColor)
  activeTextColor: string; // Color for active text (highlightColor)
  inactiveTextColor: string; // Color for inactive text (textColor)
}

// --- NavLinkComponent Props ---
interface NavLinkComponentProps {
  navItem: NavigationItem;
  activeSection: string;
  expandedNavItem: string | null;
  onMouseEnter: (id: string) => void;
  onMouseLeave: () => void;
  minLineWidth: number;
  maxLineWidth: number;
  navTextPadding?: number;
  // Direct colors passed from parent's derivedColors
  lineColor: string; // Base color for the line (highlightColor)
  activeTextColor: string; // Color for active/hovered text (highlightColor)
  inactiveTextColor: string; // Color for inactive text (textColor)
}

// --- StatItemComponentPropsInternal Props ---
interface StatItemComponentPropsInternal {
  stat: StatItemData;
  isMobile: boolean;
  // Direct colors passed from parent's derivedColors
  valueColor: string; // Color for the value (highlightColor)
  labelColor: string; // Color for the label (textColor)
}

// --- SectionContentComponent Props ---
interface SectionContentComponentProps {
  content: React.ReactNode | string | null;
  textColor: string; // General text color for content (textColor)
  fontFamily: string;
}

// --- StatsComponent Props ---
interface StatsComponentProps {
  stats: StatItemData[] | undefined;
  isMobile: boolean;
  $marginTop?: number;
  $marginBottom?: number;
  // Direct colors passed from parent's derivedColors
  valueColor: string; // Color for values (highlightColor)
  labelColor: string; // Color for labels (textColor)
}

// --- VirtualizedList Props ---
interface VirtualizedListProps {
  items: (React.ReactNode | string)[];
  height?: number;
  itemHeight: number;
  textColor: string; // General text color for content (textColor)
  fontFamily: string;
  className?: string;
}

/**
 * Renders the main header section (Title, Subheader, Tagline).
 * Memoized for performance. Uses direct color props derived from highlight/text colors.
 */
const InfoHeader = React.memo(({
  data, isMobile, fontFamily, taglineNavSpacing,
  titleColor, subheaderColor, taglineColor // Destructure direct colors
}: InfoHeaderProps) => (
  <InfoContainer $isMobile={isMobile}>
    {/* Title uses derived titleColor (highlightColor) */}
    <Title $isMobile={isMobile} $color={titleColor}>
      {data.title}
    </Title>
    {/* Subheader uses derived subheaderColor (highlightColor) */}
    <Subheader $isMobile={isMobile} $color={subheaderColor} $fontFamily={fontFamily}>
      {data.subheader}
    </Subheader>
    {/* Tagline uses derived taglineColor (textColor) */}
    {data.tagline && (
      <Tagline $isMobile={isMobile} $color={taglineColor} $fontFamily={fontFamily} $spacing={taglineNavSpacing}>
        {data.tagline}
      </Tagline>
    )}
  </InfoContainer>
));
InfoHeader.displayName = 'InfoHeader';

/**
 * Renders a single navigation item for the mobile view.
 * Memoized for performance. Uses direct color props derived from highlight/text colors.
 * Line color is fixed (highlightColor), opacity changes for active state.
 */
const MobileNavItemComponent = React.memo(({
  navItem, activeSection, minLineWidth, maxLineWidth,
  lineColor, activeTextColor, inactiveTextColor // Use direct colors
}: MobileNavItemComponentProps) => {
  const isActive = activeSection === navItem.id;
  return (
    <MobileNavItem>
      {/* Button handles the click event */}
      <MobileNavButton data-section-id={navItem.id}>
        {/* MobileNavLine uses the base lineColor (highlightColor). Opacity changes based on $active. */}
        <MobileNavLine
          $active={isActive}
          $lineColor={lineColor} // Pass base line color (highlightColor)
          $minWidth={minLineWidth}
          $maxWidth={maxLineWidth}
        />
        {/* Label uses active/inactive text colors */}
        <MobileNavLabel
          $active={isActive}
          $activeColor={activeTextColor} // Pass active text color (highlightColor)
          $inactiveColor={inactiveTextColor} // Pass inactive text color (textColor)
        >
          {navItem.label}
        </MobileNavLabel>
      </MobileNavButton>
    </MobileNavItem>
  );
});
MobileNavItemComponent.displayName = 'MobileNavItemComponent';

/**
 * Renders a single navigation item for the desktop sidebar.
 * Memoized for performance. Uses direct color props derived from highlight/text colors.
 * Line color is fixed (highlightColor), opacity changes for active/hovered state.
 */
const NavLinkComponent = React.memo(({
  navItem, activeSection, expandedNavItem, onMouseEnter, onMouseLeave,
  minLineWidth, maxLineWidth, navTextPadding,
  lineColor, activeTextColor, inactiveTextColor // Use direct colors
}: NavLinkComponentProps) => {
  const isActive = activeSection === navItem.id;
  const isHovered = expandedNavItem === navItem.id;
  const isExpanded = isActive || isHovered; // Line expands if active or hovered
  return (
    // Container handles hover events
    <NavLinkContainer onMouseEnter={() => onMouseEnter(navItem.id)} onMouseLeave={onMouseLeave}>
      {/* NavLine uses the base lineColor (highlightColor). Opacity changes based on $expanded. */}
      <NavLine
        $expanded={isExpanded}
        $lineColor={lineColor} // Pass base line color (highlightColor)
        $minWidth={minLineWidth}
        $maxWidth={maxLineWidth}
      />
      {/* Button handles click event and uses active/inactive text colors */}
      <NavButton
        data-section-id={navItem.id}
        $active={isActive}
        $activeColor={activeTextColor} // Pass active text color (highlightColor)
        $inactiveColor={inactiveTextColor} // Pass inactive text color (textColor)
        $navTextPadding={navTextPadding}
        aria-current={isActive ? 'page' : undefined} // ARIA attribute for active link
      >
        {navItem.label}
      </NavButton>
    </NavLinkContainer>
  );
});
NavLinkComponent.displayName = 'NavLinkComponent';

/**
 * Renders the statistics section.
 * Memoized for performance. Uses direct color props derived from highlight/text colors.
 */
const StatsComponent = React.memo(({
  stats, isMobile, $marginTop, $marginBottom,
  valueColor, labelColor // Destructure direct colors
}: StatsComponentProps) => {
  // Don't render anything if stats array is missing or empty
  if (!stats || stats.length === 0) return null;
  return (
    <StatsContainer $isMobile={isMobile} $marginTop={$marginTop} $marginBottom={$marginBottom}>
      {stats.map((stat, statIdx) => (
        // Render individual stat items, passing direct colors
        <StatItemComponentInternal
          key={statIdx} // Use index as key since stats order is likely stable
          stat={stat}
          isMobile={isMobile}
          valueColor={valueColor} // Pass direct value color (highlightColor)
          labelColor={labelColor} // Pass direct label color (textColor)
        />
      ))}
    </StatsContainer>
  );
});
StatsComponent.displayName = 'StatsComponent';

/**
 * Renders a single statistic item (Value + Label).
 * Manages its own hover state. Uses direct color props derived from highlight/text colors.
 */
const StatItemComponentInternal = React.memo(({
  stat, isMobile, valueColor, labelColor // Destructure direct colors
}: StatItemComponentPropsInternal) => {
  // State to track hover for desktop animation
  const [isHovering, setIsHovering] = useState<boolean>(false);
  // Memoized callbacks for hover events (only active on desktop)
  const handleMouseEnter = useCallback(() => { if (!isMobile) setIsHovering(true); }, [isMobile]);
  const handleMouseLeave = useCallback(() => { if (!isMobile) setIsHovering(false); }, [isMobile]);
  return (
    <StatItem
      $isMobile={isMobile}
      $isHovering={isHovering}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* StatValue uses the derived valueColor (highlightColor) */}
      <StatValue $isMobile={isMobile} $color={valueColor}>
        {stat.value}
      </StatValue>
      {/* StatLabel uses the derived labelColor (textColor) */}
      <StatLabel $color={labelColor}>
        {stat.label}
      </StatLabel>
    </StatItem>
  );
});
StatItemComponentInternal.displayName = 'StatItemComponentInternal';

/**
 * Renders the content of a section (paragraph text or custom React nodes).
 * Handles arrays of content and applies mobile styling from context.
 * Memoized for performance.
 */
const SectionContentComponent = React.memo(({
  content, textColor, fontFamily
}: SectionContentComponentProps) => {
  // Consume context values for mobile styling
  const isMobile = useContext(MobileContext);
  const {
    $mobileSectionTextAlign,
    $mobileSectionContentPadding,
    $mobileFontSizeFactor
  } = useContext(ElementCardContext);

  // Don't render if content is null/undefined
  if (!content) return null;

  // Helper function to render a single item (string or React node)
  const renderItem = (item: React.ReactNode | string, key?: React.Key) => {
    // If it's a string, wrap it in the styled SectionContent component
    if (typeof item === 'string') {
      return (
        // SectionContent uses the general textColor (textColor)
        <SectionContent
          key={key}
          $color={textColor} // Use the general textColor for content
          $fontFamily={fontFamily}
          $isMobile={isMobile}
          $mobileSectionTextAlign={$mobileSectionTextAlign}
          $mobileSectionContentPadding={$mobileSectionContentPadding}
          $mobileFontSizeFactor={$mobileFontSizeFactor}
        >
          {item}
        </SectionContent>
      );
    }
    // If it's already a valid React element, clone it with a key, otherwise render as is
    return React.isValidElement(item) ? React.cloneElement(item, { key }) : item;
  };

  // If content is an array, map over it and render each item
  if (Array.isArray(content)) {
    return <>{content.map((item, index) => renderItem(item, index))}</>;
  }
  // Otherwise, render the single content item
  return renderItem(content);
});
SectionContentComponent.displayName = 'SectionContentComponent';

/**
 * Renders a list of items using react-window for virtualization.
 * Memoized for performance.
 */
const VirtualizedList = React.memo(({
  items, height = 400, itemHeight, textColor, fontFamily, className
}: VirtualizedListProps) => {
  // Calculate the actual height: min of specified height and total height of items
  const calculatedHeight = useMemo(() => Math.min(height, items.length * itemHeight + 20), [ // Add some padding
    items.length, itemHeight, height
  ]);
  // Consume context for mobile styling
  const isMobile = useContext(MobileContext);
  const {
    $mobileSectionTextAlign,
    $mobileSectionContentPadding,
    $mobileFontSizeFactor
  } = useContext(ElementCardContext);

  // Define the Row component required by react-window
  const Row = useCallback(({ index, style }: { index: number, style: React.CSSProperties }) => {
    const itemContent = items[index];
    // Apply the style provided by react-window (for positioning)
    return (
      <div style={style}>
        {/* Render content: wrap strings in SectionContent, render nodes directly */}
        {typeof itemContent === 'string' ? (
          // SectionContent uses the general textColor (textColor)
          <SectionContent
            $color={textColor} // Use general textColor for list items
            $fontFamily={fontFamily}
            $isMobile={isMobile}
            $mobileSectionTextAlign={$mobileSectionTextAlign}
            $mobileSectionContentPadding={$mobileSectionContentPadding}
            $mobileFontSizeFactor={$mobileFontSizeFactor}
            style={{ marginBottom: spacing.sm }} // Reduce margin within lists
          >
            {itemContent}
          </SectionContent>
        ) : (
          itemContent // Render React nodes directly
        )}
      </div>
    );
  }, [
    items, textColor, fontFamily, isMobile,
    $mobileSectionTextAlign, $mobileSectionContentPadding, $mobileFontSizeFactor // Include context values
  ]);

  return (
    <VirtualListContainer>
      <List
        className={`react-window-list ${className || ''}`} // Add base and optional class names
        height={calculatedHeight} // Use calculated height
        itemCount={items.length}
        itemSize={itemHeight} // Fixed item height
        width="100%" // Take full width
        overscanCount={3} // Render a few items above/below viewport
      >
        {Row}
      </List>
    </VirtualListContainer>
  );
});
VirtualizedList.displayName = 'VirtualizedList';

// =====================================================================
// MAIN COMPONENT: ElementCard
// =====================================================================

// Default props for the ElementCard component
const defaultElementCardProps: Partial<ElementCardProps> = {
  animationConfig: { threshold: 0.5, once: true, initialY: 30, duration: 0.8 },
  additionalSections: [],
  onSectionChange: null,
  topOffset: 100,
  highlightColor: 'var(--color-primary)', // Default highlight: vibrant orange
  textColor: 'var(--color-text)', // Default text: light grey, semi-transparent
  fontFamily: '"Garamond", "Adobe Caslon Pro", serif',
  minLineWidth: 10,
  maxLineWidth: 40,
  navigationItems: [
    { id: 'overview', label: 'OVERVIEW', content: "Default overview content." },
    { id: 'details', label: 'DETAILS', content: "Default details content." },
    { id: 'examples', label: 'EXAMPLES', content: "Default examples content." }
  ],
  contentCompression: 0,
  maxSections: 8,
  columnSpacing: 2,
  taglineNavSpacing: 3,
  useVirtualization: true,
  virtualItemHeight: 140,
  virtualListThreshold: 10,
  statsPosition: 'bottom',
  showOverview: true,
  mobileContentMargin: 2,
  useStickyMobileNav: false,
  mobileBreakpoint: 768,
  enhancedAccessibility: true,
  mobileSectionTextAlign: 'center',
  mobileContentMaxWidth: 95,
  mobileSectionContentPadding: 0.5,
  handleMobileOverflow: true,
  mobileFontSizeFactor: 1,
  mobileFadeDuration: 0.6,
  navTextPadding: 50,
  contentAlignment: 'left', // Default content alignment
  appearImmediately: true, // Default to appearing immediately
};

/**
 * The main ElementCard component. Orchestrates layout, navigation,
 * state management, and renders child components. Uses CSS opacity for lines.
 */
const ElementCard = (props: ElementCardProps) => {
  // Merge provided props with defaults
  const mergedProps = { ...defaultElementCardProps, ...props };
  // Destructure all props for use, casting to Required to satisfy TypeScript after merge
  const {
    data, animationConfig, additionalSections, onSectionChange, topOffset,
    highlightColor, textColor, fontFamily, minLineWidth, maxLineWidth,
    navigationItems, contentCompression, maxSections, columnSpacing, taglineNavSpacing,
    useVirtualization, virtualItemHeight, virtualListThreshold, statsPosition, showOverview,
    mobileContentMargin, mobileBreakpoint, enhancedAccessibility, mobileSectionTextAlign,
    mobileContentMaxWidth, mobileSectionContentPadding, mobileFadeDuration,
    handleMobileOverflow, mobileFontSizeFactor, navTextPadding, contentAlignment, appearImmediately
  } = mergedProps as Required<ElementCardProps>;

  // State: Has the initial animation finished? (Used by useThreePhaseScroll)
  // Initialize as true if we're appearing immediately
  const [isInitialized, setIsInitialized] = useState<boolean>(appearImmediately || false);
  // State: Is the view currently considered mobile?
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Refs for various DOM elements
  const mobileNavRef = useRef<HTMLDivElement>(null); // Mobile navigation container
  const contentRef = useRef<HTMLDivElement>(null); // Main content area
  const navLinksRef = useRef<HTMLDivElement>(null); // Desktop navigation links container

  // Animation controls from framer-motion
  const controls = useAnimation();

  // --- Derive Specific Colors (Simplified) ---
  // This memo maps the base highlightColor and textColor props to specific roles.
  // These derived colors are then passed down to child components.
  const derivedColors = useMemo<DerivedColors>(() => {
    return {
        // Nav lines use the highlight color directly. Opacity handles active/inactive.
        lineColor: highlightColor,
        // Active nav text uses the highlight color.
        activeNavTextColor: highlightColor,
        // Inactive nav text uses the general text color.
        inactiveNavTextColor: textColor,
        // Stat values use the highlight color.
        statValueColor: highlightColor,
        // Stat labels use the general text color.
        statLabelColor: textColor,
        // Section titles use the highlight color.
        sectionTitleColor: highlightColor,
        // Subheader uses the highlight color.
        subheaderColor: highlightColor,
        // Main title uses the highlight color.
        titleColor: highlightColor,
        // Tagline uses the general text color.
        taglineColor: textColor,
        // General paragraph content uses the general text color.
        contentTextColor: textColor,
    };
  }, [highlightColor, textColor]); // Recalculate only if highlightColor or textColor changes


  // Calculate sidebar/content widths based on compression and spacing props
  const layoutValues = useMemo<LayoutValues>(() => {
    const compression = Math.min(Math.max(contentCompression, 0), 10) / 10; // Clamp 0-1
    return {
      sidebarWidth: 45 - (compression * 5) - (columnSpacing / 2), // Sidebar gets narrower with compression
      contentWidth: 55 + (compression * 5) - (columnSpacing / 2), // Content gets wider
      contentPadding: columnSpacing + (compression * 1), // Padding increases slightly
    };
  }, [contentCompression, columnSpacing]);

  // Hook for managing the sticky sidebar behavior on desktop
  const { containerRef, stickyElRef: sidebarRef, stickyElWrapperRef: sidebarWrapperRef } = useThreePhaseScroll({
    topOffset,
    disabled: isMobile, // Disable sticky behavior on mobile
    isMobile,
    isInitialized, // Only enable after initial animation
  });

  // Hook for managing section navigation (active state, scrolling)
  const {
    activeSection, expandedNavItem, sectionRefsMap, scrollToSection,
    handleNavEvent, handleNavItemHover, handleNavItemLeave
  } = useSectionNavigation({
    // Determine initial section based on props
    initialSection: (showOverview ? navigationItems[0]?.id : navigationItems.find(item => item.id !== 'overview')?.id) || 'overview',
    onSectionChange,
    isMobile,
    mobileNavRef, // Pass ref for offset calculation
    scrollBehavior: 'smooth',
    showOverview,
    navigationItems,
    maxSections
  });

  // Set initial view state based on appearImmediately prop
  // If appearImmediately is true, skip useInView entirely
  const isInView = appearImmediately ? true : useInView(containerRef, {
    amount: isMobile ? 0.1 : (animationConfig?.threshold ?? 0.2), // Lower threshold on mobile
    once: animationConfig?.once ?? true, // Animate once by default
    margin: isMobile ? "-5px 0px" : "0px", // Adjust trigger margin slightly on mobile
  });

  // Callback to check window width and update mobile state
  const checkMobile = useCallback((): void => {
    if (typeof window !== 'undefined') {
      const isMobileView = window.innerWidth <= mobileBreakpoint;
      // Only update state if the view type actually changes
      if (isMobile !== isMobileView) setIsMobile(isMobileView);
    }
  }, [mobileBreakpoint, isMobile]); // Dependencies: breakpoint and current state

  // Effect to run checkMobile on mount and add/remove resize listener
  useEffect(() => {
    checkMobile(); // Initial check
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile); // Cleanup listener
  }, [checkMobile]); // Dependency: the memoized checkMobile function

  // Effect to add/remove click listeners for navigation (event delegation)
  useEffect(() => {
    const mobileNavEl = mobileNavRef.current;
    const navLinksEl = navLinksRef.current; // Desktop nav container
    // Add listener if the element exists
    if (mobileNavEl) mobileNavEl.addEventListener('click', handleNavEvent);
    if (navLinksEl) navLinksEl.addEventListener('click', handleNavEvent);
    // Cleanup listeners
    return () => {
      if (mobileNavEl) mobileNavEl.removeEventListener('click', handleNavEvent);
      if (navLinksEl) navLinksEl.removeEventListener('click', handleNavEvent);
    };
  }, [handleNavEvent]); // Dependency: the memoized event handler

  // Effect to trigger the entry animation when the component loads or scrolls into view
  useEffect(() => {
    if (isInView) {
      // Use different durations for mobile/desktop if specified
      const duration = isMobile ? (mobileFadeDuration ?? 0.6) : (animationConfig?.duration ?? 0.8);
      
      // If appearing immediately, use a shorter or no duration
      const effectiveDuration = appearImmediately ? 0.2 : duration;
      const effectiveDelay = appearImmediately ? 0 : (isMobile ? 0 : 0.1);
      
      // Start the animation
      controls.start({
        opacity: 1, y: 0,
        transition: { 
          duration: effectiveDuration, 
          ease: "easeOut", 
          delay: effectiveDelay
        }
      });
      
      // Set initialized state slightly after animation completes or immediately
      if (appearImmediately) {
        setIsInitialized(true);
      } else {
        const timeout = setTimeout(() => setIsInitialized(true), effectiveDuration * 1000 + 100);
        return () => clearTimeout(timeout); // Cleanup timeout
      }
    }
  }, [isInView, controls, animationConfig?.duration, isMobile, mobileFadeDuration, appearImmediately]); // Dependencies

  // Memoized callback to determine if virtualization should be used for a given content array
  const shouldUseVirtualization = useCallback((items: (React.ReactNode | string)[] | undefined): boolean => (
    useVirtualization && Array.isArray(items) && items.length >= virtualListThreshold
  ), [useVirtualization, virtualListThreshold]); // Dependencies

  // Memoized rendering logic for the 'overview' section's description content
  const renderOverviewContent = useMemo(() => {
    // Check if the description should be virtualized
    const virtualizeDesc = shouldUseVirtualization(data.description);
    return (
      <>
        {data.description && ( // Only render if description exists
          virtualizeDesc
            // Render using VirtualizedList component
            ? <VirtualizedList items={data.description!} itemHeight={virtualItemHeight} textColor={derivedColors.contentTextColor} fontFamily={fontFamily} />
            // Render normally by mapping strings/nodes
            : data.description.map((p, idx) => <SectionContentComponent key={idx} content={p} textColor={derivedColors.contentTextColor} fontFamily={fontFamily} />)
        )}
      </>
    );
  }, [data.description, shouldUseVirtualization, virtualItemHeight, derivedColors.contentTextColor, fontFamily]); // Dependencies

  // --- renderStats: Uses simplified derived colors ---
  // Memoized callback to render the stats section (used in multiple places)
  const renderStats = useCallback((stats: StatItemData[] | undefined, marginTop?: number, marginBottom?: number) => {
    // Return null if no stats to render
    if (!stats || stats.length === 0) return null;
    return (
      <StatsComponent
        stats={stats}
        isMobile={isMobile}
        // Pass derived colors directly
        valueColor={derivedColors.statValueColor} // highlightColor
        labelColor={derivedColors.statLabelColor} // textColor
        $marginTop={marginTop} // Pass margin overrides
        $marginBottom={marginBottom}
      />
    );
  }, [isMobile, derivedColors.statValueColor, derivedColors.statLabelColor]); // Depend on derived colors

  // --- getRenderedSection: Uses simplified derived colors ---
  // Memoized callback to get the content for a specific section ID
  const getRenderedSection = useCallback((sectionId: string) => {
    // Find the navigation item data for the given ID
    const section = navigationItems.find(item => item.id === sectionId);
    if (!section) return null; // Return null if section data not found

    let sectionPrimaryContent: React.ReactNode = null;
    // Special handling for 'overview' section
    if (sectionId === 'overview') {
      sectionPrimaryContent = renderOverviewContent;
    } else if (section.content) { // Handle other sections with content
      // Check if content should be virtualized
      const virtualize = Array.isArray(section.content) && shouldUseVirtualization(section.content);
      sectionPrimaryContent = virtualize
        // Render using VirtualizedList
        ? <VirtualizedList items={section.content as any[]} itemHeight={virtualItemHeight} textColor={derivedColors.contentTextColor} fontFamily={fontFamily} />
        // Render using SectionContentComponent (handles arrays/strings/nodes)
        : <SectionContentComponent content={section.content} textColor={derivedColors.contentTextColor} fontFamily={fontFamily} />;
    }

    // Assemble the section: optional title, primary content, optional stats
    return (
      <>
        {/* Render section title if provided, using derived sectionTitleColor (highlightColor) */}
        {section.sectionTitle && (
          <SectionTitle $color={derivedColors.sectionTitleColor} $isMobile={isMobile} id={`section-title-${section.id}`}>
            {section.sectionTitle}
          </SectionTitle>
        )}
        {/* Render the main content */}
        {sectionPrimaryContent}
        {/* Render stats specific to this section (if any), uses derived stat colors */}
        {renderStats(section.stats, 3, 0)}
      </>
    );
  }, [
    navigationItems, renderOverviewContent, isMobile, derivedColors.sectionTitleColor, derivedColors.contentTextColor,
    fontFamily, shouldUseVirtualization, virtualItemHeight, renderStats // Depend on derived colors
  ]);

  // Memoized context value for mobile styling overrides
  const elementCardContextValue = useMemo(() => ({
    $mobileSectionTextAlign: mobileSectionTextAlign || 'center',
    $mobileSectionContentPadding: mobileSectionContentPadding || 0.5,
    $mobileFontSizeFactor: mobileFontSizeFactor || 1,
    $handleMobileOverflow: handleMobileOverflow !== false, // Default to true
    $mobileContentMaxWidth: mobileContentMaxWidth || 95
  }), [
    mobileSectionTextAlign, mobileSectionContentPadding, mobileFontSizeFactor,
    handleMobileOverflow, mobileContentMaxWidth // Dependencies
  ]);

  // Main JSX structure (Pass updated derivedColors)
  return (
    // Provide mobile state and styling context to children
    <MobileContext.Provider value={isMobile}>
      <ElementCardContext.Provider value={elementCardContextValue}>
        {/* Main animated container */}
        <Container
          ref={containerRef} // Ref for useThreePhaseScroll and useInView
          $isMobile={isMobile}
          $contentAlignment={contentAlignment}
          initial={appearImmediately ? { opacity: 1, y: 0 } : { opacity: 0, y: animationConfig?.initialY ?? 30 }} // Initial animation state
          animate={controls} // Link to animation controls
          // Add ARIA role if enhanced accessibility is enabled
          role={enhancedAccessibility ? "region" : undefined}
          aria-label={enhancedAccessibility ? `${data.title} Info` : undefined}
        >
          {/* Desktop Sidebar */}
          {!isMobile && (
            <SidebarWrapper 
              ref={sidebarWrapperRef} 
              $width={layoutValues.sidebarWidth}
              $contentAlignment={contentAlignment}
            >
              {/* Inner sidebar holds content and receives sticky styles */}
              <Sidebar ref={sidebarRef}>
                {/* Pass derived colors to InfoHeader */}
                <InfoHeader
                  data={data} isMobile={isMobile}
                  titleColor={derivedColors.titleColor}
                  subheaderColor={derivedColors.subheaderColor}
                  taglineColor={derivedColors.taglineColor}
                  fontFamily={fontFamily}
                  taglineNavSpacing={taglineNavSpacing} enhancedAccessibility={enhancedAccessibility}
                />
                {/* Pass derived colors to StatsComponent if position is top */}
                {statsPosition === 'top' && renderStats(data.stats, 0, 3)}
                {/* Desktop Navigation Links */}
                <NavLinks ref={navLinksRef} role={enhancedAccessibility ? "navigation" : undefined} aria-label={enhancedAccessibility ? "Sections" : undefined}>
                  {navigationItems
                    .filter(i => showOverview || i.id !== 'overview') // Filter out overview if needed
                    .slice(0, maxSections) // Limit number of sections
                    .map((navItem) => (
                      // Pass derived colors to NavLinkComponent
                      <NavLinkComponent
                        key={navItem.id}
                        navItem={navItem}
                        activeSection={activeSection}
                        expandedNavItem={expandedNavItem} // Pass hovered state
                        onMouseEnter={handleNavItemHover} // Pass hover handlers
                        onMouseLeave={handleNavItemLeave}
                        // Pass colors directly from derivedColors
                        lineColor={derivedColors.lineColor} // highlightColor
                        activeTextColor={derivedColors.activeNavTextColor} // highlightColor
                        inactiveTextColor={derivedColors.inactiveNavTextColor} // textColor
                        minLineWidth={minLineWidth}
                        maxLineWidth={maxLineWidth}
                        navTextPadding={navTextPadding} // Pass text padding
                      />
                    ))}
                </NavLinks>
              </Sidebar>
            </SidebarWrapper>
          )}

          {/* Mobile Header & Nav */}
          {isMobile && (
            <>
              {/* Pass derived colors to InfoHeader */}
              <InfoHeader
                 data={data} isMobile={isMobile}
                 titleColor={derivedColors.titleColor}
                 subheaderColor={derivedColors.subheaderColor}
                 taglineColor={derivedColors.taglineColor}
                 fontFamily={fontFamily}
                 taglineNavSpacing={0.5} enhancedAccessibility={enhancedAccessibility}
              />
               {/* Pass derived colors to StatsComponent if position is top */}
              {statsPosition === 'top' && renderStats(data.stats, 0, 2)}
              {/* Mobile Navigation Bar */}
              <MobileNav
                ref={mobileNavRef} // Ref for offset calculation and event listener
                role={enhancedAccessibility ? "navigation" : undefined}
                aria-label={enhancedAccessibility ? "Section navigation" : undefined}
              >
                {navigationItems
                  .filter(i => showOverview || i.id !== 'overview') // Filter overview
                  .slice(0, maxSections) // Limit sections
                  .map((navItem) => (
                     // Pass derived colors to MobileNavItemComponent
                    <MobileNavItemComponent
                      key={navItem.id}
                      navItem={navItem}
                      activeSection={activeSection}
                      // Pass colors directly from derivedColors
                      lineColor={derivedColors.lineColor} // highlightColor
                      activeTextColor={derivedColors.activeNavTextColor} // highlightColor
                      inactiveTextColor={derivedColors.inactiveNavTextColor} // textColor
                      minLineWidth={minLineWidth}
                      maxLineWidth={maxLineWidth}
                      enhancedAccessibility={enhancedAccessibility}
                    />
                  ))}
              </MobileNav>
            </>
          )}

          {/* Content Section */}
          <ContentSection
            ref={contentRef} // Ref (currently unused, but available)
            $isMobile={isMobile}
            $width={layoutValues.contentWidth} // Pass calculated widths/padding
            $contentPadding={layoutValues.contentPadding}
            $mobileContentMargin={mobileContentMargin}
            $mobileContentMaxWidth={mobileContentMaxWidth}
            $handleMobileOverflow={handleMobileOverflow}
            $contentAlignment={contentAlignment}
            role={enhancedAccessibility ? "main" : undefined} // ARIA role for main content
          >
             {/* Pass derived colors to StatsComponent if position is bottom (Desktop) */}
            {statsPosition === 'bottom' && !isMobile && renderStats(data.stats, 3, 0)}

            {/* Render the content for each navigation section */}
            {navigationItems
              .filter(s => showOverview || s.id !== 'overview') // Filter overview
              .slice(0, maxSections) // Limit sections
              .map((section) => {
                const sectionRef = sectionRefsMap[section.id]; // Get the ref for this section
                return (
                  // Section wrapper with ref, data attribute, and ID
                  <Section
                    key={section.id}
                    ref={sectionRef} // Attach ref for IntersectionObserver
                    data-section={section.id} // Data attribute for observer/scrolling
                    id={section.id} // ID for direct linking (optional)
                    $isMobile={isMobile}
                    // ARIA attributes for tab panel role if accessibility is enhanced
                    role={enhancedAccessibility ? "tabpanel" : undefined}
                    aria-labelledby={enhancedAccessibility ? `section-title-${section.id}` : undefined}
                    tabIndex={enhancedAccessibility ? -1 : undefined} // Make focusable programmatically
                  >
                    {/* Render the actual content of the section (uses derived colors) */}
                    {getRenderedSection(section.id)}
                  </Section>
                );
              })}

            {/* Render any additional sections provided (uses derived colors) */}
            {additionalSections.map((section, index) => {
              const content = section.content;
              // Check if additional section content should be virtualized
              const virtualize = Array.isArray(content) && shouldUseVirtualization(content);
              return (
                <Section key={`additional-${index}`} $isMobile={isMobile}>
                  {/* Render title if provided, using derived sectionTitleColor (highlightColor) */}
                  {section.title && (
                    <SectionTitle $color={derivedColors.sectionTitleColor}>
                      {section.title}
                    </SectionTitle>
                  )}
                  {/* Render content (virtualized or normal), using derived contentTextColor (textColor) */}
                  {virtualize
                    ? <VirtualizedList items={content as any[]} itemHeight={virtualItemHeight} textColor={derivedColors.contentTextColor} fontFamily={fontFamily} />
                    : <SectionContentComponent content={content} textColor={derivedColors.contentTextColor} fontFamily={fontFamily} />
                  }
                </Section>
              );
            })}

             {/* Pass derived colors to StatsComponent if position is bottom (Mobile) */}
            {statsPosition === 'bottom' && isMobile && renderStats(data.stats, 3, 0)}
          </ContentSection>
        </Container>
      </ElementCardContext.Provider>
    </MobileContext.Provider>
  );
};
ElementCard.displayName = 'ElementCard';

// Export the main component as the default export
export default ElementCard;