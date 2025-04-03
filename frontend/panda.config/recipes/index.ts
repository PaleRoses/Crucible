// recipes/index.ts

// This file acts as a "barrel" file. It simplifies importing recipes
// into other parts of your application, like panda.config.ts.

// The `export * from './module'` syntax is a standard ES module feature.
// It directly re-exports all named exports from the specified file.
// You do NOT need to explicitly import them into this file first.
// This makes it a concise way to aggregate exports from multiple files.

export * from './cosmicAccordion';
export * from './cosmicAvatar';
export * from './cosmicButton';
export * from './cosmicCard';
export * from './cosmicCollapsible';
export * from './cosmicContent';
export * from './cosmicDonerButton';
export * from './cosmicDropdown';
export * from './cosmicIconButton';
export * from './cosmicInformationCard';
export * from './cosmicInputs';
export * from './cosmicMenuButton';
export * from './cosmicModal';
export * from './cosmicNavItems';
export * from './cosmicRadioButton';
export * from './cosmicSideBar';
export * from './cosmicSubmenu';
export * from './cosmicSwitch';
export * from './cosmicTabs';
export * from './element'; // Assuming 'element.ts' contains named recipe exports
export * from './PopUp'; // Assuming 'PopUp.ts' contains named recipe exports

// --- Alternative (More Verbose) Method ---
// If you preferred, you could explicitly import and then export an object.
// This is generally less common for simple barrel files like this.
/*
import * as cosmicAccordion from './cosmicAccordion';
import * as cosmicAvatar from './cosmicAvatar';
import * as cosmicButton from './cosmicButton';
import * as cosmicCard from './cosmicCard';
import * as cosmicCollapsible from './cosmicCollapsible';
import * as cosmicContent from './cosmicContent';
import * as cosmicDonerButton from './cosmicDonerButton';
import * as cosmicDropdown from './cosmicDropdown';
import * as cosmicIconButton from './cosmicIconButton';
import * as cosmicInformationCard from './cosmicInformationCard';
import * as cosmicInputs from './cosmicInputs';
import * as cosmicMenuButton from './cosmicMenuButton';
import * as cosmicModal from './cosmicModal';
import * as cosmicNavItems from './cosmicNavItems';
import * as cosmicRadioButton from './cosmicRadioButton';
import * as cosmicSideBar from './cosmicSideBar';
import * as cosmicSubmenu from './cosmicSubmenu';
import * as cosmicSwitch from './cosmicSwitch';
import * as cosmicTabs from './cosmicTabs';
import * as element from './element';
import * as PopUp from './PopUp';

// Combine all imported recipes into a single object
export const recipes = {
  ...cosmicAccordion,
  ...cosmicAvatar,
  ...cosmicButton,
  ...cosmicCard,
  ...cosmicCollapsible,
  ...cosmicContent,
  ...cosmicDonerButton,
  ...cosmicDropdown,
  ...cosmicIconButton,
  ...cosmicInformationCard,
  ...cosmicInputs,
  ...cosmicMenuButton,
  ...cosmicModal,
  ...cosmicNavItems,
  ...cosmicRadioButton,
  ...cosmicSideBar,
  ...cosmicSubmenu,
  ...cosmicSwitch,
  ...cosmicTabs,
  ...element,
  ...PopUp,
};
*/
