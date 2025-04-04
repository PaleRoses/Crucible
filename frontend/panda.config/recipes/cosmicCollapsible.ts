// panda.config/recipes/cosmicCollapsible.ts

import { defineRecipe } from '@pandacss/dev';

/**
 * ====================================================================================
 * COSMIC COLLAPSIBLE - An elegant collapsible/accordion component with luxury styling
 * ====================================================================================
 * 
 * IMPORT INTO YOUR PANDA CONFIG:
 * 
 * import { 
 *   cosmicCollapsibleContainer,
 *   cosmicCollapsibleTrigger,
 *   cosmicCollapsibleContent,
 *   cosmicCollapsibleGroup,
 *   cosmicCollapsible
 * } from './panda.config/recipes/cosmicCollapsible';
 * 
 * Then add to your config:
 * 
 * export default defineConfig({
 *   // ...other config
 *   theme: {
 *     extend: {
 *       recipes: {
 *         // Method 1: Add individual components
 *         CollapsibleContainer: cosmicCollapsibleContainer,
 *         CollapsibleTrigger: cosmicCollapsibleTrigger,
 *         CollapsibleContent: cosmicCollapsibleContent,
 *         CollapsibleGroup: cosmicCollapsibleGroup,
 *         
 *         // Method 2: Or use the combined object
 *         // This adds all components with their original naming
 *         ...cosmicCollapsible
 *       }
 *     }
 *   }
 * })
 * 
 * Features:
 * - Smooth reveal animations with configurable timing
 * - Multiple visual variants to match different contexts
 * - Support for icons, badges, and custom content in headers
 * - Accessible keyboard navigation and screen reader support
 * - Consistent styling with other cosmic components
 * - Group capability for accordion-like behavior
 */

// Container that wraps both trigger and content panel
export const cosmicCollapsibleContainer = defineRecipe({
  className: 'cosmicCollapsibleContainer',
  description: 'Container for the collapsible component with cosmic styling',
  base: {
    position: 'relative',
    width: '100%',
    fontFamily: 'body',
    marginBottom: '2',
    borderRadius: 'md',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    
    // Focus ring applied when the container is focused as a group
    _focusWithin: {
      outline: 'none',
      boxShadow: '0 0 0 2px var(--color-primary)',
    },
  },
  
  variants: {
    // Visual style variants
    variant: {
      // Standard collapsible with border
      standard: {
        border: '1px solid',
        borderColor: 'border',
        backgroundColor: 'backgroundAlt',
      },
      
      // Elevated version with shadow
      elevated: {
        border: '1px solid',
        borderColor: 'border',
        backgroundColor: 'backgroundAlt',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        
        _hover: {
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
        },
      },
      
      // Minimal version without borders
      minimal: {
        border: 'none',
        borderBottom: '1px solid',
        borderColor: 'border',
        borderRadius: '0',
        backgroundColor: 'transparent',
      },
      
      // Cosmic luxury version with glow effects
      cosmic: {
        border: '1px solid',
        borderColor: 'color-mix(in srgb, var(--color-border) 70%, var(--color-primary))',
        backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 98%, var(--color-primary))',
        boxShadow: '0 0 10px var(--color-glow)',
        
        // Background effects
        _before: {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(to bottom, color-mix(in srgb, var(--color-backgroundAlt) 96%, var(--color-primary)), var(--color-backgroundAlt) 100%)',
          opacity: 0.7,
          zIndex: 0,
          pointerEvents: 'none',
        },
        
        // More pronounced hover effect
        _hover: {
          boxShadow: '0 0 15px var(--color-glow)',
        },
      },
    },
    
    // Is the collapsible currently expanded?
    isExpanded: {
      true: {
        // General expanded state styles
      },
      false: {
        // General collapsed state styles
      },
    },
    
    // Is the collapsible disabled?
    isDisabled: {
      true: {
        opacity: 0.6,
        cursor: 'not-allowed',
        pointerEvents: 'none',
        boxShadow: 'none',
      },
    },
  },
  
  // Compound variants for special combinations
  compoundVariants: [
    // Cosmic + expanded state
    {
      variant: 'cosmic',
      isExpanded: true,
      css: {
        boxShadow: '0 0 20px var(--color-glow)',
        // Subtle particle effect animation when expanded
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
          zIndex: 0,
          pointerEvents: 'none',
          animation: 'cosmicParticlesShimmer 3s infinite alternate ease-in-out',
        },
      },
    },
  ],
  
  // Default variants
  defaultVariants: {
    variant: 'standard',
    isExpanded: false,
    isDisabled: false,
  },
});

