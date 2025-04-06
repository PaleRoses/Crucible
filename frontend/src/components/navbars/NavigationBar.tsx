import React, { useState, useCallback, useEffect, useContext, useRef, memo, useMemo } from 'react';

import { motion, AnimatePresence, useAnimation, Variants, MotionStyle } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

// --- Custom Hooks ---

/**
 * Hook for handling keyboard navigation in desktop menu items
 * @param navItemId - ID of the current nav item element
 * @param submenuId - ID of the submenu associated with this item (if any)
 * @param hasSubmenu - Whether this item has a submenu
 * @param isItemActive - Whether the submenu is currently active/open
 * @param setActiveItemId - Function to set the active submenu ID
 * @param handleClick - Function to handle item click action
 * @returns A keydown event handler function
 */
function useMenuItemKeyboardNav(
  navItemId: string,
  submenuId: string,
  hasSubmenu: boolean,
  isItemActive: boolean,
  setActiveItemId: (id: string | null) => void,
  handleClick: () => void
) {
  return useCallback((e: React.KeyboardEvent) => {
    const parentNav = (e.target as HTMLElement).closest('[role="menubar"]');
    if (!parentNav) return;
    const navItems = Array.from(parentNav.querySelectorAll<HTMLElement>('[role="menuitem"][id^="nav-item-"]'));
    const currentItemIndex = navItems.findIndex(navItem => navItem.id === navItemId);

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleClick();
        break;
      case 'Escape':
        e.preventDefault();
        setActiveItemId(null);
        // Move focus back to the button itself
        (e.target as HTMLElement).focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (hasSubmenu) {
          if (!isItemActive) {
            setActiveItemId(navItemId.replace('nav-item-', '')); // Open submenu
          }
          // Use timeout to ensure submenu is rendered before focusing
          setTimeout(() => {
            const firstSubmenuItem = document.querySelector<HTMLElement>(`#${submenuId} [role="menuitem"]`);
            firstSubmenuItem?.focus();
          }, 50);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (currentItemIndex > 0) {
          navItems[currentItemIndex - 1]?.focus();
        } else {
          navItems[navItems.length - 1]?.focus(); // Wrap around
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (currentItemIndex < navItems.length - 1) {
          navItems[currentItemIndex + 1]?.focus();
        } else {
          navItems[0]?.focus(); // Wrap around
        }
        break;
      case 'Home':
        e.preventDefault();
        navItems[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        navItems[navItems.length - 1]?.focus();
        break;
    }
  }, [navItemId, submenuId, hasSubmenu, isItemActive, setActiveItemId, handleClick]);
}

/**
 * Hook for handling keyboard navigation within a submenu
 * @param submenuRef - Reference to the submenu container element
 * @param activeItemId - ID of the currently active/open submenu item
 * @param setActiveItemId - Function to set/clear the active submenu
 * @returns void - Sets up event listeners internally
 */
function useSubmenuKeyboardNav(
  submenuRef: React.RefObject<HTMLElement | null>,
  activeItemId: string | null,
  setActiveItemId: (id: string | null) => void
) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!activeItemId || !submenuRef.current) return;

    const focusableElements = Array.from(
      submenuRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]')
    );
    if (focusableElements.length === 0) return;

    const focusedElement = document.activeElement as HTMLElement;
    let focusedIndex = focusableElements.indexOf(focusedElement);

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setActiveItemId(null);
        // Return focus to the trigger button
        document.getElementById(`nav-item-${activeItemId}`)?.focus();
        break;
      case 'ArrowDown':
      case 'ArrowRight': // Treat right arrow like down for grid/list
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < focusableElements.length - 1) {
          focusableElements[focusedIndex + 1]?.focus();
        } else if (focusableElements.length > 0) {
          focusableElements[0]?.focus(); // Wrap to start
        }
        break;
      case 'ArrowUp':
      case 'ArrowLeft': // Treat left arrow like up
        e.preventDefault();
        if (focusedIndex > 0) {
          focusableElements[focusedIndex - 1]?.focus();
        } else if (focusableElements.length > 0) {
          focusableElements[focusableElements.length - 1]?.focus(); // Wrap to end
        }
        break;
      case 'Home':
        e.preventDefault();
        focusableElements[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        focusableElements[focusableElements.length - 1]?.focus();
        break;
      case 'Tab':
        // Simplified focus trapping
        if (focusableElements.length > 0) {
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          if (e.shiftKey) { // Shift + Tab
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus(); // Wrap to end
            }
          } else { // Tab
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus(); // Wrap to start
            }
          }
        } else {
          e.preventDefault(); // No items, prevent tabbing out
          document.getElementById(`nav-item-${activeItemId}`)?.focus();
        }
        break;
    }
  }, [activeItemId, setActiveItemId, submenuRef]);

  // Add/remove keydown listener when submenu is active
  useEffect(() => {
    if (activeItemId) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeItemId, handleKeyDown]);
}

/**
 * Hook for handling keyboard navigation in mobile menu items
 * @param mobileNavItemId - ID of the current mobile nav item
 * @param mobileSubmenuId - ID of the submenu associated with this item
 * @param hasSubmenu - Whether this item has a submenu
 * @param isSubmenuOpen - Whether the submenu is currently open
 * @param toggleSubmenu - Function to toggle the submenu open/closed
 * @param toggleMenu - Function to close the entire mobile menu (for navigation)
 * @returns A keydown event handler function
 */
function useMobileMenuItemKeyboardNav(
  mobileNavItemId: string,
  mobileSubmenuId: string,
  hasSubmenu: boolean,
  isSubmenuOpen: boolean,
  toggleSubmenu: () => void,
  toggleMenu: () => void
) {
  return useCallback((e: React.KeyboardEvent) => {
    const parentMenu = (e.target as HTMLElement).closest('[role="menubar"]');
    if (!parentMenu) return;
    const menuItems = Array.from(parentMenu.querySelectorAll<HTMLElement>('[role="menuitem"][id^="mobile-nav-item-"]'));
    const currentIndex = menuItems.findIndex(el => el.id === mobileNavItemId);

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        toggleSubmenu(); // Open/close submenu or navigate if no submenu
        break;
      case 'Escape':
        e.preventDefault();
        // If submenu is open, close it. Keep focus on the button.
        if (isSubmenuOpen) {
          toggleSubmenu();
          (e.target as HTMLElement).focus();
        }
        // If submenu is closed, the main menu's Escape handler should take over
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (isSubmenuOpen && hasSubmenu) {
          // Focus the first item in the open submenu
          document.querySelector<HTMLElement>(`#${mobileSubmenuId} [role="menuitem"]`)?.focus();
        } else if (currentIndex < menuItems.length - 1) {
          // Focus the next main menu item
          menuItems[currentIndex + 1]?.focus();
        } else {
          // Wrap around to the first item if at the end
          menuItems[0]?.focus();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex > 0) {
          // Focus the previous main menu item
          menuItems[currentIndex - 1]?.focus();
        } else {
          // Focus the hamburger button (or logo if available) when at the top
          const hamburgerButton = document.querySelector<HTMLElement>('[aria-controls="mobile-menu"]');
          const logoLink = document.querySelector<HTMLElement>('#mobile-menu [role="link"][aria-label="Home"]');
          (logoLink || hamburgerButton)?.focus();
        }
        break;
      case 'Home':
        e.preventDefault();
        menuItems[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        menuItems[menuItems.length - 1]?.focus();
        break;
    }
  }, [mobileNavItemId, mobileSubmenuId, hasSubmenu, isSubmenuOpen, toggleSubmenu, toggleMenu]);
}

/**
 * Hook for handling keyboard navigation within mobile submenu items
 * @param mobileNavItemId - ID of the parent mobile nav item
 * @param parentId - ID of the parent item
 * @param setIsSubmenuOpen - Function to set the submenu open state
 * @param handleNavigation - Function to handle navigation
 * @returns A function that creates a keydown handler for a specific submenu item
 */
function useMobileSubmenuKeyboardNav(
  mobileNavItemId: string,
  parentId: string,
  setIsSubmenuOpen: (isOpen: boolean) => void,
  handleNavigation: (href: string) => void
) {
  // Return a function that creates a keydown handler for a specific submenu item
  return useCallback((subItemId: string, href: string) => {
    // Return the actual keydown handler
    return (e: React.KeyboardEvent) => {
      const parentSubmenu = (e.target as HTMLElement).closest('[role="menu"]');
      if (!parentSubmenu) return;
      const submenuItems = Array.from(parentSubmenu.querySelectorAll<HTMLElement>('[role="menuitem"]'));
      const currentSubIndex = submenuItems.findIndex(si => si.id === `mobile-submenu-item-${parentId}-${subItemId}`);

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          handleNavigation(href); // Navigate and close menu
          break;
        case 'Escape':
          e.preventDefault();
          setIsSubmenuOpen(false); // Close the submenu
          document.getElementById(mobileNavItemId)?.focus(); // Focus the parent button
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (currentSubIndex > 0) {
            submenuItems[currentSubIndex - 1]?.focus();
          } else {
            // Reached top of submenu, focus the parent button
            document.getElementById(mobileNavItemId)?.focus();
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (currentSubIndex < submenuItems.length - 1) {
            submenuItems[currentSubIndex + 1]?.focus();
          } else {
            // Reached end of submenu, focus the next main nav item (if exists)
            const parentMenu = document.getElementById(mobileNavItemId)?.closest('[role="menubar"]');
            if (parentMenu) {
              const menuItems = Array.from(parentMenu.querySelectorAll<HTMLElement>('[role="menuitem"][id^="mobile-nav-item-"]'));
              const parentIndex = menuItems.findIndex(el => el.id === mobileNavItemId);
              if (parentIndex < menuItems.length - 1) {
                menuItems[parentIndex + 1]?.focus();
                setIsSubmenuOpen(false); // Close current submenu when moving to next main item
              } else {
                // Wrap to first main item
                menuItems[0]?.focus();
                setIsSubmenuOpen(false);
              }
            }
          }
          break;
        case 'Tab':
          // Basic focus trapping within submenu
          if (submenuItems.length > 0) {
            const firstElement = submenuItems[0];
            const lastElement = submenuItems[submenuItems.length - 1];
            if (e.shiftKey) { // Shift + Tab
              if (document.activeElement === firstElement) {
                e.preventDefault();
                document.getElementById(mobileNavItemId)?.focus(); // Go to parent trigger
              }
            } else { // Tab
              if (document.activeElement === lastElement) {
                e.preventDefault();
                // Go to next main item or wrap
                const parentMenu = document.getElementById(mobileNavItemId)?.closest('[role="menubar"]');
                if (parentMenu) {
                  const menuItems = Array.from(parentMenu.querySelectorAll<HTMLElement>('[role="menuitem"][id^="mobile-nav-item-"]'));
                  const parentIndex = menuItems.findIndex(el => el.id === mobileNavItemId);
                  if (parentIndex < menuItems.length - 1) {
                    menuItems[parentIndex + 1]?.focus();
                  } else {
                    menuItems[0]?.focus(); // Wrap main menu
                  }
                  setIsSubmenuOpen(false); // Close current submenu
                }
              }
            }
          } else {
            e.preventDefault(); // Prevent tabbing out if no items
            document.getElementById(mobileNavItemId)?.focus();
          }
          break;
      }
    };
  }, [mobileNavItemId, parentId, setIsSubmenuOpen, handleNavigation]);
}

