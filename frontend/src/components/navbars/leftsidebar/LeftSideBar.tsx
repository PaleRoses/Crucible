"use client";

import React, { useCallback, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { css } from '../../../../styled-system/css';
import { cosmicSidebarToggle } from '../../../../styled-system/recipes';

// Import from index file
import { 
  LeftSidebarProps,
  useMobileKeyboardNavigation,
  useSidebarResponsive,
  useSidebarPersistence,
  NavigationItem,
  useSidebarNavigation,
  useContentPushing,
  useDesktopKeyboardNavigation,
  useMobileInteractions,
  useSidebarToggle
} from './hooks/index';

// Import the layout components
import DesktopSidebarLayout from './components/DesktopSidebarLayout';
import MobileSidebarLayout from './components/MobileSidebarLayout';

/**
 * LeftSidebar Component
 * 
 * A responsive and customizable sidebar component with mobile and desktop modes.
 */
const LeftSidebar: React.FC<LeftSidebarProps> = ({
  // Default prop values
  variant = 'standard',
  size = 'md',
  title = 'Application',
  logo = null,
  navigationItems = [],
  sidebarItems = [],
  footerContent = null,
  initiallyExpanded = true,
  onToggle = null,
  pushContent = true,
  contentSelector = '#mainContent',
  expandedWidth = '240px',
  collapsedWidth = '60px',
  transitionDuration = 300,
  headerTopOffset = '50px',
  compact = true,
  onToggleExternal = null,
  externalToggleRef = null,
  className = '',
}) => {
  // ========================================
  // Router Hooks
  // ========================================
  const router = useRouter();
  const pathname = usePathname();

  // ========================================
  // Custom Hooks
  // ========================================
  
  // Responsive behavior and hydration
  const {
    isHydrated,
    isMobile,
    isExpanded,
    isDrawerOpen,
    setIsExpanded,
    setIsDrawerOpen,
    isDrawerOpenRef,
    onToggleExternalRef
  } = useSidebarResponsive(initiallyExpanded, onToggleExternal);

  // Handle localStorage persistence
  useSidebarPersistence(
    isHydrated, 
    isExpanded, 
    setIsExpanded,
    isDrawerOpen,
    setIsDrawerOpen
  );

  // Navigation handling callback
  const handleNavigation = useCallback((item: NavigationItem) => {
    if (item.href) {
      router.push(item.href);
    }
    
    // Always close the drawer on mobile navigation
    if (isMobile) {
      setIsDrawerOpen(false);
      if (onToggleExternalRef.current) {
        onToggleExternalRef.current(false);
      }
    }
  }, [router, isMobile, setIsDrawerOpen, onToggleExternalRef]);

  // Process navigation items and manage expanded state
  const {
    processedNavItems,
    expandedItems,
    toggleItemExpansion
  } = useSidebarNavigation(
    navigationItems,
    sidebarItems,
    pathname,
    handleNavigation
  );

  // Toggle sidebar functionality
  const { toggleSidebar, closeDrawer } = useSidebarToggle({
    isMobile,
    isExpanded,
    setIsExpanded,
    isDrawerOpen,
    setIsDrawerOpen,
    onToggleExternalRef,
    onToggle,
    externalToggleRef
  });
  
  // Mobile toggle button component
  // MobileToggleButton fixed implementation
const MobileToggleButton = useCallback(() => {
  return (
    <button
      data-sidebar-external-toggle="true"
      className={cosmicSidebarToggle({
        variant: variant === 'cosmic' ? 'cosmic' : 'standard',
        size: compact ? 'sm' : 'md',
        border: 'none',
        isMobile: true
      })}
      data-expanded={isDrawerOpen}
      onClick={(e) => {
        e.preventDefault(); // Use preventDefault instead of stopPropagation
        e.stopPropagation();
        
        // Always use toggleSidebar to ensure consistent behavior after reload
        toggleSidebar();
        
        // Remove the conditional logic that was causing the issue:
        // if (isDrawerOpen) {
        //   closeDrawer();
        // } else {
        //   toggleSidebar();
        // }
      }}
      aria-label={isDrawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={isDrawerOpen}
      aria-controls="mobile-dropdown-menu"
      style={{
        cursor: 'pointer',
        zIndex: 110,
        border: 'none',
        background: 'transparent'
      }}
    >
      <span></span><span></span><span></span>
    </button>
  );
}, [isDrawerOpen, compact, variant, toggleSidebar]);
  
  // Update external toggle ref with our component
  useEffect(() => {
    if (externalToggleRef && typeof externalToggleRef === 'object' && externalToggleRef.current !== undefined) {
      externalToggleRef.current.ToggleButton = MobileToggleButton;
    }
    
    return () => {
      if (externalToggleRef && 
          typeof externalToggleRef === 'object' && 
          externalToggleRef.current !== undefined) {
        externalToggleRef.current.ToggleButton = undefined;
      }
    };
  }, [MobileToggleButton, externalToggleRef]);

  // Refs
  const contentRef = useContentPushing(
    pushContent,
    isHydrated,
    isMobile,
    isExpanded,
    contentSelector,
    expandedWidth,
    collapsedWidth,
    transitionDuration
  );
  
  // Desktop sidebar reference for keyboard navigation
  const desktopSidebarRef = useRef<HTMLElement>(null);
  
  // Desktop keyboard navigation
  useDesktopKeyboardNavigation(
    isExpanded,
    desktopSidebarRef,
    expandedItems,
    toggleItemExpansion
  );

  // Click outside detection, swipe gesture, and focus trap for mobile
  const { containerRef: mobileMenuRef, overlayRef } = useMobileInteractions(
    isDrawerOpen,
    toggleSidebar,
    isMobile
  );
  
  // Add mobile keyboard navigation separately
  useMobileKeyboardNavigation(
    mobileMenuRef,
    isDrawerOpen,
    toggleSidebar,
    expandedItems,
    toggleItemExpansion
  );

  // ========================================
  // Style Definitions
  // ========================================
  
  // --- Mobile Styles ---
  
  const mobileStyles = {
    // Dropdown container
    dropdown: css({
      position: 'fixed',
      top: headerTopOffset,
      left: 0,
      width: '100%',
      height: `calc(100vh - ${headerTopOffset})`,
      maxHeight: `calc(100vh - ${headerTopOffset})`,
      bgColor: 'background',
      zIndex: 101,
      // Change overflowY from 'auto' to 'hidden'
      overflowY: 'hidden', // 
      display: 'flex',
      flexDirection: 'column',
      boxShadow: 'lg',
      borderRight: 'none',
      borderColor: 'border',
      transform: 'translateX(-100%)',
      opacity: 0.95,
      visibility: 'hidden',
      transition: `transform ${transitionDuration}ms ease, opacity ${transitionDuration}ms ease, visibility ${transitionDuration}ms ease`,
      '&[data-open="true"]': {
        transform: 'translateX(0)',
        opacity: 1,
        visibility: 'visible',
      },
      // Remove scrollbar-specific styling as it's no longer needed
      // scrollbarWidth: 'thin',                          // <-- REMOVED
      // '&::-webkit-scrollbar': { width: '6px' },        // <-- REMOVED
      // '&::-webkit-scrollbar-thumb': { ... }            // <-- REMOVED
    }),

    // Overlay background
    overlay: css({
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      transition: `opacity ${transitionDuration}ms ease, visibility ${transitionDuration}ms ease`,
      visibility: 'hidden',
      opacity: 0,
      top: headerTopOffset,
      '&[data-open="true"]': {
        visibility: 'visible',
        opacity: 1,
      }
    }),
    
    // Header section
    header: css({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      padding: '4',
      paddingTop: '4',
      fontSize: 'lg',
      bgColor: 'background',
      borderBottom: '1px solid',
      borderColor: 'border',
      position: 'relative',
      flexShrink: 0,
    }),
    
    // Title text
    title: css({
      fontFamily: 'heading',
      color: 'primary',
      fontSize: '1.5rem',
      fontWeight: 'thin',
      textAlign: 'center', // Title is already centered
      margin: 0,
    }),
    
    // Navigation container
    navContainer: css({
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      padding: '0',
      margin: '0',
      overflowY: 'auto',
      flexGrow: 1,
      WebkitOverflowScrolling: 'touch',
    }),
    
    // Navigation item
    navItem: css({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '94%',
      margin: '0 auto 4 auto',
      padding: '5',
      paddingLeft: '8',
      fontFamily: 'heading',
      fontSize: 'md',
      fontWeight: 'thin',
      color: 'text',
      bgColor: 'transparent',
      border: 'none',
      borderBottom: '3px solid',
      borderColor: 'primary',
      borderRadius: '12px',
      cursor: 'pointer',
      textAlign: 'left',
      position: 'relative',
      zIndex: 2,
      touchAction: 'manipulation',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      transition: 'background-color 0.2s ease, color 0.2s ease',
      '&[data-active="true"]': {
        color: 'primary',
        fontWeight: 'light',
      },
      _hover: {
        bgColor: 'hover',
        color: 'primary',
      },
      _focusVisible: {
        outline: '2px solid',
        outlineColor: 'primary',
        outlineOffset: '-2px',
        bgColor: 'hover',
        color: 'primary',
      }
    }),
    
    // Content wrapper for nav item
    navItemContent: css({
      display: 'flex',
      alignItems: 'center',
      gap: '3',
      flexGrow: 1,
      minWidth: 0,
      pointerEvents: 'auto',
    }),
    
    // Expand icon for collapsible sections
    expandIcon: css({
      transition: 'transform 0.2s ease',
      zIndex: 3,
      pointerEvents: 'auto',
      flexShrink: 0,
      color: 'primary',
      '&[data-expanded="true"]': {
        transform: 'rotate(180deg)',
      },
      '& > svg': {
        width: '1rem',
        height: '1rem',
      }
    }),
    
    // Container for nested items
    nestedItemsContainer: css({
      display: 'flex',
      flexDirection: 'column',
      width: '90%',
      gap: '3',
      padding: '3 0 4 10',
      margin: '0 auto',
      bgColor: 'transparent',
    }),
    
    // Nested item
    nestedItem: css({
      display: 'flex',
      alignItems: 'center',
      padding: '4 6',
      paddingLeft: '8',
      fontSize: 'sm',
      fontWeight: 'thin',
      color: 'text',
      opacity: 0.95,
      border: 'none',
      borderBottom: '2px solid',
      borderColor: 'primary',
      borderRadius: '10px',
      bgColor: 'transparent',
      width: '92%',
      margin: '0 auto 2 auto',
      textAlign: 'left',
      cursor: 'pointer',
      position: 'relative',
      zIndex: 2,
      letterSpacing: '0.05em',
      transition: 'background-color 0.2s ease, color 0.2s ease',
      '&[data-active="true"]': {
        bgColor: 'color-mix(in srgb, token(colors.primary) 10%, transparent)',
        color: 'primary',
        fontWeight: 'light',
      },
      _hover: {
        bgColor: 'hover',
        color: 'primary',
      },
      _focusVisible: {
        outline: '2px solid',
        outlineColor: 'primary',
        outlineOffset: '-2px',
        bgColor: 'hover',
        color: 'primary',
      }
    }),
    
    itemText: css({
      fontFamily: 'heading',
      fontSize: 'md',
      fontWeight: 'thin',
      color: 'text',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      '&[data-active="true"]': {
        color: 'primary',
        fontWeight: 'light',
      }
    }),
    
    // NEW: Text styles for nested navigation items
    nestedItemText: css({
      fontSize: 'sm',
      fontWeight: 'thin',
      color: 'text',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      letterSpacing: '0.05em',
      '&[data-active="true"]': {
        color: 'primary',
        fontWeight: 'light',
      }
    }),
    
    // Footer section
    footer: css({
      padding: '4',
      paddingLeft: '8',
      marginTop: 'auto',
      paddingTop: '4',
      borderTop: '3px solid',
      borderColor: 'primary',
      borderRadius: '12px 12px 0 0',
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: '4',
      flexShrink: 0,
      bgColor: 'transparent',
      width: '94%',
      margin: '3 auto 0 auto',
    }),
  };

  // Component Return
  return (
    <>
      {isHydrated && !isMobile && (
        <DesktopSidebarLayout
          sidebarRef={desktopSidebarRef}
          isHydrated={isHydrated}
          isExpanded={isExpanded}
          initiallyExpanded={initiallyExpanded}
          isMobile={isMobile}
          processedNavItems={processedNavItems}
          expandedItems={expandedItems}
          toggleItemExpansion={toggleItemExpansion}
          variant={variant}
          title={title}
          compact={compact}
          className={className}
          expandedWidth={expandedWidth}
          collapsedWidth={collapsedWidth}
          transitionDuration={transitionDuration}
          headerTopOffset={headerTopOffset}
          footerContent={footerContent}
          toggleSidebar={toggleSidebar}
        />
      )}
      {isHydrated && isMobile && (
        <MobileSidebarLayout
          mobileMenuRef={mobileMenuRef}
          overlayRef={overlayRef}
          isDrawerOpen={isDrawerOpen}
          title={title}
          processedNavItems={processedNavItems}
          expandedItems={expandedItems}
          footerContent={footerContent}
          mobileStyles={mobileStyles}
          toggleSidebar={toggleSidebar}
          toggleItemExpansion={toggleItemExpansion}
          handleNavigation={handleNavigation}
        />
      )}
      {!isHydrated && null}
    </>
  );
};

export default LeftSidebar;