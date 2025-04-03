// src/styled-system/recipes/cosmicCard.ts

import { cva } from '../../styled-system/css';

/**
 * Cosmic Card - A versatile content container with cosmic styling
 * 
 * Features:
 * - Glowing borders and cosmic background effects
 * - Multiple elevation and style variants
 * - Interactive hover and focus states with animations
 * - Configurable size and content density options
 * - Support for different content layouts
 */
export const cosmicCard = cva({
  // Base styles applied to all cards
  base: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'border',
    bg: 'backgroundAlt',
    color: 'text',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    
    // Subtle inner shadow for depth
    boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.1)',
    
    // Background gradient overlay
    _before: {
      content: '""',
      position: 'absolute',
      inset: 0,
      bg: 'linear-gradient(135deg, color-mix(in srgb, var(--color-background) 97%, var(--color-primary)) 0%, var(--color-background) 100%)',
      opacity: 0.8,
      zIndex: 1,
      transition: 'opacity 0.3s ease',
    },
    
    // Content container to ensure content sits above the background layers
    '& > .card-content': {
      position: 'relative',
      zIndex: 3,
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      padding: '4',
    },
    
    // Header and footer styling
    '& > .card-header, & > .card-footer': {
      position: 'relative',
      zIndex: 3,
      padding: '3',
    },
    
    // Header specific styling
    '& > .card-header': {
      borderBottom: '1px solid',
      borderColor: 'border',
      '& h1, & h2, & h3, & h4, & h5, & h6': {
        margin: 0,
        color: 'primary',
      },
    },
    
    // Footer specific styling
    '& > .card-footer': {
      borderTop: '1px solid',
      borderColor: 'border',
      marginTop: 'auto', // Push to bottom if card content doesn't fill height
    },
    
    // Add cosmic background effect - subtle star points
    _after: {
      content: '""',
      position: 'absolute',
      inset: 0,
      backgroundImage: 'radial-gradient(circle, var(--color-cosmic1) 1px, transparent 1px), radial-gradient(circle, var(--color-cosmic2) 1px, transparent 1px)',
      backgroundSize: '20px 20px, 30px 30px',
      backgroundPosition: '0 0, 10px 10px',
      opacity: 0.03,
      zIndex: 2,
      transition: 'opacity 0.3s ease',
      pointerEvents: 'none',
    },
    
    // Hover state
    _hover: {
      borderColor: 'primary',
      transform: 'translateY(-3px)',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15), 0 0 0 1px var(--color-border), 0 0 15px var(--color-glow)',
      
      // Intensify background effects on hover
      _before: {
        opacity: 0.9,
      },
      _after: {
        opacity: 0.08,
      },
    },
    
    // Focus state for accessibility
    _focusVisible: {
      outline: 'none',
      borderColor: 'primary',
      boxShadow: '0 0 0 2px var(--color-primary)',
    },
  },
  
  // Define variants
  variants: {
    // Visual style variants
    variant: {
      standard: {
        // Base styles already cover the standard variant
      },
      elevated: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px var(--color-border)',
        borderColor: 'color-mix(in srgb, var(--color-border) 80%, var(--color-primary))',
        _hover: {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2), 0 0 0 1px var(--color-primary), 0 0 20px var(--color-glow)',
        },
      },
      featured: {
        borderColor: 'color-mix(in srgb, var(--color-border) 50%, var(--color-primary))',
        boxShadow: '0 0 15px var(--color-glow)',
        _before: {
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-background) 85%, var(--color-primary)) 0%, var(--color-background) 100%)',
          opacity: 0.9,
        },
        _after: {
          opacity: 0.1,
        },
        _hover: {
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2), 0 0 25px var(--color-glow)',
          _after: {
            opacity: 0.15,
          },
        },
      },
      minimal: {
        border: 'none',
        bg: 'transparent',
        boxShadow: 'none',
        _before: {
          opacity: 0.5,
        },
        _hover: {
          bg: 'backgroundAlt',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(-2px)',
        },
      },
      cosmic: {
        borderColor: 'color-mix(in srgb, var(--color-border) 30%, var(--color-primary))',
        boxShadow: '0 0 20px var(--color-glow)',
        _before: {
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-background) 80%, var(--color-cosmic3)) 0%, color-mix(in srgb, var(--color-background) 90%, var(--color-primary)) 100%)',
          opacity: 0.85,
        },
        _after: {
          backgroundImage: 'radial-gradient(circle, var(--color-cosmic1) 1px, transparent 1px), radial-gradient(circle, var(--color-cosmic2) 1px, transparent 1px), radial-gradient(circle, var(--color-cosmic3) 0.5px, transparent 0.5px)',
          backgroundSize: '20px 20px, 30px 30px, 15px 15px',
          backgroundPosition: '0 0, 10px 10px, 15px 15px',
          opacity: 0.15,
        },
        _hover: {
          transform: 'translateY(-5px) scale(1.01)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2), 0 0 30px var(--color-glow)',
          _after: {
            opacity: 0.25,
          },
          // Add subtle animation to stars on hover
          animation: 'cosmicCardStarsTwinkle 3s infinite alternate ease-in-out',
        },
      },
    },
    
    // Size and padding variants
    size: {
      sm: {
        '& > .card-content': {
          padding: '2',
        },
        '& > .card-header, & > .card-footer': {
          padding: '2',
        },
      },
      md: {
        // Base styles already cover medium size
      },
      lg: {
        '& > .card-content': {
          padding: '5',
        },
        '& > .card-header, & > .card-footer': {
          padding: '4',
        },
      },
    },
    
    // Interactive variants
    interactive: {
      true: {
        cursor: 'pointer',
        // Add subtle scale effect
        _hover: {
          transform: 'translateY(-3px) scale(1.02)',
        },
        _active: {
          transform: 'translateY(0) scale(0.98)',
          transition: 'transform 0.1s ease',
        },
      },
    },
    
    // Border style variants
    borderStyle: {
      solid: {
        // Base styles already cover solid borders
      },
      dashed: {
        borderStyle: 'dashed',
      },
      glowing: {
        borderColor: 'color-mix(in srgb, var(--color-border) 50%, var(--color-primary))',
        boxShadow: '0 0 10px var(--color-glow), inset 0 0 5px var(--color-glow)',
      },
    },
  },
  
  // Compound variants for special combinations
  compoundVariants: [
    {
      // Special styling for featured + interactive variant
      interactive: true,
      variant: 'featured',
      css: {
        _hover: {
          transform: 'translateY(-5px) scale(1.03)',
        },
      },
    },
    {
      // Special styling for cosmic + interactive variant
      interactive: true,
      variant: 'cosmic',
      css: {
        _hover: {
          transform: 'translateY(-5px) scale(1.03)',
        },
      },
    },
  ],
  
  // Default variants
  defaultVariants: {
    variant: 'standard',
    size: 'md',
    interactive: false,
    borderStyle: 'solid',
  },
});

