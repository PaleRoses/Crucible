'use client';

import React, { useState, useCallback, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import Link from 'next/link';
import styled from 'styled-components';
import { usePathname, useRouter } from 'next/navigation';

// ==========================================================
// TYPES & INTERFACES
// ==========================================================

/**
 * Base menu item interface with shared properties
 */
interface BaseMenuItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode | string;
}

/**
 * Submenu item with optional description
 */
interface SubmenuItem extends BaseMenuItem {
  description?: string;
}

/**
 * Navigation item with submenu
 */
interface NavItem extends BaseMenuItem {
  submenu: SubmenuItem[];
}

/**
 * Props for the main navigation bar component
 */
interface NavigationBarProps {
  items?: NavItem[];
  ariaLabel?: string; // Added prop for navigation ARIA label
}

/**
 * Context type for managing navigation state
 */
interface NavContextType {
  activeItemId: string | null;
  setActiveItemId: (id: string | null) => void;
  visible?: boolean;
  // Added for keyboard navigation
  focusedItemId: string | null;
  setFocusedItemId: (id: string | null) => void;
}

/**
 * Props for styled components that need to know if a route is active
 */
interface ActiveProps {
  $isActive: boolean;
}

// ==========================================================
// CONSTANTS
// ==========================================================

/**
 * Additional descriptions for submenu sections
 */
const SUBMENU_DESCRIPTIONS: Record<string, string> = {
  codex: "Explore the foundational elements of our world including rules, lore, and creator information.",
  cycles: "Navigate through current and previous story cycles in our evolving narrative.",
  characters: "Create new characters or revisit existing ones from past adventures."
};

/**
 * Default navigation items for the navigation bar
 */
const DEFAULT_NAV_ITEMS: NavItem[] = [
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

// ==========================================================
// ANIMATION VARIANTS
// ==========================================================

/**
 * Animation variants for different components
 */
const ANIMATIONS = {
  navItem: {
    idle: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    }
  },
  
  arrow: {
    closed: { rotate: 0, y: 0 },
    open: { 
      rotate: 180, 
      y: [0, 2, 0], // Small bounce down
      transition: {
        y: {
          duration: 0.3,
          repeat: 0
        },
        rotate: {
          duration: 0.3
        }
      }
    }
  },
  
  submenu: {
    initial: { 
      opacity: 1,
      y: 0,
      scale: 1
    },
    animate: { 
      opacity: 1,
      y: 0,
      scale: 1
    },
    exit: { 
      opacity: 0,
      y: -15,
      scale: 0.97,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  },
  
  submenuContent: {
    initial: { 
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 1, 1]
      } 
    },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    exit: { 
      opacity: 0,
      x: 20,
      transition: { 
        duration: 0.2, 
        ease: [0.4, 0, 1, 1] 
      }
    },
    // Enhanced slide variants that respect exit states
    slideRight: {
      initial: {
        opacity: 0,
        x: -40,
        transition: {
          duration: 0.2,
          ease: [0.4, 0, 1, 1]
        }
      },
      animate: {
        opacity: 1,
        x: 0,
        transition: {
          duration: 0.3,
          ease: [0.16, 1, 0.3, 1]
        }
      },
      exit: {
        opacity: 0,
        x: 40,
        transition: {
          duration: 0.2,
          ease: [0.4, 0, 1, 1]
        }
      }
    },
    slideLeft: {
      initial: {
        opacity: 0,
        x: 40,
        transition: {
          duration: 0.2,
          ease: [0.4, 0, 1, 1]
        }
      },
      animate: {
        opacity: 1,
        x: 0,
        transition: {
          duration: 0.3,
          ease: [0.16, 1, 0.3, 1]
        }
      },
      exit: {
        opacity: 0,
        x: -40,
        transition: {
          duration: 0.2,
          ease: [0.4, 0, 1, 1]
        }
      }
    }
  },
  
  submenuItem: {
    initial: { 
      opacity: 0, 
      y: -5,
      scale: 0.97,
      transition: {
        duration: 0.1
      } 
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        mass: 0.8
      }
    }
  },
  
  mobileMenu: {
    closed: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 }
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
  }
};

// ==========================================================
// CONTEXT
// ==========================================================

// Context for navigation state
const NavContext = React.createContext<NavContextType>({
  activeItemId: null,
  setActiveItemId: () => {},
  visible: true,
  focusedItemId: null,
  setFocusedItemId: () => {}
});

// ==========================================================
// ICON COMPONENTS
// ==========================================================

/**
 * Icon components map for easy access
 * Each icon is memoized with React.memo to prevent unnecessary re-renders
 * since these are pure components that only render based on their props
 */
const ICONS: Record<string, React.FC> = {
  // Memoized MoonIcon component
  MoonIcon: React.memo(() => (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true" // Hide decorative icons from screen readers
      focusable="false"  // Prevent tab focus on SVG
    >
      <defs>
        <mask id="moonMask">
          <rect x="0" y="0" width="24" height="24" fill="white" />
          <circle cx="14.4" cy="12" r="9" fill="black" />
        </mask>
      </defs>
      <circle cx="12" cy="12" r="10.8" fill="currentColor" mask="url(#moonMask)" />
    </svg>
  )),
  
  // Memoized ArrowIcon component
  ArrowIcon: React.memo(() => (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 12 12" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      aria-hidden="true"
      focusable="false"
    >
      <path 
        d="M2 4L6 8L10 4" 
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )),
  
  // Memoized RulesIcon component
  RulesIcon: React.memo(() => (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path 
        d="M13 2H3C2.45 2 2 2.45 2 3V13C2 13.55 2.45 14 3 14H13C13.55 14 14 13.55 14 13V3C14 2.45 13.55 2 13 2ZM7 12H4V10H7V12ZM7 9H4V7H7V9ZM7 6H4V4H7V6ZM12 12H8V10H12V12ZM12 9H8V7H12V9ZM12 6H8V4H12V6Z" 
        fill="currentColor" 
      />
    </svg>
  )),
  
  // Memoized LoreIcon component
  LoreIcon: React.memo(() => (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path 
        d="M12 2H4C3.45 2 3 2.45 3 3V13C3 13.55 3.45 14 4 14H12C12.55 14 13 13.55 13 13V3C13 2.45 12.55 2 12 2ZM11 6H8.5V10.5H7.5V6H5V5H11V6Z" 
        fill="currentColor" 
      />
    </svg>
  )),
  
  // Memoized CreatorsIcon component
  CreatorsIcon: React.memo(() => (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path 
        d="M8 8C9.1 8 10 7.1 10 6C10 4.9 9.1 4 8 4C6.9 4 6 4.9 6 6C6 7.1 6.9 8 8 8Z" 
        fill="currentColor" 
      />
      <path 
        d="M8 9C6.67 9 4 9.67 4 11V12H12V11C12 9.67 9.33 9 8 9Z" 
        fill="currentColor" 
      />
    </svg>
  )),
  
  // Memoized NewCycleIcon component
  NewCycleIcon: React.memo(() => (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path 
        d="M13 7H9V3H7V7H3V9H7V13H9V9H13V7Z" 
        fill="currentColor" 
      />
    </svg>
  )),
  
  // Memoized PreviousCycleIcon component
  PreviousCycleIcon: React.memo(() => (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path 
        d="M8 3C5.24 3 3 5.24 3 8C3 10.76 5.24 13 8 13C10.76 13 13 10.76 13 8H11C11 9.66 9.66 11 8 11C6.34 11 5 9.66 5 8C5 6.34 6.34 5 8 5V3Z" 
        fill="currentColor" 
      />
      <path d="M9 7L13 3V7H9Z" fill="currentColor" />
    </svg>
  )),
  
  // Memoized NewCharacterIcon component
  NewCharacterIcon: React.memo(() => (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
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
  )),
  
  // Memoized PreviousCharacterIcon component
  PreviousCharacterIcon: React.memo(() => (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
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
  ))
};

