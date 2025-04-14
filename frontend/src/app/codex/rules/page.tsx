'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { NextPage } from 'next'

// Dynamically import the ItemNavigation component with SSR disabled
// This ensures proper hydration in Next.js
const ItemNavigation = dynamic(
  () => import('@/components/navbars/ItemNavigation'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-gold/60"> </div>
      </div>
    )
  }
)

// Icons for the rule categories
const CoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2ZM18 11.09C18 15.09 15.45 18.79 12 19.92C8.55 18.79 6 15.1 6 11.09V6.39L12 4.14L18 6.39V11.09Z" />
  </svg>
)

const WorldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM4 12C4 7.59 7.59 4 12 4C13.65 4 15.18 4.53 16.43 5.42C16.26 5.5 16.03 5.59 15.9 5.65C15.26 5.97 14.7 6.39 14.39 6.56C14.04 6.75 13.55 7.15 13.1 7.52C12.71 7.84 12.06 8 11.5 8C10.94 8 10.29 7.84 9.9 7.52C9.44 7.15 8.96 6.75 8.61 6.56C8.3 6.39 7.74 5.97 7.09 5.65C6.32 5.24 4.72 4.44 4.14 4.24C4.05 4.21 3.98 4.18 3.92 4.15C3.97 6.89 5.07 9.35 6.84 11.06V11.5C6.84 12.36 7.19 13.09 7.76 13.55C8.33 14.01 9.08 14.21 9.87 14.21C11.16 14.21 12.53 13.16 13.07 12.84C13.25 12.73 13.46 12.61 13.73 12.61C14 12.61 14.22 12.73 14.39 12.84C15.01 13.16 15.95 13.55 16.58 13.55C16.96 13.55 17.26 13.44 17.47 13.26C17.79 13 17.94 12.56 17.94 12.07V11.36C18.3 11.12 18.63 10.85 18.94 10.55C19.16 10.33 19.37 10.1 19.56 9.85C19.85 9.47 20.13 9.06 20.37 8.63C20.43 8.5 20.49 8.38 20.55 8.25C19.17 4.64 15.91 2 12 2C10.4 2 8.9 2.42 7.58 3.15C9.19 3.53 9.97 4.45 10.28 4.95C10.51 5.29 10.94 5.74 11.13 5.89C11.29 6.03 11.36 6.05 11.5 6.05C11.64 6.05 11.71 6.03 11.87 5.89C12.06 5.74 12.49 5.29 12.72 4.95C13.03 4.47 13.73 3.62 15.29 3.15C14.33 2.58 13.21 2.22 12 2.22V2ZM20 12C20 12.06 20 12.12 20 12.18C19.87 12.11 19.75 12.05 19.63 12C19.26 11.81 18.81 11.7 18.58 11.7C18.35 11.7 17.91 11.81 17.56 12C17.31 12.14 16.84 12.39 16.56 12.55C16.36 12.68 16.25 12.7 16.15 12.73C16.12 12.73 16.1 12.73 16.07 12.74C16.36 12.82 16.7 12.91 17.04 12.91C17.35 12.91 17.69 12.81 17.94 12.61V12.07C17.94 12.07 17.89 12.12 17.82 12.17C17.87 12.13 17.92 12.1 17.94 12.07V12ZM17.94 11.36C18.43 11.11 18.87 10.79 19.23 10.43C19.63 10.03 19.97 9.56 20.25 9.05C20.03 9.47 19.77 9.87 19.47 10.24C19.29 10.48 19.09 10.71 18.88 10.92C18.58 11.22 18.27 11.48 17.94 11.7V11.36Z" />
  </svg>
)

const AdvancedIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.16 9.48C21.34 9.34 21.39 9.07 21.28 8.87L19.36 5.55C19.24 5.33 18.99 5.26 18.77 5.33L16.38 6.29C15.88 5.91 15.35 5.59 14.76 5.35L14.4 2.81C14.36 2.57 14.16 2.4 13.92 2.4H10.08C9.84003 2.4 9.65003 2.57 9.61003 2.81L9.25003 5.35C8.66003 5.59 8.12003 5.92 7.63003 6.29L5.24003 5.33C5.02003 5.25 4.77003 5.33 4.65003 5.55L2.74003 8.87C2.62003 9.08 2.66003 9.34 2.86003 9.48L4.89003 11.06C4.84003 11.36 4.80003 11.69 4.80003 12C4.80003 12.31 4.82003 12.64 4.87003 12.94L2.84003 14.52C2.66003 14.66 2.61003 14.93 2.72003 15.13L4.64003 18.45C4.76003 18.67 5.01003 18.74 5.23003 18.67L7.62003 17.71C8.12003 18.09 8.65003 18.41 9.24003 18.65L9.60003 21.19C9.65003 21.43 9.84003 21.6 10.08 21.6H13.92C14.16 21.6 14.36 21.43 14.39 21.19L14.75 18.65C15.34 18.41 15.88 18.09 16.37 17.71L18.76 18.67C18.98 18.75 19.23 18.67 19.35 18.45L21.27 15.13C21.39 14.91 21.34 14.66 21.15 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.40003 13.98 8.40003 12C8.40003 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z" />
  </svg>
)

const ReferenceIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 2H5C3.9 2 3 2.9 3 4V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V4C21 2.9 20.1 2 19 2ZM19 20H5V4H19V20ZM7 6H17V8H7V6ZM7 10H17V12H7V10ZM7 14H13V16H7V14Z" />
  </svg>
)

// Define rule items for the ItemNavigation component
const ruleItems = [
  // Core Rules section
  {
    id: 'motivations',
    label: 'Motivations',
    href: '/codex/rules/motivations',
    icon: <CoreIcon />,
    description: 'Lunar and Solar motivations, the motivation track',
    color: 'var(--color-primary)'
  },
  {
    id: 'actions',
    label: 'Actions',
    href: '/codex/rules/actions',
    icon: <CoreIcon />,
    description: 'Action ratings, outcomes, impact, difficulty',
    color: 'var(--color-primary)'
  },
  {
    id: 'harm',
    label: 'Harm',
    href: '/codex/rules/harm',
    icon: <CoreIcon />,
    description: 'Physical, emotional, and spiritual harm mechanics',
    color: 'var(--color-primary)'
  },
  {
    id: 'equipment',
    label: 'Equipment',
    href: '/codex/rules/equipment',
    icon: <CoreIcon />,
    description: 'Items, special abilities, augmetics',
    color: 'var(--color-primary)'
  },
  {
    id: 'moves',
    label: 'Moves',
    href: '/codex/rules/moves',
    icon: <CoreIcon />,
    description: 'Reckon, Connect, Investigate, confronts',
    color: 'var(--color-primary)'
  },
  {
    id: 'experience',
    label: 'Experience',
    href: '/codex/rules/experience',
    icon: <CoreIcon />,
    description: 'Experience gain, aspect upgrades, advancement',
    color: 'var(--color-primary)'
  },
  
  // World & Character section
  {
    id: 'creation',
    label: 'Creation',
    href: '/codex/rules/creation',
    icon: <WorldIcon />,
    description: 'Character creation, cycle generation, regions',
    color: 'var(--color-accent1)'
  },
  {
    id: 'sites',
    label: 'Sites',
    href: '/codex/rules/sites',
    icon: <WorldIcon />,
    description: 'Caverns, dungeons, habitats, passes',
    color: 'var(--color-accent1)'
  },
  {
    id: 'environments',
    label: 'Environments',
    href: '/codex/rules/environments',
    icon: <WorldIcon />,
    description: 'Forest, jungle, freeze, drown, swamp, etc.',
    color: 'var(--color-accent1)'
  },
  {
    id: 'godrealms',
    label: 'Godrealms',
    href: '/codex/rules/godrealms',
    icon: <WorldIcon />,
    description: 'Cityscape, nightmare, eschaton layers',
    color: 'var(--color-accent1)'
  },
  
  // Advanced Mechanics section
  {
    id: 'gauntlets',
    label: 'Gauntlets',
    href: '/codex/rules/gauntlets',
    icon: <AdvancedIcon />,
    description: 'Journeys, delves, scenes, progress',
    color: 'var(--color-accent2)'
  },
  {
    id: 'interludes',
    label: 'Interludes',
    href: '/codex/rules/interludes',
    icon: <AdvancedIcon />,
    description: 'Activities, fallout, blowback, movements',
    color: 'var(--color-accent2)'
  },
  {
    id: 'archetypes',
    label: 'Archetypes',
    href: '/codex/rules/archetypes',
    icon: <AdvancedIcon />,
    description: 'Cultists, mercenaries, paragons, exiles',
    color: 'var(--color-accent2)'
  },
  {
    id: 'stars',
    label: 'Stars',
    href: '/codex/rules/stars',
    icon: <AdvancedIcon />,
    description: 'Multi-part challenges, eclipse counters',
    color: 'var(--color-accent2)'
  },
  
  // Reference section
  {
    id: 'oracles',
    label: 'Oracles',
    href: '/codex/rules/oracles',
    icon: <ReferenceIcon />,
    description: 'Tables for generating content',
    color: 'var(--color-accent3)'
  },
  {
    id: 'glossary',
    label: 'Glossary',
    href: '/codex/rules/glossary',
    icon: <ReferenceIcon />,
    description: 'Terms and definitions',
    color: 'var(--color-accent3)'
  },
  {
    id: 'quickstart',
    label: 'Quick Start',
    href: '/codex/rules/quickstart',
    icon: <ReferenceIcon />,
    description: 'Getting started for new players',
    color: 'var(--color-accent3)'
  }
]

const RulesPage: NextPage = () => {
  // State to track component hydration
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Effect to handle client-side hydration
  useEffect(() => {
    // This will only run on the client after hydration
    setIsHydrated(true);
  }, []);

  return (
    <div className="w-full min-h-screen py-8 px-4">
      {/*
        Only render the component when hydrated
        This ensures proper client-side rendering
      */}
      {isHydrated && (
        <ItemNavigation
          items={ruleItems}
          title="Crescent Rules"
          subtitle="Comprehensive rules for the Crescent system"
          initialAnimation={true}
          animationStagger={0.05}
          showSubtitle={false}
          transparentCards={true}
        />
      )}
    </div>
  )
}

export default RulesPage