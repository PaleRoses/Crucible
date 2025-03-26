'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

// ========================================================================
// TYPES & INTERFACES
// ========================================================================

/**
 * Navigation item with optional submenu
 */
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  description?: string;
  submenu?: NavItem[];
}

/**
 * Props for the sidebar component
 */
export interface LeftSidebarProps {
  /** Navigation items to display */
  items: NavItem[];
  
  /** Title displayed at the top of the sidebar */
  title?: string;
  
  /** Logo to display at the top of the sidebar */
  logo?: React.ReactNode;
  
  /** Custom class name for the sidebar container */
  className?: string;
  
  /** Whether to display item descriptions */
  showDescriptions?: boolean;
  
  /** Custom width for the sidebar (default: 250px) */
  width?: string;
  
  /** Mobile breakpoint (default: 768px) */
  mobileBreakpoint?: number;
  
  /** Whether to show the sidebar on mobile by default */
  showOnMobileByDefault?: boolean;
  
  /** Whether to use a fixed position (default: true) */
  fixed?: boolean;
  
  /** Custom z-index for the sidebar */
  zIndex?: number;

  /** Accent color override */
  accentColor?: string;
  
  /** Text color override */
  textColor?: string;
  
  /** Whether to automatically highlight active items */
  autoHighlight?: boolean;

  /** Optional ARIA label for the nav */
  ariaLabel?: string;
}

/**
 * Props for styled components that need to know if a route is active
 */
interface ActiveProps {
  $isActive: boolean;
  $accentColor?: string;
  $textColor?: string;
}

/**
 * Props for styled components with dimensions
 */
interface DimensionProps {
  $width?: string;
  $isMobile?: boolean;
  $isOpen?: boolean;
  $fixed?: boolean;
  $zIndex?: number;
  $mobileBreakpoint?: number;
}

// ========================================================================
// STYLED COMPONENTS
// ========================================================================

const SidebarContainer = styled.aside<DimensionProps>`
  width: ${props => props.$isMobile ? '100%' : props.$width || '250px'};
  height: ${props => props.$isMobile ? 'auto' : '100vh'};
  overflow-y: ${props => props.$isMobile ? 'hidden' : 'auto'};
  position: ${props => props.$fixed ? 'fixed' : 'relative'};
  left: 0;
  top: 0;
  z-index: ${props => props.$zIndex || 40};
  transition: transform 0.3s ease, opacity 0.3s ease;
  border-right: 1px solid rgba(160, 142, 97, 0.1);
  overscroll-behavior: contain;
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 2px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(160, 142, 97, 0.3);
    border-radius: 2px;
  }
  
  @media (max-width: ${props => props.$mobileBreakpoint || 768}px) {
    position: fixed;
    height: 100vh;
    transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'};
    opacity: ${props => props.$isOpen ? 1 : 0};
    pointer-events: ${props => props.$isOpen ? 'all' : 'none'};
  }
`;

const SidebarOverlay = styled(motion.div)<DimensionProps>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: ${props => (props.$zIndex || 40) - 1};
  display: none;
  
  @media (max-width: ${props => props.$mobileBreakpoint || 768}px) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
  }
`;

const SidebarContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0;
  height: 100%;
`;

const SidebarHeader = styled.div`
  padding: 0 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-bottom: 1px solid rgba(160, 142, 97, 0.1);
  margin-bottom: 1rem;
`;

const SidebarTitle = styled.h2`
  font-family: var(--font-heading);
  font-weight: 100;
  font-size: 1.4rem;
  letter-spacing: 0.1em;
  color: var(--gold);
  margin: 0.5rem 0;
`;

const LogoContainer = styled.div`
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  color: var(--gold);
`;

const NavItemsContainer = styled.nav`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const NavItemWrapper = styled.div`
  position: relative;
`;

const NavLinkContainer = styled.div<ActiveProps>`
  position: relative;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    width: 3px;
    height: ${props => props.$isActive ? '70%' : '0'};
    background-color: ${props => props.$accentColor || 'var(--gold)'};
    opacity: ${props => props.$isActive ? 1 : 0};
    transition: height 0.3s ease, opacity 0.3s ease;
  }
  
  &:hover::before {
    height: 50%;
    opacity: 0.7;
  }
