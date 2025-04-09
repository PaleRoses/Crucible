// useMobileInteractions.ts
import { useRef, useEffect } from 'react';

/**
 * Hook to manage mobile drawer interactions
 * 
 * Handles:
 * - Click outside detection
 * - Swipe gesture detection
 * - Focus trapping and management
 * - Keyboard accessibility
 * 
 * @param isOpen - Whether the mobile drawer is open
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
        const isExternalToggle = (event.target as Element)?.closest?.('[data-sidebar-external-toggle="true"]');
        
        if (!isExternalToggle) {
          onClose();
        }
      }
    };

    // Set flag when external toggle is used
    const handleExternalToggle = () => {
      isProcessingExternalClick = true;
      setTimeout(() => {
        isProcessingExternalClick = false;
      }, 100); // Small delay to prevent immediate re-triggering
    };

    // Add event listener for external toggle
    const externalToggleButton = document.querySelector('[data-sidebar-external-toggle="true"]');
    if (externalToggleButton) {
      externalToggleButton.addEventListener('click', handleExternalToggle);
    }

    // Use capture phase ('click' not 'mousedown')
    document.addEventListener('click', handleClickOutside, true);
    
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
      if (externalToggleButton) {
        externalToggleButton.removeEventListener('click', handleExternalToggle);
      }
    };
  }, [isOpen, onClose, enabled]);

  // Swipe gesture detection
  useEffect(() => {
    if (!enabled || !isOpen || !containerRef.current) return;
    
    let touchStartY = 0;
    let touchEndY = 0;
    const MIN_SWIPE_DISTANCE = 50; // Minimum distance for a swipe in pixels
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      touchEndY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = () => {
      // Calculate swipe direction and distance
      const swipeDistance = touchStartY - touchEndY;
      
      // If swiped up with enough distance, close the drawer
      if (swipeDistance > MIN_SWIPE_DISTANCE) {
        onClose();
      }
      
      // Reset values
      touchStartY = 0;
      touchEndY = 0;
    };
    
    const element = containerRef.current;
    
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      if (element) {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [isOpen, onClose, enabled]);

  // Focus management
  useEffect(() => {
    if (!enabled) return;
    
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else if (previousFocusRef.current) {
      // Restore focus when closing
      previousFocusRef.current.focus();
    }
  }, [isOpen, enabled]);

  // Initial focus
  useEffect(() => {
    if (!enabled || !isOpen || !containerRef.current) return;
    
    // Set initial focus after a short delay to ensure the drawer is visible
    const timer = setTimeout(() => {
      const focusableElements = containerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;
      
      if (focusableElements && focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isOpen, enabled]);
  
  // Focus trap
  useEffect(() => {
    if (!enabled || !isOpen || !containerRef.current) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close drawer on Escape key
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      
      if (e.key !== 'Tab') return;
      
      const focusableElements = containerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;
      
      if (!focusableElements || focusableElements.length === 0) return;
      
      // Get first and last focusable elements
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      // If shift+tab on first element, move to last element
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } 
      // If tab on last element, move to first element
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, enabled]);
  
  return { containerRef, overlayRef };
};

export default useMobileInteractions;