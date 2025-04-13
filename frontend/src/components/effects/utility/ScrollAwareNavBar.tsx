/**
 * @file IntersectionObserverSpacer.tsx
 * @description A modern, performant spacer component that uses IntersectionObserver
 * for precise scroll detection with minimal DOM impact. Enhanced with comprehensive
 * anti-scroll measures while preserving keyboard navigation.
 */
import { useRef, useState, useEffect, useCallback } from 'react';

interface IntersectionObserverSpacerProps {
  /** React nodes to be rendered inside the spacer */
  children: React.ReactNode;
  
  /** Height of the spacer in pixels (default: 64) */
  height?: number;
  
  /** Additional class name for the container */
  className?: string;
  
  /** Additional inline styles for the container */
  style?: React.CSSProperties;
  
  /** Whether to apply extreme anti-scroll measures (default: true) */
  preventAllScrolling?: boolean;
  
  /** Whether to allow keyboard navigation (default: true) */
  allowKeyboardNavigation?: boolean;
}

/**
 * IntersectionObserverSpacer Component
 * Uses IntersectionObserver for precise scroll detection with
 * comprehensive anti-scroll measures while preserving keyboard navigation
 */
const IntersectionObserverSpacer = ({
  children,
  height = 64,
  className = '',
  style = {},
  preventAllScrolling = true,
  allowKeyboardNavigation = true, // New prop to control keyboard navigation
}: IntersectionObserverSpacerProps) => {
  // Reference to the sentinel element that will be observed
  const sentinelRef = useRef<HTMLDivElement>(null);
  
  // Reference to the container element
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State to track if sentinel is intersecting viewport
  const [isIntersecting, setIsIntersecting] = useState(true);
  
  // Prevent wheel events
  const preventWheel = useCallback((e: WheelEvent) => {
    if (preventAllScrolling) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, [preventAllScrolling]);
  
  // Prevent touch events
  const preventTouch = useCallback((e: TouchEvent) => {
    if (preventAllScrolling) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, [preventAllScrolling]);
  
  // Smart keyboard event handler that distinguishes between scrolling and UI navigation
  const preventKeyScroll = useCallback((e: KeyboardEvent) => {
    // Always allow Tab key for keyboard navigation
    if (e.key === 'Tab') {
      return; // Never interfere with Tab navigation
    }
    
    if (preventAllScrolling) {
      // Keys that can cause scrolling
      const scrollKeys = [
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'PageUp', 'PageDown', 'Home', 'End', 'Space'
      ];
      
      // Skip handling for any key if the target is a special interactive element
      const target = e.target as HTMLElement;
      if (target) {
        const tagName = target.tagName.toLowerCase();
        const role = target.getAttribute('role');
        
        // Allow arrow keys for these interactive elements
        const interactiveElements = [
          'select', 'option', 'input', 'textarea', 'button', 'a',
          // Also check for ARIA roles
          'menuitem', 'menu', 'menubar', 'listbox', 'combobox', 'radio', 'tab'
        ];
        
        // If the event target is an interactive element or has an interactive role, let it handle the key
        if (interactiveElements.includes(tagName) || 
            (role && interactiveElements.includes(role)) ||
            target.hasAttribute('aria-haspopup') ||
            target.hasAttribute('aria-expanded')) {
          return; // Let the interactive element handle its own keyboard navigation
        }
      }
      
      // Only prevent default for keys that would cause scrolling when not in an interactive context
      if (scrollKeys.includes(e.key) && !e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        // Don't use stopPropagation() to allow bubbling for UI navigation
      }
    }
  }, [preventAllScrolling]);
  
  // Set up event listeners to prevent scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !preventAllScrolling) return;
    
    // Use passive: false to allow preventDefault
    container.addEventListener('wheel', preventWheel as EventListener, { passive: false });
    container.addEventListener('touchstart', preventTouch as EventListener, { passive: false });
    container.addEventListener('touchmove', preventTouch as EventListener, { passive: false });
    container.addEventListener('keydown', preventKeyScroll as EventListener);
    
    return () => {
      container.removeEventListener('wheel', preventWheel as EventListener);
      container.removeEventListener('touchstart', preventTouch as EventListener);
      container.removeEventListener('touchmove', preventTouch as EventListener);
      container.removeEventListener('keydown', preventKeyScroll as EventListener);
    };
  }, [preventWheel, preventTouch, preventKeyScroll, preventAllScrolling]);
  
  // Set up IntersectionObserver to detect when the sentinel leaves viewport
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === 'undefined') return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        // Start observing slightly before element enters viewport
        rootMargin: '-1px 0px 0px 0px',
        threshold: 0,
      }
    );
    
    observer.observe(sentinel);
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  // Create spacer style
  const spacerStyle: React.CSSProperties = {
    height: `${height}px`,
    width: '100%',
    pointerEvents: 'none', // Ensures it doesn't interfere with mouse events
    touchAction: 'none',
    userSelect: 'none',
  };
  
  // Create container style - fixed when not intersecting
  const containerStyle: React.CSSProperties = {
    position: isIntersecting ? 'relative' : 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: `${height}px`,
    zIndex: 1000,
    overflow: 'visible', // Ensure dropdowns can appear outside
    pointerEvents: 'auto', // Allow interaction with the navigation
    touchAction: 'none', // Prevent touch scrolling
    userSelect: 'none', // Prevent text selection
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none', // IE/Edge
    WebkitOverflowScrolling: 'touch', // iOS momentum scrolling
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    ...style,
  };
  
  // Enhanced CSS styles for anti-scrolling while ensuring keyboard navigation works
  useEffect(() => {
    if (preventAllScrolling) {
      // Apply a CSS class to handle additional anti-scroll styles
      const styleEl = document.createElement('style');
      
      // Enhanced focus styles that ensure keyboard navigation works
      styleEl.innerHTML = `
        /* Base anti-scroll styles */
        .anti-scroll-element {
          -webkit-tap-highlight-color: transparent !important;
        }
        
        /* Hide scrollbars */
        .anti-scroll-element * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .anti-scroll-element *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        
        /* Touch and selection prevention */
        .anti-scroll-element * {
          touch-action: none !important;
          pointer-events: auto !important;
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
        }
        
        /* Ensure interactive elements can receive focus */
        .anti-scroll-element a,
        .anti-scroll-element button,
        .anti-scroll-element [role="button"],
        .anti-scroll-element [tabindex],
        .anti-scroll-element input,
        .anti-scroll-element select,
        .anti-scroll-element textarea {
          pointer-events: auto !important;
          touch-action: auto !important; /* Allow tapping on interactive elements */
        }
        
        /* Strong focus styles for keyboard navigation */
        .anti-scroll-element a:focus-visible,
        .anti-scroll-element button:focus-visible,
        .anti-scroll-element [role="button"]:focus-visible,
        .anti-scroll-element [tabindex]:focus-visible,
        .anti-scroll-element input:focus-visible,
        .anti-scroll-element select:focus-visible,
        .anti-scroll-element textarea:focus-visible {
          outline: 3px solid var(--color-primary) !important;
          outline-offset: 2px !important;
          box-shadow: 0 0 0 3px var(--color-glow) !important;
          position: relative !important;
          z-index: 1001 !important;
        }
        
        /* Basic focus styles for all browsers */
        .anti-scroll-element a:focus,
        .anti-scroll-element button:focus,
        .anti-scroll-element [role="button"]:focus,
        .anti-scroll-element [tabindex]:focus,
        .anti-scroll-element input:focus,
        .anti-scroll-element select:focus,
        .anti-scroll-element textarea:focus {
          outline: 1px solid #4285f4 !important;
        }
        
        /* Prevent text highlighting */
        .anti-scroll-element *::selection {
          background: transparent !important;
          color: inherit !important;
        }
      `;
      
      document.head.appendChild(styleEl);
      
      return () => {
        document.head.removeChild(styleEl);
      };
    }
  }, [preventAllScrolling, allowKeyboardNavigation]);
  
  return (
    <>
      {/* Sentinel element that will be observed */}
      <div 
        ref={sentinelRef}
        style={{
          height: '1px',
          width: '100%',
          position: 'relative',
          top: 0,
          pointerEvents: 'none',
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          outline: 'none',
        }}
        aria-hidden="true"
        tabIndex={-1}
        onWheel={(e) => e.preventDefault()}
      />
      
      {/*
        Spacer div that maintains document flow
        This ensures content below is properly positioned
      */}
      {!isIntersecting && (
        <div 
          style={spacerStyle} 
          aria-hidden="true" 
          tabIndex={-1}
          onWheel={(e) => e.preventDefault()}
        />
      )}
      
      {/*
        Container for the navigation element
        Position switches between relative and fixed based on scroll
      */}
      <div 
        ref={containerRef}
        className={`intersection-spacer-container ${className} ${preventAllScrolling ? 'anti-scroll-element' : ''}`}
        style={containerStyle}
        // Remove tabIndex={-1} to allow tab navigation to child elements
        aria-hidden="false" // Allow screen readers to access the navigation
        // React synthetic event handlers for mouse/touch
        onScroll={(e) => {
          if (preventAllScrolling) {
            e.preventDefault();
            e.stopPropagation();
            // Force scroll position to 0
            if (e.currentTarget) {
              e.currentTarget.scrollTop = 0;
              e.currentTarget.scrollLeft = 0;
            }
          }
        }}
        onClick={(e) => {
          // Prevent double-click selection
          if (preventAllScrolling && e.detail > 1) {
            e.preventDefault();
          }
        }}
        // Prevent selection
        onMouseDown={(e) => {
          if (preventAllScrolling) {
            // Only prevent default if this is a selection attempt
            if (e.detail > 1 || e.button === 0) {
              e.preventDefault();
            }
          }
        }}
        // Only prevent focus if keyboard navigation is disabled
        onFocus={(e) => {
          // Check if the focused element is the container itself, not its children
          if (preventAllScrolling && !allowKeyboardNavigation && e.target === e.currentTarget) {
            e.currentTarget.blur();
          }
        }}
      >
        {children}
      </div>
    </>
  );
};

