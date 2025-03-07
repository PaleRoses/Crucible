import React, { useEffect, useRef } from 'react';
import { createUseStyles } from 'react-jss';

// CSS-in-JS styles for the Background component
const useStyles = createUseStyles({
  backgroundWrapper: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    pointerEvents: 'none', // Ensures the canvas doesn't interfere with interactions
  },
  backgroundBlack: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000', // Pure black background
    zIndex: 1,
  },
  backgroundCanvas: {
    position: 'fixed', // Changed from absolute to fixed as per your request
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1, // Updated from 2 to 1 to match your request
    pointerEvents: 'none', // Ensures the canvas doesn't interfere with interactions
  }
});

// Zodiac constellation definitions - simplified vertex patterns
const CONSTELLATIONS = [
  {
    name: 'Ursa Major',
    vertices: [
      { x: 0.2, y: 0.3 }, { x: 0.25, y: 0.28 }, { x: 0.3, y: 0.25 },
      { x: 0.35, y: 0.23 }, { x: 0.37, y: 0.18 }, { x: 0.33, y: 0.15 },
      { x: 0.28, y: 0.15 }
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]]
  },
  {
    name: 'Cassiopeia',
    vertices: [
      { x: 0.7, y: 0.15 }, { x: 0.75, y: 0.2 }, { x: 0.8, y: 0.15 },
      { x: 0.85, y: 0.2 }, { x: 0.9, y: 0.15 }
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4]]
  },
];

/**
 * Background Component
 * 
 * Creates an animated starry background with constellations and interactive cursor effects.
 * 
 * @param {Object} cursorPosition - Current cursor coordinates
 * @param {Function} setCursorPosition - Function to update cursor position
 */