/**
 * Hook for handling modal dialog behavior (focus trapping, escape key, etc.)
 * @param isOpen - Whether the modal is currently open
 * @param onClose - Function to close the modal
 * @param modalId - ID of the modal element
 * @returns Focus management utilities
 */
function useModalBehavior(
  isOpen: boolean,
  onClose: () => void,
  modalId: string
) {
  // Set up focus management when modal opens/closes
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose(); // Close the modal
      }
      // Basic focus trapping
      else if (e.key === 'Tab') {
        const focusableSelector = `#${modalId} [role="menuitem"], #${modalId} [role="link"], #${modalId} button, #${modalId} a`;
        const focusableElements = Array.from(document.querySelectorAll<HTMLElement>(focusableSelector));

        if (focusableElements.length > 0) {
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          const currentActive = document.activeElement as HTMLElement;

          if (e.shiftKey) { // Shift + Tab
            if (currentActive === firstElement) {
              e.preventDefault();
              lastElement.focus(); // Wrap to end
            }
          } else { // Tab
            if (currentActive === lastElement) {
              e.preventDefault();
              firstElement.focus(); // Wrap to start
            }
          }
        } else {
          e.preventDefault(); // No focusable items, prevent tabbing out
        }
      }
    };

    // Focus the first item when modal opens
    setTimeout(() => {
      // Prioritize logo link, then first menu item
      const firstFocusableElement = document.querySelector<HTMLElement>(
        `#${modalId} [role="link"][aria-label="Home"], #${modalId} [role="menuitem"]`
      );
      firstFocusableElement?.focus();
    }, 100); // Delay to allow animation

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, modalId]);
}

/**
 * Hook to determine if a given route is active based on the current path
 * @returns A function that checks if a given href is active
 */
function useIsActiveRoute() {
  const pathname = usePathname();

  return useCallback((href: string) => {
    if (!pathname || !href) return false;

    // Handle home explicitly
    if (href === '/') return pathname === '/';

    // Normalize paths to ensure trailing slashes don't break comparison
    const normalizedHref = href.endsWith('/') ? href : `${href}/`;
    const normalizedPathname = pathname.endsWith('/') ? pathname : `${pathname}/`;

    // Check for exact match or if pathname starts with the href (for parent routes)
    return pathname === href || normalizedPathname.startsWith(normalizedHref);
  }, [pathname]);
}

function useSubmenuManager(submenuBehavior: 'hover' | 'click', submenuCloseDelay: number) {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  // Store and restore focus state when activating/deactivating submenu
  useEffect(() => {
    if (activeItemId) {
      lastFocusedElementRef.current = document.activeElement as HTMLElement;
    } else if (lastFocusedElementRef.current) {
      // Check if the element still exists and is focusable
      if (document.body.contains(lastFocusedElementRef.current) && lastFocusedElementRef.current.focus) {
         try {
            lastFocusedElementRef.current.focus();
         } catch (e) {
            console.warn("Failed to restore focus:", e);
         }
      }
      lastFocusedElementRef.current = null;
    }
  }, [activeItemId]);


  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Handle delayed submenu closing for hover behavior
  const closeSubmenuWithDelay = useCallback(() => {
    if (submenuBehavior !== 'hover') return;

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }

    closeTimeoutRef.current = setTimeout(() => {
      setActiveItemId(null);
    }, submenuCloseDelay);
  }, [submenuBehavior, submenuCloseDelay]);

  // Cancel submenu closing if mouse re-enters
  const cancelSubmenuClosing = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  // Handle mouse enter for menu items
  const handleNavItemMouseEnter = useCallback((itemId: string) => {
    if (submenuBehavior === 'hover') {
      cancelSubmenuClosing();
      setActiveItemId(itemId);
    }
  }, [cancelSubmenuClosing, submenuBehavior]);

  // Handle mouse leave for menu items
  const handleNavItemMouseLeave = useCallback(() => {
    if (submenuBehavior === 'hover') {
      closeSubmenuWithDelay();
    }
  }, [closeSubmenuWithDelay, submenuBehavior]);

  return {
    activeItemId,
    setActiveItemId,
    handleNavItemMouseEnter,
    handleNavItemMouseLeave,
    cancelSubmenuClosing,
    closeSubmenuWithDelay
  };
}

function useResponsiveNavigation(mobileBreakpoint: number, hideOnScroll: boolean, scrollThreshold: number) {
  const [isClient, setIsClient] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const scrollPositionRef = useRef(0);

  // Client-side initialization and responsive handling
  useEffect(() => {
    setIsClient(true);
    // Ensure window object is available
    if (typeof window !== 'undefined') {
        setPrevScrollPos(window.scrollY);

        const checkMobileView = () => {
            setIsMobileView(window.innerWidth <= mobileBreakpoint);
        };

        checkMobileView(); // Initial check
        window.addEventListener('resize', checkMobileView);

        // Cleanup listener on unmount
        return () => {
            window.removeEventListener('resize', checkMobileView);
            // Clean up body style only if menu was open and is now closing/unmounting
            if (isMobileMenuOpen) {
                document.body.style.overflow = '';
                document.documentElement.style.overflow = '';
                document.documentElement.style.paddingRight = '';
                document.body.style.paddingRight = '';
                document.body.style.touchAction = '';
                document.body.style.position = '';
                document.body.style.width = '';
                document.body.style.top = '';
            }
        };
    }
    // Return an empty cleanup function if window is not defined (SSR)
    return () => {};
  }, [mobileBreakpoint, isMobileMenuOpen]); // Dependency array


  // Toggle mobile menu
  const toggleMobileMenu = useCallback(() => {
    if (isMobileView) {
      const mobileMenuButton = document.querySelector('[aria-controls="mobile-menu"]') as HTMLElement;
      const wasOpen = isMobileMenuOpen;

      setIsMobileMenuOpen(prev => !prev);

      // Restore focus to the button after closing the menu
      if (wasOpen && mobileMenuButton) {
        setTimeout(() => {
          // Check if button still exists before focusing
          if (document.body.contains(mobileMenuButton)) {
             mobileMenuButton.focus();
          }
        }, 50); // Short delay ensures transition completes
      }
    }
  }, [isMobileView, isMobileMenuOpen]);

  // Scroll behavior
  useEffect(() => {
    if (!isClient || !hideOnScroll || typeof window === 'undefined') return;

    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      const scrollingUp = prevScrollPos > currentScrollPos;
      const atTop = currentScrollPos < 10;
      const significantChange = Math.abs(currentScrollPos - prevScrollPos) > scrollThreshold;

      if (atTop || (scrollingUp && significantChange)) {
        setVisible(true);
      } else if (!scrollingUp && significantChange && !isMobileMenuOpen) {
        // Only hide if scrolling down significantly AND mobile menu is closed
        setVisible(false);
      }

      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isClient, prevScrollPos, isMobileMenuOpen, hideOnScroll, scrollThreshold]);

  // Handle body scroll lock for mobile menu
  useEffect(() => {
    // Ensure this runs only on the client
    if (!isClient || typeof window === 'undefined') return;

    const scrollRef = scrollPositionRef;
    let scrollbarWidth = 0; // Initialize scrollbarWidth

    if (isMobileMenuOpen && isMobileView) {
      const currentScrollPos = window.pageYOffset || document.documentElement.scrollTop;
      scrollRef.current = currentScrollPos; // Store scroll position

      // Calculate scrollbar width only if locking scroll
      scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      // Apply styles to lock scroll
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.touchAction = 'none'; // Prevent touch scroll on body
      document.body.style.position = 'fixed'; // Use fixed position to lock scroll
      document.body.style.width = '100%';
      document.body.style.top = `-${currentScrollPos}px`; // Maintain scroll position visually
    } else {
      // Remove styles to unlock scroll
      // Check if styles were previously applied before removing them
      if (document.documentElement.style.overflow === 'hidden') {
          document.documentElement.style.overflow = '';
          document.documentElement.style.paddingRight = '';
      }
      if (document.body.style.overflow === 'hidden') {
          document.body.style.overflow = '';
          document.body.style.paddingRight = '';
          document.body.style.touchAction = '';
          document.body.style.position = '';
          document.body.style.width = '';
          document.body.style.top = '';

          // Restore scroll position only when unlocking
          // Use requestAnimationFrame to ensure styles are removed before scrolling
          requestAnimationFrame(() => {
              window.scrollTo(0, scrollRef.current);
          });
      }
    }

    // Cleanup function to ensure styles are removed on unmount
    return () => {
      // Check again if styles might still be applied (e.g., fast unmount)
      if (document.documentElement.style.overflow === 'hidden') {
        document.documentElement.style.overflow = '';
        document.documentElement.style.paddingRight = '';
      }
       if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.body.style.touchAction = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
         // Restore scroll on cleanup only if necessary (e.g., if menu was open)
         // Be cautious here, might conflict with navigation scroll restoration
         // window.scrollTo(0, scrollRef.current);
      }
    };
  }, [isMobileMenuOpen, isMobileView, isClient]); // Dependencies

  return {
    isClient,
    isMobileView,
    isMobileMenuOpen,
    visible,
    toggleMobileMenu
    // Removed unused scrollPositionRef from return
  };
}


