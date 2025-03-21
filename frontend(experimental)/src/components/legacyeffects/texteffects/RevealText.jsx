import React, { useRef } from 'react';
import { useInView } from 'framer-motion';
import { createUseStyles } from 'react-jss';

// Styles defined within the component file
const useStyles = createUseStyles({
  revealContainer: {
    overflow: 'hidden',
    marginBottom: '1.5rem'
  },
  revealText: {
    transform: 'translateY(30px)',
    opacity: 0,
    transition: 'transform 0.8s ease, opacity 0.8s ease'
  },
  revealed: {
    transform: 'translateY(0)',
    opacity: 1
  }
});

/**
 * RevealText Component
 * 
 * Creates an animated text reveal effect when the component enters the viewport.
 * Uses Framer Motion's useInView hook to trigger the animation.
 * 
 * @param {ReactNode} children - Content to be revealed
 * @param {number} threshold - Visibility threshold to trigger animation (0-1)
 * @param {number} delay - Animation delay in milliseconds
 */
const RevealText = ({ children, threshold = 0.5, delay = 0 }) => {
  const classes = useStyles();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, threshold });
  
  return (
    <div ref={ref} className={classes.revealContainer}>
      <div
        className={`${classes.revealText} ${isInView ? classes.revealed : ''}`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {children}
      </div>
    </div>
  );
};

export default RevealText;