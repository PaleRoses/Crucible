import { useMemo } from 'react';
import { MotionProps, TargetAndTransition, VariantLabels } from 'framer-motion';

// ==========================================================
// TYPES & INTERFACES
// ==========================================================

/**
 * Represents the calculated height and top styles for the tab,
 * typically provided by a state management hook like useItemInteractionState.
 */
export interface TabStyles {
  height: string | number;
  top: string | number;
}

/**
 * Input state required by the useTabEffect hook.
 */
export interface TabEffectState {
  isHovered: boolean;
  isFocused: boolean; // Used for variant selection logic
  isPressed: boolean;
  pressProgress: number; // For dynamic opacity calculation during press
  isReducedMotion: boolean; // To disable animations if needed
  tabStyles: TabStyles; // Pre-calculated height and top styles
}

/**
 * Optional configuration for the tab effect (currently unused, placeholder).
 */
export interface TabEffectConfig {
  // Future options like custom durations, colors could go here.
}

/**
 * Props intended to be spread onto the main golden tab motion.div element.
 */
export interface TabElementProps extends Pick<MotionProps, 'style' | 'initial' | 'animate' | 'variants' | 'transition'> {
  // Add any other specific props derived from the hook if needed in the future
}

/**
 * Props intended to be spread onto the tab glow motion.div element.
 */
export interface GlowElementProps extends Pick<MotionProps, 'initial' | 'animate' | 'variants' | 'transition'> {
 // Add any other specific props derived from the hook if needed in the future
}


/**
 * The object returned by the useTabEffect hook.
 */
export interface UseTabEffectResult {
  tabProps: TabElementProps;
  glowProps: GlowElementProps;
  // Note: Props for the static glow container div are not returned by this hook.
}

// ==========================================================
// HOOK IMPLEMENTATION
// ==========================================================

/**
 * Custom React hook to manage the state and animation props for a "golden tab"
 * and its associated glow effect based on interaction state.
 *
 * @param state - The current interaction and style state required for calculations.
 * @param tabVariants - Framer Motion variants definition for the main tab element.
 * @param glowVariants - Framer Motion variants definition for the glow element.
 * @returns {UseTabEffectResult} An object containing props to spread onto the tab and glow motion elements.
 */
export function useTabEffect(
  state: TabEffectState,
  tabVariants: MotionProps['variants'],
  glowVariants: MotionProps['variants']
  // config: TabEffectConfig = {} // Config parameter placeholder for future use
): UseTabEffectResult {

  const { isHovered, isFocused, isPressed, pressProgress, isReducedMotion, tabStyles } = state;

  // --- Calculate Dynamic Styles ---
  // Memoize the calculation of styles that change frequently based on interaction.
  const dynamicTabStyle = useMemo(() => {
    // Calculate dynamic opacity based on press state and progress (0.7 to 1.0)
    // If motion is reduced, we could force opacity to 1, but let's handle via animateControl instead.
    const dynamicOpacity = isPressed ? 0.7 + (0.3 * (1 - pressProgress)) : 1;

    // Combine pre-calculated height/top with dynamic opacity
    return {
      height: tabStyles.height,
      top: tabStyles.top,
      opacity: dynamicOpacity,
    };
    // Dependencies: Recalculate when press state, progress, or base styles change.
  }, [isPressed, pressProgress, tabStyles.height, tabStyles.top]);

  // --- Select Animation Variant ---
  // Helper function to determine the target variant label based on interaction state.
  const selectVariant = (hovered: boolean, focused: boolean, pressed: boolean): VariantLabels => {
    // Prioritize 'press', then 'hover'. Focus state could be added if needed.
    if (pressed) return 'press';
    if (hovered) return 'hover';
    // if (focused) return 'focus'; // Example: Add focus variant if defined
    return 'initial'; // Default state
  };

  // Memoize the active variant label based on the interaction state.
  const activeVariant = useMemo(() => {
    return selectVariant(isHovered, isFocused, isPressed);
  }, [isHovered, isFocused, isPressed]);

  // --- Handle Reduced Motion ---
  // Determine the 'animate' prop value. If motion is reduced, force to 'initial' state,
  // otherwise use the dynamically selected active variant.
  const animateControl = isReducedMotion ? 'initial' : activeVariant;

  // --- Assemble and Return Props ---
  // Memoize the final returned object containing props for the tab and glow elements.
  // This ensures the consuming component only re-renders if these specific props change.
  return useMemo(() => ({
    tabProps: {
      style: dynamicTabStyle, // Apply the calculated dynamic styles
      initial: "initial",     // Define the starting variant state
      animate: animateControl,// Control the target animation state (handles reduced motion)
      variants: tabVariants,  // Pass the provided variants definition
      // transition prop could be added here for specific overrides, but usually rely on variants.
    },
    glowProps: {
      initial: "initial",     // Define the starting variant state
      animate: animateControl,// Glow animation follows the same state control
      variants: glowVariants, // Pass the provided variants definition
    },
  }), [dynamicTabStyle, animateControl, tabVariants, glowVariants]);
  // Dependencies: Recalculate if styles, animation control, or variant definitions change.
}
