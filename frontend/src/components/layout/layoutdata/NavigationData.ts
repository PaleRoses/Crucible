// config/navigationData.ts
// This file defines the structure and content for the navigation menu.
// It uses string identifiers for icons, which are then resolved using iconMapping.ts.

//=============================================================================
// NAVIGATION ITEM TYPES
//=============================================================================

// Type for a single submenu item
interface SubMenuItem {
    id: string;
    label: string;
    href: string;
    icon: string; // Icon identifier (key in iconMapping)
    description: string;
  }
  
  // Type for a top-level navigation item (which can contain submenu items)
  interface NavItem {
    id: string;
    label: string;
    href: string;
    submenu?: SubMenuItem[]; // Submenu is optional
  }
  
  //=============================================================================
  // NAVIGATION ITEMS CONFIGURATION
  //=============================================================================
  // Define the navigation items array with the specified type.
  export const navItems: NavItem[] = [
    {
      id: 'codex',
      label: 'CODEX',
      href: '/codex', // Main link for the top-level item
      submenu: [ // Submenu items
        {
          id: 'rules',
          label: 'RULES',
          href: '/codex/rules',
          icon: 'RulesIcon', // Icon identifier (maps to RulesIcon component)
          description: 'Core gameplay mechanics.'
        },
        {
          id: 'lore',
          label: 'LORE',
          href: '/codex/lore',
          icon: 'LoreIcon', // Icon identifier
          description: 'Background stories and world history.'
        },
        {
          id: 'creators',
          label: 'CREATORS',
          href: '/codex/creators',
          icon: 'CreatorsIcon', // Icon identifier
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
          icon: 'NewCycleIcon', // Icon identifier
          description: 'Paint a new world onto the empty canvas.'
        },
        {
          id: 'previous-cycle',
          label: 'PREVIOUS CYCLE',
          href: '/cycles/previous',
          icon: 'PreviousCycleIcon', // Icon identifier
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
          icon: 'NewCharacterIcon', // Icon identifier
          description: 'Design a new protagonist for your adventures.'
        },
        {
          id: 'previous-character',
          label: 'PREVIOUS CHARACTER',
          href: '/characters/previous',
          icon: 'PreviousCharacterIcon', // Icon identifier
          description: 'Browse characters from earlier campaigns.'
        }
      ]
    }
    // Add more top-level navigation items here if needed
  ];
  