`;

const NavButton = styled.button<ActiveProps>`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  letter-spacing: 0.1em;
  background: transparent;
  border: none;
  text-align: left;
  outline: none;
  box-shadow: none;
  transition: color 0.3s ease, transform 0.3s ease;
  cursor: pointer;
  font-family: var(--font-heading);
  color: ${props => props.$isActive ? (props.$accentColor || 'var(--gold)') : (props.$textColor || 'var(--color-text)')};
  transform: ${props => props.$isActive ? 'translateX(3px)' : 'none'};
  font-weight: 100;
  
  &:hover {
    color: ${props => props.$accentColor || 'var(--gold)'};
  }
  
  &:focus-visible {
    outline: 2px solid ${props => props.$accentColor || 'var(--gold)'};
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

const NavLink = styled.a<ActiveProps>`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  letter-spacing: 0.1em;
  background: transparent;
  border: none;
  text-align: left;
  outline: none;
  box-shadow: none;
  transition: color 0.3s ease, transform 0.3s ease;
  cursor: pointer;
  font-family: var(--font-heading);
  color: ${props => props.$isActive ? (props.$accentColor || 'var(--gold)') : (props.$textColor || 'var(--color-text)')};
  transform: ${props => props.$isActive ? 'translateX(3px)' : 'none'};
  font-weight: 100;
  text-decoration: none;
  
  &:hover {
    color: ${props => props.$accentColor || 'var(--gold)'};
  }
  
  &:focus-visible {
    outline: 2px solid ${props => props.$accentColor || 'var(--gold)'};
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

const NavItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const NavItemIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 20px;
  height: 20px;
`;

const NavItemLabel = styled.span`
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const NavItemArrow = styled(motion.div)<ActiveProps>`
  display: flex;
  align-items: center;
  margin-left: auto;
  color: ${props => props.$isActive ? (props.$accentColor || 'var(--gold)') : 'currentColor'};
`;

const SubmenuContainer = styled(motion.div)<ActiveProps>`
  overflow: hidden;
  margin-left: 1.75rem;
  margin-bottom: 0.5rem;
  padding-left: 0.75rem;
  border-left: 1px solid ${props => props.$isActive 
    ? `${props.$accentColor || 'var(--gold)'}80` 
    : 'rgba(160, 142, 97, 0.2)'};
`;

const NavDescription = styled.div`
  font-size: 0.8rem;
  color: rgba(224, 224, 224, 0.5);
  padding: 0 1.5rem 0.75rem 4rem;
  max-width: 90%;
  line-height: 1.4;
  margin-top: -0.25rem;
`;

const MobileToggle = styled.button<ActiveProps & DimensionProps>`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: ${props => (props.$zIndex || 40) + 1};
  background: rgba(8, 8, 12, 0.7);
  backdrop-filter: blur(4px);
  border: 1px solid ${props => props.$isActive 
    ? (props.$accentColor || 'var(--gold)') 
    : 'rgba(160, 142, 97, 0.2)'};
  border-radius: 4px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${props => props.$isActive ? (props.$accentColor || 'var(--gold)') : 'var(--color-text)'};
  transition: all 0.3s ease;
  
  &:hover {
    color: ${props => props.$accentColor || 'var(--gold)'};
    border-color: ${props => props.$accentColor || 'var(--gold)'};
  }
  
  @media (min-width: ${props => props.$mobileBreakpoint || 768}px) {
    display: none;
  }
`;

const MobileNav = styled.div<DimensionProps>`
  position: fixed;
  top: 0;
  left: 0;
  width: 270px;
  height: 100vh;
  background: rgba(8, 8, 12, 0.95);
  backdrop-filter: blur(10px);
  z-index: ${props => props.$zIndex || 40};
  overflow-y: auto;
  transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'};
  transition: transform 0.3s ease;
  box-shadow: ${props => props.$isOpen ? '0 0 20px rgba(0, 0, 0, 0.5)' : 'none'};
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 2px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(160, 142, 97, 0.3);
    border-radius: 2px;
  }
  
  @media (min-width: ${props => props.$mobileBreakpoint || 768}px) {
    display: none;
  }
