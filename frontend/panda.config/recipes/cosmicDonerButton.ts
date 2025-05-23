// panda.config/recipes/cosmicDonerButton.ts

import { defineRecipe } from '@pandacss/dev';

/**
 * ====================================================================================
 * COSMIC DONER BUTTON - A stylized hamburger menu button with animated lines
 * ====================================================================================
 * 
 * IMPORT INTO YOUR PANDA CONFIG:
 * 
 * import { cosmicDonerButton } from './panda.config/recipes/cosmicDonerButton';
 * 
 * Then add to your config:
 * 
 * export default defineConfig({
 *   // ...other config
 *   theme: {
 *     extend: {
 *       recipes: {
 *         // Add to your recipes
 *         DonerButton: cosmicDonerButton
 *       }
 *     }
 *   }
 * })
 * 
 * Features:
 * - Three expandable lines that animate on hover
 * - Cosmic styling with glow effects
 * - Configurable size and visual variants
 * - Open/closed state styling
 */
export const cosmicDonerButton = defineRecipe({
  className: 'cosmicDonerButton',
  description: 'A stylized hamburger menu button with animated lines',
  // Base styles for the button container
  base: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px', // Space between doner lines
    width: '40px',
    height: '40px',
    borderRadius: 'full',
    border: '1px solid',
    borderColor: 'border',
    bg: 'backgroundAlt',
    color: 'primary',
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    userSelect: 'none',
    padding: '8px 6px',

    // Cosmic background glow effect
    _before: {
      content: '""',
      position: 'absolute',
      inset: 0,
      bg: 'background',
      opacity: 0.8,
      zIndex: 1,
    },

    // Hover effects for the container
    _hover: {
      borderColor: 'primary',
      boxShadow: '0 0 12px',
      shadowColor: 'glow',
      transform: 'scale(1.05)',
      
      // Target all three line spans when container is hovered
      '& span': {
        width: '100%', // Expand all lines to full width
        bg: 'primary', // Change color to primary when hovered
      },
      
      // Different animation timing for each line for a staggered effect
      '& span:nth-of-type(1)': {
        transitionDelay: '0s',
      },
      '& span:nth-of-type(2)': {
        transitionDelay: '0.05s',
      },
      '& span:nth-of-type(3)': {
        transitionDelay: '0.1s',
      }
    },

    // Active/pressed state
    _active: {
      transform: 'scale(0.95)',
    },

    // Focus state for accessibility
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },

    // Style for the three doner lines
    '& span': {
      position: 'relative',
      zIndex: 2,
      display: 'block',
      height: '2px',
      width: '70%', // Start with lines at 70% width
      bg: 'secondary', // Use secondary color for lines by default
      borderRadius: 'full',
      transition: 'all 0.3s ease',
    },
    
    // Adjust the width of each line for a dynamic look
    '& span:nth-of-type(1)': {
      width: '60%',
    },
    '& span:nth-of-type(2)': {
      width: '70%',
    },
    '& span:nth-of-type(3)': {
      width: '50%',
    },
  },

  // Define variants
  variants: {
    // Size variants
    size: {
      sm: {
        width: '32px',
        height: '32px',
        padding: '6px 5px',
        gap: '3px',
        '& span': {
          height: '1.5px',
        },
      },
      md: {
        // Base styles already define 40px
        width: '40px',
        height: '40px',
        padding: '8px 6px',
        gap: '4px',
        '& span': {
          height: '2px',
        },
      },
      lg: {
        width: '48px',
        height: '48px',
        padding: '10px 7px',
        gap: '5px',
        '& span': {
          height: '2.5px',
        },
      },
    },
    
    // Visual style variants
    variant: {
      solid: {
        bg: 'backgroundAlt',
        '& span': {
          bg: 'secondary',
        },
        _hover: {
          '& span': {
            bg: 'primary',
          },
        },
      },
      outline: {
        bg: 'transparent',
        borderColor: 'primary',
        borderWidth: '1px',
        '& span': {
          bg: 'secondary',
        },
        _hover: {
          '& span': {
            bg: 'primary',
          },
        },
      },
      ghost: {
        bg: 'transparent',
        border: 'none',
        '& span': {
          bg: 'secondary',
        },
        _hover: {
          bg: 'hover',
          '& span': {
            bg: 'primary',
          },
        },
      },
      // Modern borderless variant
      borderless: {
        bg: 'transparent',
        border: 'none',
        padding: '0',
        boxShadow: 'none',
        '& span': {
          bg: 'textMuted',
          height: '2px',
        },
        _hover: {
          bg: 'transparent',
          boxShadow: 'none',
          transform: 'scale(1)',
          '& span': {
            bg: 'primary',
            // Retain the staggered animation effect
            '&:nth-of-type(1)': {
              width: '100%',
              transitionDelay: '0s',
            },
            '&:nth-of-type(2)': {
              width: '100%',
              transitionDelay: '0.05s',
            },
            '&:nth-of-type(3)': {
              width: '100%',
              transitionDelay: '0.1s',
            }
          },
        },
        _active: {
          transform: 'scale(0.95)',
        },
      },
      // Cosmic variant with glowing lines
      cosmic: {
        bg: 'transparent',
        border: '1px solid',
        borderColor: 'glow',
        '& span': {
          bg: 'secondary',
          boxShadow: '0 0 5px',
          shadowColor: 'glow',
        },
        _hover: {
          '& span': {
            bg: 'primary',
            boxShadow: '0 0 8px',
            shadowColor: 'glow',
          },
        },
      },
    },
    
    // State variant for when the menu is open - can transform to X
    isOpen: {
      true: {
        borderColor: 'primary',
        boxShadow: '0 0 15px',
        shadowColor: 'glow',
        
        // When open, transform the lines into an X
        '& span': {
          width: '90%',
          bg: 'primary',
        },
        
        '& span:nth-of-type(1)': {
          transform: 'translateY(8px) rotate(45deg)',
        },
        '& span:nth-of-type(2)': {
          opacity: 0,
          transform: 'translateX(-10px)',
        },
        '& span:nth-of-type(3)': {
          transform: 'translateY(-8px) rotate(-45deg)',
        },
      },
    }
  },

  // Define default variants
  defaultVariants: {
    size: 'md',
    variant: 'solid',
    isOpen: false,
  },
});

