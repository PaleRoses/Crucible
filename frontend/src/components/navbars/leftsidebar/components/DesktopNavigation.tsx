import React from 'react';
import { NavigationItem } from '../hooks/index';
import { 
  cosmicSidebarItem,
  cosmicSidebarNestedItems,
  cosmicSidebarBadge,
  cosmicSidebarGroup,
} from '../../../../../styled-system/recipes';

interface DesktopNavItemProps {
  item: NavigationItem;
  itemId: string;
  hasChildren: boolean;
  isItemExpanded: boolean;
  isExpanded: boolean;
  isMobile: boolean;
  toggleItemExpansion: (itemId: string) => void;
  variant: 'standard' | 'elevated' | 'minimal' | 'cosmic';
  compact: boolean;
}

export const DesktopNavItem: React.FC<DesktopNavItemProps> = ({
  item,
  itemId,
  hasChildren,
  isItemExpanded,
  isExpanded,
  isMobile,
  toggleItemExpansion,
  variant,
  compact,
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

interface DesktopNestedItemProps {
  child: NavigationItem;
  itemId: string;
  childIndex: number;
  isExpanded: boolean;
  isMobile: boolean;
  variant: 'standard' | 'elevated' | 'minimal' | 'cosmic';
  compact: boolean;
}

export const DesktopNestedItem: React.FC<DesktopNestedItemProps> = ({
  child,
  itemId,
  childIndex,
  isExpanded,
  isMobile,
  variant,
  compact,
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

interface DesktopNavigationProps {
  processedNavItems: NavigationItem[];
  expandedItems: string[];
  toggleItemExpansion: (itemId: string) => void;
  isExpanded: boolean;
  isMobile: boolean;
  variant: 'standard' | 'elevated' | 'minimal' | 'cosmic';
  compact: boolean;
}

export const renderGroupedNavigationItems = ({
  processedNavItems,
  expandedItems,
  toggleItemExpansion,
  isExpanded,
  isMobile,
  variant,
  compact,
}: DesktopNavigationProps) => {
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
                  isExpanded={isExpanded}
                  isMobile={isMobile}
                  toggleItemExpansion={toggleItemExpansion}
                  variant={variant}
                  compact={compact}
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
                        isExpanded={isExpanded}
                        isMobile={isMobile}
                        variant={variant}
                        compact={compact}
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

export const renderFlatNavigationItems = ({
  processedNavItems,
  expandedItems,
  toggleItemExpansion,
  isExpanded,
  isMobile,
  variant,
  compact,
}: DesktopNavigationProps) => {
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
          isExpanded={isExpanded}
          isMobile={isMobile}
          toggleItemExpansion={toggleItemExpansion}
          variant={variant}
          compact={compact}
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
                isExpanded={isExpanded}
                isMobile={isMobile}
                variant={variant}
                compact={compact}
              />
            ))}
          </div>
        )}
      </div>
    );
  });
};