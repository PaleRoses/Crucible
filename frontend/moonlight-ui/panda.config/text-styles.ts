// moonlight-ui/panda.config/text-styles.ts
import { defineTextStyles } from '@pandacss/dev'

export const textStyles = defineTextStyles({
  // --- Semantic Heading Styles ---
  h1: {
    description: 'Style for primary page headings (e.g., <h1>)',
    value: {
      fontFamily: 'heading', // Assumes 'heading' token exists in theme.tokens.fonts
      fontWeight: 'bold',    // Assumes 'bold' token exists in theme.tokens.fontWeights
      fontSize: '4xl',       // Assumes '4xl' token exists in theme.tokens.fontSizes
      lineHeight: 'tight',     // Assumes 'tight' token exists in theme.tokens.lineHeights
      letterSpacing: 'tight',  // Assumes 'tight' token exists in theme.tokens.letterSpacings
      textTransform: 'none',
      textDecoration: 'none',
    }
  },
  h2: {
    description: 'Style for secondary headings (e.g., <h2>)',
    value: {
      fontFamily: 'heading',
      fontWeight: 'semibold', // Assumes 'semibold' token exists
      fontSize: '3xl',       // Assumes '3xl' token exists
      lineHeight: 'snug',      // Assumes 'snug' token exists
      letterSpacing: 'tight',
      textTransform: 'none',
      textDecoration: 'none',
    }
  },
  h3: {
    description: 'Style for tertiary headings (e.g., <h3>)',
    value: {
      fontFamily: 'heading',
      fontWeight: 'semibold',
      fontSize: '2xl',       // Assumes '2xl' token exists
      lineHeight: 'normal',    // Assumes 'normal' token exists
      letterSpacing: 'normal', // Assumes 'normal' token exists
      textTransform: 'none',
      textDecoration: 'none',
    }
  },

  // --- Body and Paragraph Styles ---
  body: {
    description: 'Default body text style for paragraphs (e.g., <p>)',
    value: {
      fontFamily: 'body', // Assumes 'body' token exists in theme.tokens.fonts
      fontWeight: 'normal', // Assumes 'normal' token exists
      fontSize: 'md',    // Assumes 'md' token exists
      lineHeight: 'relaxed', // Assumes 'relaxed' token exists
      letterSpacing: 'normal',
      textTransform: 'none',
      textDecoration: 'none',
    }
  },
  lead: {
    description: 'Larger text style for introductory paragraphs or lead text',
    value: {
      fontFamily: 'body',
      fontWeight: 'normal',
      fontSize: 'lg',    // Assumes 'lg' token exists
      lineHeight: 'relaxed',
      letterSpacing: 'normal',
      textTransform: 'none',
      textDecoration: 'none',
    }
  },

  // --- Utility Text Styles ---
  caption: {
    description: 'Smaller text style for captions or tertiary information',
    value: {
      fontFamily: 'body',
      fontWeight: 'normal',
      fontSize: 'sm',    // Assumes 'sm' token exists
      lineHeight: 'normal',
      letterSpacing: 'normal',
      textTransform: 'none',
      textDecoration: 'none',
    }
  },
  link: {
    description: 'Base style for links (inherits size/family, adds decoration)',
    value: {
      // Typically inherits font family, size, weight from context
      textDecoration: 'underline',
      // Optionally define hover/focus states here if not handled elsewhere
      // _hover: { textDecoration: 'none' } // Example
    }
  },
  buttonLabel: {
    description: 'Text style specifically for button labels',
    value: {
      fontFamily: 'body',
      fontWeight: 'medium', // Assumes 'medium' token exists
      fontSize: 'md',
      lineHeight: 'none', // Buttons often control their own height/padding
      letterSpacing: 'wide', // Assumes 'wide' token exists
      textTransform: 'none',
      textDecoration: 'none',
    }
  }
})