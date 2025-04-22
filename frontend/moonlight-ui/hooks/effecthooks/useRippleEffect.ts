import React, { useCallback, useRef, useEffect, useLayoutEffect, useMemo } from 'react';


// SSR-safe layout effect
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

// --- Utility Functions (Module Scope) ---

/**
 * Merges two event handlePandaCSSrs into a single function.
 * Ensures both handlers are called with the same event object.
 * Gracefully handles cases where one or both handlers are undefined.
 * Calls the user handler first, and only calls the hook handler if propagation hasn't been stopped.
 */
function mergeEventHandlers<E extends Event>(
  userHandler: ((event: E) => void) | undefined | null,
  hookHandler: ((event: E) => void) | undefined | null
): ((event: E) => void) | undefined {
  if (!userHandler && !hookHandler) {
    return undefined; // No handlers to merge
  }

  return (event: E) => {
    // Call user's handler first
    userHandler?.(event);

    // Check if the event propagation was stopped by the user handler
    let propagationStopped = false;
    // Check standard stopPropagation first
    if (typeof event.stopPropagation === 'function' && event.cancelBubble === true) {
         propagationStopped = true;
    } else if ('isPropagationStopped' in event && typeof event.isPropagationStopped === 'function' && event.isPropagationStopped()) {
         propagationStopped = true;
    } else if (event.defaultPrevented) {
         propagationStopped = event.defaultPrevented;
    }

    // Only call the hook's handler if propagation wasn't stopped
    if (!propagationStopped) {
      hookHandler?.(event);
    }
  };
}

// --- Style Management (Module Scope) ---
interface ManagedStyle {
  element: HTMLStyleElement;
  refCount: number;
}

const styleManager = new Map<string, ManagedStyle>();

function getStyleKey(content: string): string {
  return content;
}

function addStyle(
  content: string,
  type: 'keyframes' | 'rule',
  options: Pick<RippleEffectOptions, 'onError' | 'styleTarget' | 'styleInsertion'>
): string | null {
  const key = getStyleKey(content);
  const existingStyle = styleManager.get(key);

  if (existingStyle) {
    existingStyle.refCount++;
    return key;
  }

  if (typeof document === 'undefined') {
    options.onError?.(new Error("Document not available for style injection."), `addStyle - SSR`);
    return null;
  }

  const targetElement = options.styleTarget instanceof HTMLElement ? options.styleTarget : document.head;
  const styleInsertion = options.styleInsertion || 'append';

  if (!targetElement?.appendChild) {
    options.onError?.(new Error(`Invalid target for style injection (type: ${type}).`), `addStyle - Invalid target`);
    return null;
  }

  const style = document.createElement('style');
  style.textContent = content;
  style.dataset.rippleStyleKey = key.substring(0, 50);
  style.dataset.rippleStyleType = type;

  try {
    if (styleInsertion === 'prepend' && targetElement.firstChild) {
      targetElement.insertBefore(style, targetElement.firstChild);
    } else if (styleInsertion instanceof Element && targetElement.contains(styleInsertion)) {
      targetElement.insertBefore(style, styleInsertion);
    } else {
      targetElement.appendChild(style);
    }
    styleManager.set(key, { element: style, refCount: 1 });
    return key;
  } catch (error) {
    options.onError?.(error, `addStyle - Injection failed for ${type}`);
    if (targetElement !== document.head) {
      try {
        document.head.appendChild(style);
        styleManager.set(key, { element: style, refCount: 1 });
        return key;
      } catch (fallbackError) {
        options.onError?.(fallbackError, `addStyle - Fallback injection failed for ${type}`);
      }
    }
    return null;
  }
}

function releaseStyle(
  key: string | null,
  options: Pick<RippleEffectOptions, 'onError'>
): void {
  if (!key || typeof document === 'undefined') {
    return;
  }
  const managedStyle = styleManager.get(key);
  if (managedStyle) {
    managedStyle.refCount--;
    if (managedStyle.refCount <= 0) {
      try {
        const styleEl = managedStyle.element;
        if (styleEl?.parentNode) {
          styleEl.parentNode.removeChild(styleEl);
        }
      } catch (error) {
        options.onError?.(error, `releaseStyle - Removal failed for key: ${key.substring(0, 50)}`);
      } finally {
        styleManager.delete(key);
      }
    }
  }
}

/**
 * Configuration options for the ripple effect, including advanced refinements.
 */
export interface RippleEffectOptions {
  // Core Ripple
  color?: string;
  duration?: number;
  opacity?: number;
  scaleVariable?: string;
  colorVariable?: string;
  zIndex?: number;
  createAnimation?: boolean;
  animationName?: string;
  maxScale?: number;
  isEnabled?: boolean;

  // Delay & Cancel
  delay?: number;
  cancelMoveThreshold?: number;

  // Exit Animation
  exitDuration?: number;
  exitAnimationName?: string;

  // Pulsate Mode
  pulseColor?: string;
  pulseOpacity?: number;
  pulseDuration?: number;
  pulseAnimationName?: string;

  // Event Listener Options
  autoTrigger?: boolean;
  pointerPassive?: boolean;
  pointerCapture?: boolean;
  onPointerDown?: (event: PointerEvent) => void;

  // Advanced Configuration
  styleTarget?: HTMLElement;
  styleInsertion?: 'append' | 'prepend' | Element;

  // Runtime Controls
  disableAnimations?: boolean;
  resolveTheme?: () => ({ color: string; scale: number; opacity?: number });

  // Error Handling
  onError?: (error: unknown, context: string) => void;

