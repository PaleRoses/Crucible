// panda.config/recipes/cosmicDropdown.ts
import { defineRecipe } from '@pandacss/dev';

/**
 * ====================================================================================
 * COSMIC DROPDOWN - A sophisticated dropdown component with luxury styling
 * ====================================================================================
 * 
 * IMPORT INTO YOUR PANDA CONFIG:
 * 
 * import { 
 *   cosmicDropdownTrigger, 
 *   cosmicDropdownContent, 
 *   cosmicDropdownItem,
 *   cosmicDropdownSeparator,
 *   cosmicDropdownLabel,
 *   cosmicDropdown
 * } from './panda.config/recipes/cosmicDropdown';
 * 
 * Then add to your config:
 * 
 * export default defineConfig({
 *   // ...other config
 *   theme: {
 *     extend: {
 *       recipes: {
 *         // Method 1: Add individual components
 *         DropdownTrigger: cosmicDropdownTrigger,
 *         DropdownContent: cosmicDropdownContent,
 *         DropdownItem: cosmicDropdownItem,
 *         DropdownSeparator: cosmicDropdownSeparator,
 *         DropdownLabel: cosmicDropdownLabel,
 *         
 *         // Method 2: Or use the combined object
 *         // This adds all components with their original naming
 *         ...cosmicDropdown
 *       }
 *     }
 *   }
 * })
 * 
 * Features:
 * - Elegant opening/closing animations with refined timing
 * - Multiple visual variants including a premium cosmic style
 * - Rich item styling with support for icons, descriptions, and separators
 * - Support for grouped items with elegant headers
 * - Proper keyboard navigation and accessibility attributes
 * - Portal support for proper layering
 * - Consistent with other cosmic components
 */

// Trigger button styling
export const cosmicDropdownTrigger = defineRecipe({
  className: 'cosmicDropdownTrigger',
  description: 'A sophisticated dropdown trigger button with luxury styling',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontFamily: 'heading',
    fontWeight: 'normal',
    letterSpacing: '0.05em',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    userSelect: 'none',
    
    // Focus styling
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
    
    // Arrow indicator
    '& .dropdown-arrow': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.3s ease',
    },
    
    // When dropdown is open
    '&[data-state="open"]': {
      '& .dropdown-arrow': {
        transform: 'rotate(180deg)',
      },
    },
  },
  
  variants: {
    // Visual variants
    variant: {
      // Minimal trigger with just text and arrow
      minimal: {
        backgroundColor: 'transparent',
        border: 'none',
        color: 'text',
        padding: '0.25rem 0.5rem',
        
        _hover: {
          color: 'primary',
        },
        
        '&[data-state="open"]': {
          color: 'primary',
        },
      },
      
      // Standard button-like trigger
      standard: {
        backgroundColor: 'backgroundAlt',
        color: 'text',
        border: '1px solid',
        borderColor: 'border',
        borderRadius: 'md',
        padding: '0.5rem 1rem',
        
        _hover: {
          borderColor: 'primary',
          color: 'primary',
        },
        
        '&[data-state="open"]': {
          borderColor: 'primary',
          color: 'primary',
          backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 95%, var(--color-primary))',
        },
      },
      
      // Outlined variant with transparent background
      outline: {
        backgroundColor: 'transparent',
        color: 'primary',
        border: '1px solid',
        borderColor: 'primary',
        borderRadius: 'md',
        padding: '0.5rem 1rem',
        
        _hover: {
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
          boxShadow: '0 0 8px var(--color-glow)',
        },
        
        '&[data-state="open"]': {
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
          boxShadow: '0 0 12px var(--color-glow)',
        },
      },
      
      // Premium cosmic variant with glow effects
      cosmic: {
        backgroundColor: 'color-mix(in srgb, var(--color-background) 95%, var(--color-primary))',
        color: 'primary',
        border: '1px solid',
        borderColor: 'color-mix(in srgb, var(--color-border) 70%, var(--color-primary))',
        borderRadius: 'md',
        padding: '0.5rem 1rem',
        boxShadow: '0 0 8px var(--color-glow)',
        
        // Subtle shimmer effect
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
          borderColor: 'color-mix(in srgb, var(--color-border) 50%, var(--color-primary))',
          boxShadow: '0 0 12px var(--color-glow)',
          _before: {
            opacity: 0.2,
            animation: 'cosmicDropdownShimmer 2s ease infinite',
          },
        },
        
        '&[data-state="open"]': {
          backgroundColor: 'color-mix(in srgb, var(--color-background) 90%, var(--color-primary))',
          boxShadow: '0 0 15px var(--color-glow)',
          borderColor: 'primary',
          _before: {
            opacity: 0.25,
            animation: 'cosmicDropdownShimmer 2s ease infinite',
          },
        },
      },
    },
    
    // Size variants
    size: {
      sm: {
        fontSize: 'sm',
        gap: '0.25rem',
        
        '&[data-variant="standard"], &[data-variant="outline"], &[data-variant="cosmic"]': {
          padding: '0.25rem 0.75rem',
        },
        
        '& .dropdown-arrow': {
          width: '12px',
          height: '12px',
        },
      },
      
      md: {
        fontSize: 'base',
        // Base styles already define medium size
      },
      
      lg: {
        fontSize: 'lg',
        gap: '0.75rem',
        
        '&[data-variant="standard"], &[data-variant="outline"], &[data-variant="cosmic"]': {
          padding: '0.75rem 1.25rem',
        },
        
        '& .dropdown-arrow': {
          width: '16px',
          height: '16px',
        },
      },
    },
    
    // Is the trigger full width?
    fullWidth: {
      true: {
        width: '100%',
        justifyContent: 'space-between',
      },
      false: {
        width: 'auto',
      },
    },
    
    // Is the trigger disabled?
    isDisabled: {
      true: {
        opacity: 0.6,
        cursor: 'not-allowed',
        pointerEvents: 'none',
        
        _hover: {
          borderColor: 'border',
          boxShadow: 'none',
          backgroundColor: 'backgroundAlt',
        },
      },
    },
  },
  
  // Default variants
  defaultVariants: {
    variant: 'standard',
    size: 'md',
    fullWidth: false,
    isDisabled: false,
  },
});

