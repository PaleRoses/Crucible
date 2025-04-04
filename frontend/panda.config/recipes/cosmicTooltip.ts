// src/styled-system/recipes/cosmicTooltip.ts

import { cva } from '../../styled-system/css';

/**
 * Cosmic Tooltip - An elegant tooltip component with luxury styling
 * 
 * Features:
 * - Multiple positioning options (top, right, bottom, left)
 * - Visual variants from subtle to cosmic
 * - Size options for different content needs
 * - Arrow indicator pointing to the trigger element
 * - Smooth fade animations on enter/exit
 * - Proper accessibility attributes
 */

// Main tooltip container
export const cosmicTooltip = cva({
  base: {
    position: 'absolute',
    zIndex: 'tooltip',
    maxWidth: '300px',
    width: 'max-content',
    pointerEvents: 'none',
    opacity: 0,
    visibility: 'hidden',
    transition: 'opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease',
    fontFamily: 'body',
    fontSize: 'tooltip',
    fontWeight: 'normal',
    lineHeight: '1.4',
    letterSpacing: '0.05em',
    
    // Show the tooltip when parent has data-tooltip-open="true"
    '[data-tooltip-open="true"] &': {
      opacity: 1,
      visibility: 'visible',
    },
    
    // Tooltip content container
    '& .tooltip-content': {
      position: 'relative',
      padding: '0.5rem 0.75rem',
      borderRadius: 'md',
      color: 'text',
      backgroundColor: 'backgroundAlt',
      border: '1px solid',
      borderColor: 'border',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      whiteSpace: 'normal',
      wordBreak: 'break-word',
      textAlign: 'center',
    },
    
    // Arrow element pointing to the trigger
    '& .tooltip-arrow': {
      position: 'absolute',
      width: '8px',
      height: '8px',
      backgroundColor: 'backgroundAlt',
      border: '1px solid',
      transform: 'rotate(45deg)',
      zIndex: 'base',
    },
  },
  
  variants: {
    // Position variants
    position: {
      top: {
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%) translateY(-10px)',
        marginBottom: '10px',
        
        '[data-tooltip-open="true"] &': {
          transform: 'translateX(-50%) translateY(0)',
        },
        
        '& .tooltip-arrow': {
          bottom: '-4px',
          left: '50%',
          marginLeft: '-4px',
          borderTop: 'none',
          borderLeft: 'none',
          borderColor: 'border',
        },
      },
      
      bottom: {
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%) translateY(10px)',
        marginTop: '10px',
        
        '[data-tooltip-open="true"] &': {
          transform: 'translateX(-50%) translateY(0)',
        },
        
        '& .tooltip-arrow': {
          top: '-4px',
          left: '50%',
          marginLeft: '-4px',
          borderBottom: 'none',
          borderRight: 'none',
          borderColor: 'border',
        },
      },
      
      left: {
        right: '100%',
        top: '50%',
        transform: 'translateY(-50%) translateX(-10px)',
        marginRight: '10px',
        
        '[data-tooltip-open="true"] &': {
          transform: 'translateY(-50%) translateX(0)',
        },
        
        '& .tooltip-arrow': {
          right: '-4px',
          top: '50%',
          marginTop: '-4px',
          borderLeft: 'none',
          borderBottom: 'none',
          borderColor: 'border',
        },
      },
      
      right: {
        left: '100%',
        top: '50%',
        transform: 'translateY(-50%) translateX(10px)',
        marginLeft: '10px',
        
        '[data-tooltip-open="true"] &': {
          transform: 'translateY(-50%) translateX(0)',
        },
        
        '& .tooltip-arrow': {
          left: '-4px',
          top: '50%',
          marginTop: '-4px',
          borderRight: 'none',
          borderTop: 'none',
          borderColor: 'border',
        },
      },
    },
    
    // Visual style variants
    variant: {
      // Standard tooltip
      standard: {
        // Base styles already provide standard styling
      },
      
      // Light tooltip with subtle border
      light: {
        '& .tooltip-content': {
          backgroundColor: 'color-mix(in srgb, var(--color-background) 95%, var(--color-text))',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
          color: 'textMuted',
        },
        '& .tooltip-arrow': {
          backgroundColor: 'color-mix(in srgb, var(--color-background) 95%, var(--color-text))',
        },
      },
      
      // Dark tooltip with higher contrast
      dark: {
        '& .tooltip-content': {
          backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 90%, var(--color-primary))',
          color: 'text',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        },
        '& .tooltip-arrow': {
          backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 90%, var(--color-primary))',
        },
      },
      
      // Cosmic style with subtle star effects and glow
      cosmic: {
        '& .tooltip-content': {
          backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 95%, var(--color-primary))',
          borderColor: 'color-mix(in srgb, var(--color-border) 70%, var(--color-primary))',
          color: 'text',
          boxShadow: '0 0 15px var(--color-glow)',
          
          // Add cosmic background effect
          _before: {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              radial-gradient(circle, var(--color-cosmic1) 1px, transparent 1px), 
              radial-gradient(circle, var(--color-cosmic2) 1px, transparent 1px)
            `,
            backgroundSize: '14px 14px, 20px 20px',
            backgroundPosition: '0 0, 7px 7px',
            opacity: 0.05,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            zIndex: -1,
          },
        },
        
        '& .tooltip-arrow': {
          backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 95%, var(--color-primary))',
          borderColor: 'color-mix(in srgb, var(--color-border) 70%, var(--color-primary))',
          boxShadow: '0 0 5px var(--color-glow)',
        },
      },
      
      // Accent style with primary color background
      accent: {
        '& .tooltip-content': {
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, var(--color-backgroundAlt))',
          borderColor: 'primary',
          color: 'primary',
        },
        '& .tooltip-arrow': {
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, var(--color-backgroundAlt))',
          borderColor: 'primary',
        },
      },
    },
    
    // Size variants
    size: {
      sm: {
        fontSize: 'xs',
        '& .tooltip-content': {
          padding: '0.25rem 0.5rem',
          maxWidth: '200px',
        },
      },
      
      md: {
        // Base styles already cover medium size
      },
      
      lg: {
        fontSize: 'base',
        '& .tooltip-content': {
          padding: '0.75rem 1rem',
          maxWidth: '400px',
        },
      },
    },
    
    // Arrow visibility
    hasArrow: {
      true: {
        '& .tooltip-arrow': {
          display: 'block',
        },
      },
      false: {
        '& .tooltip-arrow': {
          display: 'none',
        },
      },
    },
  },
  
  // Compound variants for special combinations
  compoundVariants: [
    // Add extra spacing for tooltips without arrows
    {
      hasArrow: false,
      position: 'top',
      css: {
        marginBottom: '5px',
      },
    },
    {
      hasArrow: false,
      position: 'bottom',
      css: {
        marginTop: '5px',
      },
    },
    {
      hasArrow: false,
      position: 'left',
      css: {
        marginRight: '5px',
      },
    },
    {
      hasArrow: false,
      position: 'right',
      css: {
        marginLeft: '5px',
      },
    },
  ],
  
  // Default variants
  defaultVariants: {
    position: 'top',
    variant: 'standard',
    size: 'md',
    hasArrow: true,
  },
});

/**
 * Usage Example (in a React component):
 * 
 * import { cosmicTooltip } from '../styled-system/recipes/cosmicTooltip';
 * import { useState, useRef, useId } from 'react';
 * 
 * interface TooltipProps {
 *   content: React.ReactNode;
 *   children: React.ReactElement;
 *   position?: 'top' | 'right' | 'bottom' | 'left';
 *   variant?: 'standard' | 'light' | 'dark' | 'cosmic' | 'accent';
 *   size?: 'sm' | 'md' | 'lg';
 *   hasArrow?: boolean;
 *   showOnClick?: boolean;
 *   delayShow?: number;
 *   delayHide?: number;
 * }
 * 
 * function CosmicTooltipComponent({
 *   content,
 *   children,
 *   position = 'top',
 *   variant = 'standard',
 *   size = 'md',
 *   hasArrow = true,
 *   showOnClick = false,
 *   delayShow = 200,
 *   delayHide = 200,
 * }: TooltipProps) {
 *   const [isVisible, setIsVisible] = useState(false);
 *   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
 *   const tooltipId = useId();
 *   
 *   // Get styles from recipe
 *   const tooltipStyles = cosmicTooltip({
 *     position,
 *     variant,
 *     size,
 *     hasArrow,
 *   });
 *   
 *   // Show tooltip with delay
 *   const showTooltip = () => {
 *     if (timeoutRef.current) {
 *       clearTimeout(timeoutRef.current);
 *     }
 *     timeoutRef.current = setTimeout(() => {
 *       setIsVisible(true);
 *     }, delayShow);
 *   };
 *   
 *   // Hide tooltip with delay
 *   const hideTooltip = () => {
 *     if (timeoutRef.current) {
 *       clearTimeout(timeoutRef.current);
 *     }
 *     timeoutRef.current = setTimeout(() => {
 *       setIsVisible(false);
 *     }, delayHide);
 *   };
 *   
 *   // Toggle tooltip for click behavior
 *   const toggleTooltip = () => {
 *     setIsVisible(prev => !prev);
 *   };
 *   
 *   // Clean up timeout on unmount
 *   useEffect(() => {
 *     return () => {
 *       if (timeoutRef.current) {
 *         clearTimeout(timeoutRef.current);
 *       }
 *     };
 *   }, []);
 *   
 *   // Clone the child element to add event handlers and ARIA attributes
 *   const triggerElement = React.cloneElement(children, {
 *     onMouseEnter: showOnClick ? children.props.onMouseEnter : showTooltip,
 *     onMouseLeave: showOnClick ? children.props.onMouseLeave : hideTooltip,
 *     onFocus: showOnClick ? children.props.onFocus : showTooltip,
 *     onBlur: showOnClick ? children.props.onBlur : hideTooltip,
 *     onClick: showOnClick ? (e: React.MouseEvent) => {
 *       toggleTooltip();
 *       if (children.props.onClick) {
 *         children.props.onClick(e);
 *       }
 *     } : children.props.onClick,
 *     'aria-describedby': isVisible ? tooltipId : undefined,
 *     'data-tooltip-open': isVisible,
 *   });
 *   
 *   return (
 *     <>
 *       {triggerElement}
 *       
 *       <div 
 *         id={tooltipId}
 *         role="tooltip"
 *         className={tooltipStyles}
 *       >
 *         <div className="tooltip-content">
 *           {content}
 *         </div>
 *         {hasArrow && <div className="tooltip-arrow" />}
 *       </div>
 *     </>
 *   );
 * }
 * 
 * // Example usage:
 * function App() {
 *   return (
 *     <CosmicTooltipComponent
 *       content="This is a cosmic tooltip with a beautiful glow effect"
 *       variant="cosmic"
 *     >
 *       <button>Hover me</button>
 *     </CosmicTooltipComponent>
 *   );
 * }
 */