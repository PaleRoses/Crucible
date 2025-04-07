'use client';

import React, { useState, useRef, useEffect, useCallback, ReactNode } from 'react';

// Adjust the import path based on your project structure and PandaCSS output directory
import { css, cx } from '../../../styled-system/css'; // Requires PandaCSS setup

// --- TypeScript Interfaces ---

export interface Section {
  id: string;
  title: string; // This title is used for the navigation, not the section content itself
}

export interface ScrollingContentWithNavProps {
  sections: Section[];
  children: ReactNode; // The content for each section, including its title element
  activeSection?: string | null;
  onNavClick?: (id: string) => void;
  navTitle?: string;
  headerContent?: ReactNode;
  containerClassName?: string;
  headerClassName?: string;
  mainClassName?: string;
  contentColumnClassName?: string;
  navColumnClassName?: string;
  enableAutoDetection?: boolean;
  offsetTop?: number; // Offset for space ABOVE the component (e.g., external nav bar)
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
  // Add top padding on desktop to account for fixed header
  paddingTop: { md: '70px' }, // Adjust this value based on your header height
});

// Header Styles - Fixed on desktop, hidden on mobile
export const headerStyles = css({
  background: 'background',
  width: '100%',
  p: '3',
  marginTop: "58.4px",
  paddingBottom: '1.4',
  borderBottom: '1px solid',
  borderColor: 'border',
  flexShrink: 0,
  // Higher z-index to ensure it stays above all content
  zIndex: -1,
  // Hide on mobile, show on medium screens and up
  display: { base: 'none', md: 'block' },
  // Make fixed on desktop
  position: { md: 'fixed' },
  top: 0,
  left: 0,
  right: 0,
});

// Mobile Navigation Styles - Sticky within the scrolling container
export const mobileNavWrapperStyles = css({
  display: { base: 'block', md: 'none' },
  position: 'sticky', // Make mobile nav sticky
  top: 0,            // Stick to top of its scrolling container (mainContainerStyles)
  zIndex: 20,
  borderBottom: '1px solid',
  borderColor: 'border',
  flexShrink: 0,
});

export const mobileNavTriggerStyles = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: 'full',
  p: '3',
  fontSize: 'sm',
  fontWeight: '200',
  textAlign: 'left',
  cursor: 'pointer',
  borderColor: 'border',
  bg: 'background',
  color: 'text',
  _hover: {
    bg: 'glow',
  },

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
  maxH: '300px',
  overflowY: 'auto',
  zIndex: 19,
});

export const mobileNavListStyles = css({
  listStyle: 'none',
  p: '2',
  m: 0,
});

// Main Content Area Styles - This container scrolls
export const mainContainerStyles = css({
  display: 'flex',
  flexDirection: { base: 'column', md: 'row' },
  flex: '1', // Allow this container to grow and fill remaining space
  width: 'full',
  overflowY: 'auto', // Enable scrolling ONLY for this container
  overflowX: 'hidden',
  scrollBehavior: 'smooth',
  paddingRight: '2',
  paddingLeft: '5',
});

