// src/styles/globalStyles.js
import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  /* Base Reset */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  /* Document Settings */
  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${props => props.theme.fonts.body};
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    line-height: 1.6;
    overflow-x: hidden;
    min-height: 100vh;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    font-family: ${props => props.theme.fonts.heading};
    font-weight: 50;
    line-height: 1.2;
    margin-bottom: ${props => props.theme.spacing.md};
    color: ${props => props.theme.colors.primary};
  }
  
  h1 {
    font-size: 2.5rem;
    letter-spacing: 0.05em;
  }
  
  h2 {
    font-size: 2rem;
    margin-top: ${props => props.theme.spacing.lg};
  }
  
  h3 {
    font-size: 1.5rem;
    color: ${props => props.theme.colors.primaryLight};
  }
  
  p {
    margin-bottom: ${props => props.theme.spacing.md};
    color: ${props => props.theme.colors.textSecondary};
  }
  
  a {
    color: ${props => props.theme.colors.primaryLight};
    text-decoration: none;
    transition: color ${props => props.theme.transitions.default};
    
    &:hover {
      color: ${props => props.theme.colors.primary};
    }
  }
  
  code, pre {
    font-family: ${props => props.theme.fonts.mono};
    background-color: ${props => props.theme.colors.surfaceLight};
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
    border-radius: ${props => props.theme.borderRadius.small};
  }
  
  /* Layout Elements */
  section {
    padding: ${props => props.theme.spacing.xl} 0;
  }
  
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 ${props => props.theme.spacing.md};
  }
  
  /* UI Elements */
  button, .button {
    font-family: ${props => props.theme.fonts.heading};
    background-color: rgba(160, 142, 97, 0.15);
    color: ${props => props.theme.colors.primary};
    border: 1px solid ${props => props.theme.colors.primaryDark};
    border-radius: ${props => props.theme.borderRadius.medium};
    padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
    cursor: pointer;
    transition: all ${props => props.theme.transitions.default};
    font-size: 0.875rem;
    letter-spacing: 0.05em;
    
    &:hover {
      background-color: rgba(160, 142, 97, 0.25);
      box-shadow: ${props => props.theme.shadows.glow};
    }
    
    &.primary {
      background-color: ${props => props.theme.colors.primary};
      color: #080808;
      
      &:hover {
        background-color: ${props => props.theme.colors.primaryLight};
      }
    }
  }
  
  /* Card Style */
  .card {
    background-color: ${props => props.theme.colors.surfaceMid};
    border: 1px solid ${props => props.theme.colors.primaryDark};
    border-radius: ${props => props.theme.borderRadius.medium};
    padding: ${props => props.theme.spacing.md};
    margin-bottom: ${props => props.theme.spacing.md};
    transition: transform ${props => props.theme.transitions.default}, 
                box-shadow ${props => props.theme.transitions.default};
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${props => props.theme.shadows.glow};
    }
  }
  
  /* Visualization Elements */
  .visualization-container {
    border: 1px solid ${props => props.theme.colors.primaryDark};
    border-radius: ${props => props.theme.borderRadius.medium};
    background-color: ${props => props.theme.colors.surfaceDark};
    overflow: hidden;
    margin: ${props => props.theme.spacing.md} 0;
    box-shadow: ${props => props.theme.shadows.medium};
  }
  
  /* Utility Classes */
  .text-center { text-align: center; }
  .text-right { text-align: right; }
  .text-primary { color: ${props => props.theme.colors.primary}; }
  .text-secondary { color: ${props => props.theme.colors.secondary}; }
  .text-muted { color: ${props => props.theme.colors.textSecondary}; }
  
  .bg-surface { background-color: ${props => props.theme.colors.surfaceMid}; }
  .bg-dark { background-color: ${props => props.theme.colors.surfaceDark}; }
  .bg-highlight { background-color: ${props => props.theme.colors.highlight}; }
  
  .divider {
    height: 1px;
    background-color: ${props => props.theme.colors.divider};
    margin: ${props => props.theme.spacing.md} 0;
  }
  
  /* Animation Keyframes */
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

export default GlobalStyles;