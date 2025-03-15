import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/context/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Fonts
      fontFamily: {
        heading: ['Avenir', 'Avenir Next', 'sans-serif'],
        body: ['Adobe Caslon Pro', 'Caslon', 'serif'],
        mono: ['IBM Plex Mono', 'Consolas', 'monospace'],
      },
      // Colors
      colors: {
        background: '#080808',
        text: '#E0E0E0',
        textSecondary: 'rgba(224, 224, 224, 0.7)', // See CSS note below
        primary: '#a08e61',
        primaryLight: '#bfad7f',
        primaryDark: '#786b49',
        primaryMuted: '#8a7c57',
        primaryGlow: 'rgba(160, 142, 97, 0.3)',
        secondary: '#9c8352',
        secondaryLight: '#b09b6b',
        secondaryDark: '#7d6942',
        secondaryGlow: 'rgba(156, 131, 82, 0.25)',
        tertiary: '#a48e6f',
        tertiaryLight: '#c4b395',
        surfaceLight: '#191919',
        surfaceDark: '#0d0d0d',
        surfaceMid: '#151515',
        overlay: 'rgba(8, 8, 8, 0.85)',
        highlight: 'rgba(191, 173, 127, 0.15)',
        divider: 'rgba(160, 142, 97, 0.2)',
        // Category colors
        cat1: '#9c8352',
        cat2: '#a48e6f',
        cat3: '#8f8557',
        cat4: '#a79170',
        cat5: '#7a6e4e',
      },
      // Spacing
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '2rem',
        xl: '4rem',
        xxl: '6rem',
      },
      // Shadows
      boxShadow: {
        subtle: '0 2px 10px rgba(0, 0, 0, 0.15)',
        medium: '0 4px 20px rgba(0, 0, 0, 0.2)',
        strong: '0 8px 30px rgba(0, 0, 0, 0.3)',
        glow: '0 0 15px rgba(160, 142, 97, 0.25)',
      },
      // Border Radius
      borderRadius: {
        small: '2px',
        medium: '4px',
        large: '8px',
        full: '9999px',
      },
      // Transitions
      transitionDuration: {
        default: '300ms',
        slow: '600ms',
        fast: '150ms',
      },
      transitionTimingFunction: {
        default: 'ease',
      },
      // Animations (existing + new)
      animation: {
        spin: 'spin 1s linear infinite',
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        pulse: 'pulse 3s ease-in-out infinite',
        logoSpin: 'logoSpin 20s linear infinite',
      },
      keyframes: {
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0.7', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%': { opacity: '0.6' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.6' },
        },
        logoSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      // Existing border width
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
};

export default config;