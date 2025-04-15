/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
'use client';

/**
 * ScrollingContentWithNav Component
 * * A responsive component that provides section-based content with automatic
 * navigation. Features include:
 * - Sticky side navigation (desktop) and collapsible top navigation (mobile)
 * - Automatic section detection using Intersection Observer
 * - Smooth scrolling between sections
 * - Support for custom section headers
 * - Flexible content rendering through props or data (including render props for scroll awareness)
 * - Optional autofocus on the main scrollable container on mount for keyboard scrolling.
 * * Color theme uses 5 standardized colors:
 * - primary: Used for active elements and accents
 * - text: Main text color
 * - textMuted: Secondary text color
 * - background: Main background color
 * - glow: Hover state color
 * - border: Border color for separators
 */

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
  useMemo,
  RefObject, // Added RefObject for the new hook
} from 'react';

// Adjust the import path based on your project structure and PandaCSS output directory
import { css, cx } from '../../../../styled-system/css'; // Requires PandaCSS setup - UNCOMMENTED THIS LINE

/**
 * Hook to track window size for responsive behavior
 * @returns Object with current window width and height
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = throttle(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 100);

    window.addEventListener('resize', handleResize);
    
    // Initial call
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

// Utility function for consistent breakpoint usage
export const getBreakpointValue = (breakpoint: string): number => {
  const breakpoints = {
    sm: 480,
    md: 768,
    lg: 1024,
    xl: 1440,
    '2xl': 1920,
    '3xl': 2200
  };
  
  return breakpoints[breakpoint as keyof typeof breakpoints] || 0;
};

// --- Custom Hooks ---

/**
 * Hook to detect if a user is actively scrolling within a target element.
 * It returns true immediately on scroll and returns false after a specified delay
 * of inactivity.
 *
 * @param targetRef RefObject pointing to the scrollable HTML element.
 * @param delay Milliseconds of inactivity before considering scrolling stopped (default: 150ms).
 * @returns boolean - True if the user is considered to be actively scrolling, false otherwise.
 */
export function useUserScrollDetection(
  targetRef: RefObject<HTMLElement | null>,
  delay: number = 150 // Default delay
): boolean {
  // State to track if the user is actively scrolling
  const [isScrollingByUser, setIsScrollingByUser] = useState<boolean>(false);

  // Ref to store the timeout ID
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Get the target element from the ref
    const element = targetRef.current;

    // Ensure the element exists before adding listener
    if (!element) {
      return;
    }

    // Handler function executed on scroll events
    const handleScroll = () => {
      // Set scrolling state to true immediately
      setIsScrollingByUser(true);

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set a new timeout to detect when scrolling stops
      timeoutRef.current = setTimeout(() => {
        setIsScrollingByUser(false);
        timeoutRef.current = null; // Clear the ref after timeout fires
      }, delay); // Use the delay prop
    };

    // Add the passive scroll event listener
    element.addEventListener('scroll', handleScroll, { passive: true });

    // --- Cleanup function ---
    // This runs when the component unmounts or dependencies change
    return () => {
      element.removeEventListener('scroll', handleScroll);
      // Also clear the timeout on cleanup, crucial for preventing state
      // updates on unmounted components or during rapid changes.
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [targetRef, delay]); // Dependencies: Re-run effect if ref or delay changes

  return isScrollingByUser;
}


/**
 * Hook to manage touch gesture interactions with visual feedback
 * @param onSwipeUp Callback for upward swipe detection
 * @param onSwipeDown Callback for downward swipe detection
 * @param onSwipeLeft Callback for leftward swipe detection
 * @param onSwipeRight Callback for rightward swipe detection
 * @param threshold Minimum distance (px) to trigger a swipe (default: 50)
 * @param dampening Reduction factor for visual movement (default: 0.5)
 * @param maxTranslation Maximum translation distance (px) (default: 100)
 * @param opacityFactor Value used to calculate opacity reduction (default: 150)
 * @param returnTransitionDuration Duration (ms) of the return animation (default: 300)
 * @returns Object containing touch handlers, current style, and a style reset function
 */
export function useTouchGestures({
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  dampening = 0.5,
  maxTranslation = 100,
  opacityFactor = 150,
  returnTransitionDuration = 300
}: {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  dampening?: number;
  maxTranslation?: number;
  opacityFactor?: number;
  returnTransitionDuration?: number;
}): {
  touchProps: {
    onTouchStart: (e: React.TouchEvent<HTMLElement>) => void;
    onTouchMove: (e: React.TouchEvent<HTMLElement>) => void;
    onTouchEnd: () => void;
  };
  style: React.CSSProperties;
  resetStyle: () => void;
} {
  // Track touch positions
  const touchStartRef = useRef<{x: number, y: number} | null>(null);
  const touchMoveRef = useRef<{x: number, y: number} | null>(null);

  // State for dynamic styling during touch
  const [style, setStyle] = useState<React.CSSProperties>({});

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLElement>) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
    touchMoveRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLElement>) => {
    if (!touchStartRef.current) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const startX = touchStartRef.current.x;
    const startY = touchStartRef.current.y;

    touchMoveRef.current = { x: currentX, y: currentY };

    // Calculate distances
    const distanceX = startX - currentX;
    const distanceY = startY - currentY;

    // Determine dominant direction
    const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY);

    // Apply visual feedback based on direction
    if (isHorizontal) {
      if (distanceX > 0) {
        // Swiping left
        const translateX = Math.min(distanceX * dampening, maxTranslation);
        setStyle({
          transform: `translateX(-${translateX}px)`,
          opacity: 1 - translateX / opacityFactor,
          transition: 'none',
        });
      } else {
        // Swiping right
        const translateX = Math.min(-distanceX * dampening, maxTranslation);
        setStyle({
          transform: `translateX(${translateX}px)`,
          opacity: 1 - translateX / opacityFactor,
          transition: 'none',
        });
      }
    } else {
      if (distanceY > 0) {
        // Swiping up
        const translateY = Math.min(distanceY * dampening, maxTranslation);
        setStyle({
          transform: `translateY(-${translateY}px)`,
          opacity: 1 - translateY / opacityFactor,
          transition: 'none',
        });
      } else {
        // Swiping down
        const translateY = Math.min(-distanceY * dampening, maxTranslation);
        setStyle({
          transform: `translateY(${translateY}px)`,
          opacity: 1 - translateY / opacityFactor,
          transition: 'none',
        });
      }
    }
  }, [dampening, maxTranslation, opacityFactor]);

  const handleTouchEnd = useCallback(() => {
    const startPosition = touchStartRef.current;
    const endPosition = touchMoveRef.current;

    // Reset style with transition
    setStyle({
      transform: 'translate(0px, 0px)',
      opacity: 1,
      transition: `transform ${returnTransitionDuration}ms ease-out, opacity ${returnTransitionDuration}ms ease-out`,
    });

    // If we have valid touch data and met threshold
    if (startPosition && endPosition) {
      const distanceX = startPosition.x - endPosition.x;
      const distanceY = startPosition.y - endPosition.y;

      // Check which direction had the largest movement
      const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY);

      if (isHorizontal) {
        if (distanceX > threshold && onSwipeLeft) {
          setTimeout(() => onSwipeLeft(), 50);
        } else if (distanceX < -threshold && onSwipeRight) {
          setTimeout(() => onSwipeRight(), 50);
        }
      } else {
        if (distanceY > threshold && onSwipeUp) {
          setTimeout(() => onSwipeUp(), 50);
        } else if (distanceY < -threshold && onSwipeDown) {
          setTimeout(() => onSwipeDown(), 50);
        }
      }
    }

    // Reset refs
    touchStartRef.current = null;
    touchMoveRef.current = null;

    // Reset style completely after transition completes
    setTimeout(() => {
      setStyle({});
    }, returnTransitionDuration);
  }, [onSwipeDown, onSwipeLeft, onSwipeRight, onSwipeUp, returnTransitionDuration, threshold]);

  const resetStyle = useCallback(() => {
    setStyle({});
  }, []);

  return {
    touchProps: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    },
    style,
    resetStyle
  };
}

/**
 * Hook to manage keyboard navigation within a list of items
 * @param items Array of items to navigate
 * @param activeIndex Current active index
 * @param onActivate Callback when an item is activated (Enter/Space)
 * @param onNavigate Callback when navigation changes the active index
 * @param isHorizontal Whether navigation is horizontal (left/right) vs vertical (up/down)
 * @param loop Whether navigation should loop around at the edges of the list
 * @param homeEndKeys Whether Home/End keys should be enabled
 * @param escapeKey Whether Escape key should be handled
 * @param onEscape Callback when Escape key is pressed
 * @param typeAheadTimeout Timeout (ms) for type-ahead search (default: 500)
 * @returns Object with props generators for items and container
 */
