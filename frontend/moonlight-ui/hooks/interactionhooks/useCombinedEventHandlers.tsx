import { useMemo } from 'react';

// ==========================================================
// TYPES
// ==========================================================

/**
 * Generic type for an event handler function.
 * @template E - The specific event type (e.g., React.MouseEvent, Event). Defaults to Event.
 */
export type EventHandler<E = Event> = (event: E, ...args: any[]) => void;

/**
 * Type for an object containing event handlers, keyed by event name (e.g., 'onClick').
 * Values can be EventHandler functions or undefined.
 */
export type EventHandlers = Record<string, EventHandler<any> | undefined>;

/**
 * Type for the input arguments to the useCombinedEventHandlers hook.
 * Accepts EventHandlers objects, or null/undefined for convenience.
 */
type HandlerInput = EventHandlers | null | undefined;

// ==========================================================
// HOOK IMPLEMENTATION
// ==========================================================

/**
 * Custom React hook to combine multiple event handler objects into one.
 *
 * This hook takes any number of event handler objects (or null/undefined) as input.
 * It returns a single memoized object where each key (e.g., 'onClick') maps to a
 * function that calls all corresponding handlers from the input objects in the order
 * they were provided.
 *
 * @param {...HandlerInput} handlersInput - A variable number of event handler objects (or null/undefined).
 * @returns {EventHandlers} A memoized object containing the combined event handlers.
 *
 * @important Performance Consideration:
 * For this hook to be effective and prevent unnecessary recalculations/re-renders,
 * the input handler objects (`handlersInput`) and the functions within them MUST have
 * stable references across renders. Use `React.useCallback` for handler functions defined
 * within components and `React.useMemo` for handler objects created within components
 * before passing them to `useCombinedEventHandlers`. Failure to do so will negate the
 * benefit of the `useMemo` used internally by this hook.
 */
export function useCombinedEventHandlers(...handlersInput: HandlerInput[]): EventHandlers {
  // Step 1: Filter out any null or undefined inputs to work only with valid handler objects.
  // We explicitly cast to EventHandlers[] as filter(Boolean) correctly narrows the type.
  const validHandlers = useMemo(() => handlersInput.filter(h => h != null) as EventHandlers[], [handlersInput]);

  // Step 2: Memoize the process of combining handlers.
  // The dependency array [validHandlers] ensures this logic only runs if the array
  // of valid handler *objects* changes identity (shallow comparison).
  const combinedHandlers = useMemo(() => {
    // Initialize the resulting object to store combined handlers.
    const result: EventHandlers = {};

    // Step 3: Identify all unique event keys present across all valid handler objects.
    // Using a Set automatically handles uniqueness.
    const eventKeys = new Set<string>();
    validHandlers.forEach(handlers => {
      Object.keys(handlers).forEach(key => {
        // Only add the key if it corresponds to an actual function in the current handler object.
        if (typeof handlers[key] === 'function') {
          eventKeys.add(key);
        }
      });
    });

    // Step 4: Create a combined handler function for each unique event key.
    eventKeys.forEach(key => {
      // Collect all handler functions associated with the current key from all valid input objects.
      const funcsForKey: EventHandler<any>[] = [];
      validHandlers.forEach(handlers => {
        const handler = handlers[key];
        if (typeof handler === 'function') {
          funcsForKey.push(handler);
        }
      });

      // If any functions were found for this key, create the combined handler.
      if (funcsForKey.length > 0) {
        // Assign a new function to the result object for the current key.
        // This function, when called, will execute all collected handlers for that event.
        result[key] = (event: any, ...args: any[]) => {
          // Iterate through the collected functions and call each one with the event
          // and any additional arguments passed to the combined handler.
          funcsForKey.forEach(func => func(event, ...args));
        };
      }
    });

    // Step 5: Return the fully populated result object.
    return result;
    // The dependency array ensures this complex calculation is memoized.
  }, [validHandlers]); // Dependency: Recalculate only if the array of handler objects changes.

  // Return the memoized object containing the combined handlers.
  return combinedHandlers;
}

// ==========================================================
// EXAMPLE USAGE (Illustrative - requires component context)
// ==========================================================

/*
import React, { useState, useCallback, useMemo } from 'react';
import { useCombinedEventHandlers, EventHandlers } from './useCombinedEventHandlers'; // Adjust path

// Example Hook 1: Generates interaction handlers
const useInteractionHandlers = (): EventHandlers => {
  // --- IMPORTANT: Use useCallback for stable function references ---
  const handleClick = useCallback(() => { console.log('Interaction Click'); }, []);
  const handleMouseEnter = useCallback(() => { console.log('Interaction Mouse Enter'); }, []);

  // --- IMPORTANT: Memoize the returned object for stable reference ---
  return useMemo(() => ({
    onClick: handleClick,
    onMouseEnter: handleMouseEnter
  }), [handleClick, handleMouseEnter]);
};

// Example Hook 2: Generates analytics handlers
const useAnalyticsHandlers = (id: string): EventHandlers => {
  // --- IMPORTANT: Use useCallback ---
  const trackClick = useCallback(() => {
    console.log(`Analytics Click for ${id}`);
    // analytics.track('click', { componentId: id }); // Example tracking call
  }, [id]); // Dependency array includes 'id'

  // --- IMPORTANT: Memoize the object ---
  return useMemo(() => ({
     onClick: trackClick
  }), [trackClick]);
};


// Example Component using the hook
function MyButton({ id, label, onClick: propOnClick, ...restProps }: { id: string, label: string, onClick?: () => void, [key: string]: any }) {
  // Get handlers from custom hooks
  const interactionHandlers = useInteractionHandlers();
  const analyticsHandlers = useAnalyticsHandlers(id);

  // Prepare handlers from props (ensure stability)
  // --- IMPORTANT: Memoize prop-based handlers ---
  const propHandlers = useMemo(() => ({
    onClick: propOnClick // Assumes propOnClick is stable or wrapped in useCallback by parent
  }), [propOnClick]);

  // Combine all handlers using the hook
  const combinedProps = useCombinedEventHandlers(
    interactionHandlers, // Handlers from hook 1
    analyticsHandlers,   // Handlers from hook 2
    propHandlers,        // Handlers from props
    restProps            // Include any other event handlers passed via props (e.g., onFocus)
  );

  console.log('Rendering MyButton - Check console logs for stability');

  // Spread the combined handlers onto the button element
  return (
    <button {...combinedProps}>
      {label}
    </button>
  );
}
*/

