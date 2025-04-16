/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
'use client';

/**
 * ScrollingContentWithNav Component
 * A responsive component that provides section-based content with automatic navigation.
 * Features include:
 * - Sticky side navigation (desktop) and collapsible top navigation (mobile)
 * - Automatic section detection using Intersection Observer
 * - Smooth scrolling between sections
 * - Support for custom section headers
 * - Flexible content rendering through props or data (including render props for scroll awareness)
 * - Optional autofocus on the main scrollable container on mount for keyboard scrolling.
 * Color theme uses 5 standardized colors:
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
  RefObject,
} from 'react';

// Next.js App Router imports
import { useRouter, usePathname } from 'next/navigation';

// Adjust the import path based on your project structure and PandaCSS output directory
import { css, cx } from '../../../../styled-system/css';

/**
 * Hook to track window size for responsive behavior
 * @returns Object with current window width and height
 */
export function useWindowSize() {
  // Set initial size to 0,0 to avoid hydration mismatches
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // This runs only on client-side after hydration
    const handleResize = throttle(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 100);

    // Set initial size
    handleResize();
    
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

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
  delay: number = 250
): boolean {
  const [isScrollingByUser, setIsScrollingByUser] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    const handleScroll = () => {
      setIsScrollingByUser(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setIsScrollingByUser(false);
        timeoutRef.current = null;
      }, delay);
    };

    element.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup function
    return () => {
      element.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [targetRef, delay]);

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
  const touchStartRef = useRef<{x: number, y: number} | null>(null);
  const touchMoveRef = useRef<{x: number, y: number} | null>(null);
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

    const distanceX = startX - currentX;
    const distanceY = startY - currentY;
    const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY);

    // Apply visual feedback based on direction
    if (isHorizontal) {
      if (distanceX > 0) { // Swiping left
        const translateX = Math.min(distanceX * dampening, maxTranslation);
        setStyle({
          transform: `translateX(-${translateX}px)`,
          opacity: 1 - translateX / opacityFactor,
          transition: 'none',
        });
      } else { // Swiping right
        const translateX = Math.min(-distanceX * dampening, maxTranslation);
        setStyle({
          transform: `translateX(${translateX}px)`,
          opacity: 1 - translateX / opacityFactor,
          transition: 'none',
        });
      }
    } else {
      if (distanceY > 0) { // Swiping up
        const translateY = Math.min(distanceY * dampening, maxTranslation);
        setStyle({
          transform: `translateY(-${translateY}px)`,
          opacity: 1 - translateY / opacityFactor,
          transition: 'none',
        });
      } else { // Swiping down
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
    role: "menuitem" | "option";
    'aria-current'?: "page" | "location" | "true";
  };
  containerProps: {
    role: "menubar" | "listbox";
    'aria-orientation': "horizontal" | "vertical";
  };
} {
  const [typeAheadString, setTypeAheadString] = useState<string>('');
  const typeAheadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleKeyDown = useCallback((event: React.KeyboardEvent, currentIndex: number) => {
    if (!items || items.length === 0) return;

    let nextIndex = currentIndex;
    let handled = false;

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
          return; // Exit early
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
        // Type-ahead functionality
        if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
          if (typeAheadTimeoutRef.current) {
            clearTimeout(typeAheadTimeoutRef.current);
          }
          const newTypeAheadString = typeAheadString + event.key.toLowerCase();
          setTypeAheadString(newTypeAheadString);

          const startSearchIndex = (currentIndex + 1) % items.length;
          for (let i = 0; i < items.length; i++) {
            const idx = (startSearchIndex + i) % items.length;
            const item = items[idx];
            const itemText = (item as any).title || (item as any).label || String(item);

            if (itemText.toLowerCase().startsWith(newTypeAheadString)) {
              nextIndex = idx;
              handled = true;
              break;
            }
          }

          typeAheadTimeoutRef.current = setTimeout(() => {
            setTypeAheadString('');
            typeAheadTimeoutRef.current = null;
          }, typeAheadTimeout);
        }
    }

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
      tabIndex: isCurrent ? 0 : -1,
      role: isHorizontal ? "menuitem" as const : "option" as const,
      'aria-current': isCurrent ? "location" as const : undefined
    };
  }, [activeIndex, handleKeyDown, isHorizontal]);

  const containerProps = useMemo(() => ({
    role: isHorizontal ? "menubar" as const : "listbox" as const,
    'aria-orientation': isHorizontal ? "horizontal" as const : "vertical" as const
  }), [isHorizontal]);

  useEffect(() => { // Clean up type-ahead timeout
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
  scrollDuration = 300,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  baseOffset?: number;
  stickyElementRef?: React.RefObject<HTMLDivElement | null> | null;
  scrollDuration?: number;
}): {
  scrollOffset: number;
  scrollToId: (id: string) => void;
  isScrollingProgrammatically: boolean;
} {
  const [scrollOffset, setScrollOffset] = useState<number>(baseOffset);
  const [isScrollingProgrammatically, setIsScrollingProgrammatically] = useState<boolean>(false);

  const calculateAndSetScrollOffset = useCallback(() => {
    let internalStickyHeight = 0;
    if (stickyElementRef && stickyElementRef.current) {
      const computedStyle = window.getComputedStyle(stickyElementRef.current);
      if (computedStyle.display !== 'none') {
        internalStickyHeight = stickyElementRef.current.offsetHeight;
      }
    }
    const buffer = 10; // Safety margin
    setScrollOffset(baseOffset + internalStickyHeight + buffer);
  }, [baseOffset, stickyElementRef]);

  useEffect(() => { // Calculate offset on mount and resize
    calculateAndSetScrollOffset();
    const throttledResizeHandler = throttle(calculateAndSetScrollOffset, 100, true, true);
    window.addEventListener('resize', throttledResizeHandler);
    return () => window.removeEventListener('resize', throttledResizeHandler);
  }, [calculateAndSetScrollOffset]);

  const performSmoothScroll = useCallback(
    (element: HTMLElement) => {
      if (!containerRef || !containerRef.current) return;

      setIsScrollingProgrammatically(true);
      const container = containerRef.current;
      const originalScrollBehavior = container.style.scrollBehavior;
      container.style.scrollBehavior = 'auto';
      container.setAttribute('data-scrolling-programmatically', 'true');

      let targetPosition = element.offsetTop - scrollOffset;
      targetPosition = Math.max(0, targetPosition);

      const startPosition = container.scrollTop;
      const distance = targetPosition - startPosition;
      let startTime: number | null = null;

      const easeOutQuint = (t: number): number => 1 - Math.pow(1 - t, 5);

      const scrollAnimation = (currentTime: number) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / scrollDuration, 1);
        const easedProgress = easeOutQuint(progress);

        if (container) {
          container.scrollTop = startPosition + distance * easedProgress;
        }

        if (timeElapsed < scrollDuration) {
          requestAnimationFrame(scrollAnimation);
        } else {
          if (container) {
            container.scrollTop = targetPosition; // Ensure final position
            setTimeout(() => { // Cleanup after animation
              container.removeAttribute('data-scrolling-programmatically');
              container.style.scrollBehavior = originalScrollBehavior;
              setIsScrollingProgrammatically(false);
            }, 100);
          } else {
              setIsScrollingProgrammatically(false); // Reset state if container disappears
          }
        }
      };
      requestAnimationFrame(scrollAnimation);
    },
    [containerRef, scrollOffset, scrollDuration]
  );

  const scrollToId = useCallback(
    (id: string) => {
      if (!containerRef || !containerRef.current) return;
      const targetElement = containerRef.current.querySelector<HTMLElement>(
        `#${CSS.escape(id)}, [data-section-id="${CSS.escape(id)}"]`
      );
      if (targetElement) {
        performSmoothScroll(targetElement);
      }
    },
    [containerRef, performSmoothScroll]
  );

  return { scrollOffset, scrollToId, isScrollingProgrammatically };
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
  delay = 500,
  isMounted = false,
}: {
  targetRef: React.RefObject<HTMLElement | null>;
  shouldFocus: boolean;
  delay?: number;
  isMounted?: boolean; // Flag indicating component is mounted client-side
}): void {
  useEffect(() => {
    // Only run on client-side after mount
    if (!isMounted) return;
    
    if (shouldFocus && targetRef && targetRef.current) {
      const targetElement = targetRef.current;
      const timerId = setTimeout(() => {
        if (targetElement) {
          targetElement.focus({ preventScroll: true });
        }
      }, delay);

      // Cleanup timer
      return () => {
        clearTimeout(timerId);
      };
    }
  }, [targetRef, shouldFocus, delay, isMounted]);
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
  isMounted = false,
}: {
  onNavItemClick: (id: string) => void;
  sections: Section[];
  isMounted?: boolean; // Flag indicating component is mounted client-side
}): {
  isMobileNavOpen: boolean;
  toggleMobileNav: () => void;
  mobileNavProps: {
    ref: React.RefObject<HTMLDivElement | null>;
  };
  triggerProps: {
    ref: React.RefObject<HTMLButtonElement | null>;
    onClick: () => void;
    'aria-expanded': boolean;
    'aria-controls': string;
    'aria-haspopup': 'menu';
  };
  dropdownProps: {
    id: string;
    style: React.CSSProperties;
    role: 'menu';
    'aria-orientation': 'vertical';
    onTouchStart: (e: React.TouchEvent<HTMLElement>) => void;
    onTouchMove: (e: React.TouchEvent<HTMLElement>) => void;
    onTouchEnd: () => void;
  };
  getItemProps: (
    id: string,
    index: number
  ) => {
    onClick: () => void;
    role: 'menuitem';
    tabIndex: number;
    onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  };
} {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const mobileNavToggleRef = useRef<HTMLButtonElement>(null);
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  const { touchProps, style: touchStyle, resetStyle } = useTouchGestures({
    onSwipeUp: () => {
      setTimeout(() => setIsMobileNavOpen(false), 50); // Close nav on swipe up
    },
    threshold: 50, dampening: 0.5, maxTranslation: 100,
    opacityFactor: 150, returnTransitionDuration: 300
  });

  const toggleMobileNav = useCallback(() => {
    setIsMobileNavOpen((prev) => !prev);
    resetStyle();
  }, [resetStyle]);

  const handleMobileNavItemClick = useCallback(
    (id: string) => {
      onNavItemClick(id);
      setIsMobileNavOpen(false);
      resetStyle();
    },
    [onNavItemClick, resetStyle]
  );

  useEffect(() => { // Manage focus on open/close
    if (isMobileNavOpen) {
      setTimeout(() => { // Focus active item when opened
        const mobileNavButtons = document.querySelectorAll<HTMLButtonElement>(
          '#mobile-nav-list button'
        );
        mobileNavButtons[activeItemIndex]?.focus();
      }, 50);
    } else if (document.activeElement instanceof HTMLButtonElement &&
               document.activeElement.closest('#mobile-nav-list')) {
      // Return focus to toggle button when closed
      mobileNavToggleRef.current?.focus();
    }
  }, [isMobileNavOpen, activeItemIndex]);

  const { getItemProps: getKeyboardProps } = useKeyboardNavigation({
    items: sections,
    activeIndex: activeItemIndex,
    onNavigate: setActiveItemIndex,
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

  const getItemProps = useCallback(
    (id: string, index: number) => {
      const keyboardProps = getKeyboardProps(index);
      return {
        onClick: () => handleMobileNavItemClick(id),
        role: 'menuitem' as const,
        tabIndex: keyboardProps.tabIndex,
        onKeyDown: keyboardProps.onKeyDown as (e: React.KeyboardEvent<HTMLButtonElement>) => void
      };
    },
    [handleMobileNavItemClick, getKeyboardProps]
  );

  const dropdownProps = useMemo(() => {
    return {
      id: 'mobile-nav-list',
      style: touchStyle,
      role: 'menu' as const,
      'aria-orientation': 'vertical' as const,
      ...touchProps
    };
  }, [touchStyle, touchProps]);

  return {
    isMobileNavOpen,
    toggleMobileNav,
    mobileNavProps: { ref: mobileNavRef },
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
  sections,
  isMounted = false,
}: {
  navListRef: React.RefObject<HTMLUListElement | null>;
  activeSection: string | null;
  sections: Section[];
  isMounted?: boolean; // Flag indicating component is mounted client-side
}): {
  indicatorStyle: { top: number; height: number; opacity: number };
  trackHeight: number;
} {
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0, opacity: 0 });
  const [trackHeight, setTrackHeight] = useState(0);

  useEffect(() => { // Calculate indicator styles
    // Only run on client-side after mount
    if (!isMounted) return;
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

    const listItems = Array.from(navListElement.children) as HTMLLIElement[];
    const firstListItem = listItems[0];

    // Calculate track height
    if (listItems.length > 0) {
      const lastListItem = listItems[listItems.length - 1];
      if (firstListItem && lastListItem) {
        calculatedTrackHeight = lastListItem.offsetTop + lastListItem.offsetHeight - firstListItem.offsetTop;
        calculatedTrackHeight = Math.max(calculatedTrackHeight, firstListItem.offsetHeight);
      }
    }
    setTrackHeight(calculatedTrackHeight);

    // Calculate active indicator position
    if (activeSection && firstListItem) {
      const activeListItem = navListElement.querySelector<HTMLLIElement>(
        `li[data-section-id="${CSS.escape(activeSection)}"]`
      );
      if (activeListItem) {
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
  }, [activeSection, sections, navListRef]);

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
    lastArgs = args; // Store latest args

    if (elapsed >= limit) { // Execute immediately if limit passed
      if (timer) { clearTimeout(timer); timer = null; }
      if (leading || elapsed > limit) {
        fn(...args);
        lastTime = now;
        lastArgs = null;
      }
    } else if (trailing && !timer) { // Setup trailing execution
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

  return useCallback((...args: Parameters<T>) => {
    if (timerRef.current) { clearTimeout(timerRef.current); }
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
/**
 * Custom hook for scroll spying, section detection, and URL hash synchronization
 * specifically designed to work with Next.js App Router
 */
export function useScrollSpy({
  containerRef,
  sectionIds,
  offsetTop = 0,         // Default offset to 0
  enableHashSync = true, // Default to enabling hash sync
  scrollToOnLoad = true, // Default to scrolling on load
  externalActiveSection = null, // External control for active section
  isMounted = false,     // Flag indicating component is mounted on client
}: {
  containerRef: React.RefObject<HTMLElement | null>; // Updated type to accept null
  sectionIds: string[];                     // Array of all section IDs to observe
  offsetTop?: number;                       // Offset for sticky elements (e.g., nav height)
  enableHashSync?: boolean;                 // Flag to enable/disable URL hash updates
  scrollToOnLoad?: boolean;                 // Flag to scroll to hash on initial load
  externalActiveSection?: string | null;    // Optional externally controlled active section
  isMounted?: boolean;                     // Flag indicating if component is mounted client-side
}): string | null { // Returns the active section ID or null

  const router = useRouter(); // Get router instance from next/navigation
  const pathname = usePathname(); // Get current pathname
  const [internalActiveSection, setInternalActiveSection] = useState<string | null>(
    externalActiveSection || (sectionIds.length > 0 ? sectionIds[0] : null)
  );
  const observerRef = useRef<IntersectionObserver | null>(null); // Ref to store the observer instance
  const initialScrollDoneRef = useRef<boolean>(false); // Ref to track if initial scroll has happened
  
  // Debounce state updates to prevent rapid changes during scroll
  const debouncedSetActiveSection = useDebounce(setInternalActiveSection, 150);
  
  // Determine the active section (external control takes precedence)
  const activeSection = externalActiveSection ?? internalActiveSection;

  // --- Internal Scroll Function (for initial load ONLY) ---
  const scrollToIdOnLoad = useCallback((id: string) => {
    // Only run on client side
    if (!isMounted) return;
    
    const container = containerRef.current;
    if (!container) return;

    // Find the target element using ID or data-attribute
    const target = container.querySelector<HTMLElement>(
      `#${CSS.escape(id)}, [data-section-id="${CSS.escape(id)}"]`
    );
    if (!target) return;

    console.log(`[useScrollSpy] Initial scroll triggered for: #${id}`);
    const top = target.offsetTop - offsetTop; // Calculate position including offset
    container.scrollTo({ top, behavior: 'auto' }); // Use 'auto' for instant jump on load

    // Immediately set the active section state AFTER the initial scroll/jump
    if (externalActiveSection === null) {
      setInternalActiveSection(id);
    }
  }, [containerRef, offsetTop, isMounted, externalActiveSection]);

  // --- Effect 1: Scroll to Hash on Initial Load ---
  useEffect(() => {
    // Only run on client side after mounted
    if (!isMounted || !scrollToOnLoad || initialScrollDoneRef.current || externalActiveSection !== null) {
      return;
    }

    // Get hash from window.location instead of router
    const hash = window.location.hash.substring(1);

    if (hash && sectionIds.includes(hash)) {
      // Use setTimeout to ensure the layout is stable before scrolling
      const timerId = setTimeout(() => {
        scrollToIdOnLoad(hash);
        initialScrollDoneRef.current = true; // Mark initial scroll as done
      }, 150);

      return () => clearTimeout(timerId); // Cleanup timeout
    } else {
      // If no valid hash, mark initial scroll as done anyway
      initialScrollDoneRef.current = true;
    }
  }, [scrollToOnLoad, sectionIds, scrollToIdOnLoad, isMounted, externalActiveSection]);

  // --- Effect 2: Setup IntersectionObserver ---
  useEffect(() => {
    // Only run on client side and if auto-detection is enabled
    if (!isMounted || externalActiveSection !== null) return;
    
    const container = containerRef.current;
    // Ensure container exists and we have section IDs to observe
    if (!container || sectionIds.length === 0) {
      return;
    }

    // Disconnect any previous observer instance before creating a new one
    observerRef.current?.disconnect();

    const BUFFER_ZONE = 50; // Pixels above the offset line to consider "active"

    // Create the IntersectionObserver instance
    const observer = new IntersectionObserver(
      (entries) => {
        // Ignore observer if scrolling programmatically
        if (containerRef.current?.hasAttribute('data-scrolling-programmatically')) {
          console.log('[useScrollSpy] Observer ignored: Programmatic scroll detected.');
          return;
        }

        // Sort entries: prioritize those intersecting below or near the offset line,
        // then sort by proximity to the offset line.
        const sortedEntries = [...entries]; // Mutable copy
        sortedEntries.sort((a, b) => {
          const aTopDist = a.boundingClientRect.top - offsetTop;
          const bTopDist = b.boundingClientRect.top - offsetTop;
          const aIsInZone = aTopDist >= -BUFFER_ZONE;
          const bIsInZone = bTopDist >= -BUFFER_ZONE;

          if (aIsInZone && !bIsInZone) return -1; // a preferred
          if (!aIsInZone && bIsInZone) return 1;  // b preferred
          if (!aIsInZone && !bIsInZone) return aTopDist - bTopDist; // Both above, closer to top wins

          // Both in zone, sort by absolute distance to offset line
          return Math.abs(aTopDist) - Math.abs(bTopDist);
        });

        // Find the first valid candidate in the sorted list
        for (const entry of sortedEntries) {
          const topDist = entry.boundingClientRect.top - offsetTop;
          if (entry.isIntersecting && topDist >= -BUFFER_ZONE) {
            const newId = entry.target.getAttribute('data-section-id');
            // Update state if a new, valid section is found and not externally controlled
            if (newId && newId !== internalActiveSection) {
              debouncedSetActiveSection(newId);
              return; // Found best candidate, exit
            }
            // If the best candidate is already active, no need to update, exit
            if (newId && newId === internalActiveSection) {
              return;
            }
          }
        }
        // If no suitable intersecting entry found below the buffer zone, keep the last active section.
      },
      {
        root: container,
        rootMargin: `-${offsetTop}px 0px -40% 0px`,
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0],
      }
    );

    // Observe each section element
    sectionIds.forEach((id) => {
      const el = container.querySelector<HTMLElement>(
        `#${CSS.escape(id)}, [data-section-id="${CSS.escape(id)}"]`
      );
      if (el) {
        // Ensure the element has the data-section-id attribute for the observer callback
        el.setAttribute('data-section-id', id);
        observer.observe(el);
      } else {
        console.warn(`[useScrollSpy] Could not find element for section ID: ${id}`);
      }
    });

    // Store the observer instance
    observerRef.current = observer;

    // Cleanup function
    return () => {
      console.log('[useScrollSpy] Disconnecting observer.');
      observer.disconnect();
    };
  }, [sectionIds, containerRef, offsetTop, internalActiveSection, isMounted, externalActiveSection, debouncedSetActiveSection]);

  // --- Effect 3: Sync URL Hash with Active Section ---
  useEffect(() => {
    // Only run on client side when mounted
    if (!isMounted) return;
    
    // Only run if hash sync is enabled and we have a valid active section
    if (!enableHashSync || !activeSection || !initialScrollDoneRef.current) {
      return;
    }

    // Get current hash directly from window.location
    const currentHash = window.location.hash.substring(1);

    // Update URL only if the active section ID is different from the current hash
    if (currentHash !== activeSection) {
      console.log(`[useScrollSpy] Syncing hash: #${activeSection}`);
      
      // Use the new router.replace from next/navigation
      router.replace(`${pathname}#${activeSection}`, { scroll: false });
    }
  }, [activeSection, enableHashSync, router, pathname, isMounted, initialScrollDoneRef]);

  return activeSection;
}

// --- Hook: useDesktopNavigation ---
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
  isMounted = false,
}: {
  navListRef: React.RefObject<HTMLUListElement | null>;
  sections: Section[];
  activeSection: string | null;
  onNavClick: (id: string) => void;
  navTitle: string;
  isMounted?: boolean; // Flag indicating component is mounted client-side
}) {
  const [activeDesktopIndex, setActiveDesktopIndex] = useState(
    sections.findIndex(s => s.id === activeSection) || 0 // Initialize based on activeSection
  );

  // Sync internal index with external activeSection changes
  useEffect(() => {
    const index = sections.findIndex(s => s.id === activeSection);
    if (index !== -1 && index !== activeDesktopIndex) {
      setActiveDesktopIndex(index);
    }
  }, [activeSection, sections, activeDesktopIndex]);

  // Keyboard navigation setup
  const { getItemProps: getDesktopKeyboardProps, containerProps: desktopContainerProps } = useKeyboardNavigation({
    items: sections,
    activeIndex: activeDesktopIndex,
    isHorizontal: false, // Vertical navigation
    onNavigate: (newIndex) => { // Handle keyboard navigation
      setActiveDesktopIndex(newIndex);
      const sectionId = sections[newIndex]?.id;
      if (sectionId) { onNavClick(sectionId); }
      // Focus the newly navigated button
      setTimeout(() => {
          navListRef.current?.querySelectorAll<HTMLButtonElement>('button')[newIndex]?.focus();
      }, 0);
    },
    onActivate: (_item, index) => { // Handle activation (Enter/Space)
      const sectionId = sections[index]?.id;
      if (sectionId) { onNavClick(sectionId); }
    }
  });

  // Active indicator setup
  const { indicatorStyle, trackHeight } = useDesktopIndicator({ 
    navListRef, 
    activeSection, 
    sections,
    isMounted // Pass isMounted flag for client-side rendering
  });

  // Memoized container props for the desktop nav list
  const desktopNavProps = useMemo(() => ({
    role: desktopContainerProps.role,
    'aria-orientation': desktopContainerProps['aria-orientation'],
    'aria-label': navTitle
  }), [desktopContainerProps, navTitle]);

  // Props getter for individual desktop nav items
  const getDesktopItemProps = useCallback(
    (section: Section, index: number) => {
      const keyboardProps = getDesktopKeyboardProps(index);
      const isActive = activeSection === section.id;
      return {
        ...keyboardProps,
        onClick: () => onNavClick(section.id),
        className: cx( navButtonBaseStyles, isActive ? navButtonActiveStyles : navButtonInactiveStyles ),
        'aria-current': isActive ? 'location' as const : undefined,
        'data-section-id': section.id, // For indicator lookup
      };
    },
    [getDesktopKeyboardProps, activeSection, onNavClick]
  );

  return { desktopNavProps, getDesktopItemProps, indicatorStyle, trackHeight };
}


// --- TypeScript Interfaces ---

/**
 * Represents a content section within the ScrollingContentWithNav component
 */
export interface Section {
  id: string; // Unique identifier for the section
  title: string; // Short title for navigation links
  svgIcon?: React.ReactNode; // Optional SVG icon
  headerElement?: { // Optional structured header
    type: 'image' | 'card' | 'code' | 'text';
    content?: string[]; // Text content (for card, text)
    src?: string; // Image source (for image)
    code?: string; // Code content (for code)
    bgColor?: string; // Optional background color
  };
  customComponentAbove?: (props: { isScrolling: boolean }) => React.ReactNode; // Render prop
  sectionTitle?: string; // Optional longer title displayed in content
  content?: string[]; // Array of paragraphs for simple text content
  customComponent?: (props: { isScrolling: boolean }) => React.ReactNode; // Render prop
}

/**
 * Props for the main ScrollingContentWithNav component
 */
export interface ScrollingContentWithNavProps {
  sections: Section[];
  children?: ReactNode; // Optional: Render children directly
  activeSection?: string | null; // Optional: Externally control active section
  onNavClick?: (id: string) => void; // Optional: Callback for nav clicks
  navTitle?: string; // Title for navigation areas (default: 'Contents')

  // Header options
  headerTitle?: string;
  headerRightContent?: ReactNode;
  headerContent?: ReactNode; // Overrides title/right content
  headerDescription?: ReactNode; // Description below header

  // Footer options
  footerTitle?: string;
  footerContent?: ReactNode;

  // Optional class names for styling customization
  containerClassName?: string;
  headerClassName?: string;
  headerDescriptionClassName?: string;
  mainClassName?: string;
  contentColumnClassName?: string;
  navColumnClassName?: string;
  sectionHeadingClassName?: string;
  sectionParagraphClassName?: string;
  svgIconWrapperClassName?: string;
  customComponentAboveWrapperClassName?: string;
  customComponentWrapperClassName?: string;
  footerClassName?: string;
  footerTitleClassName?: string;

  // Behavior control props
  enableAutoDetection?: boolean; // Default: true
  offsetTop?: number; // External offset (default: 0)
  useChildrenInsteadOfData?: boolean; // Default: false
  autoFocusContainerOnMount?: boolean; // Default: false

  // Responsive design props
  maxContentWidth?: string; // Optional max-width override
  responsivePadding?: boolean; // Enable/disable responsive padding (default: true)
}

// --- PandaCSS Style Definitions ---
// Assumes a theme with tokens: 'text', 'background', 'primary', 'border', 'glow', 'textMuted', etc.

export const containerStyles = css({
  position: 'relative',
  width: 'full',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  color: 'text',
  fontFamily: 'body',
  overflow: 'hidden',
  maxWidth: {
    base: '100%',
    xl: '90rem',
    '2xl': '110rem',
    '3xl': '120rem'
  },
  margin: '0 auto',
});

export const headerStyles = css({
  background: 'background',
  width: '100%',
  flexShrink: 0,
  display: 'block',
  paddingBottom: {
    base: '1.2',
    md: '1.4',
    xl: '1.6'
  },
  paddingLeft: {
    base: '2',
    md: '3',
    xl: '6',
    '2xl': '12'
  },
  paddingRight: {
    base: '2',
    md: '3',
    xl: '4'
  },
  borderBottom: '1px solid',
  borderColor: 'border',
});

export const headerContentContainerStyles = css({
  paddingTop: {
    base: '4rem',
    md: '6rem',
    lg: '8rem',
    xl: '8rem',
    '2xl': '10rem',
    '3xl': '10rem'
  },
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'left',
  width: 'full',
});

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

export const footerStyles = css({
  width: 'full',
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
  padding: {
    base: '4',
    md: '5',
    lg: '6'
  },
  paddingBottom: {
    base: '15rem',
    md: '20rem',
    lg: '25rem'
  }
});

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

export const headerTitleStyles = css({
  fontSize: {
    base: 'md',
    lg: 'lg',
    xl: '2xl',
    '2xl': '4xl'
  },
  fontWeight: '200',
  textAlign: 'left',
  background: 'background',
  paddingLeft: {
    base: '3',
    md: '4',
    lg: '5',
    xl: '5',
    '2xl': '6',
    '3xl': '8'
  },
});

// --- Mobile Navigation Styles ---
export const mobileNavWrapperStyles = css({
  display: { base: 'block', md: 'none' },
  position: 'sticky',
  top: '0',
  bg: 'background',
  borderColor: 'border',
  flexShrink: 0,
  isolation: 'isolate',
  zIndex: 3,
  borderBottom: '1px solid',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
});

export const mobileNavTriggerStyles = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: 'full',
  p: { 
    base: '2', 
    sm: '3' 
  },
  fontSize: { 
    base: 'mobileSubmenuItem', 
    sm: 'mobileNavItem' 
  },
  fontWeight: '200',
  color: 'text',
  cursor: 'pointer',
  border: 'none',
  bg: 'transparent',
  _hover: { bgColor: 'glow' },
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
  maxH: { 
    base: 'calc(50vh - 40px)', 
    sm: 'calc(50vh - 60px)' 
  },
  overflowY: 'hidden',
  zIndex: 19,
  transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
});

export const mobileNavListStyles = css({
  listStyle: 'none',
  padding: { 
    base: '1', 
    sm: '2' 
  },
  margin: 0,
});

// --- Main Content Area Styles ---
export const mainContainerStyles = css({
  display: 'flex',
  flexDirection: { 
    base: 'column', 
    md: 'row' 
  },
  flex: '1',
  width: 'full',
  overflowY: 'auto',
  overflowX: 'hidden',
  scrollBehavior: 'smooth',
  paddingRight: { 
    base: '1', 
    sm: '2', 
    lg: '3', 
    xl: '4' 
  },
  paddingLeft: { 
    base: '2', 
    sm: '3', 
    lg: '4', 
    xl: '5' 
  },
  outline: 'none', // Hide default focus outline
  _focusVisible: { // Custom focus style for accessibility
    outline: '2px solid',
    outlineColor: 'primary',
    outlineOffset: '2px',
  },
});

export const contentWrapperStyles = css({
  flex: '1',
  order: 1,
  minWidth: 0, // Prevent flex overflow
  padding: { 
    base: '3', 
    sm: '4', 
    md: '5', 
    lg: '6', 
    xl: '7', 
    '2xl': '8', 
    '3xl': '9' 
  },
  '@media (min-width: 2200px)': { // Custom styles for largest breakpoint
    paddingTop: '0.5rem',
    paddingLeft: 'calc(9 * 0.25rem + 0.5rem)'
  }
});

export const contentColumnStyles = css({
  width: 'full',
  margin: '0 auto', // Center content column
  maxWidth: { 
    base: '100%', 
    lg: '60rem', 
    xl: '70rem', 
    '2xl': '80rem', 
    '3xl': '90rem' 
  },
});

// --- Desktop Navigation Styles ---
export const navWrapperStyles = css({
  display: { 
    base: 'none', 
    md: 'block' 
  },
  order: 2, // Show on desktop, place after content
  width: { 
    md: '56', 
    lg: '64', 
    xl: '72', 
    '2xl': '80' 
  }, // Responsive width
  borderColor: 'border',
  bg: 'background',
  position: 'sticky',
  top: 0,
  alignSelf: 'flex-start',
  maxHeight: '100vh',
  overflowY: 'auto',
  flexShrink: 0,
  isolation: 'isolate',
  zIndex: 3,
  paddingTop: { 
    md: '3rem', 
    lg: '4rem', 
    xl: '5rem' 
  },
});

export const navScrollContainerStyles = css({
  padding: { 
    md: '3', 
    lg: '4', 
    xl: '5' 
  },
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  paddingBottom: { 
    md: '6rem', 
    lg: '8rem' 
  } // Bottom padding for scroll visibility
});

export const navHeaderStyles = css({
  fontSize: { 
    md: 'desktopSubmenuItem', 
    lg: 'desktopNavItem', 
    xl: 'base' 
  },
  fontWeight: '200',
  mb: { 
    md: '3', 
    lg: '4' 
  },
  color: 'primary',
  textAlign: 'left',
  px: { 
    md: '1', 
    lg: '2' 
  },
  flexShrink: 0,
});

export const navListContainerStyles = css({
  position: 'relative',
  flex: '1',
  minHeight: 0, // For indicator positioning and flex grow
  pl: { 
    md: '3', 
    lg: '4', 
    xl: '5' 
  },
});

export const navListStyles = css({
  display: 'flex',
  flexDirection: 'column',
  listStyle: 'none',
  padding: 0,
  margin: 0,
  gap: { 
    md: '1', 
    lg: '2', 
    xl: '3' 
  }, // Spacing between nav items
});

// Base styles for both mobile and desktop nav buttons
export const navButtonBaseStyles = css({
  position: 'relative',
  display: 'block',
  width: 'full',
  textAlign: 'left',
  pl: { 
    md: '2', 
    lg: '3' 
  }, // Desktop padding
  pr: { 
    md: '1', 
    lg: '2' 
  }, // Desktop padding
  py: { 
    md: '1', 
    lg: '1.5', 
    xl: '2' 
  }, // Desktop padding
  rounded: 'md',
  fontSize: { 
    md: 'desktopSubmenuItem', 
    lg: 'desktopNavItem', 
    xl: 'base' 
  }, // Desktop font size
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
    bg: 'glow' 
  },
  _hover: { 
    bgColor: 'glow' 
  },
});

