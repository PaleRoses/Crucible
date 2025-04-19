import React, { useState, useCallback, useRef, useEffect, useLayoutEffect, useMemo } from 'react';

// Helper hook to use useLayoutEffect in browser and useEffect in SSR
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * ============================================================================
 * Core Hook: usePressProgress
 * ============================================================================
 * Tracks press state and progress (0-1) without specific UI calculations.
 * Designed to be the foundation for more specific press-and-hold hooks.
 */

// Event handler types (unchanged)
export interface MouseEventHandlerProps {
  onMouseDown?: (event: React.MouseEvent<HTMLElement>) => void;
  onMouseUp?: (event: React.MouseEvent<HTMLElement>) => void;
}
export interface TouchEventHandlerProps {
  onTouchStart?: (event: React.TouchEvent<HTMLElement>) => void;
  onTouchEnd?: (event: React.TouchEvent<HTMLElement>) => void;
}
export type PressEventHandlers = MouseEventHandlerProps & TouchEventHandlerProps;

/**
 * Configuration options for the usePressProgress hook
 */
export interface PressProgressOptions {
  /** Duration of the complete press animation in milliseconds. @default 800 */
  duration?: number;
  /** Throttle threshold for state updates (0-1). @default 0.02 */
  updateThreshold?: number;
  /** Callback executed when press progress changes. */
  onProgressChange?: (progress: number) => void;
  /** Callback executed when press state (pressed/not pressed) changes. */
  onPressStateChange?: (isPressed: boolean) => void;
  /** Callback executed *once* when press progress reaches 1. */
  onComplete?: () => void; // New
  /** Whether to use global event listeners for releases outside the element. @default true */
  useGlobalListeners?: boolean;
  /** Master enable/disable switch for the hook's functionality. @default true */
  isEnabled?: boolean;
  /** Callback for reporting internal errors. */
  onError?: (error: Error) => void;
  /** Optional configuration for event listeners (passive, capture). */
  listenerOptions?: AddEventListenerOptions;
  /** Optional: Provide a custom time source function (e.g., for testing). @default performance.now or Date.now */
  getNow?: () => number; // New
  /** Optional: Explicitly disable the animation loop. @default false */
  disableAnimation?: boolean; // New
  /** Optional: Respect user's prefers-reduced-motion setting. @default true */
  respectReducedMotion?: boolean; // New
  /** Optional: Pass a ref to attach listeners internally instead of returning eventHandlers. */
  elementRef?: React.RefObject<HTMLElement | null>; // New
}

/**
 * Return value from the usePressProgress hook
 */
export interface PressProgressResult {
  /** Whether the element is currently being pressed down. */
  isPressed: boolean;
  /** The current progress of the press animation (0 to 1). */
  progress: number;
  /** Event handlers to spread onto the interactive element (null if elementRef is provided). */
  eventHandlers: PressEventHandlers | null; // Updated
  /** Manually starts the press animation. */
  startPress: () => void;
  /** Manually ends the press animation and resets progress. */
  endPress: () => void;
  /** Resets the hook state without triggering onPressStateChange(false). */
  reset: () => void;
  /** Forcefully stops and cleans up the hook, setting isPressed to false. */
  destroy: () => void; // New
}

/**
 * A hook for tracking press-and-hold interaction progress.
 */
