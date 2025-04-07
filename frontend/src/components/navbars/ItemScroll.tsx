import React, { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
// Adjust the import path based on your project structure and PandaCSS output directory
import { css, cx } from '../../../styled-system/css'; // Requires PandaCSS setup

// --- TypeScript Interfaces ---

export interface Section {
  id: string;
  title: string;
}

export interface ScrollingContentWithNavProps {
  sections: Section[];
  children: ReactNode; // Content to be displayed in the scrollable area
  activeSection: string | null;
  onNavClick: (id: string) => void;
  navTitle?: string; // Optional title for the navigation section
  // Optional class names to allow further customization from the parent
  containerClassName?: string;
  mainClassName?: string;
  contentColumnClassName?: string;
  navColumnClassName?: string; // Applied to the sidebar wrapper on md+ screens
}

// --- PandaCSS Style Definitions ---

// Outermost container div
export const containerStyles = css({
  position: 'relative',
  h: '600px', // Example fixed height, consider using tokens or viewport units (e.g., h: '80vh')
  maxH: 'screen', // Limit height to viewport height (token: sizes.screen or '100vh')
  w: 'full', // Takes full available width (token: sizes.full or '100%')
  bg: 'background', // Use semantic token for background color (e.g., 'white')
  color: 'text', // Use semantic token for default text color (e.g., 'gray.800')
  rounded: 'lg', // Use radius token (e.g., radii.lg or '0.5rem')
  boxShadow: 'xl', // Use shadow token (e.g., shadows.xl)
  overflow: 'hidden', // Clip content and ensure border-radius applies correctly
  fontFamily: 'body', // Use font token (e.g., fonts.body or 'Inter, sans-serif')
  border: '1px solid', // Add a subtle border
  borderColor: 'border', // Use semantic token for border color (e.g., 'gray.200')
  display: 'flex', // Use flexbox for layout
  flexDirection: 'column', // Stack header/mobile nav and main content vertically
  _dark: { // Example dark mode styles (if your Panda setup supports it)
    bg: 'gray.800',
    color: 'gray.100',
    borderColor: 'gray.700',
  }
});

// --- Mobile Navigation Styles ---
export const mobileNavWrapperStyles = css({
    display: { base: 'block', md: 'none' }, // Only show on mobile
    position: 'sticky', // Stick to the top of the container
    top: 0,
    zIndex: 10, // Ensure it's above the main content
    bg: 'background', // Match container background
    _dark: {
        bg: 'gray.800',
    }
});

export const mobileNavTriggerStyles = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  w: 'full',
  p: '3', // Padding
  fontSize: 'sm',
  fontWeight: 'medium',
  textAlign: 'left',
  cursor: 'pointer',
  borderBottom: '1px solid',
  borderTop: '1px solid', // Added top border as requested
  borderColor: 'border',
  bg: 'background', // Ensure background for sticky behavior
  color: 'text',
  _hover: {
    bg: 'gray.50', // Subtle hover
  },
  _dark: {
    borderColor: 'gray.700',
    bg: 'gray.800',
    color: 'gray.100',
    _hover: {
      bg: 'gray.700',
    }
  },
});

export const mobileNavDropdownStyles = css({
  position: 'absolute', // Position below the trigger
  top: '100%', // Place it right below the trigger
  left: 0,
  right: 0,
  bg: 'background',
  borderBottom: '1px solid',
  borderColor: 'border',
  boxShadow: 'lg',
  maxH: '300px', // Limit dropdown height
  overflowY: 'auto', // Allow scrolling within dropdown
  zIndex: 9, // Below trigger but above main content
  _dark: {
    bg: 'gray.800',
    borderColor: 'gray.700',
  }
});

export const mobileNavListStyles = css({
    listStyle: 'none',
    p: '2', // Padding inside dropdown
    m: 0,
});

// Use existing button styles for consistency, maybe override padding/fontSize if needed
// export const mobileNavButtonStyles = css({ ... });


// --- Main Content Area Styles ---
// Main scrollable area (<main>) - flex container for the two columns
export const mainStyles = css({
  flexGrow: 1, // Take remaining vertical space
  w: 'full',
  h: 'auto', // Height determined by flex-grow
  overflowY: 'auto', // Enable vertical scrolling for this container
  scrollBehavior: 'smooth', // Smooth scrolling for programmatic navigation
  display: 'flex',
  // Stack columns on small screens, side-by-side on medium and up
  flexDirection: { base: 'column', md: 'row' },
  // Space between content and nav columns
  gap: { base: '4', md: '6' }, // Use spacing tokens
  // Padding inside the main scrollable area
  p: { base: '4', md: '6' }, // Use spacing tokens
});

// Content Column (Left) - takes remaining space
export const contentColumnStyles = css({
  flexGrow: 1, // Allow this column to expand
  minW: 0, // Prevent content overflow issues in flex item
});

// --- Sidebar Navigation Styles (md+) ---
// Wrapper for the sidebar nav column to control its display
export const navColumnWrapperStyles = css({
    display: { base: 'none', md: 'block' }, // Hide on base, show on md+
    w: { md: '48' }, // Use size token (e.g., sizes.48 -> '12rem') or fixed value
    flexShrink: 0, // Prevent this column from shrinking
});

