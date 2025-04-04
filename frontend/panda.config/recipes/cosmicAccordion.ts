// src/styled-system/recipes/cosmicAccordion.ts

import { cva } from '../../styled-system/css';

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

// Root container for accordion group
export const cosmicAccordionRoot = cva({
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
export const cosmicAccordionItem = cva({
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
export const cosmicAccordionTrigger = cva({
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
export const cosmicAccordionContent = cva({
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
 * Usage Example (in a React component):
 * 
 * import { useState, useRef, useEffect } from 'react';
 * import {
 *   cosmicAccordionRoot,
 *   cosmicAccordionItem,
 *   cosmicAccordionTrigger,
 *   cosmicAccordionContent
 * } from '../styled-system/recipes/cosmicAccordion';
 * 
 * interface AccordionData {
 *   id: string;
 *   title: string;
 *   content: React.ReactNode;
 *   icon?: React.ReactNode;
 * }
 * 
 * interface CosmicAccordionProps {
 *   items: AccordionData[];
 *   variant?: 'standard' | 'filled' | 'minimal' | 'cosmic';
 *   size?: 'sm' | 'md' | 'lg';
 *   allowMultiple?: boolean;
 *   layout?: 'bordered' | 'separated' | 'default';
 *   defaultExpandedIds?: string[];
 * }
 * 
 * export function CosmicAccordion({
 *   items,
 *   variant = 'standard',
 *   size = 'md',
 *   allowMultiple = false,
 *   layout = 'default',
 *   defaultExpandedIds = [],
 * }: CosmicAccordionProps) {
 *   // Track expanded state of accordion items
 *   const [expandedItems, setExpandedItems] = useState<Set<string>>(
 *     new Set(defaultExpandedIds)
 *   );
 * 
 *   // Refs for content elements to animate height
 *   const contentRefs = useRef<Map<string, HTMLDivElement>>(new Map());
 *   
 *   // Get styles from recipes
 *   const rootStyles = cosmicAccordionRoot({
 *     variant,
 *     size,
 *     multiple: allowMultiple,
 *   });
 *   
 *   const itemStyles = cosmicAccordionItem({ variant });
 *   
 *   const getContentStyles = (itemId: string) => {
 *     return cosmicAccordionContent({ variant });
 *   };
 *   
 *   // Toggle item expansion
 *   const toggleItem = (itemId: string) => {
 *     setExpandedItems(prev => {
 *       const newSet = new Set(prev);
 *       
 *       if (newSet.has(itemId)) {
 *         newSet.delete(itemId);
 *       } else {
 *         // If not allowing multiple, clear previous selections
 *         if (!allowMultiple) {
 *           newSet.clear();
 *         }
 *         newSet.add(itemId);
 *       }
 *       
 *       return newSet;
 *     });
 *   };
 *   
 *   // Update content heights for animations when expanded state changes
 *   useEffect(() => {
 *     // For each content ref
 *     contentRefs.current.forEach((contentEl, itemId) => {
 *       const isExpanded = expandedItems.has(itemId);
 *       const innerEl = contentEl.querySelector('[data-accordion-content-inner]');
 *       
 *       if (!innerEl) return;
 *       
 *       if (isExpanded) {
 *         // Set height for animation
 *         const contentHeight = innerEl.scrollHeight;
 *         contentEl.style.height = `${contentHeight}px`;
 *         contentEl.style.opacity = '1';
 *       } else {
 *         // Collapse with animation
 *         contentEl.style.height = '0';
 *         contentEl.style.opacity = '0';
 *       }
 *     });
 *   }, [expandedItems]);
 *   
 *   const isBordered = layout === 'bordered';
 *   const isSeparated = layout === 'separated';
 *   
 *   return (
 *     <div 
 *       className={rootStyles}
 *       data-bordered={isBordered}
 *       data-separated={isSeparated}
 *     >
 *       {items.map((item, index) => {
 *         const isExpanded = expandedItems.has(item.id);
 *         const state = isExpanded ? 'open' : 'closed';
 *         const triggerStyles = cosmicAccordionTrigger({
 *           withIcon: !!item.icon,
 *         });
 *         
 *         return (
 *           <div
 *             key={item.id}
 *             className={itemStyles}
 *             data-accordion-item
 *             data-state={state}
 *           >
 *             <button
 *               className={triggerStyles}
 *               data-accordion-trigger
 *               data-state={state}
 *               onClick={() => toggleItem(item.id)}
 *               aria-expanded={isExpanded}
 *               aria-controls={`content-${item.id}`}
 *               id={`trigger-${item.id}`}
 *             >
 *               <span data-accordion-header>
 *                 {item.icon && (
 *                   <span aria-hidden="true">{item.icon}</span>
 *                 )}
 *                 {item.title}
 *               </span>
 *               
 *               <span data-accordion-icon aria-hidden="true">
 *                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 *                   <polyline points="6 9 12 15 18 9"></polyline>
 *                 </svg>
 *               </span>
 *             </button>
 *             
 *             <div
 *               className={getContentStyles(item.id)}
 *               data-accordion-content
 *               data-state={state}
 *               id={`content-${item.id}`}
 *               role="region"
 *               aria-labelledby={`trigger-${item.id}`}
 *               ref={el => el && contentRefs.current.set(item.id, el)}
 *             >
 *               <div data-accordion-content-inner>
 *                 {item.content}
 *               </div>
 *             </div>
 *           </div>
 *         );
 *       })}
 *     </div>
 *   );
 * }
 */