export function useKeyboardNavigation<T>({
  items,
  activeIndex,
  onActivate,
  onNavigate,
  isHorizontal = false,
  loop = false,
  homeEndKeys = true,
  escapeKey = true,
  onEscape,
  typeAheadTimeout = 500
}: {
  items: T[];
  activeIndex: number;
  onActivate?: (item: T, index: number) => void;
  onNavigate: (newIndex: number) => void;
  isHorizontal?: boolean;
  loop?: boolean;
  homeEndKeys?: boolean;
  escapeKey?: boolean;
  onEscape?: () => void;
  typeAheadTimeout?: number;
}): {
  getItemProps: (index: number) => {
    onKeyDown: (e: React.KeyboardEvent) => void;
    tabIndex: number;
    role: "menuitem" | "option"; // Make this a literal union instead of generic string
    'aria-current'?: "page" | "location" | "true"; // Make this a literal union
  };
  containerProps: {
    role: "menubar" | "listbox"; // Make this a literal union
    'aria-orientation': "horizontal" | "vertical"; // Make this a literal union
  };
} {
  // For type-ahead search functionality
  const [typeAheadString, setTypeAheadString] = useState<string>('');
  const typeAheadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleKeyDown = useCallback((event: React.KeyboardEvent, currentIndex: number) => {
    if (!items || items.length === 0) return;

    let nextIndex = currentIndex;
    let handled = false;

    // Handle primary navigation keys (arrows)
    const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';

    switch (event.key) {
      case prevKey:
        event.preventDefault();
        handled = true;
        if (loop) {
          nextIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
        } else {
          nextIndex = Math.max(0, currentIndex - 1);
        }
        break;

      case nextKey:
        event.preventDefault();
        handled = true;
        if (loop) {
          nextIndex = currentIndex >= items.length - 1 ? 0 : currentIndex + 1;
        } else {
          nextIndex = Math.min(items.length - 1, currentIndex + 1);
        }
        break;

      case 'Home':
        if (homeEndKeys) {
          event.preventDefault();
          handled = true;
          nextIndex = 0;
        }
        break;

      case 'End':
        if (homeEndKeys) {
          event.preventDefault();
          handled = true;
          nextIndex = items.length - 1;
        }
        break;

      case 'Escape':
        if (escapeKey && onEscape) {
          event.preventDefault();
          handled = true;
          onEscape();
          return; // Exit early, no navigation needed
        }
        break;

      case 'Enter':
      case ' ': // Space
        if (onActivate) {
          event.preventDefault();
          handled = true;
          onActivate(items[currentIndex], currentIndex);
        }
        break;

      default:
        // Type-ahead functionality for single character keys
        if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
          // Clear existing timeout if any
          if (typeAheadTimeoutRef.current) {
            clearTimeout(typeAheadTimeoutRef.current);
          }

          // Update type-ahead string
          const newTypeAheadString = typeAheadString + event.key.toLowerCase();
          setTypeAheadString(newTypeAheadString);

          // Try to find a matching item
          const startSearchIndex = (currentIndex + 1) % items.length;
          for (let i = 0; i < items.length; i++) {
            const idx = (startSearchIndex + i) % items.length;
            const item = items[idx];

            // This assumes items have a 'label' or 'title' property. Adjust as needed.
            const itemText = (item as any).title ||
                             (item as any).label ||
                             String(item);

            if (itemText.toLowerCase().startsWith(newTypeAheadString)) {
              nextIndex = idx;
              handled = true;
              break;
            }
          }

          // Set timeout to clear the type-ahead string
          typeAheadTimeoutRef.current = setTimeout(() => {
            setTypeAheadString('');
            typeAheadTimeoutRef.current = null;
          }, typeAheadTimeout);
        }
    }

    // If we handled a key and the index changed, notify the parent
    if (handled && nextIndex !== currentIndex) {
      onNavigate(nextIndex);
    }
  }, [
    items, activeIndex, isHorizontal, loop, homeEndKeys,
    escapeKey, onEscape, onActivate, onNavigate,
    typeAheadString, typeAheadTimeout
  ]);

  const getItemProps = useCallback((index: number) => {
    const isCurrent = index === activeIndex;

    return {
      onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, index),
      tabIndex: isCurrent ? 0 : -1, // Only the active item is in the tab order
      role: isHorizontal ? "menuitem" as const : "option" as const, // Use const assertion
      'aria-current': isCurrent ? "location" as const : undefined // Use const assertion
    };
  }, [activeIndex, handleKeyDown, isHorizontal]);

  const containerProps = useMemo(() => ({
    role: isHorizontal ? "menubar" as const : "listbox" as const, // Use const assertion
    'aria-orientation': isHorizontal ? "horizontal" as const : "vertical" as const // Use const assertion
  }), [isHorizontal]);

  // Clean up the timeout on unmount
  useEffect(() => {
    return () => {
      if (typeAheadTimeoutRef.current) {
        clearTimeout(typeAheadTimeoutRef.current);
      }
    };
  }, []);

  return { getItemProps, containerProps };
}

/**
 * Hook to manage smooth scrolling and scroll offset calculation
 * @param containerRef Reference to the scrollable container
 * @param baseOffset Initial offset value (e.g., for external navigation bars)
 * @param stickyElementRef Reference to a sticky element whose height should be included in the offset
 * @param scrollDuration Duration of the scroll animation in milliseconds
 * @returns Object containing scrollOffset, scrollToId function, and isScrollingProgrammatically state
 */
export function useSmoothScroll({
  containerRef,
  baseOffset = 0,
  stickyElementRef = null,
  scrollDuration = 300, // Default duration
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  baseOffset?: number;
  stickyElementRef?: React.RefObject<HTMLDivElement | null> | null;
  scrollDuration?: number;
}): {
  scrollOffset: number;
  scrollToId: (id: string) => void;
  isScrollingProgrammatically: boolean; // <-- ADDED: Return scrolling state
} {
  // State to hold the calculated scroll offset
  const [scrollOffset, setScrollOffset] = useState<number>(baseOffset);
  // State to track if programmatic scrolling is currently active
  const [isScrollingProgrammatically, setIsScrollingProgrammatically] = useState<boolean>(false); // <-- ADDED

  // Callback to calculate the total scroll offset including sticky element height
  const calculateAndSetScrollOffset = useCallback(() => {
    let internalStickyHeight = 0;

    // Check if sticky element exists, is rendered, and get its height
    if (stickyElementRef && stickyElementRef.current) {
      const computedStyle = window.getComputedStyle(stickyElementRef.current);
      if (computedStyle.display !== 'none') {
        internalStickyHeight = stickyElementRef.current.offsetHeight;
      }
    }

    // Add a small buffer for safety margin during scrolling
    const buffer = 10;
    setScrollOffset(baseOffset + internalStickyHeight + buffer);
  }, [baseOffset, stickyElementRef]); // Dependencies: Recalculate if base offset or sticky ref changes

  // Effect to calculate offset on mount and add/remove resize listener
  useEffect(() => {
    // Initial calculation on mount
    calculateAndSetScrollOffset();

    // Create a throttled version of the resize handler
    // Throttle to execute at most once every 100ms for better performance
    const throttledResizeHandler = throttle(calculateAndSetScrollOffset, 100, true, true);

    // Attach the throttled handler to resize events
    window.addEventListener('resize', throttledResizeHandler);
    
    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('resize', throttledResizeHandler);
    };
  }, [calculateAndSetScrollOffset]); // Dependency: The calculation function itself

  // Callback to perform the smooth scroll animation
  const performSmoothScroll = useCallback(
    (element: HTMLElement) => {
      // Ensure the container ref is available
      if (!containerRef || !containerRef.current) {
        console.warn('Smooth scroll: Container ref not available.');
        return;
      }

      setIsScrollingProgrammatically(true); // <-- ADDED: Set scrolling true

      const container = containerRef.current;
      // Store original scroll behavior to restore it later
      const originalScrollBehavior = container.style.scrollBehavior;
      // Disable native smooth scrolling during our animation
      container.style.scrollBehavior = 'auto';
      // Set a flag to indicate programmatic scrolling (used by IntersectionObserver)
      container.setAttribute('data-scrolling-programmatically', 'true');

      // Calculate target scroll position based on element's offsetTop relative
      // to the container and the calculated dynamic scrollOffset.
      let targetPosition = element.offsetTop - scrollOffset;
      // Prevent scrolling above the very top of the container
      targetPosition = Math.max(0, targetPosition);

      const startPosition = container.scrollTop;
      const distance = targetPosition - startPosition;
      let startTime: number | null = null;

      // Easing function (easeOutQuint) for a smooth deceleration
      const easeOutQuint = (t: number): number => 1 - Math.pow(1 - t, 5);

      // Animation loop using requestAnimationFrame
      const scrollAnimation = (currentTime: number) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        // Calculate progress (0 to 1), capped at 1
        const progress = Math.min(timeElapsed / scrollDuration, 1);
        // Apply easing function to progress
        const easedProgress = easeOutQuint(progress);

        // Update scroll position
        if (container) {
          container.scrollTop = startPosition + distance * easedProgress;
        }

        // Continue animation if duration not reached
        if (timeElapsed < scrollDuration) {
          requestAnimationFrame(scrollAnimation);
        } else {
          // Ensure final position is exact
          if (container) {
            container.scrollTop = targetPosition;
            // Cleanup: Remove flag and restore original scroll behavior after a short delay
            setTimeout(() => {
              container.removeAttribute('data-scrolling-programmatically');
              container.style.scrollBehavior = originalScrollBehavior;
              setIsScrollingProgrammatically(false); // <-- ADDED: Set scrolling false
            }, 100);
          } else {
              setIsScrollingProgrammatically(false); // <-- ADDED: Ensure state is reset even if container disappears
          }
        }
      };
      // Start the animation loop
      requestAnimationFrame(scrollAnimation);
    },
    // Dependencies: Recalculate if container, offset, or duration changes
    [containerRef, scrollOffset, scrollDuration]
  );

  // Public function returned by the hook to initiate scrolling to an element by its ID
  const scrollToId = useCallback(
    (id: string) => {
      // Ensure container ref is available
      if (!containerRef || !containerRef.current) {
        console.warn(
          `Smooth scroll: Cannot find element, container ref not available.`
        );
        return;
      }

      // Find the target element within the specified container using ID or data-attribute
      const targetElement = containerRef.current.querySelector<HTMLElement>(
        `#${CSS.escape(id)}, [data-section-id="${CSS.escape(id)}"]`
      );
      // If found, initiate the scroll animation
      if (targetElement) {
        performSmoothScroll(targetElement);
      } else {
        console.warn(
          `Smooth scroll: Failed to find section element with ID: ${id}`
        );
      }
    },
    // Dependencies: Recalculate if container or the internal scroll function changes
    [containerRef, performSmoothScroll]
  );

  // Return the calculated offset, the scrolling function, and the scrolling state
  return { scrollOffset, scrollToId, isScrollingProgrammatically }; // <-- UPDATED RETURN
}

/**
 * Hook to manage autofocus behavior for an element after component mount
 * @param targetRef Reference to the element to focus
 * @param shouldFocus Boolean flag to control whether focus should be applied
 * @param delay Delay in milliseconds before attempting to focus
 */
export function useAutofocus({
  targetRef,
  shouldFocus,
  delay = 500, // Default delay
}: {
  targetRef: React.RefObject<HTMLElement | null>;
  shouldFocus: boolean;
  delay?: number;
}): void { // No return value needed, performs a side effect
  useEffect(() => {
    // Proceed only if focus is requested and the target ref is currently valid
    if (shouldFocus && targetRef && targetRef.current) {
      const targetElement = targetRef.current; // Capture current ref value in closure

      console.log(
        `[useAutofocus] Scheduling focus for element after ${delay}ms:`,
        targetElement
      );

      // Set timeout to attempt focus after the specified delay
      const timerId = setTimeout(() => {
        // Double-check if the element still exists when the timeout runs
        if (targetElement) {
          console.log(
            '[useAutofocus] Attempting to focus element:',
            targetElement
          );
          // Focus the element, preventing the browser from scrolling to it
          targetElement.focus({ preventScroll: true });

          // Verify if focus was successful immediately after attempt
          if (document.activeElement === targetElement) {
            console.log(
              '[useAutofocus] CONFIRMED: Element successfully focused.'
            );
          } else {
            // Log a warning if focus was moved elsewhere immediately after
            console.warn(
              '[useAutofocus] FAILED: Focus may have been moved elsewhere. Active element:',
              document.activeElement
            );
          }
        } else {
          // Log a warning if the element reference was lost before focus could occur
          console.warn(
            '[useAutofocus] FAILED: Target element reference was lost before focus could be applied.'
          );
        }
      }, delay);

      // Cleanup function: Clear the timeout if the component unmounts or
      // dependencies change before the timeout executes.
      return () => {
        console.log('[useAutofocus] Clearing scheduled focus timer.');
        clearTimeout(timerId);
      };
    } else if (shouldFocus) {
      // Log a warning if autofocus is enabled but the ref isn't ready yet
      console.warn(
        '[useAutofocus] Autofocus enabled, but targetRef.current is not available yet.'
      );
    }
    // Effect dependencies: Rerun if the target, focus flag, or delay changes
  }, [targetRef, shouldFocus, delay]);
}

/**
 * Hook to manage mobile navigation state and behavior
 * @param onNavItemClick Callback to execute when a nav item is clicked (e.g., to scroll)
 * @param sections Array of section data for keyboard navigation
 * @returns Object containing state and props for mobile navigation elements
 */