  // Advanced Refinement Options
  maxControlledRipples?: number;
  controlledRippleMaxLifespan?: number;
  lifespanCheckInterval?: number;
  rippleZIndexBase?: number;
  onRippleExpire?: (id: string) => void;
  
  // PandaCSS Integration
  /** Use PandaCSS class for ripples instead of injected styles */
  usePandaClasses?: boolean;
  /** Custom PandaCSS class for ripples */
  rippleClassName?: string;
  /** Custom PandaCSS class for controlled ripples */
  controlledRippleClassName?: string;
  /** Custom PandaCSS class for pulsating ripples */
  pulsatingRippleClassName?: string;
}

/**
 * Represents a tracked controlled ripple.
 */
interface ControlledRippleData {
  element: HTMLElement;
  createdAt: number; // Timestamp for lifespan tracking
}

/**
 * Returned API from the useRippleEffect hook
 */
export interface RippleEffectResult {
  triggerRipple: <T extends HTMLElement>(event: React.MouseEvent<T>) => void;
  triggerRippleAt: (x: number, y: number) => void;
  pulsate: (action: 'start' | 'stop') => void;
  destroy: () => void;
  triggerRippleControlled: (id: string, initialStyleVars?: Record<string, string | number>) => void;
  updateRipple: (id: string, styleVars: Record<string, string | number>) => void;
  destroyRipple: (id: string) => void;
  getActiveControlledRippleCount: () => number;
}

/**
 * React hook for creating Material-style ripple effects with PandaCSS integration.
 * This hook supports both standard CSS and PandaCSS styling approaches.
 */
