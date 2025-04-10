import React from 'react';
import { 
  cosmicSidebar,
  cosmicSidebarHeader,
  cosmicSidebarContent,
  cosmicSidebarFooter,
  cosmicSidebarToggle,
  cosmicSidebarGroup,
} from '../../../../../styled-system/recipes';
import { css, cx } from '../../../../../styled-system/css';
import { NavigationItem } from '../hooks/index';
import { renderGroupedNavigationItems, renderFlatNavigationItems } from './DesktopNavigation';

interface DesktopSidebarLayoutProps {
  // Refs
  sidebarRef: React.RefObject<HTMLElement | null>;
  // State
  isHydrated: boolean;
  isExpanded: boolean;
  initiallyExpanded: boolean;
  isMobile: boolean;
  // Navigation
  processedNavItems: NavigationItem[];
  expandedItems: string[];
  toggleItemExpansion: (itemId: string) => void;
  // Appearance
  variant: 'standard' | 'elevated' | 'minimal' | 'cosmic';
  title: string;
  compact: boolean;
  className: string;
  expandedWidth: string;
  collapsedWidth: string;
  transitionDuration: number;
  headerTopOffset: string;
  footerContent: React.ReactNode | null;
  // Behavior
  toggleSidebar: () => void;
}

const DesktopSidebarLayout: React.FC<DesktopSidebarLayoutProps> = ({
  sidebarRef,
  isHydrated,
  isExpanded,
  initiallyExpanded,
  isMobile,
  processedNavItems,
  expandedItems,
  toggleItemExpansion,
  variant,
  title,
  compact,
  className,
  expandedWidth,
  collapsedWidth,
  transitionDuration,
  headerTopOffset,
  footerContent,
  toggleSidebar,
}) => {
  // Enhanced tab-like border style
  const enhancedSidebarStyle = css({
    position: 'relative',
    backgroundColor: 'transparent',
    
    // Tab-like border effect with shadow extending to the left
    "&::after": {
      content: '""',
      position: 'absolute',
      top: '0',
      right: '-1px',
      bottom: '0',
      width: '4px',
      borderRadius: '0 6px 6px 0',
      backgroundColor: 'var(--color-primary)',
      boxShadow: '0 0 8px 1px var(--color-primary), -4px 0 10px -4px var(--color-primary)',
      opacity: 0.9,
      zIndex: 1,
    },
    
    // Custom styles for active items
    "& [data-active='true']": {
      position: 'relative',
      "&::after": {
        content: '""',
        position: 'absolute',
        right: '0',
        top: '20%',
        height: '60%',
        width: '4px',
        backgroundColor: 'var(--color-primary)',
        boxShadow: '0 0 8px 1px var(--color-primary), -4px 0 10px -4px var(--color-primary)',
        borderRadius: '2px 0 0 2px',
        zIndex: 2,
      }
    },
    
    // Hover styles for navigation items
    "& [role='button']:hover:not([data-active='true'])": {
      "&::after": {
        content: '""',
        position: 'absolute',
        right: '0',
        top: '30%', // Slightly smaller than active items
        height: '40%', // Smaller than active items
        width: '3px', // Slightly thinner than active items
        backgroundColor: 'var(--color-primary)',
        opacity: 0.7, // More transparent than active items
        boxShadow: '0 0 6px 0px var(--color-primary), -2px 0 8px -4px var(--color-primary)',
        borderRadius: '2px 0 0 2px',
        zIndex: 2,
        transition: 'all 0.2s ease-in-out',
      }
    }
  });

  // Navigation styles
  const desktopNavStyle = css({
    overflowY: 'auto',
    flexGrow: 1,
    paddingBottom: 'spacing.5',
    scrollbarWidth: 'thin',
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'border.subtle',
      borderRadius: '3px',
    },
    
    // Style for navigation items to ensure proper hover effect
    '& [role="button"]': {
      position: 'relative',
      transition: 'all 0.2s ease-in-out',
    }
  });

  // Check if navigation items have proper grouping
  const hasProperGrouping = processedNavItems.some(item => item.level === 1);

  return (
    <aside
      ref={sidebarRef}
      className={cx(
        cosmicSidebar({ variant, initiallyExpanded }), 
        enhancedSidebarStyle, // Apply our enhanced styling
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
        borderRight: 'none', // Remove default border if present
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
            toggleSidebar();
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
          hasProperGrouping 
            ? renderGroupedNavigationItems({
                processedNavItems,
                expandedItems,
                toggleItemExpansion,
                isExpanded,
                isMobile,
                variant,
                compact
              }) 
            : renderFlatNavigationItems({
                processedNavItems,
                expandedItems,
                toggleItemExpansion,
                isExpanded,
                isMobile,
                variant,
                compact
              })
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
};

export default DesktopSidebarLayout;