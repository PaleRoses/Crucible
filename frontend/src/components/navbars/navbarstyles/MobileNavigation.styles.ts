// Style for the mobile navbar logo/title link 
export const mobileNavbarLogoLinkStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'primary',
  cursor: 'pointer',
  transform: 'scale(1.2)', // Scale up slightly (20%)
  transition: 'transform 0.2s ease',
  height: '100%',
  _focusVisible: {
    outline: '2px solid',
    outlineColor: 'primary',
    outlineOffset: '1px',
  }
});import { css } from '../../../../styled-system/css'; // Ensure this path is correct

// --- Panda CSS Style Definitions (Mobile) ---

// Style for the mobile navbar with sidebar awareness
export const mobileNavbarStyle = css({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '50px', // CHANGED: Reduced height from 60px to 50px
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0',
  bgColor: 'background',
  borderBottom: '1px solid',
  borderColor: 'border',
  zIndex: 100,
  backdropFilter: 'blur(8px)',
});

// Left area of navbar - reserved for sidebar button or other controls
export const mobileNavbarLeftStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  width: '60px',
  height: '100%',
  paddingLeft: '2',
});

// Center area of navbar - for logo/title
export const mobileNavbarCenterStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexGrow: 1,
  height: '100%',
});

// Style for the title/logo in the center area
export const mobileNavbarTitleStyle = css({
  fontFamily: 'heading',
  fontSize: 'lg',
  fontWeight: 'medium',
  color: 'primary',
  textAlign: 'center',
});

// Right area of navbar - for menu button
export const mobileNavbarRightStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  width: '60px',  // Fixed width for consistency with left
  height: '100%',
  paddingRight: '2',
});

// Style for the mobile menu toggle button (hamburger/close icon)
// MODIFIED: Removed background color
export const mobileButtonStyle = css({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '45px',
  height: '45px',
  bgColor: 'transparent', // CHANGED: Removed background color
  color: 'text',
  border: 'none',
  borderRadius: '50%',
  fontSize: 'xl',
  padding: '2',
  cursor: 'pointer',
  transition: 'color 0.3s ease',
  '&[data-state="open"]': {
    color: 'primary',
  },
  _hover: {
    color: 'primary',
  },
  _focusVisible: {
    outline: '2px solid',
    outlineColor: 'primary',
    outlineOffset: '2px',
  },
});

export const menuCloseButtonStyle = css({
  position: 'absolute', // CHANGED: Changed to absolute positioning
  top: '15px', // CHANGED: Position at top
  right: '15px', // CHANGED: Position at right
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '45px',
  height: '45px',
  bgColor: 'transparent', // No background
  color: 'primary', // Using primary color
  border: 'none',
  borderRadius: '50%',
  fontSize: 'xl',
  padding: '2',
  cursor: 'pointer',
  transition: 'color 0.3s ease',
  _hover: {
    color: 'text',
  },
  _focusVisible: {
    outline: '2px solid',
    outlineColor: 'primary',
    outlineOffset: '2px',
  },
});

// Main content container - pushes content below the navbar
export const mainContentStyle = css({
  paddingTop: '50px',  // CHANGED: Match new reduced navbar height
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
});

// Style for the main mobile menu container (full screen overlay)
export const mobileMenuContainerStyle = css({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  bgColor: 'background',
  zIndex: 102,
  overflowY: 'hidden',
  overflowX: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
  backdropFilter: 'blur(8px)',
});

// Style for the header section within the mobile menu (Logo, Title, Optional Header Text)
export const mobileMenuHeaderStyle = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: '4',
  paddingTop: '60px', // CHANGED: Adjusted to match new navbar height
  marginBottom: '1',
  position: 'relative', // Position relative for children positioning
  bgColor: 'background',
  zIndex: 'sticky',
  borderColor: 'border',
  flexShrink: 0,
});

// Container specifically for the logo within the mobile menu header
// MODIFIED: Updated to center the logo and maintain space between logo and title
export const mobileMenuLogoContainerStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center', // CHANGED: Center the logo horizontally
  marginBottom: '4', // Keep the spacing between logo and title
  width: '100%',
});

// Style for the logo link within the mobile menu header
export const mobileMenuLogoLinkStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingBottom: '3', // Use theme token for bottom padding
  color: 'primary', // Use theme token
  cursor: 'pointer',
  transform: 'scale(3)', // ADDED: Scale up the logo by 30%
  transition: 'transform 0.2s ease',
  _focusVisible: { // Keyboard focus style
    outline: '2px solid',
    outlineColor: 'primary',
    outlineOffset: '1px',
  }
});

// Container for the main title (e.g., "Menu") in the mobile header
export const mobileMenuTitleContainerStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

// Style for the main title text in the mobile header
export const mobileMenuTitleTextStyle = css({
  fontFamily: 'heading',
  color: 'primary',
  fontSize: '1.4rem',
  fontWeight: 'light',
  textAlign: 'center',
  margin: 0,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
});

// Style for the optional descriptive header text below the title
export const mobileMenuHeaderTextStyle = css({
  color: 'text', // Use theme token
  fontSize: 'lg', // Use theme token (e.g., 1.2rem)
  fontWeight: 'normal',
  textAlign: 'center',
  margin: 0,
  lineHeight: 1.4,
});

