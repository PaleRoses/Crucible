//themeTypes.ts
export type ThemeName = 'midnight' | 'starlight' | 'eclipse' | 'moonlight' | 'nebula';

export const THEMES: Record<ThemeName, { label: string; icon: string }> = {
  midnight: { label: 'Midnight', icon: '🌙' },
  starlight: { label: 'Starlight', icon: '✨' },
  eclipse: { label: 'Eclipse', icon: '🌘' },
  moonlight: { label: 'Moonlight', icon: '🌕' },
  nebula: { label: 'Nebula', icon: '🌌' }
};