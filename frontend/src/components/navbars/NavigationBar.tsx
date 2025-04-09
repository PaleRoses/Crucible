import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { memo, useCallback, useMemo } from 'react';
import { cx } from '../../../styled-system/css';

// --- Import Custom Hooks ---
import { useDesktopNavigation } from '@/components/navbars/navigationbar/navbarhooks/useDesktopNavigation';
import { useIsActiveRoute } from '@/components/navbars/navigationbar/navbarhooks/useIsActiveRoute';
import { useResponsiveNavigation } from '@/components/navbars/navigationbar/navbarhooks/useResponsiveHook';

// --- Import Types and Constants ---
import { DEFAULT_ICON_MAPPING, DEFAULT_NAV_ITEMS, getIconComponent } from '@/components/navbars/navigationbar/navbarhooks/IconUtils';
import { MOBILE_MENU_BUTTON_CLASS, NavigationBarProps } from '@/components/navbars/navigationbar/navbarhooks/navigation';

// --- Import Styles ---
import * as DesktopStyles from '@/components/navbars/navbarstyles/DeskTopNavigation.styles';
import * as MobileStyles from '@/components/navbars/navbarstyles/MobileNavigation.styles';

// --- Import Sub-Components ---
import DesktopNavItemComponent from '@/components/navbars/navbarcomponents/DesktopNavItemComponent';
import GlobalSubmenuComponent from '@/components/navbars/navbarcomponents/GlobalSubmenuComponent';
import MobileMenuComponent from '@/components/navbars/navbarcomponents/MobileMenuComponent';

/**
 * The main NavigationBar component with sidebar support and transparent buttons.
 * Fixed TypeScript issue with closeMenuIcon.
 * Added clickable logo in mobile view.
 * Added leftActionItems prop for customizing the left side of mobile navbar.
 */
const NavigationBar: React.FC<NavigationBarProps> = ({
  // --- Content Configuration Props ---
  items = DEFAULT_NAV_ITEMS,
  logo = null,
  homeHref = '/',
  ariaLabel = "Main Navigation",
  showItemDescriptions = false,
  iconMapping = {},
  mobileHeader = null,
  mobileTitle = 'Crescent',
  mobileMenuIcon,
  closeMenuIcon,
  actionItems = null,
  leftActionItems = null, // NEW: Added prop for left side actions

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
  
  // Extract icon name string from closeMenuIcon if it's provided
  const closeMenuIconName = typeof closeMenuIcon === 'string' ? closeMenuIcon : 'close';

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
     paddingTop: `var(--spacing-${{ none: '0', xs: '1', sm: '2', md: '3', lg: '4', xl: '5', '2xl': '6' }[verticalPadding] || '3'})`,
     paddingBottom: `var(--spacing-${{ none: '0', xs: '1', sm: '2', md: '3', lg: '4', xl: '5', '2xl': '6' }[verticalPadding] || '3'})`,
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

      {/* --- Mobile Navigation Bar (Conditional) --- */}
      {isMobileView && (
        <div 
          className={MobileStyles.mobileNavbarStyle}
          data-visible={visible}
        >
          {/* Left side - Now customizable through leftActionItems prop */}
          <div className={MobileStyles.mobileNavbarLeftStyle}>
            {leftActionItems}
          </div>
          
          {/* Center - Logo or Title - Now Clickable */}
          <div className={MobileStyles.mobileNavbarCenterStyle}>
            {logo ? (
              <Link href={homeHref} passHref legacyBehavior>
                <a
                  className={MobileStyles.mobileNavbarLogoLinkStyle}
                  tabIndex={0}
                  aria-label="Navigate to Home Page"
                  role="link"
                  onClick={(e) => (e.target as HTMLElement).blur()}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e.target as HTMLElement).click(); } }}
                >
                  {logo}
                </a>
              </Link>
            ) : (
              <div className={MobileStyles.mobileNavbarTitleStyle}>
                {mobileTitle || null}
              </div>
            )}
          </div>
          
          {/* Right side - Menu Button */}
          <div className={MobileStyles.mobileNavbarRightStyle}>
            <button 
              className={cx(MobileStyles.mobileButtonStyle, MOBILE_MENU_BUTTON_CLASS)} 
              onClick={toggleMobileMenu} 
              aria-expanded={isMobileMenuOpen} 
              aria-controls="mobile-menu" 
              aria-label={`${isMobileMenuOpen ? 'Close' : 'Open'} navigation menu`} 
              data-state={isMobileMenuOpen ? 'open' : 'closed'} 
            >
              {isMobileMenuOpen 
                ? getIconComponent(closeMenuIconName, mergedIconMapping, 'close') 
                : getIconComponent(mobileMenuIcon, mergedIconMapping, 'menu')
              }
            </button>
          </div>
        </div>
      )}

      {/* Container for main content area */}
      {isMobileView && (
        <div className={MobileStyles.mainContentStyle} id="main-content-container">
          {/* Your main content would go here */}
        </div>
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
        actionItems={actionItems}
        closeMenuIcon={closeMenuIconName} // Fixed: Pass string instead of ReactNode
      />
    </>
  );
};

export default memo(NavigationBar);