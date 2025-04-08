'use client';

import { useState, useEffect } from 'react';

/**
 * A hook that persists state in localStorage
 * 
 * @param key - The localStorage key to store the value under
 * @param initialValue - The initial value to use if no value exists in localStorage
 * @returns A stateful value and a function to update it, similar to useState
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Create state based on the initial value
  const [state, setState] = useState<T>(initialValue);
  
  // Initialize the state from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const item = localStorage.getItem(key);
      
      // If the item exists in localStorage, parse and set it
      if (item) {
        setState(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      // If there's an error, use the initial value
      setState(initialValue);
    }
  }, [key, initialValue]);
  
  // Update localStorage when the state changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  }, [key, state]);
  
  return [state, setState];
}

export default usePersistedState;