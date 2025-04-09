'use client';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { css } from '../../../styled-system/css';
import { flex, grid } from '../../../styled-system/patterns';
import { useTheme } from '../../app/styles/themes/ThemeContext';
import { THEMES, ThemeName } from '../../app/styles/themes/themeTypes';

// Custom hook for early theme initialization to prevent FOUC
const useThemeInitializer = () => {
  // Use a ref to store the initial theme
  const initialThemeRef = useRef<ThemeName | null>(null);
  
  // Safe useLayoutEffect (falls back to useEffect during SSR)
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
  
  useIsomorphicLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Try to read theme from localStorage synchronously
    try {
      const savedTheme = localStorage.getItem('theme') as ThemeName;
      if (savedTheme && Object.keys(THEMES).includes(savedTheme)) {
        initialThemeRef.current = savedTheme;
        
        // Apply theme directly to DOM before render cycle
        document.documentElement.setAttribute('data-panda-theme', savedTheme);
        
        // Add a class to prevent transition during initial load
        document.documentElement.classList.add('theme-initializing');
        
        // Remove the class after a moment to allow transitions
        setTimeout(() => {
          document.documentElement.classList.remove('theme-initializing');
        }, 50);
      }
    } catch (e) {
      console.error('Failed to initialize theme:', e);
    }
  }, []);
  
  return initialThemeRef.current;
};

/**
 * ThemeSelector provides a dropdown to select the application theme.
 * It integrates with ThemeContext for state management with FOUC prevention.
 */
