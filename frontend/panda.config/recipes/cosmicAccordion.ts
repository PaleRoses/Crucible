//panda.config//recipes/cosmicAccordion.ts

import { defineRecipe } from '@pandacss/dev';

/**
 * Cosmic Accordion - An elegant content disclosure component
 * 
 * Features:
 * - Smooth animations with customizable timing
 * - Multiple visual variants for different design contexts
 * - Support for both single and multi-section expansion
 * - Elegant indicators and state transitions
 * - Fully accessible with proper ARIA attributes
 * - Consistent styling with other cosmic components
 */

/**
 * ======================================================================================
 * COSMIC ACCORDION COMPONENT
 * ======================================================================================
 * 
 * IMPORT INTO YOUR PANDA CONFIG:
 * 
 * import { 
 *   cosmicAccordionRoot,
 *   cosmicAccordionItem, 
 *   cosmicAccordionTrigger, 
 *   cosmicAccordionContent,
 *   cosmicAccordion
 * } from './styled-system/recipes/cosmicAccordion';
 * 
 * Then add to your config:
 * 
 * export default defineConfig({
 *   // ...other config
 *   theme: {
 *     extend: {
 *       recipes: {
 *         // Method 1: Add individual components
 *         AccordionRoot: cosmicAccordionRoot,
 *         AccordionItem: cosmicAccordionItem,
 *         AccordionTrigger: cosmicAccordionTrigger,
 *         AccordionContent: cosmicAccordionContent,
 *         
 *         // Method 2: Add the entire accordion object
 *         Accordion: cosmicAccordion
 *       }
 *     }
 *   }
 * })
 */


// Root container for accordion group
export const cosmicAccordionRoot = defineRecipe({
  className: 'cosmicAccordionRoot',
  description: 'Root container for the cosmic accordion component',
  base: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    border: 'none',
    overflow: 'hidden',
    borderRadius: 'md',
    
    // Styling for a bordered container variant
    '&[data-bordered="true"]': {
      border: '1px solid',
      borderColor: 'border',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
      
      // Adjust border-radius on items when bordered
      '& [data-accordion-item]:first-of-type': {
        borderTopLeftRadius: 'md', 
        borderTopRightRadius: 'md',
      },
      '& [data-accordion-item]:last-of-type': {
        borderBottomLeftRadius: 'md',
        borderBottomRightRadius: 'md',
        borderBottom: 'none',
      },
    },
    
    // Styling for separated items
    '&[data-separated="true"]': {
      gap: '0.5rem',
      
      '& [data-accordion-item]': {
        border: '1px solid',
        borderColor: 'border',
        borderRadius: 'md',
        overflow: 'hidden',
        marginBottom: '0.5rem',
        
        '&:last-of-type': {
          marginBottom: 0,
        },
      },
    },
  },
  
  variants: {
    variant: {
      standard: {},
      
      filled: {
        backgroundColor: 'backgroundAlt',
        '& [data-accordion-item]': {
          backgroundColor: 'color-mix(in srgb, var(--color-background) 98%, var(--color-primary))',
        },
      },
      
      minimal: {},
      
      cosmic: {
        position: 'relative',
        
        '&[data-bordered="true"]': {
          boxShadow: '0 0 15px var(--color-glow)',
          borderColor: 'color-mix(in srgb, var(--color-border) 60%, var(--color-primary))',
        },
        
        // Star-like pattern background
        _after: {
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
          pointerEvents: 'none',
          borderRadius: 'inherit',
        },
      },
    },
    
    size: {
      sm: {
        '& [data-accordion-trigger]': {
          minHeight: '40px',
          padding: '0.5rem 0.75rem',
          fontSize: 'sm',
        },
        '& [data-accordion-content-inner]': {
          padding: '0.5rem 0.75rem',
          fontSize: 'sm',
        },
        '& [data-accordion-icon]': {
          width: '16px',
          height: '16px',
        },
      },
      
      md: {
        '& [data-accordion-trigger]': {
          minHeight: '48px',
          padding: '0.75rem 1rem',
          fontSize: 'base',
        },
        '& [data-accordion-content-inner]': {
          padding: '0.75rem 1rem',
          fontSize: 'base',
        },
        '& [data-accordion-icon]': {
          width: '18px',
          height: '18px',
        },
      },
      
      lg: {
        '& [data-accordion-trigger]': {
          minHeight: '56px',
          padding: '1rem 1.25rem',
          fontSize: 'lg',
        },
        '& [data-accordion-content-inner]': {
          padding: '1rem 1.25rem',
          fontSize: 'lg',
        },
        '& [data-accordion-icon]': {
          width: '20px',
          height: '20px',
        },
      },
    },
    
    // Adjusts accordion to allow multiple sections to be open at once
    multiple: {
      true: {},
      false: {},
    },
    
    // Visual container style
    layout: {
      bordered: {
        '&': {
          border: '1px solid',
          borderColor: 'border',
        },
      },
      separated: {
        gap: '0.5rem',
      },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
    size: 'md',
    multiple: false,
  },
});

