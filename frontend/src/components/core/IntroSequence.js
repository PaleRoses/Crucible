import React, { useState, useEffect, useRef } from 'react';
import './introSequence.css';

// Separate reusable comet animation component
const CometAnimation = ({ 
  width = 200, 
  height = 200, 
  radius = 70, 
  speed = 0.12,
  trailLength = 120, 
  trailSegments = 20, 
  cometSize = 4,
  coreColor = 'rgba(255, 255, 255, 1)',
  glowColor = 'rgba(255, 253, 227, 0.9)',
  trailColor = 'rgba(191, 173, 127, 0.8)',
  fadeOutDuration = 1500,
  isActive = true,
  onAnimationComplete = () => {}
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [fadeState, setFadeState] = useState(isActive ? 'running' : 'idle');
  const fadeStartTimeRef = useRef(null);
  
  // Store rotation state outside of the effect to prevent resets
  const rotationRef = useRef(0);
  const lastTimestampRef = useRef(0);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Initialize fade progress
    let fadeProgress = 1;
    
    // Clear canvas on mount
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
      // Handle state transitions correctly
    
    const drawComet = (timestamp) => {
      // Initialize timestamp on first run
      if (lastTimestampRef.current === 0) {
        lastTimestampRef.current = timestamp;
      }
      
      // Calculate time delta (with safety cap to prevent jumps after tab switch/inactivity)
      const deltaTime = Math.min(timestamp - lastTimestampRef.current, 100);
      lastTimestampRef.current = timestamp;
      
      // Calculate opacity based on fade state
      if (fadeState === 'fading') {
        const fadeElapsed = timestamp - fadeStartTimeRef.current;
        fadeProgress = Math.max(0, 1 - (fadeElapsed / fadeOutDuration));
        
        if (fadeProgress <= 0) {
          setFadeState('complete');
          onAnimationComplete();
          cancelAnimationFrame(animationRef.current);
          return;
        }
      } else if (fadeState === 'complete') {
        cancelAnimationFrame(animationRef.current);
        return;
      }
      
      // Update rotation at constant speed regardless of fade state
      // This ensures smooth continuous motion during fade
      const rotationDelta = speed * deltaTime;
      rotationRef.current = (rotationRef.current + rotationDelta) % 360;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate comet head position
      const headAngle = rotationRef.current * Math.PI / 180;
      const headX = centerX + radius * Math.cos(headAngle);
      const headY = centerY + radius * Math.sin(headAngle);
      
      // Set global opacity for entire drawing (with a slight delay to prevent abrupt fade start)
      const smoothFadeProgress = fadeState === 'fading' ? Math.min(1, Math.max(0, fadeProgress * 1.1)) : 1;
      
      // Draw trail segments with decreasing opacity
      for (let i = 0; i < trailSegments; i++) {
        // Calculate position for this segment
        const segmentAngle = ((rotationRef.current - (i * (trailLength / trailSegments))) % 360) * Math.PI / 180;
        const segmentX = centerX + radius * Math.cos(segmentAngle);
        const segmentY = centerY + radius * Math.sin(segmentAngle);
        
        // Calculate next segment position (for line drawing)
        const nextSegmentAngle = ((rotationRef.current - ((i + 1) * (trailLength / trailSegments))) % 360) * Math.PI / 180;
        const nextSegmentX = centerX + radius * Math.cos(nextSegmentAngle);
        const nextSegmentY = centerY + radius * Math.sin(nextSegmentAngle);
        
        // Calculate opacity based on position in trail
        const baseOpacity = 0.8 * (1 - (i / trailSegments));
        
        // Draw trail segment
        ctx.beginPath();
        ctx.moveTo(segmentX, segmentY);
        ctx.lineTo(nextSegmentX, nextSegmentY);
        
        // Vary line width from head to tail
        const segmentWidth = 2.5 * (1 - (i / trailSegments)) + 0.5;
        
        // Set shadow/glow for trail
        ctx.shadowColor = glowColor.replace(/[\d.]+\)$/, (baseOpacity * smoothFadeProgress) + ')');
        ctx.shadowBlur = 10 * (1 - (i / trailSegments)) + 5;
        
        // Set line style and draw
        ctx.strokeStyle = trailColor.replace(/[\d.]+\)$/, (baseOpacity * smoothFadeProgress) + ')');
        ctx.lineWidth = segmentWidth;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
      
      // Add twinkle effect during fade-out
      if (fadeState === 'fading') {
        const twinkleIntensity = Math.sin(timestamp / 100) * 0.2 + 0.8;
        ctx.shadowBlur = 20 * twinkleIntensity;
      } else {
        ctx.shadowBlur = 20;
      }
      
      // Draw comet head with stronger glow
      ctx.shadowColor = glowColor;
      
      // Larger outer glow
      ctx.beginPath();
      ctx.arc(headX, headY, cometSize, 0, Math.PI * 2);
      ctx.fillStyle = glowColor.replace(/[\d.]+\)$/, '0.7)');
      ctx.fill();
      
      // Brighter inner core
      ctx.beginPath();
      ctx.arc(headX, headY, cometSize * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = glowColor.replace(/[\d.]+\)$/, '0.9)');
      ctx.fill();
      
      // Brightest center point
      ctx.beginPath();
      ctx.arc(headX, headY, cometSize * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = coreColor;
      ctx.fill();
      
      animationRef.current = requestAnimationFrame(drawComet);
    };
    
    if (fadeState !== 'complete') {
      animationRef.current = requestAnimationFrame(drawComet);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    isActive, 
    fadeState, 
    radius, 
    speed, 
    trailLength, 
    trailSegments, 
    cometSize,
    coreColor,
    glowColor,
    trailColor,
    fadeOutDuration,
    onAnimationComplete
  ]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height}
      className="comet-canvas"
    />
  );
};

