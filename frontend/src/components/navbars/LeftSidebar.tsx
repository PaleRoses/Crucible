import React, { useState, useEffect, useRef } from 'react';
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
import { css } from '../../../styled-system/css';

// Define navigation item depth as string to match recipe expectations
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

interface LeftSidebarProps {
  // Appearance - match available variants from cosmicSidebar
  variant?: 'standard' | 'elevated' | 'minimal' | 'cosmic';
  size?: string;
  
  // Content
  title?: string;
  logo?: React.ReactNode;
  navigationItems: NavigationItem[];
  footerContent?: React.ReactNode;
  
  // Behavior
  initiallyExpanded?: boolean;
  onToggle?: (isExpanded: boolean) => void;
  
  // Content pushing
  pushContent?: boolean;
  contentSelector?: string;
  expandedWidth?: string;
  collapsedWidth?: string;
  transitionDuration?: number;

  // New props
  headerTopOffset?: string;
  compact?: boolean;
  
  // Custom classes
  className?: string;
}

/**
 * LeftSidebar Component
 * 
 * A responsive sidebar that:
 * - Uses the new hamburger-style toggle button that transforms to an X
 * - Supports nested navigation groups
 * - Transforms into a top navbar on mobile
 * - Pushes content when expanded on desktop
 */
