import { defineAnimationStyles } from '@pandacss/dev'

// Define animation styles based on the provided keyframes
// These styles bundle keyframes with default properties like duration, timing, etc.
export const animationStyles = defineAnimationStyles({
  // --- Basic Effects ---
  'ripple-effect': {
    description: 'Click ripple effect originating from center',
    value: {
      animationName: 'ripple',
      animationDuration: 'normal', // Adjust token as needed (e.g., '0.6s')
      animationTimingFunction: 'linear',
      animationIterationCount: 1,
    }
  },
  'fade-in': {
    description: 'Fade in an element',
    value: {
      animationName: 'fadeIn',
      animationDuration: 'normal', // e.g., '0.5s'
      animationTimingFunction: 'ease-out',
      animationIterationCount: 1,
      animationFillMode: 'forwards', // Keep final state
    }
  },
  'fade-out': {
    description: 'Fade out an element',
    value: {
      animationName: 'fadeOut',
      animationDuration: 'normal', // e.g., '0.5s'
      animationTimingFunction: 'ease-in',
      animationIterationCount: 1,
      animationFillMode: 'forwards', // Keep final state
    }
  },
  'pulse-subtle': {
    description: 'Subtle pulsing effect for attention',
    value: {
      animationName: 'pulse',
      animationDuration: 'slow', // e.g., '2s'
      animationTimingFunction: 'ease-in-out',
      animationIterationCount: 'infinite',
    }
  },
  'shimmer-diagonal': {
    description: 'Diagonal shimmer effect (requires gradient background)',
    value: {
      animationName: 'shimmerDiagonal',
      animationDuration: 'slower', // e.g., '2.5s'
      animationTimingFunction: 'linear',
      animationIterationCount: 'infinite',
      // Note: Apply to an element with appropriate linear-gradient background
    }
  },

  // --- UI Element Interactions ---
  'nav-item-grow': {
    description: 'Slight grow effect for nav item hover',
    value: {
      animationName: 'navItemHover',
      animationDuration: 'fast', // e.g., '0.2s'
      animationTimingFunction: 'ease-out',
      animationIterationCount: 1,
      animationFillMode: 'forwards',
    }
  },
  'arrow-rotate-open': {
    description: 'Rotate arrow 180 degrees for open state',
    value: {
      animationName: 'arrowRotateOpen',
      animationDuration: 'normal', // e.g., '0.4s'
      animationTimingFunction: 'ease-in-out',
      animationIterationCount: 1,
      animationFillMode: 'forwards',
    }
  },
  // Consider using animationDirection: 'reverse' with arrow-rotate-open for closing,
  // or define a separate 'arrow-rotate-close' if needed.

  'mobile-menu-slide-down': {
    description: 'Slide mobile menu down from top',
    value: {
      animationName: 'mobileMenuOpen',
      animationDuration: 'normal', // e.g., '0.4s'
      animationTimingFunction: 'ease-out',
      animationIterationCount: 1,
      animationFillMode: 'forwards',
    }
  },
  'mobile-menu-slide-up': {
    description: 'Slide mobile menu up to top',
    value: {
      animationName: 'mobileMenuClose',
      animationDuration: 'normal', // e.g., '0.4s'
      animationTimingFunction: 'ease-in', // Ease-in often feels better for closing
      animationIterationCount: 1,
      animationFillMode: 'forwards',
    }
  },

  // --- Reveal / Highlight Effects ---
  'reveal-up': {
    description: 'Reveal element by sliding up slightly and fading in',
    value: {
      animationName: 'reveal',
      animationDuration: 'normal', // e.g., '0.6s'
      animationTimingFunction: 'ease-out',
      animationIterationCount: 1,
      animationFillMode: 'forwards',
    }
  },
  'shine-sweep': {
    description: 'Sweeping shine effect (requires ::before pseudo-element)',
    value: {
      animationName: 'shine',
      animationDuration: 'slow', // e.g., '1.5s'
      animationTimingFunction: 'linear',
      animationIterationCount: 'infinite', // Often looped or triggered on hover
      // Note: Apply to a container with overflow: hidden and a ::before pseudo-element
      // with the gradient and this animation.
    }
  },
  'background-shift-horizontal': {
    description: 'Shift background position horizontally (for gradients/patterns)',
    value: {
      animationName: 'shift', // Using 'shift' keyframe
      animationDuration: 'slower', // e.g., '15s'
      animationTimingFunction: 'ease-in-out',
      animationIterationCount: 'infinite',
      // Note: Apply to element with large background-size
    }
  },
  'float-gentle': {
    description: 'Gentle floating up and down effect',
    value: {
      animationName: 'float',
      animationDuration: 'slow', // e.g., '4s'
      animationTimingFunction: 'ease-in-out',
      animationIterationCount: 'infinite',
    }
  },

  // --- Unfold/Collapse ---
  'unfold-right': {
    description: 'Unfold element horizontally from the left (requires transform-origin: left)',
    value: {
      animationName: 'unfoldRight',
      animationDuration: 'normal', // e.g., '0.7s'
      animationTimingFunction: 'cubic-bezier(0.165, 0.84, 0.44, 1)', // Smoothed ease-out-quad
      animationIterationCount: 1,
      animationFillMode: 'forwards',
      // Note: Set transform-origin: left on the element
    }
  },
  'collapse-left': {
    description: 'Collapse element horizontally to the left (requires transform-origin: left)',
    value: {
      animationName: 'collapseLeft',
      animationDuration: 'normal', // e.g., '0.5s'
      animationTimingFunction: 'ease-in',
      animationIterationCount: 1,
      animationFillMode: 'forwards',
      // Note: Set transform-origin: left on the element
    }
  },

  // --- Aurora Effects ---
  'aurora-text-shift': {
      description: 'Shift background gradient clipped to text',
      value: {
          animationName: 'auroraTextShift',
          animationDuration: 'slower', // e.g., '15s'
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          // Note: Apply to text element with background-clip: text and large gradient background
      }
  },
  'aurora-movement-1': {
    description: 'Complex movement path for aurora background wisp 1',
    value: {
      animationName: 'aurora-1',
      animationDuration: '18s', // Example duration
      animationTimingFunction: 'ease-in-out',
      animationIterationCount: 'infinite',
    }
  },
  'aurora-movement-2': {
    description: 'Complex movement path for aurora background wisp 2',
    value: {
      animationName: 'aurora-2',
      animationDuration: '22s', // Example duration
      animationTimingFunction: 'ease-in-out',
      animationIterationCount: 'infinite',
      animationDelay: '-5s', // Example offset
    }
  },
  'aurora-movement-3': {
    description: 'Complex movement path for aurora background wisp 3',
    value: {
      animationName: 'aurora-3',
      animationDuration: '20s', // Example duration
      animationTimingFunction: 'ease-in-out',
      animationIterationCount: 'infinite',
    }
  },
  'aurora-movement-4': {
    description: 'Complex movement path for aurora background wisp 4',
    value: {
      animationName: 'aurora-4',
      animationDuration: '16s', // Example duration
      animationTimingFunction: 'ease-in-out',
      animationIterationCount: 'infinite',
    }
  },
  'aurora-shape-shift': {
    description: 'Morphing border radius effect for aurora wisps',
    value: {
      animationName: 'aurora-border',
      animationDuration: '12s', // Example duration
      animationTimingFunction: 'ease-in-out',
      animationIterationCount: 'infinite',
      animationDirection: 'alternate', // Makes shape morph back and forth smoothly
    }
  },

  // --- NEW: Slide + Fade Combinations ---
  'slide-in-fade-in': {
    description: 'Slide in from edge and fade in. Assumes slide-from-* keyframes are defined.',
    value: {
      // NOTE: Requires keyframes named 'slide-from-top', 'slide-from-bottom', etc.
      // Uses existing 'fadeIn' keyframe.
      animationDuration: 'normal', // e.g., '0.5s'
      animationTimingFunction: 'ease-out',
      animationFillMode: 'forwards',
      // Apply specific combination based on data attribute
      '&[data-placement^=top]': { animationName: 'slide-from-top, fadeIn' },
      '&[data-placement^=bottom]': { animationName: 'slide-from-bottom, fadeIn' },
      '&[data-placement^=left]': { animationName: 'slide-from-left, fadeIn' },
      '&[data-placement^=right]': { animationName: 'slide-from-right, fadeIn' },
      // Default or fallback if no placement is set (optional)
      // animationName: 'fadeIn', // Or maybe a default slide direction
    }
  },
  'slide-out-fade-out': {
    description: 'Slide out to edge and fade out. Assumes slide-to-* keyframes are defined.',
    value: {
      // NOTE: Requires keyframes named 'slide-to-top', 'slide-to-bottom', etc.
      // Uses existing 'fadeOut' keyframe.
      animationDuration: 'normal', // e.g., '0.5s'
      animationTimingFunction: 'ease-in',
      animationFillMode: 'forwards',
      // Apply specific combination based on data attribute
      '&[data-placement^=top]': { animationName: 'slide-to-top, fadeOut' },
      '&[data-placement^=bottom]': { animationName: 'slide-to-bottom, fadeOut' },
      '&[data-placement^=left]': { animationName: 'slide-to-left, fadeOut' },
      '&[data-placement^=right]': { animationName: 'slide-to-right, fadeOut' },
      // Default or fallback if no placement is set (optional)
      // animationName: 'fadeOut', // Or maybe a default slide direction
    }
  },

})
