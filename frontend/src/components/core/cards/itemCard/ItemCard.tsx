'use client';

import React from 'react';
import { motion, HTMLMotionProps, AnimatePresence } from 'framer-motion';
import { cx } from "../../../../../styled-system/css"; // Adjust path as needed

// Import shared animation definitions needed for whileHover/whileTap
import {
  hoverEffect,
  tapEffect,
} from '../../../../../moonlight-ui/animations/interactionAnimations';

// Import our custom hook and other separated modules
import { useItemCard } from './useItemCard';
import { ANIMATIONS } from './itemCardAnimations';
import {
  cardStyle,
  cardWithDescriptionStyle,
  goldenTabStyle,
  tabGlowContainerStyle,
  tabGlowStyle,
  headerContainerStyle,
  iconContainerStyle,
  glowEffectStyle,
  labelStyle,
  descriptionStyle,
  expandedDescriptionStyle
} from './itemCardStyles';

// Type to handle motion.button props correctly
type MotionButtonProps = HTMLMotionProps<"button">;

// ==========================================================
// TYPES & INTERFACES - Included in component file
// ==========================================================
export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  description?: string;
  color?: string;
}

interface ActivatableItem {
    id: string;
    href?: string;
    // Add other properties if useActivationHandler relies on them
}

export interface ItemCardProps {
  item: NavigationItem;
  onClick?: (item: NavigationItem) => void;
  isMobile?: boolean;
  isScrolling?: boolean;
  showDescription?: boolean;
  showGlowEffect?: boolean;
  className?: string;
  style?: React.CSSProperties;
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

// ==========================================================
// MAIN COMPONENT (ItemCard) - Using useItemCard hook
// ==========================================================
const ItemCard: React.FC<ItemCardProps> = React.memo((props) => {
  const {
    item,
    showGlowEffect = true,
    className,
    style,
    animationDelay = 0
  } = props;

  // Use our custom hook to manage all the logic
  const {
    ref,
    isHovered,
    isFocused, 
    isPressed,
    motionIsReduced,
    showHoverEffects,
    shouldShowDescription,
    descriptionId,
    combinedEventHandlers,
    customStyles,
    tabProps,
    glowProps,
    outerInitialVariant,
    outerAnimateVariant,
    labelVariants,
    iconVariants,
    labelAnimate,
    iconGlowAnimate
  } = useItemCard(props);

  // --- Render ---
  return (
    <motion.div
      className={className}
      style={{ ...style }}
      data-has-description={shouldShowDescription}
      variants={ANIMATIONS.item}
      initial={outerInitialVariant}
      animate={outerAnimateVariant}
      transition={{ delay: animationDelay, duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
      layout={!motionIsReduced}
    >
      <motion.button
        ref={ref}
        type="button"
        className={cx(
            cardStyle,
            shouldShowDescription && cardWithDescriptionStyle,
            'item-card'
        )}
        style={customStyles}
        data-hovered={isHovered} 
        data-focused={isFocused} 
        data-pressed={isPressed} 
        data-has-description={shouldShowDescription}
        whileHover={!motionIsReduced && !isFocused ? hoverEffect : undefined}
        whileTap={!motionIsReduced ? tapEffect : undefined}
        {...(combinedEventHandlers as unknown as MotionButtonProps)}
        aria-pressed={isPressed} 
        aria-label={item.label}
        aria-describedby={shouldShowDescription ? descriptionId : undefined}
      >
        {/* Icon Glow Effect */}
         <AnimatePresence>
           {showGlowEffect && !shouldShowDescription && !motionIsReduced &&
            (showHoverEffects || isFocused || isPressed) && item.icon && (
             <motion.div
              className={glowEffectStyle}
              data-pressed={isPressed}
              variants={ANIMATIONS.glow}
              initial="initial"
              animate={iconGlowAnimate}
              exit="exit"
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {/* Golden Tab */}
        <motion.div
            className={goldenTabStyle}
            {...tabProps}
            aria-hidden="true"
        />

        {/* Tab Glow Container */}
        <div className={tabGlowContainerStyle} aria-hidden="true">
            <motion.div
                className={tabGlowStyle}
                {...glowProps}
             />
        </div>

        {/* Header Container */}
        <div className={headerContainerStyle} aria-hidden="true">
          {item.icon && (
             <motion.div
              className={iconContainerStyle}
              animate={isPressed && !motionIsReduced ? "press" : "initial"}
              variants={iconVariants}
            >
              {item.icon}
            </motion.div>
          )}
          <motion.div
            className={labelStyle}
            variants={labelVariants}
            initial="initial"
            animate={labelAnimate}
          >
            {item.label}
          </motion.div>
        </div>

        {/* Description Rendering */}
        {item.description && shouldShowDescription && (
            <div
              id={descriptionId}
              className={cx(descriptionStyle, expandedDescriptionStyle)}
              aria-hidden="true"
            >
              {item.description}
            </div>
        )}
      </motion.button>
    </motion.div>
  );
});

ItemCard.displayName = 'ItemCard';

export default ItemCard;