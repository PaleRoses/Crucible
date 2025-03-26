'use client';

import React, { useState, useCallback, useEffect, useContext, useRef, memo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

// ==========================================================
// TYPES & INTERFACES
// ==========================================================

/**
 * These interfaces define the data structure for navigation items,
 * supporting hierarchical menus with nested submenu items.
 * The component is built to be highly configurable through props.
 */

/**
 * Customizable Navigation Bar Component
 * 
 * A highly customizable navigation bar with responsive design, animation,
 * and accessibility features. This component is designed to be flexible and reusable
 * across various projects by accepting configuration parameters.
 * 
 * @param {NavigationBarProps} props - Configuration props for the navigation bar
 * 
 * Usage example:
 * ```jsx
 * // In your app layout or parent component:
 * const navigationItems = [
 *   {
 *     id: 'products',
 *     label: 'Products',
 *     href: '/products',
 *     submenu: [
 *       {
 *         id: 'feature1',
 *         label: 'Feature 1',
 *         href: '/products/feature1',
 *         description: 'Description of feature 1'
 *       },
 *       // More submenu items...
 *     ]
 *   },
 *   // More navigation items...
 * ];
 * 
 * <NavigationBar 
 *   items={navigationItems}
 *   logo={<YourLogoComponent />}
 *   homeHref="/"
 *   submenuBehavior="hover"
 *   showOnScroll={true}
 * />
 * ```
 */

/**
 * Base menu item interface with shared properties
 */
export interface BaseMenuItem {
  /** Unique identifier for the menu item */
  id: string;
  /** Display text for the menu item */
  label: string;
  /** URL or route to navigate to when clicked */
  href: string;
  /** Optional icon component or string identifier for predefined icons */
  icon?: React.ReactNode | string;
}

/**
 * Submenu item with optional description
 */
export interface SubmenuItem extends BaseMenuItem {
  /** Optional description text for the submenu item */
  description?: string;
}

/**
 * Navigation item with submenu
 */
export interface NavItem extends BaseMenuItem {
  /** Array of submenu items to display in dropdown */
  submenu: SubmenuItem[];
}

/**
 * Props for the main navigation bar component
 */
export interface NavigationBarProps {
  // Content Configuration
  /** Navigation items configuration - defines the structure and content of the menu */
  items?: NavItem[];
  
  /** Custom logo component to display on the left side of the navigation bar */
  logo?: React.ReactNode;
  
  /** URL or route for the home/landing page when logo is clicked */
  homeHref?: string;
  
  /** ARIA label for the navigation element for accessibility */
  ariaLabel?: string;
  
  /** Whether to show descriptions for submenu items */
  showItemDescriptions?: boolean;
  
  /** Icon mapping for string-based icon references */
  iconMapping?: Record<string, React.ComponentType>;
  
  /** Optional header text to display in mobile menu */
  mobileHeader?: React.ReactNode;
  
  /** Optional title to display in mobile menu (default: 'Crescent') */
  mobileTitle?: string;
  
  /** Optional custom mobile menu icon */
  mobileMenuIcon?: React.ReactNode;
  
  // Layout & Dimensions
  /** Height of the navigation bar (CSS value) */
  height?: string | number;
  
  /** Width of the navigation bar (CSS value, usually '100%') */
  width?: string;
  
  /** Maximum width of the navigation bar (CSS value) */
  maxWidth?: string;
  
  /** Horizontal padding of the navigation bar (CSS value) */
  horizontalPadding?: string;
  
  /** Vertical padding of the navigation bar (CSS value) */
  verticalPadding?: string;
  
  /** Z-index for the navigation bar */
  zIndex?: number;
  
  /** Gap between navigation items (CSS value) */
  itemGap?: string;
  
  /** Breakpoint for mobile layout (in px) */
  mobileBreakpoint?: number;
  
  // Behavior
  /** Whether to use hover or click to activate submenus */
  submenuBehavior?: 'hover' | 'click';
  
  /** Delay before closing submenu when mouse leaves (in ms) */
  submenuCloseDelay?: number;
  
  /** Whether to hide the navigation bar when scrolling down */
  hideOnScroll?: boolean;
  
  /** Scroll threshold to trigger hide/show (in px) */
  scrollThreshold?: number;
  
  // Visual Styling
  /** Background color or gradient (CSS value) */
  backgroundColor?: string;
  
  /** Backdrop filter value (e.g., 'blur(10px)') */
  backdropFilter?: string;
  
  /** Border style for the navigation bar (CSS value) */
  borderStyle?: string;
  
  /** Box shadow for the navigation bar (CSS value) */
  boxShadow?: string;
}

/**
 * Context type for managing navigation state
 */
interface NavContextType {
  activeItemId: string | null;
  setActiveItemId: (id: string | null) => void;
  visible: boolean;
  focusedItemId: string | null;
  setFocusedItemId: (id: string | null) => void;
}

// ==========================================================
// DEFAULT VALUES & CONSTANTS
// ==========================================================

/**
 * Font size configuration for different elements
 * Adjust these values to control text sizing throughout the component
 */
const FONT_SIZES = {
  // Desktop sizes
  desktopNavItem: '0.95rem',
  desktopSubmenuHeader: '1.25rem',
  desktopSubmenuItem: '0.85rem',
  desktopSubmenuDescription: '0.8rem',
  
  // Mobile sizes
  mobileNavItem: '1.1rem',
  mobileSubmenuItem: '0.9rem',
};

/**
 * Default navigation items if none are provided
 */
const DEFAULT_NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    submenu: [
      {
        id: 'welcome',
        label: 'Welcome',
        href: '/',
        description: 'Back to the home page'
      }
    ]
  },
  {
    id: 'about',
    label: 'About',
    href: '/about',
    submenu: [
      {
        id: 'company',
        label: 'Company',
        href: '/about/company',
        description: 'Learn more about our company'
      },
      {
        id: 'team',
        label: 'Team',
        href: '/about/team',
        description: 'Meet our team'
      }
    ]
  }
];

/**
 * Default arrow icon component
 */
const DefaultArrowIcon = memo(() => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 12 12" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    aria-hidden="true"
    focusable="false"
  >
    <path 
      d="M2 4L6 8L10 4" 
      stroke="currentColor"
      strokeWidth="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
));
DefaultArrowIcon.displayName = 'DefaultArrowIcon';

/**
 * Default home icon component
 */
const DefaultHomeIcon = memo(() => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path 
      d="M12 5.69L17 10.19V18H15V12H9V18H7V10.19L12 5.69ZM12 3L2 12H5V20H11V14H13V20H19V12H22L12 3Z" 
      fill="currentColor" 
    />
  </svg>
));
DefaultHomeIcon.displayName = 'DefaultHomeIcon';

/**
 * Default submenu item icon
 */
const DefaultSubmenuIcon = memo(() => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 16 16" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path 
      d="M8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2ZM8 3C10.7614 3 13 5.23858 13 8C13 10.7614 10.7614 13 8 13C5.23858 13 3 10.7614 3 8C3 5.23858 5.23858 3 8 3ZM8 6C7.44772 6 7 6.44772 7 7V11C7 11.5523 7.44772 12 8 12C8.55228 12 9 11.5523 9 11V7C9 6.44772 8.55228 6 8 6ZM8 4C7.44772 4 7 4.44772 7 5C7 5.55228 7.44772 6 8 6C8.55228 6 9 5.55228 9 5C9 4.44772 8.55228 4 8 4Z" 
      fill="currentColor" 
    />
  </svg>
));
DefaultSubmenuIcon.displayName = 'DefaultSubmenuIcon';

