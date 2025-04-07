import { useCallback } from 'react';

/**
 * Hook for handling keyboard navigation in mobile menu items
 * Manages navigation between menu items, submenu toggling, and focus management
 */
export function useMobileMenuItemKeyboardNav(
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
        toggleSubmenu();
        break;
      case 'Escape':
        e.preventDefault();
        if (isSubmenuOpen) {
          toggleSubmenu();
          (e.target as HTMLElement).focus();
        } else {
          // Close the whole menu on Escape from top level
          toggleMenu();
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (isSubmenuOpen && hasSubmenu) {
          document.querySelector<HTMLElement>(`#${mobileSubmenuId} [role="menuitem"]`)?.focus();
        } else if (currentIndex < menuItems.length - 1) {
          menuItems[currentIndex + 1]?.focus();
        } else {
          menuItems[0]?.focus(); // Wrap to top
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex > 0) {
          menuItems[currentIndex - 1]?.focus();
        } else {
          // Focus logo or hamburger button
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
 * Hook for handling keyboard navigation in mobile submenu items
 * Manages navigation between submenu items, focus management, and menu closing
 */
export function useMobileSubmenuKeyboardNav(
  mobileNavItemId: string,
  parentId: string,
  setIsSubmenuOpen: (isOpen: boolean) => void,
  handleNavigation: (href: string) => void
) {
  return useCallback((subItemId: string, href: string) => {
    return (e: React.KeyboardEvent) => {
      const parentSubmenu = (e.target as HTMLElement).closest('[role="menu"]');
      if (!parentSubmenu) return;
      const submenuItems = Array.from(parentSubmenu.querySelectorAll<HTMLElement>('[role="menuitem"]'));
      const currentSubIndex = submenuItems.findIndex(si => si.id === `mobile-submenu-item-${parentId}-${subItemId}`);

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          handleNavigation(href);
          break;
        case 'Escape':
          e.preventDefault();
          setIsSubmenuOpen(false);
          document.getElementById(mobileNavItemId)?.focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (currentSubIndex > 0) {
            submenuItems[currentSubIndex - 1]?.focus();
          } else {
            document.getElementById(mobileNavItemId)?.focus(); // Focus parent item
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (currentSubIndex < submenuItems.length - 1) {
            submenuItems[currentSubIndex + 1]?.focus();
          } else {
            // Focus next main menu item
            const parentMenu = document.getElementById(mobileNavItemId)?.closest('[role="menubar"]');
            if (parentMenu) {
              const menuItems = Array.from(parentMenu.querySelectorAll<HTMLElement>('[role="menuitem"][id^="mobile-nav-item-"]'));
              const parentIndex = menuItems.findIndex(el => el.id === mobileNavItemId);
              const nextItem = menuItems[parentIndex < menuItems.length - 1 ? parentIndex + 1 : 0]; // Wrap around
              nextItem?.focus();
              setIsSubmenuOpen(false); // Close current submenu
            }
          }
          break;
        case 'Tab':
          // Tab handling logic for focus trapping
          if (submenuItems.length > 0) {
            const firstElement = submenuItems[0];
            const lastElement = submenuItems[submenuItems.length - 1];
            if (e.shiftKey && document.activeElement === firstElement) {
              e.preventDefault();
              document.getElementById(mobileNavItemId)?.focus(); // Focus parent on Shift+Tab from first
            } else if (!e.shiftKey && document.activeElement === lastElement) {
              e.preventDefault();
              // Focus next main menu item on Tab from last
              const parentMenu = document.getElementById(mobileNavItemId)?.closest('[role="menubar"]');
              if (parentMenu) {
                const menuItems = Array.from(parentMenu.querySelectorAll<HTMLElement>('[role="menuitem"][id^="mobile-nav-item-"]'));
                const parentIndex = menuItems.findIndex(el => el.id === mobileNavItemId);
                const nextItem = menuItems[parentIndex < menuItems.length - 1 ? parentIndex + 1 : 0];
                nextItem?.focus();
                setIsSubmenuOpen(false);
              }
            }
            // Standard tab behavior within submenu is implicitly handled if not prevented
          } else {
            // If no focusable items, prevent tabbing away and focus parent
            e.preventDefault();
            document.getElementById(mobileNavItemId)?.focus();
          }
          break;
      }
    };
  }, [mobileNavItemId, parentId, setIsSubmenuOpen, handleNavigation]);
}

export default {
  useMobileMenuItemKeyboardNav,
  useMobileSubmenuKeyboardNav
};