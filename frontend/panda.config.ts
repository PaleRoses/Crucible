// improved-panda.config.ts
import { defineConfig } from "@pandacss/dev";
import { tokens } from "./moonlight-ui/panda.config/tokens/tokens";
import { themes } from "./moonlight-ui/panda.config/themes";
import { breakpoints } from "./moonlight-ui/panda.config/breakpoints"
import { textStyles } from './panda.config/text-styles';
import { recipes } from './panda.config/recipes';
import { defineUtility } from '@pandacss/dev';

export default defineConfig({
  // Basic setup
  preflight: true,
  include: ['./src/**/*.{js,jsx,ts,tsx}'],
  exclude: [],
  outdir: 'styled-system',
  jsxFramework: 'react',
  minify: true, // Enable minification for smaller CSS bundles

  staticCss: {
    themes: ['midnight', 'starlight', 'eclipse', 'moonlight', 'nebula']
  },
  

  // Global styles
  globalCss: {
  
    ":root": {
      // Font variablesa
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
      // Using token references for transitions instead of hardcoded values
      "--transition-default": "token(durations.default) token(easings.default)",
      "--transition-fast": "token(durations.fast) token(easings.default)",
      "--transition-medium": "token(durations.medium) token(easings.default)",
      "--transition-slow": "token(durations.slow) token(easings.default)",
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
    // Box sizing for predictable layout behavior
    "*, *::before, *::after": {
      boxSizing: "border-box",
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
      letterSpacing: "0.1em",
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
      letterSpacing: "0.15em",
      lineHeight: 1.2,
      marginBottom: "1rem",
      color: "var(--color-primary)",
      fontOpticalSizing: "none",
    },
    h1: {
      fontSize: "2.5rem",
      letterSpacing: "0.18em",
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
    // Custom scrollbar for elements
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
    // Note: Combined the vertical increment/decrement buttons
    "::-webkit-scrollbar-button": {
      height: "6px",
      backgroundColor: "transparent",
    },
    // Firefox scrollbar styling for elements
    "*": {
      scrollbarColor: "var(--color-border) transparent",
      scrollbarWidth: "thin",
    },
    // Override for html/body only
    "html, body": {
      scrollbarWidth: "none",
      msOverflowStyle: "none",
    },
    "html::-webkit-scrollbar, body::-webkit-scrollbar": {
      width: "0",
      display: "none",
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
  },

  // Theme configuration - essential parts
  theme: {
    extend: {
      tokens,
      breakpoints,
      // @ts-ignore
      recipes,
      keyframes: {        
        ripple: { // <-- Add this definition
          'to': {
            transform: 'scale(4)',
            opacity: '0'
          }
        },

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
        },
        navItemHover: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.05)' }
        },
        arrowRotateOpen: {
          '0%': { transform: 'rotate(0)' },
          '50%': { transform: 'rotate(180deg) translateY(2px)' },
          '100%': { transform: 'rotate(180deg) translateY(0)' }
        },
        submenuFadeIn: {
          '0%': { opacity: 0, transform: 'scale(0.99)' },
          '100%': { opacity: 1, transform: 'scale(1)' }
        },
        submenuSlideRight: {
          '0%': { opacity: 0, transform: 'translateX(40px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' }
        },
        submenuSlideLeft: {
          '0%': { opacity: 0, transform: 'translateX(-40px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' }
        },
        mobileMenuOpen: {
          '0%': { opacity: 0, transform: 'translateY(-100%)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        mobileMenuClose: {
          '0%': { opacity: 1, transform: 'translateY(0)' },
          '100%': { opacity: 0, transform: 'translateY(-100%)' }
        }
      },
      
    },
  },
  themes,
  prefix: "",
  
  conditions: {
    extend: {
      starlight: "[data-panda-theme=starlight] &",
      midnight: "[data-panda-theme=midnight] &",
      eclipse: "[data-panda-theme=eclipse] &",
      moonlight: "[data-panda-theme=moonlight] &",
      nebula: "[data-panda-theme=nebula] &",
      // Light/dark mode fallbacks can be handled separately if needed
      light: ".light &",
      dark: ".dark &",
      groupHover: "[role=group]:where(:hover, [data-hover]) &",
    },
  },
  // --- Add your utilities here ---
  utilities: {
    // Wrap each utility definition with defineUtility
    srOnly: defineUtility({
      // className: "sr-only", // className is often inferred, but can be specified
      values: { type: 'boolean' }, // Use type: 'boolean' for simpler boolean utilities
      transform(value) {
        if (value === true) {
          return {
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: "0",
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            borderWidth: "0"
          };
        }
        // It's good practice to return an empty object if the condition isn't met
        return {};
      }
    }), // End of srOnly definition

    textTruncate: defineUtility({
      // className: "text-truncate",
      values: { type: 'boolean' },
      transform(value) {
        if (value === true) {
          return {
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          };
        }
        return {};
      }
    }), // End of textTruncate definition

    focusRing: defineUtility({
      // className: "focus-ring",
      values: { type: 'boolean' },
      // Ensure TransformArgs is imported if needed, or rely on inference
      transform(value, { token }) { // Access token function via the second argument
        if (value === true) {
          return {
            outline: `2px solid ${token('colors.primary')}`, // Use template literal or token reference
            // outline: '2px solid {colors.primary}', // Alternative token reference syntax
            outlineOffset: "2px",
            // Optionally add default focus removal if applying directly via focus state
            // '&:focus': {
            //   outline: 'none', // Remove default browser outline if needed
            // }
          };
        }
        return {};
      }
    }), // End of focusRing definition

   // --- Corrected Gradient Border Utility ---
   gradientBorder: defineUtility({
    className: 'gradient-border',
    // description: 'Applies a gradient border using a masked pseudo-element',
    values: { type: 'string' },
    transform(value: string, { token }) { // Destructure token helper

      // Ensure the token exists in your theme. If 'spacing.0.5' isn't defined,
      // you'll get a Panda build error, which is better than a runtime issue.
      // Or, define a variable here like: const defaultWidth = token('spacing.0.5') || '2px';
      // But relying on defined tokens is cleaner.
      const defaultBorderWidth = token('spacing.0.5'); // Get the token value (e.g., '2px')

      return {
        position: 'relative',
        zIndex: 0,
        '--gradient-border-background-image': value,

        // Use the retrieved token value as the fallback for the CSS variable
        '--after-inset':
          `calc(var(--gradient-border-width, ${defaultBorderWidth}) + var(--gradient-border-offset, 0px))`, // FIXED: token() has only 1 arg

        '&::after': {
          content: '""',
          display: 'block',
          position: 'absolute',
          inset: 'calc(var(--after-inset) * -1)',
          pointerEvents: 'none',

          // Use the retrieved token value as the fallback for the CSS variable here too
          padding: `var(--gradient-border-width, ${defaultBorderWidth})`, // FIXED: token() has only 1 arg

          borderRadius: 'var(--gradient-border-radius, inherit)',
          backgroundImage: 'var(--gradient-border-background-image)',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          zIndex: -1,
        },
      }
    },
  }), // --- End of corrected gradientBorder ---

  // Keep the other gradient utilities (gradientBorderWidth, etc.) as they were
  gradientBorderWidth: defineUtility({
      // ... (no changes needed here) ...
      className: 'gradient-border-w',
      // description: 'Sets the width of the gradient border',
      values: 'spacing',
      transform(value: string) {
        return { '--gradient-border-width': value };
      },
  }),

  gradientBorderOffset: defineUtility({
      // ... (no changes needed here) ...
       className: 'gradient-border-offset',
       // description: 'Sets an offset for the gradient border from the element edge',
       values: 'spacing', // Or { type: 'string' }
       transform(value: string) {
         return { '--gradient-border-offset': value };
       },
  }),

  gradientBorderRadius: defineUtility({
      // ... (no changes needed here) ...
      className: 'gradient-border-r',
      // description: "Adjusts the border radius of the gradient border pseudo-element (defaults to parent's radius)",
      values: 'radii', // Or { type: 'string' } if you need 'inherit' explicitly
      transform(value: string) {
        return { '--gradient-border-radius': value };
      },
  }),
  }
});