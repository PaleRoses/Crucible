import React, { useState, useEffect, useRef } from 'react';
import { createUseStyles } from 'react-jss';
import Background from '../../../../layout/Background';
import MeteorShower from '../../../../core/effects/cosmiceffects/MeteorShower';
import EvoSimShowCaseBar from './evosimutils/EvoSimShowcaseBar';

const useStyles = createUseStyles({
  
  visualizationContainer: {
    position: 'relative',
    flex: 1,
    overflow: 'hidden'
  },
  
  networkCanvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    cursor: 'grab',
    '&:active': {
      cursor: 'grabbing'
    }
  },
  
  categoryFilters: {
    position: 'absolute',
    bottom: '1rem',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(15, 15, 20, 0.8)',
    borderRadius: '30px',
    padding: '0.5rem',
    display: 'flex',
    gap: '0.5rem',
    zIndex: 50,
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(191, 173, 127, 0.2)'
  },
  
  categoryButton: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(224, 224, 224, 0.7)',
    padding: '0.35rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      color: '#e0e0e0',
      backgroundColor: 'rgba(191, 173, 127, 0.1)'
    }
  },
  
  categoryButtonActive: {
    backgroundColor: 'rgba(191, 173, 127, 0.3)',
    color: '#e0e0e0'
  }
});

const EvolutionSimulator = () => {
  const classes = useStyles();
  
  // State for cursor position (for background effect)
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  
  // Evolution simulation states
  const [selectedBodyShape, setSelectedBodyShape] = useState('quadrupedal');
  const [activeTab, setActiveTab] = useState('traits');
  const [visualizationMode, setVisualizationMode] = useState('direct');
  const [showEmergence, setShowEmergence] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTraits, setSelectedTraits] = useState({});
  
  // Environment state
  const [environment, setEnvironment] = useState({
    eldritch_influence: 0.5,
    corruption_level: 0.5,
    resource_scarcity: 0.5,
    ambient_magic: 0.5,
    darkness: 0.5
  });
  
  // Canvas and interaction refs
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // Define trait categories for filters
  const traitCategories = [
    { id: 'locomotion', name: 'Locomotion', color: '#7D6B9E' },
    { id: 'metabolism', name: 'Metabolism', color: '#5C9D8B' },
    { id: 'sensory', name: 'Sensory Acuity', color: '#C99846' },
    { id: 'etheric', name: 'Etheric Adaptation', color: '#B54B4B' },
    { id: 'thermal', name: 'Thermal Regulation', color: '#A67C52' }
  ];
  
  // Handle mouse movement for background effect
  const handleMouseMove = (e) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
  };
  
  // Set up canvas for visualization
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set up canvas dimensions
    const updateCanvasDimensions = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    
    updateCanvasDimensions();
    window.addEventListener('resize', updateCanvasDimensions);
    
    // Animation function for the network visualization
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw network visualization based on current state
      // This would contain the visualization logic adapted to the current:
      // - visualizationMode ('direct', 'tree', 'category')
      // - selectedBodyShape
      // - selectedTraits
      // - selectedCategory filter
      // - environment settings
      
      // Simple placeholder drawing
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Draw center node
      ctx.beginPath();
      ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(191, 173, 127, 0.8)';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedBodyShape.toUpperCase(), centerX, centerY);
      
      // Continue animation
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', updateCanvasDimensions);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    selectedBodyShape, 
    visualizationMode, 
    selectedCategory,
    selectedTraits,
    environment
  ]);
  
  return (
    <div 
      className={classes.evolutionSimulator}
      onMouseMove={handleMouseMove}
    >
      {/* Background effects */}
      <Background cursorPosition={cursorPosition} setCursorPosition={setCursorPosition} />
      <MeteorShower 
        height="100vh"
        zIndex={2}
        trailColor="rgba(191, 173, 127, 0.8)"
        glowColor="rgba(207, 185, 130, 0.6)"
        coreColor="rgba(255, 248, 220, 1)"
        meteorDensity={15}
        meteorMinSize={1}
        meteorMaxSize={2}
        meteorSpeed={0.08}
        trailLength={300}
        trailSegments={80}
        enableParallax={true}
        parallaxIntensity={0.15}
        mode="arc"
        staggered={true}
      />
      
      {/* Navigation Bar Component */}
      <EvoSimShowCaseBar
        selectedBodyShape={selectedBodyShape}
        onBodyShapeChange={setSelectedBodyShape}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        visualizationMode={visualizationMode}
        onVisualizationModeChange={setVisualizationMode}
        environment={environment}
        onEnvironmentChange={setEnvironment}
        showEmergence={showEmergence}
        onToggleEmergence={() => setShowEmergence(!showEmergence)}
        selectedTraits={selectedTraits}
        onTraitChange={(category, traitId) => {
          setSelectedTraits(prev => ({
            ...prev,
            [category]: traitId
          }));
        }}
      />
      
      {/* Main Visualization */}
      <div 
        ref={containerRef}
        className={classes.visualizationContainer}
      >
        <canvas 
          ref={canvasRef}
          className={classes.networkCanvas}
        />
        
        {/* Category filter buttons */}
        <div className={classes.categoryFilters}>
          <button 
            className={`${classes.categoryButton} ${selectedCategory === null ? classes.categoryButtonActive : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            All Traits
          </button>
          
          {traitCategories.map(category => (
            <button 
              key={category.id}
              className={`${classes.categoryButton} ${selectedCategory === category.id ? classes.categoryButtonActive : ''}`}
              onClick={() => setSelectedCategory(category.id)}
              style={{ 
                borderBottom: `2px solid ${category.color}`
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EvolutionSimulator;