/**
 * Default icon mapping
 */
const DEFAULT_ICON_MAPPING: Record<string, React.ComponentType> = {
  'arrow': DefaultArrowIcon,
  'home': DefaultHomeIcon,
  'submenu': DefaultSubmenuIcon
};

/**
 * Animation variants for different components
 * These define how elements animate when state changes (hover, open/close, etc.)
 * Using Framer Motion animation system for smooth transitions
 */
const DEFAULT_ANIMATIONS = {
  navItem: {
    idle: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    }
  },
  
  arrow: {
    closed: { rotate: 0, y: 0 },
    open: { 
      rotate: 180, 
      y: [0, 2, 0],
      transition: {
        y: {
          duration: 0.3,
          repeat: 0
        },
        rotate: {
          duration: 0.3
        }
      }
    }
  },
  
  submenu: {
    initial: { 
      opacity: 1,
      y: 0,
      scale: 1
    },
    animate: { 
      opacity: 1,
      y: 0,
      scale: 1
    },
    exit: { 
      opacity: 0,
      y: -15,
      scale: 0.97,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  },
  
  submenuContent: {
    initial: { 
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 1, 1]
      } 
    },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    exit: { 
      opacity: 0,
      x: 20,
      transition: { 
        duration: 0.2, 
        ease: [0.4, 0, 1, 1] 
      }
    },
    slideRight: {
      initial: {
        opacity: 0,
        x: 40,
        transition: {
          duration: 0.2,
          ease: [0.4, 0, 1, 1]
        }
      },
      animate: {
        opacity: 1,
        x: 0,
        transition: {
          duration: 0.3,
          ease: [0.16, 1, 0.3, 1]
        }
      },
      exit: {
        opacity: 0,
        x: -40,
        transition: {
          duration: 0.2,
          ease: [0.4, 0, 1, 1]
        }
      }
    },
    slideLeft: {
      initial: {
        opacity: 0,
        x: 40,
        transition: {
          duration: 0.2,
          ease: [0.4, 0, 1, 1]
        }
      },
      animate: {
        opacity: 1,
        x: 0,
        transition: {
          duration: 0.3,
          ease: [0.16, 1, 0.3, 1]
        }
      },
      exit: {
        opacity: 0,
        x: -40,
        transition: {
          duration: 0.2,
          ease: [0.4, 0, 1, 1]
        }
      }
    }
  },
  
  submenuItem: {
    initial: { 
      opacity: 0, 
      y: -5,
      scale: 0.97,
      transition: {
        duration: 0.1
      } 
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        mass: 0.8
      }
    }
  },
  
  // Updated mobile menu animations for top dropdown
  mobileMenu: {
    closed: {
      opacity: 0,
      y: '-100%',
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }
};

// ==========================================================
// CONTEXT
// ==========================================================

/**
 * NavContext provides state management across all navigation components.
 * It tracks:
 * - activeItemId: Which menu item is currently active/open
 * - visible: Whether the navigation bar is currently visible (for scroll behavior)
 * - focusedItemId: Which item has keyboard focus (for accessibility)
 */

// Context for navigation state
const NavContext = React.createContext<NavContextType>({
  activeItemId: null,
  setActiveItemId: () => {},
  visible: true,
  focusedItemId: null,
  setFocusedItemId: () => {}
});

// ==========================================================
// HELPER FUNCTIONS
// ==========================================================

/**
 * Utility functions that support the component's core functionality.
 * These functions handle common operations like resolving icon components.
 */

/**
 * Get icon component by name from mapping or return the provided React node
 */
const getIconComponent = (icon: React.ReactNode | string | undefined, iconMapping: Record<string, React.ComponentType>): React.ReactNode => {
  if (!icon) return null;
  
  if (typeof icon === 'string') {
    const IconComponent = iconMapping[icon];
    return IconComponent ? <IconComponent /> : null;
  }
  
  return icon;
};

// ==========================================================
// STYLED COMPONENTS
// ==========================================================

// These will be defined using style objects to avoid styled-components dependency
// but maintain the same organization as the original

// ==========================================================
// COMPONENTS
// ==========================================================

/**
 * The NavigationBar is composed of several sub-components:
 * - MemoizedSubmenuItem: Individual items within a submenu
 * - DesktopNavItemComponent: Top-level navigation items in desktop view
 * - GlobalSubmenuComponent: Manages submenu display with animations
 * - MobileNavItemComponent: Navigation items in mobile view
 * - MobileMenuComponent: Container for mobile navigation
 * 
 * Each component is memoized to prevent unnecessary re-renders and
 * improve performance as the navigation state changes.
 */

/**
 * Memoized Submenu Item Component
 * Used to render individual submenu items efficiently
 */
const MemoizedSubmenuItem = memo(({
  subItem,
  onClick,
  parentId,
  showDescription = false,
  iconMapping,
}: {
  subItem: SubmenuItem;
  onClick: () => void;
  parentId: string;
  showDescription?: boolean;
  iconMapping: Record<string, React.ComponentType>;
}) => {
  // Generate unique ID for this submenu item for ARIA attributes
  const submenuItemId = `${parentId}-submenu-item-${subItem.id}`;
  
  const styles = {
    wrapper: {
      display: 'flex',
      flexDirection: 'row' as const,
      alignItems: 'flex-start',
      padding: '1rem',
      cursor: 'pointer',
      color: 'rgba(224, 224, 224, 0.7)',
      textAlign: 'left' as const,
      borderRadius: 'var(--radius-small, 4px)',
      willChange: 'transform, background-color',
      transition: 'all 0.2s ease',
      backgroundColor: 'transparent',
      border: 'none',
      borderLeft: '1px solid var(--color-accent, rgba(255, 215, 0, 0.15))',
    },
    hoverState: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      transform: 'scale(1.03)',
      boxShadow: '0 0 5px rgba(255, 255, 255, 0.2)',
      borderLeft: '1px solid var(--color-accent, rgba(255, 215, 0, 0.15))',
    },
    link: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'flex-start',
      width: '100%',
      fontFamily: 'var(--font-heading, inherit)',
      fontWeight: 100,
      fontSize: '0.875rem',
      letterSpacing: '0.05em',
    },
    icon: {
      display: 'flex',
      alignSelf: 'center',
      justifyContent: 'center',
      color: 'var(--color-accent, currentColor)',
      marginBottom: '1rem',
      width: '48px',
      height: '48px'
    },
    label: {
      fontSize: FONT_SIZES.desktopSubmenuItem,
      letterSpacing: '0.1em',
      fontWeight: 400,
      marginBottom: '0.25rem',
      textTransform: 'uppercase' as const,
      transition: 'color 0.2s ease',
    },
    description: {
      fontSize: FONT_SIZES.desktopSubmenuDescription,
      color: 'rgba(224, 224, 224, 0.5)',
      maxWidth: '200px',
      lineHeight: 1.4,
    }
  };
  
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      key={subItem.id}
      style={{
        ...styles.wrapper,
        ...(isHovered ? styles.hoverState : {})
      }}
      variants={DEFAULT_ANIMATIONS.submenuItem}
      layoutId={`submenu-item-${subItem.id}`}
      onClick={onClick}
      role="menuitem"
      id={submenuItemId}
      tabIndex={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={subItem.description ? `${subItem.label}: ${subItem.description}` : subItem.label}
    >
      <div style={styles.link}>
        <div style={styles.icon}>
          {getIconComponent(subItem.icon, iconMapping) || getIconComponent('submenu', iconMapping)}
        </div>
        <span style={styles.label}>{subItem.label}</span>
        {showDescription && subItem.description && (
          <div style={styles.description}>
            {subItem.description}
          </div>
        )}
      </div>
    </motion.div>
  );
});

