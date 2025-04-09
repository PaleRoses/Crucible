import React, { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Updated Imports using '@/' assumed to map to 'src/' ---
import { NavItem } from '@/components/navbars/navbarhooks/navigation'; // Already using alias
import { ANIMATIONS } from '@/components/navbars/navbarhooks/navigation'; // Changed from ../
import { getIconComponent } from '@/components/navbars/navbarhooks/IconUtils'; // Changed from ../
import * as DesktopStyles from '@/components/navbars/navbarstyles/DeskTopNavigation.styles'; // Changed from ../
import { useDesktopNavigation } from '@/components/navbars/navbarhooks/useDesktopNavigation'; // Changed from ../
// --- Local import remains relative ---
import MemoizedSubmenuItem from './MemoizedSubmenuItem'; // Import sibling component

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
      role="presentation"
    >
      {/* Fixed container that is always present but only visible when activeItem exists */}
      <motion.div
        {...submenuProps} // Spread event handlers (e.g., onMouseLeave, onMouseEnter, keyboard events)
        className={DesktopStyles.globalSubmenuContainerStyle}
        initial={{ opacity: 0 }}
        animate={activeItem ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.3 }} // Slightly slower animation
        role="menu"
        aria-label={activeItem ? `${activeItem.label} submenu` : 'submenu'}
        aria-labelledby={activeItem ? `nav-item-${activeItem.id}` : undefined}
      >
        {/* AnimatePresence for handling content transitions */}
        <AnimatePresence mode="popLayout" initial={false}>
          {activeItem && (
            <motion.div
              className={DesktopStyles.globalSubmenuGridStyle}
              key={`submenu-content-${activeItem.id}`}
              variants={contentAnimationVariant}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
                width: "100%"
              }}
              role="presentation"
            >
              {/* Optional header for the submenu */}
              {activeItem.label && (
                <div
                  className={DesktopStyles.globalSubmenuHeaderStyle}
                  role="presentation"
                >
                  <div
                    className={DesktopStyles.globalSubmenuTitleStyle}
                    id={`submenu-header-${activeItem.id}`}
                  >
                    {activeItem.label}
                  </div>
                  {/* Optional description (often taken from the first subitem) */}
                  {activeItem.submenu?.[0]?.description && (
                    <div
                      className={DesktopStyles.globalSubmenuDescriptionStyle}
                      id={`submenu-description-${activeItem.id}`}
                    >
                      {activeItem.submenu[0].description}
                    </div>
                  )}
                </div>
              )}

              {/* Submenu items container with staggered animation - horizontal layout */}
              <motion.div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "nowrap",
                  alignItems: "center"
                }}
                variants={ANIMATIONS.submenuItemsContainer}
              >
                {/* Map and render each submenu item with staggered animation */}
                {activeItem.submenu?.map((subItem, index) => (
                  <motion.div
                    key={subItem.id}
                    custom={index}
                    variants={ANIMATIONS.submenuItemStagger}
                    style={{ display: "inline-block" }}
                  >
                    <MemoizedSubmenuItem
                      subItem={subItem}
                      onClick={() => onSubmenuItemClick(subItem.href)}
                      parentId={activeItem.id}
                      showDescription={false} // Kept as false based on original code comment/props
                      iconMapping={iconMapping}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default memo(GlobalSubmenuComponent);