// Smart document-level event listeners that preserve UI navigation
const setupDocumentEventListeners = () => {
  if (typeof window === 'undefined') return;

  // Track mouse state for selection prevention
  let isMouseDown = false;
  
  // Detect all scrolling attempts within the document and prevent them if they target our component
  document.addEventListener('wheel', (e) => {
    const target = e.target as HTMLElement;
    if (target?.closest?.('.anti-scroll-element')) {
      e.preventDefault();
      return false;
    }
  }, { passive: false, capture: true });
  
  // Track mouse down to prevent selection
  document.addEventListener('mousedown', (e) => {
    const target = e.target as HTMLElement;
    if (target?.closest?.('.anti-scroll-element')) {
      isMouseDown = true;
    }
  }, { capture: true });
  
  // Prevent selection on mousemove after mousedown
  document.addEventListener('mousemove', (e) => {
    if (isMouseDown) {
      const target = e.target as HTMLElement;
      if (target?.closest?.('.anti-scroll-element')) {
        e.preventDefault();
        // Cancel any ongoing selection
        if (window.getSelection) {
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
          }
        }
      }
    }
  }, { passive: false, capture: true });
  
  // Reset mouse state
  document.addEventListener('mouseup', () => {
    isMouseDown = false;
  }, { capture: true });
  
  // Sophisticated keyboard event handler that preserves UI navigation
  document.addEventListener('keydown', (e) => {
    // Never interfere with Tab navigation
    if (e.key === 'Tab') {
      return true;
    }
    
    const target = e.target as HTMLElement;
    if (target?.closest?.('.anti-scroll-element')) {
      // Check if target is an interactive element or has an interactive role
      const tagName = target.tagName.toLowerCase();
      const role = target.getAttribute('role');
      
      // List of elements and roles that should handle their own keyboard navigation
      const interactiveElements = [
        'select', 'option', 'input', 'textarea', 'button', 'a', 
        'menuitem', 'menu', 'menubar', 'listbox', 'combobox', 'radio', 'tab'
      ];
      
      // If this is an interactive element, let it handle its own keyboard events
      if (interactiveElements.includes(tagName) || 
          (role && interactiveElements.includes(role)) ||
          target.hasAttribute('aria-haspopup') ||
          target.hasAttribute('aria-expanded') ||
          target.getAttribute('contenteditable') === 'true') {
        
        // Allow all keyboard navigation for interactive elements
        return true;
      }
      
      // For non-interactive elements, prevent scrolling keys
      if (!e.altKey && !e.ctrlKey && !e.metaKey) {
        const scrollKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 
                           'PageUp', 'PageDown', 'Home', 'End', 'Space'];
        if (scrollKeys.includes(e.key)) {
          e.preventDefault();
          return false;
        }
      }
      
      // Prevent text selection with Shift+Arrow keys
      if (e.shiftKey && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        return false;
      }
    }
    
    return true;
  }, { passive: false, capture: true });
};

// Set up the document-level event listeners
if (typeof window !== 'undefined') {
  // Initialize once
  setupDocumentEventListeners();
}

export default IntersectionObserverSpacer;