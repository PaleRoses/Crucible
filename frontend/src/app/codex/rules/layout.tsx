'use client';

import React from 'react';
import LeftDocSideBar, { SidebarItem } from '@/components/navbars/LeftDocSideBar';

// Sidebar configuration based on Crescent TTRPG Codex structure
const sidebarItems: SidebarItem[] = [
  {
    id: 'core-rules',
    label: 'Core Rules',
    isSection: true,
    items: [
      { id: 'motivations', label: 'Motivations', href: '/codex/motivations' },
      { id: 'actions', label: 'Actions', href: '/codex/actions' },
      { id: 'harm', label: 'Harm', href: '/codex/harm' },
      { id: 'equipment', label: 'Equipment', href: '/codex/equipment' },
      { id: 'moves', label: 'Moves', href: '/codex/moves' },
      { id: 'experience', label: 'Experience', href: '/codex/experience' },
    ]
  },
  {
    id: 'world-character',
    label: 'World & Character',
    isSection: true,
    items: [
      { id: 'creation', label: 'Creation', href: '/codex/creation' },
      { id: 'sites', label: 'Sites', href: '/codex/sites' },
      { id: 'environments', label: 'Environments', href: '/codex/environments' },
      { id: 'godrealms', label: 'Godrealms', href: '/codex/godrealms' },
    ]
  },
  {
    id: 'advanced-mechanics',
    label: 'Advanced Mechanics',
    isSection: true,
    items: [
      { id: 'gauntlets', label: 'Gauntlets', href: '/codex/gauntlets' },
      { id: 'interludes', label: 'Interludes', href: '/codex/interludes' },
      { id: 'archetypes', label: 'Archetypes', href: '/codex/archetypes' },
      { id: 'stars', label: 'Stars', href: '/codex/stars' },
    ]
  },
  {
    id: 'reference',
    label: 'Reference',
    isSection: true,
    items: [
      { id: 'oracles', label: 'Oracles', href: '/codex/oracles' },
      { id: 'glossary', label: 'Glossary', href: '/codex/glossary' },
      { id: 'quickstart', label: 'Quick Start', href: '/codex/quickstart' },
    ]
  }
];

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Function to check if an item is active
  const isItemActive = (item: SidebarItem) => {
    // In a real app, this would compare with the current path
    return item.id === 'motivations'; // Default to motivations as active
  };

  return (
    <>
      {/* Documentation Sidebar - positioned to start right after the navbar */}
      <LeftDocSideBar
        items={sidebarItems}
        isItemActive={isItemActive}
        pushContent={true}
        contentSelector="main"
        showShadow={false}
        showBorder={false}
        expandAllByDefault={true}
      />
      
      {/* Main Content Area */}
      <main>
        {children}
      </main>
    </>
  );
}