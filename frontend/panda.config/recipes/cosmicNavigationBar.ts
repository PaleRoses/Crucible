// panda.config/recipes/cosmicNavigationBar.ts

import { defineRecipe } from '@pandacss/dev';

/**
 * ====================================================================================
 * COSMIC NAVIGATION BAR - An elegant responsive navigation bar with cosmic styling
 * ====================================================================================
 * 
 * IMPORT INTO YOUR PANDA CONFIG:
 * 
 * import { 
 *   cosmicNavigationContainer,
 *   cosmicNavigationContent,
 *   cosmicNavigationLogo,
 *   cosmicNavigationItemsContainer,
 *   cosmicNavigationItem,
 *   cosmicNavigationSubmenu,
 *   cosmicNavigationSubmenuItem,
 *   cosmicMobileNavigationMenu,
 *   cosmicMobileNavigationContainer,
 *   cosmicMobileNavigationHeader,
 *   cosmicMobileNavigationItem,
 *   cosmicMobileNavigationSubmenu,
 *   cosmicNavigationBar
 * } from './panda.config/recipes/cosmicNavigationBar';
 * 
 * Then add to your config:
 * 
 * export default defineConfig({
 *   // ...other config
 *   theme: {
 *     extend: {
 *       recipes: {
 *         // Method 1: Add individual components
 *         NavigationContainer: cosmicNavigationContainer,
 *         NavigationContent: cosmicNavigationContent,
 *         NavigationLogo: cosmicNavigationLogo,
 *         NavigationItemsContainer: cosmicNavigationItemsContainer,
 *         NavigationItem: cosmicNavigationItem,
 *         NavigationSubmenu: cosmicNavigationSubmenu,
 *         NavigationSubmenuItem: cosmicNavigationSubmenuItem,
 *         MobileNavigationMenu: cosmicMobileNavigationMenu,
 *         MobileNavigationContainer: cosmicMobileNavigationContainer,
 *         MobileNavigationHeader: cosmicMobileNavigationHeader,
 *         MobileNavigationItem: cosmicMobileNavigationItem,
 *         MobileNavigationSubmenu: cosmicMobileNavigationSubmenu,
 *         
 *         // Method 2: Or use the combined object
 *         // This adds all components with their original naming
 *         ...cosmicNavigationBar
 *       }
 *     }
 *   }
 * })
 * 
 * Features:
 * - Sophisticated responsive design that adapts to different screen sizes
 * - Smooth transitions and animations for all state changes
 * - Support for nested navigation with submenu functionality
 * - Hide-on-scroll behavior for better mobile experience
 * - Cosmic styling with glow effects and subtle animations
 * - Mobile menu with elegant transitions
 * - Proper accessibility attributes and keyboard navigation
 * - Consistent styling with other cosmic components
 */

// --- Define Keyframes ---
const keyframes = {
  navItemHover: {
    '0%': { transform: 'scale(1)' },
    '100%': { transform: 'scale(1.05)' }
  },
  arrowRotateOpen: {
    '0%': { transform: 'rotate(0)' },
    '50%': { transform: 'rotate(180deg) translateY(2px)' },
    '100%': { transform: 'rotate(180deg) translateY(0)' }
  },
  submenuFadeIn: {
    '0%': { opacity: 0, transform: 'scale(0.99)' },
    '100%': { opacity: 1, transform: 'scale(1)' }
  },
  submenuSlideRight: {
    '0%': { opacity: 0, transform: 'translateX(40px)' },
    '100%': { opacity: 1, transform: 'translateX(0)' }
  },
  submenuSlideLeft: {
    '0%': { opacity: 0, transform: 'translateX(-40px)' },
    '100%': { opacity: 1, transform: 'translateX(0)' }
  },
  mobileMenuOpen: {
    '0%': { opacity: 0, transform: 'translateY(-100%)' },
    '100%': { opacity: 1, transform: 'translateY(0)' }
  },
  mobileMenuClose: {
    '0%': { opacity: 1, transform: 'translateY(0)' },
    '100%': { opacity: 0, transform: 'translateY(-100%)' }
  }
};

// --- Main Navigation Container ---
export const cosmicNavigationContainer = defineRecipe({
  className: 'cosmicNavigationContainer',
  description: 'Main container for the cosmic navigation bar',
  base: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 'header',
    transition: 'transform 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease, border-color 0.3s ease',
    borderBottom: '1px solid',
    borderColor: 'border',
    
    // When visible
    '&[data-visible="true"]': {
      transform: 'translateY(0)',
      opacity: 1,
    },
    
    // When hidden (scroll behavior)
    '&[data-visible="false"]': {
      transform: 'translateY(-100%)',
      opacity: 0,
      boxShadow: 'none',
    },
  },
  
  variants: {
    // Visual style variants
    variant: {
      standard: {
        backgroundColor: 'backgroundAlt',
        borderColor: 'border',
      },
      
      elevated: {
        backgroundColor: 'backgroundAlt',
        borderColor: 'border',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      },
      
      minimal: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      },
      
      cosmic: {
        backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 95%, var(--color-primary))',
        borderColor: 'color-mix(in srgb, var(--color-border) 70%, var(--color-primary))',
        boxShadow: '0 0 15px var(--color-glow)',
        
        // Star effect background
        _after: {
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
          zIndex: -1,
          pointerEvents: 'none',
        },
      },
    },
    
    // Border control (independent of variant)
    border: {
      visible: {}, // handled by variant styles
      hidden: {
        borderBottom: 'none !important',
      },
    },
    
    // Hide on scroll behavior
    hideOnScroll: {
      true: {},
      false: {
        '&[data-visible="false"]': {
          transform: 'translateY(0)',
        },
      },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
    border: 'visible',
    hideOnScroll: true,
  },
});