const Background = ({ cursorPosition, setCursorPosition }) => {
  const classes = useStyles();
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const constellationsRef = useRef([]);
  const requestRef = useRef(null);
  const timeRef = useRef(0);
  
  // Initialize particles and constellations
  useEffect(() => {
    // Regular background particles
    particlesRef.current = Array(60).fill().map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 1.5 + 0.5,
      baseSize: Math.random() * 1.5 + 0.5, // Store original size for reference
      speedX: (Math.random() - 0.5) * 0.15,
      speedY: (Math.random() - 0.5) * 0.15,
      opacity: Math.random() * 0.3 + 0.05,
      baseOpacity: Math.random() * 0.3 + 0.05, // Store original opacity
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2, // Random starting phase
      twinkleProbability: Math.random() * 0.0005 + 0.0001 // Chance to start twinkling
    }));
    
    // Initialize constellations with actual screen positions
    constellationsRef.current = CONSTELLATIONS.map(constellation => {
      const vertices = constellation.vertices.map(vertex => ({
        x: vertex.x * window.innerWidth,
        y: vertex.y * window.innerHeight,
        size: 1.8, // Slightly larger than regular particles
        baseSize: 1.8,
        opacity: 0.25,
        baseOpacity: 0.25,
        isTwinkling: false,
        twinkleProgress: 0,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        lastTwinkle: 0,
        twinkleInterval: Math.random() * 5000 + 2000 // Random interval between twinkles
      }));
      
      return {
        name: constellation.name,
        vertices,
        edges: constellation.edges
      };
    });
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);
  
  // Canvas animation for background particles and constellations
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const animate = (timestamp) => {
      // Start with black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      timeRef.current = timestamp;
      
      // Draw regular particles
      particlesRef.current.forEach(particle => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Handle twinkling effect
        if (Math.random() < particle.twinkleProbability) {
          particle.isTwinkling = true;
        }
        
        if (particle.isTwinkling) {
          // Use sine wave for smooth twinkling effect
          const twinkleFactor = Math.sin(timeRef.current * particle.twinkleSpeed + particle.twinklePhase);
          const normalizedTwinkle = (twinkleFactor + 1) / 2; // Convert from [-1,1] to [0,1]
          
          particle.size = particle.baseSize + (particle.baseSize * 0.7 * normalizedTwinkle);
          particle.opacity = particle.baseOpacity + (0.4 * normalizedTwinkle);
          
          // Complete one twinkle cycle
          if (timeRef.current * particle.twinkleSpeed + particle.twinklePhase > particle.twinklePhase + Math.PI * 2) {
            particle.isTwinkling = false;
            particle.twinklePhase = Math.random() * Math.PI * 2; // Reset phase for next time
            particle.size = particle.baseSize;
            particle.opacity = particle.baseOpacity;
          }
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(191, 173, 127, ${particle.opacity})`;
        ctx.fill();
      });
      
      // Draw constellations
      constellationsRef.current.forEach(constellation => {
        // Draw edges (lines) first so they appear behind vertices
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(191, 173, 127, 0.1)'; // Very subtle lines
        ctx.lineWidth = 0.5;
        
        constellation.edges.forEach(edge => {
          const startVertex = constellation.vertices[edge[0]];
          const endVertex = constellation.vertices[edge[1]];
          ctx.moveTo(startVertex.x, startVertex.y);
          ctx.lineTo(endVertex.x, endVertex.y);
        });
        ctx.stroke();
        
        // Draw and update vertices
        constellation.vertices.forEach(vertex => {
          // Occasional twinkling for constellation stars
          if (timeRef.current - vertex.lastTwinkle > vertex.twinkleInterval) {
            vertex.isTwinkling = true;
            vertex.twinkleProgress = 0;
            vertex.lastTwinkle = timeRef.current;
          }
          
          if (vertex.isTwinkling) {
            vertex.twinkleProgress += vertex.twinkleSpeed;
            
            // Create a pulse effect
            const pulseFactor = Math.sin(vertex.twinkleProgress * Math.PI);
            vertex.size = vertex.baseSize + (vertex.baseSize * pulseFactor);
            vertex.opacity = vertex.baseOpacity + (0.5 * pulseFactor);
            
            // End twinkling after one cycle
            if (vertex.twinkleProgress >= 1) {
              vertex.isTwinkling = false;
              vertex.size = vertex.baseSize;
              vertex.opacity = vertex.baseOpacity;
            }
          }
          
          // Draw constellation vertex
          ctx.beginPath();
          ctx.arc(vertex.x, vertex.y, vertex.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(207, 185, 130, ${vertex.opacity})`;
          ctx.fill();
        });
      });
      
      // Draw cursor influence - very subtle glow
      if (cursorPosition.x && cursorPosition.y) {
        const gradient = ctx.createRadialGradient(
          cursorPosition.x, cursorPosition.y, 0,
          cursorPosition.x, cursorPosition.y, 80
        );
        gradient.addColorStop(0, 'rgba(160, 142, 97, 0.03)');
        gradient.addColorStop(1, 'rgba(160, 142, 97, 0)');
        ctx.beginPath();
        ctx.arc(cursorPosition.x, cursorPosition.y, 80, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      
      requestRef.current = requestAnimationFrame(animate);
    };
    
    animate(0);
    
    // Resize handler
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Reposition constellation vertices on resize
      constellationsRef.current = constellationsRef.current.map(constellation => {
        const vertices = constellation.vertices.map((vertex, index) => {
          const originalVertex = CONSTELLATIONS.find(c => c.name === constellation.name).vertices[index];
          return {
            ...vertex,
            x: originalVertex.x * window.innerWidth,
            y: originalVertex.y * window.innerHeight
          };
        });
        
        return {
          ...constellation,
          vertices
        };
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef.current);
    };
  }, [cursorPosition]);
  
  return (
    <div className={classes.backgroundWrapper}>
      {/* Black background layer */}
      <div className={classes.backgroundBlack}></div>
      {/* Canvas for stars and constellations */}
      <canvas ref={canvasRef} className={classes.backgroundCanvas} />
    </div>
  );
};

export default Background;