// frontend/panda.config/recipes/index.ts

// Import all individual recipes and components
import { cosmicAccordion, cosmicAccordionContent, cosmicAccordionItem, cosmicAccordionRoot, cosmicAccordionTrigger } from './cosmicAccordion';
import { cosmicAvatar, cosmicAvatarBadge, cosmicAvatarComponents, cosmicAvatarGroup, cosmicAvatarStatus } from './cosmicAvatar';
import { cosmicButton } from './cosmicButton';
import { cosmicCard } from './cosmicCard';
import { cosmicCollapsible, cosmicCollapsibleContainer, cosmicCollapsibleContent, cosmicCollapsibleGroup, cosmicCollapsibleTrigger } from './cosmicCollapsible';
import { cosmicContent, cosmicContentInner, cosmicHeader, cosmicLayout } from './cosmicContent';
import { cosmicDonerButton } from './cosmicDonerButton';
import { cosmicDropdown, cosmicDropdownContent, cosmicDropdownItem, cosmicDropdownLabel, cosmicDropdownSeparator, cosmicDropdownTrigger } from './cosmicDropdown';
import { cosmicIconButton } from './cosmicIconButton';
import { cosmicInformationCard } from './cosmicInformationCard';
import { cosmicInput, cosmicInputAdornment, cosmicInputField, cosmicInputLabel, cosmicInputUnderline, cosmicInputWrapper } from './cosmicInput';
import { cosmicMenuButton } from './cosmicMenuButton';
import { cosmicModal, cosmicModalBody, cosmicModalContent, cosmicModalFooter, cosmicModalHeader, cosmicModalOverlay } from './cosmicModal';
import { cosmicNavItem } from './cosmicNavItem';

import {
  cosmicMobileMenuButton,
  cosmicMobileNavigationContainer,
  cosmicMobileNavigationHeader,
  cosmicMobileNavigationItem,
  cosmicMobileNavigationSubmenu,
  cosmicNavigationBar,
  cosmicNavigationContainer,
  cosmicNavigationContent,
  cosmicNavigationItem,
  cosmicNavigationItemsContainer,
  cosmicNavigationLogo,
  cosmicNavigationSubmenu,
  cosmicNavigationSubmenuItem
} from './cosmicNavigationBar';


import { cosmicRadioButton, cosmicRadioContainer, cosmicRadioError, cosmicRadioGroup, cosmicRadioInput, cosmicRadioLabel, cosmicRadioMarker } from './cosmicRadioButton';

import { cosmicPageLayout, cosmicSidebar, cosmicSideBar, cosmicSidebarBadge, cosmicSidebarContent, cosmicSidebarDivider, cosmicSidebarFooter, cosmicSidebarGroup, cosmicSidebarHeader, cosmicSidebarItem, cosmicSidebarNestedItems, cosmicSidebarSearch, cosmicSidebarToggle } from './cosmicSideBar';

import { cosmicSubmenu, cosmicSubmenuComponents, cosmicSubmenuDescription, cosmicSubmenuGrid, cosmicSubmenuHeader, cosmicSubmenuItem, cosmicSubmenuTitle } from './cosmicSubmenu';
import { cosmicSwitch, cosmicSwitchContainer, cosmicSwitchInput, cosmicSwitchLabel, cosmicSwitchThumb, cosmicSwitchTrack } from './cosmicSwitch';
import { cosmicTabPanel, cosmicTabs, cosmicTabsContainer, cosmicTabsContent, cosmicTabsList, cosmicTabTrigger } from './cosmicTabs';
import { cosmicTooltip } from './cosmicTooltip';