// Content panel styling
export const cosmicDropdownContent = defineRecipe({
  className: 'cosmicDropdownContent',
  description: 'A sophisticated dropdown content panel with luxury styling',
  base: {
    position: 'absolute',
    zIndex: 'dropdown',
    minWidth: '180px',
    backgroundColor: 'backgroundAlt',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    border: '1px solid',
    borderColor: 'border',
    borderRadius: 'md',
    overflow: 'hidden',
    transformOrigin: 'top center',
    
    // Animation setup
    opacity: 0,
    transform: 'translateY(-10px) scale(0.98)',
    transition: 'opacity 0.2s ease, transform 0.2s ease',
    pointerEvents: 'none',
    visibility: 'hidden',
    
    // Open state
    '&[data-state="open"]': {
      opacity: 1,
      transform: 'translateY(0) scale(1)',
      pointerEvents: 'auto',
      visibility: 'visible',
    },
    
    // Scrollbar styling
    '&::-webkit-scrollbar': {
      width: '4px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'border',
      borderRadius: 'full',
    },
  },
  
  variants: {
    // Visual variants matching trigger styles
    variant: {
      minimal: {
        border: '1px solid',
        borderColor: 'border',
        backgroundColor: 'backgroundAlt',
      },
      
      standard: {
        border: '1px solid',
        borderColor: 'border',
        backgroundColor: 'backgroundAlt',
      },
      
      outline: {
        border: '1px solid',
        borderColor: 'primary',
        backgroundColor: 'backgroundAlt',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2), 0 0 5px var(--color-glow)',
      },
      
      cosmic: {
        border: '1px solid',
        borderColor: 'color-mix(in srgb, var(--color-border) 50%, var(--color-primary))',
        backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 98%, var(--color-primary))',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2), 0 0 10px var(--color-glow)',
        borderLeft: '3px solid',
        borderLeftColor: 'primary',
        
        // Star effect background
        _before: {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle, var(--color-cosmic1) 1px, transparent 1px), 
            radial-gradient(circle, var(--color-cosmic2) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px, 30px 30px',
          backgroundPosition: '0 0, 10px 10px',
          opacity: 0.03,
          zIndex: 0,
          pointerEvents: 'none',
        },
      },
    },
    
    // Size variants
    size: {
      sm: {
        fontSize: 'sm',
        maxHeight: '180px',
      },
      
      md: {
        fontSize: 'base',
        maxHeight: '250px',
      },
      
      lg: {
        fontSize: 'lg',
        maxHeight: '320px',
      },
    },
    
    // Positioning variants
    position: {
      bottomStart: {
        top: '100%',
        left: '0',
        marginTop: '0.5rem',
      },
      
      bottomEnd: {
        top: '100%',
        right: '0',
        marginTop: '0.5rem',
      },
      
      bottomCenter: {
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%) translateY(-10px) scale(0.98)',
        marginTop: '0.5rem',
        
        '&[data-state="open"]': {
          transform: 'translateX(-50%) translateY(0) scale(1)',
        },
      },
      
      topStart: {
        bottom: '100%',
        left: '0',
        marginBottom: '0.5rem',
        transformOrigin: 'bottom center',
      },
      
      topEnd: {
        bottom: '100%',
        right: '0',
        marginBottom: '0.5rem',
        transformOrigin: 'bottom center',
      },
      
      topCenter: {
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%) translateY(10px) scale(0.98)',
        marginBottom: '0.5rem',
        transformOrigin: 'bottom center',
        
        '&[data-state="open"]': {
          transform: 'translateX(-50%) translateY(0) scale(1)',
        },
      },
    },
    
    // Width variants
    width: {
      auto: {
        width: 'auto',
      },
      
      trigger: {
        width: '100%',
      },
      
      fixed: {
        width: '240px',
      },
    },
    
    // Maximum height with scrolling
    maxHeight: {
      sm: {
        maxHeight: '180px',
        overflowY: 'auto',
      },
      
      md: {
        maxHeight: '250px',
        overflowY: 'auto',
      },
      
      lg: {
        maxHeight: '320px',
        overflowY: 'auto',
      },
      
      none: {
        maxHeight: 'none',
        overflowY: 'visible',
      },
    },
  },
  
  // Default variants
  defaultVariants: {
    variant: 'standard',
    size: 'md',
    position: 'bottomStart',
    width: 'auto',
    maxHeight: 'md',
  },
});

