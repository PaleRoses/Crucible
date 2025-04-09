// panda.config/recipes/cosmicSideBar.ts

import { defineRecipe } from '@pandacss/dev';

/**
 * ====================================================================================
 * COSMIC SIDEBAR - A sophisticated sidebar component with push-content behavior
 * ====================================================================================
 * 
 * IMPORT INTO YOUR PANDA CONFIG:
 * 
 * import { 
 *   cosmicPageLayout,
 *   cosmicSidebar,
 *   cosmicSidebarHeader,
 *   cosmicSidebarContent,
 *   cosmicSidebarItem,
 *   cosmicSidebarNestedItems,
 *   cosmicSidebarGroup,
 *   cosmicSidebarDivider,
 *   cosmicSidebarBadge,
 *   cosmicSidebarFooter,
 *   cosmicSidebarToggle,
 *   cosmicSidebarSearch,
 *   cosmicSideBar
 * } from './panda.config/recipes/cosmicSideBar';
 * 
 * Then add to your config:
 * 
 * export default defineConfig({
 *   // ...other config
 *   theme: {
 *     extend: {
 *       recipes: {
 *         // Method 1: Add individual components
 *         PageLayout: cosmicPageLayout,
 *         Sidebar: cosmicSidebar,
 *         SidebarHeader: cosmicSidebarHeader,
 *         SidebarContent: cosmicSidebarContent,
 *         SidebarItem: cosmicSidebarItem,
 *         SidebarNestedItems: cosmicSidebarNestedItems,
 *         SidebarGroup: cosmicSidebarGroup,
 *         SidebarDivider: cosmicSidebarDivider,
 *         SidebarBadge: cosmicSidebarBadge,
 *         SidebarFooter: cosmicSidebarFooter,
 *         SidebarToggle: cosmicSidebarToggle,
 *         SidebarUserProfile: cosmicSidebarUserProfile,
 *         SidebarSearch: cosmicSidebarSearch,
 *         
 *         // Method 2: Or use the combined object
 *         ...cosmicSideBar
 *       }
 *     }
 *   }
 * })
 * 
 * Features:
 * - Elegant push-content behavior that moves the main content when expanded
 * - Smooth transitions and animations for all state changes
 * - Multiple visual variants for different aesthetic needs
 * - Collapsible/expandable with configurable widths
 * - Sections for header, navigation content, and footer
 * - Nested navigation with expandable/collapsible items
 * - Section groups with optional headings
 * - Notification badges and status indicators
 * - User profile component for user information
 * - Search component integration
 * - Consistent styling with other cosmic components
 * - Hamburger/X toggle button with borderless option
 */

// Layout container that wraps both sidebar and content
export const cosmicPageLayout = defineRecipe({
  className: 'cosmicPageLayout',
  description: 'A sophisticated sidebar component with push-content behavior',
  base: {
    display: 'flex',
    width: '100%',
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',

    // Handle transition of content when sidebar expands/collapses
    '& .content-area': {
      flexGrow: 1,
      transition: 'margin-left var(--transition-default), width var(--transition-default)',
    },

    // When sidebar is expanded
    '&[data-sidebar-expanded="true"]': {
      '& .content-area': {
        // Adjust based on the expanded width of the sidebar
        marginLeft: 'var(--sidebar-expanded-width)',
      },
    },

    // When sidebar is collapsed
    '&[data-sidebar-expanded="false"]': {
      '& .content-area': {
        marginLeft: 'var(--sidebar-collapsed-width)',
      },
    },

    // Mobile behavior - sidebar pushes offscreen
    '@media (max-width: 768px)': {
      '& .content-area': {
        width: '100%',
        marginLeft: '0 !important',
      },

      '&[data-sidebar-expanded="true"]': {
        '& .content-area': {
          transform: 'translateX(var(--sidebar-expanded-width))',
          transition: 'transform var(--transition-default)',
        },
      },

      '&[data-sidebar-expanded="false"]': {
        '& .content-area': {
          transform: 'translateX(0)',
          transition: 'transform var(--transition-default)',
        },
      },
    },
  },

  variants: {
    // Content transition variants
    contentTransition: {
      push: {}, // Default behavior - already defined in base
      overlay: {
        '& .content-area': {
          marginLeft: '0 !important',
          width: '100%',
          transition: 'transform var(--transition-default)',
        },

        '&[data-sidebar-expanded="true"]': {
          '& .content-area': {
            transform: 'translateX(var(--sidebar-expanded-width))',

            '@media (min-width: 1200px)': {
              transform: 'translateX(0)',
              width: 'calc(100% - var(--sidebar-expanded-width))',
            },
          },
        },
      },

      // Mixed variant - push on large screens, overlay on small
      mixed: {
        // Large screens: Push content
        '@media (min-width: 1200px)': {
          '&[data-sidebar-expanded="true"]': {
            '& .content-area': {
              marginLeft: 'var(--sidebar-expanded-width)',
              transform: 'none',
            },
          },

          '&[data-sidebar-expanded="false"]': {
            '& .content-area': {
              marginLeft: 'var(--sidebar-collapsed-width)',
              transform: 'none',
            },
          },
        },

        // Small/medium screens: Overlay content
        '@media (max-width: 1199px)': {
          '& .content-area': {
            marginLeft: '0 !important',
            width: '100%',
            transition: 'transform var(--transition-default)',
          },

          '&[data-sidebar-expanded="true"]': {
            '& .content-area': {
              transform: 'translateX(var(--sidebar-expanded-width))',
            },
          },

          '&[data-sidebar-expanded="false"]': {
            '& .content-area': {
              transform: 'translateX(var(--sidebar-collapsed-width))',

              '@media (max-width: 768px)': {
                transform: 'translateX(0)',
              },
            },
          },
        },
      },
    },
  },

  defaultVariants: {
    contentTransition: 'push',
  },
});