const LeftSidebar: React.FC<LeftSidebarProps> = ({
  // Appearance
  variant = 'standard',
  size = 'md',
  
  // Content
  title = 'Application',
  logo = null,
  navigationItems = [],
  footerContent = null,
  
  // Behavior
  initiallyExpanded = true,
  onToggle = null,
  
  // Content pushing
  pushContent = true,
  contentSelector = '#mainContent',
  expandedWidth = '240px',
  collapsedWidth = '60px',
  transitionDuration = 300,

  // New props
  headerTopOffset = '50px',
  compact = true,
  
  // Custom classes
  className = '',
}) => {
  // State for sidebar expansion
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  // State for tracking if we're on mobile
  const [isMobile, setIsMobile] = useState(false);
  // State for tracking if component is hydrated (for SSR compatibility)
  const [isHydrated, setIsHydrated] = useState(false);
  // State for managing drawer visibility on mobile
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // State for tracking expanded nested navigation items
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  // Reference to the content element (for direct DOM manipulation)
  const contentRef = useRef<HTMLElement | null>(null);
  // Ref for the overlay element
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // Set hydrated on mount (for SSR)
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Toggle sidebar expanded state
  const toggleSidebar = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    
    // Toggle drawer on mobile
    if (isMobile) {
      setIsDrawerOpen(newState);
    }
    
    // Call external handler if provided
    if (onToggle) {
      onToggle(newState);
    }
  };

  // Toggle nested item expansion
  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId) 
        : [...prev, itemId]
    );
  };

  // Handle resize events to determine if we're on mobile
  useEffect(() => {
    const handleResize = () => {
      const mobileCheck = window.innerWidth < 768;
      setIsMobile(mobileCheck);
      
      // Auto collapse sidebar on mobile
      if (mobileCheck && isExpanded) {
        setIsExpanded(false);
        setIsDrawerOpen(false);
      }
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isExpanded]);
  
  // Setup content pushing - only runs once after hydration
  useEffect(() => {
    // Skip if not pushing content or not yet hydrated
    if (!pushContent || !isHydrated) return;
    
    // Find content element using a ref to avoid re-renders
    if (!contentRef.current) {
      const contentElement = document.querySelector<HTMLElement>(contentSelector);
      if (contentElement) {
        contentRef.current = contentElement;
      }
    }
    
    const content = contentRef.current;
    if (!content) return;
    
    // Pre-apply styles to prevent FOUC
    if (!isMobile) {
      // Only apply push on desktop
      content.style.marginLeft = isExpanded ? expandedWidth : collapsedWidth;
      
      // After initial paint, add transition for future changes
      const timer = setTimeout(() => {
        if (content) {
          content.style.transition = `margin-left ${transitionDuration}ms ease`;
        }
      }, 50);
      
      return () => {
        clearTimeout(timer);
      };
    } else {
      // Remove margin on mobile
      content.style.marginLeft = '';
    }
    
    // Clean up on unmount
    return () => {
      if (content) {
        content.style.marginLeft = '';
        content.style.transition = '';
      }
    };
  }, [pushContent, contentSelector, expandedWidth, collapsedWidth, transitionDuration, isHydrated, isMobile]);
  
  // Update content margin when sidebar state changes
  useEffect(() => {
    // Skip if not pushing content, not hydrated, or on mobile
    if (!pushContent || !isHydrated || isMobile) return;
    
    // Get content element
    const content = contentRef.current;
    if (!content) return;
    
    // Update margin based on sidebar state
    content.style.marginLeft = isExpanded ? expandedWidth : collapsedWidth;
  }, [isExpanded, pushContent, contentSelector, expandedWidth, collapsedWidth, isHydrated, isMobile]);

  // Group navigation items by section
  const renderGroupedNavigationItems = () => {
    // Create groups based on level 1 items
    const groups: { heading: NavigationItem, items: NavigationItem[] }[] = [];
    let currentGroup: { heading: NavigationItem, items: NavigationItem[] } | null = null;
    
    navigationItems.forEach(item => {
      if (item.level === 1) {
        // Start a new group with this item as heading
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = {
          heading: item,
          items: []
        };
      } else if (currentGroup) {
        // Add this item to the current group
        currentGroup.items.push(item);
      }
    });
    
    // Add the last group if it exists
    if (currentGroup) {
      groups.push(currentGroup);
    }
    
    // Render all groups
    return (
      <>
        {groups.map((group, groupIndex) => (
          <div 
            key={`group-${groupIndex}`} 
            className={cosmicSidebarGroup({ 
              variant: variant === 'cosmic' ? 'cosmic' : 'standard',
              showDivider: true
            })}
          >
            {/* Group heading */}
            <div className="sidebar-group-heading">
              {group.heading.label}
            </div>
            
            {/* Group items */}
            {group.items.map((item, itemIndex) => {
              const itemId = `item-${groupIndex}-${itemIndex}`;
              const hasChildren = item.children && item.children.length > 0;
              
              return (
                <div key={itemId}>
                  {/* Main item */}
                  <div
                    className={cosmicSidebarItem({ 
                      variant: variant === 'cosmic' ? 'cosmic' : 'standard',
                      size: compact ? 'sm' : 'md'
                    })}
                    data-active={item.isActive}
                    data-has-children={hasChildren}
                    data-expanded={hasChildren && expandedItems.includes(itemId)}
                    aria-expanded={hasChildren ? expandedItems.includes(itemId) : undefined}
                    onClick={(e) => {
                      // If it has children, toggle expansion
                      if (hasChildren) {
                        e.preventDefault();
                        toggleItemExpansion(itemId);
                      } else if (item.onClick && (isExpanded || isMobile)) {
                        e.preventDefault();
                        item.onClick();
                      }
                    }}
                    style={{
                      pointerEvents: !isExpanded && !isMobile ? 'none' : 'auto',
                    }}
                  >
                    {/* Icon */}
                    {item.icon && (
                      <div className="sidebar-item-icon">
                        {item.icon}
                      </div>
                    )}
                    
                    {/* Text */}
                    <span className="sidebar-item-text">
                      {item.label}
                    </span>
                    
                    {/* Badge if exists */}
                    {item.badge && (
                      <div className={cosmicSidebarBadge({ 
                        variant: 'danger',
                        size: compact ? 'sm' : 'md'
                      })}>
                        {item.badge}
                      </div>
                    )}
                  </div>
                  
                  {/* Nested items if any */}
                  {hasChildren && (
                    <div className={cosmicSidebarNestedItems({ 
                      depth: "1",
                      indentStyle: compact ? 'compact' : 'default'
                    })}>
                      {item.children!.map((child, childIndex) => (
                        <div 
                          key={`${itemId}-child-${childIndex}`}
                          className={cosmicSidebarItem({ 
                            variant: variant === 'cosmic' ? 'cosmic' : 'standard',
                            size: compact ? 'sm' : 'md'
                          })}
                          data-active={child.isActive}
                          onClick={(e) => {
                            if (child.onClick && (isExpanded || isMobile)) {
                              e.preventDefault();
                              child.onClick();
                            }
                          }}
                        >
                          {child.icon && (
                            <div className="sidebar-item-icon">
                              {child.icon}
                            </div>
                          )}
                          <span className="sidebar-item-text">
                            {child.label}
                          </span>
                          {child.badge && (
                            <div className={cosmicSidebarBadge({ 
                              variant: 'danger',
                              size: compact ? 'sm' : 'md'
                            })}>
                              {child.badge}
                            </div>
                          )}
                        </div>
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

  // Render flat navigation items if no proper grouping exists
  const renderFlatNavigationItems = () => {
    return navigationItems.map((item, index) => {
      const itemId = `item-${index}`;
      const hasChildren = item.children && item.children.length > 0;
      
      return (
        <div key={itemId}>
          {/* Main item */}
          <div
            className={cosmicSidebarItem({ 
              variant: variant === 'cosmic' ? 'cosmic' : 'standard',
              size: compact ? 'sm' : 'md'
            })}
            data-active={item.isActive}
            data-has-children={hasChildren}
            data-expanded={hasChildren && expandedItems.includes(itemId)}
            aria-expanded={hasChildren ? expandedItems.includes(itemId) : undefined}
            onClick={(e) => {
              // If it has children, toggle expansion
              if (hasChildren) {
                e.preventDefault();
                toggleItemExpansion(itemId);
              } else if (item.onClick && (isExpanded || isMobile)) {
                e.preventDefault();
                item.onClick();
              }
            }}
            style={{
              pointerEvents: !isExpanded && !isMobile ? 'none' : 'auto',
            }}
          >
            {/* Icon */}
            {item.icon && (
              <div className="sidebar-item-icon">
                {item.icon}
              </div>
            )}
            
            {/* Text */}
            <span className="sidebar-item-text">
              {item.label}
            </span>
            
            {/* Badge if exists */}
            {item.badge && (
              <div className={cosmicSidebarBadge({ 
                variant: 'danger',
                size: compact ? 'sm' : 'md'
              })}>
                {item.badge}
              </div>
            )}
          </div>
          
          {/* Nested items if any */}
          {hasChildren && (
            <div className={cosmicSidebarNestedItems({ 
              depth: "1",
              indentStyle: compact ? 'compact' : 'default'
            })}>
              {item.children!.map((child, childIndex) => (
                <div 
                  key={`${itemId}-child-${childIndex}`}
                  className={cosmicSidebarItem({ 
                    variant: variant === 'cosmic' ? 'cosmic' : 'standard',
                    size: compact ? 'sm' : 'md'
                  })}
                  data-active={child.isActive}
                  onClick={(e) => {
                    if (child.onClick && (isExpanded || isMobile)) {
                      e.preventDefault();
                      child.onClick();
                    }
                  }}
                >
                  {child.icon && (
                    <div className="sidebar-item-icon">
                      {child.icon}
                    </div>
                  )}
                  <span className="sidebar-item-text">
                    {child.label}
                  </span>
                  {child.badge && (
                    <div className={cosmicSidebarBadge({ 
                      variant: 'danger',
                      size: compact ? 'sm' : 'md'
                    })}>
                      {child.badge}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  // Check if proper grouping exists
  const hasProperGrouping = navigationItems.some(item => item.level === 1);

  // Render desktop sidebar
  const renderDesktopSidebar = () => (
    <aside 
      className={`${cosmicSidebar({ 
        variant,
        initiallyExpanded
      })} ${className}`}
      data-expanded={isExpanded}
      aria-hidden={!isExpanded}
      style={{
        width: isExpanded ? expandedWidth : collapsedWidth,
        transition: `width ${transitionDuration}ms ease`,
        display: isMobile ? 'none' : 'flex', // Hide on mobile
      }}
    >
      {/* Sidebar Header with Toggle Button */}
      <div className={cosmicSidebarHeader()} style={{ 
        position: 'relative', // Critical for positioning context
        marginTop: headerTopOffset,
        padding: '0 4px', // Reduce default padding
        height: '60px'     // Ensure consistent height
      }}>
        {/* Toggle button container - helps with alignment */}
        <div style={{
          position: 'absolute',
          left: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Toggle Button */}
          <button
            className={cosmicSidebarToggle({ 
              variant: variant === 'cosmic' ? 'cosmic' : 'borderless',
              size: compact ? 'sm' : 'md',
              border: 'none'
            })}
            data-expanded={isExpanded}
            onClick={toggleSidebar}
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
        
        {/* Title text - properly aligned with toggle */}
        <div style={{
          position: 'absolute',
          left: '48px', // Position aligned with toggle's center
          top: '50%',
          transform: 'translateY(-50%)',
          width: 'calc(100% - 60px)'
        }}>
          <h1 className="sidebar-header-title" style={{
            fontSize: '1.1em',
            fontWeight: 'medium',
            margin: 0,
            padding: 0,
            opacity: isExpanded ? 1 : 0,
            visibility: isExpanded ? 'visible' : 'hidden',
            transition: `opacity ${transitionDuration}ms ease, visibility ${transitionDuration}ms ease`,
            color: 'var(--color-primary)' // Use primary color to match screenshot
          }}>
            {title}
          </h1>
        </div>
      </div>

      {/* Sidebar Content with scrolling */}
      <nav className={cosmicSidebarContent()} style={{
        overflowY: 'auto',
        paddingTop: compact ? '2' : '4',
      }}>
        {/* Render navigation items - grouped if proper structure exists */}
        {hasProperGrouping ? renderGroupedNavigationItems() : renderFlatNavigationItems()}
      </nav>

      {/* Sidebar Footer (if footerContent is provided) */}
      {footerContent && (
        <div className={cosmicSidebarFooter({ 
          variant: variant === 'cosmic' ? 'cosmic' : 'standard',
          spacing: compact ? 'compact' : 'normal'
        })}>
          {footerContent}
        </div>
      )}
    </aside>
  );

  // Render mobile navbar
  const renderMobileNavbar = () => (
    <header className={css({
      display: isMobile ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: compact ? '3' : '4',
      height: compact ? '14' : '16',
      width: '100%',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 50,
      backgroundColor: 'backgroundAlt',
      borderBottom: '1px solid',
      borderColor: 'border'
    })}>
      {/* App title/logo */}
      <div className={css({ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '2' 
      })}>
        {logo || (
          <div className={css({ 
            fontSize: compact ? 'md' : 'xl', 
            color: 'primary',
            fontWeight: 'bold'
          })}>
            {title?.charAt(0) || 'C'}
          </div>
        )}
        <span className={css({ 
          fontWeight: 'semibold',
          fontSize: compact ? '0.95em' : undefined,
        })}>
          {title}
        </span>
      </div>
      
      {/* Toggle button - using the new toggle for mobile */}
      <button 
        className={cosmicSidebarToggle({ 
          variant: variant === 'cosmic' ? 'cosmic' : 'standard',
          size: compact ? 'sm' : 'md',
          border: 'thin',
          isMobile: true
        })}
        data-expanded={isDrawerOpen}
        onClick={toggleSidebar}
        aria-label={isDrawerOpen ? 'Close sidebar' : 'Open sidebar'}
        style={{
          position: 'relative',
          right: 0,
          marginLeft: 'auto',
        }}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>
  );

  // Render mobile drawer
  const renderMobileDrawer = () => (
    <>
      {/* Overlay that covers the screen when drawer is open */}
      <div
        ref={overlayRef}
        className={css({
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 90,
          transition: `opacity ${transitionDuration}ms ease, visibility ${transitionDuration}ms ease`,
          visibility: isDrawerOpen ? 'visible' : 'hidden',
          opacity: isDrawerOpen ? 1 : 0,
          display: isMobile ? 'block' : 'none'
        })}
        onClick={toggleSidebar}
      />

      {/* Drawer container */}
      <aside
        className={`${cosmicSidebar({ 
          variant, 
          initiallyExpanded: true
        })} ${className}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: expandedWidth,
          transform: isDrawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: `transform ${transitionDuration}ms ease`,
          zIndex: 100,
          display: isMobile ? 'flex' : 'none', // Only show on mobile
          marginTop: compact ? '56px' : '64px' // Space for the navbar
        }}
      >
        {/* Drawer Content (similar to sidebar content but always expanded) */}
        <nav className={cosmicSidebarContent()} style={{
          overflowY: 'auto',
          paddingTop: compact ? '2' : '4',
        }}>
          {/* Render navigation items - grouped if proper structure exists */}
          {hasProperGrouping ? renderGroupedNavigationItems() : renderFlatNavigationItems()}
        </nav>

        {/* Include footer in drawer if available */}
        {footerContent && (
          <div className={cosmicSidebarFooter({ 
            variant: variant === 'cosmic' ? 'cosmic' : 'standard',
            spacing: compact ? 'compact' : 'normal'
          })}>
            {footerContent}
          </div>
        )}
      </aside>
    </>
  );

  // Adjust main content padding for mobile navbar
  useEffect(() => {
    if (!contentRef.current || !isHydrated) return;
    
    if (isMobile) {
      contentRef.current.style.paddingTop = compact ? '56px' : '64px'; // Match navbar height
    } else {
      contentRef.current.style.paddingTop = '';
    }
  }, [isMobile, isHydrated, compact]);

  return (
    <>
      {/* Desktop Sidebar */}
      {renderDesktopSidebar()}
      
      {/* Mobile Components */}
      {renderMobileNavbar()}
      {renderMobileDrawer()}
    </>
  );
};

export default LeftSidebar;