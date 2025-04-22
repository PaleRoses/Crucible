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

// Define event handlers based on Pointer Events
export interface PointerEventHandlerProps {
  onPointerDown?: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerUp?: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerCancel?: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerLeave?: (event: React.PointerEvent<HTMLElement>) => void;
}
// Define the primary event handler type using Pointer Events
export type PressEventHandlers = PointerEventHandlerProps;


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
  onComplete?: () => void;
  /** Whether to use global event listeners for releases outside the element. @default true */
  useGlobalListeners?: boolean;
  /** Master enable/disable switch for the hook's functionality. @default true */
  isEnabled?: boolean;
  /** Callback for reporting internal errors. */
  onError?: (error: Error) => void;
  /** Optional configuration for event listeners (passive, capture). */
  listenerOptions?: AddEventListenerOptions;
  /** Optional: Provide a custom time source function (e.g., for testing). @default performance.now or Date.now */
  getNow?: () => number;
  /** Optional: Explicitly disable the animation loop. @default false */
  disableAnimation?: boolean;
  /** Optional: Respect user's prefers-reduced-motion setting. @default true */
  respectReducedMotion?: boolean;
  /** Optional: Pass a ref to attach listeners internally instead of returning eventHandlers. */
  elementRef?: React.RefObject<HTMLElement | null>;
  /** Delay in ms before a touchstart initiates press, to allow for scrolling. @default 150 */
  touchScrollDelay?: number;
  /** **[New]** Whether to cancel the press if the pointer leaves the element bounds while pressed. @default true */
  cancelOnLeave?: boolean;
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
  eventHandlers: PressEventHandlers | null;
  /** Manually starts the press animation (bypasses scroll delay). */
  startPress: () => void;
  /** Manually ends the press animation and resets progress. */
  endPress: () => void;
  /** Resets the hook state without triggering onPressStateChange(false). */
  reset: () => void;
  /** Forcefully stops and cleans up the hook, setting isPressed to false. */
  destroy: () => void;
  /** **[New]** The type of pointer that initiated the current press ('mouse', 'touch', 'pen', or null). */
  pointerType: string | null;
  /** **[New]** The bounding rectangle of the element when the press started (or null). */
  elementBounds: DOMRect | null;
}

// Default delay before touch initiates press (allows scrolling)
const DEFAULT_TOUCH_SCROLL_DELAY_MS = 150;

/**
 * A hook for tracking press-and-hold interaction progress using Pointer Events.
 */
