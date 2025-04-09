import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { cx } from '../../../../styled-system/css'; // Adjusted path: assuming components dir is one level down
import { SubmenuItem } from '../navigationbar/navbarhooks/navigation'; // Adjusted path
import { ANIMATIONS, DESKTOP_SUBMENU_ITEM_CLASS } from '../navigationbar/navbarhooks/navigation'; // Adjusted path
import { getIconComponent } from '../navigationbar/navbarhooks/IconUtils'; // Adjusted path
import * as DesktopStyles from '@/components/navbars/navbarstyles/DeskTopNavigation.styles'; // Adjusted path

interface MemoizedSubmenuItemProps {
  subItem: SubmenuItem;
  onClick: () => void;
  parentId: string;
  showDescription?: boolean; // Note: Prop exists but description rendering is currently disabled below
  iconMapping: Record<string, React.ComponentType<any>>;
}

/**
 * Memoized component for rendering a single item in the desktop submenu.
 * Uses motion for animations and handles click/keyboard events.
 * (Extracted from NavigationBar.tsx)
 */
const MemoizedSubmenuItem: React.FC<MemoizedSubmenuItemProps> = ({
  subItem,
  onClick,
  parentId,
  showDescription = false,
  iconMapping,
}) => {
  // Generate unique ID for accessibility
  const submenuItemId = `submenu-item-${parentId}-${subItem.id}`;
  const hasIcon = Boolean(subItem.icon);
  // Description rendering logic is commented out in the original JSX, respecting that here.
  const hasDesc = showDescription && Boolean(subItem.description);

  return (
    <motion.button
      key={subItem.id}
      // Apply base styles and specific class name for potential external targeting
      className={cx(DesktopStyles.submenuItemBaseStyle, DESKTOP_SUBMENU_ITEM_CLASS)}
      // Animation variants from constants
      variants={ANIMATIONS.submenuItem}
      initial="initial"
      animate="animate"
      exit="exit"
      // Framer Motion layout animation ID
      layoutId={`submenu-item-${subItem.id}`}
      onClick={onClick}
      role="menuitem"
      id={submenuItemId}
      tabIndex={0} // Make it focusable
      // Keyboard interaction for Enter/Space
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault(); // Prevent default button behavior/scrolling
          onClick();
        }
      }}
      // ARIA label for screen readers
      aria-label={subItem.description ? `${subItem.label}: ${subItem.description}` : subItem.label}
    >
      {/* Render icon if available */}
      {hasIcon && (
        <div className={DesktopStyles.submenuItemIconStyle}>
          {getIconComponent(subItem.icon, iconMapping, 'submenu')}
        </div>
      )}
      {/* Container for label and potentially description */}
      <div className={DesktopStyles.submenuItemContainerStyle}>
        {/* Description rendering (currently inactive based on original JSX) */}
        {/* {hasDesc && (
          <div className={DesktopStyles.submenuItemDescriptionStyle}>{subItem.description}</div>
        )} */}
        <span className={DesktopStyles.submenuItemLabelStyle}>{subItem.label}</span>
      </div>
    </motion.button>
  );
};

export default memo(MemoizedSubmenuItem);