// Main sidebar container
export const cosmicSidebar = defineRecipe({
  className: 'cosmicSidebar',
  description: 'A sophisticated sidebar component with push-content behavior',
  base: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width var(--transition-default), transform var(--transition-default)',
    zIndex: 'sidebar',
    overflowX: 'hidden',
    backgroundColor: 'none',
    boxShadow: '0 0 15px var(--color-glow)',

    // Default width values (can be overridden with CSS custom properties)
    '--sidebar-collapsed-width': '60px',
    '--sidebar-expanded-width': '240px',
    '--transition-default': '0.3s ease',

    // When expanded
    '&[data-expanded="true"]': {
      width: 'var(--sidebar-expanded-width)',

      '& .sidebar-item-text': {
        opacity: 1,
        transform: 'translateX(0)',
        visibility: 'visible',
      },

      '& .sidebar-header-title': {
        opacity: 1,
        visibility: 'visible',
      },
    },

    // When collapsed
    '&[data-expanded="false"]': {
      width: 'var(--sidebar-collapsed-width)',

      '& .sidebar-item-text': {
        opacity: 0,
        transform: 'translateX(-10px)',
        visibility: 'hidden',
      },

      '& .sidebar-header-title': {
        opacity: 0,
        visibility: 'hidden',
      },
    },

    // Mobile behavior - completely offscreen when collapsed
    '@media (max-width: 768px)': {
      boxShadow: 'md',

      '&[data-expanded="false"]': {
        transform: 'translateX(calc(-1 * var(--sidebar-collapsed-width)))',
      },
    },
  },

  variants: {
    // Visual style variants
    variant: {
      standard: {
        // Base styles already define standard
        borderRight: '1px solid',
        borderColor: 'border',
      },

      elevated: {
        borderRight: '1px solid',
        borderColor: 'border',
        boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
      },

      minimal: {
        borderRight: 'none',
        backgroundColor: 'transparent', // Fully transparent background
        backdropFilter: 'blur(8px)', // Keep blur for readability if needed
        boxShadow: '3px 0 15px 0 token(colors.glow)',
      },

      cosmic: {
        borderRight: 'none',
        backgroundColor: 'transparent',
        
        
        
        boxShadow: '0 0 15px var(--color-glow)',

        // Subtle background effect
        _before: {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(to bottom, color-mix(in srgb, var(--color-backgroundAlt) 90%, var(--color-primary)), var(--color-backgroundAlt))',
          opacity: 0.5,
          zIndex: -1,
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
          zIndex: -1,
        },

        '& .sidebar-header': {
          borderBottom: '1px solid',
          borderColor: 'color-mix(in srgb, var(--color-border) 70%, var(--color-primary))',
        },

        '& .sidebar-footer': {
          borderTop: '1px solid',
          borderColor: 'color-mix(in srgb, var(--color-border) 70%, var(--color-primary))',
        },
      },
    },

    // Initial state
    initiallyExpanded: {
      true: {
        '--initial-state': 'expanded',
      },
      false: {
        '--initial-state': 'collapsed',
      },
    },
  },

  defaultVariants: {
    variant: 'standard',
    initiallyExpanded: true,
  },
});

