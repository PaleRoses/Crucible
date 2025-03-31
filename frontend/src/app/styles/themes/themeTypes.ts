//themeTypes.ts
export type ThemeName = 'midnight' | 'starlight' | 'eclipse' | 'moonlight' | 'flux';

export const THEMES: Record<ThemeName, { label: string; icon: string }> = {
  midnight: { label: 'Midnight', icon: '🌙' },
  starlight: { label: 'Starlight', icon: '✨' },
  eclipse: { label: 'Eclipse', icon: '🌘' },
  moonlight: { label: 'Moonlight', icon: '🌕' },
  flux: { label: 'Flux', icon: '🌌' }
};