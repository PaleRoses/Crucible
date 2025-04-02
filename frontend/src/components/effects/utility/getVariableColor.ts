/**
 * getVariableColor.ts
 *
 * Utility to get the computed value of CSS color variables in the browser.
 * Includes a React hook and a memoized version.
 */
import { useMemo, useEffect, useState } from 'react';

/**
 * Configuration options for getVariableColor functions.
 */
export interface GetVariableColorOptions {
  /** Fallback color if the variable is invalid or cannot be resolved. Defaults to '#000000'. */
  fallback?: string;
  /** Print debug information to the console during resolution. */
  debug?: boolean;
}

/**
 * Extracts the CSS variable name (e.g., '--my-color') from a var() expression.
 * Handles simple cases like `var(--my-color)` and `var(--my-color, fallback)`.
 *
 * @param colorValue - The CSS string potentially containing a var() expression.
 * @returns The variable name or null if not a valid var() expression.
 */
const extractVariableName = (colorValue: string): string | null => {
  if (typeof colorValue !== 'string' || !colorValue.startsWith('var(')) {
    return null;
  }
  // Match var(--variable-name) or var(--variable-name, fallback)
  // Captures only the variable name itself.
  const varMatch = colorValue.match(/^\s*var\s*\(\s*(--[^,)]+)/);
  return varMatch ? varMatch[1].trim() : null;
};

/**
 * Gets the computed value of a CSS color variable from the document's root element.
 * Returns the original value if it's not a variable or the fallback if resolution fails.
 * Designed to run only in the browser environment.
 *
 * @param colorValue - CSS variable string (e.g., 'var(--color-primary)') or a direct color value.
 * @param options - Configuration options.
 * @returns The computed color value as a string (e.g., 'rgb(191, 173, 127)') or the fallback.
 */
export const getVariableColor = (
  colorValue: string,
  options: GetVariableColorOptions = {}
): string => {
  const { fallback = '#000000', debug = false } = options;
  const isClient = typeof window !== 'undefined' && typeof document !== 'undefined';

  if (!isClient) {
    if (debug) console.log(`[getVariableColor] SSR/Non-browser, returning fallback for: ${colorValue}`);
    // Try to parse fallback from var(--name, fallback) if present, otherwise use option fallback
    const varFallbackMatch = colorValue?.match(/var\s*\([^,]+,\s*([^)]+)\s*\)/);
    return varFallbackMatch?.[1]?.trim() || fallback;
  }

  const variableName = extractVariableName(colorValue);

  // If it's not a valid var() expression, return the original value
  if (!variableName) {
    if (debug) console.log(`[getVariableColor] Not a CSS variable or invalid syntax, returning input: "${colorValue}"`);
    return colorValue;
  }

  if (debug) console.log(`[getVariableColor] Resolving variable: ${variableName} from input: ${colorValue}`);

  // Get computed value from the root element (:root or html)
  try {
    const computedValue = getComputedStyle(document.documentElement)
      .getPropertyValue(variableName)
      .trim();

    if (debug) console.log(`[getVariableColor] Computed value: "${computedValue}" for ${variableName}`);

    // If the computed value is empty (variable not defined), return the fallback
    if (!computedValue) {
      if (debug) console.log(`[getVariableColor] Variable ${variableName} not found or empty, using fallback`);
      // Try to parse fallback from var(--name, fallback) if present, otherwise use option fallback
      const varFallbackMatch = colorValue.match(/var\s*\([^,]+,\s*([^)]+)\s*\)/);
      return varFallbackMatch?.[1]?.trim() || fallback;
    }

    // Recursively resolve if the value is another variable (simple case)
    if (computedValue.startsWith('var(')) {
       if (debug) console.log(`[getVariableColor] Value is another variable "${computedValue}", resolving recursively...`);
       return getVariableColor(computedValue, options); // Basic recursion
    }

    return computedValue;
  } catch (error) {
    if (debug) console.error(`[getVariableColor] Error resolving ${variableName}:`, error);
    return fallback; // Return fallback on any error
  }
};

// --- Memoization Cache ---
// Defined once at module level for a shared cache.
const colorCache = new Map<string, string>();
let cacheEnabled = true; // Allow disabling cache if needed

/**
 * Clears the shared color resolution cache.
 * Useful if global CSS variables change dynamically (e.g., theme switch).
 */
export const clearVariableColorCache = (): void => {
    console.log("[getVariableColor] Clearing color cache.");
    colorCache.clear();
};

/**
 * Enables or disables the shared color resolution cache.
 * @param enable - Set to true to enable, false to disable.
 */