// Sidebar header section
export const cosmicSidebarHeader = defineRecipe({
  className: 'cosmicSidebarHeader',
  description: 'Header section of the sidebar',
  base: {
    display: 'flex',
    color: 'primary',
    fontWeight: '200',
    fontSize: '1.1rem',
    paddingLeft: '12px',
    alignItems: 'center',
    height: '60px',
    borderBottom: '1px solid',
    borderColor: 'border',
    overflow: 'hidden',
    position: 'relative',

    // Logo/icon container
    '& .sidebar-header-logo': {
      flexShrink: 0,
      fontWeight: '300',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 'calc(var(--sidebar-collapsed-width) - 16px)',
      marginLeft: '40px', // Space for the toggle button
      transition: 'width var(--transition-default)',
    },

    // Title text
    '& .sidebar-header-title': {
      marginLeft: '3',
      fontFamily: 'heading',
      fontSize: '1.1rem',
      paddingLeft: '1',
      fontWeight: '300',
      color: 'primary',
      whiteSpace: 'nowrap',
      transition: 'opacity 0.3s ease, visibility 0.3s ease',
    },
  },
});

// Sidebar content section (navigation)
export const cosmicSidebarContent = defineRecipe({
  className: 'cosmicSidebarContent',
  description: 'Content section of the sidebar for navigation items',
  base: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    fontFamily: 'heading',
    overflowX: 'hidden',
    padding: '2',

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
});

// Navigation item
export const cosmicSidebarItem = defineRecipe({
  className: 'cosmicSidebarItem',
  description: 'A navigation item component for the sidebar',
  base: {
    display: 'flex',
    alignItems: 'center',
    padding: '1',
    fontFamily: 'heading',
    marginBottom: '0.5',
    borderRadius: 'md',
    color: 'textMuted',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    userSelect: 'none',

    // Icon container
    '& .sidebar-item-icon': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      width: 'calc(var(--sidebar-collapsed-width) - 20px)',
      fontSize: 'xl',
      transition: 'color 0.3s ease',
    },

    // Text label
    '& .sidebar-item-text': {
      whiteSpace: 'nowrap',
      fontFamily: 'heading',
      transition: 'opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease',
      transitionDelay: '0.05s',
    },

    // Hover state
    _hover: {
      backgroundColor: 'hover',
      color: 'primary',
    },

    // Active/selected state
    '&[data-active="true"]': {
      backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
      color: 'primary',

      _before: {
        content: '""',
        position: 'absolute',
        left: '0',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '3px',
        height: '50%',
        backgroundColor: 'primary',
        borderRadius: '0 2px 2px 0',
      },
    },

    // Styles for items with nested navigation
    '&[data-has-children="true"]': {
      position: 'relative',
      
      // Dropdown indicator
      '&::after': {
        content: '""',
        position: 'absolute',
        right: '12px',
        top: '50%',
        width: '6px',
        height: '6px',
        borderRight: '2px solid',
        borderBottom: '2px solid',
        borderColor: 'currentColor',
        transformOrigin: 'center',
        transition: 'transform 0.3s ease',
        transform: 'translateY(-50%) rotate(-45deg)',
      },
      
      // Rotated dropdown indicator when expanded
      '&[data-expanded="true"]::after': {
        transform: 'translateY(-50%) rotate(45deg)',
      },
    },

    // ARIA support
    '&[aria-expanded="true"]': {
      '&::after': {
        transform: 'translateY(-50%) rotate(45deg)',
      },
    },
  },

  variants: {
    // Visual style variants
    variant: {
      standard: {
        // Base styles already define standard
      },

      subtle: {
        '&[data-active="true"]': {
          backgroundColor: 'transparent',

          '& .sidebar-item-text': {
            fontWeight: 'medium',
          },
        },

        _hover: {
          backgroundColor: 'transparent',
          color: 'primary',
        },
      },

      filled: {
        '&[data-active="true"]': {
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',

          _before: {
            display: 'none',
          },
        },
      },

      cosmic: {
        _hover: {
          backgroundColor: 'color-mix(in srgb, var(--color-hover) 80%, var(--color-primary))',
          boxShadow: '0 0 8px var(--color-glow)',
        },

        '&[data-active="true"]': {
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
          boxShadow: '0 0 12px var(--color-glow)',

          _before: {
            height: '70%',
            boxShadow: '0 0 8px var(--color-glow)',
          },
        },
      },
    },
    
    // Item size variants
    size: {
      sm: {
        padding: '1.5',
        fontSize: 'sm',
        '& .sidebar-item-icon': {
          fontSize: 'lg',
        },
      },
      md: {
        // Default size (already in base)
      },
      lg: {
        padding: '2.5',
        fontSize: 'lg',
        '& .sidebar-item-icon': {
          fontSize: '2xl',
        },
      },
    },
  },

  defaultVariants: {
    variant: 'standard',
    size: 'md',
  },
});

