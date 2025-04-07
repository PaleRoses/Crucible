import React from 'react';

/**
 * Navigation Types - Combined exports
 */

// Types and interfaces
export interface BaseMenuItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode | string;
}

export interface SubmenuItem extends BaseMenuItem {
  description?: string;
}

export interface NavItem extends BaseMenuItem {
  submenu?: SubmenuItem[];
}

export interface NavigationBarProps {
  // Content Configuration
  items?: NavItem[];
  logo?: React.ReactNode;
  homeHref?: string;
  ariaLabel?: string;
  showItemDescriptions?: boolean;
  iconMapping?: Record<string, React.ComponentType<any>>;
  mobileHeader?: React.ReactNode;
  mobileTitle?: string;
  mobileMenuIcon?: React.ReactNode | string;
  closeMenuIcon?: React.ReactNode | string;
  /** Action items for the navbar (used in desktop right and mobile menu bottom) */
  actionItems?: React.ReactNode;


  // Layout & Dimensions
  height?: string | number;
  maxWidth?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  horizontalPadding?: string;
  verticalPadding?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
  zIndex?: number | string;
  itemGap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  // Behavior
  mobileBreakpoint?: number;
  submenuBehavior?: 'hover' | 'click';
  submenuCloseDelay?: number;
  hideOnScroll?: boolean;
  scrollThreshold?: number;

  // Visual Styling
  backdropFilter?: string;
  border?: boolean;
  boxShadow?: string;
  submenuWidth?: 'auto' | 'full';
  submenuPosition?: 'center' | 'left' | 'right';
}

// Constants
export const DESKTOP_NAV_ITEM_CLASS = 'desktop-nav-item';
export const DESKTOP_SUBMENU_ITEM_CLASS = 'desktop-submenu-item';
export const MOBILE_NAV_ITEM_CLASS = 'mobile-nav-item';
export const MOBILE_SUBMENU_ITEM_CLASS = 'mobile-submenu-item';
export const MOBILE_MENU_BUTTON_CLASS = 'mobile-menu-button';

// --- UPDATED: Animation variants with seamless transitions ---
export const ANIMATIONS = {
  navItem: {
    idle: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }
  },
  arrow: {
    closed: { rotate: 0, transition: { duration: 0.15 } },
    open: { rotate: 180, transition: { duration: 0.15 } }
  },
  submenu: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }
  },
  // Enhanced slide animations - slower for smoother transitions
  submenuContentSlideRight: {
    initial: { x: -40, opacity: 0 },
    animate: { 
      x: 0, 
      opacity: 1, 
      transition: { 
        x: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
      } 
    },
    exit: { 
      x: 40, 
      opacity: 0,
      transition: { 
        x: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }
      } 
    }
  },
  submenuContentSlideLeft: {
    initial: { x: 40, opacity: 0 },
    animate: { 
      x: 0, 
      opacity: 1, 
      transition: { 
        x: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
      } 
    },
    exit: { 
      x: -40, 
      opacity: 0,
      transition: { 
        x: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }
      } 
    }
  },
  // Container for staggered children
  submenuItemsContainer: {
    animate: { 
      transition: { 
        staggerChildren: 0.05, // Slightly slower stagger
        delayChildren: 0.15    // Slightly longer delay
      } 
    }
  },
  // Individual item stagger animation
  submenuItemStagger: {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3, ease: [0.4, 0, 1, 1] }
    }
  },
  // Original animations maintained for compatibility
  submenuItem: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  },
  mobileMenu: {
    closed: { opacity: 0, y: '-100%', transition: { duration: 0.12, ease: [0.4, 0, 1, 1] } },
    open: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }
  },
  mobileMenuItem: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.1 } }
  },
  mobileSubmenu: {
    initial: { height: 0, opacity: 0 },
    animate: { height: 'auto', opacity: 1, transition: { duration: 0.25 } },
    exit: { height: 0, opacity: 0, transition: { duration: 0.2 } }
  }
};
// --- End Animation variants ---