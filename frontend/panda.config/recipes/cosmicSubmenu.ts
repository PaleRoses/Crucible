// panda.config/recipes/cosmicSubmenu.ts

import { defineRecipe } from '@pandacss/dev';

/**
 * ====================================================================================
 * COSMIC SUBMENU - An elegant dropdown panel component for navigation submenus
 * ====================================================================================
 * 
 * IMPORT INTO YOUR PANDA CONFIG:
 * 
 * import { 
 *   cosmicSubmenu,
 *   cosmicSubmenuGrid,
 *   cosmicSubmenuHeader,
 *   cosmicSubmenuTitle,
 *   cosmicSubmenuDescription,
 *   cosmicSubmenuItem,
 *   cosmicSubmenuComponents
 * } from './panda.config/recipes/cosmicSubmenu';
 * 
 * Then add to your config:
 * 
 * export default defineConfig({
 *   // ...other config
 *   theme: {
 *     extend: {
 *       recipes: {
 *         // Method 1: Add individual components
 *         Submenu: cosmicSubmenu,
 *         SubmenuGrid: cosmicSubmenuGrid,
 *         SubmenuHeader: cosmicSubmenuHeader,
 *         SubmenuTitle: cosmicSubmenuTitle,
 *         SubmenuDescription: cosmicSubmenuDescription,
 *         SubmenuItem: cosmicSubmenuItem,
 *         
 *         // Method 2: Or use the combined object
 *         // This adds all components with their original naming
 *         ...cosmicSubmenuComponents
 *       }
 *     }
 *   }
 * })
 * 
 * Features:
 * - Smooth entrance and exit animations with configurable timing
 * - Flexible grid layout for organizing submenu items
 * - Support for header with title and description
 * - Consistent styling with other cosmic components
 * - Multiple visual variants for different aesthetic needs
 * - Position variants for different menu orientations
 * - Animation options for entrance and exit effects
 * - Accessible design with proper ARIA attributes
 * - Responsive sizing and layout options
 */

