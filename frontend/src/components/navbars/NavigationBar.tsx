import React, { useCallback, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cx } from '../../../styled-system/css'; // Assuming this path is correct relative to the component file

// --- Import Custom Hooks ---
import { useDesktopNavigation } from './navbarhooks/useDesktopNavigation';
import { useIsActiveRoute } from './navbarhooks/useIsActiveRoute';
import { useResponsiveNavigation } from './navbarhooks/useResponsiveHook';

// --- Import Types and Constants ---
// Import the updated props type (without mobileActionItems)
import { NavigationBarProps } from './navbarhooks/navigation';
import { DEFAULT_NAV_ITEMS, DEFAULT_ICON_MAPPING, getIconComponent } from './navbarhooks/IconUtils';
import { MOBILE_MENU_BUTTON_CLASS } from './navbarhooks/navigation';

// --- Import Extracted Styles ---
import * as DesktopStyles from './navbarstyles/DeskTopNavigation.styles';
import * as MobileStyles from './navbarstyles/MobileNavigation.styles';

// --- Import Extracted Sub-Components ---
import DesktopNavItemComponent from './navbarcomponents/DesktopNavItemComponent';
import GlobalSubmenuComponent from './navbarcomponents/GlobalSubmenuComponent';
import MobileMenuComponent from './navbarcomponents/MobileMenuComponent';

/**
 * The main NavigationBar component (Refactored for Option 3).
 * Passes the same `actionItems` to both desktop and mobile views.
 * Fixed missing props issue.
 */
