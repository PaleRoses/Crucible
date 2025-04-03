// src/styled-system/recipes/cosmicNavItem.ts

import { cva } from '../../styled-system/css';

/**
 * Cosmic Navigation Item - A versatile navigation item component with multiple states
 * 
 * Features:
 * - Support for desktop and mobile navigation layouts
 * - Active, hover, and focus states with elegant transitions
 * - Submenu indication with animated arrow
 * - Icon support with consistent styling
 * - Keyboard accessibility styling
 * - Compatible with both top navigation and sidebar navigation
 */

export const cosmicNavItem = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: 'heading',
    fontSize: 'desktopNavItem',
    fontWeight: 'normal',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    position: 'relative',
    border: 'none',
    padding: '0.5rem 0.75rem',
    background: 'transparent',
    color: 'text',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
    borderRadius: 'md',
    whiteSpace: 'nowrap',
    justifyContent: 'space-between',
    width: 'auto',
    
    // Hover effect
    _hover: {
      color: 'primary',
      backgroundColor: 'color-mix(in srgb, var(--color-hover) 50%, transparent)',
    },
    
    // Focus visible state for keyboard navigation
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
    
    // Active/pressed state
    _active: {
      transform: 'scale(0.98)',
    },
    
    // Content container (icon + label)
    '& .nav-item-content': {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    
    // Icon styling
    '& .nav-item-icon': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'color 0.3s ease',
    },
    
    // Arrow indicator for items with submenu
    '& .nav-item-arrow': {
      display: 'flex',
      alignItems: 'center',
      transition: 'transform 0.3s ease, color 0.3s ease',
    },
  },
  
  variants: {
    // Is the item currently active/selected?
    isActive: {
      true: {
        color: 'primary',
        
        '& .nav-item-arrow': {
          color: 'primary',
        },
        
        _hover: {
          color: 'primary',
        },
      },
    },
    
    // Is submenu expanded/open for this item?
    isExpanded: {
      true: {
        color: 'primary',
        
        '& .nav-item-arrow': {
          transform: 'rotate(180deg)',
          color: 'primary',
        },
      },
    },
    
    // Visual variants
    variant: {
      // Standard navigation item
      standard: {},
      
      // Nav item with bottom border indicator
      underline: {
        borderBottom: '2px solid transparent',
        borderRadius: '0',
        padding: '0.5rem 0',
        marginRight: '1rem',
        
        _hover: {
          backgroundColor: 'transparent',
          borderBottom: '2px solid',
          borderColor: 'primary',
        },
        
        '&[data-active="true"]': {
          borderBottom: '2px solid',
          borderColor: 'primary',
        },
      },
      
      // Pill-style navigation item
      pill: {
        borderRadius: 'full',
        padding: '0.5rem 1rem',
        
        _hover: {
          backgroundColor: 'color-mix(in srgb, var(--color-hover) 80%, var(--color-primary))',
        },
        
        '&[data-active="true"]': {
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
          color: 'primary',
        },
      },
      
      // Cosmic styled navigation item with glow effects
      cosmic: {
        borderRadius: 'md',
        transition: 'all 0.3s ease',
        
        _hover: {
          backgroundColor: 'color-mix(in srgb, var(--color-hover) 70%, var(--color-primary))',
          boxShadow: '0 0 8px var(--color-glow)',
          transform: 'translateY(-1px)',
        },
        
        _active: {
          transform: 'translateY(1px) scale(0.98)',
        },
        
        '&[data-active="true"]': {
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
          boxShadow: '0 0 12px var(--color-glow)',
          
          _before: {
            content: '""',
            position: 'absolute',
            left: '0',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '3px',
            height: '70%',
            backgroundColor: 'primary',
            borderRadius: '0 2px 2px 0',
            boxShadow: '0 0 8px var(--color-glow)',
          },
        },
      },
      
      // Mobile navigation item styling
      mobile: {
        width: '100%',
        padding: '0.75rem 1rem',
        textAlign: 'left',
        justifyContent: 'space-between',
        fontSize: 'mobileNavItem',
        borderTop: '1px solid',
        borderBottom: '1px solid',
        borderColor: 'border',
      },
    },
    
    // Size variants
    size: {
      sm: {
        fontSize: 'sm',
        padding: '0.375rem 0.75rem',
        gap: '0.375rem',
        
        '& .nav-item-icon': {
          fontSize: '0.875rem',
        },
      },
      
      md: {
        // Base styles already define medium size
      },
      
      lg: {
        fontSize: 'lg',
        padding: '0.625rem 1rem',
        gap: '0.625rem',
        
        '& .nav-item-icon': {
          fontSize: '1.25rem',
        },
      },
    },
    
    // Display direction
    direction: {
      horizontal: {
        // Default is horizontal
      },
      
      vertical: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '100%',
        
        '& .nav-item-content': {
          width: '100%',
        },
        
        '& .nav-item-arrow': {
          position: 'absolute',
          right: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
        },
        
        '&[data-expanded="true"] .nav-item-arrow': {
          transform: 'translateY(-50%) rotate(180deg)',
        },
      },
    },
  },
  
  // Compound variants for special combinations
  compoundVariants: [
    // Specific styling for vertical cosmic variant
    {
      direction: 'vertical',
      variant: 'cosmic',
      css: {
        borderRadius: '0',
        _hover: {
          borderRadius: '0',
          transform: 'none',
        },
        _active: {
          transform: 'none',
        },
        '&[data-active="true"]': {
          _before: {
            height: '70%',
            width: '4px',
          },
        },
      },
    },
    // Mobile with active state
    {
      variant: 'mobile',
      isActive: true,
      css: {
        backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
      },
    },
  ],
  
  // Default variants
  defaultVariants: {
    variant: 'standard',
    size: 'md',
    direction: 'horizontal',
    isActive: false,
    isExpanded: false,
  },
});

