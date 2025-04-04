// panda.config/recipes/cosmicInformationCard.ts

import { defineRecipe } from '@pandacss/dev';

/**
 * ====================================================================================
 * COSMIC INFORMATION CARD - An elegant card component with angular header design
 * ====================================================================================
 * 
 * IMPORT INTO YOUR PANDA CONFIG:
 * 
 * import { cosmicInformationCard } from './panda.config/recipes/cosmicInformationCard';
 * 
 * Then add to your config:
 * 
 * export default defineConfig({
 *   // ...other config
 *   theme: {
 *     extend: {
 *       recipes: {
 *         // Add to your recipes
 *         InformationCard: cosmicInformationCard
 *       }
 *     }
 *   }
 * })
 * 
 * Features:
 * - Distinctive angled header with optional icon
 * - Content area with rich text support
 * - Subtle hover animation with line effect
 * - Multiple visual variants from minimal to cosmic
 * - Support for interactive and static modes
 * - Proper accessibility considerations
 */

// Main card container
export const cosmicInformationCard = defineRecipe({
  className: 'cosmicInformationCard',
  description: 'An elegant card component with angular header design',
  base: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'border',
    transition: 'all 0.3s ease',
    
    // Main content area
    '& .card-content': {
      padding: '4',
      backgroundColor: 'backgroundAlt',
      color: 'text',
      position: 'relative',
      zIndex: '2',
      transition: 'color 0.3s ease',
    },
    
    // Header with angled design
    '& .card-header': {
      position: 'relative',
      padding: '2 4',
      color: 'background',
      fontFamily: 'heading',
      fontWeight: 'semibold',
      fontSize: 'md',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      display: 'flex',
      alignItems: 'center',
      gap: '2',
      
      // Create the angled edge
      _after: {
        content: '""',
        position: 'absolute',
        top: '0',
        right: '-20px',
        width: '40px',
        height: '100%',
        backgroundColor: 'inherit',
        transform: 'skewX(-20deg)',
        zIndex: '1',
      },
    },
    
    // Icon in header
    '& .card-icon': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    // Card title in header
    '& .card-title': {
      position: 'relative',
      zIndex: '2',
      whiteSpace: 'nowrap',
    },
    
    // Hover animation line - initially hidden
    '&::before': {
      content: '""',
      position: 'absolute',
      left: '0',
      bottom: '0',
      width: '0%',
      height: '2px',
      backgroundColor: 'text',
      transition: 'width 0.3s ease',
      zIndex: '3',
    },
    
    // Show line on hover
    _hover: {
      '&::before': {
        width: '100%',
      },
    },
    
    // Interactive cards get additional styling
    '&[data-interactive="true"]': {
      cursor: 'pointer',
      
      _hover: {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
      
      _active: {
        transform: 'translateY(0)',
      }
    },
    
    // Focus state for keyboard navigation
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
      
      '&::before': {
        width: '100%',
      },
    },
  },
  
  variants: {
    // Visual style variants
    variant: {
      // Standard with subtle styling
      standard: {
        '& .card-header': {
          backgroundColor: 'primary',
        },
      },
      
      // Emphasis variant with stronger colors
      emphasis: {
        '& .card-header': {
          backgroundColor: 'accent1',
        },
        borderColor: 'color-mix(in srgb, var(--color-border) 50%, var(--color-accent1))',
        
        '&::before': {
          backgroundColor: 'accent1',
        },
      },
      
      // Warning variant with appropriate colors
      warning: {
        '& .card-header': {
          backgroundColor: 'accent2',
        },
        borderColor: 'color-mix(in srgb, var(--color-border) 50%, var(--color-accent2))',
        
        '&::before': {
          backgroundColor: 'accent2',
        },
      },
      
      // Success variant
      success: {
        '& .card-header': {
          backgroundColor: 'accent3',
        },
        borderColor: 'color-mix(in srgb, var(--color-border) 50%, var(--color-accent3))',
        
        '&::before': {
          backgroundColor: 'accent3',
        },
      },
      
      // Minimal variant with reduced styling
      minimal: {
        border: 'none',
        boxShadow: 'none',
        
        '& .card-header': {
          backgroundColor: 'primary',
          borderTopLeftRadius: 'md',
          borderTopRightRadius: 'md',
          
          _after: {
            display: 'none',
          },
        },
        
        '& .card-content': {
          borderBottomLeftRadius: 'md',
          borderBottomRightRadius: 'md',
        },
        
        _hover: {
          boxShadow: 'none',
          transform: 'none',
        },
      },
      
      // Cosmic variant with our luxury moon styling
      cosmic: {
        borderColor: 'color-mix(in srgb, var(--color-border) 30%, var(--color-primary))',
        boxShadow: '0 0 20px var(--color-glow)',
        
        '& .card-header': {
          backgroundColor: 'primary',
          boxShadow: '0 0 15px var(--color-glow)',
          
          _after: {
            boxShadow: '0 0 15px var(--color-glow)',
          },
        },
        
        '& .card-content': {
          backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 95%, var(--color-primary))',
          
          // Star effect background
          _before: {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              radial-gradient(circle, var(--color-cosmic1) 1px, transparent 1px), 
              radial-gradient(circle, var(--color-cosmic2) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px, 30px 30px',
            backgroundPosition: '0 0, 10px 10px',
            opacity: 0.03,
            zIndex: -1,
          },
        },
        
        '&::before': {
          backgroundColor: 'primary',
          boxShadow: '0 0 10px var(--color-glow)',
          height: '3px',
        },
        
        _hover: {
          boxShadow: '0 0 30px var(--color-glow)',
          
          '& .card-content': {
            _before: {
              opacity: 0.06,
            },
          },
        },
      },
      
      // Borderless variant with minimal styling
      borderless: {
        border: 'none',
        boxShadow: 'none',
        borderRadius: '0',
        
        '& .card-header': {
          backgroundColor: 'primary',
          borderRadius: '0',
          paddingLeft: '0',
          
          _after: {
            display: 'none',
          },
        },
        
        '& .card-content': {
          backgroundColor: 'transparent',
          paddingLeft: '0',
          paddingRight: '0',
        },
        
        '&::before': {
          bottom: '-2px',
        },
        
        _hover: {
          boxShadow: 'none',
          transform: 'none',
        },
      },
    },
    
    // Size variants
    size: {
      sm: {
        '& .card-header': {
          padding: '1 2',
          fontSize: 'sm',
          
          _after: {
            right: '-15px',
            width: '30px',
          },
        },
        '& .card-content': {
          padding: '2',
          fontSize: 'sm',
        },
      },
      
      md: {
        // Base styles already define medium size
      },
      
      lg: {
        '& .card-header': {
          padding: '3 4',
          fontSize: 'lg',
          
          _after: {
            right: '-25px',
            width: '50px',
          },
        },
        '& .card-content': {
          padding: '5',
          fontSize: 'lg',
        },
      },
    },
    
    // With or without icon
    hasIcon: {
      true: {
        '& .card-header': {
          paddingLeft: '3',
        },
      },
      false: {
        '& .card-icon': {
          display: 'none',
        },
      },
    },
    
    // Full-width header or normal
    fullWidthHeader: {
      true: {
        '& .card-header': {
          _after: {
            display: 'none',
          },
        },
      },
      false: {
        // Base styles already handle normal header
      },
    },
  },
  
  // Default variants
  defaultVariants: {
    variant: 'standard',
    size: 'md',
    hasIcon: true,
    fullWidthHeader: false,
  },
});

