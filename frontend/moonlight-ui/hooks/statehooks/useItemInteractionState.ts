import { useState, useMemo, useCallback, RefObject } from 'react';
import { useHoverEffects } from '../interactionhooks/useHoverEffects';
import { usePressAndHold } from '../interactionhooks/usePressAndHold';

// Types
export type AnimationVariant = "initial" | "hover" | "press";
export type NativeButtonEvents = React.ButtonHTMLAttributes<HTMLButtonElement>;
export type CombinedEventHandlersResult = Omit<NativeButtonEvents, 'style' | 'className'>;

export interface MouseEventHandlerProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseDown?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseUp?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseMove?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface TouchEventHandlerProps {
  onTouchStart?: (event: React.TouchEvent<HTMLButtonElement>) => void;
  onTouchEnd?: (event: React.TouchEvent<HTMLButtonElement>) => void;
}

export interface FocusEventHandlerProps {
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;
}

/**
 * Type definition for tab indicator styles
 * Ensures consistent structure for style objects
 */
export interface TabStyles {
  height: string;
  top: string;
}

// Hook options type
export interface ItemInteractionStateOptions {
  /**
   * Whether the component is being rendered in a mobile context
   * Affects interaction behaviors and animations
   */
  isMobile?: boolean;
  /**
   * Whether the page is currently scrolling
   * When true, some hover effects are disabled
   */
  isScrolling?: boolean;
  /**
   * Initial height of the tab indicator (as percentage)
   * Used for the default/idle state
   */
  initialTabHeight?: string;
  /**
   * Minimum height the tab can shrink to when pressed (as percentage)
   * Sets the lower bound for press animation
   */
  minTabHeight?: string;
  /**
   * Duration for the press animation in milliseconds
   * Controls how long the press effect takes to complete
   */
  pressAnimationDuration?: number;
}

// Hook result type
export interface ItemInteractionStateResult {
  /** Whether the element is currently being hovered */
  isHovered: boolean;
  /** Whether the element currently has DOM focus */
  isFocused: boolean;
  /** Whether the element is currently being pressed */
  isPressed: boolean;
  /** Progress value of the press animation (0 to 1) */
  pressProgress: number;
  /** Calculated styles for the tab indicator based on interaction state */
  tabStyles: TabStyles;
  /** Function that returns the appropriate animation variant based on current state */
  getAnimationVariant: (componentType: string) => AnimationVariant;
  /** Combined event handlers to spread onto the interactive element */
  eventHandlers: CombinedEventHandlersResult;
  /** Whether hover effects should be shown based on interaction state priority */
  showHoverEffects: boolean;
}

/**
 * A hook for managing comprehensive interaction states for interactive elements.
 * Handles hover, focus, and press states with appropriate priority, and provides
 * animation variants and style calculations.
 * 
 * @param ref - A ref to the DOM element to track interactions for
 * @param options - Configuration options for the interaction behavior
 * @returns Object containing interaction states, event handlers, and derived values
 */
export const useItemInteractionState = (
  ref: RefObject<HTMLButtonElement | null>,
  options: ItemInteractionStateOptions = {}
): ItemInteractionStateResult => {
  const {
    isMobile = false,
    isScrolling = false,
    initialTabHeight = '20%',
    minTabHeight = '10%',
    pressAnimationDuration = 800,
  } = options;

  // Focus state tracking
  const [hasDomFocus, setHasDomFocus] = useState(false);
  const focusEventHandlers: FocusEventHandlerProps = useMemo(() => ({
    onFocus: () => setHasDomFocus(true),
    onBlur: () => setHasDomFocus(false),
  }), []);

  // Hover state tracking
  const { isHovered, mousePosition, eventHandlers: hoverHandlers } =
    useHoverEffects(ref, { isMobile, isScrolling });

  // Press-and-hold state tracking using the imported hook
  const {
    isPressed,
    pressProgress,
    tabStyles: pressTabStyles,
    eventHandlers: pressHandlers
  } = usePressAndHold({
    initialHeight: initialTabHeight,
    minHeight: minTabHeight,
    duration: pressAnimationDuration,
  });

  // Combine all event handlers (focus, hover, press)
  const combinedHandlers: CombinedEventHandlersResult = useMemo(() => ({
    ...hoverHandlers,
    ...pressHandlers,
    ...focusEventHandlers,
  }), [hoverHandlers, pressHandlers, focusEventHandlers]);

  // Calculate final tab styles based on interaction state priority
  const tabStyles: TabStyles = useMemo(() => {
    // Press state has highest priority
    if (isPressed) {
      // Ensure we return the correct shape regardless of what pressTabStyles contains
      return {
        height: typeof pressTabStyles.height === 'string' ? pressTabStyles.height : initialTabHeight,
        top: typeof pressTabStyles.top === 'string' ? pressTabStyles.top : '40%'
      };
    }
    // Focus state has next priority
    if (hasDomFocus) {
      return { height: '70%', top: '15%' };
    }
    // Hover state next
    if (isHovered && !isScrolling) {
      if (isMobile) {
        return { height: '60%', top: '20%' };
      }
      // Desktop hover with mouse position effect
      const baseHeight = 60;
      const heightRange = 10;
      const calculatedHeight = `${baseHeight + (mousePosition.y * heightRange)}%`;
      const effectiveHeight = baseHeight + (mousePosition.y * heightRange);
      const minTop = 15;
      const maxTop = 85 - effectiveHeight;
      const rawPosition = Math.max(minTop, Math.min(maxTop, mousePosition.y * 100));
      return { height: calculatedHeight, top: `${rawPosition}%` };
    }
    // Default/idle state
    return { height: initialTabHeight, top: '40%' };
  }, [
    isPressed, pressTabStyles, hasDomFocus, isHovered,
    isScrolling, isMobile, mousePosition.y, initialTabHeight
  ]);

  // Generate the appropriate animation variant name
  const getAnimationVariant = useCallback((componentType: string): AnimationVariant => {
    if (isPressed) return "press";
    if (hasDomFocus || isHovered) return "hover";
    return "initial";
  }, [isPressed, hasDomFocus, isHovered]);

  // Calculate showHoverEffects based on internal state
  const showHoverEffects = useMemo(() => isHovered && !hasDomFocus && !isScrolling && !isPressed,
    [isHovered, hasDomFocus, isScrolling, isPressed]
  );

  return {
    isHovered,
    isFocused: hasDomFocus,
    isPressed,
    pressProgress,
    tabStyles,
    getAnimationVariant,
    eventHandlers: combinedHandlers,
    showHoverEffects,
  };
};

export default useItemInteractionState;