// Content Area within the scrolling container
export const contentWrapperStyles = css({
  flex: '1',
  padding: { base: '4', md: '6' },
  order: 1, // Content first on mobile
  minWidth: 0,
  _dark: {
    bg: 'gray.800',
  }
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
  position: 'sticky', // Make desktop nav sticky
  top: 0,            // Stick to top of its scrolling container (mainContainerStyles)
  alignSelf: 'flex-start',
  maxHeight: '100vh', // Allow nav to take full viewport height within its sticky constraints
  overflowY: 'auto', // Allow nav itself to scroll if its content is too tall
  flexShrink: 0,
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
  transitionProperty: 'colors, background-color',
  transitionDuration: 'fast',
  transitionTimingFunction: 'ease-in-out',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  border: 'none',
  bg: 'transparent',
  _focusVisible: {
    outline: 'none',
    boxShadow: `
      0 0 0 1px var(--colors-background, white),
      0 0 0 calc(1px + 2px) var(--colors-primary, blue)
    `,
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
});

export const lineTrackStyles = css({
  position: 'absolute',
  left: '2',
  top: '0',
  width: '2px',
  bg: 'border',
  rounded: 'full',
  transition: 'height 0.3s ease-in-out',
  _dark: {
    bg: 'gray.700'
  }
});

export const lineIndicatorStyles = css({
  position: 'absolute',
  left: '1px',
  width: '4px',
  bg: 'primary',
  rounded: 'full',
  boxShadow: 'sm',
  transitionProperty: 'top, height, opacity, transform',
  transitionDuration: 'normal',
  transitionTimingFunction: 'ease-in-out',
  _dark: {
    bg: 'primary.300'
  }
});

// Styles applied to the <section> wrapper for each child
export const sectionStyles = css({
  // scrollMarginTop is now applied dynamically via inline style
  mb: '16',
  zIndex: -10,
  paddingLeft: '2rem',
  paddingRight: '5rem',
  py: '2',
  position: 'relative',
  '& h1, & h2, & h3': {
    fontWeight: 'thin', // Weight 100. IMPORTANT: Your body font MUST support this weight.
  },
});


// --- ScrollingContentWithNav Component Implementation ---

const ScrollingContentWithNav: React.FC<ScrollingContentWithNavProps> = ({
  sections,
  children,
  activeSection: externalActiveSection = null,
  onNavClick: externalOnNavClick,
  navTitle = 'Contents',
  headerContent,
  containerClassName,
  headerClassName,
  mainClassName,
  contentColumnClassName,
  navColumnClassName,
  enableAutoDetection = true,
  offsetTop = 40, // Offset for external space ABOVE the component
}) => {
  // --- Refs ---
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const navListRef = useRef<HTMLUListElement>(null);
  const sectionRefs = useRef<Map<string, HTMLElement | null>>(new Map());
  const mobileNavRef = useRef<HTMLDivElement>(null); // Ref for sticky mobile nav height calculation

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

  // Calculate offset on mount and window resize
  useEffect(() => {
    calculateAndSetScrollOffset(); // Initial calculation

    window.addEventListener('resize', calculateAndSetScrollOffset);
    return () => {
      window.removeEventListener('resize', calculateAndSetScrollOffset);
    };
  }, [calculateAndSetScrollOffset]); // Recalculate if the function itself changes (due to offsetTop changing)

  // --- Intersection Observer Logic ---
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
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
  }, [internalActiveSection, externalActiveSection, scrollOffset]); // Use calculated scrollOffset state


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
  }, [scrollOffset]); // Use calculated scrollOffset state

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


  // --- Effects ---

  // Effect to set up the Intersection Observer
  useEffect(() => {
    if (!enableAutoDetection || externalActiveSection !== null || !mainContainerRef.current || sections.length === 0) {
      return;
    }
    const scrollContainer = mainContainerRef.current;

    // Adjust rootMargin based on the calculated scrollOffset state
    const topMargin = Math.round(scrollOffset);
    const bottomMarginPercentage = 40;
    const bottomMargin = Math.round(scrollContainer.clientHeight * (bottomMarginPercentage / 100));

    const observerOptions: IntersectionObserverInit = {
      root: scrollContainer,
      rootMargin: `-${topMargin}px 0px -${bottomMargin}px 0px`,
      threshold: 0,
    };
    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    sections.forEach(section => {
      const element = sectionRefs.current.get(section.id);
      if (element) observer.observe(element);
      else console.warn(`ScrollingContentWithNav: Observer could not find element ref for section: ${section.id}`);
    });

    return () => observer.disconnect();
  }, [enableAutoDetection, externalActiveSection, sections, handleIntersection, scrollOffset]); // Use calculated scrollOffset state


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


  // --- Event Handlers ---
  const handleMobileNavToggle = () => setIsMobileNavOpen(prev => !prev);
  const handleMobileNavItemClick = (id: string) => scrollToSection(id);

  // --- Child Rendering with Refs ---
  const renderChildrenWithSectionRefs = () => {
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
          {child}
        </section>
      );
    });
  };

  // --- JSX ---
  return (
    // Outermost container
    <div className={cx(containerStyles, containerClassName)}>
      {/* Header Section (Scrolls normally) */}
      {headerContent && (
        <div className={cx(headerStyles, headerClassName)}>
          {headerContent}
        </div>
      )}

      {/* Main Scrollable Container */}
      <div ref={mainContainerRef} className={cx(mainContainerStyles, mainClassName)}>
        {/* Mobile Navigation (Sticky inside this container) */}
        <div ref={mobileNavRef} className={mobileNavWrapperStyles}>
          <button className={mobileNavTriggerStyles} onClick={handleMobileNavToggle} aria-expanded={isMobileNavOpen} aria-controls="mobile-nav-list">
            <span>{navTitle}</span>
            <span>{isMobileNavOpen ? '(-) Collapse' : '(+) Expand'}</span>
          </button>
          {isMobileNavOpen && (
            <div id="mobile-nav-list" className={mobileNavDropdownStyles}>
              <ul className={mobileNavListStyles}>
                {sections.map((section) => {
                  const isActive = activeSection === section.id;
                  return (
                    <li key={`mobile-${section.id}`}>
                      <button onClick={() => handleMobileNavItemClick(section.id)} className={cx(navButtonBaseStyles, isActive ? navButtonActiveStyles : navButtonInactiveStyles)} aria-current={isActive ? 'location' : undefined}>
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
           <div className={cx(contentColumnStyles, contentColumnClassName)}>
             {renderChildrenWithSectionRefs()}
           </div>
        </div>

        {/* Desktop Navigation Sidebar (Sticky inside this container) */}
        <div className={cx(navWrapperStyles, navColumnClassName)}>
          <div className={navScrollContainerStyles}>
            {navTitle && <h2 className={navHeaderStyles}>{navTitle}</h2>}
            <div className={navListContainerStyles}>
              <div className={lineTrackStyles} style={{ height: `${trackHeight}px` }} aria-hidden="true"></div>
              <div className={lineIndicatorStyles} style={{ transform: `translateY(${indicatorStyle.top}px)`, height: `${indicatorStyle.height}px`, opacity: indicatorStyle.opacity }} aria-hidden="true"></div>
              <ul ref={navListRef} className={navListStyles}>
                {sections.map((section) => {
                  const isActive = activeSection === section.id;
                  return (
                    <li key={section.id} data-section-id={section.id}>
                      <button onClick={() => scrollToSection(section.id)} className={cx(navButtonBaseStyles, isActive ? navButtonActiveStyles : navButtonInactiveStyles)} aria-current={isActive ? 'location' : undefined}>
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