// Export all recipes as a single object with individual components
export const recipes = {
  // Accordion components
  cosmicAccordionRoot: cosmicAccordionRoot,
  cosmicAccordionItem: cosmicAccordionItem,
  cosmicAccordionTrigger: cosmicAccordionTrigger,
  cosmicAccordionContent: cosmicAccordionContent,
  cosmicAccordion: cosmicAccordion,

  // Avatar components
  cosmicAvatar: cosmicAvatar,
  cosmicAvatarStatus: cosmicAvatarStatus,
  cosmicAvatarBadge: cosmicAvatarBadge,
  cosmicAvatarGroup: cosmicAvatarGroup,
  cosmicAvatarComponents: cosmicAvatarComponents,

  // Button components
  cosmicButton: cosmicButton,

  // Card components
  cosmicCard: cosmicCard,

  // Collapsible components
  cosmicCollapsibleContainer: cosmicCollapsibleContainer,
  cosmicCollapsibleTrigger: cosmicCollapsibleTrigger,
  cosmicCollapsibleContent: cosmicCollapsibleContent,
  cosmicCollapsibleGroup: cosmicCollapsibleGroup,
  cosmicCollapsible: cosmicCollapsible,

  // Content/Layout components
  cosmicLayout: cosmicLayout,
  cosmicHeader: cosmicHeader,
  cosmicContent: cosmicContent,
  cosmicContentInner: cosmicContentInner,

  // Doner Button component
  cosmicDonerButton: cosmicDonerButton,

  // Dropdown components
  cosmicDropdownTrigger: cosmicDropdownTrigger,
  cosmicDropdownContent: cosmicDropdownContent,
  cosmicDropdownItem: cosmicDropdownItem,
  cosmicDropdownSeparator: cosmicDropdownSeparator,
  cosmicDropdownLabel: cosmicDropdownLabel,
  cosmicDropdown: cosmicDropdown,

  // Icon Button component
  cosmicIconButton: cosmicIconButton,

  // Information Card component
  cosmicInformationCard: cosmicInformationCard,

  // Input components
  cosmicInputWrapper: cosmicInputWrapper,
  cosmicInputField: cosmicInputField,
  cosmicInputLabel: cosmicInputLabel,
  cosmicInputAdornment: cosmicInputAdornment,
  cosmicInputUnderline: cosmicInputUnderline,
  cosmicInput: cosmicInput,

  // Menu Button component
  cosmicMenuButton: cosmicMenuButton,

  // Modal components
  cosmicModalOverlay: cosmicModalOverlay,
  cosmicModalContent: cosmicModalContent,
  cosmicModalHeader: cosmicModalHeader,
  cosmicModalBody: cosmicModalBody,
  cosmicModalFooter: cosmicModalFooter,
  cosmicModal: cosmicModal,

  // Navigation Item component
  cosmicNavItem: cosmicNavItem,


  // Navigation Bar components
  cosmicNavigationContainer: cosmicNavigationContainer,
  cosmicNavigationContent: cosmicNavigationContent,
  cosmicNavigationLogo: cosmicNavigationLogo,
  cosmicNavigationItemsContainer: cosmicNavigationItemsContainer,
  cosmicNavigationItem: cosmicNavigationItem,
  cosmicNavigationSubmenu: cosmicNavigationSubmenu,
  cosmicNavigationSubmenuItem: cosmicNavigationSubmenuItem,
  cosmicMobileNavigationContainer: cosmicMobileNavigationContainer,
  cosmicMobileNavigationHeader: cosmicMobileNavigationHeader,
  cosmicMobileNavigationItem: cosmicMobileNavigationItem,
  cosmicMobileNavigationSubmenu: cosmicMobileNavigationSubmenu,
  cosmicMobileMenuButton: cosmicMobileMenuButton,
  cosmicNavigationBar: cosmicNavigationBar,

  // Radio Button components
  cosmicRadioGroup: cosmicRadioGroup,
  cosmicRadioContainer: cosmicRadioContainer,
  cosmicRadioInput: cosmicRadioInput,
  cosmicRadioMarker: cosmicRadioMarker,
  cosmicRadioLabel: cosmicRadioLabel,
  cosmicRadioError: cosmicRadioError,
  cosmicRadioButton: cosmicRadioButton, // Note: Value was cosmicRadioButton, kept key as cosmicRadioButton

  // Sidebar components
  cosmicPageLayout: cosmicPageLayout,
  cosmicSidebar: cosmicSidebar,
  cosmicSidebarHeader: cosmicSidebarHeader,
  cosmicSidebarContent: cosmicSidebarContent,
  cosmicSidebarItem: cosmicSidebarItem,
  cosmicSidebarFooter: cosmicSidebarFooter,
  cosmicSidebarToggle: cosmicSidebarToggle,
  cosmicSideBar: cosmicSideBar, // Note: Value was cosmicSideBar, kept key as cosmicSideBar
  cosmicSidebarNestedItems: cosmicSidebarNestedItems,
  cosmicSidebarGroup: cosmicSidebarGroup,
  cosmicSidebarDivider: cosmicSidebarDivider,
  cosmicSidebarBadge: cosmicSidebarBadge,
  cosmicSidebarSearch: cosmicSidebarSearch,
  

  // Submenu components
  cosmicSubmenu: cosmicSubmenu,
  cosmicSubmenuGrid: cosmicSubmenuGrid,
  cosmicSubmenuHeader: cosmicSubmenuHeader,
  cosmicSubmenuTitle: cosmicSubmenuTitle,
  cosmicSubmenuDescription: cosmicSubmenuDescription,
  cosmicSubmenuItem: cosmicSubmenuItem,
  cosmicSubmenuComponents: cosmicSubmenuComponents,

  // Switch components
  cosmicSwitchContainer: cosmicSwitchContainer,
  cosmicSwitchInput: cosmicSwitchInput,
  cosmicSwitchTrack: cosmicSwitchTrack,
  cosmicSwitchThumb: cosmicSwitchThumb,
  cosmicSwitchLabel: cosmicSwitchLabel,
  cosmicSwitch: cosmicSwitch, // Note: Value was cosmicSwitch, kept key as cosmicSwitch

  // Tabs components
  cosmicTabsContainer: cosmicTabsContainer,
  cosmicTabsList: cosmicTabsList,
  cosmicTabTrigger: cosmicTabTrigger,
  cosmicTabsContent: cosmicTabsContent,
  cosmicTabPanel: cosmicTabPanel,
  cosmicTabs: cosmicTabs,

  // Tooltip component
  cosmicTooltip: cosmicTooltip,
}


// Define a type for better intellisense
export type Recipes = typeof recipes;