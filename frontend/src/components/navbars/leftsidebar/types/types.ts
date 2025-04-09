// types.ts
import React from 'react';

export type DepthOption = "1" | "2" | "3";

export interface NavigationItem {
  label: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  level?: number; 
  href?: string;
  onClick?: () => void;
  badge?: number | string;
  children?: NavigationItem[]; 
}

export interface SidebarSection {
  label: string;
  items: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    badge?: number | string;
  }[];
}

export type SidebarItems = SidebarSection[];

export interface LeftSidebarProps {
  // Appearance
  variant?: 'standard' | 'elevated' | 'minimal' | 'cosmic';
  size?: string;
  // Content
  title?: string;
  logo?: React.ReactNode;
  navigationItems?: NavigationItem[];
  sidebarItems?: SidebarItems;
  footerContent?: React.ReactNode;
  // Behavior
  initiallyExpanded?: boolean;
  onToggle?: (isExpanded: boolean) => void;
  // Content pushing (desktop)
  pushContent?: boolean;
  contentSelector?: string;
  expandedWidth?: string;
  collapsedWidth?: string;
  transitionDuration?: number;
  // Layout & Styling
  headerTopOffset?: string;
  compact?: boolean;
  className?: string;
  // External toggle handling (mobile)
  onToggleExternal?: (isExpanded: boolean) => void;
  externalToggleRef?: React.RefObject<{
    toggle: () => void;
    ToggleButton?: () => React.ReactElement;
  }>;
}

export interface UseSidebarToggleProps {
  isMobile: boolean;
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  isDrawerOpen: boolean;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onToggleExternalRef: React.MutableRefObject<((isExpanded: boolean) => void) | null>;
  onToggle: ((isExpanded: boolean) => void) | null;
  externalToggleRef: React.RefObject<{
    toggle: () => void;
    ToggleButton?: () => React.ReactElement;
  }> | null;
}

export interface UseSidebarToggleResult {
  toggleSidebar: () => void;
  closeDrawer: () => void;
}