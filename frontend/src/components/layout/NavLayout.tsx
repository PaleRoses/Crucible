'use client';

import React from 'react';
import { iconMapping } from './layoutdata/IconMappings';
import { navItems } from './layoutdata/NavigationData';
import { MoonIcon } from './layoutdata/IconComponents';
import NavigationBar from '@/components/navbars/navigationbar/NavigationBar';
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

  
  return (
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
  );
};

NavLayout.displayName = 'NavLayout';

export default NavLayout;