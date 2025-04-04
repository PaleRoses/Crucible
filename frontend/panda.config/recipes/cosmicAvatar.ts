//panda.config//recipes/cosmicAvatar.ts

import { defineRecipe } from '@pandacss/dev';

/**
 * ====================================================================================
 * COSMIC AVATAR - A sophisticated user avatar component with lunar-inspired styling
 * ====================================================================================
 * 
 * IMPORT INTO YOUR PANDA CONFIG:
 * 
 * import { 
 *   cosmicAvatar,
 *   cosmicAvatarStatus,
 *   cosmicAvatarBadge,
 *   cosmicAvatarGroup,
 *   cosmicAvatarComponents
 * } from './panda.config/recipes/cosmicAvatar';
 * 
 * Then add to your config:
 * 
 * export default defineConfig({
 *   // ...other config
 *   theme: {
 *     extend: {
 *       recipes: {
 *         // Method 1: Add individual components
 *         Avatar: cosmicAvatar,
 *         AvatarStatus: cosmicAvatarStatus,
 *         AvatarBadge: cosmicAvatarBadge,
 *         AvatarGroup: cosmicAvatarGroup,
 *         
 *         // Method 2: Or use the combined object
 *         // This adds all components with their original naming
 *         ...cosmicAvatarComponents
 *       }
 *     }
 *   }
 * })
 * 
 * Features:
 * - Multiple shape variants (circle, square, rounded)
 * - Size options from extra small to extra large
 * - Visual style variants including cosmic effects
 * - Status indicator for online/offline/away states
 * - Initials fallback with automatic styling
 * - Border and glow effects matching theme
 * - Optional notification badge
 */

