/**
 * useActivationHandler.ts
 * A flexible hook for handling element activations with optional routing and mobile feedback.
 */
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Generic interface for activation items, defining expected properties
 * for any item type that can be activated.
 */
export interface ActivatableItem {
  /** Unique identifier for the item */
  id: string;
  /** Optional URL to navigate to when activated */
  href?: string;
  /** Any additional properties allowed */
  [key: string]: any;
}

/**
 * Configuration options for the activation handler
 */
export interface ActivationHandlerOptions<T extends ActivatableItem> {
  /** Item being activated */
  item: T;
  
  /** Optional callback when item is activated - takes precedence over href navigation */
  onClick?: (item: T) => void;
  
  /** Optional custom navigation function (if not using the built-in Next.js router) */
  navigateFunction?: (href: string) => void;
  
  /** Is the component running in a mobile context? Affects touch feedback */
  isMobile?: boolean;
  
  /** Reference to the element receiving visual feedback */
  elementRef?: React.RefObject<HTMLElement>;
  
  /** Duration of mobile touch feedback in milliseconds */
  feedbackDuration?: number;
  
  /** Whether to blur the element after activation (for accessibility) */
  blurAfterActivation?: boolean;
}

/**
 * Hook for handling element activations with routing support and mobile feedback effects.
 * 
 * This hook provides a reusable way to handle activation logic for interactive elements,
 * supporting both direct callbacks and automatic navigation, with optional visual feedback
 * for touch interfaces.
 * 
 * @example
 * // Basic usage with Next.js router
 * const buttonRef = useRef<HTMLButtonElement>(null);
 * const handleActivate = useActivationHandler({
 *   item: { id: '1', href: '/dashboard', label: 'Dashboard' },
 *   onClick: (item) => console.log(`Clicked ${item.label}`),
 *   elementRef: buttonRef
 * });
 * 
 * @example
 * // Custom navigation function
 * const handleActivate = useActivationHandler({
 *   item: { id: '1', href: '/products/123' },
 *   navigateFunction: (href) => history.push(href)
 * });
 *
 * @template T Type extending ActivatableItem
 * @param options Configuration options
 * @returns Callback function that performs the activation
 */
export function useActivationHandler<T extends ActivatableItem>(
  options: ActivationHandlerOptions<T>
): () => void {
  const {
    item,
    onClick,
    navigateFunction,
    isMobile = false,
    elementRef,
    feedbackDuration = 100,
    blurAfterActivation = true
  } = options;

  // Access Next.js router - we allow override via navigateFunction
  const router = useRouter();

  return useCallback(() => {
    const performAction = () => {
      // Priority: custom click handler > custom navigation > default Next.js routing
      if (onClick) {
        onClick(item);
      } else if (item.href) {
        if (navigateFunction) {
          navigateFunction(item.href);
        } else {
          router.push(item.href);
        }
      }
      
      // Blur after activation for better accessibility
      if (blurAfterActivation && elementRef?.current) {
        elementRef.current.blur();
      }
    };

    // Mobile-specific feedback animation
    if (isMobile && elementRef?.current) {
      const element = elementRef.current;
      // Apply scale down effect
      element.style.transform = 'scale(0.98)';
      
      // Restore original state after animation completes
      setTimeout(() => {
        if (element) element.style.transform = '';
      }, feedbackDuration);
      
      // Perform action midway through animation for better perceived performance
      setTimeout(performAction, feedbackDuration / 2);
    } else {
      // Immediate activation on non-mobile devices
      performAction();
    }
  }, [item, onClick, navigateFunction, router, isMobile, elementRef, feedbackDuration, blurAfterActivation]);
}

/**
 * This hook is useful for components such as:
 * 
 * - Navigation menus, cards, and buttons
 * - Interactive list items
 * - Tab controls
 * - Accordion headers
 * - Card components with navigation
 * - Any clickable UI element that needs consistent activation behavior
 * 
 * The hook handles both routing and direct callback actions, while providing
 * tactile feedback for mobile interfaces and managing focus appropriately.
 */