export function useMobileNavigation({
  onNavItemClick,
  sections,
}: {
  onNavItemClick: (id: string) => void;
  sections: Section[]; // New parameter for keyboard navigation
}): {
  isMobileNavOpen: boolean;
  toggleMobileNav: () => void;
  mobileNavProps: {
    ref: React.RefObject<HTMLDivElement | null>; // Ref for the sticky wrapper
  };
  triggerProps: { // Props for the button that opens/closes the nav
    ref: React.RefObject<HTMLButtonElement | null>;
    onClick: () => void;
    'aria-expanded': boolean;
    'aria-controls': string;
    'aria-haspopup': 'menu';
  };
  dropdownProps: { // Props for the dropdown container
    id: string;
    style: React.CSSProperties; // For dynamic styles (touch gestures)
    role: 'menu';
    'aria-orientation': 'vertical';
    onTouchStart: (e: React.TouchEvent<HTMLElement>) => void;
    onTouchMove: (e: React.TouchEvent<HTMLElement>) => void;
    onTouchEnd: () => void;
  };
  getItemProps: ( // Function to get props for each navigation item button
    id: string,
    index: number
  ) => {
    // Removed 'key' from return type to match implementation
    onClick: () => void;
    role: 'menuitem';
    tabIndex: number;
    onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  };
} {
  // State for mobile navigation open/closed status
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Refs for the mobile nav wrapper and toggle button
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const mobileNavToggleRef = useRef<HTMLButtonElement>(null);

  // State for active item for keyboard navigation
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  // Use the useTouchGestures hook for touch gesture handling
  const {
    touchProps,
    style: touchStyle,
    resetStyle
  } = useTouchGestures({
    onSwipeUp: () => {
      // Close the nav after a short delay
      setTimeout(() => {
        setIsMobileNavOpen(false);
      }, 50);
    },
    threshold: 50,
    dampening: 0.5,
    maxTranslation: 100,
    opacityFactor: 150,
    returnTransitionDuration: 300
  });

  // Callback to toggle the mobile navigation state
  const toggleMobileNav = useCallback(() => {
    setIsMobileNavOpen((prev) => !prev);
    resetStyle(); // Reset any temporary touch styles when toggling
  }, [resetStyle]);

  // Callback wrapper for handling clicks on individual nav items
  const handleMobileNavItemClick = useCallback(
    (id: string) => {
      onNavItemClick(id); // Execute the provided callback (e.g., scroll)
      setIsMobileNavOpen(false); // Close the nav
      resetStyle(); // Reset touch styles
    },
    [onNavItemClick, resetStyle]
  );

  // Effect for managing focus when the mobile nav opens or closes
  useEffect(() => {
    if (isMobileNavOpen) {
      // When opened, focus the active item after a short delay
      setTimeout(() => {
        const mobileNavButtons = document.querySelectorAll<HTMLButtonElement>(
          '#mobile-nav-list button'
        );
        if (mobileNavButtons && mobileNavButtons[activeItemIndex]) {
          mobileNavButtons[activeItemIndex].focus();
        }
      }, 50); // Delay allows elements to render
    } else if (document.activeElement instanceof HTMLButtonElement &&
               document.activeElement.closest('#mobile-nav-list')) {
      // If focus is in the dropdown when it closes, return to toggle button
      if (mobileNavToggleRef.current) {
        mobileNavToggleRef.current.focus();
      }
    }
  }, [isMobileNavOpen, activeItemIndex]); // Added activeItemIndex as dependency

  // Use the keyboard navigation hook
  const {
    getItemProps: getKeyboardProps,
    containerProps
  } = useKeyboardNavigation({
    items: sections,
    activeIndex: activeItemIndex,
    onNavigate: (newIndex) => {
      setActiveItemIndex(newIndex);
    },
    onActivate: (_item, index) => {
      if (sections[index]) {
        handleMobileNavItemClick(sections[index].id);
      }
    },
    escapeKey: true,
    onEscape: () => {
      setIsMobileNavOpen(false);
      resetStyle();
    }
  });

  // Combined props getter function
  const getItemProps = useCallback(
    (id: string, index: number) => {
      const keyboardProps = getKeyboardProps(index);

      // Return props WITHOUT a key property - key will be applied directly in JSX
      return {
        onClick: () => handleMobileNavItemClick(id),
        role: 'menuitem' as const, // Use const assertion for literal type
        tabIndex: keyboardProps.tabIndex,
        onKeyDown: keyboardProps.onKeyDown as (e: React.KeyboardEvent<HTMLButtonElement>) => void
      };
    },
    [handleMobileNavItemClick, getKeyboardProps]
  );

  // Memoize dropdownProps to avoid prop conflicts
  const dropdownProps = useMemo(() => {
    return {
      id: 'mobile-nav-list',
      style: touchStyle,
      role: 'menu' as const, // Use const assertion for literal type
      'aria-orientation': 'vertical' as const, // Use const assertion for literal type
      ...touchProps // Include touch props from useTouchGestures
    };
  }, [touchStyle, touchProps]);

  // Return all state and props needed by the component
  return {
    isMobileNavOpen,
    toggleMobileNav,
    mobileNavProps: {
      ref: mobileNavRef,
    },
    triggerProps: {
      ref: mobileNavToggleRef,
      onClick: toggleMobileNav,
      'aria-expanded': isMobileNavOpen,
      'aria-controls': 'mobile-nav-list',
      'aria-haspopup': 'menu',
    },
    dropdownProps,
    getItemProps,
  };
}

/**
 * Hook to manage desktop navigation indicator style
 * @param navListRef Reference to the navigation list (UL) element
 * @param activeSection Current active section ID
 * @param sections Array of section objects (used to find the active LI)
 * @returns Object with indicator style (top, height, opacity) and track height
 */
export function useDesktopIndicator({
  navListRef,
  activeSection,
  sections, // Keep sections dependency in case list items aren't direct children or order changes
}: {
  navListRef: React.RefObject<HTMLUListElement | null>;
  activeSection: string | null;
  sections: Section[]; // Array of section data
}): {
  indicatorStyle: { top: number; height: number; opacity: number };
  trackHeight: number;
} {
  // State for the indicator's style and the background track height
  const [indicatorStyle, setIndicatorStyle] = useState({
    top: 0,
    height: 0,
    opacity: 0,
  });
  const [trackHeight, setTrackHeight] = useState(0);

  // Effect to calculate styles when active section or layout changes
  useEffect(() => {
    // Ensure the nav list ref is available
    if (!navListRef || !navListRef.current) {
      setTrackHeight(0);
      setIndicatorStyle({ top: 0, height: 0, opacity: 0 });
      return;
    }

    const navListElement = navListRef.current;

    let calculatedTrackHeight = 0;
    let activeIndicatorOpacity = 0;
    let activeIndicatorTop = 0;
    let activeIndicatorHeight = 0;

    // Get list items to calculate dimensions
    const listItems = Array.from(navListElement.children) as HTMLLIElement[];
    const firstListItem = listItems[0];

    // Calculate total height of the track based on first and last items
    if (listItems.length > 0) {
      const lastListItem = listItems[listItems.length - 1];
      if (firstListItem && lastListItem) {
        // Height is distance from top of first item to bottom of last item
        calculatedTrackHeight =
          lastListItem.offsetTop + lastListItem.offsetHeight - firstListItem.offsetTop;
        // Ensure minimum height is at least one item's height
        calculatedTrackHeight = Math.max(
          calculatedTrackHeight,
          firstListItem.offsetHeight
        );
      }
    }
    setTrackHeight(calculatedTrackHeight);

    // Calculate position and height of the active indicator
    if (activeSection && firstListItem) {
      // Find the list item corresponding to the active section ID
      const activeListItem = navListElement.querySelector<HTMLLIElement>(
        `li[data-section-id="${CSS.escape(activeSection)}"]`
      );
      if (activeListItem) {
        // Calculate top position relative to the first item
        activeIndicatorTop = activeListItem.offsetTop - firstListItem.offsetTop;
        activeIndicatorHeight = activeListItem.offsetHeight;
        activeIndicatorOpacity = 1; // Make it visible
      } else {
        activeIndicatorOpacity = 0; // Hide if active item not found
      }
    } else {
      activeIndicatorOpacity = 0; // Hide if no active section
    }

    // Update the state with calculated styles
    setIndicatorStyle({
      top: activeIndicatorTop,
      height: activeIndicatorHeight,
      opacity: activeIndicatorOpacity,
    });
    // Dependencies: Rerun if active section, sections data, or nav list ref changes
  }, [activeSection, sections, navListRef]);

  // Return calculated styles
  return { indicatorStyle, trackHeight };
}

/**
 * Utility function to create a throttled version of a function
 * @param fn The function to throttle
 * @param limit The minimum time between executions (milliseconds)
 * @param leading Whether to execute on the leading edge of the timeout
 * @param trailing Whether to execute on the trailing edge of the timeout
 * @returns The throttled function
 */
function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number,
  leading: boolean = true,
  trailing: boolean = true
): (...args: Parameters<T>) => void {
  let lastTime: number = 0;
  let timer: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;
  
  return function throttled(...args: Parameters<T>): void {
    const now = Date.now();
    const elapsed = now - lastTime;
    
    // Store the latest arguments for potential trailing execution
    lastArgs = args;
    
    // If enough time has passed, execute the function immediately
    if (elapsed >= limit) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      
      if (leading || elapsed > limit) {
        fn(...args);
        lastTime = now;
        lastArgs = null;
      }
    } 
    // Otherwise, set up a timer for trailing execution if needed
    else if (trailing && !timer) {
      timer = setTimeout(() => {
        if (lastArgs) {
          fn(...lastArgs);
          lastTime = Date.now();
          lastArgs = null;
        }
        timer = null;
      }, limit - elapsed);
    }
  };
}

/**
 * Utility function to create a debounced version of a function
 * @param fn Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Create and memoize the debounced function
  return useCallback((...args: Parameters<T>) => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Set a new timer
    timerRef.current = setTimeout(() => {
      fn(...args);
      timerRef.current = null;
    }, delay);
  }, [fn, delay]);
}

/**
 * Hook to observe section visibility using IntersectionObserver and determine the active section
 * @param containerRef Reference to the scrollable container element
 * @param sections Array of section objects (must have unique IDs)
 * @param scrollOffset Current scroll offset (used for calculating observer rootMargin)
 * @param externalActiveSection Optional externally controlled active section ID (disables auto-detection if provided)
 * @param enableAutoDetection Flag to enable/disable the IntersectionObserver
 * @returns [activeSection, setActiveSection] - Tuple containing the current active section ID and a function to manually set it
 */
