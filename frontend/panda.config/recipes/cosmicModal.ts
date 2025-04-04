// panda.config/recipes/cosmicModal.ts

import { defineRecipe } from '@pandacss/dev';

/**
 * ====================================================================================
 * COSMIC MODAL - An elegant dialog component with lunar aesthetics
 * ====================================================================================
 * 
 * IMPORT INTO YOUR PANDA CONFIG:
 * 
 * import { 
 *   cosmicModalOverlay,
 *   cosmicModalContent,
 *   cosmicModalHeader,
 *   cosmicModalBody,
 *   cosmicModalFooter,
 *   cosmicModal
 * } from './panda.config/recipes/cosmicModal';
 * 
 * Then add to your config:
 * 
 * export default defineConfig({
 *   // ...other config
 *   theme: {
 *     extend: {
 *       recipes: {
 *         // Method 1: Add individual components
 *         ModalOverlay: cosmicModalOverlay,
 *         ModalContent: cosmicModalContent,
 *         ModalHeader: cosmicModalHeader,
 *         ModalBody: cosmicModalBody,
 *         ModalFooter: cosmicModalFooter,
 *         
 *         // Method 2: Or use the combined object
 *         // This adds all components with their original naming
 *         ...cosmicModal
 *       }
 *     }
 *   }
 * })
 * 
 * Features:
 * - Sophisticated entrance and exit animations
 * - Multiple visual variants with premium styling
 * - Responsive design that adapts to different screen sizes
 * - Various size presets for different content needs
 * - Proper focus management and keyboard navigation
 * - Complete with header, body, and footer sections
 * - Backdrop with customizable blur and opacity effects
 */

// Modal overlay/backdrop styling
export const cosmicModalOverlay = defineRecipe({
  className: 'cosmicModalOverlay',
  description: 'A cosmic-themed modal overlay with backdrop effects',
  base: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 'modal',
    padding: '1rem',
    overflow: 'hidden',
    backdropFilter: 'blur(4px)',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    
    // Default entrance states
    opacity: 0,
    visibility: 'hidden',
    
    // Open state
    '&[data-state="open"]': {
      opacity: 1,
      visibility: 'visible',
    },
    
    // For centering content on different screen sizes
    '@media (max-width: 640px)': {
      padding: '1rem',
      alignItems: 'flex-end', // Mobile: align to bottom
    },
  },
  
  variants: {
    variant: {
      standard: {
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
      
      minimal: {
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
      },
      
      cosmic: {
        // More intense backdrop blur for cosmic variant
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        
        // Subtle star-like pattern in background
        _after: {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle, var(--color-cosmic1) 1px, transparent 1px), 
            radial-gradient(circle, var(--color-cosmic2) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px, 150px 150px',
          backgroundPosition: '0 0, 50px 50px',
          opacity: 0.05,
          zIndex: -1,
          pointerEvents: 'none',
        },
      },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
  },
});

// Modal content container
export const cosmicModalContent = defineRecipe({
  className: 'cosmicModalContent',
  description: 'Cosmic-themed modal content with entrance animations',
  base: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'backgroundAlt',
    borderRadius: 'md',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    maxWidth: '90vw',
    maxHeight: '85vh',
    overflow: 'hidden',
    width: '100%',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    outline: 'none',
    
    // Default entrance states
    transform: 'scale(0.95) translateY(10px)',
    opacity: 0,
    
    // Open state
    '&[data-state="open"]': {
      transform: 'scale(1) translateY(0)',
      opacity: 1,
    },
    
    // Handle scrolling within modal content
    '& [data-modal-body]': {
      overflow: 'auto',
    },
    
    // Mobile adjustments
    '@media (max-width: 640px)': {
      maxHeight: '80vh',
      borderRadius: 'md md md 0',
      
      // Different entrance animation for mobile (slide up)
      transform: 'translateY(100%)',
      '&[data-state="open"]': {
        transform: 'translateY(0)',
      },
    },
  },
  
  variants: {
    variant: {
      standard: {
        backgroundColor: 'backgroundAlt',
        border: '1px solid',
        borderColor: 'border',
      },
      
      filled: {
        backgroundColor: 'color-mix(in srgb, var(--color-background) 95%, var(--color-primary))',
        border: '1px solid',
        borderColor: 'border',
      },
      
      minimal: {
        backgroundColor: 'background',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      },
      
      cosmic: {
        backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 95%, var(--color-primary))',
        border: '1px solid',
        borderColor: 'color-mix(in srgb, var(--color-border) 70%, var(--color-primary))',
        boxShadow: '0 0 25px var(--color-glow), 0 10px 25px rgba(0, 0, 0, 0.25)',
        
        // Left border accent
        _before: {
          content: '""',
          position: 'absolute',
          left: 0,
          top: '5%',
          height: '90%',
          width: '3px',
          backgroundColor: 'primary',
          borderRadius: '0 2px 2px 0',
          boxShadow: '0 0 8px var(--color-glow)',
        },
        
        // Subtle background pattern
        _after: {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle, var(--color-cosmic3) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          opacity: 0.03,
          zIndex: 0,
          pointerEvents: 'none',
        },
      },
    },
    
    size: {
      sm: {
        maxWidth: '400px',
      },
      
      md: {
        maxWidth: '520px',
      },
      
      lg: {
        maxWidth: '720px',
      },
      
      xl: {
        maxWidth: '960px',
      },
      
      full: {
        maxWidth: '90vw',
        width: '90vw',
        height: '85vh',
        
        '@media (max-width: 640px)': {
          height: '80vh',
        },
      },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
    size: 'md',
  },
});

