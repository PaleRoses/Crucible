'use client';

import React, { useState, useCallback, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import Link from 'next/link';
import styled from 'styled-components';
import { usePathname, useRouter } from 'next/navigation';

// ==========================================================
// Types and Interfaces
// ==========================================================

/**
 * Basic navigation item interface
 */
interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  submenu: SubmenuItem[];
}

/**
 * Navigation submenu item interface
 */
interface SubmenuItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode | string;
  description?: string;
}

/**
 * Enhanced submenu item with optional description
 */
interface EnhancedSubmenuItem extends SubmenuItem {
  description?: string;
}

/**
 * Enhanced navigation item with enhanced submenu items
 */
interface EnhancedNavItem extends NavItem {
  submenu: EnhancedSubmenuItem[];
}

/**
 * Props for the main navigation bar component
 */
interface NavigationBarProps {
  items?: EnhancedNavItem[];
}

/**
 * Context type for managing which submenu is currently open
 */
interface NavContextType {
  openSubmenuId: string | null;
  setOpenSubmenuId: (id: string | null) => void;
}

/**
 * Props for styled components that need to know if a route is active
 */
interface ActiveProps {
  $isActive: boolean;
}

/**
 * Additional descriptions for submenu sections
 */
const submenuDescriptions: Record<string, string> = {
  codex: "Explore the foundational elements of our world including rules, lore, and creator information.",
  cycles: "Navigate through current and previous story cycles in our evolving narrative.",
  characters: "Create new characters or revisit existing ones from past adventures."
};

/**
 * Default navigation items for the navigation bar
 */
const defaultNavItems: EnhancedNavItem[] = [
  {
    id: 'codex',
    label: 'CODEX',
    href: '/codex',
    submenu: [
      {
        id: 'rules',
        label: 'Rules',
        href: '/codex/rules',
        icon: 'RulesIcon',
        description: 'Core gameplay mechanics.'
      },
      {
        id: 'lore',
        label: 'Lore',
        href: '/codex/lore',
        icon: 'LoreIcon',
        description: 'Background stories and world history.'
      },
      {
        id: 'creators',
        label: 'Creators',
        href: '/codex/creators',
        icon: 'CreatorsIcon',
        description: 'Meet the minds behind the world.'
      }
    ]
  },
  {
    id: 'cycles',
    label: 'CYCLES',
    href: '/cycles',
    submenu: [
      {
        id: 'new-cycle',
        label: 'New Cycle',
        href: '/cycles/new',
        icon: 'NewCycleIcon',
        description: 'Paint a new world onto the empty canvas.'
      },
      {
        id: 'previous-cycle',
        label: 'Previous Cycle',
        href: '/cycles/previous',
        icon: 'PreviousCycleIcon',
        description: 'Revist a fading echo.'
      }
    ]
  },
  {
    id: 'characters',
    label: 'CHARACTERS',
    href: '/characters',
    submenu: [
      {
        id: 'new-character',
        label: 'New Character',
        href: '/characters/new',
        icon: 'NewCharacterIcon',
        description: 'Design a new protagonist for your adventures.'
      },
      {
        id: 'previous-character',
        label: 'Previous Character',
        href: '/characters/previous',
        icon: 'PreviousCharacterIcon',
        description: 'Browse characters from earlier campaigns.'
      }
    ]
  }
];