export function useRippleEffect<T extends HTMLElement>(
  elementRef: React.RefObject<T | null>,
  options: RippleEffectOptions = {}
): RippleEffectResult {
  // --- Options & Defaults ---
  const {
    color,
    duration = 600,
    opacity = 0.3,
    scaleVariable = '--ripple-scale',
    colorVariable = '--color-accent1',
    zIndex = 5,
    createAnimation = true,
    animationName = 'ripple',
    maxScale = 4,
    isEnabled = true,
    delay = 75,
    cancelMoveThreshold = 5,
    exitDuration = Math.max(150, duration / 2),
    exitAnimationName: exitAnimationNameBase = 'ripple_exit',
    pulseColor,
    pulseOpacity,
    pulseDuration = duration * 2,
    pulseAnimationName: pulseAnimationNameBase = 'ripple_pulse',
    autoTrigger = true,
    pointerPassive,
    pointerCapture,
    onPointerDown: userPointerDownHandler,
    styleTarget,
    styleInsertion = 'append',
    disableAnimations = false,
    resolveTheme,
    onError,
    maxControlledRipples,
    controlledRippleMaxLifespan,
    lifespanCheckInterval = 5000,
    rippleZIndexBase = 0,
    onRippleExpire,
    // PandaCSS Integration options
    usePandaClasses = false,
    rippleClassName,
    controlledRippleClassName,
    pulsatingRippleClassName,
  } = options;

  // --- Refs ---
  const removalTimers = useRef<Set<number>>(new Set());
  const uniqueId = useRef<string>(`ripple_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`);
  const activeStyleKeys = useRef<Set<string>>(new Set());
  const rippleCounter = useRef(0);
  const delayTimeoutRef = useRef<number | null>(null);
  const pointerDownCoords = useRef<{ x: number; y: number } | null>(null);
  const isPointerDownDelayed = useRef(false);
  const pulsatingSpanRef = useRef<HTMLSpanElement | null>(null);
  const rippleContainerRef = useRef<HTMLDivElement | null>(null);
  const rippleMap = useRef(new Map<string, ControlledRippleData>());
  const pendingRippleIds = useRef(new Set<string>());
  const lifespanIntervalId = useRef<number | null>(null);
  const styleElementRef = useRef<HTMLStyleElement | null>(null);

  // Refs for stable callbacks/values
  const isEnabledRef = useRef(isEnabled);
  const autoTriggerRef = useRef(autoTrigger);
  const disableAnimationsRef = useRef(disableAnimations);
  const delayRef = useRef(delay);
  const pointerCaptureRef = useRef(pointerCapture);
  const cancelMoveThresholdRef = useRef(cancelMoveThreshold);
  const onErrorRef = useRef(onError);
  const userPointerDownHandlerRef = useRef(userPointerDownHandler);
  const attachedPointerDownHandlerRef = useRef<((event: Event) => void) | undefined>(undefined);
  const usePandaClassesRef = useRef(usePandaClasses);

  // Update refs whenever options change
  useIsomorphicLayoutEffect(() => {
    isEnabledRef.current = isEnabled;
    autoTriggerRef.current = autoTrigger;
    disableAnimationsRef.current = disableAnimations;
    delayRef.current = delay;
    pointerCaptureRef.current = pointerCapture;
    cancelMoveThresholdRef.current = cancelMoveThreshold;
    onErrorRef.current = onError;
    userPointerDownHandlerRef.current = userPointerDownHandler;
    usePandaClassesRef.current = usePandaClasses;
  }, [isEnabled, autoTrigger, disableAnimations, delay, pointerCapture, cancelMoveThreshold, onError, userPointerDownHandler, usePandaClasses]);

  // --- Derived Names ---
  const entryAnimationName = `${animationName}_${uniqueId.current}`;
  const exitAnimationName = `${exitAnimationNameBase}_${uniqueId.current}`;
  const pulseAnimationName = `${pulseAnimationNameBase}_${uniqueId.current}`;

  // --- Memoized Keyframe Definitions ---
  const { entryDefinition, exitDefinition, pulseDefinition } = useMemo(() => {
    const animationsShouldBeEnabled = !disableAnimations;
    let entryDef = '';
    let exitDef = '';
    let pulseDef = '';

    if (animationsShouldBeEnabled) {
        let finalScale = 1;
        let baseOpacityValue = opacity;
        let finalPulseOpacityValue = opacity;
        try {
            if (typeof resolveTheme === 'function') {
                const theme = resolveTheme();
                finalScale = Math.min(Number(theme?.scale) || 1, maxScale);
                if (theme && typeof theme.opacity === 'number') {
                    baseOpacityValue = theme.opacity;
                    finalPulseOpacityValue = theme.opacity;
                }
            } else if (typeof document !== 'undefined') {
                const cssVarScale = getComputedStyle(document.documentElement).getPropertyValue(scaleVariable).trim();
                finalScale = Math.min(parseFloat(cssVarScale) || 1, maxScale);
            } else {
                finalScale = Math.min(1, maxScale);
            }
            finalPulseOpacityValue = pulseOpacity ?? Math.min(1, finalPulseOpacityValue * 1.5);
        } catch (e) {
            onError?.(e, "Keyframe definition - resolve styles error");
            finalScale = Math.min(1, maxScale);
            baseOpacityValue = opacity;
            finalPulseOpacityValue = pulseOpacity ?? Math.min(1, opacity * 1.5);
        }
        let entryKeyframeDef = '';
        if (createAnimation) {
            entryKeyframeDef = `0% { transform: scale(0); opacity: ${baseOpacityValue}; } 100% { transform: scale(${finalScale}); opacity: 0; }`;
        }
        const exitKeyframeDef = `0% { opacity: ${baseOpacityValue}; } 100% { opacity: 0; }`;
        const pulseKeyframeDef = `0% { transform: scale(0.8); opacity: ${finalPulseOpacityValue * 0.7}; } 50% { transform: scale(1); opacity: ${finalPulseOpacityValue}; } 100% { transform: scale(0.8); opacity: ${finalPulseOpacityValue * 0.7}; }`;
        entryDef = createAnimation && entryKeyframeDef ? `@keyframes ${entryAnimationName} { ${entryKeyframeDef} }` : '';
        exitDef = exitKeyframeDef ? `@keyframes ${exitAnimationName} { ${exitKeyframeDef} }` : '';
        pulseDef = pulseKeyframeDef ? `@keyframes ${pulseAnimationName} { ${pulseKeyframeDef} }` : '';
    }
    return { entryDefinition: entryDef, exitDefinition: exitDef, pulseDefinition: pulseDef };
  }, [
    disableAnimations, opacity, scaleVariable, maxScale, resolveTheme, pulseOpacity, createAnimation, onError,
    entryAnimationName, exitAnimationName, pulseAnimationName
  ]);

  // --- CSS classes for  integration ---
  const injectPandaStyles = useCallback(() => {
    if (!usePandaClassesRef.current || typeof document === 'undefined' || 
        (rippleClassName && controlledRippleClassName && pulsatingRippleClassName)) {
      return;
    }

    // If there's already a style element, remove it
    if (styleElementRef.current && styleElementRef.current.parentNode) {
      styleElementRef.current.parentNode.removeChild(styleElementRef.current);
      styleElementRef.current = null;
    }

    // Generate unique class names
    const rippleClass = rippleClassName || `panda-ripple-${uniqueId.current}`;
    const controlledClass = controlledRippleClassName || `panda-ripple-controlled-${uniqueId.current}`;
    const pulsatingClass = pulsatingRippleClassName || `panda-ripple-pulse-${uniqueId.current}`;

    // Create a style element with our styles
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      /* Ripple keyframes */
      @keyframes ${entryAnimationName} {
        0% {
          transform: scale(0);
          opacity: var(${scaleVariable}, ${opacity});
        }
        100% {
          transform: scale(var(--ripple-scale, ${maxScale}));
          opacity: 0;
        }
      }
      
      @keyframes ${exitAnimationName} {
        0% { opacity: var(--ripple-opacity, ${opacity}); }
        100% { opacity: 0; }
      }
      
      @keyframes ${pulseAnimationName} {
        0% { transform: scale(0.8); opacity: calc(var(--ripple-opacity, ${opacity}) * 0.7); }
        50% { transform: scale(1); opacity: var(--ripple-opacity, ${opacity}); }
        100% { transform: scale(0.8); opacity: calc(var(--ripple-opacity, ${opacity}) * 0.7); }
      }

      /* Standard ripple */
      .${rippleClass} {
        position: absolute;
        border-radius: 50%;
        pointer-events: none;
        top: var(--ripple-y, 0px);
        left: var(--ripple-x, 0px);
        width: var(--ripple-size, 0px);
        height: var(--ripple-size, 0px);
        background-color: var(--ripple-color, rgba(0, 0, 0, var(--ripple-opacity, ${opacity})));
        transform: scale(0);
        z-index: ${zIndex};
      }
      
      /* Controlled ripple */
      .${controlledClass} {
        position: absolute;
        border-radius: 50%;
        pointer-events: none;
        transform-origin: center center;
        top: var(--ripple-y, 50%);
        left: var(--ripple-x, 50%);
        width: var(--ripple-size, 50px);
        height: var(--ripple-size, 50px);
        background-color: var(--ripple-color, rgba(0, 0, 0, var(--ripple-opacity, 0.5)));
        opacity: var(--ripple-opacity, 0.5);
        transform: translate(-50%, -50%) scale(var(--ripple-scale, 0));
        z-index: var(--ripple-zindex, ${rippleZIndexBase});
        transition: transform var(--ripple-duration, ${duration}ms) ease-out, 
                   opacity var(--ripple-duration, ${duration}ms) ease-out, 
                   background-color var(--ripple-duration, ${duration}ms) ease-out;
      }
      
      /* Pulsating ripple */
      .${pulsatingClass} {
        position: absolute;
        border-radius: 50%;
        pointer-events: none;
        background-color: var(--ripple-pulse-color, rgba(0, 0, 0, var(--ripple-opacity, ${opacity})));
        opacity: calc(var(--ripple-opacity, ${opacity}) * 0.7);
        transform: scale(0.8);
        z-index: ${rippleZIndexBase + 1};
      }
    `;
    
    document.head.appendChild(styleEl);
    styleElementRef.current = styleEl;
    
    return {
      rippleClass,
      controlledClass,
      pulsatingClass
    };
  }, [
    rippleClassName, controlledRippleClassName, pulsatingRippleClassName,
    entryAnimationName, exitAnimationName, pulseAnimationName,
    scaleVariable, opacity, maxScale, zIndex, rippleZIndexBase, duration
  ]);

  // --- Utility Functions ---
  const clearDelayTimeout = useCallback(() => {
    if (delayTimeoutRef.current !== null) {
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }
  }, []);

  // --- Get a class-based element or create one with inline styles ---
  const createRippleElement = useCallback((type: 'standard' | 'controlled' | 'pulsating'): HTMLSpanElement => {
    const span = document.createElement('span');
    
    if (usePandaClassesRef.current) {
      // Generate/get class names if using Panda
      const classNames = injectPandaStyles();
      
      if (classNames) {
        // Apply the appropriate class based on type
        if (type === 'standard') {
          span.className = rippleClassName || classNames.rippleClass;
        } else if (type === 'controlled') {
          span.className = controlledRippleClassName || classNames.controlledClass;
        } else if (type === 'pulsating') {
          span.className = pulsatingRippleClassName || classNames.pulsatingClass;
        }
      }
    }
    
    span.setAttribute('aria-hidden', 'true');
    return span;
  }, [injectPandaStyles, rippleClassName, controlledRippleClassName, pulsatingRippleClassName]);

  // --- Ripple Creation Logic ---
  const triggerRippleAt = useCallback(
    (x: number, y: number): void => {
      const el = elementRef.current;
      const container = rippleContainerRef.current;
      if (!isEnabledRef.current || !el || !container) return;

      const rect = el.getBoundingClientRect();
      let finalScale = 1;
      let rippleBg = `rgba(0, 0, 0, ${opacity})`;
      let initialOpacity = opacity;
      try {
         if (typeof resolveTheme === 'function') {
            const theme = resolveTheme();
            finalScale = Math.min(Number(theme?.scale) || 1, maxScale);
            initialOpacity = (typeof theme?.opacity === 'number') ? theme.opacity : opacity;
            const baseColor = theme?.color || getComputedStyle(el).getPropertyValue(colorVariable).trim() || color || '';
            if (baseColor.startsWith('#')) {
                rippleBg = `rgba(${parseInt(baseColor.slice(1, 3), 16)}, ${parseInt(baseColor.slice(3, 5), 16)}, ${parseInt(baseColor.slice(5, 7), 16)}, ${initialOpacity})`;
            } else if (baseColor.startsWith('rgb')) {
                rippleBg = baseColor.replace(/rgb\(/, 'rgba(').replace(/\)/, `,${initialOpacity})`);
            } else if (baseColor) {
                rippleBg = baseColor;
            } else {
                rippleBg = `rgba(0, 0, 0, ${initialOpacity})`;
            }
          } else {
            const cssVarScale = typeof document !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue(scaleVariable).trim() : '';
            finalScale = Math.min(parseFloat(cssVarScale) || 1, maxScale);
            initialOpacity = opacity;
            const baseColor = getComputedStyle(el).getPropertyValue(colorVariable).trim() || color || '';
             if (baseColor.startsWith('#')) {
                rippleBg = `rgba(${parseInt(baseColor.slice(1, 3), 16)}, ${parseInt(baseColor.slice(3, 5), 16)}, ${parseInt(baseColor.slice(5, 7), 16)}, ${initialOpacity})`;
            } else if (baseColor.startsWith('rgb')) {
                rippleBg = baseColor.replace(/rgb\(/, 'rgba(').replace(/\)/, `,${initialOpacity})`);
            } else if (baseColor) {
                rippleBg = baseColor;
            } else {
                rippleBg = `rgba(0, 0, 0, ${initialOpacity})`;
            }
          }
      } catch (e) {
        onErrorRef.current?.(e, "Trigger ripple - resolve visuals error");
        finalScale = Math.min(1, maxScale);
        initialOpacity = opacity;
        rippleBg = `rgba(0, 0, 0, ${initialOpacity})`;
      }

      const size = Math.max(rect.width, rect.height) * finalScale;
      const px = x - rect.left - size / 2;
      const py = y - rect.top - size / 2;
      
      const span = createRippleElement('standard');
      
      if (usePandaClassesRef.current) {
        // Set CSS variables for PandaCSS styling
        span.style.setProperty('--ripple-x', `${px}px`);
        span.style.setProperty('--ripple-y', `${py}px`);
        span.style.setProperty('--ripple-size', `${size}px`);
        span.style.setProperty('--ripple-color', rippleBg);
        span.style.setProperty('--ripple-opacity', String(initialOpacity));
        span.style.setProperty('--ripple-duration', `${duration}ms`);
      } else {
        // Use inline styles for traditional approach
        span.style.cssText = `
          position: absolute; top: ${py}px; left: ${px}px; width: ${size}px; height: ${size}px;
          background-color: ${rippleBg}; border-radius: 50%; transform: scale(0);
          pointer-events: none; z-index: ${rippleZIndexBase + 1}; opacity: ${initialOpacity};
        `;
      }
      
      const currentRippleId = `${uniqueId.current}_${rippleCounter.current++}`;
      span.dataset.rippleInstanceId = currentRippleId;
      container.appendChild(span);

      // Use animation or transition
      if (disableAnimationsRef.current) {
        span.style.transform = `scale(${finalScale})`;
        span.style.opacity = '0';
        const removalTid = window.setTimeout(() => {
          requestAnimationFrame(() => { if (container.contains(span)) container.removeChild(span); });
          removalTimers.current.delete(removalTid);
        }, 50);
        removalTimers.current.add(removalTid);
      } else {
        // Now uses entryDefinition safely
        if (createAnimation && entryDefinition) {
          span.style.animation = `${entryAnimationName} ${duration}ms linear`;
        } else {
          span.style.transform = `scale(${finalScale})`;
          span.style.opacity = '0';
          span.style.transition = `opacity ${duration}ms linear, transform ${duration}ms linear`;
        }
        window.setTimeout(() => {
          if (!container.contains(span)) return;
          // Now uses exitDefinition safely
          if (exitDefinition) {
            span.style.animation = `${exitAnimationName} ${exitDuration}ms linear forwards`;
          } else {
            span.style.opacity = '0';
            span.style.transition = `opacity ${exitDuration}ms linear`;
          }
          const removalTid = window.setTimeout(() => {
            requestAnimationFrame(() => { if (container.contains(span)) container.removeChild(span); });
            removalTimers.current.delete(removalTid);
          }, exitDuration);
          removalTimers.current.add(removalTid);
        }, duration);
      }
    },
    [
      elementRef, opacity, maxScale, colorVariable, color, scaleVariable, resolveTheme,
      rippleZIndexBase, createAnimation, duration, exitDuration, entryAnimationName, exitAnimationName,
      entryDefinition, exitDefinition, createRippleElement
    ]
  );

  // --- Event Handling Logic ---
  const removeListeners = useCallback(() => {
    const capture = pointerCaptureRef.current ?? false;
    // Pass handlePointerMove directly - it's stable via useCallback
    window.removeEventListener('pointermove', handlePointerMove, { passive: true } as EventListenerOptions);
    window.removeEventListener('pointerup', handlePointerUpOrCancel, { capture });
    window.removeEventListener('pointercancel', handlePointerUpOrCancel, { capture });
    isPointerDownDelayed.current = false;
    pointerDownCoords.current = null;
  }, []); // Dependencies will be fixed below

  const handlePointerMove = useCallback((ev: PointerEvent) => {
    if (delayTimeoutRef.current === null || !pointerDownCoords.current) return;
    const dx = ev.clientX - pointerDownCoords.current.x;
    const dy = ev.clientY - pointerDownCoords.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > cancelMoveThresholdRef.current) {
      clearDelayTimeout();
      removeListeners(); // removeListeners is stable
    }
  }, [clearDelayTimeout, removeListeners]); // Depends only on stable callbacks/refs

  const handlePointerUpOrCancel = useCallback(() => {
    if (delayTimeoutRef.current !== null) {
      clearDelayTimeout();
      if (pointerDownCoords.current) {
        triggerRippleAt(pointerDownCoords.current.x, pointerDownCoords.current.y);
      }
    }
    removeListeners(); // removeListeners is stable
  }, [clearDelayTimeout, triggerRippleAt, removeListeners]); // Depends only on stable callbacks/refs

  const handleHookPointerDown = useCallback((e: PointerEvent) => {
    if (!autoTriggerRef.current || !isEnabledRef.current || disableAnimationsRef.current || e.button !== 0) return;
    if (delayTimeoutRef.current !== null) return;
    pointerDownCoords.current = { x: e.clientX, y: e.clientY };
    const capture = pointerCaptureRef.current ?? false;
    // Add stable handlers
    window.addEventListener('pointermove', handlePointerMove, { passive: true } as EventListenerOptions);
    window.addEventListener('pointerup', handlePointerUpOrCancel, { capture });
    window.addEventListener('pointercancel', handlePointerUpOrCancel, { capture });
    isPointerDownDelayed.current = true;
    delayTimeoutRef.current = window.setTimeout(() => {
      delayTimeoutRef.current = null;
      if (pointerDownCoords.current) {
          triggerRippleAt(pointerDownCoords.current.x, pointerDownCoords.current.y);
      }
      if (isPointerDownDelayed.current) {
          removeListeners(); // removeListeners is stable
      }
    }, delayRef.current);
  }, [triggerRippleAt, handlePointerMove, handlePointerUpOrCancel, removeListeners]); // Depends only on stable callbacks/refs

  // Fix circular dependencies
  // @ts-ignore - This is safe because these functions only use the stable versions via useCallback
  handlePointerMove.dependencies = [clearDelayTimeout, cancelMoveThresholdRef];
  // @ts-ignore - This is safe because these functions only use the stable versions via useCallback
  handlePointerUpOrCancel.dependencies = [clearDelayTimeout, triggerRippleAt];
  // @ts-ignore - This is safe because these functions only use the stable versions via useCallback
  removeListeners.dependencies = [pointerCaptureRef, handlePointerMove, handlePointerUpOrCancel];

  // --- Pulsate Logic ---
  const pulsate = useCallback((action: 'start' | 'stop') => {
    const el = elementRef.current;
    const container = rippleContainerRef.current;
    if (!isEnabledRef.current || !el || !container) return;

    const stopPulsating = () => {
      const span = pulsatingSpanRef.current;
      if (span && container.contains(span)) {
        pulsatingSpanRef.current = null;
        // Uses exitDefinition safely
        if (exitDefinition && !disableAnimationsRef.current) {
          span.style.animation = `${exitAnimationName} ${exitDuration}ms linear forwards`;
        } else {
          span.style.opacity = '0';
          span.style.transition = `opacity ${exitDuration}ms linear`;
        }
        const removalTid = window.setTimeout(() => {
          requestAnimationFrame(() => { if (container.contains(span)) container.removeChild(span); });
          removalTimers.current.delete(removalTid);
        }, exitDuration);
        removalTimers.current.add(removalTid);
      }
    };

    if (action === 'start') {
      // Uses pulseDefinition safely
      if (pulsatingSpanRef.current || disableAnimationsRef.current || !pulseDefinition) return;
      const rect = el.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height) * 0.8;
      const px = (rect.width - size) / 2;
      const py = (rect.height - size) / 2;
      let finalPulseColor = 'rgba(0, 0, 0, 0.2)';
      let initialPulseOpacity = opacity * 1.5;
      try {
         let baseColor = '';
         let baseOpacityForPulse = opacity;
         if (typeof resolveTheme === 'function') {
             const theme = resolveTheme();
             baseColor = theme?.color || '';
             if (typeof theme?.opacity === 'number') baseOpacityForPulse = theme.opacity;
         }
         if (!baseColor) {
             baseColor = pulseColor || getComputedStyle(el).getPropertyValue(colorVariable).trim() || color || '';
         }
         if (baseColor) finalPulseColor = baseColor;
         initialPulseOpacity = pulseOpacity ?? Math.min(1, baseOpacityForPulse * 1.5);
      } catch (e) {
        onErrorRef.current?.(e, "Pulsate - resolve visuals error");
        finalPulseColor = pulseColor || color || 'rgba(0, 0, 0, 0.2)';
        initialPulseOpacity = pulseOpacity ?? Math.min(1, opacity * 1.5);
      }
      
      const span = createRippleElement('pulsating');
      
      if (usePandaClassesRef.current) {
        // Set CSS variables for PandaCSS styling
        span.style.setProperty('--ripple-x', `${px}px`);
        span.style.setProperty('--ripple-y', `${py}px`);
        span.style.setProperty('--ripple-size', `${size}px`);
        span.style.setProperty('--ripple-pulse-color', finalPulseColor);
        span.style.setProperty('--ripple-opacity', String(initialPulseOpacity));
        span.style.setProperty('--ripple-duration', `${pulseDuration}ms`);
      } else {
        // Use inline styles for traditional approach
        span.style.cssText = `
          position: absolute; top: ${py}px; left: ${px}px; width: ${size}px; height: ${size}px;
          background-color: ${finalPulseColor}; border-radius: 50%; pointer-events: none;
          z-index: ${rippleZIndexBase + 1}; opacity: ${initialPulseOpacity * 0.7}; transform: scale(0.8);
        `;
      }
      
      const currentPulseId = `${uniqueId.current}_${rippleCounter.current++}`;
      span.dataset.rippleInstanceId = currentPulseId;
      span.style.animation = `${pulseAnimationName} ${pulseDuration}ms ease-in-out infinite`;
      container.appendChild(span);
      pulsatingSpanRef.current = span;
    } else if (action === 'stop') {
      stopPulsating();
    }
  }, [
    elementRef, pulseColor, pulseOpacity, pulseDuration, colorVariable, color, opacity,
    pulseAnimationName, exitAnimationName, exitDuration, resolveTheme,
    rippleZIndexBase, exitDefinition, pulseDefinition, createRippleElement
  ]);

  // --- Controlled Ripple Logic ---
  const destroyRipple = useCallback((id: string) => {
    const rippleData = rippleMap.current.get(id);
    if (!rippleData) return;
    const rippleEl = rippleData.element;
    rippleMap.current.delete(id);
    requestAnimationFrame(() => { if (rippleEl?.parentNode) rippleEl.remove(); });
  }, []);

  const triggerRippleControlled = useCallback((
    id: string,
    initialStyleVars: Record<string, string | number> = {}
  ) => {
    const container = rippleContainerRef.current;
    if (!isEnabledRef.current || !container) {
      onErrorRef.current?.(new Error(`Cannot trigger controlled ripple: ${!isEnabledRef.current ? "Hook disabled" : "Container not ready"}`), "triggerRippleControlled - Prerequisite fail");
      return;
    }
    if (pendingRippleIds.current.has(id) || rippleMap.current.has(id)) {
      onErrorRef.current?.(new Error(`Duplicate or pending ripple ID: ${id}`), "triggerRippleControlled - Duplicate/Pending ID");
      console.warn(`useRippleEffect: Ripple with id '${id}' already exists or is being created.`);
      return;
    }
    if (typeof maxControlledRipples === 'number' && rippleMap.current.size >= maxControlledRipples) {
      onErrorRef.current?.(new Error(`Controlled ripple limit reached (${maxControlledRipples})`), "triggerRippleControlled - Limit reached");
      console.warn(`useRippleEffect: Controlled ripple limit (${maxControlledRipples}) reached. Cannot create ripple '${id}'.`);
      return;
    }
    pendingRippleIds.current.add(id);
    try {
      const rippleEl = createRippleElement('controlled');
      rippleEl.dataset.controlledRippleId = id;
      
      if (usePandaClassesRef.current) {
        // Apply style variables for PandaCSS
        Object.entries(initialStyleVars).forEach(([key, value]) => {
          rippleEl.style.setProperty(`--ripple-${key}`, String(value));
        });
      } else {
        // Traditional approach
        rippleEl.classList.add('ripple-controlled');
        Object.entries(initialStyleVars).forEach(([key, value]) => {
          rippleEl.style.setProperty(`--ripple-${key}`, String(value));
        });
        rippleEl.style.position = 'absolute';
        rippleEl.style.pointerEvents = 'none';
      }
      
      container.appendChild(rippleEl);
      const rippleData: ControlledRippleData = { element: rippleEl, createdAt: Date.now() };
      rippleMap.current.set(id, rippleData);
    } catch (error) {
      onErrorRef.current?.(error, `triggerRippleControlled - Creation failed for ID: ${id}`);
      console.error(`useRippleEffect: Error creating controlled ripple '${id}'.`, error);
    } finally {
      pendingRippleIds.current.delete(id);
    }
  }, [maxControlledRipples, createRippleElement]);

  const updateRipple = useCallback((
    id: string,
    styleVars: Record<string, string | number>
  ) => {
    if (!isEnabledRef.current) return;
    const rippleData = rippleMap.current.get(id);
    if (!rippleData) return;
    const rippleEl = rippleData.element;
    Object.entries(styleVars).forEach(([key, value]) => {
      rippleEl.style.setProperty(`--ripple-${key}`, String(value));
    });
  }, []);

  // --- Main Cleanup Logic ---
  const destroy = useCallback(() => {
    clearDelayTimeout();
    removalTimers.current.forEach(clearTimeout);
    removalTimers.current.clear();
    if (pulsatingSpanRef.current) {
      const pulsatingEl = pulsatingSpanRef.current;
      pulsatingSpanRef.current = null;
      requestAnimationFrame(() => { if (pulsatingEl?.parentNode) pulsatingEl.remove(); });
    }
    isPointerDownDelayed.current = false;
    pointerDownCoords.current = null;
    rippleMap.current.forEach((_rippleData, id) => destroyRipple(id)); // Use destroyRipple to ensure map is cleared
    pendingRippleIds.current.clear();
    if (lifespanIntervalId.current !== null) {
      clearInterval(lifespanIntervalId.current);
      lifespanIntervalId.current = null;
    }
    
    // Remove injected style element if we created one
    if (styleElementRef.current && styleElementRef.current.parentNode) {
      styleElementRef.current.parentNode.removeChild(styleElementRef.current);
      styleElementRef.current = null;
    }
  }, [clearDelayTimeout, destroyRipple]); // Depends on stable callbacks

  // --- Introspection ---
  const getActiveControlledRippleCount = useCallback(() => {
    return rippleMap.current.size;
  }, []);

  // --- Effect for Setup, Styles, Container, Listeners, Cleanup, and Interval ---
  useIsomorphicLayoutEffect(() => {
    const el = elementRef.current;

    // --- Initial Cleanup / Disable Logic ---
    if (!el || !isEnabledRef.current) {
      const currentContainer = rippleContainerRef.current;
      if (currentContainer?.parentNode) {
        try { currentContainer.parentNode.removeChild(currentContainer); }
        catch (e) { onErrorRef.current?.(e, "Container removal error during disable/unmount"); }
      }
      rippleContainerRef.current = null;
      const keysToRelease = Array.from(activeStyleKeys.current);
      activeStyleKeys.current.clear();
      keysToRelease.forEach(key => releaseStyle(key, { onError: onErrorRef.current }));
      destroy();
      return;
    }

    // --- Ensure element has relative positioning ---
    const elPosition = getComputedStyle(el).position;
    if (elPosition === 'static') {
      el.style.position = 'relative';
    }

    // --- Ensure Ripple Container Exists ---
    let container = rippleContainerRef.current;
    if (!container || !container.parentNode || container.parentNode !== el) {
        const existingContainer = el.querySelector<HTMLDivElement>(`div[data-ripple-container="${uniqueId.current}"]`);
        if (existingContainer) {
            container = existingContainer;
        } else {
            container = document.createElement('div');
            container.style.cssText = `position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: ${zIndex};`;
            container.dataset.rippleContainer = uniqueId.current;
            try {
                el.appendChild(container);
            } catch (e) {
                onErrorRef.current?.(e, "Container creation error");
                container = null;
            }
        }
        rippleContainerRef.current = container;
    }

    // --- Inject Styles ---
    if (usePandaClassesRef.current) {
      // If using PandaCSS, inject the styles if needed
      injectPandaStyles();
    } else {
      // Otherwise use the traditional approach
      const styleOptions = { onError: onErrorRef.current, styleTarget, styleInsertion };
      const currentInstanceKeys = new Set<string>();
      if (!disableAnimationsRef.current) {
        // Uses entry/exit/pulseDefinition safely
        if (createAnimation && entryDefinition) {
          const key = addStyle(entryDefinition, 'keyframes', styleOptions);
          if (key) currentInstanceKeys.add(key);
        }
        if (exitDefinition) {
          const key = addStyle(exitDefinition, 'keyframes', styleOptions);
          if (key) currentInstanceKeys.add(key);
        }
        if (pulseDefinition) {
          const key = addStyle(pulseDefinition, 'keyframes', styleOptions);
          if (key) currentInstanceKeys.add(key);
        }
      }
      const controlledRippleCss = `
        .ripple-controlled {
          position: absolute; border-radius: 50%; pointer-events: none; transform-origin: center center;
          --ripple-x: 50%; --ripple-y: 50%; --ripple-scale: 0; --ripple-opacity: 0.5;
          --ripple-color: rgba(0, 0, 0, 0.2); --ripple-size: 50px; --ripple-duration: 300ms;
          top: var(--ripple-y); left: var(--ripple-x); width: var(--ripple-size); height: var(--ripple-size);
          background-color: var(--ripple-color); opacity: var(--ripple-opacity);
          transform: translate(-50%, -50%) scale(var(--ripple-scale));
          z-index: var(--ripple-zindex, ${rippleZIndexBase});
          transition: transform var(--ripple-duration) ease-out, opacity var(--ripple-duration) ease-out, background-color var(--ripple-duration) ease-out;
        }`;
      const cssRuleKey = addStyle(controlledRippleCss, 'rule', styleOptions);
      if (cssRuleKey) currentInstanceKeys.add(cssRuleKey);
      const oldKeys = Array.from(activeStyleKeys.current);
      activeStyleKeys.current = currentInstanceKeys;
      oldKeys.filter(key => !currentInstanceKeys.has(key))
        .forEach(key => releaseStyle(key, { onError: onErrorRef.current }));
    }

    // --- Event Listener Setup (Using Merged Handler) ---
    const listenerOptions = {
      passive: pointerPassive ?? true,
      capture: pointerCaptureRef.current ?? false
    };

    // Merge handlers - types should align now due to options change
    const combinedPointerDownHandler = mergeEventHandlers(
        userPointerDownHandlerRef.current, // Already (event: PointerEvent) => void | undefined
        handleHookPointerDown // Already (e: PointerEvent) => void
    );

    // Remove previous listener *before* adding new one
    if (attachedPointerDownHandlerRef.current) {
        el.removeEventListener('pointerdown', attachedPointerDownHandlerRef.current, listenerOptions);
        attachedPointerDownHandlerRef.current = undefined;
    }

    // Add the combined listener if autoTrigger is enabled and handler exists
    if (autoTriggerRef.current && combinedPointerDownHandler) {
        // Cast the combined handler to the base EventListener type expected by addEventListener
        const listenerToAdd = combinedPointerDownHandler as EventListener;
        attachedPointerDownHandlerRef.current = listenerToAdd;
        el.addEventListener('pointerdown', listenerToAdd, listenerOptions);
    }

    // --- Lifespan Cleanup Interval ---
    if (lifespanIntervalId.current !== null) {
        clearInterval(lifespanIntervalId.current);
    }
    if (typeof controlledRippleMaxLifespan === 'number' && controlledRippleMaxLifespan > 0) {
        lifespanIntervalId.current = window.setInterval(() => {
            if (rippleMap.current.size === 0) return;
            const now = Date.now();
            try {
                rippleMap.current.forEach((rippleData, id) => {
                    if (now - rippleData.createdAt > controlledRippleMaxLifespan) {
                        onRippleExpire?.(id);
                        destroyRipple(id); // Stable callback
                    }
                });
            } catch (intervalError) {
                onErrorRef.current?.(intervalError, "Lifespan check interval error");
                console.error("Error during ripple lifespan check:", intervalError);
            }
        }, lifespanCheckInterval);
    } else {
        lifespanIntervalId.current = null;
    }

    // --- Effect Cleanup Function ---
    return () => {
      // Remove the specific pointerdown listener that was attached
      if (el && attachedPointerDownHandlerRef.current) {
        try {
            const cleanupListenerOptions = {
                passive: pointerPassive ?? true,
                capture: pointerCaptureRef.current ?? false
            };
            el.removeEventListener('pointerdown', attachedPointerDownHandlerRef.current, cleanupListenerOptions);
        } catch (e) {
            onErrorRef.current?.(e, "Event listener removal error (pointerdown)");
        }
        attachedPointerDownHandlerRef.current = undefined;
      }

      // Remove window listeners if the delay sequence was active
      if (isPointerDownDelayed.current) {
        removeListeners(); // Stable callback
      }

      // Clean up container
      const currentContainer = rippleContainerRef.current;
      if (currentContainer?.parentNode) {
        try { currentContainer.parentNode.removeChild(currentContainer); }
        catch (e) { onErrorRef.current?.(e, "Container removal error during cleanup"); }
      }

      // Release styles
      const keysToRelease = Array.from(activeStyleKeys.current);
      activeStyleKeys.current.clear();
      keysToRelease.forEach(key => releaseStyle(key, { onError: onErrorRef.current }));

      rippleContainerRef.current = null;
      // Run main cleanup
      destroy(); // Stable callback
    };
  }, [
    // Core dependencies
    elementRef, zIndex, styleTarget, styleInsertion, rippleZIndexBase,
    controlledRippleMaxLifespan, lifespanCheckInterval, onRippleExpire,
    pointerPassive, // Still needed for listener options directly
    // Stable callbacks/definitions
    destroy, handleHookPointerDown, destroyRipple, injectPandaStyles,
    entryDefinition, exitDefinition, pulseDefinition,
    // Options whose change *must* trigger re-running the effect setup
    isEnabled, autoTrigger, createAnimation, // These fundamentally change setup logic
    // pointerCapture is read via ref, but listener options depend on it, safer to include
    pointerCapture, usePandaClasses
  ]);

  // Convenience Trigger for transient ripples
  const triggerRipple = useCallback(<E extends HTMLElement>(event: React.MouseEvent<E>) => {
    if (!isEnabledRef.current || (autoTriggerRef.current && delayRef.current > 0 && delayTimeoutRef.current !== null) || event.button !== 0) return;
    triggerRippleAt(event.clientX, event.clientY);
  }, [triggerRippleAt]); // Depends on stable triggerRippleAt

  // --- Return Hook API ---
  return {
    triggerRipple,
    triggerRippleAt,
    pulsate,
    destroy,
    triggerRippleControlled,
    updateRipple,
    destroyRipple,
    getActiveControlledRippleCount,
  };
}

// Also export as usePandaRippleEffect for backward compatibility
export const usePandaRippleEffect = useRippleEffect;

// Export the hook as default
export default useRippleEffect;