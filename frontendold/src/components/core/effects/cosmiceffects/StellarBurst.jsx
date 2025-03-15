import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { createUseStyles } from 'react-jss';

// CSS-in-JS styles
const useStyles = createUseStyles({
  burstContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: props => props.zIndex || 10,
    overflow: 'hidden',
  },
  burstCanvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    willChange: 'transform',
    backfaceVisibility: 'hidden',
    transform: 'translateZ(0)',
  }
});

/**
 * StellarBurst Component
 * 
 * A standalone component that creates elegant, subtle burst effects
 * resembling stellar phenomena like small novae or cosmic energy discharges.
 * 
 * @param {Object} props - Component properties
 * @param {number} [props.zIndex=10] - z-index for the burst container
 * @param {string} [props.baseColor='191, 173, 127'] - Base RGB color for bursts
 * @param {string} [props.accentColor='255, 245, 230'] - Accent RGB color for bursts
 * @param {number} [props.burstFrequency=0.4] - Frequency of burst effects (0-10)
 * @param {number} [props.burstSize=1] - Size multiplier for burst effects (0.1-3)
 * @param {number} [props.burstDensity=1] - Density multiplier for particles (0.1-3)
 * @param {boolean} [props.enableInteraction=true] - Allow mouse/touch to trigger bursts
 * @param {function} [props.onBurst] - Optional callback when burst occurs
 */
