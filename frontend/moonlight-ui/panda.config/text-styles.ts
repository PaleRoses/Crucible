// moonlight-ui/panda.config/text-styles.ts
import { defineTextStyles } from '@pandacss/dev'

/**
 * Defines semantic text styles using the design tokens.
 * These styles combine font properties like family, size, weight,
 * line height, and letter spacing for consistent typography.
 */
export const textStyles = defineTextStyles({
  // --- Semantic Heading Styles ---
  h1: {
    description: 'Primary page heading',
    value: {
      fontFamily: 'heading',
      fontWeight: 'thin',
      fontSize: '5xl',
      lineHeight: 'snug',
      letterSpacing: 'extraWide',
      fontOpticalSizing: 'none', // Specific property for h1
    }
  },
  h2: {
    description: 'Secondary section heading',
    value: {
      fontFamily: 'heading',
      fontWeight: 'thin',
      fontSize: '4xl',
      lineHeight: 'normal',
      letterSpacing: 'widest',
    }
  },
  h3: {
    description: 'Tertiary heading or prominent element title',
    value: {
      fontFamily: 'heading',
      fontWeight: 'thin',
      fontSize: 'label',
      lineHeight: 'base',
      letterSpacing: 'widest',
      textTransform: 'uppercase',
    }
  },

  // --- Body & Content Styles ---
  body: {
    description: 'Default body text for paragraphs and long-form content',
    value: {
      fontFamily: 'body',
      fontWeight: 'normal',
      fontSize: 'base',
      lineHeight: 'default',
      letterSpacing: 'normal',
    }
  },
  caption: {
    description: 'Smaller text for captions, descriptions, helper text',
    value: {
      fontFamily: 'body',
      fontWeight: 'normal',
      fontSize: 'sm',
      lineHeight: 'base',
      letterSpacing: 'relaxed',
    }
  },

  // --- UI Element Styles ---
  label: {
    description: 'Text for UI element labels (e.g., form inputs)',
    value: {
      fontFamily: 'heading',
      fontWeight: 'thin',
      fontSize: 'label',
      lineHeight: 'base',
      letterSpacing: 'widest',
      textTransform: 'uppercase',
    }
  },
  button: {
    description: 'Text specifically for button elements',
    value: {
      fontFamily: 'heading',
      fontWeight: 'semibold',
      fontSize: 'base',
      lineHeight: 'tight',
      letterSpacing: 'widest',
      textTransform: 'uppercase',
    }
  },

  // --- Navigation Styles ---
  navItem: {
    description: 'Primary navigation item text (e.g., top bar)',
    value: {
      fontFamily: 'heading',
      fontWeight: 'thin',
      fontSize: 'desktopNavItem', // Corresponds to 0.95rem
      lineHeight: 'tight',
      letterSpacing: 'extraWide',
      textTransform: 'uppercase',
    }
  },
  navSubItem: {
    description: 'Navigation submenu item text',
    value: {
      fontFamily: 'heading',
      fontWeight: 'thin',
      fontSize: 'desktopSubmenuItem', // Corresponds to 0.85rem
      lineHeight: 'base',
      letterSpacing: 'extraWide',
    }
  },
  navDense: {
    description: 'Compact navigation item text (e.g., sidebars)',
    value: {
      fontFamily: 'body', // Using body font for potential density/readability
      fontWeight: 'thin',
      fontSize: 'sm',
      lineHeight: 'base',
      letterSpacing: 'wide',
    }
  },

  // --- Miscellaneous Styles ---
  overline: {
    description: 'Small, uppercase text above headings or for category indicators',
    value: {
      fontFamily: 'heading',
      fontWeight: 'semibold',
      fontSize: 'tooltip', // Corresponds to 0.75rem
      lineHeight: 'tight',
      letterSpacing: 'ultraWide',
      textTransform: 'uppercase',
    }
  },
  link: {
    description: 'Base style for inline text links (color/decoration applied separately)',
    value: {
      fontFamily: 'body',
      fontWeight: 'normal', // Slightly heavier than body text
      fontSize: 'base',
      lineHeight: 'default',
      letterSpacing: 'normal',
      // textDecoration: 'underline' // Note: Decoration often applied via component or utility class
    }
  },
  tooltip: {
    description: 'Text style specifically for tooltips',
    value: {
      fontFamily: 'body',
      fontWeight: 'normal',
      fontSize: 'tooltip', // Corresponds to 0.75rem
      lineHeight: 'form', // Using 'form' line height token (1.4)
      letterSpacing: 'wide',
    }
  },
})