// The trigger/header button that controls expansion
export const cosmicCollapsibleTrigger = defineRecipe({
  className: 'cosmicCollapsibleTrigger',
  description: 'Trigger button for the collapsible component with cosmic styling',
  base: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '3',
    fontFamily: 'heading',
    fontSize: 'md',
    fontWeight: 'normal',
    letterSpacing: '0.05em',
    cursor: 'pointer',
    background: 'transparent',
    color: 'text',
    border: 'none',
    textAlign: 'left',
    transition: 'all 0.3s ease',
    position: 'relative',
    zIndex: 1,
    
    // Left side content container (typically icon + title)
    '& .trigger-content': {
      display: 'flex',
      alignItems: 'center',
      gap: '3',
    },
    
    // Title text styling
    '& .trigger-title': {
      fontWeight: 'medium',
      transition: 'color 0.3s ease',
    },
    
    // Icon container (left side)
    '& .trigger-icon': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'primary',
      transition: 'color 0.3s ease, transform 0.3s ease',
    },
    
    // Arrow/indicator icon (right side)
    '& .trigger-arrow': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.3s ease, color 0.3s ease',
      color: 'textMuted',
    },
    
    // Focus state
    _focus: {
      outline: 'none',
    },
    
    // Hover state
    _hover: {
      backgroundColor: 'color-mix(in srgb, var(--color-hover) 50%, transparent)',
      
      '& .trigger-title': {
        color: 'primary',
      },
      
      '& .trigger-arrow': {
        color: 'primary',
      },
    },
    
    // Active/pressed state
    _active: {
      backgroundColor: 'color-mix(in srgb, var(--color-active) 70%, transparent)',
    },
  },
  
  variants: {
    // Visual style variants (matching container variants)
    variant: {
      standard: {
        borderBottom: '1px solid',
        borderColor: 'border',
      },
      
      elevated: {
        borderBottom: '1px solid',
        borderColor: 'border',
      },
      
      minimal: {
        paddingLeft: '1',
        paddingRight: '1',
        // No border needed since container has bottom border
      },
      
      cosmic: {
        color: 'text',
        borderBottom: '1px solid',
        borderColor: 'color-mix(in srgb, var(--color-border) 60%, var(--color-primary))',
        
        '& .trigger-title': {
          // Subtle text shadow for cosmic variant
          textShadow: '0 0 1px var(--color-glow)',
        },
        
        '& .trigger-icon': {
          // Icon glow effect
          filter: 'drop-shadow(0 0 2px var(--color-glow))',
        },
        
        _hover: {
          backgroundColor: 'color-mix(in srgb, var(--color-hover) 80%, var(--color-primary))',
          
          '& .trigger-title': {
            color: 'primary',
            textShadow: '0 0 3px var(--color-glow)',
          },
          
          '& .trigger-icon': {
            filter: 'drop-shadow(0 0 3px var(--color-glow))',
          },
          
          '& .trigger-arrow': {
            filter: 'drop-shadow(0 0 2px var(--color-glow))',
          },
        },
      },
    },
    
    // Size variants
    size: {
      sm: {
        padding: '2',
        fontSize: 'sm',
        
        '& .trigger-content': {
          gap: '2',
        },
        
        '& .trigger-icon': {
          fontSize: 'md',
        },
      },
      
      md: {
        // Base styles already define medium size
      },
      
      lg: {
        padding: '4',
        fontSize: 'lg',
        
        '& .trigger-content': {
          gap: '4',
        },
        
        '& .trigger-icon': {
          fontSize: 'xl',
        },
      },
    },
    
    // Is the collapsible expanded?
    isExpanded: {
      true: {
        color: 'primary',
        
        '& .trigger-title': {
          color: 'primary',
        },
        
        '& .trigger-arrow': {
          transform: 'rotate(180deg)',
          color: 'primary',
        },
      },
    },
    
    // Is the collapsible disabled?
    isDisabled: {
      true: {
        cursor: 'not-allowed',
        opacity: 0.7,
        pointerEvents: 'none',
        
        '& .trigger-title': {
          color: 'textMuted',
        },
        
        '& .trigger-icon': {
          color: 'textMuted',
        },
        
        '& .trigger-arrow': {
          color: 'textMuted',
        },
      },
    },
  },
  
  // Compound variants for special combinations
  compoundVariants: [
    // Cosmic + expanded
    {
      variant: 'cosmic',
      isExpanded: true,
      css: {
        backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 90%, var(--color-primary))',
        
        '& .trigger-title': {
          textShadow: '0 0 3px var(--color-glow)',
        },
        
        '& .trigger-icon': {
          transform: 'scale(1.05)',
          filter: 'drop-shadow(0 0 3px var(--color-glow))',
        },
        
        '& .trigger-arrow': {
          filter: 'drop-shadow(0 0 2px var(--color-glow))',
        },
        
        _hover: {
          backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 85%, var(--color-primary))',
        },
      },
    },
  ],
  
  // Default variants
  defaultVariants: {
    variant: 'standard',
    size: 'md',
    isExpanded: false,
    isDisabled: false,
  },
});

