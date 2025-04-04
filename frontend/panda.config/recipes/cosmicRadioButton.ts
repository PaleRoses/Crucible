// panda.config/recipes/cosmicRadioButton.ts

import { defineRecipe } from '@pandacss/dev';

/**
 * ====================================================================================
 * COSMIC RADIO BUTTON - An elegant selection component with luxury styling
 * ====================================================================================
 * 
 * IMPORT INTO YOUR PANDA CONFIG:
 * 
 * import { 
 *   cosmicRadioGroup,
 *   cosmicRadioContainer,
 *   cosmicRadioInput,
 *   cosmicRadioMarker,
 *   cosmicRadioLabel,
 *   cosmicRadioError,
 *   cosmicRadioButton
 * } from './panda.config/recipes/cosmicRadioButton';
 * 
 * Then add to your config:
 * 
 * export default defineConfig({
 *   // ...other config
 *   theme: {
 *     extend: {
 *       recipes: {
 *         // Method 1: Add individual components
 *         RadioGroup: cosmicRadioGroup,
 *         RadioContainer: cosmicRadioContainer,
 *         RadioInput: cosmicRadioInput,
 *         RadioMarker: cosmicRadioMarker,
 *         RadioLabel: cosmicRadioLabel,
 *         RadioError: cosmicRadioError,
 *         
 *         // Method 2: Or use the combined object
 *         // This adds all components with their original naming
 *         ...cosmicRadioButton
 *       }
 *     }
 *   }
 * })
 * 
 * Features:
 * - Subtle animations and transitions for all interaction states
 * - Multiple visual variants (outline, filled, minimal, cosmic)
 * - Supports various sizes and group layouts
 * - Fully respects the active theme's color tokens
 * - Consistent styling with other cosmic components
 * - Accessible design with keyboard navigation support
 * - Error state handling with elegant animations
 */

