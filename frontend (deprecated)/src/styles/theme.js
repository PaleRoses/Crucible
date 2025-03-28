// src/styles/theme.js
const theme = {
  fonts: {
    heading: "'Avenir', 'Avenir Next', sans-serif",
    body: "'Adobe Caslon Pro', 'Caslon', serif",
    mono: "'IBM Plex Mono', 'Consolas', monospace"
  },
  colors: {
    // Core colors
    background: "#080808", // Slightly softer than pure black
    text: "#E0E0E0", // Slightly softer than pure white
    textSecondary: "rgba(224, 224, 224, 0.7)",
    
    // Primary gold palette - enhanced with more variations
    primary: "#a08e61", // Main gold
    primaryLight: "#bfad7f", // Lighter gold
    primaryDark: "#786b49", // Darker gold
    primaryMuted: "#8a7c57", // More subdued gold
    primaryGlow: "rgba(160, 142, 97, 0.3)", // Subtle gold glow
    
    // Secondary colors (replacing reds with washed-out golds)
    secondary: "#9c8352", // Desaturated gold - replaces accent
    secondaryLight: "#b09b6b", // Lighter desaturated gold
    secondaryDark: "#7d6942", // Darker desaturated gold
    secondaryGlow: "rgba(156, 131, 82, 0.25)",
    
    // Additional palette for visualization and UI elements
    tertiary: "#a48e6f", // Warm taupe-gold for variety
    tertiaryLight: "#c4b395", // Light taupe-gold
    
    // Surface and UI colors
    surfaceLight: "#191919",
    surfaceDark: "#0d0d0d",
    surfaceMid: "#151515", // Added intermediate surface
    overlay: "rgba(8, 8, 8, 0.85)", // For modals and overlays
    
    // Utility colors - subtle variants for specialized UI
    highlight: "rgba(191, 173, 127, 0.15)", // Very subtle gold highlight
    divider: "rgba(160, 142, 97, 0.2)", // Subtle divider color
    
    // Category colors for visualization
    categories: {
      cat1: "#9c8352", // Desaturated gold
      cat2: "#a48e6f", // Warm taupe
      cat3: "#8f8557", // Olive gold
      cat4: "#a79170", // Soft bronze
      cat5: "#7a6e4e"  // Dark moss gold
    }
  },
  breakpoints: {
    small: "576px",
    medium: "768px",
    large: "992px",
    xlarge: "1200px"
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "2rem",
    xl: "4rem",
    xxl: "6rem" // Added for more spacing options
  },
  transitions: {
    default: "0.3s ease",
    slow: "0.6s ease",
    fast: "0.15s ease" // Added for hover effects
  },
  shadows: {
    subtle: "0 2px 10px rgba(0, 0, 0, 0.15)",
    medium: "0 4px 20px rgba(0, 0, 0, 0.2)",
    strong: "0 8px 30px rgba(0, 0, 0, 0.3)",
    glow: "0 0 15px rgba(160, 142, 97, 0.25)" // Gold glow for highlights
  },
  borderRadius: {
    small: "2px",
    medium: "4px",
    large: "8px",
    full: "9999px" // For circular elements
  },
  // New properties based on visualization
  opacity: {
    subtle: 0.2,
    medium: 0.5,
    high: 0.8
  },
  gradient: {
    goldFade: "linear-gradient(to right, rgba(160, 142, 97, 0.7), rgba(160, 142, 97, 0))",
    darkFade: "linear-gradient(180deg, #080808 0%, rgba(8, 8, 8, 0.85) 100%)"
  },
  animation: {
    pulse: "pulse 3s infinite ease-in-out",
    fadeIn: "fadeIn 0.6s ease-out"
  }
};

export default theme;