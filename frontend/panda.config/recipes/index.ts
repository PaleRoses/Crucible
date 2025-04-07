// frontend/panda.config/recipes/index.ts

// Import all individual recipes and components
import { cosmicAccordionRoot, cosmicAccordionItem, cosmicAccordionTrigger, cosmicAccordionContent, cosmicAccordion } from './cosmicAccordion';
import { cosmicAvatar, cosmicAvatarStatus, cosmicAvatarBadge, cosmicAvatarGroup, cosmicAvatarComponents } from './cosmicAvatar';
import { cosmicButton } from './cosmicButton';
import { cosmicCard } from './cosmicCard';
import { cosmicCollapsibleContainer, cosmicCollapsibleTrigger, cosmicCollapsibleContent, cosmicCollapsibleGroup, cosmicCollapsible } from './cosmicCollapsible';
import { cosmicLayout, cosmicHeader, cosmicContent, cosmicContentInner } from './cosmicContent';
import { cosmicDonerButton } from './cosmicDonerButton';
import { cosmicDropdownTrigger, cosmicDropdownContent, cosmicDropdownItem, cosmicDropdownSeparator, cosmicDropdownLabel, cosmicDropdown } from './cosmicDropdown';
import { cosmicIconButton } from './cosmicIconButton';
import { cosmicInformationCard } from './cosmicInformationCard';
import { cosmicInputWrapper, cosmicInputField, cosmicInputLabel, cosmicInputAdornment, cosmicInputUnderline, cosmicInput } from './cosmicInput';
import { cosmicMenuButton } from './cosmicMenuButton';
import { cosmicModalOverlay, cosmicModalContent, cosmicModalHeader, cosmicModalBody, cosmicModalFooter, cosmicModal } from './cosmicModal';
import { cosmicNavItem } from './cosmicNavItem';

import { 
  cosmicNavigationContainer,
  cosmicNavigationContent,
  cosmicNavigationLogo,
  cosmicNavigationItemsContainer,
  cosmicNavigationItem,
  cosmicNavigationSubmenu,
  cosmicNavigationSubmenuItem,
  cosmicMobileNavigationContainer,
  cosmicMobileNavigationHeader,
  cosmicMobileNavigationItem,
  cosmicMobileNavigationSubmenu,
  cosmicMobileMenuButton,
  cosmicNavigationBar
} from './cosmicNavigationBar';


import { cosmicRadioGroup, cosmicRadioContainer, cosmicRadioInput, cosmicRadioMarker, cosmicRadioLabel, cosmicRadioError, cosmicRadioButton } from './cosmicRadioButton';

import { cosmicPageLayout, cosmicSidebar, cosmicSidebarHeader, cosmicSidebarContent, cosmicSidebarItem, cosmicSidebarNestedItems, cosmicSidebarGroup, cosmicSidebarDivider, cosmicSidebarBadge, cosmicSidebarFooter, cosmicSidebarToggle, cosmicSidebarSearch, cosmicSideBar } from './cosmicSideBar';

import { cosmicSubmenu, cosmicSubmenuGrid, cosmicSubmenuHeader, cosmicSubmenuTitle, cosmicSubmenuDescription, cosmicSubmenuItem, cosmicSubmenuComponents } from './cosmicSubmenu';
import { cosmicSwitchContainer, cosmicSwitchInput, cosmicSwitchTrack, cosmicSwitchThumb, cosmicSwitchLabel, cosmicSwitch } from './cosmicSwitch';
import { cosmicTabsContainer, cosmicTabsList, cosmicTabTrigger, cosmicTabsContent, cosmicTabPanel, cosmicTabs } from './cosmicTabs';
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