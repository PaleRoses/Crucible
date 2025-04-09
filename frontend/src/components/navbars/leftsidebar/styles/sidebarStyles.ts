import { css } from '../../../../../styled-system/css'; // Adjust the import path as needed

// Define common variables or tokens if needed, e.g., transition duration
const transitionDuration = 300; // ms
const headerTopOffset = '50px'; // Example value, ensure consistency

// ========================================
// Mobile Style Definitions
// ========================================
export const mobileStyles = {
  // Dropdown container
  dropdown: css({
    position: 'fixed',
    top: headerTopOffset,
    left: 0,
    width: '100%',
    height: `calc(100vh - ${headerTopOffset})`,
    maxHeight: `calc(100vh - ${headerTopOffset})`,
    bgColor: 'background', // Use theme tokens
    zIndex: 101,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'lg', // Use theme tokens
    borderRight: '1px solid',
    borderColor: 'border.default', // Use theme tokens
    transform: 'translateX(-100%)',
    opacity: 0.95,
    visibility: 'hidden',
    transition: `transform ${transitionDuration}ms ease, opacity ${transitionDuration}ms ease, visibility ${transitionDuration}ms ease`,
    '&[data-open="true"]': {
      transform: 'translateX(0)',
      opacity: 1,
      visibility: 'visible',
    },
    scrollbarWidth: 'thin',
    '&::-webkit-scrollbar': { width: '6px' },
    '&::-webkit-scrollbar-thumb': { backgroundColor: 'border.subtle', borderRadius: '3px' } // Use theme tokens
  }),

  // Overlay background
  overlay: css({
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Consider theme token for overlay color
    transition: `opacity ${transitionDuration}ms ease, visibility ${transitionDuration}ms ease`,
    visibility: 'hidden',
    opacity: 0,
    top: headerTopOffset,
    '&[data-open="true"]': {
      visibility: 'visible',
      opacity: 1,
    }
  }),

  // Header section
  header: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 'spacing.4', // Use theme tokens
    paddingTop: 'spacing.4', // Use theme tokens
    bgColor: 'background', // Use theme tokens
    borderBottom: '1px solid',
    borderColor: 'border.default', // Use theme tokens
    position: 'relative',
    flexShrink: 0,
  }),

  // Title text
  title: css({
    fontFamily: 'heading', // Use theme tokens
    color: 'primary', // Use theme tokens
    fontSize: 'lg', // Use theme tokens
    fontWeight: 'thin', // Use theme tokens
    textAlign: 'center',
    margin: 0,
  }),

  // Navigation container
  navContainer: css({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    padding: '0',
    margin: '0',
    overflowY: 'auto',
    flexGrow: 1,
    WebkitOverflowScrolling: 'touch',
  }),

  // Navigation item
  navItem: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 'spacing.3 spacing.4', // Use theme tokens
    fontFamily: 'body', // Use theme tokens
    fontSize: 'md', // Use theme tokens
    fontWeight: 'medium', // Use theme tokens
    color: 'text.secondary', // Use theme tokens
    bgColor: 'transparent',
    border: 'none',
    borderBottom: '1px solid',
    borderColor: 'border', // Use theme tokens
    cursor: 'pointer',
    textAlign: 'left',
    position: 'relative',
    zIndex: 2,
    touchAction: 'manipulation',
    transition: 'background-color 0.2s ease, color 0.2s ease',
    '&[data-active="true"]': {
      color: 'accent.text', // Use theme tokens
      fontWeight: 'semibold', // Use theme tokens
    },
    _hover: {
      bgColor: 'background.hover', // Use theme tokens
      color: 'text.primary', // Use theme tokens
    },
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'accent.solid', // Use theme tokens
      outlineOffset: '-2px',
      bgColor: 'background.hover', // Use theme tokens
      color: 'text.primary', // Use theme tokens
    }
  }),

  // Content wrapper for nav item
  navItemContent: css({
    display: 'flex',
    alignItems: 'center',
    gap: 'spacing.3', // Use theme tokens
    flexGrow: 1,
    minWidth: 0,
    pointerEvents: 'auto',
    '& > span': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }
  }),

  // Expand icon for collapsible sections
  expandIcon: css({
    transition: 'transform 0.2s ease',
    zIndex: 3,
    pointerEvents: 'auto',
    flexShrink: 0,
    color: 'text.subtle', // Use theme tokens
    '&[data-expanded="true"]': {
      transform: 'rotate(180deg)',
    },
    '& > svg': {
      width: '1rem',
      height: '1rem',
    }
  }),

  // Container for nested items
  nestedItemsContainer: css({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: '0',
    // Example using token function if available in your setup
    padding: 'spacing.1 0 spacing.1 calc(token(spacing.4) + token(spacing.3) + 1rem)', // Adjust token usage based on your setup
    bgColor: 'background.subtle', // Use theme tokens
    borderBottom: '1px solid',
    borderColor: 'border.subtle', // Use theme tokens
  }),

  // Nested item
  nestedItem: css({
    display: 'flex',
    alignItems: 'center',
    padding: 'spacing.2 spacing.4', // Use theme tokens
    fontSize: 'sm', // Use theme tokens
    fontWeight: 'regular', // Use theme tokens
    color: 'text.secondary', // Use theme tokens
    opacity: 0.95,
    border: 'none',
    bgColor: 'transparent',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
    position: 'relative',
    zIndex: 2,
    transition: 'background-color 0.2s ease, color 0.2s ease',
    '&[data-active="true"]': {
      color: 'accent.text', // Use theme tokens
      fontWeight: 'medium', // Use theme tokens
    },
    _hover: {
      bgColor: 'background.hover', // Use theme tokens
      color: 'text.primary', // Use theme tokens
    },
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'accent.solid', // Use theme tokens
      outlineOffset: '-2px',
      bgColor: 'background.hover', // Use theme tokens
      color: 'text.primary', // Use theme tokens
    },
    '& > span': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }
  }),

  // Footer section
  footer: css({
    padding: 'spacing.4', // Use theme tokens
    marginTop: 'auto',
    paddingTop: 'spacing.4', // Use theme tokens
    borderTop: '1px solid',
    borderColor: 'border.default', // Use theme tokens
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 'spacing.4', // Use theme tokens
    flexShrink: 0,
    bgColor: 'transparent', // Use theme tokens
  }),
};


// ========================================
// Desktop Style Definitions (Placeholder)
// ========================================
// Add specific desktop styles here as needed.
// For now, it's an empty object, but you can populate it
// similarly to mobileStyles if desktop-specific overrides
// or unique styles are required for DesktopSidebarLayout.
export const desktopStyles = {
  // Example: Maybe a different background for desktop?
  // container: css({
  //   bgColor: 'neutral.100', // Example token
  // }),
  // Add other desktop-specific styles...
};
