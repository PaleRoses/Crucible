'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef, RefObject } from 'react';
import { motion, AnimatePresence, useAnimation, AnimationControls } from 'framer-motion';
// Assuming PandaCSS setup provides these functions. Replace if using a different CSS-in-JS solution.
// If not using PandaCSS or similar, you might need to define these styles differently (e.g., CSS Modules, styled-components).
// @ts-ignore // Add this line if 'css' and 'cx' are definitely available but TS can't find declarations
import { css, cx } from "../../../styled-system/css"; // Adjust path as needed

// --- TypeScript Interfaces ---

// Primary and secondary item interfaces
interface SecondaryItem {
  id: string;
  name: string;
}

interface PrimaryItem {
  id: string;
  name: string;
  secondary: SecondaryItem[];
}

// Content details interface
interface ItemDetail {
  title: string;
  content: string;
}

// Type for item details collection
type ItemDetails = Record<string, ItemDetail>;

// Ref collections for DOM elements
interface ItemRefs {
  [key: string]: HTMLDivElement | null;
}

// Style object for indicator lines
interface IndicatorStyle {
  transform?: string;
  width?: string;
  height?: string;
  opacity?: number;
}

// --- ANIMATION VARIANTS ---

const ANIMATIONS = {
  drawer: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] } }
  },
  secondaryDrawer: {
    hidden: { opacity: 0, x: -10, width: 0 },
    visible: (screenSize = 'lg') => {
      let width = '220px'; // Default
      if (screenSize === 'base') width = '180px';
      else if (screenSize === 'md') width = '200px';
      return { opacity: 1, x: 0, width, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] } };
    },
    exit: { opacity: 0, x: -10, width: 0, transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] } }
  },
  item: {
    hidden: { opacity: 0, y: 5 },
    visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] } }),
    // Updated to match ScrollingContentWithNav hover behavior
    hover: { backgroundColor: 'var(--colors-glow)', transition: { duration: 0.2, ease: "easeOut" } }, 
    tap: { scale: 0.98, transition: { duration: 0.1, ease: [0.19, 1, 0.22, 1] } }
  },
  content: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] } },
    exit: { opacity: 0, transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] } }
  },
  // Added animation for the back button
  backButton: {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.15, ease: [0.25, 0.1, 0.25, 1.0] } }
  }
};

// --- STYLE DEFINITIONS ---

// Container styles
const containerStyle = css({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  margin: '5rem 0 0 0', // Add top margin only, ensuring sides and bottom are zero
  fontFamily: 'body',
  overflow: 'hidden',
  color: 'var(--colors-text)',
  background: 'var(--colors-background)',
  position: 'relative',
  boxSizing: 'border-box', // Ensure consistent box model
});

// Main header styles
const mainHeaderStyle = css({
  paddingLeft: '1rem', // Keep padding for now

  width: '100%',
  height: '60px', // Fixed height for consistency
  display: 'flex',
  alignItems: 'center',
  padding: '0 2rem', // Consistent horizontal padding
  borderBottom: '1px solid',
  borderColor: 'var(--colors-border)',
  background: 'var(--colors-background)',
  color: 'var(--colors-primary)',
  fontWeight: '100', // Ultra thin weight
  fontFamily: 'heading',
  fontSize: { base: 'md', md: 'lg', lg: 'xl' }, // Slightly reduced font sizes
  textAlign: 'left',
  textTransform: 'uppercase',
  flexShrink: 0,
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  boxSizing: 'border-box', // Ensure consistent box model
  lineHeight: 1, // Normalize line height
});

// Content container styles
const contentContainerStyle = css({
  display: 'flex',
  flexGrow: 1,
  overflow: 'hidden',
});

// Primary drawer styles
const primaryDrawerStyle = css({
  width: { base: '180px', md: '200px', lg: '240px' },
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRight: '1px solid',
  borderColor: 'var(--colors-border)',
  background: 'var(--colors-background)',
  position: 'relative',
  zIndex: 2,
  transition: 'width 0.3s ease-in-out',
  flexShrink: 0,
  fontFamily: 'heading', // Use theme heading font
  boxSizing: 'border-box', // Ensure consistent box model
});

// Header styles (used for both drawers)
const headerStyle = css({
  height: '60px', // Match the main header height exactly
  minHeight: '60px', // Enforce minimum height
  maxHeight: '60px', // Enforce maximum height
  display: 'flex',
  alignItems: 'center',
  padding: '0 1rem', // Horizontal padding only
  fontWeight: '100', // Ultra thin header weight
  fontFamily: 'heading',
  margin: 0, // Remove all margins
  color: 'var(--colors-primary)',
  fontSize: { base: 'md', md: 'lg', lg: 'xl' }, // Match main header font size
  borderBottom: '1px solid',
  borderColor: 'var(--colors-border)',
  flexShrink: 0,
  boxSizing: 'border-box', // Ensure consistent box model
  lineHeight: 1, // Normalize line height
  textTransform: 'capitalize', // Capitalize first letter of each word
});

// List styles (used for both drawers)
const listStyle = css({
  overflowY: 'auto',
  overflowX: 'hidden',
  flexGrow: 1,
  paddingLeft: '0.5rem', // Keep padding for now, adjust if indicator positioning needs change
  paddingRight: '0.5rem',
  scrollBehavior: 'smooth',
  position: 'relative', // Needed for absolute positioning of the indicator line
  '&::-webkit-scrollbar': { width: '4px' },
  '&::-webkit-scrollbar-track': { background: 'transparent' },
  '&::-webkit-scrollbar-thumb': { background: 'var(--colors-border)', borderRadius: '4px' },
  '&::-webkit-scrollbar-thumb:hover': { background: 'var(--colors-primary)' }, // Use primary color on hover
});