/**
 * USAGE EXAMPLE (in a React component):
 * =====================================
 * 
 * // First, import the cosmicDonerButton
 * import { cosmicDonerButton } from './panda.config/recipes/cosmicDonerButton';
 * import { useState } from 'react';
 * 
 * // Define the DonerButton component with all supported props
 * function DonerButton({ 
 *   size = 'md',               // Size variant (sm, md, lg)
 *   variant = 'solid',         // Visual style variant
 *   onClick,                   // Click handler
 *   initialState = false       // Initial open/closed state
 * }) {
 *   // Track menu open/closed state
 *   const [isOpen, setIsOpen] = useState(initialState);
 *   
 *   // Apply the cosmic button styles
 *   const buttonStyles = cosmicDonerButton({ 
 *     size, 
 *     variant, 
 *     isOpen 
 *   });
 *   
 *   // Handle click to toggle menu state
 *   const handleClick = () => {
 *     setIsOpen(!isOpen);
 *     if (onClick) onClick();
 *   };
 *   
 *   return (
 *     <button 
 *       className={buttonStyles} 
 *       onClick={handleClick} 
 *       aria-label="Menu" 
 *       aria-expanded={isOpen}
 *     >
 *       <span></span>
 *       <span></span>
 *       <span></span>
 *     </button>
 *   );
 * }
 * 
 * // EXAMPLES OF BUTTON USAGE:
 * 
 * // Basic menu button with default styling
 * <DonerButton onClick={() => console.log('Menu clicked')} />
 * 
 * // Small cosmic variant
 * <DonerButton 
 *   size="sm"
 *   variant="cosmic"
 *   onClick={() => toggleSidebar()}
 * />
 * 
 * // Large outline variant (initially open)
 * <DonerButton 
 *   size="lg"
 *   variant="outline"
 *   initialState={true}
 *   onClick={() => handleMenuToggle()}
 * />
 * 
 * // Borderless variant for minimal UI
 * <DonerButton 
 *   variant="borderless"
 *   onClick={() => setMenuOpen(!menuOpen)}
 * />
 * 
 * // Ghost variant
 * <DonerButton 
 *   variant="ghost"
 *   onClick={() => toggleNavigation()}
 * />
 */