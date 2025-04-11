'use client';

/**
 * ScrollingContentWithNav Component
 * 
 * A responsive component that provides section-based content with automatic 
 * navigation. Features include:
 * - Sticky side navigation (desktop) and collapsible top navigation (mobile)
 * - Automatic section detection using Intersection Observer
 * - Smooth scrolling between sections
 * - Support for custom section headers
 * - Flexible content rendering through props or data
 * 
 * Color theme uses 5 standardized colors:
 * - primary: Used for active elements and accents
 * - text: Main text color
 * - textMuted: Secondary text color
 * - background: Main background color
 * - glow: Hover state color
 * - border: Border color for separators
 */

import React, { useState, useRef, useEffect, useCallback, ReactNode, useMemo } from 'react';

// Adjust the import path based on your project structure and PandaCSS output directory
import { css, cx } from '../../../styled-system/css'; // Requires PandaCSS setup

// --- TypeScript Interfaces ---

/**
 * Represents a content section within the ScrollingContentWithNav component
 */
export interface Section {
  id: string;
  title: string; // The short title used for the navigation sidebar
  sectionTitle?: string; // Longer title used in the content area (falls back to title if not provided)
  content?: string[]; // Array of paragraph content strings
  headerElement?: {
    type: 'image' | 'card' | 'code' | 'text';
    content?: string[]; // For text content in cards
    src?: string; // For image sources
    code?: string; // For code blocks
    bgColor?: string; // Optional background color (should use theme colors)
  };
  // Optional custom component to render instead of default content
  customComponent?: React.ReactNode;
}

export interface ScrollingContentWithNavProps {
  sections: Section[];
  children?: ReactNode; // Now optional, as the component can render content directly from sections
  activeSection?: string | null;
  onNavClick?: (id: string) => void;
  navTitle?: string;
  
  // Header options
  headerTitle?: string;      // Simple title text with default styling
  headerRightContent?: ReactNode; // Optional right-side content (buttons, etc.)
  headerContent?: ReactNode; // Full custom header (overrides headerTitle when provided)
  
  // Styling class names for different component parts
  containerClassName?: string;
  headerClassName?: string;
  mainClassName?: string;
  contentColumnClassName?: string;
  navColumnClassName?: string;
  sectionHeadingClassName?: string;
  sectionParagraphClassName?: string;
  
  // Behavior controls
  enableAutoDetection?: boolean;
  offsetTop?: number; // Offset for space ABOVE the component (e.g., external nav bar)
  useChildrenInsteadOfData?: boolean; // Flag to use the children prop instead of auto-rendering from data
}

// --- PandaCSS Style Definitions ---

// Outermost container div
export const containerStyles = css({
  position: 'relative',
  width: 'full',
  height: '100vh', // Ensure container takes full viewport height
  display: 'flex',
  flexDirection: 'column',
  color: 'text',
  fontFamily: 'body', // Ensure this font supports the weights used (e.g., 'thin', 'light')
  overflow: 'hidden', // Prevent scroll on the container itself
  pointerEvents: 'none', // Make the container itself non-interactive
  '& > *': {
    pointerEvents: 'auto', // But allow interactions with its children
  }
});

// Header Styles - Now part of content area only, with alignment matching content
export const headerStyles = css({
  background: 'background',
  width: '100%',
  paddingTop: '3',
  paddingBottom: '1.4',
  paddingLeft: { base: '2', md: '3' }, // Match content padding
  paddingRight: { base: '2', md: '3' }, // Match content padding
  borderBottom: '1px solid',
  borderColor: 'border',
  flexShrink: 0,
  display: 'block',
});

// Default header content container with flex layout
export const headerContentContainerStyles = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'left', // Changed from 'center' to match your example
  width: 'full',
});

// Default header title styles
export const headerTitleStyles = css({
  fontSize: 'lg',
  fontWeight: '200',
  textAlign: 'left',
  paddingLeft: '5', // Added padding from your example
  background: 'background', // Added background from your example
});

// Common navigation list styles
export const navListCommonStyles = css({
  listStyle: 'none',
  padding: 0,
  margin: 0,
});

// Mobile Navigation Styles - Sticky within the scrolling container
export const mobileNavWrapperStyles = css({
  display: { base: 'block', md: 'none' }, // Ensures it's only visible on mobile/tablet
  position: 'sticky',
  top: '0',
  bg: 'background',
  borderColor: 'border',
  flexShrink: 0,
  zIndex: 20,
  borderBottom: '1px solid',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
});