export function usePressProgress(
  options: PressProgressOptions = {}
): PressProgressResult {
  const {
    duration = 800,
    updateThreshold = 0.02,
    onProgressChange,
    onPressStateChange,
    onComplete, // New
    useGlobalListeners = true,
    isEnabled = true,
    onError,
    listenerOptions,
    getNow: getNowOption, // New
    disableAnimation: disableAnimationOption = false, // New
    respectReducedMotion = true, // New
    elementRef // New
  } = options;

  // State
  const [isPressed, setIsPressed] = useState(false);
  const [progress, setProgress] = useState(0);

  // Refs
  const animationFrameRef = useRef<number | null>(null);
  const pressStartTimeRef = useRef<number | null>(null);
  const currentProgressRef = useRef(0);
  const lastReportedProgressRef = useRef(0);
  const isEnabledRef = useRef(isEnabled);
  const optionsRef = useRef(options);
  const onCompleteCalledRef = useRef(false); // New: Track if onComplete was called

  // Update refs when options change
  useEffect(() => {
    isEnabledRef.current = isEnabled;
    optionsRef.current = options;
  }, [isEnabled, options]);

  // Memoized time source function
  const getNow = useMemo(() => optionsRef.current.getNow ?? (() => (typeof performance !== 'undefined' ? performance.now() : Date.now())), []); // Updated

  // Memoized check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
     if (typeof window === 'undefined' || !optionsRef.current.respectReducedMotion) return false;
     try {
       const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
       return mediaQuery.matches;
     } catch (error) {
         console.error("Error checking prefers-reduced-motion:", error);
         return false; // Assume no reduction if check fails
     }
  }, [options.respectReducedMotion]); // Re-check if option changes

  // Determine if animation should be disabled
  const animationDisabled = optionsRef.current.disableAnimation || prefersReducedMotion; // Updated

  // Internal error handler helper
  const handleError = useCallback((error: unknown) => {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("usePressProgress Error:", err);
    if (optionsRef.current.onError) {
      try {
        optionsRef.current.onError(err);
      } catch (callbackError) {
        console.error("Error in onError callback itself:", callbackError);
      }
    }
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    if (!pressStartTimeRef.current || !isEnabledRef.current || !isPressed) {
      animationFrameRef.current = null;
      return;
    }

    try {
      const elapsed = getNow() - pressStartTimeRef.current; // Use getNow
      const calculatedProgress = Math.min(1, elapsed / (optionsRef.current.duration ?? 800));
      currentProgressRef.current = calculatedProgress;

      // Throttle state updates & callback calls
      if (Math.abs(calculatedProgress - lastReportedProgressRef.current) >= (optionsRef.current.updateThreshold ?? 0.02) || calculatedProgress === 1 || calculatedProgress === 0) {
        lastReportedProgressRef.current = calculatedProgress;
        setProgress(calculatedProgress);
        if (optionsRef.current.onProgressChange) {
          optionsRef.current.onProgressChange(calculatedProgress);
        }
      }

      // New: Check for completion and call onComplete once
      if (calculatedProgress >= 1 && !onCompleteCalledRef.current) {
        if (optionsRef.current.onComplete) {
          try {
            optionsRef.current.onComplete();
          } catch (error) {
            handleError(error);
          }
        }
        onCompleteCalledRef.current = true; // Mark as called
      }

      // Continue animation if not complete
      if (calculatedProgress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        animationFrameRef.current = null;
      }
    } catch (error) {
      handleError(error);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      pressStartTimeRef.current = null;
    }
  }, [isPressed, getNow, handleError]); // Added getNow dependency

  // Function to reset internal state cleanly
  const resetState = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    pressStartTimeRef.current = null;
    currentProgressRef.current = 0;
    lastReportedProgressRef.current = 0;
    onCompleteCalledRef.current = false; // Reset onComplete flag
    setProgress(prev => prev === 0 ? 0 : 0);
  }, []);

  // Function to end the press interaction
  const endPress = useCallback(() => {
    setIsPressed(prevIsPressed => {
      if (!prevIsPressed) return false;
      resetState();
      if (optionsRef.current.onPressStateChange) {
        try {
          optionsRef.current.onPressStateChange(false);
        } catch (error) {
          handleError(error);
        }
      }
      return false;
    });
  }, [resetState, handleError]);

  // Function to start the press interaction
  const startPress = useCallback(() => {
    if (!isEnabledRef.current || isPressed) {
      return;
    }

    try {
      resetState(); // Ensure clean state
      onCompleteCalledRef.current = false; // Reset completion flag specifically on start

      // Handle disabled animation case
      if (animationDisabled) {
        const finalProgress = 1;
        currentProgressRef.current = finalProgress;
        lastReportedProgressRef.current = finalProgress;
        setProgress(finalProgress);
        setIsPressed(true); // Set pressed state

        // Call callbacks immediately
        if (optionsRef.current.onPressStateChange) optionsRef.current.onPressStateChange(true);
        if (optionsRef.current.onProgressChange) optionsRef.current.onProgressChange(finalProgress);
        if (optionsRef.current.onComplete && !onCompleteCalledRef.current) {
            optionsRef.current.onComplete();
            onCompleteCalledRef.current = true;
        }
        return; // Skip animation setup
      }

      // Normal animation start
      pressStartTimeRef.current = getNow(); // Use getNow
      setIsPressed(true);

      // Notify about state change
      if (optionsRef.current.onPressStateChange) optionsRef.current.onPressStateChange(true);
      if (optionsRef.current.onProgressChange && lastReportedProgressRef.current !== 0) {
          lastReportedProgressRef.current = 0;
          optionsRef.current.onProgressChange(0);
      }

      // Start the animation loop
      animationFrameRef.current = requestAnimationFrame(animate);

    } catch (error) {
      handleError(error);
      setIsPressed(false); // Ensure state reflects failure
    }
  }, [isPressed, resetState, animate, handleError, getNow, animationDisabled]); // Added getNow, animationDisabled dependencies

  // New: Explicit destroy function
  const destroy = useCallback(() => {
    resetState(); // Reuse existing cleanup logic for timers/progress
    // Ensure isPressed state is false, potentially notifying listeners
    setIsPressed(prevIsPressed => {
      if (!prevIsPressed) return false; // Already not pressed

      if (optionsRef.current.onPressStateChange) {
        try {
          optionsRef.current.onPressStateChange(false);
        } catch (error) {
          handleError(error);
        }
      }
      return false;
    });
  }, [resetState, handleError]); // Stable dependencies

  // Effect for managing global listeners and cleanup
  useIsomorphicLayoutEffect(() => {
    // Skip if using elementRef binding
    if (optionsRef.current.elementRef?.current) return;

    // Define global listener handlers
    const handleGlobalMouseUp = (event: MouseEvent) => {
      if (event.button === 0) { // Only react to primary button
        endPress();
      }
    };

    const handleGlobalTouchEnd = (event: TouchEvent) => {
      endPress();
    };

    const handleGlobalBlur = () => {
      endPress();
    };

    let globalListenersActive = false;

    const addGlobalListeners = () => {
      if (!globalListenersActive && optionsRef.current.useGlobalListeners) {
        document.addEventListener('mouseup', handleGlobalMouseUp, optionsRef.current.listenerOptions);
        document.addEventListener('touchend', handleGlobalTouchEnd, optionsRef.current.listenerOptions);
        window.addEventListener('blur', handleGlobalBlur);
        globalListenersActive = true;
      }
    };

    const removeGlobalListeners = () => {
      if (globalListenersActive) {
        document.removeEventListener('mouseup', handleGlobalMouseUp, optionsRef.current.listenerOptions);
        document.removeEventListener('touchend', handleGlobalTouchEnd, optionsRef.current.listenerOptions);
        window.removeEventListener('blur', handleGlobalBlur);
        globalListenersActive = false;
      }
    };


    if (isPressed && isEnabledRef.current) {
       addGlobalListeners();
    } else {
       removeGlobalListeners();
    }

    // Cleanup function for this effect
    return () => {
      removeGlobalListeners();
      // Also cancel animation frame on unmount or if dependencies change causing effect cleanup
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
    // Dependencies: isPressed, endPress, listenerOptions, elementRef, useGlobalListeners, isEnabled
  }, [isPressed, endPress, options.listenerOptions, options.elementRef, options.useGlobalListeners, isEnabled]);


  // Memoize event handlers (only needed if not using elementRef)
  const eventHandlers = useMemo((): PressEventHandlers | null => {
    // Return null if elementRef is provided, handlers attached in effect below
    if (optionsRef.current.elementRef) {
        return null;
    }
    return {
      onMouseDown: (e: React.MouseEvent<HTMLElement>) => { if (e.button === 0) startPress(); },
      onMouseUp: (e: React.MouseEvent<HTMLElement>) => { if (e.button === 0) endPress(); },
      onTouchStart: (_e: React.TouchEvent<HTMLElement>) => { startPress(); },
      onTouchEnd: (_e: React.TouchEvent<HTMLElement>) => { endPress(); },
    };
  }, [startPress, endPress, options.elementRef]); // Added elementRef dependency

  // New: Effect for binding handlers directly to elementRef if provided
  useIsomorphicLayoutEffect(() => {
    const element = optionsRef.current.elementRef?.current;
    // Only run if elementRef is provided AND eventHandlers were *not* generated above
    if (!element || !eventHandlers === false) return;

    // Define handlers inline or reference memoized versions if needed elsewhere
    const handleMouseDown = (e: MouseEvent) => { if (e.button === 0) startPress(); };
    const handleMouseUp = (e: MouseEvent) => { if (e.button === 0) endPress(); };
    const handleTouchStart = (_e: TouchEvent) => { startPress(); };
    const handleTouchEnd = (_e: TouchEvent) => { endPress(); };

    // Attach event handlers directly
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseup', handleMouseUp);
    // Use listenerOptions if provided
    element.addEventListener('touchstart', handleTouchStart, optionsRef.current.listenerOptions ?? { passive: true });
    element.addEventListener('touchend', handleTouchEnd, optionsRef.current.listenerOptions);

    // Cleanup function
    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mouseup', handleMouseUp);
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startPress, endPress, options.elementRef, options.listenerOptions]); // Dependencies


  return {
    isPressed,
    progress,
    eventHandlers, // Will be null if elementRef is used
    startPress,
    endPress,
    reset: resetState,
    destroy // New
  };
}


