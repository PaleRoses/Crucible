import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { cx } from '../../../../styled-system/css'; // Adjusted path
import { NavItem } from '../navbarhooks/navigation'; // Adjusted path
import { ANIMATIONS, DESKTOP_NAV_ITEM_CLASS } from '../navbarhooks/navigation'; // Adjusted path
import { getIconComponent } from '../navbarhooks/IconUtils'; // Adjusted path
import * as DesktopStyles from '../navbarstyles/DeskTopNavigation.styles'; // Adjusted path
import { useDesktopNavigation } from '../navbarhooks/useDesktopNavigation'; // Adjusted path

interface DesktopNavItemComponentProps {
  item: NavItem;
  isActive: boolean; // Is the route itself active?
  isItemActive: boolean; // Is this specific nav item hovered/focused (showing submenu)?
  // Get the specific type for navItemProps from the hook's return type
  navItemProps: ReturnType<ReturnType<typeof useDesktopNavigation>['getNavItemProps']>;
  iconMapping: Record<string, React.ComponentType<any>>;
}

/**
 * Memoized component for rendering a single top-level desktop navigation item.
 * Uses motion for hover effects and arrow animation. Handles ARIA attributes.
 * (Extracted from NavigationBar.tsx)
 */
const DesktopNavItemComponent: React.FC<DesktopNavItemComponentProps> = ({
  item,
  isActive,
  isItemActive,
  navItemProps,
  iconMapping,
}) => {
  const hasSubmenu = Boolean(item.submenu && item.submenu.length > 0);
  const hasIcon = Boolean(item.icon);

  return (
    // Wrapper div for positioning or layout if needed
    <div className={DesktopStyles.desktopNavItemWrapperStyle} role="presentation">
      <motion.button
        {...navItemProps} // Spread event handlers and ARIA props from the hook
        className={cx(DesktopStyles.desktopNavItemBaseStyle, DESKTOP_NAV_ITEM_CLASS)}
        variants={ANIMATIONS.navItem} // Hover animation
        initial="idle"
        whileHover="hover"
        // Data attributes for styling based on active state
        data-active={isActive} // Route active state
        data-item-active={isItemActive} // Item interaction state (hover/focus)
        // ARIA attributes for accessibility
        aria-current={isActive ? 'page' : undefined} // Indicate current page
        aria-haspopup={hasSubmenu ? "true" : undefined} // Indicate submenu presence
        aria-expanded={hasSubmenu ? isItemActive : undefined} // Indicate submenu open state
        aria-label={`${item.label}${hasSubmenu ? ', opens submenu' : ''}`} // Descriptive label
      >
        {/* Content wrapper (icon + label) */}
        <div className={DesktopStyles.desktopNavItemContentStyle}>
          {hasIcon && (
            <span className={DesktopStyles.desktopNavItemIconStyle}>
              {getIconComponent(item.icon, iconMapping)}
            </span>
          )}
          <span className={DesktopStyles.desktopNavItemLabelStyle}>
            {item.label}
          </span>
        </div>
        {/* Animated arrow icon for items with submenus */}
        {hasSubmenu && (
          <motion.span
            className={DesktopStyles.desktopNavItemArrowStyle}
            variants={ANIMATIONS.arrow} // Arrow rotation animation
            initial="closed"
            animate={isItemActive ? "open" : "closed"}
            aria-hidden="true" // Hide decorative arrow from screen readers
          >
            {getIconComponent('arrow', iconMapping)}
          </motion.span>
        )}
      </motion.button>
    </div>
  );
};

export default memo(DesktopNavItemComponent);