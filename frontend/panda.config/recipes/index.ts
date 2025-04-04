// src/styled-system/recipes/index.ts

// Import all recipes
import { cosmicAccordion } from './cosmicAccordion'; 
import { cosmicAvatar } from './cosmicAvatar';
import { cosmicCard } from './cosmicCard';
import { cosmicCollapsible } from './cosmicCollapsible';
import { cosmicContent } from './cosmicContent';
import { cosmicDonerButton } from './cosmicDonerButton';
import { cosmicDropdown } from './cosmicDropdown';
import { cosmicIconButton } from './cosmicIconButton';
import { cosmicInformationCard } from './cosmicInformationCard';
import { cosmicInput } from './cosmicInput';
import { cosmicMenuButton } from './cosmicMenuButton';
import { cosmicModal } from './cosmicModal';
import { cosmicNavItem } from './cosmicNavItem';
import { cosmicRadioButton } from './cosmicRadioButton';
import { cosmicSideBar } from './cosmicSideBar';
import { cosmicSubmenu } from './cosmicSubmenu';
import { cosmicSwitch } from './cosmicSwitch';
import { cosmicTabs } from './cosmicTabs';
import { cosmicTooltip } from './cosmicTooltip';

// Export all recipes as a single object
export const recipes = {
  // Accordion
  cosmicAccordion,
  
  // Avatar
  cosmicAvatar,
  
  // Button
  
  // Card
  cosmicCard,
  
  // Collapsible
  cosmicCollapsible,
  
  // Content
  cosmicContent,
  
  // Dropdown
  cosmicDropdown,
  
  // Doner Button
  cosmicDonerButton,
  
  // Icon Button
  cosmicIconButton,
  
  // Information Card
  cosmicInformationCard,
  
  // Input
  cosmicInput,
  
  // Menu Button
  cosmicMenuButton,
  
  // Modal
  cosmicModal,
  
  // Nav Item
  cosmicNavItem,
  
  // Radio Button
  cosmicRadioButton,
  
  // Sidebar
  cosmicSideBar,
  
  // Submenu
  cosmicSubmenu,
  
  // Switch
  cosmicSwitch,
  
  // Tabs
  cosmicTabs,
  
  // Tooltip
  cosmicTooltip,
};

// Define a type for better intellisense
export type Recipes = typeof recipes;