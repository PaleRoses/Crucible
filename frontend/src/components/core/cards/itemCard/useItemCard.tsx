import { useRef, useMemo, useCallback } from 'react';
import { usePandaRippleEffect } from "../../../../../moonlight-ui/hooks/effecthooks/useRippleEffect";
import { useActivationHandler, ActivationHandlerOptions } from "../../../../../moonlight-ui/hooks/interactionhooks/useActivationHandler";
import useItemInteractionState from '../../../../../moonlight-ui/hooks/statehooks/useItemInteractionState';
import { useReducedMotion } from '../../../../../moonlight-ui/hooks/utilhooks/useAnimationSystem';
import { useCombinedEventHandlers, EventHandlers, EventHandler } from '../../../../../moonlight-ui/hooks/interactionhooks/useCombinedEventHandlers';
import { useTabEffect, TabEffectState } from '../../../../../moonlight-ui/hooks/effecthooks/useTabEffect';
import { ANIMATIONS } from './itemCardAnimations';

// Import shared animation definitions
import {
  pressVariant as sharedPressVariant,
  pressShrinkVariant,
  resetTransformVariant,
} from '../../../../../moonlight-ui/animations/interactionAnimations';

// Define minimal interfaces needed by the hook
export interface NavigationItemHook {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  description?: string;
  color?: string;
}

export interface ActivatableItemHook {
  id: string;
  href?: string;
}

export interface UseItemCardParams {
  item: NavigationItemHook;
  onClick?: (item: NavigationItemHook) => void;
  isMobile?: boolean;
  isScrolling?: boolean;
  showDescription?: boolean;
  showGlowEffect?: boolean;
  initialAnimation?: boolean;
  animationDelay?: number;
  reducedMotion?: boolean;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  height?: string;
  minHeight?: string;
  padding?: string;
  pressAnimationDuration?: number;
  initialTabHeight?: string;
  minTabHeight?: string;
}

export function useItemCard(params: UseItemCardParams) {
  const {
    item,
    onClick,
    isMobile = false,
    isScrolling = false,
    showDescription = false,
    initialAnimation = true,
    animationDelay = 0,
    reducedMotion: reducedMotionOverride,
    width, minWidth, maxWidth, height, minHeight,
    padding,
    pressAnimationDuration = 800,
    initialTabHeight = '20%',
    minTabHeight = '10%',
  } = params;

  // Create references
  const ref = useRef<HTMLButtonElement>(null);
  const motionIsReduced = useReducedMotion(reducedMotionOverride);

  // --- State Hooks ---
  const {
    isHovered, isFocused, isPressed,
    pressProgress, tabStyles, getAnimationVariant,
    eventHandlers,
    showHoverEffects
  } = useItemInteractionState(ref, {
      isMobile, isScrolling, initialTabHeight, minTabHeight, pressAnimationDuration,
  });

  const { triggerRipple } = usePandaRippleEffect(ref, {
      color: item.color || 'primary',
      isEnabled: !motionIsReduced,
      opacity: 0.8,
      duration: 600,
      zIndex: 10,
      autoTrigger: false
   });

  const handleActivation = useActivationHandler({
      item: item as ActivatableItemHook,
      onClick, // Pass the original onClick prop here
      isMobile,
      elementRef: ref as React.RefObject<HTMLElement>,
      feedbackDuration: 100,
      blurAfterActivation: true
   } as ActivationHandlerOptions<ActivatableItemHook>);

  // --- Prepare State for Hooks ---

  // Filter base event handlers for useCombinedEventHandlers
  const filteredEventHandlers = useMemo(() => {
    const handlers: EventHandlers = {};
    for (const key in eventHandlers) {
      if (Object.prototype.hasOwnProperty.call(eventHandlers, key) && typeof eventHandlers[key as keyof typeof eventHandlers] === 'function') {
          handlers[key] = eventHandlers[key as keyof typeof eventHandlers] as EventHandler<any>;
      }
    }
    return handlers;
  }, [eventHandlers]);

  // Custom click handler logic
  const handleCustomClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      triggerRipple(event);
      handleActivation();
  }, [triggerRipple, handleActivation]);

  const customClickHandlers = useMemo(() => ({
      onClick: handleCustomClick
  }), [handleCustomClick]);

  // Prepare state for useTabEffect
  const tabEffectState: TabEffectState = useMemo(() => ({
      isHovered,
      isFocused,
      isPressed,
      pressProgress,
      isReducedMotion: motionIsReduced,
      tabStyles // Pass calculated styles
  }), [isHovered, isFocused, isPressed, pressProgress, motionIsReduced, tabStyles]);

  // --- Call Custom Hooks ---

  // Combine event handlers
  const combinedEventHandlers = useCombinedEventHandlers(
      filteredEventHandlers,
      customClickHandlers
  );

  // Get props for tab and glow elements
  const { tabProps, glowProps } = useTabEffect(
      tabEffectState,
      ANIMATIONS.goldenTab, // Pass variants definition
      ANIMATIONS.tabGlow    // Pass variants definition
  );

  // --- Derived State & Styles ---
  const shouldShowDescription = !!(showDescription && item.description);
  const descriptionId = item.id + "-desc";

  // Memoize custom inline styles for sizing etc.
  const customStyles = useMemo(() => {
       const styles: React.CSSProperties = {};
       if (width) styles.width = width;
       if (minWidth) styles.minWidth = minWidth;
       if (maxWidth) styles.maxWidth = maxWidth;
       if (!shouldShowDescription && height) styles.height = height;
       if (minHeight) styles.minHeight = minHeight;
       if (padding) styles.padding = padding;
       return styles;
   }, [width, minWidth, maxWidth, height, minHeight, padding, shouldShowDescription]);

  // --- Animation Logic & Variants (for elements NOT handled by useTabEffect) ---
  const outerInitialVariant = initialAnimation && !motionIsReduced ? "hidden" : "visible";
  const outerAnimateVariant = "visible";
  const labelVariants = useMemo(() => ({
      initial: ANIMATIONS.label.initial,
      hover: ANIMATIONS.label.hover,
      press: sharedPressVariant
  }), []);

  const iconVariants = useMemo(() => ({
      initial: resetTransformVariant,
      press: pressShrinkVariant
  }), []);
  
  const labelAnimate = getAnimationVariant ? getAnimationVariant("label") : (isPressed ? 'press' : isHovered ? 'hover' : 'initial');
  const iconGlowAnimate = getAnimationVariant ? getAnimationVariant("glow") : (isPressed ? 'press' : isHovered ? 'hover' : 'initial');

  // Return everything the component needs
  return {
    // Refs
    ref,
    
    // States
    isHovered,
    isFocused, 
    isPressed,
    motionIsReduced,
    showHoverEffects,
    shouldShowDescription,
    descriptionId,
    
    // Props and handlers
    combinedEventHandlers,
    customStyles,
    tabProps,
    glowProps,
    
    // Animation states and variants
    outerInitialVariant,
    outerAnimateVariant,
    labelVariants,
    iconVariants,
    labelAnimate,
    iconGlowAnimate
  };
}