// Nested navigation items container
export const cosmicSidebarNestedItems = defineRecipe({
  className: 'cosmicSidebarNestedItems',
  description: 'Container for nested navigation items',
  base: {
    overflow: 'hidden',
    maxHeight: '0',
    transition: 'max-height 0.3s ease',
    paddingLeft: '0',
    marginLeft: 'calc(var(--sidebar-collapsed-width) - 20px)',
    
    // Expanded state (controlled by parent item's data-expanded attribute)
    '[data-expanded="true"] + &, [aria-expanded="true"] + &': {
      maxHeight: 'var(--nested-height, 500px)',
    },
    
    // Different styling when sidebar is collapsed vs expanded
    '.cosmicSidebar[data-expanded="true"] &': {
      paddingLeft: '4',
      marginLeft: '0',
    },
    
    // Child items styling
    '& .cosmicSidebarItem': {
      fontSize: '0.9em',
      padding: '1.5',
      
      // Less prominent indicator
      '&[data-active="true"]::before': {
        height: '40%',
      },
    },
  },
  
  variants: {
    // Nesting depth variants
    depth: {
      1: { paddingLeft: '4' },
      2: { paddingLeft: '6' },
      3: { paddingLeft: '8' },
    },

    // Indentation style variants
    indentStyle: {
      default: {}, // Default style (already in base)
      compact: {
        '& .cosmicSidebarItem': {
          marginBottom: '0.5',
        },
      },
      line: {
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: '20px',
          top: '0',
          bottom: '0',
          width: '1px',
          backgroundColor: 'border',
        },
      },
    },
  },
  
  defaultVariants: {
    depth: 1,
    indentStyle: 'default',
  },
});

// Navigation group/section
export const cosmicSidebarGroup = defineRecipe({
  className: 'cosmicSidebarGroup',
  description: 'A group of related navigation items with optional heading',
  base: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '4',
    
    // Group heading
    '& .sidebar-group-heading': {
      fontSize: 'xs',
      fontWeight: 'medium',
      textTransform: 'uppercase',
      color: 'textMuted',
      padding: '2 3',
      marginBottom: '1',
      transition: 'opacity 0.3s ease',
      
      // When sidebar is collapsed
      '.cosmicSidebar[data-expanded="false"] &': {
        opacity: 0,
        height: '0',
        overflow: 'hidden',
        margin: '0',
        padding: '0',
      },
    },

    // Group divider
    '&::after': {
      content: '""',
      display: 'block',
      height: '1px',
      backgroundColor: 'border',
      margin: '2 0',
      opacity: '0.5',
    },
  },
  
  variants: {
    // Visual variants
    variant: {
      standard: {}, // Base styles
      
      subtle: {
        '&::after': {
          display: 'none',
        },
        '& .sidebar-group-heading': {
          color: 'text',
          opacity: '0.6',
        },
      },
      
      cosmic: {
        '&::after': {
          backgroundImage: 'linear-gradient(to right, transparent, var(--color-border), transparent)',
          opacity: '0.7',
        },
        '& .sidebar-group-heading': {
          color: 'color-mix(in srgb, var(--color-text) 80%, var(--color-primary))',
        },
      },
    },
    
    // Whether to show dividers
    showDivider: {
      true: {},
      false: {
        '&::after': {
          display: 'none',
        },
      },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
    showDivider: true,
  },
});

// Divider component
export const cosmicSidebarDivider = defineRecipe({
  className: 'cosmicSidebarDivider',
  description: 'A divider line for the sidebar',
  base: {
    height: '1px',
    backgroundColor: 'border',
    margin: '3 0',
    opacity: '0.5',
  },
  
  variants: {
    variant: {
      standard: {},
      
      faded: {
        backgroundImage: 'linear-gradient(to right, transparent, var(--color-border), transparent)',
      },
      
      cosmic: {
        backgroundImage: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--color-border) 70%, var(--color-primary)), transparent)',
        boxShadow: '0 0 4px var(--color-glow)',
      },
    },
    
    spacing: {
      sm: { margin: '2 0' },
      md: { margin: '3 0' },
      lg: { margin: '4 0' },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
    spacing: 'md',
  },
});

