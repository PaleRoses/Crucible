import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

export default {
  // Content paths to scan for Tailwind class usage
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}', // App Router files (e.g., Next.js)
    './src/components/**/*.{js,ts,jsx,tsx}', // Component files
  ],
  theme: {
    extend: {
      /**
       * COLOR SYSTEM
       * 
       * A comprehensive color palette built around a gold-based theme with
       * dark surfaces to create an elegant, premium experience.
       * Includes specialized color variations for various UI components.
       */
      colors: {
        // Gold palette - primary brand colors with multiple variations
        gold: {
          DEFAULT: 'var(--gold)', // Main gold color for primary elements
          light: 'var(--gold-light)', // Lighter gold for hover states and highlights
          dark: 'var(--gold-dark)', // Darker gold for active states and shadows
          muted: 'var(--gold-muted)', // Subdued gold for secondary elements
          glow: 'var(--gold-glow)', // Glow effect color for interaction feedback
          secondary: 'var(--gold-secondary)', // Secondary gold for accents
          'secondary-light': 'var(--gold-secondary-light)', // Lighter secondary gold
          'secondary-dark': 'var(--gold-secondary-dark)', // Darker secondary gold
          'secondary-glow': 'var(--gold-secondary-glow)', // Glow for secondary elements
          tertiary: 'var(--gold-tertiary)', // Tertiary gold for subtler accents
          'tertiary-light': 'var(--gold-tertiary-light)', // Lighter tertiary gold
          // Opacity variants for component styling
          '70': 'rgba(191, 173, 127, 0.7)', // 70% opacity gold
          '50': 'rgba(191, 173, 127, 0.5)', // 50% opacity gold
          '30': 'rgba(191, 173, 127, 0.3)', // 30% opacity gold
          '20': 'rgba(191, 173, 127, 0.2)', // 20% opacity gold
          '15': 'rgba(191, 173, 127, 0.15)', // 15% opacity gold
          '10': 'rgba(191, 173, 127, 0.1)', // 10% opacity gold
        },
        
        // Surface colors for backgrounds, cards, and containers
        surface: {
          light: 'var(--surface-light)', // Lighter surface for foreground elements
          dark: 'var(--surface-dark)', // Darker surface for background elements
          mid: 'var(--surface-mid)', // Intermediate surface for better depth
          // Component-specific surface variants
          overlay: 'rgba(15, 15, 15, 0.7)', // For modal overlays and dialogs
          panel: 'rgba(15, 15, 15, 0.5)', // For panels and sidebars
          card: 'rgba(15, 15, 15, 0.4)', // For card elements
          input: 'rgba(30, 30, 40, 0.6)', // For input fields
        },
        
        // Utility colors for specific UI purposes
        overlay: 'var(--overlay)', // For page overlays
        highlight: 'var(--highlight)', // For highlighting selected content
        divider: 'var(--divider)', // For separating content sections
        background: 'var(--color-background)', // Main page background
        
        // Text colors with opacity variants
        text: {
          DEFAULT: 'var(--color-text)', // Primary text color
          secondary: 'var(--color-text-secondary)', // Secondary text for less emphasis
          // Opacity variants for different text contexts
          '90': 'rgba(224, 224, 224, 0.9)', // High emphasis text
          '80': 'rgba(224, 224, 224, 0.8)', // Standard text
          '70': 'rgba(224, 224, 224, 0.7)', // Secondary text
          '60': 'rgba(224, 224, 224, 0.6)', // Tertiary text
          '50': 'rgba(224, 224, 224, 0.5)', // Low emphasis text
        },
        
        // Categorical colors for data visualization
        category: {
          locomotion: '#7D6B9E', // Purple for locomotion traits
          metabolism: '#5C9D8B', // Teal for metabolism traits
          sensory: '#C99846', // Gold for sensory traits
          etheric: '#B54B4B', // Red for etheric traits
          thermal: '#A67C52', // Brown for thermal traits
        },
      },

      /**
       * TYPOGRAPHY SYSTEM
       * 
       * Font families and typographic styles to maintain
       * consistent and elegant text presentation across the application.
       */
      fontFamily: {
        heading: ['var(--font-heading)'], // For headings and titles
        body: ['var(--font-body)'], // For body text and content
        mono: ['var(--font-mono)'], // For code snippets and technical content
      },

      /**
       * SPACING SYSTEM
       * 
       * Consistent spacing scale to maintain rhythm and
       * harmony throughout the UI layout.
       */
      spacing: {
        xs: 'var(--spacing-xs)', // Extra small spacing (0.25rem)
        sm: 'var(--spacing-sm)', // Small spacing (0.5rem)
        md: 'var(--spacing-md)', // Medium spacing (1rem)
        lg: 'var(--spacing-lg)', // Large spacing (2rem)
        xl: 'var(--spacing-xl)', // Extra large spacing (4rem)
        xxl: 'var(--spacing-xxl)', // Double extra large spacing (6rem)
      },

      /**
       * BORDER RADIUS SYSTEM
       * 
       * Consistent rounding for UI elements to create
       * a cohesive visual language.
       */
      borderRadius: {
        small: 'var(--radius-small)', // Subtle rounding (2px)
        medium: 'var(--radius-medium)', // Standard rounding (4px)
        large: 'var(--radius-large)', // Prominent rounding (8px)
        full: 'var(--radius-full)', // Circular elements (9999px)
      },

      /**
       * SHADOW SYSTEM
       * 
       * Elevation system using shadows to create depth
       * and hierarchy in the interface.
       */
      boxShadow: {
        subtle: 'var(--shadow-subtle)', // Subtle elevation for hover states
        medium: 'var(--shadow-medium)', // Medium elevation for cards
        strong: 'var(--shadow-strong)', // Strong elevation for modals
        glow: 'var(--shadow-glow)', // Gold glow for highlighted elements
        // Component-specific shadows
        'card': '0 8px 25px rgba(0, 0, 0, 0.25)', // Default card shadow
        'card-hover': '0 16px 35px rgba(0, 0, 0, 0.3), 0 0 25px rgba(191, 173, 127, 0.15)', // Enhanced hover shadow
        'inner-glow': 'inset 0 0 20px rgba(191, 173, 127, 0.2), 0 0 30px rgba(191, 173, 127, 0.15)', // Inner glow effect
      },

      /**
       * ANIMATION & TRANSITION SYSTEM
       * 
       * Consistent timing and easing for animations
       * to create smooth, elegant interactions.
       */
      transitionDuration: {
        default: 'var(--transition-default)', // Standard duration (0.3s)
        slow: 'var(--transition-slow)', // Slow duration for complex animations (0.6s)
        fast: 'var(--transition-fast)', // Fast duration for simple feedback (0.15s)
      },
      
      transitionTimingFunction: {
        ease: 'ease', // Standard easing function
      },
      
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '0.6' }, // Fade out state
          '50%': { opacity: '1' }, // Fade in state
        },
        fadeIn: {
          'from': { opacity: '0' }, // Starting hidden
          'to': { opacity: '1' }, // Ending visible
        },
        reveal: {
          'from': { transform: 'translateY(30px)', opacity: '0' }, // Starting below
          'to': { transform: 'translateY(0)', opacity: '1' }, // Ending in position
        },
      },
      
      animation: {
        pulse: 'pulse 3s infinite ease-in-out', // Gentle pulsing animation
        fadeIn: 'fadeIn 0.6s ease-out', // Standard fade in
        reveal: 'reveal 0.8s ease-out forwards', // Reveal from below
      },

      /**
       * COMPONENT-SPECIFIC EXTENSIONS
       * 
       * Custom values for specific components to maintain
       * consistency across instances.
       */
      height: {
        'project-image': '220px', // Standard height for project card images
      },
      
      zIndex: {
        'cosmic-bg': '-1', // Background elements
        'content': '2', // Main content
        'overlay': '10', // Overlays and modals
        'modal': '20', // Modal dialogs
      },
      
      letterSpacing: {
        'widest-xl': '0.25em', // Extra wide tracking for headings
      },
    },
  },
  
  /**
   * CUSTOM UTILITY CLASSES
   * 
   * Extended utilities that combine multiple Tailwind properties
   * to create reusable, complex styling patterns.
   */
  plugins: [
    plugin(function({ addUtilities }) {
      const newUtilities = {
        // Typography utility classes
        '.font-display': {
          'font-family': 'var(--font-heading)',
          'font-weight': '100',
          'letter-spacing': '0.05em',
        },
        '.font-body': {
          'font-family': 'var(--font-body)',
          'font-weight': '100',
        },
        '.text-gold-gradient': {
          'background': 'linear-gradient(to right, rgba(160, 142, 97, 0.7), rgba(160, 142, 97, 0))',
          '-webkit-background-clip': 'text',
          'color': 'transparent',
        },
        '.heading-gold': {
          'color': 'var(--gold)',
          'letter-spacing': '0.05em',
          'font-weight': '100',
        },
        '.body-text': {
          'color': 'rgba(224, 224, 224, 0.7)',
          'font-weight': '100',
          'line-height': '1.8',
        },
        
        // Interactive effect utilities
        '.hover-lift': {
          'transition': 'transform 0.3s ease-in-out',
          '&:hover': {
            'transform': 'translateY(-5px)',
          },
        },
        '.hover-scale': {
          'transition': 'transform 0.3s ease-in-out',
          '&:hover': {
            'transform': 'scale(1.02)',
          },
        },
        '.gpu-accelerated': {
          'will-change': 'transform',
          'transform': 'translateZ(0)',
          'backface-visibility': 'hidden',
          '-webkit-font-smoothing': 'antialiased',
        },
        
        // Container and layout utilities
        '.dark-panel': {
          'background-color': 'rgba(15, 15, 15, 0.7)',
          'border': '1px solid rgba(160, 142, 97, 0.2)',
          'border-radius': '0.5rem',
          'box-shadow': '0 8px 25px rgba(0, 0, 0, 0.25)',
        },
        '.card-base': {
          'background-color': 'rgba(15, 15, 15, 0.4)',
          'border-radius': '0.5rem',
          'border': '1px solid rgba(160, 142, 97, 0.2)',
          'box-shadow': '0 8px 25px rgba(0, 0, 0, 0.25)',
          'overflow': 'hidden',
        },
        '.content-section': {
          'padding': '1.5rem',
          'display': 'flex',
          'flex-direction': 'column',
        },
        
        // Border and divider utilities
        '.gold-border': {
          'border': '1px solid rgba(160, 142, 97, 0.2)',
        },
        '.gold-border-hover': {
          'border': '1px solid rgba(160, 142, 97, 0.2)',
          'transition': 'border-color 0.3s ease',
          '&:hover': {
            'border-color': 'rgba(160, 142, 97, 0.6)',
          },
        },
        '.diagonal-cut': {
          'position': 'relative',
          '&::before': {
            'content': '""',
            'position': 'absolute',
            'top': '0',
            'right': '0',
            'width': '80px',
            'height': '150%',
            'background-color': '#080808',
            'transform': 'rotate(15deg) translateX(20px)',
          },
          '&::after': {
            'content': '""',
            'position': 'absolute',
            'top': '0',
            'right': '0',
            'width': '1px',
            'height': '150%',
            'background-color': 'rgba(160, 142, 97, 0.2)',
            'transform': 'rotate(15deg) translateX(20px)',
          },
        },
        '.title-divider': {
          'height': '1px',
          'width': '150px',
          'background': 'linear-gradient(to right, rgba(160, 142, 97, 0), rgba(160, 142, 97, 0.6), rgba(160, 142, 97, 0))',
          'margin': '0.5rem auto',
        },
        '.gold-divider': {
          'height': '1px',
          'width': '150px',
          'margin': '0.5rem auto',
          'background': 'linear-gradient(to right, rgba(160, 142, 97, 0), rgba(160, 142, 97, 0.6), rgba(160, 142, 97, 0))',
        },
        
        // Card and project component utilities
        '.card-hover-effect': {
          '--card-transform': 'translate3d(0,0,0)',
          '--card-shadow': '0 8px 25px rgba(0, 0, 0, 0.25)',
          '--image-scale': '1',
          '--overlay-opacity': '0.5',
          '--glow-opacity': '0',
          'transform': 'var(--card-transform)',
          'transition': 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            '--card-transform': 'translate3d(0,-5px,0) scale(1.02)',
            '--card-shadow': '0 16px 35px rgba(0, 0, 0, 0.3), 0 0 25px rgba(191, 173, 127, 0.15)',
            '--image-scale': '1.05',
            '--overlay-opacity': '0.2',
            '--glow-opacity': '1',
            'box-shadow': 'var(--card-shadow)',
          },
        },
        
        // Animation utilities
        '.reveal-animation': {
          'overflow': 'hidden',
          '& > div': {
            'transform': 'translateY(30px)',
            'opacity': '0',
            'transition': 'transform 0.8s ease, opacity 0.8s ease'
          },
          '&.revealed > div': {
            'transform': 'translateY(0)',
            'opacity': '1'
          }
        },
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    }),
  ],
} satisfies Config