/**
 * ============================================================================
 * Derived Hook: usePressAndHold
 * ============================================================================
 * Builds upon usePressProgress to provide calculated styles for a visual indicator.
 */

/** Result of the tab style calculation */
export interface TabStyles { // Kept specific for default calculation
  height: string;
  top: string;
}

/**
 * Configuration options for the usePressAndHold hook
 */
export interface PressAndHoldOptions extends Omit<PressProgressOptions, 'onProgressChange' | 'onPressStateChange'> {
  /** Initial height value (CSS string, e.g., "20%"). Required unless getTabStyle is used. */
  initialHeight?: string; // Make optional if getTabStyle is primary
  /** Minimum height value when fully pressed (CSS string, e.g., "10%"). Required unless getTabStyle is used. */
  minHeight?: string; // Make optional if getTabStyle is primary
  /** Optional: Callback when press progress changes. */
  onProgressChange?: (progress: number) => void;
  /** Optional: Callback when press state changes. */
  onPressStateChange?: (isPressed: boolean) => void;
  /** Optional: Function to calculate custom styles based on progress. Overrides default height/top calculation. */
  getTabStyle?: (progress: number) => Partial<React.CSSProperties>; // New
}

/**
 * Return value from the usePressAndHold hook
 */
export interface PressAndHoldResult {
  /** Whether the element is currently being pressed down. */
  isPressed: boolean;
  /** The current progress of the press animation (0 to 1). */
  pressProgress: number;
  /** Calculated styles for the visual indicator element (can be custom object if getTabStyle is used). */
  tabStyles: TabStyles | Partial<React.CSSProperties>; // Updated
  /** Event handlers (null if elementRef is provided). */
  eventHandlers: PressEventHandlers | null; // Updated
  /** Manually starts the press animation. */
  startPress: () => void;
  /** Manually ends the press animation and resets progress. */
  endPress: () => void;
  /** Resets the hook state. */
  reset: () => void;
  /** Forcefully stops and cleans up the hook. */
  destroy: () => void; // New
}

