// styles/themes/theme.ts
import { DefaultTheme } from 'styled-components';
import { COLORS } from '../tokens/colors.stylex';

// Define theme type for TypeScript
export type ThemeName = 'midnight' | 'azure' | 'starlight' | 'amber';

// Define the structure of our theme
export interface CustomTheme extends DefaultTheme {
  name: ThemeName;
  colors: {
    // Core colors
    primary: string;
    background: string;
    backgroundAlt: string;
    text: string;
    textMuted: string;
    secondary: string;
    accent1: string;
    accent2: string;
    glow: string;
    border: string;
    hover: string;
    active: string;
    
    // Cosmic colors
    cosmic1: string;
    cosmic2: string;
    cosmic3: string;
    cosmicCore: string;
    
    // Derived colors
    link: string;
    cardBackground: string;
    navBackground: string;
    buttonBackground: string;
    buttonText: string;
  };
}

// Create individual themes
export const midnightTheme: CustomTheme = {
  name: 'midnight',
  colors: {
    // Core colors
    primary: COLORS.midnight.primary,
    background: COLORS.midnight.background,
    backgroundAlt: COLORS.midnight.backgroundAlt,
    text: COLORS.midnight.text,
    textMuted: COLORS.midnight.textMuted,
    secondary: COLORS.midnight.secondary,
    accent1: COLORS.midnight.accent1,
    accent2: COLORS.midnight.accent2,
    glow: COLORS.midnight.glow,
    border: COLORS.midnight.border,
    hover: COLORS.midnight.hover,
    active: COLORS.midnight.active,
    
    // Cosmic colors
    cosmic1: COLORS.midnight.cosmic1,
    cosmic2: COLORS.midnight.cosmic2,
    cosmic3: COLORS.midnight.cosmic3,
    cosmicCore: COLORS.midnight.cosmicCore,
    
    // Derived colors
    link: COLORS.midnight.primary,
    cardBackground: 'rgba(20, 20, 30, 0.85)',
    navBackground: 'rgba(8, 8, 12, 1)',
    buttonBackground: COLORS.midnight.primary,
    buttonText: COLORS.midnight.background,
  }
};

export const azureTheme: CustomTheme = {
  name: 'azure',
  colors: {
    // Core colors
    primary: COLORS.azure.primary,
    background: COLORS.azure.background,
    backgroundAlt: COLORS.azure.backgroundAlt,
    text: COLORS.azure.text,
    textMuted: COLORS.azure.textMuted,
    secondary: COLORS.azure.secondary,
    accent1: COLORS.azure.accent1,
    accent2: COLORS.azure.accent2,
    glow: COLORS.azure.glow,
    border: COLORS.azure.border,
    hover: COLORS.azure.hover,
    active: COLORS.azure.active,
    
    // Cosmic colors
    cosmic1: COLORS.azure.cosmic1,
    cosmic2: COLORS.azure.cosmic2,
    cosmic3: COLORS.azure.cosmic3,
    cosmicCore: COLORS.azure.cosmicCore,
    
    // Derived colors
    link: COLORS.azure.primary,
    cardBackground: 'rgba(10, 30, 50, 0.7)',
    navBackground: 'rgba(10, 20, 40, 0.9)',
    buttonBackground: COLORS.azure.primary,
    buttonText: '#ffffff',
  }
};

export const starlightTheme: CustomTheme = {
  name: 'starlight',
  colors: {
    // Core colors
    primary: COLORS.starlight.primary,
    background: COLORS.starlight.background,
    backgroundAlt: COLORS.starlight.backgroundAlt,
    text: COLORS.starlight.text,
    textMuted: COLORS.starlight.textMuted,
    secondary: COLORS.starlight.secondary,
    accent1: COLORS.starlight.accent1,
    accent2: COLORS.starlight.accent2,
    glow: COLORS.starlight.glow,
    border: COLORS.starlight.border,
    hover: COLORS.starlight.hover,
    active: COLORS.starlight.active,
    
    // Cosmic colors
    cosmic1: COLORS.starlight.cosmic1,
    cosmic2: COLORS.starlight.cosmic2,
    cosmic3: COLORS.starlight.cosmic3,
    cosmicCore: COLORS.starlight.cosmicCore,
    
    // Derived colors
    link: COLORS.starlight.primary,
    cardBackground: 'rgba(17, 17, 51, 0.7)',
    navBackground: 'rgba(7, 7, 24, 0.9)',
    buttonBackground: COLORS.starlight.primary,
    buttonText: COLORS.starlight.background,
  }
};

export const amberTheme: CustomTheme = {
  name: 'amber',
  colors: {
    // Core colors
    primary: COLORS.amber.primary,
    background: COLORS.amber.background,
    backgroundAlt: COLORS.amber.backgroundAlt,
    text: COLORS.amber.text,
    textMuted: COLORS.amber.textMuted,
    secondary: COLORS.amber.secondary,
    accent1: COLORS.amber.accent1,
    accent2: COLORS.amber.accent2,
    glow: COLORS.amber.glow,
    border: COLORS.amber.border,
    hover: COLORS.amber.hover,
    active: COLORS.amber.active,
    
    // Cosmic colors
    cosmic1: COLORS.amber.cosmic1,
    cosmic2: COLORS.amber.cosmic2,
    cosmic3: COLORS.amber.cosmic3,
    cosmicCore: COLORS.amber.cosmicCore,
    
    // Derived colors
    link: COLORS.amber.primary,
    cardBackground: 'rgba(26, 14, 10, 0.7)',
    navBackground: 'rgba(12, 7, 5, 0.9)',
    buttonBackground: COLORS.amber.primary,
    buttonText: COLORS.amber.background,
  }
};

// Create a map of theme names to theme objects for easier access
export const THEMES: Record<ThemeName, CustomTheme> = {
  midnight: midnightTheme,
  azure: azureTheme,
  starlight: starlightTheme,
  amber: amberTheme,
};

// Theme metadata stays the same
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