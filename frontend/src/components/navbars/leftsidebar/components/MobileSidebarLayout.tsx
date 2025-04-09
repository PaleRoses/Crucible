import React from 'react';
import { NavigationItem } from '../hooks/index';
import { renderMobileNavigation } from './MobileNavigation';

interface MobileSidebarLayoutProps {
  // Refs
  mobileMenuRef: React.RefObject<HTMLDivElement>;
  overlayRef: React.RefObject<HTMLDivElement>;
  // State
  isDrawerOpen: boolean;
  // Content
  title: string;
  processedNavItems: NavigationItem[];
  expandedItems: string[];
  footerContent: React.ReactNode | null;
  // Styles
  mobileStyles: {
    dropdown: string;
    overlay: string;
    header: string;
    title: string;
    navContainer: string;
    navItem: string;
    navItemContent: string;
    expandIcon: string;
    nestedItemsContainer: string;
    nestedItem: string;
    footer: string;
  };
  // Behavior
  toggleSidebar: () => void;
  toggleItemExpansion: (itemId: string) => void;
  handleNavigation: (item: NavigationItem) => void;
}

const MobileSidebarLayout: React.FC<MobileSidebarLayoutProps> = ({
  mobileMenuRef,
  overlayRef,
  isDrawerOpen,
  title,
  processedNavItems,
  expandedItems,
  footerContent,
  mobileStyles,
  toggleSidebar,
  toggleItemExpansion,
  handleNavigation,
}) => {
  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className={mobileStyles.overlay}
        data-open={isDrawerOpen}
        onClick={(e) => {
          if (e.target === overlayRef.current) {
            e.stopPropagation();
            toggleSidebar();
          }
        }}
        aria-hidden="true"
      />

      {/* Dropdown Container */}
      <div
        id="mobile-dropdown-menu"
        ref={mobileMenuRef}
        className={mobileStyles.dropdown}
        data-open={isDrawerOpen}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isDrawerOpen}
        aria-label="Navigation menu"
        // Add a hint about swipe gesture
        aria-description="Swipe up to close navigation menu"
      >
        {/* Header */}
        <div className={mobileStyles.header}>
          <h2 className={mobileStyles.title}>{title}</h2>
        </div>

        {/* Navigation */}
        <nav className={mobileStyles.navContainer} aria-label="Site navigation">
          {renderMobileNavigation({
            processedNavItems,
            expandedItems,
            toggleItemExpansion,
            handleNavigation,
            mobileStyles
          })}
        </nav>

        {/* Footer */}
        {footerContent && <div className={mobileStyles.footer}>{footerContent}</div>}
      </div>
    </>
  );
};

export default MobileSidebarLayout;