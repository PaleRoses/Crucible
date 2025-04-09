// frontend/src/components/navbars/leftsidebar/hooks/useMobileSidebarToggle.tsx

import React, { useCallback } from 'react';
import { cosmicSidebarToggle } from '../../../../../styled-system/recipes';

/**
 * Custom hook that returns a function to render a mobile sidebar toggle button
 * 
 * @param isDrawerOpen - Whether the mobile drawer is currently open
 * @param compact - Whether to use compact styling
 * @param variant - The styling variant to use
 * @param toggleSidebar - Function to toggle the sidebar state
 * @returns A function that renders the toggle button
 */
const useMobileSidebarToggle = (
  isDrawerOpen: boolean,
  compact: boolean,
  variant: 'standard' | 'elevated' | 'minimal' | 'cosmic',
  toggleSidebar: () => void
) => {
  // Return a render function that produces the button
  return useCallback(() => {
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
          e.preventDefault();
          e.stopPropagation();
          
          // Always use toggleSidebar to ensure consistent behavior after reload
          toggleSidebar();
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
};

export default useMobileSidebarToggle;