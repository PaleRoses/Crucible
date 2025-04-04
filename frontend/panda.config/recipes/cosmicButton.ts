// src/styled-system/recipes/cosmicButton.ts

import { defineRecipe } from '@pandacss/dev';

/**
 * Cosmic Button - A luxurious, moon-inspired button component
 * 
 * Features:
 * - Elegant transitions and animations
 * - Multiple visual variants (primary, secondary, ghost, etc.)
 * - Size options with appropriate spacing and typography
 * - Support for leading and trailing icons
 * - Loading state with subtle lunar animation
 * - Fully respects the active theme's color tokens
 */
export const cosmicButtonRecipe = defineRecipe({
  className: 'cosmic-button',
  description: 'A luxurious, moon-inspired button component',
  // Base styles applied to all button variants
  base: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2',
    borderRadius: 'md',
    fontFamily: 'heading',
    fontWeight: 'normal',
    letterSpacing: '0.05em',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '1px solid transparent',
    outline: 'none',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    
    // Default padding (adjusted by size variant)
    px: '4',
    py: '2',
    
    // Focus ring - visible only when focused with keyboard
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
    
    // Disabled state
    _disabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
      pointerEvents: 'none',
      boxShadow: 'none',
    },
    
    // Loading state - reduce opacity of content
    '&[data-loading=true]': {
      position: 'relative',
      
      // Fade the button content when loading
      '& .button-content': {
        opacity: 0.5,
      },
      
      // Show the loading indicator
      '& .loading-indicator': {
        display: 'block',
      },
    },
    
    // Loading indicator styling
    '& .loading-indicator': {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '20px',
      height: '20px',
      display: 'none',
      
      '&::before, &::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: 'full',
        border: '2px solid transparent',
        borderTopColor: 'currentColor',
        animation: 'cosmicButtonLoading 1.2s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite',
      },
      
      '&::after': {
        width: '70%',
        height: '70%',
        top: '15%',
        left: '15%',
        borderWidth: '1px',
        opacity: 0.6,
        animationDirection: 'reverse',
        animationDuration: '1s',
      },
    },
    
    // Content wrapper - ensures proper spacing with icons
    '& .button-content': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2',
      transition: 'opacity 0.3s ease',
    },
    
    // Leading and trailing icon styling
    '& .leading-icon, & .trailing-icon': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
  },
  
  // Define variants
  variants: {
    // Visual style variants
    variant: {
      primary: {
        bg: 'primary',
        color: 'background',
        borderColor: 'primary',
        
        // Elegant shadow/glow effect
        boxShadow: '0 2px 10px var(--color-glow)',
        
        _hover: {
          bg: 'color-mix(in srgb, var(--color-primary) 90%, var(--color-background))',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 15px var(--color-glow)',
        },
        
        _active: {
          transform: 'translateY(1px)',
          boxShadow: '0 1px 5px var(--color-glow)',
        },
      },
      
      secondary: {
        bg: 'secondary',
        color: 'background',
        borderColor: 'secondary',
        
        boxShadow: '0 2px 8px color-mix(in srgb, var(--color-glow) 70%, transparent)',
        
        _hover: {
          bg: 'color-mix(in srgb, var(--color-secondary) 90%, var(--color-background))',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px color-mix(in srgb, var(--color-glow) 70%, transparent)',
        },
        
        _active: {
          transform: 'translateY(1px)',
          boxShadow: '0 1px 4px color-mix(in srgb, var(--color-glow) 70%, transparent)',
        },
      },
      
      outline: {
        bg: 'transparent',
        color: 'primary',
        borderColor: 'primary',
        
        _hover: {
          bg: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
          boxShadow: '0 0 10px var(--color-glow)',
          transform: 'translateY(-1px)',
        },
        
        _active: {
          bg: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
          transform: 'translateY(1px)',
        },
      },
      
      ghost: {
        bg: 'transparent',
        color: 'primary',
        border: 'none',
        
        _hover: {
          bg: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
          transform: 'translateY(-1px)',
        },
        
        _active: {
          bg: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
          transform: 'translateY(1px)',
        },
      },
      
      subtle: {
        bg: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
        color: 'primary',
        border: 'none',
        
        _hover: {
          bg: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
          transform: 'translateY(-1px)',
        },
        
        _active: {
          bg: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
          transform: 'translateY(1px)',
        },
      },
      
      // Modern borderless variant
      borderless: {
        bg: 'transparent',
        color: 'text',
        border: 'none',
        boxShadow: 'none',
        padding: '0.5rem 0',
        
        // Remove button-like appearance entirely and add subtle underline animation
        _hover: {
          bg: 'transparent',
          color: 'primary',
          transform: 'none',
          boxShadow: 'none',
          '&::after': {
            width: '100%',
          },
        },
        
        _active: {
          transform: 'none',
          boxShadow: 'none',
        },
        
        // Optional subtle underline animation on hover
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '0',
          left: '0',
          width: '0%',
          height: '1px',
          backgroundColor: 'primary',
          transition: 'width 0.3s ease',
        },
      },
      
      cosmic: {
        bg: 'color-mix(in srgb, var(--color-background) 95%, var(--color-primary))',
        color: 'primary',
        borderColor: 'color-mix(in srgb, var(--color-border) 70%, var(--color-primary))',
        boxShadow: '0 0 15px var(--color-glow)',
        
        // Add subtle background shimmer
        _before: {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: 'linear-gradient(135deg, transparent 0%, var(--color-border) 35%, transparent 50%, var(--color-border) 65%, transparent 100%)',
          backgroundSize: '200% 200%',
          opacity: 0.1,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
        },
        
        _hover: {
          transform: 'translateY(-1px)',
          bg: 'color-mix(in srgb, var(--color-background) 90%, var(--color-primary))',
          boxShadow: '0 0 20px var(--color-glow), 0 0 5px var(--color-glow) inset',
          _before: {
            opacity: 0.2,
            animation: 'cosmicButtonShimmer 2s ease infinite',
          },
        },
        
        _active: {
          transform: 'translateY(1px)',
          boxShadow: '0 0 10px var(--color-glow), 0 0 3px var(--color-glow) inset',
        },
      },
      
      link: {
        bg: 'transparent',
        color: 'primary',
        border: 'none',
        padding: 0,
        height: 'auto',
        fontFamily: 'body',
        textDecoration: 'none',
        
        _hover: {
          color: 'secondary',
          textDecoration: 'underline',
        },
        
        _active: {
          color: 'color-mix(in srgb, var(--color-primary) 80%, var(--color-secondary))',
          transform: 'none',
        },
      },
    },
    
    // Size variants
    size: {
      xs: {
        fontSize: 'sm',
        px: '2',
        py: '1',
        gap: '1',
        
        '& .loading-indicator': {
          width: '12px',
          height: '12px',
        },
      },
      
      sm: {
        fontSize: 'sm',
        px: '3',
        py: '1.5',
        
        '& .loading-indicator': {
          width: '16px',
          height: '16px',
        },
      },
      
      md: {
        fontSize: 'base',
        // Base styles already define medium size
      },
      
      lg: {
        fontSize: 'lg',
        px: '5',
        py: '2.5',
        
        '& .loading-indicator': {
          width: '24px',
          height: '24px',
        },
      },
      
      xl: {
        fontSize: 'xl',
        px: '6',
        py: '3',
        
        '& .loading-indicator': {
          width: '28px',
          height: '28px',
        },
      },
    },
    
    // Width variants
    width: {
      auto: {
        width: 'auto',
      },
      
      full: {
        width: '100%',
      },
    },
    
    // Icon-only button (circular)
    isIconOnly: {
      true: {
        aspectRatio: '1/1',
        padding: '0',
        
        // Adjust paddings by size in compound variants
      },
    },
    
    // Rounded variants
    rounded: {
      true: {
        borderRadius: 'full',
      },
      false: {
        // Base styles already define default border radius
      },
    },
  },
  
  // Compound variants for special combinations
  compoundVariants: [
    // Adjust icon-only button sizes
    {
      isIconOnly: true,
      size: 'xs',
      css: {
        width: '24px',
        height: '24px',
      },
    },
    {
      isIconOnly: true,
      size: 'sm',
      css: {
        width: '32px',
        height: '32px',
      },
    },
    {
      isIconOnly: true,
      size: 'md',
      css: {
        width: '40px',
        height: '40px',
      },
    },
    {
      isIconOnly: true,
      size: 'lg',
      css: {
        width: '48px',
        height: '48px',
      },
    },
    {
      isIconOnly: true,
      size: 'xl',
      css: {
        width: '56px',
        height: '56px',
      },
    },
  ],
  
  // Default variants
  defaultVariants: {
    variant: 'primary',
    size: 'md',
    width: 'auto',
    isIconOnly: false,
    rounded: false,
  },
});

