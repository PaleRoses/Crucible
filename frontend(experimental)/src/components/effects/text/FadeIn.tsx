import React, { useRef } from 'react';
import { useInView } from 'framer-motion';

type FadeMode = 'FadeInSimple' | 'FadeInUp' | 'FadeInScale';

interface FadeInProps {
  children: React.ReactNode;
  threshold?: number;
  delay?: number;
  duration?: number;
  mode?: FadeMode;
  className?: string;
  once?: boolean;
}

/**
 * FadeIn Component
 * 
 * Creates smooth fade-in animations when elements enter the viewport.
 * Offers three industry-standard fade animation styles.
 * 
 * @param children - Content to be animated
 * @param threshold - Visibility threshold to trigger animation (0-1)
 * @param delay - Animation delay in milliseconds
 * @param duration - Animation duration in milliseconds
 * @param mode - Fade animation style to use
 * @param className - Additional CSS classes to apply
 * @param once - Whether the animation should only trigger once
 */
const FadeIn: React.FC<FadeInProps> = ({
  children,
  threshold = 0.2,
  delay = 0,
  duration = 600,
  mode = 'FadeInSimple',
  className = '',
  once = true
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { 
    once: once, 
    amount: threshold 
  });

  // Prepare animation styles based on selected mode
  const getAnimationStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      transitionProperty: 'opacity, transform',
      transitionDuration: `${duration}ms`,
      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      transitionDelay: `${delay}ms`,
      opacity: isInView ? 1 : 0,
    };

    switch (mode) {
      case 'FadeInUp':
        return {
          ...baseStyles,
          transform: isInView ? 'translateY(0)' : 'translateY(20px)',
        };

      case 'FadeInScale':
        return {
          ...baseStyles,
          transform: isInView ? 'scale(1)' : 'scale(0.95)',
        };

      case 'FadeInSimple':
      default:
        return baseStyles;
    }
  };

  return (
    <div 
      ref={ref} 
      className={className}
      style={getAnimationStyles()}
    >
      {children}
    </div>
  );
};

export default FadeIn;