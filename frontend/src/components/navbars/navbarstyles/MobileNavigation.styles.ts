import { css } from '../../../../styled-system/css'; // Ensure this path is correct

// --- Panda CSS Style Definitions (Mobile) ---

// Style for the mobile menu toggle button (hamburger/close icon)
export const mobileButtonStyle = css({
  position: 'fixed', // Keep in viewport
  top: '2.5', // Use theme spacing token (e.g., 10px)
  left: '2.5', // Use theme spacing token
  width: '45px', // Fixed size
  height: '45px', // Fixed size
  display: 'flex', // Use flex for centering icon
  alignItems: 'center',
  justifyContent: 'center',
  bgColor: 'transparent', // No background
  color: 'text', // Use theme token
  border: 'none',
  borderRadius: 'md', // Use theme token (e.g., 4px)
  fontSize: 'xl', // Use theme token (e.g., 1.5rem for icon size)
  padding: '2', // Use theme spacing token (e.g., 0.5rem)
  cursor: 'pointer',
  zIndex: 'popover', // Use theme z-index token (e.g., 201, above navbar but below modal)
  opacity: 1,
  transform: 'translateY(0)',
  transition: 'opacity 0.3s ease, transform 0.3s ease, color 0.3s ease',
  // Change color when menu is open
  '&[data-state="open"]': {
    color: 'primary', // Use theme token
  },
  // Hide button if navbar is hidden (via hide-on-scroll)
  '&[data-visible="false"]': {
    display: 'none', // Use display:none instead of opacity/transform for clarity
    opacity: 0,
    transform: 'translateY(-100%)',
  },
  _hover: {
    color: 'primary',
  },
  _focusVisible: { // Keyboard focus style
    outline: '2px solid',
    outlineColor: 'primary',
    outlineOffset: '2px',
  },
});

// Style for the main mobile menu container (full screen overlay)
export const mobileMenuContainerStyle = css({
  position: 'fixed', // Cover viewport
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  bgColor: 'background', // Use theme token
  zIndex: 'modal', // Use theme z-index token (e.g., 200, highest)
  overflowY: 'hidden', // Prevent scrolling of the main container
  overflowX: 'hidden',
  display: 'flex',
  flexDirection: 'column', // Stack header and items vertically
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)', // Or use theme shadow token
  backdropFilter: 'blur(8px)', // Background blur effect
});

// Style for the header section within the mobile menu (Logo, Title, Optional Header Text)
export const mobileMenuHeaderStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column', // Center items vertically in the header
  width: '100%',
  padding: '4', // Use theme spacing token (e.g., 1rem)
  marginBottom: '0', // Reset margin, spacing handled by padding/borders
  position: 'sticky', // Keep header visible when scrolling items
  top: 0, // Stick to the top of the menu container
  bgColor: 'background', // Ensure background for sticky behavior
  zIndex: 'sticky', // Use theme z-index token (e.g., 10)
  borderBottom: '0px solid', // Add a border below the header area
  borderColor: 'primary', // Use theme's primary color token for emphasis
  flexShrink: 0, // Prevent header from shrinking if content overflows
});

// Container specifically for the logo within the mobile menu header
export const mobileMenuLogoContainerStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '3', // Add space below logo if title/header follows (theme token 0.75rem)
});

// Style for the logo link within the mobile menu header
export const mobileMenuLogoLinkStyle = css({
  display: 'flex',
  alignItems: 'center',
  color: 'primary', // Use theme token
  cursor: 'pointer',
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
  // marginBottom applied dynamically via inline style if mobileHeader exists
});

// Style for the main title text in the mobile header
export const mobileMenuTitleTextStyle = css({
  fontFamily: 'heading', // Use theme token
  color: 'primary', // Use theme token
  fontSize: '1.4rem', // Or use theme token
  paddingBottom: '2', // Add space below title text (theme token 0.5rem)
  fontWeight: 'light', // Use theme token or 'normal'
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