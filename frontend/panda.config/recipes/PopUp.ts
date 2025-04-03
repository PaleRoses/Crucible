// src/styled-system/recipes/popupMenu.ts

// Import cva from your generated styled-system directory
import { cva } from '../../styled-system/css';

/**
 * Panda CSS Recipe for a Pop-up Menu Container.
 *
 * Provides base styles and variants for size and open/closed state.
 * Assumes the consuming component will handle absolute positioning
 * relative to its trigger element.
 */
export const popupMenu = cva({
  // Base styles applied to the menu container
  base: {
    position: 'absolute', // Positioned relative to the nearest positioned ancestor
    display: 'flex',      // Use flex for internal layout control if needed
    flexDirection: 'column', // Stack menu items vertically
    minWidth: '150px',    // Default minimum width
    padding: '2',         // Default padding (maps to theme.spacing.2)
    bg: 'backgroundAlt',  // Background color from semantic tokens
    border: '1px solid',  // Border style
    borderColor: 'border',// Border color from semantic tokens
    borderRadius: 'md',   // Border radius from theme.radii
    boxShadow: 'md',      // Shadow from semantic tokens
    zIndex: 'dropdown',   // Ensure it appears above most content (theme.zIndex.dropdown)

    // --- Animation Setup ---
    opacity: 0,                  // Start hidden
    transformOrigin: 'top left', // Set transform origin (can be adjusted based on placement)
    transform: 'scale(0.95) translateY(-5px)', // Start slightly scaled down and moved up
    pointerEvents: 'none',       // Prevent interaction when hidden
    transitionProperty: 'opacity, transform', // Animate opacity and transform
    transitionDuration: 'fast', // Use 'fast' duration from theme.durations
    transitionTimingFunction: 'out', // Use 'out' easing from theme.easings
  },

  // Define variants for different states and appearances
  variants: {
    // Controls the visibility and entry/exit animation
    isOpen: {
      true: {
        opacity: 1,                 // Fully visible
        transform: 'scale(1) translateY(0)', // Scale to normal size and position
        pointerEvents: 'auto',      // Allow interaction when open
      },
      // No 'false' needed as base styles handle the closed state
    },

    // Controls the overall size (padding, font size, min-width)
    size: {
      sm: {
        minWidth: '120px',
        padding: '1',
        fontSize: 'sm', // Assumes 'sm' fontSize token exists
      },
      md: {
        // Base styles already cover 'md' defaults, but explicit is fine
        minWidth: '150px',
        padding: '2',
        fontSize: 'base', // Assumes 'base' fontSize token exists
      },
      lg: {
        minWidth: '180px',
        padding: '3',
        fontSize: 'lg', // Assumes 'lg' fontSize token exists
      },
    },
    // Potential future variant: 'placement' could adjust transformOrigin
    // placement: {
    //   'top-right': { transformOrigin: 'top right' },
    //   'bottom-left': { transformOrigin: 'bottom left' },
    //   // etc.
    // }
  },

  // Define the default variants applied if not specified
  defaultVariants: {
    isOpen: false,
    size: 'md',
  },
});

// Example Usage (in a React component, assuming 'css' function is imported):
// import { css } from '../styled-system/css';
// import { popupMenu } from '../styled-system/recipes';
//
// function MyMenu({ isOpen }) {
//   const menuStyles = popupMenu({ isOpen: isOpen, size: 'sm' });
//   return (
//     <div className={css(menuStyles)} style={{ top: '100%', left: 0 }}> {/* Example positioning */}
//       {/* Menu items go here */}
//       <a>Item 1</a>
//       <a>Item 2</a>
//     </div>
//   );
// }
