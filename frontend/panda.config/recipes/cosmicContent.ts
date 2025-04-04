// panda.config/recipes/cosmicContent.ts

import { defineRecipe } from '@pandacss/dev';

/**
 * ====================================================================================
 * COSMIC LAYOUT SYSTEM - A comprehensive layout structure with header and content area
 * ====================================================================================
 * 
 * IMPORT INTO YOUR PANDA CONFIG:
 * 
 * import { 
 *   cosmicLayout,
 *   cosmicHeader,
 *   cosmicContent,
 *   cosmicContentInner
 * } from './panda.config/recipes/cosmicContent';
 * 
 * Then add to your config:
 * 
 * export default defineConfig({
 *   // ...other config
 *   theme: {
 *     extend: {
 *       recipes: {
 *         // Add individual components
 *         Layout: cosmicLayout,
 *         Header: cosmicHeader,
 *         Content: cosmicContent,
 *         ContentInner: cosmicContentInner
 *       }
 *     }
 *   }
 * })
 * 
 * Features:
 * - Flexible layout with header and content components
 * - Support for sidebar integration (if imported separately)
 * - Sticky header option with scrollable content
 * - Support for responsive behaviors
 * - Theme-adaptive styling
 * - Borderless and backgroundless variants for all components
 * - Special cosmic styling with subtle background effects
 */

// Main layout container
export const cosmicLayout = defineRecipe({
  className: 'cosmicLayout',
  description: 'Main layout container with sidebar, header, and content area',
  base: {
    display: 'flex',
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'background',
    color: 'text',
  },
  
  variants: {
    // Background visibility control
    background: {
      visible: {}, // Uses base style (default)
      transparent: {
        backgroundColor: 'transparent',
      },
    },
  },
  
  defaultVariants: {
    background: 'visible',
  },
});

// Header component
export const cosmicHeader = defineRecipe({
  className: 'cosmicHeader',
  description: 'Header component with sticky and scrollable behavior',
  base: {
    display: 'flex',
    alignItems: 'center',
    height: 'var(--header-height, 60px)',
    width: '100%',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease, border-color 0.3s ease',
    padding: '0 1rem',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 'header',
    
    // When sidebar is expanded, adjust header position
    '[data-sidebar-expanded="true"] &': {
      '@media (min-width: 769px)': {
        width: 'calc(100% - var(--sidebar-expanded-width))',
        left: 'var(--sidebar-expanded-width)',
      },
    },
    
    // When sidebar is collapsed, adjust header position
    '[data-sidebar-expanded="false"] &': {
      '@media (min-width: 769px)': {
        width: 'calc(100% - var(--sidebar-collapsed-width))',
        left: 'var(--sidebar-collapsed-width)',
      },
    },
    
    // Mobile behavior - header spans full width
    '@media (max-width: 768px)': {
      width: '100%',
      left: 0,
    },
    
    // Visible state
    '&[data-visible="true"]': {
      transform: 'translateY(0)',
    },
    
    // Hidden state (for scroll behavior)
    '&[data-visible="false"]': {
      transform: 'translateY(-100%)',
    },
  },
  
  variants: {
    // Visual variants
    variant: {
      standard: {
        backgroundColor: 'backgroundAlt',
        borderBottom: '1px solid',
        borderColor: 'border',
        boxShadow: 'none',
      },
      
      elevated: {
        backgroundColor: 'backgroundAlt',
        borderBottom: '1px solid',
        borderColor: 'border',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      },
      
      cosmic: {
        backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 95%, var(--color-primary))',
        borderBottom: '1px solid',
        borderColor: 'color-mix(in srgb, var(--color-border) 70%, var(--color-primary))',
        boxShadow: '0 0 15px var(--color-glow)',
      },
      
      // Borderless cosmic
      cosmicBorderless: {
        backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 95%, var(--color-primary))',
        boxShadow: '0 0 15px var(--color-glow)',
      },
      
      // Backgroundless cosmic
      cosmicBackgroundless: {
        backgroundColor: 'transparent',
        borderBottom: '1px solid',
        borderColor: 'color-mix(in srgb, var(--color-border) 70%, var(--color-primary))',
      },
      
      // Both borderless and backgroundless cosmic
      cosmicMinimal: {
        backgroundColor: 'transparent',
        boxShadow: 'none',
      },
      
      glassmorphic: {
        backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 60%, transparent)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderBottom: '1px solid',
        borderColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)',
      },
      
      minimal: {
        backgroundColor: 'transparent',
      },
    },
    
    // Border control (independent of variant)
    border: {
      visible: {}, // handled by variant styles
      hidden: {
        borderBottom: 'none !important',
      },
    },
    
    // Background control (independent of variant)
    background: {
      visible: {}, // handled by variant styles
      transparent: {
        backgroundColor: 'transparent !important',
      },
    },
    
    // Shadow control (independent of variant)
    shadow: {
      visible: {}, // handled by variant styles
      hidden: {
        boxShadow: 'none !important',
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
    hideOnScroll: false,
    border: 'visible',
    background: 'visible',
    shadow: 'visible',
  },
});