export const enableVariableColorCache = (enable: boolean): void => {
    console.log(`[getVariableColor] Cache ${enable ? 'enabled' : 'disabled'}.`);
    cacheEnabled = enable;
    if (!enable) {
        clearVariableColorCache();
    }
}

/**
 * A memoized version of `getVariableColor` using a shared module-level cache.
 * Checks the cache before computing the color value.
 *
 * @param colorValue - CSS variable string or direct color value.
 * @param options - Configuration options.
 * @returns The computed (and potentially cached) color value or fallback.
 */
export const memoizedGetVariableColor = (
  colorValue: string,
  options: GetVariableColorOptions = {}
): string => {
  // Use a consistent key including the fallback specified in options
  const fallbackKey = options.fallback || '#000000'; // Use default if not provided
  const cacheKey = `${colorValue}|${fallbackKey}`;

  if (cacheEnabled && colorCache.has(cacheKey)) {
    if (options.debug) console.log(`[getVariableColor] Cache hit for: ${cacheKey}`);
    return colorCache.get(cacheKey)!;
  }

  if (options.debug) console.log(`[getVariableColor] Cache miss for: ${cacheKey}`);
  const result = getVariableColor(colorValue, options);

  if (cacheEnabled) {
      colorCache.set(cacheKey, result);
  }

  return result;
};


/**
 * React Hook to get the computed value of a CSS color variable.
 * It memoizes the result based on inputs and handles SSR gracefully.
 * Note: This hook does *not* automatically update if the CSS variable value
 * changes dynamically *after* the component mounts unless the input `colorValue` changes.
 * For dynamic updates, consider using the `useDynamicVariableColor` hook instead.
 *
 * @param colorValue - CSS variable string or direct color value.
 * @param options - Configuration options.
 * @returns The computed color value or fallback.
 */
export const useVariableColor = (
  colorValue: string,
  options: GetVariableColorOptions = {}
): string => {
  // Memoize based on colorValue and the options object structure/values.
  // JSON.stringify is a simple way to memoize based on object content, but use cautiously.
  const optionsKey = JSON.stringify(options);

  return useMemo(() => {
    // Call the memoized version within useMemo for caching across hook calls
    return memoizedGetVariableColor(colorValue, options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorValue, optionsKey]); // Recalculate only if colorValue or options change
};


/**
 * React Hook that attempts to dynamically update the color when CSS variables change.
 * Uses a MutationObserver to detect changes to the root element's style attribute.
 * More resource-intensive than `useVariableColor`.
 *
 * @param colorValue - CSS variable string or direct color value.
 * @param options - Configuration options.
 * @returns The dynamically updated computed color value or fallback.
 */
export const useDynamicVariableColor = (
  colorValue: string,
  options: GetVariableColorOptions = {}
): string => {
  const [resolvedColor, setResolvedColor] = useState(() => memoizedGetVariableColor(colorValue, options));

  useEffect(() => {
    // Initial resolution in effect (handles client-side mount)
    const initialResolvedValue = memoizedGetVariableColor(colorValue, options);
    setResolvedColor(initialResolvedValue);

    // Only run observer logic in the browser
    if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') {
        return;
    }

    // Function to re-resolve the color
    const updateColor = () => {
        // Clear cache *before* resolving to get the latest value
        clearVariableColorCache(); // Or could clear only the specific key if known
        const newlyResolvedValue = memoizedGetVariableColor(colorValue, options);
        setResolvedColor(newlyResolvedValue);
         if (options.debug) console.log(`[useDynamicVariableColor] Re-resolved ${colorValue} to ${newlyResolvedValue}`);
    };

    // Observe changes to :root (document.documentElement) style attribute
    // This is a common way themes might inject variable changes.
    // Observing class changes might also be necessary depending on theme implementation.
    const observer = new MutationObserver((mutationsList) => {
        for(const mutation of mutationsList) {
            if (mutation.type === 'attributes' && (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
                 if (options.debug) console.log('[useDynamicVariableColor] Root style/class attribute changed, re-resolving color.');
                 updateColor();
                 break; // Only need to update once per batch of mutations
            }
        }
    });

    observer.observe(document.documentElement, {
        attributes: true, // Observe attribute changes
        attributeFilter: ['style', 'class'] // Focus on style and class attributes
    });

     if (options.debug) console.log('[useDynamicVariableColor] Observer attached.');

    // Cleanup function
    return () => {
        if (options.debug) console.log('[useDynamicVariableColor] Observer disconnected.');
        observer.disconnect();
    };
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorValue, JSON.stringify(options)]); // Rerun effect if colorValue or options change

  return resolvedColor;
};

export default getVariableColor; // Default export the basic function
