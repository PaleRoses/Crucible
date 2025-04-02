'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';

// ==========================================================
// COMPONENT DOCUMENTATION
// ==========================================================

/**
 * LeftDocSideBar Component
 * a
 * A fixed-position documentation sidebar that displays navigation links and pushes
 * content to the right.
 * 
 * @param {Object} props - Component props
 * @param {SidebarItem[]} [props.items=[]] - Items configuration that defines the sidebar structure
 * @param {string} [props.width='280px'] - Width of the sidebar
 * @param {string} [props.topOffset='60px'] - Fixed position from the top (to accommodate navbar)
 * @param {string} [props.height='calc(100vh - 60px)'] - Height of the sidebar (CSS value, usually '100vh' minus navbar height)
 * @param {boolean} [props.pushContent=true] - Whether the sidebar should push content or overlay
 * @param {string} [props.contentSelector='main'] - CSS selector for the main content element that should be pushed
 * @param {number} [props.zIndex=10] - Z-index for the sidebar
 * @param {boolean} [props.showShadow=true] - Whether to show a shadow on the sidebar (default is true)
 * @param {boolean} [props.showBorder=true] - Whether to show a border on the right side of the sidebar
 * @param {string} [props.leftPadding='1.25rem'] - Left padding for the sidebar content
 * @param {string} [props.rightPadding='1.25rem'] - Right padding for the sidebar content
 * @param {string} [props.scrollbarMargin='0.5rem'] - Space between scrollbar and right border
 * @param {string} [props.borderWidth='1px'] - Width of the right border
 * @param {string} [props.borderStyle='solid'] - Style of the right border
 * @param {string} [props.className=''] - Additional CSS class for the sidebar container
 * @param {string} [props.ariaLabel='Documentation Navigation'] - ARIA label for the sidebar navigation
 * @param {React.ReactNode} [props.header=undefined] - Custom header component to display at the top of the sidebar
 * @param {React.ReactNode} [props.footer=undefined] - Custom footer component to display at the bottom of the sidebar
 * @param {Function} [props.isItemActive=undefined] - Function to determine if a sidebar item is currently active
 * @param {Record<string, React.ComponentType>} [props.iconMapping={}] - Icon mapping for string-based icon references
 * @param {boolean} [props.animate=true] - Whether to animate transitions
 * @param {number} [props.transitionDuration=300] - Transition duration for animations (in ms)
 * @param {React.CSSProperties} [props.sidebarStyle={}] - Custom modifier styles for the sidebar
 * @param {React.CSSProperties} [props.itemStyle={}] - Custom modifier styles for sidebar items
 * @param {React.CSSProperties} [props.sectionStyle={}] - Custom modifier styles for section headers
 * @param {boolean} [props.expandAllByDefault=true] - Whether all sections should be expanded by default
 * @param {string} [props.itemFontWeight='normal'] - Font weight for sidebar items
 * @param {string} [props.sectionFontWeight='300'] - Font weight for section headers
 * @param {string} [props.activeItemFontWeight='500'] - Font weight for active sidebar items
 * @param {string} [props.hoverColor='var(--gold)'] - Text color on hover
 * @param {string} [props.hoverBgColor='var(--surface-light)'] - Background color on hover
 */

/**
 * GLOBAL CONFIGURATION VARIABLES
 * These variables control the default appearance and behavior of the sidebar.
 * Modify these values to globally customize all sidebar instances in your application.
 */
