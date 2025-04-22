// moonlight-ui/panda.config/tokens/fonts.ts

import { defineTokens } from '@pandacss/dev'

/**
 * Defines fluid line height tokens for the theme using clamp().
 * These are used to create semantic tokens and can be referenced in styles.
 */
export const lineHeight = defineTokens.lineHeights({
  // Tight (for headings, displays, and condensed UI elements)
  tight: {
    description: "Extra condensed for large headings and display text",
    value: 'clamp(0.95, 0.92 + 0.01vw, 1.05)' // Was 1
  },
  semiTight: {
    description: "Slightly condensed for headings",
    value: 'clamp(1.05, 1.02 + 0.01vw, 1.15)' // Was 1.1
  },
  snug: {
    description: "Compact spacing for most headings",
    value: 'clamp(1.15, 1.12 + 0.015vw, 1.25)' // Was 1.2
  },

  // Normal range (for general content)
  normal: {
    description: "Standard line height for most text",
    value: 'clamp(1.25, 1.22 + 0.015vw, 1.35)' // Was 1.3
  },
  base: {
    description: "Balanced spacing for general purpose body text",
    value: 'clamp(1.35, 1.3 + 0.02vw, 1.45)' // Was 1.4
  },
  default: {
    description: "Optimal reading line height for paragraph text",
    value: 'clamp(1.45, 1.4 + 0.02vw, 1.55)' // Was 1.5
  },

  // Loose (for improved readability)
  relaxed: {
    description: "Comfortable spacing for longer reading",
    value: 'clamp(1.55, 1.5 + 0.025vw, 1.7)' // Was 1.625
  },
  loose: {
    description: "Spacious for small text or accessible design",
    value: 'clamp(1.65, 1.6 + 0.03vw, 1.85)' // Was 1.75
  },
  wide: {
    description: "Very open spacing for specific design needs",
    value: 'clamp(1.9, 1.85 + 0.03vw, 2.1)' // Was 2
  },

  // Special use cases
  code: {
    description: "Ideal spacing for code blocks and monospace content",
    value: 'clamp(1.5, 1.45 + 0.025vw, 1.7)' // Was 1.6
  },
  list: {
    description: "Optimized for list items",
    value: 'clamp(1.45, 1.4 + 0.02vw, 1.55)' // Was 1.5 (Same as default)
  },
  form: {
    description: "Designed for form elements and inputs",
    value: 'clamp(1.35, 1.3 + 0.02vw, 1.45)' // Was 1.4 (Same as base)
  }
});

export const fonts = defineTokens.fonts({
    heading: { 
        description: "Font for headings throughout the application",
        value: "'haboro-soft-condensed-fallback', 'haboro-soft-condensed', 'Avenir Next', 'Avenir', sans-serif",
    },
    body: { 
        description: "Primary font for body text" ,
        value: "'adobe-caslon-pro-fallback', 'adobe-caslon-pro', 'LTC Caslon', Georgia, serif",
    },
    mono: { 
        description: "Monospace font for code and technical content",
        value: "'ibm-plex-mono-fallback', 'ibm-plex-mono', 'Consolas', monospace",
    },
})

export const fontWeights = defineTokens.fontWeights({
    thin: { value: '200' },
    normal: { value: '400' },
    medium: { value: '500' },
    semibold: { value: '600' },
    bold: { value: '700' },
})

