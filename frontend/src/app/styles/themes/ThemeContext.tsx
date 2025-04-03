'use client';

/**
 * # Enhanced Theme System with Dynamic Injection
 * 
 * This file implements a complete theme management system for Next.js applications
 * with dynamic theme injection support.
 * 
 * ## Key Features
 * 
 * 1. **Flash Of Unstyled Content (FOUC) Prevention**
 *    - Uses a two-pronged approach to eliminate theme flashing:
 *      a. Inline script that runs before React hydration to set the initial theme
 *      b. ThemeProvider that initializes with the pre-detected theme
 * 
 * 2. **Theme Persistence**
 *    - Saves theme preference to localStorage
 *    - Restores theme on page reload/revisit
 * 
 * 3. **System Preference Detection**
 *    - Detects and respects user's system dark/light mode preference
 *    - Listens for changes to system preference
 * 
 * 4. **Cross-Tab Synchronization**
 *    - Synchronizes theme changes across multiple open tabs
 * 
 * 5. **SSR Compatibility**
 *    - Works with server-side rendering without hydration mismatches
 *    - Prevents layout shifts by applying theme before first paint
 * 
 * 6. **Dynamic Theme Injection**
 *    - Loads and injects theme CSS at runtime
 *    - Ensures theme changes apply correctly even without static generation
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ThemeName, THEMES } from './themeTypes';

// Define the shape of the theme context
type ThemeContextType = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  resetTheme: () => void;
  isThemeLoading: boolean;
};

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType>({
  theme: 'midnight',
  setTheme: () => {},
  resetTheme: () => {},
  isThemeLoading: false,
});

/**
 * Inline script component to detect and set theme before React hydration
 * Fixed to use DOM mutation instead of direct attribute setting to prevent hydration mismatches
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
 */
async function injectDynamicTheme(themeName: ThemeName): Promise<boolean> {
  try {
    // Dynamic import of the themes module
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
 * ThemeProvider manages the theme state, persists it in localStorage, and syncs it with system preferences.
 * It also ensures SSR compatibility and cross-tab synchronization.
 * Enhanced with dynamic theme injection.
 */
export function ThemeProvider({
  children,
  defaultTheme = 'midnight',
}: ThemeProviderProps) {
  // Initialize with the defaultTheme for server rendering
  // This ensures hydration matches exactly what the server rendered
  const [theme, setThemeState] = useState<ThemeName>(defaultTheme);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isThemeLoading, setIsThemeLoading] = useState(false);

  // Function to set the theme with validation, persistence, and dynamic injection
  const setTheme = useCallback(async (newTheme: ThemeName) => {
    if (!Object.keys(THEMES).includes(newTheme)) {
      console.warn(`Theme "${newTheme}" is not defined, falling back to "${defaultTheme}"`);
      newTheme = defaultTheme;
    }

    // Update state immediately for a responsive UI feel
    setThemeState(newTheme);
    setIsThemeLoading(true);

    if (typeof window !== 'undefined' && isHydrated) {
      try {
        // Save to localStorage
        localStorage.setItem('theme', newTheme);
        
        // Update data attribute
        document.documentElement.setAttribute('data-panda-theme', newTheme);
        
        // Dynamically inject the theme CSS
        await injectDynamicTheme(newTheme);
        
        // Force a repaint to ensure CSS variables are applied
        const html = document.documentElement;
        const currentDisplay = html.style.display;
        html.style.display = 'none';
        void html.offsetHeight; // Force reflow
        html.style.display = currentDisplay;
        
        // Log theme change for debugging
        const styles = getComputedStyle(html);
        console.log('Theme changed to:', newTheme);
        console.log('--colors-primary:', styles.getPropertyValue('--colors-primary'));
        console.log('--colors-background:', styles.getPropertyValue('--colors-background'));
      } catch (error) {
        console.error('Error setting theme:', error);
      } finally {
        setIsThemeLoading(false);
      }
    } else {
      setIsThemeLoading(false);
    }
  }, [defaultTheme, isHydrated]);
  
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
        await injectDynamicTheme(newTheme);
      } catch (error) {
        console.error('Error resetting theme:', error);
      } finally {
        setIsThemeLoading(false);
      }
    }
  }, [isHydrated]);

  // Only run client-side effects after hydration is complete
  // Extend Window interface to include our custom property
  interface CustomWindow extends Window {
    __NEXT_THEME_APPLIED?: ThemeName;
  }

  useEffect(() => {
    // Mark as hydrated after first render
    setIsHydrated(true);
    
    // Safely access client-side theme after hydration
    if (typeof window !== 'undefined') {
      const initialSetup = async () => {
        setIsThemeLoading(true);
        
        try {
          // Check for theme detected by our script
          const scriptDetectedTheme = (window as CustomWindow).__NEXT_THEME_APPLIED;
          
          // Read from localStorage directly
          let userTheme: ThemeName | null = null;
          try {
            userTheme = localStorage.getItem('theme') as ThemeName | null;
          } catch (e) {
            console.error('Failed to read theme from localStorage:', e);
          }
          
          let systemTheme: ThemeName | null = null;
          try {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            systemTheme = prefersDark ? 'midnight' : 'starlight';
          } catch (e) {
            console.error('Failed to detect system theme preference:', e);
          }
          
          // Priority: 1. User preference 2. Script detected 3. System preference 4. Default
          const finalTheme = userTheme || scriptDetectedTheme || systemTheme || defaultTheme;
          
          // Only update after hydration is complete and if needed
          if (finalTheme !== theme) {
            setThemeState(finalTheme);
            document.documentElement.setAttribute('data-panda-theme', finalTheme);
            await injectDynamicTheme(finalTheme);
          }
          
          // Apply transitions after initial render
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
  }, [defaultTheme]);

  // Listen for system theme changes - only after hydration
  useEffect(() => {
    if (!isHydrated) return;
    
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = (e: MediaQueryListEvent) => {
        if (!localStorage.getItem('theme')) {
          setTheme(e.matches ? 'midnight' : 'starlight');
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch (error) {
      console.error('Failed to set up system theme change listener:', error);
      return () => {};
    }
  }, [setTheme, isHydrated]);

  // Sync theme across tabs - only after hydration
  useEffect(() => {
    if (!isHydrated) return;
    
    const handleStorageChange = async (e: StorageEvent) => {
      if (e.key === 'theme' && e.newValue && Object.keys(THEMES).includes(e.newValue as ThemeName)) {
        setThemeState(e.newValue as ThemeName);
        document.documentElement.setAttribute('data-panda-theme', e.newValue as ThemeName);
        
        // Inject theme when changed in another tab
        await injectDynamicTheme(e.newValue as ThemeName);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isHydrated]);

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
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}