// --- Types & Interfaces ---

// Radically simplified color interface - just 5 colors
interface Colors {
  /** Primary accent color (e.g., gold, main brand color) - Used for highlights, active states, icons. */
  primary: string;
  /** Main background color (e.g., dark gray, white) - Used for the navbar, submenus, mobile menu background. */
  secondary: string;
  /** Subtle border or divider color (e.g., light gray, transparent white) - Used for borders, dividers. */
  tertiary: string;
  /** Default text color (e.g., light gray, dark gray) - Used for navigation item labels, descriptions. */
  text: string;
  /** Glow or intense hover effect color (e.g., transparent gold, light blue) - Used for logo hover, interactive highlights. */
  glow: string;
}

export interface BaseMenuItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode | string; // Can be a node or a key for iconMapping
}

export interface SubmenuItem extends BaseMenuItem {
  description?: string;
}

export interface NavItem extends BaseMenuItem {
  submenu: SubmenuItem[];
}

export interface NavigationBarProps {
  // --- Content Configuration ---
  /** Array of navigation items and their submenus. */
  items?: NavItem[];
  /** Logo component to display. */
  logo?: React.ReactNode;
  /** URL for the home link (used by the logo). */
  homeHref?: string;
  /** ARIA label for the main navigation container. */
  ariaLabel?: string;
  /** Whether to show descriptions in the desktop submenu items. */
  showItemDescriptions?: boolean;
  /** Mapping of string keys (used in `item.icon` or `subItem.icon`) to React icon components. */
  iconMapping?: Record<string, React.ComponentType>;
  /** Optional header content for the mobile menu. */
  mobileHeader?: React.ReactNode;
  /** Title text for the mobile menu. */
  mobileTitle?: string;
  /** Custom icon for the mobile menu toggle button (hamburger). */
  mobileMenuIcon?: React.ReactNode;

  // --- Layout & Dimensions ---
  /** Height of the navigation bar (e.g., '60px', 60). */
  height?: string | number;
  /** Width of the navigation bar (e.g., '100%'). */
  width?: string;
  /** Maximum width of the navigation content (e.g., '1200px', 'auto'). */
  maxWidth?: string;
  /** Horizontal padding within the navigation bar. */
  horizontalPadding?: string;
  /** Vertical padding within the navigation bar. */
  verticalPadding?: string;
  /** Z-index of the navigation bar. */
  zIndex?: number;
  /** Gap between desktop navigation items. */
  itemGap?: string;
  /** Viewport width breakpoint for switching to mobile view (pixels). */
  mobileBreakpoint?: number;

  // --- Behavior ---
  /** How the desktop submenu opens ('hover' or 'click'). */
  submenuBehavior?: 'hover' | 'click';
  /** Delay (ms) before closing the submenu on hover out (for 'hover' behavior). */
  submenuCloseDelay?: number;
  /** Whether the navigation bar should hide when scrolling down. */
  hideOnScroll?: boolean;
  /** Scroll distance (px) threshold to trigger hide/show on scroll. */
  scrollThreshold?: number;

  // --- Visual Styling ---
  /** CSS backdrop-filter value (e.g., 'blur(10px)'). */
  backdropFilter?: string;
  /** CSS border-bottom style for the navbar (e.g., '1px solid #333'). Defaults to using tertiary color. */
  borderStyle?: string;
  /** CSS box-shadow for the navbar. Defaults to standard shadow. */
  boxShadow?: string;

  // --- Color Configuration ---
  /** Primary accent color. @see Colors interface */
  primaryColor?: string;
   /** Main background color. @see Colors interface */
  secondaryColor?: string;
   /** Subtle border/divider color. @see Colors interface */
  tertiaryColor?: string;
   /** Default text color. @see Colors interface */
  textColor?: string;
   /** Glow/hover effect color. @see Colors interface */
  glowColor?: string;
}


// --- Styling ---

// Default Core Colors (Used if props are not provided)
const DEFAULT_COLORS: Colors = {
  primary: 'var(--color-primary)',          // Default to CSS variable or Gold
  secondary: 'var(--color-background)',           // Default to Dark background
  tertiary: 'var(--color-glow)',    // Default to Light border
  text: 'var(--color-text)',         // Default to Light text
  glow: 'var(--color-glow)'           // Default to Gold glow
};

// Define fonts (Remains the same)
const FONTS = {
  desktopNavItem: '0.95rem',
  desktopSubmenuHeader: '1.25rem',
  desktopSubmenuItem: '0.85rem',
  desktopSubmenuDescription: '0.8rem',
  mobileNavItem: '1.1rem',
  mobileSubmenuItem: '0.9rem',
  tooltip: '0.75rem'
};

// Define shadow values - Use fixed values or derive from colors if needed
const SHADOWS = {
  standard: '0 8px 16px -2px rgba(0, 0, 0, 0.15)', // Standard shadow for the navbar
  // Submenu shadow uses text color for a subtle connection
  submenu: (colors: Colors) => `0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 0 7px ${colors.text}`,
  mobile: '0 2px 10px rgba(0, 0, 0, 0.3)' // Shadow for the mobile menu container
};

// Type Helper for CSS Properties that need casting
type CSSPropertiesWithCasting = React.CSSProperties & {
    textTransform?: React.CSSProperties['textTransform'];
    flexDirection?: React.CSSProperties['flexDirection'];
    textAlign?: React.CSSProperties['textAlign'];
    pointerEvents?: React.CSSProperties['pointerEvents'];
};
// Combine MotionStyle with our casting helper for Framer Motion components
type MotionStyleWithCasting = MotionStyle & CSSPropertiesWithCasting;


