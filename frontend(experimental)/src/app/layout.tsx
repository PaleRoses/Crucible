'use client';

import React from 'react';
import './styles/global.css';
import { StyledComponentsRegistry } from '../lib/registry';
import Background from '../components/layout/Layout';
import NavigationBar from '../components/navbars/NavigationBar';
import Script from 'next/script';

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

const RulesIcon = React.memo(() => (
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
));

const LoreIcon = React.memo(() => (
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
));

const CreatorsIcon = React.memo(() => (
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

// Default submenu icon (for proper color consistency)


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
 * Root Layout component for Next.js App Router
 * Must include <html> and <body> tags
 */
interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        {/* Preload Adobe Fonts with high priority */}
        <link
          rel="preload"
          href="https://use.typekit.net/hcw7ssx.css"
          as="style"
        />
        {/* Preload Adobe Fonts CSS */}
        <link
          rel="preload"
          href="https://use.typekit.net/hcw7ssx.css"
          as="style"
        />
        
        {/* Load Adobe Fonts directly */}
        <link
          rel="stylesheet"
          href="https://use.typekit.net/hcw7ssx.css"
        />
        
        {/* Load Adobe Fonts JS early with beforeInteractive strategy */}
        <Script
          id="adobe-fonts"
          strategy="beforeInteractive"
          src="https://use.typekit.net/hcw7ssx.js"
          onLoad={() => {
            try {
              // @ts-expect-error - Typekit is added to window by the script but not typed
              Typekit.load({ async: false });
            } catch (e) {
              console.error('Error loading Adobe fonts:', e);
            }
          }}
        />
        
        {/* Critical CSS to prevent layout shift during font loading */}
        <style dangerouslySetInnerHTML={{ __html: `
          /* Font swap behavior to prevent FOUC */
          @font-face {
            font-family: 'adobe-caslon-pro';
            font-display: swap;
          }
          
          @font-face {
            font-family: 'haboro-soft-condensed';
            font-display: swap;
          }
          
          @font-face {
            font-family: 'ibm-plex-mono';
            font-display: swap;
          }
          
          /* Size-adjusted fallback fonts to minimize layout shift */
          @font-face {
            font-family: 'adobe-caslon-pro-fallback';
            src: local('Georgia');
            size-adjust: 105%;
            ascent-override: 95%;
            descent-override: 22%;
            line-gap-override: 0%;
          }
          
          @font-face {
            font-family: 'haboro-soft-condensed-fallback';
            src: local('Avenir'), local('Helvetica Neue'), local('Helvetica'), local('Arial');
            size-adjust: 100%;
            ascent-override: 90%;
            descent-override: 25%;
            line-gap-override: 0%;
          }
          
          /* Set font loading visibility */
          html {
            visibility: visible;
            opacity: 1;
          }
          
          /* Basic styling to avoid additional layout shifts */
          body {
            color: #e0e0e0;
            margin: 0;
            padding: 0;
            font-family: 'adobe-caslon-pro-fallback', 'adobe-caslon-pro', Georgia, serif;
          }
          
          /* Navbar critical styling to ensure consistent rendering */
          nav {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            z-index: 100;
            background: rgba(8, 8, 8, 0.7);
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            backdrop-filter: blur(8px);
            padding: 0 1.5rem;
          }
          
          /* Custom colors from original theme */
          :root {
            --gold: #BFAD7F;
            --gold-light: #D6C69F;
            --color-text: rgba(224, 224, 224, 0.8);
            --color-accent: var(--gold);
            --radius-small: 6px;
            --font-heading: 'haboro-soft-condensed', 'Avenir Next', sans-serif;
          }
          
          /* Mobile menu styling */
          @media (max-width: 768px) {
            button[aria-controls="mobile-menu"] {
              display: flex !important;
            }
            
            div[id="mobile-menu"] {
              display: block !important;
            }
          }
        `}} />
      </head>
      <body>
        <StyledComponentsRegistry>
          <div className="relative min-h-screen">
            <Background />
            <NavigationBar 
              items={navItems}
              logo={<MoonIcon />}
              homeHref="/"
              ariaLabel="Main Navigation"
              showItemDescriptions={true}
              iconMapping={iconMapping}
              // Preserve the original color scheme exactly
              backgroundColor="rgba(10, 10, 10, 0.98)"
              backdropFilter="blur(50px)"
              height="45px"
              submenuBehavior="hover"
              submenuCloseDelay={200}
              hideOnScroll={true}
              borderStyle="1px solid rgba(255, 255, 255, 0.08)"
              boxShadow="0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 0 12px rgba(191, 173, 127, 0.3)"
              // Enable mobile menu
              mobileBreakpoint={768}
            />
            <main className="transition-opacity duration-300 ease-in-out pt-[100px]">
              {children}
            </main>
          </div>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}