// moonlight-ui/panda.config/tokens/borders.ts

import { defineTokens } from '@pandacss/dev'




// --- Border Widths ---
// Define responsive border width tokens using clamp()
export const borderWidths = defineTokens.borderWidths({
    thin: { value: 'clamp(0.5px, 0.25px + 0.05vw, 1px)' },  // Corresponds to ~0.5px - 1px
    normal: { value: 'clamp(1px, 0.75px + 0.05vw, 1.5px)' }, // Corresponds to ~1px - 1.5px
    thick: { value: 'clamp(1.5px, 1px + 0.1vw, 2.5px)' },   // Corresponds to ~1.5px - 2.5px
    feature: { value: 'clamp(4px, 2.5px + 0.5vw, 6px)' },  // Corresponds to ~2px - 4px (for prominent borders)
  });
  
// --- Borders ---
// Define border tokens leveraging semantic color tokens from the active theme
export const borders = defineTokens.borders({
    // Default/Subtle borders - Uses the theme's specific 'border' color

  
    neutral: { value: '1px solid border' }, // Subtle border for cards, inputs etc.
    // Note: There isn't a direct 'neutralEmphasis' in the provided colors.
    // Consider adding a specific color token or using 'textMuted' or 'secondary'.
    neutralEmphasis: { value: '1px solid textMuted' }, // Example: Using textMuted for emphasis

    // Primary/Accent borders - Uses the theme's 'primary' and 'accent1' colors
    primary: { value: '1px solid primary' }, // Primary action/focus border
    // Using accent1 as a general accent border. Adjust if another accent is more suitable.
    accent: { value: '1px solid accent1' }, // Accent color border

    // Semantic borders - Mapped to available accent/secondary colors.
    // !! IMPORTANT: Review and map these to appropriate colors for your semantic states !!
    success: { value: '1px solid accent1' }, // Placeholder: Using accent2 for Success
    warning: { value: '1px solid accent2' }, // Placeholder: Using accent3 for Warning
    danger: { value: '1px solid accent3' }, // Placeholder: Using secondary for Danger
    info: { value: '1px solid accent3' },    // Placeholder: Using accent1 for Info

    // Focus borders (potentially thicker or different style)
    // Using primary for the main focus ring color
    focusRing: { value: { width: '2px', style: 'solid', color: 'primary' } },
    // Using accent2 as an alternative focus style color
    focusOutline: { value: '2px solid accent2' }, // Alternative focus style

    // Decorative borders - Using textMuted for subtle decorative lines
    dashed: { value: '1px dashed textMuted' },
    dotted: { value: '1px dotted textMuted' },
});