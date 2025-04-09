import React, { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { cx } from '../../../../styled-system/css'; // Adjusted path
import { NavItem } from '../navigationbar/navbarhooks/navigation'; // Adjusted path
import { ANIMATIONS, MOBILE_NAV_ITEM_CLASS, MOBILE_SUBMENU_ITEM_CLASS } from '../navigationbar/navbarhooks/navigation'; // Adjusted path
import { getIconComponent } from '../navigationbar/navbarhooks/IconUtils'; // Adjusted path
import * as MobileStyles from '../navbarstyles/MobileNavigation.styles'; // Adjusted path
import { useMobileMenuItemKeyboardNav, useMobileSubmenuKeyboardNav } from '../navigationbar/navbarhooks/useMobileMenuKeyboardNav'; // Adjusted path

interface MobileNavItemComponentProps {
  item: NavItem;
  isActive: boolean; // Is the route active?
  iconMapping: Record<string, React.ComponentType<any>>;
  toggleMenu: () => void; // Function to close the entire mobile menu
}

/**
 * Memoized component for rendering a single top-level mobile navigation item
 * and its collapsible submenu. Uses motion for animations and custom hooks
 * for keyboard navigation.
 * (Extracted from NavigationBar.tsx)
 */
const MobileNavItemComponent: React.FC<MobileNavItemComponentProps> = ({
  item,
  isActive,
  iconMapping,
  toggleMenu,
}) => {
  const router = useRouter();
  const pathname = usePathname(); // To check active state of submenu items
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false); // State for this item's submenu
  const mobileNavItemId = `mobile-nav-item-${item.id}`;
  const mobileSubmenuId = `mobile-submenu-${item.id}`;
  const hasSubmenu = Boolean(item.submenu && item.submenu.length > 0);
  const hasIcon = Boolean(item.icon);

  // Navigate and close the main mobile menu
  const handleNavigation = useCallback((href: string) => {
    router.push(href);
    toggleMenu(); // Close the entire overlay on navigation
  }, [router, toggleMenu]);

  // Toggle submenu or navigate if it's a direct link
  const toggleSubmenu = useCallback(() => {
    if (hasSubmenu) {
      setIsSubmenuOpen(prev => !prev);
    } else if (item.href) {
      handleNavigation(item.href); // Navigate directly if no submenu
    }
  }, [hasSubmenu, item.href, handleNavigation]);

  // --- Keyboard Navigation Hooks ---
  // Hook for handling Up/Down/Enter/Space/Escape on the main mobile item
  const handleKeyDown = useMobileMenuItemKeyboardNav(
    mobileNavItemId, mobileSubmenuId, hasSubmenu, isSubmenuOpen, toggleSubmenu, toggleMenu
  );
  // Hook factory for generating keydown handlers for submenu items
  const createSubmenuKeyHandler = useMobileSubmenuKeyboardNav(
    mobileNavItemId, item.id, setIsSubmenuOpen, handleNavigation
  );
  // --- End Keyboard Navigation Hooks ---

  return (
    // Animate the entire item container (including submenu)
    <motion.div variants={ANIMATIONS.mobileMenuItem} role="presentation">
      {/* Button for the top-level mobile item */}
      <button
        id={mobileNavItemId}
        className={cx(MobileStyles.mobileNavItemBaseStyle, MOBILE_NAV_ITEM_CLASS)}
        onClick={toggleSubmenu}
        role="menuitem" // Role for the item within the mobile menu bar
        // ARIA attributes for submenu state
        aria-haspopup={hasSubmenu ? "true" : undefined}
        aria-expanded={hasSubmenu ? isSubmenuOpen : undefined}
        aria-controls={hasSubmenu ? mobileSubmenuId : undefined}
        aria-current={isActive ? 'page' : undefined} // Indicate if it's the current page
        tabIndex={0} // Make focusable
        onKeyDown={handleKeyDown} // Attach keyboard handler
        data-active={isActive} // Styling hook
      >
        {/* Content: Icon and Label */}
        <div className={MobileStyles.mobileNavItemContentStyle}>
          {hasIcon && getIconComponent(item.icon, iconMapping)}
          <span>{item.label}</span>
        </div>
        {/* Animated arrow for items with submenus */}
        {hasSubmenu && (
          <motion.span
            className={MobileStyles.mobileNavItemArrowStyle}
            variants={ANIMATIONS.arrow}
            initial="closed"
            animate={isSubmenuOpen ? "open" : "closed"}
            aria-hidden="true"
          >
            {getIconComponent('arrow', iconMapping)}
          </motion.span>
        )}
      </button>

      {/* Animated Submenu (conditionally rendered) */}
      <AnimatePresence initial={false}>
        {isSubmenuOpen && hasSubmenu && (
          <motion.div
            id={mobileSubmenuId}
            className={MobileStyles.mobileSubmenuContainerStyle}
            variants={ANIMATIONS.mobileSubmenu} // Collapse/expand animation
            initial="initial"
            animate="animate"
            exit="exit"
            role="menu" // Submenu role
            aria-labelledby={mobileNavItemId} // Linked to the parent item
          >
            {/* Map and render submenu items */}
            {item.submenu?.map((subItem) => {
              const isSubItemActive = pathname === subItem.href; // Check if submenu item route is active
              return (
                <button
                  key={subItem.id}
                  id={`mobile-submenu-item-${item.id}-${subItem.id}`}
                  className={cx(MobileStyles.mobileSubmenuItemBaseStyle, MOBILE_SUBMENU_ITEM_CLASS)}
                  onClick={() => handleNavigation(subItem.href)}
                  role="menuitem" // Role for item within the submenu
                  tabIndex={0} // Make focusable
                  onKeyDown={createSubmenuKeyHandler(subItem.id, subItem.href)} // Attach keyboard handler
                  aria-label={subItem.description ? `${subItem.label}: ${subItem.description}` : subItem.label}
                  aria-current={isSubItemActive ? 'page' : undefined} // Indicate current page
                  data-active={isSubItemActive} // Styling hook
                >
                  {/* Optional icon */}
                  {subItem.icon && (
                    <span className={MobileStyles.mobileSubmenuItemIconStyle} aria-hidden="true">
                      {getIconComponent(subItem.icon, iconMapping)}
                    </span>
                  )}
                  <span className={MobileStyles.mobileSubmenuItemLabelStyle}>
                    {subItem.label}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default memo(MobileNavItemComponent);