const SIDEBAR_CONFIG = {
  // Dimensions
  WIDTH: '210px',                 // Default width of the sidebar
  TOP_OFFSET: '50px',             // Default top position (match your navbar height)
  HEIGHT: 'calc(100vh - 60px)',   // Default height (full viewport height minus navbar)
  
  // Padding
  LEFT_PADDING: '1.25rem',        // Default left padding
  RIGHT_PADDING: '1.25rem',       // Default right padding
  SCROLLBAR_MARGIN: '0.5rem',     // Space between scrollbar and right border
  CONTENT_TOP_PADDING: '6rem',    // Default top padding for content area
  CONTENT_BOTTOM_PADDING: '1rem', // Default bottom padding for content area
  ITEM_SPACING: '0.0rem',         // Default spacing between items
  
  // Border
  BORDER_WIDTH: '1px',            // Default border width
  BORDER_STYLE: 'solid',          // Default border style
  BORDER_COLOR: 'var(--gold)',    // Border color
  
  // Colors and styling
  BG_COLOR: 'var(--color-background)',      // Background color
  TEXT_COLOR: 'var(--color-text-secondary)', // Regular text color
  ACTIVE_TEXT: 'var(--color-text)',         // Active item text color (brighter)
  ACTIVE_BG: 'var(--surface-light)',        // Active item background
  SECTION_BG: 'var(--surface-dark)',        // Section header background
  SECTION_COLOR: 'var(--gold)',             // Section header text color
  HOVER_TEXT_COLOR: 'var(--gold)',          // Text color on hover
  HOVER_BG_COLOR: 'var(--surface-light)',   // Background color on hover
  
  // Font weights
  ITEM_FONT_WEIGHT: 'normal',               // Default font weight for items
  SECTION_FONT_WEIGHT: '300',               // Default font weight for sections
  ACTIVE_ITEM_FONT_WEIGHT: '500',           // Font weight for active items
  
  // Spacing and typography
  ITEM_PADDING_Y: '0.25rem',                // Vertical padding for items
  SECTION_PADDING_Y: '0.6rem',              // Vertical padding for sections
  ITEM_FONT_SIZE: '0.9rem',                 // Font size for regular items
  SECTION_FONT_SIZE: '1rem',                // Font size for section headers
  
  // Font family - Now using the CSS variable for dynamic adaptation
  FONT_FAMILY: 'var(--font-heading)',       // Using the font variable from the stylesheet
  
  // Shadow
  SHADOW: '#7d6942',                        // Subtle shadow on the right edge
  
  // Animation
  TRANSITION_DURATION: 50,                  // Duration of animations in ms
  
  // Miscellaneous
  Z_INDEX: 10,                              // Default z-index
  
  // Initial rendering
  INITIAL_OPACITY: 0,                       // Initial opacity before hydration
  HYDRATED_OPACITY: 1                       // Opacity after hydration
};

// ==========================================================
// TYPES & INTERFACES
// ==========================================================

/**
 * Interface for icon component props
 */
interface IconComponentProps {
  className?: string;
  size?: number | string;
  color?: string;
  [key: string]: unknown;
}

/**
 * Item interface for sidebar sections and items
 */
export interface SidebarItem {
  /** Unique identifier for the item */
  id: string;
  /** Display text for the menu item */
  label: string;
  /** URL or route to navigate to when clicked (optional for section headers) */
  href?: string;
  /** Icon component or string identifier for predefined icons */
  icon?: React.ReactNode | string;
  /** Whether this item is a section header that can be collapsed */
  isSection?: boolean;
  /** Whether the section is initially expanded (only applicable if isSection=true) */
  defaultExpanded?: boolean;
  /** Child items for nested sections */
  items?: SidebarItem[];
  /** Additional metadata for the item */
  meta?: Record<string, unknown>;
}

/**
 * Props for the LeftDocSideBar component
 */
export interface LeftDocSideBarProps {
  items?: SidebarItem[];
  width?: string;
  topOffset?: string;
  height?: string;
  pushContent?: boolean;
  contentSelector?: string;
  zIndex?: number;
  showShadow?: boolean;
  showBorder?: boolean;
  leftPadding?: string;
  rightPadding?: string;
  scrollbarMargin?: string;
  borderWidth?: string;
  borderStyle?: string;
  className?: string;
  ariaLabel?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  isItemActive?: (item: SidebarItem) => boolean;
  iconMapping?: Record<string, React.ComponentType<IconComponentProps>>;
  animate?: boolean;
  transitionDuration?: number;
  sidebarStyle?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  sectionStyle?: React.CSSProperties;
  expandAllByDefault?: boolean;
  contentTopPadding?: string;
  contentBottomPadding?: string;
  itemSpacing?: string;
  itemFontWeight?: string;
  sectionFontWeight?: string;
  activeItemFontWeight?: string;
  hoverColor?: string;
  hoverBgColor?: string;
}