// The content area that expands/collapses
export const cosmicCollapsibleContent = defineRecipe({
  className: 'cosmicCollapsibleContent',
  description: 'Content area for the collapsible component with cosmic styling',
  base: {
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1,
    transition: 'height var(--transition-medium) ease, opacity var(--transition-medium) ease',
    
    // Inner content container needs padding
    '& .content-inner': {
      padding: '3',
      color: 'textMuted',
    },
  },
  
  variants: {
    // Visual style variants (matching container variants)
    variant: {
      standard: {},
      
      elevated: {},
      
      minimal: {
        '& .content-inner': {
          paddingLeft: '1',
          paddingRight: '1',
        },
      },
      
      cosmic: {
        '& .content-inner': {
          position: 'relative',
          zIndex: 1,
          // Subtle gradient background
          background: 'linear-gradient(to bottom, transparent, color-mix(in srgb, var(--color-backgroundAlt) 96%, var(--color-primary)) 100%)',
        },
      },
    },
    
    // Is the content area expanded?
    isExpanded: {
      true: {
        height: 'auto',
        opacity: 1,
      },
      false: {
        height: '0',
        opacity: 0,
        padding: 0,
      },
    },
  },
  
  // Default variants
  defaultVariants: {
    variant: 'standard',
    isExpanded: false,
  },
});

// Group container for accordion-style behavior (optional)
export const cosmicCollapsibleGroup = defineRecipe({
  className: 'cosmicCollapsibleGroup',
  description: 'Group container for multiple collapsible items with cosmic styling',
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2',
    width: '100%',
  },
  
  variants: {
    // Visual style variants
    variant: {
      standard: {},
      
      elevated: {},
      
      minimal: {
        gap: '0',
      },
      
      cosmic: {
        gap: '3',
      },
    },
    
    // Style mode - connected vs separated items
    mode: {
      // Connected items (no gap, shared borders)
      connected: {
        gap: '0',
        
        // Target all direct children except the last one
        '& > *:not(:last-child)': {
          marginBottom: '0',
          borderBottomLeftRadius: '0',
          borderBottomRightRadius: '0',
        },
        
        // Target all direct children except the first one
        '& > *:not(:first-child)': {
          marginTop: '-1px', // Overlap borders
          borderTopLeftRadius: '0',
          borderTopRightRadius: '0',
        },
      },
      
      // Separated items (with gap)
      separated: {
        // Base styles already include gap
      },
    },
  },
  
  // Default variants
  defaultVariants: {
    variant: 'standard',
    mode: 'separated',
  },
});

/**
 * Bulk export of all cosmic collapsible components
 */
export const cosmicCollapsible = {
  container: cosmicCollapsibleContainer,
  trigger: cosmicCollapsibleTrigger,
  content: cosmicCollapsibleContent,
  group: cosmicCollapsibleGroup
};

