'use client';

import React from 'react';
import { iconMapping } from './layoutdata/IconMappings';
import { navItems } from './layoutdata/NavigationData';
import { MoonIcon } from './layoutdata/IconComponents';
import NavigationBar from '@/components/navbars/navigationbar/NavigationBar';
import IntersectionObserverSpacer from '@/components/effects/utility/ScrollAwareNavBar'; // Import the spacer
import { useSidebar } from '../../contexts/SideBarContext';

type NavigationBarProps = {
  items: any[]; // Replace 'any' with the actual type for navItems
  logo: React.ReactNode;
  homeHref: string;
  ariaLabel: string;
  showItemDescriptions: boolean;
  iconMapping: { [key: string]: React.FC<any> | React.MemoExoticComponent<any> };
  height: string;
  submenuBehavior: 'hover' | 'click';
  submenuCloseDelay: number;
  hideOnScroll: boolean;
  mobileBreakpoint: number;
  leftActionItems?: React.ReactNode;
};

const NavigationBarTyped = NavigationBar as React.FC<NavigationBarProps>;

/**
 * Navigation Layout component
 */
const NavLayout: React.FC = () => {
  // Use the imported config data directly
  const currentNavItems = navItems;
  const currentIconMapping = iconMapping;
  
  // Use sidebar context to get active sidebar and toggle button state
  const { showToggleButton, activeSidebarRef } = useSidebar();
  
  // Render the toggle button from the active sidebar if available
  const renderSidebarToggle = () => {
    if (showToggleButton && activeSidebarRef?.current?.ToggleButton) {
      return (
        <div className="ml-2">
          {activeSidebarRef.current.ToggleButton()}
        </div>
      );
    }
    return null;
  };

  // Calculate the height in pixels based on your NavigationBar height
  const navHeightInPixels = 45; // Convert from "45px" to number 45

  // Add theme colors to the style object
  const spacerCustomStyle: React.CSSProperties = {
    pointerEvents: 'auto', // Allow interaction with navigation elements
    userSelect: 'none', // Prevent text selection
    overflow: 'hidden', // Prevent scrolling
    touchAction: 'none', // Prevent mobile scroll/zoom gestures
    scrollbarWidth: 'none', // Hide scrollbars in Firefox
    msOverflowStyle: 'none', // Hide scrollbars in IE/Edge
    WebkitUserSelect: 'none', // Cross-browser user selection prevention
    MozUserSelect: 'none',
    msUserSelect: 'none',
    WebkitOverflowScrolling: 'auto', // Use valid value - normal scrolling
    WebkitTapHighlightColor: 'transparent', // Remove tap highlight on mobile
    
  };
  
  
  return (
    <IntersectionObserverSpacer 
      height={navHeightInPixels}
      style={spacerCustomStyle} // Apply custom styles
      preventAllScrolling={true} // Enable all anti-scrolling features
      allowKeyboardNavigation={true} // Enable keyboard navigation
    >
      <NavigationBarTyped
        items={currentNavItems}
        logo={<MoonIcon />}
        homeHref="/"
        ariaLabel="Main Navigation"
        showItemDescriptions={false}
        iconMapping={currentIconMapping}
        height="45px"
        submenuBehavior="hover"
        submenuCloseDelay={200}
        hideOnScroll={false} // Set to false since IntersectionObserverSpacer handles scroll behavior
        mobileBreakpoint={768}
        leftActionItems={renderSidebarToggle()}
      />
    </IntersectionObserverSpacer>
  );
};

NavLayout.displayName = 'NavLayout';

export default NavLayout;