// Dropdown item styling
export const cosmicDropdownItem = defineRecipe({
  className: 'cosmicDropdownItem',
  description: 'A sophisticated dropdown item with luxury styling',
  base: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '0.5rem 1rem',
    fontSize: 'inherit',
    fontFamily: 'body',
    color: 'text',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    position: 'relative',
    userSelect: 'none',
    
    // Content layout
    '& .item-content': {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      width: '100%',
    },
    
    // Icon styling
    '& .item-icon': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'textMuted',
      flexShrink: 0,
    },
    
    // Text content
    '& .item-text': {
      flex: '1',
    },
    
    // Description text
    '& .item-description': {
      fontSize: '0.8em',
      color: 'textMuted',
      marginTop: '0.25rem',
    },
    
    // Right aligned content (like shortcuts)
    '& .item-suffix': {
      marginLeft: 'auto',
      color: 'textMuted',
      fontSize: '0.85em',
    },
    
    // Hover state
    _hover: {
      backgroundColor: 'hover',
      color: 'primary',
      
      '& .item-icon': {
        color: 'primary',
      },
    },
    
    // Focus state
    _focusVisible: {
      backgroundColor: 'hover',
      color: 'primary',
      outline: 'none',
      
      '& .item-icon': {
        color: 'primary',
      },
    },
    
    // Active/pressed state
    _active: {
      backgroundColor: 'active',
    },
    
    // Disabled state
    '&[data-disabled]': {
      opacity: 0.5,
      cursor: 'not-allowed',
      pointerEvents: 'none',
    },
    
    // Selected state
    '&[data-selected]': {
      backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
      color: 'primary',
      fontWeight: 'medium',
      
      // Checkmark indicator
      _before: {
        content: '""',
        width: '4px',
        height: '100%',
        position: 'absolute',
        left: 0,
        top: 0,
        backgroundColor: 'primary',
      },
      
      '& .item-icon': {
        color: 'primary',
      },
    },
  },
  
  variants: {
    // Visual variants
    variant: {
      standard: {},
      
      cosmic: {
        _hover: {
          backgroundColor: 'color-mix(in srgb, var(--color-hover) 80%, var(--color-primary))',
          color: 'primary',
          boxShadow: 'inset 0 0 8px var(--color-glow)',
          
          '& .item-icon': {
            color: 'primary',
            filter: 'drop-shadow(0 0 3px var(--color-glow))',
          },
        },
        
        _focusVisible: {
          backgroundColor: 'color-mix(in srgb, var(--color-hover) 80%, var(--color-primary))',
          boxShadow: 'inset 0 0 8px var(--color-glow)',
        },
        
        '&[data-selected]': {
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
          boxShadow: 'inset 0 0 8px var(--color-glow)',
          
          _before: {
            boxShadow: '0 0 5px var(--color-glow)',
          },
          
          '& .item-icon': {
            filter: 'drop-shadow(0 0 3px var(--color-glow))',
          },
        },
      },
    },
    
    // Is this a compact item?
    compact: {
      true: {
        padding: '0.35rem 0.75rem',
        gap: '0.25rem',
        
        '& .item-description': {
          marginTop: '0.1rem',
        },
      },
    },
    
    // Is this item destructive?
    destructive: {
      true: {
        color: 'red.500',
        
        '& .item-icon': {
          color: 'red.500',
        },
        
        _hover: {
          backgroundColor: 'color-mix(in srgb, var(--color-hover) 80%, red)',
          color: 'red.500',
          
          '& .item-icon': {
            color: 'red.500',
          },
        },
        
        _focusVisible: {
          backgroundColor: 'color-mix(in srgb, var(--color-hover) 80%, red)',
          color: 'red.500',
          
          '& .item-icon': {
            color: 'red.500',
          },
        },
        
        '&[data-selected]': {
          backgroundColor: 'color-mix(in srgb, red 10%, transparent)',
          color: 'red.500',
          
          _before: {
            backgroundColor: 'red.500',
          },
          
          '& .item-icon': {
            color: 'red.500',
          },
        },
      },
    },
  },
  
  // Default variants
  defaultVariants: {
    variant: 'standard',
    compact: false,
    destructive: false,
  },
});

