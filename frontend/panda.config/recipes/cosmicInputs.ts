// src/styled-system/recipes/cosmicInput.ts

import { cva } from '../../styled-system/css';

/**
 * Cosmic Input - A sophisticated form input component with animated states
 * 
 * Features:
 * - Floating label animation on focus/filled states
 * - Subtle glow effects that respect theme tokens
 * - Support for prefix/suffix elements and icons
 * - Multiple visual variants (outline, filled, minimal, underlined)
 * - Validation states with appropriate feedback
 * - Consistent styling with other cosmic components
 */

// Input container wrapper styling
export const cosmicInputWrapper = cva({
  base: {
    position: 'relative',
    width: '100%',
    fontFamily: 'body',
    marginBottom: '6',
    
    // Default font size (adjustable via size variant)
    fontSize: 'base',
    
    // Focus-within styles for the wrapper
    _focusWithin: {
      '& .input-label': {
        color: 'primary',
        transform: 'translateY(-18px) scale(0.85)',
      },
      '& .input-field': {
        borderColor: 'primary',
      },
      '& .underline-bar': {
        transform: 'scaleX(1)',
        opacity: 1,
      },
      '& .input-icon': {
        color: 'primary',
      },
    },
    
    // When input has content (via data-filled attribute)
    '&[data-filled="true"]': {
      '& .input-label': {
        transform: 'translateY(-18px) scale(0.85)',
      },
    },
    
    // When input is disabled
    '&[data-disabled="true"]': {
      opacity: 0.6,
      cursor: 'not-allowed',
      
      '& .input-field, & .input-label, & .input-icon, & .prefix, & .suffix': {
        pointerEvents: 'none',
        cursor: 'not-allowed',
      },
    },
    
    // Error state
    '&[data-error="true"]': {
      '& .input-field': {
        borderColor: 'red.500',
      },
      '& .input-label': {
        color: 'red.500',
      },
      '& .error-message': {
        opacity: 1,
        transform: 'translateY(0)',
      },
      '& .input-icon': {
        color: 'red.500',
      },
      '& .underline-bar': {
        backgroundColor: 'red.500',
      },
    },
    
    // Success state
    '&[data-success="true"]': {
      '& .input-field': {
        borderColor: 'green.500',
      },
      '& .input-label': {
        color: 'green.500',
      },
      '& .input-icon': {
        color: 'green.500',
      },
      '& .underline-bar': {
        backgroundColor: 'green.500',
      },
    },
    
    // Readonly state
    '&[data-readonly="true"]': {
      '& .input-field': {
        backgroundColor: 'color-mix(in srgb, var(--color-background) 90%, var(--color-textMuted))',
        cursor: 'default',
      },
    },
    
    // Error message styling
    '& .error-message': {
      position: 'absolute',
      left: '0',
      bottom: '-18px',
      fontSize: 'sm',
      color: 'red.500',
      opacity: 0,
      transform: 'translateY(-5px)',
      transition: 'opacity 0.2s ease, transform 0.2s ease',
    },
  },
  
  // Define variants
  variants: {
    // Visual style variants
    variant: {
      outline: {
        '& .input-field': {
          backgroundColor: 'transparent',
          border: '1px solid',
          borderColor: 'border',
          borderRadius: 'md',
          padding: '2 3',
          transition: 'all 0.3s ease',
          _hover: {
            borderColor: 'color-mix(in srgb, var(--color-border) 70%, var(--color-primary))',
          },
        },
        
        // Label styling for outline variant
        '& .input-label': {
          top: '9px',
          left: '12px',
          padding: '0 4px',
          backgroundColor: 'transparent',
          _before: {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '0',
            right: '0',
            height: '4px',
            transform: 'translateY(-50%)',
            backgroundColor: 'background',
            zIndex: -1,
            transition: 'all 0.3s ease',
            opacity: 0,
          },
        },
        
        _focusWithin: {
          '& .input-label': {
            _before: {
              opacity: 1,
            },
          },
        },
        
        '&[data-filled="true"]': {
          '& .input-label': {
            _before: {
              opacity: 1,
            },
          },
        },
      },
      
      filled: {
        '& .input-field': {
          backgroundColor: 'color-mix(in srgb, var(--color-background) 90%, var(--color-primary))',
          border: '1px solid transparent',
          borderBottomColor: 'border',
          borderRadius: 'md md 0 0',
          padding: '3 3 2 3',
          transition: 'all 0.3s ease',
          _hover: {
            backgroundColor: 'color-mix(in srgb, var(--color-background) 85%, var(--color-primary))',
          },
        },
        
        // Label styling for filled variant
        '& .input-label': {
          top: '12px',
          left: '12px',
        },
        
        // Filled variant has an underline bar
        '& .underline-bar': {
          display: 'block',
        },
      },
      
      minimal: {
        '& .input-field': {
          backgroundColor: 'transparent',
          border: 'none',
          padding: '2 1',
          borderRadius: '0',
          borderBottom: '1px solid',
          borderColor: 'border',
          transition: 'all 0.3s ease',
          _hover: {
            borderColor: 'color-mix(in srgb, var(--color-border) 70%, var(--color-primary))',
          },
        },
        
        // Label styling for minimal variant
        '& .input-label': {
          top: '10px',
          left: '0',
        },
        
        // Minimal variant has an underline bar
        '& .underline-bar': {
          display: 'block',
          left: '0',
          right: '0',
          height: '1px',
        },
      },
      
      cosmic: {
        '& .input-field': {
          backgroundColor: 'color-mix(in srgb, var(--color-background) 95%, var(--color-primary))',
          border: '1px solid',
          borderColor: 'color-mix(in srgb, var(--color-border) 85%, var(--color-primary))',
          borderRadius: 'md',
          padding: '2 3',
          transition: 'all 0.3s ease',
          boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.1)',
          _hover: {
            borderColor: 'color-mix(in srgb, var(--color-border) 60%, var(--color-primary))',
            boxShadow: '0 0 5px var(--color-glow), inset 0 0 10px rgba(0, 0, 0, 0.1)',
          },
        },
        
        // Label styling for cosmic variant
        '& .input-label': {
          top: '9px',
          left: '12px',
          padding: '0 4px',
          backgroundColor: 'transparent',
          textShadow: '0 0 5px var(--color-glow)',
          _before: {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '0',
            right: '0',
            height: '4px',
            transform: 'translateY(-50%)',
            backgroundColor: 'background',
            zIndex: -1,
            transition: 'all 0.3s ease',
            opacity: 0,
          },
        },
        
        _focusWithin: {
          '& .input-field': {
            boxShadow: '0 0 15px var(--color-glow), inset 0 0 10px rgba(0, 0, 0, 0.1)',
          },
          '& .input-label': {
            _before: {
              opacity: 1,
            },
          },
        },
        
        '&[data-filled="true"]': {
          '& .input-label': {
            _before: {
              opacity: 1,
            },
          },
        },
      },
    },
    
    // Size variants
    size: {
      sm: {
        fontSize: 'sm',
        '& .input-field': {
          padding: '1 2',
          fontSize: 'sm',
          height: '28px',
        },
        '& .input-label': {
          fontSize: 'sm',
        },
        _focusWithin: {
          '& .input-label': {
            transform: 'translateY(-16px) scale(0.85)',
          },
        },
        '&[data-filled="true"]': {
          '& .input-label': {
            transform: 'translateY(-16px) scale(0.85)',
          },
        },
      },
      
      md: {
        // Base styles already define medium size
      },
      
      lg: {
        fontSize: 'lg',
        '& .input-field': {
          padding: '3 4',
          fontSize: 'lg',
          height: '48px',
        },
        '& .input-label': {
          fontSize: 'lg',
        },
        _focusWithin: {
          '& .input-label': {
            transform: 'translateY(-22px) scale(0.85)',
          },
        },
        '&[data-filled="true"]': {
          '& .input-label': {
            transform: 'translateY(-22px) scale(0.85)',
          },
        },
      },
    },
    
    // Controls whether the input has left/right elements
    hasPrefix: {
      true: {
        '& .input-field': {
          paddingLeft: '2.5rem',
        },
      },
    },
    
    hasSuffix: {
      true: {
        '& .input-field': {
          paddingRight: '2.5rem',
        },
      },
    },
  },
  
  // Default variants
  defaultVariants: {
    variant: 'outline',
    size: 'md',
    hasPrefix: false,
    hasSuffix: false,
  },
});