// Function to create the style object, accepting colors
const createStyles = (colors: Colors) => {
  // Common reusable style patterns
  const COMMON_STYLES = {
      flexRow: { display: 'flex', flexDirection: 'row' as React.CSSProperties["flexDirection"], alignItems: 'center' },
      flexColumn: { display: 'flex', flexDirection: 'column' as React.CSSProperties["flexDirection"] },
      flexCenter: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
      heading: { fontFamily: 'var(--font-heading, inherit)', letterSpacing: '0.1em', textTransform: 'uppercase' as React.CSSProperties["textTransform"] },
      text: { color: colors.text, lineHeight: 1.4 },
      interactive: { cursor: 'pointer' },
      hoverEffect: { backgroundColor: colors.tertiary.replace(/[\d.]+\)$/, '0.3)') },
      focusVisible: { outline: `2px solid ${colors.primary}`, outlineOffset: '2px' },
      card: { background: colors.secondary, borderRadius: '6px', overflow: 'hidden' },
      border: { border: `1px solid ${colors.tertiary}` },
      borderAccent: { border: `1px solid ${colors.primary}` },
      fixed: { position: 'fixed' as React.CSSProperties["position"], top: 0, left: 0, width: '100%' },
      absolute: { position: 'absolute' as React.CSSProperties["position"] },
      relative: { position: 'relative' as React.CSSProperties["position"] },
      sticky: { position: 'sticky' as React.CSSProperties["position"], top: 0 },
      screenReaderOnly: {
        position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px',
        overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: 0,
      } as React.CSSProperties
  };

  // Return type for the createStyles function
  // Using a specific type instead of Record<string, any> for better safety
  // This requires defining the structure more explicitly
  type StyleDefinition = {
      colors: Colors;
      shadows: { standard: string; submenu: string; mobile: string; };
      fonts: typeof FONTS;
      common: typeof COMMON_STYLES;
      logo: { container: React.CSSProperties; link: React.CSSProperties; };
      navBar: {
          container: (...args: any[]) => React.CSSProperties;
          content: (...args: any[]) => React.CSSProperties;
          itemsContainer: (...args: any[]) => React.CSSProperties;
      };
      submenuItem: {
          wrapper: MotionStyleWithCasting;
          hoverState: React.CSSProperties;
          link: React.CSSProperties;
          icon: React.CSSProperties;
          label: React.CSSProperties;
          description: React.CSSProperties;
      };
      desktopNavItem: {
          wrapper: (...args: any[]) => React.CSSProperties;
          navItem: (...args: any[]) => CSSPropertiesWithCasting;
          content: (...args: any[]) => React.CSSProperties;
          icon: React.CSSProperties;
          label: (...args: any[]) => CSSPropertiesWithCasting;
          arrow: (...args: any[]) => React.CSSProperties;
      };
      globalSubmenu: {
          container: (...args: any[]) => CSSPropertiesWithCasting;
          submenuContainer: MotionStyleWithCasting;
          grid: React.CSSProperties;
          header: React.CSSProperties;
          title: React.CSSProperties;
          description: React.CSSProperties;
      };
      mobileNavItem: {
          navItem: (...args: any[]) => CSSPropertiesWithCasting;
          content: React.CSSProperties;
          label: React.CSSProperties;
          arrow: React.CSSProperties;
          submenuContainer: MotionStyleWithCasting;
          submenuItem: React.CSSProperties;
          submenuItemActive: React.CSSProperties;
          submenuItemLink: React.CSSProperties;
          submenuItemIcon: React.CSSProperties;
          submenuItemLabel: React.CSSProperties;
      };
      mobileMenu: {
          button: (...args: any[]) => CSSPropertiesWithCasting;
          container: (...args: any[]) => MotionStyleWithCasting;
          navItems: React.CSSProperties;
          header: React.CSSProperties;
          logoContainer: React.CSSProperties;
          titleContainer: (...args: any[]) => React.CSSProperties;
          logoLink: React.CSSProperties;
          headerText: React.CSSProperties;
          titleText: React.CSSProperties;
      };
  };


  const styles: StyleDefinition = {
    colors, // Expose colors if needed directly
    shadows: { // Include shadows within the generated styles
        standard: SHADOWS.standard,
        submenu: SHADOWS.submenu(colors), // Generate submenu shadow with current colors
        mobile: SHADOWS.mobile,
    },
    fonts: FONTS, // Expose fonts
    common: COMMON_STYLES, // Expose common styles
    logo: {
      container: { ...COMMON_STYLES.flexRow, ...COMMON_STYLES.absolute, left: '3rem', opacity: 1 },
      link: { ...COMMON_STYLES.flexCenter, ...COMMON_STYLES.interactive, ...COMMON_STYLES.relative, color: colors.primary, padding: '8px', borderRadius: '50%' },
    },
    navBar: {
      container: (visible: boolean, height: string | number, width: string, zIndex: number, backdropFilter: string, boxShadow: string, borderStyle?: string): React.CSSProperties => ({
        ...COMMON_STYLES.fixed, ...COMMON_STYLES.flexRow, width, zIndex, backdropFilter, WebkitBackdropFilter: backdropFilter,
        background: colors.secondary, height, justifyContent: 'space-between',
        transition: 'transform 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease',
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        opacity: visible ? 1 : 0,
        boxShadow: visible ? boxShadow : 'none',
        borderBottom: borderStyle || `1px solid ${colors.primary}`,
      }),
      content: (maxWidth: string, horizontalPadding: string, verticalPadding: string): React.CSSProperties => ({
        ...COMMON_STYLES.flexRow, width: '100%', maxWidth, margin: '0 auto', justifyContent: 'center',
        padding: `${verticalPadding} ${horizontalPadding}`,
      }),
      itemsContainer: (itemGap: string): React.CSSProperties => ({ ...COMMON_STYLES.flexRow, gap: itemGap, opacity: 1 }),
    },
    submenuItem: {
      // Submenu item uses text color, primary border left
      wrapper: {
        ...COMMON_STYLES.flexRow, ...COMMON_STYLES.interactive, alignItems: 'flex-start', padding: '1rem',
        color: colors.text,
        textAlign: 'left' as React.CSSProperties['textAlign'],
        borderRadius: 'var(--radius-small, 4px)',
        willChange: 'transform, background-color', backgroundColor: 'transparent',
        border: 'none',
        borderLeft: `1px solid ${colors.primary}`,
      },
      // Hover uses hoverEffect common style and primary color shadow/border
      hoverState: {
        ...COMMON_STYLES.hoverEffect,
        boxShadow: `0 0 5px ${colors.primary}`, // Subtle glow on hover
        borderLeft: `1px solid ${colors.primary}`, // Keep accent border
      },
      link: { ...COMMON_STYLES.flexColumn, alignItems: 'flex-start', width: '100%', fontFamily: 'var(--font-heading, inherit)', fontWeight: 100, fontSize: '0.875rem', letterSpacing: '0.05em' },
      // Icon uses primary color
      icon: { ...COMMON_STYLES.flexCenter, alignSelf: 'center', color: colors.primary, marginBottom: '1rem', width: '170px', height: '128px' },
      // Label uses heading style, text color
      label: { ...COMMON_STYLES.heading, fontSize: FONTS.desktopSubmenuItem, fontWeight: 300, marginBottom: '-0.5rem', transition: 'color 0.2s ease', color: colors.text },
      // Description uses text color with opacity
      description: { ...COMMON_STYLES.text, fontSize: FONTS.desktopSubmenuDescription, opacity: 0.7, maxWidth: '200px' }
    },
          desktopNavItem: {
      wrapper: (itemStyle = {}): React.CSSProperties => ({ ...COMMON_STYLES.relative, ...itemStyle }),
      navItem: (isItemActive: boolean, isActive: boolean): CSSPropertiesWithCasting => ({
        ...COMMON_STYLES.flexRow, ...COMMON_STYLES.interactive, ...COMMON_STYLES.relative, ...COMMON_STYLES.heading,
        gap: '0.5rem', fontWeight: 'normal', fontSize: FONTS.desktopNavItem,
        color: isItemActive || isActive ? colors.primary : colors.text,
        padding: '0.5rem 0.75rem', border: 'none', background: 'transparent', outline: 'none',
      }),
      content: (isItemActive: boolean, isActive: boolean): React.CSSProperties => ({
        ...COMMON_STYLES.flexRow, gap: '0.5rem',
        color: isItemActive || isActive ? colors.primary : 'inherit'
      }),
      icon: { ...COMMON_STYLES.flexCenter, transition: 'all 0.1s cubic-bezier(0.4, 0, 1, 1)' },
      label: (isItemActive: boolean, isActive: boolean): CSSPropertiesWithCasting => ({
        textTransform: 'uppercase' as React.CSSProperties['textTransform'],
        transition: 'all 0.1s cubic-bezier(0.4, 0, 1, 1)',
        color: isItemActive || isActive ? colors.primary : 'inherit'
      }),
      arrow: (isItemActive: boolean): React.CSSProperties => ({
        ...COMMON_STYLES.flexRow, marginTop: '2px',
        color: isItemActive ? colors.primary : "currentColor"
      }),
    },
    globalSubmenu: {
      container: (submenuStyle = {}): CSSPropertiesWithCasting => ({
        ...COMMON_STYLES.fixed, top: '45px', left: 0, width: '100%', zIndex: 9,
        display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
        pointerEvents: 'none' as React.CSSProperties['pointerEvents'],
        ...submenuStyle
      }),
      submenuContainer: {
        background: colors.secondary, borderRadius: '6px', boxShadow: SHADOWS.submenu(colors),
        overflow: 'hidden', borderLeft: `3px solid ${colors.primary}`,
        pointerEvents: 'auto' as React.CSSProperties['pointerEvents'],
        willChange: 'transform, opacity', margin: '0 auto', transformOrigin: 'top center',
      },
      grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', width: '100%' },
      header: {
          display: 'flex',
          flexDirection: 'column' as React.CSSProperties['flexDirection'],
          padding: '1.75rem'
      },
      title: {
          fontFamily: 'var(--font-heading, inherit)', color: colors.primary, fontSize: FONTS.desktopSubmenuHeader,
          letterSpacing: '0.1em',
          textTransform: 'uppercase' as React.CSSProperties['textTransform'],
          marginBottom: '0.5rem'
      },
      description: { fontSize: FONTS.desktopSubmenuDescription, color: colors.text, opacity: 0.8, lineHeight: 1.4 },
    },
    mobileNavItem: {
      navItem: (isActive: boolean): CSSPropertiesWithCasting => ({
        ...COMMON_STYLES.flexRow, ...COMMON_STYLES.interactive, ...COMMON_STYLES.heading,
        gap: '0.5rem', fontWeight: 'normal', fontSize: FONTS.mobileNavItem,
        color: isActive ? colors.primary : colors.text,
        padding: '0.75rem 1rem', backgroundColor: 'transparent', border: 'none', width: '100%',
        textAlign: 'left' as React.CSSProperties['textAlign'],
        justifyContent: 'space-between',
        borderTop: `1px solid ${colors.tertiary}`, borderBottom: `1px solid ${colors.tertiary}`
      }),
      content: { ...COMMON_STYLES.flexRow, gap: '0.5rem' },
      label: {
          textTransform: 'uppercase' as React.CSSProperties['textTransform'],
          letterSpacing: '0.1em'
      },
      arrow: { ...COMMON_STYLES.flexCenter },
      submenuContainer: {
        ...COMMON_STYLES.flexColumn, width: '100%', gap: '0.25rem', padding: '0.5rem 0 0.5rem 1.5rem',
        background: colors.secondary.replace(/[\d.]+\)$/, '0.8)'),
        borderTop: `1px solid ${colors.tertiary}`, borderBottom: `1px solid ${colors.tertiary}`,
      },
      submenuItem: {
        ...COMMON_STYLES.flexRow, ...COMMON_STYLES.interactive, padding: '0.5rem 1rem',
        color: colors.text, opacity: 0.9, border: 'none', borderBottom: `1px solid ${colors.tertiary}`,
        backgroundColor: 'transparent', width: '100%',
        textAlign: 'left' as React.CSSProperties['textAlign'],
        fontSize: FONTS.mobileSubmenuItem,
      },
      submenuItemActive: {
        backgroundColor: colors.tertiary.replace(/[\d.]+\)$/, '0.2)'),
        color: colors.primary
      },
      submenuItemLink: { ...COMMON_STYLES.flexRow, gap: '0.5rem' },
      submenuItemIcon: { ...COMMON_STYLES.flexCenter, width: '16px', height: '16px', color: colors.primary, opacity: 0.8 },
      submenuItemLabel: { fontSize: FONTS.mobileSubmenuItem, letterSpacing: '0.05em', margin: 0 },
    },
    mobileMenu: {
      button: (isOpen: boolean, visible: boolean): CSSPropertiesWithCasting => ({
        ...COMMON_STYLES.fixed, ...COMMON_STYLES.flexCenter, ...COMMON_STYLES.interactive,
        width: '45px', height: '47px', top: '10px', left: '10px', zIndex: 201,
        display: visible ? 'flex' : 'none', background: 'transparent',
        color: isOpen ? colors.primary : colors.text,
        fontSize: '1.5rem', padding: '0.5rem', opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-100%)', border: 'none',
      }),
      container: (mobileMenuStyle = {}): MotionStyleWithCasting => ({
        ...COMMON_STYLES.fixed, display: 'none', width: '100%', height: '100%',
        background: colors.secondary, zIndex: 200, overflowY: 'hidden', overflowX: 'hidden',
        boxShadow: SHADOWS.mobile, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        flexDirection: 'column' as React.CSSProperties['flexDirection'],
        transform: 'translateY(-100%)', opacity: 0,
        ...mobileMenuStyle
      }),
      navItems: {
        ...COMMON_STYLES.flexColumn, width: '100%', padding: '0.5rem 0 0 0', marginTop: '0',
        overflowY: 'auto', height: 'calc(100vh - 130px)', paddingBottom: '2rem',
      },
      header: {
        ...COMMON_STYLES.flexCenter, ...COMMON_STYLES.sticky,
        flexDirection: 'column' as React.CSSProperties['flexDirection'],
        width: '100%',
        padding: '0.75rem', marginBottom: '0', top: 0, backgroundColor: colors.secondary, zIndex: 1
      },
      logoContainer: { ...COMMON_STYLES.flexCenter, marginBottom: '0.75rem' },
      titleContainer: (mobileHeader?: React.ReactNode): React.CSSProperties => ({ ...COMMON_STYLES.flexCenter, marginBottom: mobileHeader ? '0.75rem' : 0 }),
      logoLink: { ...COMMON_STYLES.flexRow, ...COMMON_STYLES.interactive, color: colors.primary },
      headerText: { ...COMMON_STYLES.text, fontSize: '1.2rem', fontWeight: 'normal', textAlign: 'center', margin: 0 },
      titleText: {
          ...COMMON_STYLES.heading, color: colors.primary, fontSize: '1.4rem', paddingBottom: '0.5rem',
          fontWeight: '300', textAlign: 'center', margin: 0,
          textTransform: 'uppercase' as React.CSSProperties['textTransform']
      }
    }
  };
   // Cast the final object to the defined type
   return styles as StyleDefinition;
};


