import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  animatedContainer: {
    position: 'relative',
    width: '100%',
    textAlign: props => props.textAlign || 'center',
    margin: props => props.margin || '0 0 3rem 0',
    zIndex: 2
  },
  content: {
    width: '100%'
  },
  divider: props => ({
    width: props.dividerWidth || '150px',
    height: props.dividerHeight || '1px',
    background: props.dividerBackground || 'linear-gradient(to right, rgba(160, 142, 97, 0), rgba(160, 142, 97, 0.6), rgba(160, 142, 97, 0))',
    margin: props.dividerMargin || '1rem auto',
    display: props.showDivider ? 'block' : 'none'
  })
});

/**
 * ScrollingTextAnimation Component
 * 
 * A highly customizable component that creates a scroll-based animation
 * for text elements. The text can move and change opacity as the user scrolls.
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Content to animate
 * @param {Object} [props.scrollConfig] - Scroll animation configuration
 * @param {number} [props.scrollConfig.startPosition=0] - Starting scroll position in pixels
 * @param {number} [props.scrollConfig.endPosition=300] - Ending scroll position in pixels
 * @param {number} [props.scrollConfig.initialY=-100] - Initial Y position (pixels above final position)
 * @param {number} [props.scrollConfig.finalY=0] - Final Y position (pixels)
 * @param {boolean} [props.scrollConfig.clampValues=true] - Whether to clamp transform values
 * @param {Array} [props.scrollConfig.opacityValues=[1, 0.95, 0.9]] - Opacity values at different scroll positions
 * @param {Array} [props.scrollConfig.opacityScrollPositions] - Scroll positions for opacity changes (computed by default)
 * @param {boolean} [props.scrollConfig.reverseDirection=false] - Whether to reverse the animation direction
 * @param {string} [props.textAlign='center'] - Text alignment
 * @param {string} [props.margin='0 0 3rem 0'] - Container margin
 * @param {boolean} [props.showDivider=true] - Whether to show a divider below the content
 * @param {string} [props.dividerWidth='150px'] - Width of the divider
 * @param {string} [props.dividerHeight='1px'] - Height of the divider
 * @param {string} [props.dividerBackground] - Background style for the divider
 * @param {string} [props.dividerMargin='1rem auto'] - Margin for the divider
 * @param {Object} [props.style] - Additional inline styles
 * @param {string} [props.className] - Additional CSS class
 */
const ScrollingTextAnimation = ({
  children,
  scrollConfig = {},
  textAlign = 'center',
  margin = '0 0 3rem 0',
  showDivider = true,
  dividerWidth = '150px',
  dividerHeight = '1px',
  dividerBackground,
  dividerMargin = '1rem auto',
  style = {},
  className = ''
}) => {
  // Set default scroll configuration
  const {
    startPosition = 0,
    endPosition = 300,
    initialY = -100,
    finalY = 0,
    clampValues = true,
    opacityValues = [1, 0.95, 0.9],
    opacityScrollPositions = [startPosition, endPosition, endPosition + 100],
    reverseDirection = false
  } = scrollConfig;

  // Calculate the actual Y values considering direction
  const yInputRange = [startPosition, endPosition];
  const yOutputRange = reverseDirection ? [finalY, initialY] : [initialY, finalY];
  
  // Set up scroll tracking
  const { scrollY } = useScroll();
  const containerRef = useRef(null);
  
  // Create transform values based on scroll position
  const translateY = useTransform(
    scrollY,
    yInputRange,
    yOutputRange,
    { clamp: clampValues }
  );
  
  // Create opacity transform
  const opacity = useTransform(
    scrollY,
    opacityScrollPositions,
    opacityValues,
    { clamp: clampValues }
  );
  
  // Create styles for component
  const styleProps = {
    textAlign,
    margin,
    showDivider,
    dividerWidth,
    dividerHeight,
    dividerBackground,
    dividerMargin
  };
  
  const classes = useStyles(styleProps);
  
  return (
    <motion.div 
      ref={containerRef}
      className={`${classes.animatedContainer} ${className}`}
      style={{ 
        ...style,
        y: translateY, 
        opacity: opacity
      }}
    >
      <div className={classes.content}>
        {children}
      </div>
      {showDivider && <div className={classes.divider} />}
    </motion.div>
  );
};

export default ScrollingTextAnimation;