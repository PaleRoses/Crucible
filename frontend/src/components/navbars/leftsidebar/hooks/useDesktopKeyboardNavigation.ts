// useDesktopKeyboardNavigation.ts
import { useEffect } from 'react';


/**
 * Hook to manage desktop sidebar keyboard navigation
 * 
 * Provides keyboard navigation features for desktop sidebar:
 * - Arrow navigation between items
 * - Expand/collapse with arrow keys
 * - Home/End navigation
 * - Character search
 * 
 * @param isExpanded - Whether the sidebar is expanded
 * @param sidebarRef - Reference to the sidebar element
 * @param expandedItems - Array of IDs for expanded nested menu items
 * @param toggleItemExpansion - Function to toggle expansion of nested menu items
 */
const useDesktopKeyboardNavigation = (
  isExpanded: boolean,
  sidebarRef: React.RefObject<HTMLElement | null>,
  expandedItems: string[],
  toggleItemExpansion: (itemId: string) => void
) => {
  useEffect(() => {
    if (!isExpanded || !sidebarRef.current) return;
    
    // Find all focusable items in the sidebar
    const getFocusableItems = () => {
      return Array.from(
        sidebarRef.current?.querySelectorAll('[role="button"], [tabindex="0"]') || []
      ) as HTMLElement[];
    };
    
    // Find all top-level items (direct children of navigation)
    const getTopLevelItems = () => {
      return Array.from(
        sidebarRef.current?.querySelectorAll('nav > div > div > [role="button"]') || []
      ) as HTMLElement[];
    };
    
    // Get all visible child items of a parent
    const getChildItems = (parentId: string) => {
      const parentElement = document.getElementById(parentId);
      if (!parentElement) return [];
      
      const childContainer = parentElement.nextElementSibling;
      if (!childContainer) return [];
      
      return Array.from(
        childContainer.querySelectorAll('[role="button"]')
      ) as HTMLElement[];
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip handling if target is not a focusable item in sidebar
      if (!(e.target instanceof HTMLElement) || 
          !e.target.closest('[role="button"], [tabindex="0"]')) {
        return;
      }
      
      const currentElement = e.target as HTMLElement;
      const focusableItems = getFocusableItems();
      const topLevelItems = getTopLevelItems();
      
      // Get current index among all focusable items
      const currentIndex = focusableItems.indexOf(currentElement);
      if (currentIndex === -1) return;
      
      // Check if current element has children
      const hasChildren = currentElement.getAttribute('data-has-children') === 'true';
      const isExpanded = currentElement.getAttribute('data-expanded') === 'true';
      
      let handled = false;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          handled = true;
          
          // If item is expanded and has children, focus the first child
          if (isExpanded && hasChildren) {
            const childItems = getChildItems(currentElement.id);
            if (childItems.length > 0) {
              childItems[0].focus();
              break;
            }
          }
          
          // Otherwise, move to the next item
          if (currentIndex < focusableItems.length - 1) {
            focusableItems[currentIndex + 1].focus();
          }
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          handled = true;
          
          // Move to the previous item
          if (currentIndex > 0) {
            focusableItems[currentIndex - 1].focus();
          }
          break;
          
        case 'ArrowRight':
          // If item has children and is not expanded, expand it
          if (hasChildren && !isExpanded) {
            e.preventDefault();
            handled = true;
            const itemId = currentElement.id;
            if (itemId) {
              toggleItemExpansion(itemId);
            }
          }
          break;
          
        case 'ArrowLeft':
          e.preventDefault();
          handled = true;
          
          // If item is expanded, collapse it
          if (hasChildren && isExpanded) {
            const itemId = currentElement.id;
            if (itemId) {
              toggleItemExpansion(itemId);
            }
            break;
          }
          
          // If it's a child item, move to its parent
          const isChildItem = !topLevelItems.includes(currentElement);
          if (isChildItem) {
            // Find the parent item by traversing up
            let parent = currentElement.closest('[data-has-children="true"]');
            if (parent instanceof HTMLElement) {
              parent.focus();
            }
          }
          break;
          
        case 'Home':
          e.preventDefault();
          handled = true;
          
          // Focus the first visible item
          if (focusableItems.length > 0) {
            focusableItems[0].focus();
          }
          break;
          
        case 'End':
          e.preventDefault();
          handled = true;
          
          // Focus the last visible item
          if (focusableItems.length > 0) {
            focusableItems[focusableItems.length - 1].focus();
          }
          break;
          
        default:
          // Character search - first item starting with pressed key
          if (e.key.length === 1 && e.key.match(/\S/)) {
            const char = e.key.toLowerCase();
            
            // Find items starting with this character
            const matchingItems = focusableItems.filter(item => {
              const text = item.textContent?.trim().toLowerCase() || '';
              return text.startsWith(char);
            });
            
            if (matchingItems.length > 0) {
              e.preventDefault();
              handled = true;
              
              // Find the next matching item after current or loop to first
              const currentMatchIndex = matchingItems.indexOf(currentElement);
              const nextMatchIndex = (currentMatchIndex + 1) % matchingItems.length;
              
              matchingItems[nextMatchIndex].focus();
            }
          }
          break;
      }
      
      // If we handled the event, mark it as such
      if (handled) {
        e.stopPropagation();
        return false;
      }
    };
    
    sidebarRef.current.addEventListener('keydown', handleKeyDown);
    return () => {
      sidebarRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded, sidebarRef, expandedItems, toggleItemExpansion]);
};

export default useDesktopKeyboardNavigation;