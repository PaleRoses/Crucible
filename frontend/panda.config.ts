// improved-panda.config.ts
import { defineConfig } from "@pandacss/dev";
import { textStyles } from './panda.config/text-styles';
import { cosmicAccordionRoot, cosmicAccordionItem, cosmicAccordionTrigger, cosmicAccordionContent}  from './panda.config/recipes/cosmicAccordion';
import { cosmicAvatar, cosmicAvatarStatus, cosmicAvatarBadge, cosmicAvatarGroup } from './panda.config/recipes/cosmicAvatar';
import { cosmicCard } from './panda.config/recipes/cosmicCard';
import { cosmicCollapsible} from './panda.config/recipes/cosmicCollapsible';
import { cosmicCollapsibleContainer, cosmicCollapsibleTrigger, cosmicCollapsibleContent, cosmicCollapsibleGroup } from './panda.config/recipes/cosmicCollapsible';

import { cosmicButtonRecipe } from './panda.config/recipes/cosmicButton';

export default defineConfig({
  // Basic setup
  preflight: true,
  include: ['./src/**/*.{js,jsx,ts,tsx}'],
  exclude: [],
  outdir: 'styled-system',
  jsxFramework: 'react',

  staticCss: {
    themes: ['midnight', 'starlight', 'eclipse', 'moonlight', 'nebula']
  },
  
  // Font faces and global styles
  globalCss: {
    "@font-face": {
      fontFamily: "adobe-caslon-pro",
      fontDisplay: "swap",
      fontWeight: "200",
    },
    "@font-face_1": {
      fontFamily: "haboro-soft-condensed",
      fontDisplay: "swap",
      fontWeight: "200",
    },
    "@font-face_2": {
      fontFamily: "ibm-plex-mono",
      fontDisplay: "swap",
      fontWeight: "200",
    },
    "@font-face_3": {
      fontFamily: "adobe-caslon-pro-fallback",
      src: "local('Georgia')",
      sizeAdjust: "105%",
      ascentOverride: "95%",
      descentOverride: "22%",
      lineGapOverride: "0%",
    },
    "@font-face_4": {
      fontFamily: "haboro-soft-condensed-fallback",
      src: "local('Avenir'), local('Helvetica Neue'), local('Helvetica'), local('Arial')",
      sizeAdjust: "100%",
      ascentOverride: "90%",
      descentOverride: "25%",
      lineGapOverride: "0%",
    },
    "@font-face_5": {
      fontFamily: "ibm-plex-mono-fallback",
      src: "local('Courier New'), local('Courier'), local('monospace')",
      sizeAdjust: "105%",
      ascentOverride: "90%",
      descentOverride: "25%",
      lineGapOverride: "0%",
    },
  
    ":root": {
      // Font variables
      "--fonts-loaded": "0",
      "--font-heading":
        "'haboro-soft-condensed-fallback', 'haboro-soft-condensed', 'Avenir Next', 'Avenir', sans-serif",
      "--font-body":
        "'adobe-caslon-pro-fallback', 'adobe-caslon-pro', 'LTC Caslon', Georgia, serif",
      "--font-mono": 
        "'ibm-plex-mono-fallback', 'ibm-plex-mono', 'Consolas', monospace",
      
      // Color variables mapping to tokens - direct reference using token()
      "--color-primary": "token(colors.primary)",
      "--color-secondary": "token(colors.secondary)",
      "--color-background": "token(colors.background)",
      "--color-background-alt": "token(colors.backgroundAlt)",
      "--color-text": "token(colors.text)",
      "--color-text-muted": "token(colors.textMuted)",
      "--color-accent1": "token(colors.accent1)",
      "--color-accent2": "token(colors.accent2)",
      "--color-accent3": "token(colors.accent3)",
      "--color-glow": "token(colors.glow)",
      "--color-border": "token(colors.border)",
      "--color-hover": "token(colors.hover)",
      "--color-active": "token(colors.active)",
      "--color-cosmic1": "token(colors.cosmic1)",
      "--color-cosmic2": "token(colors.cosmic2)",
      "--color-cosmic3": "token(colors.cosmic3)",
      "--color-cosmic-core": "token(colors.cosmicCore)",
      
      // Transition variables with direct values
      "--transition-default": "0.3s ease",
      "--transition-fast": "0.2s ease",
      "--transition-medium": "0.3s ease",
      "--transition-slow": "0.5s ease",
      // Shadow definitions - now using direct values
      "--shadow-glow": "token(colors.glow) 0 0 15px 1px",
      "--shadow-medium": "0 4px 8px token(colors.border)",
      "--radius-small": "token(radii.sm)", // Adjusted to match radii tokens
      "--radius-medium": "token(radii.md)", // Adjusted to match radii tokens
      "--radius-large": "token(radii.lg)", // Adjusted to match radii tokens
    },
    "html.fonts-loaded:root": {
      "--fonts-loaded": "1",
    },
    // Base styles
    html: {
      scrollBehavior: "smooth",
      minHeight: "100%",
      width: "100%",
      overflowX: "hidden",
      margin: 0,
      padding: 0,
      fontSize: "16px",
    },
    body: {
      color: "var(--color-text)",
      lineHeight: 1.2,
      overflowX: "hidden",
      minHeight: "100vh",
      fontFamily: "var(--font-body)",
      fontWeight: 200,
      letterSpacing: "0.05em",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
      margin: 0,
      padding: 0,
      width: "100%",
      transition: "background-color 0.3s ease, color 0.3s ease",
    },
    // Typography defaults
    "h1, h2, h3, h4, h5, h6": {
      fontFamily: "var(--font-heading)",
      fontWeight: 200,
      letterSpacing: "0.1em",
      lineHeight: 1.2,
      marginBottom: "1rem",
      color: "var(--color-primary)",
      fontOpticalSizing: "none",
    },
    h1: {
      fontSize: "2.5rem",
      letterSpacing: "0.14em",
    },
    h2: {
      fontSize: "2rem",
      marginTop: "2rem",
    },
    h3: {
      fontSize: "1.5rem",
      color: "var(--color-secondary)",
    },
    p: {
      marginBottom: "1rem",
      color: "var(--color-text-muted)",
      fontWeight: 200,
      letterSpacing: "0.05em",
      lineHeight: 1.2,
    },
    span: {
      color: "var(--color-text)",
      fontWeight: 200,
    },
    a: {
      color: "var(--color-secondary)",
      textDecoration: "none",
      transition: "color var(--transition-default)",
      fontWeight: 200,
      "&:hover": {
        color: "var(--color-primary)",
        textDecoration: "underline",
      },
    },
    "code, pre": {
      fontFamily: "var(--font-mono)",
      fontWeight: 200,
      backgroundColor: "color-mix(in srgb, var(--color-background-alt) 50%, transparent)",
      borderRadius: "var(--radius-small)",
      padding: "0.25rem 0.5rem",
      lineHeight: 1.2,
    },
    section: {
      paddingTop: "4rem",
      paddingBottom: "4rem",
    },
    // Custom scrollbar
    "::-webkit-scrollbar": {
      width: "2px",
      height: "2px",
    },
    "::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "::-webkit-scrollbar-thumb": {
      backgroundColor: "var(--color-border)",
      borderRadius: "var(--radius-medium)",
    },
    "::-webkit-scrollbar-button:vertical:decrement": {
      height: "6px",
      backgroundColor: "transparent",
      borderBottom: "2px solid var(--color-border)",
    },
    "::-webkit-scrollbar-button:vertical:increment": {
      height: "6px",
      backgroundColor: "transparent",
      borderTop: "2px solid var(--color-border)",
    },
    // Firefox scrollbar styling
    "*": {
      scrollbarColor: "var(--color-border) transparent",
      scrollbarWidth: "thin",
    },
    
    // Layout elements
    ".app-container": {
      position: "relative",
      minHeight: "100vh",
      width: "100%",
      isolation: "isolate",
    },
    ".background-container": {
      position: "fixed",
      inset: 0,
      width: "100%",
      height: "100vh",
      pointerEvents: "none",
      overflow: "hidden",
      zIndex: -100,
    },
    ".background-extension": {
      position: "fixed",
      left: 0,
      top: "100vh",
      width: "100%",
      height: "100vh",
      zIndex: -101,
    },
    ".app-content": {
      position: "relative",
      minHeight: "100vh",
      width: "100%",
      zIndex: 10,
      transition: "opacity var(--transition-default)",
    },
    ".container": {
      width: "100%",
      marginLeft: "auto",
      marginRight: "auto",
      paddingLeft: "1rem",
      paddingRight: "1rem",
      maxWidth: "1200px",
    },
    
    // UI Elements
    "button, .button": {
      fontFamily: "var(--font-heading)",
      backgroundColor: "color-mix(in srgb, var(--color-primary) 15%, transparent)",
      color: "var(--color-primary)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-medium)",
      cursor: "pointer",
      fontSize: "0.875rem",
      letterSpacing: "0.05em",
      padding: "0.5rem 1rem",
      transition: "all var(--transition-default)",
      "&:hover": {
        backgroundColor: "color-mix(in srgb, var(--color-primary) 25%, transparent)",
        boxShadow: "var(--shadow-glow)",
      },
    },
    "button.primary, .button.primary": {
      backgroundColor: "var(--color-primary)",
      color: "var(--color-background)",
      "&:hover": {
        backgroundColor: "var(--color-secondary)",
      },
    },
    
    // Card styles
    ".card": {
      backgroundColor: "var(--color-background-alt)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-medium)",
      marginBottom: "1rem",
      padding: "1rem",
      transition: "transform var(--transition-default)",
      "&:hover": {
        transform: "translateY(-0.125rem)",
        boxShadow: "var(--shadow-glow)",
      },
    },
    
    // Visualization components
    ".visualization-container": {
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-medium)",
      backgroundColor: "var(--color-background)",
      overflow: "hidden",
      margin: "1rem 0",
      boxShadow: "var(--shadow-medium)",
    },
    
    // Transition classes
    ".fade-enter": { opacity: 0 },
    ".fade-enter-active": {
      opacity: 1,
      transition: "opacity 300ms ease-in",
    },
    ".fade-exit": { opacity: 1 },
    ".fade-exit-active": {
      opacity: 0,
      transition: "opacity 300ms ease-out",
    },
    
    // Utility classes
    ".divider": {
      height: "1px",
      backgroundColor: "var(--color-border)",
      margin: "1rem 0",
    },
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
            
            // Fixed cosmic colors
            cosmic1: { value: 'rgba(255, 255, 255, 1)' },
            cosmic2: { value: 'rgba(255, 253, 227, 0.9)' },
            cosmic3: { value: 'rgba(191, 173, 127, 0.8)' },
            cosmicCore: { value: 'rgba(252, 249, 231, 0.8)' },
          },
          
          // Starlight theme
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
            cosmic1: { value: 'rgba(25, 35, 255, 1)' },
            cosmic2: { value: 'rgba(20, 40, 255, 1)' },
            cosmic3: { value: 'rgba(15, 25, 220, 1)' },
            cosmicCore: { value: 'rgba(255, 255, 255, 0.9)' },
          },
          
          // Eclipse theme
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
            cosmic1: { value: 'rgb(255, 0, 20)' },  // Darker Burgundy (closer to black)
            cosmic2: { value: 'rgb(255, 0, 35)' },  // Darker Plum (closer to black)
            cosmic3: { value: 'rgb(0, 255, 15)' },   // Nearly Black Midnight Blue
            cosmicCore: { value: 'rgba(252, 235, 202, 0.9)' },
          },
          
          // Moonlight theme
          moonlight: {
            primary: { value: '#ccd6e1' },
            background: { value: '#080808' },
            backgroundAlt: { value: '#14141e' },
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
            cosmic1: { value: 'rgba(226, 232, 240, 0.9)' }, // Slate 200 at 90% opacity
            cosmic2: { value: 'rgba(214, 226, 255, 0.7)' }, // Blue 100 at 70% opacity
            cosmic3: { value: 'rgba(191, 203, 232, 0.6)' }, // Slate 300 at 60% opacity
            cosmicCore: { value: 'rgba(240, 246, 255, 0.95)' },
          },
          
          // Nebula theme
          nebula: {
            primary: { value: '#FF3CA0' },
            background: { value: '#0A0B18' },
            backgroundAlt: { value: '#10121F' },
            text: { value: '#E2F3FF' },
            textMuted: { value: '#94A9C9' },
            secondary: { value: '#7B4DFF' },
            accent1: { value: '#00E5BC' },
            accent2: { value: '#FF9F1C' },
            accent3: { value: '#01C4E7' },
            glow: { value: 'rgba(255, 60, 160, 0.35)' },
            border: { value: 'rgba(123, 77, 255, 0.3)' },
            hover: { value: 'rgba(0, 229, 188, 0.2)' },
            active: { value: 'rgba(255, 159, 28, 0.3)' },
            cosmic1: { value: '#D7D7ED' },
            cosmic2: { value: '#FFDE85' },
            cosmic3: { value: '#B9F0FF' },
            cosmicCore: { value: 'rgba(255, 255, 255, 0.95)' },
          }
        },
        
        // Essential font tokens - properly defined
        fonts: {
          heading: { 
            value: "var(--font-heading)",
            description: "Font for headings throughout the application"
          },
          body: { 
            value: "var(--font-body)",
            description: "Primary font for body text" 
          },
          mono: { 
            value: "var(--font-mono)",
            description: "Monospace font for code and technical content" 
          },
        },
        
        fontSizes: {
          // Existing (if any)
          // ...

          // Added for Navbar
          tooltip: { value: '0.75rem' },
          desktopSubmenuDescription: { value: '0.8rem' },
          desktopSubmenuItem: { value: '0.85rem' },
          mobileSubmenuItem: { value: '0.9rem' },
          desktopNavItem: { value: '0.95rem' },
          mobileNavItem: { value: '1.1rem' },
          desktopSubmenuHeader: { value: '1.25rem' },

          

          sm: { value: '0.875rem' },
          base: { value: '1rem' },
          lg: { value: '1.125rem' },
          xl: { value: '1.25rem' },
          '2xl': { value: '1.5rem' },
          
        },

        

        fontWeights: {
          thin: { value: '200' },
          normal: { value: '400' },
          medium: { value: '500' },
          semibold: { value: '600' },
          bold: { value: '700' },
        },
        
        // Essential spacing tokens
        spacing: {
          xs: { value: '0.25rem' },
          sm: { value: '1rem' },
          md: { value: '2rem' },
          lg: { value: '3rem' },
          xl: { value: '4rem' },
          xxl: { value: '6rem' },

          // Added granular values (px based for simplicity, adjust as needed)
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
        },
        
        // Basic radius tokens
        radii: {
          sm: { value: '2px' },
          md: { value: '4px' },
          lg: { value: '8px' },
          full: { value: '9999px' },
        },
    
         // ADDED: Z-Index tokens
         zIndex: {
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
        },
        durations: {
          default: { value: '0.3s' },
          fast: { value: '0.2s' },
          medium: { value: '0.3s' },
          slow: { value: '0.5s' },
        },
       easings: {
          default: { value: 'ease' },
          linear: { value: 'linear' },
          in: { value: 'cubic-bezier(0.4, 0, 1, 1)' },
          out: { value: 'cubic-bezier(0, 0, 0.2, 1)' }, // Added easeOut equivalent
          inOut: { value: 'cubic-bezier(0.4, 0, 0.2, 1)' },
          easeIn: { value: 'ease-in' },
          easeOut: { value: 'ease-out' },
       },

        // Shadow tokens
        shadows: {
          // Midnight theme shadows
          midnight: {
            glow: { value: '0 0 15px 1px rgba(160, 142, 97, 0.3)' }, // Soft gold glow
            md: { value: '0 4px 8px rgba(0, 0, 0, 0.5)' }, // Subtle dark shadow
          },
          // Starlight theme shadows
          starlight: {
            glow: { value: '0 0 15px 1px rgba(158, 123, 47, 0.2)' }, // Warm gold glow
            md: { value: '0 4px 8px rgba(0, 0, 0, 0.1)' }, // Light shadow for depth
          },
          // Eclipse theme shadows
          eclipse: {
            glow: { value: '0 0 15px 1px rgba(125, 46, 46, 0.2)' }, // Reddish glow
            md: { value: '0 4px 8px rgba(58, 42, 27, 0.15)' }, // Warm shadow
          },
          // Moonlight theme shadows
          moonlight: {
            glow: { value: '0 0 15px 1px rgba(162, 196, 232, 0.25)' }, // Blue-silver glow
            md: { value: '0 4px 8px rgba(0, 0, 0, 0.5)' }, // Dark shadow with subtle blue tint
          },
          // Beula theme shadows
          nebula: {
            glow: { value: '0 0 15px 1px rgba(255, 60, 160, 0.35)' }, // Vibrant neon glow
            md: { value: '0 4px 8px rgba(10, 11, 24, 0.5)' }, // Dark shadow with slight color
          },
        },
        
        // ADDED: Sizes tokens (Example)
        sizes: {
          navbarHeight: { value: '45px' }, // Example token for navbar height
          // Example container tokens (if not using breakpoint keys directly)
          container: {
            sm: { value: '640px' },
            md: { value: '768px' },
            lg: { value: '1024px' },
            xl: { value: '1200px' }, // Used by component
          }
        },
      },
      textStyles: textStyles,

      
      // Adding standard responsive breakpoints
      breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      
      // Adding keyframe animations
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        },
        slideFromTop: {
          '0%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0)' }
        },
        slideFromBottom: {
          '0%': { transform: 'translateY(10px)' },
          '100%': { transform: 'translateY(0)' }
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' }
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      },
      recipes: {
        Button: cosmicButtonRecipe,
        AccordionRoot: cosmicAccordionRoot,
      }
    },

    // Semantic tokens mapping - FIXED: Now uses theme-agnostic references
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

        // Cosmic colors mapping - Updated to match other semantic tokens format
        cosmic1: { value: '{colors.midnight.cosmic1}' },
        cosmic2: { value: '{colors.midnight.cosmic2}' },
        cosmic3: { value: '{colors.midnight.cosmic3}' },
        cosmicCore: { value: '{colors.midnight.cosmicCore}' },

        // Additional colors
        glow: { value: '{colors.midnight.glow}' },
        border: { value: '{colors.midnight.border}' },
        hover: { value: '{colors.midnight.hover}' },
        active: { value: '{colors.midnight.active}' },
        
        // UI element colors
        link: { value: '{colors.secondary}' },
        cardBackground: { value: '{colors.backgroundAlt}' },
        navBackground: { value: '{colors.background}' },
        surface: {
          dark: { value: '{colors.background}' },
          mid: { value: '{colors.backgroundAlt}' },
          light: { value: 'color-mix(in srgb, {colors.text} 5%, transparent)' },
        },
      },
      
      // Shadow semantic tokens
      shadows: {
        glow: { value: '{shadows.midnight.glow}' },
        md: { value: '{shadows.midnight.md}' },
      }
    }
  },
  
  // Theme definitions - FIXED: Added cosmic colors to each theme
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
          // ADDED: Cosmic colors for midnight theme
          cosmic1: { value: '{colors.midnight.cosmic1}' },
          cosmic2: { value: '{colors.midnight.cosmic2}' },
          cosmic3: { value: '{colors.midnight.cosmic3}' },
          cosmicCore: { value: '{colors.midnight.cosmicCore}' },
        },
        // Add shadow tokens for midnight theme
        shadows: {
          glow: { value: '{shadows.midnight.glow}' },
          md: { value: '{shadows.midnight.md}' },
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
          // ADDED: Cosmic colors for starlight theme
          cosmic1: { value: '{colors.starlight.cosmic1}' },
          cosmic2: { value: '{colors.starlight.cosmic2}' },
          cosmic3: { value: '{colors.starlight.cosmic3}' },
          cosmicCore: { value: '{colors.starlight.cosmicCore}' },
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
          // ADDED: Cosmic colors for eclipse theme
          cosmic1: { value: '{colors.eclipse.cosmic1}' },
          cosmic2: { value: '{colors.eclipse.cosmic2}' },
          cosmic3: { value: '{colors.eclipse.cosmic3}' },
          cosmicCore: { value: '{colors.eclipse.cosmicCore}' },
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
          // ADDED: Cosmic colors for moonlight theme
          cosmic1: { value: '{colors.moonlight.cosmic1}' },
          cosmic2: { value: '{colors.moonlight.cosmic2}' },
          cosmic3: { value: '{colors.moonlight.cosmic3}' },
          cosmicCore: { value: '{colors.moonlight.cosmicCore}' },
        }
      }
    },
    nebula: {
      tokens: {
        colors: {
          primary: { value: '{colors.nebula.primary}' },
          background: { value: '{colors.nebula.background}' },
          backgroundAlt: { value: '{colors.nebula.backgroundAlt}' },
          text: { value: '{colors.nebula.text}' },
          textMuted: { value: '{colors.nebula.textMuted}' },
          secondary: { value: '{colors.nebula.secondary}' },
          accent1: { value: '{colors.nebula.accent1}' },
          accent2: { value: '{colors.nebula.accent2}' },
          accent3: { value: '{colors.nebula.accent3}' },
          glow: { value: '{colors.nebula.glow}' },
          border: { value: '{colors.nebula.border}' },
          hover: { value: '{colors.nebula.hover}' },
          active: { value: '{colors.nebula.active}' },
          // ADDED: Cosmic colors for nebula theme
          cosmic1: { value: '{colors.nebula.cosmic1}' },
          cosmic2: { value: '{colors.nebula.cosmic2}' },
          cosmic3: { value: '{colors.nebula.cosmic3}' },
          cosmicCore: { value: '{colors.nebula.cosmicCore}' },
        }
      }
    }
  },
  
  // Configuration options
  prefix: "",
  
  conditions: {
    extend: {
      starlight: "[data-panda-theme=starlight] &, .light &:not([data-panda-theme])",
      midnight: "[data-panda-theme=midnight] &, .dark &:not([data-panda-theme])",
      eclipse: "[data-panda-theme=eclipse] &",
      moonlight: "[data-panda-theme=moonlight] &",
      nebula: "[data-panda-theme=nebula] &",
      groupHover: "[role=group]:where(:hover, [data-hover]) &",
    },

  },
});