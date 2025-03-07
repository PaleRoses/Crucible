import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  profile: {
    backgroundColor: 'rgba(15, 15, 15, 0.7)',
    border: '1px solid rgba(160, 142, 97, 0.2)',
    borderRadius: '3px',
    padding: '3rem',
    margin: '4rem auto',
    maxWidth: '1000px',
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '3rem',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    position: 'relative',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      padding: '2rem'
    }
  },
  profileBorder: {
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: 0,
      height: '1px',
      background: 'linear-gradient(to right, rgba(160, 142, 97, 0.7), rgba(160, 142, 97, 0))',
      transition: 'width 1s ease 0.5s'
    },
    '&$inView::before': {
      width: '100%'
    }
  },
  inView: {},
  profileImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: '1/1',
    borderRadius: '50%', // Changed from '3px' to '50%' for circular shape
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
    transition: 'box-shadow 0.3s ease',
    overflow: 'false', // Added to ensure content stays within the circle
    '&:hover': {
      boxShadow: '0 5px 20px rgba(191, 173, 127, 0.4)',
      '& $cometCanvas': {
        filter: 'brightness(1.5) contrast(1.2)'
      }
    },
    '@media (max-width: 768px)': {
      maxWidth: '250px',
      margin: '0 auto'
    }
  },
  cometCanvasContainer: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    pointerEvents: 'none',
    zIndex: 10
  },
  cometCanvas: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    transition: 'filter 0.3s ease'
  },
  profileImage: {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: '50%', // Changed from '3px' to '50%' for circular shape
    overflow: 'hidden',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      boxShadow: 'inset 0 0 20px rgba(191, 173, 127, 0.3)',
      borderRadius: '50%', // Changed from '3px' to '50%' for circular shape
      pointerEvents: 'none'
    }
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: '50%' // Changed from '3px' to '50%' for circular shape
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.6s ease, object-position 0.6s ease'
  },
  profileDetails: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    '@media (max-width: 768px)': {
      textAlign: 'center'
    }
  },
  profileName: {
    fontSize: '2.2rem',
    color: '#bfad7f',
    fontWeight: 300,
    letterSpacing: '0.1em',
    marginBottom: '0.5rem',
    '@media (max-width: 480px)': {
      fontSize: '1.8rem'
    }
  },
  profileRole: {
    fontSize: '1.1rem',
    color: 'rgba(191, 173, 127, 0.7)',
    marginBottom: '2rem',
    letterSpacing: '0.05em',
    fontWeight: 300,
    fontFamily: '"Garamond", "Adobe Caslon Pro", serif',
    fontStyle: 'italic'
  },
  profileBio: {
    fontSize: '1rem',
    color: 'rgba(224, 224, 224, 0.7)',
    lineHeight: 1.8,
    marginBottom: '2rem',
    fontFamily: '"Garamond", "Adobe Caslon Pro", serif',
    fontWeight: 300
  },
  profileStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
    marginTop: '2rem',
    borderTop: '1px solid rgba(160, 142, 97, 0.2)',
    paddingTop: '1.5rem',
    '@media (max-width: 480px)': {
      gridTemplateColumns: '1fr',
      gap: '1.5rem'
    }
  },
  stat: {
    textAlign: 'center'
  },
  statValue: {
    fontSize: '2.5rem',
    color: 'rgba(191, 173, 127, 0.9)',
    fontWeight: 300
  },
  statLabel: {
    fontSize: '0.85rem',
    color: 'rgba(224, 224, 224, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginTop: '0.5rem'
  },
  imageControls: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '1rem',
    width: '100%'
  },
});