export function usePressProgress(
  options: PressProgressOptions = {}
): PressProgressResult {
  const {
    duration = 800,
    updateThreshold = 0.02,
    onProgressChange,
    onPressStateChange,
    onComplete,
    useGlobalListeners = true,
    isEnabled = true,
    onError,
    listenerOptions,
    getNow: getNowOption,
    disableAnimation: disableAnimationOption = false,
    respectReducedMotion = true,
    elementRef,
    touchScrollDelay = DEFAULT_TOUCH_SCROLL_DELAY_MS,
    cancelOnLeave = true // New option
  } = options;

  // State
  const [isPressed, setIsPressed] = useState(false);
  const [progress, setProgress] = useState(0);
  // **[New]** State for debug/context info
  const [pointerType, setPointerType] = useState<string | null>(null);
  const [elementBounds, setElementBounds] = useState<DOMRect | null>(null);


  // Refs
  const animationFrameRef = useRef<number | null>(null);
  const pressStartTimeRef = useRef<number | null>(null);
  const currentProgressRef = useRef(0);
  const lastReportedProgressRef = useRef(0);
  const isEnabledRef = useRef(isEnabled);
  const optionsRef = useRef(options);
  const onCompleteCalledRef = useRef(false);
  const scrollDelayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef(false);
  const pointerMoveListenerRef = useRef<((event: PointerEvent) => void) | null>(null);
  const pointerUpListenerRef = useRef<((event: PointerEvent) => void) | null>(null);
  // **[New]** Ref to track pressed state reliably in event handlers
  const isPressedRef = useRef(isPressed);
  // **[New]** Ref to store the ID of the pointer initiating the press
  const activePointerIdRef = useRef<number | null>(null);


  // Update refs when options or state change
  useEffect(() => {
    isEnabledRef.current = isEnabled;
    // Update optionsRef, including the new cancelOnLeave
    optionsRef.current = { ...options, touchScrollDelay: options.touchScrollDelay ?? DEFAULT_TOUCH_SCROLL_DELAY_MS, cancelOnLeave: options.cancelOnLeave ?? true };
  }, [isEnabled, options]);

  // Keep isPressedRef in sync with state
  useEffect(() => {
    isPressedRef.current = isPressed;
  }, [isPressed]);


  // Memoized time source function
  const getNow = useMemo(() => optionsRef.current.getNow ?? (() => (typeof performance !== 'undefined' ? performance.now() : Date.now())), []);

  // Memoized check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
     // ... (unchanged) ...
     if (typeof window === 'undefined' || !optionsRef.current.respectReducedMotion) return false; try { const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)'); return mediaQuery.matches; } catch (error) { console.error("Error checking prefers-reduced-motion:", error); return false; }
  }, [options.respectReducedMotion]);

  // Determine if animation should be disabled
  const animationDisabled = optionsRef.current.disableAnimation || prefersReducedMotion;

  // Internal error handler helper
  const handleError = useCallback((error: unknown) => {
    // ... (unchanged) ...
    const err = error instanceof Error ? error : new Error(String(error)); console.error("usePressProgress Error:", err); if (optionsRef.current.onError) { try { optionsRef.current.onError(err); } catch (callbackError) { console.error("Error in onError callback itself:", callbackError); } }
  }, []);

  // Animation loop (unchanged)
  const animate = useCallback(() => {
    // ... (unchanged) ...
    if (!pressStartTimeRef.current || !isEnabledRef.current || !isPressedRef.current) { animationFrameRef.current = null; return; } try { const elapsed = getNow() - pressStartTimeRef.current; const calculatedProgress = Math.min(1, elapsed / (optionsRef.current.duration ?? 800)); currentProgressRef.current = calculatedProgress; if (Math.abs(calculatedProgress - lastReportedProgressRef.current) >= (optionsRef.current.updateThreshold ?? 0.02) || calculatedProgress === 1 || calculatedProgress === 0) { lastReportedProgressRef.current = calculatedProgress; setProgress(calculatedProgress); if (optionsRef.current.onProgressChange) optionsRef.current.onProgressChange(calculatedProgress); } if (calculatedProgress >= 1 && !onCompleteCalledRef.current) { if (optionsRef.current.onComplete) { try { optionsRef.current.onComplete(); } catch (error) { handleError(error); } } onCompleteCalledRef.current = true; } if (calculatedProgress < 1) { animationFrameRef.current = requestAnimationFrame(animate); } else { animationFrameRef.current = null; } } catch (error) { handleError(error); if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); animationFrameRef.current = null; pressStartTimeRef.current = null; }
  }, [getNow, handleError]); // Removed isPressed dependency, uses isPressedRef now


  // Function to clean up scroll delay listeners (pointer events) and timeout
  const clearScrollDelayLogic = useCallback(() => {
    // ... (unchanged) ...
    if (scrollDelayTimeoutRef.current) { clearTimeout(scrollDelayTimeoutRef.current); scrollDelayTimeoutRef.current = null; } if (pointerMoveListenerRef.current) { document.removeEventListener('pointermove', pointerMoveListenerRef.current); pointerMoveListenerRef.current = null; } if (pointerUpListenerRef.current) { document.removeEventListener('pointerup', pointerUpListenerRef.current); document.removeEventListener('pointercancel', pointerUpListenerRef.current); pointerUpListenerRef.current = null; } isScrollingRef.current = false;
  }, []);

  // Function to reset internal state cleanly
  const resetState = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    clearScrollDelayLogic();
    pressStartTimeRef.current = null;
    currentProgressRef.current = 0;
    lastReportedProgressRef.current = 0;
    onCompleteCalledRef.current = false;
    activePointerIdRef.current = null; // Reset active pointer
    setPointerType(null); // Reset pointer type state
    setElementBounds(null); // Reset bounds state
    setProgress(prev => prev === 0 ? 0 : 0);
    // Note: isPressed state is reset separately in endPress or destroy
  }, [clearScrollDelayLogic]);

  // Function to end the press interaction (called by pointerup/cancel/leave)
  const endPress = useCallback((eventSource = 'unknown') => { // Added eventSource for debugging
    // console.log(`endPress called from: ${eventSource}`, `isPressedRef: ${isPressedRef.current}`); // Debug log
    clearScrollDelayLogic(); // Clear any pending scroll delay timeout first

    // Only proceed if the hook thinks it's pressed
    if (!isPressedRef.current) {
        // console.log("endPress aborted: isPressedRef is false"); // Debug log
        return;
    }

    // Release pointer capture if using elementRef and we have an active pointer ID
    const element = optionsRef.current.elementRef?.current;
    if (element && activePointerIdRef.current !== null) {
        try {
            // Check if the element still has capture for this pointer before releasing
            if (element.hasPointerCapture(activePointerIdRef.current)) {
                 element.releasePointerCapture(activePointerIdRef.current);
                 // console.log(`Pointer capture released for ID: ${activePointerIdRef.current}`); // Debug log
            }
        } catch (error) {
             // Ignore errors (e.g., capture already released)
             // console.warn("Error releasing pointer capture:", error); // Debug log
        }
    }


    // Reset state *before* setting isPressed to false
    // Store final progress before reset if needed
    // const finalProgress = currentProgressRef.current;
    resetState();

    // Now update the state and trigger callbacks
    setIsPressed(false); // This will trigger the useEffect to update isPressedRef

    if (optionsRef.current.onPressStateChange) {
      try { optionsRef.current.onPressStateChange(false); } catch (error) { handleError(error); }
    }
    // Optionally call onProgressChange(finalProgress) or onProgressChange(0) here if needed
  }, [resetState, handleError, clearScrollDelayLogic]); // isPressedRef is implicitly handled via setIsPressed

  // Function to start the press interaction (now handles animation directly)
  const startPress = useCallback((pType: string | null, bounds: DOMRect | null, pointerId: number | null) => {
    // Called after scroll delay (if touch) or directly by pointerdown (mouse/pen).
    if (!isEnabledRef.current || isPressedRef.current) return; // Check ref

    // Store context info
    setPointerType(pType);
    setElementBounds(bounds);
    activePointerIdRef.current = pointerId; // Store the active pointer ID

    try {
      // Reset state needed for starting animation
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      pressStartTimeRef.current = null;
      currentProgressRef.current = 0;
      lastReportedProgressRef.current = 0;
      onCompleteCalledRef.current = false;
      setProgress(0);

      if (animationDisabled) {
        // ... (disabled animation logic unchanged) ...
        const finalProgress = 1; currentProgressRef.current = finalProgress; lastReportedProgressRef.current = finalProgress; setProgress(finalProgress); setIsPressed(true); if (optionsRef.current.onPressStateChange) optionsRef.current.onPressStateChange(true); if (optionsRef.current.onProgressChange) optionsRef.current.onProgressChange(finalProgress); if (optionsRef.current.onComplete && !onCompleteCalledRef.current) { optionsRef.current.onComplete(); onCompleteCalledRef.current = true; } return;
      }

      // Normal animation start
      pressStartTimeRef.current = getNow();
      setIsPressed(true); // Update state -> updates ref via useEffect
      if (optionsRef.current.onPressStateChange) optionsRef.current.onPressStateChange(true);
      if (optionsRef.current.onProgressChange && lastReportedProgressRef.current !== 0) { lastReportedProgressRef.current = 0; optionsRef.current.onProgressChange(0); }
      animationFrameRef.current = requestAnimationFrame(animate);
    } catch (error) {
      handleError(error);
      setIsPressed(false);
      resetState();
    }
  }, [resetState, animate, handleError, getNow, animationDisabled]); // Removed isPressed dependency

  // Intermediate handler for pointer down (touch only) to implement scroll delay
  const handlePointerDownWithScrollDelay = useCallback((pType: string | null, bounds: DOMRect | null, pointerId: number | null) => {
    // Assumes called only for pointerType === 'touch' and isPrimary
    if (!isEnabledRef.current || isPressedRef.current) return; // Check ref
    clearScrollDelayLogic();
    isScrollingRef.current = false;

    // Define listeners for this specific pointer interaction
    const handlePointerMove = () => { isScrollingRef.current = true; clearScrollDelayLogic(); };
    const handlePointerUp = () => { clearScrollDelayLogic(); };

    // Store references to remove the correct listeners
    pointerMoveListenerRef.current = handlePointerMove;
    pointerUpListenerRef.current = handlePointerUp;

    // Add temporary listeners to detect scroll (pointer events)
    document.addEventListener('pointermove', handlePointerMove, { passive: true, capture: false });
    document.addEventListener('pointerup', handlePointerUp, { passive: true, capture: false });
    document.addEventListener('pointercancel', handlePointerUp, { passive: true, capture: false });

    // Start the delay timer
    scrollDelayTimeoutRef.current = setTimeout(() => {
      // Timeout completed - cleanup listeners first
      if (pointerMoveListenerRef.current) { document.removeEventListener('pointermove', pointerMoveListenerRef.current); pointerMoveListenerRef.current = null; }
      if (pointerUpListenerRef.current) { document.removeEventListener('pointerup', pointerUpListenerRef.current); document.removeEventListener('pointercancel', pointerUpListenerRef.current); pointerUpListenerRef.current = null; }
      scrollDelayTimeoutRef.current = null;

      // Only start the press if scrolling didn't occur
      if (!isScrollingRef.current) {
        startPress(pType, bounds, pointerId); // Pass context info
      }
      isScrollingRef.current = false;
    }, optionsRef.current.touchScrollDelay);

  }, [isEnabledRef, clearScrollDelayLogic, startPress]); // Removed isPressed dependency


  // Explicit destroy function also clears scroll delay
  const destroy = useCallback(() => {
    // Store current pressed state before reset
    const wasPressed = isPressedRef.current;
    resetState(); // Includes clearing scroll delay logic
    // Ensure isPressed state is false, potentially notifying listeners only if it was pressed before
    if (wasPressed) {
        setIsPressed(false); // Update state
        if (optionsRef.current.onPressStateChange) {
            try { optionsRef.current.onPressStateChange(false); } catch (error) { handleError(error); }
        }
    }
  }, [resetState, handleError]); // Removed isPressed dependency

  // Effect for managing global listeners (Pointer Events)
  useIsomorphicLayoutEffect(() => {
    // Skip if elementRef is used (local binding handles release via capture/leave)
    // OR if global listeners are explicitly disabled
    if (optionsRef.current.elementRef?.current || !optionsRef.current.useGlobalListeners) return;

    // Define global listener handlers for pointer events
    const handleGlobalPointerUp = (event: PointerEvent) => {
        // End press only if the active pointer is the one being released globally
        if (activePointerIdRef.current === event.pointerId) {
             endPress('global pointer up');
        }
    };
    const handleGlobalPointerCancel = (event: PointerEvent) => {
        if (activePointerIdRef.current === event.pointerId) {
            endPress('global pointer cancel');
        }
    };
    const handleGlobalBlur = () => { endPress('global blur'); };

    let globalListenersActive = false;
    // Define add/remove functions inside effect to capture correct endPress
    const addGlobalListeners = () => {
      if (!globalListenersActive) {
        document.addEventListener('pointerup', handleGlobalPointerUp, optionsRef.current.listenerOptions);
        document.addEventListener('pointercancel', handleGlobalPointerCancel, optionsRef.current.listenerOptions);
        window.addEventListener('blur', handleGlobalBlur);
        globalListenersActive = true;
      }
    };
    const removeGlobalListeners = () => {
      if (globalListenersActive) {
        document.removeEventListener('pointerup', handleGlobalPointerUp, optionsRef.current.listenerOptions);
        document.removeEventListener('pointercancel', handleGlobalPointerCancel, optionsRef.current.listenerOptions);
        window.removeEventListener('blur', handleGlobalBlur);
        globalListenersActive = false;
      }
    };


    // Logic for adding/removing based on isPressed state (now using isPressedRef)
    if (isPressedRef.current && isEnabledRef.current) {
       addGlobalListeners();
    } else {
       removeGlobalListeners();
    }

    // Cleanup function for this effect
    return () => {
      removeGlobalListeners();
      if (animationFrameRef.current) { cancelAnimationFrame(animationFrameRef.current); animationFrameRef.current = null; }
      clearScrollDelayLogic();
    };
    // Dependency on isPressed state ensures listeners are updated correctly
  }, [isPressed, endPress, options.listenerOptions, options.elementRef, options.useGlobalListeners, isEnabled, clearScrollDelayLogic]);


  // Memoize event handlers using Pointer Events
  const eventHandlers = useMemo((): PressEventHandlers | null => {
    if (optionsRef.current.elementRef) { return null; }

    return {
      onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
        if (!e.isPrimary || isPressedRef.current) return; // Check ref
        const bounds = (e.target as HTMLElement).getBoundingClientRect();
        const pType = e.pointerType;
        const pId = e.pointerId;
        if (pType === 'touch') {
          handlePointerDownWithScrollDelay(pType, bounds, pId);
        } else {
          startPress(pType, bounds, pId);
        }
        // Note: Cannot reliably set/release pointer capture here with React's synthetic events
      },
      onPointerUp: (e: React.PointerEvent<HTMLElement>) => {
        // End press only if this is the primary pointer that started it
        if (!e.isPrimary || activePointerIdRef.current !== e.pointerId) return;
        endPress('handler pointer up');
      },
      onPointerCancel: (e: React.PointerEvent<HTMLElement>) => {
        if (!e.isPrimary || activePointerIdRef.current !== e.pointerId) return;
        endPress('handler pointer cancel');
      },
      onPointerLeave: (e: React.PointerEvent<HTMLElement>) => {
        // End press if pointer leaves while pressed, and configured to do so.
        // Check if the pointer leaving is the active one
        if (activePointerIdRef.current !== e.pointerId) return;
        if (isPressedRef.current && optionsRef.current.cancelOnLeave) { // Check ref and option
             endPress('handler pointer leave');
        }
      },
    };
    // isPressedRef is not a state/prop, accessing .current doesn't require dependency.
    // But handlers depend on optionsRef.current.cancelOnLeave implicitly.
  }, [startPress, endPress, handlePointerDownWithScrollDelay, options.elementRef, options.cancelOnLeave]);


  // Effect for binding handlers directly to elementRef using Pointer Events
  useIsomorphicLayoutEffect(() => {
    const element = optionsRef.current.elementRef?.current;
    if (!element || !eventHandlers === false) return; // Only run if elementRef is provided

    const handlePointerDown = (e: PointerEvent) => {
      if (!e.isPrimary || isPressedRef.current) return; // Check ref
      const bounds = element.getBoundingClientRect(); // Get bounds from element
      const pType = e.pointerType;
      const pId = e.pointerId;
      try {
          // Attempt to capture pointer only if not already captured by this element
          if (!element.hasPointerCapture(pId)) {
              element.setPointerCapture(pId);
              // console.log(`Pointer capture set for ID: ${pId}`); // Debug log
          }
      } catch (error) {
          console.error("Failed to set pointer capture:", error);
      }

      if (pType === 'touch') {
        handlePointerDownWithScrollDelay(pType, bounds, pId);
      } else {
        startPress(pType, bounds, pId);
      }
    };
    const handlePointerUp = (e: PointerEvent) => {
      if (!e.isPrimary || activePointerIdRef.current !== e.pointerId) return;
      // Release capture handled within endPress
      endPress('element pointer up');
    };
    const handlePointerCancel = (e: PointerEvent) => {
      if (!e.isPrimary || activePointerIdRef.current !== e.pointerId) return;
      // Release capture handled within endPress
      endPress('element pointer cancel');
    };
    const handlePointerLeave = (e: PointerEvent) => {
       // End press if the active pointer leaves while pressed, and configured to do so.
       if (activePointerIdRef.current !== e.pointerId) return;
       if (isPressedRef.current && optionsRef.current.cancelOnLeave) { // Check ref and option
           // Release capture handled within endPress
           endPress('element pointer leave');
       }
     };

    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointerup', handlePointerUp);
    element.addEventListener('pointercancel', handlePointerCancel);
    element.addEventListener('pointerleave', handlePointerLeave);

    // Cleanup function
    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointerup', handlePointerUp);
      element.removeEventListener('pointercancel', handlePointerCancel);
      element.removeEventListener('pointerleave', handlePointerLeave);
      // Ensure capture is released and state reset if element unmounts while pressed
      if (isPressedRef.current) {
          endPress('element unmount cleanup');
      } else {
          // Still clear scroll delay if unmounting during that phase
          clearScrollDelayLogic();
      }
    };
    // Dependencies reflect functions and options used inside
  }, [startPress, endPress, handlePointerDownWithScrollDelay, options.elementRef, options.listenerOptions, options.cancelOnLeave, clearScrollDelayLogic]);


  return {
    isPressed,
    progress,
    eventHandlers,
    startPress: () => startPress(null, null, null), // Manual start has no context
    endPress: () => endPress('manual endPress call'), // Manual end
    reset: resetState,
    destroy,
    // New return values
    pointerType,
    elementBounds
  };
}


