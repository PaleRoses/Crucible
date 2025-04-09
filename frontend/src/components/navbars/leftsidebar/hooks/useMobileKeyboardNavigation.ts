import { useEffect } from 'react';

/**
 * Hook for mobile menu keyboard navigation
 * Handles arrow key navigation, character search, and escape to close
 */
export const useMobileKeyboardNavigation = (
  menuRef: React.RefObject<HTMLElement>,
  isOpen: boolean,
  onClose: () => void,
  expandedItems: string[],
  toggleItemExpansion: (itemId: string) => void
) => {
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    // Find all focusable menu items
    const getFocusableItems = () => {
      return Array.from(
        menuRef.current?.querySelectorAll('[role="menuitem"], [role="button"]') || []
      ) as HTMLElement[];
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if target is not a focusable item in menu
      if (!(e.target instanceof HTMLElement) || 
          !e.target.closest('[role="menuitem"], [role="button"]')) {
        return;
      }
      
      const focusableItems = getFocusableItems();
      if (!focusableItems.length) return;

      const currentElement = e.target as HTMLElement;
      const currentIndex = focusableItems.indexOf(currentElement);
      if (currentIndex === -1) return;
      
      // Check if current element has children
      const hasChildren = currentElement.getAttribute('aria-expanded') !== null;
      const isExpanded = currentElement.getAttribute('aria-expanded') === 'true';
      const itemId = currentElement.getAttribute('data-item-id') || '';
      
      let handled = false;
      let nextIndex: number;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          handled = true;
          nextIndex = currentIndex < focusableItems.length - 1 ? currentIndex + 1 : 0;
          focusableItems[nextIndex].focus();
          break;

        case 'ArrowUp':
          e.preventDefault();
          handled = true;
          nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableItems.length - 1;
          focusableItems[nextIndex].focus();
          break;
          
        case 'ArrowRight':
          // If item has children and is not expanded, expand it
          if (hasChildren && !isExpanded && itemId) {
            e.preventDefault();
            handled = true;
            toggleItemExpansion(itemId);
          }
          break;
          
        case 'ArrowLeft':
          // If item is expanded, collapse it
          if (hasChildren && isExpanded && itemId) {
            e.preventDefault();
            handled = true;
            toggleItemExpansion(itemId);
          }
          break;
          
        case 'Home':
          e.preventDefault();
          handled = true;
          focusableItems[0].focus();
          break;
          
        case 'End':
          e.preventDefault();
          handled = true;
          focusableItems[focusableItems.length - 1].focus();
          break;
          
        case 'Escape':
          e.preventDefault();
          handled = true;
          onClose();
          break;
          
        case 'Enter':
        case ' ':
          // Space and Enter are handled by the individual elements
          // We don't need to do anything special here
          break;
          
        default:
          // Character search - jump to first item starting with pressed key
          if (e.key.length === 1 && e.key.match(/\S/)) {
            const char = e.key.toLowerCase();
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

    menuRef.current.addEventListener('keydown', handleKeyDown);
    return () => {
      menuRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, menuRef, onClose, expandedItems, toggleItemExpansion]);
};