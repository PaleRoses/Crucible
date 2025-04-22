/**
 * A responsive hook that detects whether a CSS media query matches the current viewport.
 * 
 * This hook provides a convenient way to respond to media queries in React components
 * with proper lifecycle management and browser compatibility handling.
 * 
 * @example
 * // Check if viewport is in mobile size range
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * 
 * @example
 * // Check if user prefers dark mode
 * const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
 * 
 * @example
 * // Check if user prefers reduced motion
 * const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
 */

import { useState, useEffect } from 'react';

/**
 * Returns whether a specified media query matches the current viewport
 * 
 * @param query A valid CSS media query string
 * @returns boolean indicating whether the media query matches
 */
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    // Early return for SSR environments
    if (typeof window === 'undefined') return;
    
    const media = window.matchMedia(query);
    const updateMatch = () => setMatches(media.matches);
    
    // Initial check
    updateMatch();
    
    // Browser compatibility handling
    if (typeof media.addEventListener === 'function') {
      // Modern browsers including Safari 14+
      media.addEventListener('change', updateMatch);
      return () => media.removeEventListener('change', updateMatch);
    } else {
      // Older browsers including Safari ≤ 14
      media.addListener(updateMatch);
      return () => media.removeListener(updateMatch);
    }
  }, [query]);
  
  return matches;
};

export default useMediaQuery;