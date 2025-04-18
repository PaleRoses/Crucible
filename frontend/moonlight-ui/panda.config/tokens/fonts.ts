// moonlight-ui/panda.config/tokens/fonts.ts

import { defineTokens } from '@pandacss/dev'

/**
 * Defines color tokens for the theme.
 * These are used to create semantic tokens and can be referenced in styles.
 */
export const lineHeight = defineTokens.lineHeights({ 
  // Tight (for headings, displays, and condensed UI elements)
  tight: { 
    description: "Extra condensed for large headings and display text",
    value: '1' 
  },
  
  semiTight: { 
    description: "Slightly condensed for headings",
    value: '1.1' 
  },
  
  snug: { 
    description: "Compact spacing for most headings",
    value: '1.2' 
  },
  
  // Normal range (for general content)
  normal: { 
    description: "Standard line height for most text",
    value: '1.3' 
  },
  
  base: { 
    description: "Balanced spacing for general purpose body text",
    value: '1.4' 
  },
  
  default: { 
    description: "Optimal reading line height for paragraph text",
    value: '1.5' 
  },
  
  // Loose (for improved readability)
  relaxed: { 
    description: "Comfortable spacing for longer reading",
    value: '1.625' 
  },
  
  loose: { 
    description: "Spacious for small text or accessible design",
    value: '1.75' 
  },
  
  wide: { 
    description: "Very open spacing for specific design needs",
    value: '2' 
  },
  
  // Special use cases
  code: { 
    description: "Ideal spacing for code blocks and monospace content",
    value: '1.6' 
  },
  
  list: { 
    description: "Optimized for list items",
    value: '1.5' 
  },
  
  form: { 
    description: "Designed for form elements and inputs",
    value: '1.4' 
  }
})

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

export const fontSizes = defineTokens.fontSizes({
    tooltip: { value: '0.75rem' },
    desktopSubmenuDescription: { value: '0.8rem' },
    desktopSubmenuItem: { value: '0.85rem' },
    mobileSubmenuItem: { value: '0.9rem' },
    desktopNavItem: { value: '0.95rem' },
    mobileNavItem: { value: '1.1rem' },
    desktopSubmenuHeader: { value: '1.25rem' },
    sm: { value: '0.875rem' },
    base: { value: '1rem' },
    lg: { value: '1.125rem' },
    xl: { value: '1.25rem' },
    '3xl': { value: '1.875rem' },  // 30px
    '4xl': { value: '2.25rem' },   // 36px
    '5xl': { value: '3rem' },      // 48px
    '6xl': { value: '3.75rem' },   // 60px          
})

export const letterSpacings = defineTokens.letterSpacings({ 
       // Negative spacing (tighter)
  ultraTight: { value: '-0.08em' },
  extraTight: { value: '-0.065em' },
  tighter: { value: '-0.05em' },
  tight: { value: '-0.025em' },
  
  // Neutral
  normal: { value: '0' },
  
  // Positive spacing (wider)
  relaxed: { value: '0.0125em' },
  wide: { value: '0.025em' },
  wider: { value: '0.05em' }, 
  widest: { value: '0.1em' },
  extraWide: { value: '0.15em' },
  ultraWide: { value: '0.2em' },
  
  // Extreme values for special cases
  expanded: { value: '0.25em' },
  extraExpanded: { value: '0.5em' },
  ultraExpanded: { value: '0.75em' },
  maxExpanded: { value: '1em' },
})