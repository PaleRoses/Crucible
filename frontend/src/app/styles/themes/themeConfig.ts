// styles/themes/themeConfig.ts
import { ThemeName } from './theme';  

// Display names for the theme UI
export const THEME_DISPLAY_NAMES: Record<ThemeName, string> = {
  midnight: 'Midnight',
  azure: 'Azure Depths',
  starlight: 'Starlight',
  amber: 'Amber Eclipse'
};

// Explicit theme order for the UI
export const THEME_ORDER: ThemeName[] = ['midnight', 'azure', 'starlight', 'amber'];

// Descriptions for each theme (optional - can be used in tooltips or documentation)
export const THEME_DESCRIPTIONS: Record<ThemeName, string> = {
  midnight: 'A deep black theme with gold accents, evoking the night sky.',
  azure: 'Deep navy blue theme with teal accents, inspired by ocean depths.',
  starlight: 'Indigo theme with silver and lavender, like the distant stars.',
  amber: 'Warm amber theme with rust accents, reminiscent of a sunset eclipse.'
};

// Theme preview configuration
export const THEME_PREVIEWS: Record<ThemeName, {
  previewColors: string[];  // Array of colors to show in preview swatches
  icon?: string;            // Optional icon identifier for each theme
}> = {
  midnight: {
    previewColors: ['#080808', '#a08e61', '#ccd6e1'],
    icon: '🌙'
  },
  azure: {
    previewColors: ['#0a1428', '#3a9d9e', '#5abfbf'],
    icon: '🌊'
  },
  starlight: {
    previewColors: ['#111133', '#d8e2f3', '#c4adff'],
    icon: '✨'
  },
  amber: {
    previewColors: ['#1a0e0a', '#cb8d3f', '#9e4a3a'],
    icon: '🔥'
  }
};