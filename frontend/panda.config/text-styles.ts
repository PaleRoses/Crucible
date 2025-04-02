import { defineTextStyles } from '@pandacss/dev'

// Define reusable text styles based on the ElementCard component's typography
// Includes default colors using semantic tokens (theme-aware)
export const textStyles = defineTextStyles({
  elementHeading: {
    description: 'Base heading style with letter spacing and light weight',
    value: {
      letterSpacing: '0.1em',
      fontWeight: 300,
    }
  },

  elementMobileNavLine: {
    description: 'Line indicator for mobile navigation items',
    value: {
      fontSize: '0.75rem',
      lineHeight: '1rem',
      fontWeight: 400,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    }
  },
})