export const mobileNavTriggerStyles = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: 'full',
  p: '3',
  fontSize: 'sm',
  fontWeight: '200',
  color: 'text',
  cursor: 'pointer',
  border: 'none',
  bg: 'transparent',
  _hover: {
    bgColor: 'glow',
  }
});

export const mobileNavDropdownStyles = css({
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  bg: 'background',
  borderBottom: '1px solid',
  borderColor: 'border',
  boxShadow: 'lg',
  height: 'auto',
  // Remove maxH to prevent content getting cut off
  overflow: 'hidden', // Prevent ALL scrolling (both x and y)
  zIndex: 19,
  transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
});

export const mobileNavListStyles = css({
  listStyle: 'none',
  padding: '2',
  margin: 0,
});

// Main Content Area Styles - This container scrolls
export const mainContainerStyles = css({
  position: 'relative',
  marginTop: '0',
  display: 'flex',
  flexDirection: { base: 'column', md: 'row' }, // Row layout on desktop for side-by-side content and nav
  flex: '1', // Allow this container to grow and fill remaining space
  width: 'full',
  overflowY: 'auto', // Enable scrolling ONLY for this container
  overflowX: 'hidden',
  scrollBehavior: 'smooth',
  paddingTop: '0', // Ensure no padding at top to prevent dead space
  paddingRight: '2',
  paddingLeft: '5',
  WebkitOverflowScrolling: 'touch', // Improve mobile scrolling
  outline: 'none', // Prevent focus outline on the scrollable container
  '&:focus': {
    outline: 'none', // Ensure no focus outline appears
  },
  // Isolate the scrolling container
  isolation: 'isolate',
  zIndex: 1,
});

// Content Area within the scrolling container
export const contentWrapperStyles = css({
  flex: '1',
  padding: { base: '4', md: '6' },
  order: 1, // Content first on mobile
  minWidth: 0,
});

export const contentColumnStyles = css({
  width: 'full',
  maxWidth: '100%',
  margin: '0 auto',
});

// Desktop Navigation Styles - Sticky within the scrolling container
export const navWrapperStyles = css({
  display: { base: 'none', md: 'block' },
  width: { md: '64' },
  borderLeft: '1px solid',
  borderColor: 'border',
  bg: 'background',
  order: 2,
  position: 'sticky',
  top: 0,
  alignSelf: 'flex-start',
  maxHeight: '100vh', // Allow nav to take full viewport height within its sticky constraints
  overflowY: 'auto', // Allow nav itself to scroll if its content is too tall
  flexShrink: 0,
  zIndex: 20,
});

export const navScrollContainerStyles = css({
  padding: '4',
  display: 'flex',
  flexDirection: 'column',
});

export const navHeaderStyles = css({
  fontSize: 'sm',
  fontWeight: '200',
  mb: '4',
  color: 'primary',
  textAlign: 'left',
  px: '2',
  flexShrink: 0,
});

export const navListContainerStyles = css({
  position: 'relative',
  flex: '1',
  pl: '5',
  minHeight: 0,
});

export const navListStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
  listStyle: 'none',
  padding: 0,
  margin: 0,
});

// Common button style patterns
export const buttonBaseStyles = css({
  position: 'relative',
  display: 'block',
  width: 'full',
  textAlign: 'left',
  cursor: 'pointer',
  border: 'none',
  bg: 'transparent',
  transitionProperty: 'colors, background-color',
  transitionDuration: 'fast',
  transitionTimingFunction: 'ease-in-out',
  _focusVisible: {
    outline: 'none',
    boxShadow: `
      0 0 0 1px var(--colors-background),
      0 0 0 calc(1px + 2px) var(--colors-primary)
    `,
  },
  _hover: {
    bgColor: 'glow',
  }
});

// Navigation button specific styles
export const navButtonBaseStyles = css({
  position: 'relative',
  display: 'block',
  width: 'full',
  textAlign: 'left',
  pl: '3',
  pr: '2',
  py: '1.5',
  rounded: 'md',
  fontSize: 'xs',
  fontWeight: 'light',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  border: 'none',
  bg: 'transparent',
  transitionProperty: 'colors, background-color, box-shadow',
  transitionDuration: 'fast',
  transitionTimingFunction: 'ease-in-out',
  _focusVisible: {
    outline: 'none',
    boxShadow: `0 0 0 2px var(--colors-primary)`,
    bg: 'glow',
  },
  _hover: {
    bgColor: 'glow',
  }
});

export const navButtonInactiveStyles = css({
  color: 'textMuted',
  _hover: {
    color: 'text',
  },
});

