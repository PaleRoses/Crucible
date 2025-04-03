// src/styled-system/recipes/cosmicRadioButton.ts

import { cva } from '../../styled-system/css';

/**
 * Cosmic Radio Button - An elegant selection component with luxury styling
 * 
 * Features:
 * - Subtle animations and transitions for all interaction states
 * - Multiple visual variants (outline, filled, minimal, cosmic)
 * - Supports various sizes and group layouts
 * - Fully respects the active theme's color tokens
 * - Consistent styling with other cosmic components
 */

// Radio group container styling
export const cosmicRadioGroup = cva({
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3',
    width: '100%',
    fontFamily: 'body',
    
    // Horizontal layout option
    '&[data-layout="horizontal"]': {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    
    // Error state
    '&[data-error="true"]': {
      '& .radio-error': {
        opacity: 1,
        transform: 'translateY(0)',
      },
    },
  },
  
  // Define group variants
  variants: {
    // Spacing between radio options
    spacing: {
      tight: { gap: '2' },
      normal: { gap: '3' },
      loose: { gap: '4' },
    },
  },
  
  // Default group variants
  defaultVariants: {
    spacing: 'normal',
  },
});

// Individual radio container styling
export const cosmicRadioContainer = cva({
  base: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'opacity 0.3s ease',
    
    // When radio is disabled
    '&[data-disabled="true"]': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
  
  // Define container variants
  variants: {
    // Size variants
    size: {
      sm: {
        fontSize: 'sm',
        gap: '1.5',
      },
      md: {
        fontSize: 'base',
        gap: '2',
      },
      lg: {
        fontSize: 'lg',
        gap: '2.5',
      },
    },
  },
  
  // Default container variants
  defaultVariants: {
    size: 'md',
  },
});

// The actual input (visually hidden)
export const cosmicRadioInput = cva({
  base: {
    position: 'absolute',
    opacity: 0,
    width: '0',
    height: '0',
    
    // Focus styles applied to the marker
    _focus: {
      '& + .radio-marker': {
        outline: '2px solid',
        outlineColor: 'primary',
        outlineOffset: '2px',
      },
    },
    
    // When checked
    _checked: {
      '& + .radio-marker': {
        borderColor: 'primary',
        
        // Inner dot
        _after: {
          transform: 'scale(1)',
        },
      },
    },
    
    // When both checked and disabled
    '&:checked:disabled + .radio-marker': {
      borderColor: 'textMuted',
      
      // Inner dot
      _after: {
        backgroundColor: 'textMuted',
      },
    },
  },
});