// Animation variants for framer-motion
const navItemVariants = {
  idle: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { 
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const arrowVariants = {
  closed: { rotate: 0 },
  open: { rotate: 180 }
};

const submenuVariants = {
  closed: { 
    opacity: 0,
    y: -5,
    scale: 0.98,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  open: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

const submenuItemVariants = {
  closed: { 
    opacity: 0, 
    y: -10
  },
  open: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

const mobileMenuVariants = {
  closed: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2
    }
  },
  open: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const mobileItemVariants = {
  closed: { 
    opacity: 0, 
    y: -10
  },
  open: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

// ==========================================================
// Context
// ==========================================================

// Context for navigation state
const NavContext = React.createContext<NavContextType>({
  openSubmenuId: null,
  setOpenSubmenuId: () => {},
});

// ==========================================================
// Icon Components
// ==========================================================

/**
 * Moon icon for the logo
 */
const MoonIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M3.32 11.68C3.32 16.95 7.61 21.24 12.88 21.24C16.65 21.24 19.93 18.99 21.38 15.74C21.83 14.74 21.27 14.2 20.2 14.47C19.33 14.68 18.38 14.8 17.35 14.8C11.35 14.8 6.5 9.95 6.5 3.95C6.5 2.92 6.62 1.97 6.83 1.1C7.1 0.03 6.56 -0.53 5.56 -0.08C2.31 1.37 3.32 6.41 3.32 11.68Z" 
      fill="currentColor" 
    />
  </svg>
);

/**
 * Arrow for dropdown indicators
 */
const ArrowIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M2 4L6 8L10 4" 
      stroke="currentColor"
      strokeWidth="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

/**
 * Rules icon for submenu items
 */
const RulesIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M13 2H3C2.45 2 2 2.45 2 3V13C2 13.55 2.45 14 3 14H13C13.55 14 14 13.55 14 13V3C14 2.45 13.55 2 13 2ZM7 12H4V10H7V12ZM7 9H4V7H7V9ZM7 6H4V4H7V6ZM12 12H8V10H12V12ZM12 9H8V7H12V9ZM12 6H8V4H12V6Z" 
      fill="currentColor" 
    />
  </svg>
);

/**
 * Lore icon for submenu items
 */
const LoreIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M12 2H4C3.45 2 3 2.45 3 3V13C3 13.55 3.45 14 4 14H12C12.55 14 13 13.55 13 13V3C13 2.45 12.55 2 12 2ZM11 6H8.5V10.5H7.5V6H5V5H11V6Z" 
      fill="currentColor" 
    />
  </svg>
);

/**
 * Creators icon for submenu items
 */
const CreatorsIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M8 8C9.1 8 10 7.1 10 6C10 4.9 9.1 4 8 4C6.9 4 6 4.9 6 6C6 7.1 6.9 8 8 8Z" 
      fill="currentColor" 
    />
    <path 
      d="M8 9C6.67 9 4 9.67 4 11V12H12V11C12 9.67 9.33 9 8 9Z" 
      fill="currentColor" 
    />
  </svg>
);

/**
 * New Cycle icon for submenu items
 */
const NewCycleIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M13 7H9V3H7V7H3V9H7V13H9V9H13V7Z" 
      fill="currentColor" 
    />
  </svg>
);

/**
 * Previous Cycle icon for submenu items
 */
const PreviousCycleIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M8 3C5.24 3 3 5.24 3 8C3 10.76 5.24 13 8 13C10.76 13 13 10.76 13 8H11C11 9.66 9.66 11 8 11C6.34 11 5 9.66 5 8C5 6.34 6.34 5 8 5V3Z" 
      fill="currentColor" 
    />
    <path d="M9 7L13 3V7H9Z" fill="currentColor" />
  </svg>
);

/**
 * New Character icon for submenu items
 */
const NewCharacterIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M10 7C11.1 7 12 6.1 12 5C12 3.9 11.1 3 10 3C8.9 3 8 3.9 8 5C8 6.1 8.9 7 10 7Z" 
      fill="currentColor" 
    />
    <path 
      d="M10 8C8.33 8 5 8.83 5 10.5V12H15V10.5C15 8.83 11.67 8 10 8Z" 
      fill="currentColor" 
    />
    <path d="M7 7H4V4H2V7H-1V9H2V12H4V9H7V7Z" fill="currentColor" />
  </svg>
);

/**
 * Previous Character icon for submenu items
 */
const PreviousCharacterIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M5 6C6.1 6 7 5.1 7 4C7 2.9 6.1 2 5 2C3.9 2 3 2.9 3 4C3 5.1 3.9 6 5 6Z" 
      fill="currentColor" 
    />
    <path 
      d="M5 7C3.33 7 0 7.83 0 9.5V11H10V9.5C10 7.83 6.67 7 5 7Z" 
      fill="currentColor" 
    />
    <path 
      d="M11 6C12.1 6 13 5.1 13 4C13 2.9 12.1 2 11 2C9.9 2 9 2.9 9 4C9 5.1 9.9 6 11 6Z" 
      fill="currentColor" 
    />
    <path 
      d="M16 9.5C16 7.83 12.67 7 11 7C10.42 7 9.54 7.1 8.66 7.29C9.5 7.9 10 8.7 10 9.5V11H16V9.5Z" 
      fill="currentColor" 
    />
  </svg>
);

/**
 * Get icon component by name
 */
