'use client';

import { useState, useEffect, ReactNode, ButtonHTMLAttributes } from 'react';
import { useTheme } from '../../app/styles/themes/ThemeContext';
import { ThemeName } from '../../app/styles/themes/themeTypes';

/**
 * Interface for component props
 */
interface DirectThemeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * DirectThemeButton uses direct style references instead of Panda CSS utils
 * for more reliable theme color changes
 */
export function DirectThemeButton({
  children,
  variant = 'primary',
  size = 'md',
  ...props
}: DirectThemeButtonProps) {
  const { theme } = useTheme();
  const [styles, setStyles] = useState<React.CSSProperties>({});
  const [hoverStyles, setHoverStyles] = useState<React.CSSProperties>({});
  const [isHovered, setIsHovered] = useState(false);

  // Get computed styles directly from document when theme changes
  useEffect(() => {
    console.log('DirectThemeButton: Theme changed to', theme);

    // Force a repaint to ensure CSS variables are updated
    const currentDisplay = document.documentElement.style.display;
    document.documentElement.style.display = 'none';
    void document.documentElement.offsetHeight; // Force reflow
    document.documentElement.style.display = currentDisplay;

    // Get computed styles
    const computedStyles = getComputedStyle(document.documentElement);
    
    // Log CSS variable values for debugging
    console.log('--colors-primary:', computedStyles.getPropertyValue('--colors-primary').trim());
    console.log('--colors-secondary:', computedStyles.getPropertyValue('--colors-secondary').trim());
    console.log('--colors-text:', computedStyles.getPropertyValue('--colors-text').trim());
    console.log('--colors-background:', computedStyles.getPropertyValue('--colors-background').trim());
    
    // Set base styles based on variant and size
    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'inherit',
      borderRadius: '4px',
      cursor: 'pointer',
      border: '1px solid transparent',
      fontWeight: 500,
      transition: 'all 0.2s ease',
      padding: size === 'sm' ? '0.25rem 0.5rem' : size === 'md' ? '0.5rem 1rem' : '0.75rem 1.5rem',
      fontSize: size === 'sm' ? '0.875rem' : size === 'md' ? '1rem' : '1.125rem',
    };

    // Apply variant-specific styles
    if (variant === 'primary') {
      Object.assign(baseStyles, {
        backgroundColor: computedStyles.getPropertyValue('--colors-primary').trim(),
        color: computedStyles.getPropertyValue('--colors-background').trim(),
        borderColor: computedStyles.getPropertyValue('--colors-primary').trim(),
      });
      
      setHoverStyles({
        backgroundColor: computedStyles.getPropertyValue('--colors-secondary').trim(),
        borderColor: computedStyles.getPropertyValue('--colors-secondary').trim(),
        boxShadow: `0 0 8px ${computedStyles.getPropertyValue('--colors-glow').trim()}`,
      });
    } 
    else if (variant === 'secondary') {
      Object.assign(baseStyles, {
        backgroundColor: computedStyles.getPropertyValue('--colors-secondary').trim(),
        color: computedStyles.getPropertyValue('--colors-background').trim(),
        borderColor: computedStyles.getPropertyValue('--colors-secondary').trim(),
      });
      
      setHoverStyles({
        backgroundColor: computedStyles.getPropertyValue('--colors-primary').trim(),
        borderColor: computedStyles.getPropertyValue('--colors-primary').trim(),
        boxShadow: `0 0 8px ${computedStyles.getPropertyValue('--colors-glow').trim()}`,
      });
    } 
    else if (variant === 'outline') {
      Object.assign(baseStyles, {
        backgroundColor: 'transparent',
        color: computedStyles.getPropertyValue('--colors-text').trim(),
        borderColor: computedStyles.getPropertyValue('--colors-border').trim(),
      });
      
      setHoverStyles({
        backgroundColor: computedStyles.getPropertyValue('--colors-hover').trim(),
        borderColor: computedStyles.getPropertyValue('--colors-primary').trim(),
        color: computedStyles.getPropertyValue('--colors-primary').trim(),
      });
    }

    setStyles(baseStyles);
  }, [theme, variant, size]);

  // Listen for theme attribute changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-panda-theme'
        ) {
          // Force refresh of styles when theme attribute changes
          setStyles(prevStyles => ({ ...prevStyles }));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return (
    <button
      {...props}
      style={{
        ...styles,
        ...(isHovered ? hoverStyles : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      
      {/* Debug info to confirm current theme */}
      {process.env.NODE_ENV === 'development' && (
        <span style={{ 
          position: 'absolute', 
          bottom: '-20px', 
          right: '0', 
          fontSize: '10px',
          opacity: 0.5,
          pointerEvents: 'none'
        }}>
          Theme: {theme}
        </span>
      )}
    </button>
  );
}

/**
 * Usage examples:
 * 
 * <DirectThemeButton>Default Button</DirectThemeButton>
 * <DirectThemeButton variant="secondary" size="lg">Large Secondary</DirectThemeButton>
 * <DirectThemeButton variant="outline" size="sm">Small Outline</DirectThemeButton>
 */