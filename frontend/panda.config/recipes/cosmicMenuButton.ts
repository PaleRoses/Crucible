// panda.config/recipes/cosmicMenuButton.ts

import { defineRecipe } from '@pandacss/dev';

export const cosmicMenuButton = defineRecipe({
  className: 'cosmicMenuButton',
  description: 'A cosmic-themed menu button with hover effects and size variants',
  // base styles apply to all variants
  base: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: 'full',
    border: '1px solid',
    borderColor: 'border', // Assumes 'border' token is defined in your theme
    bg: 'backgroundAlt',   // Assumes 'backgroundAlt' token is defined
    color: 'primary',      // Assumes 'primary' token is defined
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    userSelect: 'none', // Prevents text selection on click

    // Cosmic background layer using ::before pseudo-element
    _before: {
      content: '""',
      position: 'absolute',
      inset: 0,
      bg: 'background', // Assumes 'background' token is defined
      opacity: 0.8,
      zIndex: 1, // Ensure background is behind content
    },

    // Placeholder for icon layer using ::after pseudo-element
    // Note: The actual icon should typically be passed as a child to the button component.
    // This _after rule might be redundant if children handle the icon.
    _after: {
      content: '""',
      position: 'relative', // Keeps it in normal flow relative to siblings/parent content
      zIndex: 3, // Ensure it's above the ::before pseudo-element
    },

    // Hover effects
    _hover: {
      borderColor: 'primary',
      boxShadow: '0 0 12px',
      shadowColor: 'glow', // Assumes 'glow' token (likely a color) is defined
      transform: 'scale(1.05)',
    },

    // Active/pressed state
    _active: {
      transform: 'scale(0.95)',
    },

    // Focus state for accessibility
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
  },

  // Define the different variants
  variants: {
    // Size variants
    size: {
      sm: {
        width: '32px',
        height: '32px',
        fontSize: 'sm', // Assumes 'sm' fontSize token is defined
      },
      md: {
        // Base styles already define 40px, but explicitly setting is fine
        width: '40px',
        height: '40px',
        fontSize: 'md', // Assumes 'md' fontSize token is defined
      },
      lg: {
        width: '48px',
        height: '48px',
        fontSize: 'lg', // Assumes 'lg' fontSize token is defined
      },
    },
    // Visual style variants
    variant: {
      solid: {
        // Base styles already define these, redundant but harmless
        bg: 'backgroundAlt',
        color: 'primary',
      },
      outline: {
        bg: 'transparent',
        borderColor: 'primary',
        borderWidth: '1px', // Explicitly set border width for outline
      },
      ghost: {
        bg: 'transparent',
        border: 'none', // Remove border for ghost
        _hover: {
          bg: 'hover', // Assumes 'hover' background color token is defined
        },
      },
    },
    // State variant for when the menu is open
    isOpen: {
      // Variant key is the string 'true'
      true: {
        borderColor: 'primary',
        boxShadow: '0 0 15px', // Slightly larger glow when open
        shadowColor: 'glow',
        bg: 'hover', // Use hover background when open
      },
      // You don't necessarily need a 'false' key unless you want specific styles
      // when isOpen is explicitly false (defaultVariants handles the default state)
      // false: {}
    }
  },

  // Define the default variants to apply if not specified
  defaultVariants: {
    size: 'md',
    variant: 'solid',
    // Panda's cva usually handles boolean 'false' correctly here,
    // mapping it to the state where the 'true' variant is inactive.
    isOpen: false,
  },
});