/**
 * USAGE EXAMPLE (in a React component):
 * =====================================
 * 
 * // First, import the necessary components
 * import { useState, useRef, useEffect } from 'react';
 * import { 
 *   cosmicCollapsibleContainer,
 *   cosmicCollapsibleTrigger,
 *   cosmicCollapsibleContent,
 *   cosmicCollapsibleGroup
 * } from './panda.config/recipes/cosmicCollapsible';
 * 
 * // Define props interface for the Collapsible component
 * interface CollapsibleProps {
 *   title: string;                 // Title displayed in the header
 *   children: React.ReactNode;     // Content that shows/hides
 *   icon?: React.ReactNode;        // Optional icon for the header
 *   variant?: 'standard' | 'elevated' | 'minimal' | 'cosmic'; // Visual style
 *   size?: 'sm' | 'md' | 'lg';     // Size variant
 *   defaultExpanded?: boolean;     // Whether expanded by default
 *   disabled?: boolean;            // Disabled state
 *   id?: string;                   // Optional ID for ARIA attributes
 * }
 * 
 * // Basic Collapsible Component
 * function CosmicCollapsible({
 *   title,
 *   children,
 *   icon,
 *   variant = 'standard',
 *   size = 'md',
 *   defaultExpanded = false,
 *   disabled = false,
 *   id
 * }: CollapsibleProps) {
 *   // State for expansion
 *   const [isExpanded, setIsExpanded] = useState(defaultExpanded);
 *   const contentRef = useRef<HTMLDivElement>(null);
 *   const [contentHeight, setContentHeight] = useState<number | 'auto'>(defaultExpanded ? 'auto' : 0);
 *   
 *   // Generate unique IDs for accessibility if not provided
 *   const uniqueId = id || `collapsible-${Math.random().toString(36).substring(2, 9)}`;
 *   const triggerId = `${uniqueId}-trigger`;
 *   const contentId = `${uniqueId}-content`;
 *   
 *   // Get styles from recipes
 *   const containerStyles = cosmicCollapsibleContainer({ variant, isExpanded, isDisabled: disabled });
 *   const triggerStyles = cosmicCollapsibleTrigger({ variant, size, isExpanded, isDisabled: disabled });
 *   const contentStyles = cosmicCollapsibleContent({ variant, isExpanded });
 *   
 *   // Toggle expanded state
 *   const toggleExpanded = () => {
 *     if (!disabled) {
 *       setIsExpanded(!isExpanded);
 *     }
 *   };
 *   
 *   // Handle content height measurement for smooth animation
 *   useEffect(() => {
 *     if (!contentRef.current) return;
 *     
 *     if (isExpanded) {
 *       // Get the scrollHeight to determine actual content height
 *       const height = contentRef.current.scrollHeight;
 *       setContentHeight(height);
 *       
 *       // After animation completes, set height to auto to handle content changes
 *       const timer = setTimeout(() => {
 *         setContentHeight('auto');
 *       }, 300); // Match transition duration
 *       
 *       return () => clearTimeout(timer);
 *     } else {
 *       // First set a fixed height for animation starting point
 *       setContentHeight(contentRef.current.scrollHeight);
 *       
 *       // Force a reflow before setting height to 0
 *       contentRef.current.offsetHeight;
 *       
 *       // Then animate to height 0
 *       setTimeout(() => {
 *         setContentHeight(0);
 *       }, 10);
 *     }
 *   }, [isExpanded]);
 *   
 *   return (
 *     <div 
 *       className={containerStyles} 
 *       id={uniqueId}
 *     >
 *       <button
 *         className={triggerStyles}
 *         onClick={toggleExpanded}
 *         aria-expanded={isExpanded}
 *         aria-controls={contentId}
 *         id={triggerId}
 *         disabled={disabled}
 *       >
 *         <div className="trigger-content">
 *           {icon && <span className="trigger-icon">{icon}</span>}
 *           <span className="trigger-title">{title}</span>
 *         </div>
 *         <span className="trigger-arrow">
 *           <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
 *             <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
 *           </svg>
 *         </span>
 *       </button>
 *       
 *       <div
 *         className={contentStyles}
 *         id={contentId}
 *         role="region"
 *         aria-labelledby={triggerId}
 *         ref={contentRef}
 *         style={{ height: typeof contentHeight === 'number' ? `${contentHeight}px` : contentHeight }}
 *       >
 *         <div className="content-inner">
 *           {children}
 *         </div>
 *       </div>
 *     </div>
 *   );
 * }
 * 
 * // Accordion Group Component
 * interface AccordionProps {
 *   children: React.ReactNode;     // Collapsible items
 *   variant?: 'standard' | 'elevated' | 'minimal' | 'cosmic'; // Visual style
 *   mode?: 'connected' | 'separated'; // Layout mode
 *   allowMultiple?: boolean;       // Whether multiple items can be open at once
 * }
 * 
 * function CosmicAccordion({
 *   children,
 *   variant = 'standard',
 *   mode = 'separated',
 *   allowMultiple = false
 * }: AccordionProps) {
 *   // Track which items are expanded
 *   const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
 *   
 *   // Generate unique ID for the accordion group
 *   const accordionId = `accordion-${Math.random().toString(36).substring(2, 9)}`;
 *   
 *   // Get group styles
 *   const groupStyles = cosmicCollapsibleGroup({ variant, mode });
 *   
 *   // Handle item toggle in accordion context
 *   const toggleItem = (itemId: string) => {
 *     const newExpandedItems = new Set(expandedItems);
 *     
 *     if (newExpandedItems.has(itemId)) {
 *       newExpandedItems.delete(itemId);
 *     } else {
 *       if (!allowMultiple) {
 *         newExpandedItems.clear();
 *       }
 *       newExpandedItems.add(itemId);
 *     }
 *     
 *     setExpandedItems(newExpandedItems);
 *   };
 *   
 *   // Clone children with proper context
 *   const childrenWithContext = React.Children.map(children, (child, index) => {
 *     if (React.isValidElement(child)) {
 *       // Generate ID based on index if child doesn't have one
 *       const childId = child.props.id || `${accordionId}-item-${index}`;
 *       
 *       return React.cloneElement(child, {
 *         id: childId,
 *         variant,
 *         isExpanded: expandedItems.has(childId),
 *         toggleExpanded: () => toggleItem(childId)
 *       });
 *     }
 *     return child;
 *   });
 *   
 *   return (
 *     <div 
 *       className={groupStyles}
 *       role="region"
 *       aria-label="Accordion"
 *     >
 *       {childrenWithContext}
 *     </div>
 *   );
 * }
 * 
 * // EXAMPLES OF USAGE:
 * 
 * // Basic single collapsible
 * <CosmicCollapsible 
 *   title="Click to expand"
 *   variant="standard" 
 *   size="md"
 * >
 *   <p>This content can be shown or hidden.</p>
 * </CosmicCollapsible>
 * 
 * // Cosmic variant with icon
 * <CosmicCollapsible 
 *   title="Cosmic Features" 
 *   variant="cosmic"
 *   icon={<span>✨</span>}
 *   defaultExpanded={true}
 * >
 *   <p>Premium content with cosmic styling.</p>
 *   <p>Animations create a smooth user experience.</p>
 * </CosmicCollapsible>
 * 
 * // Disabled collapsible
 * <CosmicCollapsible 
 *   title="Not Available" 
 *   disabled={true}
 *   variant="elevated"
 * >
 *   <p>This content cannot be accessed.</p>
 * </CosmicCollapsible>
 * 
 * // Accordion group (connected style)
 * <CosmicAccordion 
 *   variant="cosmic" 
 *   mode="connected"
 *   allowMultiple={false}
 * >
 *   <CosmicCollapsible title="Section One" icon={<span>1</span>}>
 *     <p>First accordion section content.</p>
 *   </CosmicCollapsible>
 *   <CosmicCollapsible title="Section Two" icon={<span>2</span>}>
 *     <p>Second accordion section content.</p>
 *   </CosmicCollapsible>
 *   <CosmicCollapsible title="Section Three" icon={<span>3</span>}>
 *     <p>Third accordion section content.</p>
 *   </CosmicCollapsible>
 * </CosmicAccordion>
 * 
 * // Minimal separated accordion
 * <CosmicAccordion 
 *   variant="minimal" 
 *   mode="separated"
 *   allowMultiple={true}
 * >
 *   <CosmicCollapsible title="FAQ Question 1">
 *     <p>Answer to question 1.</p>
 *   </CosmicCollapsible>
 *   <CosmicCollapsible title="FAQ Question 2">
 *     <p>Answer to question 2.</p>
 *   </CosmicCollapsible>
 * </CosmicAccordion>
 */

// Add these keyframes to your global CSS:
/* 
@keyframes cosmicParticlesShimmer {
  0% { opacity: 0.03; transform: translateY(0); }
  50% { opacity: 0.05; }
  100% { opacity: 0.03; transform: translateY(-2px); }
}
*/