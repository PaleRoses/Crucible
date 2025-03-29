// styles/themes/index.stylex.ts
import * as stylex from '@stylexjs/stylex';
import { COLORS } from '../tokens/colors.stylex';

// Define CSS variables to be used throughout the app
export const THEME_VARS = stylex.defineVars({
  // Core colors
  primaryColor: '',
  backgroundColor: '',
  backgroundAltColor: '',  // Added for secondary backgrounds
  textColor: '',
  textMutedColor: '',      // Added for secondary text
  secondaryColor: '',
  accent1Color: '',
  accent2Color: '',
  glowColor: '',
  borderColor: '',
  hoverColor: '',          // Added for hover states
  activeColor: '',         // Added for active states
  
  // Cosmic colors
  cosmic1Color: '',        // Primary cosmic color
  cosmic2Color: '',        // Secondary cosmic color
  cosmic3Color: '',        // Tertiary cosmic color
  cosmicCoreColor: '',     // Core/center cosmic color
  
  // Additional semantic variables
  linkColor: '',
  cardBackground: '',
  navBackground: '',
  buttonBackground: '',
  buttonText: '',
});

// Create individual themes
export const midnightTheme = stylex.createTheme(THEME_VARS, {
  primaryColor: COLORS.midnight.primary,
  backgroundColor: COLORS.midnight.background,
  backgroundAltColor: COLORS.midnight.backgroundAlt,
  textColor: COLORS.midnight.text,
  textMutedColor: COLORS.midnight.textMuted,
  secondaryColor: COLORS.midnight.secondary,
  accent1Color: COLORS.midnight.accent1,
  accent2Color: COLORS.midnight.accent2,
  glowColor: COLORS.midnight.glow,
  borderColor: COLORS.midnight.border,
  hoverColor: COLORS.midnight.hover,
  activeColor: COLORS.midnight.active,
  
  // Cosmic colors
  cosmic1Color: COLORS.midnight.cosmic1,
  cosmic2Color: COLORS.midnight.cosmic2,
  cosmic3Color: COLORS.midnight.cosmic3,
  cosmicCoreColor: COLORS.midnight.cosmicCore,
  
  // Derived variables
  linkColor: COLORS.midnight.primary,
  cardBackground: 'rgba(20, 20, 30, 0.85)',
  navBackground: 'rgba(8, 8, 12, 1)',
  buttonBackground: COLORS.midnight.primary,
  buttonText: COLORS.midnight.background,
});

export const azureTheme = stylex.createTheme(THEME_VARS, {
  primaryColor: COLORS.azure.primary,
  backgroundColor: COLORS.azure.background,
  backgroundAltColor: COLORS.azure.backgroundAlt,
  textColor: COLORS.azure.text,
  textMutedColor: COLORS.azure.textMuted,
  secondaryColor: COLORS.azure.secondary,
  accent1Color: COLORS.azure.accent1,
  accent2Color: COLORS.azure.accent2,
  glowColor: COLORS.azure.glow,
  borderColor: COLORS.azure.border,
  hoverColor: COLORS.azure.hover,
  activeColor: COLORS.azure.active,
  
  // Cosmic colors
  cosmic1Color: COLORS.azure.cosmic1,
  cosmic2Color: COLORS.azure.cosmic2,
  cosmic3Color: COLORS.azure.cosmic3,
  cosmicCoreColor: COLORS.azure.cosmicCore,
  
  // Derived variables
  linkColor: COLORS.azure.primary,
  cardBackground: 'rgba(10, 30, 50, 0.7)',
  navBackground: 'rgba(10, 20, 40, 0.9)',
  buttonBackground: COLORS.azure.primary,
  buttonText: '#ffffff',
});

export const starlightTheme = stylex.createTheme(THEME_VARS, {
  primaryColor: COLORS.starlight.primary,
  backgroundColor: COLORS.starlight.background,
  backgroundAltColor: COLORS.starlight.backgroundAlt,
  textColor: COLORS.starlight.text,
  textMutedColor: COLORS.starlight.textMuted,
  secondaryColor: COLORS.starlight.secondary,
  accent1Color: COLORS.starlight.accent1,
  accent2Color: COLORS.starlight.accent2,
  glowColor: COLORS.starlight.glow,
  borderColor: COLORS.starlight.border,
  hoverColor: COLORS.starlight.hover,
  activeColor: COLORS.starlight.active,
  
  // Cosmic colors
  cosmic1Color: COLORS.starlight.cosmic1,
  cosmic2Color: COLORS.starlight.cosmic2,
  cosmic3Color: COLORS.starlight.cosmic3,
  cosmicCoreColor: COLORS.starlight.cosmicCore,
  
  // Derived variables
  linkColor: COLORS.starlight.primary,
  cardBackground: 'rgba(17, 17, 51, 0.7)',
  navBackground: 'rgba(7, 7, 24, 0.9)',
  buttonBackground: COLORS.starlight.primary,
  buttonText: COLORS.starlight.background,
});

export const amberTheme = stylex.createTheme(THEME_VARS, {
  primaryColor: COLORS.amber.primary,
  backgroundColor: COLORS.amber.background,
  backgroundAltColor: COLORS.amber.backgroundAlt,
  textColor: COLORS.amber.text,
  textMutedColor: COLORS.amber.textMuted,
  secondaryColor: COLORS.amber.secondary,
  accent1Color: COLORS.amber.accent1,
  accent2Color: COLORS.amber.accent2,
  glowColor: COLORS.amber.glow,
  borderColor: COLORS.amber.border,
  hoverColor: COLORS.amber.hover,
  activeColor: COLORS.amber.active,
  
  // Cosmic colors
  cosmic1Color: COLORS.amber.cosmic1,
  cosmic2Color: COLORS.amber.cosmic2,
  cosmic3Color: COLORS.amber.cosmic3,
  cosmicCoreColor: COLORS.amber.cosmicCore,
  
  // Derived variables
  linkColor: COLORS.amber.primary,
  cardBackground: 'rgba(26, 14, 10, 0.7)',
  navBackground: 'rgba(12, 7, 5, 0.9)',
  buttonBackground: COLORS.amber.primary,
  buttonText: COLORS.amber.background,
});

export const THEME_METADATA = {
    midnight: { 
      displayName: 'Midnight',
      order: 1 
    },
    azure: { 
      displayName: 'Azure Depths',
      order: 2 
    },
    starlight: { 
      displayName: 'Starlight',
      order: 3 
    },
    amber: { 
      displayName: 'Amber Eclipse',
      order: 4 
    }
  };
  // Get ordered theme names
export const THEME_ORDER = Object.entries(THEME_METADATA)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([id]) => id as ThemeName);

// Define theme type for TypeScript
export type ThemeName = 'midnight' | 'azure' | 'starlight' | 'amber';

// Create a map of theme names to theme objects for easier access
export const THEMES = {
  midnight: midnightTheme,
  azure: azureTheme,
  starlight: starlightTheme,
  amber: amberTheme,
};