export function useSectionIntersection(
  containerRef: React.RefObject<HTMLDivElement | null>,
  sections: Array<{ id: string }>,
  scrollOffset: number,
  externalActiveSection: string | null = null,
  enableAutoDetection: boolean = true
): [string | null, (id: string) => void] {
  // Internal state for the active section (used only if not externally controlled)
  const [internalActiveSection, setInternalActiveSection] = useState<string | null>(
    // Initialize with external value or first section ID
    externalActiveSection || (sections.length > 0 ? sections[0].id : null)
  );

  // Create a debounced version of setInternalActiveSection to prevent rapid changes
  // ** CHANGE: Increased delay from 50ms to 100ms **
  const debouncedSetActiveSection = useDebounce(
    (id: string) => setInternalActiveSection(id),
    100 // Increased delay to reduce rapid changes ("spasming")
  );

  // Determine the effective active section: external prop takes precedence
  const activeSection =
    externalActiveSection !== null ? externalActiveSection : internalActiveSection;

  // Callback executed when section intersections change
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      // Ignore intersections if container isn't ready or during programmatic scroll
      if (!containerRef || !containerRef.current || containerRef.current.hasAttribute('data-scrolling-programmatically')) {
        return;
      }

      // Filter for entries that are currently intersecting the observer's rootMargin zone
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);
      if (visibleEntries.length === 0) return; // No visible sections in the zone, do nothing

      // Sort visible entries purely by their top position in the viewport (highest first)
      // This remains useful for finding the topmost relevant section.
      visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      // --- REFINED LOGIC for selecting active section ---
      // Find the section whose top edge is closest to the scrollOffset line,
      // prioritizing sections whose top is below or very near the line.
      let newActiveSectionId: string | null = null;
      let smallestPositiveDistance = Infinity; // Track closest section *below* the offset line
      const BUFFER_ZONE = 20; // Increased buffer slightly (in pixels)

      for (const entry of visibleEntries) {
        // Calculate distance from top edge to scrollOffset line
        const topDistance = entry.boundingClientRect.top - scrollOffset;

        // Consider sections whose top is at or below the scrollOffset line (or within the buffer above it)
        if (topDistance >= -BUFFER_ZONE) {
          // If this section's top is closer to the line (from below or within buffer)
          // than the current best candidate, make it the new candidate.
          if (topDistance < smallestPositiveDistance) {
            smallestPositiveDistance = topDistance;
            newActiveSectionId = entry.target.getAttribute('data-section-id');
          }
        }
      }

      // ** CHANGE: Removed the fallback logic based on bottom edge. **
      // We now rely solely on the "closest top edge below or near the offset line" logic.
      // This should provide a more stable anchor point and reduce jumps caused by
      // sections whose bottom edges cross the line while their tops are far away.

      // Update the internal state only if:
      // 1. A valid new section ID was found using the refined logic.
      // 2. It's different from the current internal state.
      // 3. The component is not being controlled externally.
      if (
        newActiveSectionId &&
        newActiveSectionId !== internalActiveSection &&
        externalActiveSection === null
      ) {
        // Use the debounced setter with the increased delay
        debouncedSetActiveSection(newActiveSectionId);
      }
    },
    // Dependencies: Recalculate if internal state, external control, offset, or container changes
    [internalActiveSection, externalActiveSection, scrollOffset, containerRef, debouncedSetActiveSection]
  );


  // Memoize IntersectionObserver options
  const observerOptions = useMemo(() => {
    // Need container ref to calculate rootMargin based on viewport height
    if (!containerRef || !containerRef.current) return null;

    const scrollContainer = containerRef.current;
    // Define the "top" boundary for intersection detection relative to the viewport top
    // This should match the dynamic scrollOffset
    const topMargin = Math.round(scrollOffset);
    // Define a "bottom" boundary as a percentage of the viewport height from the bottom
    // This helps determine the active section more accurately when multiple sections are visible
    const bottomMarginPercentage = 40; // e.g., consider intersection within top 60% of viewport
    const bottomMargin = Math.round(
      scrollContainer.clientHeight * (bottomMarginPercentage / 100)
    );

    // rootMargin defines offsets from the root (scrollContainer) edges
    // Negative top margin pushes the top boundary down by scrollOffset pixels
    // Negative bottom margin pushes the bottom boundary up by bottomMargin pixels
    return {
      root: scrollContainer, // Observe intersections within the container
      rootMargin: `-${topMargin}px 0px -${bottomMargin}px 0px`,
      // Use multiple thresholds to get more frequent updates during scrolling
      // This helps with more accurate detection, especially during slow scrolling
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    } as IntersectionObserverInit;
    // Dependencies: Recalculate if offset, container ref, or container height changes
  }, [scrollOffset, containerRef, containerRef.current?.clientHeight]);

  // Effect to set up and tear down the IntersectionObserver
  useEffect(() => {
    // Conditions to skip observer setup:
    if (
      !enableAutoDetection || // Auto detection disabled
      externalActiveSection !== null || // Externally controlled
      !containerRef || // Container ref not ready
      !containerRef.current ||
      sections.length === 0 || // No sections to observe
      !observerOptions // Options not calculated yet
    ) {
      return; // Do nothing
    }

    // Create the observer instance
    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    // Map to keep track of observed elements (optional, for debugging)
    const sectionRefs = new Map<string, HTMLElement | null>();

    // Observe each section element
    sections.forEach((section) => {
      if (containerRef.current) {
        // Find the element by ID or data-attribute within the container
        const element = containerRef.current.querySelector<HTMLElement>(
          `#${CSS.escape(section.id)}, [data-section-id="${CSS.escape(
            section.id
          )}"]`
        );

        if (element) {
          observer.observe(element); // Start observing
          sectionRefs.set(section.id, element);
        } else {
          // Warn if a section element couldn't be found
          console.warn(
            `Observer could not find element for section: ${section.id}`
          );
        }
      }
    });

    // Cleanup function: Disconnect the observer when component unmounts or dependencies change
    return () => observer.disconnect();
  }, [
    // Dependencies: Rerun setup if any of these change
    enableAutoDetection,
    externalActiveSection,
    sections,
    handleIntersection, // The intersection callback
    observerOptions, // The observer options
    containerRef,
  ]);

  // Manual setter function for the active section (used by navigation clicks/keys)
  const setActiveSection = useCallback(
    (id: string) => {
      // Only update internal state if the component is not externally controlled
      if (externalActiveSection === null) {
        setInternalActiveSection(id);
      }
      // If externally controlled, this function effectively does nothing,
      // relying on the parent component to update the externalActiveSection prop.
    },
    [externalActiveSection] // Dependency: External control status
  );

  // Return the current active section ID and the manual setter function
  return [activeSection, setActiveSection];
}

// --- NEW HOOK: useDesktopNavigation ---
/**
 * Hook to manage state and interactions for the desktop sidebar navigation.
 * Encapsulates active item state, keyboard navigation, and indicator styling.
 *
 * @param navListRef Ref to the desktop navigation list (UL) element.
 * @param sections Array of section data.
 * @param activeSection The currently active section ID (from useSectionIntersection).
 * @param onNavClick Callback function to handle navigation actions (e.g., scrolling).
 * @param navTitle Title for the navigation area (used for aria-label).
 * @returns Object containing props for the nav container, item getter, indicator style, and track height.
 */
export function useDesktopNavigation({
  navListRef,
  sections,
  activeSection,
  onNavClick,
  navTitle,
}: {
  navListRef: React.RefObject<HTMLUListElement | null>;
  sections: Section[];
  activeSection: string | null;
  onNavClick: (id: string) => void;
  navTitle: string;
}) {
  // State for the index of the currently active/focused item in the desktop nav
  const [activeDesktopIndex, setActiveDesktopIndex] = useState(
    // Initialize based on the initial activeSection
    sections.findIndex(s => s.id === activeSection) || 0
  );

  // Effect to synchronize the internal active index with the externally determined activeSection
  useEffect(() => {
    const index = sections.findIndex(s => s.id === activeSection);
    if (index !== -1 && index !== activeDesktopIndex) {
      // Update only if the section is found and the index is different
      setActiveDesktopIndex(index);
    }
    // If activeSection becomes null (e.g., scrolled out of view),
    // we might want to keep the last active index or reset to 0.
    // Current behavior: keeps the last valid index.
  }, [activeSection, sections, activeDesktopIndex]); // Add activeDesktopIndex to prevent unnecessary updates

  // Setup keyboard navigation for the desktop list
  const {
    getItemProps: getDesktopKeyboardProps,
    containerProps: desktopContainerProps
  } = useKeyboardNavigation({
    items: sections,
    activeIndex: activeDesktopIndex,
    isHorizontal: false, // Desktop nav is vertical
    onNavigate: (newIndex) => {
      // When keyboard navigation changes the index:
      setActiveDesktopIndex(newIndex); // Update the internal state
      const sectionId = sections[newIndex]?.id;
      if (sectionId) {
        onNavClick(sectionId); // Trigger the navigation action (scroll)
      }
      // Optionally focus the newly navigated button
      if (navListRef.current) {
        const navButtons = navListRef.current.querySelectorAll<HTMLButtonElement>('button');
        if (navButtons && navButtons[newIndex]) {
          // Use a short timeout to ensure the button is focusable after potential DOM updates
          setTimeout(() => navButtons[newIndex]?.focus(), 0);
        }
      }
    },
    onActivate: (_item, index) => {
      // When Enter/Space is pressed on an item:
      const sectionId = sections[index]?.id;
      if (sectionId) {
        onNavClick(sectionId); // Trigger the navigation action (scroll)
      }
    }
  });

  // Setup the visual indicator line for the active item
  const { indicatorStyle, trackHeight } = useDesktopIndicator({
    navListRef,
    activeSection,
    sections,
  });

  // Memoize the container props for the desktop navigation list (UL)
  const desktopNavProps = useMemo(() => {
    return {
      role: desktopContainerProps.role,
      'aria-orientation': desktopContainerProps['aria-orientation'],
      'aria-label': navTitle // Add aria-label for accessibility
    };
  }, [desktopContainerProps, navTitle]);

  // Function to get props for each individual desktop navigation item (button)
  const getDesktopItemProps = useCallback(
    (section: Section, index: number) => {
      const keyboardProps = getDesktopKeyboardProps(index);
      const isActive = activeSection === section.id;
      return {
        ...keyboardProps, // Include keyboard props (onKeyDown, tabIndex, role)
        onClick: () => onNavClick(section.id), // Handle click events
        className: cx(
          navButtonBaseStyles, // Base button styles
          isActive ? navButtonActiveStyles : navButtonInactiveStyles // Active/inactive styles
        ),
        'aria-current': isActive ? 'location' as const : undefined, // ARIA current state
        // Add data-section-id for easier querying if needed
        'data-section-id': section.id,
      };
    },
    [getDesktopKeyboardProps, activeSection, onNavClick] // Dependencies for the item props getter
  );

  // Return all necessary values and functions
  return {
    desktopNavProps,      // Props for the main UL container
    getDesktopItemProps,  // Function to get props for each LI's button
    indicatorStyle,       // Style object for the active indicator line
    trackHeight,          // Height for the indicator track line
  };
}


// --- TypeScript Interfaces ---

/**
 * Represents a content section within the ScrollingContentWithNav component
 */
export interface Section {
  id: string; // Unique identifier for the section (used for linking and keys)
  title: string; // Short title used for the navigation links
  svgIcon?: React.ReactNode; // Optional SVG icon component/element to display at the top
  headerElement?: { // Optional structured header element for the section
    type: 'image' | 'card' | 'code' | 'text'; // Type of header
    content?: string[]; // Text content (for card, text types)
    src?: string; // Image source (for image type)
    code?: string; // Code content (for code type)
    bgColor?: string; // Optional background color (use theme colors ideally)
  };
  // --- UPDATED TYPE: Expects a function for render props ---
  customComponentAbove?: (props: { isScrolling: boolean }) => React.ReactNode;
  sectionTitle?: string; // Optional longer title displayed above the section content
  content?: string[]; // Array of paragraphs for simple text content
  // --- UPDATED TYPE: Expects a function for render props ---
  customComponent?: (props: { isScrolling: boolean }) => React.ReactNode;
}

