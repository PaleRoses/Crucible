// moonlight-ui/panda.config/themes.ts
/**
 * Defines the specific token values for each theme.
 * These override the default semantic token values when a theme is active.
 */
export const themes = {
  midnight: {
    semanticTokens: {
      colors: {
        primary: { value: '{colors.midnight.primary}' },
        background: { value: '{colors.midnight.background}' },
        backgroundAlt: { value: '{colors.midnight.backgroundAlt}' },
        text: { value: '{colors.midnight.text}' },
        textMuted: { value: '{colors.midnight.textMuted}' },
        secondary: { value: '{colors.midnight.secondary}' },
        accent1: { value: '{colors.midnight.accent1}' },
        accent2: { value: '{colors.midnight.accent2}' },
        accent3: { value: '{colors.midnight.accent3}' },
        glow: { value: '{colors.midnight.glow}' },
        border: { value: '{colors.midnight.border}' },
        hover: { value: '{colors.midnight.hover}' },
        active: { value: '{colors.midnight.active}' },
        // ADDED: Cosmic colors for midnight theme
        cosmic1: { value: '{colors.midnight.cosmic1}' },
        cosmic2: { value: '{colors.midnight.cosmic2}' },
        cosmic3: { value: '{colors.midnight.cosmic3}' },
        cosmicCore: { value: '{colors.midnight.cosmicCore}' },
      },
      // Add shadow tokens for midnight theme
      shadows: {
        glow: { value: '{shadows.midnight.glow}' },
        md: { value: '{shadows.midnight.md}' },
      }
    }
  },
  starlight: {
    semanticTokens: {
      colors: {
        primary: { value: '{colors.starlight.primary}' },
        background: { value: '{colors.starlight.background}' },
        backgroundAlt: { value: '{colors.starlight.backgroundAlt}' },
        text: { value: '{colors.starlight.text}' },
        textMuted: { value: '{colors.starlight.textMuted}' },
        secondary: { value: '{colors.starlight.secondary}' },
        accent1: { value: '{colors.starlight.accent1}' },
        accent2: { value: '{colors.starlight.accent2}' },
        accent3: { value: '{colors.starlight.accent3}' },
        glow: { value: '{colors.starlight.glow}' },
        border: { value: '{colors.starlight.border}' },
        hover: { value: '{colors.starlight.hover}' },
        active: { value: '{colors.starlight.active}' },
        // ADDED: Cosmic colors for starlight theme
        cosmic1: { value: '{colors.starlight.cosmic1}' },
        cosmic2: { value: '{colors.starlight.cosmic2}' },
        cosmic3: { value: '{colors.starlight.cosmic3}' },
        cosmicCore: { value: '{colors.starlight.cosmicCore}' },
      }
    }
  },
  eclipse: {
    semanticTokens: {
      colors: {
        primary: { value: '{colors.eclipse.primary}' },
        background: { value: '{colors.eclipse.background}' },
        backgroundAlt: { value: '{colors.eclipse.backgroundAlt}' },
        text: { value: '{colors.eclipse.text}' },
        textMuted: { value: '{colors.eclipse.textMuted}' },
        secondary: { value: '{colors.eclipse.secondary}' },
        accent1: { value: '{colors.eclipse.accent1}' },
        accent2: { value: '{colors.eclipse.accent2}' },
        accent3: { value: '{colors.eclipse.accent3}' },
        glow: { value: '{colors.eclipse.glow}' },
        border: { value: '{colors.eclipse.border}' },
        hover: { value: '{colors.eclipse.hover}' },
        active: { value: '{colors.eclipse.active}' },
        // ADDED: Cosmic colors for eclipse theme
        cosmic1: { value: '{colors.eclipse.cosmic1}' },
        cosmic2: { value: '{colors.eclipse.cosmic2}' },
        cosmic3: { value: '{colors.eclipse.cosmic3}' },
        cosmicCore: { value: '{colors.eclipse.cosmicCore}' },
      }
    }
  },
  moonlight: {
    semanticTokens: {
      colors: {
        primary: { value: '{colors.moonlight.primary}' },
        background: { value: '{colors.moonlight.background}' },
        backgroundAlt: { value: '{colors.moonlight.backgroundAlt}' },
        text: { value: '{colors.moonlight.text}' },
        textMuted: { value: '{colors.moonlight.textMuted}' },
        secondary: { value: '{colors.moonlight.secondary}' },
        accent1: { value: '{colors.moonlight.accent1}' },
        accent2: { value: '{colors.moonlight.accent2}' },
        accent3: { value: '{colors.moonlight.accent3}' },
        glow: { value: '{colors.moonlight.glow}' },
        border: { value: '{colors.moonlight.border}' },
        hover: { value: '{colors.moonlight.hover}' },
        active: { value: '{colors.moonlight.active}' },
        // ADDED: Cosmic colors for moonlight theme
        cosmic1: { value: '{colors.moonlight.cosmic1}' },
        cosmic2: { value: '{colors.moonlight.cosmic2}' },
        cosmic3: { value: '{colors.moonlight.cosmic3}' },
        cosmicCore: { value: '{colors.moonlight.cosmicCore}' },
      }
    }
  },
  nebula: {
    semanticTokens: {
      colors: {
        primary: { value: '{colors.nebula.primary}' },
        background: { value: '{colors.nebula.background}' },
        backgroundAlt: { value: '{colors.nebula.backgroundAlt}' },
        text: { value: '{colors.nebula.text}' },
        textMuted: { value: '{colors.nebula.textMuted}' },
        secondary: { value: '{colors.nebula.secondary}' },
        accent1: { value: '{colors.nebula.accent1}' },
        accent2: { value: '{colors.nebula.accent2}' },
        accent3: { value: '{colors.nebula.accent3}' },
        glow: { value: '{colors.nebula.glow}' },
        border: { value: '{colors.nebula.border}' },
        hover: { value: '{colors.nebula.hover}' },
        active: { value: '{colors.nebula.active}' },
        // ADDED: Cosmic colors for nebula theme
        cosmic1: { value: '{colors.nebula.cosmic1}' },
        cosmic2: { value: '{colors.nebula.cosmic2}' },
        cosmic3: { value: '{colors.nebula.cosmic3}' },
        cosmicCore: { value: '{colors.nebula.cosmicCore}' },
      }
    }
  }
}