// Add display names to all icon components
ICONS.MoonIcon.displayName = 'MoonIcon';
ICONS.ArrowIcon.displayName = 'ArrowIcon';
ICONS.RulesIcon.displayName = 'RulesIcon';
ICONS.LoreIcon.displayName = 'LoreIcon';
ICONS.CreatorsIcon.displayName = 'CreatorsIcon';
ICONS.NewCycleIcon.displayName = 'NewCycleIcon';
ICONS.PreviousCycleIcon.displayName = 'PreviousCycleIcon';
ICONS.NewCharacterIcon.displayName = 'NewCharacterIcon';
ICONS.PreviousCharacterIcon.displayName = 'PreviousCharacterIcon';

/**
 * Get icon component by name
 * Regular function since hooks can't be used at the top level
 */
const getIconByName = (iconName: string | undefined): React.ReactNode => {
  if (!iconName) return null;
  
  const IconComponent = ICONS[iconName as keyof typeof ICONS];
  return IconComponent ? <IconComponent /> : null;
};

// ==========================================================
// STYLED COMPONENTS - BASE
// ==========================================================

const NavContainer = styled.nav<{ $visible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(8, 8, 8, 0.65); /* Made darker for more solid appearance */
  padding: 0 1.5rem;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: transform 0.3s ease, background-color 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease;
  transform: translateY(${props => props.$visible ? '0' : '-100%'});
  opacity: ${props => props.$visible ? '1' : '0'};
  box-shadow: ${props => props.$visible ? '0 8px 16px -2px rgba(0, 0, 0, 0.15)' : 'none'};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(8, 8, 8, 0.08) 0%,
      rgba(8, 8, 8, 0.18) 100%
    );
    pointer-events: none;
  }
  
  &:hover {
    background: rgba(8, 8, 8, 0.75);
  }
  
  @media (max-width: 768px) {
    display: none; /* Hide completely on mobile */
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

const LogoContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  position: absolute;
  left: 3rem;
  opacity: 1;
  
  @media (max-width: 768px) {
    display: none;
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
  gap: 1rem;
  opacity: 1;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

// ==========================================================
// STYLED COMPONENTS - SHARED
// ==========================================================

const NavItemBase = styled(motion.div)<ActiveProps>`
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-heading);
  font-weight: 100;
  color: ${props => props.$isActive ? 'var(--gold)' : 'var(--color-text)'};
  
  &:hover {
    color: var(--gold);
  }
  
  &:focus-visible {
    outline: 2px solid var(--gold);
    outline-offset: 2px;
    border-radius: 2px;
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
`;

const NavItemLabel = styled.span`
  text-transform: uppercase;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const NavItemArrow = styled(motion.div)`
  display: flex;
  align-items: center;
  margin-top: 2px;
`;

// Screen reader only text (visually hidden but accessible to screen readers)
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

// ==========================================================
// STYLED COMPONENTS - DESKTOP NAVIGATION
// ==========================================================

const NavItemWrapper = styled.div`
  position: relative;
`;

const DesktopNavItem = styled(NavItemBase)`
  letter-spacing: 0.2em;
  font-size: 1rem;
`;

// ==========================================================
// STYLED COMPONENTS - SUBMENU
// ==========================================================

const GlobalSubmenuContainer = styled(motion.div)`
  position: fixed;
  top: 45px;
  left: 0;
  width: 100%;
  z-index: 9;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  pointer-events: none;
`;

const SubmenuContainer = styled(motion.div)`
  background: rgba(10, 10, 10, 0.98); /* More solid background */
  backdrop-filter: blur(50px);
  border-radius: 6px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5),
              inset 0 1px 1px rgba(255, 255, 255, 0.05),
              0 0 12px rgba(191, 173, 127, 0.3);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  pointer-events: auto;
  will-change: transform, opacity;
  width: 80%;
  max-width: 1200px;
  transform-origin: top center;
`;

const SubmenuGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  width: 100%;
`;

const SubmenuHeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1.75rem;
  border-right: 1px solid rgba(191, 173, 127, 0.2);
`;

const SubmenuHeader = styled.div`
  font-family: var(--font-heading);
  color: var(--gold);
  font-size: 1.25rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
`;

const SubmenuDescription = styled.div`
  font-size: 0.85rem;
  color: rgba(224, 224, 224, 0.7);
  line-height: 1.4;
`;

const SubmenuContentContainer = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  width: 100%;
`;

const SubmenuItemWrapper = styled(motion.div)<ActiveProps>`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  border-right: 1px solid rgba(191, 173, 127, 0.15);
  border-radius: var(--radius-small);
  padding: 1.75rem;
  cursor: pointer;
  color: ${props => props.$isActive ? 'var(--gold)' : 'rgba(224, 224, 224, 0.7)'};
  text-align: left;
  will-change: transform, background-color;
  
  &:hover {
    background-color: rgba(191, 173, 127, 0.1);
    color: var(--gold-light);
    transform: scale(1.03);
    box-shadow: 0 0 5px rgba(191, 173, 127, 0.2);
  }
  
  &:focus-visible {
    outline: 2px solid var(--gold);
    outline-offset: 2px;
    background-color: rgba(191, 173, 127, 0.15);
  }
`;

const SubmenuItemLink = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  font-family: var(--font-heading);
  font-weight: 100;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
`;

const SubmenuItemIcon = styled.div`
  display: flex;
  align-self: center;
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
  font-size: 0.8rem;
  color: rgba(224, 224, 224, 0.5);
  max-width: 200px;
  line-height: 1.4;
`;

// ==========================================================
// STYLED COMPONENTS - MOBILE
// ==========================================================

const MobileMenuButton = styled.button<{ $visible?: boolean }>`
  display: none;
  background: transparent;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  font-size: 1.5rem;
  position: fixed; /* Always fixed position to keep it visible */
  top: 10px;
  left: 1rem;
  z-index: 101; /* Higher than other elements */
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  &:focus-visible {
    outline: 2px solid var(--gold);
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

const MobileMenu = styled(motion.div)`
  display: none;
  position: fixed;
  top: 45px; /* Fixed top position aligned with where navbar would be */
  width: 170px;
  left: 0;
  height: calc(100vh - 45px);
  background: rgba(8, 8, 8, 0.98);
  z-index: 99;
  overflow-y: auto;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  clip-path: inset(0 -100% 0 0);
  
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

const MobileNavItem = styled(NavItemBase)`
  font-size: 0.9rem;
`;

const MobileSubmenuContainer = styled(motion.div)`
  margin-top: 0.5rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0;
  background: rgba(10, 10, 10, 0.85);
`;

const MobileSubmenuItemWrapper = styled(motion.div)<ActiveProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0.6rem 1rem;
  cursor: pointer;
  color: ${props => props.$isActive ? 'rgba(46, 213, 115, 0.9)' : 'rgba(224, 224, 224, 0.7)'};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(46, 213, 115, 0.08);
    color: rgba(46, 213, 115, 0.9);
  }
  
  &:focus-visible {
    outline: 2px solid var(--gold);
    outline-offset: 2px;
  }
`;

const MobileSubmenuItemLink = styled(SubmenuItemLink)`
  flex-direction: row;
  font-size: 0.85rem;
`;

const MobileSubmenuItemLabel = styled(SubmenuItemLabel)`
  font-size: 0.85rem;
  margin: 0;
`;

// ==========================================================
// COMPONENTS
// ==========================================================

/**
 * Memoized Submenu Item Component
 * Used to render individual submenu items efficiently
 */
const MemoizedSubmenuItem = React.memo(({
  subItem,
  onClick,
  parentId,
}: {
  subItem: SubmenuItem;
  onClick: () => void;
  parentId: string;
}) => {
  // Generate unique ID for this submenu item for ARIA attributes
  const submenuItemId = `${parentId}-submenu-item-${subItem.id}`;
  
  return (
    <SubmenuItemWrapper
      key={subItem.id}
      $isActive={false}
      variants={ANIMATIONS.submenuItem}
      layoutId={`submenu-item-${subItem.id}`}
      onClick={onClick}
      role="menuitem"
      id={submenuItemId}
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={subItem.description ? `${subItem.label}: ${subItem.description}` : subItem.label}
    >
      <SubmenuItemLink>
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
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for optimized re-renders
  // Only re-render if the id or href changes
  return (
    prevProps.subItem.id === nextProps.subItem.id &&
    prevProps.subItem.href === nextProps.subItem.href
  );
});

// Display name for debugging
MemoizedSubmenuItem.displayName = 'MemoizedSubmenuItem';

/**
 * Desktop Navigation Item Component
 * Memoized to prevent unnecessary re-renders when other nav items change
 */
const DesktopNavItemComponent = React.memo(({ 
  item, 
  isActive,
  onMouseEnter,
  onMouseLeave,
  itemIndex,
}: { 
  item: NavItem; 
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  itemIndex: number;
}) => {
  const { activeItemId, setActiveItemId } = useContext(NavContext);
  const isItemActive = activeItemId === item.id;
  const controls = useAnimation();
  const navItemId = `nav-item-${item.id}`;
  const submenuId = `submenu-${item.id}`;

  useEffect(() => {
    controls.start({
      color: isItemActive || isActive ? 'var(--gold)' : 'var(--color-text)',
      scale: isItemActive ? 1.05 : 1,
      transition: { duration: 0.3 }
    });
  }, [controls, isItemActive, isActive]);

  const handleClick = useCallback(() => {
    if (isItemActive) {
      // If the submenu is already open, close it
      setActiveItemId(null);
    } else {
      // Otherwise, open this submenu
      setActiveItemId(item.id);
    }
  }, [isItemActive, setActiveItemId, item.id]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleClick();
        break;
      case 'Escape':
        e.preventDefault();
        setActiveItemId(null);
        break;
      case 'ArrowDown':
        e.preventDefault();
        // First open the submenu if not already open
        if (!isItemActive) {
          setActiveItemId(item.id);
        }
        // Then focus on the first submenu item
        setTimeout(() => {
          const firstSubmenuItem = document.getElementById(`${item.id}-submenu-item-${item.submenu[0].id}`);
          if (firstSubmenuItem) {
            firstSubmenuItem.focus();
          }
        }, 100);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        // Find previous sibling nav item and focus it
        const prevNavItem = document.getElementById(`nav-item-${itemIndex > 0 ? itemIndex - 1 : DEFAULT_NAV_ITEMS.length - 1}`);
        if (prevNavItem) {
          prevNavItem.focus();
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        // Find next sibling nav item and focus it
        const nextNavItem = document.getElementById(`nav-item-${(itemIndex + 1) % DEFAULT_NAV_ITEMS.length}`);
        if (nextNavItem) {
          nextNavItem.focus();
        }
        break;
    }
  }, [handleClick, isItemActive, item.id, item.submenu, setActiveItemId, itemIndex]);

  return (
    <NavItemWrapper 
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-nav-item={item.id}
    >
      <DesktopNavItem
        id={navItemId}
        $isActive={isActive || isItemActive}
        variants={ANIMATIONS.navItem}
        initial="idle"
        animate={controls}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="menuitem"
        aria-haspopup="true"
        aria-expanded={isItemActive}
        aria-controls={submenuId}
        tabIndex={0}
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
          variants={ANIMATIONS.arrow}
          initial="closed"
          animate={isItemActive ? "open" : "closed"}
        >
          <ICONS.ArrowIcon />
          <ScreenReaderOnly>
            {isItemActive ? 'Collapse' : 'Expand'} {item.label} menu
          </ScreenReaderOnly>
        </NavItemArrow>
      </DesktopNavItem>
    </NavItemWrapper>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to optimize re-renders
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.itemIndex === nextProps.itemIndex
  );
});

// Display name for debugging
DesktopNavItemComponent.displayName = 'DesktopNavItemComponent';

/**
 * Global Submenu Component - persistent across all navigation changes
 * Memoized to prevent unnecessary re-renders
 */
// Using forwardRef to properly access the submenu DOM element
const GlobalSubmenuComponent = React.memo(({
  items,
  activeItemId,
  onMouseEnter,
  onMouseLeave,
}: {
  items: NavItem[];
  activeItemId: string | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) => {
  const router = useRouter();
  const { setActiveItemId } = useContext(NavContext);
  const activeItem = items.find(item => item.id === activeItemId) || null;
  const [prevItemId, setPrevItemId] = useState<string | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [isFinalExit, setIsFinalExit] = useState(false);
  const submenuRef = useRef<HTMLDivElement>(null);
  const submenuId = activeItem ? `submenu-${activeItem.id}` : '';
  
  // Reset exit state when a new item becomes active
  useEffect(() => {
    if (activeItemId) {
      setIsFinalExit(false);
    }
  }, [activeItemId, setIsFinalExit]);
  
  // Update slide direction based on item index change
  useEffect(() => {
    if (activeItemId && prevItemId && activeItemId !== prevItemId) {
      // Find indexes of previous and current items
      const itemIds = items.map(item => item.id);
      const prevIndex = itemIds.indexOf(prevItemId);
      const currentIndex = itemIds.indexOf(activeItemId);
      
      // Determine slide direction based on index comparison
      setSlideDirection(currentIndex > prevIndex ? 'right' : 'left');
      setIsFinalExit(false); // Reset exit state for transitions
    } else if (activeItemId === null && prevItemId !== null) {
      // We're closing the menu completely
      setIsFinalExit(true);
    }
    
    // Update previous item ID
    if (activeItemId !== prevItemId) {
      setPrevItemId(activeItemId);
    }
  }, [activeItemId, prevItemId, items, setIsFinalExit]);
  
  // COMPLETELY REDESIGNED EXIT DETECTION SYSTEM
  // Uses explicit edge detection that maps to the visual menu boundaries
  useEffect(() => {
    if (!activeItemId || !submenuRef.current) return;
    
    // Force an immediate exit (used for direct edge exits)
    const forceExit = () => {
      setIsFinalExit(true);
    };
    
    // Track the last position to determine exit direction
    let lastX = 0;
    let lastY = 0;
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!activeItemId || !submenuRef.current) return;
      
      // Store current position to track direction
      const currentX = e.clientX;
      const currentY = e.clientY;
      
      // Get submenu and navbar elements
      const submenuEl = submenuRef.current;
      const navbarEl = document.querySelector('[role="navigation"]');
      const firstNavItem = document.querySelector('[data-nav-item="codex"]'); // Leftmost nav item
      const lastNavItem = document.querySelector('[data-nav-item="characters"]'); // Rightmost nav item
      
      if (!submenuEl || !navbarEl) {
        return;
      }
      
      // Get precise boundary rectangles
      const submenuRect = submenuEl.getBoundingClientRect();
      const navbarRect = navbarEl.getBoundingClientRect();
      
      // Get the leftmost and rightmost boundaries of the nav items
      let leftBoundary = navbarRect.left;
      let rightBoundary = navbarRect.right;
      
      if (firstNavItem) {
        const firstItemRect = (firstNavItem as HTMLElement).getBoundingClientRect();
        leftBoundary = firstItemRect.left - 20; // Add buffer to left edge
      }
      
      if (lastNavItem) {
        const lastItemRect = (lastNavItem as HTMLElement).getBoundingClientRect();
        rightBoundary = lastItemRect.right + 20; // Add buffer to right edge
      }
      
      // EXPLICIT EDGE EXIT ZONES:
      // 1. Left of the first nav item (CODEX)
      // 2. Right of the last nav item (CHARACTERS)
      // 3. Below the submenu
      // 4. Far away from any menu elements
      
      // Define the exit zones
      const isLeftEdgeExit = currentX < leftBoundary && lastX >= leftBoundary;
      const isRightEdgeExit = currentX > rightBoundary && lastX <= rightBoundary;
      const isBottomExit = currentY > (submenuRect.bottom + 20) && lastY <= (submenuRect.bottom + 20);
      
      // Check if mouse is over any nav item (for transitions between sections)
      let isOverNavItem = false;
      let hoveredNavItemId: string | null = null;
      
      // Check if mouse is over any nav item
      const navItems = document.querySelectorAll('[data-nav-item]');
      navItems.forEach((item) => {
        const navRect = (item as HTMLElement).getBoundingClientRect();
        if (
          currentX >= navRect.left && 
          currentX <= navRect.right && 
          currentY >= navRect.top && 
          currentY <= navRect.bottom
        ) {
          isOverNavItem = true;
          hoveredNavItemId = (item as HTMLElement).getAttribute('data-nav-item');
        }
      });
      
      // When over a different nav item, we want to transition between menus
      if (isOverNavItem && hoveredNavItemId !== activeItemId) {
        setIsFinalExit(false);
        return;
      }
      
      // CREATE 3 DISTINCT CASES FOR EDGE EXITS:
      
      // Case 1: Explicit edge exits (highest priority)
      if (isLeftEdgeExit || isRightEdgeExit || isBottomExit) {
        forceExit();
        return;
      }
      
      // Case 2: Check if mouse is outside all menu components
      const isOverSubmenu = (
        currentX >= submenuRect.left - 10 &&
        currentX <= submenuRect.right + 10 &&
        currentY >= submenuRect.top - 10 &&
        currentY <= submenuRect.bottom + 10
      );
      
      const isOverNavbar = (
        currentX >= navbarRect.left &&
        currentX <= navbarRect.right &&
        currentY >= navbarRect.top &&
        currentY <= navbarRect.bottom
      );
      
      // If outside both menu elements, it's an exit
      if (!isOverSubmenu && !isOverNavbar && !isOverNavItem) {
        // Give a small delay to prevent flickering
        setTimeout(() => {
          setIsFinalExit(true);
        }, 50);
      } else {
        setIsFinalExit(false);
      }
      
      // Update last position
      lastX = currentX;
      lastY = currentY;
    };
    
    // Add direct window edge exit detection
    const handleMouseLeaveWindow = () => {
      if (activeItemId) {
        forceExit();
      }
    };
    
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.documentElement.addEventListener('mouseleave', handleMouseLeaveWindow);
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.documentElement.addEventListener('mouseleave', handleMouseLeaveWindow);
    };
  }, [activeItemId, setIsFinalExit]);

  // Add keyboard navigation for submenu items
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!activeItemId) return;
    
    // Find all focusable elements in the submenu
    const focusableElements = submenuRef.current?.querySelectorAll('[role="menuitem"]');
    if (!focusableElements || focusableElements.length === 0) return;
    
    // Get the currently focused element
    const focusedElement = document.activeElement;
    const focusedIndex = Array.from(focusableElements).indexOf(focusedElement as Element);
    
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setActiveItemId(null);
        // Return focus to the parent nav item
        const parentNavItem = document.getElementById(`nav-item-${activeItemId}`);
        if (parentNavItem) {
          parentNavItem.focus();
        }
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        // Focus next item or wrap around
        if (focusedIndex >= 0 && focusedIndex < focusableElements.length - 1) {
          (focusableElements[focusedIndex + 1] as HTMLElement).focus();
        } else {
          (focusableElements[0] as HTMLElement).focus();
        }
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        // Focus previous item or wrap around
        if (focusedIndex > 0) {
          (focusableElements[focusedIndex - 1] as HTMLElement).focus();
        } else {
          (focusableElements[focusableElements.length - 1] as HTMLElement).focus();
        }
        break;
      case 'Home':
        e.preventDefault();
        // Focus first item
        (focusableElements[0] as HTMLElement).focus();
        break;
      case 'End':
        e.preventDefault();
        // Focus last item
        (focusableElements[focusableElements.length - 1] as HTMLElement).focus();
        break;
    }
  }, [activeItemId, setActiveItemId]);
  
  // Add keyboard event listener when submenu is active
  useEffect(() => {
    if (activeItemId) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeItemId, handleKeyDown]);
  
  const handleMouseLeave = useCallback(() => {
    setIsFinalExit(true);
    onMouseLeave();
  }, [onMouseLeave, setIsFinalExit]);
  
  // Choose the appropriate animation variant based on context
  const getAnimationVariant = useCallback(() => {
    // IMPORTANT: Always prioritize the final exit animation
    // This ensures the fade-out animation plays properly regardless of direction
    if (isFinalExit) {
      return ANIMATIONS.submenu;
    } 
    
    // Only use slide animations for transitions between menu items
    return slideDirection === 'right' 
      ? ANIMATIONS.submenuContent.slideRight 
      : ANIMATIONS.submenuContent.slideLeft;
  }, [isFinalExit, slideDirection]);

  // Memoized handler for submenu item clicks
  const handleSubmenuItemClick = useCallback((href: string) => {
    setActiveItemId(null);
    router.push(href);
  }, [setActiveItemId, router]);
  
  return (
    <GlobalSubmenuContainer 
      onMouseEnter={onMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={submenuRef}
      role="presentation" // This is just a container, actual menu role is on the SubmenuContainer
    >
      <AnimatePresence mode="wait">
        {activeItemId && (
          <SubmenuContainer
            custom={isFinalExit}
            variants={ANIMATIONS.submenu}
            initial="initial"
            animate="animate"
            exit={isFinalExit ? "exit" : undefined}
            key={`global-submenu-${activeItemId || 'none'}`}
            layoutId="global-submenu"
            role="menu"
            id={submenuId}
            aria-labelledby={`nav-item-${activeItemId}`}
            data-exiting={isFinalExit ? "true" : "false"}
          >
            <SubmenuGridContainer role="presentation">
              {activeItem && (
                <SubmenuContentContainer
                  variants={getAnimationVariant()}
                  initial="initial"
                  animate="animate"
                  exit={isFinalExit ? "exit" : undefined}
                  key={`submenu-content-${activeItem.id}`}
                  layoutId={`submenu-content-${activeItem.id}`}
                  role="presentation"
                >
                  <SubmenuHeaderContainer role="presentation">
                    <SubmenuHeader id={`submenu-header-${activeItem.id}`}>
                      {activeItem.label}
                    </SubmenuHeader>
                    <SubmenuDescription id={`submenu-description-${activeItem.id}`}>
                      {SUBMENU_DESCRIPTIONS[activeItem.id as keyof typeof SUBMENU_DESCRIPTIONS]}
                    </SubmenuDescription>
                  </SubmenuHeaderContainer>
                  
                  {activeItem.submenu.map((subItem) => (
                    <MemoizedSubmenuItem
                      key={subItem.id}
                      subItem={subItem}
                      onClick={() => handleSubmenuItemClick(subItem.href)}
                      parentId={activeItem.id}
                    />
                  ))}
                </SubmenuContentContainer>
              )}
            </SubmenuGridContainer>
          </SubmenuContainer>
        )}
      </AnimatePresence>
    </GlobalSubmenuContainer>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for optimizing re-renders
  return (
    prevProps.activeItemId === nextProps.activeItemId &&
    prevProps.items === nextProps.items
  );
});