// Updated font size tokens using clamp() where specified
export const fontSizes = defineTokens.fontSizes({
  // Previously static tokens now updated with clamp() - Increased MAX value
  tooltip: { value: 'clamp(0.7rem, 0.65rem + 0.2vw, 0.95rem)' }, // Max was 0.85rem
  desktopSubmenuDescription: { value: 'clamp(0.75rem, 0.7rem + 0.25vw, 1.05rem)' }, // Max was 0.9rem
  desktopSubmenuItem: { value: 'clamp(0.8rem, 0.7rem + 0.3vw, 1.15rem)' }, // Max was 1rem
  mobileSubmenuItem: { value: 'clamp(0.85rem, 0.75rem + 0.35vw, 1.2rem)' }, // Max was 1.05rem
  desktopNavItem: { value: 'clamp(0.9rem, 0.8rem + 0.4vw, 1.25rem)' }, // Max was 1.1rem
  mobileNavItem: { value: 'clamp(1rem, 0.85rem + 0.5vw, 1.5rem)' }, // Max was 1.3rem
  desktopSubmenuHeader: { value: 'clamp(1.1rem, 0.9rem + 0.6vw, 1.75rem)' }, // Max was 1.5rem

  // Tokens added previously with clamp() - Increased MAX value
  xs: { value: 'clamp(0.75rem, 0.6rem + 0.5vw, 1.3rem)' }, // Max was 1.15rem
  label: { value: 'clamp(0.925rem, 0.75rem + 0.7vw, 1.6rem)' }, // Max was 1.375rem
  description: { value: 'clamp(0.8125rem, 0.65rem + 0.6vw, 1.45rem)' }, // Max was 1.25rem

  // Existing tokens updated previously with clamp() - Increased MAX value
  sm: { value: 'clamp(0.825rem, 0.7rem + 0.6vw, 1.45rem)' }, // Max was 1.25rem
  base: { value: 'clamp(0.8rem, 0.65rem + 0.5vw, 1.6rem)' }, // Max was 1.375rem
  lg: { value: 'clamp(1rem, 0.85rem + 0.8vw, 1.75rem)' }, // Max was 1.5rem
  xl: { value: 'clamp(1.125rem, 0.9rem + 0.9vw, 2rem)' },   // Max was 1.75rem

  // Large size tokens, previously static, now updated with clamp() - Increased MAX value
  '3xl': { value: 'clamp(1.5rem, 1.1rem + 1.2vw, 2.6rem)' },   // Max was 2.25rem
  '4xl': { value: 'clamp(1.8rem, 1.3rem + 1.5vw, 3.2rem)' },   // Max was 2.75rem
  '5xl': { value: 'clamp(2.4rem, 1.8rem + 1.8vw, 4.1rem)' },    // Max was 3.6rem
  '6xl': { value: 'clamp(3rem, 2.2rem + 2.2vw, 5.2rem)' },     // Max was 4.5rem
});

// Updated letter spacing tokens using clamp() - Increased MAX value
export const letterSpacings = defineTokens.letterSpacings({
  // Negative spacing (tighter) - previously static, now updated with clamp() - Increased MAX value (closer to 0)
  ultraTight: { value: 'clamp(-0.09em, -0.085em + 0.005vw, -0.06em)' }, // Max was -0.07em
  extraTight: { value: 'clamp(-0.075em, -0.07em + 0.005vw, -0.045em)' }, // Max was -0.055em
  tighter: { value: 'clamp(-0.06em, -0.055em + 0.005vw, -0.035em)' }, // Max was -0.04em

  // Tokens updated previously with adjusted clamp() values - Increased MAX value
  tight: { value: 'clamp(-0.01em, -0.015em + 0.01vw, 0em)' }, // Max was -0.005em
  normal: { value: 'clamp(0em, -0.005em + 0.02vw, 0.015em)' }, // Max was 0.01em
  wide: { value: 'clamp(0.025em, 0.015em + 0.03vw, 0.055em)' }, // Max was 0.045em

  // Positive spacing (wider) - previously static, now updated with clamp() - Increased MAX value
  relaxed: { value: 'clamp(0.01em, 0.008em + 0.005vw, 0.02em)' }, // Max was 0.018em
  // 'wide' is updated above
  wider: { value: 'clamp(0.04em, 0.03em + 0.01vw, 0.08em)' },     // Max was 0.07em
  widest: { value: 'clamp(0.08em, 0.06em + 0.015vw, 0.15em)' },   // Max was 0.13em
  extraWide: { value: 'clamp(0.12em, 0.09em + 0.02vw, 0.22em)' }, // Max was 0.19em
  ultraWide: { value: 'clamp(0.16em, 0.12em + 0.025vw, 0.29em)' },// Max was 0.25em

  // Extreme values for special cases - previously static, now updated with clamp() - Increased MAX value
  expanded: { value: 'clamp(0.2em, 0.15em + 0.03vw, 0.35em)' },   // Max was 0.3em
  extraExpanded: { value: 'clamp(0.4em, 0.3em + 0.05vw, 0.7em)' },// Max was 0.6em
  ultraExpanded: { value: 'clamp(0.6em, 0.45em + 0.08vw, 1.05em)' },// Max was 0.9em
  maxExpanded: { value: 'clamp(0.8em, 0.6em + 0.1vw, 1.4em)' },   // Max was 1.2em
});