const NavigationBar: React.FC<NavigationBarProps> = ({
  // --- Content Configuration Props ---
  items = DEFAULT_NAV_ITEMS,
  logo = null,
  homeHref = '/',
  ariaLabel = "Main Navigation",
  showItemDescriptions = false, // Prop is defined and passed down
  iconMapping = {},
  mobileHeader = null,
  mobileTitle = 'Menu',
  mobileMenuIcon,
  closeMenuIcon,
  actionItems = null, // Single prop for action items

  // --- Layout & Dimensions Props ---
  height = '45px',
  maxWidth = 'xl',
  horizontalPadding = '6',
  verticalPadding = 'md',
  zIndex = 100,
  itemGap = 'md',

  // --- Behavior Props ---
  mobileBreakpoint = 768,
  submenuBehavior = 'hover',
  submenuCloseDelay = 200,
  hideOnScroll = true,
  scrollThreshold = 5,

  // --- Visual Styling Props ---
  backdropFilter = 'blur(12px)',
}) => {
  const router = useRouter();
  const mergedIconMapping = useMemo(() => ({ ...DEFAULT_ICON_MAPPING, ...iconMapping }), [iconMapping]);

  const {
    isClient,
    isMobileView,
    isMobileMenuOpen,
    visible,
    toggleMobileMenu
  } = useResponsiveNavigation(mobileBreakpoint, hideOnScroll, scrollThreshold);

  const handleNavigate = useCallback((href: string) => { router.push(href); }, [router]);

  const {
    activeItemId,
    activeItem,
    slideDirection,
    getNavItemProps,
    getSubmenuProps,
    handleSubmenuItemClick,
  } = useDesktopNavigation({ items, submenuBehavior, submenuCloseDelay, onNavigate: handleNavigate });

  const isActiveRoute = useIsActiveRoute();

  // --- Inline styles calculated from props ---
  const navBarStyleInline: React.CSSProperties = {
    height: typeof height === 'number' ? `${height}px` : height,
    zIndex: zIndex,
    backdropFilter: backdropFilter,
  };
  const navBarContentStyleInline: React.CSSProperties = {
     maxWidth: maxWidth === 'full' ? '100%' : maxWidth === 'none' ? 'none' : `var(--sizes-container-${maxWidth}, 1200px)`,
     paddingTop: `var(--spacing-${{ none: '0', xs: '1', sm: '2', md: '3', lg: '4', xl: '5', '2xl': '6' }[verticalPadding] || '3'})`,
     paddingBottom: `var(--spacing-${{ none: '0', xs: '1', sm: '2', md: '3', lg: '4', xl: '5', '2xl': '6' }[verticalPadding] || '3'})`,
     paddingLeft: `var(--spacing-${horizontalPadding || '6'})`,
     paddingRight: `var(--spacing-${horizontalPadding || '6'})`,
  };
  const navBarItemsContainerStyleInline: React.CSSProperties = {
     gap: `var(--spacing-${{ none: '0', xs: '2', sm: '3', md: '4', lg: '6', xl: '8' }[itemGap] || '4'})`,
  };
  // --- End Inline Styles ---

  if (!isClient) return null;

  return (
    <>
      {/* --- Desktop Navigation Rendering (Conditional) --- */}
      {!isMobileView && (
        <nav
          className={DesktopStyles.navBarBaseStyle}
          style={navBarStyleInline}
          data-visible={visible}
          role="navigation"
          aria-label={ariaLabel}
        >
          <div className={DesktopStyles.navBarContentStyle} style={navBarContentStyleInline}>
            {/* Logo Area */}
            {logo && (
              <div className={DesktopStyles.navBarLogoStyle}>
                  <Link href={homeHref} passHref legacyBehavior>
                      <a
                          className={cx(DesktopStyles.logoLinkBaseStyle, "group")}
                          data-group
                          tabIndex={0}
                          aria-label="Navigate to Home Page"
                          role="link"
                          onClick={(e) => (e.target as HTMLElement).blur()}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e.target as HTMLElement).click(); } }}
                      >
                          {logo}
                          <div className={DesktopStyles.logoTooltipStyle} role="tooltip" aria-hidden="true">Home Page</div>
                      </a>
                  </Link>
              </div>
            )}

            {/* Desktop Nav Items Container */}
            <div className={DesktopStyles.navBarItemsContainerStyle} style={navBarItemsContainerStyleInline} role="menubar" aria-label="Main Menu">
              {items.map((item) => (
                // --- FIXED: Added missing props ---
                <DesktopNavItemComponent
                  key={item.id}
                  item={item}
                  isActive={isActiveRoute(item.href)}
                  isItemActive={activeItemId === item.id}
                  navItemProps={getNavItemProps(item)}
                  iconMapping={mergedIconMapping}
                />
              ))}
            </div>

            {/* Desktop Action Items Container */}
            {actionItems && ( <div className={DesktopStyles.navBarActionsContainerStyle}> {actionItems} </div> )}
          </div>
        </nav>
      )}

      {/* --- Desktop Global Submenu (Rendered outside nav) --- */}
      {!isMobileView && (
        // --- FIXED: Added missing props ---
        <GlobalSubmenuComponent
          activeItem={activeItem}
          submenuProps={getSubmenuProps()}
          onSubmenuItemClick={handleSubmenuItemClick}
          showItemDescriptions={showItemDescriptions}
          slideDirection={slideDirection}
          iconMapping={mergedIconMapping}
          navbarHeight={typeof height === 'number' ? `${height}px` : height}
        />
      )}

      {/* --- Mobile Navigation Rendering (Conditional) --- */}
      {isMobileView && (
        <button className={cx(MobileStyles.mobileButtonStyle, MOBILE_MENU_BUTTON_CLASS)} onClick={toggleMobileMenu} aria-expanded={isMobileMenuOpen} aria-controls="mobile-menu" aria-label={`${isMobileMenuOpen ? 'Close' : 'Open'} navigation menu`} data-state={isMobileMenuOpen ? 'open' : 'closed'} data-visible={visible} >
          {isMobileMenuOpen ? getIconComponent(closeMenuIcon, mergedIconMapping, 'close') : getIconComponent(mobileMenuIcon, mergedIconMapping, 'menu')}
        </button>
      )}

      {/* --- Mobile Menu Overlay Component --- */}
      <MobileMenuComponent
        isOpen={isMobileMenuOpen}
        toggleMenu={toggleMobileMenu}
        items={items}
        isActiveRoute={(href) => href !== undefined ? isActiveRoute(href) : false}
        iconMapping={mergedIconMapping}
        isMobileView={isMobileView}
        logo={logo}
        homeHref={homeHref}
        mobileHeader={mobileHeader}
        mobileTitle={mobileTitle}
        actionItems={actionItems} // Pass the standard actionItems prop directly
      />
    </>
  );
};

export default memo(NavigationBar);