// --- Animations & Transitions ---

const TRANSITIONS = {
  defaultEase: [0.4, 0, 0.2, 1],
  springEase: [0.16, 1, 0.3, 1],
  sharpEase: [0.4, 0, 1, 1],
  // Faster standard transition (from 0.3s to 0.12s)
  standard: { duration: 0.12, ease: [0.4, 0, 1, 1] },
  // Even quicker transitions for hover effects
  quick: { duration: 0.08, ease: [0.4, 0, 1, 1] },
  veryQuick: { duration: 0.04, ease: [0.4, 0, 1, 1] },
  // Faster spring transition for more responsive feel
  spring: {
    type: "spring" as const, // Use "as const" for literal type
    stiffness: 700, // Increased from 500
    damping: 20,    // Decreased from 25
    mass: 0.5       // Decreased from 0.7
  }
};

// Let TypeScript infer the type from the object literal.
// Remove the explicit : Variants type annotation.
const ANIMATIONS = {
  navItem: {
    idle: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: TRANSITIONS.quick // Changed from standard to quick for snappier hover effect
    }
  },
  arrow: {
    closed: { rotate: 0, y: 0 },
    open: {
      rotate: 180,
      y: [0, 2, 0], // y keyframes
      // Define transitions per-property with faster durations
      transition: {
        y: { duration: 0.15, repeat: 0 }, // Faster transition for y (from 0.3s to 0.15s)
        rotate: { duration: 0.15 }        // Faster transition for rotate (from 0.3s to 0.15s)
      }
    }
  },
  submenu: {
    initial: { opacity: 0, y: 0, scale: 0.99 },
    animate: {
        opacity: 1, y: 0, scale: 1,
        transition: TRANSITIONS.spring // Apply transition to the variant
    },
    exit: {
      opacity: 0, y: 0, scale: 1,
      transition: TRANSITIONS.quick // Apply transition to the variant
    }
  },
  // Submenu content slide variants with faster transitions
  submenuContentSlideRight: { // Renamed for clarity, used directly later
      initial: { opacity: 0, x: 40 },
      animate: { opacity: 1, x: 0, transition: { duration: 0.08, ease: TRANSITIONS.sharpEase } }, // Faster and sharper
      exit: { opacity: 0, x: -40, transition: TRANSITIONS.veryQuick }
  },
  submenuContentSlideLeft: { // Renamed for clarity, used directly later
      initial: { opacity: 0, x: -40 },
      animate: { opacity: 1, x: 0, transition: { duration: 0.08, ease: TRANSITIONS.sharpEase } }, // Faster and sharper
      exit: { opacity: 0, x: 40, transition: TRANSITIONS.veryQuick }
  },
  submenuItem: {
    initial: {
      opacity: 0, y: -5, scale: 0.97,
    },
    animate: {
      opacity: 1, y: 0, scale: 1,
      // Apply faster spring transition for snappier hover interactions
      transition: TRANSITIONS.spring
    },
    exit: { // Faster exit for submenu items
        opacity: 0, scale: 0.95,
        transition: TRANSITIONS.veryQuick // Changed from quick to veryQuick for faster fadeout
    }
  },
  mobileMenu: {
    closed: {
      opacity: 0,
      y: '-100%',
      transition: TRANSITIONS.quick // Apply transition to the variant
    },
    open: {
      opacity: 1,
      y: 0,
      // Transition settings for the main open animation and children stagger
      transition: {
        duration: 0.25,
        ease: TRANSITIONS.springEase,
        staggerChildren: 0.05,
        delayChildren: 0.05
      }
    }
  }
};

// --- Default Content & Icons ---
const DEFAULT_NAV_ITEMS: NavItem[] = [
  {
    id: 'home', label: 'Home', href: '/', icon: 'home', submenu: [] // Example: Home usually has no submenu
  },
  {
    id: 'about', label: 'About', href: '/about', icon: 'info', // Example icon key
    submenu: [
      { id: 'company', label: 'Company', href: '/about/company', description: 'Learn more about us', icon: 'building' },
      { id: 'team', label: 'Team', href: '/about/team', description: 'Meet our team', icon: 'users' }
    ]
  },
    {
    id: 'services', label: 'Services', href: '/services', icon: 'settings', // Example icon key
    submenu: [
      { id: 'web', label: 'Web Dev', href: '/services/web', description: 'Web solutions', icon: 'code' },
      { id: 'mobile', label: 'Mobile Apps', href: '/services/mobile', description: 'iOS & Android', icon: 'smartphone' }
    ]
  }
];

// FIX: Add simple valid SVG paths
const DefaultArrowIcon = memo(() => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
));
DefaultArrowIcon.displayName = 'DefaultArrowIcon';

const DefaultHomeIcon = memo(() => (
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
 </svg>
));
DefaultHomeIcon.displayName = 'DefaultHomeIcon';

const DefaultSubmenuIcon = memo(() => (
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="10"></circle>
 </svg>
));
DefaultSubmenuIcon.displayName = 'DefaultSubmenuIcon';

// Example icons simplified for brevity and minimal path data
const DefaultInfoIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM12 7.5h.01M12 11.5v5"/></svg>;
const DefaultBuildingIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/></svg>;
const DefaultUsersIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 3a4 4 0 100 8 4 4 0 000-8zm8 11a3 3 0 100 6 3 3 0 000-6z"/></svg>;
const DefaultSettingsIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6v-2m0 16v-2M18 12h2M4 12h2m11-7l-1-1M6 6l-1-1m13 13l-1 1M6 18l-1 1M12 19a7 7 0 100-14 7 7 0 000 14zm0-3a4 4 0 110-8 4 4 0 010 8z"/></svg>;
const DefaultCodeIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>;
const DefaultSmartphoneIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>;
const DefaultMenuIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
const DefaultCloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

const DEFAULT_ICON_MAPPING: Record<string, React.ComponentType> = {
  'arrow': DefaultArrowIcon,
  'home': DefaultHomeIcon,
  'submenu': DefaultSubmenuIcon,
  // Add default mappings for example items
  'info': DefaultInfoIcon,
  'building': DefaultBuildingIcon,
  'users': DefaultUsersIcon,
  'settings': DefaultSettingsIcon,
  'code': DefaultCodeIcon,
  'smartphone': DefaultSmartphoneIcon,
  'menu': DefaultMenuIcon, // Default hamburger
  'close': DefaultCloseIcon, // Default close
};


// --- Context ---
interface NavContextType {
  activeItemId: string | null;
  setActiveItemId: (id: string | null) => void;
  visible: boolean;
  // Removed focusedItemId and setFocusedItemId
  styles: ReturnType<typeof createStyles>;
}

// Initialize context with a default value that matches the type structure
// This avoids the `null!` assertion and provides better type safety downstream
const defaultStyles = createStyles(DEFAULT_COLORS); // Create default styles once
const NavContext = React.createContext<NavContextType>({
    activeItemId: null,
    setActiveItemId: () => {},
    visible: true,
    // Removed focusedItemId and setFocusedItemId
    styles: defaultStyles, // Provide default styles
});


// --- Helper Functions ---
const getIconComponent = (icon: React.ReactNode | string | undefined, iconMapping: Record<string, React.ComponentType>): React.ReactNode => {
  if (!icon) return null;
  if (typeof icon === 'string') {
    const IconComponent = iconMapping[icon];
    // Render the component or return null if not found
    return IconComponent ? <IconComponent /> : null;
  }
  // If it's already a ReactNode, return it directly
  return icon;
};


// --- Sub-Components ---
// These components use useContext(NavContext) to get styles.

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
  const { styles } = useContext(NavContext); // Get styles from context
  const submenuItemId = `${parentId}-submenu-item-${subItem.id}`;
  const [isHovered, setIsHovered] = useState(false);

  // Ensure styles are loaded
  if (!styles?.submenuItem) return null;

  return (
    <motion.div
      key={subItem.id}
      style={{ // Apply base style and hover state conditionally
        ...styles.submenuItem.wrapper,
        ...(isHovered ? styles.submenuItem.hoverState : {})
      }}
      variants={ANIMATIONS.submenuItem} // Use variants directly
      initial="initial" // Add initial/animate/exit for item animation
      animate="animate"
      exit="exit"
      layoutId={`submenu-item-${subItem.id}`}
      onClick={onClick}
      role="menuitem"
      id={submenuItemId}
      tabIndex={0} // Ensure focusable
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)} // Add focus style for accessibility
      onBlur={() => setIsHovered(false)}  // Remove focus style
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
        // Add other keyboard navigation if needed within submenu items (e.g., arrows)
      }}
      aria-label={subItem.description ? `${subItem.label}: ${subItem.description}` : subItem.label}
    >
      {/* Ensure nested styles exist */}
      {styles.submenuItem.link && (
        <div style={styles.submenuItem.link}>
          {styles.submenuItem.icon && (
            <div style={styles.submenuItem.icon}>
              {getIconComponent(subItem.icon, iconMapping) || getIconComponent('submenu', iconMapping)}
            </div>
          )}
          {styles.submenuItem.label && (
            <span style={styles.submenuItem.label}>{subItem.label}</span>
          )}
          {showDescription && subItem.description && styles.submenuItem.description && (
            <div style={styles.submenuItem.description}>{subItem.description}</div>
          )}
        </div>
      )}
    </motion.div>
  );
});
MemoizedSubmenuItem.displayName = 'MemoizedSubmenuItem';