/**
 * Usage Example (in a React component):
 * 
 * import { cosmicButton } from '../styled-system/recipes/cosmicButton';
 * import { css } from '../styled-system/css';
 * 
 * function Button({ 
 *   children, 
 *   variant = 'primary', 
 *   size = 'md', 
 *   width = 'auto',
 *   rounded = false,
 *   isLoading = false,
 *   isDisabled = false,
 *   leadingIcon,
 *   trailingIcon,
 *   onClick,
 *   ...props
 * }) {
 *   const isIconOnly = !children && (leadingIcon || trailingIcon);
 *   const buttonStyles = cosmicButton({ 
 *     variant, 
 *     size, 
 *     width,
 *     rounded,
 *     isIconOnly,
 *   });
 *   
 *   return (
 *     <button 
 *       className={buttonStyles} 
 *       onClick={onClick} 
 *       disabled={isDisabled}
 *       data-loading={isLoading}
 *       {...props}
 *     >
 *       {isLoading && <span className="loading-indicator" />}
 *       <span className="button-content">
 *         {leadingIcon && <span className="leading-icon">{leadingIcon}</span>}
 *         {children}
 *         {trailingIcon && <span className="trailing-icon">{trailingIcon}</span>}
 *       </span>
 *     </button>
 *   );
 * }
 */

// Add these keyframe animations to your global CSS or Panda CSS config:
/* 
@keyframes cosmicButtonLoading {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes cosmicButtonShimmer {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 200% 200%;
  }
}
*/