// The visible radio marker (the circle element)
export const cosmicRadioMarker = cva({
  base: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    height: '18px',
    width: '18px',
    borderRadius: 'full',
    border: '2px solid',
    borderColor: 'border',
    backgroundColor: 'transparent',
    transition: 'all 0.3s ease',
    
    // Inner dot (initially scaled to 0)
    _after: {
      content: '""',
      position: 'absolute',
      width: '10px',
      height: '10px',
      borderRadius: 'full',
      backgroundColor: 'primary',
      transform: 'scale(0)',
      transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
    
    // Hover state (when container is hovered)
    '.cosmic-radio-container:hover &': {
      borderColor: 'color-mix(in srgb, var(--color-border) 50%, var(--color-primary))',
    },
  },
  
  // Define marker variants
  variants: {
    // Visual style variants
    variant: {
      outline: {
        // Base style is already outline
        backgroundColor: 'transparent',
        
        // Hover effect
        '.cosmic-radio-container:hover &': {
          backgroundColor: 'color-mix(in srgb, var(--color-background) 95%, var(--color-primary))',
        },
      },
      
      filled: {
        backgroundColor: 'color-mix(in srgb, var(--color-background) 90%, var(--color-primary))',
        
        // Hover effect
        '.cosmic-radio-container:hover &': {
          backgroundColor: 'color-mix(in srgb, var(--color-background) 85%, var(--color-primary))',
        },
        
        // Different inner dot styling
        _after: {
          width: '6px',
          height: '6px',
        },
      },
      
      minimal: {
        border: '1px solid',
        backgroundColor: 'transparent',
        
        // Hover effect
        '.cosmic-radio-container:hover &': {
          backgroundColor: 'color-mix(in srgb, var(--color-background) 95%, var(--color-primary))',
        },
      },
      
      cosmic: {
        backgroundColor: 'color-mix(in srgb, var(--color-background) 95%, var(--color-primary))',
        boxShadow: 'inset 0 0 4px rgba(0, 0, 0, 0.1)',
        
        // Inner circle effect (decorative)
        _before: {
          content: '""',
          position: 'absolute',
          inset: '1px',
          borderRadius: 'full',
          background: 'radial-gradient(circle, var(--color-background) 0%, transparent 80%)',
          opacity: 0.6,
          pointerEvents: 'none',
        },
        
        // Hover effect
        '.cosmic-radio-container:hover &': {
          borderColor: 'color-mix(in srgb, var(--color-border) 30%, var(--color-primary))',
          boxShadow: '0 0 8px var(--color-glow), inset 0 0 4px rgba(0, 0, 0, 0.1)',
        },
        
        // Inner dot styling
        _after: {
          width: '8px',
          height: '8px',
          boxShadow: '0 0 4px var(--color-glow)',
        },
        
        // When checked, add a subtle glow
        'input:checked + &': {
          boxShadow: '0 0 8px var(--color-glow), inset 0 0 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    
    // Size variants
    size: {
      sm: {
        height: '16px',
        width: '16px',
        
        // Adjust inner dot size
        _after: {
          width: '8px',
          height: '8px',
        },
        
        // Adjust for variant combinations
        '&[data-variant="filled"]': {
          _after: {
            width: '5px',
            height: '5px',
          },
        },
        
        '&[data-variant="cosmic"]': {
          _after: {
            width: '7px',
            height: '7px',
          },
        },
      },
      
      md: {
        // Base styles already define medium size
      },
      
      lg: {
        height: '22px',
        width: '22px',
        
        // Adjust inner dot size
        _after: {
          width: '12px',
          height: '12px',
        },
        
        // Adjust for variant combinations
        '&[data-variant="filled"]': {
          _after: {
            width: '8px',
            height: '8px',
          },
        },
        
        '&[data-variant="cosmic"]': {
          _after: {
            width: '10px',
            height: '10px',
          },
        },
      },
    },
  },
  
  // Compound variants for special combinations
  compoundVariants: [
    {
      variant: 'filled',
      size: 'sm',
      css: {
        _after: {
          width: '5px',
          height: '5px',
        },
      },
    },
    {
      variant: 'filled',
      size: 'md',
      css: {
        _after: {
          width: '6px',
          height: '6px',
        },
      },
    },
    {
      variant: 'filled',
      size: 'lg',
      css: {
        _after: {
          width: '8px',
          height: '8px',
        },
      },
    },
  ],
  
  // Default marker variants
  defaultVariants: {
    variant: 'outline',
    size: 'md',
  },
});

// Label styling
export const cosmicRadioLabel = cva({
  base: {
    color: 'text',
    transition: 'color 0.3s ease',
    
    // When radio is checked, emphasize the label
    'input:checked ~ &': {
      color: 'primary',
    },
    
    // When disabled
    '[data-disabled="true"] &': {
      color: 'textMuted',
    },
  },
  
  variants: {
    // Label position (to support right-to-left interfaces)
    position: {
      right: { 
        order: 2 
      },
      left: { 
        order: 0 
      },
    },
  },
  
  defaultVariants: {
    position: 'right',
  },
});

// Error message styling
export const cosmicRadioError = cva({
  base: {
    marginTop: '1',
    fontSize: 'sm',
    color: 'red.500',
    opacity: 0,
    transform: 'translateY(-5px)',
    transition: 'opacity 0.2s ease, transform 0.2s ease',
  },
});

/**
 * Usage Example (in a React component):
 * 
 * import { 
 *   cosmicRadioGroup,
 *   cosmicRadioContainer,
 *   cosmicRadioInput,
 *   cosmicRadioMarker,
 *   cosmicRadioLabel,
 *   cosmicRadioError
 * } from '../styled-system/recipes/cosmicRadioButton';
 * import { useState } from 'react';
 * 
 * interface RadioOption {
 *   value: string;
 *   label: string;
 *   disabled?: boolean;
 * }
 * 
 * interface CosmicRadioGroupProps {
 *   name: string;
 *   options: RadioOption[];
 *   value: string;
 *   onChange: (value: string) => void;
 *   variant?: 'outline' | 'filled' | 'minimal' | 'cosmic';
 *   size?: 'sm' | 'md' | 'lg';
 *   layout?: 'vertical' | 'horizontal';
 *   spacing?: 'tight' | 'normal' | 'loose';
 *   error?: string;
 *   labelPosition?: 'right' | 'left';
 *   isDisabled?: boolean;
 * }
 * 
 * function CosmicRadioGroup({
 *   name,
 *   options,
 *   value,
 *   onChange,
 *   variant = 'outline',
 *   size = 'md',
 *   layout = 'vertical',
 *   spacing = 'normal',
 *   error,
 *   labelPosition = 'right',
 *   isDisabled = false,
 * }: CosmicRadioGroupProps) {
 *   
 *   // Get styles from recipes
 *   const groupStyles = cosmicRadioGroup({ spacing });
 *   const containerStyles = cosmicRadioContainer({ size });
 *   const inputStyles = cosmicRadioInput({});
 *   const markerStyles = cosmicRadioMarker({ variant, size });
 *   const labelStyles = cosmicRadioLabel({ position: labelPosition });
 *   const errorStyles = cosmicRadioError({});
 *   
 *   // Handle change
 *   const handleChange = (optionValue: string) => {
 *     if (!isDisabled) {
 *       onChange(optionValue);
 *     }
 *   };
 *   
 *   return (
 *     <div 
 *       className="cosmic-radio-group" 
 *       style={groupStyles}
 *       data-layout={layout}
 *       data-error={!!error}
 *     >
 *       {options.map((option) => (
 *         <label
 *           key={option.value}
 *           className="cosmic-radio-container"
 *           style={containerStyles}
 *           data-disabled={isDisabled || option.disabled}
 *         >
 *           <input
 *             type="radio"
 *             name={name}
 *             value={option.value}
 *             checked={value === option.value}
 *             onChange={() => handleChange(option.value)}
 *             disabled={isDisabled || option.disabled}
 *             className="radio-input"
 *             style={inputStyles}
 *           />
 *           <div 
 *             className="radio-marker" 
 *             style={markerStyles}
 *             data-variant={variant}
 *           ></div>
 *           <span 
 *             className="radio-label"
 *             style={labelStyles}
 *           >
 *             {option.label}
 *           </span>
 *         </label>
 *       ))}
 *       
 *       {error && (
 *         <div className="radio-error" style={errorStyles}>
 *           {error}
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * 
 * // Example Usage
 * function ExampleForm() {
 *   const [selectedOption, setSelectedOption] = useState('option1');
 *   
 *   const radioOptions = [
 *     { value: 'option1', label: 'Premium Option' },
 *     { value: 'option2', label: 'Standard Option' },
 *     { value: 'option3', label: 'Basic Option', disabled: true },
 *   ];
 *   
 *   return (
 *     <CosmicRadioGroup
 *       name="example"
 *       options={radioOptions}
 *       value={selectedOption}
 *       onChange={setSelectedOption}
 *       variant="cosmic"
 *       layout="vertical"
 *     />
 *   );
 * }
 */