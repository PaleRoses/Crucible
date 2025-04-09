// useSidebarNavigation.ts
import { useState, useCallback, useMemo } from 'react';
import { NavigationItem, SidebarItems } from '../types/types';

/**
 * Hook to process navigation items and manage expanded state
 * 
 * Handles:
 * - Processing flat navigation items or structured sidebar items
 * - Checking for active items based on current path
 * - Managing expanded/collapsed state of navigation groups
 * 
 * @param navigationItems - Array of flat navigation items
 * @param sidebarItems - Array of structured sidebar sections
 * @param pathname - Current route path
 * @param handleNavigation - Function to handle navigation item clicks
 * @returns Object containing processed navigation items and expansion management
 */
const useSidebarNavigation = (
  navigationItems: NavigationItem[],
  sidebarItems: SidebarItems,
  pathname: string,
  handleNavigation: (item: NavigationItem) => void
) => {
  // Process navigation items with useMemo instead of useState + useEffect
  const processedNavItems = useMemo(() => {
    let newNavItems: NavigationItem[] = [];
    
    // Process structured sidebar items
    if (sidebarItems && sidebarItems.length > 0) {
      sidebarItems.forEach(section => {
        // Add section header
        newNavItems.push({ 
          label: section.label, 
          level: 1, 
          isActive: false 
        });
        
        // Add section items
        section.items.forEach(item => {
          newNavItems.push({
            ...item,
            level: 2,
            isActive: pathname === item.href,
            onClick: item.href 
              ? () => handleNavigation({ ...item, href: item.href }) 
              : undefined,
          });
        });
      });
    }
    // Process flat navigation items
    else if (navigationItems.length > 0) {
      newNavItems = navigationItems.map(item => ({
        ...item,
        isActive: item.isActive !== undefined 
          ? item.isActive 
          : (item.href === pathname),
        onClick: item.href && !item.onClick 
          ? () => handleNavigation(item) 
          : item.onClick,
        children: item.children?.map(child => ({
          ...child,
          isActive: child.isActive !== undefined 
            ? child.isActive 
            : (child.href === pathname),
          onClick: child.href && !child.onClick 
            ? () => handleNavigation(child) 
            : child.onClick,
        }))
      }));
    }
    
    return newNavItems;
  }, [sidebarItems, navigationItems, pathname, handleNavigation]);

  // Toggle expansion of nested navigation groups
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  
  const toggleItemExpansion = useCallback((itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  return {
    processedNavItems,
    expandedItems,
    toggleItemExpansion
  };
};

export default useSidebarNavigation;