// --- Navigation Content Area ---
export const cosmicNavigationContent = defineRecipe({
  className: 'cosmicNavigationContent',
  description: 'Content area of the navigation bar',
  base: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1.5rem',
    margin: '0 auto',
    position: 'relative',
  },
  
  variants: {
    // Maximum width constraint
    maxWidth: {
      none: {},
      sm: { maxWidth: '640px' },
      md: { maxWidth: '768px' },
      lg: { maxWidth: '1024px' },
      xl: { maxWidth: '1280px' },
      '2xl': { maxWidth: '1536px' },
      full: { maxWidth: '100%' },
    },
    
    // Vertical padding variants
    verticalPadding: {
      none: { py: '0' },
      xs: { py: '0.25rem' },
      sm: { py: '0.5rem' },
      md: { py: '0.75rem' },
      lg: { py: '1rem' },
    },
  },
  
  defaultVariants: {
    maxWidth: 'xl',
    verticalPadding: 'md',
  },
});

// --- Logo Styling ---
export const cosmicNavigationLogo = defineRecipe({
  className: 'cosmicNavigationLogo',
  description: 'Logo container and styling for the navigation bar',
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'primary',
    position: 'relative',
    transition: 'all 0.3s ease',
    zIndex: 1,
    
    // Link styling
    '& a': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'primary',
      padding: '8px',
      borderRadius: '50%',
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      outline: 'none',
    },
    
    // Hover effects
    '& a:hover, & a:focus-visible': {
      color: 'primary',
      transform: 'scale(1.1)',
    },
    
    // Tooltip styling (optional)
    '& .logo-tooltip': {
      position: 'absolute',
      bottom: '-35px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'none',
      zIndex: 10,
      pointerEvents: 'none',
      backgroundColor: 'backgroundAlt',
      backdropFilter: 'blur(5px)',
      WebkitBackdropFilter: 'blur(5px)',
      color: 'text',
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: 'xs',
      fontWeight: 'normal',
      letterSpacing: '0.05em',
      whiteSpace: 'nowrap',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
      border: '1px solid',
      borderColor: 'border',
      
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '-5px',
        left: '50%',
        transform: 'translateX(-50%) rotate(45deg)',
        width: '8px',
        height: '8px',
        backgroundColor: 'backgroundAlt',
        borderTop: '1px solid',
        borderLeft: '1px solid',
        borderColor: 'border',
      },
    },
    
    // Show tooltip on hover/focus
    '& a:hover .logo-tooltip, & a:focus-visible .logo-tooltip': {
      display: 'block',
    },
  },
  
  variants: {
    variant: {
      standard: {},
      
      cosmic: {
        '& a:hover, & a:focus-visible': {
          background: 'var(--color-glow)',
          boxShadow: '0 0 18px 8px var(--color-glow)',
        },
        
        '& a:active': {
          background: 'transparent',
          boxShadow: 'none',
          transform: 'scale(1)',
        },
      },
    },
    
    // Size variants
    size: {
      sm: { fontSize: 'md' },
      md: { fontSize: 'lg' },
      lg: { fontSize: 'xl' },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
    size: 'md',
  },
});

// --- Navigation Items Container ---
export const cosmicNavigationItemsContainer = defineRecipe({
  className: 'cosmicNavigationItemsContainer',
  description: 'Container for navigation items',
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    opacity: 1,
    
    // Mobile styling - hidden by default on small screens
    '@media (max-width: 768px)': {
      display: 'none',
    },
  },
  
  variants: {
    // Gap between items
    itemGap: {
      xs: { gap: '0.5rem' },
      sm: { gap: '0.75rem' },
      md: { gap: '1rem' },
      lg: { gap: '1.5rem' },
      xl: { gap: '2rem' },
    },
    
    // Alignment variants
    align: {
      start: { justifyContent: 'flex-start' },
      center: { justifyContent: 'center' },
      end: { justifyContent: 'flex-end' },
    },
  },
  
  defaultVariants: {
    itemGap: 'md',
    align: 'end',
  },
});

