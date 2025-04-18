// moonlight-ui/panda.config/breakpoints.ts
export const breakpoints = {
    // Standard size breakpoints
    sm: '480px',     // Small mobile devices
    md: '768px',     // Tablets/larger phones
    lg: '1024px',    // Small laptops/desktops
    xl: '1440px',    // Standard desktop
    '2xl': '1920px', // Large desktop
    'max': '2400px', // Maximum size - our upper bound
    
    // Descriptive device breakpoints (aliases)
    phone: '480px',                   // Standard phone size
    'ipad-pro-11': '834px',           // iPad Pro 11-inch (portrait)
    'ipad-pro-11-landscape': '1194px', // iPad Pro 11-inch (landscape)
    'ipad-pro-13': '1032px',          // iPad Pro 13-inch (portrait)
    'ipad-pro-13-landscape': '1366px', // iPad Pro 13-inch (landscape)
    desktop: '1440px',                // Standard desktop monitors
  }