const getIconByName = (iconName: string | undefined): React.ReactNode => {
  if (!iconName) return null;
  
  switch (iconName) {
    case 'RulesIcon':
      return <RulesIcon />;
    case 'LoreIcon':
      return <LoreIcon />;
    case 'CreatorsIcon':
      return <CreatorsIcon />;
    case 'NewCycleIcon':
      return <NewCycleIcon />;
    case 'PreviousCycleIcon':
      return <PreviousCycleIcon />;
    case 'NewCharacterIcon':
      return <NewCharacterIcon />;
    case 'PreviousCharacterIcon':
      return <PreviousCharacterIcon />;
    default:
      return null;
  }
};

// ==========================================================
// Styled Components - Base
// ==========================================================

// Base navbar styles - always visible regardless of JS loading state
const NavContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  backdrop-filter: blur(8px);
  background: rgba(8, 8, 8, 0.7);
  padding: 0 1.5rem;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.3s ease, opacity 0.3s ease;
  
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
  justify-content: center;
`;

// Remove conditional rendering for animations in LogoContainer
const LogoContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  position: absolute;
  left: 3rem; /* Moved slightly to the right */
  opacity: 1; /* Ensure visibility even before JS loads */
  
  @media (max-width: 768px) {
    left: 3rem; /* Kept consistent with desktop */
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
  gap: 3.5rem;
  opacity: 1; /* Ensure visibility even before JS loads */
  
  @media (max-width: 768px) {
    display: none;
  }
`;

// ==========================================================
// Styled Components - Desktop Navigation
// ==========================================================

const NavItemWrapper = styled.div`
  position: relative;
`;

const NavItem = styled(motion.div)<ActiveProps>`
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-heading);
  font-weight: 100;
  letter-spacing: 0.2em;
  font-size: 1rem;
  color: ${props => props.$isActive ? 'var(--gold)' : 'var(--color-text)'};
  opacity: 1; /* Ensure visibility even before JS loads */

  &:hover {
    color: var(--gold);
  }
`;

const NavItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NavItemIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${NavItem}:hover & {
    transform: scale(1.1);
    color: var(--gold);
  }
`;

const NavItemLabel = styled.span`
  text-transform: uppercase;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${NavItem}:hover & {
    color: var(--gold);
  }
`;

const NavItemArrow = styled(motion.div)`
  display: flex;
  align-items: center;
  margin-top: 2px;