// Dropdown separator
export const cosmicDropdownSeparator = defineRecipe({
  className: 'cosmicDropdownSeparator',
  description: 'A separator for dropdown items',
  base: {
    height: '1px',
    backgroundColor: 'border',
    margin: '0.5rem 0',
    opacity: 0.7,
  },
});

// Dropdown group label
export const cosmicDropdownLabel = defineRecipe({
  className: 'cosmicDropdownLabel',
  description: 'A label for dropdown item groups',
  base: {
    padding: '0.5rem 1rem',
    fontSize: '0.75em',
    fontFamily: 'heading',
    fontWeight: 'medium',
    letterSpacing: '0.05em',
    color: 'textMuted',
    textTransform: 'uppercase',
    userSelect: 'none',
  },
  
  variants: {
    variant: {
      standard: {},
      
      cosmic: {
        color: 'primary',
        borderBottom: '1px solid',
        borderColor: 'color-mix(in srgb, var(--color-border) 70%, var(--color-primary))',
        backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 97%, var(--color-primary))',
        textShadow: '0 0 5px var(--color-glow)',
      },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
  },
});

/**
 * Bulk export of all cosmic dropdown components
 */
export const cosmicDropdown = {
  trigger: cosmicDropdownTrigger,
  content: cosmicDropdownContent,
  item: cosmicDropdownItem,
  separator: cosmicDropdownSeparator,
  label: cosmicDropdownLabel
};

