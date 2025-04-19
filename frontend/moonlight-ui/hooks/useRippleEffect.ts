import { useCallback, useRef, useEffect, useLayoutEffect, useMemo } from 'react';

// SSR-safe layout effect
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

// --- Style Injection Utilities ---
const injectedKeyframeDefinitions = new Set<string>();
const injectedCssRules = new Set<string>();

function injectKeyframes(
  name: string,
  definition: string,
  options: RippleEffectOptions,
  targetElement?: HTMLElement,
  styleInsertion: 'append' | 'prepend' | Element = 'append'
) {
  const { onError } = options;
  
  if (injectedKeyframeDefinitions.has(definition) || typeof document === 'undefined') return;
  
  const target = targetElement instanceof HTMLElement ? targetElement : document.head;
  
  if (!target?.appendChild) {
    onError?.(new Error("Invalid target for keyframe injection."), `injectKeyframes - Invalid target`);
    return;
  }
  
  const style = document.createElement('style');
  style.textContent = `@keyframes ${name} { ${definition} }`;
  style.dataset.rippleEffectKeyframes = name;
  
  try {
    if (styleInsertion === 'prepend' && target.firstChild) {
      target.insertBefore(style, target.firstChild);
    } else if (styleInsertion instanceof Element && target.contains(styleInsertion)) {
      target.insertBefore(style, styleInsertion);
    } else {
      target.appendChild(style);
    }
    
    injectedKeyframeDefinitions.add(definition);
  } catch (error) {
    onError?.(error, `injectKeyframes - Append failed for "${name}"`);
    
    if (target !== document.head) {
      try {
        document.head.appendChild(style);
        injectedKeyframeDefinitions.add(definition);
      } catch (fallbackError) {
        onError?.(fallbackError, `injectKeyframes - Fallback failed for "${name}"`);
      }
    }
  }
}

function injectCssRule(
  ruleIdentifier: string,
  ruleContent: string,
  options: RippleEffectOptions,
  targetElement?: HTMLElement,
  styleInsertion: 'append' | 'prepend' | Element = 'append'
) {
  const { onError } = options;
  
  if (injectedCssRules.has(ruleIdentifier) || typeof document === 'undefined') return;
  
  const target = targetElement instanceof HTMLElement ? targetElement : document.head;
  
  if (!target?.appendChild) {
    onError?.(new Error("Invalid target for CSS rule injection."), `injectCssRule - Invalid target`);
    return;
  }
  
  const style = document.createElement('style');
  style.textContent = ruleContent;
  style.dataset.rippleEffectRule = ruleIdentifier;
  
  try {
    if (styleInsertion === 'prepend' && target.firstChild) {
      target.insertBefore(style, target.firstChild);
    } else if (styleInsertion instanceof Element && target.contains(styleInsertion)) {
      target.insertBefore(style, styleInsertion);
    } else {
      target.appendChild(style);
    }
    
    injectedCssRules.add(ruleIdentifier);
  } catch (error) {
    onError?.(error, `injectCssRule - Append failed for "${ruleIdentifier}"`);
    
    if (target !== document.head) {
      try {
        document.head.appendChild(style);
        injectedCssRules.add(ruleIdentifier);
      } catch (fallbackError) {
        onError?.(fallbackError, `injectCssRule - Fallback failed for "${ruleIdentifier}"`);
      }
    }
  }
}