/**
 * ============================================================================
 * Derived Hook: usePressAndHold
 * ============================================================================
 * Builds upon usePressProgress to provide calculated styles for a visual indicator.
 * (No changes needed in this hook, it inherits updates from usePressProgress)
 */
// ... (usePressAndHold hook remains unchanged from previous version) ...
/** Result of the tab style calculation */
export interface TabStyles { height: string; top: string; }
/** Configuration options for the usePressAndHold hook */
export interface PressAndHoldOptions extends Omit<PressProgressOptions, 'onProgressChange' | 'onPressStateChange'> { initialHeight?: string; minHeight?: string; onProgressChange?: (progress: number) => void; onPressStateChange?: (isPressed: boolean) => void; getTabStyle?: (progress: number) => Partial<React.CSSProperties>; }
/** Return value from the usePressAndHold hook */
// **[Update]** Ensure PressAndHoldResult includes the fields from PressProgressResult it passes through
export interface PressAndHoldResult extends Omit<PressProgressResult, 'progress'> {
    pressProgress: number; // Renamed from 'progress'
    tabStyles: TabStyles | Partial<React.CSSProperties>;
}
/** A hook for creating press-and-hold interactions with animated progress and calculated styles for a visual indicator. */
export function usePressAndHold( options: PressAndHoldOptions ): PressAndHoldResult {
  const { initialHeight, minHeight, getTabStyle, onProgressChange: onProgressChangeOption, onPressStateChange: onPressStateChangeOption, ...coreOptions } = options;
  const handleProgressChange = useCallback((p: number) => { if (onProgressChangeOption) { onProgressChangeOption(p); } }, [onProgressChangeOption]);
  const handlePressStateChange = useCallback((pressed: boolean) => { if (onPressStateChangeOption) { onPressStateChangeOption(pressed); } }, [onPressStateChangeOption]);
  // Pass pointerType and elementBounds through from usePressProgress
  // Destructure 'progress' and rename it to 'pressProgress' for the return value
  const { progress: pressProgress, ...baseResult } = usePressProgress({ ...coreOptions, onProgressChange: handleProgressChange, onPressStateChange: handlePressStateChange, });
  const tabStyles = useMemo((): TabStyles | Partial<React.CSSProperties> => {
      // **[Fix]** Use pressProgress in calculations
      try {
          if (getTabStyle) {
              const customStyles = getTabStyle(pressProgress); // Use pressProgress
              if (customStyles !== null && typeof customStyles === 'object' && !Array.isArray(customStyles)) { return customStyles; }
              else { console.warn("usePressAndHold: getTabStyle function returned an invalid value..."); return {}; }
          }
          let initialValue: number | undefined; if (typeof initialHeight === 'string') { initialValue = parseFloat(initialHeight); if (isNaN(initialValue)) { console.warn("usePressAndHold: Invalid initialHeight provided..."); initialValue = undefined; } }
          let minValue: number | undefined; if (typeof minHeight === 'string') { minValue = parseFloat(minHeight); if (isNaN(minValue)) { console.warn("usePressAndHold: Invalid minHeight provided..."); minValue = undefined; } }
          if (initialValue === undefined || minValue === undefined) { if (!getTabStyle) { console.warn("usePressAndHold: initialHeight and minHeight props are required..."); } const fallbackHeight = initialValue !== undefined ? `${initialValue}%` : '0%'; return { height: fallbackHeight, top: '40%' }; }
          const currentHeight = initialValue - (pressProgress * (initialValue - minValue)); // Use pressProgress
          const initialTop = 40; const pressedTop = 45;
          const currentTop = initialTop + (pressProgress * (pressedTop - initialTop)); // Use pressProgress
          return { height: `${currentHeight}%`, top: `${currentTop}%` };
      } catch (error) {
          if (options.onError) { const err = error instanceof Error ? error : new Error(String(error)); options.onError(new Error(`Style calculation failed: ${err.message}`)); }
          else { console.error("usePressAndHold style calculation error:", error); }
          const fallbackHeight = (typeof initialHeight === 'string' && !isNaN(parseFloat(initialHeight))) ? initialHeight : '0%'; return getTabStyle ? {} : { height: fallbackHeight, top: '40%' };
      }
  }, [initialHeight, minHeight, pressProgress, getTabStyle, options.onError]); // Use pressProgress here
  // Combine the base result (which includes isPressed, eventHandlers, etc.) with the specific fields for this hook
  return { ...baseResult, pressProgress, tabStyles };
}