/**
 * Props for the main ScrollingContentWithNav component
 */
export interface ScrollingContentWithNavProps {
  sections: Section[]; // Array of section data objects
  children?: ReactNode; // Optional: Render children directly instead of using sections data
  activeSection?: string | null; // Optional: Externally control the active section
  onNavClick?: (id: string) => void; // Optional: Callback when a nav item is clicked
  navTitle?: string; // Title displayed in navigation areas (default: 'Contents')

  // Header options for the top header bar within the component
  headerTitle?: string; // Simple title text
  headerRightContent?: ReactNode; // Optional content for the right side (e.g., buttons)
  headerContent?: ReactNode; // Optional: Full custom React node for the header (overrides title/right)
  headerDescription?: ReactNode; // Optional: Description text displayed below the header (not part of navigable content)

  // Footer options for the content displayed at the bottom of the component
  footerTitle?: string; // Optional: Title for the footer section
  footerContent?: ReactNode; // Optional: Content to display in the footer area below all navigable sections

  // Optional class names for styling customization via PandaCSS/CSS
  containerClassName?: string;
  headerClassName?: string;
  headerDescriptionClassName?: string; // Class name for the header description container
  mainClassName?: string;
  contentColumnClassName?: string;
  navColumnClassName?: string;
  sectionHeadingClassName?: string;
  sectionParagraphClassName?: string;
  svgIconWrapperClassName?: string; // <-- ADDED PROP for styling SVG wrapper
  customComponentAboveWrapperClassName?: string; // <-- ADDED PROP for styling top custom component wrapper
  customComponentWrapperClassName?: string; // Prop for styling bottom custom component wrapper
  footerClassName?: string; // Class name for the footer container
  footerTitleClassName?: string; // Class name for the footer title

  // Behavior control props
  enableAutoDetection?: boolean; // Enable/disable IntersectionObserver (default: true)
  offsetTop?: number; // External offset (e.g., height of a global navbar above this component)
  useChildrenInsteadOfData?: boolean; // Render passed children instead of sections data (default: false)
  autoFocusContainerOnMount?: boolean; // Autofocus the main scroll container on mount (default: false)
  
  // Responsive design props
  maxContentWidth?: string; // Optional max-width override for content container
  responsivePadding?: boolean; // Enable/disable responsive padding (default: true)
  customBreakpoints?: Record<string, number>; // Optional custom breakpoints
}

// --- PandaCSS Style Definitions ---
// Using PandaCSS `css` function to generate atomic CSS classes.
// These definitions assume a theme is configured with tokens like
// 'text', 'background', 'primary', 'border', 'glow', 'textMuted', etc.

// Fluid typography utility styles
export const fluidFontSizeStyles = {
  // Base fluid text styles with responsive scaling - updated with more aggressive scaling
  bodyText: css({
    fontSize: {
      base: 'desktopSubmenuItem', // 0.85rem - slightly smaller
      sm: 'desktopSubmenuItem',   // 0.85rem - slightly smaller
      md: 'desktopNavItem',       // 0.95rem - slightly smaller than standard base
      lg: 'base',                 // 1rem - still conservative
      xl: 'lg',                   // 1.125rem - at 1440px, this becomes our new baseline
      '2xl': 'xl',                // 1.25rem - more aggressive scaling at 1920px
      '3xl': 'desktopSubmenuHeader' // 1.25rem - max size at 2200px
    },
    lineHeight: {
      base: '1.5',
      lg: '1.6',
      xl: '1.7',
      '2xl': '1.8'  // Even more generous line height at large screens
    }
  }),
  
  navTitle: css({
    fontSize: {
      base: 'desktopSubmenuItem',  // 0.85rem
      md: 'desktopNavItem',        // 0.95rem
      lg: 'base',                  // 1rem
      xl: 'lg',                    // 1.125rem
      '2xl': 'xl'                  // 1.25rem - more aggressive scaling
    },
    fontWeight: '200'
  }),
  
  sectionHeading: css({
    fontSize: {
      base: 'lg',      // 1.125rem
      md: 'xl',        // 1.25rem
      xl: '3xl',       // 1.875rem
      '2xl': '4xl',    // 2.25rem
      '3xl': '5xl'     // 3rem - more aggressive at largest screens
    }
  })
};

// Outermost container div
export const containerStyles = css({
  position: 'relative',
  width: 'full',                  // Take full available width
  height: '100vh',                // Ensure container takes full viewport height
  display: 'flex',
  flexDirection: 'column',        // Stack header, main content vertically
  color: 'text',                  // Default text color from theme
  fontFamily: 'body',             // Default font from theme
  overflow: 'hidden',             // Prevent scroll on the container itself; scrolling happens inside `mainContainerStyles`
  maxWidth: {                     // Responsive container width constraints
    base: '100%',
    xl: '90rem',                  // ~1440px
    '2xl': '110rem',              // ~1760px
    '3xl': '120rem'               // ~1920px - upper bound below 2200px
  },
  margin: '0 auto',               // Center the container
});

// Header Styles (Optional top header bar within the component)
export const headerStyles = css({
  background: 'background',       // Background color from theme
  width: '100%',
  paddingBottom: { 
    base: '1.2',                  // Smaller padding on mobile
    md: '1.4',                    // Panda theme spacing token
    xl: '1.6'                     // Larger padding on desktop
  },
  paddingLeft: { 
    base: '2', 
    md: '3',
    xl: '6',
    '2xl': '12',
  },
  paddingRight: { 
    base: '2', 
    md: '3',
    xl: '4'
  },
  borderBottom: '1px solid',      // Separator line
  borderColor: 'border',          // Border color from theme
  flexShrink: 0,                  // Prevent header from shrinking
  display: 'block',               // Ensure it takes full width
});

// Default layout for header content (if not using custom `headerContent`)
export const headerContentContainerStyles = css({
  paddingTop: {
    base: '4rem',                 // Smaller padding on mobile
    md: '6rem',                   // Medium padding on tablets
    lg: '8rem',                   // Full padding on desktop
    xl: '8rem',                   // Maintain at XL screens
    '2xl': '10rem',               // Enhanced for 2XL screens
    '3xl': '10rem'                // Keep consistent at largest breakpoint
  },
  display: 'flex',
  justifyContent: 'space-between', // Space out title and right content
  alignItems: 'left',             // Align items to the left (per example)
  width: 'full',
});

// Style for the header description container
export const headerDescriptionStyles = css({
  padding: {
    base: '3',
    md: '4'
  },
  marginTop: {
    base: '1',
    md: '2'
  },
  marginBottom: {
    base: '3',
    md: '4'
  },
  borderBottom: '1px solid',
  borderColor: 'border',
  fontSize: {
    base: 'sm',
    xl: 'base'
  },
  color: 'text',
  lineHeight: {
    base: 'relaxed',
    xl: 'loose'
  },
  width: 'full',
  backgroundColor: 'background',
});

// Style for the footer container
export const footerStyles = css({
  width: 'full',
  padding: {
    base: '4',
    md: '5',
    lg: '6'
  },
  marginTop: {
    base: '6',
    md: '8'
  },
  borderTop: '1px solid',
  borderColor: 'border',
  fontSize: {
    base: 'sm',
    xl: 'base'
  },
  color: 'text',
  backgroundColor: 'background',
  paddingBottom: {
    base: '15rem',                // Less space on mobile
    md: '20rem',                  // Medium space on tablets
    lg: '25rem'                   // Full space on desktop
  }
});

// Style for the footer title
export const footerTitleStyles = css({
  fontSize: {
    base: 'lg',
    xl: 'xl',
    '2xl': '3xl'
  },
  fontWeight: '200',
  color: 'primary',
  marginBottom: {
    base: '3',
    md: '4'
  },
  paddingBottom: {
    base: '1',
    md: '2'
  },
  borderColor: 'border',
});

// Default styling for the header title
export const headerTitleStyles = css({
  fontSize: {
    base: 'lg',                   // Base size
    lg: 'xl',                     // Medium size
    xl: '3xl',                    // Large size for bigger screens
    '2xl': '5xl'                  // Even larger at 1920px+
  },
  fontWeight: '200',              // Thin font weight
  textAlign: 'left',
  paddingLeft: {
    base: '3',
    md: '4',
    lg: '5',
    xl: '5',
    '2xl': '6',                   // Align with section padding at large screens
    '3xl': '6'                    // Maintain alignment at largest breakpoint
  },
  background: 'background',       // Ensure background matches
});

// Common styles for navigation lists (UL elements)
export const navListCommonStyles = css({
  listStyle: 'none',              // Remove default list bullets
  padding: 0,
  margin: 0,
});

// --- Mobile Navigation Styles ---
// Wrapper for the entire mobile nav (button + dropdown)
export const mobileNavWrapperStyles = css({
  display: { base: 'block', md: 'none' }, // Only show on mobile (base)
  position: 'sticky', // Stick to the top of the scrollable container
  top: '0',
  bg: 'background', // Background color
  borderColor: 'border', // Border color
  flexShrink: 0, // Prevent shrinking
  // MODIFIED: Improved stacking approach using both isolation and z-index
  isolation: 'isolate', // Creates stacking context in a more predictable way
  zIndex: 3, // Reduced from 20 but still ensures it's above content sections
  borderBottom: '1px solid', // Separator line
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)', // Subtle shadow
});

// Trigger button for opening/closing mobile nav
export const mobileNavTriggerStyles = css({
  display: 'flex',
  justifyContent: 'space-between', // Space out title and expand/collapse text
  alignItems: 'center',
  width: 'full',
  p: { 
    base: '2',  // Smaller padding on tiny screens
    sm: '3'     // Normal padding on small screens and up
  },
  fontSize: { 
    base: 'mobileSubmenuItem',  // Use 0.9rem on smaller screens
    sm: 'mobileNavItem'         // Use 1.1rem on larger mobiles
  },
  fontWeight: '200', // Font weight
  color: 'text', // Text color
  cursor: 'pointer',
  border: 'none', // Remove default button border
  bg: 'transparent', // Transparent background
  _hover: { // Hover style
    bgColor: 'glow', // Glow color from theme
  },
});

// Dropdown container for mobile nav items
export const mobileNavDropdownStyles = css({
  position: 'absolute', // Position below the trigger button
  top: '100%',
  left: 0,
  right: 0,
  bg: 'background',
  borderBottom: '1px solid',
  borderColor: 'border',
  boxShadow: 'lg', // Larger shadow for dropdown
  height: 'auto',
  maxH: { 
    base: 'calc(50vh - 40px)',  // Smaller on phones
    sm: 'calc(50vh - 60px)'     // Larger on tablets
  },
  overflowY: 'hidden', // Prevent internal scrolling (use touch gestures)
  zIndex: 19, // Just below the trigger button wrapper
  // Transition for smooth open/close (can be overridden by touch gestures)
  transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
});