// --- Navigation Item ---
export const cosmicNavigationItem = defineRecipe({
  className: 'cosmicNavigationItem',
  description: 'Individual navigation item with support for submenus',
  base: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'heading',
    fontSize: 'desktopNavItem',
    fontWeight: 'normal',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
    padding: '0.5rem 0.75rem',
    borderRadius: 'md',
    color: 'text',
    backgroundColor: 'transparent',
    border: 'none',
    whiteSpace: 'nowrap',
    
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
      fontSize: 'xl',
    },
    
    // Label styling
    '& .nav-item-label': {
      transition: 'all 0.1s cubic-bezier(0.4, 0, 1, 1)',
    },
    
    // Arrow indicator for items with submenu
    '& .nav-item-arrow': {
      display: 'flex',
      alignItems: 'center',
      marginLeft: '0.5rem',
      marginTop: '2px',
      transition: 'transform 0.3s ease, color 0.3s ease',
    },
    
    // Hover state
    _hover: {
      color: 'primary',
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
    
    // Active/current route state
    '&[data-active="true"]': {
      color: 'primary',
    },
    
    // When submenu is active
    '&[data-expanded="true"]': {
      color: 'primary',
      
      '& .nav-item-arrow': {
        transform: 'rotate(180deg)',
        color: 'primary',
      },
    },
  },
  
  variants: {
    // Visual variants
    variant: {
      standard: {},
      
      underline: {
        borderRadius: 0,
        padding: '0.5rem 0',
        borderBottom: '2px solid transparent',
        
        '&[data-active="true"]': {
          borderColor: 'primary',
        },
        
        _hover: {
          borderColor: 'primary',
        },
      },
      
      minimal: {
        padding: '0.5rem',
      },
      
      cosmic: {
        _hover: {
          backgroundColor: 'color-mix(in srgb, var(--color-hover) 80%, var(--color-primary))',
          boxShadow: '0 0 8px var(--color-glow)',
          transform: 'translateY(-1px)',
        },
        
        _active: {
          transform: 'translateY(1px) scale(0.98)',
        },
        
        '&[data-active="true"]': {
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
          boxShadow: '0 0 12px var(--color-glow)',
        },
        
        '&[data-expanded="true"]': {
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
          boxShadow: '0 0 12px var(--color-glow)',
        },
      },
    },
    
    // Size variants
    size: {
      sm: {
        fontSize: 'sm',
        padding: '0.375rem 0.625rem',
        '& .nav-item-icon': {
          fontSize: 'lg',
        },
      },
      
      md: {
        // Base styles already define medium
      },
      
      lg: {
        fontSize: 'lg',
        padding: '0.625rem 1rem',
        '& .nav-item-icon': {
          fontSize: '2xl',
        },
      },
    },
    
    // With or without icon
    hasIcon: {
      true: {},
      false: {
        '& .nav-item-icon': {
          display: 'none',
        },
      },
    },
    
    // With or without submenu
    hasSubmenu: {
      true: {},
      false: {
        '& .nav-item-arrow': {
          display: 'none',
        },
      },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
    size: 'md',
    hasIcon: false,
    hasSubmenu: false,
  },
});