// Original nav column styles, now applied *inside* the wrapper
export const navColumnStyles = css({
  position: 'sticky', // Make it sticky within the 'main' scroll container
  top: '6', // Offset from the top when sticky (use spacing token, e.g., spacing.6 -> '1.5rem')
  alignSelf: 'flex-start', // Align to the top of the flex container
  // Use var() syntax for tokens inside calc() if direct token() doesn't work reliably
  maxH: 'calc(100% - var(--spacing-12, 3rem))', // Limit height
  overflowY: 'auto', // Allow nav items to scroll if they exceed maxH
  // Width is now controlled by the wrapper
  h: 'full', // Take full height of sticky container
});

// Container within Nav Column (holds Header + List Container)
export const navContainerStyles = css({
  py: '3', // Vertical padding
  h: 'full', // Take full height of parent nav column
  display: 'flex',
  flexDir: 'column', // Stack header and list vertically
});

// Navigation Header (h2 - e.g., "Document Sections")
export const navHeaderStyles = css({
  fontSize: 'sm',
  fontWeight: 'semibold',
  mb: '4',
  color: 'primary',
  textAlign: 'left',
  px: '2',
  _dark: {
    color: 'primary.300'
  }
});

// Container for List and Line (div wrapping <ul>)
export const navListContainerStyles = css({
  position: 'relative',
  flexGrow: 1,
  pl: '5', // Padding left to make space for the lines
});

// Navigation List (ul)
export const navListStyles = css({
  display: 'flex',
  flexDir: 'column',
  gap: '2',
  listStyle: 'none',
  padding: 0,
  margin: 0,
});

// Base styles for the Navigation Button (button inside li) - Used by both sidebar and mobile dropdown
export const navButtonBaseStyles = css({
  position: 'relative',
  display: 'block',
  w: 'full',
  textAlign: 'left',
  pl: '3',
  pr: '2',
  py: '1.5',
  rounded: 'md',
  fontSize: 'xs',
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
    // Using boxShadow fix for ring offset color
    boxShadow: `
      0 0 0 1px var(--colors-background, white),
      0 0 0 calc(1px + 2px) var(--colors-primary, blue)
    `,
    _dark: {
      boxShadow: `
        0 0 0 1px var(--colors-gray-800, #1f2937),
        0 0 0 calc(1px + 2px) var(--colors-primary-300, #93c5fd)
      `,
    }
  },
  _hover: {
    bgColor: 'rgba(107, 114, 128, 0.1)',
    _dark: {
         bgColor: 'rgba(229, 231, 235, 0.1)',
    }
  }
});

// Styles applied to the button text when INACTIVE
export const navButtonInactiveStyles = css({
  color: 'textMuted',
  _hover: {
    color: 'text',
  },
  _dark: {
    color: 'gray.400',
    _hover: {
        color: 'gray.100',
    }
  }
});

// Styles applied to the button text when ACTIVE
export const navButtonActiveStyles = css({
  color: 'primary',
  fontWeight: 'medium',
   _dark: {
     color: 'primary.300'
   }
});

// Gray Background Line Track (div) - Static line (Sidebar only)
export const lineTrackStyles = css({
  position: 'absolute',
  left: '2',
  top: '0',
  bottom: '0',
  w: '[2px]',
  bg: 'border',
  rounded: 'full',
  _dark: {
    bg: 'gray.700'
  }
});

