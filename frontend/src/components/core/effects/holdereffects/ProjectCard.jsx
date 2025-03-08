import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { createUseStyles } from 'react-jss';

// Optimized styles matching the provided design references
const useStyles = createUseStyles({
  projectCard: {
    backgroundColor: 'rgba(15, 15, 15, 0.7)',
    border: '1px solid rgba(160, 142, 97, 0.2)',
    borderRadius: '8px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    transition: 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1.0), box-shadow 0.4s cubic-bezier(0.25, 0.1, 0.25, 1.0)',
    transform: 'translateZ(0)', // Hardware acceleration
    willChange: 'transform, box-shadow', // Optimize for animation
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.25)',
    height: '100%'
  },
  projectCardHover: {
    transform: 'translateZ(0) scale(1.02) translateY(-5px)',
    boxShadow: '0 16px 35px rgba(0, 0, 0, 0.3), 0 0 25px rgba(191, 173, 127, 0.15)'
  },
  cardBorderGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '8px',
    pointerEvents: 'none',
    opacity: 0,
    transition: 'opacity 0.6s ease',
    boxShadow: 'inset 0 0 20px rgba(191, 173, 127, 0), 0 0 30px rgba(191, 173, 127, 0)',
    zIndex: 0
  },
  cardBorderGlowActive: {
    opacity: 1,
    boxShadow: 'inset 0 0 20px rgba(191, 173, 127, 0.2), 0 0 30px rgba(191, 173, 127, 0.15)'
  },
  imageContainer: {
    width: '100%',
    height: '220px', // Fixed height for the image part
    position: 'relative',
    overflow: 'hidden',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.8s ease',
    transform: 'scale(1)',
    backfaceVisibility: 'hidden'
  },
  imageHover: {
    transform: 'scale(1.05)'
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, rgba(15, 15, 15, 0.1), rgba(15, 15, 15, 0.3))',
    transition: 'opacity 0.4s ease',
    opacity: 0.5
  },
  imageOverlayHover: {
    opacity: 0.2
  },
  contentContainer: {
    padding: '1.5rem 1.8rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  titleArea: {
    marginBottom: '0.75rem'
  },
  title: {
    fontSize: '1.6rem',
    color: '#bfad7f',
    letterSpacing: '0.04em',
    margin: 0,
    fontWeight: 300,
    lineHeight: 1.2,
  },
  category: {
    fontSize: '0.95rem',
    color: 'rgba(191, 173, 127, 0.7)',
    letterSpacing: '0.05em',
    fontWeight: 300,
    fontStyle: 'italic',
    margin: '0.4rem 0 0 0'
  },
  description: {
    fontSize: '0.90rem',
    color: 'rgba(224, 224, 224, 0.9)',
    lineHeight: 1.6,
    fontFamily: '"Garamond", "Adobe Caslon Pro", serif',
    fontWeight: 300,
    margin: '0.5rem 0 1.5rem 0',
    flex: 1
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: 'auto',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(160, 142, 97, 0.15)'
  },
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
    letterSpacing: '0.02em',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(191, 173, 127, 0.15)',
      borderColor: 'rgba(191, 173, 127, 0.3)'
    }
  },
  shimmerEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%)',
    backgroundSize: '200% 100%',
    opacity: 0,
    pointerEvents: 'none',
    zIndex: 1,
    transition: 'opacity 0.4s ease'
  },
  shimmerEffectActive: {
    opacity: 1,
    animation: '$shimmer 1.8s infinite'
  },
  '@keyframes shimmer': {
    '0%': { backgroundPosition: '200% 0' },
    '100%': { backgroundPosition: '-200% 0' }
  },
  cardAnimation: {
    display: 'block', // Ensures proper animation container
    transform: 'translateZ(0)', // Hardware acceleration
    backfaceVisibility: 'hidden'
  }
});