/**
 * ============================================================================
 * [New] Debug Hook: usePressDebugOverlay
 * ============================================================================
 * Renders a simple overlay displaying state from usePressProgress/usePressAndHold.
 */

/** Props for the usePressDebugOverlay hook */
export interface PressDebugOverlayProps {
  /** The result object returned from usePressProgress or usePressAndHold. */
  // **[Fix]** Define expected shape explicitly instead of union type for easier access
  pressState: {
      isPressed: boolean;
      progress?: number; // From usePressProgress
      pressProgress?: number; // From usePressAndHold
      pointerType: string | null;
      elementBounds: DOMRect | null;
  };
  /** Optional: Style overrides for the overlay container. */
  style?: React.CSSProperties;
  /** Optional: Class name for the overlay container. */
  className?: string;
}

/**
 * A hook that provides a React element to visualize the state of a press interaction.
 * Attach the returned element to your component's render output.
 * NOTE: This hook uses React.createElement and assumes it's used in an environment
 * where React is available. For JSX, use a .tsx file.
 */
export function usePressDebugOverlay({ pressState, style, className }: PressDebugOverlayProps): React.ReactElement | null {
  const { isPressed, pointerType, elementBounds } = pressState;
  // **[Fix]** Access progress reliably from the union type
  const progress = pressState.progress ?? pressState.pressProgress ?? 0;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed', // Use fixed to position relative to viewport
    left: `${elementBounds?.left ?? 0}px`,
    top: `${(elementBounds?.bottom ?? 0) + 5}px`, // Position below the element
    background: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '4px 8px',
    fontSize: '10px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    zIndex: 9999,
    pointerEvents: 'none',
    whiteSpace: 'pre', // Use 'pre' to respect newline characters
    opacity: isPressed || progress > 0 ? 1 : 0.5,
    transition: 'opacity 0.2s ease-in-out',
    ...style,
  };

  const boundsString = elementBounds
   ? `L:${Math.round(elementBounds.left)} T:${Math.round(elementBounds.top)} W:${Math.round(elementBounds.width)} H:${Math.round(elementBounds.height)}`
   : 'N/A';

  // **[Fix]** Use React.createElement instead of JSX
  const content = `Pressed: ${isPressed.toString()}\nProgress: ${progress.toFixed(3)}\nPointer: ${pointerType ?? 'N/A'}\nBounds: ${boundsString}`;

  return React.createElement(
      'div',
      {
          style: overlayStyle,
          className: className
      },
      content // Pass content as a single string child, newlines handled by white-space: pre
  );
}


// Default export remains usePressAndHold
export default usePressAndHold;