// Main avatar container
export const cosmicAvatar = defineRecipe({
  className: 'cosmic-avatar',
  description: 'A luxurious, moon-inspired avatar component with cosmic styling',
  base: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    userSelect: 'none',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'border',
    backgroundColor: 'backgroundAlt',
    color: 'primary',
    fontFamily: 'heading',
    fontWeight: '300',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    transition: 'all 0.3s ease',
    
    // Create stacking context for the inner elements
    zIndex: '1',
    
    // Container for the image or text
    '& .avatar-content': {
      position: 'absolute',
      inset: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      zIndex: '2',
      // Apply for both image and text inside
      '& img': {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center',
      },
    },
    
    // Image loaded state
    '&[data-image-loaded="true"] .avatar-initials': {
      opacity: '0',
    },
    
    // Hover effect
    _hover: {
      borderColor: 'color-mix(in srgb, var(--color-border) 50%, var(--color-primary))',
    },
    
    // Interactive styling (for clickable avatars)
    '&[data-interactive="true"]': {
      cursor: 'pointer',
      _hover: {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      },
      _active: {
        transform: 'translateY(0)',
      },
    },
  },
  
  variants: {
    // Shape variants
    shape: {
      // Perfect circle for standard avatars
      circle: {
        borderRadius: 'full',
      },
      // Square with slight rounding
      square: {
        borderRadius: 'md',
      },
      // More pronounced rounding
      rounded: {
        borderRadius: 'xl',
      },
    },
    
    // Size variants
    size: {
      xs: {
        width: '24px',
        height: '24px',
        fontSize: '10px',
        '& .avatar-status': {
          width: '8px',
          height: '8px',
          right: '0px',
          bottom: '0px',
          borderWidth: '1px',
        },
        '& .avatar-badge': {
          width: '12px',
          height: '12px',
          fontSize: '8px',
          right: '-2px',
          top: '-2px',
        },
      },
      sm: {
        width: '32px',
        height: '32px',
        fontSize: '12px',
        '& .avatar-status': {
          width: '10px',
          height: '10px',
          right: '0px',
          bottom: '0px',
          borderWidth: '1.5px',
        },
        '& .avatar-badge': {
          width: '14px',
          height: '14px',
          fontSize: '9px',
          right: '-2px',
          top: '-2px',
        },
      },
      md: {
        width: '40px',
        height: '40px',
        fontSize: '14px',
        '& .avatar-status': {
          width: '12px',
          height: '12px',
          right: '0px',
          bottom: '0px',
          borderWidth: '1.5px',
        },
        '& .avatar-badge': {
          width: '16px',
          height: '16px',
          fontSize: '10px',
          right: '-3px',
          top: '-3px',
        },
      },
      lg: {
        width: '56px',
        height: '56px',
        fontSize: '18px',
        '& .avatar-status': {
          width: '14px',
          height: '14px',
          right: '1px',
          bottom: '1px',
          borderWidth: '2px',
        },
        '& .avatar-badge': {
          width: '20px',
          height: '20px',
          fontSize: '11px',
          right: '-3px',
          top: '-3px',
        },
      },
      xl: {
        width: '96px',
        height: '96px',
        fontSize: '32px',
        '& .avatar-status': {
          width: '20px',
          height: '20px',
          right: '3px',
          bottom: '3px',
          borderWidth: '2.5px',
        },
        '& .avatar-badge': {
          width: '24px',
          height: '24px',
          fontSize: '12px',
          right: '-2px',
          top: '-2px',
        },
      },
    },
    
    // Visual style variants
    variant: {
      // Standard avatar
      standard: {
        backgroundColor: 'backgroundAlt',
        borderColor: 'border',
      },
      
      // Subtle style with minimal borders
      subtle: {
        backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 80%, var(--color-primary))',
        borderColor: 'transparent',
        _hover: {
          borderColor: 'color-mix(in srgb, var(--color-border) 50%, var(--color-primary))',
        },
      },
      
      // Outline style with more pronounced border
      outline: {
        backgroundColor: 'transparent',
        borderColor: 'primary',
        borderWidth: '2px',
        _hover: {
          boxShadow: '0 0 0 1px var(--color-primary)',
        },
      },
      
      // Solid fill with primary color
      solid: {
        backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, var(--color-backgroundAlt))',
        borderColor: 'color-mix(in srgb, var(--color-border) 70%, var(--color-primary))',
        color: 'primary',
      },
      
      // Cosmic style with glow effects
      cosmic: {
        backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 95%, var(--color-primary))',
        borderColor: 'color-mix(in srgb, var(--color-border) 70%, var(--color-primary))',
        boxShadow: '0 0 10px var(--color-glow)',
        
        // Star-like background effect
        _before: {
          content: '""',
          position: 'absolute',
          inset: '0',
          backgroundImage: `
            radial-gradient(circle, var(--color-cosmic1) 1px, transparent 1px), 
            radial-gradient(circle, var(--color-cosmic2) 1px, transparent 1px)
          `,
          backgroundSize: '14px 14px, 20px 20px',
          backgroundPosition: '0 0, 7px 7px',
          opacity: '0.03',
          zIndex: '1',
          pointerEvents: 'none',
        },
        
        _hover: {
          boxShadow: '0 0 15px var(--color-glow)',
          borderColor: 'color-mix(in srgb, var(--color-border) 30%, var(--color-primary))',
          _before: {
            opacity: '0.07',
          },
        },
        
        '&[data-interactive="true"]': {
          _hover: {
            transform: 'translateY(-3px)',
            boxShadow: '0 5px 15px var(--color-glow)',
          },
        },
      },
    },
    
    // Status indicator variants (online, busy, away, offline, etc.)
    status: {
      none: {},
      online: {
        '& .avatar-status': {
          backgroundColor: 'green.500',
        },
      },
      busy: {
        '& .avatar-status': {
          backgroundColor: 'red.500',
        },
      },
      away: {
        '& .avatar-status': {
          backgroundColor: 'yellow.500',
        },
      },
      offline: {
        '& .avatar-status': {
          backgroundColor: 'gray.400',
        },
      },
    },
    
    // Badge visibility
    showBadge: {
      true: {
        '& .avatar-badge': {
          display: 'flex',
        },
      },
      false: {
        '& .avatar-badge': {
          display: 'none',
        },
      },
    },
  },
  
  // Compound variants for special combinations
  compoundVariants: [
    // Cosmic variant with online status gets special glow matching status
    {
      variant: 'cosmic',
      status: 'online',
      css: {
        '& .avatar-status': {
          boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
        },
      },
    },
    // Cosmic variant with busy status gets special glow matching status
    {
      variant: 'cosmic',
      status: 'busy',
      css: {
        '& .avatar-status': {
          boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
        },
      },
    },
  ],
  
  // Default variants
  defaultVariants: {
    shape: 'circle',
    size: 'md',
    variant: 'standard',
    status: 'none',
    showBadge: false,
  },
});

