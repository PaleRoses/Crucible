'use client';

/**
 * # Enhanced Theme System with Dynamic Injection & Meta Tag Update
 * * This file implements a complete theme management system for Next.js applications
 * with dynamic theme injection support and dynamic theme-color meta tag updates.
 * * ## Key Features
 * * 1. **Flash Of Unstyled Content (FOUC) Prevention**
 * - Uses a two-pronged approach: inline script + ThemeProvider initialization.
 * * 2. **Theme Persistence**
 * - Saves theme preference to localStorage.
 * * 3. **System Preference Detection**
 * - Respects and syncs with system dark/light mode.
 * * 4. **Cross-Tab Synchronization**
 * - Syncs theme changes across multiple tabs.
 * * 5. **SSR Compatibility**
 * - Prevents hydration mismatches and layout shifts.
 * * 6. **Dynamic Theme Injection**
 * - Loads and injects theme CSS at runtime.
 * * 7. **Dynamic Meta Theme Color Update (NEW)**
 * - Updates the `<meta name="theme-color">` tag when the theme changes.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ThemeName, THEMES } from './themeTypes'; // Adjust path if needed

// Define the shape of the theme context
type ThemeContextType = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  resetTheme: () => void;
  isThemeLoading: boolean;
};

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType>({
  theme: 'midnight', // Default theme
  setTheme: () => {},
  resetTheme: () => {},
  isThemeLoading: false,
});

/**
 * Inline script component to detect and set theme before React hydration
 * (Code remains the same as provided)
 */