// Item styles (used for both drawers and focus view list)
const itemStyle = css({
  display: 'block',
  padding: '8px 12px',
  margin: '4px 0',
  cursor: 'pointer',
  borderRadius: 'md', // Use theme token if available, 'md' is common
  // Updated transition to match ScrollingContentWithNav
  transitionProperty: 'color, background-color, transform',
  transitionDuration: 'fast', // Using theme token for consistency
  transitionTimingFunction: 'ease-in-out',
  color: 'var(--colors-textMuted)', // Use muted color for inactive items
  fontFamily: 'heading',
  fontWeight: '100', // Ultra thin weight for inactive items
  position: 'relative',
  outline: 'none',
  userSelect: 'none',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  _hover: { // Updated to match ScrollingContentWithNav hover
    backgroundColor: 'var(--colors-glow)',
    color: 'var(--colors-text)', // Change from primary to text color on hover for inactive items
  },
  _focusVisible: { // Match focus style concept
    outline: 'none',
    boxShadow: '0 0 0 2px var(--colors-primary)', // Use primary color ring
    backgroundColor: 'var(--colors-glow)', // Optional glow on focus
  },
});

// Active item styles
const activeItemStyle = css({
  color: 'var(--colors-primary)', // Use primary color for text
  fontWeight: '200', // Use slightly heavier weight for active items (still very thin)
  // No background change on active, relies on text color/weight and indicator
  _hover: {
    // Special override for active items on hover
    color: 'var(--colors-primary)', // Keep text as primary when active item is hovered
    backgroundColor: 'var(--colors-glow)', // Still use glow background
  }
});

// --- Indicator Line Styles ---
const indicatorLineStyle = css({
  position: 'absolute',
  left: '0px', // Position at the edge of the list container
  width: '5px', // Match ScrollingContentWithNav width
  backgroundColor: 'var(--colors-primary)',
  borderRadius: '0 3px 3px 0', // Match ScrollingContentWithNav radius
  opacity: 0,
  // Updated transition to match ScrollingContentWithNav timing
  transition: 'transform 0.3s ease-in-out, height 0.3s ease-in-out, opacity 0.2s ease',
  willChange: 'transform, height',
  boxShadow: '0 0 6px var(--colors-primary)', // Match ScrollingContentWithNav glow
});

// Right panel styles
const rightPanelStyle = css({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
});

// App header styles
const appHeaderStyle = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '60px', // Match height with other headers
  minHeight: '60px', // Enforce minimum height
  maxHeight: '60px', // Enforce maximum height
  padding: '0 1rem', // Horizontal padding only
  borderBottom: '1px solid',
  borderColor: 'var(--colors-border)',
  background: 'var(--colors-background)',
  flexShrink: 0,
  fontFamily: 'heading', // Use heading font
  boxSizing: 'border-box', // Ensure consistent box model
  margin: 0, // Remove all margins
});

// View options container styles
const viewOptionsStyle = css({
  display: 'flex',
  gap: '10px', // Use theme token if available
});

// Button styles (Split/Focus toggle, Back button)
const buttonStyle = css({
  padding: '5px 10px',
  cursor: 'pointer',
  background: 'none',
  border: '1px solid',
  borderColor: 'var(--colors-border)', // Use theme border color
  borderRadius: 'md', // Use theme token if available
  color: 'var(--colors-text)', // Use theme text color
  fontSize: 'sm', // Use theme token if available
  fontFamily: 'heading', // Use theme heading font
  fontWeight: '100', // Ultra thin weight for buttons
  // Updated transition to match ScrollingContentWithNav pattern
  transitionProperty: 'color, background-color, border-color, box-shadow',
  transitionDuration: 'fast',
  transitionTimingFunction: 'ease-in-out',
  _hover: { // Match hover style
    borderColor: 'var(--colors-primary)',
    backgroundColor: 'var(--colors-glow)',
    color: 'var(--colors-primary)', // Add color change on hover
  },
  _focusVisible: { // Match focus style concept
    outline: 'none',
    borderColor: 'var(--colors-primary)', // Keep border change
    boxShadow: '0 0 0 2px var(--colors-primary)', // Use primary ring
  },
});

// Active button styles (Split/Focus toggle)
const activeButtonStyle = css({
  borderColor: 'var(--colors-primary)', // Primary border
  color: 'var(--colors-primary)', // Primary text
  backgroundColor: 'var(--colors-glow)', // Use glow background for active state
  fontWeight: '200', // Still thin but slightly more visible for active state
});

// Search input styles
const searchInputStyle = css({
  padding: '6px 10px',
  border: '1px solid',
  borderColor: 'var(--colors-border)',
  borderRadius: 'md',
  fontSize: 'sm',
  fontFamily: 'heading',
  fontWeight: '100', // Ultra thin weight for search input
  width: { base: '120px', md: '160px', lg: '200px' },
  // Updated transition to match pattern
  transitionProperty: 'border-color, box-shadow',
  transitionDuration: 'fast',
  transitionTimingFunction: 'ease-in-out',
  color: 'var(--colors-text)',
  background: 'var(--colors-background)',
  _focus: { // Match focus style concept
    outline: 'none',
    borderColor: 'var(--colors-primary)',
    boxShadow: '0 0 0 2px var(--colors-primary)', // Use primary ring
  },
  _placeholder: {
    color: 'var(--colors-textMuted)', // Use muted text color for placeholder
    fontWeight: '100', // Ultra thin weight for placeholder text
  },
});

// Content area styles
const contentAreaStyle = css({
  display: 'flex',
  flexGrow: 1,
  overflow: 'hidden',
  position: 'relative',
});

// Secondary drawer styles
const secondaryDrawerStyle = css({
  width: { base: '180px', md: '200px', lg: '220px' },
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRight: '1px solid',
  borderColor: 'var(--colors-border)',
  background: 'var(--colors-background)',
  transition: 'opacity 0.3s ease-in-out', // Keep transition
  position: 'relative',
  zIndex: 1,
  flexShrink: 0,
  fontFamily: 'heading', // Use heading font
  overflow: 'hidden',
});

// Content display styles
const contentDisplayStyle = css({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
  background: 'var(--colors-background)',
});

// Content body styles
const contentBodyStyle = css({
  padding: { base: '1rem', md: '1.5rem', lg: '2rem' }, // Keep padding for now
  flexGrow: 1,
  overflowY: 'auto',
  '&::-webkit-scrollbar': { width: '4px' },
  '&::-webkit-scrollbar-track': { background: 'transparent' },
  '&::-webkit-scrollbar-thumb': { background: 'var(--colors-border)', borderRadius: '4px' },
  '&::-webkit-scrollbar-thumb:hover': { background: 'var(--colors-primary)' },
});