// --- Navigation Submenu ---
export const cosmicNavigationSubmenu = defineRecipe({
  className: 'cosmicNavigationSubmenu',
  description: 'Submenu panel that appears when a navigation item with children is activated',
  base: {
    position: 'absolute',
    top: '100%',
    left: 0,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    zIndex: 9,
    paddingTop: '0.5rem',
    
    // Hidden by default
    opacity: 0,
    visibility: 'hidden',
    pointerEvents: 'none',
    transform: 'translateY(-10px)',
    transition: 'opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease',
    
    // When active
    '&[data-state="open"]': {
      opacity: 1,
      visibility: 'visible',
      pointerEvents: 'auto',
      transform: 'translateY(0)',
    },
    
    // Submenu container
    '& .submenu-container': {
      background: 'backgroundAlt',
      borderRadius: 'md',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
      border: '1px solid',
      borderColor: 'border',
      transformOrigin: 'top center',
      minWidth: '200px',
      width: 'auto',
      margin: '0 auto',
    },
    
    // Grid layout
    '& .submenu-grid': {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      width: '100%',
    },
    
    // Header section
    '& .submenu-header': {
      display: 'flex',
      flexDirection: 'column',
      padding: '1.75rem',
    },
    
    // Header title
    '& .submenu-title': {
      fontFamily: 'heading',
      color: 'primary',
      fontSize: 'xl',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      marginBottom: '0.5rem',
    },
    
    // Header description
    '& .submenu-description': {
      fontSize: 'sm',
      color: 'textMuted',
      opacity: 0.8,
      lineHeight: 1.4,
    },
  },
  
  variants: {
    // Visual variants
    variant: {
      standard: {},
      
      minimal: {
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        '& .submenu-container': {
          border: 'none',
        },
      },
      
      cosmic: {
        '& .submenu-container': {
          backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 95%, var(--color-primary))',
          borderColor: 'color-mix(in srgb, var(--color-border) 70%, var(--color-primary))',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25), 0 0 15px var(--color-glow)',
          borderLeft: '3px solid',
          borderLeftColor: 'primary',
          
          // Star effect background
          _after: {
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
        
        '& .submenu-title': {
          textShadow: '0 0 5px var(--color-glow)',
        },
      },
    },
    
    // Position variants
    position: {
      center: {
        left: '50%',
        transform: 'translateX(-50%) translateY(-10px)',
        '&[data-state="open"]': {
          transform: 'translateX(-50%) translateY(0)',
        },
      },
      
      left: {
        left: '0',
        transform: 'translateY(-10px)',
        '&[data-state="open"]': {
          transform: 'translateY(0)',
        },
      },
      
      right: {
        left: 'auto',
        right: '0',
        transform: 'translateY(-10px)',
        '&[data-state="open"]': {
          transform: 'translateY(0)',
        },
      },
    },
    
    // Width variants
    width: {
      auto: {
        '& .submenu-container': {
          width: 'auto',
          minWidth: '200px',
        },
      },
      
      full: {
        '& .submenu-container': {
          width: '100%',
          maxWidth: '90vw',
        },
      },
    },
    
    // Header visibility
    hasHeader: {
      true: {},
      false: {
        '& .submenu-header': {
          display: 'none',
        },
      },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
    position: 'center',
    width: 'auto',
    hasHeader: false,
  },
});

// --- Navigation Submenu Item ---
export const cosmicNavigationSubmenuItem = defineRecipe({
  className: 'cosmicNavigationSubmenuItem',
  description: 'Individual item within the navigation submenu',
  base: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: '1rem',
    color: 'text',
    textAlign: 'left',
    borderRadius: 'sm',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    zIndex: 1,
    borderLeft: '1px solid',
    borderColor: 'primary',
    backgroundColor: 'transparent',
    width: '100%',
    
    // Hover effects
    _hover: {
      backgroundColor: 'hover',
      color: 'primary',
    },
    
    // Focus visible state
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '-2px',
    },
    
    // Active/pressed state
    _active: {
      backgroundColor: 'active',
    },
    
    // Content container
    '& .submenu-item-content': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      width: '100%',
    },
    
    // Icon container
    '& .submenu-item-icon': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'primary',
      marginBottom: '1rem',
      width: '100%',
      maxHeight: '128px',
      flexShrink: 0,
      transition: 'color 0.2s ease',
    },
    
    // Label styling
    '& .submenu-item-label': {
      fontFamily: 'heading',
      fontSize: 'sm',
      fontWeight: 'normal',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      marginBottom: '0.25rem',
      transition: 'color 0.2s ease',
    },
    
    // Description styling
    '& .submenu-item-description': {
      fontSize: 'xs',
      color: 'textMuted',
      lineHeight: 1.4,
      maxWidth: '200px',
    },
  },
  
  variants: {
    // Visual variants
    variant: {
      standard: {},
      
      minimal: {
        borderLeft: 'none',
        padding: '0.75rem 1rem',
      },
      
      cosmic: {
        borderLeft: '2px solid',
        borderColor: 'primary',
        
        _hover: {
          backgroundColor: 'color-mix(in srgb, var(--color-hover) 70%, var(--color-primary))',
          boxShadow: '0 0 10px var(--color-glow)',
          
          '& .submenu-item-label': {
            color: 'primary',
            textShadow: '0 0 5px var(--color-glow)',
          },
          
          '& .submenu-item-icon': {
            filter: 'drop-shadow(0 0 3px var(--color-glow))',
          },
        },
      },
    },
    
    // With/without description
    hasDescription: {
      true: {
        '& .submenu-item-label': {
          marginBottom: '0.5rem',
        },
      },
      false: {
        '& .submenu-item-description': {
          display: 'none',
        },
      },
    },
    
    // With/without icon
    hasIcon: {
      true: {},
      false: {
        '& .submenu-item-icon': {
          display: 'none',
        },
      },
    },
    
    // Size variants
    size: {
      sm: {
        padding: '0.75rem',
        '& .submenu-item-label': {
          fontSize: 'xs',
        },
        '& .submenu-item-description': {
          fontSize: '2xs',
        },
      },
      
      md: {
        // Base styles already define medium
      },
      
      lg: {
        padding: '1.5rem',
        '& .submenu-item-label': {
          fontSize: 'md',
        },
        '& .submenu-item-description': {
          fontSize: 'sm',
          maxWidth: '250px',
        },
      },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
    hasDescription: false,
    hasIcon: true,
    size: 'md',
  },
});