export const navButtonInactiveStyles = css({
  color: 'textMuted',
  _hover: { 
    color: 'text' 
  },
});

export const navButtonActiveStyles = css({
  color: 'primary',
  fontWeight: 'medium',
});

// --- Desktop Indicator Line Styles ---
export const lineTrackStyles = css({ // Background track
  position: 'absolute',
  top: '0',
  bg: 'border',
  rounded: 'full',
  left: { 
    md: '1', 
    lg: '2' 
  },
  width: { 
    md: '1px', 
    lg: '2px' 
  },
  transition: 'height 0.3s ease-in-out',
});

export const lineIndicatorStyles = css({ // Active indicator
  position: 'absolute',
  left: '0',
  bg: 'primary',
  width: { 
    md: '3px', 
    lg: '4px', 
    xl: '5px', 
    '2xl': '6px' 
  },
  borderRadius: '0 3px 3px 0',
  boxShadow: '0 0 6px var(--colors-primary)', // Glow effect
  transitionProperty: 'top, height, opacity, transform',
  transitionDuration: 'normal',
  transitionTimingFunction: 'ease-in-out',
});

// --- Section Header Element Styles ---
export const headerElementStyles = css({ // Wrapper
  mb: '6',
  width: 'full',
  borderRadius: 'md',
  overflow: 'hidden',
});