// Input field styling
export const cosmicInputField = cva({
  base: {
    position: 'relative',
    display: 'block',
    width: '100%',
    height: '40px',
    color: 'text',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    zIndex: 2,
    
    // Placeholder styling - ideally hidden with the floating label
    _placeholder: {
      color: 'transparent', // Hide native placeholder in favor of the floating label
    },
    
    // Autofill styles
    _autofill: {
      boxShadow: 'inset 0 0 0 1000px var(--color-background)',
      WebkitTextFillColor: 'var(--color-text)',
      caretColor: 'var(--color-primary)',
    },
    
    // Disabled state
    _disabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
});

// Label styling
export const cosmicInputLabel = cva({
  base: {
    position: 'absolute',
    color: 'textMuted',
    pointerEvents: 'none',
    transformOrigin: 'left top',
    transition: 'transform 0.3s ease, color 0.3s ease, background-color 0.3s ease',
    zIndex: 1,
  },
});

// For prefix and suffix elements (icons, buttons, etc.)
export const cosmicInputAdornment = cva({
  base: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'textMuted',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none', // By default adornments don't receive pointer events
    zIndex: 2,
    transition: 'color 0.3s ease',
  },
  
  variants: {
    // Position variant (left or right)
    position: {
      prefix: {
        left: '12px',
      },
      suffix: {
        right: '12px',
      },
    },
    
    // Is the adornment interactive?
    interactive: {
      true: {
        pointerEvents: 'auto',
        cursor: 'pointer',
      },
    },
  },
  
  defaultVariants: {
    position: 'prefix',
    interactive: false,
  },
});

