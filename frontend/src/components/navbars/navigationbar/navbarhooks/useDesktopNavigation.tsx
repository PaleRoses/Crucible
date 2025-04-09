import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { NavItem } from './navigation';

/**
 * Hook for managing desktop navigation state and behavior
 * Handles submenu opening/closing, keyboard navigation, and focus management
 */
export function useDesktopNavigation({
  items,
  submenuBehavior,
  submenuCloseDelay,
  onNavigate
}: {
  items: NavItem[];
  submenuBehavior: 'hover' | 'click';
  submenuCloseDelay: number;
  onNavigate: (href: string) => void;
}) {
  const [activeItemId, setActiveItemIdState] = useState<string | null>(null);
  const [prevItemId, setPrevItemId] = useState<string | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const submenuRef = useRef<HTMLDivElement>(null);

  const setActiveItemId = useCallback((id: string | null) => {
    setActiveItemIdState(prevId => {
      if (prevId !== id) {
        if (id && !prevId) {
          lastFocusedElementRef.current = document.activeElement as HTMLElement;
        }
      }
      return id;
    });
  }, []);

  useEffect(() => {
    if (!activeItemId && lastFocusedElementRef.current) {
      if (document.body.contains(lastFocusedElementRef.current) && lastFocusedElementRef.current.focus) {
        try {
          lastFocusedElementRef.current.focus();
        } catch (e) {
          console.warn("Failed to restore focus:", e);
        }
      }
      lastFocusedElementRef.current = null;
    }
  }, [activeItemId]);

  const closeSubmenuWithDelay = useCallback(() => {
    if (submenuBehavior !== 'hover') return;
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setActiveItemId(null);
    }, submenuCloseDelay);
  }, [submenuBehavior, submenuCloseDelay, setActiveItemId]);

  const cancelSubmenuClosing = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const handleNavItemMouseEnter = useCallback((itemId: string) => {
    if (submenuBehavior === 'hover') {
      cancelSubmenuClosing();
      setActiveItemId(itemId);
    }
  }, [cancelSubmenuClosing, submenuBehavior, setActiveItemId]);

  const handleNavItemMouseLeave = useCallback(() => {
    if (submenuBehavior === 'hover') {
      closeSubmenuWithDelay();
    }
  }, [closeSubmenuWithDelay, submenuBehavior]);

  const handleNavItemClick = useCallback((item: NavItem) => {
    const hasSubmenu = Boolean(item.submenu && item.submenu.length > 0);
    if (hasSubmenu) {
      if (submenuBehavior === 'click') {
        setActiveItemId(activeItemId === item.id ? null : item.id);
      } else if (submenuBehavior === 'hover' && activeItemId !== item.id) {
        setActiveItemId(item.id);
      }
    } else if (item.href) {
      onNavigate(item.href);
      setActiveItemId(null);
    }
  }, [activeItemId, submenuBehavior, setActiveItemId, onNavigate]);

  const handleSubmenuItemClick = useCallback((href: string) => {
    setActiveItemId(null);
    onNavigate(href);
  }, [setActiveItemId, onNavigate]);

  const handleMainMenuKeyDown = useCallback((e: React.KeyboardEvent, item: NavItem) => {
    const navItemId = `nav-item-${item.id}`;
    const submenuId = `submenu-${item.id}`;
    const hasSubmenu = Boolean(item.submenu && item.submenu.length > 0);
    const isItemActive = activeItemId === item.id;

    const parentNav = (e.target as HTMLElement).closest('[role="menubar"]');
    if (!parentNav) return;

    const navItems = Array.from(parentNav.querySelectorAll<HTMLElement>(`:scope > [role="presentation"] > [role="menuitem"], :scope > [role="menuitem"]`));
    const currentItemIndex = navItems.findIndex(navItem => navItem.id === navItemId || navItem === (e.target as HTMLElement).closest('[role="menuitem"]'));

    if (currentItemIndex === -1) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleNavItemClick(item);
        break;
      case 'Escape':
        e.preventDefault();
        setActiveItemId(null);
        (e.target as HTMLElement).focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (hasSubmenu) {
          if (!isItemActive) {
            setActiveItemId(item.id);
          }
          setTimeout(() => {
            submenuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
          }, 50);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        navItems[currentItemIndex > 0 ? currentItemIndex - 1 : navItems.length - 1]?.focus();
        break;
      case 'ArrowRight':
        e.preventDefault();
        navItems[currentItemIndex < navItems.length - 1 ? currentItemIndex + 1 : 0]?.focus();
        break;
      case 'Home':
        e.preventDefault();
        navItems[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        navItems[navItems.length - 1]?.focus();
        break;
    }
  }, [activeItemId, setActiveItemId, handleNavItemClick]);

  useEffect(() => {
    const handleSubmenuKeyDown = (e: KeyboardEvent) => {
      if (!activeItemId || !submenuRef.current) return;
      const focusableElements = Array.from(submenuRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]'));
      if (focusableElements.length === 0) return;
      const triggerButtonId = `nav-item-${activeItemId}`;
      const focusedElement = document.activeElement as HTMLElement;
      let focusedIndex = focusableElements.findIndex(el => el === focusedElement);

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          setActiveItemId(null);
          document.getElementById(triggerButtonId)?.focus();
          break;
        case 'ArrowDown':
        case 'ArrowRight': // Treat right like down in horizontal layout
          e.preventDefault();
          focusableElements[focusedIndex >= 0 && focusedIndex < focusableElements.length - 1 ? focusedIndex + 1 : 0]?.focus();
          break;
        case 'ArrowUp':
        case 'ArrowLeft': // Treat left like up in horizontal layout
          e.preventDefault();
          if (focusedIndex > 0) {
            focusableElements[focusedIndex - 1]?.focus();
          } else {
            // If first item, focus back on trigger
            document.getElementById(triggerButtonId)?.focus();
            // Optionally close submenu when navigating up from first item:
            // setActiveItemId(null);
          }
          break;
        case 'Home':
          e.preventDefault();
          focusableElements[0]?.focus();
          break;
        case 'End':
          e.preventDefault();
          focusableElements[focusableElements.length - 1]?.focus();
          break;
        case 'Tab':
          if (focusableElements.length > 0) {
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            if (e.shiftKey && document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus(); // Wrap to end
            } else if (!e.shiftKey && document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus(); // Wrap to start
            }
          } else {
            e.preventDefault();
            document.getElementById(triggerButtonId)?.focus();
          }
          break;
      }
    };
    if (activeItemId) { document.addEventListener('keydown', handleSubmenuKeyDown); }
    return () => { document.removeEventListener('keydown', handleSubmenuKeyDown); };
  }, [activeItemId, setActiveItemId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!activeItemId || submenuBehavior !== 'click') return;
      const target = event.target as HTMLElement;
      const submenuContainer = submenuRef.current;
      const triggerButton = document.getElementById(`nav-item-${activeItemId}`);
      if (submenuContainer && !submenuContainer.contains(target) && triggerButton && !triggerButton.contains(target)) {
        setActiveItemId(null);
      }
    };
    if (submenuBehavior === 'click' && activeItemId) { document.addEventListener('mousedown', handleClickOutside); }
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, [activeItemId, submenuBehavior, setActiveItemId]);

  useEffect(() => {
    if (activeItemId && prevItemId && activeItemId !== prevItemId) {
      const itemIds = items.map(item => item.id);
      const prevIndex = itemIds.indexOf(prevItemId);
      const currentIndex = itemIds.indexOf(activeItemId);
      setTimeout(() => { setSlideDirection(currentIndex > prevIndex ? 'right' : 'left'); }, 10);
    }
    if (activeItemId !== prevItemId) { setPrevItemId(activeItemId); }
  }, [activeItemId, prevItemId, items]);

  useEffect(() => { return () => { if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current); }; }, []);

  // Get props for a navigation item
  const getNavItemProps = useCallback((item: NavItem) => {
    const hasSubmenu = Boolean(item.submenu && item.submenu.length > 0);
    const isItemActive = activeItemId === item.id;
    return {
      id: `nav-item-${item.id}`,
      onClick: () => handleNavItemClick(item),
      onKeyDown: (e: React.KeyboardEvent) => handleMainMenuKeyDown(e, item),
      onMouseEnter: () => handleNavItemMouseEnter(item.id),
      onMouseLeave: handleNavItemMouseLeave,
      role: "menuitem",
      tabIndex: 0,
      'aria-haspopup': hasSubmenu ? "true" as const : undefined,
      'aria-expanded': hasSubmenu ? isItemActive : undefined,
      'aria-controls': hasSubmenu ? `submenu-${item.id}` : undefined,
      'data-item-active': isItemActive, // Pass state for styling via data attribute
    };
  }, [activeItemId, handleNavItemClick, handleMainMenuKeyDown, handleNavItemMouseEnter, handleNavItemMouseLeave]);

  const getSubmenuProps = useCallback(() => {
    return {
      ref: submenuRef,
      onMouseEnter: cancelSubmenuClosing,
      onMouseLeave: handleNavItemMouseLeave, // Use handleNavItemMouseLeave for consistency with hover logic
      role: "menu",
      id: activeItemId ? `submenu-${activeItemId}` : undefined,
      'aria-labelledby': activeItemId ? `nav-item-${activeItemId}` : undefined,
    };
  }, [activeItemId, cancelSubmenuClosing, handleNavItemMouseLeave]);

  const activeItem = useMemo(() => items.find(item => item.id === activeItemId) || null, [items, activeItemId]);

  return {
    activeItemId, 
    activeItem, 
    slideDirection, 
    getNavItemProps, 
    getSubmenuProps, 
    handleSubmenuItemClick,
    submenuRef
  };
}

export default useDesktopNavigation;