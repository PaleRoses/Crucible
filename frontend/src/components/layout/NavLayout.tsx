'use client';

import React from 'react';
import NavigationBar from '../navbars/NavigationBar';
import ScrollAwareSpacer from '@/components/effects/utility/ScrollAwareNavBar';

//=============================================================================
// ICON COMPONENTS
//=============================================================================

// Icon components defined inline
const MoonIcon = React.memo(() => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <mask id="moonMask">
        <rect x="0" y="0" width="24" height="24" fill="white" />
        <circle cx="14.4" cy="12" r="9" fill="black" />
      </mask>
    </defs>
    <circle cx="12" cy="12" r="10.8" fill="currentColor" mask="url(#moonMask)" />
  </svg>
));

const ArrowIcon = React.memo(() => (
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
));

const RulesIcon = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    style={{}}
    viewBox="0 0 570 470"
    {...props}
  >
      <path d="" 
    fill="currentColor"
    opacity="0.5"
    />
  </svg>
));

const LoreIcon = React.memo((props) => (
  <svg
    width={170}
    height={128}
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    viewBox="0 0 570 470"
    {...props}
  >
     <path d="" 
    fill="currentColor"
    opacity="0.5"
    />
  </svg>
));

const CreatorsIcon = React.memo((props) => (
  <svg
    width={170}
    height={128}
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    viewBox="0 0 570 470"
    {...props}
  >
     <path d="" 
    fill="currentColor"
    opacity="0.5"
    />
  </svg>
));

const NewCycleIcon = React.memo(() => (
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
));

const PreviousCycleIcon = React.memo(() => (
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
));

const NewCharacterIcon = React.memo(() => (
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
));

const PreviousCharacterIcon = React.memo(() => (
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
));

//=============================================================================
// COMPONENT DISPLAY NAMES
//=============================================================================

// Set display names for debugging
MoonIcon.displayName = 'MoonIcon';
ArrowIcon.displayName = 'ArrowIcon';
RulesIcon.displayName = 'RulesIcon';
LoreIcon.displayName = 'LoreIcon';
CreatorsIcon.displayName = 'CreatorsIcon';
NewCycleIcon.displayName = 'NewCycleIcon';
PreviousCycleIcon.displayName = 'PreviousCycleIcon';
NewCharacterIcon.displayName = 'NewCharacterIcon';
PreviousCharacterIcon.displayName = 'PreviousCharacterIcon';

//=============================================================================
// NAVIGATION CONFIGURATION
//=============================================================================

// Icon mapping for the NavigationBar with proper color theming
const iconMapping = {
  'arrow': ArrowIcon,
  'home': MoonIcon,
  'RulesIcon': RulesIcon,
  'LoreIcon': LoreIcon,
  'CreatorsIcon': CreatorsIcon,
  'NewCycleIcon': NewCycleIcon,
  'PreviousCycleIcon': PreviousCycleIcon,
  'NewCharacterIcon': NewCharacterIcon,
  'PreviousCharacterIcon': PreviousCharacterIcon,
};

// Navigation items configuration
const navItems = [
  {
    id: 'codex',
    label: 'CODEX',
    href: '/codex',
    submenu: [
      {
        id: 'rules',
        label: 'RULES',
        href: '/codex/rules',
        icon: 'RulesIcon',
        description: 'Core gameplay mechanics.'
      },
      {
        id: 'lore',
        label: 'LORE',
        href: '/codex/lore',
        icon: 'LoreIcon',
        description: 'Background stories and world history.'
      },
      {
        id: 'creators',
        label: 'CREATORS',
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
        label: 'NEW CYCLE',
        href: '/cycles/new',
        icon: 'NewCycleIcon',
        description: 'Paint a new world onto the empty canvas.'
      },
      {
        id: 'previous-cycle',
        label: 'PREVIOUS CYCLE',
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
        label: 'NEW CHARACTER',
        href: '/characters/new',
        icon: 'NewCharacterIcon',
        description: 'Design a new protagonist for your adventures.'
      },
      {
        id: 'previous-character',
        label: 'PREVIOUS CHARACTER',
        href: '/characters/previous',
        icon: 'PreviousCharacterIcon',
        description: 'Browse characters from earlier campaigns.'
      }
    ]
  }
];

/**
 * Navigation Layout component that handles all navigation elements
 */
const NavLayout: React.FC = () => {
  return (
    <ScrollAwareSpacer
      height={45}
      zIndex={100}
      transitionDuration={0.25}
      showOnScrollUp={true}
      hideOnScrollDown={true}
      shrinkOnScroll={false}
      fadeOnScroll={false}
      className="w-full px-0"
    >
      <NavigationBar 
        items={navItems}
        logo={<MoonIcon />}
        homeHref="/"
        ariaLabel="Main Navigation"
        showItemDescriptions={false}
        iconMapping={iconMapping}
        // Preserve the original color scheme exactly
        backdropFilter="blur(50px)"
        height="45px"
        submenuBehavior="hover"
        submenuCloseDelay={200}
        hideOnScroll={true} 
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 0 12px rgba(191, 173, 127, 0.3)"
        // Enable mobile menu
        mobileBreakpoint={768}
      />
    </ScrollAwareSpacer>
  );
};

export default NavLayout;