export const headerImageStyles = css({ // Image
  width: 'full',
  maxHeight: '240px',
  objectFit: 'cover',
});

export const headerCardStyles = css({ // Card
  p: '4',
  border: '1px solid',
  borderColor: 'border',
  borderRadius: 'md',
  boxShadow: 'sm',
  bg: 'background',
});

export const headerCodeStyles = css({ // Code
  p: '4',
  fontFamily: 'mono',
  fontSize: 'sm',
  bg: 'background',
  color: 'text',
  borderRadius: 'md',
  overflow: 'auto',
});

export const headerTextStyles = css({ // Text/Quote
  p: '4',
  fontStyle: 'italic',
  color: 'text',
  borderColor: 'primary',
  bg: 'background',
});

// --- Section Content Styles ---
export const sectionHeadingStyles = css({ // H2 within section
  fontSize: 'clamp(1rem, calc(1rem + ((1vw - 4.8px) * 1.8)), 2.5rem)', // Reduced fluid typography
  fontWeight: 'semibold',
  color: 'primary',
  mb: { 
    base: '3', 
    md: '4', 
    lg: '5' 
  },
});

export const sectionParagraphStyles = css({ // P within section
  lineHeight: 'calc(1.5em + 0.15 * (1vw - 4.8px))', // Slightly reduced fluid line height
  fontSize: 'clamp(0.8rem, calc(0.8rem + ((1vw - 4.8px) * 0.4)), 1.5rem)', // Smaller fluid typography
  color: 'text',
  mb: { 
    base: '3', 
    md: '4', 
    lg: '5' 
  },
});

