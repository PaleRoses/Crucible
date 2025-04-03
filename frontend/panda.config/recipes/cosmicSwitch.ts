// src/styled-system/recipes/cosmicSwitch.ts

import { cva } from '../../styled-system/css';

/**
 * Cosmic Switch - An elegant toggle switch component with lunar-inspired animations
 * 
 * Features:
 * - Smooth transitions between states with lunar-inspired animations
 * - Multiple visual variants to match different interface contexts
 * - Support for disabled state and focus indicators
 * - Configurable sizes for different UI densities
 * - Optional label positioning
 * - Fully respects the active theme's color tokens
 */

// Container wrapper styling
export const cosmicSwitchContainer = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    position: 'relative',
    cursor: 'pointer',
    userSelect: 'none',
    
    // When disabled, apply cursor and opacity changes
    '&[data-disabled="true"]': {
      cursor: 'not-allowed',
      opacity: 0.6,
    },
  },
  
  variants: {
    // Label position variants
    labelPosition: {
      left: {
        flexDirection: 'row-reverse',
        gap: '2',
      },
      right: {
        flexDirection: 'row',
        gap: '2',
      },
      none: {
        // No label
      },
    },
    
    // Size variants
    size: {
      sm: {},
      md: {},
      lg: {},
    },
  },
  
  defaultVariants: {
    labelPosition: 'right',
    size: 'md',
  },
});

// Hidden input styling (visually hidden but accessible)
export const cosmicSwitchInput = cva({
  base: {
    border: '0',
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: '1px',
    margin: '-1px',
    overflow: 'hidden',
    padding: '0',
    position: 'absolute',
    whiteSpace: 'nowrap',
    width: '1px',
  },
});

// Track styling (the background element)
export const cosmicSwitchTrack = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    boxSizing: 'content-box',
    borderRadius: 'full',
    transition: 'all 0.3s ease',
    border: '1px solid',
    borderColor: 'border',
    backgroundColor: 'backgroundAlt',
    
    // When checked state changes
    '&[data-checked="true"]': {
      backgroundColor: 'color-mix(in srgb, var(--color-primary) 50%, transparent)',
      borderColor: 'primary',
    },
    
    // When focused
    '&[data-focus="true"]': {
      boxShadow: '0 0 0 2px var(--color-primary)',
    },
    
    // When disabled
    '&[data-disabled="true"]': {
      borderColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)',
      backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 50%, transparent)',
      
      '&[data-checked="true"]': {
        backgroundColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)',
        borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)',
      },
    },
    
    // Hover state (when not disabled)
    '&:not([data-disabled="true"]):hover': {
      borderColor: 'color-mix(in srgb, var(--color-border) 80%, var(--color-primary))',
      backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 95%, var(--color-primary))',
      
      '&[data-checked="true"]': {
        backgroundColor: 'color-mix(in srgb, var(--color-primary) 60%, transparent)',
      },
    },
  },
  
  variants: {
    // Visual style variants
    variant: {
      standard: {
        // Default styling already defined in base
      },
      
      minimal: {
        border: 'none',
        backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 70%, transparent)',
        boxShadow: 'inset 0 0 0 1px var(--color-border)',
        
        '&[data-checked="true"]': {
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)',
          boxShadow: 'inset 0 0 0 1px var(--color-primary)',
        },
        
        '&:not([data-disabled="true"]):hover': {
          backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 80%, transparent)',
          boxShadow: 'inset 0 0 0 1px var(--color-primary)',
          
          '&[data-checked="true"]': {
            backgroundColor: 'color-mix(in srgb, var(--color-primary) 40%, transparent)',
          },
        },
      },
      
      cosmic: {
        // Special cosmic styling with glow effects
        borderColor: 'color-mix(in srgb, var(--color-border) 80%, var(--color-primary))',
        boxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.2)',
        
        // Star-like background with subtle pattern
        _before: {
          content: '""',
          position: 'absolute',
          inset: '0',
          borderRadius: 'inherit',
          opacity: 0.03,
          backgroundImage: `
            radial-gradient(circle at 30% 50%, var(--color-cosmic1) 1px, transparent 1px),
            radial-gradient(circle at 70% 50%, var(--color-cosmic2) 1px, transparent 1px)
          `,
          backgroundSize: '8px 8px, 10px 10px',
          pointerEvents: 'none',
        },
        
        '&[data-checked="true"]': {
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 40%, transparent)',
          borderColor: 'primary',
          boxShadow: '0 0 8px var(--color-glow), inset 0 0 5px rgba(0, 0, 0, 0.2)',
          
          _before: {
            opacity: 0.1,
          },
        },
        
        '&:not([data-disabled="true"]):hover': {
          boxShadow: '0 0 5px var(--color-glow), inset 0 0 5px rgba(0, 0, 0, 0.2)',
          
          '&[data-checked="true"]': {
            boxShadow: '0 0 10px var(--color-glow), inset 0 0 5px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
    
    // Size variants
    size: {
      sm: {
        width: '28px',
        height: '16px',
        padding: '1px',
      },
      
      md: {
        width: '36px',
        height: '20px',
        padding: '2px',
      },
      
      lg: {
        width: '44px',
        height: '24px',
        padding: '2px',
      },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
    size: 'md',
  },
});