`;

// ==========================================================
// Styled Components - Submenu
// ==========================================================

const SubmenuContainer = styled(motion.div)`
  position: fixed;
  top: 80%;
  left: 10%;
  right: 10%;
  align-items: center;
  width: 80%;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(50px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
              inset 0 1px 1px rgba(255, 255, 255, 0.05);
  z-index: 10;
  overflow: hidden;
  border: none;
`;

// Grid container that will include header, description, and items
const SubmenuGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  max-width: 1200px;
  margin: 0 auto;
`;

// Header is now a grid item spanning full width
const SubmenuHeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border-right: 1px solid rgba(191, 173, 127, 0.2);
`;

const SubmenuHeader = styled.div`
  font-family: var(--font-heading);
  color: var(--gold);
  font-size: 1.2rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
`;

const SubmenuDescription = styled.div`
  font-size: 0.8rem;
  color: rgba(224, 224, 224, 0.7);
  line-height: 1.4;
`;

const SubmenuItemWrapper = styled(motion.div)<ActiveProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  border-right: 1px solid rgba(191, 173, 127, 0.2);
  border-radius: var(--radius-small);
  padding: 1.5rem;
  cursor: pointer;
  color: ${props => props.$isActive ? 'var(--gold)' : 'rgba(224, 224, 224, 0.7)'};
  
  &:hover {
    background-color: rgba(191, 173, 127, 0.15);
    color: var(--gold-light);
    transform: scale(1.05);
    box-shadow: 0 0 5px rgba(191, 173, 127, 0.3);
  }
`;

const SubmenuItemLink = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  font-family: var(--font-heading);
  font-weight: 100;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
`;

const SubmenuItemIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gold);
  margin-bottom: 1.25rem;
  height: 100px;
  
  svg {
    width: 64px;
    height: 64px;
  }
`;

const SubmenuItemLabel = styled.span`
  font-size: 1.2rem;
  letter-spacing: 0.1em;
  font-weight: 400;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  transition: color 0.2s ease;
  
  ${SubmenuItemWrapper}:hover & {
    color: var(--gold);
  }
`;

const SubmenuItemDescription = styled.div`
  font-size: 0.75rem;
  color: rgba(224, 224, 224, 0.5);
  max-width: 200px;
  line-height: 1.4;
`;

// ==========================================================
// Styled Components - Mobile
// ==========================================================

const MobileMenuButton = styled.button`
  display: none;
  background: transparent;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  font-size: 1.5rem;
  position: absolute;
  left: 1rem; /* Moved to left side */
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MobileMenu = styled(motion.div)`
  display: none;
  position: fixed;
  top: 60px;
  width: 230px; /* Fixed width */
  left: 0;
  height: calc(100vh - 60px);
  background: rgba(8, 8, 8, 0.95);
  z-index: 99;
  overflow-y: auto;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileNavItems = styled(motion.div)`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 1rem;
`;

const MobileSubmenuContainer = styled(motion.div)`
  margin-top: 0.5rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0;
  background: rgba(10, 10, 10, 0.75);
`;



const MobileSubmenuItemWrapper = styled(motion.div)<ActiveProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0.6rem 1rem;
  cursor: pointer;
  color: ${props => props.$isActive ? 'rgba(46, 213, 115, 0.9)' : 'rgba(224, 224, 224, 0.7)'};
  transition: all 0.3s ease;
  font-size: 0.85rem;
  
  &:hover {
    background-color: rgba(46, 213, 115, 0.08);
    color: rgba(46, 213, 115, 0.9);
  }
`;

// ==========================================================
// Desktop Navigation Item Component
// ==========================================================

/**
 * Individual navigation item with hover-triggered dropdown
 */
const NavItemComponent: React.FC<{ 
  item: EnhancedNavItem; 
  isActive: boolean;
}> = ({ item, isActive }) => {
  const router = useRouter();
  const { openSubmenuId, setOpenSubmenuId } = useContext(NavContext);
  const isSubmenuOpen = openSubmenuId === item.id;
  const navItemRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Enhanced hover effects
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    setOpenSubmenuId(item.id);
    
    controls.start({
      color: 'var(--gold)',
      scale: 1.05,
      transition: { duration: 0.3 }
    });
  };

  const handleMouseLeave = () => {
    // Close immediately without timeout
    if (!isActive) {
      controls.start({
        color: 'var(--color-text)',
        scale: 1,
        transition: { duration: 0.3 }
      });
    }
    
    setOpenSubmenuId(null);
  };

  // Handle click for navigation
  const handleClick = () => {
    router.push(item.href);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <NavItemWrapper 
      ref={navItemRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <NavItem
        as={motion.div}
        $isActive={isActive}
        variants={navItemVariants}
        initial="idle"
        animate={controls}
        onClick={handleClick}
      >
        <NavItemContent>
          <NavItemIcon>
            {item.icon}
          </NavItemIcon>
          <NavItemLabel>
            {item.label}
          </NavItemLabel>
        </NavItemContent>
        
        <NavItemArrow
          variants={arrowVariants}
          initial="closed"
          animate={isSubmenuOpen ? "open" : "closed"}
        >
          <ArrowIcon />
        </NavItemArrow>
      </NavItem>

      <AnimatePresence>
        {isSubmenuOpen && (
          <SubmenuContainer
            ref={submenuRef}
            variants={submenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <SubmenuGridContainer>
              <SubmenuHeaderContainer>
                <SubmenuHeader>{item.label}</SubmenuHeader>
                <SubmenuDescription>
                  {submenuDescriptions[item.id as keyof typeof submenuDescriptions]}
                </SubmenuDescription>
              </SubmenuHeaderContainer>
              
              {item.submenu.map((subItem) => (
                <SubmenuItemWrapper
                  key={subItem.id}
                  as={motion.div}
                  $isActive={false}
                  variants={submenuItemVariants}
                  onClick={() => {
                    setOpenSubmenuId(null);
                    router.push(subItem.href);
                  }}
                >
                  <SubmenuItemLink as="div">
                    <SubmenuItemIcon>
                      {typeof subItem.icon === 'string' 
                        ? getIconByName(subItem.icon as string)
                        : subItem.icon}
                    </SubmenuItemIcon>
                    <SubmenuItemLabel>{subItem.label}</SubmenuItemLabel>
                    {subItem.description && (
                      <SubmenuItemDescription>
                        {subItem.description}
                      </SubmenuItemDescription>
                    )}
                  </SubmenuItemLink>
                </SubmenuItemWrapper>
              ))}
            </SubmenuGridContainer>
          </SubmenuContainer>
        )}
      </AnimatePresence>
    </NavItemWrapper>
  );
};

// ==========================================================
// Mobile Navigation Components
// ==========================================================

/**
 * Mobile navigation item with accordion-style dropdown
 */
const MobileNavItemComponent: React.FC<{ 
  item: EnhancedNavItem; 
  isActive: boolean; 
}> = ({ item, isActive }) => {
  const router = useRouter();
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);

  return (
    <motion.div 
      variants={mobileItemVariants}
    >
      <NavItem
        $isActive={isActive}
        onClick={() => setIsSubmenuOpen(!isSubmenuOpen)}
        style={{ fontSize: '0.9rem' }} // Smaller text
      >
        <NavItemContent>
          <NavItemLabel>
            {item.label}
          </NavItemLabel>
        </NavItemContent>
        
        <NavItemArrow
          variants={arrowVariants}
          initial="closed"
          animate={isSubmenuOpen ? "open" : "closed"}
        >
          <ArrowIcon />
        </NavItemArrow>
      </NavItem>

      <AnimatePresence>
        {isSubmenuOpen && (
          <MobileSubmenuContainer
            variants={submenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {item.submenu.map((subItem) => (
              <MobileSubmenuItemWrapper
                key={subItem.id}
                as={motion.div}
                $isActive={false}
                variants={submenuItemVariants}
                onClick={() => router.push(subItem.href)}
              >
                <SubmenuItemLink style={{ flexDirection: 'row', fontSize: '0.85rem' }}>
                  <SubmenuItemLabel style={{ fontSize: '0.85rem', margin: 0 }}>
                    {subItem.label}
                  </SubmenuItemLabel>
                </SubmenuItemLink>
              </MobileSubmenuItemWrapper>
            ))}
          </MobileSubmenuContainer>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * Mobile menu container with toggle button
 */
const MobileMenuComponent: React.FC<{
  isOpen: boolean;
  toggleMenu: () => void;
  items: EnhancedNavItem[];
  isActiveRoute: (href: string) => boolean;
  isClient: boolean;
}> = ({ isOpen, toggleMenu, items, isActiveRoute, isClient }) => {
  if (!isClient) return null;
  
  return (
    <>
      <MobileMenuButton onClick={toggleMenu}>
        {isOpen ? '✕' : '☰'}
      </MobileMenuButton>

      <AnimatePresence>
        {isOpen && (
          <MobileMenu
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <MobileNavItems>
              {items.map((item) => (
                <MobileNavItemComponent
                  key={item.id}
                  item={item}
                  isActive={isActiveRoute(item.href)}
                />
              ))}
            </MobileNavItems>
          </MobileMenu>
        )}
      </AnimatePresence>
    </>
  );
};

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
  // Add state to track client-side rendering
  const [isClient, setIsClient] = useState(false);
  
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

  // Use effect for client-side initialization
  useEffect(() => {
    // Set isClient to true after component mounts
    setIsClient(true);
    
    // Fix for RulesIcon SVG path (once, not with observer)
    const fixSvgPath = () => {
      const rulesIcons = document.querySelectorAll('path[d="M13 2H3C2.45 2 2 2.45 2 3V13C13 13.55 2.45 14 3 14H13C13.55 14 14 13.55 14 13V3C14 2.45 13.55 2 13 2ZM7 12H4V10H7V12ZM7 9H4V7H7V9ZM7 6H4V4H7V6ZM12 12H8V10H12V12ZM12 9H8V7H12V9ZM12 6H8V4H12V6Z"]');
      
      rulesIcons.forEach(icon => {
        icon.setAttribute('d', 'M13 2H3C2.45 2 2 2.45 2 3V13C2 13.55 2.45 14 3 14H13C13.55 14 14 13.55 14 13V3C14 2.45 13.55 2 13 2ZM7 12H4V10H7V12ZM7 9H4V7H7V9ZM7 6H4V4H7V6ZM12 12H8V10H12V12ZM12 9H8V7H12V9ZM12 6H8V4H12V6Z');
      });
    };
    
    // Run after component mount (only once)
    fixSvgPath();
  }, []);

  // Return null when not on client
  if (!isClient) return null;

  return (
    <NavContext.Provider value={{ openSubmenuId, setOpenSubmenuId }}>
      <NavContainer>
        <NavContent>
          {/* Logo */}
          <LogoContainer 
            initial={{ opacity: 1, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
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
            isClient={isClient}
          />
        </NavContent>
      </NavContainer>
    </NavContext.Provider>
  );
};

export default NavigationBar;