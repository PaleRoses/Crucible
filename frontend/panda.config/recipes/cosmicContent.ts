// src/styled-system/recipes/cosmicLayout.ts

import { cva } from '../../styled-system/css';

/**
 * Cosmic Layout System - A comprehensive layout structure with sidebar, header, and content area
 * 
 * Features:
 * - Flexible layout with sidebar, header, and content components
 * - Sticky sidebar and header options with scrollable content
 * - Support for responsive behaviors
 * - Multiple sidebar states (expanded, collapsed, hidden)
 * - Theme-adaptive styling
 * - Borderless and backgroundless variants for all components
 * - Special borderless/backgroundless support for cosmic styling
 */

// Main layout container
export const cosmicLayout = cva({
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
export const cosmicHeader = cva({
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
export const cosmicContent = cva({
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
export const cosmicContentInner = cva({
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
 * Usage Example (in a React component):
 * 
 * import { 
 *   cosmicLayout,
 *   cosmicSidebar,
 *   cosmicHeader,
 *   cosmicContent,
 *   cosmicContentInner 
 * } from '../styled-system/recipes/cosmicLayout';
 * import { useState, useEffect } from 'react';
 * 
 * function CosmicLayoutExample() {
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
 *       <aside 
 *         className={cosmicSidebar({ 
 *           variant: 'cosmicBorderless',
 *           border: 'hidden',
 *           background: 'visible'
 *         })}
 *         data-expanded={sidebarExpanded}
 *       >
 *         <div style={{ padding: '1rem' }}>
 *           <button onClick={toggleSidebar}>
 *             {sidebarExpanded ? 'Collapse' : 'Expand'}
 *           </button>
 *         </div>
 *       </aside>
 *       
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
 *           <p>This is a modern layout with a borderless and backgroundless cosmic theme.</p>
 *           
 *           {Array.from({ length: 20 }).map((_, i) => (
 *             <div key={i} style={{ marginBottom: '2rem' }}>
 *               <h3>Section {i + 1}</h3>
 *               <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
 *             </div>
 *           ))}
 *         </div>
 *       </main>
 *     </div>
 *   );
 * }
 */