export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
        (function() {
          try {
            // IMPORTANT: No theme detection or modification during SSR hydration phase
            // Instead, we'll use a deferred execution approach to prevent hydration mismatches
            
            function setThemeAfterHydration() {
              // Get the current theme attribute (if any)
              var currentTheme = document.documentElement.getAttribute('data-panda-theme');
              var savedTheme = null;
              
              try {
                // Only access localStorage after hydration is likely complete
                savedTheme = localStorage.getItem('theme');
              } catch (e) {
                // Ignore storage access errors
              }
              
              var validThemes = ['midnight', 'starlight', 'moonlight', 'eclipse', 'nebula'];
              var prefersDark = false;
              
              try {
                prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              } catch (e) {
                // Ignore media query errors
              }
              
              // Determine the correct theme to use
              var targetTheme;
              if (savedTheme && validThemes.includes(savedTheme)) {
                targetTheme = savedTheme;
              } else {
                targetTheme = prefersDark ? 'midnight' : 'starlight';
              }
              
              // Only update if needed, and do it after a slight delay to ensure hydration is complete
              if (currentTheme !== targetTheme) {
                // Store the theme for React to pick up when it initializes
                window.__NEXT_THEME_APPLIED = targetTheme;
              }
            }
            
            // Run immediately but wait for DOM to be ready
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', function() {
                // Extra timeout to ensure we're past hydration
                setTimeout(setThemeAfterHydration, 0);
              });
            } else {
              // DOM already ready, still delay to avoid hydration issues
              setTimeout(setThemeAfterHydration, 0);
            }
          } catch (e) {
            // Fail silently - the React component will handle theme
            console.error('Theme script error:', e);
          }
        })();
      `,
      }}
    />
  );
}

// Props for the ThemeProvider
type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: ThemeName;
};

/**
 * Dynamically injects theme CSS
 * Returns a Promise that resolves when the theme is injected
 * (Code remains the same as provided)
 */
async function injectDynamicTheme(themeName: ThemeName): Promise<boolean> {
  try {
    // Dynamic import of the themes module - adjust path as needed
    const { getTheme, injectTheme } = await import('../../../../styled-system/themes'); 
    
    // Get theme data and inject it
    const themeData = await getTheme(themeName);
    if (!themeData) {
      console.error(`Theme data not found for: ${themeName}`);
      return false;
    }
    
    // Inject theme styles into the DOM
    injectTheme(document.documentElement, themeData);
    return true;
  } catch (error) {
    console.error('Failed to load or inject theme:', error);
    return false;
  }
}

/**
 * ThemeProvider manages the theme state, persistence, system preferences,
 * dynamic injection, and meta tag updates.
 */
export function ThemeProvider({
  children,
  defaultTheme = 'midnight', // Default theme if none specified
}: ThemeProviderProps) {
  // Initialize with the defaultTheme for server rendering
  const [theme, setThemeState] = useState<ThemeName>(defaultTheme);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isThemeLoading, setIsThemeLoading] = useState(false);

  // --- NEW: Helper function to update the theme-color meta tag ---
  const updateMetaThemeColor = useCallback(() => {
    if (typeof window === 'undefined' || !isHydrated) return; // Only run client-side after hydration

    try {
        // 1. Get the actual computed background color value
        const newThemeColor = getComputedStyle(document.documentElement)
                               .getPropertyValue('--color-background') // Read the CSS variable
                               .trim(); 

        if (!newThemeColor) {
            console.warn('Could not compute --color-background for meta tag update.');
            return;
        }

        // 2. Find the theme-color meta tag
        let metaThemeColor: HTMLMetaElement | null = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

        // 3. If it doesn't exist, create it
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
            console.log('Created theme-color meta tag.');
        }

        // 4. Update the 'content' attribute
        if (metaThemeColor.getAttribute('content') !== newThemeColor) {
             metaThemeColor.setAttribute('content', newThemeColor);
             console.log(`Updated theme-color meta tag to: ${newThemeColor}`);
        }
    } catch (error) {
        console.error('Error updating theme-color meta tag:', error);
    }
  }, [isHydrated]); // Depends on hydration status


  // Function to set the theme with validation, persistence, dynamic injection, and meta update
  const setTheme = useCallback(async (newTheme: ThemeName) => {
    // Validate theme name
    if (!Object.keys(THEMES).includes(newTheme)) {
      console.warn(`Theme "${newTheme}" is not defined, falling back to "${defaultTheme}"`);
      newTheme = defaultTheme;
    }

    // Update state immediately
    setThemeState(newTheme); 
    setIsThemeLoading(true);

    if (typeof window !== 'undefined' && isHydrated) {
      try {
        // Save to localStorage
        localStorage.setItem('theme', newTheme);
        
        // Update data attribute on HTML element
        document.documentElement.setAttribute('data-panda-theme', newTheme);
        
        // Dynamically inject the theme CSS
        const injected = await injectDynamicTheme(newTheme);
        
        if (injected) {
          // Force a repaint (optional, but can help ensure variables are applied before reading)
          const html = document.documentElement;
          const currentDisplay = html.style.display;
          html.style.display = 'none';
          void html.offsetHeight; // Force reflow
          html.style.display = currentDisplay;

          // --- Call meta tag update AFTER injection and repaint ---
          updateMetaThemeColor(); 
        }
        
        // Log theme change for debugging
        console.log('Theme changed to:', newTheme);
        
      } catch (error) {
        console.error('Error setting theme:', error);
      } finally {
        setIsThemeLoading(false);
      }
    } else {
      // If not hydrated or server-side, just stop loading indicator
      setIsThemeLoading(false); 
    }
  }, [defaultTheme, isHydrated, updateMetaThemeColor]); // Added updateMetaThemeColor dependency
  
  // Function to reset theme to system preference
  const resetTheme = useCallback(async () => {
    if (typeof window !== 'undefined' && isHydrated) {
      setIsThemeLoading(true);
      
      try {
        // Remove stored theme
        localStorage.removeItem('theme');
        
        // Detect system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const newTheme = prefersDark ? 'midnight' : 'starlight';
        
        // Update state
        setThemeState(newTheme);
        
        // Update attribute
        document.documentElement.setAttribute('data-panda-theme', newTheme);
        
        // Inject theme
        const injected = await injectDynamicTheme(newTheme);

        // --- Call meta tag update AFTER injection ---
        if (injected) {
            updateMetaThemeColor();
        }

      } catch (error) {
        console.error('Error resetting theme:', error);
      } finally {
        setIsThemeLoading(false);
      }
    }
  }, [isHydrated, updateMetaThemeColor]); // Added updateMetaThemeColor dependency

  // Extend Window interface for custom property
  interface CustomWindow extends Window {
    __NEXT_THEME_APPLIED?: ThemeName;
  }

  // Effect for initial theme setup on hydration
  useEffect(() => {
    // Mark as hydrated after first render
    setIsHydrated(true); 
    
    // Safely access client-side theme after hydration
    if (typeof window !== 'undefined') {
      const initialSetup = async () => {
        setIsThemeLoading(true);
        
        try {
          // Check for theme detected by inline script
          const scriptDetectedTheme = (window as CustomWindow).__NEXT_THEME_APPLIED;
          
          // Read from localStorage
          let userTheme: ThemeName | null = null;
          try {
            userTheme = localStorage.getItem('theme') as ThemeName | null;
          } catch (e) { /* Ignore */ }
          
          // Detect system preference
          let systemTheme: ThemeName | null = null;
          try {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            systemTheme = prefersDark ? 'midnight' : 'starlight';
          } catch (e) { /* Ignore */ }
          
          // Determine final theme based on priority
          const finalTheme = userTheme || scriptDetectedTheme || systemTheme || defaultTheme;
          
          // Apply theme if different from initial state
          if (finalTheme !== theme) {
            setThemeState(finalTheme);
            document.documentElement.setAttribute('data-panda-theme', finalTheme);
            const injected = await injectDynamicTheme(finalTheme);
            // --- Call meta tag update AFTER initial injection ---
            if (injected) {
                updateMetaThemeColor();
            }
          } else {
            // If theme is already correct, still ensure meta tag is updated
             updateMetaThemeColor();
          }
          
          // Apply transitions after initial setup
          setTimeout(() => {
            document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
          }, 100);

        } catch (error) {
          console.error('Error during initial theme setup:', error);
        } finally {
          setIsThemeLoading(false);
        }
      };
      
      initialSetup();
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultTheme, updateMetaThemeColor]); // Added updateMetaThemeColor dependency

  // Listen for system theme changes - only after hydration
  useEffect(() => {
    if (!isHydrated) return; // Don't run on server or before hydration
    
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      // Handler for system theme changes
      const handleChange = (e: MediaQueryListEvent) => {
        // Only change if the user hasn't explicitly set a theme
        if (!localStorage.getItem('theme')) { 
          // Use setTheme to ensure injection and meta update happens
          setTheme(e.matches ? 'midnight' : 'starlight'); 
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      // Cleanup listener on unmount
      return () => mediaQuery.removeEventListener('change', handleChange); 
    } catch (error) {
      console.error('Failed to set up system theme change listener:', error);
      return () => {}; // Return empty cleanup function on error
    }
  }, [setTheme, isHydrated]); // Depends on setTheme and hydration

  // Sync theme across tabs - only after hydration
  useEffect(() => {
    if (!isHydrated) return; // Don't run on server or before hydration
    
    // Handler for storage events from other tabs
    const handleStorageChange = async (e: StorageEvent) => {
      // Check if the 'theme' key changed in localStorage
      if (e.key === 'theme' && e.newValue && Object.keys(THEMES).includes(e.newValue as ThemeName)) {
        const newTheme = e.newValue as ThemeName;
        // Update local state and HTML attribute
        setThemeState(newTheme); 
        document.documentElement.setAttribute('data-panda-theme', newTheme);
        
        // Inject theme CSS for the change from another tab
        const injected = await injectDynamicTheme(newTheme);
        // --- Call meta tag update AFTER cross-tab injection ---
         if (injected) {
            updateMetaThemeColor();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Cleanup listener on unmount
    return () => window.removeEventListener('storage', handleStorageChange); 
  }, [isHydrated, updateMetaThemeColor]); // Added updateMetaThemeColor dependency

  // Provide theme context value to children
  return (
    <ThemeContext.Provider value={{ theme, setTheme, resetTheme, isThemeLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to access the theme context
 * @throws {Error} If used outside a ThemeProvider
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    // Throw error if hook is used outside of the provider
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