// Badge for notifications
export const cosmicSidebarBadge = defineRecipe({
  className: 'cosmicSidebarBadge',
  description: 'Badge component for showing notifications or status',
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '18px',
    height: '18px',
    borderRadius: 'full',
    backgroundColor: 'primary',
    color: 'white',
    fontSize: 'xs',
    fontWeight: 'bold',
    marginLeft: 'auto',
    padding: '0 1',
    
    // Ensure badge is visible even when sidebar is collapsed
    '.cosmicSidebar[data-expanded="false"] &': {
      position: 'absolute',
      right: '8px',
    },
  },
  
  variants: {
    variant: {
      primary: { backgroundColor: 'primary' },
      secondary: { backgroundColor: 'secondary' },
      danger: { backgroundColor: 'danger' },
      warning: { backgroundColor: 'warning' },
      success: { backgroundColor: 'success' },
      info: { backgroundColor: 'info' },
    },
    
    size: {
      sm: { 
        minWidth: '16px', 
        height: '16px',
        fontSize: '2xs',
      },
      md: {}, // Default size
      lg: { 
        minWidth: '22px', 
        height: '22px', 
        fontSize: 'sm',
      },
    },
    
    // Dot style (no number, just a colored dot)
    dot: {
      true: {
        minWidth: '8px',
        height: '8px',
        padding: '0',
      },
    },
  },
  
  defaultVariants: {
    variant: 'primary',
    size: 'md',
    dot: false,
  },
});

