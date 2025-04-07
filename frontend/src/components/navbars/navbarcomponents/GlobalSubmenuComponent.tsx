import React, { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavItem } from '../navbarhooks/navigation'; // Adjusted path
import { ANIMATIONS } from '../navbarhooks/navigation'; // Adjusted path
import { getIconComponent } from '../navbarhooks/IconUtils'; // Adjusted path
import * as DesktopStyles from '../navbarstyles/DeskTopNavigation.styles'; // Adjusted path
import MemoizedSubmenuItem from './MemoizedSubmenuItem'; // Import sibling component
import { useDesktopNavigation } from '../navbarhooks/useDesktopNavigation'; // Adjusted path

interface GlobalSubmenuComponentProps {
  activeItem: NavItem | null; // The NavItem whose submenu is currently active, or null
  // Get the specific type for submenuProps from the hook's return type
  submenuProps: ReturnType<ReturnType<typeof useDesktopNavigation>['getSubmenuProps']>;
  onSubmenuItemClick: (href: string) => void; // Callback when a submenu item is clicked
  showItemDescriptions: boolean; // Prop to control description visibility (currently unused in child)
  slideDirection: 'left' | 'right'; // Animation direction ('left' or 'right')
  iconMapping: Record<string, React.ComponentType<any>>;
  navbarHeight: string | number; // Used to position the submenu below the navbar
}

/**
 * Memoized component for rendering the global desktop submenu container.
 * Uses AnimatePresence for smooth transitions between different submenus.
 * Renders the active submenu's items using MemoizedSubmenuItem.
 * (Extracted from NavigationBar.tsx)
 */
const GlobalSubmenuComponent: React.FC<GlobalSubmenuComponentProps> = ({
  activeItem,
  submenuProps,
  onSubmenuItemClick,
  showItemDescriptions,
  slideDirection,
  iconMapping,
  navbarHeight,
}) => {
  // Determine animation variant based on slide direction
  const contentAnimationVariant = useMemo(() => {
    return slideDirection === 'right'
      ? ANIMATIONS.submenuContentSlideRight
      : ANIMATIONS.submenuContentSlideLeft;
  }, [slideDirection]);

  // Dynamic style to position the submenu below the navbar
  const rootStyleDynamic: React.CSSProperties = {
    top: navbarHeight,
  };

  return (
    // Root container for positioning
    <div
      className={DesktopStyles.globalSubmenuRootStyle}
      style={rootStyleDynamic}
      role="presentation" // Not interactive itself
    >
      {/* AnimatePresence handles enter/exit animations when activeItem changes */}
      <AnimatePresence mode="wait">
        {activeItem && ( // Only render if there's an active submenu
          <motion.div
            {...submenuProps} // Spread event handlers (e.g., onMouseLeave)
            className={DesktopStyles.globalSubmenuContainerStyle}
            variants={ANIMATIONS.submenu} // Fade/scale animation for the container
            initial="initial"
            animate="animate"
            exit="exit"
            key={`global-submenu-${activeItem.id}`} // Key ensures recreation on item change
            layoutId="global-submenu" // Shared layout ID for smoother transition
            role="menu" // ARIA role for the submenu
            aria-label={`${activeItem.label} submenu`} // ARIA label
            aria-labelledby={`nav-item-${activeItem.id}`} // Links to the triggering nav item
          >
            {/* Inner container for content animation (sliding) */}
            <motion.div
              className={DesktopStyles.globalSubmenuGridStyle}
              variants={contentAnimationVariant} // Apply slide animation
              initial="initial"
              animate="animate"
              exit="exit"
              key={`submenu-content-${activeItem.id}`} // Key ensures recreation
              layoutId={`submenu-content-${activeItem.id}`} // Shared layout ID
              role="presentation"
            >
              {/* Optional header for the submenu */}
              {activeItem.label && (
                <div className={DesktopStyles.globalSubmenuHeaderStyle} role="presentation">
                  <div className={DesktopStyles.globalSubmenuTitleStyle} id={`submenu-header-${activeItem.id}`}>
                    {activeItem.label}
                  </div>
                  {/* Optional description (often taken from the first subitem) */}
                  {activeItem.submenu?.[0]?.description && (
                    <div className={DesktopStyles.globalSubmenuDescriptionStyle} id={`submenu-description-${activeItem.id}`}>
                      {activeItem.submenu[0].description}
                    </div>
                  )}
                </div>
              )}
              {/* Map and render each submenu item */}
              {activeItem.submenu?.map((subItem) => (
                <MemoizedSubmenuItem
                  key={subItem.id}
                  subItem={subItem}
                  onClick={() => onSubmenuItemClick(subItem.href)}
                  parentId={activeItem.id}
                  // Pass down prop, though MemoizedSubmenuItem currently ignores it
                  showDescription={false} // Hardcoded to false based on original JSX
                  iconMapping={iconMapping}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default memo(GlobalSubmenuComponent);