/**
 * USAGE EXAMPLE (in a React component):
 * =====================================
 * 
 * // First, import the cosmicInformationCard
 * import { cosmicInformationCard } from './panda.config/recipes/cosmicInformationCard';
 * 
 * // Define the InformationCard component with all supported props
 * interface InformationCardProps {
 *   title: string;                // Title displayed in the card header
 *   content: React.ReactNode;     // Content to display in the card body
 *   icon?: React.ReactNode;       // Optional icon for the header
 *   variant?: 'standard' | 'emphasis' | 'warning' | 'success' | 'minimal' | 'cosmic' | 'borderless';
 *   size?: 'sm' | 'md' | 'lg';    // Size variant
 *   fullWidthHeader?: boolean;    // Whether header extends full width
 *   interactive?: boolean;        // Whether card is clickable
 *   onClick?: () => void;         // Click handler for interactive cards
 * }
 * 
 * function CosmicInformationCard({
 *   title,
 *   content,
 *   icon,
 *   variant = 'standard',
 *   size = 'md',
 *   fullWidthHeader = false,
 *   interactive = false,
 *   onClick,
 * }: InformationCardProps) {
 *   // Get styles from recipe
 *   const cardStyles = cosmicInformationCard({
 *     variant,
 *     size,
 *     hasIcon: !!icon,
 *     fullWidthHeader,
 *   });
 *   
 *   return (
 *     <div
 *       className={cardStyles}
 *       onClick={interactive ? onClick : undefined}
 *       data-interactive={interactive}
 *       tabIndex={interactive ? 0 : undefined}
 *       role={interactive ? 'button' : undefined}
 *     >
 *       <div className="card-header">
 *         {icon && <span className="card-icon">{icon}</span>}
 *         <div className="card-title">{title}</div>
 *       </div>
 *       <div className="card-content">
 *         {content}
 *       </div>
 *     </div>
 *   );
 * }
 * 
 * // EXAMPLES OF CARD USAGE:
 * 
 * // Simple Star Icon component
 * function StarIcon() {
 *   return (
 *     <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
 *       <path d="M12 1L9.5 8.5H2L8 13.5L5.5 21L12 16L18.5 21L16 13.5L22 8.5H14.5L12 1Z" />
 *     </svg>
 *   );
 * }
 * 
 * // Basic information card with cosmic styling
 * <CosmicInformationCard
 *   title="Overcharge"
 *   content="Overcharging immediately allows you to make any quick action of your choice as a Free Action, even one you already made this turn."
 *   icon={<StarIcon />}
 *   variant="cosmic"
 * />
 * 
 * // Warning card for important information
 * <CosmicInformationCard
 *   title="Warning"
 *   content={<div>This action cannot be undone. Please review your changes before proceeding.</div>}
 *   icon={<AlertIcon />}
 *   variant="warning"
 *   size="lg"
 * />
 * 
 * // Interactive success card
 * <CosmicInformationCard
 *   title="Achievement Unlocked"
 *   content="You've completed all required tasks! Click to claim your reward."
 *   icon={<TrophyIcon />}
 *   variant="success"
 *   interactive={true}
 *   onClick={() => claimReward()}
 * />
 * 
 * // Minimal card with no icon
 * <CosmicInformationCard
 *   title="Quick Tip"
 *   content="Press Ctrl+Space to activate quick search from anywhere in the application."
 *   variant="minimal"
 *   hasIcon={false}
 * />
 * 
 * // Borderless card with full-width header
 * <CosmicInformationCard
 *   title="Today's Progress"
 *   content={<ProgressChart data={userData} />}
 *   variant="borderless"
 *   fullWidthHeader={true}
 * />
 */