// Sidebar footer section
export const cosmicSidebarFooter = defineRecipe({
  className: 'cosmicSidebarFooter',
  description: 'Footer section of the sidebar for additional controls or user info',
  base: {
    display: 'flex',
    flexDirection: 'column',
    padding: '4',
    borderTop: '1px solid',
    borderColor: 'border',

    // Footer content will typically be hidden when collapsed
    // and shown when expanded, handled by the parent's data-expanded state
  },
  
  variants: {
    variant: {
      standard: {},
      
      elevated: {
        boxShadow: '0 -2px 5px rgba(0, 0, 0, 0.05)',
      },
      
      cosmic: {
        borderColor: 'color-mix(in srgb, var(--color-border) 70%, var(--color-primary))',
        boxShadow: '0 -2px 8px var(--color-glow)',
      },
    },
    
    // Controls spacing
    spacing: {
      compact: { padding: '2' },
      normal: {}, // Default padding
      spacious: { padding: '6' },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
    spacing: 'normal',
  },
});

// NEW DONER-STYLE TOGGLE BUTTON
export const cosmicSidebarToggle = defineRecipe({
  className: 'cosmicSidebarToggle',
  description: 'Hamburger-style toggle button to expand or collapse the sidebar',
  base: {
    position: 'absolute',
    left: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    gap: '4px',
    borderRadius: 'md',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'secondary',
    cursor: 'pointer',
    zIndex: 'docked',
    transition: 'all 0.3s ease',
    padding: '4px',

    // The hamburger lines
    '& span': {
      display: 'block',
      height: '2px',
      backgroundColor: 'currentColor',
      borderRadius: 'full',
      transition: 'all 0.3s ease',
    },
    
    // Different widths for each line
    '& span:nth-of-type(1)': {
      width: '16px',
    },
    '& span:nth-of-type(2)': {
      width: '12px',
    },
    '& span:nth-of-type(3)': {
      width: '18px',
    },
    
    // Hover effects
    _hover: {
      color: 'primary',
      '& span': {
        width: '18px', // Expand all lines to same width on hover
      },
    },
    
    // When sidebar is expanded (toggle is in "X" state)
    '&[data-expanded="true"]': {
      color: 'primary',
      
      // Transform lines into X
      '& span:nth-of-type(1)': {
        width: '18px',
        transform: 'translateY(6px) rotate(45deg)',
      },
      '& span:nth-of-type(2)': {
        opacity: 0,
        transform: 'translateX(-5px)',
      },
      '& span:nth-of-type(3)': {
        width: '18px',
        transform: 'translateY(-6px) rotate(-45deg)',
      },
    },

    // Accessibility
    '&:focus-visible': {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
  },
  
  variants: {
    // Visual style variants to match sidebar
    variant: {
      standard: {
        // Base styles already define standard
      },
      elevated: {
        boxShadow: '0 0 4px rgba(0, 0, 0, 0.1)',
      },
      minimal: {
        backgroundColor: 'transparent',
      },
      cosmic: {
        border: 'none',
        '& span': {
          boxShadow: '0 0 3px var(--color-glow)',
        },
        _hover: {
          '& span': {
            boxShadow: '0 0 6px var(--color-glow)',
          },
        },
        '&[data-expanded="true"]': {
          '& span': {
            boxShadow: '0 0 8px var(--color-glow)',
          },
        },
      },
      borderless: {
        border: 'none',
        backgroundColor: 'transparent',
        boxShadow: 'none',
        '& span': {
          height: '1.5px',
        },
      },
    },
    
    // Size variants
    size: {
      sm: {
        width: '24px',
        height: '24px',
        gap: '3px',
        '& span': {
          height: '1.5px',
        },
        '& span:nth-of-type(1)': { width: '14px' },
        '& span:nth-of-type(2)': { width: '10px' },
        '& span:nth-of-type(3)': { width: '16px' },
        '&[data-expanded="true"], &:hover': {
          '& span': { width: '16px' },
        },
        '&[data-expanded="true"]': {
          '& span:nth-of-type(1)': {
            transform: 'translateY(5px) rotate(45deg)',
          },
          '& span:nth-of-type(3)': {
            transform: 'translateY(-5px) rotate(-45deg)',
          },
        },
      },
      md: {
        // Base styles already defined
      },
      lg: {
        width: '32px',
        height: '32px',
        gap: '5px',
        '& span': {
          height: '2.5px',
        },
        '& span:nth-of-type(1)': { width: '18px' },
        '& span:nth-of-type(2)': { width: '14px' },
        '& span:nth-of-type(3)': { width: '20px' },
        '&[data-expanded="true"], &:hover': {
          '& span': { width: '20px' },
        },
        '&[data-expanded="true"]': {
          '& span:nth-of-type(1)': {
            transform: 'translateY(7px) rotate(45deg)',
          },
          '& span:nth-of-type(3)': {
            transform: 'translateY(-7px) rotate(-45deg)',
          },
        },
      },
    },
    
    // Border options
    border: {
      none: {
        border: 'none',
      },
      thin: {
        border: '1px solid',
        borderColor: 'border',
      },
      thick: {
        border: '2px solid',
        borderColor: 'border',
      },
    },
    
    // Mobile-specific variant
    isMobile: {
      true: {
        '@media (max-width: 768px)': {
          top: '10px',
          left: '10px',
          transform: 'none',
          position: 'fixed', // Stay fixed on mobile even when sidebar slides away
          borderRadius: 'full',
          width: '36px',
          height: '36px',
          border: '1px solid',
          borderColor: 'border',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
        },
      },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
    size: 'md',
    border: 'none',
    isMobile: false,
  },
});



// Search component
export const cosmicSidebarSearch = defineRecipe({
  className: 'cosmicSidebarSearch',
  description: 'Search component for the sidebar',
  base: {
    display: 'flex',
    alignItems: 'center',
    padding: '2',
    margin: '2',
    borderRadius: 'md',
    backgroundColor: 'color-mix(in srgb, var(--color-background) 80%, transparent)',
    border: '1px solid',
    borderColor: 'border',
    transition: 'all 0.3s ease',
    
    // Search icon
    '& .sidebar-search-icon': {
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'textMuted',
      width: '24px',
      height: '24px',
    },
    
    // Input
    '& .sidebar-search-input': {
      flex: '1',
      background: 'none',
      border: 'none',
      padding: '0 2',
      color: 'text',
      fontSize: 'sm',
      outline: 'none',
      transition: 'width 0.3s ease, opacity 0.3s ease',
      
      '&::placeholder': {
        color: 'textMuted',
      },
    },
    
    // When sidebar is collapsed
    '.cosmicSidebar[data-expanded="false"] &': {
      padding: '1.5',
      justifyContent: 'center',
      
      '& .sidebar-search-input': {
        width: '0',
        padding: '0',
        opacity: '0',
      },
    },
    
    // Focus state
    '&:focus-within': {
      borderColor: 'primary',
      boxShadow: '0 0 0 1px var(--color-primary)',
      
      '& .sidebar-search-icon': {
        color: 'primary',
      },
    },
  },
  
  variants: {
    variant: {
      standard: {},
      
      minimal: {
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: '1px solid',
        borderColor: 'border',
        borderRadius: '0',
        padding: '1 2',
        
        '&:focus-within': {
          boxShadow: 'none',
          borderColor: 'primary',
        },
      },
      
      cosmic: {
        borderColor: 'color-mix(in srgb, var(--color-border) 70%, var(--color-primary))',
        
        '&:focus-within': {
          boxShadow: '0 0 8px var(--color-glow)',
        },
      },
    },
    
    size: {
      sm: {
        padding: '1',
        '& .sidebar-search-icon': {
          width: '20px',
          height: '20px',
        },
        '& .sidebar-search-input': {
          fontSize: 'xs',
        },
      },
      md: {}, // Default size
      lg: {
        padding: '3',
        '& .sidebar-search-icon': {
          width: '28px',
          height: '28px',
        },
        '& .sidebar-search-input': {
          fontSize: 'md',
        },
      },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
    size: 'md',
  },
});

/**
 * Bulk export of all cosmic sidebar components
 */
export const cosmicSideBar = {
  pageLayout: cosmicPageLayout,
  sidebar: cosmicSidebar,
  header: cosmicSidebarHeader,
  content: cosmicSidebarContent,
  item: cosmicSidebarItem,
  nestedItems: cosmicSidebarNestedItems,
  group: cosmicSidebarGroup,
  divider: cosmicSidebarDivider,
  badge: cosmicSidebarBadge,
  footer: cosmicSidebarFooter,
  toggle: cosmicSidebarToggle,
  search: cosmicSidebarSearch
};

/**
 * USAGE EXAMPLE (in a React component):
 * =====================================
 * 
 * // First, import the necessary components
 * import {
 *   cosmicPageLayout,
 *   cosmicSidebar,
 *   cosmicSidebarHeader,
 *   cosmicSidebarContent,
 *   cosmicSidebarItem,
 *   cosmicSidebarNestedItems,
 *   cosmicSidebarGroup,
 *   cosmicSidebarBadge,
 *   cosmicSidebarFooter,
 *   cosmicSidebarToggle,
 *   cosmicSidebarSearch
 * } from './panda.config/recipes/cosmicSideBar';
 * import { useState, useEffect } from 'react';
 * 
 * // Define props interface for the Sidebar component
 * interface SidebarProps {
 *   variant?: 'standard' | 'elevated' | 'minimal' | 'cosmic';
 *   contentTransition?: 'push' | 'overlay' | 'mixed';
 *   initiallyExpanded?: boolean;
 * }
 * 
 * function CosmicSidebarLayout({
 *   variant = 'standard',
 *   contentTransition = 'push',
 *   initiallyExpanded = true,
 *   children
 * }: React.PropsWithChildren<SidebarProps>) {
 *   const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
 *   const [isMobile, setIsMobile] = useState(false);
 *   const [expandedItems, setExpandedItems] = useState<string[]>([]);
 * 
 *   // Check for mobile viewport
 *   useEffect(() => {
 *     const checkMobile = () => {
 *       setIsMobile(window.innerWidth <= 768);
 *     };
 *     
 *     checkMobile();
 *     window.addEventListener('resize', checkMobile);
 *     
 *     return () => {
 *       window.removeEventListener('resize', checkMobile);
 *     };
 *   }, []);
 * 
 *   // Get styles from recipes
 *   const layoutStyles = cosmicPageLayout({ contentTransition });
 *   const sidebarStyles = cosmicSidebar({ variant, initiallyExpanded });
 *   const headerStyles = cosmicSidebarHeader({});
 *   const contentStyles = cosmicSidebarContent({});
 *   const searchStyles = cosmicSidebarSearch({ variant: variant === 'cosmic' ? 'cosmic' : 'standard' });
 *   const footerStyles = cosmicSidebarFooter({});
 *   const toggleStyles = cosmicSidebarToggle({ 
 *     variant: variant === 'cosmic' ? 'cosmic' : 'borderless',
 *     size: 'md',
 *     isMobile
 *   });
 *   const itemStyles = cosmicSidebarItem({ variant: variant === 'cosmic' ? 'cosmic' : 'standard' });
 *   const nestedItemsStyles = cosmicSidebarNestedItems({ depth: 1 });
 *   const groupStyles = cosmicSidebarGroup({ variant: variant === 'cosmic' ? 'cosmic' : 'standard' });
 *   const badgeStyles = cosmicSidebarBadge({ variant: 'danger' });

 * 
 *   // Toggle sidebar expanded state
 *   const toggleSidebar = () => {
 *     setIsExpanded(!isExpanded);
 *   };
 * 
 *   // Toggle nested item expansion
 *   const toggleItemExpansion = (itemId: string) => {
 *     setExpandedItems(prev => 
 *       prev.includes(itemId) 
 *         ? prev.filter(id => id !== itemId) 
 *         : [...prev, itemId]
 *     );
 *   };
 * 
 *   // Demo navigation items
 *   const navItems = [
 *     { id: 'dashboard', icon: '🏠', text: 'Dashboard', active: true },
 *     { 
 *       id: 'analytics', 
 *       icon: '📊', 
 *       text: 'Analytics', 
 *       active: false,
 *       children: [
 *         { id: 'reports', icon: '📑', text: 'Reports', active: false },
 *         { id: 'metrics', icon: '📏', text: 'Metrics', active: false },
 *         { id: 'forecasts', icon: '🔮', text: 'Forecasts', active: false },
 *       ]
 *     },
 *     { id: 'settings', icon: '⚙️', text: 'Settings', active: false },
 *     { id: 'notifications', icon: '🔔', text: 'Notifications', active: false, badge: 5 },
 *   ];
 * 
 *   return (
 *     <div className={layoutStyles} data-sidebar-expanded={isExpanded}>
 *       <aside className="cosmic-sidebar" style={sidebarStyles} data-expanded={isExpanded}>
 *         <div className="sidebar-header" style={headerStyles}>
 *           <div 
 *             className="sidebar-toggle" 
 *             style={toggleStyles} 
 *             onClick={toggleSidebar} 
 *             data-expanded={isExpanded}
 *             aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
 *           >
 *             <span></span>
 *             <span></span>
 *             <span></span>
 *           </div>
 *           
 *           <div className="sidebar-header-logo">
 *             <span role="img" aria-label="Logo">🌙</span>
 *           </div>
 *           <div className="sidebar-header-title">Cosmic UI</div>
 *         </div>
 *         
 *         <div style={searchStyles}>
 *           <div className="sidebar-search-icon">🔍</div>
 *           <input 
 *             className="sidebar-search-input" 
 *             placeholder="Search..." 
 *             aria-label="Search"
 *           />
 *         </div>
 * 
 *         <div className="sidebar-content" style={contentStyles}>
 *           <div style={groupStyles}>
 *             <div className="sidebar-group-heading">Main Navigation</div>
 *             
 *             {navItems.map((item) => (
 *               <div key={item.id}>
 *                 <div
 *                   className="sidebar-item"
 *                   style={itemStyles}
 *                   data-active={item.active}
 *                   data-has-children={!!item.children?.length}
 *                   data-expanded={expandedItems.includes(item.id)}
 *                   onClick={() => item.children ? toggleItemExpansion(item.id) : null}
 *                   aria-expanded={item.children ? expandedItems.includes(item.id) : undefined}
 *                 >
 *                   <div className="sidebar-item-icon">{item.icon}</div>
 *                   <div className="sidebar-item-text">{item.text}</div>
 *                   {item.badge && (
 *                     <div style={badgeStyles}>{item.badge}</div>
 *                   )}
 *                 </div>
 *                 
 *                 {item.children && (
 *                   <div style={nestedItemsStyles}>
 *                     {item.children.map((child) => (
 *                       <div
 *                         key={child.id}
 *                         className="sidebar-item"
 *                         style={itemStyles}
 *                         data-active={child.active}
 *                       >
 *                         <div className="sidebar-item-icon">{child.icon}</div>
 *                         <div className="sidebar-item-text">{child.text}</div>
 *                       </div>
 *                     ))}
 *                   </div>
 *                 )}
 *               </div>
 *             ))}
 *           </div>
 *         </div>
 * 
 *         <div className="sidebar-footer" style={footerStyles}>
 *           <div className="sidebar-item" style={itemStyles}>
 *             <div className="sidebar-item-icon">🔍</div>
 *             <div className="sidebar-item-text">Help & Resources</div>
 *           </div>
 *         </div>
 *       </aside>
 * 
 *       <main className="content-area">
 *         {children}
 *       </main>
 *     </div>
 *   );
 * }
 * 
 * // Example Usage
 * function App() {
 *   return (
 *     <CosmicSidebarLayout variant="cosmic" contentTransition="mixed">
 *       <div style={{ padding: '20px' }}>
 *         <h1>Main Content</h1>
 *         <p>Your application content goes here.</p>
 *       </div>
 *     </CosmicSidebarLayout>
 *   );
 * }
 */