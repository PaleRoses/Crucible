// styles/themes/GlobalStyles.tsx
import { createGlobalStyle } from 'styled-components';
import { CustomTheme } from './theme';

export const GlobalStyles = createGlobalStyle<{ theme: CustomTheme }>`
  /**
   * FONT LOADING OPTIMIZATION
   * Font-specific settings to prevent FOUC
   */
  @font-face {
    font-family: "adobe-caslon-pro";
    font-display: swap;
  }

  @font-face {
    font-family: "haboro-soft-condensed";
    font-display: swap;
  }

  @font-face {
    font-family: "ibm-plex-mono";
    font-display: swap;
  }

  /* Size-adjusted fallback fonts to minimize layout shift */
  @font-face {
    font-family: "adobe-caslon-pro-fallback";
    src: local("Georgia");
    size-adjust: 105%;
    ascent-override: 95%;
    descent-override: 22%;
    line-gap-override: 0%;
  }

  @font-face {
    font-family: "haboro-soft-condensed-fallback";
    src: local("Avenir"), local("Helvetica Neue"), local("Helvetica"),
      local("Arial");
    size-adjust: 100%;
    ascent-override: 90%;
    descent-override: 25%;
    line-gap-override: 0%;
  }

  @font-face {
    font-family: "ibm-plex-mono-fallback";
    src: local("Courier New"), local("Courier"), local("monospace");
    size-adjust: 105%;
    ascent-override: 90%;
    descent-override: 25%;
    line-gap-override: 0%;
  }

  :root {
    /* Define font variable availability flag for JS detection */
    --fonts-loaded: 0;
    
    /* Apply fallback fonts first in the stack */
    --font-heading: "haboro-soft-condensed-fallback", "haboro-soft-condensed",
      "Avenir Next", "Avenir", sans-serif;
    --font-body: "adobe-caslon-pro-fallback", "adobe-caslon-pro", "LTC Caslon",
      Georgia, serif;
    --font-mono: "ibm-plex-mono-fallback", "ibm-plex-mono", "Consolas",
      monospace;
    
    /* Core spacing scale - kept outside of theme for consistency */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 2rem;
    --spacing-xl: 4rem;
    --spacing-xxl: 6rem;
    
    /* Border Radius - kept outside of theme for consistency */
    --radius-small: 2px;
    --radius-medium: 4px;
    --radius-large: 8px;
    --radius-full: 9999px;
  }
  
  html.fonts-loaded:root {
    --fonts-loaded: 1;
  }

  /**
   * BASE STYLES
   * Foundational styling applied to HTML elements directly
   */
  html {
    scroll-behavior: smooth;
    min-height: 100%;
    width: 100%;
    overflow-x: hidden;
    margin: 0;
    padding: 0;
    font-size: 16px;
  }

  body {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.5;
    overflow-x: hidden;
    min-height: 100vh;
    font-family: var(--font-body);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    margin: 0;
    padding: 0;
    width: 100%;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  /* Typography Defaults */
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    font-weight: 200;
    letter-spacing: 0.1em;
    line-height: 1.2;
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.primary};
    font-optical-sizing: none;
  }

  h1 {
    font-size: 2.5rem;
    letter-spacing: 0.14em;
  }

  h2 {
    font-size: 2rem;
    margin-top: 2rem;
  }

  h3 {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.primary};
  }

  p {
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.textMuted};
  }

  span {
    color: ${({ theme }) => theme.colors.text};
  }

  a {
    color: ${({ theme }) => theme.colors.link};
    text-decoration: none;
    transition: color 0.3s ease;
    
    &:hover {
      color: ${({ theme }) => theme.colors.primary};
      text-decoration: underline;
    }
  }

  code, pre {
    font-family: var(--font-mono);
    background-color: ${({ theme }) => `${theme.colors.backgroundAlt}80`};
    border-radius: var(--radius-small);
    padding: 0.25rem 0.5rem;
  }

  section {
    padding-top: 4rem;
    padding-bottom: 4rem;
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 2px;
    height: 2px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.border};
    border-radius: var(--radius-medium);
  }

  ::-webkit-scrollbar-button:vertical:decrement {
    height: 6px;
    background-color: transparent;
    border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  }

  ::-webkit-scrollbar-button:vertical:increment {
    height: 6px;
    background-color: transparent;
    border-top: 2px solid ${({ theme }) => theme.colors.border};
  }

  /* Firefox scrollbar styling */
  * {
    scrollbar-color: ${({ theme }) => `${theme.colors.border} transparent`};
    scrollbar-width: thin;
  }

  /* Navbar critical styles to prevent FOUC */
  nav {
    opacity: 1 !important;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 100;
    background: ${({ theme }) => `${theme.colors.navBackground}`};
    backdrop-filter: blur(8px);
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    transition: background-color 0.3s ease;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  /**
   * COMPONENT STYLES
   * Reusable UI component patterns
   */
  .app-container {
    position: relative;
    min-height: 100vh;
    width: 100%;
    isolation: isolate;
  }

  .background-container {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100vh;
    pointer-events: none;
    overflow: hidden;
    z-index: -100;
  }

  .background-extension {
    position: fixed;
    left: 0;
    top: 100vh;
    width: 100%;
    height: 100vh;
    z-index: -101;
  }

  .app-content {
    position: relative;
    min-height: 100vh;
    width: 100%;
    z-index: 10;
    transition: opacity 0.3s ease;
  }

  .container {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: 1rem;
    padding-right: 1rem;
    max-width: 1200px;
  }

  /* UI Elements */
  button, .button {
    font-family: var(--font-heading);
    background-color: ${({ theme }) => `${theme.colors.primary}20`};
    color: ${({ theme }) => theme.colors.primary};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: var(--radius-medium);
    cursor: pointer;
    font-size: 0.875rem;
    letter-spacing: 0.05em;
    padding: 0.5rem 1rem;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: ${({ theme }) => `${theme.colors.primary}30`};
      box-shadow: 0 0 15px ${({ theme }) => `${theme.colors.glow}`};
    }
    
    &.primary {
      background-color: ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.background};
      
      &:hover {
        background-color: ${({ theme }) => theme.colors.accent1};
      }
    }
  }

  /* Card Style */
  .card {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: var(--radius-medium);
    margin-bottom: 1rem;
    padding: 1rem;
    transition: transform 0.3s ease;
    
    &:hover {
      transform: translateY(-0.125rem);
      box-shadow: 0 0 15px ${({ theme }) => `${theme.colors.glow}`};
    }
  }

  /* Visualization Container */
  .visualization-container {
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: var(--radius-medium);
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    overflow: hidden;
    margin: 1rem 0;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }

  /* Transition Classes */
  .fade-enter {
    opacity: 0;
  }

  .fade-enter-active {
    opacity: 1;
    transition: opacity 300ms ease-in;
  }

  .fade-exit {
    opacity: 1;
  }

  .fade-exit-active {
    opacity: 0;
    transition: opacity 300ms ease-out;
  }

  /**
   * UTILITY CLASSES
   * Single-purpose helpers
   */
  .text-primary {
    color: ${({ theme }) => theme.colors.primary};
  }

  .text-secondary {
    color: ${({ theme }) => theme.colors.secondary};
  }

  .text-muted {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  .bg-surface {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
  }

  .bg-dark {
    background-color: ${({ theme }) => theme.colors.background};
  }

  .bg-highlight {
    background-color: ${({ theme }) => `${theme.colors.primary}20`};
  }

  .divider {
    height: 1px;
    background-color: ${({ theme }) => `${theme.colors.border}80`};
    margin: 1rem 0;
  }
`;