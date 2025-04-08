'use client';

import React from 'react';
// Import using barrel files for cleaner paths
import { iconMapping } from './layoutdata/IconMappings';
import { navItems } from './layoutdata/NavigationData';
import { MoonIcon } from './layoutdata/IconComponents';
import NavigationBar from '../navbars/NavigationBar';
import ScrollAwareSpacer from '@/components/effects/utility/ScrollAwareNavBar';
// Import sidebar context hook
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

type ScrollAwareSpacerProps = {
  height: number;
  zIndex: number;
  transitionDuration: number;
  showOnScrollUp: boolean;
  hideOnScrollDown: boolean;
  shrinkOnScroll: boolean;
  fadeOnScroll: boolean;
  className?: string;
  children: React.ReactNode;
};

const ScrollAwareSpacerTyped = ScrollAwareSpacer as React.FC<ScrollAwareSpacerProps>;

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
    <ScrollAwareSpacerTyped
      height={40}
      zIndex={100}
      transitionDuration={0.25}
      showOnScrollUp={true}
      hideOnScrollDown={false}
      shrinkOnScroll={false}
      fadeOnScroll={false}
      className="w-full px-0"
    >
      <NavigationBarTyped
        items={currentNavItems} // Use imported navItems
        logo={<MoonIcon />} // Use imported MoonIcon
        homeHref="/"
        ariaLabel="Main Navigation"
        showItemDescriptions={false}
        iconMapping={currentIconMapping} // Use imported iconMapping
        height="45px"
        submenuBehavior="hover"
        submenuCloseDelay={200}
        hideOnScroll={false}
        mobileBreakpoint={768}
        leftActionItems={renderSidebarToggle()} // Add the sidebar toggle button here
      />
    </ScrollAwareSpacerTyped>
  );
};

NavLayout.displayName = 'NavLayout';

export default NavLayout;