// List element (UL) inside the mobile dropdown
export const mobileNavListStyles = css({
  listStyle: 'none',
  padding: { 
    base: '1', 
    sm: '2' 
  },
  margin: 0,
});

// --- Main Content Area Styles ---
// This is the primary scrollable container
export const mainContainerStyles = css({
  // paddingTop: '50', // Removed: Mobile nav is sticky inside now
  display: 'flex',
  // Column layout on mobile, row layout on desktop
  flexDirection: { base: 'column', md: 'row' },
  flex: '1', // Allow this container to grow and fill remaining space
  width: 'full',
  overflowY: 'auto', // Enable vertical scrolling ONLY for this container
  overflowX: 'hidden', // Hide horizontal overflow
  // Enable native smooth scrolling for user interactions (clicking links, etc.)
  // Our programmatic scroll temporarily disables this.
  scrollBehavior: 'smooth',
  // Responsive padding that scales with screen size
  paddingRight: { 
    base: '1',  // Less padding on mobile
    sm: '2',    // Small padding on tablets
    lg: '3',    // Medium padding on small desktops
    xl: '4'     // Full padding on large screens
  },
  paddingLeft: {
    base: '2',  // Less padding on mobile
    sm: '3',    // Small padding on tablets
    lg: '4',    // Medium padding on small desktops
    xl: '5'     // Full padding on large screens
  },
  // Make it programmatically focusable (for autofocus hook) but hide the default outline
  outline: 'none',
  _focusVisible: {
    // Improved focus styles for accessibility
    outline: '2px solid',
    outlineColor: 'primary',
    outlineOffset: '2px',
  },
});

// Wrapper for the main content sections (left side on desktop)
export const contentWrapperStyles = css({
  flex: '1', // Allow content to take available space
  padding: { 
    base: '3',  // Smaller padding on mobile
    sm: '4',    // Medium padding on tablets
    md: '5',    // Larger padding on small desktops
    lg: '6',    // Full padding on large screens
    xl: '7',    // Enhanced padding for XL screens
    '2xl': '8', // Extra padding for 2XL screens
    '3xl': '9'  // Special exclusive padding for the largest breakpoint
  },
  order: 1, // Ensure content appears first on mobile (above desktop nav)
  minWidth: 0, // Prevent flexbox overflow issues
  
  // Custom styles for largest breakpoint (3xl - 2200px)
  '@media (min-width: 2200px)': {
    paddingTop: '0.5rem',         // Fine-tune top padding at largest size
    paddingLeft: 'calc(9 * 0.25rem + 0.5rem)'  // Precise padding adjustment
  }
});

// Innermost column holding the actual section elements
export const contentColumnStyles = css({
  width: 'full',
  maxWidth: { 
    base: '100%',
    lg: '60rem',  // ~960px
    xl: '70rem',  // ~1120px
    '2xl': '80rem', // ~1280px
    '3xl': '90rem'  // ~1440px
  },
  margin: '0 auto', // Center content if max-width is set
});

// --- Desktop Navigation Styles ---
// Wrapper for the desktop sidebar navigation
export const navWrapperStyles = css({
  paddingTop: {
    md: '3rem', 
    lg: '4rem',
    xl: '5rem'
  },
  display: { base: 'none', md: 'block' }, // Only show on medium screens and up
  width: { 
    md: '56',  // ~14rem - Smaller on tablets
    lg: '64',  // ~16rem - Medium on small desktops
    xl: '72',  // ~18rem - Larger on standard desktops
    '2xl': '80' // ~20rem - Full size on large screens
  },
  borderColor: 'border',
  bg: 'background',
  order: 2, // Place it after content in the flex row
  position: 'sticky', // Stick to the top of the scrollable container
  top: 0,
  alignSelf: 'flex-start', // Align to the top of the flex container
  maxHeight: '100vh', // Limit height to viewport height
  overflowY: 'auto', // Allow sidebar itself to scroll if content exceeds height
  flexShrink: 0, // Prevent sidebar from shrinking
  // MODIFIED: Improved stacking approach using both isolation and z-index
  isolation: 'isolate', // Creates stacking context in a more predictable way
  zIndex: 3, // Reduced from 20 but still ensures it's above content sections
  // Add a right border to clearly separate navigation from content
  borderRight: { md: '1px solid' },
});

// Inner container for padding within the desktop nav
export const navScrollContainerStyles = css({
  padding: {
    md: '3',
    lg: '4',
    xl: '5' 
  },
  display: 'flex',
  flexDirection: 'column',
  height: '100%', // Allow inner content to potentially fill height
  // Add spacing at the bottom to ensure last nav items are visible
  paddingBottom: {
    md: '6rem',
    lg: '8rem'
  }
});

// Header text (e.g., "Contents") within the desktop nav
export const navHeaderStyles = css({
  fontSize: {
    md: 'desktopSubmenuItem', // 0.85rem
    lg: 'desktopNavItem',     // 0.95rem
    xl: 'base'                // 1rem
  },
  fontWeight: '200',
  mb: {
    md: '3',
    lg: '4'
  },
  color: 'primary', // Use primary color
  textAlign: 'left',
  px: {
    md: '1',
    lg: '2'
  },
  flexShrink: 0, // Prevent shrinking
});

// Container for the desktop navigation list and the indicator track/line
export const navListContainerStyles = css({
  position: 'relative', // Needed for absolute positioning of indicator lines
  flex: '1', // Allow list to take remaining space
  pl: {
    md: '3',
    lg: '4',
    xl: '5'
  },
  minHeight: 0, // Prevent flexbox overflow
});

// The list (UL) itself in the desktop nav
export const navListStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: {
    md: '1',
    lg: '2',
    xl: '3'
  },
  listStyle: 'none',
  padding: 0,
  margin: 0,
});

// --- Common Button Styles ---
// Base styles shared by mobile and desktop nav buttons
export const buttonBaseStyles = css({
  position: 'relative', // For potential pseudo-elements or absolute children
  display: 'block',
  width: 'full',
  textAlign: 'left',
  cursor: 'pointer',
  border: 'none',
  bg: 'transparent',
  // Transition for hover/focus effects
  transitionProperty: 'colors, background-color',
  transitionDuration: 'fast',
  transitionTimingFunction: 'ease-in-out',
  // Focus visible style for accessibility
  _focusVisible: {
    outline: 'none', // Remove default outline
    // Custom focus ring using box-shadow
    boxShadow: `
      0 0 0 1px var(--colors-background),
      0 0 0 calc(1px + 2px) var(--colors-primary)
    `,
  },
  _hover: { // Hover style
    bgColor: 'glow',
  },
});

// Specific styles for navigation buttons (adjusting padding, font size etc.)
export const navButtonBaseStyles = css({
  position: 'relative',
  display: 'block',
  width: 'full',
  textAlign: 'left',
  pl: {
    md: '2',
    lg: '3'
  },
  pr: {
    md: '1',
    lg: '2'
  },
  py: {
    md: '1',
    lg: '1.5',
    xl: '2'
  },
  rounded: 'md', // Rounded corners
  fontSize: {
    md: 'desktopSubmenuItem', // 0.85rem
    lg: 'desktopNavItem',     // 0.95rem
    xl: 'base'                // 1rem
  },
  fontWeight: 'light', // Lighter font weight
  overflow: 'hidden', // Prevent text overflow issues
  textOverflow: 'ellipsis', // Add ellipsis (...) if text is too long
  whiteSpace: 'nowrap', // Keep text on a single line
  cursor: 'pointer',
  border: 'none',
  bg: 'transparent',
  transitionProperty: 'colors, background-color, box-shadow',
  transitionDuration: 'fast',
  transitionTimingFunction: 'ease-in-out',
  _focusVisible: { // Custom focus style for nav buttons
    outline: 'none',
    boxShadow: `0 0 0 2px var(--colors-primary)`,
    bg: 'glow',
  },
  _hover: { // Hover style
    bgColor: 'glow',
  },
});

// Styles for inactive navigation buttons
export const navButtonInactiveStyles = css({
  color: 'textMuted', // Muted text color from theme
  _hover: {
    color: 'text', // Change to default text color on hover
  },
});

// Styles for the active navigation button
export const navButtonActiveStyles = css({
  color: 'primary', // Use primary color for text
  fontWeight: 'medium', // Slightly bolder font weight
});

// --- Desktop Indicator Line Styles ---
// Background track for the indicator line
export const lineTrackStyles = css({
  position: 'absolute',
  left: {
    md: '1',
    lg: '2'
  },
  top: '0',
  width: {
    md: '1px',
    lg: '2px'
  },
  bg: 'border', // Use border color for the track
  rounded: 'full', // Rounded ends
  transition: 'height 0.3s ease-in-out', // Animate height changes
});

// The active indicator line itself
export const lineIndicatorStyles = css({
  position: 'absolute',
  left: '0', // Align to the very left of the container
  width: { 
    md: '3px',
    lg: '4px',
    xl: '5px',
    '2xl': '6px'
  },
  bg: 'primary', // Use primary color
  borderRadius: '0 3px 3px 0', // Rounded on the right side
  boxShadow: '0 0 6px var(--colors-primary)', // Add a glow effect
  // Animate position, height, and opacity changes
  transitionProperty: 'top, height, opacity, transform',
  transitionDuration: 'normal', // Theme transition duration
  transitionTimingFunction: 'ease-in-out',
});

// --- Section Header Element Styles (within content) ---
// Base styles for the wrapper div around section header elements
export const headerElementBaseStyles = css({
  mb: '6', // Margin bottom
  width: 'full',
  borderRadius: 'md', // Rounded corners
  p: '4', // Padding (can be overridden by specific types)
  overflow: 'hidden', // Prevent content spillover
});

// Specific styles for different header types
export const headerElementStyles = css({ // General wrapper
  mb: '6',
  width: 'full',
  borderRadius: 'md',
  overflow: 'hidden',
});

export const headerImageStyles = css({ // Image type
  width: 'full',
  maxHeight: '240px', // Limit image height
  objectFit: 'cover', // Ensure image covers the area well
});

export const headerCardStyles = css({ // Card type
  p: '4',
  border: '1px solid',
  borderColor: 'border',
  borderRadius: 'md',
  boxShadow: 'sm', // Small shadow
  bg: 'background', // Background color
});

export const headerCodeStyles = css({ // Code type
  p: '4',
  fontFamily: 'mono', // Monospace font from theme
  fontSize: 'sm',
  bg: 'background', // Use slightly different bg if needed, e.g., 'gray.100'
  color: 'text',
  borderRadius: 'md',
  overflow: 'auto', // Allow horizontal scrolling for long code lines
});

export const headerTextStyles = css({ // Text/Quote type
  p: '4',
  fontStyle: 'italic',
  color: 'text',
  borderColor: 'primary',
  bg: 'background', // Use slightly different bg if needed, e.g., 'blue.50'
});

// --- Section Content Styles ---
// Heading (H2) within a section
export const sectionHeadingStyles = css({
  // Fluid typography using clamp
  fontSize: 'clamp(1.125rem, calc(1.125rem + ((1vw - 4.8px) * 2.366)), 3rem)',
  fontWeight: 'semibold', // Font weight
  mb: {
    base: '3',
    md: '4',
    lg: '5'
  },
  color: 'primary', // Use primary color
});

