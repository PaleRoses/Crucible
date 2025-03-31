// panda.config.ts
import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ["./src/**/*.{js,jsx,ts,tsx}", "./pages/**/*.{js,jsx,ts,tsx}"],

  // Files to exclude
  exclude: [],

  // The output directory for your css system
  outdir: "styled-system",
  
  // Conditions for responsive design and themes
  conditions: {
    // Responsive breakpoints
    xs: { "@media": "screen and (min-width: 320px)" },
    sm: { "@media": "screen and (min-width: 640px)" },
    md: { "@media": "screen and (min-width: 768px)" },
    lg: { "@media": "screen and (min-width: 1024px)" },
    xl: { "@media": "screen and (min-width: 1280px)" },
    '2xl': { "@media": "screen and (min-width: 1536px)" },
    
    // Theme conditions - midnight is dark theme, starlight is light theme
    midnight: { selector: '[data-theme="midnight"] &, .dark &:not([data-theme])' },
    starlight: { selector: '[data-theme="starlight"] &, .light &:not([data-theme])' },
    azure: { selector: '[data-theme="azure"] &' },
    amber: { selector: '[data-theme="amber"] &' },
    
    // Theme auto detection based on system preference (used for HTML/body classes)
    darkMode: { "@media": "(prefers-color-scheme: dark)" },
    lightMode: { "@media": "(prefers-color-scheme: light)" },
    
    // Interaction states
    hover: { selector: "&:hover" },
    focus: { selector: "&:focus" },
    active: { selector: "&:active" },
    
    // Additional useful conditions
    reduced: { "@media": "(prefers-reduced-motion)" },
    portrait: { "@media": "(orientation: portrait)" },
    landscape: { "@media": "(orientation: landscape)" },
  },

  // Font configurations
  globalCss: {
    "@font-face": {
      fontFamily: "adobe-caslon-pro",
      fontDisplay: "swap",
    },
    "@font-face(1)": {
      fontFamily: "haboro-soft-condensed",
      fontDisplay: "swap",
    },
    "@font-face(2)": {
      fontFamily: "ibm-plex-mono",
      fontDisplay: "swap",
    },
    "@font-face(3)": {
      fontFamily: "adobe-caslon-pro-fallback",
      src: "local('Georgia')",
      sizeAdjust: "105%",
      ascentOverride: "95%",
      descentOverride: "22%",
      lineGapOverride: "0%",
    },
    "@font-face(4)": {
      fontFamily: "haboro-soft-condensed-fallback",
      src: "local('Avenir'), local('Helvetica Neue'), local('Helvetica'), local('Arial')",
      sizeAdjust: "100%",
      ascentOverride: "90%",
      descentOverride: "25%",
      lineGapOverride: "0%",
    },
    "@font-face(5)": {
      fontFamily: "ibm-plex-mono-fallback",
      src: "local('Courier New'), local('Courier'), local('monospace')",
      sizeAdjust: "105%",
      ascentOverride: "90%",
      descentOverride: "25%",
      lineGapOverride: "0%",
    },
    ":root": {
      "--fonts-loaded": "0",
      "--font-heading":
        "'haboro-soft-condensed-fallback', 'haboro-soft-condensed', 'Avenir Next', 'Avenir', sans-serif",
      "--font-body":
        "'adobe-caslon-pro-fallback', 'adobe-caslon-pro', 'LTC Caslon', Georgia, serif",
      "--font-mono": 
        "'ibm-plex-mono-fallback', 'ibm-plex-mono', 'Consolas', monospace",
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
      backgroundColor: "token(colors.background)",
      color: "token(colors.text)",
      lineHeight: 1.5,
      overflowX: "hidden",
      minHeight: "100vh",
      fontFamily: "var(--font-body)",
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
      color: "token(colors.primary)",
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
      color: "token(colors.primary)",
    },
    p: {
      marginBottom: "1rem",
      color: "token(colors.textMuted)",
    },
    span: {
      color: "token(colors.text)",
    },
    a: {
      color: "token(colors.link)",
      textDecoration: "none",
      transition: "color 0.3s ease",
      "&:hover": {
        color: "token(colors.primary)",
        textDecoration: "underline",
      },
    },
    "code, pre": {
      fontFamily: "var(--font-mono)",
      backgroundColor: "color-mix(in srgb, token(colors.backgroundAlt) 50%, transparent)",
      borderRadius: "token(radii.small)",
      padding: "0.25rem 0.5rem",
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
      backgroundColor: "token(colors.border)",
      borderRadius: "token(radii.medium)",
    },
    "::-webkit-scrollbar-button:vertical:decrement": {
      height: "6px",
      backgroundColor: "transparent",
      borderBottom: "2px solid token(colors.border)",
    },
    "::-webkit-scrollbar-button:vertical:increment": {
      height: "6px",
      backgroundColor: "transparent",
      borderTop: "2px solid token(colors.border)",
    },
    // Firefox scrollbar styling
    "*": {
      scrollbarColor: "token(colors.border) transparent",
      scrollbarWidth: "thin",
    },
    // Navbar critical styles
    nav: {
      opacity: "1 !important",
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      zIndex: 100,
      background: "token(colors.navBackground)",
      backdropFilter: "blur(8px)",
      height: "60px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 1.5rem",
      transition: "background-color 0.3s ease",
      borderBottom: "1px solid token(colors.border)",
    },
  },

  // Theme configuration
  theme: {
    extend: {
      tokens: {
        colors: {
          // Midnight theme
          midnight: {
            primary: { value: '#a08e61' }, // Gold
            background: { value: '#080808' }, // Deep black
            backgroundAlt: { value: '#14141e' }, // Slightly lighter black
            text: { value: '#ccd6e1' }, // Light blue-gray
            textMuted: { value: '#a7b6c8' }, // Muted blue-gray
            secondary: { value: '#8c8165' }, // Muted gold
            accent1: { value: '#b39c69' }, // Brighter gold
            accent2: { value: '#4a4f65' }, // Blue-gray accent
            glow: { value: 'rgba(160, 142, 97, 0.3)' }, // Gold glow
            border: { value: 'rgba(160, 142, 97, 0.2)' }, // Semi-transparent gold
            hover: { value: 'rgba(160, 142, 97, 0.1)' }, // Very light gold for hover
            active: { value: 'rgba(160, 142, 97, 0.3)' }, // Slightly stronger gold for active
            
            // Cosmic colors
            cosmic1: { value: '#1a1a2f' }, // Deep space blue
            cosmic2: { value: '#252540' }, // Distant nebula
            cosmic3: { value: '#32324f' }, // Star cluster
            cosmicCore: { value: '#a08e61' }, // Cosmic core (matches primary)
          },
          
          // Azure theme
          azure: {
            primary: { value: '#3a9d9e' }, // Teal
            background: { value: '#0a1428' }, // Deep navy blue
            backgroundAlt: { value: '#0f1e30' }, // Slightly lighter navy
            text: { value: '#e0f0f0' }, // Light teal-white
            textMuted: { value: '#b0d0d0' }, // Muted teal-white
            secondary: { value: '#2d7a7b' }, // Darker teal
            accent1: { value: '#5abfbf' }, // Brighter teal
            accent2: { value: '#1d4e6f' }, // Blue accent
            glow: { value: 'rgba(58, 157, 158, 0.3)' }, // Teal glow
            border: { value: 'rgba(58, 157, 158, 0.2)' }, // Semi-transparent teal
            hover: { value: 'rgba(58, 157, 158, 0.1)' }, // Very light teal for hover
            active: { value: 'rgba(58, 157, 158, 0.3)' }, // Slightly stronger teal for active
            
            // Cosmic colors
            cosmic1: { value: '#0d1e32' }, // Deep ocean
            cosmic2: { value: '#15304f' }, // Oceanic abyss
            cosmic3: { value: '#1d4269' }, // Underwater currents
            cosmicCore: { value: '#3a9d9e' }, // Cosmic core (matches primary)
          },
          
          // Starlight theme
          starlight: {
            primary: { value: '#c4adff' }, // Lavender
            background: { value: '#111133' }, // Deep indigo
            backgroundAlt: { value: '#1a1a40' }, // Slightly lighter indigo
            text: { value: '#d8e2f3' }, // Light lavender-white
            textMuted: { value: '#b0c0e0' }, // Muted lavender-white
            secondary: { value: '#9a8bca' }, // Muted lavender
            accent1: { value: '#d4bdff' }, // Brighter lavender
            accent2: { value: '#485090' }, // Indigo accent
            glow: { value: 'rgba(196, 173, 255, 0.3)' }, // Lavender glow
            border: { value: 'rgba(196, 173, 255, 0.2)' }, // Semi-transparent lavender
            hover: { value: 'rgba(196, 173, 255, 0.1)' }, // Very light lavender for hover
            active: { value: 'rgba(196, 173, 255, 0.3)' }, // Slightly stronger lavender for active
            
            // Cosmic colors
            cosmic1: { value: '#181845' }, // Distant galaxy
            cosmic2: { value: '#20206a' }, // Cosmic dust
            cosmic3: { value: '#2a2a8a' }, // Star formation
            cosmicCore: { value: '#c4adff' }, // Cosmic core (matches primary)
          },
          
          // Amber theme
          amber: {
            primary: { value: '#cb8d3f' }, // Amber
            background: { value: '#1a0e0a' }, // Deep brown
            backgroundAlt: { value: '#251512' }, // Slightly lighter brown
            text: { value: '#f0d6c0' }, // Light amber-white
            textMuted: { value: '#d0b0a0' }, // Muted amber-white
            secondary: { value: '#9e6e31' }, // Muted amber
            accent1: { value: '#e09c45' }, // Brighter amber
            accent2: { value: '#9e4a3a' }, // Rust accent
            glow: { value: 'rgba(203, 141, 63, 0.3)' }, // Amber glow
            border: { value: 'rgba(203, 141, 63, 0.2)' }, // Semi-transparent amber
            hover: { value: 'rgba(203, 141, 63, 0.1)' }, // Very light amber for hover
            active: { value: 'rgba(203, 141, 63, 0.3)' }, // Slightly stronger amber for active
            
            // Cosmic colors
            cosmic1: { value: '#2a1912' }, // Solar eclipse
            cosmic2: { value: '#3d2418' }, // Solar flare
            cosmic3: { value: '#4f2e1e' }, // Sunspot
            cosmicCore: { value: '#cb8d3f' }, // Cosmic core (matches primary)
          }
        },
        fonts: {
          heading: { value: "var(--font-heading)" },
          body: { value: "var(--font-body)" },
          mono: { value: "var(--font-mono)" },
        },
        spacing: {
          xs: { value: '0.25rem' },
          sm: { value: '0.5rem' },
          md: { value: '1rem' },
          lg: { value: '2rem' },
          xl: { value: '4rem' },
          xxl: { value: '6rem' },
        },
        radii: {
          small: { value: '2px' },
          medium: { value: '4px' },
          large: { value: '8px' },
          full: { value: '9999px' },
        },
        shadows: {
          subtle: { value: '0 2px 10px rgba(0, 0, 0, 0.15)' },
          medium: { value: '0 4px 20px rgba(0, 0, 0, 0.2)' },
          strong: { value: '0 8px 30px rgba(0, 0, 0, 0.3)' },
          glow: { value: '0 0 15px {colors.glow}' },
        },
        animations: {
          fadeIn: { value: 'fade-in 0.3s ease-in' },
          fadeOut: { value: 'fade-out 0.3s ease-out' },
        },
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        'fade-out': {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 },
        }
      }
    },
    semanticTokens: {
      colors: {
        // Core colors - these map to the active theme
        primary: { value: '{colors.midnight.primary}' },
        background: { value: '{colors.midnight.background}' },
        backgroundAlt: { value: '{colors.midnight.backgroundAlt}' },
        text: { value: '{colors.midnight.text}' },
        textMuted: { value: '{colors.midnight.textMuted}' },
        secondary: { value: '{colors.midnight.secondary}' },
        accent1: { value: '{colors.midnight.accent1}' },
        accent2: { value: '{colors.midnight.accent2}' },
        glow: { value: '{colors.midnight.glow}' },
        border: { value: '{colors.midnight.border}' },
        hover: { value: '{colors.midnight.hover}' },
        active: { value: '{colors.midnight.active}' },
        
        // Cosmic colors
        cosmic1: { value: '{colors.midnight.cosmic1}' },
        cosmic2: { value: '{colors.midnight.cosmic2}' },
        cosmic3: { value: '{colors.midnight.cosmic3}' },
        cosmicCore: { value: '{colors.midnight.cosmicCore}' },
        
        // Derived colors - these use the semantic tokens above
        link: { value: '{colors.primary}' },
        cardBackground: { value: '{colors.backgroundAlt}' },
        navBackground: { value: '{colors.background}' },
        buttonBackground: { value: '{colors.primary}' },
        buttonText: { value: '{colors.background}' },
      }
    }
  },
  
  // Define themes based on your theme colors
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
          glow: { value: '{colors.midnight.glow}' },
          border: { value: '{colors.midnight.border}' },
          hover: { value: '{colors.midnight.hover}' },
          active: { value: '{colors.midnight.active}' },
          cosmic1: { value: '{colors.midnight.cosmic1}' },
          cosmic2: { value: '{colors.midnight.cosmic2}' },
          cosmic3: { value: '{colors.midnight.cosmic3}' },
          cosmicCore: { value: '{colors.midnight.cosmicCore}' },
        }
      }
    },
    azure: {
      tokens: {
        colors: {
          primary: { value: '{colors.azure.primary}' },
          background: { value: '{colors.azure.background}' },
          backgroundAlt: { value: '{colors.azure.backgroundAlt}' },
          text: { value: '{colors.azure.text}' },
          textMuted: { value: '{colors.azure.textMuted}' },
          secondary: { value: '{colors.azure.secondary}' },
          accent1: { value: '{colors.azure.accent1}' },
          accent2: { value: '{colors.azure.accent2}' },
          glow: { value: '{colors.azure.glow}' },
          border: { value: '{colors.azure.border}' },
          hover: { value: '{colors.azure.hover}' },
          active: { value: '{colors.azure.active}' },
          cosmic1: { value: '{colors.azure.cosmic1}' },
          cosmic2: { value: '{colors.azure.cosmic2}' },
          cosmic3: { value: '{colors.azure.cosmic3}' },
          cosmicCore: { value: '{colors.azure.cosmicCore}' },
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
          glow: { value: '{colors.starlight.glow}' },
          border: { value: '{colors.starlight.border}' },
          hover: { value: '{colors.starlight.hover}' },
          active: { value: '{colors.starlight.active}' },
          cosmic1: { value: '{colors.starlight.cosmic1}' },
          cosmic2: { value: '{colors.starlight.cosmic2}' },
          cosmic3: { value: '{colors.starlight.cosmic3}' },
          cosmicCore: { value: '{colors.starlight.cosmicCore}' },
        }
      }
    },
    amber: {
      tokens: {
        colors: {
          primary: { value: '{colors.amber.primary}' },
          background: { value: '{colors.amber.background}' },
          backgroundAlt: { value: '{colors.amber.backgroundAlt}' },
          text: { value: '{colors.amber.text}' },
          textMuted: { value: '{colors.amber.textMuted}' },
          secondary: { value: '{colors.amber.secondary}' },
          accent1: { value: '{colors.amber.accent1}' },
          accent2: { value: '{colors.amber.accent2}' },
          glow: { value: '{colors.amber.glow}' },
          border: { value: '{colors.amber.border}' },
          hover: { value: '{colors.amber.hover}' },
          active: { value: '{colors.amber.active}' },
          cosmic1: { value: '{colors.amber.cosmic1}' },
          cosmic2: { value: '{colors.amber.cosmic2}' },
          cosmic3: { value: '{colors.amber.cosmic3}' },
          cosmicCore: { value: '{colors.amber.cosmicCore}' },
        }
      }
    }
  },
  
  // Utility classes - these will be available in your app
  utilities: {
    textHeading: {
      shorthand: "th",
      className: "text-heading",
      values: {
        h1: "h1",
        h2: "h2",
        h3: "h3",
        h4: "h4",
        h5: "h5",
        h6: "h6"
      },
      transform(value: string) {
        const fontSizes = {
          h1: "2.5rem",
          h2: "2rem",
          h3: "1.5rem",
          h4: "1.25rem",
          h5: "1rem",
          h6: "0.875rem"
        };
        
        return {
          fontFamily: "var(--font-heading)",
          fontWeight: "200",
          letterSpacing: value === "h1" ? "0.14em" : "0.1em",
          lineHeight: "1.2",
          marginBottom: "1rem",
          color: "token(colors.primary)",
          fontSize: fontSizes[value as keyof typeof fontSizes]
        };
      }
    },
    textType: {
      shorthand: "tt",
      className: "text",
      values: {
        primary: "primary",
        secondary: "secondary",
        muted: "muted"
      },
      transform(value: string) {
        return {
          color: value === "primary" 
            ? "token(colors.primary)"
            : value === "secondary" 
              ? "token(colors.secondary)" 
              : "token(colors.textMuted)"
        };
      }
    },
    bgSurface: {
      shorthand: "bg",
      className: "bg",
      values: {
        surface: "surface",
        dark: "dark",
        highlight: "highlight"
      },
      transform(value: string) {
        return {
          backgroundColor: value === "surface" 
            ? "token(colors.backgroundAlt)" 
            : value === "dark" 
              ? "token(colors.background)" 
              : "token(colors.hover)"
        };
      }
    }
  },
});