// Display name for debugging
MemoizedSubmenuItem.displayName = 'MemoizedSubmenuItem';

/**
 * Desktop Navigation Item Component
 * Memoized to prevent unnecessary re-renders when other nav items change
 */
const DesktopNavItemComponent = memo(({ 
  item, 
  isActive,
  onMouseEnter,
  onMouseLeave,
  itemIndex,
  iconMapping,
  submenuBehavior,
  itemStyle = {}
}: { 
  item: NavItem; 
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  itemIndex: number;
  iconMapping: Record<string, React.ComponentType>;
  submenuBehavior: 'hover' | 'click';
  itemStyle?: React.CSSProperties;
}) => {
  const { activeItemId, setActiveItemId } = useContext(NavContext);
  const isItemActive = activeItemId === item.id;
  const controls = useAnimation();
  const navItemId = `nav-item-${item.id}`;
  const submenuId = `submenu-${item.id}`;

  const styles = {
    wrapper: {
      position: 'relative' as const,
      ...itemStyle
    },
    navItem: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontFamily: 'var(--font-heading, inherit)',
      fontWeight: 'normal',
      letterSpacing: '0.2em',
      fontSize: FONT_SIZES.desktopNavItem,
      color: isItemActive || isActive ? 'var(--color-accent, #fff)' : 'var(--color-text, rgba(255, 255, 255, 0.8))',
      padding: '0.5rem 0.75rem',
      border: 'none',
      background: 'transparent',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    content: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: isItemActive || isActive ? 'var(--color-accent, #fff)' : 'inherit'
    },
    icon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    label: {
      textTransform: 'uppercase' as const,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      color: isItemActive || isActive ? 'var(--color-accent, #fff)' : 'inherit'
    },
    arrow: {
      display: 'flex',
      alignItems: 'center',
      marginTop: '2px',
      color: isItemActive ? 'var(--color-accent, #fff)' : 'inherit'
    },
    screenReaderOnly: {
      position: 'absolute' as const,
      width: '1px',
      height: '1px',
      padding: 0,
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap' as const,
      borderWidth: 0,
    }
  };

  useEffect(() => {
    controls.start({
      color: isItemActive || isActive ? 'var(--color-accent, #fff)' : 'var(--color-text, rgba(255, 255, 255, 0.8))',
      scale: isItemActive ? 1.05 : 1,
      transition: { duration: 0.3 }
    });
  }, [controls, isItemActive, isActive]);

  const handleClick = useCallback(() => {
    if (submenuBehavior === 'click') {
      if (isItemActive) {
        // If the submenu is already open, close it
        setActiveItemId(null);
      } else {
        // Otherwise, open this submenu
        setActiveItemId(item.id);
      }
    }
  }, [isItemActive, setActiveItemId, item.id, submenuBehavior]);
  
  const handleMouseEnter = useCallback(() => {
    if (submenuBehavior === 'hover') {
      setActiveItemId(item.id);
    }
    onMouseEnter();
  }, [onMouseEnter, setActiveItemId, item.id, submenuBehavior]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleClick();
        break;
      case 'Escape':
        e.preventDefault();
        setActiveItemId(null);
        break;
      case 'ArrowDown':
        e.preventDefault();
        // First open the submenu if not already open
        if (!isItemActive) {
          setActiveItemId(item.id);
        }
        // Then focus on the first submenu item
        setTimeout(() => {
          const firstSubmenuItem = document.getElementById(`${item.id}-submenu-item-${item.submenu[0].id}`);
          if (firstSubmenuItem) {
            firstSubmenuItem.focus();
          }
        }, 100);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        // Find previous sibling nav item and focus it
        const prevNavItem = document.getElementById(`nav-item-${itemIndex > 0 ? itemIndex - 1 : item.submenu.length - 1}`);
        if (prevNavItem) {
          prevNavItem.focus();
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        // Find next sibling nav item and focus it
        const nextNavItem = document.getElementById(`nav-item-${(itemIndex + 1) % item.submenu.length}`);
        if (nextNavItem) {
          nextNavItem.focus();
        }
        break;
    }
  }, [handleClick, isItemActive, item.id, item.submenu, setActiveItemId, itemIndex]);

  return (
    <div 
      style={styles.wrapper}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave}
      data-nav-item={item.id}
    >
      <motion.button
        id={navItemId}
        style={styles.navItem}
        variants={DEFAULT_ANIMATIONS.navItem}
        initial="idle"
        animate={controls}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="menuitem"
        aria-haspopup="true"
        aria-expanded={isItemActive}
        aria-controls={submenuId}
        tabIndex={0}
      >
        <div style={styles.content}>
          <div style={styles.icon}>
            {getIconComponent(item.icon, iconMapping)}
          </div>
          <span style={styles.label}>
            {item.label}
          </span>
        </div>
        
        <motion.div
          style={styles.arrow}
          variants={DEFAULT_ANIMATIONS.arrow}
          initial="closed"
          animate={isItemActive ? "open" : "closed"}
        >
          {getIconComponent('arrow', iconMapping)}
          <span style={styles.screenReaderOnly}>
            {isItemActive ? 'Collapse' : 'Expand'} {item.label} menu
          </span>
        </motion.div>
      </motion.button>
    </div>
  );
});

// Display name for debugging
DesktopNavItemComponent.displayName = 'DesktopNavItemComponent';

/**
 * Global Submenu Component - persistent across all navigation changes
 * Memoized to prevent unnecessary re-renders
 */
