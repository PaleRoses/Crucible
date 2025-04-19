import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Event handler types for mouse interactions related to hover
 */
export interface MouseHoverHandlerProps<T extends Element = HTMLElement> {
  /** Handler for when the mouse enters the element */
  onMouseEnter?: (event: React.MouseEvent<T>) => void;
  /** Handler for when the mouse leaves the element */
  onMouseLeave?: (event: React.MouseEvent<T>) => void;
  /** Handler for mouse movement over the element */
  onMouseMove?: (event: React.MouseEvent<T>) => void;
}

/**
 * Configuration options for the hover effects hook
 */
export interface HoverEffectsOptions {
  /** 
   * Is the component being used in a mobile context?
   * @default false
   */
  isMobile?: boolean;
  
  /**
   * Is the parent container or page currently scrolling?
   * @default false
   */
  isScrolling?: boolean;
  
  /**
   * Should hover effects be disabled during scrolling?
   * @default true
   */
  disableHoverOnScroll?: boolean;
  
  /**
   * Should mouse movement be tracked on mobile devices?
   * Usually unnecessary due to touch interactions.
   * @default false
   */
  trackMouseMoveOnMobile?: boolean;
  
  /**
   * Throttle delay for mouse move events in milliseconds
   * @default 0 (uses requestAnimationFrame)
   */
  mouseMoveThrottleMs?: number;
  
  /**
   * Initial hover state
   * @default false
   */
  initialHovered?: boolean;
}

/**
 * Result returned by the useHoverEffects hook
 */
export interface HoverEffectsResult<T extends Element = HTMLElement> {
  /** Whether the element is currently being hovered */
  isHovered: boolean;
  
  /** 
   * Normalized mouse position relative to the element (0-1) 
   * Where (0,0) is top-left and (1,1) is bottom-right
   */
  mousePosition: { x: number, y: number };
  
  /** Event handlers to attach to the element */
  eventHandlers: MouseHoverHandlerProps<T>;
  
  /** Manually set the hover state */
  setHovered: (isHovered: boolean) => void;
  
  /** Manually set the mouse position */
  setMousePosition: (position: { x: number, y: number }) => void;
}

/**
 * A hook that provides advanced hover state tracking with mouse position coordinates.
 * 
 * This hook enriches hover interactions by not only tracking whether an element is hovered,
 * but also providing normalized coordinates of the mouse position within the element.
 * It includes optimizations like requestAnimationFrame batching for mouse move events
 * and intelligent disabling of hover effects during scrolling to prevent jank.
 * 
 * The hook is designed to work well in both desktop and mobile contexts, with special
 * considerations for touch interactions and different performance characteristics.
 * 
 * Common use cases include:
 * - Creating directional hover effects that respond to mouse position
 * - Building hover cards with position-aware animations
 * - Implementing custom tooltips that follow the cursor
 * - Creating interactive elements with "magnetic" behaviors
 * 
 * @example
 * ```jsx
 * function HoverCard() {
 *   const cardRef = useRef(null);
 *   const { isHovered, mousePosition, eventHandlers } = useHoverEffects(cardRef);
 *   
 *   // Calculate a tilt effect based on mouse position
 *   const tiltX = isHovered ? (mousePosition.y - 0.5) * 10 : 0;
 *   const tiltY = isHovered ? (mousePosition.x - 0.5) * -10 : 0;
 *   
 *   return (
 *     <div 
 *       ref={cardRef} 
 *       {...eventHandlers}
 *       style={{ 
 *         transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
 *         transition: isHovered ? 'none' : 'transform 0.5s ease',
 *         padding: '2rem',
 *         background: '#fff',
 *         borderRadius: '8px',
 *         boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
 *       }}
 *     >
 *       Hover me for a 3D effect!
 *     </div>
 *   );
 * }
 * ```
 * 
 * @template T - The type of HTML element being tracked
 * @param ref - React ref object pointing to the element to track
 * @param options - Configuration options for hover behavior
 * @returns Object containing hover state, mouse position, and event handlers
 */