const IntroSequence = ({ showIntro, setShowIntro, setIsLoaded }) => {
  const [quoteVisible, setQuoteVisible] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [animationActive, setAnimationActive] = useState(false);
  
  // Quotes data
  const quotes = [
    {
      text: "My candle burns at both ends;\nIt will not last the night;\nBut, ah my foes, and\noh my friend —\nit gives a\nlovely\nlight",
      author: "Edna St. Vincent Millay"
    },
    {
      text: "And he will come this, light insouciant lover,\nblowing his bugles to a rising morrow,\nto rend her veil, her wizened mind uncover,\nto leave her conquered by life's stinging sorrow",
      author: "Virginia McCormick"
    },
    {
      text: "Hope is the thing with feathers\nThat perches in the soul,\nAnd sings the tune without the words,\nAnd never stops at all.",
      author: "Emily Dickinson"
    },
    {
      text: "I have gone out, a possessed witch,\nhaunting the black air, braver at night;\ndreaming evil, I have done my hitch\nover the plain houses, light by light.",
      author: "Anne Sexton"
    },
    {
      text: "Though my soul may set in darkness,\nit will rise in perfect light;\nI have loved the stars too fondly\nto be fearful of the night.",
      author: "Sarah Williams"
    },
    {
      text: "The Moon is a loyal companion.\nIt never leaves. It's always there, watching, steadfast,\nknowing us in our light and dark moments,\nchanging forever just as we do.",
      author: "Tahereh Mafi"
    },
    {
      text: "I like the night. Without the dark,\nwe'd never see the stars.",
      author: "Stephenie Meyer"
    },
    {
      text: "In a dark time, the eye begins to see.",
      author: "Adrienne Rich"
    },
  ];

  // Handle animation completion
  const handleAnimationComplete = () => {
    console.log('Comet animation completed');
  };
  
  // Setup intro sequence
  useEffect(() => {
    if (showIntro) {
      // Select a random quote
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setCurrentQuote(randomQuote);
      
      // Sequence timing
      setTimeout(() => setAnimationActive(true), 150);
      setTimeout(() => setQuoteVisible(true), 350);
      setTimeout(() => {
        setAnimationActive(false); // Trigger fade-out
        setQuoteVisible(false);
        // Start fade out of intro
        const introElement = document.querySelector('.intro-sequence');
        if (introElement) introElement.classList.add('fade-out');
      }, 2000);
      setTimeout(() => {
        setShowIntro(false);
        setIsLoaded(true);
      }, 2500);
    }
  }, [showIntro, setShowIntro, setIsLoaded]);
  
  // Skip intro
  const handleSkipIntro = () => {
    setAnimationActive(false);
    setShowIntro(false);
    setIsLoaded(true);
  };
  
  // Format quote with line breaks
  const formatQuote = (text) => {
    return text.split('\n').map((line, i) => (
      <span key={i} className="quote-line">
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  if (!showIntro) return null;

  return (
    <div className="intro-sequence" onClick={handleSkipIntro}>
      <div className="moon-animation">
        <CometAnimation 
          width={200}
          height={200}
          radius={70}
          speed={0.12}
          trailLength={120}
          trailSegments={20}
          cometSize={4}
          coreColor="rgba(255, 255, 255, 1)"
          glowColor="rgba(255, 253, 227, 0.9)"
          trailColor="rgba(191, 173, 127, 0.8)"
          fadeOutDuration={800}
          isActive={animationActive}
          onAnimationComplete={handleAnimationComplete}
        />
      </div>
      
      <div className={`quote-container ${quoteVisible ? 'visible' : ''}`}>
        <div className="quote-text">
          {currentQuote && formatQuote(currentQuote.text)}
        </div>
        <div className="quote-author">
          {currentQuote && currentQuote.author}
        </div>
      </div>
      
      <div className="skip-intro">tap to skip</div>
    </div>
  );
};

export default IntroSequence;