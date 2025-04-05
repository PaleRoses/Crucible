'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import LeftSidebar from '@/components/navbars/LeftSidebar';
import { css } from '../../../../styled-system/css';

// Define the navigation item interface to match the LeftSidebar component requirements
interface NavigationItem {
  label: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  level?: number;
  href?: string;
  onClick?: () => void;
}

// Convert the existing sidebar structure to the format expected by LeftSidebar
function convertSidebarItems(pathname: string): NavigationItem[] {
  // Original sidebar structure
  const sidebarItems = [
    {
      id: 'core-rules',
      label: 'Core Rules',
      isSection: true,
      items: [
        { id: 'motivations', label: 'Motivations', href: '/codex/rules/motivations' },
        { id: 'actions', label: 'Actions', href: '/codex/rules/actions' },
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

  // Create a flat list of navigation items that represents the hierarchy
  const navigationItems: NavigationItem[] = [];

  // Add section headers and their child items
  sidebarItems.forEach(section => {
    // Add section header (level 1)
    navigationItems.push({
      label: section.label,
      level: 1,
      isActive: false,
      // Make section headers non-clickable
      href: undefined
    });

    // Add each child item (level 2)
    section.items.forEach(item => {
      navigationItems.push({
        label: item.label,
        level: 2,
        isActive: pathname === item.href,
        href: item.href,
        // We'll set onClick in the component
      });
    });
  });

  return navigationItems;
}

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  
  // Initialize and update navigation items based on the current path
  useEffect(() => {
    const items = convertSidebarItems(pathname);
    setNavigationItems(items);
  }, [pathname]);
  
  // Load sidebar state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('codex-sidebar-state');
      if (savedState) {
        setSidebarExpanded(savedState === 'expanded');
      }
    }
  }, []);
  
  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'codex-sidebar-state', 
        sidebarExpanded ? 'expanded' : 'collapsed'
      );
    }
  }, [sidebarExpanded]);
  
  // Handle sidebar toggle
  const handleToggle = (isExpanded: boolean) => {
    setSidebarExpanded(isExpanded);
  };
  
  // Handle navigation
  const handleNavigation = (item: NavigationItem) => {
    if (item.href) {
      router.push(item.href);
    }
  };
  
  // Add onClick handler to navigation items
  const itemsWithHandlers = navigationItems.map(item => ({
    ...item,
    onClick: item.href ? () => handleNavigation(item) : undefined
  }));

  return (
    <div className={css({ display: 'flex', minHeight: '100vh' })}>
      {/* Documentation Sidebar */}
      <LeftSidebar
        title="Codex"
        variant="cosmic"
        initiallyExpanded={sidebarExpanded}
        navigationItems={itemsWithHandlers}
        onToggle={handleToggle}
        pushContent={true}
        contentSelector="#main-content"
        expandedWidth="240px"
        collapsedWidth="64px"
      />
      
      {/* Main Content Area */}
      <main 
        id="main-content" 
        className={css({ 
          flex: '1',
          padding: '0',
          marginTop: '0',
          transition: 'margin-left 300ms ease'
        })}
      >
        {children}
      </main>
    </div>
  );
}