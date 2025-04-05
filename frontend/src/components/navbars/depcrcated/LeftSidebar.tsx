import React, { useState, useEffect } from 'react';
import { 
  cosmicSidebar, 
  cosmicDonerButton, 
  cosmicNavItem, 
} from '../../../../styled-system/recipes';
import { css } from '../../../../styled-system/css';

interface NavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href: string;
  isActive?: boolean;
  children?: NavItem[];
}

interface LeftSidebarProps {
  navItems: NavItem[];
  logo?: React.ReactNode;
  title?: string;
  variant?: 'standard' | 'elevated' | 'minimal' | 'cosmic';
  initiallyExpanded?: boolean;
  onNavItemClick?: (item: NavItem) => void;
  storageKey?: string; // Key to use for localStorage persistence
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  navItems,
  logo,
  title = 'Navigation',
  variant = 'cosmic',
  initiallyExpanded = true, // Default to expanded
  onNavItemClick,
  storageKey = 'cosmic-sidebar-expanded', // Default storage key
}) => {
  // State to track if we're on mobile
  const [isMobile, setIsMobile] = useState(false);
  
  // Initialize sidebar state with localStorage if available
  const [isExpanded, setIsExpanded] = useState(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(storageKey);
      // Parse the saved state, default to initiallyExpanded if not found
      return savedState !== null ? savedState === 'true' : initiallyExpanded;
    }
    return initiallyExpanded;
  });
  
  // State to track which sections are expanded (all expanded by default)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initialExpandedState: Record<string, boolean> = {};
    navItems.forEach(item => {
      if (item.children && item.children.length > 0) {
        initialExpandedState[item.id] = true; // Default all sections to expanded
      }
    });
    return initialExpandedState;
  });

  // Toggle sidebar expansion
  const toggleSidebar = () => {
    setIsExpanded(prev => !prev);
  };

  // Toggle section expansion
  const toggleSection = (sectionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling up
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Handle navigation item click
  const handleNavItemClick = (item: NavItem, e: React.MouseEvent) => {
    // If item has children, toggle expansion
    if (item.children && item.children.length > 0) {
      toggleSection(item.id, e);
      return;
    }
    
    // Otherwise navigate
    if (onNavItemClick) {
      onNavItemClick(item);
    }
    
    // DO NOT auto-collapse sidebar on mobile when clicking items
  };

  // Check for mobile viewport on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkMobile();
    
    // Listen for window resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, isExpanded.toString());
    }
  }, [isExpanded, storageKey]);

  // Apply sidebar styles directly
  const sidebarStyles = cosmicSidebar ({
    variant,
    initiallyExpanded: isExpanded
  });

  // Apply doner button styles
  const buttonStyles = cosmicDonerButton({
    variant: 'borderless', // No background as requested
    size: 'md',
    isOpen: isExpanded
  });

  // The main content wrapping style
  // This is critical for properly pushing content when sidebar expands
  const mainContainerStyles = css({
    display: 'flex',
    width: '100%',
    minHeight: '100vh',
    position: 'relative',
    '& > main': {
      flex: 1,
      transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      marginLeft: isExpanded ? 'var(--sidebar-expanded-width, 240px)' : 'var(--sidebar-collapsed-width, 60px)',
      width: isExpanded ? 'calc(100% - var(--sidebar-expanded-width, 240px))' : 'calc(100% - var(--sidebar-collapsed-width, 60px))',
      '@media (max-width: 768px)': {
        marginLeft: '0',
        width: '100%',
      }
    }
  });

  // Custom styles for the sidebar
  const customSidebarStyles = css({
    position: 'fixed',
    top: 0,
    left: 0,
    width: isExpanded ? 'var(--sidebar-expanded-width, 240px)' : 'var(--sidebar-collapsed-width, 60px)',
    height: '100vh',
    backgroundColor: 'backgroundAlt',
    zIndex: 'sidebar',
    borderRight: '1px solid',
    borderColor: variant === 'cosmic' ? 'color-mix(in srgb, var(--color-border) 70%, var(--color-primary))' : 'border',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '@media (max-width: 768px)': {
      transform: isExpanded ? 'translateX(0)' : 'translateX(-100%)',
      width: 'var(--sidebar-expanded-width, 240px)',
    }
  });

  // Header styles with centered toggle button
  const headerStyles = css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center', // Center the toggle button
    padding: '4',
    height: '60px',
    borderBottom: '1px solid',
    borderColor: 'border',
    position: 'relative', // For absolute positioning of logo and title
  });

  // Logo container styles
  const logoContainerStyles = css({
    position: 'absolute',
    left: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  });

  // Logo styles
  const logoStyles = css({
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  // Title styles with animation
  const titleStyles = css({
    marginLeft: '3',
    fontFamily: 'heading',
    fontWeight: 'normal',
    letterSpacing: '0.05em',
    color: 'primary',
    whiteSpace: 'nowrap',
    // Hide and animate when sidebar expands
    opacity: isExpanded ? 1 : 0,
    transform: isExpanded ? 'translateX(0)' : 'translateX(-20px)',
    // Quick transition for text appearance
    transition: 'opacity 0.2s ease, transform 0.2s ease',
    // Delay appearance until sidebar is expanded
    transitionDelay: isExpanded ? '0.1s' : '0s',
  });

  // Content section styles
  const contentStyles = css({
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '2',
  });

  // Section item styles
  const sectionStyles = css({
    marginBottom: '8px',
  });

  // Section header styles
  const sectionHeaderStyles = css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    color: 'primary',
    fontWeight: 'medium',
    letterSpacing: '0.05em',
    fontSize: '0.9rem',
    cursor: 'pointer',
    borderRadius: 'sm',
    transition: 'background-color 0.2s ease',
    backgroundColor: 'transparent',
    opacity: isExpanded ? 1 : 0,
    transform: isExpanded ? 'translateX(0)' : 'translateX(-20px)',
    transitionDelay: isExpanded ? '0.1s' : '0s',
    _hover: {
      backgroundColor: 'color-mix(in srgb, var(--color-hover) 50%, transparent)',
    }
  });

  // Section children container styles with animation
  const sectionChildrenStyles = (sectionId: string) => css({
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: '12px',
    height: expandedSections[sectionId] ? 'auto' : '0px',
    overflow: 'hidden',
    opacity: isExpanded ? 1 : 0,
    transform: isExpanded ? 'translateX(0)' : 'translateX(-20px)',
    transition: 'opacity 0.2s ease, transform 0.2s ease, height 0.3s ease',
    transitionDelay: isExpanded ? '0.15s' : '0s',
  });

  // Arrow icon styles for section expansion
  const arrowIconStyles = (sectionId: string) => css({
    transition: 'transform 0.3s ease',
    transform: expandedSections[sectionId] ? 'rotate(180deg)' : 'rotate(0deg)',
  });

  // Backdrop for mobile
  const backdropStyles = css({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    zIndex: 'below-sidebar', // Just below the sidebar
    opacity: isExpanded && isMobile ? 1 : 0,
    visibility: isExpanded && isMobile ? 'visible' : 'hidden',
    transition: 'opacity 0.3s ease, visibility 0.3s ease',
    '@media (min-width: 769px)': {
      display: 'none', // Hide backdrop on desktop
    }
  });

  // Mobile toggle button container
  const mobileToggleContainerStyles = css({
    position: 'fixed',
    top: '10px',
    left: '10px',
    zIndex: 'docked',
    display: isMobile ? 'block' : 'none',
  });

  return (
    <div className={mainContainerStyles}>
      {/* Backdrop for mobile */}
      <div 
        className={backdropStyles} 
        onClick={() => setIsExpanded(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside className={customSidebarStyles}>
        {/* Header with centered toggle button */}
        <div className={headerStyles}>
          {/* Logo and title container positioned at left */}
          <div className={logoContainerStyles}>
            <div className={logoStyles}>
              {logo || <span>🌌</span>}
            </div>
            <div className={titleStyles}>
              {title}
            </div>
          </div>

          {/* Toggle button centered in header */}
          <button 
            className={buttonStyles}
            onClick={toggleSidebar}
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            data-state={isExpanded ? 'open' : 'closed'}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Navigation content */}
        <div className={contentStyles}>
          {navItems.map((item) => {
            // Check if item has children
            const hasChildren = item.children && item.children.length > 0;
            
            // Determine if this section is expanded
            const isSectionExpanded = expandedSections[item.id];
            
            return (
              <div key={item.id} className={sectionStyles}>
                {/* Section header (parent item) */}
                <div 
                  className={sectionHeaderStyles}
                  onClick={(e) => handleNavItemClick(item, e)}
                >
                  <span>{item.label}</span>
                  {hasChildren && (
                    <span className={arrowIconStyles(item.id)}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  )}
                </div>
                
                {/* Section children */}
                {hasChildren && (
                  <div className={sectionChildrenStyles(item.id)}>
                    {item.children?.map(child => {
                      // Apply the NavItem styles with variant matching sidebar
                      const itemStyles = cosmicNavItem({
                        variant: variant === 'cosmic' ? 'cosmic' : 'standard',
                        isActive: child.isActive,
                        direction: 'vertical'
                      });
                      
                      return (
                        <div
                          key={child.id}
                          className={itemStyles}
                          data-active={child.isActive}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onNavItemClick) {
                              onNavItemClick(child);
                            }
                          }}
                        >
                          <div className="nav-item-content">
                            {child.icon && <div className="nav-item-icon">{child.icon}</div>}
                            <div className="nav-item-text">{child.label}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Mobile toggle button */}
      {isMobile && (
        <div className={mobileToggleContainerStyles}>
          <button 
            className={buttonStyles}
            onClick={toggleSidebar}
            aria-label="Open menu"
            data-state={isExpanded ? 'open' : 'closed'}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      )}
    </div>
  );
};

export default LeftSidebar;