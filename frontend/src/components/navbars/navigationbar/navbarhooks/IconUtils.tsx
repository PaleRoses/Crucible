import React from 'react';

/**
 * Default built-in icon components
 */
export const DefaultArrowIcon = React.memo(() => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
));
DefaultArrowIcon.displayName = 'DefaultArrowIcon';

export const DefaultHomeIcon = React.memo(() => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
));
DefaultHomeIcon.displayName = 'DefaultHomeIcon';

export const DefaultSubmenuIcon = React.memo(() => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="10"></circle>
  </svg>
));
DefaultSubmenuIcon.displayName = 'DefaultSubmenuIcon';

export const DefaultInfoIcon = React.memo(() => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM12 7.5h.01M12 11.5v5"/>
  </svg>
));
DefaultInfoIcon.displayName = 'DefaultInfoIcon';

export const DefaultBuildingIcon = React.memo(() => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
  </svg>
));
DefaultBuildingIcon.displayName = 'DefaultBuildingIcon';

export const DefaultUsersIcon = React.memo(() => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 3a4 4 0 100 8 4 4 0 000-8zm8 11a3 3 0 100 6 3 3 0 000-6z"/>
  </svg>
));
DefaultUsersIcon.displayName = 'DefaultUsersIcon';

export const DefaultSettingsIcon = React.memo(() => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 6v-2m0 16v-2M18 12h2M4 12h2m11-7l-1-1M6 6l-1-1m13 13l-1 1M6 18l-1 1M12 19a7 7 0 100-14 7 7 0 000 14zm0-3a4 4 0 110-8 4 4 0 010 8z"/>
  </svg>
));
DefaultSettingsIcon.displayName = 'DefaultSettingsIcon';

export const DefaultCodeIcon = React.memo(() => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
  </svg>
));
DefaultCodeIcon.displayName = 'DefaultCodeIcon';

export const DefaultSmartphoneIcon = React.memo(() => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
    <line x1="12" y1="18" x2="12.01" y2="18"></line>
  </svg>
));
DefaultSmartphoneIcon.displayName = 'DefaultSmartphoneIcon';

export const DefaultMenuIcon = React.memo(() => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
));
DefaultMenuIcon.displayName = 'DefaultMenuIcon';

export const DefaultCloseIcon = React.memo(() => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
));
DefaultCloseIcon.displayName = 'DefaultCloseIcon';

/**
 * Default mapping of icon names to components
 */
export const DEFAULT_ICON_MAPPING: Record<string, React.ComponentType<any>> = {
  'arrow': DefaultArrowIcon,
  'home': DefaultHomeIcon,
  'submenu': DefaultSubmenuIcon,
  'info': DefaultInfoIcon,
  'building': DefaultBuildingIcon,
  'users': DefaultUsersIcon,
  'settings': DefaultSettingsIcon,
  'code': DefaultCodeIcon,
  'smartphone': DefaultSmartphoneIcon,
  'menu': DefaultMenuIcon,
  'close': DefaultCloseIcon,
};

/**
 * Default navigation items
 */
export const DEFAULT_NAV_ITEMS = [
  { 
    id: 'home', 
    label: 'Home', 
    href: '/', 
    icon: 'home', 
    submenu: [] 
  },
  { 
    id: 'about', 
    label: 'About', 
    href: '/about', 
    icon: 'info', 
    submenu: [
      { 
        id: 'company', 
        label: 'Company', 
        href: '/about/company', 
        description: 'Learn more about us', 
        icon: 'building' 
      }, 
      { 
        id: 'team', 
        label: 'Team', 
        href: '/about/team', 
        description: 'Meet our team', 
        icon: 'users' 
      }
    ] 
  },
  { 
    id: 'services', 
    label: 'Services', 
    href: '/services', 
    icon: 'settings', 
    submenu: [
      { 
        id: 'web', 
        label: 'Web Dev', 
        href: '/services/web', 
        description: 'Web solutions', 
        icon: 'code' 
      }, 
      { 
        id: 'mobile', 
        label: 'Mobile Apps', 
        href: '/services/mobile', 
        description: 'iOS & Android', 
        icon: 'smartphone' 
      }
    ] 
  }
];

/**
 * Gets the appropriate icon component based on the icon prop and mapping
 * 
 * @param icon - The icon prop (React node or string)
 * @param iconMapping - Mapping of icon keys to components
 * @param defaultIconKey - Optional fallback icon key if icon is undefined
 * @returns React node for the icon or null
 */
export const getIconComponent = (
  icon: React.ReactNode | string | undefined,
  iconMapping: Record<string, React.ComponentType<any>>,
  defaultIconKey?: string
): React.ReactNode => {
  if (!icon && !defaultIconKey) return null;
  
  let IconComponent: React.ComponentType<any> | undefined;
  
  if (typeof icon === 'string') {
    IconComponent = iconMapping[icon];
  } else if (React.isValidElement(icon)) {
    return icon;
  }
  
  if (!IconComponent && defaultIconKey) {
    IconComponent = iconMapping[defaultIconKey];
  }
  
  return IconComponent ? <IconComponent /> : null;
};

export default {
  DEFAULT_ICON_MAPPING,
  DEFAULT_NAV_ITEMS,
  getIconComponent
};