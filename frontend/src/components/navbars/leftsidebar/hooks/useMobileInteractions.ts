// useMobileInteractions.ts
import { useRef, useEffect } from 'react';

/**
 * Hook to manage mobile drawer interactions
 * * Handles:
 * - Click outside detection
 * - Focus trapping and management
 * - Keyboard accessibility (Escape key)
 * * NOTE: Swipe-up-to-dismiss functionality has been removed to avoid
 * conflicts with vertical scrolling within the drawer. Dismissal relies
 * on tapping the overlay/outside or using a dedicated close button.
 * * @param isOpen - Whether the mobile drawer is open
 * @param onClose - Function to close the drawer
 * @param enabled - Whether this hook's functionality is enabled (should be true only in mobile)
 * @returns Object containing references to the container and overlay elements
 */
const useMobileInteractions = (
  isOpen: boolean,
  onClose: () => void,
  enabled: boolean
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  // Click outside detection with external button handling
  useEffect(() => {
    if (!enabled || !isOpen) return;

    // Add a small delay flag to handle external button clicks
    let isProcessingExternalClick = false;

    const handleClickOutside = (event: MouseEvent) => {
      // Skip processing if we're handling an external button click
      if (isProcessingExternalClick) return;
      
      // Close when clicking outside the container, but not on external elements
      if (containerRef.current && 
          !containerRef.current.contains(event.target as Node)) {
        
        // Check if click target is the external toggle button
        // Assumes the external toggle button has this data attribute
        const isExternalToggle = (event.target as Element)?.closest?.('[data-sidebar-external-toggle="true"]');
        
        if (!isExternalToggle) {
          onClose();
        }
      }
    };

    // Set flag when external toggle is used
    const handleExternalToggle = () => {
      isProcessingExternalClick = true;
      // Use requestAnimationFrame or a minimal timeout to ensure the flag is reset after the click event bubbles up
      requestAnimationFrame(() => {
        isProcessingExternalClick = false;
      });
    };

    // Add event listener for external toggle
    // Ensure your external toggle button has data-sidebar-external-toggle="true"
    const externalToggleButton = document.querySelector('[data-sidebar-external-toggle="true"]');
    if (externalToggleButton) {
      externalToggleButton.addEventListener('click', handleExternalToggle);
    }

    // Use capture phase ('click' not 'mousedown') for reliability
    document.addEventListener('click', handleClickOutside, true);
    
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
      if (externalToggleButton) {
        externalToggleButton.removeEventListener('click', handleExternalToggle);
      }
    };
  }, [isOpen, onClose, enabled]);

  /* * Removed Swipe Gesture Detection useEffect block:
   * The previous logic here handled swipe-up-to-dismiss, which conflicted
   * with scrolling inside the drawer. Users should now rely on tapping 
   * outside the drawer or using a dedicated close button.
   */
  // useEffect(() => {
  //   if (!enabled || !isOpen || !containerRef.current) return;
  //   
  //   let touchStartY = 0;
  //   let touchEndY = 0;
  //   const MIN_SWIPE_DISTANCE = 50; // Minimum distance for a swipe in pixels
  //   
  //   const handleTouchStart = (e: TouchEvent) => {
  //     // Only track vertical swipes starting within the container
  //     if (e.target === containerRef.current || containerRef.current?.contains(e.target as Node)) {
  //       touchStartY = e.touches[0].clientY;
  //     } else {
  //       touchStartY = 0; // Reset if touch starts outside
  //     }
  //   };
  //   
  //   const handleTouchMove = (e: TouchEvent) => {
  //     if (touchStartY === 0) return; // Don't track if touch didn't start inside
  //     touchEndY = e.touches[0].clientY;
  //   };
  //   
  //   const handleTouchEnd = () => {
  //     if (touchStartY === 0 || touchEndY === 0) return; // Ensure we have start and end points
  //     
  //     // Calculate swipe direction and distance
  //     const swipeDistance = touchStartY - touchEndY;
  //     
  //     // If swiped up with enough distance, close the drawer
  //     if (swipeDistance > MIN_SWIPE_DISTANCE) {
  //       onClose();
  //     }
  //     
  //     // Reset values
  //     touchStartY = 0;
  //     touchEndY = 0;
  //   };
  //   
  //   const element = containerRef.current; // Capture ref value
  //   
  //   element.addEventListener('touchstart', handleTouchStart, { passive: true });
  //   element.addEventListener('touchmove', handleTouchMove, { passive: true });
  //   element.addEventListener('touchend', handleTouchEnd, { passive: true });
  //   
  //   return () => {
  //     if (element) {
  //       element.removeEventListener('touchstart', handleTouchStart);
  //       element.removeEventListener('touchmove', handleTouchMove);
  //       element.removeEventListener('touchend', handleTouchEnd);
  //     }
  //   };
  // }, [isOpen, onClose, enabled]);


  // Focus management: Store previous focus
  useEffect(() => {
    if (!enabled) return;
    
    if (isOpen) {
      // Store the currently focused element when drawer opens
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else if (previousFocusRef.current) {
      // Restore focus when closing, check if element still exists
      if (document.body.contains(previousFocusRef.current)) {
         previousFocusRef.current.focus();
      }
      previousFocusRef.current = null; // Clear ref after restoring
    }
  }, [isOpen, enabled]);

  // Focus management: Set initial focus in drawer
  useEffect(() => {
    if (!enabled || !isOpen || !containerRef.current) return;
    
    // Set initial focus after a short delay to ensure the drawer is rendered and visible
    const timer = setTimeout(() => {
      if (!containerRef.current) return; // Check ref again inside timeout
      const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        // Try focusing the first element, could be a close button or first nav item
        focusableElements[0].focus(); 
      } else {
        // Fallback: focus the container itself if no interactive elements found
        containerRef.current.focus(); 
      }
    }, 100); // Delay might need adjustment based on transition duration
    
    return () => clearTimeout(timer);
  }, [isOpen, enabled]);
  
  // Focus trap and Escape key handling
  useEffect(() => {
    if (!enabled || !isOpen || !containerRef.current) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close drawer on Escape key
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      
      // Handle Tab key for focus trapping
      if (e.key === 'Tab') {
        if (!containerRef.current) return;
        const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) {
            // If no focusable elements, prevent tabbing out
            e.preventDefault();
            return;
        };
        
        // Get first and last focusable elements
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // If shift+tab on first element, loop focus to last element
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } 
        // If tab on last element, loop focus to first element
        else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    // Add keydown listener to the document to capture events globally while drawer is open
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, enabled]); // containerRef is stable, no need to list
  
  return { 
    containerRef, // Keep as RefObject<HTMLDivElement | null>
    overlayRef  // Keep as RefObject<HTMLDivElement | null>
  };
};

export default useMobileInteractions;