// Circular Comet Animation Component
const CometBorderAnimation = ({ isHovered = false, config = {} }) => {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Initialize the animation parameters
  const cometPositionRef = useRef(0);
  const lastTimeRef = useRef(0);
  
  // Default configuration with prop overrides
  const {
    size = 2,
    trailLength = 140,
    speed = 0.01,
    hoverSpeedMultiplier = 2,
    trailSegments = 25,
    glowIntensity = 0.8
  } = config;
  
  // Set up dimensions on mount
  useEffect(() => {
    if (containerRef.current) {
      const updateDimensions = () => {
        const width = containerRef.current.offsetWidth;
        const height = containerRef.current.offsetHeight;
        setDimensions({ width, height });
      };
      
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      
      return () => {
        window.removeEventListener('resize', updateDimensions);
      };
    }
  }, []);
  
  // Run animation
  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    // Calculate circle properties
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const radius = Math.min(centerX, centerY) - 20; // 20px padding
    
    // Calculate the circumference of the circle
    const circumference = 2 * Math.PI * radius;
    
    // Comet parameters with hover enhancement
    const cometSize = isHovered ? size * 1.2 : size;
    const actualTrailLength = isHovered ? trailLength * 1.2 : trailLength;
    const actualSpeed = isHovered ? speed * hoverSpeedMultiplier : speed;
    const actualGlowIntensity = isHovered ? glowIntensity * 1.5 : glowIntensity;
    
    const animateComet = (timestamp) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }
      
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      
      // Calculate speed and update position
      const speed = actualSpeed;
      cometPositionRef.current = (cometPositionRef.current + speed * deltaTime) % (2 * Math.PI);
      
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Function to calculate x,y from position along circumference
      const getPointOnCircle = (angle) => {
        return {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        };
      };
      
      // Draw trail segments
      for (let i = 0; i < trailSegments; i++) {
        const segmentAngle = cometPositionRef.current - (i * (actualTrailLength / circumference));
        const nextSegmentAngle = cometPositionRef.current - ((i + 1) * (actualTrailLength / circumference));
        
        const point = getPointOnCircle(segmentAngle);
        const nextPoint = getPointOnCircle(nextSegmentAngle);
        
        // Calculate opacity based on position in trail
        const baseOpacity = 0.9 * (1 - (i / trailSegments));
        
        // Draw trail segment
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(nextPoint.x, nextPoint.y);
        
        // Vary line width from head to tail
        const segmentWidth = 3 * (1 - (i / trailSegments)) + 0.5;
        
        // Set shadow/glow for trail
        ctx.shadowColor = `rgba(255, 253, 227, ${baseOpacity * actualGlowIntensity})`;
        ctx.shadowBlur = (12 * (1 - (i / trailSegments)) + 5) * actualGlowIntensity;
        
        // Set line style and draw
        ctx.strokeStyle = `rgba(191, 173, 127, ${baseOpacity})`;
        ctx.lineWidth = segmentWidth;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
      
      // Draw comet head
      const headPoint = getPointOnCircle(cometPositionRef.current);
      
      // Add additional stars along the path
      if (isHovered) {
        for (let i = 0; i < 1; i++) {
          const starAngle = cometPositionRef.current + (i * 0.5);
          const starPoint = getPointOnCircle(starAngle);
          
          // Draw twinkling star with animation
          const twinkle = (Math.sin(timestamp / 500 + i) + 1) / 2; // Value between 0 and 1
          
          ctx.beginPath();
          ctx.arc(starPoint.x, starPoint.y, 1.5 * twinkle, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * twinkle})`;
          ctx.shadowColor = 'rgba(255, 253, 227, 0.8)';
          ctx.shadowBlur = 5 * twinkle;
          ctx.fill();
        }
      }
      
      // Larger outer glow for comet head
      ctx.beginPath();
      ctx.arc(headPoint.x, headPoint.y, cometSize * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 253, 227, ${0.4 * actualGlowIntensity})`;
      ctx.shadowColor = `rgba(255, 253, 227, ${0.6 * actualGlowIntensity})`;
      ctx.shadowBlur = 15 * actualGlowIntensity;
      ctx.fill();
      
      // Draw comet head
      ctx.beginPath();
      ctx.arc(headPoint.x, headPoint.y, cometSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 253, 227, ${0.6 * actualGlowIntensity})`;
      ctx.shadowColor = `rgba(255, 253, 227, ${0.7 * actualGlowIntensity})`;
      ctx.shadowBlur = 12 * actualGlowIntensity;
      ctx.fill();
      
      // Brightest center point (smaller than before)
      ctx.beginPath();
      ctx.arc(headPoint.x, headPoint.y, cometSize * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * actualGlowIntensity})`;
      ctx.shadowColor = `rgba(255, 255, 255, ${0.9 * actualGlowIntensity})`;
      ctx.shadowBlur = 8 * actualGlowIntensity;
      ctx.fill();
      
      // Draw subtle ambient star field if hovered
      if (isHovered) {
        for (let i = 0; i < 1; i++) {
          // Position stars randomly within the circle
          const angle = Math.random() * 2 * Math.PI;
          const distance = Math.random() * radius * 0.9; // Stay within the circle
          const x = centerX + distance * Math.cos(angle);
          const y = centerY + distance * Math.sin(angle);
          
          const size = Math.random() * 1;
          const opacity = Math.random() * 0.3;
          
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.fill();
        }
      }
      
      requestRef.current = requestAnimationFrame(animateComet);
    };
    
    // Start animation
    requestRef.current = requestAnimationFrame(animateComet);
    
    // Cleanup
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [dimensions, isHovered, size, trailLength, speed, hoverSpeedMultiplier, trailSegments, glowIntensity]);
  
  return (
    <div ref={containerRef} className="comet-border-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} className="comet-border-canvas" style={{ position: 'absolute', top: 0, left: 0 }} />
    </div>
  );
};