export const sectionStyles = css({ // <section> wrapper
  mb: { 
    base: '5rem', 
    sm: '6rem', 
    md: '8rem', 
    lg: '10rem' 
  }, // Bottom margin between sections
  isolation: 'isolate', // Stacking context
  position: 'relative',
  paddingLeft: { 
    base: '1rem', 
    sm: '1.5rem', 
    md: '2rem', 
    lg: '2.5rem', 
    xl: '3rem', 
    '2xl': '3.5rem', 
    '3xl': '4rem' 
  },
  paddingRight: { 
    base: '1rem', 
    sm: '2rem', 
    md: '3rem', 
    lg: '4rem', 
    xl: '5rem', 
    '2xl': '6rem', 
    '3xl': '6.5rem' 
  },
  py: { 
    base: '1', 
    md: '2', 
    lg: '3', 
    xl: '4', 
    '2xl': '5', 
    '3xl': '5' 
  },
  '@media (min-width: 2200px)': { // Styles for largest breakpoint
    paddingTop: '2rem',
    '& > h2:first-of-type': { marginLeft: '0.25rem' }
  },
  // Nested element styles within sections
  '& h1, & h2, & h3': {
    fontWeight: 'thin',
    color: 'primary',
    fontSize: { 
      base: 'lg', 
      md: 'xl', 
      lg: '2xl', 
      '2xl': '3xl', 
      '3xl': '4xl' 
    },
  },
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
  '& img': { 
    maxWidth: '100%', 
    height: 'auto' 
  } // Responsive images
});