const GlobalSubmenuComponent = memo(({
  items,
  activeItemId,
  onMouseEnter,
  onMouseLeave,
  showItemDescriptions,
  submenuStyle = {},
  submenuBehavior,
  iconMapping,
}: {
  items: NavItem[];
  activeItemId: string | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  showItemDescriptions: boolean;
  submenuStyle?: React.CSSProperties;
  submenuBehavior: 'hover' | 'click';
  iconMapping: Record<string, React.ComponentType>;
}) => {
  const router = useRouter();
  const { setActiveItemId } = useContext(NavContext);
  const activeItem = items.find(item => item.id === activeItemId) || null;
  const [prevItemId, setPrevItemId] = useState<string | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [isFinalExit, setIsFinalExit] = useState(false);
  const submenuRef = useRef<HTMLDivElement>(null);
  const submenuId = activeItem ? `submenu-${activeItem.id}` : '';
  
  const styles = {
    globalContainer: {
      position: 'fixed' as const,
      top: '45px',
      left: 0,
      width: '100%',
      zIndex: 9,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      pointerEvents: 'none' as const,
      ...submenuStyle
    },
    submenuContainer: {
      background: 'rgba(10, 10, 10, 0.98)',
      backdropFilter: 'blur(50px)',
      borderRadius: '6px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 0 12px rgba(255, 255, 255, 0.3)',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderLeft: '3px solid var(--color-accent, rgba(255, 215, 0, 0.15))',
      pointerEvents: 'auto' as const,
      willChange: 'transform, opacity',
      margin: '0 auto',
      transformOrigin: 'top center',
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      width: '100%',
    },
    headerContainer: {
      display: 'flex',
      flexDirection: 'column' as const,
      padding: '1.75rem',
    },
    header: {
      fontFamily: 'var(--font-heading, inherit)',
      color: 'var(--color-accent, #fff)',
      fontSize: FONT_SIZES.desktopSubmenuHeader,
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
      marginBottom: '0.5rem',
    },
    description: {
      fontSize: FONT_SIZES.desktopSubmenuDescription,
      color: 'rgba(224, 224, 224, 0.7)',
      lineHeight: 1.4,
    },
    contentContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      width: '100%',
    }
  };
  
  // Reset exit state when a new item becomes active
  useEffect(() => {
    if (activeItemId) {
      setIsFinalExit(false);
    }
  }, [activeItemId, setIsFinalExit]);
  
  // Update slide direction based on item index change
  useEffect(() => {
    if (activeItemId && prevItemId && activeItemId !== prevItemId) {
      // Find indexes of previous and current items
      const itemIds = items.map(item => item.id);
      const prevIndex = itemIds.indexOf(prevItemId);
      const currentIndex = itemIds.indexOf(activeItemId);
      
      // Determine slide direction based on index comparison
      setSlideDirection(currentIndex > prevIndex ? 'right' : 'left');
      setIsFinalExit(false); // Reset exit state for transitions
    } else if (activeItemId === null && prevItemId !== null) {
      // We're closing the menu completely
      setIsFinalExit(true);
    }
    
    // Update previous item ID
    if (activeItemId !== prevItemId) {
      setPrevItemId(activeItemId);
    }
  }, [activeItemId, prevItemId, items, setIsFinalExit]);
  
  // Edge detection system for submenu closing
  useEffect(() => {
    if (!activeItemId || !submenuRef.current) return;
    
    // Force an immediate exit (used for direct edge exits)
    const forceExit = () => {
      setIsFinalExit(true);
    };
    
    // Track the last position to determine exit direction
    let lastY = 0;
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!activeItemId || !submenuRef.current) return;
      
      // Store current position to track direction
      const currentX = e.clientX;
      const currentY = e.clientY;
      
      // Get submenu and navbar elements
      const submenuEl = submenuRef.current;
      const navbarEl = document.querySelector('[role="navigation"]');
      
      if (!submenuEl || !navbarEl) {
        return;
      }
      
      // Get precise boundary rectangles
      const submenuRect = submenuEl.getBoundingClientRect();
      const navbarRect = navbarEl.getBoundingClientRect();
      
      // Check if mouse is outside all menu components
      const isOverSubmenu = (
        currentX >= submenuRect.left - 10 &&
        currentX <= submenuRect.right + 10 &&
        currentY >= submenuRect.top - 10 &&
        currentY <= submenuRect.bottom + 10
      );
      
      const isOverNavbar = (
        currentX >= navbarRect.left &&
        currentX <= navbarRect.right &&
        currentY >= navbarRect.top &&
        currentY <= navbarRect.bottom
      );
      
      // Check if mouse is over any nav item
      let isOverNavItem = false;
      let hoveredNavItemId: string | null = null;
      
      // Check if mouse is over any nav item
      const navItems = document.querySelectorAll('[data-nav-item]');
      navItems.forEach((item) => {
        const navRect = (item as HTMLElement).getBoundingClientRect();
        if (
          currentX >= navRect.left && 
          currentX <= navRect.right && 
          currentY >= navRect.top && 
          currentY <= navRect.bottom
        ) {
          isOverNavItem = true;
          hoveredNavItemId = (item as HTMLElement).getAttribute('data-nav-item');
        }
      });
      
      // When over a different nav item, we want to transition between menus
      if (isOverNavItem && hoveredNavItemId !== activeItemId) {
        setIsFinalExit(false);
        return;
      }
      
      // Exit cases:
      
      // Case 1: Check if mouse is below submenu by a significant amount
      const isBottomExit = currentY > (submenuRect.bottom + 20) && lastY <= (submenuRect.bottom + 20);
      
      if (isBottomExit) {
        forceExit();
        return;
      }
      
      // Case 2: If outside both menu elements, it's an exit
      if (!isOverSubmenu && !isOverNavbar && !isOverNavItem) {
        // Give a small delay to prevent flickering
        setTimeout(() => {
          setIsFinalExit(true);
        }, 50);
      } else {
        setIsFinalExit(false);
      }
      
      // Update last position
      lastY = currentY;
    };
    
    // Add direct window edge exit detection
    const handleMouseLeaveWindow = () => {
      if (activeItemId) {
        forceExit();
      }
    };
    
    // Only add mouse tracking for hover behavior
    if (submenuBehavior === 'hover') {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.documentElement.addEventListener('mouseleave', handleMouseLeaveWindow);
    }
    
    return () => {
      if (submenuBehavior === 'hover') {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.documentElement.removeEventListener('mouseleave', handleMouseLeaveWindow);
      }
    };
  }, [activeItemId, setIsFinalExit, submenuBehavior]);

  // Add keyboard navigation for submenu items
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!activeItemId) return;
    
    // Find all focusable elements in the submenu
    const focusableElements = submenuRef.current?.querySelectorAll('[role="menuitem"]');
    if (!focusableElements || focusableElements.length === 0) return;
    
    // Get the currently focused element
    const focusedElement = document.activeElement as HTMLElement;
    const focusedIndex = Array.from(focusableElements).indexOf(focusedElement as Element);
    
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setActiveItemId(null);
        // Return focus to the parent nav item
        const parentNavItem = document.getElementById(`nav-item-${activeItemId}`);
        if (parentNavItem) {
          parentNavItem.focus();
        }
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        // Focus next item or wrap around
        if (focusedIndex >= 0 && focusedIndex < focusableElements.length - 1) {
          (focusableElements[focusedIndex + 1] as HTMLElement).focus();
        } else {
          (focusableElements[0] as HTMLElement).focus();
        }
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        // Focus previous item or wrap around
        if (focusedIndex > 0) {
          (focusableElements[focusedIndex - 1] as HTMLElement).focus();
        } else {
          (focusableElements[focusableElements.length - 1] as HTMLElement).focus();
        }
        break;
      case 'Home':
        e.preventDefault();
        // Focus first item
        (focusableElements[0] as HTMLElement).focus();
        break;
      case 'End':
        e.preventDefault();
        // Focus last item
        (focusableElements[focusableElements.length - 1] as HTMLElement).focus();
        break;
    }
  }, [activeItemId, setActiveItemId]);
  
  // Add keyboard event listener when submenu is active
  useEffect(() => {
    if (activeItemId) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeItemId, handleKeyDown]);
  
  const handleMouseLeave = useCallback(() => {
    if (submenuBehavior === 'hover') {
      setIsFinalExit(true);
    }
    onMouseLeave();
  }, [onMouseLeave, setIsFinalExit, submenuBehavior]);
  
  // Choose the appropriate animation variant based on context
  const getAnimationVariant = useCallback(() => {
    // IMPORTANT: Always prioritize the final exit animation
    // This ensures the fade-out animation plays properly regardless of direction
    if (isFinalExit) {
      return DEFAULT_ANIMATIONS.submenu;
    } 
    
    // Only use slide animations for transitions between menu items
    return slideDirection === 'right' 
      ? DEFAULT_ANIMATIONS.submenuContent.slideRight 
      : DEFAULT_ANIMATIONS.submenuContent.slideLeft;
  }, [isFinalExit, slideDirection]);

  // Memoized handler for submenu item clicks
  const handleSubmenuItemClick = useCallback((href: string) => {
    setActiveItemId(null);
    router.push(href);
  }, [setActiveItemId, router]);
  
  return (
    <div 
      style={styles.globalContainer}
      onMouseEnter={onMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={submenuRef}
      role="presentation" // This is just a container
    >
      <AnimatePresence mode="wait">
        {activeItemId && (
          <motion.div
            style={{
              ...styles.submenuContainer,
              // Calculate dynamic width based on number of items
              width: `min(90%, ${200 + (activeItem ? activeItem.submenu.length * 220 : 0)}px)`,
              maxWidth: '1200px'
            }}
            custom={isFinalExit}
            variants={DEFAULT_ANIMATIONS.submenu}
            initial="initial"
            animate="animate"
            exit={isFinalExit ? "exit" : undefined}
            key={`global-submenu-${activeItemId || 'none'}`}
            layoutId="global-submenu"
            role="menu"
            id={submenuId}
            aria-labelledby={`nav-item-${activeItemId}`}
            data-exiting={isFinalExit ? "true" : "false"}
          >
            <div style={styles.gridContainer} role="presentation">
              {activeItem && (
                <motion.div
                  style={styles.contentContainer}
                  variants={getAnimationVariant()}
                  initial="initial"
                  animate="animate"
                  exit={isFinalExit ? "exit" : undefined}
                  key={`submenu-content-${activeItem.id}`}
                  layoutId={`submenu-content-${activeItem.id}`}
                  role="presentation"
                >
                  <div style={styles.headerContainer} role="presentation">
                    <div style={styles.header} id={`submenu-header-${activeItem.id}`}>
                      {activeItem.label}
                    </div>
                    {activeItem.submenu[0]?.description && (
                      <div style={styles.description} id={`submenu-description-${activeItem.id}`}>
                        {activeItem.submenu[0].description}
                      </div>
                    )}
                  </div>
                  
                  {activeItem.submenu.map((subItem) => (
                    <MemoizedSubmenuItem
                      key={subItem.id}
                      subItem={subItem}
                      onClick={() => handleSubmenuItemClick(subItem.href)}
                      parentId={activeItem.id}
                      showDescription={showItemDescriptions}
                      iconMapping={iconMapping}
                    />
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Display name for debugging
GlobalSubmenuComponent.displayName = 'GlobalSubmenuComponent';

/**
 * Mobile Navigation Item Component
 * Memoized to prevent unnecessary re-renders
 */
const MobileNavItemComponent = memo(({ 
  item, 
  isActive,
  iconMapping,
  toggleMenu,
}: { 
  item: NavItem; 
  isActive: boolean;
  iconMapping: Record<string, React.ComponentType>;
  toggleMenu: () => void;
}) => {
  const router = useRouter();
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const mobileNavItemId = `mobile-nav-item-${item.id}`;
  const mobileSubmenuId = `mobile-submenu-${item.id}`;

  const styles = {
    navItem: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontFamily: 'var(--font-heading, inherit)',
      fontWeight: 'normal',
      fontSize: FONT_SIZES.mobileNavItem,
      color: isActive ? 'var(--color-accent, #fff)' : 'var(--color-text, rgba(255, 255, 255, 0.8))',
      padding: '0.75rem 1rem',
      backgroundColor: 'transparent',
      border: 'none',
      width: '100%',
      textAlign: 'left' as const,
      justifyContent: 'space-between',
      borderTop: '1px solid rgba(255, 255, 255, 0.15)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
    },
    content: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    label: {
      textTransform: 'uppercase' as const,
      letterSpacing: '0.1em'
    },
    arrow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    submenuContainer: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.25rem',
      padding: '0.5rem 0 0.5rem 1.5rem',
      background: 'rgba(0, 0, 0, 0.3)',
      borderTop: '1px solid rgba(255, 255, 255, 0.15)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
    },
    submenuItem: {
      display: 'flex',
      flexDirection: 'row' as const,
      alignItems: 'center',
      padding: '0.5rem 1rem',
      cursor: 'pointer',
      color: 'rgba(224, 224, 224, 0.7)',
      transition: 'all 0.3s ease',
      border: 'none',
      borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
      backgroundColor: 'transparent',
      width: '100%',
      textAlign: 'left' as const,
      fontSize: FONT_SIZES.mobileSubmenuItem,
    },
    submenuItemActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      color: 'var(--color-accent, #fff)'
    },
    submenuItemLink: {
      display: 'flex',
      flexDirection: 'row' as const,
      alignItems: 'center',
      gap: '0.5rem',
    },
    submenuItemIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '16px',
      height: '16px',
      color: 'var(--color-accent, #fff)',
      opacity: 0.8
    },
    submenuItemLabel: {
      fontSize: FONT_SIZES.mobileSubmenuItem,
      letterSpacing: '0.05em',
      margin: 0
    },
    screenReaderOnly: {
      position: 'absolute' as const,
      width: '1px',
      height: '1px',
      padding: 0,
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap' as const,
      borderWidth: 0,
    }
  };

  const toggleSubmenu = useCallback(() => {
    setIsSubmenuOpen(prev => !prev);
  }, []);

  const handleNavigation = useCallback((href: string) => {
    router.push(href);
    toggleMenu(); // Close the mobile menu when navigating
  }, [router, toggleMenu]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Find all main menu items for navigation purposes
    const menuItems = document.querySelectorAll('[id^="mobile-nav-item-"]');
    const menuItemsArray = Array.from(menuItems) as HTMLElement[];
    const currentIndex = menuItemsArray.findIndex(el => el.id === mobileNavItemId);
    
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        toggleSubmenu();
        break;
      case 'Escape':
        e.preventDefault();
        if (isSubmenuOpen) {
          setIsSubmenuOpen(false);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (isSubmenuOpen) {
          // Focus first submenu item
          const firstSubmenuItem = document.getElementById(`mobile-submenu-item-${item.id}-${item.submenu[0].id}`);
          if (firstSubmenuItem) {
            firstSubmenuItem.focus();
          }
        } else {
          // If submenu is closed but there is a next main menu item, focus it
          if (currentIndex < menuItemsArray.length - 1) {
            menuItemsArray[currentIndex + 1].focus();
          } else {
            // If at the last main menu item, open its submenu if possible
            setIsSubmenuOpen(true);
            setTimeout(() => {
              const firstSubmenuItem = document.getElementById(`mobile-submenu-item-${item.id}-${item.submenu[0].id}`);
              if (firstSubmenuItem) {
                firstSubmenuItem.focus();
              }
            }, 50);
          }
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        
        // If at the top of the menu, focus the hamburger button
        if (currentIndex <= 0) {
          const hamburgerButton = document.querySelector('[aria-controls="mobile-menu"]') as HTMLElement;
          if (hamburgerButton) {
            hamburgerButton.focus();
          }
        } else {
          // Otherwise, focus the previous menu item
          menuItemsArray[currentIndex - 1].focus();
        }
        break;
    }
  }, [isSubmenuOpen, toggleSubmenu, mobileNavItemId, item.id, item.submenu]);

  // Handle keyboard navigation for submenu items
  const handleSubmenuKeyDown = useCallback((e: React.KeyboardEvent, subItemId: string, href: string) => {
    // Find the current item's index
    const currentItemIndex = item.submenu.findIndex(si => si.id === subItemId);
    
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleNavigation(href);
        break;
      case 'Escape':
        e.preventDefault();
        setIsSubmenuOpen(false);
        // Return focus to parent menu item
        const parentMenuItem = document.getElementById(mobileNavItemId);
        if (parentMenuItem) {
          parentMenuItem.focus();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (currentItemIndex <= 0) {
          // If at first item, focus parent menu item
          const parentMenuItem = document.getElementById(mobileNavItemId);
          if (parentMenuItem) {
            parentMenuItem.focus();
          }
        } else {
          // Focus previous submenu item
          const prevItem = document.getElementById(`mobile-submenu-item-${item.id}-${item.submenu[currentItemIndex - 1].id}`);
          if (prevItem) {
            prevItem.focus();
          }
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (currentItemIndex < item.submenu.length - 1) {
          // Focus next submenu item
          const nextItem = document.getElementById(`mobile-submenu-item-${item.id}-${item.submenu[currentItemIndex + 1].id}`);
          if (nextItem) {
            nextItem.focus();
          }
        } else {
          // Find the next main menu item
          const allMainItems = document.querySelectorAll('[id^="mobile-nav-item-"]');
          const mainItemsArray = Array.from(allMainItems) as HTMLElement[];
          const currentMainIndex = mainItemsArray.findIndex(el => el.id === mobileNavItemId);
          
          if (currentMainIndex < mainItemsArray.length - 1) {
            mainItemsArray[currentMainIndex + 1].focus();
          }
        }
        break;
    }
  }, [mobileNavItemId, handleNavigation, item.id, item.submenu]);

  return (
    <motion.div variants={DEFAULT_ANIMATIONS.submenuItem} role="presentation">
      <button
        id={mobileNavItemId}
        style={styles.navItem}
        onClick={toggleSubmenu}
        role="menuitem"
        aria-haspopup="true"
        aria-expanded={isSubmenuOpen}
        aria-controls={mobileSubmenuId}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div style={styles.content}>
          <span style={styles.label}>
            {item.label}
          </span>
        </div>
        
        <motion.div
          style={styles.arrow}
          variants={DEFAULT_ANIMATIONS.arrow}
          initial="closed"
          animate={isSubmenuOpen ? "open" : "closed"}
        >
          {getIconComponent('arrow', iconMapping)}
          <span style={styles.screenReaderOnly}>
            {isSubmenuOpen ? 'Collapse' : 'Expand'} {item.label} menu
          </span>
        </motion.div>
      </button>

      <AnimatePresence>
        {isSubmenuOpen && (
          <motion.div
            id={mobileSubmenuId}
            style={styles.submenuContainer}
            variants={DEFAULT_ANIMATIONS.submenu}
            initial="initial"
            animate="animate"
            exit="exit"
            role="menu"
            aria-labelledby={mobileNavItemId}
          >
            {item.submenu.map((subItem) => (
              <button
                key={subItem.id}
                id={`mobile-submenu-item-${item.id}-${subItem.id}`}
                style={{
                  ...styles.submenuItem,
                  ...(isActive && subItem.href === window.location.pathname ? styles.submenuItemActive : {})
                }}
                onClick={() => handleNavigation(subItem.href)}
                role="menuitem"
                tabIndex={0}
                onKeyDown={(e: React.KeyboardEvent) => handleSubmenuKeyDown(e, subItem.id, subItem.href)}
                aria-label={subItem.description ? `${subItem.label}: ${subItem.description}` : subItem.label}
              >
                <div style={styles.submenuItemLink}>
                  <span style={styles.submenuItemLabel}>
                    {subItem.label}
                  </span>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

// Display name for debugging
MobileNavItemComponent.displayName = 'MobileNavItemComponent';

/**
 * Mobile Menu Component
 * Memoized to prevent unnecessary re-renders
 * MODIFIED: Changed from left sidebar to top dropdown
 */
const MobileMenuComponent = memo(({
  isOpen,
  toggleMenu,
  items,
  isActiveRoute,
  mobileMenuStyle = {},
  iconMapping,
  isMobileView,
  logo,
  homeHref,
  mobileHeader,
  mobileTitle,
}: {
  isOpen: boolean;
  toggleMenu: () => void;
  items: NavItem[];
  isActiveRoute: (href: string) => boolean;
  mobileMenuStyle?: React.CSSProperties;
  iconMapping: Record<string, React.ComponentType>;
  isMobileView: boolean;
  logo?: React.ReactNode;
  homeHref?: string;
  mobileHeader?: React.ReactNode;
  mobileTitle?: string;
  mobileMenuIcon?: React.ReactNode;
}) => {
  const styles = {
    menuButton: {
      position: 'fixed' as const,
      top: '10px',
      left: '10px',
      zIndex: 201, // Higher than menu
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      border: 'none',
      color: 'var(--color-text, rgba(255, 255, 255, 0.8))',
      fontSize: '1.5rem',
      padding: '8px 12px',
      borderRadius: '4px',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: 'rgba(20, 20, 20, 0.95)',
        color: 'var(--color-accent, #fff)'
      }
    },
    mobileMenu: {
      display: 'none', // Will be overridden inline based on state
      position: 'fixed' as const,
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      background: 'rgba(8, 8, 8, 0.98)',
      zIndex: 200,
      overflowY: 'hidden', // Changed from 'auto' to 'hidden' to disable main container scroll
      overflowX: 'hidden' as const,
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      flexDirection: 'column' as const,
      transform: 'translateY(-100%)',
      opacity: 0,
      ...mobileMenuStyle
    },
    navItems: {
      display: 'flex',
      flexDirection: 'column' as const,
      width: '100%',
      padding: '0.5rem 0 0 0',
      marginTop: '0',
      overflowY: 'auto' as const,
      height: 'calc(100vh - 130px)', // Adjusted to account for header height
      paddingBottom: '2rem', // Extra padding at bottom for better scrolling
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column' as const,
      width: '100%',
      padding: '0.75rem',
      marginBottom: '0',
      position: 'sticky' as const,
      top: 0,
      backgroundColor: 'rgba(8, 8, 8, 0.98)',
      zIndex: 1
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '0.75rem'
    },
    titleContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: mobileHeader ? '0.75rem' : 0
    },
    logoLink: {
      display: 'flex',
      alignItems: 'center',
      color: 'var(--color-accent, #fff)',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    headerText: {
      color: 'var(--color-text, rgba(255, 255, 255, 0.8))',
      fontSize: '1.2rem',
      fontWeight: 'normal',
      textAlign: 'center' as const,
      margin: 0
    },
    titleText: {
      color: 'var(--color-accent, #fff)',
      fontSize: '1.4rem',
      fontWeight: 'bold',
      textAlign: 'center' as const,
      margin: 0,
      letterSpacing: '0.05em'
    }
  };

  // Set up keyboard navigation for the mobile menu
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Escape key to close the menu
      if (e.key === 'Escape') {
        e.preventDefault();
        toggleMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, toggleMenu]);
  
  return (
    <>
      <button 
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-label={`${isOpen ? 'Close' : 'Open'} navigation menu`}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'ArrowDown' && isOpen) {
            e.preventDefault();
            // Focus the first menu item when pressing down from hamburger button
            const firstMenuItem = document.getElementById(`mobile-nav-item-${items[0].id}`);
            if (firstMenuItem) {
              firstMenuItem.focus();
            }
          }
        }}
        style={{
          ...styles.menuButton,
          display: isMobileView ? 'flex' : 'none',
          backgroundColor: isOpen ? 'var(--color-accent, rgba(255, 215, 0, 0.7))' : 'rgba(8, 8, 8, 0.9)',
          color: isOpen ? '#000' : 'var(--color-text, rgba(255, 255, 255, 0.8))',
        }}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            style={{
              ...styles.mobileMenu,
              display: isMobileView ? 'flex' : 'none'
            }}
            variants={DEFAULT_ANIMATIONS.mobileMenu}
            initial="closed"
            animate="open"
            exit="closed"
            role="navigation"
            aria-label="Mobile Navigation"
          >
            {/* Logo, Title and Header section */}
            <div style={styles.header}>
              {logo && (
                <div style={styles.logoContainer}>
                  <Link href={homeHref || '/'} passHref>
                    <div 
                      style={styles.logoLink} 
                      tabIndex={0}
                      aria-label="Home"
                      onClick={toggleMenu} // Close menu when clicking logo
                    >
                      {logo}
                    </div>
                  </Link>
                </div>
              )}
              
              <div style={styles.titleContainer}>
                <div style={styles.titleText}>
                  {mobileTitle || 'Crescent'}
                </div>
              </div>
              
              {mobileHeader && (
                <div style={styles.headerText}>
                  {mobileHeader}
                </div>
              )}
            </div>
            
            {/* Navigation Items - Scrollable container */}
            <div 
              style={{
                ...styles.navItems,
                paddingTop: '0.5rem',
              }}
              role="menubar" 
              aria-label="Main Navigation"
              className="mobile-menu-scrollable"
            >
              {items.map((item) => (
                <MobileNavItemComponent
                  key={item.id}
                  item={item}
                  isActive={isActiveRoute(item.href)}
                  iconMapping={iconMapping}
                  toggleMenu={toggleMenu}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

// Display name for debugging
MobileMenuComponent.displayName = 'MobileMenuComponent';

// ==========================================================
// MAIN NAVIGATION BAR COMPONENT
// ==========================================================

/**
 * NavigationBar Component
 * 
 * A responsive, accessible navigation bar with desktop and mobile views.
 * Features include:
 * - Responsive design that adapts to different screen sizes
 * - Submenu support with hover or click activation
 * - Keyboard navigation and screen reader support
 * - Animated transitions for smooth user experience
 * - Mobile view with top dropdown menu that overlays content
 */
const NavigationBar: React.FC<NavigationBarProps> = ({
  // Content customization
  items = DEFAULT_NAV_ITEMS,
  logo = null,
  homeHref = '/',
  ariaLabel = "Main Navigation",
  showItemDescriptions = false,
  mobileHeader = null,
  
  // Dimensions
  height = '45px',
  width = '100%',
  maxWidth = 'auto',
  horizontalPadding = '1.5rem',
  verticalPadding = '0',
  zIndex = 100,
  itemGap = '1rem',
  
  // Behavior
  submenuBehavior = 'hover',
  submenuCloseDelay = 200,
  hideOnScroll = true,
  scrollThreshold = 2,
  
  // Visual customization
  backgroundColor = 'rgba(8, 8, 8, 0.65)',
  backdropFilter = 'blur(12px)',
  borderStyle = '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow = '0 8px 16px -2px rgba(0, 0, 0, 0.15)',
  
  // Responsive behavior
  mobileBreakpoint = 768,
  
  // Mobile options
  mobileTitle = 'Crescent',
  mobileMenuIcon,
  
  // Icons
  iconMapping = {},
}) => {
  // Combine default icons with custom ones
  const mergedIconMapping = { ...DEFAULT_ICON_MAPPING, ...iconMapping };
  
  // State management
  const [isClient, setIsClient] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const scrollPositionRef = useRef(0); // Add this line to define scrollPositionRef
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  
  // Styling based on props
  const styles = {
    navContainer: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      width,
      zIndex,
      backdropFilter,
      WebkitBackdropFilter: backdropFilter,
      background: backgroundColor,
      padding: `${verticalPadding} ${horizontalPadding}`,
      height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'transform 0.3s ease, background-color 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease',
      transform: visible ? 'translateY(0)' : 'translateY(-100%)',
      opacity: visible ? 1 : 0,
      boxShadow: visible ? boxShadow : 'none',
      borderBottom: borderStyle,
    },
    navContent: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      maxWidth,
      margin: '0 auto',
      justifyContent: 'center'
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      position: 'absolute' as const,
      left: '3rem',
      opacity: 1,
    },
    logoLink: {
      display: 'flex',
      alignItems: 'center',
      color: 'var(--color-accent, #fff)',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      '&:hover': {
        color: 'var(--color-accent-light, #fff)',
      }
    },
    navItemsContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: itemGap,
      opacity: 1,
    },
    screenReaderOnly: {
      position: 'absolute' as const,
      width: '1px',
      height: '1px',
      padding: 0,
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap' as const,
      borderWidth: 0,
    }
  };
  
  // Store the last focused element before opening a submenu
  useEffect(() => {
    if (activeItemId) {
      // Save the currently focused element
      lastFocusedElementRef.current = document.activeElement as HTMLElement;
    } else if (lastFocusedElementRef.current) {
      // When closing the submenu, restore focus
      lastFocusedElementRef.current.focus();
      lastFocusedElementRef.current = null;
    }
  }, [activeItemId]);
  
  // Clear any existing timeout when component unmounts
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Handle closing submenus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Skip if no submenu is open or not using click behavior
      if (!activeItemId || submenuBehavior !== 'click') return;
      
      const target = event.target as HTMLElement;
      
      // Check if click is inside a submenu
      const submenuContainer = document.getElementById(`submenu-${activeItemId}`);
      const isInsideSubmenu = submenuContainer?.contains(target);
      
      // Check if click is on a navigation item
      const navItemAttr = target.closest('[data-nav-item]')?.getAttribute('data-nav-item');
      const isNavItemClick = navItemAttr !== undefined;
      
      // If click is outside both submenu and the active nav item, close the submenu
      if (!isInsideSubmenu && (!isNavItemClick || navItemAttr !== activeItemId)) {
        setActiveItemId(null);
      }
    };
    
    // Only add listener for click behavior
    if (submenuBehavior === 'click') {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      if (submenuBehavior === 'click') {
        document.removeEventListener('mousedown', handleClickOutside);
      }
    };
  }, [activeItemId, submenuBehavior]);
  
  // Check if route matches the current path
  const isActiveRoute = useCallback((href: string) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  }, [pathname]);
  
  // Handle delayed submenu closing
  const closeSubmenuWithDelay = useCallback(() => {
    // Only use delay for hover behavior
    if (submenuBehavior !== 'hover') return;
    
    // Clear any existing timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    
    // Set a new timeout to close the submenu
    closeTimeoutRef.current = setTimeout(() => {
      setActiveItemId(null);
    }, submenuCloseDelay); // Use configurable delay
  }, [submenuBehavior, submenuCloseDelay]);
  
  // Cancel submenu closing if mouse reenters submenu
  const cancelSubmenuClosing = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);
  
  // Handle hovering over navigation items
  const handleNavItemMouseEnter = useCallback((itemId: string) => {
    if (submenuBehavior === 'hover') {
      cancelSubmenuClosing();
      setActiveItemId(itemId);
    }
  }, [cancelSubmenuClosing, submenuBehavior]);
  
  // Handle mouse leaving navigation items
  const handleNavItemMouseLeave = useCallback(() => {
    if (submenuBehavior === 'hover') {
      closeSubmenuWithDelay();
    }
  }, [closeSubmenuWithDelay, submenuBehavior]);
  
  // Toggle mobile menu open/closed
  const toggleMobileMenu = useCallback(() => {
    if (isMobileView) {
      setIsMobileMenuOpen(prev => !prev);
    }
  }, [isMobileView]);

  // Handle scroll behavior
  useEffect(() => {
    if (!isClient || !hideOnScroll) return;
    
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      
      // Determine if navbar should be visible
      const scrollingUp = prevScrollPos > currentScrollPos;
      const atTop = currentScrollPos < 10;
      const significantChange = Math.abs(currentScrollPos - prevScrollPos) > scrollThreshold;
      
      // Update visibility based on conditions
      if (atTop || (scrollingUp && significantChange)) {
        setVisible(true);
      } else if (!scrollingUp && significantChange && !isMobileMenuOpen) {
        setVisible(false);
      }
      
      setPrevScrollPos(currentScrollPos);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isClient, prevScrollPos, isMobileMenuOpen, hideOnScroll, scrollThreshold]);

  // Client-side initialization and responsive handling
  useEffect(() => {
    setIsClient(true);
    setPrevScrollPos(window.scrollY);
    
    // Check if in mobile view based on window width compared to breakpoint
    // This enables responsive behavior switching between desktop and mobile layouts
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth <= mobileBreakpoint);
    };
    
    // Initial check on component mount
    checkMobileView();
    
    // Re-check on window resize to handle orientation changes or browser resizing
    window.addEventListener('resize', checkMobileView);
    
    // Add a skip link for keyboard users to bypass navigation
    const addSkipLink = () => {
      if (!document.getElementById('skip-to-content')) {
        const skipLink = document.createElement('a');
        skipLink.id = 'skip-to-content';
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.style.position = 'absolute';
        skipLink.style.top = '-40px';
        skipLink.style.left = '0';
        skipLink.style.background = 'var(--color-accent, #fff)';
        skipLink.style.color = '#000';
        skipLink.style.padding = '8px';
        skipLink.style.zIndex = '1001';
        skipLink.style.transition = 'top 0.3s';
        
        // Show the skip link when it receives focus
        skipLink.addEventListener('focus', () => {
          skipLink.style.top = '0';
        });
        
        skipLink.addEventListener('blur', () => {
          skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
      }
    };
    
    addSkipLink();
    
    // Clean up
    return () => {
      window.removeEventListener('resize', checkMobileView);
      if (isMobileMenuOpen) {
        document.body.style.overflow = '';
      }
    };
  }, [mobileBreakpoint, isMobileMenuOpen]);
  
  // Effect to handle body overflow when mobile menu is open/closed
  useEffect(() => {
    if (!isClient) return;
    
    // Use a stable reference for scroll position
    const scrollRef = scrollPositionRef;
    
    if (isMobileMenuOpen && isMobileView) {
      // Store current scroll position
      const currentScrollPos = window.pageYOffset || document.documentElement.scrollTop;
      scrollRef.current = currentScrollPos;
      
      // Calculate scrollbar width to prevent content shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Apply styles to html and body
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.touchAction = 'none'; // Disable touch scrolling
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${currentScrollPos}px`;
    } else if (isClient) {
      // Remove scroll lock styles
      document.documentElement.style.overflow = '';
      document.documentElement.style.paddingRight = '';
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.style.touchAction = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      
      // Restore scroll position
      window.scrollTo(0, scrollRef.current);
    }
    
    return () => {
      // Clean up when component unmounts
      if (isClient) {
        document.documentElement.style.overflow = '';
        document.documentElement.style.paddingRight = '';
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.body.style.touchAction = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollRef.current);
      }
    };
  }, [isMobileMenuOpen, isMobileView, isClient]);

  if (!isClient) return null;

  return (
    <NavContext.Provider value={{ 
      activeItemId, 
      setActiveItemId, 
      visible,
      focusedItemId,
      setFocusedItemId
    }}>
      {/* Desktop Navigation Bar - hidden on mobile */}
      {!isMobileView && (
        <nav 
          style={{
            ...styles.navContainer,
            transform: visible ? 'translateY(0)' : 'translateY(-100%)',
            opacity: visible ? 1 : 0,
            boxShadow: visible ? boxShadow : 'none',
          }}
          role="navigation" 
          aria-label={ariaLabel}
        >
          <div style={styles.navContent}>
            {/* Logo */}
            {logo && (
              <div style={styles.logoContainer}>
                <Link href={homeHref} passHref>
                  <div style={styles.logoLink} tabIndex={0} aria-label="Home">
                    {logo}
                  </div>
                </Link>
              </div>
            )}

            {/* Desktop Navigation */}
            <div 
              style={styles.navItemsContainer}
              role="menubar" 
              aria-label="Main Menu"
            >
              {items.map((item, index) => (
                <DesktopNavItemComponent
                  key={item.id}
                  item={item}
                  isActive={isActiveRoute(item.href)}
                  onMouseEnter={() => handleNavItemMouseEnter(item.id)}
                  onMouseLeave={handleNavItemMouseLeave}
                  itemIndex={index}
                  iconMapping={mergedIconMapping}
                  submenuBehavior={submenuBehavior}
                />
              ))}
            </div>
          </div>
        </nav>
      )}
      
      {/* Persistent global submenu with dynamic content - desktop only */}
      {!isMobileView && (
        <GlobalSubmenuComponent 
          items={items} 
          activeItemId={activeItemId} 
          onMouseEnter={cancelSubmenuClosing}
          onMouseLeave={handleNavItemMouseLeave}
          showItemDescriptions={showItemDescriptions}
          submenuBehavior={submenuBehavior}
          iconMapping={mergedIconMapping}
        />
      )}
      
      {/* Mobile Menu Button - Fixed position for mobile only */}
      {isMobileView && (
        <button 
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={`${isMobileMenuOpen ? 'Close' : 'Open'} navigation menu`}
          style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            zIndex: 201,
            display: visible ? 'flex' : 'none', // Hide when scrolling down
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            color: isMobileMenuOpen ? 'var(--color-accent, #fff)' : 'var(--color-text, rgba(255, 255, 255, 0.8))',
            fontSize: '1.5rem',
            padding: '0.5rem',
            cursor: 'pointer',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(-100%)'
          }}
        >
          {isMobileMenuOpen ? '✕' : mobileMenuIcon || '☰'}
        </button>
      )}
      
      {/* Mobile Menu Dropdown */}
      <MobileMenuComponent 
        isOpen={isMobileMenuOpen}
        toggleMenu={toggleMobileMenu}
        items={items}
        isActiveRoute={isActiveRoute}
        iconMapping={mergedIconMapping}
        isMobileView={isMobileView}
        logo={logo}
        homeHref={homeHref}
        mobileHeader={mobileHeader}
        mobileTitle={mobileTitle}
        mobileMenuIcon={mobileMenuIcon}
      />
    </NavContext.Provider>
  );
};

export default memo(NavigationBar);