// Paragraph (P) within a section - Modified with CSS clamp for fluid typography
export const sectionParagraphStyles = css({
  mb: {
    base: '3',
    md: '4',
    lg: '5'
  },
  lineHeight: 'calc(1.5em + 0.2 * (1vw - 4.8px))', // Fluid line height
  
  // Fluid typography using clamp instead of breakpoints
  fontSize: 'clamp(0.85rem, calc(0.85rem + ((1vw - 4.8px) * 0.5)), 1.25rem)',
  color: 'text', // Default text color
});

// Styles applied to the <section> wrapper itself
export const sectionStyles = css({
  // scrollMarginTop is applied dynamically via inline style based on scrollOffset
  mb: {
    base: '10rem',   // Smaller on mobile
    sm: '15rem',     // Small tablets
    md: '20rem',     // Tablets/small laptops
    lg: '25rem'      // Full spacing on desktops
  },
  // MODIFIED: Removed negative z-index which was causing stacking context issues
  // Instead, we use isolation and a proper stacking context approach
  isolation: 'isolate', // Create a new stacking context without relying on z-index
  paddingLeft: {
    base: '1rem',
    sm: '1.5rem',
    md: '2rem',
    lg: '2.5rem',
    xl: '3rem',
    '2xl': '3.5rem',
    '3xl': '4rem'    // Special padding just for the largest breakpoint
  },
  paddingRight: {
    base: '1rem',
    sm: '2rem',
    md: '3rem',
    lg: '4rem',
    xl: '5rem',
    '2xl': '6rem',
    '3xl': '6.5rem'  // Special padding just for the largest breakpoint
  },
  py: {
    base: '1',
    md: '2',
    lg: '3',
    xl: '4',
    '2xl': '5',
    '3xl': '5'       // Consistent at largest breakpoint
  },
  position: 'relative', // For potential absolute positioning within a section
  
  // Custom styles for largest breakpoint (3xl - 2200px)
  '@media (min-width: 2200px)': {
    paddingTop: '2rem',           // Extra top padding just for the largest size
    '& > h2:first-of-type': {     // First heading in each section
      marginLeft: '0.25rem'       // Fine-tune the alignment at largest size
    }
  },
  
  // Style nested headings within sections
  '& h1, & h2, & h3': {
    fontWeight: 'thin', // Use thin weight (ensure font supports it)
    color: 'primary',
    fontSize: {
      base: 'lg',    // 1.125rem
      md: 'xl',      // 1.25rem
      lg: '3xl',     // 1.875rem
      '2xl': '4xl',  // 2.25rem
      '3xl': '5xl'   // 3rem at largest screens
    },
  },
  
  // Improve spacing within sections for better readability
  '& ul, & ol': {
    marginBottom: {
      base: '3',
      md: '4'
    },
    paddingLeft: {
      base: '4',
      md: '6'
    }
  },
  
  // Scale images responsively
  '& img': {
    maxWidth: '100%',
    height: 'auto'
  }
});

// --- Section Header Sub-Component ---
// Renders the optional header element based on the `headerElement` prop in section data
interface SectionHeaderProps {
  headerElement: NonNullable<Section['headerElement']>; // Ensure headerElement is not null/undefined
}

interface HeaderWrapperProps {
  children: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ headerElement }) => {
  const { type } = headerElement;

  // Apply custom background color if provided in section data
  const customStyles = headerElement.bgColor
    ? { backgroundColor: headerElement.bgColor }
    : {};

  // Helper function to render paragraphs (used by card and text types)
  const renderParagraphs = (content?: string[]) => {
    return content?.map((text, index) => (
      <p
        key={index}
        style={{
          // Add margin between paragraphs, but not after the last one
          marginBottom: index < (content.length - 1) ? '1rem' : 0,
          color: 'var(--colors-text)', // Use CSS variable for text color
        }}
      >
        {text}
      </p>
    ));
  };

  // Common wrapper div for consistent styling and structure
  const HeaderWrapper: React.FC<HeaderWrapperProps> = ({ children }) => (
    <div className={headerElementStyles}>{children}</div>
  );

  // Render different elements based on the header type
  switch (type) {
    case 'image':
      return (
        <HeaderWrapper>
          <img
            src={headerElement.src || ''} // Use src, provide fallback empty string
            alt="Section header" // Basic alt text
            className={headerImageStyles}
          />
        </HeaderWrapper>
      );

    case 'card':
      return (
        <HeaderWrapper>
          {/* Apply card styles and custom background */}
          <div className={headerCardStyles} style={customStyles}>
            {renderParagraphs(headerElement.content)}
          </div>
        </HeaderWrapper>
      );

    case 'code':
      return (
        <HeaderWrapper>
            {/* Apply code styles and custom background */}
          <pre className={headerCodeStyles} style={customStyles}>
            <code>{headerElement.code}</code>
          </pre>
        </HeaderWrapper>
      );

    case 'text':
      return (
        <HeaderWrapper>
            {/* Apply text styles and custom background */}
          <div className={headerTextStyles} style={customStyles}>
            {renderParagraphs(headerElement.content)}
          </div>
        </HeaderWrapper>
      );

    default:
      return null; // Return null if type is unknown or not provided
  }
};

// --- ScrollingContentWithNav Component Implementation ---

// Define the type for the props object passed to React.cloneElement when rendering children,
// explicitly including 'data-section-id' which is a valid HTML data attribute.
type ClonedElementProps = React.HTMLAttributes<HTMLElement> & {
  key: string;
  style: React.CSSProperties;
  'data-section-id': string; // Explicitly declare the data attribute type
  id: string; // Also include id
};

