// moonlight-ui/panda.config/tokens/sizes.ts
import { defineTokens } from '@pandacss/dev'; // Assuming defineTokens is imported

export const sizes = defineTokens.sizes({
  // --- Specific Sizes ---
  // Clamped slightly around original value
  navbarHeight: { value: 'clamp(40px, 38px + 0.15vw, 50px)' }, // Was 45px
  // Unitless scale factor - should remain static
  rippleScale: { value: '2.5' },

  // --- Container Sizes ---
  // Max-width breakpoints are typically static
  container: {
    sm: { value: '640px' },
    md: { value: '768px' },
    lg: { value: '1024px' },
    xl: { value: '1200px' },
  },

  // --- General Sizes (Added from your initial clamp list) ---
  // These seem suitable for component/icon dimensions etc.
  xs: { value: 'clamp(16px, 14px + 0.4vw, 24px)' },
  sm: { value: 'clamp(24px, 21px + 0.5vw, 36px)' },
  md: { value: 'clamp(32px, 28px + 0.6vw, 48px)' },
  lg: { value: 'clamp(48px, 40px + 0.8vw, 64px)' },

  // --- Semantic Sizes (Examples - kept static unless specific clamps needed) ---
  // sidebarWidth: { value: '250px' },
  full: { value: '100%' }, // Percentage - static
  screenH: { value: '100vh' }, // Viewport unit - static
  screenW: { value: '100vw' }, // Viewport unit - static
});

export const spacing = defineTokens.spacing({
  // --- Semantic Spacing (Using your initial clamp list where names match) ---
  '2xs': { value: 'clamp(0.25rem, 0.225rem + 0.1vw, 0.375rem)' }, // Added from your list
  xs: { value: 'clamp(0.5rem, 0.425rem + 0.15vw, 0.75rem)' }, // Was 0.25rem, now uses your 'xs' clamp
  sm: { value: 'clamp(0.75rem, 0.65rem + 0.2vw, 1rem)' },       // Was 1rem, now uses your 'sm' clamp
  md: { value: 'clamp(1rem, 0.85rem + 0.3vw, 1.375rem)' },     // Was 2rem, now uses your 'md' clamp
  lg: { value: 'clamp(1.5rem, 1.25rem + 0.4vw, 2rem)' },       // Was 3rem, now uses your 'lg' clamp
  xl: { value: 'clamp(2rem, 1.75rem + 0.5vw, 2.75rem)' },      // Was 4rem, now uses your 'xl' clamp
  xxl: { value: 'clamp(2.75rem, 2.25rem + 1vw, 4rem)' },        // Was 6rem, extrapolated clamp

  // --- Numbered Spacing Scale (Derived clamps based on static values) ---
  'px': { value: '1px' }, // Keep static for precise pixel control
  '0': { value: '0' },     // Keep static
  '1': { value: 'clamp(0.2rem, 0.18rem + 0.05vw, 0.3rem)' },     // Was 0.25rem (4px)
  '1.5': { value: 'clamp(0.3rem, 0.28rem + 0.08vw, 0.45rem)' },   // Was 0.375rem (6px)
  '2': { value: 'clamp(0.4rem, 0.35rem + 0.1vw, 0.6rem)' },      // Was 0.5rem (8px)
  '2.5': { value: 'clamp(0.5rem, 0.45rem + 0.12vw, 0.75rem)' },   // Was 0.625rem (10px)
  '3': { value: 'clamp(0.6rem, 0.55rem + 0.15vw, 0.9rem)' },     // Was 0.75rem (12px)
  '3.5': { value: 'clamp(0.7rem, 0.65rem + 0.18vw, 1.05rem)' },   // Was 0.875rem (14px)
  '4': { value: 'clamp(0.8rem, 0.75rem + 0.2vw, 1.2rem)' },      // Was 1rem (16px)
  '5': { value: 'clamp(1rem, 0.9rem + 0.25vw, 1.5rem)' },       // Was 1.25rem (20px)
  '6': { value: 'clamp(1.2rem, 1.1rem + 0.3vw, 1.8rem)' },       // Was 1.5rem (24px)
  '7': { value: 'clamp(1.4rem, 1.3rem + 0.35vw, 2.1rem)' },      // Was 1.75rem (28px)
  '8': { value: 'clamp(1.6rem, 1.5rem + 0.4vw, 2.4rem)' },       // Was 2rem (32px)
  '9': { value: 'clamp(1.8rem, 1.7rem + 0.45vw, 2.7rem)' },      // Was 2.25rem (36px)
  '10': { value: 'clamp(2rem, 1.85rem + 0.5vw, 3rem)' },        // Was 2.5rem (40px)
  '11': { value: 'clamp(2.2rem, 2.05rem + 0.55vw, 3.3rem)' },     // Was 2.75rem (44px)
  '12': { value: 'clamp(2.4rem, 2.25rem + 0.6vw, 3.6rem)' },     // Was 3rem (48px)
});

export const radii = defineTokens.radii({
  // Using your initial clamp list values
  sm: { value: 'clamp(4px, 3px + 0.2vw, 6px)' },   // Was 2px
  md: { value: 'clamp(8px, 6px + 0.3vw, 12px)' },  // Was 4px
  lg: { value: 'clamp(12px, 9px + 0.4vw, 16px)' }, // Was 8px

  // Keep static - conventional value for full rounding
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