// Main submenu container
export const cosmicSubmenu = defineRecipe ({
  className: 'cosmicSubmenu',
  description: 'A cosmic submenu component with various styles and animations',
  base: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'backgroundAlt',
    border: '1px solid',
    borderColor: 'border',
    borderRadius: 'md',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
    zIndex: 'dropdown',
    padding: '0',
    width: 'auto',
    maxWidth: '90vw',
    minWidth: '240px',
    transformOrigin: 'top center',
    
    // Visibility and interactivity defaults
    opacity: 0,
    visibility: 'hidden',
    pointerEvents: 'none',
    
    // Transitions
    transition: 'opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease',
    
    // When submenu is open
    '&[data-state="open"]': {
      opacity: 1,
      visibility: 'visible',
      pointerEvents: 'auto',
    },
    
    // Subtle cosmic background animation
    _before: {
      content: '""',
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-background) 97%, var(--color-primary)) 0%, var(--color-background) 100%)',
      opacity: 0.8,
      zIndex: 0,
    },
    
    // Star effect 
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
  
  variants: {
    // Visual variants
    variant: {
      standard: {
        // Base styles already define standard
        borderLeft: '1px solid var(--color-border)',
      },
      
      accent: {
        borderLeft: '3px solid var(--color-primary)',
      },
      
      minimal: {
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        border: 'none',
        background: 'color-mix(in srgb, var(--color-backgroundAlt) 85%, transparent)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      },
      
      cosmic: {
        borderLeft: '3px solid var(--color-primary)',
        boxShadow: '0 0 30px var(--color-glow), 0 10px 25px rgba(0, 0, 0, 0.2)',
        
        _before: {
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-backgroundAlt) 80%, var(--color-primary)) 0%, var(--color-backgroundAlt) 100%)',
          opacity: 0.9,
        },
        
        _after: {
          backgroundImage: `
            radial-gradient(circle, var(--color-cosmic1) 1px, transparent 1px), 
            radial-gradient(circle, var(--color-cosmic2) 1px, transparent 1px), 
            radial-gradient(circle, var(--color-cosmic3) 0.5px, transparent 0.5px)
          `,
          backgroundSize: '20px 20px, 30px 30px, 15px 15px',
          backgroundPosition: '0 0, 10px 10px, 15px 15px',
          opacity: 0.07,
        },
      },
    },
    
    // Position variants
    position: {
      top: {
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%) translateY(8px) scale(0.98)',
        transformOrigin: 'top center',
        
        '&[data-state="open"]': {
          transform: 'translateX(-50%) translateY(8px) scale(1)',
        },
      },
      
      topStart: {
        top: '100%',
        left: '0',
        transform: 'translateY(8px) scale(0.98)',
        transformOrigin: 'top left',
        
        '&[data-state="open"]': {
          transform: 'translateY(8px) scale(1)',
        },
      },
      
      topEnd: {
        top: '100%',
        right: '0',
        transform: 'translateY(8px) scale(0.98)',
        transformOrigin: 'top right',
        
        '&[data-state="open"]': {
          transform: 'translateY(8px) scale(1)',
        },
      },
      
      bottom: {
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%) translateY(-8px) scale(0.98)',
        transformOrigin: 'bottom center',
        
        '&[data-state="open"]': {
          transform: 'translateX(-50%) translateY(-8px) scale(1)',
        },
      },
      
      right: {
        top: '0',
        left: '100%',
        transform: 'translateX(8px) scale(0.98)',
        transformOrigin: 'left center',
        
        '&[data-state="open"]': {
          transform: 'translateX(8px) scale(1)',
        },
      },
      
      left: {
        top: '0',
        right: '100%',
        transform: 'translateX(-8px) scale(0.98)',
        transformOrigin: 'right center',
        
        '&[data-state="open"]': {
          transform: 'translateX(-8px) scale(1)',
        },
      },
    },
    
    // Animation variants
    animation: {
      fade: {
        transform: 'scale(1)',
        '&[data-state="closed"]': {
          opacity: 0,
        },
        '&[data-state="open"]': {
          opacity: 1,
        },
      },
      
      scale: {
        transform: 'scale(0.95)',
        '&[data-state="closed"]': {
          transform: 'scale(0.95)',
        },
        '&[data-state="open"]': {
          transform: 'scale(1)',
        },
      },
      
      slideDown: {
        transform: 'translateY(-10px)',
        '&[data-state="closed"]': {
          transform: 'translateY(-10px)',
        },
        '&[data-state="open"]': {
          transform: 'translateY(0)',
        },
      },
      
      slideUp: {
        transform: 'translateY(10px)',
        '&[data-state="closed"]': {
          transform: 'translateY(10px)',
        },
        '&[data-state="open"]': {
          transform: 'translateY(0)',
        },
      },
    },
    
    // Size variants for the panel
    size: {
      sm: {
        minWidth: '180px',
      },
      
      md: {
        minWidth: '240px',
      },
      
      lg: {
        minWidth: '320px',
      },
      
      auto: {
        width: 'auto',
        minWidth: 'auto',
      },
      
      full: {
        width: '100%',
      },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
    position: 'top',
    animation: 'scale',
    size: 'md',
  },
});

// Submenu content grid layout
export const cosmicSubmenuGrid = defineRecipe ({
  className: 'cosmicSubmenuGrid',
  description: 'A grid layout for submenu items',
  base: {
    display: 'grid',
    width: '100%',
    position: 'relative',
    zIndex: 1,
  },
  
  variants: {
    // Column configuration
    columns: {
      auto: {
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      },
      
      '1': {
        gridTemplateColumns: '1fr',
      },
      
      '2': {
        gridTemplateColumns: 'repeat(2, 1fr)',
      },
      
      '3': {
        gridTemplateColumns: 'repeat(3, 1fr)',
      },
      
      '4': {
        gridTemplateColumns: 'repeat(4, 1fr)',
      },
    },
    
    // Gap between items
    gap: {
      none: {
        gap: '0',
      },
      
      sm: {
        gap: '0.5rem',
      },
      
      md: {
        gap: '1rem',
      },
      
      lg: {
        gap: '1.5rem',
      },
    },
    
    // Padding around the grid
    padding: {
      none: {
        padding: '0',
      },
      
      sm: {
        padding: '0.5rem',
      },
      
      md: {
        padding: '1rem',
      },
      
      lg: {
        padding: '1.5rem',
      },
    },
  },
  
  defaultVariants: {
    columns: 'auto',
    gap: 'none',
    padding: 'none',
  },
});

