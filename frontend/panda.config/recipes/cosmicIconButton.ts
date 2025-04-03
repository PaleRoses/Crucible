// src/styled-system/recipes/cosmicIconButton.ts

import { cva } from '../../styled-system/css';

/**
 * Cosmic Icon Button - A minimal, SVG-focused button component
 * 
 * Features:
 * - Clean, minimal styling optimized for SVG icons
 * - Multiple visual variants from subtle to prominent
 * - Size options with proper proportions
 * - Accessibility-focused with proper focus states
 * - Optional tooltip support
 * - Consistent with cosmic design language
 */

export const cosmicIconButton = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: '0',
    border: 'none',
    background: 'transparent',
    color: 'textMuted',
    cursor: 'pointer',
    borderRadius: 'full',
    transition: 'all 0.2s ease',
    userSelect: 'none',
    aspectRatio: '1/1',
    
    // SVG styling
    '& svg': {
      width: '100%',
      height: '100%',
      transition: 'transform 0.2s ease, color 0.2s ease',
    },
    
    // Hover effects
    _hover: {
      color: 'primary',
    },
    
    // Focus state for accessibility
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
    
    // Active/pressed state
    _active: {
      transform: 'scale(0.95)',
      '& svg': {
        transform: 'scale(0.95)',
      },
    },
    
    // Disabled state
    _disabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
      _hover: {
        color: 'textMuted',
        background: 'transparent',
        transform: 'none',
      },
    },
  },
  
  variants: {
    // Visual variants from minimal to prominent
    variant: {
      // Default - completely transparent
      ghost: {
        background: 'transparent',
        _hover: {
          color: 'primary',
        },
      },
      
      // Subtle background appears on hover
      subtle: {
        _hover: {
          backgroundColor: 'color-mix(in srgb, var(--color-hover) 30%, transparent)',
          color: 'primary',
        },
      },
      
      // Light background always visible
      light: {
        backgroundColor: 'color-mix(in srgb, var(--color-hover) 20%, transparent)',
        _hover: {
          backgroundColor: 'color-mix(in srgb, var(--color-hover) 40%, transparent)',
          color: 'primary',
        },
      },
      
      // Bordered style
      outline: {
        border: '1px solid',
        borderColor: 'border',
        _hover: {
          borderColor: 'primary',
          color: 'primary',
        },
      },
      
      // Solid background
      solid: {
        backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
        color: 'primary',
        _hover: {
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
        },
      },
      
      // Cosmic style with glow effects
      cosmic: {
        backgroundColor: 'transparent',
        color: 'text',
        transition: 'all 0.3s ease',
        
        _hover: {
          color: 'primary',
          transform: 'translateY(-1px)',
          _before: {
            opacity: 0.7,
            transform: 'scale(1.2)',
          },
        },
        
        _before: {
          content: '""',
          position: 'absolute',
          inset: '-2px',
          borderRadius: 'full',
          background: 'radial-gradient(circle, var(--color-glow) 0%, transparent 70%)',
          opacity: 0,
          transform: 'scale(0.8)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          zIndex: -1,
          pointerEvents: 'none',
        },
        
        _active: {
          transform: 'translateY(0) scale(0.95)',
          _before: {
            opacity: 0.5,
            transform: 'scale(0.9)',
          },
        },
      },
    },
    
    // Size variants
    size: {
      xs: {
        width: '20px',
        height: '20px',
        padding: '4px',
        '& svg': {
          width: '12px',
          height: '12px',
        },
      },
      sm: {
        width: '28px',
        height: '28px',
        padding: '6px',
        '& svg': {
          width: '16px',
          height: '16px',
        },
      },
      md: {
        width: '36px',
        height: '36px',
        padding: '8px',
        '& svg': {
          width: '20px',
          height: '20px',
        },
      },
      lg: {
        width: '44px',
        height: '44px',
        padding: '10px',
        '& svg': {
          width: '24px',
          height: '24px',
        },
      },
      xl: {
        width: '56px',
        height: '56px',
        padding: '12px',
        '& svg': {
          width: '32px',
          height: '32px',
        },
      },
    },
    
    // Active state for toggle buttons
    isActive: {
      true: {
        color: 'primary',
      },
    },
    
    // Label position for accessible text (visually hidden but available to screen readers)
    labelPosition: {
      // Label is completely hidden visually but available to screen readers
      srOnly: {
        '& .icon-button-label': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: '0',
        },
      },
      // Label appears on right of icon
      right: {
        aspectRatio: 'auto',
        padding: '4px 8px 4px 4px',
        borderRadius: 'full',
        '& .icon-button-content': {
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        },
        '& .icon-button-label': {
          fontSize: 'sm',
          fontFamily: 'body',
        },
      },
      // Label appears below icon
      bottom: {
        aspectRatio: 'auto',
        flexDirection: 'column',
        padding: '4px 4px 8px 4px',
        '& .icon-button-content': {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
        },
        '& .icon-button-label': {
          fontSize: 'xs',
          fontFamily: 'body',
          textAlign: 'center',
        },
      },
    },
  },
  
  // Compound variants for special combinations
  compoundVariants: [
    // Adjust sizing for right-positioned labels
    {
      size: 'sm',
      labelPosition: 'right',
      css: {
        height: '28px',
        '& .icon-button-label': {
          fontSize: 'xs',
        },
      },
    },
    {
      size: 'md',
      labelPosition: 'right',
      css: {
        height: '36px',
        '& .icon-button-label': {
          fontSize: 'sm',
        },
      },
    },
    {
      size: 'lg',
      labelPosition: 'right',
      css: {
        height: '44px',
        '& .icon-button-label': {
          fontSize: 'base',
        },
      },
    },
    // Special styling for active cosmic buttons
    {
      variant: 'cosmic',
      isActive: true,
      css: {
        _before: {
          opacity: 0.5,
          transform: 'scale(1)',
        },
      },
    },
  ],
  
  // Default variants
  defaultVariants: {
    variant: 'ghost',
    size: 'md',
    isActive: false,
    labelPosition: 'srOnly',
  },
});