const DesktopNavItemComponent = memo(({
  item,
  isActive,
  onMouseEnter,
  onMouseLeave,
  itemIndex, // Added for keyboard navigation context
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
  const { activeItemId, setActiveItemId, styles } = useContext(NavContext); // Get styles from context
  const isItemActive = activeItemId === item.id;
  const controls = useAnimation();
  const navItemId = `nav-item-${item.id}`;
  const submenuId = `submenu-${item.id}`;

  // Ensure styles are loaded
  if (!styles?.desktopNavItem || !styles.colors) return null;

  // Animate color based on active state - with faster transition
  useEffect(() => {
    controls.start({
      color: isItemActive || isActive ? styles.colors.primary : styles.colors.text,
      scale: 1, // Keep scale consistent or add hover effect here if desired
      transition: { duration: 0.08 } // Much faster transition for color (0.2s to 0.08s)
    });
  }, [controls, isItemActive, isActive, styles.colors.primary, styles.colors.text]);

  // Handle click for toggling submenu or navigation
  const handleClick = useCallback(() => {
    if (item.submenu && item.submenu.length > 0) {
        if (submenuBehavior === 'click') {
            setActiveItemId(isItemActive ? null : item.id);
        }
        // If hover behavior, click usually doesn't navigate directly.
        // If navigation is needed for hover items with href, add logic here.
        // else if (item.href) { /* Optional: Navigate on click even for hover items */ }

    } else if (item.href) {
        // Navigate if it's a direct link item
        // Assuming router is available if needed:
        // const router = useRouter(); router.push(item.href);
        console.log("Navigate to:", item.href); // Placeholder for navigation
    }
  }, [isItemActive, setActiveItemId, item.id, item.submenu, item.href, submenuBehavior]);

  // Handle mouse enter for hover behavior
  const handleMouseEnter = useCallback(() => {
    if (submenuBehavior === 'hover' && item.submenu && item.submenu.length > 0) {
      setActiveItemId(item.id);
    }
    onMouseEnter(); // Propagate event if needed
  }, [onMouseEnter, setActiveItemId, item.id, item.submenu, submenuBehavior]);

  // Use the custom keyboard navigation hook
  const handleKeyDown = useMenuItemKeyboardNav(
    navItemId,
    submenuId,
    Boolean(item.submenu && item.submenu.length > 0),
    isItemActive,
    setActiveItemId,
    handleClick
  );


  return (
    <div
      style={styles.desktopNavItem.wrapper(itemStyle)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave} // Propagate event
      data-nav-item={item.id} // Add data attribute for targeting
      role="presentation" // Wrapper is presentational
    >
      <motion.button
        id={navItemId}
        style={styles.desktopNavItem.navItem(isItemActive, isActive)}
        variants={ANIMATIONS.navItem} // Use variants directly
        initial="idle"
        animate={controls} // Use animation controls
        whileHover="hover" // Use variant name 'hover'
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="menuitem" // Correct role
        aria-haspopup={item.submenu && item.submenu.length > 0 ? "true" : undefined} // Indicate submenu presence
        aria-expanded={item.submenu && item.submenu.length > 0 ? isItemActive : undefined} // Indicate expanded state
        aria-controls={item.submenu && item.submenu.length > 0 ? submenuId : undefined} // Link to submenu
        aria-label={`${item.label}${item.submenu && item.submenu.length > 0 ? ' submenu' : ''}`} // Clearer label
        aria-current={isActive ? 'page' : undefined} // Indicate current page
        tabIndex={0} // Make it focusable
      >
        {/* Content: Icon and Label */}
        {styles.desktopNavItem.content && (
            <div style={styles.desktopNavItem.content(isItemActive, isActive)}>
            {item.icon && styles.desktopNavItem.icon && (
                <div style={styles.desktopNavItem.icon}>
                {getIconComponent(item.icon, iconMapping)}
                </div>
            )}
            {styles.desktopNavItem.label && (
                <span style={styles.desktopNavItem.label(isItemActive, isActive)}>
                {item.label}
                </span>
            )}
            </div>
        )}

        {/* Arrow Icon (only if submenu exists) */}
        {item.submenu && item.submenu.length > 0 && styles.desktopNavItem.arrow && (
          <motion.div
            style={styles.desktopNavItem.arrow(isItemActive)}
            variants={ANIMATIONS.arrow} // Use variants directly
            initial="closed" // Use variant name 'closed'
            animate={isItemActive ? "open" : "closed"} // Use variant name 'open' or 'closed'
            aria-hidden="true" // Hide decorative arrow from screen readers
          >
            {getIconComponent('arrow', iconMapping)}
             {/* Screen reader text managed by aria-expanded on button */}
          </motion.div>
        )}
      </motion.button>
    </div>
  );
});
DesktopNavItemComponent.displayName = 'DesktopNavItemComponent';


const GlobalSubmenuComponent = memo(({
  items,
  activeItemId,
  onMouseEnter,
  onMouseLeave,
  showItemDescriptions,
  submenuStyle = {},
  submenuBehavior, // Pass behavior down
  iconMapping,
}: {
  items: NavItem[];
  activeItemId: string | null;
  onMouseEnter: () => void; // To cancel close timer
  onMouseLeave: () => void; // To start close timer
  showItemDescriptions: boolean;
  submenuStyle?: React.CSSProperties;
  submenuBehavior: 'hover' | 'click';
  iconMapping: Record<string, React.ComponentType>;
}) => {
  const router = useRouter();
  const { setActiveItemId, styles } = useContext(NavContext); // Get styles from context
  const activeItem = items.find(item => item.id === activeItemId) || null;

  // State for slide animation direction
  const [prevItemId, setPrevItemId] = useState<string | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  // Ref for the submenu container
  const submenuRef = useRef<HTMLDivElement>(null);
  const submenuId = activeItem ? `submenu-${activeItem.id}` : '';

   // Ensure styles are loaded
  if (!styles?.globalSubmenu) return null;

  // Determine slide direction when active item changes
  useEffect(() => {
    if (activeItemId && prevItemId && activeItemId !== prevItemId) {
      const itemIds = items.map(item => item.id);
      const prevIndex = itemIds.indexOf(prevItemId);
      const currentIndex = itemIds.indexOf(activeItemId);
      setSlideDirection(currentIndex > prevIndex ? 'right' : 'left');
    }
    if (activeItemId !== prevItemId) {
      setPrevItemId(activeItemId);
    }
  }, [activeItemId, prevItemId, items]);

  // Use our custom submenu keyboard navigation hook
  useSubmenuKeyboardNav(submenuRef, activeItemId, setActiveItemId);


  // Handle click on a submenu item
  const handleSubmenuItemClick = useCallback((href: string) => {
    setActiveItemId(null); // Close submenu on click
    router.push(href); // Navigate
  }, [setActiveItemId, router]);

  // Determine animation variants based on slide direction
  // Select the correct variant name from ANIMATIONS
  const contentAnimationVariant = slideDirection === 'right'
    ? 'submenuContentSlideRight'
    : 'submenuContentSlideLeft';


  return (
    <div
      style={styles.globalSubmenu.container(submenuStyle)}
      onMouseEnter={onMouseEnter} // Pass through for hover behavior
      onMouseLeave={onMouseLeave} // Pass through for hover behavior
      ref={submenuRef} // Attach ref
      role="presentation" // Container is presentational
    >
      <AnimatePresence mode="wait">
        {activeItem && ( // Render only if there's an active item
          <motion.div
            style={{
              ...styles.globalSubmenu.submenuContainer,
              // Dynamically calculate width based on item count, capped
              // Ensure activeItem.submenu exists before accessing length
              width: `min(90%, ${200 + (activeItem.submenu?.length ?? 0) * 220}px)`,
              maxWidth: '1200px'
            }}
            variants={ANIMATIONS.submenu} // Use variants directly
            initial="initial"
            animate="animate"
            exit="exit"
            key={`global-submenu-${activeItem.id}`} // Key ensures recreation on item change
            layoutId="global-submenu" // Shared layout ID for smooth transition
            role="menu" // Correct role for the submenu container
            id={submenuId} // ID for association
            aria-labelledby={`nav-item-${activeItem.id}`} // Labelled by the trigger button
          >
            {/* Inner content with slide animation */}
            {styles.globalSubmenu.grid && ( // Check if grid style exists
                <motion.div
                style={styles.globalSubmenu.grid} // Use grid for layout
                // Apply the selected slide animation variant
                variants={ANIMATIONS[contentAnimationVariant] as Variants} // Cast the specific variant object to Variants
                initial="initial"
                animate="animate"
                exit="exit" // Use exit from the slide variant
                key={`submenu-content-${activeItem.id}`} // Key ensures slide animation runs
                layoutId={`submenu-content-${activeItem.id}`} // Optional: layout ID for content
                role="presentation"
                >
                {/* Header Section */}
                {styles.globalSubmenu.header && ( // Check if header style exists
                    <div style={styles.globalSubmenu.header} role="presentation">
                    {styles.globalSubmenu.title && ( // Check title style
                        <div style={styles.globalSubmenu.title} id={`submenu-header-${activeItem.id}`}>
                        {activeItem.label}
                        </div>
                    )}
                    {/* Display description from the first submenu item as header description */}
                    {activeItem.submenu?.[0]?.description && !showItemDescriptions && styles.globalSubmenu.description && ( // Check description style
                        <div style={styles.globalSubmenu.description} id={`submenu-description-${activeItem.id}`}>
                        {activeItem.submenu[0].description}
                        </div>
                    )}
                    </div>
                )}

                {/* Submenu Items */}
                {activeItem.submenu?.map((subItem) => ( // Check if submenu exists before mapping
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
GlobalSubmenuComponent.displayName = 'GlobalSubmenuComponent';


const MobileNavItemComponent = memo(({
  item,
  isActive,
  iconMapping,
  toggleMenu, // Function to close the entire mobile menu
}: {
  item: NavItem;
  isActive: boolean; // Is the main route active?
  iconMapping: Record<string, React.ComponentType>;
  toggleMenu: () => void;
}) => {
  const router = useRouter();
  const { styles } = useContext(NavContext); // Get styles from context
  const pathname = usePathname(); // Get current path for active subitem check
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const mobileNavItemId = `mobile-nav-item-${item.id}`;
  const mobileSubmenuId = `mobile-submenu-${item.id}`;

  // Ensure styles are loaded
  if (!styles?.mobileNavItem) return null;


  // Handle navigation from submenu item click or direct item click
  const handleNavigation = useCallback((href: string) => {
    router.push(href);
    toggleMenu(); // Close the entire mobile menu after navigation
  }, [router, toggleMenu]);

  // Toggle local submenu or navigate
  const toggleSubmenu = useCallback(() => {
    // Only toggle if there are submenu items
    if (item.submenu && item.submenu.length > 0) {
        setIsSubmenuOpen(prev => !prev);
    } else if (item.href) {
        // If no submenu, navigate directly and close the main menu
        handleNavigation(item.href);
    }
  }, [item.submenu, item.href, handleNavigation]); // Added handleNavigation


  // Use our custom mobile menu item keyboard navigation hook
  const handleKeyDown = useMobileMenuItemKeyboardNav(
    mobileNavItemId,
    mobileSubmenuId,
    Boolean(item.submenu && item.submenu.length > 0),
    isSubmenuOpen,
    toggleSubmenu,
    toggleMenu
  );


  // Create submenu keyboard handler using our fixed hook
  const createSubmenuKeyHandler = useMobileSubmenuKeyboardNav(
    mobileNavItemId,
    item.id,
    setIsSubmenuOpen,
    handleNavigation
  );


  return (
    // Use the variant name directly from the ANIMATIONS object
    <motion.div variants={ANIMATIONS.submenuItem} role="presentation">
      {/* Main Item Button */}
      <button
        id={mobileNavItemId}
        style={styles.mobileNavItem.navItem(isActive)} // Style based on main route activity
        onClick={toggleSubmenu} // Handles both toggle and navigation
        role="menuitem"
        // Only add popup attributes if there is a submenu
        aria-haspopup={item.submenu && item.submenu.length > 0 ? "true" : undefined}
        aria-expanded={item.submenu && item.submenu.length > 0 ? isSubmenuOpen : undefined}
        aria-controls={item.submenu && item.submenu.length > 0 ? mobileSubmenuId : undefined}
        tabIndex={0} // Make focusable
        onKeyDown={handleKeyDown}
      >
        {styles.mobileNavItem.content && (
            <div style={styles.mobileNavItem.content}>
            {/* Optional Icon */}
            {item.icon && getIconComponent(item.icon, iconMapping)}
            {styles.mobileNavItem.label && (
                <span style={styles.mobileNavItem.label}>{item.label}</span>
            )}
            </div>
        )}

        {/* Arrow Icon - Only show if there is a submenu */}
        {item.submenu && item.submenu.length > 0 && styles.mobileNavItem.arrow && (
          <motion.div
            style={styles.mobileNavItem.arrow}
            variants={ANIMATIONS.arrow} // Use variants directly
            initial="closed"
            animate={isSubmenuOpen ? "open" : "closed"} // Use variant names
            aria-hidden="true"
          >
            {getIconComponent('arrow', iconMapping)}
          </motion.div>
        )}
      </button>

      {/* Submenu Container */}
      <AnimatePresence>
        {isSubmenuOpen && item.submenu && item.submenu.length > 0 && ( // Ensure submenu exists
          <motion.div
            id={mobileSubmenuId}
            style={styles.mobileNavItem.submenuContainer}
            variants={ANIMATIONS.submenu} // Use variants directly
            initial="initial"
            animate="animate"
            exit="exit"
            role="menu" // Role for the submenu itself
            aria-labelledby={mobileNavItemId} // Associated with the button
          >
            {item.submenu.map((subItem) => {
              // Check if the current subitem's route is active
              const isSubItemActive = pathname === subItem.href;
              return (
                <button
                  key={subItem.id}
                  id={`mobile-submenu-item-${item.id}-${subItem.id}`}
                  style={{
                    ...styles.mobileNavItem.submenuItem,
                    // Apply active style if this specific subitem route is active
                    ...(isSubItemActive ? styles.mobileNavItem.submenuItemActive : {})
                  }}
                  onClick={() => handleNavigation(subItem.href)}
                  role="menuitem"
                  tabIndex={0} // Submenu items are focusable
                  onKeyDown={createSubmenuKeyHandler(subItem.id, subItem.href)}
                  aria-label={subItem.description ? `${subItem.label}: ${subItem.description}` : subItem.label}
                  // Add aria-current if the subitem is the current page
                  aria-current={isSubItemActive ? 'page' : undefined}
                >
                 {styles.mobileNavItem.submenuItemLink && (
                    <div style={styles.mobileNavItem.submenuItemLink}>
                        {/* Optional Icon */}
                        {subItem.icon && styles.mobileNavItem.submenuItemIcon && (
                            <span style={styles.mobileNavItem.submenuItemIcon} aria-hidden="true">
                                {getIconComponent(subItem.icon, iconMapping)}
                            </span>
                        )}
                        {styles.mobileNavItem.submenuItemLabel && (
                            <span style={styles.mobileNavItem.submenuItemLabel}>{subItem.label}</span>
                        )}
                    </div>
                 )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
MobileNavItemComponent.displayName = 'MobileNavItemComponent';


const MobileMenuComponent = memo(({
  isOpen,
  toggleMenu,
  items,
  isActiveRoute, // Function to check if a main route is active
  mobileMenuStyle = {},
  iconMapping,
  isMobileView, // Needed to conditionally render
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
  // mobileMenuIcon prop removed as it's handled in the main component button
}) => {
  const { styles } = useContext(NavContext); // Get styles from context
  const router = useRouter(); // Get router instance

   // Ensure styles are loaded
  if (!styles?.mobileMenu) return null;

  // Use our custom modal behavior hook for focus management and keyboard handling
  useModalBehavior(isOpen && isMobileView, toggleMenu, 'mobile-menu');


  return (
    <>
      {/* Use AnimatePresence to handle the mount/unmount animation */}
      <AnimatePresence>
        {isOpen && isMobileView && ( // Render only when open and in mobile view
          <motion.div
            id="mobile-menu"
            style={{
              ...styles.mobileMenu.container(mobileMenuStyle),
              display: 'flex' // Ensure display is flex when animating in
            }}
            variants={ANIMATIONS.mobileMenu} // Use variants directly
            initial="closed" // Use variant name
            animate="open"   // Use variant name
            exit="closed"    // Use variant name
            role="dialog" // Use dialog role for modality
            aria-modal="true" // Indicate it's a modal dialog
            aria-label={mobileTitle || "Mobile Navigation Menu"} // Accessible label
          >
            {/* Header Section */}
            {styles.mobileMenu.header && ( // Check header style
                <div style={styles.mobileMenu.header}>
                {/* Logo */}
                {logo && styles.mobileMenu.logoContainer && styles.mobileMenu.logoLink && ( // Check styles
                    <div style={styles.mobileMenu.logoContainer}>
                    <Link href={homeHref || '/'} passHref legacyBehavior>
                        <a
                        style={styles.mobileMenu.logoLink}
                        tabIndex={0} // Make focusable
                        aria-label="Home"
                        onClick={(e) => {
                          e.preventDefault(); // Prevent default to handle navigation manually
                          toggleMenu(); // Close menu first
                          router.push(homeHref || '/'); // Navigate using router
                        }}
                        onKeyDown={(e) => { 
                          if (e.key === 'Enter' || e.key === ' ') { 
                            e.preventDefault(); 
                            toggleMenu(); 
                            router.push(homeHref || '/'); 
                          } 
                        }} // Keyboard activation
                        role="link" // Explicit role
                        >
                        {logo}
                        </a>
                    </Link>
                    </div>
                )}

                {/* Title */}
                {styles.mobileMenu.titleContainer && styles.mobileMenu.titleText && ( // Check styles
                    <div style={styles.mobileMenu.titleContainer(mobileHeader)}>
                    <div style={styles.mobileMenu.titleText}>{mobileTitle || 'Menu'}</div>
                    </div>
                )}


                {/* Optional Header Content */}
                {mobileHeader && styles.mobileMenu.headerText && ( // Check style
                    <div style={styles.mobileMenu.headerText}>{mobileHeader}</div>
                )}
                </div>
            )}


            {/* Scrollable Navigation Items */}
            {styles.mobileMenu.navItems && ( // Check style
                <motion.div // Add motion here for staggerChildren
                    style={styles.mobileMenu.navItems}
                    role="menubar" // Container for menu items
                    aria-label="Main Navigation"
                    className="mobile-menu-scrollable" // For potential custom scrollbar styling
                    // Variants for staggering children can be applied here if needed,
                    // but they are already part of the parent's 'open' variant transition.
                >
                    {items.map((item) => (
                        // Wrap MobileNavItemComponent in motion.div for stagger effect
                        // Use the item's variant from ANIMATIONS
                        <motion.div key={item.id} variants={ANIMATIONS.submenuItem}>
                            <MobileNavItemComponent
                                item={item}
                                isActive={isActiveRoute(item.href)} // Pass active state check
                                iconMapping={iconMapping}
                                toggleMenu={toggleMenu} // Pass close handler
                            />
                        </motion.div>
                    ))}
                </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
MobileMenuComponent.displayName = 'MobileMenuComponent';


// --- Main NavigationBar Component ---

const NavigationBar: React.FC<NavigationBarProps> = ({
  // Content Configuration
  items = DEFAULT_NAV_ITEMS,
  logo = null,
  homeHref = '/',
  ariaLabel = "Main Navigation",
  showItemDescriptions = false,
  iconMapping = {},
  mobileHeader = null,
  mobileTitle = 'Menu', // Default title
  mobileMenuIcon, // Icon for the hamburger button

  // Layout & Dimensions
  height = '45px',
  width = '100%',
  maxWidth = 'auto',
  horizontalPadding = '1.5rem',
  verticalPadding = '0',
  zIndex = 100,
  itemGap = '1rem',
  mobileBreakpoint = 768,

  // Behavior
  submenuBehavior = 'hover',
  submenuCloseDelay = 200,
  hideOnScroll = true,
  scrollThreshold = 5, // Slightly increased threshold

  // Visual Styling
  backdropFilter = 'blur(12px)',
  borderStyle, // Optional override, defaults to primary color border
  boxShadow = SHADOWS.standard, // Use default standard shadow

  // Color Configuration (with defaults)
  primaryColor = DEFAULT_COLORS.primary,
  secondaryColor = DEFAULT_COLORS.secondary,
  tertiaryColor = DEFAULT_COLORS.tertiary,
  textColor = DEFAULT_COLORS.text,
  glowColor = DEFAULT_COLORS.glow,
}) => {

  // Merge default and provided icons
  const mergedIconMapping = useMemo(() => ({ ...DEFAULT_ICON_MAPPING, ...iconMapping }), [iconMapping]);


  // --- State and Hooks ---
  const {
    activeItemId, setActiveItemId,
    handleNavItemMouseEnter, handleNavItemMouseLeave, cancelSubmenuClosing
  } = useSubmenuManager(submenuBehavior, submenuCloseDelay);

  const {
    isClient, isMobileView, isMobileMenuOpen, visible, toggleMobileMenu
  } = useResponsiveNavigation(mobileBreakpoint, hideOnScroll, scrollThreshold);

  // --- Dynamic Styles ---
  // Create the colors object from props/defaults
  const currentColors: Colors = useMemo(() => ({
    primary: primaryColor,
    secondary: secondaryColor,
    tertiary: tertiaryColor,
    text: textColor,
    glow: glowColor,
  }), [primaryColor, secondaryColor, tertiaryColor, textColor, glowColor]);

  // Generate the styles object based on the current colors
  // Memoize styles object to prevent unnecessary recalculations
  const styles = useMemo(() => createStyles(currentColors), [currentColors]);

  // --- Logo Hover Effect CSS ---
  // Generate dynamic CSS string for logo hover using current colors
  const logoHoverStyle = useMemo(() => {
      // Ensure styles and nested properties are available
      const primary = styles?.colors?.primary ?? DEFAULT_COLORS.primary;
      const secondary = styles?.colors?.secondary ?? DEFAULT_COLORS.secondary;
      const tertiary = styles?.colors?.tertiary ?? DEFAULT_COLORS.tertiary;
      const text = styles?.colors?.text ?? DEFAULT_COLORS.text;
      const glow = styles?.colors?.glow ?? DEFAULT_COLORS.glow;
      const tooltipFont = styles?.fonts?.tooltip ?? FONTS.tooltip;

      return `
        .nav-logo-link {
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${primary};
          cursor: pointer;
          position: relative;
          padding: 8px;
          border-radius: 50%;
          transition: background 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
          outline: none;
        }
        .nav-logo-link:hover, .nav-logo-link:focus-visible {
          background: ${glow};
          box-shadow: 0 0 18px 8px ${glow};
          transform: scale(1.1);
        }
        .nav-logo-link:active {
          background: transparent;
          box-shadow: none;
          transform: scale(1);
          transition: all 0.1s ease;
        }
        .nav-logo-tooltip {
          position: absolute;
          bottom: -35px;
          left: 50%;
          transform: translateX(-50%);
          display: none;
          z-index: ${zIndex + 10};
          pointer-events: none;
          background: ${secondary};
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          color: ${text};
          padding: 6px 12px;
          border-radius: 6px;
          font-size: ${tooltipFont};
          font-weight: normal;
          letter-spacing: 0.05em;
          white-space: nowrap;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          border: 1px solid ${tertiary};
        }
        .nav-logo-tooltip::before {
            content: '';
            position: absolute;
            top: -5px;
            left: 50%;
            transform: translateX(-50%) rotate(45deg);
            width: 8px;
            height: 8px;
            background: ${secondary};
            border-top: 1px solid ${tertiary};
            border-left: 1px solid ${tertiary};
        }

        .nav-logo-link:hover .nav-logo-tooltip,
        .nav-logo-link:focus-visible .nav-logo-tooltip {
          display: block;
        }
        .nav-logo-link:active .nav-logo-tooltip {
          display: none;
        }
      `;
  }, [styles, zIndex]); // Depend on styles object and zIndex


  // Inject CSS for logo hover effect
  useEffect(() => {
    if (!isClient || typeof document === 'undefined') return; // Check for document
    const styleElement = document.createElement('style');
    styleElement.id = 'navbar-logo-hover-styles'; // Add ID for potential removal/update
    styleElement.textContent = logoHoverStyle;

    // Remove existing style element if it exists
    const existingStyleElement = document.getElementById(styleElement.id);
    if (existingStyleElement) {
      existingStyleElement.remove(); // Use remove() for cleaner removal
    }

    document.head.appendChild(styleElement);

    // Cleanup on unmount
    return () => {
      const styleTag = document.getElementById(styleElement.id);
      if (styleTag) {
        styleTag.remove();
      }
    };
  }, [isClient, logoHoverStyle]); // Re-inject if styles change

  // --- Event Handlers & Logic ---

  // Handle clicks outside the submenu for 'click' behavior
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!activeItemId || submenuBehavior !== 'click') return;

      const target = event.target as HTMLElement;
      // Check if click is inside the submenu or the trigger button
      const submenuContainer = document.getElementById(`submenu-${activeItemId}`);
      const triggerButton = document.getElementById(`nav-item-${activeItemId}`);

      // Ensure elements exist before checking contains
      const isInsideSubmenu = submenuContainer?.contains(target);
      const isTriggerButton = triggerButton?.contains(target);

      if (!isInsideSubmenu && !isTriggerButton) {
        setActiveItemId(null); // Close submenu if click is outside
      }
    };

    // Add listener only when a submenu is active in 'click' mode
    if (submenuBehavior === 'click' && activeItemId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeItemId, submenuBehavior, setActiveItemId]);

  // Use our custom hook for active route matching
  const isActiveRoute = useIsActiveRoute();

  // --- Render ---
  // Avoid rendering server-side or before client-side checks are complete
  if (!isClient) return null;

  // Provide context value including dynamic styles
  const contextValue: NavContextType = {
    activeItemId,
    setActiveItemId,
    visible,
    styles, // Pass memoized styles object via context
  };

  // Ensure styles are available before rendering components that use them
  if (!styles?.navBar || !styles.logo || !styles.mobileMenu) {
      console.warn("Styles not fully loaded, rendering null."); // Add warning
      return null; // Or a loading indicator
  }


  return (
    <NavContext.Provider value={contextValue}>
      {/* --- Desktop Navigation --- */}
      {!isMobileView && (
        <nav
          style={styles.navBar.container(
              visible, height, width, zIndex, backdropFilter,
              boxShadow, // Use prop or default shadow
              borderStyle // Use prop or default border (handled in style function)
          )}
          role="navigation"
          aria-label={ariaLabel}
        >
          <div style={styles.navBar.content(maxWidth, horizontalPadding, verticalPadding)}>
            {/* Logo */}
            {logo && (
              <div style={styles.logo.container}>
                <Link href={homeHref} passHref legacyBehavior>
                  <a
                    className="nav-logo-link" // Use class for dynamic CSS
                    tabIndex={0}
                    aria-label="Navigate to Home Page"
                    role="link"
                    // Blur on click to remove focus ring after navigation
                    onClick={(e) => (e.target as HTMLElement).blur()}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e.target as HTMLElement).click(); } }} // Keyboard activation
                  >
                    {logo}
                    {/* Tooltip is now part of the dynamic CSS */}
                    <div className="nav-logo-tooltip" role="tooltip" aria-hidden="true">Home Page</div>
                  </a>
                </Link>
              </div>
            )}

            {/* Desktop Nav Items */}
            {styles.navBar.itemsContainer && ( // Check if style exists
                <div style={styles.navBar.itemsContainer(itemGap)} role="menubar" aria-label="Main Menu">
                {items.map((item, index) => (
                    <DesktopNavItemComponent
                    key={item.id}
                    item={item}
                    isActive={isActiveRoute(item.href)}
                    onMouseEnter={() => handleNavItemMouseEnter(item.id)}
                    onMouseLeave={handleNavItemMouseLeave}
                    itemIndex={index} // Pass index for keyboard nav
                    iconMapping={mergedIconMapping}
                    submenuBehavior={submenuBehavior}
                    />
                ))}
                </div>
            )}
          </div>
        </nav>
      )}

      {/* --- Desktop Submenu --- */}
      {!isMobileView && (
        <GlobalSubmenuComponent
          items={items}
          activeItemId={activeItemId}
          onMouseEnter={cancelSubmenuClosing} // Cancel close timer on submenu hover
          onMouseLeave={handleNavItemMouseLeave} // Start close timer on submenu leave
          showItemDescriptions={showItemDescriptions}
          submenuBehavior={submenuBehavior}
          iconMapping={mergedIconMapping}
          // submenuStyle prop can be added if needed
        />
      )}

      {/* --- Mobile Navigation Trigger --- */}
      {isMobileView && styles.mobileMenu.button && ( // Check if style exists
        <button
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={`${isMobileMenuOpen ? 'Close' : 'Open'} navigation menu`}
          style={styles.mobileMenu.button(isMobileMenuOpen, visible)} // Apply styles
          // Keyboard nav: Focus first item in menu when opened via keyboard
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault(); // Prevent default button action if needed
                toggleMobileMenu(); // Ensure toggle happens on key press
            } else if (e.key === 'ArrowDown' && isMobileMenuOpen) {
              e.preventDefault();
              // Focus first item in the opened menu
              setTimeout(() => {
                 document.querySelector<HTMLElement>('#mobile-menu [role="menuitem"]')?.focus();
              }, 50);
            }
          }}
        >
          {/* Use custom icon or default icons */}
          {isMobileMenuOpen
            ? getIconComponent(mobileMenuIcon ? 'close' : 'close', mergedIconMapping) || '✕' // Prefer 'close' key if mobileMenuIcon provided, else default
            : getIconComponent(mobileMenuIcon || 'menu', mergedIconMapping) || '☰' // Use provided icon, else 'menu' key, else default
          }
        </button>
      )}

      {/* --- Mobile Menu --- */}
      {/* MobileMenuComponent now handles its own visibility based on props */}
      <MobileMenuComponent
        isOpen={isMobileMenuOpen}
        toggleMenu={toggleMobileMenu}
        items={items}
        isActiveRoute={isActiveRoute}
        iconMapping={mergedIconMapping}
        isMobileView={isMobileView} // Pass mobile view status
        logo={logo}
        homeHref={homeHref}
        mobileHeader={mobileHeader}
        mobileTitle={mobileTitle}
        // mobileMenuStyle prop can be added if needed
      />
    </NavContext.Provider>
  );
};

export default memo(NavigationBar);