const StellarBurst = ({
  zIndex = 10,
  baseColor = '191, 173, 127',
  accentColor = '255, 245, 230',
  burstFrequency = 0.4,
  burstSize = 1,
  burstDensity = 1,
  enableInteraction = true,
  onBurst,
  className
}) => {
  const styleProps = useMemo(() => ({ zIndex }), [zIndex]);
  const classes = useStyles(styleProps);
  
  const canvasRef = useRef(null);
  const burstParticlesRef = useRef([]);
  const requestRef = useRef(null);
  const lastFrameTimeRef = useRef(0);
  const lastBurstTimeRef = useRef(0);
  const cursorPositionRef = useRef({ x: 0, y: 0 });
  const [, setIsReady] = useState(false);
  
  // Configuration parameters
  const CONFIG = useMemo(() => ({
    // Colors
    baseColor,
    accentColor,
    
    // Burst parameters
    minBurstInterval: 3000 / burstFrequency, // Minimum time between automatic bursts
    interactionCooldown: 800, // Minimum time between interaction-triggered bursts
    burstProbability: 0.001 * burstFrequency, // Chance of automatic burst per frame
    
    // Particle parameters
    particleCount: { 
      min: Math.floor(4 * burstDensity), 
      max: Math.floor(12 * burstDensity) 
    },
    particleLifespan: { 
      min: 2000, 
      max: 3500 
    },
    particleSize: {
      min: 0.8 * burstSize,
      max: 2.2 * burstSize
    },
    particleSpeed: {
      min: 0.2 * burstSize,
      max: 0.6 * burstSize
    },
    glowRadius: 2.5 * burstSize,
    particleOpacity: {
      min: 0.3,
      max: 0.8
    },
    
    // Potential burst locations
    burstLocations: Array(12).fill().map(() => ({
      x: Math.random(),
      y: Math.random(),
      lastBurst: 0,
      probabilityMultiplier: Math.random() * 5 + 1 // Some locations more likely than others
    }))
  }), [baseColor, accentColor, burstFrequency, burstSize, burstDensity]);
  
  // Create a burst effect
  const createBurst = useCallback((x, y, timestamp, intensity = 1) => {
    const { particleCount, particleLifespan, particleSize, particleSpeed, particleOpacity } = CONFIG;
    
    // Determine count based on intensity
    const count = Math.floor(
      Math.random() * 
      (particleCount.max - particleCount.min) * intensity + 
      particleCount.min
    );
    
    // Create particles
    for (let i = 0; i < count; i++) {
      // Calculate angle and distance
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * (particleSpeed.max - particleSpeed.min) + particleSpeed.min) * intensity;
      
      // Randomly choose between base and accent color for variety
      const color = Math.random() > 0.7 ? CONFIG.accentColor : CONFIG.baseColor;
      
      // Create particle
      burstParticlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: (Math.random() * (particleSize.max - particleSize.min) + particleSize.min) * intensity,
        opacity: Math.random() * (particleOpacity.max - particleOpacity.min) + particleOpacity.min,
        color,
        createdAt: timestamp,
        lifespan: Math.random() * (particleLifespan.max - particleLifespan.min) + particleLifespan.min,
        dampingFactor: 0.97 + Math.random() * 0.02,
        hasGlow: Math.random() > 0.3, // Some particles have glow effect
        glowIntensity: Math.random() * 0.5 + 0.5
      });
    }
    
    // Set the last burst time to prevent too frequent bursts
    lastBurstTimeRef.current = timestamp;
    
    // Call the onBurst callback if provided
    if (onBurst) {
      onBurst({ x, y, intensity, timestamp });
    }
  }, [CONFIG, onBurst]);
  
  // Update burst particles
  const updateBurstParticles = useCallback((timestamp, deltaTime) => {
    // Filter out expired particles
    burstParticlesRef.current = burstParticlesRef.current.filter(particle => {
      const age = timestamp - particle.createdAt;
      return age < particle.lifespan;
    });
    
    // Update remaining particles
    burstParticlesRef.current.forEach(particle => {
      const age = timestamp - particle.createdAt;
      const lifeProgress = age / particle.lifespan;
      
      // Update position with easing
      particle.x += particle.vx * deltaTime * (1 - lifeProgress * 0.6);
      particle.y += particle.vy * deltaTime * (1 - lifeProgress * 0.6);
      
      // Apply damping to velocity for more natural movement
      particle.vx *= particle.dampingFactor;
      particle.vy *= particle.dampingFactor;
      
      // Fade out with easing
      particle.opacity = particle.opacity * (1 - (lifeProgress * lifeProgress * 0.05));
    });
  }, []);
  
  // Render burst particles
  const renderBurstParticles = useCallback((ctx, timestamp) => {
    burstParticlesRef.current.forEach(particle => {
      const age = timestamp - particle.createdAt;
      const lifeProgress = age / particle.lifespan;
      
      // Skip rendering if nearly invisible
      if (particle.opacity < 0.01) return;
      
      // Draw glow effect for particles that have it
      if (particle.hasGlow) {
        const glowRadius = particle.size * CONFIG.glowRadius * (1 - lifeProgress * 0.5);
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, glowRadius
        );
        
        // Inner glow
        gradient.addColorStop(0, `rgba(${particle.color}, ${particle.opacity * particle.glowIntensity * (1 - lifeProgress)})`);
        // Outer glow
        gradient.addColorStop(1, `rgba(${particle.color}, 0)`);
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      
      // Draw particle core
      const coreSize = particle.size * (1 - lifeProgress * 0.5);
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, coreSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${particle.color}, ${particle.opacity * (1 - lifeProgress * 0.5)})`;
      ctx.fill();
    });
  }, [CONFIG]);
  
  // Check if we should trigger a random burst
  const checkRandomBurst = useCallback((timestamp, deltaTime) => {
    if (timestamp - lastBurstTimeRef.current < CONFIG.minBurstInterval) return;
    
    // Scale probability based on delta time
    const scaledProbability = CONFIG.burstProbability * deltaTime / 16.67;
    
    if (Math.random() < scaledProbability) {
      // Select a burst location with weighting
      const locations = CONFIG.burstLocations.filter(
        loc => timestamp - loc.lastBurst > CONFIG.minBurstInterval * 2
      );
      
      if (locations.length === 0) return;
      
      // Select location with probability weighting
      const totalWeight = locations.reduce((sum, loc) => sum + loc.probabilityMultiplier, 0);
      let randomWeight = Math.random() * totalWeight;
      let selectedLocation = locations[0];
      
      for (const location of locations) {
        randomWeight -= location.probabilityMultiplier;
        if (randomWeight <= 0) {
          selectedLocation = location;
          break;
        }
      }
      
      // Update the location's last burst time
      selectedLocation.lastBurst = timestamp;
      
      // Trigger burst at selected location
      createBurst(
        selectedLocation.x * window.innerWidth,
        selectedLocation.y * window.innerHeight,
        timestamp,
        0.8 + Math.random() * 0.4 // Random intensity
      );
    }
  }, [CONFIG, createBurst]);
  
  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true,
      willReadFrequently: false
    });
    
    // Set canvas dimensions with pixel ratio consideration
    const updateCanvasSize = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * pixelRatio;
      canvas.height = window.innerHeight * pixelRatio;
      ctx.scale(pixelRatio, pixelRatio);
    };
    
    updateCanvasSize();
    setIsReady(true);
    
    // Animation loop
    const animate = (timestamp) => {
      // Calculate delta time for smooth animation
      const deltaTime = lastFrameTimeRef.current ? Math.min(timestamp - lastFrameTimeRef.current, 32) : 16.67;
      lastFrameTimeRef.current = timestamp;
      
      // Clear canvas with transparency
      ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
      
      // Check for random burst opportunities
      checkRandomBurst(timestamp, deltaTime);
      
      // Update and render particles
      updateBurstParticles(timestamp, deltaTime);
      renderBurstParticles(ctx, timestamp);
      
      requestRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    requestRef.current = requestAnimationFrame(animate);
    
    // Window resize handler
    const handleResize = () => {
      updateCanvasSize();
    };
    
    // Mouse/touch handlers for interaction
    const handleMouseMove = (e) => {
      cursorPositionRef.current = { x: e.clientX, y: e.clientY };
    };
    
    const handleInteraction = (e) => {
      if (!enableInteraction) return;
      
      const timestamp = performance.now();
      if (timestamp - lastBurstTimeRef.current < CONFIG.interactionCooldown) return;
      
      // Get position from event
      const x = (e.clientX !== undefined) ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : null);
      const y = (e.clientY !== undefined) ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : null);
      
      // Create burst at interaction point
      if (x !== null && y !== null) {
        createBurst(x, y, timestamp, 1.2); // Slightly more intense for interaction
      }
    };
    
    // Event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    
    if (enableInteraction) {
      window.addEventListener('click', handleInteraction);
      window.addEventListener('touchstart', handleInteraction);
    }
    
    // Cleanup
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      
      if (enableInteraction) {
        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('touchstart', handleInteraction);
      }
    };
  }, [
    createBurst,
    updateBurstParticles,
    renderBurstParticles,
    checkRandomBurst,
    CONFIG,
    enableInteraction
  ]);
  
  return (
    <div className={`${classes.burstContainer} ${className || ''}`}>
      <canvas 
        ref={canvasRef} 
        className={classes.burstCanvas}
        aria-hidden="true"
      />
    </div>
  );
};

export default StellarBurst;