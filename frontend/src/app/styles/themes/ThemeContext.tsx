// styles/themes/ThemeContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { THEMES, ThemeName, CustomTheme } from './theme';
import { GlobalStyles } from './GlobalStyles';

type ThemeContextType = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  currentTheme: CustomTheme;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: ThemeName;
};

export function ThemeProvider({ 
  children, 
  defaultTheme = 'midnight'
}: ThemeProviderProps) {
  // Initialize with undefined to avoid hydration mismatch with SSR
  const [themeName, setThemeName] = useState<ThemeName | undefined>(undefined);
  
  // Theme setter with error handling (memoized to prevent dependency issues)
  const setTheme = useCallback((newTheme: ThemeName) => {
    try {
      if (!Object.keys(THEMES).includes(newTheme)) {
        console.warn(`Theme "${newTheme}" is not defined, falling back to "${defaultTheme}"`);
        newTheme = defaultTheme;
      }
      
      setThemeName(newTheme);
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    } catch (error) {
      console.error('Error setting theme:', error);
      // Fallback to default theme if there's an issue
      document.documentElement.setAttribute('data-theme', defaultTheme);
    }
  }, [defaultTheme]);
  
  // On mount, check if theme exists in localStorage and set initial theme
  useEffect(() => {
    // Only run on client to avoid hydration issues
    const savedTheme = localStorage.getItem('theme') as ThemeName | null;
    const initialTheme = savedTheme && Object.keys(THEMES).includes(savedTheme) 
      ? savedTheme 
      : defaultTheme;
    
    setThemeName(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
    
    // Add transition for smooth theme changes (only after initial load)
    setTimeout(() => {
      document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    }, 100);
  }, [defaultTheme]);
  
  // Check for system color scheme preference for first-time users
  useEffect(() => {
    if (!localStorage.getItem('theme')) {
      try {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const systemTheme: ThemeName = prefersDark ? 'midnight' : 'starlight';
        setTheme(systemTheme);
      } catch (error) {
        console.error('Error detecting system theme preference:', error);
      }
    }
  }, [setTheme]);
  
  // Listen for system theme changes (if user hasn't set a preference)
  useEffect(() => {
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        if (!localStorage.getItem('theme')) {
          setTheme(e.matches ? 'midnight' : 'starlight');
        }
      };
      
      // Use the appropriate event listener method (for compatibility)
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    } catch (error) {
      console.error('Error setting up media query listener:', error);
      return () => {}; // Return empty cleanup function
    }
  }, [setTheme]);
  
  // Handle cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme' && e.newValue && 
          Object.keys(THEMES).includes(e.newValue as ThemeName)) {
        setThemeName(e.newValue as ThemeName);
        document.documentElement.setAttribute('data-theme', e.newValue as ThemeName);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Don't render children until we have determined the theme
  // This prevents flickering during SSR hydration
  if (themeName === undefined) {
    return null; // Or return a minimal loading state
  }
  
  const currentTheme = THEMES[themeName];
  
  return (
    <ThemeContext.Provider value={{ theme: themeName, setTheme, currentTheme }}>
      <StyledThemeProvider theme={currentTheme}>
        <GlobalStyles theme={currentTheme} />
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
}

// Custom hook for using the theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Utility function to get the current theme without React context
// Useful in non-React environments or utility functions
export function getCurrentTheme(): ThemeName {
  if (typeof window === 'undefined') {
    return 'midnight'; // Default for SSR
  }
  
  const savedTheme = localStorage.getItem('theme') as ThemeName | null;
  if (savedTheme && Object.keys(THEMES).includes(savedTheme)) {
    return savedTheme;
  }
  
  try {
    // If no saved preference, use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'midnight' : 'starlight';
  } catch {
    // Using catch without assigning to variable to avoid unused variable warning
    return 'midnight'; // Fallback default
  }
}