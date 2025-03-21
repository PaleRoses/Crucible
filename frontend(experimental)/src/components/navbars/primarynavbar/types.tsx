import { ReactNode } from 'react';

/**
 * Basic navigation item interface
 */
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  submenu: SubmenuItem[];
}

/**
 * Navigation submenu item interface
 */
export interface SubmenuItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  description?: string;
}

/**
 * Enhanced submenu item with optional description
 */
export interface EnhancedSubmenuItem extends SubmenuItem {
  description?: string;
}

/**
 * Enhanced navigation item with enhanced submenu items
 */
export interface EnhancedNavItem extends NavItem {
  submenu: EnhancedSubmenuItem[];
}

/**
 * Props for the main navigation bar component
 */
export interface NavigationBarProps {
  items?: EnhancedNavItem[];
}

/**
 * Context type for managing which submenu is currently open
 */
export interface NavContextType {
  openSubmenuId: string | null;
  setOpenSubmenuId: (id: string | null) => void;
}

/**
 * Props for styled components that need to know if a route is active
 */
export interface ActiveProps {
  $isActive: boolean;
}

/**
 * Additional descriptions for submenu sections
 */
export const submenuDescriptions: Record<string, string> = {
  codex: "Explore the foundational elements of our world including rules, lore, and creator information.",
  cycles: "Navigate through current and previous story cycles in our evolving narrative.",
  characters: "Create new characters or revisit existing ones from past adventures."
};

/**
 * Default navigation items for the navigation bar
 */
export const defaultNavItems: EnhancedNavItem[] = [
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
        description: 'Core gameplay mechanics and official guidelines.'
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
        description: 'Begin a fresh narrative arc with new challenges.'
      },
      {
        id: 'previous-cycle',
        label: 'Previous Cycle',
        href: '/cycles/previous',
        icon: 'PreviousCycleIcon',
        description: 'Review completed story arcs from the past.'
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
export const navItemVariants = {
  idle: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { 
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const arrowVariants = {
  closed: { rotate: 0 },
  open: { rotate: 180 }
};

export const submenuVariants = {
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

export const submenuItemVariants = {
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

export const mobileMenuVariants = {
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

export const mobileItemVariants = {
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