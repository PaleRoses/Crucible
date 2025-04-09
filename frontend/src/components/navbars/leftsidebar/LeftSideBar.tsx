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
  const handleNavigation = useCallback((item) => {
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
          e.stopPropagation();
          
          // If drawer is open, only CLOSE it (not toggle)
          if (isDrawerOpen) {
            closeDrawer();
          } else {
            // Normal toggle behavior when closed
            toggleSidebar();
          }
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
        <span></span>
        <span></span>
        <span></span>
      </button>
    );
  }, [isDrawerOpen, compact, variant, toggleSidebar, closeDrawer]);
  
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
    desktopSidebarRef as React.RefObject<HTMLElement>,
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
    mobileMenuRef as React.RefObject<HTMLElement>,
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
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: 'lg',
      borderRight: '1px solid',
      borderColor: 'border.default',
      transform: 'translateX(-100%)',
      opacity: 0.95,
      visibility: 'hidden',
      transition: `transform ${transitionDuration}ms ease, opacity ${transitionDuration}ms ease, visibility ${transitionDuration}ms ease`,
      '&[data-open="true"]': {
        transform: 'translateX(0)',
        opacity: 1,
        visibility: 'visible',
      },
      scrollbarWidth: 'thin',
      '&::-webkit-scrollbar': { width: '6px' },
      '&::-webkit-scrollbar-thumb': { backgroundColor: 'border.subtle', borderRadius: '3px' }
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
      padding: 'spacing.4',
      paddingTop: 'spacing.4',
      bgColor: 'background',
      borderBottom: '1px solid',
      borderColor: 'border.default',
      position: 'relative',
      flexShrink: 0,
    }),
    
    // Title text
    title: css({
      fontFamily: 'heading',
      color: 'primary',
      fontSize: 'lg',
      fontWeight: 'thin',
      textAlign: 'center',
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
      width: '100%',
      padding: 'spacing.3 spacing.4',
      fontFamily: 'body',
      fontSize: 'md',
      fontWeight: 'medium',
      color: 'text.secondary',
      bgColor: 'transparent',
      border: 'none',
      borderBottom: '1px solid',
      borderColor: 'border',
      cursor: 'pointer',
      textAlign: 'left',
      position: 'relative',
      zIndex: 2,
      touchAction: 'manipulation',
      transition: 'background-color 0.2s ease, color 0.2s ease',
      '&[data-active="true"]': {
        color: 'accent.text',
        fontWeight: 'semibold',
      },
      _hover: {
        bgColor: 'background.hover',
        color: 'text.primary',
      },
      _focusVisible: {
        outline: '2px solid',
        outlineColor: 'accent.solid',
        outlineOffset: '-2px',
        bgColor: 'background.hover',
        color: 'text.primary',
      }
    }),
    
    // Content wrapper for nav item
    navItemContent: css({
      display: 'flex',
      alignItems: 'center',
      gap: 'spacing.3',
      flexGrow: 1,
      minWidth: 0,
      pointerEvents: 'auto',
      '& > span': {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }
    }),
    
    // Expand icon for collapsible sections
    expandIcon: css({
      transition: 'transform 0.2s ease',
      zIndex: 3,
      pointerEvents: 'auto',
      flexShrink: 0,
      color: 'text.subtle',
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
      width: '100%',
      gap: '0',
      padding: 'spacing.1 0 spacing.1 calc(token(spacing.4) + token(spacing.3) + 1rem)',
      bgColor: 'background.subtle',
      borderBottom: '1px solid',
      borderColor: 'border.subtle',
    }),
    
    // Nested item
    nestedItem: css({
      display: 'flex',
      alignItems: 'center',
      padding: 'spacing.2 spacing.4',
      fontSize: 'sm',
      fontWeight: 'regular',
      color: 'text.secondary',
      opacity: 0.95,
      border: 'none',
      bgColor: 'transparent',
      width: '100%',
      textAlign: 'left',
      cursor: 'pointer',
      position: 'relative',
      zIndex: 2,
      transition: 'background-color 0.2s ease, color 0.2s ease',
      '&[data-active="true"]': {
        color: 'accent.text',
        fontWeight: 'medium',
      },
      _hover: {
        bgColor: 'background.hover',
        color: 'text.primary',
      },
      _focusVisible: {
        outline: '2px solid',
        outlineColor: 'accent.solid',
        outlineOffset: '-2px',
        bgColor: 'background.hover',
        color: 'text.primary',
      },
      '& > span': {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }
    }),
    
    // Footer section
    footer: css({
      padding: 'spacing.4',
      marginTop: 'auto',
      paddingTop: 'spacing.4',
      borderTop: '1px solid',
      borderColor: 'border.default',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 'spacing.4',
      flexShrink: 0,
      bgColor: 'transparent',
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