// Submenu header section
export const cosmicSubmenuHeader = defineRecipe ({
  className: 'cosmicSubmenuHeader',
  description: 'A header section for the submenu with title and description',
  base: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1.75rem',
    position: 'relative',
    zIndex: 1,
  },
  
  variants: {
    // Alignment variants
    align: {
      start: {
        alignItems: 'flex-start',
        textAlign: 'left',
      },
      
      center: {
        alignItems: 'center',
        textAlign: 'center',
      },
      
      end: {
        alignItems: 'flex-end',
        textAlign: 'right',
      },
    },
    
    // Has bottom border
    hasBorder: {
      true: {
        borderBottom: '1px solid',
        borderColor: 'border',
      },
    },
    
    // Background variants
    hasBackground: {
      true: {
        backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 98%, var(--color-primary))',
      },
    },
  },
  
  defaultVariants: {
    align: 'start',
    hasBorder: false,
    hasBackground: false,
  },
});

// Submenu title
export const cosmicSubmenuTitle = defineRecipe ({
  className: 'cosmicSubmenuTitle',
  description: 'A title for the submenu',
  base: {
    fontFamily: 'heading',
    color: 'primary',
    fontSize: 'desktopSubmenuHeader',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
    fontWeight: 'medium',
  },
});

// Submenu description
export const cosmicSubmenuDescription = defineRecipe ({
  className: 'cosmicSubmenuDescription',
  description: 'A description for the submenu',
  base: {
    fontSize: 'desktopSubmenuDescription',
    color: 'textMuted',
    lineHeight: 1.4,
    maxWidth: '32rem',
  },
});