// Active Indicator Segment (div) - Moving colored line (Sidebar only)
export const lineIndicatorStyles = css({
  position: 'absolute',
  left: '[7px]',
  w: '[4px]',
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


// --- ScrollingContentWithNav Component Implementation ---

const ScrollingContentWithNav: React.FC<ScrollingContentWithNavProps> = ({
  sections,
  children,
  activeSection,
  onNavClick,
  navTitle = 'Contents', // Default title
  containerClassName,
  mainClassName,
  contentColumnClassName,
  navColumnClassName, // Applied to the sidebar wrapper
}) => {
  const contentContainerRef = useRef<HTMLElement>(null);
  const navListRef = useRef<HTMLUListElement>(null); // Ref for sidebar list
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0, opacity: 0 });
  const [trackHeight, setTrackHeight] = useState(0);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false); // State for mobile dropdown

  // Find the title of the currently active section for mobile trigger display
  const activeSectionTitle = sections.find(sec => sec.id === activeSection)?.title;

  // --- Effect for Sidebar Indicator Line ---
  useEffect(() => {
    // Only run calculation if sidebar nav list ref exists (i.e., on md+ screens)
    const navListElement = navListRef.current;
    if (!navListElement) {
      setTrackHeight(0);
      setIndicatorStyle({ top: 0, height: 0, opacity: 0 });
      return;
    }
    // ... (rest of the indicator calculation logic remains the same) ...
    let calculatedTrackHeight = 0;
    let activeIndicatorOpacity = 0;
    let activeIndicatorTop = 0;
    let activeIndicatorHeight = 0;
    const firstListItem = navListElement.firstElementChild as HTMLLIElement | null;
    const lastListItem = navListElement.lastElementChild as HTMLLIElement | null;

    if (firstListItem && lastListItem) {
        calculatedTrackHeight = (lastListItem.offsetTop + lastListItem.offsetHeight) - firstListItem.offsetTop;
        calculatedTrackHeight = Math.max(calculatedTrackHeight, firstListItem.offsetHeight);
    } else if (firstListItem) {
        calculatedTrackHeight = firstListItem.offsetHeight;
    }
    setTrackHeight(calculatedTrackHeight);

    if (activeSection) {
      const activeListItem = navListElement.querySelector<HTMLLIElement>(`[data-section-id="${activeSection}"]`);
      if (activeListItem && firstListItem) {
        activeIndicatorTop = activeListItem.offsetTop - firstListItem.offsetTop;
        activeIndicatorHeight = activeListItem.offsetHeight;
        activeIndicatorOpacity = 1;
      }
    }
    setIndicatorStyle({
      top: activeIndicatorTop,
      height: activeIndicatorHeight,
      opacity: activeIndicatorOpacity,
    });
  }, [activeSection, sections]);


  // --- Handlers ---
  const handleMobileNavToggle = () => {
      setIsMobileNavOpen(prev => !prev);
  };

  const handleMobileNavItemClick = (id: string) => {
      onNavClick(id); // Call the original scroll handler
      setIsMobileNavOpen(false); // Close the dropdown
  };


  return (
    // Outermost container: Apply base styles + any custom classes passed via props
    <div className={cx(containerStyles, containerClassName)}>

      {/* --- Mobile Navigation (Only on base breakpoint) --- */}
      <div className={mobileNavWrapperStyles}>
          <button
            className={mobileNavTriggerStyles}
            onClick={handleMobileNavToggle}
            aria-expanded={isMobileNavOpen}
            aria-controls="mobile-nav-list" // ID for the dropdown list
          >
            {/* Display active section title or default title */}
            <span>{activeSectionTitle || navTitle || 'Navigation'}</span>
            {/* Simple expand/collapse indicator */}
            <span>{isMobileNavOpen ? '(-) Collapse' : '(+) Expand'}</span>
          </button>

          {/* Mobile Dropdown List */}
          {isMobileNavOpen && (
            <div id="mobile-nav-list" className={mobileNavDropdownStyles}>
               <ul className={mobileNavListStyles}>
                 {sections.map((section) => {
                   const isActive = activeSection === section.id;
                   return (
                     <li key={`mobile-${section.id}`}>
                       <button
                         onClick={() => handleMobileNavItemClick(section.id)}
                         // Reuse sidebar button styles
                         className={cx(
                           navButtonBaseStyles,
                           isActive ? navButtonActiveStyles : navButtonInactiveStyles
                         )}
                         aria-current={isActive ? 'location' : undefined}
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

      {/* --- Main Scrollable Area (Content + Sidebar on md+) --- */}
      <main ref={contentContainerRef} className={cx(mainStyles, mainClassName)}>

        {/* Left Column (Content): Always visible */}
        <div className={cx(contentColumnStyles, contentColumnClassName)}>
          {children} {/* Render the scrollable page content passed as children */}
        </div>

        {/* Right Nav Column Wrapper (Only on md+ breakpoint) */}
        <div className={cx(navColumnWrapperStyles, navColumnClassName)}>
            {/* Actual Sticky Nav Column */}
            <div className={navColumnStyles}>
              {/* Inner container for vertical layout within the nav column */}
              <div className={navContainerStyles}>
                {/* Navigation Header */}
                {navTitle && <h2 className={navHeaderStyles}>{navTitle}</h2>}

                {/* Container for the list and the indicator/track lines */}
                <div className={navListContainerStyles}>
                  {/* Background Line Track: Apply dynamic height via inline style */}
                  <div
                    className={lineTrackStyles}
                    style={{ height: `${trackHeight}px` }}
                    aria-hidden="true"
                  ></div>

                  {/* Active Indicator Segment: Apply dynamic position/size/opacity via inline style */}
                  <div
                    className={lineIndicatorStyles}
                    style={{
                      transform: `translateY(${indicatorStyle.top}px)`,
                      height: `${indicatorStyle.height}px`,
                      opacity: indicatorStyle.opacity,
                    }}
                    aria-hidden="true"
                  ></div>

                  {/* Navigation List: Attach ref for measurements */}
                  <ul ref={navListRef} className={navListStyles}>
                    {sections.map((section) => {
                      const isActive = activeSection === section.id;
                      return (
                        <li key={section.id} data-section-id={section.id}>
                          <button
                            onClick={() => onNavClick(section.id)}
                            className={cx(
                              navButtonBaseStyles,
                              isActive ? navButtonActiveStyles : navButtonInactiveStyles
                            )}
                            aria-current={isActive ? 'location' : undefined}
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
      </main>
    </div>
  );
};

// Export the component and its types
export default ScrollingContentWithNav;
