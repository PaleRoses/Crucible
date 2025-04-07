import { css } from '../../../../styled-system/css'; // Ensure this path is correct

// --- Panda CSS Style Definitions (Desktop) ---

// Base style for the entire navigation bar container (Shared but primarily desktop layout)
export const navBarBaseStyle = css({
  position: 'fixed', // Stick to the top
  top: 0,
  left: 0,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center', // Center the content container by default
  bgColor: 'background', // Use theme token for background color
  transition: 'transform 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease', // Smooth transitions for hiding/showing
  transform: 'translateY(0)', // Default position
  opacity: 1, // Default visibility
  boxShadow: 'shadow', // Use theme token for shadow
  borderBottom: '1px solid', // Thin bottom border for the whole bar
  borderColor: 'primary', // Use theme token for primary color
  '&[data-visible="false"]': {
    transform: 'translateY(-100%)',
    opacity: 0,
    boxShadow: 'none',
  },
  // height, zIndex, backdropFilter are applied via inline style based on props
});

// Style for the inner content container (limits width, centers items) (Shared)
export const navBarContentStyle = css({
  display: 'flex', // Use Flexbox to arrange logo, nav items, and actions container
  alignItems: 'center', // Vertically center items in the navbar
  width: '100%',
  margin: '0 auto', // Center the container horizontally if maxWidth is applied
  position: 'relative', // Needed for potential absolute positioning needs later
  // maxWidth, padding are handled by inline style based on props
});

// Style for the logo container (Shared, but primarily desktop layout)
export const navBarLogoStyle = css({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0, // Prevent logo from shrinking
});

// Base style for the logo link itself (interactive element) (Shared)
export const logoLinkBaseStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'primary',
  cursor: 'pointer',
  position: 'relative',
  padding: '2',
  borderRadius: 'full',
  transition: 'background 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
  outline: 'none',
  _hover: {
    bgColor: 'glow',
    boxShadow: '0 0 18px 8px token(colors.glow)',
    transform: 'scale(1.1)',
  },
  _focusVisible: {
    bgColor: 'glow',
    boxShadow: '0 0 18px 8px token(colors.glow)',
    transform: 'scale(1.1)',
    outline: 'none',
  },
  _active: {
    bgColor: 'transparent',
    boxShadow: 'none',
    transform: 'scale(1)',
    transition: 'all 0.1s ease',
  },
});

// Style for the tooltip shown on logo hover/focus (Desktop specific)
export const logoTooltipStyle = css({
  position: 'absolute',
  bottom: '-35px',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'none',
  zIndex: 'tooltip',
  pointerEvents: 'none',
  bgColor: 'background',
  backdropFilter: 'blur(5px)',
  color: 'text',
  padding: '1.5 3',
  borderRadius: 'md',
  fontSize: 'tooltip',
  fontWeight: 'normal',
  letterSpacing: '0.05em',
  whiteSpace: 'nowrap',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  border: '1px solid',
  borderColor: 'border',
  '[data-group]:where(:hover, :focus-visible) &': {
    display: 'block',
  },
  '[data-group]:active &': {
    display: 'none',
  },
  _before: {
    content: '""',
    position: 'absolute',
    top: '-5px',
    left: '50%',
    transform: 'translateX(-50%) rotate(45deg)',
    width: '8px',
    height: '8px',
    bgColor: 'background',
    borderTop: '1px solid',
    borderLeft: '1px solid',
    borderColor: 'border',
  },
});

// Container for the desktop navigation items (hidden on mobile)
export const navBarItemsContainerStyle = css({
  display: 'flex',
  alignItems: 'center',
  flexGrow: 1, // <-- ADDED: Allow this container to grow and fill space
  justifyContent: 'center', // Center the items within this now larger container
  opacity: 1,
  // gap prop applied via inline style
  '@media (max-width: 768px)': {
    display: 'none',
  },
});

// Wrapper for each individual desktop nav item
export const desktopNavItemWrapperStyle = css({
  position: 'relative',
});

// Base style for a desktop navigation item (button or link)
export const desktopNavItemBaseStyle = css({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  fontFamily: 'heading',
  fontSize: 'desktopNavItem',
  fontWeight: 'normal',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'text',
  padding: '2 3',
  border: 'none',
  bgColor: 'transparent',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&[data-active="true"], &[data-item-active="true"]': {
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

// Inner container for icon and label within a desktop nav item
export const desktopNavItemContentStyle = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
});