// ==========================================================
// SUB-COMPONENTS
// ==========================================================

/**
 * SidebarSection Component
 * Renders a section header with its child items
 */
const SidebarSection: React.FC<{
  item: SidebarItem;
  level: number;
  iconMapping: Record<string, React.ComponentType<IconComponentProps>>;
  isActive?: (item: SidebarItem) => boolean;
  itemStyle?: React.CSSProperties;
  sectionStyle?: React.CSSProperties;
  animate?: boolean;
  expandAllByDefault?: boolean;
  leftPadding: string;
  rightPadding: string;
  itemSpacing: string;
  itemFontWeight: string;
  sectionFontWeight: string;
  activeItemFontWeight: string;
  hoverColor: string;
  hoverBgColor: string;
}> = React.memo(({
  item,
  level,
  iconMapping,
  isActive,
  itemStyle,
  sectionStyle,
  animate = true,
  expandAllByDefault = true,
  leftPadding,
  rightPadding,
  itemSpacing,
  itemFontWeight,
  sectionFontWeight,
  activeItemFontWeight,
  hoverColor,
  hoverBgColor,
}) => {
  const sectionId = `sidebar-section-${item.id}`;
  const contentId = `sidebar-section-content-${item.id}`;
  
  // Base styles
  const styles = {
    section: {
      display: 'flex',
      flexDirection: 'column' as const,
      width: '100%',
      marginBottom: itemSpacing,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      padding: `${SIDEBAR_CONFIG.SECTION_PADDING_Y} ${leftPadding} ${SIDEBAR_CONFIG.SECTION_PADDING_Y} ${rightPadding}`,
      fontWeight: sectionFontWeight,
      fontSize: SIDEBAR_CONFIG.SECTION_FONT_SIZE,
      color: SIDEBAR_CONFIG.SECTION_COLOR,
      fontFamily: SIDEBAR_CONFIG.FONT_FAMILY, // Using the font variable
      letterSpacing: '0.05em', // Adding letter spacing for the haboro font
      // Removed background color for section headers
      transition: 'color 0.2s ease',
      cursor: 'default',
      ...sectionStyle
    },
    content: {
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
    }
  };
  
  // Memoize the rendered child items
  const childItems = useMemo(() => {
    return item.items?.map((subItem) => (
      <SidebarItem
        key={subItem.id}
        item={subItem}
        level={level + 1}
        iconMapping={iconMapping}
        isActive={isActive}
        itemStyle={itemStyle}
        sectionStyle={sectionStyle}
        animate={animate}
        expandAllByDefault={expandAllByDefault}
        leftPadding={leftPadding}
        rightPadding={rightPadding}
        itemSpacing={itemSpacing}
        itemFontWeight={itemFontWeight}
        sectionFontWeight={sectionFontWeight}
        activeItemFontWeight={activeItemFontWeight}
        hoverColor={hoverColor}
        hoverBgColor={hoverBgColor}
      />
    ));
  }, [item.items, level, iconMapping, isActive, itemStyle, sectionStyle, animate, expandAllByDefault, leftPadding, rightPadding, itemSpacing, itemFontWeight, sectionFontWeight, activeItemFontWeight, hoverColor, hoverBgColor]);
  
  return (
    <div style={styles.section}>
      {/* Section Header */}
      <div
        id={sectionId}
        style={styles.header}
      >
        <span>{item.label}</span>
      </div>
      
      {/* Section Content */}
      <div 
        id={contentId}
        style={styles.content}
      >
        {childItems}
      </div>
    </div>
  );
});

SidebarSection.displayName = 'SidebarSection';

/**
 * SidebarItem Component
 * Renders a single link item or section in the sidebar
 */