// Placeholder styles
const placeholderStyle = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start', // Align top
  height: '100%',
  color: 'var(--colors-textMuted)', // Use muted text color
  padding: '2rem',
  paddingTop: '4rem',
  textAlign: 'center',
  fontSize: 'md', // Keep md for main text
  fontWeight: '100', // Ultra thin weight for placeholder text
  '& h2': {
    fontSize: 'lg',
    color: 'var(--colors-textMuted)', // Use muted color for placeholder heading too
    marginBottom: '0.5rem',
    fontFamily: 'heading',
    fontWeight: '100', // Ultra thin weight for placeholder heading
  },
  '& p': {
     fontSize: 'sm', // Use sm for placeholder paragraph
     lineHeight: 'relaxed', // Add relaxed line height
     fontWeight: '100', // Ultra thin weight for placeholder paragraph
  }
});

// Mark styles (Search highlighting)
const markStyle = css({
  backgroundColor: 'var(--colors-primary)', // Use primary color for highlight background
  padding: '0 2px',
  borderRadius: 'sm', // Use theme token if available
  color: 'var(--colors-background)', // Use background color for text on primary highlight
  fontWeight: '200', // Slightly higher weight for highlighted text to ensure readability
});

// Content title styles
const contentTitleStyle = css({
  fontSize: { base: 'xl', md: '2xl' },
  fontWeight: '100', // Ultra thin header weight
  fontFamily: 'heading',
  marginBottom: '1.25rem',
  color: 'var(--colors-primary)',
  position: 'relative',
  paddingBottom: '0.5rem',
  '&::after': { // Keep underline accent
    content: '""',
    position: 'absolute',
    bottom: '0',
    left: '0',
    width: '3rem',
    height: '3px',
    backgroundColor: 'var(--colors-primary)',
    borderRadius: '1.5px',
  }
});

// Content paragraph styles
const contentParagraphStyle = css({
  marginBottom: '1rem', // Use theme token if available (e.g., '4')
  lineHeight: 'relaxed', // Match relaxed line height
  color: 'var(--colors-text)', // Use standard text color
  fontSize: 'md', // Keep md for main content text
  fontWeight: '100', // Ultra thin weight for content paragraphs
});


// --- CUSTOM HOOKS ---
// NOTE: Hooks remain unchanged as they handle logic, not base styling.

/**
 * Manages the active primary and secondary items in the drawer interface.
 * @param items - The array of primary items with their secondary items.
 */
function useDrawerNavigation(items: PrimaryItem[]) {
  const [activePrimaryItem, setActivePrimaryItem] = useState<string | null>(null);
  const [activeSecondaryItem, setActiveSecondaryItem] = useState<string | null>(null);

  const activePrimaryData = useMemo(() => {
    return items.find(item => item.id === activePrimaryItem) || null;
  }, [items, activePrimaryItem]);

  const secondaryItems = useMemo(() => {
    return activePrimaryData?.secondary || [];
  }, [activePrimaryData]);

  const selectPrimaryItem = useCallback((itemId: string) => {
    const previouslyActive = activePrimaryItem;
    setActivePrimaryItem(itemId);
    if (previouslyActive !== itemId) {
      setActiveSecondaryItem(null);
    }
  }, [activePrimaryItem]);

  const selectSecondaryItem = useCallback((itemId: string | null) => {
    setActiveSecondaryItem(itemId);
  }, []);

  return {
    activePrimaryItem,
    activeSecondaryItem,
    activePrimaryData,
    secondaryItems,
    selectPrimaryItem,
    selectSecondaryItem
  };
}

/**
 * Manages the layout mode of the drawer ('split' or 'focus').
 * @param initialMode - The initial layout mode ('split' by default).
 */
function useDrawerLayout(initialMode: 'split' | 'focus' = 'split') {
  const [layoutMode, setLayoutMode] = useState<'split' | 'focus'>(initialMode);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const layoutControls: AnimationControls = useAnimation();

  const toggleLayoutMode = useCallback((mode?: 'split' | 'focus') => {
    setIsAnimating(true);
    if (mode && (mode === 'split' || mode === 'focus')) {
      setLayoutMode(mode);
    } else {
      setLayoutMode(prev => prev === 'split' ? 'focus' : 'split');
    }
    setTimeout(() => setIsAnimating(false), 300);
  }, []);

  const isSplitView = layoutMode === 'split';
  const isFocusView = layoutMode === 'focus';

  return {
    layoutMode,
    isSplitView,
    isFocusView,
    isAnimating,
    layoutControls,
    toggleLayoutMode
  };
}

/**
 * Manages search functionality for filtering drawer items.
 * @param items - The array of primary items to search within.
 */
function useDrawerSearch(items: PrimaryItem[]) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredPrimaryItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    return items.filter((pItem: PrimaryItem) =>
      pItem.name.toLowerCase().includes(lowerSearchTerm) ||
      pItem.secondary.some((sItem: SecondaryItem) =>
        sItem.name.toLowerCase().includes(lowerSearchTerm)
      )
    );
  }, [items, searchTerm]);

  const getFilteredSecondaryItems = useCallback((secondaryItems: SecondaryItem[]) => {
    if (!searchTerm.trim()) return secondaryItems;
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    return secondaryItems.filter((sItem: SecondaryItem) =>
      sItem.name.toLowerCase().includes(lowerSearchTerm)
    );
  }, [searchTerm]);

  const highlightText = useCallback((text: string): React.ReactNode => {
    const trimmedSearchTerm = searchTerm.trim();
    if (!trimmedSearchTerm || !text) return text;
    const escapedSearchTerm = trimmedSearchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part: string, i: number) =>
      regex.test(part)
        ? <mark key={i} className={markStyle}>{part}</mark>
        : part
    );
  }, [searchTerm, markStyle]); // Added markStyle dependency

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    searchInputRef,
    filteredPrimaryItems,
    getFilteredSecondaryItems,
    highlightText
  };
}


/**
 * Manages dynamic height measurements for drawer headers and calculates indicator positions.
 */
