// useMobileInteractions.ts
import { useRef, useEffect } from 'react';

/**
 * Hook to manage mobile drawer interactions
 * * Handles:
 * - Click outside detection
 * - Focus trapping and management
 * - Keyboard accessibility (Escape key)
 * * NOTE: Swipe-up-to-dismiss functionality has been commented out to avoid
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

  /* * START: Swipe Gesture Detection (Commented Out)
   * The following useEffect block handles swipe-up-to-dismiss.
   * It is commented out because it conflicts with the standard vertical 
   * scrolling behavior within the mobile drawer.
   */
  /*
  useEffect(() => {
    // Exit early if the hook is not enabled, the drawer isn't open, or the container ref isn't set
    if (!enabled || !isOpen || !containerRef.current) return;
    
    let touchStartY = 0; // Y-coordinate where the touch started
    let touchEndY = 0;   // Y-coordinate where the touch ended
    const MIN_SWIPE_DISTANCE = 50; // Minimum vertical distance in pixels to qualify as a swipe

    // Handler for the touchstart event
    const handleTouchStart = (e: TouchEvent) => {
      // Only track vertical swipes starting directly on or within the container element
      if (e.target === containerRef.current || containerRef.current?.contains(e.target as Node)) {
        touchStartY = e.touches[0].clientY; // Record the starting Y position
        touchEndY = touchStartY; // Initialize endY to startY
      } else {
        // Reset if touch starts outside the designated container area
        touchStartY = 0;
        touchEndY = 0;
      }
    };
    
    // Handler for the touchmove event
    const handleTouchMove = (e: TouchEvent) => {
      // Only update the end coordinate if a valid touch start was recorded
      if (touchStartY === 0) return; 
      touchEndY = e.touches[0].clientY; // Update the ending Y position as the finger moves
    };
    
    // Handler for the touchend event
    const handleTouchEnd = () => {
      // Ensure we have valid start and end points before calculating the swipe
      if (touchStartY === 0 || touchEndY === 0) return; 
      
      // Calculate the vertical distance and direction of the swipe
      // Positive value indicates an upward swipe
      const swipeDistance = touchStartY - touchEndY;
      
      // If the user swiped upwards by at least the minimum distance, trigger the close action
      if (swipeDistance > MIN_SWIPE_DISTANCE) {
        onClose(); // Call the provided close function
      }
      
      // Reset coordinates for the next touch interaction
      touchStartY = 0;
      touchEndY = 0;
    };
    
    // Capture the current value of the container ref to use in the cleanup function
    const element = containerRef.current; 
    
    // Add event listeners to the container element
    // 'passive: true' optimizes scrolling performance by indicating the listener won't call preventDefault()
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Cleanup function: Remove event listeners when the component unmounts or dependencies change
    return () => {
      if (element) {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [isOpen, onClose, enabled]); // Dependencies for the effect
  */
  /* * END: Swipe Gesture Detection (Commented Out)
   */


  // Focus management: Store previous focus
  useEffect(() => {
    if (!enabled) return;
    
    if (isOpen) {
      // Store the currently focused element when drawer opens
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else if (previousFocusRef.current) {
      // Restore focus when closing, check if element still exists in the DOM
      if (document.body.contains(previousFocusRef.current)) {
         previousFocusRef.current.focus();
      }
      previousFocusRef.current = null; // Clear ref after restoring or if element is gone
    }
  }, [isOpen, enabled]);

  // Focus management: Set initial focus in drawer
  useEffect(() => {
    if (!enabled || !isOpen || !containerRef.current) return;
    
    // Set initial focus after a short delay to ensure the drawer is rendered and visible, allowing transitions to start
    const timer = setTimeout(() => {
      if (!containerRef.current) return; // Double-check ref inside timeout callback
      const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
        // Standard selector for focusable elements
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        // Try focusing the first interactive element (e.g., close button, first link)
        focusableElements[0].focus(); 
      } else {
        // Fallback: focus the container itself if no interactive elements are found
        // Ensure the container can receive focus by adding tabIndex="-1" if needed, though it's often focusable by default
        containerRef.current.setAttribute('tabindex', '-1'); // Make it programmatically focusable
        containerRef.current.focus(); 
      }
    }, 100); // 100ms delay; adjust if transitions are longer/shorter
    
    // Cleanup: clear the timeout if the component unmounts or dependencies change before it fires
    return () => clearTimeout(timer);
  }, [isOpen, enabled]);
  
  // Focus trap and Escape key handling
  useEffect(() => {
    if (!enabled || !isOpen || !containerRef.current) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close drawer on Escape key press
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      
      // Handle Tab key press for focus trapping logic
      if (e.key === 'Tab') {
        if (!containerRef.current) return; // Ensure container exists
        // Find all focusable elements within the drawer
        const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        // If there are no focusable elements, prevent tabbing out of the drawer
        if (focusableElements.length === 0) {
            e.preventDefault(); 
            return;
        };
        
        // Identify the first and last focusable elements in the sequence
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // If Shift+Tab is pressed while the first element is focused, loop focus to the last element
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault(); // Prevent default tab behavior
          lastElement.focus(); // Move focus to the last element
        } 
        // If Tab is pressed while the last element is focused, loop focus to the first element
        else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault(); // Prevent default tab behavior
          firstElement.focus(); // Move focus to the first element
        }
        // Default tab behavior (moving between elements within the trap) is allowed otherwise
      }
    };
    
    // Add keydown listener to the document to capture Escape/Tab keys globally while the drawer is open
    document.addEventListener('keydown', handleKeyDown);
    // Cleanup: remove the listener when the component unmounts or dependencies change
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, enabled]); // Dependencies for the effect
  
  // Return refs for the container and overlay (overlayRef might be used for styling or other interactions)
  return { 
    containerRef, // Ref to the main drawer container div
    overlayRef  // Ref to the background overlay div (optional usage)
  };
};

export default useMobileInteractions;