// Thumb styling (the moving indicator)
export const cosmicSwitchThumb = cva({
  base: {
    position: 'relative',
    borderRadius: 'full',
    backgroundColor: 'text',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
    transform: 'translateX(0%)',
    
    // When checked, move to the right position
    '[data-checked="true"] &': {
      transform: 'translateX(100%)',
      backgroundColor: 'primary',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
    },
    
    // When disabled 
    '[data-disabled="true"] &': {
      backgroundColor: 'textMuted',
      boxShadow: 'none',
    },
  },
  
  variants: {
    // Visual style variants
    variant: {
      standard: {
        // Base styles already define standard
      },
      
      minimal: {
        boxShadow: 'none',
      },
      
      cosmic: {
        // Create a lunar crater effect on the thumb
        _before: {
          content: '""',
          position: 'absolute',
          top: '60%',
          left: '30%',
          width: '25%',
          height: '25%',
          borderRadius: 'full',
          backgroundColor: 'color-mix(in srgb, var(--color-cosmic3) 90%, var(--color-text))',
          opacity: 0.4,
          transition: 'all 0.3s ease',
        },
        
        // Create a second smaller crater
        _after: {
          content: '""',
          position: 'absolute',
          top: '30%',
          right: '20%',
          width: '15%',
          height: '15%',
          borderRadius: 'full',
          backgroundColor: 'color-mix(in srgb, var(--color-cosmic3) 90%, var(--color-text))',
          opacity: 0.3,
          transition: 'all 0.3s ease',
        },
        
        // When checked, adjust crater styles
        '[data-checked="true"] &': {
          // Add a subtle glow to the thumb
          boxShadow: '0 0 5px var(--color-glow), 0 1px 2px rgba(0, 0, 0, 0.3)',
          
          // Adjust craters for checked state
          _before: {
            backgroundColor: 'color-mix(in srgb, var(--color-cosmic3) 90%, var(--color-primary))',
            opacity: 0.5,
          },
          
          _after: {
            backgroundColor: 'color-mix(in srgb, var(--color-cosmic3) 90%, var(--color-primary))',
            opacity: 0.4,
          },
        },
      },
    },
    
    // Size variants
    size: {
      sm: {
        width: '12px',
        height: '12px',
      },
      
      md: {
        width: '16px',
        height: '16px',
      },
      
      lg: {
        width: '20px',
        height: '20px',
      },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
    size: 'md',
  },
});

// Label styling
export const cosmicSwitchLabel = cva({
  base: {
    fontFamily: 'body',
    color: 'text',
    fontSize: 'base',
    transition: 'color 0.3s ease',
    
    // Disabled state
    '[data-disabled="true"] &': {
      color: 'textMuted',
    },
  },
  
  variants: {
    // Size variants
    size: {
      sm: {
        fontSize: 'sm',
      },
      
      md: {
        fontSize: 'base',
      },
      
      lg: {
        fontSize: 'lg',
      },
    },
  },
  
  defaultVariants: {
    size: 'md',
  },
});

/**
 * Usage Example (in a React component):
 * 
 * import { 
 *   cosmicSwitchContainer, 
 *   cosmicSwitchInput, 
 *   cosmicSwitchTrack, 
 *   cosmicSwitchThumb,
 *   cosmicSwitchLabel
 * } from '../styled-system/recipes/cosmicSwitch';
 * import { useState, useId } from 'react';
 * 
 * interface CosmicSwitchProps {
 *   checked?: boolean;
 *   onChange?: (checked: boolean) => void;
 *   disabled?: boolean;
 *   label?: string;
 *   labelPosition?: 'left' | 'right' | 'none';
 *   variant?: 'standard' | 'minimal' | 'cosmic';
 *   size?: 'sm' | 'md' | 'lg';
 *   id?: string;
 *   name?: string;
 *   'aria-label'?: string;
 *   'aria-labelledby'?: string;
 * }
 * 
 * function CosmicSwitch({
 *   checked = false,
 *   onChange,
 *   disabled = false,
 *   label,
 *   labelPosition = 'right',
 *   variant = 'standard',
 *   size = 'md',
 *   id: externalId,
 *   name,
 *   'aria-label': ariaLabel,
 *   'aria-labelledby': ariaLabelledBy,
 *   ...props
 * }: CosmicSwitchProps) {
 *   const [isFocused, setIsFocused] = useState(false);
 *   const internalId = useId();
 *   const id = externalId || `cosmic-switch-${internalId}`;
 *   
 *   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 *     if (!disabled && onChange) {
 *       onChange(e.target.checked);
 *     }
 *   };
 *   
 *   // Get styles from recipes
 *   const containerStyles = cosmicSwitchContainer({ 
 *     labelPosition: label ? labelPosition : 'none',
 *     size 
 *   });
 *   const inputStyles = cosmicSwitchInput({});
 *   const trackStyles = cosmicSwitchTrack({ variant, size });
 *   const thumbStyles = cosmicSwitchThumb({ variant, size });
 *   const labelStyles = cosmicSwitchLabel({ size });
 *   
 *   return (
 *     <label
 *       className={containerStyles}
 *       htmlFor={id}
 *       data-disabled={disabled}
 *     >
 *       <input
 *         id={id}
 *         type="checkbox"
 *         role="switch"
 *         checked={checked}
 *         disabled={disabled}
 *         onChange={handleChange}
 *         className={inputStyles}
 *         name={name}
 *         aria-label={ariaLabel}
 *         aria-labelledby={ariaLabelledBy || (label ? undefined : ariaLabelledBy)}
 *         onFocus={() => setIsFocused(true)}
 *         onBlur={() => setIsFocused(false)}
 *         {...props}
 *       />
 *       
 *       <div 
 *         className={trackStyles}
 *         data-checked={checked}
 *         data-disabled={disabled}
 *         data-focus={isFocused}
 *         aria-hidden="true"
 *       >
 *         <div className={thumbStyles} />
 *       </div>
 *       
 *       {label && (
 *         <span className={labelStyles} id={`${id}-label`}>
 *           {label}
 *         </span>
 *       )}
 *     </label>
 *   );
 * }
 */