// moonlight-ui/panda.config/tokens/sizes.ts
import { defineTokens } from '@pandacss/dev';

/**
 * Defines size tokens for widths, heights, etc.
 */
export const sizes = defineTokens.sizes({
  navbarHeight: { value: '45px' }, // Example token for navbar height
  rippleScale: { value: '2.5' },

  // Example container tokens (maps to max-width)
  container: {
    sm: { value: '640px' },
    md: { value: '768px' },
    lg: { value: '1024px' },
    xl: { value: '1200px' },
  },

  // Add other relevant sizes here, e.g.,
  // sidebarWidth: { value: '250px' },
  // full: { value: '100%' },
  // screenH: { value: '100vh' },
  // screenW: { value: '100vw' },
});

export const spacing = defineTokens.spacing({
  xs: { value: '0.25rem' },
  sm: { value: '1rem' },
  md: { value: '2rem' },
  lg: { value: '3rem' },
  xl: { value: '4rem' },
  xxl: { value: '6rem' },
  'px': { value: '1px' },
  '0': { value: '0' },
  '1': { value: '0.25rem' }, // 4px
  '1.5': { value: '0.375rem' }, // 6px
  '2': { value: '0.5rem' }, // 8px
  '2.5': { value: '0.625rem' }, // 10px
  '3': { value: '0.75rem' }, // 12px
  '3.5': { value: '0.875rem' }, // 14px
  '4': { value: '1rem' }, // 16px
  '5': { value: '1.25rem' }, // 20px
  '6': { value: '1.5rem' }, // 24px
  '7': { value: '1.75rem' }, // 28px
  '8': { value: '2rem' }, // 32px
  '9': { value: '2.25rem' }, // 36px
  '10': { value: '2.5rem' }, // 40px
  '11': { value: '2.75rem' }, // 44px
  '12': { value: '3rem' }, // 48px
});

export const radii = defineTokens.radii({
  sm: { value: '2px' },
  md: { value: '4px' },
  lg: { value: '8px' },

  full: { value: '9999px' },
});

export const zIndices = defineTokens.zIndex({ 
  hide: { value: -1 },
  auto: { value: 'auto' },
  base: { value: 0 },
  docked: { value: 10 },
  dropdown: { value: 99 }, // For desktop submenu panel
  sticky: { value: 100 }, // For navbar
  modal: { value: 100 }, // For mobile menu overlay
  popover: { value: 105 },
  tooltip: { value: 110 }, // For logo tooltip
  banner: { value: 120 },
  overlay: { value: 130 }, // For mobile menu overlay
  modalBackdrop: { value: 140 }, // For modal backdrop
  modalContent: { value: 150 }, // For modal content
  toast: { value: 160 }, // For toast notifications
  max: { value: 9999 }, // For maximum z-index
});