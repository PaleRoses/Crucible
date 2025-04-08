"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  cosmicSidebar,
  cosmicSidebarHeader,
  cosmicSidebarContent,
  cosmicSidebarItem,
  cosmicSidebarNestedItems,
  cosmicSidebarGroup,
  cosmicSidebarDivider,
  cosmicSidebarBadge,
  cosmicSidebarFooter,
  cosmicSidebarToggle,
} from '../../../styled-system/recipes';
import { css, cx } from '../../../styled-system/css';

// ========================================
// Type Definitions
// ========================================

/**
 * Combined hook for keyboard navigation in both mobile and desktop modes
 */
const useSidebarKeyboardNavigation = (
  isMobile: boolean,
  isExpanded: boolean,
  isDrawerOpen: boolean,
  desktopRef: React.RefObject<HTMLElement>,
  mobileRef: React.RefObject<HTMLElement>,
  onClose: () => void,
  expandedItems: string[],
  toggleItemExpansion: (itemId: string) => void
) => {
  // Desktop keyboard navigation
  useEffect(() => {
    if (isMobile || !isExpanded || !desktopRef.current) return;
    
    // Find all focusable items in the sidebar
    const getFocusableItems = () => {
      return Array.from(
        desktopRef.current?.querySelectorAll('[role="button"], [tabindex="0"]') || []
      ) as HTMLElement[];
    };
    
    // Find all top-level items (direct children of navigation)
    const getTopLevelItems = () => {
      return Array.from(
        desktopRef.current?.querySelectorAll('nav > div > div > [role="button"]') || []
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
    
    desktopRef.current.addEventListener('keydown', handleKeyDown);
    return () => {
      desktopRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobile, isExpanded, desktopRef, expandedItems, toggleItemExpansion]);

  // Mobile keyboard navigation
  useEffect(() => {
    if (!isMobile || !isDrawerOpen || !mobileRef.current) return;

    // Find all focusable menu items
    const getFocusableItems = () => {
      return Array.from(
        mobileRef.current?.querySelectorAll('[role="menuitem"], [role="button"]') || []
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

    mobileRef.current.addEventListener('keydown', handleKeyDown);
    return () => {
      mobileRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobile, isDrawerOpen, mobileRef, onClose, expandedItems, toggleItemExpansion]);
};

type DepthOption = "1" | "2" | "3";

interface NavigationItem {
  label: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  level?: number; 
  href?: string;
  onClick?: () => void;
  badge?: number | string;
  children?: NavigationItem[]; 
}

interface SidebarSection {
  label: string;
  items: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    badge?: number | string;
  }[];
}

type SidebarItems = SidebarSection[];

interface LeftSidebarProps {
  // Appearance
  variant?: 'standard' | 'elevated' | 'minimal' | 'cosmic';
  size?: string;
  // Content
  title?: string;
  logo?: React.ReactNode;
  navigationItems?: NavigationItem[];
  sidebarItems?: SidebarItems;
  footerContent?: React.ReactNode;
  // Behavior
  initiallyExpanded?: boolean;
  onToggle?: (isExpanded: boolean) => void;
  // Content pushing (desktop)
  pushContent?: boolean;
  contentSelector?: string;
  expandedWidth?: string;
  collapsedWidth?: string;
  transitionDuration?: number;
  // Layout & Styling
  headerTopOffset?: string;
  compact?: boolean;
  className?: string;
  // External toggle handling (mobile)
  onToggleExternal?: (isExpanded: boolean) => void;
  externalToggleRef?: React.RefObject<{
    toggle: () => void;
    ToggleButton?: () => React.ReactElement;
  }>;
}

// ========================================
// Custom Hooks
// ========================================

/**
 * Hook to manage responsive behavior and hydration
 */
const useSidebarResponsive = (initiallyExpanded: boolean, onToggleExternal: ((isExpanded: boolean) => void) | null) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const isDrawerOpenRef = useRef(isDrawerOpen);
  const onToggleExternalRef = useRef(onToggleExternal);

  // Update refs when values change
  useEffect(() => {
    isDrawerOpenRef.current = isDrawerOpen;
  }, [isDrawerOpen]);

  useEffect(() => {
    onToggleExternalRef.current = onToggleExternal;
  }, [onToggleExternal]);

  // Handle hydration and initial state
  useEffect(() => {
    setIsHydrated(true);
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
    }
  }, []);

  // Handle resize and update mobile state
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        const currentIsMobile = window.innerWidth < 768;
        setIsMobile(currentIsMobile);

        if (!currentIsMobile && isDrawerOpenRef.current) {
          setIsDrawerOpen(false);
          if (onToggleExternalRef.current) {
            onToggleExternalRef.current(false);
          }
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isHydrated,
    isMobile,
    isExpanded,
    isDrawerOpen,
    setIsExpanded,
    setIsDrawerOpen,
    isDrawerOpenRef,
    onToggleExternalRef
  };
};

/**
 * Hook to handle localStorage persistence
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

/**
 * Hook to process navigation items and manage expanded state
 */
const useSidebarNavigation = (
  navigationItems: NavigationItem[],
  sidebarItems: SidebarItems,
  pathname: string,
  handleNavigation: (item: NavigationItem) => void
) => {
  const [processedNavItems, setProcessedNavItems] = useState<NavigationItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Process navigation items
  useEffect(() => {
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
    
    // Update state only if necessary
    setProcessedNavItems(prevItems => {
      if (JSON.stringify(prevItems) !== JSON.stringify(newNavItems)) {
        return newNavItems;
      }
      return prevItems;
    });
  }, [sidebarItems, navigationItems, pathname, handleNavigation]);

  // Toggle expansion of nested navigation groups
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

/**
 * Hook to manage content pushing functionality
 */
const useContentPushing = (
  pushContent: boolean,
  isHydrated: boolean,
  isMobile: boolean,
  isExpanded: boolean,
  contentSelector: string,
  expandedWidth: string,
  collapsedWidth: string,
  transitionDuration: number
) => {
  const contentRef = useRef<HTMLElement | null>(null);

  // Setup initial content pushing
  useEffect(() => {
    if (!pushContent || !isHydrated) return;

    // Find content element only once
    if (!contentRef.current) {
      try {
        const contentElement = document.querySelector<HTMLElement>(contentSelector);
        if (contentElement) {
          contentRef.current = contentElement;
        } else {
          console.warn(`[LeftSidebar] Content element not found: ${contentSelector}`);
          return;
        }
      } catch (error) {
        console.error(`[LeftSidebar] Invalid selector: ${contentSelector}`, error);
        return;
      }
    }
    
    const content = contentRef.current;
    if (!content) return;

    // Apply initial styles based on state (desktop only)
    if (!isMobile) {
      content.style.transition = 'none';
      content.style.marginLeft = isExpanded ? expandedWidth : collapsedWidth;
      
      // Add transition after initial paint to avoid animating on load
      requestAnimationFrame(() => {
        if (contentRef.current) {
          contentRef.current.style.transition = `margin-left ${transitionDuration}ms ease`;
        }
      });
    } else {
      content.style.marginLeft = '';
      content.style.transition = '';
    }
    
    // Cleanup styles on unmount
    return () => {
      if (contentRef.current) {
        contentRef.current.style.marginLeft = '';
        contentRef.current.style.transition = '';
      }
    };
  }, [
    pushContent, 
    contentSelector, 
    expandedWidth, 
    collapsedWidth, 
    transitionDuration, 
    isHydrated, 
    isMobile, 
    isExpanded
  ]);

  // Update content pushing on state change
  useEffect(() => {
    if (!pushContent || !isHydrated) return;
    
    const content = contentRef.current;
    if (!content) return;

    if (!isMobile) {
      content.style.marginLeft = isExpanded ? expandedWidth : collapsedWidth;
      
      if (!content.style.transition || !content.style.transition.includes('margin-left')) {
        content.style.transition = `margin-left ${transitionDuration}ms ease`;
      }
    } else {
      content.style.marginLeft = '';
      content.style.transition = '';
    }
  }, [
    isExpanded, 
    isMobile, 
    pushContent, 
    expandedWidth, 
    collapsedWidth, 
    transitionDuration, 
    isHydrated
  ]);

  return contentRef;
};

/**
 * Hook to manage sidebar toggle functionality and button
 */
const useSidebarToggle = (
  isMobile: boolean,
  isExpanded: boolean,
  isDrawerOpen: boolean,
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>,
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>,
  onToggle: ((isExpanded: boolean) => void) | null,
  onToggleExternalRef: React.MutableRefObject<((isExpanded: boolean) => void) | null>,
  compact: boolean,
  variant: string
) => {
  // Toggle function for internal operations
  const toggleSidebarFn = useCallback(() => {
    // Check current mobile status for extra safety
    const currentIsMobile = window.innerWidth < 768;

    if (currentIsMobile) {
      setIsDrawerOpen(prevDrawerOpen => {
        const newDrawerState = !prevDrawerOpen;
        if (onToggleExternalRef.current) {
          onToggleExternalRef.current(newDrawerState);
        }
        return newDrawerState;
      });
    } else {
      setIsExpanded(prevExpanded => {
        const newExpandedState = !prevExpanded;
        if (onToggle) {
          onToggle(newExpandedState);
        }
        return newExpandedState;
      });
    }
  }, [onToggle, isMobile, setIsExpanded, setIsDrawerOpen, onToggleExternalRef]);

  // Component factory for mobile toggle button
  const SidebarToggleButton = useCallback(() => {
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
            setIsDrawerOpen(false);
            if (onToggleExternalRef.current) {
              onToggleExternalRef.current(false);
            }
          } else {
            // Normal toggle behavior when closed
            toggleSidebarFn();
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
  }, [isDrawerOpen, compact, variant, toggleSidebarFn, setIsDrawerOpen, onToggleExternalRef]);

  return { toggleSidebarFn, SidebarToggleButton };
};
const useMobileInteractions = (
  isOpen: boolean,
  onClose: () => void,
  enabled: boolean
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  // Click outside detection with external button handling
  useEffect(() => {
    if (!enabled || !isOpen) return;

    // Add a small delay flag to handle external button clicks
    let isProcessingExternalClick = false;

    const handleClickOutside = (event: MouseEvent) => {
      // Skip processing if we're handling an external button click
      if (isProcessingExternalClick) return;
      
      // Close when clicking outside the container, but not on external elements
      if (containerRef.current && 
          !containerRef.current.contains(event.target as Node)) {
        
        // Check if click target is the external toggle button
        const isExternalToggle = (event.target as Element)?.closest?.('[data-sidebar-external-toggle="true"]');
        
        if (!isExternalToggle) {
          onClose();
        }
      }
    };

    // Set flag when external toggle is used
    const handleExternalToggle = () => {
      isProcessingExternalClick = true;
      setTimeout(() => {
        isProcessingExternalClick = false;
      }, 100); // Small delay to prevent immediate re-triggering
    };

    // Add event listener for external toggle
    const externalToggleButton = document.querySelector('[data-sidebar-external-toggle="true"]');
    if (externalToggleButton) {
      externalToggleButton.addEventListener('click', handleExternalToggle);
    }

    // Use capture phase ('click' not 'mousedown')
    document.addEventListener('click', handleClickOutside, true);
    
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
      if (externalToggleButton) {
        externalToggleButton.removeEventListener('click', handleExternalToggle);
      }
    };
  }, [isOpen, onClose, enabled]);

  // Swipe gesture detection
  useEffect(() => {
    if (!enabled || !isOpen || !containerRef.current) return;
    
    let touchStartY = 0;
    let touchEndY = 0;
    const MIN_SWIPE_DISTANCE = 50; // Minimum distance for a swipe in pixels
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      touchEndY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = () => {
      // Calculate swipe direction and distance
      const swipeDistance = touchStartY - touchEndY;
      
      // If swiped up with enough distance, close the drawer
      if (swipeDistance > MIN_SWIPE_DISTANCE) {
        onClose();
      }
      
      // Reset values
      touchStartY = 0;
      touchEndY = 0;
    };
    
    const element = containerRef.current;
    
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      if (element) {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [isOpen, onClose, enabled]);

  // Focus management
  useEffect(() => {
    if (!enabled) return;
    
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else if (previousFocusRef.current) {
      // Restore focus when closing
      previousFocusRef.current.focus();
    }
  }, [isOpen, enabled]);

  // Initial focus
  useEffect(() => {
    if (!enabled || !isOpen || !containerRef.current) return;
    
    // Set initial focus after a short delay to ensure the drawer is visible
    const timer = setTimeout(() => {
      const focusableElements = containerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;
      
      if (focusableElements && focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isOpen, enabled]);
  
  // Focus trap
  useEffect(() => {
    if (!enabled || !isOpen || !containerRef.current) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close drawer on Escape key
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      
      if (e.key !== 'Tab') return;
      
      const focusableElements = containerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;
      
      if (!focusableElements || focusableElements.length === 0) return;
      
      // Get first and last focusable elements
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      // If shift+tab on first element, move to last element
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } 
      // If tab on last element, move to first element
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, enabled]);
  
  return { containerRef, overlayRef };
};



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

  // Toggle functionality and button
  const { toggleSidebarFn, SidebarToggleButton } = useSidebarToggle(
    isMobile,
    isExpanded,
    isDrawerOpen,
    setIsExpanded,
    setIsDrawerOpen,
    onToggle,
    onToggleExternalRef,
    compact,
    variant
  );

  // Manage external toggle ref
  useEffect(() => {
    if (externalToggleRef && typeof externalToggleRef === 'object') {
      if (externalToggleRef.current !== undefined) {
        externalToggleRef.current = {
          toggle: toggleSidebarFn,
          ToggleButton: SidebarToggleButton,
        };
      }
    }
    
    return () => {
      if (externalToggleRef && 
          typeof externalToggleRef === 'object' && 
          externalToggleRef.current !== undefined) {
        externalToggleRef.current = { 
          toggle: () => {}, 
          ToggleButton: undefined 
        };
      }
    };
  }, [toggleSidebarFn, SidebarToggleButton, externalToggleRef]);

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
  
  // Click outside detection, swipe gesture, and focus trap for mobile
  const { containerRef: mobileMenuRef, overlayRef } = useMobileInteractions(
    isDrawerOpen,
    toggleSidebarFn,
    isMobile
  );
  
  // Combined keyboard navigation
  useSidebarKeyboardNavigation(
    isMobile,
    isExpanded,
    isDrawerOpen,
    desktopSidebarRef as React.RefObject<HTMLElement>,
    mobileMenuRef as React.RefObject<HTMLElement>,
    toggleSidebarFn,
    expandedItems,
    toggleItemExpansion
  );

  // ========================================
  // Style Definitions
  // ========================================

  // --- Desktop Styles ---
  
  const desktopNavStyle = css({
    overflowY: 'auto',
    flexGrow: 1,
    paddingBottom: 'spacing.5',
    scrollbarWidth: 'thin',
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'border.subtle',
      borderRadius: '3px',
    }
  });

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

  // ========================================
  // Helper Components
  // ========================================
  
  // Check if navigation items have proper grouping
  const hasProperGrouping = processedNavItems.some(item => item.level === 1);
  
  // Desktop navigation item (main)
  const DesktopNavItem = ({
    item,
    itemId,
    hasChildren,
    isItemExpanded
  }: {
    item: NavigationItem,
    itemId: string,
    hasChildren: boolean,
    isItemExpanded: boolean
  }) => (
    <div
      id={itemId}
      className={cosmicSidebarItem({
        variant: variant === 'cosmic' ? 'cosmic' : 'standard',
        size: compact ? 'sm' : 'md'
      })}
      data-active={item.isActive}
      data-has-children={hasChildren}
      data-expanded={hasChildren && isItemExpanded}
      aria-expanded={hasChildren ? isItemExpanded : undefined}
      onClick={(e) => {
        e.stopPropagation();
        if (!isExpanded && !isMobile) return;
        if (hasChildren) {
          e.preventDefault();
          toggleItemExpansion(itemId);
        } else if (item.onClick) {
          item.onClick();
        }
      }}
      style={{
        cursor: (!isExpanded && !isMobile && !hasChildren) ? 'default' : 'pointer',
        pointerEvents: (!isExpanded && !isMobile && !hasChildren) ? 'none' : 'auto',
        opacity: (!isExpanded && !isMobile && !hasChildren) ? 0.6 : 1,
        fontWeight: 100,
        position: 'relative',
        zIndex: 2,
      }}
      role="button"
      tabIndex={0}
      aria-label={item.label + (hasChildren ? ' (submenu)' : '')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!isExpanded && !isMobile) return;
          if (hasChildren) {
            toggleItemExpansion(itemId);
          } else if (item.onClick) {
            item.onClick();
          }
        }
      }}
    >
      {item.icon && <div className="sidebar-item-icon">{item.icon}</div>}
      {isExpanded && <span className="sidebar-item-text">{item.label}</span>}
      {isExpanded && item.badge && (
        <div className={cosmicSidebarBadge({ variant: 'danger', size: compact ? 'sm' : 'md' })}>
          {item.badge}
        </div>
      )}
      {isExpanded && hasChildren && (
        <span 
          className="sidebar-item-arrow" 
          style={{ 
            marginLeft: 'auto', 
            transition: 'transform 0.2s', 
            transform: isItemExpanded ? 'rotate(180deg)' : 'rotate(0deg)' 
          }}
        >
          ▼
        </span>
      )}
    </div>
  );
  
  // Desktop nested navigation item
  const DesktopNestedItem = ({
    child,
    itemId,
    childIndex
  }: {
    child: NavigationItem,
    itemId: string,
    childIndex: number
  }) => (
    <div
      key={`${itemId}-child-${childIndex}`}
      className={cosmicSidebarItem({ 
        variant: variant === 'cosmic' ? 'cosmic' : 'standard', 
        size: compact ? 'sm' : 'md' 
      })}
      data-active={child.isActive}
      onClick={(e) => {
        e.stopPropagation();
        if (!isExpanded && !isMobile) return;
        if (child.onClick) child.onClick();
      }}
      style={{
        cursor: 'pointer',
        fontWeight: 100,
        position: 'relative',
        zIndex: 2
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!isExpanded && !isMobile) return;
          if (child.onClick) child.onClick();
        }
      }}
    >
      {child.icon && <div className="sidebar-item-icon">{child.icon}</div>}
      <span className="sidebar-item-text">{child.label}</span>
      {child.badge && (
        <div className={cosmicSidebarBadge({ 
          variant: 'danger', 
          size: compact ? 'sm' : 'md' 
        })}>
          {child.badge}
        </div>
      )}
    </div>
  );
  
  // Mobile navigation item
  const MobileNavItem = ({
    item,
    itemId,
    index
  }: {
    item: NavigationItem,
    itemId: string,
    index: number
  }) => {
    // Skip level 1 headers in mobile view
    if (item.level === 1) return null;
    
    const hasChildren = !!(item.children && item.children.length > 0);
    const isNestedExpanded = expandedItems.includes(itemId);
    
    return (
      <div key={itemId} style={{ width: '100%' }}>
        {/* Main Item */}
        <div
          id={`mobile-${itemId}`}
          data-item-id={itemId}
          className={mobileStyles.navItem}
          data-active={item.isActive}
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) {
              e.preventDefault();
              toggleItemExpansion(itemId);
            }
            else if (item.onClick) {
              item.onClick();
            } else if (item.href) {
              handleNavigation(item);
            }
          }}
          role={hasChildren ? 'button' : (item.href ? 'link' : 'button')}
          aria-expanded={hasChildren ? isNestedExpanded : undefined}
          aria-label={item.label + (hasChildren ? ' (submenu)' : '')}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (hasChildren) {
                toggleItemExpansion(itemId);
              } else if (item.onClick) {
                item.onClick();
              } else if (item.href) {
                handleNavigation(item);
              }
            }
          }}
        >
          {/* Icon and Label */}
          <div className={mobileStyles.navItemContent}>
            {item.icon && (
              <div className="sidebar-item-icon" style={{ flexShrink: 0 }}>
                {item.icon}
              </div>
            )}
            <span>{item.label}</span>
          </div>
          
          {/* Badge and Expand Icon */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'token(spacing.2)', 
            flexShrink: 0 
          }}>
            {item.badge && (
              <div className={cosmicSidebarBadge({ variant: 'danger', size: 'sm' })}>
                {item.badge}
              </div>
            )}
            {hasChildren && (
              <span
                className={mobileStyles.expandIcon}
                data-expanded={isNestedExpanded}
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            )}
          </div>
        </div>

        {/* Nested Items */}
        {hasChildren && isNestedExpanded && (
          <div
            className={mobileStyles.nestedItemsContainer}
            role="menu"
            aria-label={`${item.label} submenu`}
          >
            {item.children!.map((child, childIndex) => (
              <div
                key={`${itemId}-child-${childIndex}`}
                className={mobileStyles.nestedItem}
                data-active={child.isActive}
                onClick={(e) => {
                  e.stopPropagation();
                  if (child.onClick) {
                    child.onClick();
                  } else if (child.href) {
                    handleNavigation(child);
                  }
                }}
                role="menuitem"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (child.onClick) {
                      child.onClick();
                    } else if (child.href) {
                      handleNavigation(child);
                    }
                  }
                }}
              >
                {child.icon && (
                  <div
                    className="sidebar-item-icon"
                    style={{ marginRight: 'token(spacing.2)', flexShrink: 0 }}
                  >
                    {child.icon}
                  </div>
                )}
                <span>{child.label}</span>
                {child.badge && (
                  <div
                    className={cosmicSidebarBadge({ variant: 'danger', size: 'sm' })}
                    style={{ marginLeft: 'auto' }}
                  >
                    {child.badge}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ========================================
  // Render Functions
  // ========================================
  
  // Renders navigation items grouped by sections
  const renderGroupedNavigationItems = () => {
    const groups: { heading: NavigationItem, items: NavigationItem[] }[] = [];
    let currentGroup: { heading: NavigationItem, items: NavigationItem[] } | null = null;
    
    // Group items by level 1 headers
    processedNavItems.forEach(item => {
      if (item.level === 1) {
        if (currentGroup) groups.push(currentGroup);
        currentGroup = { heading: item, items: [] };
      } else if (currentGroup && item.level === 2) {
        currentGroup.items.push(item);
      }
    });
    
    if (currentGroup) groups.push(currentGroup);

    return (
      <>
        {groups.map((group, groupIndex) => (
          <div
            key={`group-${group.heading.label}-${groupIndex}`}
            className={cosmicSidebarGroup({
              variant: variant === 'cosmic' ? 'cosmic' : 'standard',
              showDivider: groupIndex > 0
            })}
          >
            {/* Group Heading */}
            <div className="sidebar-group-heading" style={{ fontWeight: 100 }}>
              {isExpanded && group.heading.label}
            </div>
            
            {/* Group Items */}
            {group.items.map((item, itemIndex) => {
              const itemId = `item-${groupIndex}-${itemIndex}`;
              const hasChildren = !!(item.children && item.children.length > 0);
              const isItemExpanded = expandedItems.includes(itemId);
              
              return (
                <div key={itemId}>
                  {/* Main Item */}
                  <DesktopNavItem 
                    item={item} 
                    itemId={itemId} 
                    hasChildren={hasChildren} 
                    isItemExpanded={isItemExpanded} 
                  />
                  
                  {/* Nested Items */}
                  {isExpanded && hasChildren && isItemExpanded && (
                    <div className={cosmicSidebarNestedItems({ 
                      depth: "1", 
                      indentStyle: compact ? 'compact' : 'default' 
                    })}>
                      {item.children!.map((child, childIndex) => (
                        <DesktopNestedItem 
                          key={`${itemId}-child-${childIndex}`}
                          child={child} 
                          itemId={itemId} 
                          childIndex={childIndex} 
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </>
    );
  };

  // Renders navigation items as a flat list
  const renderFlatNavigationItems = () => {
    return processedNavItems.map((item, index) => {
      const itemId = `flat-item-${index}`;
      const hasChildren = !!(item.children && item.children.length > 0);
      const isItemExpanded = expandedItems.includes(itemId);
      
      return (
        <div key={itemId}>
          {/* Main Item */}
          <DesktopNavItem 
            item={item} 
            itemId={itemId} 
            hasChildren={hasChildren} 
            isItemExpanded={isItemExpanded} 
          />
          
          {/* Nested Items */}
          {isExpanded && hasChildren && isItemExpanded && (
            <div className={cosmicSidebarNestedItems({ 
              depth: "1", 
              indentStyle: compact ? 'compact' : 'default' 
            })}>
              {item.children!.map((child, childIndex) => (
                <DesktopNestedItem 
                  key={`${itemId}-child-${childIndex}`}
                  child={child} 
                  itemId={itemId} 
                  childIndex={childIndex} 
                />
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  // Renders the desktop sidebar
  const renderDesktopSidebar = () => (
    <aside
      ref={desktopSidebarRef}
      className={cx(
        cosmicSidebar({ variant, initiallyExpanded }), 
        className
      )}
      data-expanded={isHydrated ? isExpanded : initiallyExpanded}
      aria-hidden={isMobile}
      aria-label="Main navigation"
      role="navigation"
      style={{
        width: isHydrated 
          ? (isExpanded ? expandedWidth : collapsedWidth) 
          : (initiallyExpanded ? expandedWidth : collapsedWidth),
        transition: isHydrated ? `width ${transitionDuration}ms ease` : 'none',
        display: isMobile ? 'none' : 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 50,
      }}
    >
      {/* Header */}
      <div
        className={cosmicSidebarHeader()}
        style={{
          marginTop: headerTopOffset,
          padding: `0 ${compact ? 'token(spacing.2)' : 'token(spacing.3)'}`,
          paddingLeft: '40px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          height: 'token(sizes.12)',
        }}
      >
        {/* Toggle Button */}
        <button
          className={cosmicSidebarToggle({ 
            variant: variant === 'cosmic' ? 'cosmic' : 'borderless', 
            size: compact ? 'sm' : 'md', 
            border: 'none', 
            isMobile: false 
          })}
          data-expanded={isExpanded}
          onClick={(e) => {
            e.stopPropagation();
            toggleSidebarFn();
          }}
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-expanded={isExpanded}
          aria-controls="sidebar-navigation"
        >
          <span></span><span></span><span></span>
        </button>
        
        {/* Title */}
        <h1 
          className="sidebar-header-title" 
          style={{
            fontSize: '1.1rem',
            fontWeight: 'semibold',
            margin: 0,
            marginLeft: 'token(spacing.4)',
            padding: 0,
            opacity: isExpanded ? 1 : 0,
            visibility: isExpanded ? 'visible' : 'hidden',
            transition: `opacity ${transitionDuration}ms ease, visibility ${transitionDuration}ms ease`,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            color: 'text.primary'
          }}
        >
          {title}
        </h1>
      </div>

      {/* Navigation Content */}
      <nav
        id="sidebar-navigation"
        className={cx(
          cosmicSidebarContent(),
          desktopNavStyle,
          css({ paddingTop: compact ? 'spacing.2' : 'spacing.4' })
        )}
        aria-label="Site navigation"
      >
        {processedNavItems.length > 0 && (
          hasProperGrouping ? renderGroupedNavigationItems() : renderFlatNavigationItems()
        )}
      </nav>

      {/* Footer */}
      {footerContent && (
        <div
          className={cosmicSidebarFooter({ 
            variant: variant === 'cosmic' ? 'cosmic' : 'standard', 
            spacing: compact ? 'compact' : 'normal' 
          })}
          style={{
            opacity: isExpanded ? 1 : 0,
            visibility: isExpanded ? 'visible' : 'hidden',
            transition: `opacity ${transitionDuration}ms ease, visibility ${transitionDuration}ms ease`,
            overflow: 'hidden',
            flexShrink: 0
          }}
        >
          {isExpanded && footerContent}
        </div>
      )}
    </aside>
  );

  // Renders the mobile dropdown
  const renderMobileDropdown = () => (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className={mobileStyles.overlay}
        data-open={isDrawerOpen}
        onClick={(e) => {
          if (e.target === overlayRef.current) {
            e.stopPropagation();
            toggleSidebarFn();
          }
        }}
        aria-hidden="true"
      />

      {/* Dropdown Container */}
      <div
        id="mobile-dropdown-menu"
        ref={mobileMenuRef}
        className={mobileStyles.dropdown}
        data-open={isDrawerOpen}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isDrawerOpen}
        aria-label="Navigation menu"
        // Add a hint about swipe gesture
        aria-description="Swipe up to close navigation menu"
      >
        {/* Header */}
        <div className={mobileStyles.header}>
          <h2 className={mobileStyles.title}>{title}</h2>
        </div>

        {/* Navigation */}
        <nav className={mobileStyles.navContainer} aria-label="Site navigation">
          {processedNavItems.map((item, index) => {
            const itemId = `mobile-item-${index}`;
            return (
              <MobileNavItem 
                key={itemId}
                item={item} 
                itemId={itemId} 
                index={index} 
              />
            );
          })}
        </nav>

        {/* Footer */}
        {footerContent && <div className={mobileStyles.footer}>{footerContent}</div>}
      </div>
    </>
  );

  // Component Return
  return (
    <>
      {isHydrated && !isMobile && renderDesktopSidebar()}
      {isHydrated && isMobile && renderMobileDropdown()}
      {!isHydrated && null}
      
      
    </>
  );
};

export default LeftSidebar;