// moonlight-ui/panda.config/tokens/colors.ts

import { defineTokens } from '@pandacss/dev'

/**
 * Defines color tokens for the theme.
 * These are used to create semantic tokens and can be referenced in styles.
 */
export const colors = defineTokens.colors({
    // Midnight theme
    midnight: {
        primary: { value: '#BFAD7F' },
        background: { value: '#080808' },
        backgroundAlt: { value: '#14141e' },
        text: { value: '#ccd6e1' },
        textMuted: { value: '#a7b6c8' },
        secondary: { value: '#8c8165' },
        accent1: { value: '#ccd6e1' },
        accent2: { value: '#3987b3' },
        accent3: { value: '#b75e79' },
        glow: { value: 'rgba(160, 142, 97, 0.3)' },
        border: { value: 'rgba(160, 142, 97, 0.2)' },
        hover: { value: 'rgba(160, 142, 97, 0.1)' },
        active: { value: 'rgba(160, 142, 97, 0.3)' },
        
        // Fixed cosmic colors
        cosmic1: { value: 'rgba(255, 255, 255, 1)' },
        cosmic2: { value: 'rgba(255, 253, 227, 0.9)' },
        cosmic3: { value: 'rgba(191, 173, 127, 0.8)' },
        cosmicCore: { value: 'rgba(252, 249, 231, 0.8)' },
      },
      
      // Starlight theme
      starlight: {
        primary: { value: '#9e7b2f' },
        background: { value: '#f9f7f2' },
        backgroundAlt: { value: '#ebe9e4' },
        text: { value: '#2a3744' },
        textMuted: { value: '#5c6773' },
        secondary: { value: '#b99c59' },
        accent1: { value: '#4a90c3' },
        accent2: { value: '#2e6994' },
        accent3: { value: '#a33d58' },
        glow: { value: 'rgba(158, 123, 47, 0.2)' },
        border: { value: 'rgba(158, 123, 47, 0.3)' },
        hover: { value: 'rgba(158, 123, 47, 0.1)' },
        active: { value: 'rgba(158, 123, 47, 0.2)' },
        cosmic1: { value: 'rgba(25, 35, 255, 1)' },
        cosmic2: { value: 'rgba(20, 40, 255, 1)' },
        cosmic3: { value: 'rgba(15, 25, 220, 1)' },
        cosmicCore: { value: 'rgba(255, 255, 255, 0.9)' },
      },
      
      // Eclipse theme
      eclipse: {
        primary: { value: '#7d2e2e' },
        background: { value: '#f0e6d0' },
        backgroundAlt: { value: '#e5d5b8' },
        text: { value: '#3a2a1b' },
        textMuted: { value: '#6b5744' },
        secondary: { value: '#c2803d' },
        accent1: { value: '#b8860b' },
        accent2: { value: '#2e5e4e' },
        accent3: { value: '#34495e' },
        glow: { value: 'rgba(125, 46, 46, 0.2)' },
        border: { value: 'rgba(125, 46, 46, 0.3)' },
        hover: { value: 'rgba(125, 46, 46, 0.1)' },
        active: { value: 'rgba(125, 46, 46, 0.2)' },
        cosmic1: { value: 'rgb(255, 0, 20)' },  // Darker Burgundy (closer to black)
        cosmic2: { value: 'rgb(255, 0, 35)' },  // Darker Plum (closer to black)
        cosmic3: { value: 'rgb(0, 255, 15)' },   // Nearly Black Midnight Blue
        cosmicCore: { value: 'rgba(252, 235, 202, 0.9)' },
      },
      
      // Moonlight theme
      moonlight: {
        primary: { value: '#ccd6e1' },
        background: { value: '#080808' },
        backgroundAlt: { value: '#14141e' },
        text: { value: '#e2e8f0' },
        textMuted: { value: '#94a3b8' },
        secondary: { value: '#7a9bbe' },
        accent1: { value: '#c7b9e0' },
        accent2: { value: '#49b3a6' },
        accent3: { value: '#c389bc' },
        glow: { value: 'rgba(162, 196, 232, 0.25)' },
        border: { value: 'rgba(162, 196, 232, 0.2)' },
        hover: { value: 'rgba(162, 196, 232, 0.1)' },
        active: { value: 'rgba(162, 196, 232, 0.3)' },
        cosmic1: { value: 'rgba(226, 232, 240, 0.9)' }, 
        cosmic2: { value: 'rgba(214, 226, 255, 0.7)' }, 
        cosmic3: { value: 'rgba(191, 203, 232, 0.6)' }, 
        cosmicCore: { value: 'rgba(240, 246, 255, 0.95)' },
      },
      
      // Nebula theme
      nebula: {
        primary: { value: '#FF3CA0' },
        background: { value: '#0A0B18' },
        backgroundAlt: { value: '#10121F' },
        text: { value: '#E2F3FF' },
        textMuted: { value: '#94A9C9' },
        secondary: { value: '#7B4DFF' },
        accent1: { value: '#00E5BC' },
        accent2: { value: '#FF9F1C' },
        accent3: { value: '#01C4E7' },
        glow: { value: 'rgba(255, 60, 160, 0.35)' },
        border: { value: 'rgba(123, 77, 255, 0.3)' },
        hover: { value: 'rgba(0, 229, 188, 0.2)' },
        active: { value: 'rgba(255, 159, 28, 0.3)' },
        cosmic1: { value: '#D7D7ED' },
        cosmic2: { value: '#FFDE85' },
        cosmic3: { value: '#B9F0FF' },
        cosmicCore: { value: 'rgba(255, 255, 255, 0.95)' },
      }
})


/**
 * Defines color tokens for the theme.
 * These are used to create semantic tokens and can be referenced in styles.
 */
export const shadows = defineTokens.shadows({
      // Midnight theme shadows
      midnight: {
        glow: { value: '0 0 15px 1px rgba(160, 142, 97, 0.3)' }, // Soft gold glow
        md: { value: '0 4px 8px rgba(0, 0, 0, 0.5)' }, // Subtle dark shadow
      },
      // Starlight theme shadows
      starlight: {
        glow: { value: '0 0 15px 1px rgba(158, 123, 47, 0.2)' }, // Warm gold glow
        md: { value: '0 4px 8px rgba(0, 0, 0, 0.1)' }, // Light shadow for depth
      },
      // Eclipse theme shadows
      eclipse: {
        glow: { value: '0 0 15px 1px rgba(125, 46, 46, 0.2)' }, // Reddish glow
        md: { value: '0 4px 8px rgba(58, 42, 27, 0.15)' }, // Warm shadow
      },
      // Moonlight theme shadows
      moonlight: {
        glow: { value: '0 0 15px 1px rgba(162, 196, 232, 0.25)' }, // Blue-silver glow
        md: { value: '0 4px 8px rgba(0, 0, 0, 0.5)' }, // Dark shadow with subtle blue tint
      },
      // Beula theme shadows
      nebula: {
        glow: { value: '0 0 15px 1px rgba(255, 60, 160, 0.35)' }, // Vibrant neon glow
        md: { value: '0 4px 8px rgba(10, 11, 24, 0.5)' }, // Dark shadow with slight color
      },
})