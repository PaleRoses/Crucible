// src/styled-system/recipes/cosmicSideBar.ts

import { cva } from '../../styled-system/css';

/**
 * Cosmic Sidebar - A sophisticated sidebar component with push-content behavior
 *
 * Features:
 * - Elegant push-content behavior that moves the main content when expanded
 * - Smooth transitions and animations for all state changes
 * - Multiple visual variants for different aesthetic needs
 * - Collapsible/expandable with configurable widths
 * - Sections for header, navigation content, and footer
 * - Consistent styling with other cosmic components
 */

// Layout container that wraps both sidebar and content
export const cosmicPageLayout = cva({
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
export const cosmicSidebar = cva({
  base: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid',
    borderColor: 'border',
    transition: 'width var(--transition-default), transform var(--transition-default)',
    zIndex: 'sidebar',
    overflowX: 'hidden',
    backgroundColor: 'backgroundAlt',

    // Default width values (can be overridden with CSS custom properties)
    '--sidebar-collapsed-width': '60px',
    '--sidebar-expanded-width': '240px',

    // When expanded
    '&[data-expanded="true"]': {
      width: 'var(--sidebar-expanded-width)',

      '& .toggle-icon': {
        transform: 'rotate(180deg)',
      },

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

        // Collapsed hamburger button remains visible
        '& .sidebar-toggle': {
          transform: 'translateX(var(--sidebar-collapsed-width))',
        },
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
        borderRight: '1px solid',
        borderColor: 'transparent',
        backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 80%, transparent)',
        backdropFilter: 'blur(8px)',
      },

      cosmic: {
        borderRight: '1px solid',
        borderColor: 'color-mix(in srgb, var(--color-border) 70%, var(--color-primary))',
        backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 95%, var(--color-primary))',
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
export const cosmicSidebarHeader = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    padding: '4',
    height: '60px',
    borderBottom: '1px solid',
    borderColor: 'border',
    overflow: 'hidden',

    // Logo/icon container
    '& .sidebar-header-logo': {
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 'calc(var(--sidebar-collapsed-width) - 16px)',
      transition: 'width var(--transition-default)',
    },

    // Title text
    '& .sidebar-header-title': {
      marginLeft: '3',
      fontFamily: 'heading',
      fontWeight: 'normal',
      letterSpacing: '0.05em',
      color: 'primary',
      whiteSpace: 'nowrap',
      transition: 'opacity 0.3s ease, visibility 0.3s ease',
    },
  },
});

// Sidebar content section (navigation)
export const cosmicSidebarContent = cva({
  base: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
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
export const cosmicSidebarItem = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    padding: '2',
    marginBottom: '1',
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
  },

  defaultVariants: {
    variant: 'standard',
  },
});

// Sidebar footer section
export const cosmicSidebarFooter = cva({
  base: {
    display: 'flex',
    flexDirection: 'column',
    padding: '4',
    borderTop: '1px solid',
    borderColor: 'border',

    // Footer content will typically be hidden when collapsed
    // and shown when expanded, handled by the parent's data-expanded state
  },
});

// Toggle button to expand/collapse the sidebar
export const cosmicSidebarToggle = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: '20px',
    right: '-12px',
    width: '24px',
    height: '24px',
    borderRadius: 'full',
    backgroundColor: 'backgroundAlt',
    border: '1px solid',
    borderColor: 'border',
    color: 'primary',
    cursor: 'pointer',
    zIndex: 'docked',
    transition: 'all 0.3s ease, transform 0.3s ease',

    // Icon transition
    '& .toggle-icon': {
      transition: 'transform 0.3s ease',
    },

    // Hover state
    _hover: {
      backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 90%, var(--color-primary))',
      boxShadow: '0 0 8px rgba(0, 0, 0, 0.1)',
    },

    // Mobile adjustments
    '@media (max-width: 768px)': {
      bottom: 'auto',
      top: '10px',
      transition: 'all 0.3s ease, transform 0.3s ease',
    },
  },

  variants: {
    // Visual style variants
    variant: {
      standard: {
        // Base styles already define standard
      },

      elevated: {
        boxShadow: '0 0 8px rgba(0, 0, 0, 0.15)',
      },

      minimal: {
        backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 80%, transparent)',
        backdropFilter: 'blur(8px)',
      },

      cosmic: {
        backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 90%, var(--color-primary))',
        borderColor: 'color-mix(in srgb, var(--color-border) 70%, var(--color-primary))',
        boxShadow: '0 0 8px var(--color-glow)',

        _hover: {
          boxShadow: '0 0 12px var(--color-glow)',
        },
      },
    },
  },

  defaultVariants: {
    variant: 'standard',
  },
});