// --- Interfaces ---

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
  
  // Advanced Configuration
  styleTarget?: HTMLElement;
  styleInsertion?: 'append' | 'prepend' | Element;
  
  // Runtime Controls
  disableAnimations?: boolean;
  resolveTheme?: () => ({ color: string; scale: number; opacity?: number });
  
  // Error Handling
  onError?: (error: unknown, context: string) => void;

  // *** Advanced Refinement Options ***
  /** Max number of persistent controlled ripples allowed. Prevents creation if limit exceeded. */
  maxControlledRipples?: number;
  
  /** Max lifespan (ms) for controlled ripples. Expired ripples are auto-removed. Requires periodic checks. */
  controlledRippleMaxLifespan?: number;
  
  /** Interval (ms) for checking expired controlled ripples. Defaults to 5000ms if maxLifespan is set. */
  lifespanCheckInterval?: number;
  
  /** Base z-index for ripples within their container. Controlled = base, Transient = base + 1. Defaults to 0. */
  rippleZIndexBase?: number;
  
  /** Callback invoked just before a controlled ripple is auto-removed due to exceeding its lifespan. */
  onRippleExpire?: (id: string) => void;
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
  // Transient ripple methods
  triggerRipple: <T extends Element>(event: React.MouseEvent<T>) => void;
  triggerRippleAt: (x: number, y: number) => void;
  pulsate: (action: 'start' | 'stop') => void;
  
  // Cleanup
  destroy: () => void;
  
  // Controlled ripple methods
  triggerRippleControlled: (id: string, initialStyleVars?: Record<string, string | number>) => void;
  updateRipple: (id: string, styleVars: Record<string, string | number>) => void;
  destroyRipple: (id: string) => void;
  
  // Introspection
  getActiveControlledRippleCount: () => number;
}

// --- Hook Implementation ---

/**
 * Hook for Material-style ripple effects with advanced options.
 */