/**
 * Usage Example (in a React component):
 * 
 * import { cosmicIconButton } from '../styled-system/recipes/cosmicIconButton';
 * import { css } from '../styled-system/css';
 * 
 * interface IconButtonProps {
 *   icon: React.ReactNode;
 *   label: string;
 *   variant?: 'ghost' | 'subtle' | 'light' | 'outline' | 'solid' | 'cosmic';
 *   size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
 *   isActive?: boolean;
 *   labelPosition?: 'srOnly' | 'right' | 'bottom';
 *   disabled?: boolean;
 *   onClick?: () => void;
 *   ariaControls?: string;
 *   ariaExpanded?: boolean;
 *   ariaPressed?: boolean;
 * }
 * 
 * function CosmicIconButtonComponent({
 *   icon,
 *   label,
 *   variant = 'ghost',
 *   size = 'md',
 *   isActive = false,
 *   labelPosition = 'srOnly',
 *   disabled = false,
 *   onClick,
 *   ariaControls,
 *   ariaExpanded,
 *   ariaPressed,
 *   ...props
 * }: IconButtonProps) {
 *   // Get styles from recipe
 *   const buttonStyles = cosmicIconButton({
 *     variant,
 *     size,
 *     isActive,
 *     labelPosition,
 *   });
 *   
 *   return (
 *     <button
 *       className={buttonStyles}
 *       onClick={onClick}
 *       disabled={disabled}
 *       aria-label={labelPosition === 'srOnly' ? label : undefined}
 *       aria-controls={ariaControls}
 *       aria-expanded={ariaExpanded}
 *       aria-pressed={ariaPressed}
 *       type="button"
 *       {...props}
 *     >
 *       <div className="icon-button-content">
 *         {icon}
 *         {labelPosition !== 'srOnly' && (
 *           <span className="icon-button-label">{label}</span>
 *         )}
 *       </div>
 *     </button>
 *   );
 * }
 * 
 * // Example usage:
 * function MyComponent() {
 *   const [isLiked, setIsLiked] = useState(false);
 *   
 *   return (
 *     <div>
 *       <CosmicIconButtonComponent
 *         icon={<HeartIcon />}
 *         label="Like"
 *         variant="cosmic"
 *         isActive={isLiked}
 *         onClick={() => setIsLiked(!isLiked)}
 *         ariaPressed={isLiked}
 *       />
 *       
 *       <CosmicIconButtonComponent
 *         icon={<SettingsIcon />}
 *         label="Settings"
 *         variant="subtle"
 *         labelPosition="right"
 *       />
 *       
 *       <CosmicIconButtonComponent
 *         icon={<ShareIcon />}
 *         label="Share"
 *         variant="outline"
 *         size="lg"
 *       />
 *     </div>
 *   );
 * }
 */