const SidebarItem: React.FC<{
  item: SidebarItem;
  level: number;
  iconMapping: Record<string, React.ComponentType<IconComponentProps>>;
  isActive?: (item: SidebarItem) => boolean;
  itemStyle?: React.CSSProperties;
  sectionStyle?: React.CSSProperties;
  animate?: boolean;
  expandAllByDefault?: boolean;
  leftPadding: string;
  rightPadding: string;
  itemSpacing: string;
  itemFontWeight: string;
  sectionFontWeight: string;
  activeItemFontWeight: string;
  hoverColor: string;
  hoverBgColor: string;
}> = React.memo(({
  item,
  level,
  iconMapping,
  isActive,
  itemStyle,
  sectionStyle,
  animate = true,
  expandAllByDefault = true,
  leftPadding,
  rightPadding,
  itemSpacing,
  itemFontWeight,
  sectionFontWeight,
  activeItemFontWeight,
  hoverColor,
  hoverBgColor
}) => {
  // ALL hooks must be declared at the top level before any conditional returns
  const [isHovered, setIsHovered] = useState(false);
  const itemId = `sidebar-item-${item.id}`;
  const active = isActive ? isActive(item) : false;
  
  // Use URL pathname to determine if this item is active - moved before conditional return
  useEffect(() => {
    // Only execute the DOM manipulation if this is not a section item
    if (!(item.isSection && item.items)) {
      if (typeof window !== 'undefined' && item.href) {
        // If we're in the browser, check if the current path matches the item's href
        const isCurrentPath = window.location.pathname === item.href || 
                             window.location.pathname.startsWith(item.href + '/');
        
        // If isItemActive is not provided and this is the current path, mark as active
        if (!isActive && isCurrentPath && item.href !== '/') {
          // Add a class to the item element
          const itemElement = document.getElementById(itemId);
          if (itemElement) {
            itemElement.setAttribute('aria-current', 'page');
            itemElement.style.color = SIDEBAR_CONFIG.ACTIVE_TEXT;
            itemElement.style.backgroundColor = SIDEBAR_CONFIG.ACTIVE_BG;
            itemElement.style.fontWeight = activeItemFontWeight;
          }
        }
      }
    }
  }, [item.href, itemId, isActive, activeItemFontWeight, item.isSection, item.items]);
  
  // If this is a section, render the section component - after all hooks are declared
  if (item.isSection && item.items) {
    return (
      <SidebarSection
        item={item}
        level={level}
        iconMapping={iconMapping}
        isActive={isActive}
        itemStyle={itemStyle}
        sectionStyle={sectionStyle}
        animate={animate}
        expandAllByDefault={expandAllByDefault}
        leftPadding={leftPadding}
        rightPadding={rightPadding}
        itemSpacing={itemSpacing}
        itemFontWeight={itemFontWeight}
        sectionFontWeight={sectionFontWeight}
        activeItemFontWeight={activeItemFontWeight}
        hoverColor={hoverColor}
        hoverBgColor={hoverBgColor}
      />
    );
  }
  
  // Item styles for regular items
  const styles = {
    item: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: `${SIDEBAR_CONFIG.ITEM_PADDING_Y} ${leftPadding} ${SIDEBAR_CONFIG.ITEM_PADDING_Y} ${rightPadding}`,
      fontSize: SIDEBAR_CONFIG.ITEM_FONT_SIZE,
      fontWeight: active ? activeItemFontWeight : itemFontWeight,
      color: isHovered ? hoverColor : (active ? SIDEBAR_CONFIG.ACTIVE_TEXT : SIDEBAR_CONFIG.TEXT_COLOR),
      fontFamily: SIDEBAR_CONFIG.FONT_FAMILY, // Using the font variable
      letterSpacing: '0.03em', // Slight letter spacing for the haboro font
      transition: 'all 0.2s ease',
      textDecoration: 'none',
      backgroundColor: isHovered ? hoverBgColor : (active ? SIDEBAR_CONFIG.ACTIVE_BG : 'transparent'),
      cursor: 'pointer',
      marginBottom: itemSpacing,
      ...itemStyle
    },
    label: {
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }
  };
  
  return (
    <a
      id={itemId}
      href={item.href}
      style={styles.item}
      aria-current={active ? 'page' : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span style={styles.label}>{item.label}</span>
    </a>
  );
});

SidebarItem.displayName = 'SidebarItem';

// ==========================================================
// MAIN COMPONENT
// ==========================================================

/**
 * LeftDocSideBar Component Implementation 
 */