/**
 * Usage Example (in a React component):
 * 
 * import { cosmicNavItem } from '../styled-system/recipes/cosmicNavItem';
 * import { css } from '../styled-system/css';
 * import Link from 'next/link';
 * 
 * interface NavItemProps {
 *   label: string;
 *   href: string;
 *   icon?: React.ReactNode;
 *   isActive?: boolean;
 *   hasSubmenu?: boolean;
 *   isSubmenuOpen?: boolean;
 *   onNavItemClick?: () => void;
 *   variant?: 'standard' | 'underline' | 'pill' | 'cosmic' | 'mobile';
 *   size?: 'sm' | 'md' | 'lg';
 *   direction?: 'horizontal' | 'vertical';
 * }
 * 
 * function NavItem({
 *   label,
 *   href,
 *   icon,
 *   isActive = false,
 *   hasSubmenu = false,
 *   isSubmenuOpen = false,
 *   onNavItemClick,
 *   variant = 'standard',
 *   size = 'md',
 *   direction = 'horizontal'
 * }: NavItemProps) {
 *   
 *   // Get styles from recipe
 *   const navItemStyles = cosmicNavItem({
 *     variant,
 *     size,
 *     direction,
 *     isActive,
 *     isExpanded: isSubmenuOpen
 *   });
 *   
 *   // If has submenu, use button, otherwise use Link
 *   if (hasSubmenu) {
 *     return (
 *       <button
 *         className={navItemStyles}
 *         onClick={onNavItemClick}
 *         data-active={isActive}
 *         data-expanded={isSubmenuOpen}
 *         aria-expanded={isSubmenuOpen}
 *         aria-haspopup="true"
 *       >
 *         <div className="nav-item-content">
 *           {icon && <span className="nav-item-icon">{icon}</span>}
 *           <span className="nav-item-label">{label}</span>
 *         </div>
 *         <span className="nav-item-arrow">
 *           <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
 *             <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
 *           </svg>
 *         </span>
 *       </button>
 *     );
 *   }
 *   
 *   // For items without submenu, use Link
 *   return (
 *     <Link href={href} passHref legacyBehavior>
 *       <a
 *         className={navItemStyles}
 *         data-active={isActive}
 *         onClick={onNavItemClick}
 *       >
 *         <div className="nav-item-content">
 *           {icon && <span className="nav-item-icon">{icon}</span>}
 *           <span className="nav-item-label">{label}</span>
 *         </div>
 *       </a>
 *     </Link>
 *   );
 * }
 */