export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [isThemeLoading, setIsThemeLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  
  // Initialize theme early to prevent FOUC
  const initialTheme = useThemeInitializer();

  // Toggle dropdown visibility
  const toggleDropdown = () => setIsOpen(!isOpen);

  // Handle theme change
  const changeTheme = (newTheme: ThemeName) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  // Set ready state after initial render
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsReady(true);
    }, 50);
    
    return () => clearTimeout(timeout);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add critical CSS to prevent FOUC
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Create a style element to add critical theme CSS
    const style = document.createElement('style');
    style.setAttribute('id', 'theme-critical-css');
    style.innerHTML = `
      /* Add critical theme styles to prevent FOUC */
      .theme-initializing * {
        transition: none !important;
      }
      
      /* Override body background and text immediately when theme changes */
      [data-panda-theme="midnight"] {
        background-color: var(--colors-background, #080808) !important;
        color: var(--colors-text, #ccd6e1) !important;
      }
      [data-panda-theme="starlight"] {
        background-color: var(--colors-background, #BFAD7F) !important;
        color: var(--colors-text, #2a3744) !important;
      }
      [data-panda-theme="moonlight"] {
        background-color: var(--colors-background, #0f1524) !important;
        color: var(--colors-text, #e2e8f0) !important;
      }
      [data-panda-theme="eclipse"] { 
        background-color: var(--colors-background, #f0e6d0) !important;
        color: var(--colors-text, #3a2a1b) !important;
      }
      [data-panda-theme="nebula"] {
        background-color: var(--colors-background, #0A0B18) !important;
        color: var(--colors-text, #E2F3FF) !important;
      }
      
      /* Fade-in animation for ThemeSelector */
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .theme-selector-fade-in {
        animation: fadeIn 0.3s ease-in-out;
      }
    `;
    
    // Inject the critical CSS to the head
    if (!document.getElementById('theme-critical-css')) {
      document.head.appendChild(style);
    }
    
    // Cleanup
    return () => {
      const criticalStyle = document.getElementById('theme-critical-css');
      if (criticalStyle) {
        criticalStyle.remove();
      }
    };
  }, []);

  // Monitor theme changes and ensure CSS variables are applied
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          (mutation.attributeName === 'data-theme' || 
           mutation.attributeName === 'data-panda-theme')
        ) {
          // Force a repaint to ensure CSS variables are applied
          const html = document.documentElement;
          const currentDisplay = html.style.display;
          html.style.display = 'none';
          void html.offsetHeight; // Force reflow
          html.style.display = currentDisplay;
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={dropdownRef}
      className={`${css({
        position: 'relative',
        fontFamily: 'body',
        opacity: isReady ? 1 : 0,
        transition: 'opacity 0.3s ease'
      })} ${isReady ? 'theme-selector-fade-in' : ''}`}
    >
      {/* Current theme button */}
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={isThemeLoading}
        className={css({
          paddingTop: '60px',
          display: 'flex',
          alignItems: 'center',
          gap: 'sm',
          p: 'sm',
          borderRadius: 'medium',
          bg: 'background',
          color: 'text',
          border: '1px solid',
          borderColor: 'border',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          _hover: {
            bg: 'hover',
            boxShadow: '0 0 8px',
            shadowColor: 'glow',
          }
        })}
      >
        <span>{THEMES[theme].icon}</span>
        <span>{THEMES[theme].label}</span>
        
        {/* Theme color preview */}
        <div className={css({
          display: 'flex',
          ml: 'auto',
          mr: 'sm',
          gap: 'xs',
        })}>
          <div style={{ backgroundColor: 'var(--colors-primary)' }} className={css({
            width: '12px',
            height: '12px',
            borderRadius: 'full',
          })} />
          <div style={{ backgroundColor: 'var(--colors-secondary)' }} className={css({
            width: '12px',
            height: '12px',
            borderRadius: 'full',
          })} />
          <div style={{ backgroundColor: 'var(--colors-accent1)' }} className={css({
            width: '12px',
            height: '12px',
            borderRadius: 'full',
          })} />
        </div>
        
        <span className={css({ 
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.2s ease'
        })}>
          ▼
        </span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={css({
            position: 'absolute',
            top: '100%',
            right: 0,
            mt: 'xs',
            p: 'sm',
            bg: 'backgroundAlt',
            borderRadius: 'medium',
            border: '1px solid',
            borderColor: 'border',
            boxShadow: '0 4px 12px',
            shadowColor: 'glow',
            zIndex: 10,
            minWidth: '200px',
            animation: 'fadeIn 0.2s ease-out'
          })}
        >
          <ul className={css({ 
            listStyle: 'none', 
            p: 0, 
            m: 0 
          })}>
            {Object.entries(THEMES).map(([themeName, { icon, label }]) => (
              <li key={themeName}>
                <button
                  onClick={() => changeTheme(themeName as ThemeName)}
                  className={css({
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'sm',
                    textAlign: 'left',
                    p: 'sm',
                    my: 'xs',
                    cursor: 'pointer',
                    color: theme === themeName ? 'primary' : 'text',
                    bg: theme === themeName ? 'hover' : 'transparent',
                    border: 'none',
                    borderRadius: 'small',
                    _hover: {
                      bg: 'hover'
                    }
                  })}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                  
                  {/* Theme color preview */}
                  <div className={css({
                    display: 'flex',
                    ml: 'auto',
                    gap: 'xs',
                  })}>
                    {themeName === theme && (
                      <>
                        <div style={{ backgroundColor: 'var(--colors-primary)' }} className={css({
                          width: '12px',
                          height: '12px',
                          borderRadius: 'full',
                        })} />
                        <div style={{ backgroundColor: 'var(--colors-secondary)' }} className={css({
                          width: '12px',
                          height: '12px',
                          borderRadius: 'full',
                        })} />
                        <div style={{ backgroundColor: 'var(--colors-accent1)' }} className={css({
                          width: '12px',
                          height: '12px',
                          borderRadius: 'full',
                        })} />
                      </>
                    )}
                  </div>
                  
                  {theme === themeName && (
                    <span className={css({ 
                      ml: 'sm', 
                      color: 'primary' 
                    })}>✓</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          
          {/* Theme color showcase */}
          <div className={css({
            mt: 'md',
            pt: 'sm',
            borderTop: '1px solid',
            borderColor: 'border',
          })}>
            <div className={css({
              fontSize: 'sm',
              color: 'textMuted',
              mb: 'sm',
            })}>
              Current Theme Colors
            </div>
            <div className={grid({
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 'xs',
            })}>
              <ColorSwatch label="Primary" color="primary" />
              <ColorSwatch label="Secondary" color="secondary" />
              <ColorSwatch label="Text" color="text" />
              <ColorSwatch label="Accent1" color="accent1" />
              <ColorSwatch label="Accent2" color="accent2" /> 
              <ColorSwatch label="Accent3" color="accent3" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component to display a color swatch
function ColorSwatch({ color, label }: { color: string; label: string }) {
  // Get the color value as a CSS variable for more reliable theme switching
  const colorStyle = {
    backgroundColor: `var(--colors-${color})`,
  };

  return (
    <div className={css({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'xs',
    })}>
      <div 
        style={colorStyle}
        className={css({
          width: '100%',
          height: '20px',
          borderRadius: 'small',
          border: '1px solid',
          borderColor: 'border',
        })}
      />
      <span className={css({
        fontSize: 'xs',
        color: 'textMuted',
      })}>
        {label}
      </span>
    </div>
  );
}