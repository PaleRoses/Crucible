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
 * - Flexible content rendering through props or data
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
} from 'react';

// Adjust the import path based on your project structure and PandaCSS output directory
import { css, cx } from '../../../styled-system/css'; // Requires PandaCSS setup

// --- Custom Hooks ---

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
 * @returns Object containing scrollOffset and scrollToId function
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
} {
  // State to hold the calculated scroll offset
  const [scrollOffset, setScrollOffset] = useState<number>(baseOffset);

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
    calculateAndSetScrollOffset(); // Initial calculation on mount

    // Recalculate on window resize
    window.addEventListener('resize', calculateAndSetScrollOffset);
    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('resize', calculateAndSetScrollOffset);
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
            }, 100);
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

  // Return the calculated offset and the scrolling function
  return { scrollOffset, scrollToId };
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

  // Determine the effective active section: external prop takes precedence
  const activeSection =
    externalActiveSection !== null ? externalActiveSection : internalActiveSection;

  // Callback executed when section intersections change
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      // Ensure container ref is valid
      if (!containerRef || !containerRef.current) {
        return;
      }

      // Ignore intersections triggered during programmatic scrolling
      if (containerRef.current.hasAttribute('data-scrolling-programmatically')) {
        return;
      }

      // Filter entries that are currently intersecting
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);
      if (visibleEntries.length === 0) return; // No visible sections, do nothing

      // Sort visible entries based on their position relative to the scrollOffset line
      // Prioritize the entry closest to (or just below) the scrollOffset line
      visibleEntries.sort((a, b) => {
        const topA = a.boundingClientRect.top;
        const topB = b.boundingClientRect.top;
        // If A is above offset and B is at/below, B comes first
        if (topA < scrollOffset && topB >= scrollOffset) return 1;
        // If B is above offset and A is at/below, A comes first
        if (topB < scrollOffset && topA >= scrollOffset) return -1;
        // Otherwise, sort by vertical position (higher elements first)
        return topA - topB;
      });

      // Filter out entries that are completely *above* the scrollOffset line
      // We only care about sections intersecting at or below the offset line
      const relevantEntries = visibleEntries.filter(
        (entry) => entry.boundingClientRect.bottom > scrollOffset
      );

      // If there are relevant entries, update the internal active section
      if (relevantEntries.length > 0) {
        const sectionId =
          relevantEntries[0].target.getAttribute('data-section-id');
        // Update only if auto-detection is enabled (externalActiveSection is null)
        // and the detected section is different from the current internal state
        if (
          sectionId &&
          sectionId !== internalActiveSection &&
          externalActiveSection === null
        ) {
          setInternalActiveSection(sectionId);
        }
      }
    },
    // Dependencies: Recalculate if internal state, external control, offset, or container changes
    [internalActiveSection, externalActiveSection, scrollOffset, containerRef]
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
      threshold: 0, // Trigger callback as soon as any part intersects
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

// --- TypeScript Interfaces ---

/**
 * Represents a content section within the ScrollingContentWithNav component
 */
export interface Section {
  id: string; // Unique identifier for the section (used for linking and keys)
  title: string; // Short title used for the navigation links
  sectionTitle?: string; // Optional longer title displayed above the section content
  content?: string[]; // Array of paragraphs for simple text content
  headerElement?: { // Optional structured header element for the section
    type: 'image' | 'card' | 'code' | 'text'; // Type of header
    content?: string[]; // Text content (for card, text types)
    src?: string; // Image source (for image type)
    code?: string; // Code content (for code type)
    bgColor?: string; // Optional background color (use theme colors ideally)
  };
  customComponent?: React.ReactNode; // Optional custom React node to render instead of default content
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

  // Optional class names for styling customization via PandaCSS/CSS
  containerClassName?: string;
  headerClassName?: string;
  mainClassName?: string;
  contentColumnClassName?: string;
  navColumnClassName?: string;
  sectionHeadingClassName?: string;
  sectionParagraphClassName?: string;

  // Behavior control props
  enableAutoDetection?: boolean; // Enable/disable IntersectionObserver (default: true)
  offsetTop?: number; // External offset (e.g., height of a global navbar above this component)
  useChildrenInsteadOfData?: boolean; // Render passed children instead of sections data (default: false)
  autoFocusContainerOnMount?: boolean; // Autofocus the main scroll container on mount (default: false)
}

