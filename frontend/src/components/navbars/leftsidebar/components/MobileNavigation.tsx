import React from 'react';
import { NavigationItem } from '../types/types';
import { cosmicSidebarBadge } from '../../../../../styled-system/recipes';

interface MobileNavItemProps {
  item: NavigationItem;
  itemId: string;
  index: number;
  toggleItemExpansion: (itemId: string) => void;
  handleNavigation: (item: NavigationItem) => void;
  expandedItems: string[];
  navItemClass: string;
  navItemContentClass: string;
  expandIconClass: string;
  nestedItemsContainerClass: string;
  nestedItemClass: string;
}

export const MobileNavItem: React.FC<MobileNavItemProps> = ({
  item,
  itemId,
  index,
  toggleItemExpansion,
  handleNavigation,
  expandedItems,
  navItemClass,
  navItemContentClass,
  expandIconClass,
  nestedItemsContainerClass,
  nestedItemClass,
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
        className={navItemClass}
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
        <div className={navItemContentClass}>
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
              className={expandIconClass}
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
          className={nestedItemsContainerClass}
          role="menu"
          aria-label={`${item.label} submenu`}
        >
          {item.children!.map((child, childIndex) => (
            <div
              key={`${itemId}-child-${childIndex}`}
              className={nestedItemClass}
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

interface MobileNavigationProps {
  processedNavItems: NavigationItem[];
  expandedItems: string[];
  toggleItemExpansion: (itemId: string) => void;
  handleNavigation: (item: NavigationItem) => void;
  mobileStyles: {
    navItem: string;
    navItemContent: string;
    expandIcon: string;
    nestedItemsContainer: string;
    nestedItem: string;
  };
}

export const renderMobileNavigation = ({
  processedNavItems,
  expandedItems,
  toggleItemExpansion,
  handleNavigation,
  mobileStyles,
}: MobileNavigationProps) => {
  return processedNavItems.map((item, index) => {
    const itemId = `mobile-item-${index}`;
    return (
      <MobileNavItem 
        key={itemId}
        item={item} 
        itemId={itemId} 
        index={index}
        toggleItemExpansion={toggleItemExpansion}
        handleNavigation={handleNavigation}
        expandedItems={expandedItems}
        navItemClass={mobileStyles.navItem}
        navItemContentClass={mobileStyles.navItemContent}
        expandIconClass={mobileStyles.expandIcon}
        nestedItemsContainerClass={mobileStyles.nestedItemsContainer}
        nestedItemClass={mobileStyles.nestedItem}
      />
    );
  });
};