function useDrawerDimensionsAndIndicator() {
  const [dimensions, setDimensions] = useState({
    primaryHeaderHeight: 0,
    secondaryHeaderHeight: 0
  });
  const [primaryIndicatorStyle, setPrimaryIndicatorStyle] = useState<IndicatorStyle>({});
  const [secondaryIndicatorStyle, setSecondaryIndicatorStyle] = useState<IndicatorStyle>({});

  // Refs for header elements to measure their height
  const primaryHeaderRef = useRef<HTMLHeadingElement>(null);
  const secondaryHeaderRef = useRef<HTMLHeadingElement>(null);
  // Refs for list container elements (used for positioning indicator and checking bounds)
  // Initialized with null, type is MutableRefObject<HTMLDivElement | null>
  const primaryListRef = useRef<HTMLDivElement>(null);
  const secondaryListRef = useRef<HTMLDivElement>(null);

  // Callback to measure and update header heights in state
  const adjustHeaderHeights = useCallback(() => {
    let primaryHeight = 0;
    let secondaryHeight = 0;

    // Calculate height including margin for primary header
    if (primaryHeaderRef.current) {
      const styles = getComputedStyle(primaryHeaderRef.current);
      primaryHeight = primaryHeaderRef.current.offsetHeight + parseFloat(styles.marginBottom || '0');
    }
    // Calculate height including margin for secondary header
    if (secondaryHeaderRef.current) {
      const styles = getComputedStyle(secondaryHeaderRef.current);
      secondaryHeight = secondaryHeaderRef.current.offsetHeight + parseFloat(styles.marginBottom || '0');
    }

    // Update state only if heights have actually changed
    setDimensions(prev => {
      if (prev.primaryHeaderHeight !== primaryHeight || prev.secondaryHeaderHeight !== secondaryHeight) {
        return { primaryHeaderHeight: primaryHeight, secondaryHeaderHeight: secondaryHeight };
      }
      return prev;
    });
  }, []); // No dependencies, function is stable

  // Effect to adjust header heights on initial mount
  useEffect(() => {
    // Force a repaint on mount to ensure consistent header rendering
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50);

    // Cleanup listener on unmount
    return () => {
      clearTimeout(timer);
    };
  }, []); // Run only once on mount

  // Function to calculate and update indicator style (position, height, opacity)
  const updateIndicator = useCallback((
    // *** Accept MutableRefObject for listRef to match useRef return type ***
    listRef: React.MutableRefObject<HTMLDivElement | null>,
    // itemRef can point to an element or null (if item is not active/found)
    itemRef: RefObject<HTMLDivElement | null>,
    // State setter function for the specific indicator (primary/secondary)
    setStyle: React.Dispatch<React.SetStateAction<IndicatorStyle>>
  ) => {
    // Get the list container DOM element (might be null initially)
    const listElement = listRef.current;
    // Get the active item DOM element (might be null)
    // Use optional chaining on itemRef just in case, though it should be an object
    const itemElement = itemRef?.current;

    // Proceed only if both the list container and the active item element exist
    if (listElement && itemElement) {
      const listRect = listElement.getBoundingClientRect(); // Get list bounds
      const itemRect = itemElement.getBoundingClientRect(); // Get item bounds

      // Calculate the item's top position relative to the list container's top,
      // accounting for the list's scroll position.
      const top = itemRect.top - listRect.top + listElement.scrollTop;
      const height = itemRect.height; // Get the item's height for the indicator

      // Update the indicator's style state
      setStyle(prevStyle => {
          const newTransform = `translateY(${top}px)`; // Vertical position
          const newHeight = `${height}px`; // Height matching the item
          // Only update state if values have actually changed to prevent unnecessary renders
          if (prevStyle.transform !== newTransform || prevStyle.height !== newHeight || prevStyle.opacity !== 1) {
              return {
                  transform: newTransform,
                  height: newHeight,
                  opacity: 1, // Make indicator visible
              };
          }
          return prevStyle; // No change needed
      });

    } else {
      // If list or item element doesn't exist (e.g., item deselected), hide the indicator
      setStyle(prevStyle => {
           // Only update state if opacity needs changing
           if (prevStyle.opacity !== 0) {
               // Keep previous transform/height but set opacity to 0
               return { ...prevStyle, opacity: 0 };
           }
           return prevStyle; // No change needed
       });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependencies: setStyle is stable, listRef/itemRef types handled internally.

  return {
    dimensions, // Header dimensions
    primaryHeaderRef, // Ref for primary header element
    secondaryHeaderRef, // Ref for secondary header element
    primaryListRef, // Ref for primary list container
    secondaryListRef, // Ref for secondary list container
    adjustHeaderHeights, // Function to manually trigger height adjustment
    primaryIndicatorStyle, // Style state for primary indicator
    secondaryIndicatorStyle, // Style state for secondary indicator
    updateIndicator, // Function to update an indicator's style
    setPrimaryIndicatorStyle, // Direct setter for primary style (used in useDrawerInterface)
    setSecondaryIndicatorStyle, // Direct setter for secondary style (used in useDrawerInterface)
  };
}


/**
 * Manages keyboard navigation (Arrow Keys, Home, End, Enter, Space, Tab simulation) within the drawer lists.
 * @param primaryRefs - Mutable ref object holding refs to primary list item elements.
 * @param secondaryRefs - Mutable ref object holding refs to secondary list item elements.
 * @param options - Object containing state and setters from other hooks.
 */
function useKeyboardNavigation(
  primaryRefs: React.MutableRefObject<ItemRefs>,
  secondaryRefs: React.MutableRefObject<ItemRefs>,
  {
    activePrimaryItem,
    activeSecondaryItem,
    selectPrimaryItem,
    selectSecondaryItem,
    filteredPrimaryItems,
    filteredSecondaryItems,
    isSplitView,
    searchInputRef // Ref for the search input
  }: {
    activePrimaryItem: string | null;
    activeSecondaryItem: string | null;
    selectPrimaryItem: (id: string) => void;
    selectSecondaryItem: (id: string | null) => void;
    filteredPrimaryItems: PrimaryItem[];
    filteredSecondaryItems: SecondaryItem[];
    isSplitView: boolean;
    searchInputRef: React.RefObject<HTMLInputElement | null>;
  }
) {
  // Callback to handle keydown events on list items
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>, context: 'primary' | 'secondary', currentItemId: string) => {
    const isInPrimary = context === 'primary';
    // Get the correct list items and refs based on context (primary or secondary)
    const items = isInPrimary ? filteredPrimaryItems : filteredSecondaryItems;
    const itemRefs = isInPrimary ? primaryRefs.current : secondaryRefs.current;
    // Get the correct selection function
    const selectItem = isInPrimary ? selectPrimaryItem : selectSecondaryItem;

    // Find the index of the currently focused item
    const currentIndex = items.findIndex(item => item.id === currentItemId);
    if (currentIndex === -1) return; // Item not found (shouldn't happen)

    let nextIndex = -1; // Initialize index of the next item to focus

    // Handle different key presses
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault(); // Prevent page scrolling
        // Move focus to the next item if not the last one
        if (currentIndex < items.length - 1) nextIndex = currentIndex + 1;
        break;
      case 'ArrowUp':
        e.preventDefault(); // Prevent page scrolling
        // Move focus to the previous item if not the first one
        if (currentIndex > 0) nextIndex = currentIndex - 1;
        break;
      case 'ArrowRight':
         // If in primary list, split view is active, and secondary items exist, move focus to the first secondary item
        if (isInPrimary && isSplitView && filteredSecondaryItems.length > 0) {
          e.preventDefault();
          const firstSecondaryId = filteredSecondaryItems[0].id;
          // Use setTimeout to ensure focus happens after potential state updates
          setTimeout(() => secondaryRefs.current[firstSecondaryId]?.focus(), 0);
        }
        break;
      case 'ArrowLeft':
        // If in secondary list and split view is active, move focus back to the active primary item
        if (!isInPrimary && isSplitView && activePrimaryItem) {
          e.preventDefault();
          // Use setTimeout for focus update
          setTimeout(() => primaryRefs.current[activePrimaryItem!]?.focus(), 0);
        }
        break;
      case 'Home':
        e.preventDefault();
        // Move focus to the first item
        if (items.length > 0) nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        // Move focus to the last item
        if (items.length > 0) nextIndex = items.length - 1;
        break;
      case 'Enter':
      case ' ': // Treat Spacebar like Enter for selection
        e.preventDefault(); // Prevent button click side-effects or space scrolling
        // Select the currently focused item
        selectItem(currentItemId);
        break;
      // No default needed, other keys are ignored
    }

    // If a nextIndex was determined (by ArrowDown, ArrowUp, Home, End)
    if (nextIndex !== -1) {
      const nextId = items[nextIndex].id;
      // Focus the corresponding DOM element using the ref
      // Use setTimeout to ensure focus update happens reliably
      setTimeout(() => itemRefs[nextId]?.focus(), 0);
    }
  }, [
    activePrimaryItem, // Need this for ArrowLeft navigation
    filteredPrimaryItems, // Need the current list of primary items
    filteredSecondaryItems, // Need the current list of secondary items
    primaryRefs, // Need access to primary item refs
    secondaryRefs, // Need access to secondary item refs
    selectPrimaryItem, // Need the selection function
    selectSecondaryItem, // Need the selection function
    isSplitView, // Need layout mode for ArrowLeft/Right
    // searchInputRef is not directly used here but passed into the hook
  ]);

  return { handleKeyDown }; // Expose the keydown handler
}