// --- Mobile Menu Button ---
export const cosmicMobileMenuButton = defineRecipe({
  className: 'cosmicMobileMenuButton',
  description: 'Hamburger button to toggle the mobile navigation menu',
  base: {
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    width: '45px',
    height: '45px',
    background: 'transparent',
    border: 'none',
    borderRadius: 'md',
    padding: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: 'text',
    zIndex: 201,
    
    // Show on mobile
    '@media (max-width: 768px)': {
      display: 'flex',
    },
    
    // Focus state
    _focus: {
      outline: 'none',
    },
    
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
    
    // When menu is open
    '&[data-open="true"]': {
      color: 'primary',
    },
  },
  
  variants: {
    // Visual variants
    variant: {
      standard: {},
      
      cosmic: {
        _hover: {
          color: 'primary',
        },
        
        '&[data-open="true"]': {
          color: 'primary',
        },
      },
    },
    
    // Size variants
    size: {
      sm: {
        width: '36px',
        height: '36px',
      },
      
      md: {
        // Base styles already define medium
      },
      
      lg: {
        width: '52px',
        height: '52px',
      },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
    size: 'md',
  },
});

// --- Mobile Navigation Container ---
export const cosmicMobileNavigationContainer = defineRecipe({
  className: 'cosmicMobileNavigationContainer',
  description: 'Container for the mobile navigation menu',
  base: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'backgroundAlt',
    zIndex: 200,
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.2)',
    
    // Hidden by default
    opacity: 0,
    visibility: 'hidden',
    transform: 'translateY(-100%)',
    transition: 'opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease',
    
    // When visible
    '&[data-state="open"]': {
      opacity: 1,
      visibility: 'visible',
      transform: 'translateY(0)',
    },
  },
  
  variants: {
    // Visual variants
    variant: {
      standard: {},
      
      minimal: {
        backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 90%, transparent)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      },
      
      cosmic: {
        backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 95%, var(--color-primary))',
        boxShadow: '0 0 20px var(--color-glow)',
        
        // Star effect background
        _after: {
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
    
    // Animation variants
    animation: {
      slide: {},
      
      fade: {
        transform: 'none',
        opacity: 0,
        
        '&[data-state="open"]': {
          transform: 'none',
          opacity: 1,
        },
      },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
    animation: 'slide',
  },
});

// --- Mobile Navigation Header ---
export const cosmicMobileNavigationHeader = defineRecipe({
  className: 'cosmicMobileNavigationHeader',
  description: 'Header section for the mobile navigation menu',
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    width: '100%',
    padding: '1rem',
    borderBottom: '1px solid',
    borderColor: 'border',
    position: 'sticky',
    top: 0,
    backgroundColor: 'backgroundAlt',
    zIndex: 1,
    
    // Logo container
    '& .mobile-logo-container': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '0.75rem',
    },
    
    // Title container
    '& .mobile-title-container': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '0.75rem',
    },
    
    // Title text
    '& .mobile-title-text': {
      fontFamily: 'heading',
      color: 'primary',
      fontSize: 'xl',
      fontWeight: '300',
      textAlign: 'center',
      margin: 0,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    },
  },
  
  variants: {
    // Visual variants
    variant: {
      standard: {},
      
      cosmic: {
        borderColor: 'color-mix(in srgb, var(--color-border) 70%, var(--color-primary))',
        
        '& .mobile-title-text': {
          textShadow: '0 0 5px var(--color-glow)',
        },
      },
    },
    
    // With/without logo
    hasLogo: {
      true: {},
      false: {
        '& .mobile-logo-container': {
          display: 'none',
        },
      },
    },
    
    // With/without title
    hasTitle: {
      true: {},
      false: {
        '& .mobile-title-container': {
          display: 'none',
        },
      },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
    hasLogo: true,
    hasTitle: true,
  },
});

// --- Mobile Navigation Item ---
export const cosmicMobileNavigationItem = defineRecipe({
  className: 'cosmicMobileNavigationItem',
  description: 'Individual navigation item for mobile menu',
  base: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    fontSize: 'lg',
    fontFamily: 'heading',
    fontWeight: 'normal',
    letterSpacing: '0.1em',
    color: 'text',
    backgroundColor: 'transparent',
    border: 'none',
    borderTop: '1px solid',
    borderBottom: '1px solid',
    borderColor: 'border',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'left',
    
    // Content container (icon + label)
    '& .mobile-item-content': {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    
    // Icon styling
    '& .mobile-item-icon': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'xl',
      color: 'textMuted',
      transition: 'color 0.3s ease',
    },
    
    // Label styling
    '& .mobile-item-label': {
      textTransform: 'uppercase',
    },
    
    // Arrow indicator for items with submenu
    '& .mobile-item-arrow': {
      display: 'flex',
      alignItems: 'center',
      transition: 'transform 0.3s ease',
    },
    
    // Hover state
    _hover: {
      backgroundColor: 'hover',
      color: 'primary',
      
      '& .mobile-item-icon': {
        color: 'primary',
      },
    },
    
    // Focus visible state
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '-2px',
    },
    
    // Active/current route state
    '&[data-active="true"]': {
      backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
      color: 'primary',
      
      '& .mobile-item-icon': {
        color: 'primary',
      },
    },
    
    // When submenu is expanded
    '&[data-expanded="true"]': {
      '& .mobile-item-arrow': {
        transform: 'rotate(180deg)',
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
          boxShadow: 'inset 0 0 8px var(--color-glow)',
        },
        
        '&[data-active="true"]': {
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
          boxShadow: 'inset 0 0 12px var(--color-glow)',
        },
      },
    },
    
    // Size variants
    size: {
      sm: {
        padding: '0.5rem 0.75rem',
        fontSize: 'base',
      },
      
      md: {
        // Base styles already define medium
      },
      
      lg: {
        padding: '1rem 1.25rem',
        fontSize: 'xl',
      },
    },
    
    // With/without icon
    hasIcon: {
      true: {},
      false: {
        '& .mobile-item-icon': {
          display: 'none',
        },
      },
    },
    
    // With/without submenu
    hasSubmenu: {
      true: {},
      false: {
        '& .mobile-item-arrow': {
          display: 'none',
        },
      },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
    size: 'md',
    hasIcon: false,
    hasSubmenu: false,
  },
});