// Style for the icon within a desktop nav item
export const desktopNavItemIconStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.1s cubic-bezier(0.4, 0, 1, 1)',
});

// Style for the text label within a desktop nav item
export const desktopNavItemLabelStyle = css({
  textTransform: 'uppercase',
  color: 'inherit',
  transition: 'all 0.1s cubic-bezier(0.4, 0, 1, 1)',
});

// Style for the dropdown arrow icon (if item has submenu)
export const desktopNavItemArrowStyle = css({
  display: 'flex',
  marginTop: 'px',
  color: 'currentColor',
  '[data-item-active="true"] &': {
    color: 'primary',
  },
});

// Root container for the global desktop submenu
export const globalSubmenuRootStyle = css({
  position: 'fixed',
  left: 0,
  width: '100%',
  zIndex: 'dropdown',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  pointerEvents: 'none',
  paddingTop: '0',
  // top applied via inline style
});

// The actual visible container for the desktop submenu content
export const globalSubmenuContainerStyle = css({
  background: 'background',
  borderRadius: '12px',
  overflow: 'hidden',
  borderLeft: '3px solid',
  borderColor: 'primary',
  pointerEvents: 'auto',
  willChange: 'transform, opacity',
  margin: '0 auto',
  transformOrigin: 'top center',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 0 7px token(colors.text)',
  width: 'auto',
  maxWidth: '90vw',
  display: 'block',
});

// Grid layout for the submenu items and optional header
export const globalSubmenuGridStyle = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'stretch',
  justifyContent: 'center',
  width: 'auto',
});

// Style for the optional header section within the desktop submenu
export const globalSubmenuHeaderStyle = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  padding: '5',
  margin: '0',
  color: 'text',
  bgColor: 'background',
  borderRadius: '0',
  border: 'none',
  width: '200px',
  height: '200px',
  flexShrink: 0,
});

// Style for the title within the submenu header
export const globalSubmenuTitleStyle = css({
  fontFamily: 'heading',
  color: 'primary',
  fontSize: '1.1rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: '2',
  textAlign: 'left',
  fontWeight: 'thin',
});

// Style for the description within the submenu header
export const globalSubmenuDescriptionStyle = css({
  fontSize: 'desktopSubmenuDescription',
  color: 'text',
  opacity: 0.8,
  lineHeight: 1.4,
});

// Base style for an individual item within the desktop submenu
export const submenuItemBaseStyle = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-end',
  margin: '0',
  paddingBottom: '3',
  color: 'text',
  bgColor: 'transparent',
  border: 'none',
  borderLeft: '1px solid',
  borderColor: 'primary',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  width: '200px',
  height: '200px',
  position: 'relative',
  flexShrink: 0,
  _hover: {
    bgColor: 'glow',
    color: 'primary',
  },
  _focusVisible: {
    outline: '1px solid',
    outlineColor: 'primary',
    outlineOffset: '1px',
    bgColor: 'glow',
    color: 'primary',
  },
});

// Container for the text content within a submenu item
export const submenuItemContainerStyle = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-end',
  width: '100%',
  height: 'auto',
  position: 'relative',
  textAlign: 'left',
  paddingLeft: '3',
  paddingRight: '3',
});

// Style for the icon within a desktop submenu item
export const submenuItemIconStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'primary',
  width: '6',
  height: '6',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  opacity: 0.8,
});

// Style for the label text within a desktop submenu item
export const submenuItemLabelStyle = css({
  fontFamily: 'heading',
  fontSize: '0.9rem',
  fontWeight: 'thin',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'inherit',
  transition: 'color 0.2s ease',
});

// Style for the description text within a desktop submenu item
export const submenuItemDescriptionStyle = css({
  fontSize: '0.65rem',
  color: 'rgba(230, 230, 230, 0.7)',
  opacity: 0.8,
  lineHeight: 1.4,
  maxWidth: '180px',
  textAlign: 'left',
  fontWeight: 'thin',
  margin: '0',
  padding: '0',
});

// Style for the Action Items Container
export const navBarActionsContainerStyle = css({
  display: 'flex',
  alignItems: 'center',
  gap: '3',
  marginLeft: 'auto', // Pushes this container to the far right
  flexShrink: 0, // Prevent this container from shrinking
});
