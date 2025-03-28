'use client';

import React, { useState, useCallback, useEffect, useContext, useRef, memo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

// Custom hooks
function useSubmenuManager(submenuBehavior: 'hover' | 'click', submenuCloseDelay: number) {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  
  // Store and restore focus state when activating/deactivating submenu
  useEffect(() => {
    if (activeItemId) {
      lastFocusedElementRef.current = document.activeElement as HTMLElement;
    } else if (lastFocusedElementRef.current) {
      lastFocusedElementRef.current.focus();
      lastFocusedElementRef.current = null;
    }
  }, [activeItemId]);
  
  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Handle delayed submenu closing for hover behavior
  const closeSubmenuWithDelay = useCallback(() => {
    if (submenuBehavior !== 'hover') return;
    
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    
    closeTimeoutRef.current = setTimeout(() => {
      setActiveItemId(null);
    }, submenuCloseDelay);
  }, [submenuBehavior, submenuCloseDelay]);

  // Cancel submenu closing if mouse re-enters
  const cancelSubmenuClosing = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);
  
  // Handle mouse enter for menu items
  const handleNavItemMouseEnter = useCallback((itemId: string) => {
    if (submenuBehavior === 'hover') {
      cancelSubmenuClosing();
      setActiveItemId(itemId);
    }
  }, [cancelSubmenuClosing, submenuBehavior]);
  
  // Handle mouse leave for menu items
  const handleNavItemMouseLeave = useCallback(() => {
    if (submenuBehavior === 'hover') {
      closeSubmenuWithDelay();
    }
  }, [closeSubmenuWithDelay, submenuBehavior]);

  return {
    activeItemId,
    setActiveItemId,
    focusedItemId,
    setFocusedItemId,
    handleNavItemMouseEnter,
    handleNavItemMouseLeave,
    cancelSubmenuClosing,
    closeSubmenuWithDelay
  };
}