// --- Mobile Navigation Submenu ---
export const cosmicMobileNavigationSubmenu = defineRecipe({
  className: 'cosmicMobileNavigationSubmenu',
  description: 'Submenu for mobile navigation items',
  base: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 98%, var(--color-border))',
    borderTop: '1px solid',
    borderBottom: '1px solid',
    borderColor: 'border',
    padding: '0.5rem 0 0.5rem 1.5rem',
    
    // Hidden by default
    maxHeight: '0',
    opacity: 0,
    visibility: 'hidden',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    
    // When expanded
    '&[data-state="open"]': {
      maxHeight: 'var(--submenu-height, 500px)',
      opacity: 1,
      visibility: 'visible',
    },
    
    // Submenu item
    '& .mobile-submenu-item': {
      display: 'flex',
      alignItems: 'center',
      padding: '0.5rem 1rem',
      fontSize: 'base',
      color: 'text',
      backgroundColor: 'transparent',
      border: 'none',
      borderBottom: '1px solid',
      borderColor: 'border',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      width: '100%',
      textAlign: 'left',
      
      // Hover state
      _hover: {
        color: 'primary',
        backgroundColor: 'hover',
      },
      
      // Active state
      '&[data-active="true"]': {
        color: 'primary',
        backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
      },
    },
    
    // Submenu item icon
    '& .mobile-submenu-item-icon': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'lg',
      marginRight: '0.5rem',
      color: 'primary',
      opacity: 0.8,
    },
    
    // Submenu item label
    '& .mobile-submenu-item-label': {
      fontSize: 'sm',
      fontFamily: 'heading',
      letterSpacing: '0.05em',
    },
  },
  
  variants: {
    // Visual variants
    variant: {
      standard: {},
      
      cosmic: {
        backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 97%, var(--color-primary))',
        borderColor: 'color-mix(in srgb, var(--color-border) 70%, var(--color-primary))',
        
        '& .mobile-submenu-item': {
          borderColor: 'color-mix(in srgb, var(--color-border) 70%, var(--color-primary))',
          
          _hover: {
            backgroundColor: 'color-mix(in srgb, var(--color-hover) 80%, var(--color-primary))',
            boxShadow: 'inset 0 0 8px var(--color-glow)',
          },
          
          '&[data-active="true"]': {
            backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
            boxShadow: 'inset 0 0 12px var(--color-glow)',
          },
        },
        
        '& .mobile-submenu-item-icon': {
          filter: 'drop-shadow(0 0 2px var(--color-glow))',
        },
      },
    },
    
    // Indentation level
    indentLevel: {
      1: {
        paddingLeft: '1.5rem',
      },
      2: {
        paddingLeft: '3rem',
      },
      3: {
        paddingLeft: '4.5rem',
      },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
    indentLevel: 1,
  },
});

/**
 * Bulk export of all cosmic navigation bar components
 */
export const cosmicNavigationBar = {
  container: cosmicNavigationContainer,
  content: cosmicNavigationContent,
  logo: cosmicNavigationLogo,
  itemsContainer: cosmicNavigationItemsContainer,
  item: cosmicNavigationItem,
  submenu: cosmicNavigationSubmenu,
  submenuItem: cosmicNavigationSubmenuItem,
  mobileMenuButton: cosmicMobileMenuButton,
  mobileContainer: cosmicMobileNavigationContainer,
  mobileHeader: cosmicMobileNavigationHeader,
  mobileItem: cosmicMobileNavigationItem,
  mobileSubmenu: cosmicMobileNavigationSubmenu
};