// Individual accordion item
export const cosmicAccordionItem = defineRecipe({
  className: 'cosmicAccordionItem',
  description: 'Individual item within the cosmic accordion',
  base: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    overflow: 'hidden',
    borderBottom: '1px solid',
    borderColor: 'border',
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
    position: 'relative',
    
    // Hover state for the entire item
    _hover: {
      '&[data-state="closed"] [data-accordion-trigger]': {
        backgroundColor: 'hover',
      },
    },
    
    // Open state styling
    '&[data-state="open"]': {
      borderColor: 'color-mix(in srgb, var(--color-border) 70%, var(--color-primary))',
    },
    
    // Last item doesn't need border if it's closed
    '&:last-of-type': {
      borderBottom: 'none',
    },
  },
  
  variants: {
    variant: {
      standard: {},
      
      filled: {
        '&[data-state="open"]': {
          backgroundColor: 'color-mix(in srgb, var(--color-background) 95%, var(--color-primary))',
        },
      },
      
      minimal: {
        borderLeft: '0',
        borderRight: '0',
        
        '&[data-state="open"]': {
          backgroundColor: 'transparent',
          
          '& [data-accordion-trigger]': {
            borderBottom: '1px solid',
            borderColor: 'color-mix(in srgb, var(--color-border) 70%, var(--color-primary))',
          },
        },
      },
      
      cosmic: {
        '&[data-state="open"]': {
          boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.1)',
          borderColor: 'color-mix(in srgb, var(--color-border) 60%, var(--color-primary))',
          backgroundColor: 'color-mix(in srgb, var(--color-background) 95%, var(--color-primary))',
          
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            width: '3px',
            height: '100%',
            backgroundColor: 'primary',
            boxShadow: '0 0 8px var(--color-glow)',
          },
          
          '& [data-accordion-trigger]': {
            boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.05)',
          },
          
          '& [data-accordion-icon]': {
            color: 'primary',
            textShadow: '0 0 5px var(--color-glow)',
          },
        },
        
        _hover: {
          '&[data-state="closed"] [data-accordion-trigger]': {
            backgroundColor: 'color-mix(in srgb, var(--color-hover) 90%, var(--color-primary))',
          },
        },
      },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
  },
});

// Accordion trigger button
export const cosmicAccordionTrigger = defineRecipe({
  className: 'cosmicAccordionTrigger',
  description: 'Trigger button for the cosmic accordion',
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    userSelect: 'none',
    position: 'relative',
    textAlign: 'left',
    fontFamily: 'heading',
    fontWeight: 'normal',
    letterSpacing: '0.05em',
    color: 'text',
    outline: 'none',
    
    // Active/pressed state
    _active: {
      backgroundColor: 'color-mix(in srgb, var(--color-hover) 80%, var(--color-primary))',
    },
    
    // Focus visible state for keyboard navigation
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '-2px',
      zIndex: 1,
    },
    
    // Icon container
    '& [data-accordion-icon]': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.3s ease',
      color: 'textMuted',
      marginLeft: '0.5rem',
      flexShrink: 0,
    },
    
    // Expanded state transforms the icon
    '&[data-state="open"] [data-accordion-icon]': {
      transform: 'rotate(180deg)',
      color: 'primary',
    },
    
    // When closed, hover states for the trigger
    '&[data-state="closed"]:hover': {
      color: 'primary',
      
      '& [data-accordion-icon]': {
        color: 'primary',
      },
    },
    
    // Opened trigger styling
    '&[data-state="open"]': {
      color: 'primary',
    },
  },
  
  variants: {
    withIcon: {
      true: {
        '& [data-accordion-header]': {
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        },
      },
    },
  },
  
  defaultVariants: {
    withIcon: false,
  },
});

// Content area container
export const cosmicAccordionContent = defineRecipe({
  className: 'cosmicAccordionContent',
  description: 'Content area of the cosmic accordion',
  base: {
    overflow: 'hidden',
    fontSize: '1rem',
    color: 'textMuted',
    backgroundColor: 'transparent',
    
    // Will be animated with JS height transitions
    height: '0',
    opacity: '0',
    
    // When open
    '&[data-state="open"]': {
      opacity: '1',
    },
    
    // Inner content container (needed for padding without affecting animations)
    '& [data-accordion-content-inner]': {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      lineHeight: '1.5',
    },
  },
  
  variants: {
    variant: {
      standard: {},
      
      filled: {
        '& [data-accordion-content-inner]': {
          backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 98%, var(--color-primary))',
        },
      },
      
      minimal: {},
      
      cosmic: {
        '& [data-accordion-content-inner]': {
          position: 'relative',
          
          // Subtle cosmic pattern in content background
          _after: {
            content: '""',
            position: 'absolute',
            inset: 0,
            opacity: 0.02,
            backgroundImage: `
              radial-gradient(circle, var(--color-primary) 1px, transparent 1px)
            `,
            backgroundSize: '15px 15px',
            pointerEvents: 'none',
            zIndex: -1,
          },
          
          // Subtle glow on links within content
          '& a': {
            color: 'secondary',
            position: 'relative',
            transition: 'color 0.3s ease',
            
            _hover: {
              color: 'primary',
              textShadow: '0 0 3px var(--color-glow)',
            },
          },
        },
      },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
  },
});

/**
 * Bulk export of all cosmic accordion components
 */

export const cosmicAccordion = {
  root: cosmicAccordionRoot,
  item: cosmicAccordionItem,
  trigger: cosmicAccordionTrigger,
  content: cosmicAccordionContent
};

/**
 * Minimal Example Usage:
 * 
 * <CosmicAccordion
 *   items={[
 *     {
 *       id: "panel1",
 *       title: "First Panel",
 *       content: "Content for the first panel"
 *     },
 *     {
 *       id: "panel2",
 *       title: "Second Panel",
 *       content: "Content for the second panel"
 *     }
 *   ]}
 *   variant="cosmic"
 *   size="md"
 *   allowMultiple={false}
 * />
 */