// Container for the scrollable list of mobile navigation items
export const mobileMenuNavItemsStyle = css({
  display: 'flex',
  flexDirection: 'column', // Stack items vertically
  width: '100%',
  padding: '0', // Remove padding, borders will handle visual edges/separation
  marginTop: '0', // Reset margin
  overflowY: 'auto', // Allow this section to scroll if content exceeds viewport height
  flexGrow: 1, // Allow this container to take up remaining vertical space
  height: 'auto', // Height determined by flex-grow
});

// Base style for an individual main mobile navigation item (button/link)
export const mobileNavItemBaseStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between', // Push content and arrow apart
  width: '100%',
  padding: '4', // Use theme spacing token for internal padding (e.g., 1rem)
  fontFamily: 'heading', // Use theme token
  fontSize: 'mobileNavItem', // Use theme font size token
  fontWeight: 'normal',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'text', // Use theme token
  bgColor: 'transparent',
  border: 'none', // Remove default borders
  borderBottom: '3px solid', // Add divider below each item
  borderColor: 'primary', // Use theme primary color token for divider
  cursor: 'pointer',
  textAlign: 'left',
  // Style for the active route
  '&[data-active="true"]': {
    color: 'primary', // Use theme token
  },
  _hover: {
    bgColor: 'hover', // Use theme hover background token
    color: 'primary', // Use theme token
  },
  _focusVisible: { // Keyboard focus style
    outline: '2px solid',
    outlineColor: 'primary',
    outlineOffset: '-2px', // Inset outline slightly
    bgColor: 'hover', // Keep focus consistent with hover
    color: 'primary',
  },
});

// Inner container for icon and label within a mobile nav item
export const mobileNavItemContentStyle = css({
  display: 'flex',
  alignItems: 'center',
  gap: '3', // Use theme spacing token (e.g., 0.75rem)
});

// Style for the dropdown arrow icon in a mobile nav item
export const mobileNavItemArrowStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

// Container for the mobile submenu items (appears below parent item)
export const mobileSubmenuContainerStyle = css({
  display: 'flex',
  flexDirection: 'column', // Stack submenu items vertically
  width: '100%',
  gap: '0', // Remove gap, borders handle separation
  padding: '2 0 2 8', // Use theme tokens (py: 0.5rem, pl: 2rem)
  bgColor: 'color-mix(in srgb, token(colors.background) 95%, token(colors.border))', // Subtle mix with border color
});

// Base style for an individual mobile submenu item (button/link)
export const mobileSubmenuItemBaseStyle = css({
  display: 'flex',
  alignItems: 'center',
  padding: '2.5 4 2.5 4', // Use theme tokens (py: ~10px, px: 1rem)
  fontSize: 'sm', // Use theme token for smaller font size
  color: 'text', // Use theme token
  opacity: 0.95, // Slightly less prominent than main items
  border: 'none', // Remove default borders
  borderBottom: '2px solid', // Add divider below each sub-item
  borderColor: 'primary', // Use a softer/more subtle border color token (or primary if preferred)
  bgColor: 'transparent',
  width: '100%',
  minHeight: 'auto', // Remove fixed minHeight
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease, color 0.2s ease',
  // Style for the active submenu route
  '&[data-active="true"]': {
    bgColor: 'color-mix(in srgb, token(colors.primary) 15%, transparent)', // Mix primary with transparent
    color: 'primary', // Use theme token
  },
  _hover: {
    bgColor: 'hover', // Use theme hover background token
    color: 'primary', // Use theme token
  },
  _focusVisible: { // Keyboard focus style
    outline: '2px solid',
    outlineColor: 'primary',
    outlineOffset: '-2px', // Inset outline
    bgColor: 'hover', // Consistent with hover
    color: 'primary',
  },
});

// Style for the icon within a mobile submenu item
export const mobileSubmenuItemIconStyle = css({
  display: 'inline-flex', // Use inline-flex to align with text
  alignItems: 'center',
  justifyContent: 'center',
  width: '3.5', // Use theme size token (e.g., 14px)
  height: '3.5', // Use theme size token
  color: 'primary', // Use theme token
  opacity: 0.8,
  flexShrink: 0, // Prevent icon from shrinking
  marginRight: '2', // Add space between icon and label (theme token 0.5rem)
});

// Style for the label text within a mobile submenu item
export const mobileSubmenuItemLabelStyle = css({
  letterSpacing: '0.05em',
  margin: 0,
});

// --- NEW: Style for the Mobile Action Items Container ---
export const mobileMenuActionsContainerStyle = css({
  padding: '4', // Use theme spacing token (e.g., 1rem) for padding around the actions
  marginTop: 'auto', // Pushes this container to the bottom if mobileMenuContainerStyle is flex column
  paddingTop: '4', // Ensure padding above even when pushed to bottom
  borderTop: '1px solid', // Separator line above the actions
  borderColor: 'border', // Use theme border color token
  display: 'flex',
  flexDirection: 'row', // Arrange action items horizontally
  justifyContent: 'center', // Center the action items horizontally
  alignItems: 'center', // Vertically center items if they have different heights
  gap: '4', // Use theme spacing token for gap between action items (e.g., 1rem)
  flexShrink: 0, // Prevent this container from shrinking
  bgColor: 'transparent', // Ensure no background inherited
});