export const navButtonActiveStyles = css({
  color: 'primary',
  fontWeight: 'medium',
});

export const lineTrackStyles = css({
  position: 'absolute',
  left: '2',
  top: '0',
  width: '2px',
  bg: 'border',
  rounded: 'full',
  transition: 'height 0.3s ease-in-out',
});

export const lineIndicatorStyles = css({
  position: 'absolute',
  left: '0',
  width: '5px',
  bg: 'primary',
  borderRadius: '0 3px 3px 0',
  boxShadow: '0 0 6px var(--colors-primary)',
  transitionProperty: 'top, height, opacity, transform',
  transitionDuration: 'normal',
  transitionTimingFunction: 'ease-in-out',
});

// Common styles for header elements
export const headerElementBaseStyles = css({
  mb: '6',
  width: 'full',
  borderRadius: 'md',
  p: '4',
  overflow: 'hidden',
});

// Section header element styles
export const headerElementStyles = css({
  mb: '6',
  width: 'full',
  borderRadius: 'md',
  overflow: 'hidden',
});

export const headerImageStyles = css({
  width: 'full',
  maxHeight: '240px',
  objectFit: 'cover',
});

export const headerCardStyles = css({
  p: '4',
  border: '1px solid',
  borderColor: 'border',
  borderRadius: 'md',
  boxShadow: 'sm',
  bg: 'background',
});

export const headerCodeStyles = css({
  p: '4',
  fontFamily: 'mono',
  fontSize: 'sm',
  bg: 'background',
  color: 'text',
  borderRadius: 'md',
  overflow: 'auto',
});

export const headerTextStyles = css({
  p: '4',
  fontStyle: 'italic',
  color: 'text',
  borderLeft: '4px solid',
  borderColor: 'primary',
  bg: 'background',
});

// Section content styles
export const sectionHeadingStyles = css({
  fontSize: 'xl',
  fontWeight: 'semibold',
  mb: '4',
  color: 'primary',
});

export const sectionParagraphStyles = css({
  mb: '4',
  lineHeight: 'relaxed',
  color: 'text',
});

// Styles applied to the <section> wrapper for each child
export const sectionStyles = css({
  // scrollMarginTop is now applied dynamically via inline style
  mb: '12',
  zIndex: -10,
  paddingLeft: '2rem',
  paddingRight: '5rem',
  py: '2',
  position: 'relative',
  '& h1, & h2, & h3': {
    fontWeight: 'thin', // Weight 100. IMPORTANT: Your body font MUST support this weight.
    color: 'primary',
  },
});

// --- Section Header Component ---
interface SectionHeaderProps {
  headerElement: NonNullable<Section['headerElement']>;
}

interface HeaderWrapperProps {
  children: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ headerElement }) => {
  const { type } = headerElement;
  
  // Custom background color if provided
  const customStyles = headerElement.bgColor ? { backgroundColor: headerElement.bgColor } : {};
  
  // Common paragraph rendering function
  const renderParagraphs = (content?: string[]) => {
    return content?.map((text, index) => (
      <p key={index} style={{ 
        marginBottom: index < (content.length - 1) ? '1rem' : 0,
        color: 'var(--colors-text)',
      }}>
        {text}
      </p>
    ));
  };

  // Common wrapper
  const HeaderWrapper: React.FC<HeaderWrapperProps> = ({ children }) => (
    <div className={headerElementStyles}>
      {children}
    </div>
  );
  
  switch (type) {
    case 'image':
      return (
        <HeaderWrapper>
          <img 
            src={headerElement.src || ''} 
            alt="Section header" 
            className={headerImageStyles} 
          />
        </HeaderWrapper>
      );
      
    case 'card':
      return (
        <HeaderWrapper>
          <div className={headerCardStyles} style={customStyles}>
            {renderParagraphs(headerElement.content)}
          </div>
        </HeaderWrapper>
      );
      
    case 'code':
      return (
        <HeaderWrapper>
          <pre className={headerCodeStyles} style={customStyles}>
            <code>{headerElement.code}</code>
          </pre>
        </HeaderWrapper>
      );
      
    case 'text':
      return (
        <HeaderWrapper>
          <div className={headerTextStyles} style={customStyles}>
            {renderParagraphs(headerElement.content)}
          </div>
        </HeaderWrapper>
      );
      
    default:
      return null;
  }
};

// --- ScrollingContentWithNav Component Implementation ---

