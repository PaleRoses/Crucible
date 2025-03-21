import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import styled from 'styled-components';
import { usePathname } from 'next/navigation';

import { NavigationBarProps, defaultNavItems, EnhancedNavItem } from './types';
import { MoonIcon } from './icons';
import { NavContext, NavItemComponent } from './HorizontalGridDrop';
import { MobileMenuComponent } from './MobileLogic';

// ==========================================================
// Styled Components
// ==========================================================

const NavContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  backdrop-filter: blur(8px);
  background: rgba(8, 8, 8, 0.7); /* Reduced transparency */
  padding: 0 1.5rem;
  height: 60px; /* Reduced height */
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.3s ease;

  &:hover {
    background: rgba(8, 8, 8, 0.8);
  }
  
  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const NavContent = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  max-width: auto;
  margin: 0 auto;
  justify-content: center; /* Center the navigation elements */
`;

const LogoContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  position: absolute;
  left: 1.5rem;
  
  @media (max-width: 768px) {
    left: 1rem;
  }
`;

const LogoLink = styled.div`
  display: flex;
  align-items: center;
  color: var(--gold);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  
  &:hover {
    color: var(--gold-light);
    filter: drop-shadow(0 0 2px rgba(191, 173, 127, 0.5));
  }
`;

const NavItemsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 3.5rem; /* Increased spacing between items */
  
  @media (max-width: 768px) {
    display: none;
  }
`;

// ==========================================================
// Main NavigationBar Component
// ==========================================================

/**
 * Main NavigationBar Component
 * 
 * A responsive navigation bar with hover-triggered dropdown menus.
 * Features glass morphism effect, integrated submenu headers, and smooth animations.
 * 
 * @param {NavigationBarProps} props - Component properties
 * @returns {JSX.Element} - The rendered navigation bar
 */
const NavigationBar: React.FC<NavigationBarProps> = ({ 
  items = defaultNavItems 
}) => {
  // Transform items to use actual icon components
  const navItems: EnhancedNavItem[] = items.map(item => ({
    ...item,
    submenu: item.submenu.map(subItem => ({
      ...subItem
    }))
  }));
  
  // Track current pathname for highlighting active navigation
  const pathname = usePathname();
  
  // State for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // State for tracking which submenu is open
  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);
  
  // Check if route matches the current path
  const isActiveRoute = useCallback((href: string) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  }, [pathname]);
  
  // Toggle mobile menu open/closed
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Fix for RulesIcon SVG path (if needed)
  useEffect(() => {
    const fixSvgPath = () => {
      const rulesIcons = document.querySelectorAll('path[d="M13 2H3C2.45 2 2 2.45 2 3V13C13 13.55 2.45 14 3 14H13C13.55 14 14 13.55 14 13V3C14 2.45 13.55 2 13 2ZM7 12H4V10H7V12ZM7 9H4V7H7V9ZM7 6H4V4H7V6ZM12 12H8V10H12V12ZM12 9H8V7H12V9ZM12 6H8V4H12V6Z"]');
      
      rulesIcons.forEach(icon => {
        icon.setAttribute('d', 'M13 2H3C2.45 2 2 2.45 2 3V13C3 13.55 3.45 14 4 14H13C13.55 14 14 13.55 14 13V3C14 2.45 13.55 2 13 2ZM7 12H4V10H7V12ZM7 9H4V7H7V9ZM7 6H4V4H7V6ZM12 12H8V10H12V12ZM12 9H8V7H12V9ZM12 6H8V4H12V6Z');
      });
    };
    
    // Run after component mount
    fixSvgPath();
    
    // Also run after any DOM updates that might affect SVGs
    const observer = new MutationObserver(fixSvgPath);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, []);

  return (
    <NavContext.Provider value={{ openSubmenuId, setOpenSubmenuId }}>
      <NavContainer>
        <NavContent>
          {/* Logo */}
          <LogoContainer 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/" passHref>
              <LogoLink>
                <MoonIcon />
              </LogoLink>
            </Link>
          </LogoContainer>

          {/* Desktop Navigation */}
          <NavItemsContainer>
            {navItems.map((item) => (
              <NavItemComponent
                key={item.id}
                item={item}
                isActive={isActiveRoute(item.href)}
              />
            ))}
          </NavItemsContainer>

          {/* Mobile Menu */}
          <MobileMenuComponent 
            isOpen={isMobileMenuOpen}
            toggleMenu={toggleMobileMenu}
            items={navItems}
            isActiveRoute={isActiveRoute}
          />
        </NavContent>
      </NavContainer>
    </NavContext.Provider>
  );
};

export default NavigationBar;