// Radio group container styling
export const cosmicRadioGroup = defineRecipe({
  className: 'cosmicRadioGroup',
  description: 'A container for grouping radio buttons with cosmic styling',
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
export const cosmicRadioContainer = defineRecipe({
  className: 'cosmicRadioContainer',
  description: 'A container for individual radio buttons with cosmic styling',
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
export const cosmicRadioInput = defineRecipe({
  className: 'cosmicRadioInput',
  description: 'The hidden input element for the radio button',
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
export const cosmicRadioMarker = defineRecipe({
  className: 'cosmicRadioMarker',
  description: 'The visible marker for the radio button, styled to match cosmic theme',
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
export const cosmicRadioLabel = defineRecipe({
  className: 'cosmicRadioLabel',
  description: 'Label for the radio button, styled to match cosmic theme',
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
export const cosmicRadioError = defineRecipe({
  className: 'cosmicRadioError',
  description: 'Error message for the radio button group, styled to match cosmic theme',
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
 * Bulk export of all cosmic radio button components
 */
export const cosmicRadioButton = {
  group: cosmicRadioGroup,
  container: cosmicRadioContainer,
  input: cosmicRadioInput,
  marker: cosmicRadioMarker,
  label: cosmicRadioLabel,
  error: cosmicRadioError
};

/**
 * USAGE EXAMPLE (in a React component):
 * =====================================
 * 
 * // First, import the necessary components
 * import { useState } from 'react';
 * import { 
 *   cosmicRadioGroup,
 *   cosmicRadioContainer,
 *   cosmicRadioInput,
 *   cosmicRadioMarker,
 *   cosmicRadioLabel,
 *   cosmicRadioError
 * } from './panda.config/recipes/cosmicRadioButton';
 * 
 * // Define props interface for the RadioGroup component
 * interface RadioOption {
 *   value: string;
 *   label: string;
 *   disabled?: boolean;
 * }
 * 
 * interface CosmicRadioGroupProps {
 *   name: string;                   // Form field name
 *   options: RadioOption[];         // Array of radio options
 *   value: string;                  // Currently selected value
 *   onChange: (value: string) => void; // Change handler
 *   variant?: 'outline' | 'filled' | 'minimal' | 'cosmic'; // Visual style
 *   size?: 'sm' | 'md' | 'lg';      // Size variant
 *   layout?: 'vertical' | 'horizontal'; // Layout orientation
 *   spacing?: 'tight' | 'normal' | 'loose'; // Spacing between options
 *   error?: string;                 // Error message if validation fails
 *   labelPosition?: 'right' | 'left'; // Position of label relative to radio
 *   isDisabled?: boolean;           // Disabled state for the entire group
 * }
 * 
 * // Create the RadioGroup component
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
 *       className={groupStyles}
 *       data-layout={layout}
 *       data-error={!!error}
 *       role="radiogroup"
 *       aria-labelledby={`${name}-group-label`}
 *     >
 *       {options.map((option) => (
 *         <label
 *           key={option.value}
 *           className={containerStyles}
 *           data-disabled={isDisabled || option.disabled}
 *         >
 *           <input
 *             type="radio"
 *             name={name}
 *             value={option.value}
 *             checked={value === option.value}
 *             onChange={() => handleChange(option.value)}
 *             disabled={isDisabled || option.disabled}
 *             className={inputStyles}
 *             aria-disabled={isDisabled || option.disabled}
 *           />
 *           <div 
 *             className={markerStyles}
 *             data-variant={variant}
 *             aria-hidden="true"
 *           ></div>
 *           <span 
 *             className={labelStyles}
 *           >
 *             {option.label}
 *           </span>
 *         </label>
 *       ))}
 *       
 *       {error && (
 *         <div className={errorStyles} aria-live="polite">
 *           {error}
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * 
 * // EXAMPLES OF USAGE:
 * 
 * // Basic RadioGroup
 * function BasicExample() {
 *   const [selectedOption, setSelectedOption] = useState('option1');
 *   
 *   const radioOptions = [
 *     { value: 'option1', label: 'Option 1' },
 *     { value: 'option2', label: 'Option 2' },
 *     { value: 'option3', label: 'Option 3' },
 *   ];
 *   
 *   return (
 *     <CosmicRadioGroup
 *       name="basic"
 *       options={radioOptions}
 *       value={selectedOption}
 *       onChange={setSelectedOption}
 *     />
 *   );
 * }
 * 
 * // Cosmic-themed RadioGroup with horizontal layout
 * function CosmicExample() {
 *   const [selectedOption, setSelectedOption] = useState('premium');
 *   
 *   const radioOptions = [
 *     { value: 'premium', label: 'Premium Plan' },
 *     { value: 'standard', label: 'Standard Plan' },
 *     { value: 'basic', label: 'Basic Plan', disabled: true },
 *   ];
 *   
 *   return (
 *     <CosmicRadioGroup
 *       name="plans"
 *       options={radioOptions}
 *       value={selectedOption}
 *       onChange={setSelectedOption}
 *       variant="cosmic"
 *       size="lg"
 *       layout="horizontal"
 *       spacing="loose"
 *     />
 *   );
 * }
 * 
 * // RadioGroup with error state
 * function ValidationExample() {
 *   const [selectedOption, setSelectedOption] = useState('');
 *   const [error, setError] = useState<string | undefined>(undefined);
 *   
 *   const radioOptions = [
 *     { value: 'yes', label: 'Yes' },
 *     { value: 'no', label: 'No' },
 *   ];
 *   
 *   const handleChange = (value: string) => {
 *     setSelectedOption(value);
 *     setError(undefined);
 *   };
 *   
 *   const handleSubmit = () => {
 *     if (!selectedOption) {
 *       setError('Please select an option');
 *     }
 *   };
 *   
 *   return (
 *     <>
 *       <CosmicRadioGroup
 *         name="consent"
 *         options={radioOptions}
 *         value={selectedOption}
 *         onChange={handleChange}
 *         variant="filled"
 *         error={error}
 *       />
 *       <button onClick={handleSubmit}>Submit</button>
 *     </>
 *   );
 * }
 */

// Add these keyframe animations to your global CSS or Panda CSS config if you want enhanced animations:
/* 
@keyframes cosmicRadioPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--color-primary-rgb), 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(var(--color-primary-rgb), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--color-primary-rgb), 0);
  }
}

@keyframes cosmicRadioMarkerAppear {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
*/