const LeftDocSideBar: React.FC<LeftDocSideBarProps> = ({
  // Structure and content
  items = [],
  
  // Dimensions and layout
  width = SIDEBAR_CONFIG.WIDTH,
  height = SIDEBAR_CONFIG.HEIGHT,
  topOffset = SIDEBAR_CONFIG.TOP_OFFSET,
  
  // Behavior
  pushContent = true,
  contentSelector = 'main',
  
  // Visual styling
  showShadow = true, // Default changed to true for the requested shadow effect
  showBorder = true,
  borderWidth = SIDEBAR_CONFIG.BORDER_WIDTH,
  borderStyle = SIDEBAR_CONFIG.BORDER_STYLE,
  leftPadding = SIDEBAR_CONFIG.LEFT_PADDING,
  rightPadding = SIDEBAR_CONFIG.RIGHT_PADDING,
  scrollbarMargin = SIDEBAR_CONFIG.SCROLLBAR_MARGIN,
  zIndex = SIDEBAR_CONFIG.Z_INDEX,
  
  // Spacing parameters
  contentTopPadding = SIDEBAR_CONFIG.CONTENT_TOP_PADDING,
  contentBottomPadding = SIDEBAR_CONFIG.CONTENT_BOTTOM_PADDING,
  itemSpacing = SIDEBAR_CONFIG.ITEM_SPACING,
  
  // Font weights
  itemFontWeight = SIDEBAR_CONFIG.ITEM_FONT_WEIGHT,
  sectionFontWeight = SIDEBAR_CONFIG.SECTION_FONT_WEIGHT,
  activeItemFontWeight = SIDEBAR_CONFIG.ACTIVE_ITEM_FONT_WEIGHT,
  
  // Hover colors
  hoverColor = SIDEBAR_CONFIG.HOVER_TEXT_COLOR,
  hoverBgColor = SIDEBAR_CONFIG.HOVER_BG_COLOR,
  
  // Customization
  className = '',
  ariaLabel = 'Documentation Navigation',
  header,
  footer,
  sidebarStyle,
  itemStyle,
  sectionStyle,
  
  // Functionality
  isItemActive,
  
  // Icons and text
  iconMapping = {},
  
  // Animation
  animate = true,
  transitionDuration = SIDEBAR_CONFIG.TRANSITION_DURATION,
  
  // Expansion behavior
  expandAllByDefault = true,
}) => {
  // State for tracking hydration status to prevent FOUC
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Refs for DOM elements
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLElement | null>(null);
  
  // State for current path
  const [currentPath, setCurrentPath] = useState<string>('');
  
  // Get current path on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);
  
  // Enhanced isItemActive function that integrates with path checking
  const enhancedIsItemActive = useMemo(() => {
    return (item: SidebarItem) => {
      // If a custom isItemActive function is provided, use it
      if (isItemActive) {
        return isItemActive(item);
      }
      
      // Default path-based active detection
      if (item.href && currentPath) {
        // Exact match
        if (item.href === currentPath) {
          return true;
        }
        
        // Child path (make sure we don't match "/" for all paths)
        if (item.href !== '/' && currentPath.startsWith(item.href + '/')) {
          return true;
        }
      }
      
      return false;
    };
  }, [isItemActive, currentPath]);
  
  // Merging iconMapping - memoized to prevent unnecessary recalculations
  const mergedIconMapping = useMemo(() => {
    return { ...iconMapping };
  }, [iconMapping]);
  
  // Mark component as hydrated after initial render
  useEffect(() => {
    // Use requestAnimationFrame to ensure the DOM has been painted
    // This helps prevent FOUC by delaying the state update until after the first paint
    const raf = requestAnimationFrame(() => {
      setIsHydrated(true);
    });
    
    return () => {
      cancelAnimationFrame(raf);
    };
  }, []);
  
  // Setup content pushing - only runs once after hydration
  useEffect(() => {
    // Skip if not pushing content or not yet hydrated
    if (!pushContent || !isHydrated) return;
    
    // Find content element using a ref to avoid re-renders
    if (!contentRef.current) {
      contentRef.current = document.querySelector(contentSelector);
    }
    
    const content = contentRef.current;
    if (!content) return;
    
    // Pre-apply styles to prevent FOUC
    // Set initial style immediately before any transitions
    content.style.marginLeft = width;
    
    // After initial paint, add transition for future changes
    const timer = setTimeout(() => {
      content.style.transition = `margin-left ${transitionDuration}ms ease`;
    }, 50);
    
    // Clean up
    return () => {
      clearTimeout(timer);
      if (content) {
        content.style.marginLeft = '';
        content.style.transition = '';
      }
    };
  }, [pushContent, contentSelector, width, transitionDuration, isHydrated]);
  
  // Memoize base styles to prevent recreation on every render
  const styles = useMemo(() => ({
    container: {
      position: 'fixed' as const,
      top: topOffset,
      left: 0,
      height,
      width,
      zIndex,
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
      backgroundColor: SIDEBAR_CONFIG.BG_COLOR,
      boxShadow: showShadow ? `0 0 15px ${SIDEBAR_CONFIG.SHADOW}` : 'none',
      borderRight: showBorder ? `${borderWidth} ${borderStyle} ${SIDEBAR_CONFIG.BORDER_COLOR}` : 'none',
      // Initially render with reduced opacity, then fade in after hydration
      opacity: isHydrated ? SIDEBAR_CONFIG.HYDRATED_OPACITY : SIDEBAR_CONFIG.INITIAL_OPACITY,
      transition: `opacity ${transitionDuration}ms ease`,
      ...sidebarStyle
    },
    content: {
      display: 'flex',
      flexDirection: 'column' as const,
      overflowY: 'auto' as const,
      overflowX: 'hidden' as const,
      paddingTop: contentTopPadding,
      paddingBottom: contentBottomPadding,
      paddingRight: scrollbarMargin, // Add space between scrollbar and right border
      flex: 1,
      scrollbarWidth: 'thin' as const,
      scrollbarColor: 'var(--gold-dark) transparent',
      fontFamily: SIDEBAR_CONFIG.FONT_FAMILY, // Base font-family for all content
    }
  }), [
    topOffset, height, width, zIndex, 
    showShadow, showBorder, borderWidth, borderStyle,
    isHydrated, transitionDuration, sidebarStyle, scrollbarMargin,
    contentTopPadding, contentBottomPadding
  ]);
  
  // Memoize the rendered items to prevent unnecessary rerenders
  const renderedItems = useMemo(() => {
    return items.map((item) => (
      <SidebarItem
        key={item.id}
        item={item}
        level={0}
        iconMapping={mergedIconMapping}
        isActive={enhancedIsItemActive}
        itemStyle={itemStyle}
        sectionStyle={sectionStyle}
        animate={animate}
        expandAllByDefault={expandAllByDefault}
        leftPadding={leftPadding}
        rightPadding={rightPadding}
        itemSpacing={itemSpacing}
        itemFontWeight={itemFontWeight}
        sectionFontWeight={sectionFontWeight}
        activeItemFontWeight={activeItemFontWeight}
        hoverColor={hoverColor}
        hoverBgColor={hoverBgColor}
      />
    ));
  }, [
    items, mergedIconMapping, enhancedIsItemActive, 
    itemStyle, sectionStyle, animate, expandAllByDefault,
    leftPadding, rightPadding, itemSpacing,
    itemFontWeight, sectionFontWeight, activeItemFontWeight,
    hoverColor, hoverBgColor
  ]);
  
  return (
    <div
      ref={sidebarRef}
      style={styles.container}
      className={className}
      role="navigation"
      aria-label={ariaLabel}
    >
      {/* Header Section - optional */}
      {header && <div style={{ fontFamily: SIDEBAR_CONFIG.FONT_FAMILY }}>{header}</div>}
      
      {/* Content Section - Scrollable */}
      <div style={styles.content} data-hydrated={isHydrated}>
        {renderedItems}
      </div>
      
      {/* Footer Section - optional */}
      {footer && <div style={{ fontFamily: SIDEBAR_CONFIG.FONT_FAMILY }}>{footer}</div>}
    </div>
  );
};

export default React.memo(LeftDocSideBar);