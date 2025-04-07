import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NavItem } from '../navbarhooks/navigation'; // Adjusted path
import { ANIMATIONS, MOBILE_MENU_BUTTON_CLASS } from '../navbarhooks/navigation'; // Adjusted path
import { getIconComponent } from '../navbarhooks/IconUtils'; // Adjusted path
import * as MobileStyles from '../navbarstyles/MobileNavigation.styles'; // Adjusted path
import { useModalBehavior } from '../navbarhooks/useModalBehavior'; // Adjusted path
import MobileNavItemComponent from './MobileNavItemComponent'; // Import sibling

interface MobileMenuComponentProps {
  isOpen: boolean;
  toggleMenu: () => void;
  items: NavItem[];
  isActiveRoute: (href: string | undefined) => boolean;
  iconMapping: Record<string, React.ComponentType<any>>;
  isMobileView: boolean;
  logo?: React.ReactNode;
  homeHref?: string;
  mobileHeader?: React.ReactNode;
  mobileTitle?: string;
  /** Action items to render at the bottom */
  actionItems?: React.ReactNode;
}

/**
 * Memoized component for rendering the entire mobile menu overlay.
 * Renders action items (passed via props) at the bottom.
 * Fixed missing logo/header rendering.
 */
const MobileMenuComponent: React.FC<MobileMenuComponentProps> = ({
  isOpen,
  toggleMenu,
  items,
  isActiveRoute,
  iconMapping,
  isMobileView,
  logo,
  homeHref = '/',
  mobileHeader,
  mobileTitle = 'Menu',
  actionItems = null,
}) => {
  const router = useRouter();
  const modalId = "mobile-menu";
  const triggerButtonSelector = `.${MOBILE_MENU_BUTTON_CLASS}`;

  useModalBehavior(isOpen && isMobileView, toggleMenu, modalId, triggerButtonSelector);

  const titleContainerDynamicStyle: React.CSSProperties = {
    marginBottom: mobileHeader ? '0.75rem' : 0,
  };

  return (
    <AnimatePresence>
      {isOpen && isMobileView && (
        <motion.div
          id={modalId}
          className={MobileStyles.mobileMenuContainerStyle}
          variants={ANIMATIONS.mobileMenu}
          initial="closed"
          animate="open"
          exit="closed"
          role="dialog"
          aria-modal="true"
          aria-label={mobileTitle || "Mobile Navigation Menu"}
        >
          {/* Header section */}
          <div className={MobileStyles.mobileMenuHeaderStyle}>
            {/* --- FIXED: Restored Logo Rendering --- */}
            {logo && (
              <div className={MobileStyles.mobileMenuLogoContainerStyle}>
                <Link href={homeHref} passHref legacyBehavior>
                  <a
                    className={MobileStyles.mobileMenuLogoLinkStyle}
                    tabIndex={0} // Make focusable
                    aria-label="Home"
                    // Navigate and close menu on click/Enter/Space
                    onClick={(e) => { e.preventDefault(); toggleMenu(); router.push(homeHref); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMenu(); router.push(homeHref); } }}
                    role="link"
                  >
                    {logo}
                  </a>
                </Link>
              </div>
            )}
            {/* --- FIXED: Restored Title Rendering --- */}
            {mobileTitle && (
              <div className={MobileStyles.mobileMenuTitleContainerStyle} style={titleContainerDynamicStyle}>
                 <div className={MobileStyles.mobileMenuTitleTextStyle}>{mobileTitle}</div>
              </div>
            )}
            {/* Optional Custom Header Content */}
            {mobileHeader && (
              <div className={MobileStyles.mobileMenuHeaderTextStyle}>{mobileHeader}</div>
            )}
          </div>

          {/* Scrollable content area (if needed) */}
          {/* <div style={{ overflowY: 'auto', flexGrow: 1 }}> */}

          {/* Container for the main navigation items */}
          <motion.div
            className={MobileStyles.mobileMenuNavItemsStyle}
            role="menubar"
            aria-label="Main Navigation"
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
          </motion.div>

          {/* Mobile Action Items Container */}
          {actionItems && (
            <div className={MobileStyles.mobileMenuActionsContainerStyle}>
              {/* Styles defined in MobileNavigation.styles.ts */}
              {actionItems}
            </div>
          )}

          {/* </div> */}
          {/* End scrollable area */}

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default memo(MobileMenuComponent);