// --- Section Header Sub-Component ---
interface SectionHeaderProps {
  headerElement: NonNullable<Section['headerElement']>;
}
interface HeaderWrapperProps { children: React.ReactNode; }

const SectionHeader: React.FC<SectionHeaderProps> = ({ headerElement }) => {
  const { type } = headerElement;
  const customStyles = headerElement.bgColor ? { backgroundColor: headerElement.bgColor } : {};

  const renderParagraphs = (content?: string[]) => content?.map((text, index) => (
    <p key={index} style={{ marginBottom: index < (content.length - 1) ? '1rem' : 0, color: 'var(--colors-text)' }}>
      {text}
    </p>
  ));

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
            <code>
              {headerElement.code}
            </code>
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

type ClonedElementProps = React.HTMLAttributes<HTMLElement> & {
  key: string;
  style: React.CSSProperties;
  'data-section-id': string;
  id: string;
};

const ScrollingContentWithNav: React.FC<ScrollingContentWithNavProps> = ({
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
  svgIconWrapperClassName,
  customComponentAboveWrapperClassName,
  customComponentWrapperClassName,
  footerClassName,
  footerTitleClassName,
  enableAutoDetection = true,
  offsetTop = 0,
  useChildrenInsteadOfData = false,
  autoFocusContainerOnMount = false,
  maxContentWidth,
  responsivePadding = true,
}) => {
  // --- Refs ---
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const navListRef = useRef<HTMLUListElement>(null);
  
  // --- Client-side mounting state ---
  const [isMounted, setIsMounted] = useState(false);
  
  // Set isMounted to true after initial render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- Hooks ---
  const windowSize = useWindowSize(); // For responsive calculations

  // Smooth scrolling setup
  const {
    scrollToId,
    scrollOffset: finalScrollOffset,
    isScrollingProgrammatically
  } = useSmoothScroll({
      containerRef: mainContainerRef,
      baseOffset: offsetTop,
      // stickyElementRef is not needed here as offset includes mobile nav height via calculation
  });

  // ScrollSpy setup (replaces useSectionIntersection)
  const activeSection = useScrollSpy({
    containerRef: mainContainerRef,
    sectionIds: sections.map(s => s.id),
    offsetTop: finalScrollOffset,
    enableHashSync: enableAutoDetection,
    scrollToOnLoad: true,
    externalActiveSection: externalActiveSection,
    isMounted: isMounted
  });

  // Combined navigation click handler
  const handleNavClick = useCallback((id: string) => {
      if (externalOnNavClick) {
        externalOnNavClick(id);
      }
      // No need to manually set active section - the observer will handle it
      scrollToId(id); // Trigger smooth scroll
    },
    [externalOnNavClick, scrollToId] // Dependencies
  );

  // Mobile navigation setup
  const {
    isMobileNavOpen,
    mobileNavProps,
    triggerProps,
    dropdownProps,
    getItemProps: getMobileItemProps
  } = useMobileNavigation({
    onNavItemClick: handleNavClick,
    sections,
    isMounted // Pass isMounted flag for client-side rendering
  });

  // Desktop navigation setup
  const {
    desktopNavProps,
    getDesktopItemProps,
    indicatorStyle,
    trackHeight
  } = useDesktopNavigation({
    navListRef,
    sections,
    activeSection,
    onNavClick: handleNavClick,
    navTitle,
    isMounted // Pass isMounted flag for client-side rendering
  });

  // Autofocus setup
  useAutofocus({
    targetRef: mainContainerRef,
    shouldFocus: autoFocusContainerOnMount,
    isMounted // Pass isMounted flag for client-side rendering
  });

  // User scroll detection setup
  const isScrollingByUser = useUserScrollDetection(mainContainerRef, 150);

  // Combined scrolling state for render props
  const isScrolling = isScrollingProgrammatically || isScrollingByUser;

  // --- Child Rendering Logic ---
  const renderedSections = useMemo(() => {
    // Option 1: Render provided children directly
    if (useChildrenInsteadOfData && React.Children.count(children) > 0) {
      return React.Children.map(children, (child, index) => {
          const section = sections[index];
          if (!section || !React.isValidElement(child)) return child; // Basic validation

          const childProps = child.props as { className?: string; style?: React.CSSProperties; children?: ReactNode; };
          const combinedClassName = cx(sectionStyles, childProps.className);
          const sectionInlineStyles = { scrollMarginTop: `${finalScrollOffset}px` };

          const clonedElementProps: ClonedElementProps = {
            'data-section-id': section.id,
            id: section.id,
            className: combinedClassName,
            style: { ...childProps.style, ...sectionInlineStyles },
            key: section.id,
            children: (
              <>
                {section.headerElement && (
                  <SectionHeader headerElement={section.headerElement} />
                )}
                {childProps.children}
              </>
            ),
          };
          return React.cloneElement(child, clonedElementProps);
      });
    }

    // Option 2: Generate sections from `sections` data array
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

          {/* Optional SVG Icon */}
          {section.svgIcon && (
            <div className={svgIconWrapperClassName}>
              {section.svgIcon}
            </div>
          )}

          {/* Optional Header Element */}
          {section.headerElement && (
            <SectionHeader headerElement={section.headerElement} />
          )}

          {/* Optional Custom Component Above (using render prop) */}
          {typeof section.customComponentAbove === 'function' && (
            <div
              className={cx(
                css({
                  display: 'block',
                  position: 'relative',
                  mb: { base: '3', md: '4', lg: '5' }
                }),
                customComponentAboveWrapperClassName
              )}
            >
              {section.customComponentAbove({ isScrolling })}
            </div>
          )}

          {/* Default Content (Title + Paragraphs) */}
          {(section.sectionTitle || section.content) && (
            <>
              {section.sectionTitle && (
                <h2 className={cx(sectionHeadingStyles, sectionHeadingClassName)}>
                  {section.sectionTitle}
                </h2>
              )}
              {section.content?.map((paragraph, idx) => (
                <p
                  key={`${section.id}-p-${idx}`}
                  className={cx(sectionParagraphStyles, sectionParagraphClassName)}
                >
                  {paragraph}
                </p>
              ))}
            </>
          )}

          {/* Optional Custom Component Below (using render prop) */}
          {typeof section.customComponent === 'function' && (
            <div
              className={cx(
                css({
                  display: 'block',
                  position: 'relative',
                  mt: { base: '3', md: '4', lg: '5' }
                 }),
                customComponentWrapperClassName
              )}
            >
              {section.customComponent({ isScrolling })}
            </div>
          )}
        </section>
      );
    });
  }, [ // Dependencies for renderedSections useMemo
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
    windowSize.width // Re-render if width changes (affects fluid typography)
  ]);

  // --- JSX Output ---
  return (
    <div
      className={cx(
        containerStyles,
        containerClassName,
        maxContentWidth && css({ maxWidth: maxContentWidth })
      )}
    >

      {/* Main Scrollable Container */}
      <div
        ref={mainContainerRef}
        className={cx(
          mainContainerStyles,
          mainClassName,
          responsivePadding && css({ /* Responsive padding styles */ })
        )}
        tabIndex={-1}
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
              <div className={css({ 
                padding: '2', 
                textAlign: 'center', 
                fontSize: 'xs', 
                color: 'textMuted', 
              })}>
                 Swipe up to dismiss
              </div>
              <ul className={mobileNavListStyles}>
                {sections.map((section, index) => {
                  const isActive = activeSection === section.id;
                  const itemProps = getMobileItemProps(section.id, index);
                  return (
                    <li key={`mobile-${section.id}`} role="none">
                      <button
                        {...itemProps}
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
        <div className={cx( contentWrapperStyles, responsivePadding && css({ /* Responsive padding styles */ }) )}>

          {/* Optional Header Bar */}
          {(headerContent || headerTitle) && (
            <div className={cx(headerStyles, headerClassName)}>
              {headerContent ? headerContent : (
                <div className={headerContentContainerStyles}>
                  <h1 className={headerTitleStyles}>{headerTitle || navTitle}</h1>
                  {headerRightContent && (
                    <div className="header-right-content">
                      {headerRightContent}
                    </div>
                   )}
                </div>
              )}
            </div>
          )}

          {/* Optional Header Description */}
          {headerDescription && (
            <div className={cx(headerDescriptionStyles, headerDescriptionClassName)}>
              {headerDescription}
            </div>
          )}

          {/* Inner Content Column */}
          <div
            className={cx(
              contentColumnStyles,
              contentColumnClassName,
              maxContentWidth && css({ maxWidth: maxContentWidth })
            )}
          >

            {/* Rendered Sections */}
            {renderedSections}

            {/* Optional Footer */}
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

        {/* Desktop Navigation Sidebar */}
        <div className={cx(navWrapperStyles, navColumnClassName)}>
          <div className={navScrollContainerStyles}>

            {/* Desktop Nav List Container (with indicator lines) */}
            <div className={navListContainerStyles}>

              {/* Background Track */}
              <div
                className={lineTrackStyles}
                style={{ height: `${trackHeight}px` }}
                aria-hidden="true"
              />

              {/* Active Indicator */}
              <div
                className={lineIndicatorStyles}
                style={{
                  transform: `translateY(${indicatorStyle.top}px)`,
                  height: `${indicatorStyle.height}px`,
                  opacity: indicatorStyle.opacity
                }}
                aria-hidden="true"
              />

              {/* Desktop Nav List */}
              <ul ref={navListRef} className={navListStyles} {...desktopNavProps}>
                {sections.map((section, index) => {
                  const itemProps = getDesktopItemProps(section, index);
                  return (
                    <li key={section.id} data-section-id={section.id} role="none">
                      <button {...itemProps}>
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