/**
 * Usage Example (in a React component):
 *
 * import {
 * cosmicPageLayout, // <-- Renamed from cosmicLayout
 * cosmicSidebar,
 * cosmicSidebarHeader,
 * cosmicSidebarContent,
 * cosmicSidebarItem,
 * cosmicSidebarFooter,
 * cosmicSidebarToggle
 * } from '../styled-system/recipes/cosmicSideBar';
 * import { useState, useEffect } from 'react';
 *
 * interface SidebarProps {
 * variant?: 'standard' | 'elevated' | 'minimal' | 'cosmic';
 * contentTransition?: 'push' | 'overlay' | 'mixed';
 * initiallyExpanded?: boolean;
 * }
 *
 * function CosmicSidebarLayout({
 * variant = 'standard',
 * contentTransition = 'push',
 * initiallyExpanded = true,
 * children
 * }: React.PropsWithChildren<SidebarProps>) {
 * const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
 *
 * // Get styles from recipes
 * const layoutStyles = cosmicPageLayout({ contentTransition }); // <-- Updated usage
 * const sidebarStyles = cosmicSidebar({ variant, initiallyExpanded });
 * const headerStyles = cosmicSidebarHeader({});
 * const contentStyles = cosmicSidebarContent({});
 * const footerStyles = cosmicSidebarFooter({});
 * const toggleStyles = cosmicSidebarToggle({ variant });
 * const itemStyles = cosmicSidebarItem({ variant: variant === 'cosmic' ? 'cosmic' : 'standard' });
 *
 * // Toggle sidebar expanded state
 * const toggleSidebar = () => {
 * setIsExpanded(!isExpanded);
 * };
 *
 * // Demo navigation items
 * const navItems = [
 * { icon: '🏠', text: 'Dashboard', active: true },
 * { icon: '📊', text: 'Analytics', active: false },
 * { icon: '⚙️', text: 'Settings', active: false },
 * { icon: '👤', text: 'Profile', active: false },
 * ];
 *
 * return (
 * <aside className="cosmic-sidebar" style={sidebarStyles} data-expanded={isExpanded}>
 * <div className="sidebar-header" style={headerStyles}>
 * <div className="sidebar-header-logo">
 * <span role="img" aria-label="Logo">🌙</span>
 * </div>
 * <div className="sidebar-header-title">Cosmic UI</div>
 * </div>
 *
 * <div className="sidebar-content" style={contentStyles}>
 * {navItems.map((item, index) => (
 * <div
 * key={index}
 * className="sidebar-item"
 * style={itemStyles}
 * data-active={item.active}
 * >
 * <div className="sidebar-item-icon">{item.icon}</div>
 * <div className="sidebar-item-text">{item.text}</div>
 * </div>
 * ))}
 * </div>
 *
 * <div className="sidebar-footer" style={footerStyles}>
 * <div className="sidebar-item" style={itemStyles}>
 * <div className="sidebar-item-icon">🔍</div>
 * <div className="sidebar-item-text">Help & Resources</div>
 * </div>
 * </div>
 *
 * <button
 * className="sidebar-toggle"
 * style={toggleStyles}
 * onClick={toggleSidebar}
 * aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
 * >
 * <span className="toggle-icon">
 * {isExpanded ? '◀' : '▶'}
 * </span>
 * </button>
 * </aside>
 *
 * <main className="content-area">
 * {children}
 * </main>
 * </div>
 * );
 * }
 *
 * // Example Usage
 * function App() {
 * return (
 * <CosmicSidebarLayout variant="cosmic" contentTransition="mixed">
 * <div style={{ padding: '20px' }}>
 * <h1>Main Content</h1>
 * <p>Your application content goes here.</p>
 * </div>
 * </CosmicSidebarLayout>
 * );
 * }
 */
