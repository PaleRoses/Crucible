// working-panda.config.ts
import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  // Basic setup
  preflight: true,
  include: ["./src/**/*.{js,jsx,ts,tsx}", "./pages/**/*.{js,jsx,ts,tsx}"],
  exclude: [],
  outdir: "styled-system",
  
  // Simplified conditions to avoid forEach error
  conditions: {
    xs: '@media screen and (min-width: 320px)',
    sm: '@media screen and (min-width: 640px)',
    md: '@media screen and (min-width: 768px)',
    lg: '@media screen and (min-width: 1024px)',
    xl: '@media screen and (min-width: 1280px)',
    '2xl': '@media screen and (min-width: 1536px)',
    
    // Theme selectors - note the exact syntax
    starlight: { selector: '[data-theme="starlight"] &, .light &:not([data-theme])' },
    midnight: { selector: '[data-theme="midnight"] &, .dark &:not([data-theme])' },
    eclipse: { selector: '[data-theme="eclipse"] &' },
    moonlight: { selector: '[data-theme="moonlight"] &' },
    flux: { selector: '[data-theme="flux"] &' },
    
    // States - these are direct strings too
    hover: '&:hover',
    focus: '&:focus',
    active: '&:active',
  },

  // Theme configuration - essential parts
  theme: {
    extend: {
      tokens: {
        colors: {
          // Midnight theme
          midnight: {
            primary: { value: '#BFAD7F' },
            background: { value: '#080808' },
            backgroundAlt: { value: '#14141e' },
            text: { value: '#ccd6e1' },
            textMuted: { value: '#a7b6c8' },
            secondary: { value: '#8c8165' },
            accent1: { value: '#ccd6e1' },
            accent2: { value: '#3987b3' },
            accent3: { value: '#b75e79' },
            glow: { value: 'rgba(160, 142, 97, 0.3)' },
            border: { value: 'rgba(160, 142, 97, 0.2)' },
            hover: { value: 'rgba(160, 142, 97, 0.1)' },
            active: { value: 'rgba(160, 142, 97, 0.3)' },
            
            // Fixed cosmic colors (replaced "alpha" with a specific value)
            cosmic1: { value: 'rgba(255, 255, 255, 1)' },
            cosmic2: { value: 'rgba(255, 253, 227, 0.9)' },
            cosmic3: { value: 'rgba(191, 173, 127, 0.8)' },
            cosmicCore: { value: 'rgba(252, 249, 231, 0.8)' }, // Fixed alpha value
          },
          
          // Starlight theme - essential colors
          starlight: {
            primary: { value: '#9e7b2f' },
            background: { value: '#f9f7f2' },
            backgroundAlt: { value: '#ebe9e4' },
            text: { value: '#2a3744' },
            textMuted: { value: '#5c6773' },
            secondary: { value: '#b99c59' },
            accent1: { value: '#4a90c3' },
            accent2: { value: '#2e6994' },
            accent3: { value: '#a33d58' },
            glow: { value: 'rgba(158, 123, 47, 0.2)' },
            border: { value: 'rgba(158, 123, 47, 0.3)' },
            hover: { value: 'rgba(158, 123, 47, 0.1)' },
            active: { value: 'rgba(158, 123, 47, 0.2)' },
            cosmic1: { value: 'rgba(214, 210, 196, 0.8)' },
            cosmic2: { value: 'rgba(233, 222, 187, 0.7)' },
            cosmic3: { value: 'rgba(167, 186, 211, 0.6)' },
            cosmicCore: { value: 'rgba(255, 255, 255, 0.9)' },
          },
          
          // Eclipse theme - essential colors
          eclipse: {
            primary: { value: '#7d2e2e' },
            background: { value: '#f0e6d0' },
            backgroundAlt: { value: '#e5d5b8' },
            text: { value: '#3a2a1b' },
            textMuted: { value: '#6b5744' },
            secondary: { value: '#c2803d' },
            accent1: { value: '#b8860b' },
            accent2: { value: '#2e5e4e' },
            accent3: { value: '#34495e' },
            glow: { value: 'rgba(125, 46, 46, 0.2)' },
            border: { value: 'rgba(125, 46, 46, 0.3)' },
            hover: { value: 'rgba(125, 46, 46, 0.1)' },
            active: { value: 'rgba(125, 46, 46, 0.2)' },
            cosmic1: { value: 'rgba(240, 230, 208, 0.8)' },
            cosmic2: { value: 'rgba(226, 204, 158, 0.7)' },
            cosmic3: { value: 'rgba(194, 178, 151, 0.6)' },
            cosmicCore: { value: 'rgba(252, 235, 202, 0.9)' },
          },
          
          // Moonlight theme - essential colors
          moonlight: {
            primary: { value: '#ccd6e1' },
            background: { value: '#0f1524' },
            backgroundAlt: { value: '#1a2235' },
            text: { value: '#e2e8f0' },
            textMuted: { value: '#94a3b8' },
            secondary: { value: '#7a9bbe' },
            accent1: { value: '#c7b9e0' },
            accent2: { value: '#49b3a6' },
            accent3: { value: '#c389bc' },
            glow: { value: 'rgba(162, 196, 232, 0.25)' },
            border: { value: 'rgba(162, 196, 232, 0.2)' },
            hover: { value: 'rgba(162, 196, 232, 0.1)' },
            active: { value: 'rgba(162, 196, 232, 0.3)' },
            cosmic1: { value: 'rgba(226, 232, 240, 0.9)' },
            cosmic2: { value: 'rgba(214, 226, 255, 0.7)' },
            cosmic3: { value: 'rgba(191, 203, 232, 0.6)' },
            cosmicCore: { value: 'rgba(240, 246, 255, 0.95)' },
          },
          
          // Flux theme - simplified (removed gradients for compatibility)
          flux: {
            primary: { value: '#FF3CA0' }, // Simplified from gradient
            background: { value: '#0A0B18' }, // Simplified from gradient
            backgroundAlt: { value: '#10121F' }, // Simplified from gradient
            text: { value: '#E2F3FF' }, // Simplified from gradient
            textMuted: { value: '#94A9C9' }, // Simplified from gradient
            secondary: { value: '#7B4DFF' }, // Simplified from gradient
            accent1: { value: '#00E5BC' }, // Simplified from gradient
            accent2: { value: '#FF9F1C' }, // Simplified from gradient
            accent3: { value: '#01C4E7' }, // Simplified from gradient
            glow: { value: 'rgba(255, 60, 160, 0.35)' },
            border: { value: 'rgba(123, 77, 255, 0.3)' },
            hover: { value: 'rgba(0, 229, 188, 0.2)' },
            active: { value: 'rgba(255, 159, 28, 0.3)' },
            cosmic1: { value: '#D7D7ED' }, // Simplified from gradient
            cosmic2: { value: '#FFDE85' }, // Simplified from gradient
            cosmic3: { value: '#B9F0FF' }, // Simplified from gradient
            cosmicCore: { value: 'rgba(255, 255, 255, 0.95)' },
          }
        },
        
        // Essential font tokens
        fonts: {
          heading: { value: "var(--font-heading)" },
          body: { value: "var(--font-body)" },
          mono: { value: "var(--font-mono)" },
        },
        
        // Essential spacing tokens
        spacing: {
          xs: { value: '0.25rem' },
          sm: { value: '0.5rem' },
          md: { value: '1rem' },
          lg: { value: '2rem' },
          xl: { value: '4rem' },
          xxl: { value: '6rem' },
        },
        
        // Basic radius tokens
        radii: {
          small: { value: '2px' },
          medium: { value: '4px' },
          large: { value: '8px' },
          full: { value: '9999px' },
        },
      },
    },
    
    // Semantic tokens mapping
    semanticTokens: {
      colors: {
        // Core colors mapping
        primary: { value: '{colors.midnight.primary}' },
        background: { value: '{colors.midnight.background}' },
        backgroundAlt: { value: '{colors.midnight.backgroundAlt}' },
        text: { value: '{colors.midnight.text}' },
        textMuted: { value: '{colors.midnight.textMuted}' },
        secondary: { value: '{colors.midnight.secondary}' },
        accent1: { value: '{colors.midnight.accent1}' },
        accent2: { value: '{colors.midnight.accent2}' },
        accent3: { value: '{colors.midnight.accent3}' },
        glow: { value: '{colors.midnight.glow}' },
        border: { value: '{colors.midnight.border}' },
        hover: { value: '{colors.midnight.hover}' },
        active: { value: '{colors.midnight.active}' },
        
        // UI element colors
        link: { value: '{colors.primary}' },
        cardBackground: { value: '{colors.backgroundAlt}' },
        navBackground: { value: '{colors.background}' },
      }
    }
  },
  
  // Theme definitions
  themes: {
    midnight: {
      tokens: {
        colors: {
          primary: { value: '{colors.midnight.primary}' },
          background: { value: '{colors.midnight.background}' },
          backgroundAlt: { value: '{colors.midnight.backgroundAlt}' },
          text: { value: '{colors.midnight.text}' },
          textMuted: { value: '{colors.midnight.textMuted}' },
          secondary: { value: '{colors.midnight.secondary}' },
          accent1: { value: '{colors.midnight.accent1}' },
          accent2: { value: '{colors.midnight.accent2}' },
          accent3: { value: '{colors.midnight.accent3}' },
          glow: { value: '{colors.midnight.glow}' },
          border: { value: '{colors.midnight.border}' },
          hover: { value: '{colors.midnight.hover}' },
          active: { value: '{colors.midnight.active}' },
        }
      }
    },
    starlight: {
      tokens: {
        colors: {
          primary: { value: '{colors.starlight.primary}' },
          background: { value: '{colors.starlight.background}' },
          backgroundAlt: { value: '{colors.starlight.backgroundAlt}' },
          text: { value: '{colors.starlight.text}' },
          textMuted: { value: '{colors.starlight.textMuted}' },
          secondary: { value: '{colors.starlight.secondary}' },
          accent1: { value: '{colors.starlight.accent1}' },
          accent2: { value: '{colors.starlight.accent2}' },
          accent3: { value: '{colors.starlight.accent3}' },
          glow: { value: '{colors.starlight.glow}' },
          border: { value: '{colors.starlight.border}' },
          hover: { value: '{colors.starlight.hover}' },
          active: { value: '{colors.starlight.active}' },
        }
      }
    },
    eclipse: {
      tokens: {
        colors: {
          primary: { value: '{colors.eclipse.primary}' },
          background: { value: '{colors.eclipse.background}' },
          backgroundAlt: { value: '{colors.eclipse.backgroundAlt}' },
          text: { value: '{colors.eclipse.text}' },
          textMuted: { value: '{colors.eclipse.textMuted}' },
          secondary: { value: '{colors.eclipse.secondary}' },
          accent1: { value: '{colors.eclipse.accent1}' },
          accent2: { value: '{colors.eclipse.accent2}' },
          accent3: { value: '{colors.eclipse.accent3}' },
          glow: { value: '{colors.eclipse.glow}' },
          border: { value: '{colors.eclipse.border}' },
          hover: { value: '{colors.eclipse.hover}' },
          active: { value: '{colors.eclipse.active}' },
        }
      }
    },
    moonlight: {
      tokens: {
        colors: {
          primary: { value: '{colors.moonlight.primary}' },
          background: { value: '{colors.moonlight.background}' },
          backgroundAlt: { value: '{colors.moonlight.backgroundAlt}' },
          text: { value: '{colors.moonlight.text}' },
          textMuted: { value: '{colors.moonlight.textMuted}' },
          secondary: { value: '{colors.moonlight.secondary}' },
          accent1: { value: '{colors.moonlight.accent1}' },
          accent2: { value: '{colors.moonlight.accent2}' },
          accent3: { value: '{colors.moonlight.accent3}' },
          glow: { value: '{colors.moonlight.glow}' },
          border: { value: '{colors.moonlight.border}' },
          hover: { value: '{colors.moonlight.hover}' },
          active: { value: '{colors.moonlight.active}' },
        }
      }
    },
    flux: {
      tokens: {
        colors: {
          primary: { value: '{colors.flux.primary}' },
          background: { value: '{colors.flux.background}' },
          backgroundAlt: { value: '{colors.flux.backgroundAlt}' },
          text: { value: '{colors.flux.text}' },
          textMuted: { value: '{colors.flux.textMuted}' },
          secondary: { value: '{colors.flux.secondary}' },
          accent1: { value: '{colors.flux.accent1}' },
          accent2: { value: '{colors.flux.accent2}' },
          accent3: { value: '{colors.flux.accent3}' },
          glow: { value: '{colors.flux.glow}' },
          border: { value: '{colors.flux.border}' },
          hover: { value: '{colors.flux.hover}' },
          active: { value: '{colors.flux.active}' },
        }
      }
    }
  }
});