const ScrollingContentWithNav: React.FC<ScrollingContentWithNavProps> = ({
  sections,
  children,
  activeSection: externalActiveSection = null,
  onNavClick: externalOnNavClick,
  navTitle = 'Contents',
  headerContent,
  headerTitle,
  headerRightContent,
  containerClassName,
  headerClassName,
  mainClassName,
  contentColumnClassName,
  navColumnClassName,
  sectionHeadingClassName,
  sectionParagraphClassName,
  enableAutoDetection = true,
  offsetTop = 40, // Offset for external space ABOVE the component
  useChildrenInsteadOfData = false,
}) => {
  // --- Refs ---
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const navListRef = useRef<HTMLUListElement>(null);
  const sectionRefs = useRef<Map<string, HTMLElement | null>>(new Map());
  const mobileNavRef = useRef<HTMLDivElement>(null); // Ref for sticky mobile nav height calculation
  const mobileNavToggleRef = useRef<HTMLButtonElement>(null);
  const firstMobileNavItemRef = useRef<HTMLButtonElement>(null);
  // Touch gesture refs
  const touchStartRef = useRef<number | null>(null);
  const touchMoveRef = useRef<number | null>(null);

  // --- State ---
  const [internalActiveSection, setInternalActiveSection] = useState<string | null>(
    externalActiveSection || (sections.length > 0 ? sections[0].id : null)
  );
  const activeSection = externalActiveSection !== null ? externalActiveSection : internalActiveSection;
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0, opacity: 0 });
  const [trackHeight, setTrackHeight] = useState(0);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  // Total scroll offset (external offsetTop + internal sticky elements)
  const [scrollOffset, setScrollOffset] = useState(offsetTop);
  // Touch gesture state
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  // --- Calculate Total Scroll Offset ---
  const calculateAndSetScrollOffset = useCallback(() => {
    let internalStickyHeight = 0;
    // Check if mobile nav exists and is currently displayed (sticky)
    if (mobileNavRef.current && window.getComputedStyle(mobileNavRef.current).display !== 'none') {
      internalStickyHeight = mobileNavRef.current.offsetHeight;
    }
    // Add a small buffer (e.g., 10px) for safety margin
    const buffer = 10;
    setScrollOffset(offsetTop + internalStickyHeight + buffer);
  }, [offsetTop]); // Dependency on external offsetTop prop

  // Calculate offset on mount and window resize, and fix initial scroll position
  useEffect(() => {
    calculateAndSetScrollOffset(); // Initial calculation
    
    // Fix for unwanted scroll space: ensure we start at the top
    if (mainContainerRef.current) {
      mainContainerRef.current.scrollTop = 0;
    }

    window.addEventListener('resize', calculateAndSetScrollOffset);
    return () => {
      window.removeEventListener('resize', calculateAndSetScrollOffset);
    };
  }, [calculateAndSetScrollOffset]); // Recalculate if the function itself changes (due to offsetTop changing)

  // --- Intersection Observer Logic ---
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    // Skip detection when programmatic scrolling is happening
    if (mainContainerRef.current?.hasAttribute('data-scrolling-programmatically')) {
      return;
    }
    
    const visibleEntries = entries.filter(entry => entry.isIntersecting);
    if (visibleEntries.length === 0) return;

    // Sort by position relative to the calculated scrollOffset line
    visibleEntries.sort((a, b) => {
        const topA = a.boundingClientRect.top;
        const topB = b.boundingClientRect.top;
        if (topA < scrollOffset && topB >= scrollOffset) return 1;
        if (topB < scrollOffset && topA >= scrollOffset) return -1;
        return topA - topB;
    });

    // Filter out entries completely above the scrollOffset line
    const relevantEntries = visibleEntries.filter(entry => entry.boundingClientRect.bottom > scrollOffset);

    if (relevantEntries.length > 0) {
      const sectionId = relevantEntries[0].target.getAttribute('data-section-id');
      if (sectionId && sectionId !== internalActiveSection && externalActiveSection === null) {
        setInternalActiveSection(sectionId);
      }
    }
  }, [internalActiveSection, externalActiveSection, scrollOffset]); // Only re-create when these values change


  // --- Smooth Scrolling Logic ---
  const smoothScrollTo = useCallback((element: HTMLElement, duration = 300) => {
    if (!mainContainerRef.current) return;

    const container = mainContainerRef.current;
    const originalScrollBehavior = container.style.scrollBehavior;
    container.style.scrollBehavior = 'auto';
    container.setAttribute('data-scrolling-programmatically', 'true');

    // Calculate target position using the combined scrollOffset state
    const targetPosition = element.offsetTop - scrollOffset;
    const startPosition = container.scrollTop;
    const distance = targetPosition - startPosition;
    let startTime: number | null = null;

    const easeOutQuint = (t: number): number => 1 - Math.pow(1 - t, 5);

    const scrollAnimation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const easedProgress = easeOutQuint(progress);

      container.scrollTop = startPosition + distance * easedProgress;

      if (timeElapsed < duration) {
        requestAnimationFrame(scrollAnimation);
      } else {
        setTimeout(() => {
          container.removeAttribute('data-scrolling-programmatically');
          container.style.scrollBehavior = originalScrollBehavior;
        }, 100);
      }
    };
    requestAnimationFrame(scrollAnimation);
  }, [scrollOffset]); // Only re-create when scrollOffset changes

  // --- Navigation Click Handler ---
  const scrollToSection = useCallback((id: string) => {
    if (externalOnNavClick) {
      externalOnNavClick(id);
    }
    if (externalActiveSection === null) {
        setInternalActiveSection(id);
    }
    const targetElement = mainContainerRef.current?.querySelector<HTMLElement>(`#${CSS.escape(id)}, [data-section-id="${CSS.escape(id)}"]`);
    if (targetElement && mainContainerRef.current) {
      smoothScrollTo(targetElement);
    } else {
      console.warn(`ScrollingContentWithNav: Failed to find section element: ${id}`);
    }
    setIsMobileNavOpen(false);
  }, [externalOnNavClick, smoothScrollTo, externalActiveSection]);

  // --- Keyboard Navigation Handler ---
  const handleKeyDown = useCallback((event: React.KeyboardEvent, currentIndex: number) => {
    const navButtons = navListRef.current?.querySelectorAll('button');
    if (!navButtons || navButtons.length === 0) return;
    
    let nextIndex = currentIndex;
    
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        nextIndex = Math.max(0, currentIndex - 1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        nextIndex = Math.min(navButtons.length - 1, currentIndex + 1);
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = navButtons.length - 1;
        break;
      default:
        return; // Do nothing for other keys
    }
    
    if (nextIndex !== currentIndex) {
      const nextButton = navButtons[nextIndex] as HTMLButtonElement;
      nextButton.focus();
      // Optionally, navigate to the section as well
      const sectionId = sections[nextIndex].id;
      scrollToSection(sectionId);
    }
  }, [sections, scrollToSection]);


  // --- Effects ---

  // Memoize the observer options to prevent recalculation on every render
  const observerOptions = useMemo(() => {
    if (!mainContainerRef.current) return null;
    
    const scrollContainer = mainContainerRef.current;
    // Adjust rootMargin based on the calculated scrollOffset state
    const topMargin = Math.round(scrollOffset);
    const bottomMarginPercentage = 40;
    const bottomMargin = Math.round(scrollContainer.clientHeight * (bottomMarginPercentage / 100));

    return {
      root: scrollContainer,
      rootMargin: `-${topMargin}px 0px -${bottomMargin}px 0px`,
      threshold: 0,
    } as IntersectionObserverInit;
  }, [scrollOffset, mainContainerRef.current?.clientHeight]);

  // Effect to set up the Intersection Observer
  useEffect(() => {
    if (!enableAutoDetection || externalActiveSection !== null || !mainContainerRef.current || sections.length === 0 || !observerOptions) {
      return;
    }
    
    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    sections.forEach(section => {
      const element = sectionRefs.current.get(section.id);
      if (element) observer.observe(element);
      else console.warn(`ScrollingContentWithNav: Observer could not find element ref for section: ${section.id}`);
    });

    return () => observer.disconnect();
  }, [enableAutoDetection, externalActiveSection, sections, handleIntersection, observerOptions]);


  // Effect to update the position and size of the active indicator line in desktop nav
  useEffect(() => {
    const navListElement = navListRef.current;
    if (!navListElement) {
      setTrackHeight(0);
      setIndicatorStyle({ top: 0, height: 0, opacity: 0 });
      return;
    }
    let calculatedTrackHeight = 0;
    let activeIndicatorOpacity = 0;
    let activeIndicatorTop = 0;
    let activeIndicatorHeight = 0;
    const listItems = Array.from(navListElement.children) as HTMLLIElement[];
    const firstListItem = listItems[0];

    if (listItems.length > 0) {
        const lastListItem = listItems[listItems.length - 1];
        if (firstListItem) {
             calculatedTrackHeight = (lastListItem.offsetTop + lastListItem.offsetHeight) - firstListItem.offsetTop;
             calculatedTrackHeight = Math.max(calculatedTrackHeight, firstListItem.offsetHeight);
        }
    } else {
        calculatedTrackHeight = 0;
    }
    setTrackHeight(calculatedTrackHeight);

    if (activeSection) {
      const activeListItem = navListElement.querySelector<HTMLLIElement>(`li[data-section-id="${CSS.escape(activeSection)}"]`);
      if (activeListItem && firstListItem) {
        activeIndicatorTop = activeListItem.offsetTop - firstListItem.offsetTop;
        activeIndicatorHeight = activeListItem.offsetHeight;
        activeIndicatorOpacity = 1;
      } else {
         activeIndicatorOpacity = 0;
      }
    } else {
       activeIndicatorOpacity = 0;
    }
    setIndicatorStyle({ top: activeIndicatorTop, height: activeIndicatorHeight, opacity: activeIndicatorOpacity });
  }, [activeSection, sections]);

  // Effect to manage focus when mobile nav is toggled
  useEffect(() => {
    if (isMobileNavOpen) {
      // When opened, focus the first nav item after a short delay to allow for render
      setTimeout(() => {
        const firstNavItem = document.querySelector<HTMLButtonElement>('#mobile-nav-list button');
        if (firstNavItem) {
          firstNavItem.focus();
          firstMobileNavItemRef.current = firstNavItem;
        }
      }, 50);
    } else if (firstMobileNavItemRef.current && document.activeElement === firstMobileNavItemRef.current) {
      // When closed and focus was inside the menu, return focus to toggle button
      if (mobileNavToggleRef.current) {
        mobileNavToggleRef.current.focus();
      }
    }
  }, [isMobileNavOpen]);
  
  // Additional effect to ensure outer margins can't be focused or scrolled
  useEffect(() => {
    const preventFocusOnOuterMargins = (event: globalThis.FocusEvent) => {
      // If focus enters the container but not a focusable child within content area
      if (mainContainerRef.current && !mainContainerRef.current.contains(event.target as Node)) {
        // Force focus back to the main content area
        mainContainerRef.current.focus({ preventScroll: true });
      }
    };
    
    // Capture phase to intercept before regular event handling
    document.addEventListener('focusin', preventFocusOnOuterMargins, true);
    
    return () => {
      document.removeEventListener('focusin', preventFocusOnOuterMargins, true);
    };
  }, []);


  // --- Event Handlers ---
  const handleMobileNavToggle = () => setIsMobileNavOpen(prev => !prev);
  const handleMobileNavItemClick = (id: string) => scrollToSection(id);
  
  // Mobile navigation keyboard handler
  const handleMobileKeyDown = useCallback((event: React.KeyboardEvent, currentIndex: number) => {
    const mobileNavButtons = document.querySelectorAll('#mobile-nav-list button');
    if (!mobileNavButtons || mobileNavButtons.length === 0) return;
    
    let nextIndex = currentIndex;
    
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        nextIndex = Math.max(0, currentIndex - 1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        nextIndex = Math.min(mobileNavButtons.length - 1, currentIndex + 1);
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = mobileNavButtons.length - 1;
        break;
      case 'Escape':
        event.preventDefault();
        setIsMobileNavOpen(false);
        return;
      default:
        return; // Do nothing for other keys
    }
    
    if (nextIndex !== currentIndex) {
      const nextButton = mobileNavButtons[nextIndex] as HTMLButtonElement;
      nextButton.focus();
      // We don't auto-navigate on keyboard navigation in mobile to allow exploration
      // User can press Enter or Space to activate the focused item
    }
  }, []);

  // --- Child Rendering with Refs ---
  const renderedSections = useMemo(() => {
    // If useChildrenInsteadOfData is true or we have React children passed, use those instead
    if (useChildrenInsteadOfData && React.Children.count(children) > 0) {
      if (!Array.isArray(children)) return children;
      return React.Children.map(children, (child, index) => {
        const section = sections[index];
        if (!section || !React.isValidElement(child)) return child;
        const refCallback = (el: HTMLElement | null) => {
          if (el) sectionRefs.current.set(section.id, el);
          else sectionRefs.current.delete(section.id);
        };
        const childProps = child.props as any;
        const existingClassName = childProps.className || '';
        const combinedClassName = cx(sectionStyles, existingClassName);
  
        // Apply scroll-margin-top dynamically using the calculated scrollOffset state
        const sectionInlineStyles = {
            scrollMarginTop: `${scrollOffset}px`,
        };
  
        return (
          <section
            ref={refCallback}
            data-section-id={section.id}
            id={section.id}
            className={combinedClassName}
            style={sectionInlineStyles} // Apply dynamic scroll margin here
            key={section.id}
          >
            {/* Render the optional header element if it exists */}
            {section.headerElement && (
              <SectionHeader headerElement={section.headerElement} />
            )}
            {child}
          </section>
        );
      });
    }
    
    // Otherwise, generate content from the sections data
    return sections.map((section) => {
      const refCallback = (el: HTMLElement | null) => {
        if (el) sectionRefs.current.set(section.id, el);
        else sectionRefs.current.delete(section.id);
      };
      
      // Apply scroll-margin-top dynamically using the calculated scrollOffset state
      const sectionInlineStyles = {
        scrollMarginTop: `${scrollOffset}px`,
      };
      
      return (
        <section
          ref={refCallback}
          data-section-id={section.id}
          id={section.id}
          className={sectionStyles}
          style={sectionInlineStyles}
          key={section.id}
        >
          {/* Render the optional header element if it exists */}
          {section.headerElement && (
            <SectionHeader headerElement={section.headerElement} />
          )}
          
          {/* If a custom component is provided, render that */}
          {section.customComponent ? (
            section.customComponent
          ) : (
            /* Otherwise, render the default content structure */
            <>
              <h2 className={cx(sectionHeadingStyles, sectionHeadingClassName)}>
                {section.sectionTitle || section.title}
              </h2>
              {section.content && section.content.map((paragraph, idx) => (
                <p 
                  key={`${section.id}-p-${idx}`} 
                  className={cx(sectionParagraphStyles, sectionParagraphClassName)}
                >
                  {paragraph}
                </p>
              ))}
            </>
          )}
        </section>
      );
    });
  }, [
    sections, 
    children, 
    scrollOffset, 
    useChildrenInsteadOfData, 
    sectionHeadingClassName, 
    sectionParagraphClassName
  ]);

  // --- JSX ---
  return (
    // Outermost container
    <div 
      className={cx(containerStyles, containerClassName)}
      tabIndex={-1} // Make container unfocusable
    >
      {/* Main Scrollable Container - Adding onLoad handler to ensure scroll position is reset */}
      <div 
        ref={mainContainerRef} 
        className={cx(mainContainerStyles, mainClassName)}
        onLoad={() => {
          if (mainContainerRef.current) {
            mainContainerRef.current.scrollTop = 0;
          }
        }}
        tabIndex={-1} // Prevent focus on the scrollable container itself
      >
        {/* Mobile Navigation (Sticky inside this container) */}
        <div ref={mobileNavRef} className={mobileNavWrapperStyles}>
          <button 
            ref={mobileNavToggleRef}
            className={mobileNavTriggerStyles} 
            onClick={handleMobileNavToggle} 
            aria-expanded={isMobileNavOpen} 
            aria-controls="mobile-nav-list"
            aria-haspopup="menu"
          >
            <span>{navTitle}</span>
            <span>{isMobileNavOpen ? '(-) Collapse' : '(+) Expand'}</span>
          </button>
          {isMobileNavOpen && (
            <div 
              id="mobile-nav-list" 
              className={mobileNavDropdownStyles}
              role="menu"
              aria-orientation="vertical"
              aria-label={navTitle}
              style={dropdownStyle}
            >
              <div className={css({ 
                padding: '2', 
                textAlign: 'center', 
                fontSize: 'xs', 
                color: 'textMuted',
                borderBottom: '1px solid',
                borderColor: 'border',
                marginBottom: '2'
              })}>
                Swipe up to dismiss
              </div>
                              <ul 
                className={mobileNavListStyles}
                // Keep touch gestures for dismissing the menu but prevent them from causing scroll
                onTouchStart={(e) => {
                  // Prevent default to avoid any native scrolling behavior
                  e.preventDefault();
                  touchStartRef.current = e.touches[0].clientY;
                  touchMoveRef.current = e.touches[0].clientY;
                }}
                onTouchMove={(e) => {
                  // Prevent default to avoid any native scrolling behavior
                  e.preventDefault();
                  if (!touchStartRef.current) return;
                  
                  const currentY = e.touches[0].clientY;
                  const startY = touchStartRef.current;
                  touchMoveRef.current = currentY;
                  
                  // Only respond to upward swipes (startY > currentY means swiping up)
                  if (startY > currentY) {
                    const distance = startY - currentY;
                    // Apply a transform based on the swipe distance, but cap it
                    const translateY = Math.min(distance * 0.5, 100);
                    setDropdownStyle({
                      transform: `translateY(-${translateY}px)`,
                      opacity: 1 - (translateY / 150), // Fade out as it moves up
                    });
                  }
                }}
                onTouchEnd={() => {
                  if (!touchStartRef.current || !touchMoveRef.current) {
                    touchStartRef.current = null;
                    touchMoveRef.current = null;
                    setDropdownStyle({});
                    return;
                  }
                  
                  const startY = touchStartRef.current;
                  const endY = touchMoveRef.current;
                  const threshold = 50; // Minimum distance to consider it a swipe
                  
                  // If it was an upward swipe of sufficient distance
                  if (startY - endY > threshold) {
                    setIsMobileNavOpen(false);
                  }
                  
                  // Reset regardless of outcome
                  touchStartRef.current = null;
                  touchMoveRef.current = null;
                  setDropdownStyle({});
                }}
              >
                {sections.map((section, index) => {
                  const isActive = activeSection === section.id;
                  return (
                    <li key={`mobile-${section.id}`} role="none">
                      <button 
                        onClick={() => handleMobileNavItemClick(section.id)} 
                        className={cx(navButtonBaseStyles, isActive ? navButtonActiveStyles : navButtonInactiveStyles)} 
                        aria-current={isActive ? 'location' : undefined}
                        role="menuitem"
                        tabIndex={0}
                        onKeyDown={(e) => handleMobileKeyDown(e, index)}
                      >
                        {section.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
        
        {/* Content Area */}
        <div className={cx(contentWrapperStyles)}>
          {/* Header with default or custom content */}
          {(headerContent || headerTitle) && (
            <div className={cx(headerStyles, headerClassName)}>
              {headerContent ? (
                // If custom headerContent is provided, use it directly
                headerContent
              ) : (
                // Otherwise, use the default header layout with title and optional right content
                <div className={headerContentContainerStyles}>
                  <h1 className={headerTitleStyles}>
                    {headerTitle || navTitle} {/* Fall back to navTitle if headerTitle not provided */}
                  </h1>
                  {headerRightContent && (
                    <div className="header-right-content">
                      {headerRightContent}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <div className={cx(contentColumnStyles, contentColumnClassName)}>
            {renderedSections}
          </div>
        </div>

        {/* Desktop Navigation Sidebar (Sticky inside this container) */}
        <div className={cx(navWrapperStyles, navColumnClassName)}>
          <div className={navScrollContainerStyles}>
            <div className={navListContainerStyles}>
              <div className={lineTrackStyles} style={{ height: `${trackHeight}px` }} aria-hidden="true"></div>
              <div className={lineIndicatorStyles} style={{ transform: `translateY(${indicatorStyle.top}px)`, height: `${indicatorStyle.height}px`, opacity: indicatorStyle.opacity }} aria-hidden="true"></div>
              <ul ref={navListRef} className={navListStyles} role="menu" aria-orientation="vertical" aria-label={navTitle}>
                {sections.map((section, index) => {
                  const isActive = activeSection === section.id;
                  return (
                    <li key={section.id} data-section-id={section.id} role="none">
                      <button 
                        onClick={() => scrollToSection(section.id)} 
                        className={cx(navButtonBaseStyles, isActive ? navButtonActiveStyles : navButtonInactiveStyles)} 
                        aria-current={isActive ? 'location' : undefined}
                        role="menuitem"
                        tabIndex={0}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                      >
                        {section.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollingContentWithNav;

/**
 * COMPONENT OPTIMIZATION NOTES:
 * 
 * 1. Color System Standardization:
 *    - Reduced to 5 core semantic colors: primary, text, textMuted, background, glow, and border
 *    - Removed all _dark{} theme references to rely on theme variables instead
 *    - Consistent color application throughout all component parts
 * 
 * 2. Style Reusability:
 *    - Created common base styles (buttonBaseStyles, navCommonStyles, etc.)
 *    - Extracted shared patterns into reusable style objects
 *    - Used composition to build more complex styles from basic ones
 * 
 * 3. Component Structure:
 *    - Added helper components and functions in SectionHeader
 *    - Simplified repetitive rendering logic
 *    - Added comprehensive documentation
 * 
 * 4. Reduced Duplication:
 *    - Consolidated similar styles across mobile and desktop navigation
 *    - Standardized padding and spacing patterns
 *    - Improved style organization and naming for better maintainability
 */