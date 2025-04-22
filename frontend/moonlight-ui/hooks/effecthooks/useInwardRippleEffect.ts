import { useCallback, useRef, useEffect, useLayoutEffect, useMemo } from 'react';

// SSR-safe layout effect
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

// --- Style Injection Utilities ---
// (These utilities remain the same as in useRippleEffect)
const injectedKeyframeDefinitions = new Set<string>();
const injectedCssRules = new Set<string>();

// Function to inject keyframes into the document head or a target element
function injectKeyframes(
  name: string,
  definition: string,
  options: InwardRippleEffectOptions, // Use renamed options type
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

// Function to inject CSS rules into the document head or a target element
function injectCssRule(
  ruleIdentifier: string,
  ruleContent: string,
  options: InwardRippleEffectOptions, // Use renamed options type
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
 * Configuration options for the inward ripple effect.
 */
export interface InwardRippleEffectOptions {
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
  delay?: number;
  cancelMoveThreshold?: number;
  exitDuration?: number;
  exitAnimationName?: string;
  pulseColor?: string;
  pulseOpacity?: number;
  pulseDuration?: number;
  pulseAnimationName?: string; // Base name for the *inward* pulse animation
  autoTrigger?: boolean;
  pointerPassive?: boolean;
  pointerCapture?: boolean;
  styleTarget?: HTMLElement;
  styleInsertion?: 'append' | 'prepend' | Element;
  disableAnimations?: boolean;
  resolveTheme?: () => ({ color: string; scale: number; opacity?: number });
  onError?: (error: unknown, context: string) => void;
  maxControlledRipples?: number;
  controlledRippleMaxLifespan?: number;
  lifespanCheckInterval?: number;
  rippleZIndexBase?: number;
  onRippleExpire?: (id: string) => void;
}

/**
 * Represents a tracked controlled ripple. (Unchanged)
 */
interface ControlledRippleData {
    element: HTMLElement;
    createdAt: number;
}

/**
 * Returned API from the useInwardRippleEffect hook.
 */
export interface InwardRippleEffectResult {
  triggerRipple: <T extends Element>(event: React.MouseEvent<T>) => void;
  triggerRippleAt: (x: number, y: number) => void;
  pulsate: (action: 'start' | 'stop') => void; // Now uses inward pulse animation
  destroy: () => void;
  triggerRippleControlled: (id: string, initialStyleVars?: Record<string, string | number>) => void;
  updateRipple: (id: string, styleVars: Record<string, string | number>) => void;
  destroyRipple: (id: string) => void;
  getActiveControlledRippleCount: () => number;
}

// --- Hook Implementation ---

/**
 * A React hook for creating Material Design-style ripple effects that animate *inward*.
 * It supports transient (click-based) and controlled (programmatic) ripples.
 *
 * @template T The type of the HTML element the ripple effect is attached to.
 * @param {React.RefObject<T | null>} elementRef A React ref pointing to the target DOM element.
 * @param {InwardRippleEffectOptions} [options={}] Configuration options for the ripple effect.
 * @returns {InwardRippleEffectResult} An object containing functions to control the ripple effect.
 */
export function useInwardRippleEffect<T extends Element>(
  elementRef: React.RefObject<T | null>,
  options: InwardRippleEffectOptions = {}
): InwardRippleEffectResult {
  // --- Options & Defaults ---
  const {
    color, duration = 600, opacity = 0.3, scaleVariable = 'var(--sizes-rippleScale)',
    colorVariable = 'var(--color-accent1)', zIndex = 5, createAnimation = true,
    animationName = 'inward_ripple',
    maxScale = 5,
    isEnabled = true,
    delay = 75, cancelMoveThreshold = 5,
    exitDuration = Math.max(150, duration / 2), exitAnimationName: exitAnimationNameBase = 'inward_ripple_exit',
    pulseColor, pulseOpacity, pulseDuration = duration * 2, pulseAnimationName: pulseAnimationNameBase = 'inward_pulse', // Default base name for inward pulse
    autoTrigger = true, pointerPassive, pointerCapture,
    styleTarget, styleInsertion = 'append',
    disableAnimations = false,
    resolveTheme,
    onError,
    maxControlledRipples,
    controlledRippleMaxLifespan,
    lifespanCheckInterval = 5000,
    rippleZIndexBase = 0,
    onRippleExpire,
  } = options;

  // --- Refs --- (Unchanged)
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
  const pulseAnimationName = `${pulseAnimationNameBase}_${uniqueId.current}`; // Unique name for inward pulse

  // --- Utility Functions --- (Unchanged)
  const clearDelayTimeout = useCallback(() => {
    if (delayTimeoutRef.current !== null) {
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }
  }, []);

  // --- Memoized Keyframe Definitions ---
  // Calculate keyframe definitions, including the modified inward pulse
  const { entryDefinition, exitDefinition, pulseDefinition } = useMemo(() => {
      const animationsShouldBeEnabled = !disableAnimations;
      let entryDef = '';
      let exitDef = '';
      let pulseDef = ''; // Will hold the inward pulse definition

      if (animationsShouldBeEnabled) {
          let finalScale = 1; // Starting scale for main ripple
          let baseOpacityValue = opacity; // Base opacity for main ripple
          let finalPulseOpacityValue = opacity; // Base opacity for pulse

          // Resolve dynamic styles (same logic as original)
          try {
              if (typeof resolveTheme === 'function') {
                  const theme = resolveTheme();
                  finalScale = Math.min(Number(theme?.scale) || 1, maxScale);
                  if (theme && typeof theme.opacity === 'number') {
                      baseOpacityValue = theme.opacity;
                      finalPulseOpacityValue = theme.opacity; // Use theme opacity for pulse too
                  }
              } else if (typeof document !== 'undefined') {
                  const cssVarScale = getComputedStyle(document.documentElement).getPropertyValue(scaleVariable).trim();
                  finalScale = Math.min(parseFloat(cssVarScale) || 1, maxScale);
              } else {
                  finalScale = Math.min(1, maxScale);
              }
              // Use explicit pulseOpacity if provided, otherwise derive from resolved base opacity
              finalPulseOpacityValue = pulseOpacity ?? Math.min(1, finalPulseOpacityValue * 1.5); // Slightly higher opacity for pulse by default
          } catch (e) {
              onError?.(e, "Keyframe definition - resolve styles error");
              finalScale = Math.min(1, maxScale);
              baseOpacityValue = opacity;
              finalPulseOpacityValue = pulseOpacity ?? Math.min(1, opacity * 1.5);
          }

          // *** MODIFIED Entry Definition for Inward Ripple ***
          if (createAnimation) {
              entryDef = `0% { transform: scale(${finalScale}); opacity: ${baseOpacityValue}; } 100% { transform: scale(0); opacity: 0; }`;
          }

          // Exit definition remains a simple fade-out
          exitDef = `0% { opacity: ${baseOpacityValue}; } 100% { opacity: 0; }`;

          // *** MODIFIED Pulse Definition for Inward Pulse ***
          // Starts at scale 1, shrinks slightly, then fades out completely
          pulseDef = `
            0% { transform: scale(1); opacity: ${finalPulseOpacityValue}; }
            50% { transform: scale(0.8); opacity: ${finalPulseOpacityValue * 0.7}; }
            100% { transform: scale(0.7); opacity: 0; }
          `;
      }

      return { entryDefinition: entryDef, exitDefinition: exitDef, pulseDefinition: pulseDef };
  }, [disableAnimations, opacity, scaleVariable, maxScale, resolveTheme, pulseOpacity, createAnimation, onError]); // Dependencies remain the same

  // --- Controlled Ripple Destroy --- (Unchanged)
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

  // --- Transient Ripple Creation --- (Unchanged from previous version)
  const triggerRippleAt = useCallback(
    (x: number, y: number): void => {
      const el = elementRef.current;
      const container = rippleContainerRef.current;
      if (!isEnabled || !el || !container) return;

      const rect = el.getBoundingClientRect();
      let initialScale = 1;
      let rippleBg = `rgba(0,0,0,${opacity})`;
      let initialOpacity = opacity;

      // Resolve dynamic visual styles
      try { /* ... same logic ... */ if (typeof resolveTheme === 'function') { const theme = resolveTheme(); initialScale = Math.min(Number(theme?.scale) || 1, maxScale); initialOpacity = (typeof theme?.opacity === 'number') ? theme.opacity : opacity; const baseColor = theme?.color || getComputedStyle(el).getPropertyValue(colorVariable).trim() || color || ''; if (baseColor.startsWith('#')) { rippleBg = `rgba(${parseInt(baseColor.slice(1, 3), 16)},${parseInt(baseColor.slice(3, 5), 16)},${parseInt(baseColor.slice(5, 7), 16)},${initialOpacity})`; } else if (baseColor.startsWith('rgb')) { rippleBg = baseColor.replace(/rgb\(/, 'rgba(').replace(/\)/, `,${initialOpacity})`); } else if (baseColor) { rippleBg = baseColor; } else { rippleBg = `rgba(0,0,0,${initialOpacity})`;} } else { const cssVarScale = typeof document !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue(scaleVariable).trim() : ''; initialScale = Math.min(parseFloat(cssVarScale) || 1, maxScale); initialOpacity = opacity; const baseColor = getComputedStyle(el).getPropertyValue(colorVariable).trim() || color || ''; if (baseColor.startsWith('#')) { rippleBg = `rgba(${parseInt(baseColor.slice(1, 3), 16)},${parseInt(baseColor.slice(3, 5), 16)},${parseInt(baseColor.slice(5, 7), 16)},${initialOpacity})`; } else if (baseColor.startsWith('rgb')) { rippleBg = baseColor.replace(/rgb\(/, 'rgba(').replace(/\)/, `,${initialOpacity})`); } else if (baseColor) { rippleBg = baseColor; } else { rippleBg = `rgba(0,0,0,${initialOpacity})`;} } } catch (e) { onError?.(e, "Trigger ripple - resolve visuals error"); initialScale = Math.min(1, maxScale); initialOpacity = opacity; rippleBg = `rgba(0,0,0,${initialOpacity})`; }

      // Calculate size and position
      const size = Math.max(rect.width, rect.height) * initialScale;
      const px = x - rect.left - size / 2;
      const py = y - rect.top - size / 2;

      // Create ripple span element with initial styles
      const span = document.createElement('span');
      span.style.cssText = `position: absolute; top: ${py}px; left: ${px}px; width: ${size}px; height: ${size}px; background-color: ${rippleBg}; border-radius: 50%; transform: scale(${initialScale}); pointer-events: none; z-index: ${rippleZIndexBase + 1}; opacity: ${initialOpacity};`;
      span.setAttribute('aria-hidden', 'true');
      const currentRippleId = `${uniqueId.current}_${rippleCounter.current++}`;
      span.dataset.rippleInstanceId = currentRippleId;
      container.appendChild(span);

      // Handle animation or transition
      if (disableAnimations) { /* ... same logic ... */ span.style.transform = `scale(0)`; span.style.opacity = '0'; const removalTid = window.setTimeout(() => { requestAnimationFrame(() => { if (container.contains(span)) { container.removeChild(span); } }); removalTimers.current.delete(removalTid); }, 50); removalTimers.current.add(removalTid); }
      else {
        if (createAnimation && entryDefinition) { /* ... same logic ... */ span.style.animation = `${entryAnimationName} ${duration}ms linear`; span.style.transform = 'scale(0)'; span.style.opacity = '0'; }
        else { /* ... same logic ... */ requestAnimationFrame(() => { span.style.transform = `scale(0)`; span.style.opacity = `0`; span.style.transition = `opacity ${duration}ms linear, transform ${duration}ms linear`; }); }
        const removalTid = window.setTimeout(() => { requestAnimationFrame(() => { if (container.contains(span)) { container.removeChild(span); } }); removalTimers.current.delete(removalTid); }, duration); removalTimers.current.add(removalTid);
      }
    },
    [ /* ... same dependencies as previous version ... */ elementRef, isEnabled, scaleVariable, colorVariable, color, opacity, duration, createAnimation, maxScale, entryAnimationName, disableAnimations, resolveTheme, onError, entryDefinition, rippleZIndexBase ]
  );

  // --- Pulsate Logic ---
  // Now uses the modified inward pulse animation definition
  const pulsate = useCallback((action: 'start' | 'stop') => {
      const el = elementRef.current;
      const container = rippleContainerRef.current;
      if (!isEnabled || !el || !container) return;

      // Stop pulsating logic remains similar, using exit animation if available
      const stopPulsating = () => {
          const span = pulsatingSpanRef.current;
          if (span && container.contains(span)) {
              pulsatingSpanRef.current = null;
              // Use the standard exit fade-out animation if defined
              if (exitDefinition && !disableAnimations) {
                  span.style.animation = `${exitAnimationName} ${exitDuration}ms linear forwards`;
              } else {
                  // Fallback to simple opacity transition
                  span.style.opacity = '0';
                  span.style.transition = `opacity ${exitDuration}ms linear`;
              }
              const removalTid = window.setTimeout(() => {
                  requestAnimationFrame(() => { if (container.contains(span)) { container.removeChild(span); } });
                  removalTimers.current.delete(removalTid);
              }, exitDuration);
              removalTimers.current.add(removalTid);
          }
      };

      if (action === 'start') {
          // Don't start if already pulsating, animations disabled, or no pulse definition
          if (pulsatingSpanRef.current || disableAnimations || !pulseDefinition) return;

          const rect = el.getBoundingClientRect();
          // Calculate size and position (centered, slightly smaller)
          const size = Math.min(rect.width, rect.height) * 0.8; // Pulse size relative to element
          const px = (rect.width - size) / 2;
          const py = (rect.height - size) / 2;

          let finalPulseColor = 'rgba(0,0,0,0.2)';
          let initialPulseOpacity = opacity * 1.5; // Use the resolved pulse base opacity from useMemo

          // Resolve dynamic pulse visual styles (color, opacity)
          try {
              let baseColor = '';
              let baseOpacityForPulse = opacity; // Start with base option opacity
              if (typeof resolveTheme === 'function') {
                  const theme = resolveTheme();
                  baseColor = theme?.color || '';
                  if (typeof theme?.opacity === 'number') { baseOpacityForPulse = theme.opacity; }
              }
              if (!baseColor) baseColor = pulseColor || getComputedStyle(el).getPropertyValue(colorVariable).trim() || color || '';
              if (baseColor) finalPulseColor = baseColor;
              // Use explicit pulseOpacity if provided, otherwise derive from resolved base opacity
              initialPulseOpacity = pulseOpacity ?? Math.min(1, baseOpacityForPulse * 1.5);
          } catch(e) {
              onError?.(e, "Pulsate - resolve visuals error");
              finalPulseColor = pulseColor || color || 'rgba(0,0,0,0.2)';
              initialPulseOpacity = pulseOpacity ?? Math.min(1, opacity * 1.5);
          }

          // Create pulsating span element
          const span = document.createElement('span');
          // Initial style matches 0% frame of the *new* pulse animation (scale 1, full pulse opacity)
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
            opacity: ${initialPulseOpacity}; /* Start at full pulse opacity */
            transform: scale(1); /* Start at scale 1 */
          `;
          span.setAttribute('aria-hidden', 'true');
          const currentPulseId = `${uniqueId.current}_${rippleCounter.current++}`;
          span.dataset.rippleInstanceId = currentPulseId;

          // Apply the *new* inward pulse animation
          span.style.animation = `${pulseAnimationName} ${pulseDuration}ms ease-in-out infinite`;

          container.appendChild(span);
          pulsatingSpanRef.current = span;
      } else if (action === 'stop') {
          stopPulsating();
      }
  }, [ // Dependencies now include the modified pulse definition and name
      elementRef, isEnabled, pulseColor, pulseOpacity, pulseDuration, colorVariable, color, opacity,
      pulseAnimationName, exitAnimationName, exitDuration, disableAnimations, resolveTheme, onError,
      pulseDefinition, exitDefinition, // Include definitions used
      rippleZIndexBase
  ]);

  // --- Controlled Ripple Creation --- (Unchanged)
  const triggerRippleControlled = useCallback((
    id: string,
    initialStyleVars: Record<string, string | number> = {}
  ) => { /* ... same logic ... */ const container = rippleContainerRef.current; if (!isEnabled || !container) { onError?.(new Error(`Cannot trigger controlled ripple: ${!isEnabled ? "Hook disabled" : "Container not ready"}`), "triggerRippleControlled - Prerequisite fail"); return; } if (pendingRippleIds.current.has(id) || rippleMap.current.has(id)) { onError?.(new Error(`Duplicate or pending ripple ID: ${id}`), "triggerRippleControlled - Duplicate/Pending ID"); console.warn(`useInwardRippleEffect: Ripple with id '${id}' already exists or is being created.`); return; } if (typeof maxControlledRipples === 'number' && rippleMap.current.size >= maxControlledRipples) { onError?.(new Error(`Controlled ripple limit reached (${maxControlledRipples})`), "triggerRippleControlled - Limit reached"); console.warn(`useInwardRippleEffect: Controlled ripple limit (${maxControlledRipples}) reached. Cannot create ripple '${id}'.`); return; } pendingRippleIds.current.add(id); try { const rippleEl = document.createElement('span'); rippleEl.classList.add('ripple-controlled'); rippleEl.dataset.controlledRippleId = id; Object.entries(initialStyleVars).forEach(([key, value]) => { rippleEl.style.setProperty(`--ripple-${key}`, String(value)); }); rippleEl.style.position = 'absolute'; rippleEl.style.pointerEvents = 'none'; container.appendChild(rippleEl); const rippleData: ControlledRippleData = { element: rippleEl, createdAt: Date.now() }; rippleMap.current.set(id, rippleData); } catch (error) { onError?.(error, `triggerRippleControlled - Creation failed for ID: ${id}`); console.error(`useInwardRippleEffect: Error creating controlled ripple '${id}'.`, error); } finally { pendingRippleIds.current.delete(id); } }, [isEnabled, onError, maxControlledRipples]);

  // --- Controlled Ripple Update --- (Unchanged)
  const updateRipple = useCallback((
    id: string,
    styleVars: Record<string, string | number>
  ) => { /* ... same logic ... */ if (!isEnabled) return; const rippleData = rippleMap.current.get(id); if (!rippleData) return; const rippleEl = rippleData.element; Object.entries(styleVars).forEach(([key, value]) => { rippleEl.style.setProperty(`--ripple-${key}`, String(value)); }); }, [isEnabled]);

  // --- Main Cleanup Logic --- (Unchanged)
  const destroy = useCallback(() => { /* ... same logic ... */ clearDelayTimeout(); removalTimers.current.forEach(clearTimeout); removalTimers.current.clear(); if (lifespanIntervalId.current !== null) { clearInterval(lifespanIntervalId.current); lifespanIntervalId.current = null; } if (pulsatingSpanRef.current) { const pulsatingEl = pulsatingSpanRef.current; pulsatingSpanRef.current = null; requestAnimationFrame(() => { pulsatingEl?.remove(); }); } isPointerDownDelayed.current = false; pointerDownCoords.current = null; rippleMap.current.forEach((rippleData) => { const rippleEl = rippleData.element; requestAnimationFrame(() => { rippleEl?.remove(); }); }); rippleMap.current.clear(); pendingRippleIds.current.clear(); }, [clearDelayTimeout]);

  // --- Introspection Function --- (Unchanged)
  const getActiveControlledRippleCount = useCallback(() => {
      return rippleMap.current.size;
  }, []);


  // --- Effect for Setup, Styles, Container, Listeners, Cleanup, and Interval ---
  useIsomorphicLayoutEffect(() => {
    const el = elementRef.current;
    // --- Initial Check & Early Exit/Cleanup --- (Unchanged)
    if (!el || !isEnabled) { /* ... same cleanup ... */ const currentContainer = rippleContainerRef.current; if (currentContainer && elementRef.current?.contains(currentContainer)) { try { elementRef.current.removeChild(currentContainer); } catch(e) {} } rippleContainerRef.current = null; destroy(); return; }

    // --- Create/Manage Ripple Container --- (Unchanged)
    let container = rippleContainerRef.current; if (!container || !el.contains(container)) { /* ... same creation/find logic ... */ const existingContainer = el.querySelector<HTMLDivElement>(`div[data-ripple-container="${uniqueId.current}"]`); if (existingContainer) { container = existingContainer; } else { container = document.createElement('div'); container.style.cssText = `position:absolute; inset:0; overflow:hidden; pointer-events:none; z-index:${zIndex};`; container.dataset.rippleContainer = uniqueId.current; if (typeof document !== 'undefined' && document.body.contains(el)) { el.appendChild(container); } else { container = null; console.warn("useInwardRippleEffect: Target element not in DOM during initial setup. Container creation deferred."); } } rippleContainerRef.current = container; }

    // --- Inject Styles ---
    // Inject keyframes including the *new* inward pulse animation
    const styleOptions = { onError, rippleZIndexBase };
    if (!disableAnimations) {
        if (createAnimation && entryDefinition) {
            injectKeyframes(entryAnimationName, entryDefinition, styleOptions, styleTarget, styleInsertion);
        }
        if (exitDefinition) {
            injectKeyframes(exitAnimationName, exitDefinition, styleOptions, styleTarget, styleInsertion);
        }
        if (pulseDefinition) { // Inject the NEW inward pulse definition
            injectKeyframes(pulseAnimationName, pulseDefinition, styleOptions, styleTarget, styleInsertion);
        }
    }
    // Inject controlled ripple CSS (unchanged definition)
    const controlledRippleCssIdentifier = 'ripple-controlled-styles';
    const controlledRippleCss = `
      .ripple-controlled { /* Definition unchanged */
        position: absolute; border-radius: 50%; pointer-events: none; transform-origin: center center;
        --ripple-x: 50%; --ripple-y: 50%; --ripple-scale: 0; --ripple-opacity: 0.5;
        --ripple-color: rgba(0, 0, 0, 0.2); --ripple-size: 50px; --ripple-duration: 300ms;
        top: var(--ripple-y); left: var(--ripple-x); width: var(--ripple-size); height: var(--ripple-size);
        background-color: var(--ripple-color); opacity: var(--ripple-opacity);
        transform: translate(-50%, -50%) scale(var(--ripple-scale));
        z-index: var(--ripple-zindex, ${rippleZIndexBase});
        transition: transform var(--ripple-duration) ease-out, opacity var(--ripple-duration) ease-out, background-color var(--ripple-duration) ease-out;
      }`;
    injectCssRule(controlledRippleCssIdentifier, controlledRippleCss, styleOptions, styleTarget, styleInsertion);


    // --- Event Listeners Setup --- (Unchanged logic)
    const listenerOptions = { passive: pointerPassive ?? true, capture: pointerCapture ?? false };
    const handlePointerMove = (ev: PointerEvent) => { /* ... same logic ... */ if (delayTimeoutRef.current === null || !pointerDownCoords.current) return; const dx = ev.clientX - pointerDownCoords.current.x; const dy = ev.clientY - pointerDownCoords.current.y; if (Math.sqrt(dx * dx + dy * dy) > cancelMoveThreshold) { clearDelayTimeout(); removeListeners(); } };
    const handlePointerUpOrCancel = () => { /* ... same logic ... */ if (delayTimeoutRef.current !== null) { clearDelayTimeout(); if (pointerDownCoords.current) { triggerRippleAt(pointerDownCoords.current.x, pointerDownCoords.current.y); } } removeListeners(); };
    const removeListeners = () => { /* ... same logic ... */ window.removeEventListener('pointermove', handlePointerMove); window.removeEventListener('pointerup', handlePointerUpOrCancel); window.removeEventListener('pointercancel', handlePointerUpOrCancel); isPointerDownDelayed.current = false; pointerDownCoords.current = null; };
    const handlePointerDown = (e: Event) => { /* ... same logic ... */ const ev = e as PointerEvent; if (!autoTrigger || !isEnabled || disableAnimations || ev.button !== 0) return; if (delayTimeoutRef.current !== null) return; pointerDownCoords.current = { x: ev.clientX, y: ev.clientY }; window.addEventListener('pointermove', handlePointerMove); window.addEventListener('pointerup', handlePointerUpOrCancel); window.addEventListener('pointercancel', handlePointerUpOrCancel); isPointerDownDelayed.current = true; delayTimeoutRef.current = window.setTimeout(() => { delayTimeoutRef.current = null; if (pointerDownCoords.current) { triggerRippleAt(pointerDownCoords.current.x, pointerDownCoords.current.y); } if(isPointerDownDelayed.current) { removeListeners(); } }, delay); };
    if (autoTrigger) {
      el.addEventListener('pointerdown', handlePointerDown, listenerOptions);
    }

    // --- Lifespan Cleanup Interval --- (Unchanged)
    if (lifespanIntervalId.current !== null) { clearInterval(lifespanIntervalId.current); }
    if (typeof controlledRippleMaxLifespan === 'number' && controlledRippleMaxLifespan > 0) { /* ... same interval setup ... */ lifespanIntervalId.current = window.setInterval(() => { if (rippleMap.current.size === 0) return; const now = Date.now(); try { rippleMap.current.forEach((rippleData, id) => { if (now - rippleData.createdAt > controlledRippleMaxLifespan) { onRippleExpire?.(id); destroyRipple(id); } }); } catch (intervalError) { onError?.(intervalError, "Lifespan check interval error"); console.error("useInwardRippleEffect: Error during ripple lifespan check:", intervalError); } }, lifespanCheckInterval); } else { lifespanIntervalId.current = null; }

    // --- Effect Cleanup Function --- (Unchanged)
    return () => { /* ... same cleanup logic ... */ if (autoTrigger) { el?.removeEventListener('pointerdown', handlePointerDown, listenerOptions); } if (isPointerDownDelayed.current) { removeListeners(); } const currentContainer = rippleContainerRef.current; const currentEl = elementRef.current; if (currentEl && currentContainer && currentEl.contains(currentContainer)) { try { currentEl.removeChild(currentContainer); } catch (e) {} } rippleContainerRef.current = null; destroy(); };
  }, [ // Dependencies array includes updated pulse items
    elementRef, isEnabled,
    zIndex, color, duration, opacity, scaleVariable, colorVariable, createAnimation, animationName, maxScale,
    delay, cancelMoveThreshold,
    exitDuration, exitAnimationNameBase,
    pulseColor, pulseOpacity, pulseDuration, pulseAnimationNameBase, // Include base pulse name
    autoTrigger, pointerPassive, pointerCapture,
    styleTarget, styleInsertion, disableAnimations, resolveTheme, onError,
    maxControlledRipples, controlledRippleMaxLifespan, lifespanCheckInterval, rippleZIndexBase, onRippleExpire,
    triggerRippleAt, clearDelayTimeout, destroy, destroyRipple, // triggerRippleAt unchanged here
    entryDefinition, exitDefinition, pulseDefinition, // Include NEW pulseDefinition
    entryAnimationName, exitAnimationName, pulseAnimationName, // Include NEW pulseAnimationName
  ]); // END useIsomorphicLayoutEffect

  // --- Convenience Trigger --- (Unchanged)
  const triggerRipple = useCallback(<E extends Element>(event: React.MouseEvent<E>) => {
      if (!isEnabled || (autoTrigger && delay > 0 && delayTimeoutRef.current !== null) || event.button !== 0) return;
      triggerRippleAt(event.clientX, event.clientY);
  }, [triggerRippleAt, autoTrigger, delay, isEnabled]);

  // --- Return Hook API ---
  return {
    triggerRipple,
    triggerRippleAt,
    pulsate, // Now triggers inward pulse
    destroy,
    triggerRippleControlled,
    updateRipple,
    destroyRipple,
    getActiveControlledRippleCount,
  };
}

// Export the hook as the default export
export default useInwardRippleEffect;