function useResponsiveNavigation(mobileBreakpoint: number, hideOnScroll: boolean, scrollThreshold: number) {
  const [isClient, setIsClient] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const scrollPositionRef = useRef(0);
  
  // Client-side initialization and responsive handling
  useEffect(() => {
    setIsClient(true);
    setPrevScrollPos(window.scrollY);
    
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth <= mobileBreakpoint);
    };
    
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    
    return () => {
      window.removeEventListener('resize', checkMobileView);
      if (isMobileMenuOpen) {
        document.body.style.overflow = '';
      }
    };
  }, [mobileBreakpoint, isMobileMenuOpen]);

  // Toggle mobile menu
  const toggleMobileMenu = useCallback(() => {
    if (isMobileView) {
      const mobileMenuButton = document.querySelector('[aria-controls="mobile-menu"]') as HTMLElement;
      const wasOpen = isMobileMenuOpen;
      
      setIsMobileMenuOpen(prev => !prev);
      
      if (wasOpen && mobileMenuButton) {
        setTimeout(() => {
          mobileMenuButton.focus();
        }, 50);
      }
    }
  }, [isMobileView, isMobileMenuOpen]);

  // Scroll behavior
  useEffect(() => {
    if (!isClient || !hideOnScroll) return;
    
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      const scrollingUp = prevScrollPos > currentScrollPos;
      const atTop = currentScrollPos < 10;
      const significantChange = Math.abs(currentScrollPos - prevScrollPos) > scrollThreshold;
      
      if (atTop || (scrollingUp && significantChange)) {
        setVisible(true);
      } else if (!scrollingUp && significantChange && !isMobileMenuOpen) {
        setVisible(false);
      }
      
      setPrevScrollPos(currentScrollPos);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isClient, prevScrollPos, isMobileMenuOpen, hideOnScroll, scrollThreshold]);

  // Handle body scroll lock for mobile menu
  useEffect(() => {
    if (!isClient) return;
    
    const scrollRef = scrollPositionRef;
    
    if (isMobileMenuOpen && isMobileView) {
      const currentScrollPos = window.pageYOffset || document.documentElement.scrollTop;
      scrollRef.current = currentScrollPos;
      
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.touchAction = 'none';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${currentScrollPos}px`;
    } else if (isClient) {
      document.documentElement.style.overflow = '';
      document.documentElement.style.paddingRight = '';
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.style.touchAction = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      
      window.scrollTo(0, scrollRef.current);
    }
    
    return () => {
      if (isClient) {
        document.documentElement.style.overflow = '';
        document.documentElement.style.paddingRight = '';
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.body.style.touchAction = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        
        window.scrollTo(0, scrollRef.current);
      }
    };
  }, [isMobileMenuOpen, isMobileView, isClient]);

  return {
    isClient,
    isMobileView,
    isMobileMenuOpen,
    visible,
    toggleMobileMenu,
    scrollPositionRef
  };
}

// Types & Interfaces
export interface BaseMenuItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode | string;
}

export interface SubmenuItem extends BaseMenuItem {
  description?: string;
}

export interface NavItem extends BaseMenuItem {
  submenu: SubmenuItem[];
}

export interface NavigationBarProps {
  // Content Configuration
  items?: NavItem[];
  logo?: React.ReactNode;
  homeHref?: string;
  ariaLabel?: string;
  showItemDescriptions?: boolean;
  iconMapping?: Record<string, React.ComponentType>;
  mobileHeader?: React.ReactNode;
  mobileTitle?: string;
  mobileMenuIcon?: React.ReactNode;
  
  // Layout & Dimensions
  height?: string | number;
  width?: string;
  maxWidth?: string;
  horizontalPadding?: string;
  verticalPadding?: string;
  zIndex?: number;
  itemGap?: string;
  mobileBreakpoint?: number;
  
  // Behavior
  submenuBehavior?: 'hover' | 'click';
  submenuCloseDelay?: number;
  hideOnScroll?: boolean;
  scrollThreshold?: number;
  
  // Visual Styling
  backgroundColor?: string;
  backdropFilter?: string;
  borderStyle?: string;
  boxShadow?: string;
}

interface NavContextType {
  activeItemId: string | null;
  setActiveItemId: (id: string | null) => void;
  visible: boolean;
  focusedItemId: string | null;
  setFocusedItemId: (id: string | null) => void;
}

// Type definitions for the styles
// Simple type definitions for shadows
interface Shadows {
  standard: string;
  submenu: string;
  mobile: string;
}

interface FontsType {
  desktopNavItem: string;
  desktopSubmenuHeader: string;
  desktopSubmenuItem: string;
  desktopSubmenuDescription: string;
  mobileNavItem: string;
  mobileSubmenuItem: string;
  tooltip: string;
}

interface CommonStylesType {
  screenReaderOnly: React.CSSProperties;
}

interface LogoStylesType {
  container: React.CSSProperties;
  link: React.CSSProperties;
}

interface NavBarStylesType {
  container: (visible: boolean, height: string | number, width: string, zIndex: number, backdropFilter: string, boxShadow: string, borderStyle: string) => React.CSSProperties;
  content: (maxWidth: string, horizontalPadding: string, verticalPadding: string) => React.CSSProperties;
  itemsContainer: (itemGap: string) => React.CSSProperties;
}

interface TooltipStylesType {
  container: (visible: boolean) => React.CSSProperties;
  content: React.CSSProperties;
  arrow: React.CSSProperties;
}

interface SubmenuItemStylesType {
  wrapper: React.CSSProperties;
  hoverState: React.CSSProperties;
  link: React.CSSProperties;
  icon: React.CSSProperties;
  label: React.CSSProperties;
  description: React.CSSProperties;
}

interface DesktopNavItemStylesType {
  wrapper: (itemStyle?: React.CSSProperties) => React.CSSProperties;
  navItem: (isItemActive: boolean, isActive: boolean) => React.CSSProperties;
  content: (isItemActive: boolean, isActive: boolean) => React.CSSProperties;
  icon: React.CSSProperties;
  label: (isItemActive: boolean, isActive: boolean) => React.CSSProperties;
  arrow: (isItemActive: boolean) => React.CSSProperties;
}

interface GlobalSubmenuStylesType {
  container: (submenuStyle?: React.CSSProperties) => React.CSSProperties;
  submenuContainer: React.CSSProperties;
  grid: React.CSSProperties;
  header: React.CSSProperties;
  title: React.CSSProperties;
  description: React.CSSProperties;
}

interface MobileNavItemStylesType {
  navItem: (isActive: boolean) => React.CSSProperties;
  content: React.CSSProperties;
  label: React.CSSProperties;
  arrow: React.CSSProperties;
  submenuContainer: React.CSSProperties;
  submenuItem: React.CSSProperties;
  submenuItemActive: React.CSSProperties;
  submenuItemLink: React.CSSProperties;
  submenuItemIcon: React.CSSProperties;
  submenuItemLabel: React.CSSProperties;
}

interface MobileMenuStylesType {
  button: (isOpen: boolean, visible: boolean) => React.CSSProperties;
  container: (mobileMenuStyle?: React.CSSProperties) => React.CSSProperties;
  navItems: React.CSSProperties;
  header: React.CSSProperties;
  logoContainer: React.CSSProperties;
  titleContainer: (mobileHeader?: React.ReactNode) => React.CSSProperties;
  logoLink: React.CSSProperties;
  headerText: React.CSSProperties;
  titleText: React.CSSProperties;
}

interface StylesType {
  colors: Colors;
  shadows: Shadows;
  fonts: FontsType;
  common: CommonStylesType;
  logo: LogoStylesType;
  navBar: NavBarStylesType;
  tooltip: TooltipStylesType;
  submenuItem: SubmenuItemStylesType;
  desktopNavItem: DesktopNavItemStylesType;
  globalSubmenu: GlobalSubmenuStylesType;
  mobileNavItem: MobileNavItemStylesType;
  mobileMenu: MobileMenuStylesType;
}

// Radically simplified color interface - just 5 colors
interface Colors {
  primary: string;   // Gold accent
  secondary: string; // Dark background 
  tertiary: string;  // Border color
  text: string;      // Text color
  glow: string;      // Glow effect
}

// Our 5 core colors
const COLORS: Colors = {
  primary: 'var(--gold)',              // Gold accent color
  secondary: 'rgba(8, 8, 8, 1)',    // Dark background
  tertiary: 'rgba(255, 255, 255, 0.15)', // Light border
  text: 'rgba(255, 255, 255, 0.8)',    // Light text
  glow: 'rgba(255, 215, 0, 0.10)'      // Gold glow
};

// Define fonts
const FONTS: FontsType = {
  desktopNavItem: '0.95rem',
  desktopSubmenuHeader: '1.25rem',
  desktopSubmenuItem: '0.85rem',
  desktopSubmenuDescription: '0.8rem',
  mobileNavItem: '1.1rem',
  mobileSubmenuItem:   '0.9rem',
  tooltip: '0.75rem'
};

// Define shadow values - derived from our colors
const SHADOWS: Shadows = {
  standard: '0 8px 16px -2px rgba(0, 0, 0, 0.15)',
  submenu: `0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 0 7px ${COLORS.text}`,
  mobile: '0 2px 10px rgba(0, 0, 0, 0.3)'
};

// Centralized style system
const STYLES: StylesType = {
  colors: COLORS,
  shadows: SHADOWS,
  fonts: FONTS,
  common: {
    screenReaderOnly: {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: 0,
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      borderWidth: 0,
    }
  },
  logo: {
    container: {
      display: 'flex',
      alignItems: 'center',
      position: 'absolute',
      left: '3rem',
      opacity: 1,
    },
    link: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: COLORS.primary,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      position: 'relative',
      padding: '8px',
      borderRadius: '50%',
    },
  },
  navBar: {
    container: (visible, height, width, zIndex, backdropFilter, boxShadow, borderStyle) => ({
      position: 'fixed',
      top: 0,
      left: 0,
      width,
      zIndex,
      backdropFilter,
      WebkitBackdropFilter: backdropFilter,
      background: COLORS.secondary,
      height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'transform 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease',
      transform: visible ? 'translateY(0)' : 'translateY(-100%)',
      opacity: visible ? 1 : 0,
      boxShadow: visible ? boxShadow : 'none',
      borderBottom: borderStyle || `1px solid ${COLORS.primary}`,
    }),
    content: (maxWidth, horizontalPadding, verticalPadding) => ({
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      maxWidth,
      margin: '0 auto',
      justifyContent: 'center',
      padding: `${verticalPadding} ${horizontalPadding}`,
    }),
    itemsContainer: (itemGap) => ({
      display: 'flex',
      alignItems: 'center',
      gap: itemGap,
      opacity: 1,
    }),
  },
  tooltip: {
    container: (visible) => ({
      position: 'absolute',
      bottom: '-30px',
      left: '50%',
      transform: 'translateX(-50%)',
      opacity: visible ? 1 : 0,
      visibility: visible ? 'visible' : 'hidden',
      transition: 'opacity 0.3s ease, visibility 0.3s ease',
      zIndex: 200,
      pointerEvents: 'none',
    }),
    content: {
      background: COLORS.secondary,
      color: COLORS.text,
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: FONTS.tooltip,
      fontWeight: 'normal',
      letterSpacing: '0.05em',
      whiteSpace: 'nowrap',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      border: `1px solid ${COLORS.primary}`,
    },
    arrow: {
      position: 'absolute',
      top: '-4px',
      left: '50%',
      transform: 'translateX(-50%) rotate(45deg)',
      width: '8px',
      height: '8px',
      background: COLORS.secondary,
      border: `1px solid ${COLORS.primary}`,
      borderBottom: 'none',
      borderRight: 'none',
    }
  },
  submenuItem: {
    wrapper: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: '1rem',
      cursor: 'pointer',
      color: COLORS.text,
      textAlign: 'left',
      borderRadius: 'var(--radius-small, 4px)',
      willChange: 'transform, background-color',
      transition: 'all 0.2s ease',
      backgroundColor: 'transparent',
      border: 'none',
      borderLeft: `1px solid ${COLORS.primary}`,
    },
    hoverState: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      transform: 'scale(1.03)',
      boxShadow: `0 0 5px ${COLORS.primary}`,
      borderLeft: `1px solid var(--color-accent, ${COLORS.primary})`,
    },
    link: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      width: '100%',
      fontFamily: 'var(--font-heading, inherit)',
      fontWeight: 100,
      fontSize: '0.875rem',
      letterSpacing: '0.05em',
    },
    icon: {
      display: 'flex',
      alignSelf: 'center',
      justifyContent: 'center',
      color: COLORS.primary,
      marginBottom: '1rem',
      width: '170px',
      height: '128px'
    },
    label: {
      fontSize: FONTS.desktopSubmenuItem,
      letterSpacing: '0.1em',
      fontWeight: 300,
      marginBottom: '-0.5rem',
      textTransform: 'uppercase',
      transition: 'color 0.2s ease',
    },
    description: {
      fontSize: FONTS.desktopSubmenuDescription,
      color: COLORS.text,
      opacity: 0.7,
      maxWidth: '200px',
      lineHeight: 1.4,
    }
  },
  desktopNavItem: {
    wrapper: (itemStyle = {}) => ({
      position: 'relative',
      ...itemStyle
    }),
    navItem: (isItemActive, isActive) => ({
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontFamily: 'var(--font-heading, inherit)',
      fontWeight: 'normal',
      letterSpacing: '0.2em',
      fontSize: FONTS.desktopNavItem,
      color: isItemActive || isActive ? COLORS.primary : COLORS.text,
      padding: '0.5rem 0.75rem',
      border: 'none',
      background: 'transparent',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      outline: 'none',
      position: 'relative'
    }),
    content: (isItemActive, isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: isItemActive || isActive ? COLORS.primary : 'inherit'
    }),
    icon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    label: (isItemActive, isActive) => ({
      textTransform: 'uppercase',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      color: isItemActive || isActive ? `var(--color-accent, ${COLORS.primary})` : 'inherit'
    }),
    arrow: (isItemActive) => ({
      display: 'flex',
      alignItems: 'center',
      marginTop: '2px',
      color: isItemActive ? COLORS.primary : "currentColor"
    }),
  },
  globalSubmenu: {
    container: (submenuStyle = {}) => ({
      position: 'fixed',
      top: '45px',
      left: 0,
      width: '100%',
      zIndex: 9,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      pointerEvents: 'none',
      ...submenuStyle
    }),
    submenuContainer: {
      background: COLORS.secondary,
      borderRadius: '6px',
      boxShadow: SHADOWS.submenu,
      overflow: 'hidden',
      borderLeft: `3px solid ${COLORS.primary}`,
      pointerEvents: 'auto',
      willChange: 'transform, opacity',
      margin: '0 auto',
      transformOrigin: 'top center',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      width: '100%',
    },
    header: {
      display: 'flex',
      flexDirection: 'column',
      padding: '1.75rem',
    },
    title: {
      fontFamily: 'var(--font-heading, inherit)',
      color: COLORS.primary,
      fontSize: FONTS.desktopSubmenuHeader,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      marginBottom: '0.5rem',
    },
    description: {
      fontSize: FONTS.desktopSubmenuDescription,
      color: COLORS.text,
      opacity: 0.8,
      lineHeight: 1.4,
    },
  },
  mobileNavItem: {
    navItem: (isActive) => ({
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontFamily: 'var(--font-heading, inherit)',
      fontWeight: 'normal',
      fontSize: FONTS.mobileNavItem,
      color: isActive ? `var(--color-accent, ${COLORS.primary})` : `var(--color-text, ${COLORS.text})`,
      padding: '0.75rem 1rem',
      backgroundColor: 'transparent',
      border: 'none',
      width: '100%',
      textAlign: 'left',
      justifyContent: 'space-between',
      borderTop: `1px solid ${COLORS.tertiary}`,
      borderBottom: `1px solid ${COLORS.tertiary}`
    }),
    content: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    label: {
      textTransform: 'uppercase',
      letterSpacing: '0.1em'
    },
    arrow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    submenuContainer: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
      padding: '0.5rem 0 0.5rem 1.5rem',
      background: 'rgba(0, 0, 0, 0.3)',
      borderTop: `1px solid ${COLORS.tertiary}`,
      borderBottom: `1px solid ${COLORS.tertiary}`,
    },
    submenuItem: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      padding: '0.5rem 1rem',
      cursor: 'pointer',
      color: COLORS.text,
      opacity: 0.9,
      transition: 'all 0.3s ease',
      border: 'none',
      borderBottom: `1px solid ${COLORS.tertiary}`,
      backgroundColor: 'transparent',
      width: '100%',
      textAlign: 'left',
      fontSize: FONTS.mobileSubmenuItem,
    },
    submenuItemActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      color: `var(--color-accent, ${COLORS.primary})`
    },
    submenuItemLink: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '0.5rem',
    },
    submenuItemIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '16px',
      height: '16px',
      color: COLORS.primary,
      opacity: 0.8
    },
    submenuItemLabel: {
      fontSize: FONTS.mobileSubmenuItem,
      letterSpacing: '0.05em',
      margin: 0
    },
  },
  mobileMenu: {
    button: (isOpen, visible) => ({
      position: 'fixed',
      width: '45px',
      height: '47px',
      top: '10px',
      left: '10px',
      zIndex: 201,
      display: visible ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      color: isOpen ? COLORS.primary : COLORS.text,
      fontSize: '1.5rem',
      padding: '0.5rem',
      cursor: 'pointer',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(-100%)'
    }),
    container: (mobileMenuStyle = {}) => ({
      display: 'none',
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      background: COLORS.secondary,
      zIndex: 200,
      overflowY: 'hidden', 
      overflowX: 'hidden',
      boxShadow: SHADOWS.mobile,
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      flexDirection: 'column',
      transform: 'translateY(-100%)',
      opacity: 0,
      ...mobileMenuStyle
    }),
    navItems: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      padding: '0.5rem 0 0 0',
      marginTop: '0',
      overflowY: 'auto',
      height: 'calc(100vh - 130px)', 
      paddingBottom: '2rem',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      width: '100%',
      padding: '0.75rem',
      marginBottom: '0',
      position: 'sticky',
      top: 0,
      backgroundColor: COLORS.secondary,
      zIndex: 1
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '0.75rem'
    },
    titleContainer: (mobileHeader) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: mobileHeader ? '0.75rem' : 0
    }),
    logoLink: {
      display: 'flex',
      alignItems: 'center',
      color: COLORS.primary,
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    headerText: {
      color: `var(--color-text, ${COLORS.text})`,
      fontSize: '1.2rem',
      fontWeight: 'normal',
      textAlign: 'center',
      margin: 0
    },
    titleText: {
      color: COLORS.primary,
      fontSize: '1.4rem',
      fontWeight: 'bold',
      textAlign: 'center',
      margin: 0,
      letterSpacing: '0.05em'
    }
  }
};

// Consolidated transitions and easing functions
const TRANSITIONS = {
  defaultEase: [0.4, 0, 0.2, 1],
  springEase: [0.16, 1, 0.3, 1],
  sharpEase: [0.4, 0, 1, 1],
  standard: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  quick: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  veryQuick: { duration: 0.1, ease: [0.4, 0, 1, 1] },
  spring: {
    type: "spring",
    stiffness: 400,
    damping: 30,
    mass: 0.8
  }
};

// Animation variants
const ANIMATIONS = {
  navItem: {
    idle: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: TRANSITIONS.standard
    }
  },
  arrow: {
    closed: { rotate: 0, y: 0 },
    open: { 
      rotate: 180, 
      y: [0, 2, 0],
      transition: {
        y: { duration: 0.3, repeat: 0 },
        rotate: { duration: 0.3 }
      }
    }
  },
  submenu: {
    initial: { opacity: 1, y: 0, scale: 1 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { 
      opacity: 0, y: -15, scale: 0.97,
      transition: TRANSITIONS.standard
    }
  },
  submenuContent: {
    initial: { 
      opacity: 0, x: -20,
      transition: TRANSITIONS.quick
    },
    animate: { 
      opacity: 1, x: 0,
      transition: { duration: 0.3, ease: TRANSITIONS.springEase }
    },
    exit: { 
      opacity: 0, x: 20,
      transition: TRANSITIONS.quick
    },
    slideRight: {
      initial: {
        opacity: 0, x: 40,
        transition: TRANSITIONS.veryQuick
      },
      animate: {
        opacity: 1, x: 0,
        transition: { duration: 0.15, ease: TRANSITIONS.springEase }
      },
      exit: {
        opacity: 0, x: -40,
        transition: TRANSITIONS.veryQuick
      }
    },
    slideLeft: {
      initial: {
        opacity: 0, x: 40,
        transition: TRANSITIONS.veryQuick
      },
      animate: {
        opacity: 1, x: 0,
        transition: { duration: 0.15, ease: TRANSITIONS.springEase }
      },
      exit: {
        opacity: 0, x: -40,
        transition: TRANSITIONS.veryQuick
      }
    }
  },
  submenuItem: {
    initial: { 
      opacity: 0, y: -5, scale: 0.97,
      transition: TRANSITIONS.veryQuick
    },
    animate: { 
      opacity: 1, y: 0, scale: 1,
      transition: TRANSITIONS.spring
    }
  },
  mobileMenu: {
    closed: {
      opacity: 0,
      y: '-100%',
      transition: TRANSITIONS.standard
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: TRANSITIONS.springEase,
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }
};

// Default values
const DEFAULT_NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    submenu: [{ id: 'welcome', label: 'Welcome', href: '/', description: 'Back to the home page' }]
  },
  {
    id: 'about',
    label: 'About',
    href: '/about',
    submenu: [
      { id: 'company', label: 'Company', href: '/about/company', description: 'Learn more about our company' },
      { id: 'team', label: 'Team', href: '/about/team', description: 'Meet our team' }
    ]
  }
];

// Default icons
const DefaultArrowIcon = memo(() => (
  <svg width="24" height="24" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
));
DefaultArrowIcon.displayName = 'DefaultArrowIcon';

const DefaultHomeIcon = memo(() => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="M12 5.69L17 10.19V18H15V12H9V18H7V10.19L12 5.69ZM12 3L2 12H5V20H11V14H13V20H19V12H22L12 3Z" fill="currentColor" />
  </svg>
));
DefaultHomeIcon.displayName = 'DefaultHomeIcon';

const DefaultSubmenuIcon = memo(() => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="M8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2ZM8 3C10.7614 3 13 5.23858 13 8C13 10.7614 10.7614 13 8 13C5.23858 13 3 10.7614 3 8C3 5.23858 5.23858 3 8 3ZM8 6C7.44772 6 7 6.44772 7 7V11C7 11.5523 7.44772 12 8 12C8.55228 12 9 11.5523 9 11V7C9 6.44772 8.55228 6 8 6ZM8 4C7.44772 4 7 4.44772 7 5C7 5.55228 7.44772 6 8 6C8.55228 6 9 5.55228 9 5C9 4.44772 8.55228 4 8 4Z" fill="currentColor" />
  </svg>
));
DefaultSubmenuIcon.displayName = 'DefaultSubmenuIcon';

const DEFAULT_ICON_MAPPING: Record<string, React.ComponentType> = {
  'arrow': DefaultArrowIcon,
  'home': DefaultHomeIcon,
  'submenu': DefaultSubmenuIcon
};

// Context for navigation state
const NavContext = React.createContext<NavContextType>({
  activeItemId: null,
  setActiveItemId: () => {},
  visible: true,
  focusedItemId: null,
  setFocusedItemId: () => {}
});

// Helper function for resolving icons
const getIconComponent = (icon: React.ReactNode | string | undefined, iconMapping: Record<string, React.ComponentType>): React.ReactNode => {
  if (!icon) return null;
  
  if (typeof icon === 'string') {
    const IconComponent = iconMapping[icon];
    return IconComponent ? <IconComponent /> : null;
  }
  
  return icon;
};

// Components
const LogoTooltip = memo(({ visible }: { visible: boolean }) => {
  return (
    <div style={STYLES.tooltip.container(visible)} role="tooltip" id="logo-tooltip">
      <div style={STYLES.tooltip.arrow} aria-hidden="true" />
      <div style={STYLES.tooltip.content}>Home Page</div>
    </div>
  );
});
LogoTooltip.displayName = 'LogoTooltip';

const MemoizedSubmenuItem = memo(({
  subItem,
  onClick,
  parentId,
  showDescription = false,
  iconMapping,
}: {
  subItem: SubmenuItem;
  onClick: () => void;
  parentId: string;
  showDescription?: boolean;
  iconMapping: Record<string, React.ComponentType>;
}) => {
  const submenuItemId = `${parentId}-submenu-item-${subItem.id}`;
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      key={subItem.id}
      style={{
        ...STYLES.submenuItem.wrapper,
        ...(isHovered ? STYLES.submenuItem.hoverState : {})
      }}
      variants={ANIMATIONS.submenuItem}
      layoutId={`submenu-item-${subItem.id}`}
      onClick={onClick}
      role="menuitem"
      id={submenuItemId}
      tabIndex={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={subItem.description ? `${subItem.label}: ${subItem.description}` : subItem.label}
    >
      <div style={STYLES.submenuItem.link}>
        <div style={STYLES.submenuItem.icon}>
          {getIconComponent(subItem.icon, iconMapping) || getIconComponent('submenu', iconMapping)}
        </div>
        <span style={STYLES.submenuItem.label}>{subItem.label}</span>
        {showDescription && subItem.description && (
          <div style={STYLES.submenuItem.description}>{subItem.description}</div>
        )}
      </div>
    </motion.div>
  );
});
MemoizedSubmenuItem.displayName = 'MemoizedSubmenuItem';

const DesktopNavItemComponent = memo(({ 
  item, 
  isActive,
  onMouseEnter,
  onMouseLeave,
  itemIndex,
  iconMapping,
  submenuBehavior,
  itemStyle = {}
}: { 
  item: NavItem; 
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  itemIndex: number;
  iconMapping: Record<string, React.ComponentType>;
  submenuBehavior: 'hover' | 'click';
  itemStyle?: React.CSSProperties;
}) => {
  const { activeItemId, setActiveItemId } = useContext(NavContext);
  const isItemActive = activeItemId === item.id;
  const controls = useAnimation();
  const navItemId = `nav-item-${item.id}`;
  const submenuId = `submenu-${item.id}`;

  useEffect(() => {
    controls.start({
      color: isItemActive || isActive ? `var(--color-accent, ${COLORS.primary})` : `var(--color-text, ${COLORS.tertiary})`,
      scale: isItemActive ? 1.05 : 1,
      transition: { duration: 0.3 }
    });
  }, [controls, isItemActive, isActive]);

  const handleClick = useCallback(() => {
    if (submenuBehavior === 'click') {
      setActiveItemId(isItemActive ? null : item.id);
    }
  }, [isItemActive, setActiveItemId, item.id, submenuBehavior]);
  
  const handleMouseEnter = useCallback(() => {
    if (submenuBehavior === 'hover') {
      setActiveItemId(item.id);
    }
    onMouseEnter();
  }, [onMouseEnter, setActiveItemId, item.id, submenuBehavior]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleClick();
        break;
      case 'Escape':
        e.preventDefault();
        setActiveItemId(null);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isItemActive) {
          setActiveItemId(item.id);
        }
        setTimeout(() => {
          const firstSubmenuItem = document.getElementById(`${item.id}-submenu-item-${item.submenu[0].id}`);
          if (firstSubmenuItem) {
            firstSubmenuItem.focus();
          }
        }, 100);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        const prevNavItem = document.getElementById(`nav-item-${itemIndex > 0 ? itemIndex - 1 : item.submenu.length - 1}`);
        if (prevNavItem) {
          prevNavItem.focus();
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        const nextNavItem = document.getElementById(`nav-item-${(itemIndex + 1) % item.submenu.length}`);
        if (nextNavItem) {
          nextNavItem.focus();
        }
        break;
    }
  }, [handleClick, isItemActive, item.id, item.submenu, setActiveItemId, itemIndex]);

  return (
    <div 
      style={STYLES.desktopNavItem.wrapper(itemStyle)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave}
      data-nav-item={item.id}
      role="presentation"
    >
      <motion.button
        id={navItemId}
        style={STYLES.desktopNavItem.navItem(isItemActive, isActive)}
        variants={ANIMATIONS.navItem}
        initial="idle"
        animate={controls}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="menuitem"
        aria-haspopup="true"
        aria-expanded={isItemActive}
        aria-controls={submenuId}
        aria-label={`${item.label} navigation section${item.submenu.length > 0 ? ' with submenu' : ''}`}
        aria-current={isActive ? 'page' : undefined}
        tabIndex={0}
      >
        <div style={STYLES.desktopNavItem.content(isItemActive, isActive)}>
          <div style={STYLES.desktopNavItem.icon}>
            {getIconComponent(item.icon, iconMapping)}
          </div>
          <span style={STYLES.desktopNavItem.label(isItemActive, isActive)}>
            {item.label}
          </span>
        </div>
        
        <motion.div
          style={STYLES.desktopNavItem.arrow(isItemActive)}
          variants={ANIMATIONS.arrow}
          initial="closed"
          animate={isItemActive ? "open" : "closed"}
        >
          {getIconComponent('arrow', iconMapping)}
          <span style={STYLES.common.screenReaderOnly}>
            {isItemActive ? 'Collapse' : 'Expand'} {item.label} menu
          </span>
        </motion.div>
      </motion.button>
    </div>
  );
});
DesktopNavItemComponent.displayName = 'DesktopNavItemComponent';

const GlobalSubmenuComponent = memo(({
  items,
  activeItemId,
  onMouseEnter,
  onMouseLeave,
  showItemDescriptions,
  submenuStyle = {},
  submenuBehavior,
  iconMapping,
}: {
  items: NavItem[];
  activeItemId: string | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  showItemDescriptions: boolean;
  submenuStyle?: React.CSSProperties;
  submenuBehavior: 'hover' | 'click';
  iconMapping: Record<string, React.ComponentType>;
}) => {
  const router = useRouter();
  const { setActiveItemId } = useContext(NavContext);
  const activeItem = items.find(item => item.id === activeItemId) || null;
  const [prevItemId, setPrevItemId] = useState<string | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [isFinalExit, setIsFinalExit] = useState(false);
  const submenuRef = useRef<HTMLDivElement>(null);
  const submenuId = activeItem ? `submenu-${activeItem.id}` : '';
  
  useEffect(() => {
    if (activeItemId) {
      setIsFinalExit(false);
    }
  }, [activeItemId]);
  
  useEffect(() => {
    if (activeItemId && prevItemId && activeItemId !== prevItemId) {
      const itemIds = items.map(item => item.id);
      const prevIndex = itemIds.indexOf(prevItemId);
      const currentIndex = itemIds.indexOf(activeItemId);
      
      setSlideDirection(currentIndex > prevIndex ? 'right' : 'left');
      setIsFinalExit(false);
    } else if (activeItemId === null && prevItemId !== null) {
      setIsFinalExit(true);
    }
    
    if (activeItemId !== prevItemId) {
      setPrevItemId(activeItemId);
    }
  }, [activeItemId, prevItemId, items]);
  
  useEffect(() => {
    if (!activeItemId || !submenuRef.current) return;
    
    const forceExit = () => setIsFinalExit(true);
    let lastY = 0;
    let isDebouncing = false;
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!activeItemId || !submenuRef.current || isDebouncing) return;
      isDebouncing = true;
      setTimeout(() => { isDebouncing = false; }, 10);
      
      const currentX = e.clientX;
      const currentY = e.clientY;
      
      const submenuEl = submenuRef.current;
      const navbarEl = document.querySelector('[role="navigation"]');
      
      if (!submenuEl || !navbarEl) return;
      
      const submenuRect = submenuEl.getBoundingClientRect();
      const navbarRect = navbarEl.getBoundingClientRect();
      
      const isOverSubmenu = (
        currentX >= submenuRect.left - 10 &&
        currentX <= submenuRect.right + 10 &&
        currentY >= submenuRect.top - 10 &&
        currentY <= submenuRect.bottom + 10
      );
      
      const isOverNavbar = (
        currentX >= navbarRect.left &&
        currentX <= navbarRect.right &&
        currentY >= navbarRect.top &&
        currentY <= navbarRect.bottom
      );
      
      let isOverNavItem = false;
      let hoveredNavItemId: string | null = null;
      
      document.querySelectorAll('[data-nav-item]').forEach((item) => {
        const navRect = (item as HTMLElement).getBoundingClientRect();
        if (
          currentX >= navRect.left && 
          currentX <= navRect.right && 
          currentY >= navRect.top && 
          currentY <= navRect.bottom
        ) {
          isOverNavItem = true;
          hoveredNavItemId = (item as HTMLElement).getAttribute('data-nav-item');
        }
      });
      
      if (isOverNavItem && hoveredNavItemId !== activeItemId) {
        setIsFinalExit(false);
        return;
      }
      
      const isBottomExit = currentY > (submenuRect.bottom + 20) && lastY <= (submenuRect.bottom + 20);
      
      if (isBottomExit) {
        forceExit();
        return;
      }
      
      if (!isOverSubmenu && !isOverNavbar && !isOverNavItem) {
        setTimeout(() => { setIsFinalExit(true); }, 50);
      } else {
        setIsFinalExit(false);
      }
      
      lastY = currentY;
    };
    
    const handleMouseLeaveWindow = () => {
      if (activeItemId) forceExit();
    };
    
    if (submenuBehavior === 'hover') {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.documentElement.addEventListener('mouseleave', handleMouseLeaveWindow);
    }
    
    return () => {
      if (submenuBehavior === 'hover') {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.documentElement.removeEventListener('mouseleave', handleMouseLeaveWindow);
      }
    };
  }, [activeItemId, submenuBehavior]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!activeItemId) return;
    
    const focusableElements = submenuRef.current?.querySelectorAll('[role="menuitem"]');
    if (!focusableElements || focusableElements.length === 0) return;
    
    const focusedElement = document.activeElement as HTMLElement;
    const focusedIndex = Array.from(focusableElements).indexOf(focusedElement as Element);
    
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setActiveItemId(null);
        const parentNavItem = document.getElementById(`nav-item-${activeItemId}`);
        if (parentNavItem) parentNavItem.focus();
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < focusableElements.length - 1) {
          (focusableElements[focusedIndex + 1] as HTMLElement).focus();
        } else {
          (focusableElements[0] as HTMLElement).focus();
        }
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        if (focusedIndex > 0) {
          (focusableElements[focusedIndex - 1] as HTMLElement).focus();
        } else {
          (focusableElements[focusableElements.length - 1] as HTMLElement).focus();
        }
        break;
      case 'Home':
        e.preventDefault();
        (focusableElements[0] as HTMLElement).focus();
        break;
      case 'End':
        e.preventDefault();
        (focusableElements[focusableElements.length - 1] as HTMLElement).focus();
        break;
    }
  }, [activeItemId, setActiveItemId]);
  
  useEffect(() => {
    if (activeItemId) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeItemId, handleKeyDown]);
  
  const handleMouseLeave = useCallback(() => {
    if (submenuBehavior === 'hover') {
      setIsFinalExit(true);
    }
    onMouseLeave();
  }, [onMouseLeave, submenuBehavior]);
  
  const getAnimationVariant = useCallback(() => {
    if (isFinalExit) {
      return ANIMATIONS.submenu;
    } 
    return slideDirection === 'right' 
      ? ANIMATIONS.submenuContent.slideRight 
      : ANIMATIONS.submenuContent.slideLeft;
  }, [isFinalExit, slideDirection]);
  
  const getExitAnimationVariant = useCallback(() => {
    return isFinalExit ? "exit" : (slideDirection === 'right' ? "exit" : "exit");
  }, [isFinalExit, slideDirection]);

  const handleSubmenuItemClick = useCallback((href: string) => {
    setActiveItemId(null);
    router.push(href);
  }, [setActiveItemId, router]);
  
  return (
    <div 
      style={STYLES.globalSubmenu.container(submenuStyle)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={submenuRef}
      role="presentation"
    >
      <AnimatePresence mode="wait">
        {activeItemId && (
          <motion.div
            style={{
              ...STYLES.globalSubmenu.submenuContainer,
              width: `min(90%, ${200 + (activeItem ? activeItem.submenu.length * 220 : 0)}px)`,
              maxWidth: '1200px'
            }}
            custom={isFinalExit}
            variants={ANIMATIONS.submenu}
            initial="initial"
            animate="animate"
            exit={isFinalExit ? "exit" : undefined}
            key={`global-submenu-${activeItemId || 'none'}`}
            layoutId="global-submenu"
            role="menu"
            id={submenuId}
            aria-labelledby={`nav-item-${activeItemId}`}
            data-exiting={isFinalExit ? "true" : "false"}
          >
            <div style={STYLES.globalSubmenu.grid} role="presentation">
              {activeItem && (
                <motion.div
                  style={STYLES.globalSubmenu.grid}
                  variants={getAnimationVariant()}
                  initial="initial"
                  animate="animate"
                  exit={getExitAnimationVariant()}
                  key={`submenu-content-${activeItem.id}`}
                  layoutId={`submenu-content-${activeItem.id}`}
                  role="presentation"
                >
                  <div style={STYLES.globalSubmenu.header} role="presentation">
                    <div style={STYLES.globalSubmenu.title} id={`submenu-header-${activeItem.id}`}>
                      {activeItem.label}
                    </div>
                    {activeItem.submenu[0]?.description && (
                      <div style={STYLES.globalSubmenu.description} id={`submenu-description-${activeItem.id}`}>
                        {activeItem.submenu[0].description}
                      </div>
                    )}
                  </div>
                  
                  {activeItem.submenu.map((subItem) => (
                    <MemoizedSubmenuItem
                      key={subItem.id}
                      subItem={subItem}
                      onClick={() => handleSubmenuItemClick(subItem.href)}
                      parentId={activeItem.id}
                      showDescription={showItemDescriptions}
                      iconMapping={iconMapping}
                    />
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
GlobalSubmenuComponent.displayName = 'GlobalSubmenuComponent';

const MobileNavItemComponent = memo(({ 
  item, 
  isActive,
  iconMapping,
  toggleMenu,
}: { 
  item: NavItem;
  isActive: boolean;
  iconMapping: Record<string, React.ComponentType>;
  toggleMenu: () => void;
}) => {
  const router = useRouter();
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const mobileNavItemId = `mobile-nav-item-${item.id}`;
  const mobileSubmenuId = `mobile-submenu-${item.id}`;

  const toggleSubmenu = useCallback(() => {
    setIsSubmenuOpen(prev => !prev);
  }, []);

  const handleNavigation = useCallback((href: string) => {
    router.push(href);
    toggleMenu();
  }, [router, toggleMenu]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const menuItems = document.querySelectorAll('[id^="mobile-nav-item-"]');
    const menuItemsArray = Array.from(menuItems) as HTMLElement[];
    const currentIndex = menuItemsArray.findIndex(el => el.id === mobileNavItemId);
    
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        toggleSubmenu();
        break;
      case 'Escape':
        e.preventDefault();
        if (isSubmenuOpen) {
          setIsSubmenuOpen(false);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (isSubmenuOpen) {
          const firstSubmenuItem = document.getElementById(`mobile-submenu-item-${item.id}-${item.submenu[0].id}`);
          if (firstSubmenuItem) {
            firstSubmenuItem.focus();
          }
        } else {
          if (currentIndex < menuItemsArray.length - 1) {
            menuItemsArray[currentIndex + 1].focus();
          } else {
            setIsSubmenuOpen(true);
            setTimeout(() => {
              const firstSubmenuItem = document.getElementById(`mobile-submenu-item-${item.id}-${item.submenu[0].id}`);
              if (firstSubmenuItem) {
                firstSubmenuItem.focus();
              }
            }, 50);
          }
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex <= 0) {
          const hamburgerButton = document.querySelector('[aria-controls="mobile-menu"]') as HTMLElement;
          if (hamburgerButton) {
            hamburgerButton.focus();
          }
        } else {
          menuItemsArray[currentIndex - 1].focus();
        }
        break;
    }
  }, [isSubmenuOpen, toggleSubmenu, mobileNavItemId, item.id, item.submenu]);

  const handleSubmenuKeyDown = useCallback((e: React.KeyboardEvent, subItemId: string, href: string) => {
    const currentItemIndex = item.submenu.findIndex(si => si.id === subItemId);
    
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleNavigation(href);
        break;
      case 'Escape':
        e.preventDefault();
        setIsSubmenuOpen(false);
        const parentMenuItem = document.getElementById(mobileNavItemId);
        if (parentMenuItem) {
          parentMenuItem.focus();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (currentItemIndex <= 0) {
          const parentMenuItem = document.getElementById(mobileNavItemId);
          if (parentMenuItem) {
            parentMenuItem.focus();
          }
        } else {
          const prevItem = document.getElementById(`mobile-submenu-item-${item.id}-${item.submenu[currentItemIndex - 1].id}`);
          if (prevItem) {
            prevItem.focus();
          }
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (currentItemIndex < item.submenu.length - 1) {
          const nextItem = document.getElementById(`mobile-submenu-item-${item.id}-${item.submenu[currentItemIndex + 1].id}`);
          if (nextItem) {
            nextItem.focus();
          }
        } else {
          const allMainItems = document.querySelectorAll('[id^="mobile-nav-item-"]');
          const mainItemsArray = Array.from(allMainItems) as HTMLElement[];
          const currentMainIndex = mainItemsArray.findIndex(el => el.id === mobileNavItemId);
          
          if (currentMainIndex < mainItemsArray.length - 1) {
            mainItemsArray[currentMainIndex + 1].focus();
          }
        }
        break;
    }
  }, [mobileNavItemId, handleNavigation, item.id, item.submenu]);

  return (
    <motion.div variants={ANIMATIONS.submenuItem} role="presentation">
      <button
        id={mobileNavItemId}
        style={STYLES.mobileNavItem.navItem(isActive)}
        onClick={toggleSubmenu}
        role="menuitem"
        aria-haspopup="true"
        aria-expanded={isSubmenuOpen}
        aria-controls={mobileSubmenuId}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <div style={STYLES.mobileNavItem.content}>
          <span style={STYLES.mobileNavItem.label}>{item.label}</span>
        </div>
        
        <motion.div
          style={STYLES.mobileNavItem.arrow}
          variants={ANIMATIONS.arrow}
          initial="closed"
          animate={isSubmenuOpen ? "open" : "closed"}
        >
          {getIconComponent('arrow', iconMapping)}
          <span style={STYLES.common.screenReaderOnly}>
            {isSubmenuOpen ? 'Collapse' : 'Expand'} {item.label} menu
          </span>
        </motion.div>
      </button>

      <AnimatePresence>
        {isSubmenuOpen && (
          <motion.div
            id={mobileSubmenuId}
            style={STYLES.mobileNavItem.submenuContainer}
            variants={ANIMATIONS.submenu}
            initial="initial"
            animate="animate"
            exit="exit"
            role="menu"
            aria-labelledby={mobileNavItemId}
          >
            {item.submenu.map((subItem) => (
              <button
                key={subItem.id}
                id={`mobile-submenu-item-${item.id}-${subItem.id}`}
                style={{
                  ...STYLES.mobileNavItem.submenuItem,
                  ...(isActive && subItem.href === window.location.pathname ? STYLES.mobileNavItem.submenuItemActive : {})
                }}
                onClick={() => handleNavigation(subItem.href)}
                role="menuitem"
                tabIndex={0}
                onKeyDown={(e: React.KeyboardEvent) => handleSubmenuKeyDown(e, subItem.id, subItem.href)}
                aria-label={subItem.description ? `${subItem.label}: ${subItem.description}` : subItem.label}
              >
                <div style={STYLES.mobileNavItem.submenuItemLink}>
                  <span style={STYLES.mobileNavItem.submenuItemLabel}>{subItem.label}</span>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
MobileNavItemComponent.displayName = 'MobileNavItemComponent';

const MobileMenuComponent = memo(({
  isOpen,
  toggleMenu,
  items,
  isActiveRoute,
  mobileMenuStyle = {},
  iconMapping,
  isMobileView,
  logo,
  homeHref,
  mobileHeader,
  mobileTitle,
}: {
  isOpen: boolean;
  toggleMenu: () => void;
  items: NavItem[];
  isActiveRoute: (href: string) => boolean;
  mobileMenuStyle?: React.CSSProperties;
  iconMapping: Record<string, React.ComponentType>;
  isMobileView: boolean;
  logo?: React.ReactNode;
  homeHref?: string;
  mobileHeader?: React.ReactNode;
  mobileTitle?: string;
  mobileMenuIcon?: React.ReactNode;
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        toggleMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, toggleMenu]);
  
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            style={{
              ...STYLES.mobileMenu.container(mobileMenuStyle),
              display: isMobileView ? 'flex' : 'none'
            }}
            variants={ANIMATIONS.mobileMenu}
            initial="closed"
            animate="open"
            exit="closed"
            role="navigation"
            aria-label="Mobile Navigation"
          >
            <div style={STYLES.mobileMenu.header}>
              {logo && (
                <div style={STYLES.mobileMenu.logoContainer}>
                  <Link href={homeHref || '/'} passHref>
                    <div 
                      style={STYLES.mobileMenu.logoLink} 
                      tabIndex={0}
                      aria-label="Home"
                      onClick={toggleMenu}
                    >
                      {logo}
                    </div>
                  </Link>
                </div>
              )}
              
              <div style={STYLES.mobileMenu.titleContainer(mobileHeader)}>
                <div style={STYLES.mobileMenu.titleText}>{mobileTitle || 'Crescent'}</div>
              </div>
              
              {mobileHeader && (
                <div style={STYLES.mobileMenu.headerText}>{mobileHeader}</div>
              )}
            </div>
            
            <div 
              style={{
                ...STYLES.mobileMenu.navItems,
                paddingTop: '0.5rem',
              }}
              role="menubar" 
              aria-label="Main Navigation"
              className="mobile-menu-scrollable"
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
MobileMenuComponent.displayName = 'MobileMenuComponent';

const NavigationBar: React.FC<NavigationBarProps> = ({
  // Content customization
  items = DEFAULT_NAV_ITEMS,
  logo = null,
  homeHref = '/',
  ariaLabel = "Main Navigation",
  showItemDescriptions = false,
  mobileHeader = null,
  
  // Dimensions
  height = '45px',
  width = '100%',
  maxWidth = 'auto',
  horizontalPadding = '1.5rem',
  verticalPadding = '0',
  zIndex = 100,
  itemGap = '1rem',
  
  // Behavior
  submenuBehavior = 'hover',
  submenuCloseDelay = 200,
  hideOnScroll = true,
  scrollThreshold = 2,
  
  // Visual customization
  backdropFilter = 'blur(12px)',
  borderStyle = `1px solid ${COLORS.secondary}`,
  boxShadow = SHADOWS.standard,
  
  // Responsive behavior
  mobileBreakpoint = 768,
  
  // Mobile options
  mobileTitle = 'Crescent',
  mobileMenuIcon,
  
  // Icons
  iconMapping = {},
}) => {
  // Combine default icons with custom ones
  const mergedIconMapping = { ...DEFAULT_ICON_MAPPING, ...iconMapping };
  const pathname = usePathname();
  
  // Use custom hooks for managing submenu state and responsive navigation
  const {
    activeItemId,
    setActiveItemId,
    focusedItemId,
    setFocusedItemId,
    handleNavItemMouseEnter,
    handleNavItemMouseLeave,
    cancelSubmenuClosing,
  } = useSubmenuManager(submenuBehavior, submenuCloseDelay);
  
  const {
    isClient,
    isMobileView,
    isMobileMenuOpen,
    visible,
    toggleMobileMenu,
  } = useResponsiveNavigation(mobileBreakpoint, hideOnScroll, scrollThreshold);
  
  // Logo hover effect style
  const logoHoverStyle = `
    .nav-logo-link {
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${COLORS.primary};
      cursor: pointer;
      position: relative;
      padding: 8px;
      border-radius: 50%;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .nav-logo-link:hover, .nav-logo-link:focus {
      background: ${COLORS.glow};
      box-shadow: 0 0 18px 8px ${COLORS.glow};
      transform: scale(1.1);
    }
    .nav-logo-link:active {
      background: transparent;
      box-shadow: none;
      transform: scale(1);
      transition: all 0.1s ease;
    }
    .nav-logo-link:hover .nav-logo-tooltip,
    .nav-logo-link:focus .nav-logo-tooltip {
      opacity: 1;
      visibility: visible;
    }
    .nav-logo-link:active .nav-logo-tooltip {
      opacity: 0;
      visibility: hidden;
    }
    .nav-logo-tooltip {
      position: absolute;
      bottom: -30px;
      left: 50%;
      transform: translateX(-50%);
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s ease, visibility 0.2s ease;
      transition-delay: 0.2s;
      z-index: 200;
      pointer-events: none;
      background: ${COLORS.secondary};
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      color: ${COLORS.text};
      padding: 6px 12px;
      border-radius: 6px;
      font-size: ${FONTS.tooltip};
      font-weight: normal;
      letter-spacing: 0.05em;
      white-space: nowrap;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
      border: none;
    }
  `;
  
  // Inject CSS for logo hover effect
  useEffect(() => {
    if (!isClient) return;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = logoHoverStyle;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, [isClient, logoHoverStyle]);

  // Handle outside clicks for submenus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!activeItemId || submenuBehavior !== 'click') return;
      
      const target = event.target as HTMLElement;
      const submenuContainer = document.getElementById(`submenu-${activeItemId}`);
      const isInsideSubmenu = submenuContainer?.contains(target);
      const navItemAttr = target.closest('[data-nav-item]')?.getAttribute('data-nav-item');
      const isNavItemClick = navItemAttr !== undefined;
      
      if (!isInsideSubmenu && (!isNavItemClick || navItemAttr !== activeItemId)) {
        setActiveItemId(null);
      }
    };
    
    if (submenuBehavior === 'click') {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      if (submenuBehavior === 'click') {
        document.removeEventListener('mousedown', handleClickOutside);
      }
    };
  }, [activeItemId, submenuBehavior, setActiveItemId]);
  
  // Check active route
  const isActiveRoute = useCallback((href: string) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  }, [pathname]);

  if (!isClient) return null;

  return (
    <NavContext.Provider value={{ 
      activeItemId, 
      setActiveItemId, 
      visible,
      focusedItemId,
      setFocusedItemId
    }}>
      {/* Desktop Navigation Bar */}
      {!isMobileView && (
        <nav 
          style={STYLES.navBar.container(visible, height, width, zIndex, backdropFilter, boxShadow, borderStyle)}
          role="navigation" 
          aria-label={ariaLabel}
        >
          <div style={STYLES.navBar.content(maxWidth, horizontalPadding, verticalPadding)}>
            {/* Logo */}
            {logo && (
              <div style={STYLES.logo.container}>
                <Link href={homeHref} passHref>
                  <div 
                    className="nav-logo-link"
                    tabIndex={0} 
                    aria-label="Navigate to Home Page"
                    role="link"
                    onClick={() => {
                      setTimeout(() => {
                        if (document.activeElement instanceof HTMLElement) {
                          document.activeElement.blur();
                        }
                      }, 100);
                    }}
                  >
                    {logo}
                    <div className="nav-logo-tooltip" role="tooltip">Home Page</div>
                  </div>
                </Link>
              </div>
            )}

            {/* Desktop Navigation */}
            <div style={STYLES.navBar.itemsContainer(itemGap)} role="menubar" aria-label="Main Menu">
              {items.map((item, index) => (
                <DesktopNavItemComponent
                  key={item.id}
                  item={item}
                  isActive={isActiveRoute(item.href)}
                  onMouseEnter={() => handleNavItemMouseEnter(item.id)}
                  onMouseLeave={handleNavItemMouseLeave}
                  itemIndex={index}
                  iconMapping={mergedIconMapping}
                  submenuBehavior={submenuBehavior}
                />
              ))}
            </div>
          </div>
        </nav>
      )}
      
      {/* Submenu - desktop only */}
      {!isMobileView && (
        <GlobalSubmenuComponent 
          items={items} 
          activeItemId={activeItemId} 
          onMouseEnter={cancelSubmenuClosing}
          onMouseLeave={handleNavItemMouseLeave}
          showItemDescriptions={showItemDescriptions}
          submenuBehavior={submenuBehavior}
          iconMapping={mergedIconMapping}
        />
      )}
      
      {/* Mobile Menu Button */}
      {isMobileView && (
        <button 
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={`${isMobileMenuOpen ? 'Close' : 'Open'} navigation menu`}
          style={STYLES.mobileMenu.button(isMobileMenuOpen, visible)}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'ArrowDown' && isMobileMenuOpen) {
              e.preventDefault();
              const firstMenuItem = document.getElementById(`mobile-nav-item-${items[0].id}`);
              if (firstMenuItem) {
                firstMenuItem.focus();
              }
            }
          }}
        >
          {isMobileMenuOpen ? '✕' : mobileMenuIcon || '☰'}
        </button>
      )}
      
      {/* Mobile Menu */}
      <MobileMenuComponent 
        isOpen={isMobileMenuOpen}
        toggleMenu={toggleMobileMenu}
        items={items}
        isActiveRoute={isActiveRoute}
        iconMapping={mergedIconMapping}
        isMobileView={isMobileView}
        logo={logo}
        homeHref={homeHref}
        mobileHeader={mobileHeader}
        mobileTitle={mobileTitle}
        mobileMenuIcon={mobileMenuIcon}
      />
    </NavContext.Provider>
  );
};

export default memo(NavigationBar);