// --- PandaCSS Style Definitions ---
// Using PandaCSS `css` function to generate atomic CSS classes.
// These definitions assume a theme is configured with tokens like
// 'text', 'background', 'primary', 'border', 'glow', 'textMuted', etc.

// Outermost container div
export const containerStyles = css({
  position: 'relative',
  width: 'full', // Take full available width
  height: '100vh', // Ensure container takes full viewport height
  display: 'flex',
  flexDirection: 'column', // Stack header, main content vertically
  color: 'text', // Default text color from theme
  fontFamily: 'body', // Default font from theme
  overflow: 'hidden', // Prevent scroll on the container itself; scrolling happens inside `mainContainerStyles`
});

// Header Styles (Optional top header bar within the component)
export const headerStyles = css({
  background: 'background', // Background color from theme
  width: '100%',
  paddingBottom: '1.4', // Panda theme spacing token
  paddingLeft: { base: '2', md: '3' }, // Responsive padding
  paddingRight: { base: '2', md: '3' },
  borderBottom: '1px solid', // Separator line
  borderColor: 'border', // Border color from theme
  flexShrink: 0, // Prevent header from shrinking
  display: 'block', // Ensure it takes full width
});

// Default layout for header content (if not using custom `headerContent`)
export const headerContentContainerStyles = css({
  paddingTop: '5rem', // Padding for top spacing

  display: 'flex',
  justifyContent: 'space-between', // Space out title and right content
  alignItems: 'left', // Align items to the left (per example)
  width: 'full',
});

// Default styling for the header title
export const headerTitleStyles = css({
  fontSize: 'lg', // Font size from theme
  fontWeight: '200', // Thin font weight
  textAlign: 'left',
  paddingLeft: '5', // Indentation
  background: 'background', // Ensure background matches
});

// Common styles for navigation lists (UL elements)
export const navListCommonStyles = css({
  listStyle: 'none', // Remove default list bullets
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
  zIndex: 20, // Ensure it's above content
  borderBottom: '1px solid', // Separator line
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)', // Subtle shadow
});

// Trigger button for opening/closing mobile nav
export const mobileNavTriggerStyles = css({
  display: 'flex',
  justifyContent: 'space-between', // Space out title and expand/collapse text
  alignItems: 'center',
  width: 'full',
  p: '3', // Padding
  fontSize: 'sm', // Font size
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
  maxH: 'calc(50vh - 60px)', // Limit height to prevent covering too much screen
  overflowY: 'hidden', // Prevent internal scrolling (use touch gestures)
  zIndex: 19, // Just below the trigger button wrapper
  // Transition for smooth open/close (can be overridden by touch gestures)
  transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
});

// List element (UL) inside the mobile dropdown
export const mobileNavListStyles = css({
  listStyle: 'none',
  padding: '2',
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
  paddingRight: '2', // Padding on sides
  paddingLeft: '5',
  // Make it programmatically focusable (for autofocus hook) but hide the default outline
  outline: 'none',
  _focusVisible: {
    // Optional: Style focus state for accessibility if needed
    // ring: '2px',
    // ringColor: 'primary',
    // ringOffset: '2px',
  },
});

// Wrapper for the main content sections (left side on desktop)
export const contentWrapperStyles = css({
  flex: '1', // Allow content to take available space
  padding: { base: '4', md: '6' }, // Responsive padding
  order: 1, // Ensure content appears first on mobile (above desktop nav)
  minWidth: 0, // Prevent flexbox overflow issues
});

// Innermost column holding the actual section elements
export const contentColumnStyles = css({
  width: 'full',
  maxWidth: '100%', // Limit width if needed (e.g., '4xl')
  margin: '0 auto', // Center content if max-width is set
});

// --- Desktop Navigation Styles ---
// Wrapper for the desktop sidebar navigation
export const navWrapperStyles = css({
  paddingTop: '5rem',
  display: { base: 'none', md: 'block' }, // Only show on medium screens and up
  width: { md: '64' }, // Fixed width on desktop (using theme spacing token)
  borderColor: 'border',
  bg: 'background',
  order: 2, // Place it after content in the flex row
  position: 'sticky', // Stick to the top of the scrollable container
  top: 0,
  alignSelf: 'flex-start', // Align to the top of the flex container
  maxHeight: '100vh', // Limit height to viewport height
  overflowY: 'auto', // Allow sidebar itself to scroll if content exceeds height
  flexShrink: 0, // Prevent sidebar from shrinking
  zIndex: 20, // Ensure it's above content
});