// Underline bar for some variants
export const cosmicInputUnderline = cva({
  base: {
    position: 'absolute',
    bottom: '0',
    left: '10%',
    right: '10%',
    height: '2px',
    backgroundColor: 'primary',
    transform: 'scaleX(0)',
    opacity: 0,
    transition: 'transform 0.3s ease, opacity 0.3s ease',
    transformOrigin: 'center',
    display: 'none', // Only shown for certain variants
  },
});

/**
 * Usage Example (in a React component):
 * 
 * import { 
 *   cosmicInputWrapper, 
 *   cosmicInputField,
 *   cosmicInputLabel,
 *   cosmicInputAdornment,
 *   cosmicInputUnderline
 * } from '../styled-system/recipes/cosmicInput';
 * import { useState, useRef, useEffect } from 'react';
 *
 * interface CosmicInputProps {
 *   label: string;
 *   value: string;
 *   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
 *   variant?: 'outline' | 'filled' | 'minimal' | 'cosmic';
 *   size?: 'sm' | 'md' | 'lg';
 *   type?: string;
 *   prefix?: React.ReactNode;
 *   suffix?: React.ReactNode;
 *   isDisabled?: boolean;
 *   isReadonly?: boolean;
 *   error?: string;
 *   isSuccess?: boolean;
 *   id?: string;
 *   name?: string;
 * }
 * 
 * function CosmicInput({
 *   label,
 *   value,
 *   onChange,
 *   variant = 'outline',
 *   size = 'md',
 *   type = 'text',
 *   prefix,
 *   suffix,
 *   isDisabled = false,
 *   isReadonly = false,
 *   error,
 *   isSuccess = false,
 *   id,
 *   name,
 *   ...props
 * }: CosmicInputProps) {
 *   const inputRef = useRef<HTMLInputElement>(null);
 *   const [isFocused, setIsFocused] = useState(false);
 *   
 *   // Input wrapper classes
 *   const wrapperStyles = cosmicInputWrapper({
 *     variant,
 *     size,
 *     hasPrefix: !!prefix,
 *     hasSuffix: !!suffix,
 *   });
 *   
 *   // Input field classes
 *   const inputStyles = cosmicInputField({});
 *   
 *   // Label classes
 *   const labelStyles = cosmicInputLabel({});
 *   
 *   // Underline bar classes (for filled and minimal variants)
 *   const underlineStyles = cosmicInputUnderline({});
 *   
 *   // Determine if input has content
 *   const hasContent = !!value;
 *   
 *   // Focus handler
 *   const handleFocus = () => setIsFocused(true);
 *   const handleBlur = () => setIsFocused(false);
 *   
 *   return (
 *     <div 
 *       className={wrapperStyles}
 *       data-filled={hasContent}
 *       data-disabled={isDisabled}
 *       data-readonly={isReadonly}
 *       data-error={!!error}
 *       data-success={isSuccess}
 *     >
 *      
 *       <input
 *         ref={inputRef}
 *         id={id}
 *         name={name}
 *         type={type}
 *         value={value}
 *         onChange={onChange}
 *         disabled={isDisabled}
 *         readOnly={isReadonly}
 *         onFocus={handleFocus}
 *         onBlur={handleBlur}
 *         className="input-field"
 *         style={inputStyles}
 *         {...props}
 *       />
 *       
 *      
 *       <label 
 *         htmlFor={id} 
 *         className="input-label"
 *         style={labelStyles}
 *       >
 *         {label}
 *       </label>
 *       
 *      
 *       {prefix && (
 *         <div className="prefix" style={cosmicInputAdornment({ position: 'prefix' })}>
 *           {prefix}
 *         </div>
 *       )}
 *       
 *       
 *       {suffix && (
 *         <div className="suffix" style={cosmicInputAdornment({ position: 'suffix' })}>
 *           {suffix}
 *         </div>
 *       )}
 *       
 *       
 *       <div className="underline-bar" style={underlineStyles}></div>
 *       
 *       
 *       {error && <div className="error-message">{error}</div>}
 *     </div>
 *   );
 * }
 */