// Modal header
export const cosmicModalHeader = defineRecipe({
  className: 'cosmicModalHeader',
  description: 'Cosmic-themed modal header with title and close button',
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid',
    borderColor: 'border',
    position: 'relative',
    
    // Title text
    '& [data-modal-title]': {
      fontFamily: 'heading',
      fontWeight: 'normal',
      letterSpacing: '0.1em',
      fontSize: '1.25rem',
      color: 'primary',
      margin: 0,
    },
    
    // Close button container
    '& [data-modal-close]': {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      border: 'none',
      color: 'textMuted',
      width: '32px',
      height: '32px',
      borderRadius: 'full',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginLeft: 'auto',
      padding: 0,
      
      _hover: {
        color: 'primary',
        backgroundColor: 'hover',
      },
      
      _active: {
        transform: 'scale(0.95)',
      },
      
      _focusVisible: {
        outline: '2px solid',
        outlineColor: 'primary',
        outlineOffset: '2px',
      },
    },
  },
  
  variants: {
    variant: {
      standard: {},
      
      filled: {
        backgroundColor: 'color-mix(in srgb, var(--color-background) 92%, var(--color-primary))',
      },
      
      minimal: {
        borderBottom: '1px solid',
        borderColor: 'border',
      },
      
      cosmic: {
        borderBottom: '1px solid',
        borderColor: 'color-mix(in srgb, var(--color-border) 70%, var(--color-primary))',
        boxShadow: 'inset 0 -5px 10px rgba(0, 0, 0, 0.05)',
        
        // Title with glow effect
        '& [data-modal-title]': {
          textShadow: '0 0 5px var(--color-glow)',
        },
        
        // Close button with cosmic styling
        '& [data-modal-close]': {
          _hover: {
            color: 'primary',
            boxShadow: '0 0 8px var(--color-glow)',
          },
        },
      },
    },
    
    // Adds image/icon support in header
    withIcon: {
      true: {
        '& [data-modal-header-content]': {
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        },
        
        '& [data-modal-icon]': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'primary',
          fontSize: '1.5rem',
        },
      },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
    withIcon: false,
  },
});

