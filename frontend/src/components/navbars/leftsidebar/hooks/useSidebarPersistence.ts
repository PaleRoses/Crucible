// useSidebarPersistence.ts
import { useEffect } from 'react';

/**
 * Hook to handle localStorage persistence for sidebar state
 * 
 * Handles saving and loading of:
 * - Expanded/collapsed state for desktop sidebar
 * - Open/closed state for mobile drawer
 * 
 * @param isHydrated - Whether the component has been hydrated on client-side
 * @param isExpanded - Current expanded state of the sidebar
 * @param setIsExpanded - Function to update expanded state
 * @param isDrawerOpen - Current open state of the mobile drawer
 * @param setIsDrawerOpen - Function to update drawer open state
 */
const useSidebarPersistence = (
  isHydrated: boolean, 
  isExpanded: boolean, 
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>,
  isDrawerOpen: boolean,
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Load persisted states
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedExpanded = localStorage.getItem('sidebar-expanded');
      if (savedExpanded !== null) {
        setIsExpanded(JSON.parse(savedExpanded));
      }
      
      const savedDrawer = localStorage.getItem('sidebar-drawer-open');
      if (savedDrawer !== null) {
        setIsDrawerOpen(JSON.parse(savedDrawer));
      }
    }
  }, [setIsExpanded, setIsDrawerOpen]);

  // Save desktop sidebar state
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('sidebar-expanded', JSON.stringify(isExpanded));
    }
  }, [isExpanded, isHydrated]);

  // Save mobile drawer state
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('sidebar-drawer-open', JSON.stringify(isDrawerOpen));
    }
  }, [isDrawerOpen, isHydrated]);
};

export default useSidebarPersistence;