// Inner container for padding within the desktop nav
export const navScrollContainerStyles = css({
  padding: '4',
  display: 'flex',
  flexDirection: 'column',
  height: '100%', // Allow inner content to potentially fill height
});

// Header text (e.g., "Contents") within the desktop nav
export const navHeaderStyles = css({
  fontSize: 'sm',
  fontWeight: '200',
  mb: '4', // Margin bottom
  color: 'primary', // Use primary color
  textAlign: 'left',
  px: '2', // Horizontal padding
  flexShrink: 0, // Prevent shrinking
});

// Container for the desktop navigation list and the indicator track/line
export const navListContainerStyles = css({
  position: 'relative', // Needed for absolute positioning of indicator lines
  flex: '1', // Allow list to take remaining space
  pl: '5', // Padding left for indentation
  minHeight: 0, // Prevent flexbox overflow
});

// The list (UL) itself in the desktop nav
export const navListStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2', // Space between list items
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
  pl: '3', // Padding left
  pr: '2', // Padding right
  py: '1.5', // Padding top/bottom
  rounded: 'md', // Rounded corners
  fontSize: 'xs', // Extra small font size
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
  left: '2', // Position relative to navListContainerStyles padding
  top: '0',
  width: '2px', // Thin track line
  bg: 'border', // Use border color for the track
  rounded: 'full', // Rounded ends
  transition: 'height 0.3s ease-in-out', // Animate height changes
});

// The active indicator line itself
export const lineIndicatorStyles = css({
  position: 'absolute',
  left: '0', // Align to the very left of the container
  width: '5px', // Wider than the track
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
  fontSize: 'xl', // Font size
  fontWeight: 'semibold', // Font weight
  mb: '4', // Margin bottom
  color: 'primary', // Use primary color
});

// Paragraph (P) within a section
export const sectionParagraphStyles = css({
  mb: '4', // Margin bottom
  lineHeight: 'relaxed', // Relaxed line spacing
  color: 'text', // Default text color
});