const ScrollingContentWithNav: React.FC<ScrollingContentWithNavProps> = ({
  // Destructure props with defaults
  sections,
  children,
  activeSection: externalActiveSection = null,
  onNavClick: externalOnNavClick,
  navTitle = 'Contents',
  headerContent,
  headerTitle,
  headerRightContent,
  headerDescription,
  footerTitle,
  footerContent,
  containerClassName,
  headerClassName,
  headerDescriptionClassName,
  mainClassName,
  contentColumnClassName,
  navColumnClassName,
  sectionHeadingClassName,
  sectionParagraphClassName,
  svgIconWrapperClassName, // <-- DESTRUCTURED PROP
  customComponentAboveWrapperClassName, // <-- DESTRUCTURED PROP
  customComponentWrapperClassName,
  footerClassName,
  footerTitleClassName,
  enableAutoDetection = true,
  offsetTop = 0, // Default external offset to 0
  useChildrenInsteadOfData = false,
  autoFocusContainerOnMount = false,
  // Responsive design props
  maxContentWidth,
  responsivePadding = true,
  customBreakpoints,
}) => {
  // --- Refs ---
  const mainContainerRef = useRef<HTMLDivElement>(null); // Ref for the main scrollable container
  const navListRef = useRef<HTMLUListElement>(null); // Ref for the desktop nav list (UL)
  
  // Track window size for responsive behavior
  const windowSize = useWindowSize();

  // --- State & Hooks ---

  // Hook for smooth scrolling - needed early to calculate offset for other hooks
  const {
      scrollToId,
      scrollOffset: finalScrollOffset,
      isScrollingProgrammatically
  } = useSmoothScroll({
      containerRef: mainContainerRef,
      baseOffset: offsetTop,
      // Pass mobileNavRef directly here if useMobileNavigation hook is defined above
      // Otherwise, it needs to be passed later if useMobileNavigation is below
      // stickyElementRef: mobileNavProps.ref, // <-- Potential dependency issue, handled below
  });

  // Hook for section intersection - depends on scrollOffset
  const [activeSection, setActiveSection] = useSectionIntersection(
      mainContainerRef,
      sections,
      finalScrollOffset, // Use the offset from useSmoothScroll
      externalActiveSection,
      enableAutoDetection
  );

  // Combined navigation click handler
  const handleNavClick = useCallback(
    (id: string) => {
      // Call external handler if provided
      if (externalOnNavClick) {
        externalOnNavClick(id);
      }
      // Manually set the active section (if not externally controlled)
      // This provides immediate feedback before the observer catches up
      setActiveSection(id);
      // Trigger the smooth scroll
      scrollToId(id);
    },
    [externalOnNavClick, setActiveSection, scrollToId] // Dependencies
  );

  // Hook for mobile navigation - depends on handleNavClick
  const {
    isMobileNavOpen,
    mobileNavProps, // Contains the ref for the mobile nav wrapper
    triggerProps,
    dropdownProps,
    getItemProps: getMobileItemProps, // Renamed to avoid naming clash
  } = useMobileNavigation({
    onNavItemClick: handleNavClick,
    sections,
  });

  // Re-run useSmoothScroll if mobileNavRef changes (this is slightly complex due to hook order)
  // Alternatively, pass mobileNavProps.ref directly if hook order allows
  // For simplicity, we assume mobileNavProps.ref is stable enough or recalculation is acceptable
  // If performance issues arise, this dependency chain needs careful review.

  // Hook for desktop navigation - depends on handleNavClick and activeSection
  const {
    desktopNavProps,
    getDesktopItemProps,
    indicatorStyle,
    trackHeight,
  } = useDesktopNavigation({
    navListRef,
    sections,
    activeSection,
    onNavClick: handleNavClick,
    navTitle,
  });

  // Hook for autofocus - simple side effect
  useAutofocus({
    targetRef: mainContainerRef,
    shouldFocus: autoFocusContainerOnMount,
  });

  // Hook for detecting user scroll - independent
  const isScrollingByUser = useUserScrollDetection(mainContainerRef, 150);

  // Combined scrolling state
  const isScrolling = isScrollingProgrammatically || isScrollingByUser;


  // --- Child Rendering Logic ---
  const renderedSections = useMemo(() => {
    // Calculate fluid typography sizes based on window dimensions
    // Only compute this if useFluidHeadings is enabled
    let headingFontSize = '';
    let paragraphFontSize = '';
    
   
    
    // Option 1: Render children directly (less control over custom components)
    if (useChildrenInsteadOfData && React.Children.count(children) > 0) {
      const childrenArray = React.Children.toArray(children);
      return childrenArray.map((child, index) => {
          const section = sections[index];
          if (!section || !React.isValidElement(child)) {
            console.warn('[ScrollingContentWithNav] Child/Section mismatch at index', index);
            return child;
          }
          const childProps = child.props as { className?: string; style?: React.CSSProperties; children?: ReactNode; [key: string]: any; };
          const existingClassName = childProps.className || '';
          const existingStyle = childProps.style || {};
          const existingChildren = childProps.children;
          const combinedClassName = cx(sectionStyles, existingClassName);
          const sectionInlineStyles = { scrollMarginTop: `${finalScrollOffset}px` };
          const clonedElementProps: ClonedElementProps = {
            'data-section-id': section.id, id: section.id, className: combinedClassName,
            style: { ...existingStyle, ...sectionInlineStyles }, key: section.id,
            children: ( <> {section.headerElement && <SectionHeader headerElement={section.headerElement} />} {existingChildren} </> ),
          };
          return React.cloneElement(child, clonedElementProps);
      });
    }

    // Option 2: Generate sections from the `sections` data array
    return sections.map((section) => {
      const sectionInlineStyles = { scrollMarginTop: `${finalScrollOffset}px` };
      
      

      return (
        <section
          data-section-id={section.id}
          id={section.id}
          className={sectionStyles}
          style={sectionInlineStyles}
          key={section.id}
        >
          {/* Render SVG Icon if provided */}
          {section.svgIcon && (
            <div className={svgIconWrapperClassName}>
              {section.svgIcon}
            </div>
          )}

          {/* Render optional header element */}
          {section.headerElement && (
            <SectionHeader headerElement={section.headerElement} />
          )}

          {/* Render Custom Component Above - FLATTENED, no wrapper with z-index */}
          {typeof section.customComponentAbove === 'function' && (
            <div className={cx(
              css({
                display: 'block',
                position: 'relative',
                // Add responsive margins
                marginBottom: {
                  base: '3',
                  md: '4',
                  lg: '5'
                }
              }),
              customComponentAboveWrapperClassName
            )}>
              {section.customComponentAbove({ isScrolling })}
            </div>
          )}

          {/* Render default content structure (heading + paragraphs) */}
          {(section.sectionTitle || section.content) && (
              <>
                {section.sectionTitle && (
                    <h2 
                      className={cx(sectionHeadingStyles, sectionHeadingClassName)}
                    >
                        {section.sectionTitle}
                    </h2>
                )}
                {section.content?.map((paragraph, idx) => (
                    <p
                        key={`${section.id}-p-${idx}`}
                        className={cx(
                            sectionParagraphStyles,
                            sectionParagraphClassName
                        )}
                    >
                        {paragraph}
                    </p>
                ))}
              </>
          )}

          {/* Render Custom Component Below - FLATTENED, no wrapper with z-index */}
          {typeof section.customComponent === 'function' && (
            <div className={cx(
              css({
                display: 'block',
                position: 'relative',
                // Add responsive margins
                marginTop: {
                  base: '3',
                  md: '4',
                  lg: '5'
                }
              }),
              customComponentWrapperClassName
            )}>
              {section.customComponent({ isScrolling })}
            </div>
          )}
        </section>
      );
    });
  }, [
    // Dependencies for memoization
    sections,
    children,
    finalScrollOffset,
    useChildrenInsteadOfData,
    sectionHeadingClassName,
    sectionParagraphClassName,
    svgIconWrapperClassName,
    customComponentAboveWrapperClassName,
    customComponentWrapperClassName,
    isScrolling,
    windowSize.width, // Recompute when window size changes
    // sectionStyles, // Assuming sectionStyles is stable
  ]);

  // --- JSX Output ---
  return (
    // Outermost container
    <div className={cx(
      containerStyles, 
      containerClassName,
      // Apply custom max width if provided
      maxContentWidth && css({ maxWidth: maxContentWidth })
    )}>

      {/* Main Scrollable Container */}
      <div
        ref={mainContainerRef} // Attach ref for scrolling and focus
        className={cx(
          mainContainerStyles, 
          mainClassName,
          // Apply responsive padding if enabled
          responsivePadding && css({
            paddingRight: { 
              base: '1',  // Less padding on mobile
              sm: '2',    // Small padding on tablets
              lg: '3',    // Medium padding on small desktops
              xl: '4'     // Full padding on large screens
            },
            paddingLeft: {
              base: '2',  // Less padding on mobile
              sm: '3',    // Small padding on tablets
              lg: '4',    // Medium padding on small desktops
              xl: '5'     // Full padding on large screens
            },
          })
        )}
        tabIndex={-1} // Make programmatically focusable but not via tab key
      >
        {/* Mobile Navigation (Sticky inside scroll container) */}
        <div {...mobileNavProps} className={mobileNavWrapperStyles}>
          <button {...triggerProps} className={mobileNavTriggerStyles}>
            <span>{navTitle}</span>
            <span>{isMobileNavOpen ? '(-) Collapse' : '(+) Expand'}</span>
          </button>
          {isMobileNavOpen && (
            <div
              {...dropdownProps}
              className={mobileNavDropdownStyles}
              aria-label={navTitle}
            >
              <div
                className={css({ padding: '2', textAlign: 'center', fontSize: 'xs', color: 'textMuted', })}
              >
                Swipe up to dismiss
              </div>
              <ul className={mobileNavListStyles}>
                {sections.map((section, index) => {
                  const isActive = activeSection === section.id;
                  // Use the renamed getter for mobile items
                  const itemProps = getMobileItemProps(section.id, index);
                  return (
                    <li key={`mobile-${section.id}`} role="none">
                      <button
                        {...itemProps} // Use props from useMobileNavigation
                        className={cx( navButtonBaseStyles, isActive ? navButtonActiveStyles : navButtonInactiveStyles )}
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
        </div> {/* End Mobile Nav */}

        {/* Content Area Wrapper */}
        <div className={cx(
          contentWrapperStyles,
          // Apply additional responsive padding if enabled
          responsivePadding && css({
            padding: { 
              base: '3',  // Smaller padding on mobile
              sm: '4',    // Medium padding on tablets
              md: '5',    // Larger padding on small desktops
              lg: '6'     // Full padding on large screens
            }
          })
        )}>
          {/* Optional Header Bar */}
          {(headerContent || headerTitle) && (
            <div className={cx(headerStyles, headerClassName)}>
              {headerContent ? (
                headerContent
              ) : (
                <div className={headerContentContainerStyles}>
                  <h1 className={headerTitleStyles}>
                    {headerTitle || navTitle}
                  </h1>
                  {headerRightContent && (
                    <div className="header-right-content">
                      {headerRightContent}
                    </div>
                  )}
                </div>
              )}
            </div>
          )} {/* End Optional Header Bar */}

          {/* Header Description (shown below header, not part of navigable content) */}
          {headerDescription && (
            <div className={cx(headerDescriptionStyles, headerDescriptionClassName)}>
              {headerDescription}
            </div>
          )} {/* End Header Description */}

          {/* Inner Content Column */}
          <div
            className={cx(
              contentColumnStyles, 
              contentColumnClassName,
              maxContentWidth && css({ 
                maxWidth: maxContentWidth
              })
            )}
          >
            {/* Render the memoized section elements */}
            {renderedSections}

            {/* Footer Content (displayed below all navigable sections) */}
            {(footerContent || footerTitle) && (
              <footer className={cx(footerStyles, footerClassName)}>
                {footerTitle && (
                  <h2 className={cx(footerTitleStyles, footerTitleClassName)}>
                    {footerTitle}
                  </h2>
                )}
                {footerContent}
              </footer>
            )}
          </div>
        </div> {/* End Content Area Wrapper */}

        {/* Desktop Navigation Sidebar (Sticky inside scroll container) */}
        <div className={cx(navWrapperStyles, navColumnClassName)}>
          <div className={navScrollContainerStyles}>
            {/* Container for List and Indicator Lines */}
            <div className={navListContainerStyles}>
              {/* Background Track Line */}
              <div
                className={lineTrackStyles}
                style={{ height: `${trackHeight}px` }} // Use trackHeight from useDesktopNavigation
                aria-hidden="true"
              ></div>
              {/* Active Indicator Line */}
              <div
                className={lineIndicatorStyles}
                style={{
                  transform: `translateY(${indicatorStyle.top}px)`, // Use indicatorStyle from useDesktopNavigation
                  height: `${indicatorStyle.height}px`,
                  opacity: indicatorStyle.opacity,
                }}
                aria-hidden="true"
              ></div>
              {/* Desktop Navigation List */}
              <ul
                ref={navListRef} // Attach ref
                className={navListStyles}
                {...desktopNavProps} // Use container props from useDesktopNavigation
              >
                {sections.map((section, index) => {
                  // Use the item props getter from useDesktopNavigation
                  const itemProps = getDesktopItemProps(section, index);
                  return (
                    <li
                      key={section.id}
                      data-section-id={section.id} // Keep data-id for indicator lookup
                      role="none"
                    >
                      <button {...itemProps}> {/* Spread all props from the hook */}
                        {section.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div> {/* End Desktop Nav */}

      </div> {/* End Main Scrollable Container */}
    </div> // End Outermost Container
  );
};

// Export the component as default
export default ScrollingContentWithNav;


/**
 * COMPONENT OPTIMIZATION NOTES:
 * * 1. Color System Standardization: Assumes PandaCSS theme provides semantic color tokens (primary, text, background, etc.).
 * * 2. Style Reusability: Common button styles extracted; uses PandaCSS `css` function for atomic classes.
 * * 3. Component Structure: Logic separated into custom hooks; component focuses on layout and wiring.
 * * 4. Reduced Duplication: Hooks prevent repetition of scroll, offset, observer, indicator, autofocus logic.
 * * 5. TypeScript Fixes: Addressed potential issues with cloning children and data attributes.
 * * 6. Refactoring Fixes: Ensured correct handlers (`handleNavClick`) are used after hook extraction; removed redundant `useEffect`.
 * * 7. Hook Dependencies: Managed inter-hook dependencies with careful ordering and hook calls.
 * * 8. Type Error Fix (TS2345): Removed redundant useEffect block that caused the type error by potentially passing null to setActiveSection. Relies on useSectionIntersection's internal handling of scrollOffset changes.
 * * 9. Render Props for Scroll Awareness: Added isScrolling state (combining programmatic and user scroll) and updated Section interface and rendering logic to pass this state down to custom components via a function-as-child pattern.
 * * 10. REFACTOR: Extracted user scroll detection logic into `useUserScrollDetection` hook.
 * * 11. DOM Flattening: Removed unnecessary wrapper divs with problematic z-index values that were creating stacking context conflicts and blocking interactions.
 * * 12. Improved Stacking Context: Replaced negative z-index on sections with `isolation: isolate` for a more predictable stacking behavior.
 * * 13. Reduced z-index Values: Lowered z-index values for navigation elements to create a more consistent stacking hierarchy.
 * * 14. REFACTOR: Extracted desktop navigation state, keyboard handling, and indicator logic into `useDesktopNavigation` hook.
 * * 15. FIX: Refined `useSectionIntersection` handler logic with Top Edge Proximity Detection for more reliable section highlighting during slow scrolling.
 * * 16. IMPROVEMENT: Implemented debouncing in useSectionIntersection to prevent rapid section changes during slow scrolling.
 * * 17. ENHANCEMENT: Added multiple threshold values to the IntersectionObserver for more frequent and accurate notifications during scrolling.
 * * 18. PERFORMANCE: Implemented throttling for resize event handlers to improve performance during continuous resize events. Throttling executes the handler at most once every 100ms, providing consistent updates while preventing excessive calculations.
 * * 19. ACCESSIBILITY: Improved focus management, ARIA roles, and keyboard navigation for both mobile and desktop navigation components.
 * * 20. **FIX (Indicator Spasm):** Increased debounce delay in `useSectionIntersection` from 50ms to 100ms.
 * * 21. **FIX (Indicator Spasm):** Refined `handleIntersection` logic in `useSectionIntersection` to prioritize the section whose top edge is closest *below* (or slightly above) the scroll offset line, removing the less stable fallback logic.
 */