/**
 * Enhanced PersonProfileCard Component with Circular Profile Image and Orbiting Comet Animation
 * 
 * @param {Object} props - Component props
 * @param {Object} props.person - Person data object
 * @param {string} props.person.name - Person's name
 * @param {string} props.person.role - Person's role or title
 * @param {string} props.person.image - URL to person's image
 * @param {string[]} props.person.bio - Array of bio paragraphs
 * @param {Object[]} props.person.stats - Array of statistic objects
 * @param {Object} [props.animationConfig] - Optional animation configuration
 * @param {Object} [props.cometConfig] - Optional comet configuration
 * @param {number} [props.cometConfig.size=1] - Size of the comet head (px)
 * @param {number} [props.cometConfig.trailLength=140] - Length of the comet trail
 * @param {number} [props.cometConfig.speed=0.02] - Base speed of the comet
 * @param {Object} [props.imagePosition] - Optional image position configuration
 * @param {number} [props.imagePosition.x=50] - Horizontal position (0-100%)
 * @param {number} [props.imagePosition.y=50] - Vertical position (0-100%)
 * @param {number} [props.imagePosition.scale=1] - Zoom level (1-1.5)
 */
const PersonProfileCard = ({ 
  person,
  animationConfig = {
    useInternalRef: true,
    threshold: 0.2,
    once: true,
    initialY: 50,
    duration: 0.8,
    ease: "easeOut"
  },
  cometConfig = {
    size: 1,
    trailLength: 80,
    speed: 0.001
  },
  imagePosition = {
    x: 50,
    y: 0, // Changed default from 0 to 50 for better centering in a circle
    scale: 1
  }
}) => {
  const classes = useStyles();
  const [isHovered, setIsHovered] = useState(false);
  
  // Set up ref and inView detection
  const internalRef = useRef(null);
  
  // Always call useInView (to follow React hook rules)
  const internalInView = useInView(
    internalRef, 
    { 
      once: animationConfig.once, 
      threshold: animationConfig.threshold 
    }
  );
  
  // Use either internal or external ref/inView based on config
  const ref = animationConfig.useInternalRef ? internalRef : animationConfig.ref;
  const isInView = animationConfig.useInternalRef ? internalInView : animationConfig.isInView;
  
  return (
    <motion.div 
      ref={ref}
      className={`${classes.profile} ${classes.profileBorder} ${isInView ? classes.inView : ''}`}
      initial={{ opacity: 0, y: animationConfig.initialY }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: animationConfig.initialY }}
      transition={{ 
        duration: animationConfig.duration, 
        ease: animationConfig.ease 
      }}
    >
      <div 
        className={classes.profileImageContainer}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Comet animation around the border */}
        <div className={classes.cometCanvasContainer}>
          <CometBorderAnimation 
            isHovered={isHovered} 
            config={cometConfig}
          />
        </div>
        
        <div className={classes.profileImage}>
          <div className={classes.imageWrapper}>
            <img 
              src={person.image} 
              alt={person.name} 
              className={classes.image}
              style={{
                objectPosition: `${imagePosition.x}% ${imagePosition.y}%`,
                transform: `scale(${imagePosition.scale})`
              }}
            />
          </div>
        </div>
      </div>
      
      <div className={classes.profileDetails}>
        <h2 className={classes.profileName}>{person.name}</h2>
        <p className={classes.profileRole}>{person.role}</p>
        
        {person.bio.map((paragraph, index) => (
          <p key={index} className={classes.profileBio}>{paragraph}</p>
        ))}
        
        {person.stats && person.stats.length > 0 && (
          <div className={classes.profileStats}>
            {person.stats.map((stat, index) => (
              <div key={index} className={classes.stat}>
                <div className={classes.statValue}>{stat.value}</div>
                <div className={classes.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PersonProfileCard;