// Status indicator styling
export const cosmicAvatarStatus = defineRecipe({
  className: 'cosmic-avatar-status',
  description: 'Status indicator for the avatar component',
  base: {
    position: 'absolute',
    borderRadius: 'full',
    zIndex: '3',
    borderStyle: 'solid',
    borderColor: 'backgroundAlt',
    boxSizing: 'content-box',
    
    // Default size and position are handled in size variants
  },
});

// Badge styling
export const cosmicAvatarBadge = defineRecipe({
  className: 'cosmic-avatar-badge',
  description: 'Notification badge for the avatar component',
  base: {
    position: 'absolute',
    borderRadius: 'full',
    zIndex: '3',
    backgroundColor: 'red.500',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    
    // Default size and position are handled in size variants
  },
  
  variants: {
    variant: {
      danger: {
        backgroundColor: 'red.500',
      },
      warning: {
        backgroundColor: 'yellow.500',
        color: 'gray.900',
      },
      success: {
        backgroundColor: 'green.500',
      },
      info: {
        backgroundColor: 'blue.500',
      },
      primary: {
        backgroundColor: 'primary',
      },
    },
  },
  
  defaultVariants: {
    variant: 'danger',
  },
});

// Avatar group (for overlapping avatars)
export const cosmicAvatarGroup = defineRecipe({
  className: 'cosmic-avatar-group',
  description: 'Group of avatars with overlapping effect',
  base: {
    display: 'flex',
    flexDirection: 'row',
    
    // Apply negative margin to create overlap
    '& > *:not(:first-child)': {
      marginLeft: '-0.75rem',
    },
    
    // Add subtle border to create separation
    '& > *': {
      borderWidth: '2px',
      borderColor: 'backgroundAlt',
      boxShadow: '0 0 0 1px var(--color-border)',
    },
    
    // Add hover effect for each avatar in the group
    '& > *:hover': {
      transform: 'translateY(-4px)',
      zIndex: '10',
    },
  },
  
  variants: {
    spacing: {
      tight: {
        '& > *:not(:first-child)': {
          marginLeft: '-1rem',
        },
      },
      normal: {
        '& > *:not(:first-child)': {
          marginLeft: '-0.75rem',
        },
      },
      loose: {
        '& > *:not(:first-child)': {
          marginLeft: '-0.5rem',
        },
      },
    },
  },
  
  defaultVariants: {
    spacing: 'normal',
  },
});

/**
 * Bulk export of all cosmic avatar components
 */
export const cosmicAvatarComponents = {
  avatar: cosmicAvatar,
  status: cosmicAvatarStatus,
  badge: cosmicAvatarBadge,
  group: cosmicAvatarGroup
};

/**
 * USAGE EXAMPLE (in a React component):
 * ====================================
 */