// Display name for debugging
GlobalSubmenuComponent.displayName = 'GlobalSubmenuComponent';

/**
 * Mobile Navigation Item Component
 * Memoized to prevent unnecessary re-renders
 */
const MobileNavItemComponent = React.memo(({ 
  item, 
  isActive,
}: { 
  item: NavItem; 
  isActive: boolean;
}) => {
  const router = useRouter();
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const mobileNavItemId = `mobile-nav-item-${item.id}`;
  const mobileSubmenuId = `mobile-submenu-${item.id}`;

  const toggleSubmenu = useCallback(() => {
    setIsSubmenuOpen(prev => !prev);
  }, []);

  const handleNavigation = useCallback((href: string) => {
    router.push(href);
  }, [router]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Find all main menu items for navigation purposes
    const menuItems = document.querySelectorAll('[id^="mobile-nav-item-"]');
    const menuItemsArray = Array.from(menuItems) as HTMLElement[];
    const currentIndex = menuItemsArray.findIndex(el => el.id === mobileNavItemId);
    
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        toggleSubmenu();
        break;
      case 'Escape':
        e.preventDefault();
        if (isSubmenuOpen) {
          setIsSubmenuOpen(false);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (isSubmenuOpen) {
          // Focus first submenu item
          const firstSubmenuItem = document.getElementById(`mobile-submenu-item-${item.id}-${item.submenu[0].id}`);
          if (firstSubmenuItem) {
            firstSubmenuItem.focus();
          }
        } else {
          // If submenu is closed but there is a next main menu item, focus it
          if (currentIndex < menuItemsArray.length - 1) {
            menuItemsArray[currentIndex + 1].focus();
          } else {
            // If at the last main menu item, open its submenu if possible
            setIsSubmenuOpen(true);
            setTimeout(() => {
              const firstSubmenuItem = document.getElementById(`mobile-submenu-item-${item.id}-${item.submenu[0].id}`);
              if (firstSubmenuItem) {
                firstSubmenuItem.focus();
              }
            }, 50);
          }
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        
        // Check if there's a previous menu item with an open submenu
        let foundPreviousOpenSubmenu = false;
        if (currentIndex > 0) {
          // Start from the previous item and work backwards
          for (let i = currentIndex - 1; i >= 0; i--) {
            const prevId = menuItemsArray[i].id.replace('mobile-nav-item-', '');
            
            // Check if this previous item has its submenu open
            const prevSubmenuContainer = document.getElementById(`mobile-submenu-${prevId}`);
            if (prevSubmenuContainer) {
              // Get all submenu items of this previous menu item
              const prevSubmenuItems = document.querySelectorAll(`[id^="mobile-submenu-item-${prevId}-"]`);
              if (prevSubmenuItems.length > 0) {
                // Focus the last submenu item
                const lastSubmenuItem = prevSubmenuItems[prevSubmenuItems.length - 1] as HTMLElement;
                if (lastSubmenuItem) {
                  lastSubmenuItem.focus();
                  foundPreviousOpenSubmenu = true;
                  break;
                }
              }
            }
          }
        }
        
        // If no previous item with open submenu was found, navigate to previous main item or hamburger
        if (!foundPreviousOpenSubmenu) {
          if (currentIndex > 0) {
            menuItemsArray[currentIndex - 1].focus();
          } else {
            // If at the top of the menu, focus the hamburger button
            const hamburgerButton = document.querySelector('[aria-controls="mobile-menu"]') as HTMLElement;
            if (hamburgerButton) {
              hamburgerButton.focus();
            }
          }
        }
        break;
    }
  }, [isSubmenuOpen, toggleSubmenu, mobileNavItemId, item.id, item.submenu]);

  // Handle keyboard navigation for submenu items
  const handleSubmenuKeyDown = useCallback((e: React.KeyboardEvent, subItemId: string, href: string) => {
    // Find the current item's index
    const currentItemIndex = item.submenu.findIndex(si => si.id === subItemId);
    
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleNavigation(href);
        break;
      case 'Escape':
        e.preventDefault();
        setIsSubmenuOpen(false);
        // Return focus to parent menu item
        const parentMenuItem = document.getElementById(mobileNavItemId);
        if (parentMenuItem) {
          parentMenuItem.focus();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (currentItemIndex <= 0) {
          // If at first item, focus parent menu item
          const parentMenuItem = document.getElementById(mobileNavItemId);
          if (parentMenuItem) {
            parentMenuItem.focus();
          }
        } else {
          // Focus previous submenu item
          const prevItem = document.getElementById(`mobile-submenu-item-${item.id}-${item.submenu[currentItemIndex - 1].id}`);
          if (prevItem) {
            prevItem.focus();
          }
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (currentItemIndex < item.submenu.length - 1) {
          // Focus next submenu item
          const nextItem = document.getElementById(`mobile-submenu-item-${item.id}-${item.submenu[currentItemIndex + 1].id}`);
          if (nextItem) {
            nextItem.focus();
          }
        } else {
          // Find the next main menu item
          const allMainItems = document.querySelectorAll('[id^="mobile-nav-item-"]');
          const mainItemsArray = Array.from(allMainItems) as HTMLElement[];
          const currentMainIndex = mainItemsArray.findIndex(el => el.id === mobileNavItemId);
          
          if (currentMainIndex < mainItemsArray.length - 1) {
            mainItemsArray[currentMainIndex + 1].focus();
          }
        }
        break;
    }
  }, [mobileNavItemId, handleNavigation, item.id, item.submenu]);

  return (
    <motion.div variants={ANIMATIONS.submenuItem} role="presentation">
      <MobileNavItem
        id={mobileNavItemId}
        $isActive={isActive}
        onClick={toggleSubmenu}
        role="menuitem"
        aria-haspopup="true"
        aria-expanded={isSubmenuOpen}
        aria-controls={mobileSubmenuId}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <NavItemContent>
          <NavItemLabel>
            {item.label}
          </NavItemLabel>
        </NavItemContent>
        
        <NavItemArrow
          variants={ANIMATIONS.arrow}
          initial="closed"
          animate={isSubmenuOpen ? "open" : "closed"}
        >
          <ICONS.ArrowIcon />
          <ScreenReaderOnly>
            {isSubmenuOpen ? 'Collapse' : 'Expand'} {item.label} menu
          </ScreenReaderOnly>
        </NavItemArrow>
      </MobileNavItem>

      <AnimatePresence>
        {isSubmenuOpen && (
          <MobileSubmenuContainer
            id={mobileSubmenuId}
            variants={ANIMATIONS.submenu}
            initial="initial"
            animate="animate"
            exit="exit"
            role="menu"
            aria-labelledby={mobileNavItemId}
          >
            {item.submenu.map((subItem) => (
              <MobileSubmenuItemWrapper
                key={subItem.id}
                id={`mobile-submenu-item-${item.id}-${subItem.id}`}
                $isActive={false}
                variants={ANIMATIONS.submenuItem}
                onClick={() => handleNavigation(subItem.href)}
                role="menuitem"
                tabIndex={0}
                onKeyDown={(e: React.KeyboardEvent) => handleSubmenuKeyDown(e, subItem.id, subItem.href)}
                aria-label={subItem.description ? `${subItem.label}: ${subItem.description}` : subItem.label}
              >
                <MobileSubmenuItemLink>
                  <MobileSubmenuItemLabel>
                    {subItem.label}
                  </MobileSubmenuItemLabel>
                </MobileSubmenuItemLink>
              </MobileSubmenuItemWrapper>
            ))}
          </MobileSubmenuContainer>
        )}
      </AnimatePresence>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if the item id or active state changes
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.isActive === nextProps.isActive
  );
});

// Display name for debugging
MobileNavItemComponent.displayName = 'MobileNavItemComponent';

/**
 * Mobile Menu Component
 * Memoized to prevent unnecessary re-renders
 */
  const MobileMenuComponent = React.memo(({
  isOpen,
  toggleMenu,
  items,
  isActiveRoute,
  isClient,
}: {
  isOpen: boolean;
  toggleMenu: () => void;
  items: NavItem[];
  isActiveRoute: (href: string) => boolean;
  isClient: boolean;
}) => {
  // Set up keyboard navigation for the mobile menu
  useEffect(() => {
    if (!isOpen || !isClient) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Escape key to close the menu
      if (e.key === 'Escape') {
        e.preventDefault();
        toggleMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, toggleMenu, isClient]);

  if (!isClient) return null;
  
// Function that checks if a specific submenu is currently displayed in the DOM
// (This is used internally by our keyboard navigation handlers)

  return (
    <>
      <MobileMenuButton 
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-label={`${isOpen ? 'Close' : 'Open'} navigation menu`}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'ArrowDown' && isOpen) {
            e.preventDefault();
            // Focus the first menu item when pressing down from hamburger button
            const firstMenuItem = document.getElementById(`mobile-nav-item-${items[0].id}`);
            if (firstMenuItem) {
              firstMenuItem.focus();
            }
          }
        }}
      >
        {isOpen ? '✕' : '☰'}
      </MobileMenuButton>

      <AnimatePresence>
        {isOpen && (
          <MobileMenu
            id="mobile-menu"
            variants={ANIMATIONS.mobileMenu}
            initial="closed"
            animate="open"
            exit="closed"
            role="navigation"
            aria-label="Mobile Navigation"
          >
            <MobileNavItems role="menubar" aria-label="Main Navigation">
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
}, (prevProps, nextProps) => {
  // Only re-render on open state change or client change
  return (
    prevProps.isOpen === nextProps.isOpen &&
    prevProps.isClient === nextProps.isClient
  );
});

// Display name for debugging
MobileMenuComponent.displayName = 'MobileMenuComponent';

// ==========================================================
// MAIN NAVIGATION BAR COMPONENT
// ==========================================================

/**
 * Main NavigationBar Component
 * 
 * A responsive navigation bar with persistent submenu that transitions
 * smoothly between different content states.
 */
const NavigationBar: React.FC<NavigationBarProps> = ({ 
  items = DEFAULT_NAV_ITEMS,
  ariaLabel = "Main Navigation"
}) => {
  const [isClient, setIsClient] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  
  // Store the last focused element before opening a submenu
  useEffect(() => {
    if (activeItemId) {
      // Save the currently focused element
      lastFocusedElementRef.current = document.activeElement as HTMLElement;
    } else if (lastFocusedElementRef.current) {
      // When closing the submenu, restore focus
      lastFocusedElementRef.current.focus();
      lastFocusedElementRef.current = null;
    }
  }, [activeItemId]);
  
  // Trap focus within the submenu when it's open
  useEffect(() => {
    if (!activeItemId) return;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      // Get all focusable elements in the submenu
      const focusableElements = submenuRef.current?.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements || focusableElements.length === 0) return;
      
      // Convert to array for easier manipulation
      const elements = Array.from(focusableElements) as HTMLElement[];
      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];
      
      // Handle focus trapping
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };
    
    document.addEventListener('keydown', handleTabKey);
    
    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [activeItemId]);
  
  // Clear any existing timeout when component unmounts
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Handle closing submenus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Skip if no submenu is open
      if (!activeItemId) return;
      
      const target = event.target as HTMLElement;
      
      // Check if click is inside a submenu item
      const isInsideSubmenu = submenuRef.current?.contains(target);
      
      // Check if click is on a navigation item
      const navItemAttr = target.closest('[data-nav-item]')?.getAttribute('data-nav-item');
      const isNavItemClick = navItemAttr !== undefined;
      
      // If click is outside both submenu and nav items, close the submenu
      if (!isInsideSubmenu && !isNavItemClick) {
        setActiveItemId(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeItemId]);
  
  // Check if route matches the current path
  const isActiveRoute = useCallback((href: string) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  }, [pathname]);
  
  // Handle delayed submenu closing
  const closeSubmenuWithDelay = useCallback(() => {
    // Clear any existing timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    
    // Set a new timeout to close the submenu
    closeTimeoutRef.current = setTimeout(() => {
      setActiveItemId(null);
    }, 200); // 200ms delay before closing
  }, []);
  
  // Cancel submenu closing if mouse reenters submenu
  const cancelSubmenuClosing = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);
  
  // Handle hovering over navigation items
  const handleNavItemMouseEnter = useCallback((itemId: string) => {
    cancelSubmenuClosing();
    setActiveItemId(itemId);
  }, [cancelSubmenuClosing]);
  
  // Handle mouse leaving navigation items
  const handleNavItemMouseLeave = useCallback(() => {
    closeSubmenuWithDelay();
  }, [closeSubmenuWithDelay]);
  
  // Toggle mobile menu open/closed
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  // Add keyboard event listener for the main menu bar
  const handleMenuKeyDown = useCallback((e: KeyboardEvent) => {
    // Skip if a submenu is open (it has its own key handler)
    if (activeItemId) return;
    
    // Find all top-level menu items
    const menuItems = document.querySelectorAll('[role="menuitem"][aria-haspopup="true"]');
    if (!menuItems || menuItems.length === 0) return;
    
    const menuItemsArray = Array.from(menuItems) as HTMLElement[];
    const focusedElement = document.activeElement as HTMLElement;
    const focusedIndex = menuItemsArray.indexOf(focusedElement);
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        if (focusedIndex > 0) {
          menuItemsArray[focusedIndex - 1].focus();
        } else {
          menuItemsArray[menuItemsArray.length - 1].focus();
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (focusedIndex < menuItemsArray.length - 1) {
          menuItemsArray[focusedIndex + 1].focus();
        } else {
          menuItemsArray[0].focus();
        }
        break;
      case 'Home':
        e.preventDefault();
        menuItemsArray[0].focus();
        break;
      case 'End':
        e.preventDefault();
        menuItemsArray[menuItemsArray.length - 1].focus();
        break;
    }
  }, [activeItemId]);

  // Add keyboard event listener for the menu
  useEffect(() => {
    if (isClient) {
      document.addEventListener('keydown', handleMenuKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleMenuKeyDown);
    };
  }, [isClient, handleMenuKeyDown]);

  // Handle scroll behavior
  useEffect(() => {
    if (!isClient) return;
    
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      
      // Determine if navbar should be visible
      const scrollingUp = prevScrollPos > currentScrollPos;
      const atTop = currentScrollPos < 10;
      const scrollThreshold = 2;
      const significantChange = Math.abs(currentScrollPos - prevScrollPos) > scrollThreshold;
      
      // Update visibility based on conditions
      if (atTop || (scrollingUp && significantChange)) {
        setVisible(true);
      } else if (!scrollingUp && significantChange && !isMobileMenuOpen) {
        setVisible(false);
      }
      
      setPrevScrollPos(currentScrollPos);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isClient, prevScrollPos, isMobileMenuOpen]);

  // Announce when the navigation bar appears or disappears
  useEffect(() => {
    // Skip during initial render
    if (!isClient) return;
    
    // Use an aria-live region to announce the visibility change
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.classList.add('sr-only'); // screen reader only
    liveRegion.style.position = 'absolute';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.padding = '0';
    liveRegion.style.margin = '-1px';
    liveRegion.style.overflow = 'hidden';
    liveRegion.style.clip = 'rect(0, 0, 0, 0)';
    liveRegion.style.whiteSpace = 'nowrap';
    liveRegion.style.border = '0';
    
    // Announce the navigation visibility
    liveRegion.textContent = visible 
      ? 'Navigation bar is now visible' 
      : 'Navigation bar is now hidden. Scroll up to show it again.';
    
    document.body.appendChild(liveRegion);
    
    // Clean up after announcement
    const timeoutId = setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 1000);
    
    return () => {
      clearTimeout(timeoutId);
      if (document.body.contains(liveRegion)) {
        document.body.removeChild(liveRegion);
      }
    };
  }, [visible, isClient]);

    // Client-side initialization
  useEffect(() => {
    setIsClient(true);
    setPrevScrollPos(window.scrollY);
    
    // Fix for RulesIcon SVG path
    const fixSvgPath = () => {
      const rulesIcons = document.querySelectorAll('path[d="M13 2H3C2.45 2 2 2.45 2 3V13C13 13.55 2.45 14 3 14H13C13.55 14 14 13.55 14 13V3C14 2.45 13.55 2 13 2ZM7 12H4V10H7V12ZM7 9H4V7H7V9ZM7 6H4V4H7V6ZM12 12H8V10H12V12ZM12 9H8V7H12V9ZM12 6H8V4H12V6Z"]');
      
      rulesIcons.forEach(icon => {
        icon.setAttribute('d', 'M13 2H3C2.45 2 2 2.45 2 3V13C2 13.55 2.45 14 3 14H13C13.55 14 14 13.55 14 13V3C14 2.45 13.55 2 13 2ZM7 12H4V10H7V12ZM7 9H4V7H7V9ZM7 6H4V4H7V6ZM12 12H8V10H12V12ZM12 9H8V7H12V9ZM12 6H8V4H12V6Z');
      });
    };
    
    fixSvgPath();
    
    // Add a skip link for keyboard users to bypass navigation
    const addSkipLink = () => {
      // Check if a skip link already exists
      if (!document.getElementById('skip-to-content')) {
        const skipLink = document.createElement('a');
        skipLink.id = 'skip-to-content';
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.style.position = 'absolute';
        skipLink.style.top = '-40px';
        skipLink.style.left = '0';
        skipLink.style.background = 'var(--gold)';
        skipLink.style.color = '#000';
        skipLink.style.padding = '8px';
        skipLink.style.zIndex = '1001';
        skipLink.style.transition = 'top 0.3s';
        skipLink.style.fontFamily = 'var(--font-heading)';
        
        // Show the skip link when it receives focus
        skipLink.addEventListener('focus', () => {
          skipLink.style.top = '0';
        });
        
        skipLink.addEventListener('blur', () => {
          skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
      }
    };
    
    addSkipLink();
    
    // Log debug info about nav items (helps with edge detection)
    const logNavItemPositions = () => {
      if (process.env.NODE_ENV === 'development') {
        setTimeout(() => {
          const firstNavItem = document.querySelector('[data-nav-item="codex"]');
          const lastNavItem = document.querySelector('[data-nav-item="characters"]');
          
          if (firstNavItem && lastNavItem) {
            const firstRect = (firstNavItem as HTMLElement).getBoundingClientRect();
            const lastRect = (lastNavItem as HTMLElement).getBoundingClientRect();
            
            console.log('First nav item (left edge):', firstRect.left);
            console.log('Last nav item (right edge):', lastRect.right);
          }
        }, 1000);
      }
    };
    
    logNavItemPositions();
  }, []);

  if (!isClient) return null;

  return (
    <NavContext.Provider value={{ 
      activeItemId, 
      setActiveItemId, 
      visible,
      focusedItemId,
      setFocusedItemId
    }}>
      {/* Desktop Navigation Bar - hidden on mobile */}
      <NavContainer 
        $visible={visible} 
        role="navigation" 
        aria-label={ariaLabel}
      >
        <NavContent>
          {/* Logo */}
          <LogoContainer 
            initial={{ opacity: 1, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" passHref>
              <LogoLink tabIndex={0} aria-label="Home">
                <ICONS.MoonIcon />
              </LogoLink>
            </Link>
          </LogoContainer>

          {/* Desktop Navigation */}
          <NavItemsContainer role="menubar" aria-label="Main Menu">
            {items.map((item, index) => (
              <DesktopNavItemComponent
                key={item.id}
                item={item}
                isActive={isActiveRoute(item.href)}
                onMouseEnter={() => handleNavItemMouseEnter(item.id)}
                onMouseLeave={handleNavItemMouseLeave}
                itemIndex={index}
              />
            ))}
          </NavItemsContainer>
        </NavContent>
      </NavContainer>
      
      {/* Persistent global submenu with dynamic content */}
      <div ref={submenuRef}>
        <GlobalSubmenuComponent 
          items={items} 
          activeItemId={activeItemId} 
          onMouseEnter={cancelSubmenuClosing}
          onMouseLeave={closeSubmenuWithDelay}
        />
      </div>
      
      {/* Mobile Menu - rendered independently */}
      <MobileMenuComponent 
        isOpen={isMobileMenuOpen}
        toggleMenu={toggleMobileMenu}
        items={items}
        isActiveRoute={isActiveRoute}
        isClient={isClient}
      />
    </NavContext.Provider>
  );
};

// Create memoized version with display name
const MemoizedNavigationBar = React.memo(NavigationBar);
MemoizedNavigationBar.displayName = 'MemoizedNavigationBar';

// Export the memoized navigation bar component
export default MemoizedNavigationBar;