// Main content area
export const cosmicContent = defineRecipe({
  className: 'cosmicContent',
  description: 'Main content area with padding and scrollable behavior',
  base: {
    flex: 1,
    width: '100%',
    height: '100vh',
    paddingTop: 'var(--header-height, 60px)',
    transition: 'padding-left 0.3s ease, width 0.3s ease, background-color 0.3s ease', 
    position: 'relative',
    overflow: 'auto',
    
    // When sidebar is expanded, adjust content position and width
    '[data-sidebar-expanded="true"] &': {
      '@media (min-width: 769px)': {
        paddingLeft: 'var(--sidebar-expanded-width)',
        width: 'calc(100% - var(--sidebar-expanded-width))',
      },
    },
    
    // When sidebar is collapsed, adjust content position and width
    '[data-sidebar-expanded="false"] &': {
      '@media (min-width: 769px)': {
        paddingLeft: 'var(--sidebar-collapsed-width)',
        width: 'calc(100% - var(--sidebar-collapsed-width))',
      },
    },
    
    // Mobile behavior - content takes full width
    '@media (max-width: 768px)': {
      paddingLeft: 0,
      width: '100%',
    },
  },
  
  variants: {
    // Visual variants
    variant: {
      standard: {
        backgroundColor: 'background',
      },
      
      cosmic: {
        backgroundColor: 'background',
        
        // Subtle star effect for cosmic
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
      
      // For completely transparent content area that still has star effect
      cosmicMinimal: {
        backgroundColor: 'transparent',
        
        // Subtle star effect
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
      
      minimal: {
        backgroundColor: 'transparent',
      },
    },
    
    // Background control (independent of variant)
    background: {
      visible: {}, // handled by variant styles
      transparent: {
        backgroundColor: 'transparent !important',
      },
    },
    
    // Content padding variants
    padding: {
      none: {
        padding: 0,
        paddingTop: 'var(--header-height, 60px)',
      },
      sm: {
        padding: '1rem',
        paddingTop: 'calc(var(--header-height, 60px) + 1rem)',
      },
      md: {
        padding: '2rem',
        paddingTop: 'calc(var(--header-height, 60px) + 2rem)',
      },
      lg: {
        padding: '3rem',
        paddingTop: 'calc(var(--header-height, 60px) + 3rem)',
      },
    },
    
    // Custom scrollbar styling
    customScrollbar: {
      true: {
        // WebKit browsers (Chrome, Safari, etc.)
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'color-mix(in srgb, var(--color-border) 80%, var(--color-primary))',
          borderRadius: 'full',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: 'color-mix(in srgb, var(--color-border) 50%, var(--color-primary))',
        },
        
        // Firefox
        scrollbarWidth: 'thin',
        scrollbarColor: 'color-mix(in srgb, var(--color-border) 80%, var(--color-primary)) transparent',
      },
      false: {},
    },
    
    // Max width constraint
    maxWidth: {
      none: {},
      content: {
        '& > *': {
          maxWidth: 'var(--content-max-width, 1200px)',
          marginLeft: 'auto',
          marginRight: 'auto',
        },
      },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
    padding: 'md',
    customScrollbar: true,
    maxWidth: 'none',
    background: 'visible',
  },
});

// Inner content wrapper (for consistent padding/styling)
export const cosmicContentInner = defineRecipe({
  className: 'cosmicContentInner',
  description: 'Inner content wrapper with padding and max width',
  base: {
    width: '100%',
    height: '100%',
  },
  
  variants: {
    // Container variants
    container: {
      true: {
        maxWidth: 'var(--content-max-width, 1200px)',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: '1rem',
        paddingRight: '1rem',
      },
      false: {},
    },
    
    // Visual variants 
    variant: {
      standard: {},
      cosmic: {
        // Add subtle cosmic effect only to content
        position: 'relative',
        _after: {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle, var(--color-cosmic1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          opacity: 0.02,
          zIndex: -1,
          pointerEvents: 'none',
        },
      },
      minimal: {},
    },
  },
  
  defaultVariants: {
    container: false,
    variant: 'standard',
  },
});

/**
 * USAGE EXAMPLE (in a React component):
 * =====================================
 * 
 * // First, import the necessary components
 * import { 
 *   cosmicLayout,
 *   cosmicHeader,
 *   cosmicContent,
 *   cosmicContentInner 
 * } from './panda.config/recipes/cosmicContent';
 * import { useState, useEffect } from 'react';
 * 
 * // Note: This example assumes you have a cosmicSidebar imported from elsewhere
 * 
 * function CosmicLayoutExample() {
 *   // State for sidebar and header visibility
 *   const [sidebarExpanded, setSidebarExpanded] = useState(true);
 *   const [headerVisible, setHeaderVisible] = useState(true);
 *   const [prevScrollPos, setPrevScrollPos] = useState(0);
 *   
 *   // Toggle sidebar expanded state
 *   const toggleSidebar = () => {
 *     setSidebarExpanded(prev => !prev);
 *   };
 *   
 *   // Handle scroll behavior for header visibility
 *   useEffect(() => {
 *     const handleScroll = () => {
 *       const currentScrollPos = window.pageYOffset;
 *       const isScrollingDown = prevScrollPos < currentScrollPos;
 *       const isAtTop = currentScrollPos < 10;
 *       
 *       if (isAtTop || !isScrollingDown) {
 *         setHeaderVisible(true);
 *       } else {
 *         setHeaderVisible(false);
 *       }
 *       
 *       setPrevScrollPos(currentScrollPos);
 *     };
 *     
 *     window.addEventListener('scroll', handleScroll);
 *     return () => window.removeEventListener('scroll', handleScroll);
 *   }, [prevScrollPos]);
 *   
 *   return (
 *     <div 
 *       className={cosmicLayout({ background: 'transparent' })}
 *       data-sidebar-expanded={sidebarExpanded}
 *     >
 *       <header 
 *         className={cosmicHeader({ 
 *           variant: 'cosmicMinimal', 
 *           hideOnScroll: true,
 *           border: 'hidden',
 *           background: 'transparent'
 *         })}
 *         data-visible={headerVisible}
 *       >
 *         <h1>Cosmic App</h1>
 *       </header>
 *       
 *       <main 
 *         className={cosmicContent({ 
 *           variant: 'cosmicMinimal',
 *           padding: 'md',
 *           maxWidth: 'content',
 *           background: 'transparent'
 *         })}
 *       >
 *         <div className={cosmicContentInner({ 
 *           container: true,
 *           variant: 'cosmic' 
 *         })}>
 *           <h2>Welcome to Cosmic UI</h2>
 *           <p>This is a modern layout with a cosmic theme.</p>
 *           
 *           <div className="content-section">
 *             <h3>Features Section</h3>
 *             <p>This layout system provides flexible and responsive behavior.</p>
 *           </div>
 *           
 *           <div className="content-section">
 *             <h3>Variants Section</h3>
 *             <p>Multiple variants available including standard, cosmic, and minimal.</p>
 *           </div>
 *         </div>
 *       </main>
 *     </div>
 *   );
 * }
 * 
 * // ADDITIONAL EXAMPLES:
 * 
 * // Basic layout with standard styling
 * <div className={cosmicLayout()}>
 *   <header className={cosmicHeader({ variant: 'standard' })}>
 *     <h1>App Header</h1>
 *   </header>
 *   <main className={cosmicContent({ variant: 'standard', padding: 'md' })}>
 *     <div className={cosmicContentInner({ container: true })}>
 *       Content goes here
 *     </div>
 *   </main>
 * </div>
 * 
 * // Cosmic layout with glassmorphic header
 * <div className={cosmicLayout({ background: 'transparent' })}>
 *   <header className={cosmicHeader({ variant: 'glassmorphic' })}>
 *     <h1>Glassmorphic Header</h1>
 *   </header>
 *   <main className={cosmicContent({ 
 *     variant: 'cosmic',
 *     padding: 'lg',
 *     customScrollbar: true
 *   })}>
 *     <div className={cosmicContentInner({ container: true, variant: 'cosmic' })}>
 *       Content with cosmic styling
 *     </div>
 *   </main>
 * </div>
 * 
 * // Content-focused layout with minimal styling
 * <div className={cosmicLayout()}>
 *   <header className={cosmicHeader({ 
 *     variant: 'minimal',
 *     hideOnScroll: true
 *   })}>
 *     <h1>Minimal Header</h1>
 *   </header>
 *   <main className={cosmicContent({ 
 *     variant: 'minimal',
 *     maxWidth: 'content'
 *   })}>
 *     <div className={cosmicContentInner({ container: true })}>
 *       <h2>Content-focused design</h2>
 *       <p>Perfect for reading-optimized layouts</p>
 *     </div>
 *   </main>
 * </div>
 */