/**
 * USAGE EXAMPLE (in a React component):
 * =====================================
 * 
 * // First, import the necessary components
 * import { 
 *   cosmicDropdownTrigger, 
 *   cosmicDropdownContent, 
 *   cosmicDropdownItem,
 *   cosmicDropdownSeparator,
 *   cosmicDropdownLabel
 * } from './panda.config/recipes/cosmicDropdown';
 * import { useState, useRef, useEffect } from 'react';
 * 
 * // Define props interface for the Dropdown component
 * interface DropdownProps {
 *   trigger: React.ReactNode;           // Content for the trigger button
 *   triggerVariant?: 'standard' | 'minimal' | 'outline' | 'cosmic';
 *   contentVariant?: 'standard' | 'minimal' | 'outline' | 'cosmic';
 *   size?: 'sm' | 'md' | 'lg';
 *   position?: 'bottomStart' | 'bottomEnd' | 'bottomCenter' | 'topStart' | 'topEnd' | 'topCenter';
 *   width?: 'auto' | 'trigger' | 'fixed';
 *   disabled?: boolean;
 *   children: React.ReactNode;
 * }
 * 
 * function CosmicDropdown({
 *   trigger,
 *   triggerVariant = 'standard',
 *   contentVariant = 'standard',
 *   size = 'md',
 *   position = 'bottomStart',
 *   width = 'auto',
 *   disabled = false,
 *   children
 * }: DropdownProps) {
 *   const [isOpen, setIsOpen] = useState(false);
 *   const dropdownRef = useRef<HTMLDivElement>(null);
 *   
 *   // Get styles from recipes
 *   const triggerStyles = cosmicDropdownTrigger({ 
 *     variant: triggerVariant,
 *     size,
 *     isDisabled: disabled
 *   });
 *   
 *   const contentStyles = cosmicDropdownContent({ 
 *     variant: contentVariant,
 *     size,
 *     position,
 *     width
 *   });
 *   
 *   // Close dropdown when clicking outside
 *   useEffect(() => {
 *     const handleClickOutside = (event: MouseEvent) => {
 *       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
 *         setIsOpen(false);
 *       }
 *     };
 *     
 *     if (isOpen) {
 *       document.addEventListener('mousedown', handleClickOutside);
 *     }
 *     
 *     return () => {
 *       document.removeEventListener('mousedown', handleClickOutside);
 *     };
 *   }, [isOpen]);
 *   
 *   // Toggle dropdown
 *   const toggleDropdown = () => {
 *     if (!disabled) {
 *       setIsOpen(!isOpen);
 *     }
 *   };
 *   
 *   return (
 *     <div ref={dropdownRef} style={{ position: 'relative' }}>
 *       <button 
 *         className={triggerStyles}
 *         onClick={toggleDropdown}
 *         aria-haspopup="true"
 *         aria-expanded={isOpen}
 *         data-state={isOpen ? 'open' : 'closed'}
 *         data-variant={triggerVariant}
 *         disabled={disabled}
 *       >
 *         {trigger}
 *         <span className="dropdown-arrow">
 *           <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
 *             <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
 *           </svg>
 *         </span>
 *       </button>
 *       
 *       <div 
 *         className={contentStyles}
 *         data-state={isOpen ? 'open' : 'closed'}
 *         role="menu"
 *       >
 *         {children}
 *       </div>
 *     </div>
 *   );
 * }
 * 
 * // Example dropdown item component
 * interface DropdownItemProps {
 *   label: string;
 *   icon?: React.ReactNode;
 *   description?: string;
 *   suffix?: React.ReactNode;
 *   isSelected?: boolean;
 *   isDisabled?: boolean;
 *   variant?: 'standard' | 'cosmic';
 *   destructive?: boolean;
 *   compact?: boolean;
 *   onClick?: () => void;
 * }
 * 
 * function DropdownItem({ 
 *   label, 
 *   icon, 
 *   description, 
 *   suffix,
 *   isSelected,
 *   isDisabled,
 *   variant = 'standard',
 *   destructive = false,
 *   compact = false,
 *   onClick
 * }: DropdownItemProps) {
 *   const itemStyles = cosmicDropdownItem({ 
 *     variant,
 *     destructive,
 *     compact
 *   });
 *   
 *   return (
 *     <button
 *       className={itemStyles}
 *       onClick={onClick}
 *       role="menuitem"
 *       data-selected={isSelected ? '' : undefined}
 *       data-disabled={isDisabled ? '' : undefined}
 *       tabIndex={isDisabled ? -1 : 0}
 *     >
 *       <div className="item-content">
 *         {icon && <span className="item-icon">{icon}</span>}
 *         <div className="item-text">
 *           {label}
 *           {description && (
 *             <div className="item-description">{description}</div>
 *           )}
 *         </div>
 *         {suffix && <span className="item-suffix">{suffix}</span>}
 *       </div>
 *     </button>
 *   );
 * }
 * 
 * // Example usage
 * function UserDropdownMenu() {
 *   return (
 *     <CosmicDropdown 
 *       trigger="Account Settings"
 *       triggerVariant="cosmic"
 *       contentVariant="cosmic"
 *       position="bottomEnd"
 *     >
 *       <div className={cosmicDropdownLabel({ variant: "cosmic" })}>
 *         User Options
 *       </div>
 *       
 *       <DropdownItem 
 *         label="Profile Settings" 
 *         icon={<UserIcon />} 
 *         variant="cosmic"
 *         onClick={() => navigate('/profile')}
 *       />
 *       <DropdownItem 
 *         label="Notification Preferences" 
 *         icon={<BellIcon />} 
 *         variant="cosmic"
 *       />
 *       
 *       <div className={cosmicDropdownSeparator()}></div>
 *       
 *       <DropdownItem 
 *         label="Logout" 
 *         icon={<LogoutIcon />} 
 *         variant="cosmic"
 *         destructive={true}
 *         onClick={handleLogout}
 *       />
 *     </CosmicDropdown>
 *   );
 * }
 */

// Add these keyframe animations to your global CSS or Panda CSS config:
/* 
@keyframes cosmicDropdownShimmer {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 200% 200%;
  }
}
*/