/**
 * Usage Example (in a React component):
 * 
 * import { cosmicCard } from '../styled-system/recipes/cosmicCard';
 * import { css } from '../styled-system/css';
 * 
 * function CosmicCard({ 
 *   title, 
 *   children, 
 *   footer, 
 *   variant = 'standard', 
 *   size = 'md', 
 *   interactive = false,
 *   borderStyle = 'solid',
 *   onClick
 * }) {
 *   const cardStyles = cosmicCard({ 
 *     variant, 
 *     size, 
 *     interactive,
 *     borderStyle
 *   });
 *   
 *   return (
 *     <div className={cardStyles} onClick={interactive ? onClick : undefined} tabIndex={interactive ? 0 : undefined}>
 *       {title && <div className="card-header">{title}</div>}
 *       <div className="card-content">{children}</div>
 *       {footer && <div className="card-footer">{footer}</div>}
 *     </div>
 *   );
 * }
 */

// You'll need to add this keyframe animation to your global CSS or Panda CSS config:
/* 
@keyframes cosmicCardStarsTwinkle {
  0% {
    opacity: 0.15;
    transform: rotate(0deg);
  }
  50% {
    opacity: 0.2;
  }
  100% {
    opacity: 0.25;
    transform: rotate(0.5deg);
  }
}
*/