// Submenu item
export const cosmicSubmenuItem = defineRecipe ({
  className: 'cosmicSubmenuItem',
  description: 'A single item in the submenu',
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
    borderLeft: '1px solid var(--color-primary)',
    backgroundColor: 'transparent',
    width: '100%',
    
    // Hover styles
    _hover: {
      backgroundColor: 'color-mix(in srgb, var(--color-hover) 50%, transparent)',
      boxShadow: '0 0 5px var(--color-glow)',
    },
    
    // Focus styles
    _focusVisible: {
      outline: '2px solid var(--color-primary)',
      outlineOffset: '-2px',
    },
    
    // Active styles
    _active: {
      backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
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
      width: '170px', 
      height: '128px',
      alignSelf: 'center',
    },
    
    // Label styling
    '& .submenu-item-label': {
      fontFamily: 'heading',
      fontSize: 'desktopSubmenuItem',
      fontWeight: 'normal',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      marginBottom: '0.25rem',
      color: 'text',
      transition: 'color 0.2s ease',
    },
    
    // Description styling
    '& .submenu-item-description': {
      fontSize: 'desktopSubmenuDescription',
      color: 'textMuted',
      lineHeight: 1.4,
      maxWidth: '200px',
    },
  },
  
  variants: {
    // Visual variants
    variant: {
      standard: {
        // Base styles already define standard
      },
      
      minimal: {
        borderLeft: 'none',
        padding: '0.75rem 1rem',
      },
      
      compact: {
        padding: '0.5rem 1rem',
        '& .submenu-item-icon': {
          width: 'auto',
          height: 'auto',
          marginRight: '0.75rem',
          marginBottom: '0',
        },
        '& .submenu-item-content': {
          flexDirection: 'row',
          alignItems: 'center',
          gap: '0.75rem',
        },
      },
      
      cosmic: {
        borderLeft: '2px solid var(--color-primary)',
        
        _hover: {
          backgroundColor: 'color-mix(in srgb, var(--color-hover) 70%, var(--color-primary))',
          boxShadow: '0 0 10px var(--color-glow)',
          
          '& .submenu-item-label': {
            color: 'primary',
            textShadow: '0 0 5px var(--color-glow)',
          },
        },
        
        '& .submenu-item-icon': {
          filter: 'drop-shadow(0 0 3px var(--color-glow))',
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
    },
    
    // With/without icon
    hasIcon: {
      true: {
        '& .submenu-item-content': {
          marginTop: '0.5rem',
        },
      },
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
        '& .submenu-item-icon': {
          width: '120px',
          height: '90px',
        },
        '& .submenu-item-label': {
          fontSize: '0.8rem',
        },
        '& .submenu-item-description': {
          fontSize: '0.7rem',
        },
      },
      
      md: {
        // Base styles already define medium size
      },
      
      lg: {
        padding: '1.5rem',
        '& .submenu-item-icon': {
          width: '200px',
          height: '150px',
        },
        '& .submenu-item-label': {
          fontSize: '1rem',
        },
        '& .submenu-item-description': {
          fontSize: '0.9rem',
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

/**
 * Bulk export of all cosmic submenu components
 */
export const cosmicSubmenuComponents = {
  container: cosmicSubmenu,
  grid: cosmicSubmenuGrid,
  header: cosmicSubmenuHeader,
  title: cosmicSubmenuTitle,
  description: cosmicSubmenuDescription,
  item: cosmicSubmenuItem
};

/**
 * USAGE EXAMPLE (in a React component):
 * =====================================
 * 
 * // First, import the necessary components
 * import { useState } from 'react';
 * import { 
 *   cosmicSubmenu,
 *   cosmicSubmenuGrid,
 *   cosmicSubmenuHeader,
 *   cosmicSubmenuTitle,
 *   cosmicSubmenuDescription,
 *   cosmicSubmenuItem 
 * } from './panda.config/recipes/cosmicSubmenu';
 * 
 * // Define props interface for the Submenu component
 * interface SubmenuProps {
 *   items: Array<{
 *     id: string;                // Unique identifier for the item
 *     label: string;             // Display text for the item
 *     href: string;              // Navigation link or action identifier
 *     icon?: React.ReactNode;    // Optional icon component
 *     description?: string;      // Optional description text
 *   }>;
 *   title?: string;              // Optional submenu title
 *   description?: string;        // Optional submenu description
 *   isOpen: boolean;             // Whether the submenu is currently displayed
 *   position?: 'top' | 'topStart' | 'topEnd' | 'bottom' | 'right' | 'left'; // Position relative to trigger
 *   variant?: 'standard' | 'accent' | 'minimal' | 'cosmic'; // Visual style variant
 *   onItemClick?: (href: string) => void; // Callback when an item is clicked
 * }
 * 
 * // Create the CosmicSubmenu component
 * function CosmicSubmenuComponent({
 *   items,
 *   title,
 *   description,
 *   isOpen,
 *   position = 'top',
 *   variant = 'standard',
 *   onItemClick,
 * }: SubmenuProps) {
 *   // Get styles from recipes
 *   const submenuStyles = cosmicSubmenu({ 
 *     variant, 
 *     position,
 *     animation: 'scale',
 *     size: 'md'
 *   });
 *   
 *   const gridStyles = cosmicSubmenuGrid({ 
 *     columns: items.length > 3 ? '2' : '1',
 *     gap: 'md',
 *     padding: 'md'
 *   });
 *   
 *   const headerStyles = cosmicSubmenuHeader({
 *     align: 'start',
 *     hasBorder: true,
 *     hasBackground: variant === 'cosmic'
 *   });
 *   
 *   const titleStyles = cosmicSubmenuTitle({});
 *   const descriptionStyles = cosmicSubmenuDescription({});
 *   
 *   // Handle item click
 *   const handleItemClick = (href: string) => {
 *     if (onItemClick) {
 *       onItemClick(href);
 *     }
 *   };
 *   
 *   return (
 *     <div 
 *       className={submenuStyles}
 *       data-state={isOpen ? "open" : "closed"}
 *       role="menu"
 *       aria-hidden={!isOpen}
 *     >
 *       {(title || description) && (
 *         <div className={headerStyles}>
 *           {title && <h3 className={titleStyles}>{title}</h3>}
 *           {description && <p className={descriptionStyles}>{description}</p>}
 *         </div>
 *       )}
 *       
 *       <div className={gridStyles}>
 *         {items.map((item) => {
 *           const itemStyles = cosmicSubmenuItem({ 
 *             variant: variant === 'cosmic' ? 'cosmic' : 'standard',
 *             hasDescription: !!item.description,
 *             hasIcon: !!item.icon,
 *             size: 'md'
 *           });
 *           
 *           return (
 *             <button
 *               key={item.id}
 *               className={itemStyles}
 *               onClick={() => handleItemClick(item.href)}
 *               role="menuitem"
 *             >
 *               {item.icon && (
 *                 <div className="submenu-item-icon">{item.icon}</div>
 *               )}
 *               <div className="submenu-item-content">
 *                 <span className="submenu-item-label">{item.label}</span>
 *                 {item.description && (
 *                   <span className="submenu-item-description">{item.description}</span>
 *                 )}
 *               </div>
 *             </button>
 *           );
 *         })}
 *       </div>
 *     </div>
 *   );
 * }
 * 
 * // EXAMPLES OF USAGE:
 * 
 * // Basic Submenu
 * function BasicSubmenuExample() {
 *   const [isOpen, setIsOpen] = useState(false);
 *   
 *   const submenuItems = [
 *     { id: 'item1', label: 'Dashboard', href: '/dashboard' },
 *     { id: 'item2', label: 'Settings', href: '/settings' },
 *     { id: 'item3', label: 'Profile', href: '/profile' },
 *   ];
 *   
 *   return (
 *     <div className="relative">
 *       <button onClick={() => setIsOpen(!isOpen)}>
 *         Toggle Menu
 *       </button>
 *       
 *       <CosmicSubmenuComponent
 *         items={submenuItems}
 *         isOpen={isOpen}
 *         position="topStart"
 *         onItemClick={(href) => {
 *           console.log(`Navigating to: ${href}`);
 *           setIsOpen(false);
 *         }}
 *       />
 *     </div>
 *   );
 * }
 * 
 * // Cosmic Submenu with Icons and Descriptions
 * function CosmicSubmenuExample() {
 *   const [isOpen, setIsOpen] = useState(false);
 *   
 *   const submenuItems = [
 *     { 
 *       id: 'products', 
 *       label: 'Our Products', 
 *       href: '/products',
 *       icon: <ProductIcon />,
 *       description: 'Explore our range of premium products' 
 *     },
 *     { 
 *       id: 'services', 
 *       label: 'Services', 
 *       href: '/services',
 *       icon: <ServiceIcon />,
 *       description: 'Professional services tailored to your needs' 
 *     },
 *     { 
 *       id: 'about', 
 *       label: 'About Us', 
 *       href: '/about',
 *       icon: <AboutIcon />,
 *       description: 'Learn more about our company and mission' 
 *     },
 *   ];
 *   
 *   return (
 *     <div className="relative">
 *       <button onClick={() => setIsOpen(!isOpen)}>
 *         Our Offerings
 *       </button>
 *       
 *       <CosmicSubmenuComponent
 *         items={submenuItems}
 *         isOpen={isOpen}
 *         position="top"
 *         variant="cosmic"
 *         title="Discover Our Offerings"
 *         description="Explore our full range of products and services"
 *         onItemClick={(href) => {
 *           console.log(`Navigating to: ${href}`);
 *           setIsOpen(false);
 *         }}
 *       />
 *     </div>
 *   );
 * }
 */

// Add these keyframe animations to your global CSS or Panda CSS config:
/* 
@keyframes cosmicSubmenuFadeIn {
  0% {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes cosmicSubmenuShimmer {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 100% 100%;
  }
}

@keyframes cosmicSubmenuGlow {
  0% {
    box-shadow: 0 0 5px var(--color-glow);
  }
  50% {
    box-shadow: 0 0 20px var(--color-glow);
  }
  100% {
    box-shadow: 0 0 5px var(--color-glow);
  }
}
*/