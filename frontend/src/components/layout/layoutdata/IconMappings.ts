// config/iconMapping.ts
import React from 'react';
// Import all icon components from the central icon file.
// Assuming index.ts exists in ../components/icons now
import * as Icons from './IconComponents'; // Use barrel import

//=============================================================================
// ICON MAPPING CONFIGURATION
//=============================================================================

// Define the type for the icon mapping object.
// It maps string keys to React Functional Components.
type IconMapping = {
  [key: string]: React.FC<any> | React.MemoExoticComponent<any>; // Allow FC or MemoExoticComponent
};

// Create a mapping from string identifiers (used in navItems) to the actual
// React icon components. This allows the NavigationBar to dynamically render
// the correct icon based on the configuration.
export const iconMapping: IconMapping = {
  'arrow': Icons.ArrowIcon,
  'home': Icons.MoonIcon, // Assuming 'home' uses MoonIcon
  'RulesIcon': Icons.RulesIcon,
  'LoreIcon': Icons.LoreIcon,
  'CreatorsIcon': Icons.CreatorsIcon,
  'NewCycleIcon': Icons.NewCycleIcon,
  'PreviousCycleIcon': Icons.PreviousCycleIcon,
  'NewCharacterIcon': Icons.NewCharacterIcon,
  'PreviousCharacterIcon': Icons.PreviousCharacterIcon,
  // Add any other icon mappings needed
};