/**
 * Combines all drawer interface hooks into a unified interface for the component.
 * Manages state, derives values, and orchestrates interactions between hooks.
 * @param items - The primary data items.
 * @param itemDetails - The details for secondary items.
 * @param initialMode - The starting layout mode ('split' or 'focus').
 */
function useDrawerInterface(
  items: PrimaryItem[],
  itemDetails: ItemDetails,
  initialMode: 'split' | 'focus' = 'split'
) {
  // Refs for list item DOM elements (mutable object holding refs keyed by item ID)
  const primaryRefs = useRef<ItemRefs>({});
  const secondaryRefs = useRef<ItemRefs>({});

  // --- Instantiate individual hooks ---
  const navigation = useDrawerNavigation(items); // Handles active items
  const layout = useDrawerLayout(initialMode); // Handles split/focus mode
  const search = useDrawerSearch(items); // Handles search term and filtering
  // Handles header heights, list refs, indicator styles and updates
  const dimensionsAndIndicator = useDrawerDimensionsAndIndicator();

  // --- Derived State ---
  // Calculate the list of secondary items to display based on active primary and search term
  const filteredSecondaryItems = useMemo(() => {
    if (!navigation.activePrimaryData) return []; // No primary selected, empty list
    // Apply search filtering to the secondary items of the active primary item
    return search.getFilteredSecondaryItems(navigation.secondaryItems);
  }, [
    navigation.activePrimaryData, // Depends on which primary item is active
    navigation.secondaryItems, // Depends on the secondary items of the active primary
    search.getFilteredSecondaryItems // Depends on the filtering function (which depends on search term)
  ]);

  // Determine if the secondary drawer should be shown (Split view, primary active, items exist)
  const showSecondaryDrawer = useMemo(() => {
    return layout.isSplitView && // Must be in split view
           navigation.activePrimaryItem !== null && // A primary item must be selected
           filteredSecondaryItems.length > 0; // There must be secondary items to show (after filtering)
  }, [
    layout.isSplitView,
    navigation.activePrimaryItem,
    filteredSecondaryItems
  ]);

  // --- Instantiate Keyboard Navigation Hook ---
  // Pass refs and relevant state/setters to the keyboard hook
  const keyboard = useKeyboardNavigation(
    primaryRefs,
    secondaryRefs,
    {
      ...navigation, // Pass all navigation state/setters
      filteredPrimaryItems: search.filteredPrimaryItems, // Pass filtered primary list
      filteredSecondaryItems, // Pass derived filtered secondary list
      isSplitView: layout.isSplitView, // Pass layout mode flag
      searchInputRef: search.searchInputRef // Pass search input ref
    }
  );

  // --- Memoized Content ---
  // Get the content details for the currently selected secondary item
  const selectedItemContent = useMemo(() => {
    if (!navigation.activeSecondaryItem) return null; // No secondary selected, no content
    // Look up details in the provided map, return null if not found
    return itemDetails[navigation.activeSecondaryItem] || null;
  }, [
    itemDetails, // Depends on the details map
    navigation.activeSecondaryItem // Depends on the active secondary item ID
  ]);

  // --- Effects ---

  // Effect: Reset secondary selection if the active secondary item is filtered out by search
  useEffect(() => {
    // Check if the currently selected secondary item still exists in the filtered list
    const isSecondaryStillVisible = filteredSecondaryItems.some(
        item => item.id === navigation.activeSecondaryItem
    );
    // If it's no longer visible and an item *is* selected, deselect it
    if (!isSecondaryStillVisible && navigation.activeSecondaryItem !== null) {
      navigation.selectSecondaryItem(null);
    }
  }, [
      search.searchTerm, // Rerun when search term changes
      filteredSecondaryItems, // Rerun when filtered list changes
      navigation.activeSecondaryItem, // Need current selection
      navigation.selectSecondaryItem // Need setter to deselect
  ]);

  // --- Effect to update primary indicator when active primary item changes ---
  useEffect(() => {
    const activeId = navigation.activePrimaryItem;
    // Create a RefObject wrapper for the current DOM element (or null)
    const itemRefToPass: RefObject<HTMLDivElement | null> = {
        current: activeId ? (primaryRefs.current[activeId] ?? null) : null
    };

    // Call the update function from the dimensions hook
    dimensionsAndIndicator.updateIndicator(
        dimensionsAndIndicator.primaryListRef, // Pass the ref to the list container
        itemRefToPass, // Pass the ref object for the active item
        dimensionsAndIndicator.setPrimaryIndicatorStyle // Pass the state setter for this indicator
    );
  }, [
      navigation.activePrimaryItem, // Re-run when active primary item changes
      dimensionsAndIndicator.updateIndicator, // Stable function dependency
      dimensionsAndIndicator.primaryListRef, // Stable ref dependency
      dimensionsAndIndicator.setPrimaryIndicatorStyle, // Stable setter dependency
      search.filteredPrimaryItems, // Re-run if filtered items change (active item might appear/disappear)
      // Avoid depending on primaryRefs.current directly if possible
  ]);

  // --- Effect to update secondary indicator when active secondary item changes ---
  useEffect(() => {
    const activeId = navigation.activeSecondaryItem;
     // Create a RefObject wrapper for the current DOM element (or null)
    const itemRefToPass: RefObject<HTMLDivElement | null> = {
        current: activeId ? (secondaryRefs.current[activeId] ?? null) : null
    };

    // Call the update function from the dimensions hook
    dimensionsAndIndicator.updateIndicator(
        dimensionsAndIndicator.secondaryListRef, // Pass the ref to the list container
        itemRefToPass, // Pass the ref object for the active item
        dimensionsAndIndicator.setSecondaryIndicatorStyle // Pass the state setter for this indicator
    );
  }, [
      navigation.activeSecondaryItem, // Re-run when active secondary item changes
      dimensionsAndIndicator.updateIndicator, // Stable function dependency
      dimensionsAndIndicator.secondaryListRef, // Stable ref dependency
      dimensionsAndIndicator.setSecondaryIndicatorStyle, // Stable setter dependency
      filteredSecondaryItems, // Re-run if filtered items change
      // Avoid depending on secondaryRefs.current directly if possible
  ]);


  // --- Return combined API for the component ---
  // Consolidate state, setters, refs, and derived values into a single object
  return {
    ...navigation,
    ...layout,
    ...search,
    ...dimensionsAndIndicator,
    ...keyboard,
    primaryRefs, // Expose the mutable ref object for item elements
    secondaryRefs, // Expose the mutable ref object for item elements
    filteredSecondaryItems, // Expose derived filtered list
    showSecondaryDrawer, // Expose derived boolean flag
    selectedItemContent // Expose derived content object
  };
}


