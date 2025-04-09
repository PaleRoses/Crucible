import { useEffect, useRef } from 'react';

/**
 * Hook for managing modal behavior with keyboard focus trapping and restoration
 * Handles Escape key closing, focus management, and Tab key trapping
 * 
 * @param isOpen - Whether the modal is currently open
 * @param onClose - Function to close the modal
 * @param modalId - The DOM ID of the modal element
 * @param triggerButtonSelector - CSS selector for the button that triggered the modal
 */
export function useModalBehavior(
  isOpen: boolean,
  onClose: () => void,
  modalId: string,
  triggerButtonSelector: string
) {
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    
    // Store the currently focused element to restore later
    lastFocusedElementRef.current = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Tab') {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) return;
        
        // Find all focusable elements in the modal
        const focusableSelector = `
          #${modalId} a[href]:not([tabindex="-1"]),
          #${modalId} button:not([disabled]):not([tabindex="-1"]),
          #${modalId} [role="menuitem"]:not([tabindex="-1"]),
          #${modalId} [role="link"]:not([tabindex="-1"])
        `;
        const potentialElements = Array.from(modalElement.querySelectorAll<HTMLElement>(focusableSelector));
        
        // Filter out elements that are hidden or in inert containers
        const focusableElements = potentialElements.filter(el =>
          el.offsetParent !== null && !el.closest('[inert]')
        );

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const currentActive = document.activeElement as HTMLElement;

        // Handle focus wrapping
        if (e.shiftKey) {
          if (currentActive === firstElement || !modalElement.contains(currentActive)) {
            e.preventDefault();
            lastElement.focus(); // Wrap to last
          }
        } else {
          if (currentActive === lastElement || !modalElement.contains(currentActive)) {
            e.preventDefault();
            firstElement.focus(); // Wrap to first
          }
        }
      }
    };

    // Set initial focus on first focusable element
    setTimeout(() => {
      const modalElement = document.getElementById(modalId);
      if (!modalElement) return;
      
      const firstFocusableElement = modalElement.querySelector<HTMLElement>(
        `a[href]:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"]), [role="menuitem"]:not([tabindex="-1"]), [role="link"]:not([tabindex="-1"])`
      );
      
      if (firstFocusableElement && firstFocusableElement.offsetParent !== null && !firstFocusableElement.closest('[inert]')) {
        firstFocusableElement.focus();
      }
    }, 100);

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus when modal closes
      if (lastFocusedElementRef.current && document.body.contains(lastFocusedElementRef.current)) {
        if (typeof lastFocusedElementRef.current.focus === 'function') {
          lastFocusedElementRef.current.focus();
        }
      } else {
        // Fallback to trigger button if original element lost
        const triggerButton = document.querySelector<HTMLElement>(triggerButtonSelector);
        triggerButton?.focus();
      }
      lastFocusedElementRef.current = null;
    };
  }, [isOpen, onClose, modalId, triggerButtonSelector]);
}

export default useModalBehavior;