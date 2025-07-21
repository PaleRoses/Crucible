import { useRef, useState, useCallback, useMemo } from 'react';

// Simplified interfaces
export interface NavigationItemHook {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  description?: string;
  color?: string;
}

export interface UseItemCardParams {
  item: NavigationItemHook;
  onClick?: (item: NavigationItemHook) => void;
  isMobile?: boolean;
  isScrolling?: boolean;
  showDescription?: boolean;
  initialAnimation?: boolean;
  animationDelay?: number;
  reducedMotion?: boolean;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  height?: string;
  minHeight?: string;
  padding?: string;
}

export function useItemCard(params: UseItemCardParams) {
  const {
    item,
    onClick,
    isMobile = false,
    isScrolling = false,
    showDescription = false,
    initialAnimation = true,
    reducedMotion = false,
    width, minWidth, maxWidth, height, minHeight,
    padding,
  } = params;

  // Create references
  const ref = useRef<HTMLButtonElement>(null);

  // Simple state management
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Basic event handlers
  const handleMouseEnter = useCallback(() => {
    if (!isScrolling && !isMobile) {
      setIsHovered(true);
    }
  }, [isScrolling, isMobile]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleMouseDown = useCallback(() => {
    setIsPressed(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  // Simple ripple effect trigger
  const triggerRipple = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (!reducedMotion && ref.current) {
      const button = ref.current;
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Create ripple element
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      // Add to button and remove after animation
      button.appendChild(ripple);
      setTimeout(() => {
        ripple.remove();
      }, 600);
    }
  }, [reducedMotion]);

  // Handle click with ripple
  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    triggerRipple(event);
    if (onClick) {
      onClick(item);
    } else if (item.href) {
      // Simple navigation fallback
      window.location.href = item.href;
    }
  }, [item, onClick, triggerRipple]);

  // Combined event handlers
  const combinedEventHandlers = {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onClick: handleClick,
  };

  // Simple animation variant selection
  const getAnimationVariant = useCallback(() => {
    if (isPressed) return 'press';
    if (isHovered || isFocused) return 'hover';
    return 'initial';
  }, [isPressed, isHovered, isFocused]);

  // Tab styles (simplified)
  const tabStyles = useMemo(() => {
    if (isPressed) {
      return { height: '10%', top: '45%' };
    }
    if (isFocused) {
      return { height: '70%', top: '15%' };
    }
    if (isHovered && !isScrolling) {
      return { height: '60%', top: '20%' };
    }
    return { height: '20%', top: '40%' };
  }, [isPressed, isFocused, isHovered, isScrolling]);

  // Custom styles
  const customStyles = useMemo(() => {
    const styles: React.CSSProperties = {};
    if (width) styles.width = width;
    if (minWidth) styles.minWidth = minWidth;
    if (maxWidth) styles.maxWidth = maxWidth;
    if (!showDescription && height) styles.height = height;
    if (minHeight) styles.minHeight = minHeight;
    if (padding) styles.padding = padding;
    return styles;
  }, [width, minWidth, maxWidth, height, minHeight, padding, showDescription]);

  // Simplified tab and glow props
  const tabProps = {
    style: tabStyles,
    initial: "initial",
    animate: getAnimationVariant(),
  };

  const glowProps = {
    initial: "initial",
    animate: getAnimationVariant(),
  };

  return {
    // Refs
    ref,
    
    // States
    isHovered,
    isFocused, 
    isPressed,
    motionIsReduced: reducedMotion,
    showHoverEffects: isHovered && !isFocused && !isScrolling && !isPressed,
    shouldShowDescription: !!(showDescription && item.description),
    descriptionId: item.id + "-desc",
    
    // Props and handlers
    combinedEventHandlers,
    customStyles,
    tabProps,
    glowProps,
    
    // Animation states
    outerInitialVariant: initialAnimation && !reducedMotion ? "hidden" : "visible",
    outerAnimateVariant: "visible",
    labelVariants: {
      initial: { scale: 1 },
      hover: { scale: 1.05 },
      press: { scale: 0.95 }
    },
    iconVariants: {
      initial: { scale: 1, rotate: 0 },
      press: { scale: 0.9, rotate: 0 }
    },
    labelAnimate: getAnimationVariant(),
    iconGlowAnimate: getAnimationVariant()
  };
}