export function useHoverEffects<T extends Element>(
  ref: React.RefObject<T | null>,
  options: HoverEffectsOptions = {}
): HoverEffectsResult<T> {
  const { 
    isMobile = false, 
    isScrolling = false, 
    disableHoverOnScroll = true, 
    trackMouseMoveOnMobile = false,
    initialHovered = false
  } = options;

  // Core state
  const [isHovered, setIsHovered] = useState<boolean>(initialHovered);
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

  // Refs for performance optimization
  const rafRef = useRef<number | null>(null);
  const pendingMoveRef = useRef<{ x: number, y: number } | null>(null);
  
  // Handler for mouse enter events
  const handleMouseEnter = useCallback(() => {
    // Skip hover activation if scrolling and disable option is true
    if (!(isScrolling && disableHoverOnScroll)) {
      setIsHovered(true);
    }
  }, [isScrolling, disableHoverOnScroll]);

  // Handler for mouse leave events
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
    
    // Clean up any pending animation frames
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // Process mouse move with requestAnimationFrame to batch updates
  const processMouseMove = useCallback(() => {
    if (pendingMoveRef.current) {
      setMousePosition(pendingMoveRef.current);
      pendingMoveRef.current = null;
    }
    rafRef.current = null;
  }, []);
  
  // Handler for mouse move events
  const handleMouseMove = useCallback((e: React.MouseEvent<T>) => {
    // Skip mouse move tracking under certain conditions
    if (!isHovered || (!trackMouseMoveOnMobile && isMobile) || !ref.current) {
      // Reset mouse position if it was previously set
      if (mousePosition.x !== 0 || mousePosition.y !== 0) {
        setMousePosition({ x: 0, y: 0 });
      }
      return;
    }
    
    const rect = ref.current.getBoundingClientRect();
    // Bail early if element is detached from DOM
    if (rect.width === 0) return;
    
    // Calculate normalized coordinates (0-1) relative to element dimensions
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normalizedX = Math.min(1, Math.max(0, x / rect.width));
    const normalizedY = Math.min(1, Math.max(0, y / rect.height));
    
    // Store the pending position
    pendingMoveRef.current = { x: normalizedX, y: normalizedY };
    
    // Schedule an update if one isn't already pending
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(processMouseMove);
    }
  }, [isHovered, isMobile, trackMouseMoveOnMobile, ref, mousePosition.x, mousePosition.y, processMouseMove]);
  
  // Effect to disable hover during scrolling
  useEffect(() => {
    if (isHovered && isScrolling && disableHoverOnScroll) {
      setIsHovered(false);
      setMousePosition({ x: 0, y: 0 });
    }
  }, [isScrolling, disableHoverOnScroll, isHovered]);
  
  // Clean up any pending animation frames on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  // Compile all event handlers
  const eventHandlers: MouseHoverHandlerProps<T> = {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onMouseMove: handleMouseMove
  };

  return {
    isHovered,
    mousePosition,
    eventHandlers,
    setHovered: setIsHovered,
    setMousePosition
  };
}

/**
 * A simpler version of useHoverEffects that doesn't track mouse position.
 * Useful when you only need hover state and not detailed position tracking.
 */
export function useHover<T extends Element>(
  ref: React.RefObject<T | null>,
  options: Omit<HoverEffectsOptions, 'trackMouseMoveOnMobile'> = {}
) {
  const { 
    isHovered, 
    eventHandlers, 
    setHovered 
  } = useHoverEffects(ref, {
    ...options,
    trackMouseMoveOnMobile: false
  });
  
  // Only include the mouse enter/leave handlers, not move
  const simplifiedHandlers: Pick<MouseHoverHandlerProps<T>, 'onMouseEnter' | 'onMouseLeave'> = {
    onMouseEnter: eventHandlers.onMouseEnter,
    onMouseLeave: eventHandlers.onMouseLeave
  };
  
  return {
    isHovered,
    eventHandlers: simplifiedHandlers,
    setHovered
  };
}

export default useHoverEffects;