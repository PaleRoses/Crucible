import React, { useCallback, useRef, memo } from 'react';
import { createUseStyles } from 'react-jss';

// Simplified classnames utility to avoid external dependency
const cx = (...classes) => classes.filter(Boolean).join(' ');

// Static styles with minimal transitions
const useStyles = createUseStyles({
  // Root container with minimal styling
  card: {
    position: 'relative',
    height: '100%',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: 'rgba(15, 15, 15, 0.7)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.25)',
    border: '1px solid rgba(160, 142, 97, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    // Use CSS custom properties for performant transitions
    '--card-transform': 'translate3d(0,0,0)',
    '--card-shadow': '0 8px 25px rgba(0, 0, 0, 0.25)',
    '--image-scale': '1',
    '--overlay-opacity': '0.5',
    '--glow-opacity': '0',
    transform: 'var(--card-transform)',
    transition: 'box-shadow 0.3s ease',
    '&:hover': {
      '--card-transform': 'translate3d(0,-5px,0) scale(1.02)',
      '--card-shadow': '0 16px 35px rgba(0, 0, 0, 0.3), 0 0 25px rgba(191, 173, 127, 0.15)',
      '--image-scale': '1.05',
      '--overlay-opacity': '0.2',
      '--glow-opacity': '1',
      boxShadow: 'var(--card-shadow)'
    }
  },
  // Light card version for better performance on mobile/low-end devices
  cardLight: {
    '&:hover': {
      '--card-transform': 'translate3d(0,0,0)', // No transform on hover
      '--image-scale': '1', // No scale on hover
    }
  },
  // Image container
  imageContainer: {
    height: '220px',
    position: 'relative',
    overflow: 'hidden'
  },
  // Image with minimal transitions
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'scale(var(--image-scale))',
    transition: 'transform 0.7s ease'
  },
  // Overlay
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, rgba(15, 15, 15, 0.1), rgba(15, 15, 15, 0.3))',
    opacity: 'var(--overlay-opacity)',
    transition: 'opacity 0.5s ease'
  },
  // Border glow effect
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    borderRadius: '8px',
    boxShadow: 'inset 0 0 20px rgba(191, 173, 127, 0.2), 0 0 30px rgba(191, 173, 127, 0.15)',
    opacity: 'var(--glow-opacity)',
    transition: 'opacity 0.5s ease',
    zIndex: 1
  },
  // Content area
  content: {
    padding: '1.5rem 1.8rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  // Title section
  titleArea: {
    marginBottom: '0.75rem'
  },
  // Title
  title: {
    fontSize: '1.6rem',
    color: '#bfad7f',
    letterSpacing: '0.04em',
    margin: 0,
    fontWeight: 300,
    lineHeight: 1.2
  },
  // Category
  category: {
    fontSize: '0.95rem',
    color: 'rgba(191, 173, 127, 0.7)',
    letterSpacing: '0.05em',
    fontWeight: 300,
    fontStyle: 'italic',
    margin: '0.4rem 0 0 0'
  },
  // Description
  description: {
    fontSize: '0.90rem',
    color: 'rgba(224, 224, 224, 0.9)',
    lineHeight: 1.6,
    fontFamily: '"Garamond", "Adobe Caslon Pro", serif',
    fontWeight: 300,
    margin: '0.5rem 0 1.5rem 0',
    flex: 1
  },
  // Tags container
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: 'auto',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(160, 142, 97, 0.15)'
  },
  // Tag
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.3rem 0.7rem',
    borderRadius: '4px',
    backgroundColor: 'rgba(191, 173, 127, 0.1)',
    border: '1px solid rgba(191, 173, 127, 0.2)',
    color: 'rgba(191, 173, 127, 0.9)',
    fontSize: '0.75rem',
    fontWeight: 400,
    letterSpacing: '0.02em'
  },
  // Element that appears on view
  fadeIn: {
    animation: '$fadeIn 0.8s ease forwards'
  },
  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'translateY(0)' }
  },
  // Clickable cursor
  clickable: {
    cursor: 'pointer'
  }
});

/**
 * HighPerformanceProjectCard
 * 
 * A completely refactored project card component with maximum performance optimizations:
 * - Uses CSS custom properties instead of JavaScript for animations
 * - Minimal DOM nodes
 * - No state/useState to prevent re-renders
 * - CSS animations instead of JavaScript animations
 * - Optimized for low-end devices with feature detection
 * - Properly memoized to prevent unnecessary re-renders
 * 
 * @param {Object} props - Component props
 * @param {Object} props.project - Project data object
 * @param {boolean} props.inView - Whether the card is in view
 * @param {boolean} props.lowPerformanceMode - Forces simpler rendering for low-end devices
 * @param {Function} props.onClick - Click handler
 */
const ProjectCard = ({
  project,
  inView = true,
  lowPerformanceMode = false,
  onClick
}) => {
  const classes = useStyles();
  const cardRef = useRef(null);
  
  // Determine if we should use light mode (for low-end devices)
  const useLightMode = lowPerformanceMode || 
    (typeof window !== 'undefined' && 
     (window.matchMedia('(prefers-reduced-motion: reduce)').matches || 
      navigator.hardwareConcurrency <= 4));
  
  // Memoized click handler
  const handleClick = useCallback(() => {
    if (onClick) onClick(project);
  }, [onClick, project]);
  
  // Build class names
  const cardClassName = cx(
    classes.card,
    useLightMode && classes.cardLight,
    inView && classes.fadeIn,
    onClick && classes.clickable
  );
  
  // Render with minimal DOM nodes and style calculations
  return (
    <div 
      ref={cardRef}
      className={cardClassName}
      onClick={onClick ? handleClick : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Static border glow effect */}
      <div className={classes.glow} aria-hidden="true" />
      
      {/* Image section */}
      <div className={classes.imageContainer}>
        <img
          src={project.image}
          alt=""
          className={classes.image}
          loading="lazy"
          decoding="async"
        />
        <div className={classes.overlay} aria-hidden="true" />
      </div>
      
      {/* Content section */}
      <div className={classes.content}>
        <div className={classes.titleArea}>
          <h2 className={classes.title}>{project.title}</h2>
          <p className={classes.category}>{project.category}</p>
        </div>
        
        <p className={classes.description}>{project.description}</p>
        
        {project.tags && project.tags.length > 0 && (
          <div className={classes.tagsContainer}>
            {project.tags.map((tag, index) => (
              <span key={index} className={classes.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Add display name for better debugging
ProjectCard.displayName = 'HighPerformanceProjectCard';

// Export memoized component to prevent unnecessary re-renders
export default memo(ProjectCard);