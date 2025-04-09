import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NavItem } from '../navigationbar/navbarhooks/navigation'; // Adjusted path
import { ANIMATIONS, MOBILE_MENU_BUTTON_CLASS } from '../navigationbar/navbarhooks/navigation'; // Adjusted path
import { getIconComponent } from '../navigationbar/navbarhooks/IconUtils'; // Adjusted path
import * as MobileStyles from '../navbarstyles/MobileNavigation.styles'; // Adjusted path
import { useModalBehavior } from '../navigationbar/navbarhooks/useModalBehavior'; // Adjusted path
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
  closeMenuIcon?: string; // Changed to string | undefined
}

/**
 * Memoized component for rendering the entire mobile menu overlay.
 * Restored centered logo with title below it and fixed TypeScript issues.
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
  closeMenuIcon = 'close', // Default close icon as string
}) => {
  const router = useRouter();
  const modalId = "mobile-menu";
  const triggerButtonSelector = `.${MOBILE_MENU_BUTTON_CLASS}`;

  useModalBehavior(isOpen && isMobileView, toggleMenu, modalId, triggerButtonSelector);

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
          {/* Header section - Centered logo above title with spacing, button at top right */}
          <div className={MobileStyles.mobileMenuHeaderStyle}>
            {/* Centered Logo */}
            {logo && (
              <div className={MobileStyles.mobileMenuLogoContainerStyle}>
                <Link href={homeHref} passHref legacyBehavior>
                  <a
                    className={MobileStyles.mobileMenuLogoLinkStyle}
                    tabIndex={0}
                    aria-label="Home"
                    onClick={(e) => { e.preventDefault(); toggleMenu(); router.push(homeHref); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMenu(); router.push(homeHref); } }}
                    role="link"
                  >
                    {logo}
                  </a>
                </Link>
              </div>
            )}
            
            {/* Title Below Logo (with increased spacing due to container margin) */}
            {mobileTitle && (
              <div className={MobileStyles.mobileMenuTitleContainerStyle}>
                <div className={MobileStyles.mobileMenuTitleTextStyle}>{mobileTitle}</div>
              </div>
            )}
            
            {/* Close Button (Now absolutely positioned at top right) */}
            <button
              className={MobileStyles.menuCloseButtonStyle}
              onClick={toggleMenu}
              aria-label="Close navigation menu"
              tabIndex={0}
            >
              {getIconComponent(closeMenuIcon, iconMapping, 'close')}
            </button>
          </div>
          
          {/* Optional Custom Header Content */}
          {mobileHeader && (
            <div className={MobileStyles.mobileMenuHeaderTextStyle}>{mobileHeader}</div>
          )}

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
              {actionItems}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default memo(MobileMenuComponent);