// moonlight-ui/panda.config/global-css.ts
import { defineGlobalStyles } from '@pandacss/dev'

export const globalCss = defineGlobalStyles({

    // CSS Variables - keep these for reference elsewhere
    ":root": {
        // Font variablesa
"--fonts-loaded": "0",


// Ripple effect variables
"--ripple-x":       "0px",     // default center X :contentReference[oaicite:0]{index=0}
"--ripple-y":       "0px",     // default center Y :contentReference[oaicite:1]{index=1}
"--ripple-size":    "0px",     // default diameter :contentReference[oaicite:2]{index=2}
"--ripple-opacity": "0",       // default opacity :contentReference[oaicite:3]{index=3}
"--ripple-scale": 'clamp(0.8, 0.8 + ((100vw - 400px) * 0.7 / 2000), 1.5)',
"--ripple-duration":"600ms",   // default animation length :contentReference[oaicite:4]{index=4}


       // Color variables mapping to tokens - direct reference 
'--color-primary': 'colors.primary',
'--color-secondary': 'colors.secondary',
'--color-background': 'colors.background',
'--color-background-alt': 'colors.backgroundAlt',
'--color-text': 'colors.text',
'--color-text-muted': 'colors.textMuted',
'--color-accent1': 'colors.accent1',
'--color-accent2': 'colors.accent2',
'--color-accent3': 'colors.accent3',
'--color-glow': 'colors.glow',
'--color-border': 'colors.border',
'--color-hover': 'colors.hover',
'--color-active': 'colors.active',
'--color-cosmic1': 'colors.cosmic1',
'--color-cosmic2': 'colors.cosmic2',
'--color-cosmic3': 'colors.cosmic3',
'--color-cosmic-core': 'colors.cosmicCore',

// Transition and shadow variables
'--transition-default': 'durations.default easings.default',
'--transition-fast': 'durations.fast easings.default',
    '--transition-medium': 'durations.medium easings.default',
    '--transition-slow': 'durations.slow easings.default',

    

// Shadow definitions
    '--shadow-glow': 'colors.glow 0 0 15px 1px',
    '--shadow-medium': '0 4px 8px colors.border',
    '--radius-small': 'radii.sm',
    '--radius-medium': 'radii.md',
    '--radius-large': 'radii.lg'
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
        fontSize: "base",
      },
      body: {
        color: "text",
        lineHeight: "tight",
        overflowX: "hidden",
        minHeight: "100vh",
        fontFamily: "body",
        fontWeight: "thin",
        letterSpacing: "widest",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        width: "100%",
        transition: "background-color 0.3s ease, color 0.3s ease",
      },

      // Typography defaults
      "h1, h2, h3, h4, h5, h6": {
        fontFamily: "heading",
        fontWeight: "thin",
        lineHeight: "tight",
        marginBottom: "4",
        color: "primary",
        fontOpticalSizing: "none",
      },
      h1: {
        fontSize: "4xl",
        letterSpacing: "ultraWide",
      },
      h2: {
        fontSize: "3xl",
        marginTop: "md",
      },
      h3: {
        fontSize: "xl",
        color: "secondary",
      },
      p: {
        color: "textMuted",
        fontWeight: "thin",
        letterSpacing: "wider",
        lineHeight: "snug",
      },
      span: {
        color: "text",
        fontWeight: "thin",
      },
      a: {
        color: "secondary",
        textDecoration: "none",
        transition: "default default",
        fontWeight: "thin",
        "&:hover": {
          color: "primary",
          textDecoration: "underline",
        },
      },
      "code, pre": {
        fontFamily: "mono",
        fontWeight: "thin",
        backgroundColor: "color-mix(in srgb, backgroundAlt 50%, transparent)",
        borderRadius: "sm",
        padding: "1 2",
        lineHeight: "snug",
      },
      // Custom scrollbar for elements
      "::-webkit-scrollbar": {
        width: "sm",
        height: "sm",
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
        fontFamily: "heading",
        cursor: "pointer",
        fontSize: "sm",
        letterSpacing: "wider",
        padding: "2 4",
        },

        '@keyframes rippleEntry': {
          '0%':   { transform: 'scale(0)',                  opacity: 'var(--ripple-opacity)' },
          '100%': { transform: 'scale(var(--ripple-scale))', opacity: '0' }
        },
        '@keyframes rippleExit': {
          '0%':   { opacity: 'var(--ripple-opacity)' },
          '100%': { opacity: '0' }
        },
        '@keyframes ripplePulse': {
          '0%':   { transform: 'scale(0.8)',                   opacity: 'calc(var(--ripple-opacity) * .7)' },
          '50%':  { transform: 'scale(1)',                     opacity: 'var(--ripple-opacity)' },
          '100%': { transform: 'scale(0.8)',                   opacity: 'calc(var(--ripple-opacity) * .7)' }
        }
})