`;

const ScreenReaderOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
`;

// ========================================================================
// ICONS
// ========================================================================

/**
 * ArrowIcon - Used for submenu expansion
 */
const ArrowIcon = React.memo(() => (
  <svg 
    width="12" 
    height="12" 
    viewBox="0 0 12 12" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    aria-hidden="true"
    focusable="false"
  >
    <path 
      d="M2 4L6 8L10 4" 
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
));
ArrowIcon.displayName = 'ArrowIcon';

/**
 * HamburgerIcon - Used for mobile menu toggle
 */
const HamburgerIcon = React.memo(() => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 20 20" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    aria-hidden="true"
    focusable="false"
  >
    <path 
      d="M3 5H17M3 10H17M3 15H17" 
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
));
HamburgerIcon.displayName = 'HamburgerIcon';

/**
 * CloseIcon - Used for mobile menu close button
 */
const CloseIcon = React.memo(() => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 20 20" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    aria-hidden="true"
    focusable="false"
  >
    <path 
      d="M15 5L5 15M5 5L15 15" 
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
));
CloseIcon.displayName = 'CloseIcon';

// ========================================================================
// ANIMATION VARIANTS
// ========================================================================

const ANIMATIONS = {
  arrow: {
    closed: { rotate: 0 },
    open: { 
      rotate: 180,
      transition: { duration: 0.3 }
    }
  },
  
  submenu: {
    hidden: { 
      height: 0,
      opacity: 0,
      transition: {
        height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
        opacity: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
      }
    },
    visible: { 
      height: 'auto',
      opacity: 1,
      transition: {
        height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
        opacity: { duration: 0.3, ease: [0.4, 0, 0.2, 1], delay: 0.1 }
      }
    }
  },
  
  overlay: {
    hidden: {
      opacity: 0,
      transition: {
        duration: 0.2
      }
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  }
};

// ========================================================================
// COMPONENT: SUBMENU ITEM
// ========================================================================

interface SubmenuItemProps {
  item: NavItem;
  isActive: boolean;
  showDescription?: boolean;
  accentColor?: string;
  textColor?: string;
  onClick?: () => void;
}

/**
 * Renders a submenu item with optional description
 */
const SubmenuItem = React.memo(({
  item,
  isActive,
  showDescription = false,
  accentColor,
  textColor,
  onClick
}: SubmenuItemProps) => {
  return (
    <>
      <NavLinkContainer $isActive={isActive} $accentColor={accentColor} $textColor={textColor}>
        <Link href={item.href} passHref legacyBehavior>
          <NavLink
            $isActive={isActive}
            $accentColor={accentColor}
            $textColor={textColor}
            onClick={onClick}
          >
            <NavItemContent>
              {item.icon && (
                <NavItemIcon>{item.icon}</NavItemIcon>
              )}
              <NavItemLabel>{item.label}</NavItemLabel>
            </NavItemContent>
          </NavLink>
        </Link>
      </NavLinkContainer>
      
      {showDescription && item.description && (
        <NavDescription>{item.description}</NavDescription>
      )}
    </>
  );
});

SubmenuItem.displayName = 'SubmenuItem';

// ========================================================================
// COMPONENT: NAV ITEM
// ========================================================================

interface NavItemProps {
  item: NavItem;
  isActive: boolean;
  activeItemId: string | null;
  setActiveItemId: (id: string | null) => void;
  showDescription?: boolean;
  accentColor?: string;
  textColor?: string;
  onMobileItemClick?: () => void;
}

/**
 * Renders a navigation item with expandable submenu
 */
const NavItemComponent = React.memo(({
  item,
  isActive,
  activeItemId,
  setActiveItemId,
  showDescription = false,
  accentColor,
  textColor,
  onMobileItemClick
}: NavItemProps) => {
  const hasSubmenu = Array.isArray(item.submenu) && item.submenu.length > 0;
  const isExpanded = activeItemId === item.id;
  
  const handleToggle = useCallback(() => {
    // Toggle submenu expansion
    setActiveItemId(activeItemId === item.id ? null : item.id);
  }, [activeItemId, item.id, setActiveItemId]);
  
  return (
    <NavItemWrapper>
      {/* Main nav item */}
      <NavLinkContainer $isActive={isActive} $accentColor={accentColor} $textColor={textColor}>
        {hasSubmenu ? (
          <NavButton
            $isActive={isActive || isExpanded}
            $accentColor={accentColor}
            $textColor={textColor}
            onClick={handleToggle}
            aria-expanded={isExpanded}
            aria-controls={`submenu-${item.id}`}
          >
            <NavItemContent>
              {item.icon && (
                <NavItemIcon>{item.icon}</NavItemIcon>
              )}
              <NavItemLabel>{item.label}</NavItemLabel>
            </NavItemContent>
            
            {hasSubmenu && (
              <NavItemArrow
                $isActive={isActive || isExpanded}
                $accentColor={accentColor}
                variants={ANIMATIONS.arrow}
                initial="closed"
                animate={isExpanded ? "open" : "closed"}
              >
                <ArrowIcon />
                <ScreenReaderOnly>
                  {isExpanded ? 'Collapse' : 'Expand'} {item.label} menu
                </ScreenReaderOnly>
              </NavItemArrow>
            )}
          </NavButton>
        ) : (
          <Link href={item.href} passHref legacyBehavior>
            <NavLink
              $isActive={isActive}
              $accentColor={accentColor}
              $textColor={textColor}
              onClick={onMobileItemClick}
            >
              <NavItemContent>
                {item.icon && (
                  <NavItemIcon>{item.icon}</NavItemIcon>
                )}
                <NavItemLabel>{item.label}</NavItemLabel>
              </NavItemContent>
            </NavLink>
          </Link>
        )}
      </NavLinkContainer>
      
      {/* Description (only for items without submenu) */}
      {!hasSubmenu && showDescription && item.description && (
        <NavDescription>{item.description}</NavDescription>
      )}
      
      {/* Submenu */}
      {hasSubmenu && (
        <AnimatePresence initial={false}>
          {isExpanded && (
            <SubmenuContainer
              id={`submenu-${item.id}`}
              $isActive={isActive}
              $accentColor={accentColor}
              variants={ANIMATIONS.submenu}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {Array.isArray(item.submenu) && item.submenu.map((subItem) => (
                <SubmenuItem
                  key={subItem.id}
                  item={subItem}
                  isActive={isActive || isExpanded}
                  showDescription={showDescription}
                  accentColor={accentColor}
                  textColor={textColor}
                  onClick={onMobileItemClick}
                />
              ))}
            </SubmenuContainer>
          )}
        </AnimatePresence>
      )}
    </NavItemWrapper>
  );
});

NavItemComponent.displayName = 'NavItemComponent';

// ========================================================================
// MAIN COMPONENT: LEFT SIDEBAR
// ========================================================================

/**
 * LeftSidebar Component
 * 
 * A responsive sidebar navigation component with nested submenus,
 * mobile view, and elegant animations.
 */
const LeftSidebar: React.FC<LeftSidebarProps> = ({
  items = [],
  title = 'Navigation',
  logo,
  className = '',
  showDescriptions = false,
  width = '250px',
  mobileBreakpoint = 768,
  showOnMobileByDefault = false,
  fixed = true,
  zIndex = 40,
  accentColor,
  textColor,
  autoHighlight = true,
  ariaLabel = 'Main Navigation'
}) => {
  const pathname = usePathname();
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(showOnMobileByDefault);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  
  // Check if path matches the given href
  const isPathActive = useCallback((href: string): boolean => {
    if (!pathname || !autoHighlight) return false;
    
    // Exact match
    if (pathname === href) return true;
    
    // Check if current path is a child of the nav item path
    // but make sure we're not matching partial segments
    if (href !== '/' && pathname.startsWith(href)) {
      const nextChar = pathname.charAt(href.length);
      // Check if we're at a path boundary (end or followed by slash)
      return nextChar === '' || nextChar === '/';
    }
    
    return false;
  }, [pathname, autoHighlight]);
  
  // Find active item and expand parent if needed
  useEffect(() => {
    if (!autoHighlight || !pathname) return;
    
    // Function to search for active item in menu structure
    const findActiveItem = (items: NavItem[]): boolean => {
      for (const item of items) {
        // Check if item path is active
        if (isPathActive(item.href)) {
          return true;
        }
        
        // Check submenu
        if (item.submenu && item.submenu.length > 0) {
          const hasActiveChild = findActiveItem(item.submenu);
          
          if (hasActiveChild) {
            // Expand parent item with active child
            setActiveItemId(item.id);
            return true;
          }
        }
      }
      
      return false;
    };
    
    findActiveItem(items);
  }, [items, pathname, isPathActive, autoHighlight]);
  
  // Handle mobile view detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= mobileBreakpoint);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [mobileBreakpoint]);
  
  // Handle esc key to close mobile menu
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [mobileMenuOpen]);
  
  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileMenuOpen &&
        mobileNavRef.current &&
        !mobileNavRef.current.contains(e.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);
  
  // Handle mobile menu toggle
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);
  
  // Close mobile menu when a navigation item is clicked
  const handleMobileItemClick = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);
  
  return (
    <>
      {/* Mobile Toggle Button */}
      <MobileToggle
        $isActive={mobileMenuOpen}
        $isOpen={mobileMenuOpen}
        $zIndex={zIndex}
        $accentColor={accentColor}
        $textColor={textColor}
        onClick={toggleMobileMenu}
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-sidebar"
        aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
      >
        {mobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
      </MobileToggle>
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <SidebarOverlay
            $isOpen={mobileMenuOpen}
            $mobileBreakpoint={mobileBreakpoint}
            $zIndex={zIndex}
            variants={ANIMATIONS.overlay}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Main Sidebar */}
      <SidebarContainer
        ref={isMobile ? undefined : sidebarRef}
        className={className}
        $width={width}
        $isMobile={isMobile}
        $isOpen={mobileMenuOpen}
        $fixed={fixed}
        $zIndex={zIndex}
        $mobileBreakpoint={mobileBreakpoint}
        id={isMobile ? undefined : 'desktop-sidebar'}
        role="complementary"
        aria-label="Sidebar navigation"
      >
        <SidebarContent>
          {/* Header with Title and Logo */}
          <SidebarHeader>
            {logo && (
              <LogoContainer>
                {logo}
              </LogoContainer>
            )}
            <SidebarTitle>{title}</SidebarTitle>
          </SidebarHeader>
          
          {/* Navigation Items */}
          <NavItemsContainer role="navigation" aria-label={ariaLabel}>
            {items.map((item) => (
              <NavItemComponent
                key={item.id}
                item={item}
                isActive={isPathActive(item.href)}
                activeItemId={activeItemId}
                setActiveItemId={setActiveItemId}
                showDescription={showDescriptions}
                accentColor={accentColor}
                textColor={textColor}
                onMobileItemClick={isMobile ? handleMobileItemClick : undefined}
              />
            ))}
          </NavItemsContainer>
        </SidebarContent>
      </SidebarContainer>
      
      {/* Mobile Navigation */}
      {isMobile && (
        <MobileNav
          ref={mobileNavRef}
          $isOpen={mobileMenuOpen}
          $zIndex={zIndex}
          $mobileBreakpoint={mobileBreakpoint}
          id="mobile-sidebar"
          role="complementary"
          aria-label="Mobile navigation"
        >
          <SidebarContent>
            {/* Header with Title and Logo */}
            <SidebarHeader>
              {logo && (
                <LogoContainer>
                  {logo}
                </LogoContainer>
              )}
              <SidebarTitle>{title}</SidebarTitle>
            </SidebarHeader>
            
            {/* Navigation Items */}
            <NavItemsContainer role="navigation" aria-label={ariaLabel}>
              {items.map((item) => (
                <NavItemComponent
                  key={item.id}
                  item={item}
                  isActive={isPathActive(item.href)}
                  activeItemId={activeItemId}
                  setActiveItemId={setActiveItemId}
                  showDescription={showDescriptions}
                  accentColor={accentColor}
                  textColor={textColor}
                  onMobileItemClick={handleMobileItemClick}
                />
              ))}
            </NavItemsContainer>
          </SidebarContent>
        </MobileNav>
      )}
    </>
  );
};

export default React.memo(LeftSidebar);