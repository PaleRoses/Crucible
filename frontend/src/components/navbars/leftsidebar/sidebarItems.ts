/**
 * Sidebar navigation structure for the Codex application
 * This file contains the data structure for the sidebar navigation menu.
 */

export interface SidebarItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: number | string;
}

export interface SidebarSection {
  label: string;
  items: SidebarItem[];
}

export type SidebarItems = SidebarSection[];

/**
 * The sidebar navigation items for the Codex application
 */
const sidebarItems: SidebarItems = [
  {
    label: 'Core Rules',
    items: [
      { label: 'Motivations', href: '/codex/rules/motivations' },
      { label: 'Actions', href: '/codex/rules/actions' },
      { label: 'Harm', href: '/codex/rules/harm' },
      { label: 'Equipment', href: '/codex/rules/equipment' },
      { label: 'Moves', href: '/codex/rules/moves' },
      { label: 'Experience', href: '/codex/rules/experience' },
    ]
  },
  {
    label: 'World & Character',
    items: [
      { label: 'Creation', href: '/codex/creation' },
      { label: 'Sites', href: '/codex/sites' },
      { label: 'Environments', href: '/codex/environments' },
      { label: 'Godrealms', href: '/codex/godrealms' },
    ]
  },
  {
    label: 'Advanced Mechanics',
    items: [
      { label: 'Gauntlets', href: '/codex/gauntlets' },
      { label: 'Interludes', href: '/codex/interludes' },
      { label: 'Archetypes', href: '/codex/archetypes' },
      { label: 'Stars', href: '/codex/stars' },
    ]
  },
  {
    label: 'Reference',
    items: [
      { label: 'Oracles', href: '/codex/oracles' },
      { label: 'Glossary', href: '/codex/glossary' },
      { label: 'Quick Start', href: '/codex/quickstart' },
    ]
  }
];

export default sidebarItems;