export function useRippleEffect<T extends Element>(
  elementRef: React.RefObject<T | null>,
  options: RippleEffectOptions = {}
): RippleEffectResult {
  // --- Options & Defaults ---
  const {
    // Core & Existing
    color,
    duration = 600,
    opacity = 0.3,
    scaleVariable = 'var(--sizes-rippleScale)',
    colorVariable = 'var(--color-accent1)',
    zIndex = 5,
    createAnimation = true,
    animationName = 'ripple',
    maxScale = 5,
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
    styleTarget,
    styleInsertion = 'append',
    disableAnimations = false,
    resolveTheme,
    onError,
    
    // Advanced Options
    maxControlledRipples,
    controlledRippleMaxLifespan,
    lifespanCheckInterval = 5000,
    rippleZIndexBase = 0,
    onRippleExpire,
  } = options;

  // --- Refs ---
  const removalTimers = useRef<Set<number>>(new Set());
  const uniqueId = useRef(Math.random().toString(36).slice(2));
  const rippleCounter = useRef(0);
  const delayTimeoutRef = useRef<number | null>(null);
  const pointerDownCoords = useRef<{ x: number; y: number } | null>(null);
  const isPointerDownDelayed = useRef(false);
  const pulsatingSpanRef = useRef<HTMLSpanElement | null>(null);
  const rippleContainerRef = useRef<HTMLDivElement | null>(null);
  const rippleMap = useRef(new Map<string, ControlledRippleData>());
  const pendingRippleIds = useRef(new Set<string>());
  const lifespanIntervalId = useRef<number | null>(null);

  // --- Derived Names ---
  const entryAnimationName = `${animationName}_${uniqueId.current}`;
  const exitAnimationName = `${exitAnimationNameBase}_${uniqueId.current}`;
  const pulseAnimationName = `${pulseAnimationNameBase}_${uniqueId.current}`;

  // --- Utility Functions ---
  const clearDelayTimeout = useCallback(() => {
    if (delayTimeoutRef.current !== null) {
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }
  }, []);

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
          const cssVarScale = getComputedStyle(document.documentElement)
            .getPropertyValue(scaleVariable)
            .trim();
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
      
      if (createAnimation) {
        entryDef = `
          0% { transform: scale(0); opacity: ${baseOpacityValue}; }
          100% { transform: scale(${finalScale}); opacity: 0; }
        `;
      }
      
      exitDef = `
        0% { opacity: ${baseOpacityValue}; }
        100% { opacity: 0; }
      `;
      
      pulseDef = `
        0% { transform: scale(0.8); opacity: ${finalPulseOpacityValue * 0.7}; }
        50% { transform: scale(1); opacity: ${finalPulseOpacityValue}; }
        100% { transform: scale(0.8); opacity: ${finalPulseOpacityValue * 0.7}; }
      `;
    }
    
    return {
      entryDefinition: entryDef,
      exitDefinition: exitDef,
      pulseDefinition: pulseDef
    };
  }, [
    disableAnimations,
    opacity,
    scaleVariable,
    maxScale,
    resolveTheme,
    pulseOpacity,
    createAnimation,
    onError
  ]);

  // --- Controlled Ripple Destroy ---
  const destroyRipple = useCallback((id: string) => {
    const rippleData = rippleMap.current.get(id);
    if (!rippleData) return;
    
    const rippleEl = rippleData.element;
    rippleMap.current.delete(id);
    
    requestAnimationFrame(() => {
      if (rippleEl?.parentNode) {
        rippleEl.remove();
      }
    });
  }, []);

  // --- Transient Ripple Creation ---
  const triggerRippleAt = useCallback(
    (x: number, y: number): void => {
      const el = elementRef.current;
      const container = rippleContainerRef.current;
      
      if (!isEnabled || !el || !container) return;
      
      const rect = el.getBoundingClientRect();
      let finalScale = 1;
      let rippleBg = `rgba(0, 0, 0, ${opacity})`;
      let initialOpacity = opacity;
      
      try {
        if (typeof resolveTheme === 'function') {
          const theme = resolveTheme();
          finalScale = Math.min(Number(theme?.scale) || 1, maxScale);
          initialOpacity = (typeof theme?.opacity === 'number') ? theme.opacity : opacity;
          
          const baseColor = theme?.color || 
            getComputedStyle(el).getPropertyValue(colorVariable).trim() || 
            color || '';
            
          if (baseColor.startsWith('#')) {
            rippleBg = `rgba(${parseInt(baseColor.slice(1, 3), 16)},
                            ${parseInt(baseColor.slice(3, 5), 16)},
                            ${parseInt(baseColor.slice(5, 7), 16)},
                            ${initialOpacity})`;
          } else if (baseColor.startsWith('rgb')) {
            rippleBg = baseColor.replace(/rgb\(/, 'rgba(').replace(/\)/, `,${initialOpacity})`);
          } else if (baseColor) {
            rippleBg = baseColor;
          } else {
            rippleBg = `rgba(0, 0, 0, ${initialOpacity})`;
          }
        } else {
          const cssVarScale = typeof document !== 'undefined' 
            ? getComputedStyle(document.documentElement).getPropertyValue(scaleVariable).trim() 
            : '';
            
          finalScale = Math.min(parseFloat(cssVarScale) || 1, maxScale);
          initialOpacity = opacity;
          
          const baseColor = getComputedStyle(el).getPropertyValue(colorVariable).trim() || 
            color || '';
            
          if (baseColor.startsWith('#')) {
            rippleBg = `rgba(${parseInt(baseColor.slice(1, 3), 16)},
                            ${parseInt(baseColor.slice(3, 5), 16)},
                            ${parseInt(baseColor.slice(5, 7), 16)},
                            ${initialOpacity})`;
          } else if (baseColor.startsWith('rgb')) {
            rippleBg = baseColor.replace(/rgb\(/, 'rgba(').replace(/\)/, `,${initialOpacity})`);
          } else if (baseColor) {
            rippleBg = baseColor;
          } else {
            rippleBg = `rgba(0, 0, 0, ${initialOpacity})`;
          }
        }
      } catch (e) {
        onError?.(e, "Trigger ripple - resolve visuals error");
        finalScale = Math.min(1, maxScale);
        initialOpacity = opacity;
        rippleBg = `rgba(0, 0, 0, ${initialOpacity})`;
      }
      
      const size = Math.max(rect.width, rect.height) * finalScale;
      const px = x - rect.left - size / 2;
      const py = y - rect.top - size / 2;
      
      const span = document.createElement('span');
      span.style.cssText = `
        position: absolute;
        top: ${py}px;
        left: ${px}px;
        width: ${size}px;
        height: ${size}px;
        background-color: ${rippleBg};
        border-radius: 50%;
        transform: scale(0);
        pointer-events: none;
        z-index: ${rippleZIndexBase + 1};
        opacity: ${initialOpacity};
      `;
      span.setAttribute('aria-hidden', 'true');
      
      const currentRippleId = `${uniqueId.current}_${rippleCounter.current++}`;
      span.dataset.rippleInstanceId = currentRippleId;
      container.appendChild(span);
      
      if (disableAnimations) {
        span.style.transform = `scale(${finalScale})`;
        span.style.opacity = '0';
        
        const removalTid = window.setTimeout(() => {
          requestAnimationFrame(() => {
            if (container.contains(span)) {
              container.removeChild(span);
            }
          });
          removalTimers.current.delete(removalTid);
        }, 50);
        
        removalTimers.current.add(removalTid);
      } else {
        if (createAnimation && entryDefinition) {
          span.style.animation = `${entryAnimationName} ${duration}ms linear`;
        } else {
          span.style.transform = `scale(${finalScale})`;
          span.style.opacity = '0';
          span.style.transition = `opacity ${duration}ms linear, transform ${duration}ms linear`;
        }
        
        window.setTimeout(() => {
          if (!container.contains(span)) return;
          
          if (exitDefinition) {
            span.style.animation = `${exitAnimationName} ${exitDuration}ms linear forwards`;
          } else {
            span.style.opacity = '0';
            span.style.transition = `opacity ${exitDuration}ms linear`;
          }
          
          const removalTid = window.setTimeout(() => {
            requestAnimationFrame(() => {
              if (container.contains(span)) {
                container.removeChild(span);
              }
            });
            removalTimers.current.delete(removalTid);
          }, exitDuration);
          
          removalTimers.current.add(removalTid);
        }, duration);
      }
    },
    [
      elementRef,
      isEnabled,
      scaleVariable,
      colorVariable,
      color,
      opacity,
      duration,
      createAnimation,
      maxScale,
      exitDuration,
      entryAnimationName,
      exitAnimationName,
      disableAnimations,
      resolveTheme,
      onError,
      entryDefinition,
      exitDefinition,
      rippleZIndexBase
    ]
  );

  // --- Pulsate Logic ---
  const pulsate = useCallback((action: 'start' | 'stop') => {
    const el = elementRef.current;
    const container = rippleContainerRef.current;
    
    if (!isEnabled || !el || !container) return;
    
    const stopPulsating = () => {
      const span = pulsatingSpanRef.current;
      if (span && container.contains(span)) {
        pulsatingSpanRef.current = null;
        
        if (exitDefinition && !disableAnimations) {
          span.style.animation = `${exitAnimationName} ${exitDuration}ms linear forwards`;
        } else {
          span.style.opacity = '0';
          span.style.transition = `opacity ${exitDuration}ms linear`;
        }
        
        const removalTid = window.setTimeout(() => {
          requestAnimationFrame(() => {
            if (container.contains(span)) {
              container.removeChild(span);
            }
          });
          removalTimers.current.delete(removalTid);
        }, exitDuration);
        
        removalTimers.current.add(removalTid);
      }
    };
    
    if (action === 'start') {
      if (pulsatingSpanRef.current || disableAnimations || !pulseDefinition) return;
      
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
          
          if (typeof theme?.opacity === 'number') {
            baseOpacityForPulse = theme.opacity;
          }
        }
        
        if (!baseColor) {
          baseColor = pulseColor || 
            getComputedStyle(el).getPropertyValue(colorVariable).trim() || 
            color || '';
        }
        
        if (baseColor) finalPulseColor = baseColor;
        initialPulseOpacity = pulseOpacity ?? Math.min(1, baseOpacityForPulse * 1.5);
      } catch (e) {
        onError?.(e, "Pulsate - resolve visuals error");
        finalPulseColor = pulseColor || color || 'rgba(0, 0, 0, 0.2)';
        initialPulseOpacity = pulseOpacity ?? Math.min(1, opacity * 1.5);
      }
      
      const span = document.createElement('span');
      span.style.cssText = `
        position: absolute;
        top: ${py}px;
        left: ${px}px;
        width: ${size}px;
        height: ${size}px;
        background-color: ${finalPulseColor};
        border-radius: 50%;
        pointer-events: none;
        z-index: ${rippleZIndexBase + 1};
        opacity: ${initialPulseOpacity * 0.7};
        transform: scale(0.8);
      `;
      span.setAttribute('aria-hidden', 'true');
      
      const currentPulseId = `${uniqueId.current}_${rippleCounter.current++}`;
      span.dataset.rippleInstanceId = currentPulseId;
      span.style.animation = `${pulseAnimationName} ${pulseDuration}ms ease-in-out infinite`;
      
      container.appendChild(span);
      pulsatingSpanRef.current = span;
    } else if (action === 'stop') {
      stopPulsating();
    }
  }, [
    elementRef,
    isEnabled,
    pulseColor,
    pulseOpacity,
    pulseDuration,
    colorVariable,
    color,
    opacity,
    pulseAnimationName,
    exitAnimationName,
    exitDuration,
    disableAnimations,
    resolveTheme,
    onError,
    pulseDefinition,
    exitDefinition,
    rippleZIndexBase
  ]);

  // --- Controlled Ripple Creation ---
  const triggerRippleControlled = useCallback((
    id: string,
    initialStyleVars: Record<string, string | number> = {}
  ) => {
    const container = rippleContainerRef.current;
    
    if (!isEnabled || !container) {
      onError?.(
        new Error(`Cannot trigger controlled ripple: ${!isEnabled ? "Hook disabled" : "Container not ready"}`),
        "triggerRippleControlled - Prerequisite fail"
      );
      return;
    }
    
    if (pendingRippleIds.current.has(id) || rippleMap.current.has(id)) {
      onError?.(
        new Error(`Duplicate or pending ripple ID: ${id}`),
        "triggerRippleControlled - Duplicate/Pending ID"
      );
      console.warn(`useRippleEffect: Ripple with id '${id}' already exists or is being created.`);
      return;
    }
    
    if (typeof maxControlledRipples === 'number' && rippleMap.current.size >= maxControlledRipples) {
      onError?.(
        new Error(`Controlled ripple limit reached (${maxControlledRipples})`),
        "triggerRippleControlled - Limit reached"
      );
      console.warn(`useRippleEffect: Controlled ripple limit (${maxControlledRipples}) reached. Cannot create ripple '${id}'.`);
      return;
    }
    
    pendingRippleIds.current.add(id);
    
    try {
      const rippleEl = document.createElement('span');
      rippleEl.classList.add('ripple-controlled');
      rippleEl.dataset.controlledRippleId = id;
      
      Object.entries(initialStyleVars).forEach(([key, value]) => {
        rippleEl.style.setProperty(`--ripple-${key}`, String(value));
      });
      
      rippleEl.style.position = 'absolute';
      rippleEl.style.pointerEvents = 'none';
      container.appendChild(rippleEl);
      
      const rippleData: ControlledRippleData = {
        element: rippleEl,
        createdAt: Date.now()
      };
      
      rippleMap.current.set(id, rippleData);
    } catch (error) {
      onError?.(
        error,
        `triggerRippleControlled - Creation failed for ID: ${id}`
      );
      console.error(`useRippleEffect: Error creating controlled ripple '${id}'.`, error);
    } finally {
      pendingRippleIds.current.delete(id);
    }
  }, [isEnabled, onError, maxControlledRipples]);

  // --- Controlled Ripple Update ---
  const updateRipple = useCallback((
    id: string,
    styleVars: Record<string, string | number>
  ) => {
    if (!isEnabled) return;
    
    const rippleData = rippleMap.current.get(id);
    if (!rippleData) return;
    
    const rippleEl = rippleData.element;
    Object.entries(styleVars).forEach(([key, value]) => {
      rippleEl.style.setProperty(`--ripple-${key}`, String(value));
    });
  }, [isEnabled]);

  // --- Main Cleanup Logic ---
  const destroy = useCallback(() => {
    clearDelayTimeout();
    removalTimers.current.forEach(clearTimeout);
    removalTimers.current.clear();
    
    if (pulsatingSpanRef.current) {
      const pulsatingEl = pulsatingSpanRef.current;
      pulsatingSpanRef.current = null;
      requestAnimationFrame(() => {
        pulsatingEl.remove();
      });
    }
    
    isPointerDownDelayed.current = false;
    pointerDownCoords.current = null;
    
    rippleMap.current.forEach((rippleData) => {
      const rippleEl = rippleData.element;
      requestAnimationFrame(() => {
        rippleEl.remove();
      });
    });
    
    rippleMap.current.clear();
    pendingRippleIds.current.clear();
    
    if (lifespanIntervalId.current !== null) {
      clearInterval(lifespanIntervalId.current);
      lifespanIntervalId.current = null;
    }
  }, [clearDelayTimeout]);

  // --- NEW: Introspection Function ---
  const getActiveControlledRippleCount = useCallback(() => {
    return rippleMap.current.size;
  }, []);

  // --- Effect for Setup, Styles, Container, Listeners, Cleanup, and Interval ---
  useIsomorphicLayoutEffect(() => {
    const el = elementRef.current;
    
    if (!el || !isEnabled) {
      const currentContainer = rippleContainerRef.current;
      if (currentContainer && elementRef.current?.contains(currentContainer)) {
        elementRef.current.removeChild(currentContainer);
      }
      rippleContainerRef.current = null;
      destroy();
      return;
    }

    // --- Create/Manage Ripple Container ---
    let container = rippleContainerRef.current;
    
    if (!container || !el.contains(container)) {
      const existingContainer = el.querySelector<HTMLDivElement>(
        `div[data-ripple-container="${uniqueId.current}"]`
      );
      
      if (existingContainer) {
        container = existingContainer;
      } else {
        container = document.createElement('div');
        container.style.cssText = `
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: ${zIndex};
        `;
        container.dataset.rippleContainer = uniqueId.current;
        
        if (typeof document !== 'undefined' && document.body.contains(el)) {
          el.appendChild(container);
        } else {
          container = null;
        }
      }
      
      rippleContainerRef.current = container;
    }

    // --- Inject Styles ---
    const styleOptions = { onError, rippleZIndexBase };
    
    if (!disableAnimations) {
      if (createAnimation && entryDefinition) {
        injectKeyframes(
          entryAnimationName,
          entryDefinition,
          styleOptions,
          styleTarget,
          styleInsertion
        );
      }
      
      if (exitDefinition) {
        injectKeyframes(
          exitAnimationName,
          exitDefinition,
          styleOptions,
          styleTarget,
          styleInsertion
        );
      }
      
      if (pulseDefinition) {
        injectKeyframes(
          pulseAnimationName,
          pulseDefinition,
          styleOptions,
          styleTarget,
          styleInsertion
        );
      }
    }
    
    const controlledRippleCssIdentifier = 'ripple-controlled-styles';
    const controlledRippleCss = `
      .ripple-controlled {
        position: absolute;
        border-radius: 50%;
        pointer-events: none;
        transform-origin: center center;
        --ripple-x: 50%;
        --ripple-y: 50%;
        --ripple-scale: 0;
        --ripple-opacity: 0.5;
        --ripple-color: rgba(0, 0, 0, 0.2);
        --ripple-size: 50px;
        --ripple-duration: 300ms;
        top: var(--ripple-y);
        left: var(--ripple-x);
        width: var(--ripple-size);
        height: var(--ripple-size);
        background-color: var(--ripple-color);
        opacity: var(--ripple-opacity);
        transform: translate(-50%, -50%) scale(var(--ripple-scale));
        z-index: var(--ripple-zindex, ${rippleZIndexBase});
        transition: 
          transform var(--ripple-duration) ease-out,
          opacity var(--ripple-duration) ease-out,
          background-color var(--ripple-duration) ease-out;
      }
    `;
    
    injectCssRule(
      controlledRippleCssIdentifier,
      controlledRippleCss,
      styleOptions,
      styleTarget,
      styleInsertion
    );

    // --- Event Listeners Setup ---
    const listenerOptions = {
      passive: pointerPassive ?? true,
      capture: pointerCapture ?? false
    };
    
    const handlePointerMove = (ev: PointerEvent) => {
      if (delayTimeoutRef.current === null || !pointerDownCoords.current) return;
      
      const dx = ev.clientX - pointerDownCoords.current.x;
      const dy = ev.clientY - pointerDownCoords.current.y;
      
      if (Math.sqrt(dx * dx + dy * dy) > cancelMoveThreshold) {
        clearDelayTimeout();
        removeListeners();
      }
    };
    
    const handlePointerUpOrCancel = () => {
      if (delayTimeoutRef.current !== null) {
        clearDelayTimeout();
        
        if (pointerDownCoords.current) {
          triggerRippleAt(pointerDownCoords.current.x, pointerDownCoords.current.y);
        }
      }
      
      removeListeners();
    };
    
    const removeListeners = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUpOrCancel);
      window.removeEventListener('pointercancel', handlePointerUpOrCancel);
      isPointerDownDelayed.current = false;
      pointerDownCoords.current = null;
    };
    
    const handlePointerDown = (e: Event) => {
      if (!autoTrigger || !isEnabled || disableAnimations || (e as PointerEvent).button !== 0) return;
      if (delayTimeoutRef.current !== null) return;
      
      const ev = e as PointerEvent;
      pointerDownCoords.current = { x: ev.clientX, y: ev.clientY };
      
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUpOrCancel);
      window.addEventListener('pointercancel', handlePointerUpOrCancel);
      
      isPointerDownDelayed.current = true;
      
      delayTimeoutRef.current = window.setTimeout(() => {
        delayTimeoutRef.current = null;
        
        if (pointerDownCoords.current) {
          triggerRippleAt(pointerDownCoords.current.x, pointerDownCoords.current.y);
        }
        
        if (isPointerDownDelayed.current) {
          removeListeners();
        }
      }, delay);
    };
    
    if (autoTrigger) {
      el.addEventListener('pointerdown', handlePointerDown, listenerOptions);
    }

    // --- Lifespan Cleanup Interval (with onRippleExpire callback) ---
    if (lifespanIntervalId.current !== null) {
      clearInterval(lifespanIntervalId.current);
    }
    
    if (typeof controlledRippleMaxLifespan === 'number' && controlledRippleMaxLifespan > 0) {
      lifespanIntervalId.current = window.setInterval(() => {
        // Only iterate if the map isn't empty for efficiency
        if (rippleMap.current.size === 0) return;

        const now = Date.now();
        
        // Use try...catch within interval callback for robustness
        try {
          rippleMap.current.forEach((rippleData, id) => {
            if (now - rippleData.createdAt > controlledRippleMaxLifespan) {
              // Call onRippleExpire before destroying
              onRippleExpire?.(id);
              destroyRipple(id);
            }
          });
        } catch (intervalError) {
          onError?.(intervalError, "Lifespan check interval error");
          console.error("Error during ripple lifespan check:", intervalError);
        }
      }, lifespanCheckInterval);
    } else {
      lifespanIntervalId.current = null;
    }

    // --- Effect Cleanup Function ---
    return () => {
      if (autoTrigger) {
        el?.removeEventListener('pointerdown', handlePointerDown, listenerOptions);
      }
      
      if (isPointerDownDelayed.current) {
        removeListeners();
      }
      
      const currentContainer = rippleContainerRef.current;
      const currentEl = elementRef.current;
      
      if (currentEl && currentContainer && currentEl.contains(currentContainer)) {
        try {
          currentEl.removeChild(currentContainer);
        } catch (e) {}
      }
      
      rippleContainerRef.current = null;
      destroy();
    };
  }, [
    elementRef, isEnabled, zIndex, styleTarget, styleInsertion, onError,
    autoTrigger, delay, cancelMoveThreshold, pointerPassive, pointerCapture,
    disableAnimations, triggerRippleAt, clearDelayTimeout,
    createAnimation, entryDefinition, exitDefinition, pulseDefinition,
    entryAnimationName, exitAnimationName, pulseAnimationName,
    destroy, rippleZIndexBase,
    controlledRippleMaxLifespan, lifespanCheckInterval, destroyRipple,
    onRippleExpire
  ]);

  // Convenience Trigger for transient ripples
  const triggerRipple = useCallback(<E extends Element>(event: React.MouseEvent<E>) => {
    if (!isEnabled || (autoTrigger && delay > 0 && delayTimeoutRef.current !== null) || event.button !== 0) return;
    triggerRippleAt(event.clientX, event.clientY);
  }, [triggerRippleAt, autoTrigger, delay, isEnabled]);

  // --- Return Hook API ---
  return {
    // Transient
    triggerRipple,
    triggerRippleAt,
    pulsate,
    
    // Cleanup
    destroy,
    
    // Controlled
    triggerRippleControlled,
    updateRipple,
    destroyRipple,
    
    // Introspection
    getActiveControlledRippleCount,
  };
}

// Export the hook as default
export default useRippleEffect;