/**
 * // First, import the necessary components
 * import { 
 *   cosmicAvatar, 
 *   cosmicAvatarStatus, 
 *   cosmicAvatarBadge,
 *   cosmicAvatarGroup
 * } from '../panda.config/recipes/cosmicAvatar';
 * import { useState, useEffect } from 'react';
 * 
 * // Define the props interface for our component
 * interface AvatarProps {
 *   src?: string;               // Image source URL
 *   alt?: string;               // Alt text for the image
 *   initials?: string;          // Initials to display when no image
 *   size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';  // Size variant
 *   shape?: 'circle' | 'square' | 'rounded';  // Shape variant
 *   variant?: 'standard' | 'subtle' | 'outline' | 'solid' | 'cosmic';  // Visual style
 *   status?: 'none' | 'online' | 'busy' | 'away' | 'offline';  // Status indicator
 *   badgeContent?: string | number;  // Content to show in the badge
 *   badgeVariant?: 'danger' | 'warning' | 'success' | 'info' | 'primary';  // Badge style
 *   interactive?: boolean;      // Whether the avatar is clickable
 *   onClick?: () => void;       // Click handler for interactive avatars
 * }
 * 
 * // Create the Avatar component
 * function CosmicAvatarComponent({
 *   src,
 *   alt = '',
 *   initials,
 *   size = 'md',
 *   shape = 'circle',
 *   variant = 'standard',
 *   status = 'none',
 *   badgeContent,
 *   badgeVariant = 'danger',
 *   interactive = false,
 *   onClick,
 * }: AvatarProps) {
 *   // State to track if the image has loaded
 *   const [imageLoaded, setImageLoaded] = useState(false);
 *   const [imageError, setImageError] = useState(false);
 *   
 *   // Get styles from the recipes
 *   const avatarStyles = cosmicAvatar({
 *     size,
 *     shape,
 *     variant,
 *     status,
 *     showBadge: !!badgeContent,
 *   });
 *   
 *   const statusStyles = cosmicAvatarStatus({});
 *   const badgeStyles = cosmicAvatarBadge({ variant: badgeVariant });
 *   
 *   // Handle image load success
 *   const handleImageLoad = () => {
 *     setImageLoaded(true);
 *     setImageError(false);
 *   };
 *   
 *   // Handle image load error
 *   const handleImageError = () => {
 *     setImageLoaded(false);
 *     setImageError(true);
 *   };
 *   
 *   // Generate initials if not provided
 *   const getInitials = () => {
 *     if (initials) return initials.substring(0, 2);
 *     if (alt) {
 *       // Get first letter of each word in alt text
 *       return alt
 *         .split(' ')
 *         .map(word => word[0])
 *         .join('')
 *         .substring(0, 2);
 *     }
 *     return '?';
 *   };
 *   
 *   // Reset image state if src changes
 *   useEffect(() => {
 *     setImageLoaded(false);
 *     setImageError(false);
 *   }, [src]);
 *   
 *   return (
 *     <div
 *       className={avatarStyles}
 *       data-image-loaded={imageLoaded}
 *       data-image-error={imageError}
 *       data-interactive={interactive}
 *       onClick={interactive ? onClick : undefined}
 *       role={interactive ? 'button' : undefined}
 *       tabIndex={interactive ? 0 : undefined}
 *       aria-label={alt || `Avatar with initials ${getInitials()}`}
 *     >
 *       <div className="avatar-content avatar-initials">
 *         {getInitials()}
 *       </div>
 *       
 *       {src && (
 *         <div className="avatar-content">
 *           <img 
 *             src={src}
 *             alt={alt}
 *             onLoad={handleImageLoad}
 *             onError={handleImageError}
 *           />
 *         </div>
 *       )}
 *       
 *       {status !== 'none' && (
 *         <div className={`avatar-status ${statusStyles}`}></div>
 *       )}
 *       
 *       {badgeContent && (
 *         <div className={`avatar-badge ${badgeStyles}`}>
 *           {typeof badgeContent === 'number' && badgeContent > 99 ? '99+' : badgeContent}
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * 
 * // Example of Avatar Group usage
 * function AvatarGroupExample() {
 *   const users = [
 *     { id: 1, name: 'Jane Doe', src: '/images/avatar1.jpg', status: 'online' },
 *     { id: 2, name: 'John Smith', src: '/images/avatar2.jpg', status: 'busy' },
 *     { id: 3, name: 'Alice Johnson', initials: 'AJ', status: 'away' },
 *     // Add more users as needed
 *   ];
 *   
 *   // Get group styles from the recipe
 *   const groupStyles = cosmicAvatarGroup({ spacing: 'normal' });
 *   
 *   return (
 *     <div className={groupStyles}>
 *       {users.map(user => (
 *         <CosmicAvatarComponent
 *           key={user.id}
 *           src={user.src}
 *           alt={user.name}
 *           initials={user.initials}
 *           status={user.status}
 *           variant="cosmic"
 *           size="md"
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 * 
 * // Simple usage example
 * function App() {
 *   return (
 *     <div className="flex gap-4 p-4">
 *       <CosmicAvatarComponent 
 *         src="/images/avatar.jpg"
 *         alt="User Avatar"
 *         size="lg"
 *         variant="cosmic"
 *         status="online"
 *       />
 *       
 *       <CosmicAvatarComponent
 *         initials="JS"
 *         size="lg"
 *         variant="solid"
 *         badgeContent={3}
 *         badgeVariant="primary"
 *       />
 *       
 *       <CosmicAvatarComponent
 *         src="/images/avatar3.jpg"
 *         alt="Interactive Avatar"
 *         size="lg"
 *         variant="outline"
 *         interactive={true}
 *         onClick={() => console.log('Avatar clicked')}
 *       />
 *       
 *       <AvatarGroupExample />
 *     </div>
 *   );
 * }
 */