/**
 * A hook for creating press-and-hold interactions with animated progress
 * and calculated styles for a visual indicator.
 */
export function usePressAndHold(
  options: PressAndHoldOptions
): PressAndHoldResult {
  const {
    initialHeight, // Keep for default calculation
    minHeight, // Keep for default calculation
    getTabStyle, // New
    onProgressChange: onProgressChangeOption, // Capture optional callbacks
    onPressStateChange: onPressStateChangeOption, // Capture optional callbacks
    ...coreOptions // Pass remaining options down
  } = options;

  // Internal handler for progress change to pass to core hook
  const handleProgressChange = useCallback((p: number) => {
    if (onProgressChangeOption) {
      onProgressChangeOption(p);
    }
  }, [onProgressChangeOption]);

  // Internal handler for press state change to pass to core hook
  const handlePressStateChange = useCallback((pressed: boolean) => {
    if (onPressStateChangeOption) {
      onPressStateChangeOption(pressed);
    }
  }, [onPressStateChangeOption]);


  // Use the core progress hook internally, passing down our internal handlers
  const { isPressed, progress, eventHandlers, startPress, endPress, reset, destroy } = usePressProgress({
      ...coreOptions,
      onProgressChange: handleProgressChange,
      onPressStateChange: handlePressStateChange,
  });

  // Memoize style calculations
  const tabStyles = useMemo((): TabStyles | Partial<React.CSSProperties> => {
    try {
      // Prioritize the user's function if provided
      if (getTabStyle) {
        const customStyles = getTabStyle(progress);
        // **[Update]** Type Guarding: Validate the return value of getTabStyle
        if (customStyles !== null && typeof customStyles === 'object' && !Array.isArray(customStyles)) {
            return customStyles;
        } else {
            console.warn("usePressAndHold: getTabStyle function returned an invalid value. Expected a style object, received:", customStyles);
            // Fallback to an empty object if the custom style function returns invalid data
            return {};
        }
      }

      // **[Update]** Better Height Defaults: Check for valid initialHeight first
      let initialValue: number | undefined;
      if (typeof initialHeight === 'string') {
          initialValue = parseFloat(initialHeight);
          if (isNaN(initialValue)) {
              console.warn("usePressAndHold: Invalid initialHeight provided. Must be parseable CSS percentage (e.g., '20%').");
              initialValue = undefined; // Mark as invalid
          }
      }

      let minValue: number | undefined;
      if (typeof minHeight === 'string') {
          minValue = parseFloat(minHeight);
          if (isNaN(minValue)) {
              console.warn("usePressAndHold: Invalid minHeight provided. Must be parseable CSS percentage (e.g., '10%').");
              minValue = undefined; // Mark as invalid
          }
      }

      // If either initialHeight or minHeight is missing or invalid, provide a warning and better fallback
      if (initialValue === undefined || minValue === undefined) {
          if (!getTabStyle) { // Only warn if default calculation was expected
              console.warn("usePressAndHold: initialHeight and minHeight props are required and must be valid percentages when not using getTabStyle.");
          }
          // Use initialHeight if valid, otherwise '0%' as ultimate fallback
          const fallbackHeight = initialValue !== undefined ? `${initialValue}%` : '0%';
          // Keep a simple fallback for top
          return { height: fallbackHeight, top: '40%' };
      }

      // Original calculation if both values are valid
      const currentHeight = initialValue - (progress * (initialValue - minValue));
      const initialTop = 40; // Example default top start
      const pressedTop = 45; // Example default top end
      const currentTop = initialTop + (progress * (pressedTop - initialTop));

      return {
        height: `${currentHeight}%`,
        top: `${currentTop}%`,
      };
    } catch (error) {
       if (options.onError) {
           const err = error instanceof Error ? error : new Error(String(error));
           options.onError(new Error(`Style calculation failed: ${err.message}`));
       } else {
           console.error("usePressAndHold style calculation error:", error);
       }
       // **[Update]** Improved fallback in catch block
       const fallbackHeight = (typeof initialHeight === 'string' && !isNaN(parseFloat(initialHeight))) ? initialHeight : '0%';
       return getTabStyle ? {} : { height: fallbackHeight, top: '40%' };
    }
  // Ensure all dependencies used in the calculation are listed
  }, [initialHeight, minHeight, progress, getTabStyle, options.onError]);


  return {
    isPressed,
    pressProgress: progress,
    tabStyles,
    eventHandlers, // Pass through null/object from usePressProgress
    startPress,
    endPress,
    reset,
    destroy // Pass through destroy from usePressProgress
  };
}

// Default export remains usePressAndHold
export default usePressAndHold;
