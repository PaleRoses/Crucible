// moonlight-ui/animations/interactionAnimations.ts
import { TargetAndTransition, Variant } from 'framer-motion';

// Define common transitions (Optional but good practice)
const transitions = {
  mediumEaseOut: { duration: 0.4, ease: "easeOut" },
  fastEaseOut: { duration: 0.1, ease: "easeOut" },
  fadeInDefault: { duration: 0.4, ease: "easeOut" },
};

// --- Press Shrink Variant (for Icon) --- NEW ---
// Use this as a variant target for elements that should shrink on press
export const pressShrinkVariant: Variant = {
    scale: 0.9,
    // Optionally reset other properties if needed during press
    rotate: 0, // Ensure rotation resets if applied on hover
    transition: transitions.mediumEaseOut // Use medium ease out
  };
  

  export const resetTransformVariant: Variant = {
    scale: 1,
    rotate: 0
    // Add other common reset properties if needed (e.g., y: 0)
  };

// Define reusable shadow values (Ideally, import these from a shared theme/constants file)
const shadows = {
  hover: '0 4px 12px rgba(0, 0, 0, 0.2)',
  pressed: '0 1px 4px rgba(0, 0, 0, 0.1)',
};

// --- Hover Effect ---
// Use this object directly in the `whileHover` prop
export const hoverEffect: TargetAndTransition = {
  scale: 1.02,
  boxShadow: shadows.hover,
  transition: transitions.mediumEaseOut,
};

// --- Tap Effect ---
// Use this object directly in the `whileTap` prop for immediate feedback
export const tapEffect: TargetAndTransition = {
  scale: 0.97,
  boxShadow: shadows.pressed,
  transition: transitions.fastEaseOut,
};

// --- Press Variant ---
// Use this as a variant target, typically driven by an `isPressed` state via the `animate` prop
// Example: Subtle positional shift (can be customized)
export const pressVariant: Variant = {
  y: 1, // Subtle downward shift
  // scale: 0.98, // Optionally slightly different scale than tap
  transition: transitions.mediumEaseOut,
};

// You could also create variants combining scale/shadow if preferred for use with `animate`
export const pressScaleVariant: Variant = {
    scale: 0.97,
    boxShadow: shadows.pressed,
    transition: transitions.fastEaseOut,
}

// --- Fade In Variant ---
// Use this as a variant target for elements fading in
export const fadeInVariant: Variant = {
  opacity: 1,
  transition: transitions.fadeInDefault,
};

// Example of a variant combining fade-in with a subtle slide-up
export const fadeInSlideUpVariant: Variant = {
    opacity: 1,
    y: 0,
    transition: { ...transitions.fadeInDefault, duration: 0.5 } // slightly longer for slide
}

// Corresponding initial state for fadeInSlideUpVariant
export const fadeSlideInitial: Variant = {
    opacity: 0,
    y: 5 // Start slightly lower
}