/**
 * ProjectCard Component
 * 
 * An optimized, animated card component for displaying project information
 * with smooth reveal animations, hover effects, and performance optimizations.
 *
 * @param {Object} props - Component props
 * @param {Object} props.project - Project data
 * @param {string} props.project.title - Project title
 * @param {string} props.project.category - Project category or type
 * @param {string} props.project.description - Project description
 * @param {string} props.project.image - Project image URL
 * @param {string[]} props.project.tags - Array of technology tags
 * @param {Object} [props.animationConfig] - Optional animation configuration
 * @param {number} [props.animationConfig.delay] - Delay before animation starts (ms)
 * @param {number} [props.animationConfig.duration] - Animation duration (seconds)
 * @param {number} [props.animationConfig.distance] - Initial Y distance for animation (px)
 * @param {number} [props.animationConfig.threshold] - InView threshold (0-1)
 * @param {boolean} [props.animationConfig.once] - Whether animation should only run once
 * @param {Function} [props.onClick] - Optional click handler
 */
const ProjectCard = ({
  project,
  animationConfig = {},
  onClick
}) => {
  // Initialize styles
  const classes = useStyles();
  
  // State management
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Setup configuration with defaults
  const config = useMemo(() => ({
    delay: animationConfig.delay || 0,
    duration: animationConfig.duration || 0.7,
    distance: animationConfig.distance || 50,
    threshold: animationConfig.threshold || 0.15,
    once: animationConfig.once !== undefined ? animationConfig.once : true,
    ease: animationConfig.ease || [0.25, 0.1, 0.25, 1.0], // cubic-bezier easing
  }), [animationConfig]);
  
  // Refs for DOM elements
  const cardRef = useRef(null);
  
  // Check for reduced motion preference
  const prefersReducedMotion = useReducedMotion();
  
  // Setup intersection observer using framer-motion's useInView
  const inView = useInView(cardRef, {
    once: config.once,
    threshold: config.threshold,
    margin: "0px 0px -100px 0px" // Start animation slightly before element enters viewport
  });
  
  // Update visibility state when inView changes
  useEffect(() => {
    if (inView) {
      setIsVisible(true);
    }
  }, [inView]);
  
  // Memoize event handlers to prevent rerenders
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);
  
  const handleClick = useCallback(() => {
    if (onClick) onClick(project);
  }, [onClick, project]);
  
  // Prepare animation variants for framer-motion
  const cardVariants = useMemo(() => ({
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : config.distance
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.1 : config.duration,
        ease: config.ease,
        delay: config.delay / 1000, // Convert to seconds for framer-motion
      }
    }
  }), [config, prefersReducedMotion]);
  
  // Generate class names with conditional hover states
  const cardClassName = `${classes.projectCard} ${isHovered ? classes.projectCardHover : ''}`;
  const imageClassName = `${classes.image} ${isHovered ? classes.imageHover : ''}`;
  const imageOverlayClassName = `${classes.imageOverlay} ${isHovered ? classes.imageOverlayHover : ''}`;
  const borderGlowClassName = `${classes.cardBorderGlow} ${isHovered ? classes.cardBorderGlowActive : ''}`;
  const shimmerClassName = `${classes.shimmerEffect} ${isHovered ? classes.shimmerEffectActive : ''}`;
  
  return (
    <motion.div
      ref={cardRef}
      className={classes.cardAnimation}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={cardVariants}
      layout // Smooth layout transitions
    >
      <div
        className={cardClassName}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        {/* Border glow effect */}
        <div className={borderGlowClassName} />
        
        {/* Project Image */}
        <div className={classes.imageContainer}>
          <img
            src={project.image}
            alt={project.title}
            className={imageClassName}
            loading="lazy"
          />
          <div className={imageOverlayClassName} />
          <div className={shimmerClassName} />
        </div>
        
        {/* Content Section */}
        <div className={classes.contentContainer}>
          {/* Title and Category */}
          <div className={classes.titleArea}>
            <h2 className={classes.title}>{project.title}</h2>
            <p className={classes.category}>{project.category}</p>
          </div>
          
          {/* Description */}
          <p className={classes.description}>{project.description}</p>
          
          {/* Tags */}
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
    </motion.div>
  );
};

export default ProjectCard;