/**
 * USAGE EXAMPLE (in a React component):
 * =====================================
 * 
 * // First, import the necessary components
 * import { useState, useEffect } from 'react';
 * import { 
 *   cosmicNavigationContainer,
 *   cosmicNavigationContent,
 *   cosmicNavigationLogo,
 *   cosmicNavigationItemsContainer,
 *   cosmicNavigationItem,
 *   cosmicNavigationSubmenu,
 *   cosmicNavigationSubmenuItem,
 *   cosmicMobileNavigationMenu,
 *   cosmicMobileNavigationContainer,
 *   cosmicMobileNavigationHeader,
 *   cosmicMobileNavigationItem,
 *   cosmicMobileNavigationSubmenu
 * } from './panda.config/recipes/cosmicNavigationBar';
 * import { usePathname } from 'next/navigation';
 * import Link from 'next/link';
 * 
 * // Define props interface for the NavigationBar component
 * interface NavItem {
 *   id: string;
 *   label: string;
 *   href: string;
 *   icon?: React.ReactNode;
 *   submenu?: Array<{
 *     id: string;
 *     label: string;
 *     href: string;
 *     icon?: React.ReactNode;
 *     description?: string;
 *   }>;
 * }
 * 
 * interface CosmicNavigationBarProps {
 *   items?: NavItem[];
 *   logo?: React.ReactNode;
 *   homeHref?: string;
 *   title?: string;
 *   variant?: 'standard' | 'elevated' | 'minimal' | 'cosmic';
 *   hideOnScroll?: boolean;
 *   maxWidth?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
 * }
 * 
 * function CosmicNavigationBarComponent({
 *   items = [],
 *   logo,
 *   homeHref = '/',
 *   title = 'Cosmic UI',
 *   variant = 'standard',
 *   hideOnScroll = true,
 *   maxWidth = 'xl'
 * }: CosmicNavigationBarProps) {
 *   const pathname = usePathname();
 *   const [activeItemId, setActiveItemId] = useState<string | null>(null);
 *   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 *   const [expandedMobileItems, setExpandedMobileItems] = useState<string[]>([]);
 *   const [isVisible, setIsVisible] = useState(true);
 *   const [prevScrollPos, setPrevScrollPos] = useState(0);
 *   
 *   // Get styles from recipes
 *   const containerStyles = cosmicNavigationContainer({ 
 *     variant, 
 *     hideOnScroll 
 *   });
 *   
 *   const contentStyles = cosmicNavigationContent({ 
 *     maxWidth,
 *     verticalPadding: 'md'
 *   });
 *   
 *   const logoStyles = cosmicNavigationLogo({ 
 *     variant: variant === 'cosmic' ? 'cosmic' : 'standard', 
 *     size: 'md' 
 *   });
 *   
 *   const itemsContainerStyles = cosmicNavigationItemsContainer({ 
 *     itemGap: 'md',
 *     align: 'end'
 *   });
 *   
 *   const mobileMenuButtonStyles = cosmicMobileMenuButton({ 
 *     variant: variant === 'cosmic' ? 'cosmic' : 'standard',
 *     size: 'md'
 *   });
 *   
 *   const mobileContainerStyles = cosmicMobileNavigationContainer({ 
 *     variant: variant === 'cosmic' ? 'cosmic' : 'standard',
 *     animation: 'slide'
 *   });
 *   
 *   const mobileHeaderStyles = cosmicMobileNavigationHeader({ 
 *     variant: variant === 'cosmic' ? 'cosmic' : 'standard',
 *     hasLogo: !!logo,
 *     hasTitle: !!title
 *   });
 *   
 *   // Hide on scroll logic
 *   useEffect(() => {
 *     const handleScroll = () => {
 *       if (!hideOnScroll) return;
 *       
 *       const currentScrollPos = window.scrollY;
 *       const scrollingUp = prevScrollPos > currentScrollPos;
 *       const atTop = currentScrollPos < 10;
 *       const significantChange = Math.abs(currentScrollPos - prevScrollPos) > 5;
 *       
 *       if (atTop || (scrollingUp && significantChange)) {
 *         setIsVisible(true);
 *       } else if (!scrollingUp && significantChange && !isMobileMenuOpen) {
 *         setIsVisible(false);
 *       }
 *       
 *       setPrevScrollPos(currentScrollPos);
 *     };
 *     
 *     window.addEventListener('scroll', handleScroll);
 *     return () => window.removeEventListener('scroll', handleScroll);
 *   }, [prevScrollPos, hideOnScroll, isMobileMenuOpen]);
 *   
 *   // Check if a route is active
 *   const isActiveRoute = (href: string) => {
 *     if (!pathname) return false;
 *     if (href === '/') return pathname === '/';
 *     return pathname.startsWith(href);
 *   };
 *   
 *   // Toggle desktop submenu
 *   const handleDesktopItemHover = (itemId: string) => {
 *     setActiveItemId(itemId);
 *   };
 *   
 *   const handleDesktopItemLeave = () => {
 *     setActiveItemId(null);
 *   };
 *   
 *   // Toggle mobile menu
 *   const toggleMobileMenu = () => {
 *     setIsMobileMenuOpen(!isMobileMenuOpen);
 *     if (isMobileMenuOpen) {
 *       document.body.style.overflow = '';
 *     } else {
 *       document.body.style.overflow = 'hidden';
 *     }
 *   };
 *   
 *   // Toggle mobile submenu
 *   const toggleMobileSubmenu = (itemId: string) => {
 *     setExpandedMobileItems(prev => 
 *       prev.includes(itemId) 
 *         ? prev.filter(id => id !== itemId) 
 *         : [...prev, itemId]
 *     );
 *   };
 *   
 *   return (
 *     <>
 *       <nav
 *         className={containerStyles}
 *         data-visible={isVisible}
 *       >
 *         <div className={contentStyles}>
 *           <div className={logoStyles}>
 *             <Link href={homeHref}>
 *               {logo || '🌙'}
 *               <span className="logo-tooltip">Home</span>
 *             </Link>
 *           </div>
 *           
 *           <div className={itemsContainerStyles}>
 *             {items.map((item) => {
 *               const isActive = isActiveRoute(item.href);
 *               const isExpanded = activeItemId === item.id;
 *               const hasSubmenu = !!item.submenu?.length;
 *               
 *               const itemStyles = cosmicNavigationItem({
 *                 variant: variant === 'cosmic' ? 'cosmic' : 'standard',
 *                 size: 'md',
 *                 hasIcon: !!item.icon,
 *                 hasSubmenu
 *               });
 *               
 *               return (
 *                 <div key={item.id} onMouseEnter={() => hasSubmenu && handleDesktopItemHover(item.id)} onMouseLeave={handleDesktopItemLeave}>
 *                   {hasSubmenu ? (
 *                     <>
 *                       <button
 *                         className={itemStyles}
 *                         data-active={isActive}
 *                         data-expanded={isExpanded}
 *                         aria-expanded={isExpanded}
 *                         aria-controls={`submenu-${item.id}`}
 *                       >
 *                         <div className="nav-item-content">
 *                           {item.icon && <span className="nav-item-icon">{item.icon}</span>}
 *                           <span className="nav-item-label">{item.label}</span>
 *                         </div>
 *                         <span className="nav-item-arrow">
 *                           <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
 *                             <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
 *                           </svg>
 *                         </span>
 *                       </button>
 *                       
 *                       <div
 *                         id={`submenu-${item.id}`}
 *                         className={cosmicNavigationSubmenu({
 *                           variant: variant === 'cosmic' ? 'cosmic' : 'standard',
 *                           position: 'center',
 *                           width: 'auto',
 *                           hasHeader: false
 *                         })}
 *                         data-state={isExpanded ? "open" : "closed"}
 *                       >
 *                         <div className="submenu-container">
 *                           <div className="submenu-grid">
 *                             {item.submenu?.map((subItem) => (
 *                               <Link
 *                                 key={subItem.id}
 *                                 href={subItem.href}
 *                                 className={cosmicNavigationSubmenuItem({
 *                                   variant: variant === 'cosmic' ? 'cosmic' : 'standard',
 *                                   hasDescription: !!subItem.description,
 *                                   hasIcon: !!subItem.icon,
 *                                   size: 'md'
 *                                 })}
 *                               >
 *                                 {subItem.icon && (
 *                                   <div className="submenu-item-icon">{subItem.icon}</div>
 *                                 )}
 *                                 <div className="submenu-item-content">
 *                                   <span className="submenu-item-label">{subItem.label}</span>
 *                                   {subItem.description && (
 *                                     <span className="submenu-item-description">{subItem.description}</span>
 *                                   )}
 *                                 </div>
 *                               </Link>
 *                             ))}
 *                           </div>
 *                         </div>
 *                       </div>
 *                     </>
 *                   ) : (
 *                     <Link href={item.href} className={itemStyles} data-active={isActive}>
 *                       <div className="nav-item-content">
 *                         {item.icon && <span className="nav-item-icon">{item.icon}</span>}
 *                         <span className="nav-item-label">{item.label}</span>
 *                       </div>
 *                     </Link>
 *                   )}
 *                 </div>
 *               );
 *             })}
 *           </div>
 *           
 *           <button
 *             className={mobileMenuButtonStyles}
 *             onClick={toggleMobileMenu}
 *             aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
 *             aria-expanded={isMobileMenuOpen}
 *             data-open={isMobileMenuOpen}
 *           >
 *             {isMobileMenuOpen ? '✕' : '☰'}
 *           </button>
 *         </div>
 *       </nav>
 *       
 *       <div
 *         className={mobileContainerStyles}
 *         data-state={isMobileMenuOpen ? 'open' : 'closed'}
 *       >
 *         <div className={mobileHeaderStyles}>
 *           {logo && (
 *             <div className="mobile-logo-container">
 *               <Link href={homeHref} onClick={toggleMobileMenu}>
 *                 {logo}
 *               </Link>
 *             </div>
 *           )}
 *           {title && (
 *             <div className="mobile-title-container">
 *               <h2 className="mobile-title-text">{title}</h2>
 *             </div>
 *           )}
 *         </div>
 *         
 *         <div className="mobile-menu-items">
 *           {items.map((item) => {
 *             const isActive = isActiveRoute(item.href);
 *             const hasSubmenu = !!item.submenu?.length;
 *             const isExpanded = expandedMobileItems.includes(item.id);
 *             
 *             const itemStyles = cosmicMobileNavigationItem({
 *               variant: variant === 'cosmic' ? 'cosmic' : 'standard',
 *               size: 'md',
 *               hasIcon: !!item.icon,
 *               hasSubmenu
 *             });
 *             
 *             return (
 *               <div key={item.id}>
 *                 {hasSubmenu ? (
 *                   <>
 *                     <button
 *                       className={itemStyles}
 *                       onClick={() => toggleMobileSubmenu(item.id)}
 *                       data-active={isActive}
 *                       data-expanded={isExpanded}
 *                       aria-expanded={isExpanded}
 *                       aria-controls={`mobile-submenu-${item.id}`}
 *                     >
 *                       <div className="mobile-item-content">
 *                         {item.icon && <span className="mobile-item-icon">{item.icon}</span>}
 *                         <span className="mobile-item-label">{item.label}</span>
 *                       </div>
 *                       <span className="mobile-item-arrow">
 *                         <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
 *                           <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
 *                         </svg>
 *                       </span>
 *                     </button>
 *                     
 *                     <div
 *                       id={`mobile-submenu-${item.id}`}
 *                       className={cosmicMobileNavigationSubmenu({
 *                         variant: variant === 'cosmic' ? 'cosmic' : 'standard',
 *                         indentLevel: 1
 *                       })}
 *                       style={{ 
 *                         '--submenu-height': isExpande
 */