// Modal body
export const cosmicModalBody = defineRecipe({
  className: 'cosmicModalBody',
  description: 'Cosmic-themed modal body with content area',
  base: {
    padding: '1.25rem',
    color: 'text',
    position: 'relative',
    zIndex: 1,
    overflow: 'auto',
    
    // Set a min-height to ensure the modal has some content area
    minHeight: '100px',
    
    // Links within modal body
    '& a': {
      color: 'secondary',
      transition: 'color 0.2s ease',
      
      _hover: {
        color: 'primary',
      },
    },
  },
  
  variants: {
    variant: {
      standard: {},
      
      filled: {},
      
      minimal: {},
      
      cosmic: {
        // Adjust paragraph text for better readability
        '& p': {
          lineHeight: 1.6,
        },
        
        // Enhanced link styling
        '& a': {
          position: 'relative',
          color: 'secondary',
          
          _hover: {
            color: 'primary',
            textShadow: '0 0 3px var(--color-glow)',
          },
        },
      },
    },
    
    // Adjust padding size
    padding: {
      none: {
        padding: 0,
      },
      
      sm: {
        padding: '0.75rem',
      },
      
      md: {
        padding: '1.25rem',
      },
      
      lg: {
        padding: '1.75rem',
      },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
    padding: 'md',
  },
});

// Modal footer
export const cosmicModalFooter = defineRecipe({
  className: 'cosmicModalFooter',
  description: 'Cosmic-themed modal footer with action buttons',
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '1rem 1.25rem',
    borderTop: '1px solid',
    borderColor: 'border',
    gap: '0.75rem',
    position: 'relative',
    
    // On small screens, stack buttons vertically
    '@media (max-width: 480px)': {
      flexDirection: 'column-reverse',
      alignItems: 'stretch',
      
      '& button, & .button': {
        width: '100%',
        justifyContent: 'center',
      },
    },
  },
  
  variants: {
    variant: {
      standard: {},
      
      filled: {
        backgroundColor: 'color-mix(in srgb, var(--color-background) 95%, var(--color-primary))',
      },
      
      minimal: {
        borderTop: '1px solid',
        borderColor: 'border',
      },
      
      cosmic: {
        borderTop: '1px solid',
        borderColor: 'color-mix(in srgb, var(--color-border) 70%, var(--color-primary))',
        boxShadow: 'inset 0 5px 10px rgba(0, 0, 0, 0.05)',
      },
    },
    
    // Alignment options
    align: {
      start: {
        justifyContent: 'flex-start',
      },
      
      center: {
        justifyContent: 'center',
      },
      
      end: {
        justifyContent: 'flex-end',
      },
      
      between: {
        justifyContent: 'space-between',
      },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
    align: 'end',
  },
});

/**
 * Bulk export of all cosmic modal components
 */
export const cosmicModal = {
  overlay: cosmicModalOverlay,
  content: cosmicModalContent,
  header: cosmicModalHeader,
  body: cosmicModalBody,
  footer: cosmicModalFooter
};

/**
 * USAGE EXAMPLE (in a React component):
 * =====================================
 * 
 * // First, import the necessary components
 * import { useState, useRef, useEffect } from 'react';
 * import { 
 *   cosmicModalOverlay,
 *   cosmicModalContent,
 *   cosmicModalHeader,
 *   cosmicModalBody,
 *   cosmicModalFooter
 * } from './panda.config/recipes/cosmicModal';
 * 
 * // Define props interface for the Modal component
 * interface CosmicModalProps {
 *   isOpen: boolean;                // Whether the modal is visible
 *   onClose: () => void;            // Function to call when closing
 *   title: string;                  // Modal title text
 *   children: React.ReactNode;      // Modal body content
 *   icon?: React.ReactNode;         // Optional icon for the header
 *   variant?: 'standard' | 'filled' | 'minimal' | 'cosmic'; // Visual style
 *   size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'; // Size variant
 *   footer?: React.ReactNode;       // Optional footer content
 *   footerAlign?: 'start' | 'center' | 'end' | 'between'; // Footer alignment
 *   bodyPadding?: 'none' | 'sm' | 'md' | 'lg'; // Content padding size
 *   initialFocus?: React.RefObject<HTMLElement>; // Element to focus when opened
 * }
 * 
 * export function CosmicModal({
 *   isOpen,
 *   onClose,
 *   title,
 *   children,
 *   icon,
 *   variant = 'standard',
 *   size = 'md',
 *   footer,
 *   footerAlign = 'end',
 *   bodyPadding = 'md',
 *   initialFocus,
 * }: CosmicModalProps) {
 *   const [animationState, setAnimationState] = useState<'open' | 'closed'>(isOpen ? 'open' : 'closed');
 *   const dialogRef = useRef<HTMLDivElement>(null);
 *   const previouslyFocusedElement = useRef<HTMLElement | null>(null);
 *   
 *   // Handle open/close animations with a slight delay for exit animations
 *   useEffect(() => {
 *     if (isOpen) {
 *       setAnimationState('open');
 *     } else {
 *       const timer = setTimeout(() => {
 *         setAnimationState('closed');
 *       }, 300); // Match this to your transition duration
 *       return () => clearTimeout(timer);
 *     }
 *   }, [isOpen]);
 *   
 *   // Manage focus when modal opens/closes
 *   useEffect(() => {
 *     if (isOpen) {
 *       // Store previously focused element
 *       previouslyFocusedElement.current = document.activeElement as HTMLElement;
 *       
 *       // Set focus to either provided ref or the dialog itself
 *       if (initialFocus?.current) {
 *         initialFocus.current.focus();
 *       } else if (dialogRef.current) {
 *         dialogRef.current.focus();
 *       }
 *       
 *       // Lock body scroll
 *       document.body.style.overflow = 'hidden';
 *     } else if (previouslyFocusedElement.current) {
 *       // Restore focus when closed
 *       previouslyFocusedElement.current.focus();
 *       previouslyFocusedElement.current = null;
 *       
 *       // Restore scrolling
 *       document.body.style.overflow = '';
 *     }
 *     
 *     return () => {
 *       // Ensure scroll is restored on unmount
 *       document.body.style.overflow = '';
 *     };
 *   }, [isOpen, initialFocus]);
 *   
 *   // Handle click outside to close
 *   const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
 *     if (e.target === e.currentTarget) {
 *       onClose();
 *     }
 *   };
 *   
 *   // Handle escape key to close
 *   const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
 *     if (e.key === 'Escape') {
 *       onClose();
 *     }
 *   };
 *   
 *   // Create trap focus within modal
 *   const handleTabKey = (e: KeyboardEvent) => {
 *     if (!dialogRef.current || e.key !== 'Tab') return;
 *     
 *     const focusableElements = dialogRef.current.querySelectorAll(
 *       'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
 *     );
 *     
 *     const firstElement = focusableElements[0] as HTMLElement;
 *     const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
 *     
 *     if (e.shiftKey) {
 *       if (document.activeElement === firstElement) {
 *         lastElement.focus();
 *         e.preventDefault();
 *       }
 *     } else {
 *       if (document.activeElement === lastElement) {
 *         firstElement.focus();
 *         e.preventDefault();
 *       }
 *     }
 *   };
 *   
 *   // Add global keyboard listener for focus trapping
 *   useEffect(() => {
 *     if (isOpen) {
 *       document.addEventListener('keydown', handleTabKey);
 *     }
 *     
 *     return () => {
 *       document.removeEventListener('keydown', handleTabKey);
 *     };
 *   }, [isOpen]);
 *   
 *   // Skip rendering if closed and animation is complete
 *   if (!isOpen && animationState === 'closed') {
 *     return null;
 *   }
 *   
 *   // Get styles from recipes
 *   const overlayStyles = cosmicModalOverlay({ variant });
 *   const contentStyles = cosmicModalContent({ variant, size });
 *   const headerStyles = cosmicModalHeader({ variant, withIcon: !!icon });
 *   const bodyStyles = cosmicModalBody({ variant, padding: bodyPadding });
 *   const footerStyles = footer ? cosmicModalFooter({ variant, align: footerAlign }) : '';
 *   
 *   return (
 *     <div
 *       className={overlayStyles}
 *       data-state={animationState}
 *       onClick={handleBackdropClick}
 *       aria-hidden={!isOpen}
 *       role="presentation"
 *     >
 *       <div
 *         ref={dialogRef}
 *         className={contentStyles}
 *         data-state={animationState}
 *         role="dialog"
 *         aria-modal="true"
 *         aria-labelledby="modal-title"
 *         tabIndex={-1}
 *         onKeyDown={handleKeyDown}
 *       >
 *         <div className={headerStyles}>
 *           <div data-modal-header-content>
 *             {icon && <span data-modal-icon>{icon}</span>}
 *             <h2 id="modal-title" data-modal-title>{title}</h2>
 *           </div>
 *           
 *           <button
 *             data-modal-close
 *             onClick={onClose}
 *             aria-label="Close modal"
 *             type="button"
 *           >
 *             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 *               <line x1="18" y1="6" x2="6" y2="18"></line>
 *               <line x1="6" y1="6" x2="18" y2="18"></line>
 *             </svg>
 *           </button>
 *         </div>
 *         
 *         <div data-modal-body className={bodyStyles}>
 *           {children}
 *         </div>
 *         
 *         {footer && (
 *           <div className={footerStyles}>
 *             {footer}
 *           </div>
 *         )}
 *       </div>
 *     </div>
 *   );
 * }
 * 
 * // EXAMPLES OF USAGE:
 * 
 * // Basic modal
 * <CosmicModal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   title="Basic Modal"
 * >
 *   <p>This is a standard modal with default styling.</p>
 * </CosmicModal>
 * 
 * // Cosmic variant with custom footer
 * <CosmicModal
 *   isOpen={isCosmicModalOpen}
 *   onClose={() => setIsCosmicModalOpen(false)}
 *   title="Cosmic Modal"
 *   variant="cosmic"
 *   size="lg"
 *   icon={<span>✨</span>}
 *   footer={
 *     <>
 *       <button onClick={() => setIsCosmicModalOpen(false)}>Cancel</button>
 *       <button className="primaryButton">Confirm</button>
 *     </>
 *   }
 * >
 *   <p>This modal features the cosmic styling with glow effects.</p>
 *   <p>It also has a custom footer with action buttons.</p>
 * </CosmicModal>
 */

// Add these keyframe animations to your global CSS or Panda CSS config:
/* 
@keyframes cosmicModalEnter {
  0% {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes cosmicModalExit {
  0% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  100% {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
}

@media (max-width: 640px) {
  @keyframes cosmicModalEnter {
    0% {
      opacity: 0;
      transform: translateY(100%);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes cosmicModalExit {
    0% {
      opacity: 1;
      transform: translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateY(100%);
    }
  }
}
*/