/**
 * DrawerInterface Component
 * Renders a responsive drawer interface with primary/secondary navigation,
 * search, layout modes (split/focus), animations, and keyboard support.
 */
interface DrawerInterfaceProps {
  primaryItems: PrimaryItem[]; // Data for primary categories and their secondary items
  secondaryItemDetails: ItemDetails; // Map of secondary item IDs to their content details
  initialMode?: 'split' | 'focus'; // Optional initial layout mode
  title?: string; // Optional title for the interface
}

// Default export of the main component
export default function DrawerInterface({
  primaryItems,
  secondaryItemDetails,
  initialMode = 'split', // Default to 'split' view
  title = 'Drawer Interface' // Default title
}: DrawerInterfaceProps) {
  // Use the main hook to get all state, setters, and derived values
  const drawer = useDrawerInterface(primaryItems, secondaryItemDetails, initialMode);

  // Hook to track current screen size for responsive animations/styles
  const useScreenSize = () => {
    const [screenSize, setScreenSize] = useState('lg'); // Default to large
    useEffect(() => {
      const checkSize = () => {
        // Update screen size based on window width breakpoints
        if (window.innerWidth < 768) setScreenSize('base'); // Small
        else if (window.innerWidth < 1024) setScreenSize('md'); // Medium
        else setScreenSize('lg'); // Large
      };
      checkSize(); // Check on initial mount
      window.addEventListener('resize', checkSize); // Re-check on resize
      return () => window.removeEventListener('resize', checkSize); // Cleanup listener
    }, []);
    return screenSize;
  };
  const currentScreenSize = useScreenSize(); // Get current screen size category ('base', 'md', 'lg')

  // Effect to adjust header heights on initial mount (relies on hook internal logic for resize)
  useEffect(() => {
    // Force a repaint on mount to ensure consistent header rendering
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50);
    return () => clearTimeout(timer);
  }, []); // Run only once on mount

  // --- Render Functions ---

  // Renders the list of primary items in the primary drawer
  const renderPrimaryItems = () => {
    // Map over the filtered primary items (respects search term)
    return drawer.filteredPrimaryItems.map((item: PrimaryItem, index: number) => {
      const isActive = item.id === drawer.activePrimaryItem;
      return (
        <motion.div
          key={item.id} // React key
          variants={ANIMATIONS.item} // Framer Motion animation variants
          initial="hidden"
          animate="visible"
          custom={index} // Stagger animation
          whileHover="hover"
          whileTap="tap"
          layout // Animate layout changes (e.g., filtering)
          role="listitem"
        >
          <div
            // Assign ref callback to store/remove the DOM node in the primaryRefs object
            ref={(el: HTMLDivElement | null) => {
              if (el) drawer.primaryRefs.current[item.id] = el;
              else delete drawer.primaryRefs.current[item.id];
            }}
            // Apply base item style and active style conditionally
            className={cx(
              itemStyle,
              isActive && activeItemStyle
            )}
            onClick={() => drawer.selectPrimaryItem(item.id)} // Handle click selection
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => drawer.handleKeyDown(e, 'primary', item.id)} // Handle keyboard interaction
            tabIndex={0} // Make focusable
            role="button" // Semantically a button
            aria-pressed={isActive} // Indicate selection state for accessibility
            aria-label={`Category: ${item.name}`} // Accessibility label
          >
            {drawer.highlightText(item.name)} {/* Display name with search highlighting */}
          </div>
        </motion.div>
      );
    });
  };

  // Renders the list of secondary items in the secondary drawer (Split View)
  const renderSecondaryItems = () => {
     // Map over the filtered secondary items
     return drawer.filteredSecondaryItems.map((item: SecondaryItem, index: number) => {
      const isActive = item.id === drawer.activeSecondaryItem;
      return (
        <motion.div
          key={item.id}
          variants={ANIMATIONS.item}
          initial="hidden"
          animate="visible"
          custom={index}
          whileHover="hover"
          whileTap="tap"
          layout
          role="listitem"
        >
          <div
            // Assign ref callback for secondary items
            ref={(el: HTMLDivElement | null) => {
              if (el) drawer.secondaryRefs.current[item.id] = el;
              else delete drawer.secondaryRefs.current[item.id];
            }}
            // Apply base and active styles
            className={cx(
              itemStyle,
              isActive && activeItemStyle
            )}
            onClick={() => drawer.selectSecondaryItem(item.id)} // Handle click
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => drawer.handleKeyDown(e, 'secondary', item.id)} // Handle keyboard
            tabIndex={0} // Focusable
            role="button" // Semantics
            aria-pressed={isActive} // Accessibility state
            aria-label={`Item: ${item.name}`} // Accessibility label
          >
            {drawer.highlightText(item.name)} {/* Display name with highlighting */}
          </div>
        </motion.div>
      );
    });
  };

  // Renders the list of secondary items within the main content area (Focus Mode)
  const renderSecondaryItemsInContent = () => {
    return (
      <motion.div
        // Key ensures re-animation if the primary item (and thus the list) changes
        key={`focus-list-${drawer.activePrimaryItem}`}
        variants={ANIMATIONS.content} // Use content animation
        initial="hidden"
        animate="visible"
        exit="exit"
        layout
      >
        {/* Title showing the current primary category */}
        <h2 className={contentTitleStyle}>
          {drawer.activePrimaryData?.name || 'Items'}
        </h2>
        {/* Check if there are items to display */}
        {drawer.filteredSecondaryItems.length > 0 ? (
          // Render the list if items exist
          <div role="list" aria-label={`Items in ${drawer.activePrimaryData?.name || 'selected category'}`}>
            {drawer.filteredSecondaryItems.map((item: SecondaryItem, index: number) => (
              <motion.div
                key={item.id}
                variants={ANIMATIONS.item}
                initial="hidden"
                animate="visible"
                custom={index}
                whileHover="hover"
                whileTap="tap"
                layout
                role="listitem"
              >
                <div
                  // Ref is not strictly needed here as focus is managed differently in this view, but kept for consistency
                  ref={(el: HTMLDivElement | null) => {
                     if (el) drawer.secondaryRefs.current[item.id] = el;
                     else delete drawer.secondaryRefs.current[item.id];
                  }}
                  className={itemStyle} // Use base item style, no active style visually needed here
                  onClick={() => drawer.selectSecondaryItem(item.id)} // Select on click
                  onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                      // Select on Enter or Space
                      if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          drawer.selectSecondaryItem(item.id);
                      }
                      // Note: Arrow key navigation is not implemented for this specific list view
                  }}
                  tabIndex={0} // Focusable
                  role="button"
                  aria-label={`Select ${item.name}`} // Label indicates action
                >
                  {drawer.highlightText(item.name)} {/* Display name with highlighting */}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // Show placeholder if no items are found (e.g., due to search)
          <div className={placeholderStyle}>
            <p>No items found {drawer.searchTerm ? `matching "${drawer.searchTerm}"` : ''} in this category.</p>
          </div>
        )}
      </motion.div>
    );
  };

  // Renders the main content display (placeholder or item details)
  const renderContent = () => {
    // Show placeholder if no secondary item is selected
    if (!drawer.activeSecondaryItem) {
      return (
        <motion.div
          key="placeholder-select" // Key for AnimatePresence
          className={placeholderStyle}
          variants={ANIMATIONS.content}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <h2>Select an Item</h2>
          <p>Choose an item from the lists to view its details.</p>
        </motion.div>
      );
    }
    // Get content details for the selected item
    const content = drawer.selectedItemContent;
    if (content) {
      // Render content if found
      return (
        <motion.div
          // Key ensures re-animation when content changes
          key={`content-${drawer.activeSecondaryItem}`}
          variants={ANIMATIONS.content}
          initial="hidden"
          animate="visible"
          exit="exit"
          layout
        >
          {/* *** ADDED: Back Button for Focus Mode *** */}
          <AnimatePresence>
            {drawer.isFocusView && drawer.activeSecondaryItem && (
              <motion.button
                key="focus-back-button" // Add key for AnimatePresence
                className={cx(buttonStyle, css({ marginBottom: '1rem', display: 'inline-flex', alignItems: 'center' }))} // Combine styles, add margin
                onClick={() => drawer.selectSecondaryItem(null)} // Action: Deselect secondary item
                variants={ANIMATIONS.backButton} // Use back button animations
                initial="hidden"
                animate="visible"
                exit="exit"
                layout // Animate layout shifts
              >
                {/* Simple SVG Arrow */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.25rem' }}>
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                 Back
              </motion.button>
            )}
          </AnimatePresence>

          {/* Existing content title */}
          <h2 className={contentTitleStyle}>{content.title}</h2>
          {/* Split content by newlines and render each as a paragraph */}
          {content.content.split('\n').map((paragraph: string, index: number) => (
             <p key={index} className={contentParagraphStyle}>
               {/* Use non-breaking space for empty lines to preserve spacing */}
               {paragraph.trim() === '' ? '\u00A0' : paragraph}
             </p>
          ))}
        </motion.div>
      );
    } else {
      // Render placeholder if content details are missing for the selected item
      return (
        <motion.div
          key={`placeholder-missing-${drawer.activeSecondaryItem}`}
          className={placeholderStyle}
          variants={ANIMATIONS.content}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
           {/* Display formatted item name */}
           <h2>
             {(drawer.activeSecondaryItem || 'Item')
                .replace(/_/g, ' ') // Format name
                .replace(/\b\w/g, l => l.toUpperCase())}
           </h2>
          <p>Details are not available for this item.</p>
        </motion.div>
      );
    }
  };

  // --- Main Component JSX Structure ---
  return (
    <div className={containerStyle}>
      {/* Main Application Header */}
      <header className={mainHeaderStyle}>{title}</header>

      {/* Main Content Container (holds drawers and content panel) */}
      <div className={contentContainerStyle}>

        {/* Primary Drawer (Categories) */}
        <motion.div
          className={primaryDrawerStyle}
          variants={ANIMATIONS.drawer}
          initial="hidden"
          animate="visible"
          layout // Animate width changes
          role="navigation"
          aria-label="Primary Categories Navigation"
        >
          {/* Primary Drawer Header */}
          <h2
            ref={drawer.primaryHeaderRef} // Ref for height measurement
            className={headerStyle}
            id="primary-drawer-header" // For aria-labelledby
          >
            Categories
          </h2>
          {/* Primary Items List Container */}
          <div
            ref={drawer.primaryListRef} // Ref for the list container itself
            className={listStyle}
            // Updated to account for fixed header height
            style={{ height: 'calc(100% - 60px)' }}
            role="list"
            aria-labelledby="primary-drawer-header"
          >
            {/* Moving Indicator Line (visual decoration) */}
            <div
              className={indicatorLineStyle}
              style={drawer.primaryIndicatorStyle} // Apply dynamic styles for position/visibility
              aria-hidden="true"
            />
            {/* Render the list items */}
            {renderPrimaryItems()}
          </div>
        </motion.div>

        {/* Right Panel (contains App Header and Content Area) */}
        <div className={rightPanelStyle}>
          {/* App Header within Right Panel (View Options + Search) */}
          <div className={appHeaderStyle}>
            {/* View Mode Toggle Buttons */}
            <div className={viewOptionsStyle} role="tablist" aria-label="Layout View Options">
              <button
                className={cx(buttonStyle, drawer.isSplitView && activeButtonStyle)}
                onClick={() => drawer.toggleLayoutMode('split')}
                aria-selected={drawer.isSplitView}
                role="tab"
                aria-controls="content-area"
              >
                Split
              </button>
              <button
                className={cx(buttonStyle, drawer.isFocusView && activeButtonStyle)}
                onClick={() => drawer.toggleLayoutMode('focus')}
                aria-selected={drawer.isFocusView}
                role="tab"
                aria-controls="content-area"
              >
                Focus
              </button>
            </div>
            {/* Search Input */}
            <div>
              <input
                ref={drawer.searchInputRef} // Ref for focusing
                type="search"
                placeholder="Search... (Ctrl+F)"
                className={searchInputStyle}
                value={drawer.searchTerm}
                onChange={(e) => drawer.setSearchTerm(e.target.value)}
                aria-label="Search categories and items"
              />
            </div>
          </div>

          {/* Content Area (holds Secondary Drawer and Main Content Display) */}
          <div className={contentAreaStyle} id="content-area" role="tabpanel" aria-label="Content Display Area">

            {/* Secondary Drawer (Items - Conditionally Rendered) */}
            <AnimatePresence> {/* Needed for exit animations */}
              {drawer.showSecondaryDrawer && ( // Render only when conditions met
                <motion.div
                  key="secondary-drawer" // Key for AnimatePresence
                  className={secondaryDrawerStyle}
                  variants={ANIMATIONS.secondaryDrawer}
                  custom={currentScreenSize} // Pass screen size for responsive animation
                  initial="hidden"
                  animate="visible"
                  exit="exit" // Exit animation
                  layout // Animate width changes
                  role="navigation"
                  aria-label="Secondary Items Navigation"
                >
                  {/* Secondary Drawer Header */}
                  <h2
                    ref={drawer.secondaryHeaderRef} // Ref for height measurement
                    className={headerStyle}
                    id="secondary-drawer-header" // For aria-labelledby
                  >
                    {/* Display active primary category name */}
                    {drawer.activePrimaryData?.name || 'Items'}
                  </h2>
                  {/* Secondary Items List Container */}
                  <div
                    ref={drawer.secondaryListRef} // Ref for the list container
                    className={listStyle}
                    // Updated to account for fixed header height
                    style={{ height: 'calc(100% - 60px)' }}
                    role="list"
                    aria-labelledby="secondary-drawer-header"
                  >
                     {/* Moving Indicator Line */}
                    <div
                      className={indicatorLineStyle}
                      style={drawer.secondaryIndicatorStyle} // Apply dynamic styles
                      aria-hidden="true"
                    />
                    {/* Render list items */}
                    {renderSecondaryItems()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content Display Area */}
            <div className={contentDisplayStyle}>
              {/* Scrollable body for the content */}
              <div className={contentBodyStyle}>
                {/* AnimatePresence controls transitions between content states */}
                <AnimatePresence mode="wait"> {/* 'wait' ensures exit animation finishes first */}
                  {
                    // Conditional rendering based on view mode and selection state
                    drawer.isFocusView && !drawer.activeSecondaryItem && drawer.activePrimaryItem ? (
                      // Focus Mode: Show secondary list in content area if primary is selected but secondary is not
                      renderSecondaryItemsInContent()
                    ) : (
                      // Split Mode OR Focus Mode with secondary selected: Show main content (placeholder or details)
                      renderContent()
                    )
                  }
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}