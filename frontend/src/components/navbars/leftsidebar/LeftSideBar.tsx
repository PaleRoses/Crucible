"use client";

import React, { useCallback, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
// Removed direct css import as it's now handled in the styles file
import { cosmicSidebarToggle } from '../../../../styled-system/recipes'; // Adjust path if needed

// Import hooks
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
} from './hooks/index'; // Adjust path if needed

// Import layout components
import DesktopSidebarLayout from './components/DesktopSidebarLayout'; // Adjust path if needed
import MobileSidebarLayout from './components/MobileSidebarLayout'; // Adjust path if needed

// Import the separated styles
import { mobileStyles, desktopStyles } from './styles/sidebarStyles'; // Adjust path if needed

/**
 * LeftSidebar Component
 * * A responsive and customizable sidebar component with mobile and desktop modes.
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
  transitionDuration = 300, // Keep transitionDuration prop for logic, styles use their own constant
  headerTopOffset = '50px', // Keep headerTopOffset prop for logic, styles use their own constant
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
        className={cosmicSidebarToggle({ // This uses a recipe, keep it here
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
        style={{ // Keep inline styles for dynamic/simple overrides or specific element needs
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
  }, [isDrawerOpen, compact, variant, toggleSidebar, closeDrawer]); // Dependencies remain
  
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
    transitionDuration // Pass transitionDuration prop here for JS logic
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
  // Style Definitions are now imported
  // ========================================
  // const mobileStyles = { ... }; // REMOVED FROM HERE

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
          transitionDuration={transitionDuration} // Pass prop
          headerTopOffset={headerTopOffset} // Pass prop
          footerContent={footerContent}
          toggleSidebar={toggleSidebar}
          // Pass desktopStyles (DesktopSidebarLayout needs to be updated to accept/use this)
          desktopStyles={desktopStyles} 
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
          mobileStyles={mobileStyles} // Pass imported mobileStyles
          toggleSidebar={toggleSidebar}
          toggleItemExpansion={toggleItemExpansion}
          handleNavigation={handleNavigation}
          // Pass headerTopOffset if MobileSidebarLayout needs it directly
          // headerTopOffset={headerTopOffset} 
        />
      )}
      {!isHydrated && null}
    </>
  );
};

export default LeftSidebar;
