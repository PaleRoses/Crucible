// useSidebarToggle.ts
import { useCallback, useEffect } from 'react';
import { UseSidebarToggleProps, UseSidebarToggleResult } from '../types/types';

/**
 * Hook to manage sidebar toggling functionality
 * 
 * Provides methods for toggling the sidebar in both mobile and desktop modes,
 * and exposes the toggle functionality to external references.
 * 
 * @param props - Object containing all required props
 * @returns Object with toggle functions
 */
const useSidebarToggle = ({
  isMobile,
  isExpanded,
  setIsExpanded,
  isDrawerOpen,
  setIsDrawerOpen,
  onToggleExternalRef,
  onToggle,
  externalToggleRef
}: UseSidebarToggleProps): UseSidebarToggleResult => {
  // Toggle sidebar function
  const toggleSidebar = useCallback(() => {
    // Check current mobile status for extra safety
    const currentIsMobile = window.innerWidth < 768;

    if (currentIsMobile) {
      setIsDrawerOpen((prevDrawerOpen: boolean) => {
        const newDrawerState = !prevDrawerOpen;
        if (onToggleExternalRef.current) {
          onToggleExternalRef.current(newDrawerState);
        }
        return newDrawerState;
      });
    } else {
      setIsExpanded((prevExpanded: boolean) => {
        const newExpandedState = !prevExpanded;
        if (onToggle) {
          onToggle(newExpandedState);
        }
        return newExpandedState;
      });
    }
  }, [onToggle, isMobile, setIsExpanded, setIsDrawerOpen, onToggleExternalRef]);

  // Function to close drawer only (for mobile)
  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    if (onToggleExternalRef.current) {
      onToggleExternalRef.current(false);
    }
  }, [setIsDrawerOpen, onToggleExternalRef]);

  // Manage external toggle ref - now only for the toggle function
  useEffect(() => {
    if (externalToggleRef && typeof externalToggleRef === 'object' && externalToggleRef.current !== undefined) {
      // Store the current ToggleButton if it exists
      const currentToggleButton = externalToggleRef.current.ToggleButton;
      
      // Update the toggle function
      externalToggleRef.current = {
        toggle: toggleSidebar,
        // Preserve the ToggleButton reference (will be set by the component)
        ToggleButton: currentToggleButton
      };
    }
    
    return () => {
      if (externalToggleRef && 
          typeof externalToggleRef === 'object' && 
          externalToggleRef.current !== undefined) {
        // Only clean up the toggle function on unmount
        const currentToggleButton = externalToggleRef.current.ToggleButton;
        externalToggleRef.current = { 
          toggle: () => {}, 
          ToggleButton: currentToggleButton 
        };
      }
    };
  }, [toggleSidebar, externalToggleRef]);

  return {
    toggleSidebar,
    closeDrawer
  };
};

export default useSidebarToggle;