// Styles applied to the <section> wrapper itself
export const sectionStyles = css({
  // scrollMarginTop is applied dynamically via inline style based on scrollOffset
  mb: '12', // Margin bottom between sections
  zIndex: -10, // Ensure content is behind sticky elements if needed (adjust as necessary)
  paddingLeft: '2rem', // Indentation for section content
  paddingRight: '5rem', // Right padding
  py: '2', // Vertical padding
  position: 'relative', // For potential absolute positioning within a section
  // Style nested headings within sections
  '& h1, & h2, & h3': {
    fontWeight: 'thin', // Use thin weight (ensure font supports it)
    color: 'primary',
  },
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
  containerClassName,
  headerClassName,
  mainClassName,
  contentColumnClassName,
  navColumnClassName,
  sectionHeadingClassName,
  sectionParagraphClassName,
  enableAutoDetection = true,
  offsetTop = 0, // Default external offset to 0
  useChildrenInsteadOfData = false,
  autoFocusContainerOnMount = false,
}) => {
  // --- Refs ---
  const mainContainerRef = useRef<HTMLDivElement>(null); // Ref for the main scrollable container
  const navListRef = useRef<HTMLUListElement>(null); // Ref for the desktop nav list (UL)

  // --- State & Hooks ---

  // Hook dependencies require careful ordering or useEffect workarounds.
  // 1. Initialize smooth scroll state (needs container ref, base offset) - will lack sticky ref initially
  // 2. Initialize mobile nav state (provides sticky ref, needs click handler)
  // 3. Re-initialize smooth scroll state *with* the sticky ref to get final offset
  // 4. Initialize intersection observer state (needs container ref, sections, final offset)
  // 5. Define click handler (needs setters/functions from intersection and scroll hooks)
  // 6. Use other hooks (autofocus, desktop indicator)

  // Initial call to get scrollToId function. Sticky ref is null initially.
  // We mainly need the scrollToId function reference here.
  const { scrollToId: initialScrollToId } = useSmoothScroll({
    containerRef: mainContainerRef,
    baseOffset: offsetTop,
    stickyElementRef: null,
  });

  // Define the navigation click handler - uses functions from hooks defined later.
  // Use initialScrollToId here; its internal performSmoothScroll depends on the latest offset state.
  // setActiveSection will be defined by useSectionIntersection below.
  const handleNavClick = useCallback(
    (id: string) => {
      if (externalOnNavClick) {
        externalOnNavClick(id);
      }
      // setActiveSection needs to be defined before this is called.
      // We rely on the closure capturing the correct setActiveSection function later.
      // This ordering is tricky, but necessary for hook dependencies.
      if (typeof setActiveSection === 'function') {
        setActiveSection(id);
      }
      initialScrollToId(id);
    },
    [externalOnNavClick, initialScrollToId /* setActiveSection dependency added implicitly later */]
  );

  // Initialize mobile navigation - provides mobileNavProps.ref
  const {
    isMobileNavOpen,
    mobileNavProps, // Contains the ref for the sticky mobile nav wrapper
    triggerProps,
    dropdownProps,
    getItemProps,
  } = useMobileNavigation({
    onNavItemClick: handleNavClick, // Pass the click handler
    sections, // Pass sections data for keyboard navigation
  });

  // Now call useSmoothScroll *again* with the mobileNavRef to get the final offset.
  const { scrollOffset: finalScrollOffset } = useSmoothScroll({
    containerRef: mainContainerRef,
    baseOffset: offsetTop,
    stickyElementRef: mobileNavProps.ref, // Pass the ref from useMobileNavigation
  });

  // Initialize intersection observer state, now using the finalScrollOffset.
  // This provides the actual activeSection state and the final setActiveSection function.
  const [activeSection, setActiveSection] = useSectionIntersection(
    mainContainerRef,
    sections,
    finalScrollOffset, // Use the offset that includes mobile nav height
    externalActiveSection,
    enableAutoDetection
  );

   // Now that setActiveSection is defined, update the dependency array for handleNavClick
   // (This doesn't require re-running useCallback, React handles the closure)
   // Note: This implicit dependency update is a nuance of React hooks.


  // Apply autofocus using the dedicated hook
  useAutofocus({
    targetRef: mainContainerRef,
    shouldFocus: autoFocusContainerOnMount,
  });

  // Get styles for the desktop indicator line
  const { indicatorStyle, trackHeight } = useDesktopIndicator({
    navListRef,
    activeSection,
    sections,
  });

  // State for active desktop navigation index
  const [activeDesktopIndex, setActiveDesktopIndex] = useState(
    sections.findIndex(s => s.id === activeSection) || 0
  );

  // Keep activeDesktopIndex in sync with activeSection
  useEffect(() => {
    const index = sections.findIndex(s => s.id === activeSection);
    if (index !== -1) {
      setActiveDesktopIndex(index);
    }
  }, [activeSection, sections]);

  // Use the keyboard navigation hook for desktop navigation
  const { 
    getItemProps: getDesktopKeyboardProps, 
    containerProps: desktopContainerProps 
  } = useKeyboardNavigation({
    items: sections,
    activeIndex: activeDesktopIndex,
    onNavigate: (newIndex) => {
      setActiveDesktopIndex(newIndex);
      // Trigger navigation action (scroll and set active state)
      const sectionId = sections[newIndex].id;
      handleNavClick(sectionId);
      
      // Focus the corresponding button
      if (navListRef.current) {
        const navButtons = navListRef.current.querySelectorAll<HTMLButtonElement>('button');
        if (navButtons && navButtons[newIndex]) {
          navButtons[newIndex].focus();
        }
      }
    },
    onActivate: (_item, index) => {
      // Also trigger navigation on Enter/Space
      const sectionId = sections[index].id;
      handleNavClick(sectionId);
    }
  });
  
  // Create desktop nav props with correct types
  const desktopNavProps = useMemo(() => {
    return {
      role: desktopContainerProps.role,
      'aria-orientation': desktopContainerProps['aria-orientation'],
      'aria-label': navTitle
    };
  }, [desktopContainerProps, navTitle]);


  // --- Child Rendering Logic ---
  // Memoize the rendered section elements to avoid unnecessary re-renders
  const renderedSections = useMemo(() => {
    // Option 1: Render children directly if prop is set and children exist
    if (useChildrenInsteadOfData && React.Children.count(children) > 0) {
      const childrenArray = React.Children.toArray(children);

      return childrenArray.map((child, index) => {
        const section = sections[index]; // Get corresponding section data for ID/header
        // Ensure child is a valid React element and section data exists
        if (!section || !React.isValidElement(child)) {
          console.warn(
            '[ScrollingContentWithNav] Child at index', index,
            'is not a valid React element or missing corresponding section data.'
          );
          return child; // Render invalid child as-is or null?
        }

        // Type assertion to safely access props
        const childProps = child.props as {
          className?: string;
          style?: React.CSSProperties;
          children?: ReactNode;
          [key: string]: any; // Allow other props
        };

        const existingClassName = childProps.className || '';
        const existingStyle = childProps.style || {};
        const existingChildren = childProps.children;

        // Combine base section styles with any existing class names
        const combinedClassName = cx(sectionStyles, existingClassName);

        // Apply dynamic scroll-margin-top using the final calculated offset
        const sectionInlineStyles = {
          scrollMarginTop: `${finalScrollOffset}px`,
        };

        // Props to pass to the cloned element
        const clonedElementProps: ClonedElementProps = {
          'data-section-id': section.id, // Add data attribute for observer/scrolling
          id: section.id, // Add ID for direct targeting
          className: combinedClassName,
          style: { ...existingStyle, ...sectionInlineStyles }, // Merge styles
          key: section.id, // Use section ID as key
          children: ( // Render optional header *before* original children
            <>
              {section.headerElement && (
                <SectionHeader headerElement={section.headerElement} />
              )}
              {existingChildren}
            </>
          ),
        };

        // Clone the original child element with the new props
        return React.cloneElement(child, clonedElementProps);
      });
    }

    // Option 2: Generate sections from the `sections` data array
    return sections.map((section) => {
      // Apply dynamic scroll-margin-top
      const sectionInlineStyles = {
        scrollMarginTop: `${finalScrollOffset}px`,
      };

      // Render each section using the <section> tag
      return (
        <section
          data-section-id={section.id} // Data attribute for observer/scrolling
          id={section.id} // ID for direct targeting
          className={sectionStyles} // Apply base section styles
          style={sectionInlineStyles} // Apply dynamic margin
          key={section.id} // Use ID as key
        >
          {/* Render optional header element */}
          {section.headerElement && (
            <SectionHeader headerElement={section.headerElement} />
          )}

          {/* Render custom component OR default content */}
          {section.customComponent ? (
            section.customComponent // Render custom component if provided
          ) : (
            // Render default content structure (heading + paragraphs)
            <>
              <h2 className={cx(sectionHeadingStyles, sectionHeadingClassName)}>
                {/* Use sectionTitle or fallback to title */}
                {section.sectionTitle || section.title}
              </h2>
              {/* Map over content paragraphs */}
              {section.content?.map((paragraph, idx) => (
                <p
                  key={`${section.id}-p-${idx}`} // Unique key for paragraph
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
        </section>
      );
    });
  }, [
    // Dependencies for memoization
    sections,
    children,
    finalScrollOffset, // Use the final offset value
    useChildrenInsteadOfData,
    sectionHeadingClassName,
    sectionParagraphClassName,
    // cx, sectionStyles // cx and styles likely stable, but include if they could change
  ]);

  // --- JSX Output ---
  return (
    // Outermost container
    <div className={cx(containerStyles, containerClassName)}>

      {/* Main Scrollable Container */}
      <div
        ref={mainContainerRef} // Attach ref for scrolling and focus
        className={cx(mainContainerStyles, mainClassName)}
        tabIndex={-1} // Make programmatically focusable but not via tab key
      >
        {/* Mobile Navigation (Sticky inside scroll container) */}
        {/* Spread props from useMobileNavigation onto the wrapper */}
        <div {...mobileNavProps} className={mobileNavWrapperStyles}>
          {/* Spread props onto the trigger button */}
          <button {...triggerProps} className={mobileNavTriggerStyles}>
            <span>{navTitle}</span>
            {/* Indicate open/closed state */}
            <span>{isMobileNavOpen ? '(-) Collapse' : '(+) Expand'}</span>
          </button>
          {/* Conditionally render the dropdown */}
          {isMobileNavOpen && (
            // Spread props onto the dropdown container
            <div
              {...dropdownProps}
              className={mobileNavDropdownStyles}
              aria-label={navTitle} // Accessibility label
            >
              {/* Hint for touch interaction */}
              <div
                className={css({
                  padding: '2',
                  textAlign: 'center',
                  fontSize: 'xs',
                  color: 'textMuted',
                })}
              >
                Swipe up to dismiss
              </div>
              {/* Render the list of mobile nav items */}
              <ul className={mobileNavListStyles}>
                {sections.map((section, index) => {
                  const isActive = activeSection === section.id;
                  // Get props for the item button from the hook (excluding key)
                  const itemProps = getItemProps(section.id, index);
                  return (
                    <li key={`mobile-${section.id}`} role="none"> {/* Apply key to li instead */}
                      {/* Spread item props onto the button, key is on parent li */}
                      <button
                        {...itemProps}
                        className={cx( // Combine base, active/inactive styles
                          navButtonBaseStyles,
                          isActive
                            ? navButtonActiveStyles
                            : navButtonInactiveStyles
                        )}
                        aria-current={isActive ? 'location' : undefined} // Indicate active item
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
        <div className={cx(contentWrapperStyles)}>
          {/* Optional Header Bar */}
          {(headerContent || headerTitle) && (
            <div className={cx(headerStyles, headerClassName)}>
              {headerContent ? ( // Render custom header content if provided
                headerContent
              ) : ( // Otherwise, render default header structure
                <div className={headerContentContainerStyles}>
                  <h1 className={headerTitleStyles}>
                    {/* Use headerTitle or fallback to navTitle */}
                    {headerTitle || navTitle}
                  </h1>
                  {/* Render optional right-side content */}
                  {headerRightContent && (
                    <div className="header-right-content">
                      {headerRightContent}
                    </div>
                  )}
                </div>
              )}
            </div>
          )} {/* End Optional Header Bar */}

          {/* Inner Content Column */}
          <div
            className={cx(contentColumnStyles, contentColumnClassName)}
          >
            {/* Render the memoized section elements */}
            {renderedSections}
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
                style={{ height: `${trackHeight}px` }} // Set height dynamically
                aria-hidden="true"
              ></div>
              {/* Active Indicator Line */}
              <div
                className={lineIndicatorStyles}
                style={{ // Set position, height, opacity dynamically
                  transform: `translateY(${indicatorStyle.top}px)`,
                  height: `${indicatorStyle.height}px`,
                  opacity: indicatorStyle.opacity,
                }}
                aria-hidden="true"
              ></div>
              {/* Desktop Navigation List */}
              <ul
                ref={navListRef} // Attach ref for indicator calculations and keyboard nav
                className={navListStyles}
                {...desktopNavProps} // Apply containerProps from useKeyboardNavigation
                aria-label={navTitle} // Accessibility label
              >
                {sections.map((section, index) => {
                  const isActive = activeSection === section.id;
                  return (
                    <li
                      key={section.id}
                      data-section-id={section.id} // Data attribute for indicator hook
                      role="none" // LI has role none
                    >
                      <button
                        onClick={() => handleNavClick(section.id)} // Use common click handler
                        className={cx( // Combine base, active/inactive styles
                          navButtonBaseStyles,
                          isActive
                            ? navButtonActiveStyles
                            : navButtonInactiveStyles
                        )}
                        {...getDesktopKeyboardProps(index)} // Apply props from useKeyboardNavigation
                      >
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

export default ScrollingContentWithNav;

/**
 * COMPONENT OPTIMIZATION NOTES:
 * * 1. Color System Standardization: Assumes PandaCSS theme provides semantic color tokens (primary, text, background, etc.).
 * * 2. Style Reusability: Common button styles extracted; uses PandaCSS `css` function for atomic classes.
 * * 3. Component Structure: Logic separated into custom hooks; component focuses on layout and wiring.
 * * 4. Reduced Duplication: Hooks prevent repetition of scroll, offset, observer, indicator, autofocus logic.
 * * 5. Autofocus Capability: Handled cleanly by `useAutofocus` hook.
 * * 6. TypeScript Fixes: Addressed potential issues with cloning children and data attributes.
 * * 7. Refactoring Fixes: Ensured correct handlers (`handleNavClick`) are used after hook extraction; removed redundant `useEffect`.
 * * 8. Hook Dependencies: Managed inter-hook dependencies with careful ordering and hook calls.
 * * 9. Type Error Fix (TS2345): Removed redundant useEffect block that caused the type error by potentially passing null to setActiveSection. Relies on useSectionIntersection's internal handling of scrollOffset changes.
 */