import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createUseStyles } from 'react-jss';

// Styles for the showcase navigation bar with improved layout
const useStyles = createUseStyles({
  // Main container
  navContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    backgroundColor: 'rgba(10, 10, 15, 0.9)',
    borderBottom: '1px solid rgba(191, 173, 127, 0.4)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
    zIndex: 100,
  },
  
  // Upper navigation section with logo
  upperNav: {
    display: 'flex',
    padding: '0.75rem 1.5rem',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(191, 173, 127, 0.2)',
  },
  
  // Logo and title section
  titleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  logoIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #bfad7f 0%, #7D6B9E 100%)',
    boxShadow: '0 0 10px rgba(191, 173, 127, 0.5)',
  },
  title: {
    color: '#bfad7f',
    fontSize: '1.5rem',
    margin: 0,
    fontWeight: 300,
    letterSpacing: '0.05em',
    textShadow: '0 2px 5px rgba(0, 0, 0, 0.5)',
  },
  
  // Main control bar with uniform sections
  controlBar: {
    display: 'flex',
    padding: '0.75rem 1.5rem',
    borderBottom: '1px solid rgba(191, 173, 127, 0.2)',
    flexWrap: 'wrap',
    gap: '2rem',
  },
  
  // Control section styling (uniform for all sections)
  controlSection: {
    minWidth: '250px',
  },
  sectionTitle: {
    color: 'rgba(191, 173, 127, 0.8)',
    fontSize: '1rem',
    margin: '0 0 0.75rem 0',
  },
  
  // Dropdown selectors
  dropdownSelector: {
    position: 'relative',
    zIndex: 10,
  },
  selectorButton: {
    backgroundColor: 'rgba(30, 30, 40, 0.6)',
    border: '1px solid rgba(191, 173, 127, 0.3)',
    color: '#e0e0e0',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(191, 173, 127, 0.2)',
      borderColor: 'rgba(191, 173, 127, 0.6)',
    },
  },
  selectorMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 15, 20, 0.95)',
    maxHeight: '60vh',
    overflowY: 'auto',
    borderRadius: '4px',
    padding: '0.5rem',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
    zIndex: 20,
    border: '1px solid rgba(191, 173, 127, 0.3)',
  },
  menuItem: {
    padding: '0.75rem',
    cursor: 'pointer',
    borderRadius: '3px',
    transition: 'all 0.15s ease',
    '&:hover': {
      backgroundColor: 'rgba(191, 173, 127, 0.2)',
    },
  },
  menuItemActive: {
    backgroundColor: 'rgba(191, 173, 127, 0.3)',
  },
  menuItemName: {
    fontSize: '0.95rem',
    color: '#bfad7f',
    fontWeight: 500,
    marginBottom: '0.25rem',
  },
  menuItemDesc: {
    fontSize: '0.8rem',
    color: 'rgba(224, 224, 224, 0.7)',
  },
  
  // Visualization mode buttons
  buttonGroup: {
    display: 'flex',
    gap: '0.5rem',
  },
  visualButton: {
    backgroundColor: 'rgba(15, 15, 20, 0.6)',
    border: '1px solid rgba(191, 173, 127, 0.4)',
    color: '#e0e0e0',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(191, 173, 127, 0.2)',
    },
  },
  visualButtonActive: {
    backgroundColor: 'rgba(191, 173, 127, 0.3)',
    borderColor: 'rgba(191, 173, 127, 0.7)',
  },
  
  // Main tab buttons
  mainTabs: {
    display: 'flex',
    borderBottom: '1px solid rgba(191, 173, 127, 0.2)',
    padding: '0 1.5rem',
  },
  mainTab: {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: 'rgba(224, 224, 224, 0.7)',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    '&:hover': {
      color: '#bfad7f',
      borderBottomColor: 'rgba(191, 173, 127, 0.3)',
    },
  },
  mainTabActive: {
    color: '#bfad7f',
    borderBottomColor: '#bfad7f',
  },
  
  // View controls
  viewControls: {
    display: 'flex',
    marginLeft: 'auto',
    alignItems: 'center',
    gap: '0.5rem',
  },
  viewButton: {
    backgroundColor: 'rgba(30, 30, 40, 0.6)',
    border: '1px solid rgba(191, 173, 127, 0.3)',
    color: '#e0e0e0',
    width: '30px',
    height: '30px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(191, 173, 127, 0.2)',
    },
  },
  
  // Content panel for active tab
  contentPanel: {
    padding: '1.5rem',
    maxHeight: '70vh',
    overflowY: 'auto',
  },
  
  // Category filters
  categoryFilters: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  },
  categoryButton: {
    backgroundColor: 'rgba(30, 30, 40, 0.6)',
    border: '1px solid rgba(191, 173, 127, 0.2)',
    color: '#e0e0e0',
    padding: '0.4rem 0.75rem',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(191, 173, 127, 0.2)',
    },
  },
  categoryButtonActive: {
    backgroundColor: 'rgba(191, 173, 127, 0.3)',
    borderColor: 'rgba(191, 173, 127, 0.6)',
  },
  
  // Traits display
  traitsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  categorySection: {
    flex: '1 1 45%',
    minWidth: '300px',
    marginBottom: '2rem',
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  categoryIcon: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
  },
  categoryName: {
    color: '#e0e0e0',
    fontSize: '1.1rem',
    margin: 0,
  },
  
  // Trait cards
  traitCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1rem',
  },
  traitCard: {
    backgroundColor: 'rgba(30, 30, 40, 0.6)',
    border: '1px solid rgba(191, 173, 127, 0.3)',
    borderRadius: '4px',
    padding: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    '&:hover': {
      backgroundColor: 'rgba(191, 173, 127, 0.15)',
      borderColor: 'rgba(191, 173, 127, 0.5)',
      transform: 'translateY(-2px)',
    },
  },
  traitCardActive: {
    backgroundColor: 'rgba(191, 173, 127, 0.2)',
    borderColor: 'rgba(191, 173, 127, 0.6)',
    boxShadow: '0 0 15px rgba(191, 173, 127, 0.2)',
  },
  traitHeader: {
    marginBottom: '0.5rem',
  },
  traitName: {
    color: '#bfad7f',
    fontSize: '1rem',
    margin: 0,
    fontWeight: 500,
  },
  traitDesc: {
    color: 'rgba(224, 224, 224, 0.7)',
    fontSize: '0.85rem',
    margin: 0,
    lineHeight: 1.4,
    flexGrow: 1,
  },
  traitFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '0.75rem',
  },
  probabilityBadge: {
    backgroundColor: 'rgba(125, 107, 158, 0.3)',
    color: '#e0e0e0',
    padding: '0.1rem 0.5rem',
    borderRadius: '2px',
    fontSize: '0.75rem',
    alignSelf: 'flex-end',
  },
  
  // Expanded trait view
  expandedTraitOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 10, 15, 0.9)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  expandedTraitContent: {
    backgroundColor: 'rgba(20, 20, 25, 0.95)',
    borderRadius: '8px',
    border: '1px solid rgba(191, 173, 127, 0.4)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
    width: '100%',
    maxWidth: '900px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '2rem',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'rgba(224, 224, 224, 0.7)',
    fontSize: '1.5rem',
    cursor: 'pointer',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(191, 173, 127, 0.2)',
      color: '#e0e0e0',
    },
  },
  
  // Environment panel
  environmentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
  },
  sliderContainer: {
    marginBottom: '1.5rem',
    userSelect: 'none',
  },
  sliderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  sliderLabel: {
    color: '#e0e0e0',
    fontSize: '1rem',
  },
  sliderValue: {
    fontWeight: 'bold',
    color: '#bfad7f',
  },
  sliderTrack: {
    width: '100%',
    height: '8px',
    backgroundColor: 'rgba(30, 30, 40, 0.6)',
    borderRadius: '4px',
    position: 'relative',
    margin: '0.5rem 0',
    cursor: 'pointer',
  },
  sliderFill: {
    position: 'absolute',
    height: '100%',
    borderRadius: '4px',
    pointerEvents: 'none',
  },
  sliderThumb: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: '#bfad7f',
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    cursor: 'grab',
    border: '2px solid rgba(15, 15, 20, 0.9)',
    boxShadow: '0 0 5px rgba(191, 173, 127, 0.5)',
    '&:active': {
      cursor: 'grabbing',
    }
  },
  activeThumb: {
    transform: 'translate(-50%, -50%) scale(1.1)',
    cursor: 'grabbing',
  },
  sliderScale: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    color: 'rgba(224, 224, 224, 0.6)',
  },
  
  // Synthesis panel
  synthesisContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '1.5rem',
  },
  synthesisCard: {
    backgroundColor: 'rgba(30, 30, 40, 0.6)',
    border: '1px solid rgba(125, 107, 158, 0.4)',
    borderRadius: '4px',
    padding: '1.25rem',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(125, 107, 158, 0.1)',
      borderColor: 'rgba(125, 107, 158, 0.6)',
      transform: 'translateY(-2px)',
    },
  },
  synthesisHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  synthesisTitle: {
    color: '#7D6B9E',
    fontSize: '1.1rem',
    margin: 0,
  },
  synthesisProbability: {
    backgroundColor: 'rgba(125, 107, 158, 0.3)',
    color: '#e0e0e0',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.85rem',
  },
  
  // Section minimization styles
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1.5rem',
    backgroundColor: 'rgba(15, 15, 20, 0.4)',
    borderRadius: '4px 4px 0 0',
    borderBottom: '1px solid rgba(191, 173, 127, 0.2)',
    marginBottom: '1rem',
  },

  minimizeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'rgba(224, 224, 224, 0.7)',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(191, 173, 127, 0.2)',
      color: '#e0e0e0',
    },
  },
  
  // Media queries for responsive design
  '@media (max-width: 768px)': {
    controlBar: {
      flexDirection: 'column',
      gap: '1rem',
    },
    controlSection: {
      width: '100%',
    },
    mainTabs: {
      padding: '0',
    },
    mainTab: {
      flex: 1,
      padding: '0.75rem 0.5rem',
      fontSize: '0.9rem',
    },
    environmentGrid: {
      gridTemplateColumns: '1fr',
    },
    synthesisContainer: {
      gridTemplateColumns: '1fr',
    },
  }
});

/**
 * EvoSimShowcaseBar - Improved navigation component for the Evolution Simulator
 */
const EvoSimShowcaseBar = ({
  selectedBodyShape = 'amorphous',
  onBodyShapeChange,
  activeTab = 'traits',
  onTabChange,
  visualizationMode = 'direct',
  onVisualizationModeChange,
  environment = {},
  onEnvironmentChange,
  showEmergence = false,
  onToggleEmergence,
  selectedTraits = {},
  onTraitChange,
  zoom = 1,
  onZoomChange,
  selectedCategory = null,
  onCategoryFilterChange
}) => {
  const classes = useStyles();
  
  // Local state for dropdowns and menus
  const [showBodyShapeMenu, setShowBodyShapeMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [expandedTrait, setExpandedTrait] = useState(null);
  const [effectiveStress, setEffectiveStress] = useState(0);
  const [draggedFactor, setDraggedFactor] = useState(null);
  const [activeThumb, setActiveThumb] = useState(null);
  
  // Add state for minimized sections
  const [minimizedSections, setMinimizedSections] = useState({
    traits: false,
    environment: false,
    synthesis: false
  });
  
  // Refs for draggable sliders
  const sliderRefs = useRef({});
  
  // Wrap all static data arrays in useMemo hooks
  const staticData = useMemo(() => {
    // Define body shapes
    const bodyShapes = [
      { id: 'bipedal', name: 'Bipedal', description: 'Upright forms with manipulative upper limbs' },
      { id: 'quadrupedal', name: 'Quadrupedal', description: 'Four-limbed forms optimized for stability and movement' },
      { id: 'serpentine', name: 'Serpentine', description: 'Elongated, limbless forms specialized for flexibility' },
      { id: 'amorphous', name: 'Amorphous', description: 'Malleable forms without fixed structure' },
      { id: 'insectoid', name: 'Multi-limbed', description: 'Multi-limbed, segmented forms' },
      { id: 'avian', name: 'Avian', description: 'Forms optimized for flight and aerial movement' },
      { id: 'aquatic', name: 'Aquatic', description: 'Forms specialized for water environments' }
    ];
    
    // Define trait categories
    const traitCategories = [
      { id: 'locomotion', name: 'Locomotion', color: '#7D6B9E' },
      { id: 'metabolism', name: 'Metabolism', color: '#5C9D8B' },
      { id: 'sensory', name: 'Sensory Acuity', color: '#C99846' },
      { id: 'etheric', name: 'Etheric Adaptation', color: '#B54B4B' },
      { id: 'thermal', name: 'Thermal Regulation', color: '#A67C52' }
    ];
    
    // Define environmental factors
    const environmentalFactors = [
      { 
        id: 'eldritch_influence', 
        name: 'Eldritch Influence', 
        default: 0.5,
        min: 0,
        max: 1,
        minLabel: 'None',
        maxLabel: 'Overwhelming',
        color: '#7D6B9E'
      },
      { 
        id: 'corruption_level', 
        name: 'Corruption Level', 
        default: 0.5,
        min: 0,
        max: 1,
        minLabel: 'Pure',
        maxLabel: 'Corrupted',
        color: '#B54B4B'
      },
      { 
        id: 'resource_scarcity', 
        name: 'Resource Scarcity', 
        default: 0.5,
        min: 0,
        max: 1,
        minLabel: 'Abundant',
        maxLabel: 'Barren',
        color: '#5C9D8B'
      },
      { 
        id: 'ambient_magic', 
        name: 'Ambient Magic', 
        default: 0.5,
        min: 0,
        max: 1,
        minLabel: 'Mundane',
        maxLabel: 'Saturated',
        color: '#bfad7f'
      },
      { 
        id: 'darkness', 
        name: 'Darkness', 
        default: 0.5,
        min: 0,
        max: 1,
        minLabel: 'Light',
        maxLabel: 'Dark',
        color: '#333333'
      }
    ];
    
    // Sample data for traits (would come from props in real implementation)
    const traitsByCategory = {
      locomotion: [
        { id: 'pseudopods', name: 'Extendable Pseudopods', description: 'Protoplasmic extensions that can be formed at will for movement and manipulation.', probability: 0.82 },
        { id: 'flowing', name: 'Cytoplasmic Flow', description: 'Coordinated internal cytoplasmic movement enabling directional locomotion.', probability: 0.65 },
        { id: 'rolling', name: 'Spherical Rolling', description: 'Ability to condense body into a spherical form for rapid movement on flat surfaces.', probability: 0.43 }
      ],
      metabolism: [
        { id: 'omnivore', name: 'Omnivore Adaptation', description: 'Versatile digestive system capable of processing diverse food sources.', probability: 0.76 },
        { id: 'absorption', name: 'Direct Absorption', description: 'Ability to absorb nutrients directly through cell membranes without specialized organs.', probability: 0.59 },
        { id: 'photosynthetic', name: 'Photosynthetic Cells', description: 'Cellular structures that can convert light into energy.', probability: 0.37 }
      ],
      sensory: [
        { id: 'omnidirectional', name: 'Omnidirectional Sensing', description: 'Sensory structures distributed throughout the body providing 360° awareness.', probability: 0.68 },
        { id: 'vibration_detection', name: 'Vibration Detection', description: 'Specialized organs that can detect minute vibrations through various media.', probability: 0.52 },
        { id: 'ether_sensing', name: 'Ether Sensing', description: 'Specialized organs that can detect and interpret etheric energy patterns.', probability: 0.41 }
      ],
      etheric: [
        { id: 'ether_channeling', name: 'Ether Channeling', description: 'Biological structures capable of directing and manipulating etheric energies.', probability: 0.74 },
        { id: 'dimensional_anchor', name: 'Dimensional Anchor', description: 'Etheric organ that stabilizes the creature\'s position within reality.', probability: 0.47 },
        { id: 'etheric_osmosis', name: 'Etheric Osmosis', description: 'Passive absorption of ambient etheric energy to fuel biological processes.', probability: 0.36 }
      ],
      thermal: [
        { id: 'adaptive_membrane', name: 'Adaptive Membrane', description: 'External membrane that adjusts permeability based on environmental temperature.', probability: 0.65 },
        { id: 'thermal_conversion', name: 'Thermal Conversion', description: 'Cellular structures that convert temperature differentials into usable energy.', probability: 0.39 },
        { id: 'heat_vents', name: 'Heat Vents', description: 'Specialized structures that can rapidly dissipate excess heat.', probability: 0.28 }
      ]
    };
    
    // Sample synthesis options
    const synthesisOptions = [
      {
        id: 'reality_weaving',
        name: 'Reality Weaving',
        description: 'Ability to manipulate the fabric of reality through precise etheric control, allowing for the creation of temporary structures or effects.',
        probability: 0.37,
        requirements: [
          'Requires Ether Channeling trait',
          'Requires Dimensional Anchor trait',
          'Requires Eldritch Influence ({">"}0.7)'
        ]
      },
      {
        id: 'dimensional_fluidity',
        name: 'Dimensional Fluidity',
        description: 'Ability to flow between dimensional planes, existing partially in multiple realities simultaneously, providing unique sensory and defensive capabilities.',
        probability: 0.19,
        requirements: [
          'Requires Cytoplasmic Flow trait',
          'Requires Ether Channeling trait',
          'Requires prolonged exposure to high Eldritch Influence'
        ]
      },
      {
        id: 'perfect_mimicry',
        name: 'Perfect Mimicry',
        description: 'Complete assimilation of consumed entities, including memories, abilities, and physical characteristics, enabling perfect disguise and adaptation.',
        probability: 0.23,
        requirements: [
          'Requires Omnivore Adaptation trait',
          'Requires Extendable Pseudopods trait',
          'Requires Resource Scarcity ({">"}0.6)'
        ]
      }
    ];
    
    return {
      bodyShapes,
      traitCategories,
      environmentalFactors,
      traitsByCategory,
      synthesisOptions
    };
  }, []); // Empty dependency array means this will only be calculated once
  
  // The rest of your component code, just updated to reference the memoized data
  // e.g., staticData.bodyShapes instead of bodyShapes
  
  // Toggle minimize state for a section
  const toggleSectionMinimize = (section) => {
    setMinimizedSections({
      ...minimizedSections,
      [section]: !minimizedSections[section]
    });
  };
  
  // Calculate effective stress from environment
  useEffect(() => {
    // Simple calculation for demonstration
    let stressSum = 0;
    let count = 0;
    
    staticData.environmentalFactors.forEach(factor => {
      const value = environment[factor.id] !== undefined ? environment[factor.id] : factor.default;
      stressSum += value;
      count++;
    });
    
    setEffectiveStress(count > 0 ? stressSum / count : 0);
  }, [environment, staticData.environmentalFactors]);
  
  // Handle body shape selection
  const handleBodyShapeSelect = (shapeId) => {
    onBodyShapeChange(shapeId);
    setShowBodyShapeMenu(false);
  };
  
  // Handle category filter selection
  const handleCategorySelect = (categoryId) => {
    onCategoryFilterChange(categoryId);
    setShowFilterMenu(false);
  };
  
  // Handle trait selection
  const handleTraitSelect = (categoryId, traitId) => {
    onTraitChange(categoryId, traitId);
  };
  
  // Improved slider track click handler
  const handleSliderClick = (factorId, e) => {
    if (!sliderRefs.current[factorId]) return;
    
    const sliderRect = sliderRefs.current[factorId].getBoundingClientRect();
    const factor = staticData.environmentalFactors.find(f => f.id === factorId);
    
    if (!factor) return;
    
    // Calculate the new value based on click position
    let percentage = (e.clientX - sliderRect.left) / sliderRect.width;
    percentage = Math.max(0, Math.min(1, percentage));
    
    const value = factor.min + percentage * (factor.max - factor.min);
    
    onEnvironmentChange({
      ...environment,
      [factorId]: parseFloat(value.toFixed(2))
    });
  };
  
  // Improved thumb mouse down handler
  const handleThumbMouseDown = (factorId, e) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggedFactor(factorId);
    setActiveThumb(factorId);
    
    // Add event listeners to document to track mouse movement
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Improved mouse movement handler
  const handleMouseMove = (e) => {
    if (!draggedFactor || !sliderRefs.current[draggedFactor]) return;
    
    e.preventDefault(); // Prevent text selection during drag
    
    const sliderRect = sliderRefs.current[draggedFactor].getBoundingClientRect();
    const factor = staticData.environmentalFactors.find(f => f.id === draggedFactor);
    
    if (!factor) return;
    
    // Calculate the new value based on mouse position
    let percentage = (e.clientX - sliderRect.left) / sliderRect.width;
    percentage = Math.max(0, Math.min(1, percentage));
    
    const value = factor.min + percentage * (factor.max - factor.min);
    
    onEnvironmentChange({
      ...environment,
      [draggedFactor]: parseFloat(value.toFixed(2))
    });
  };
  
  // Improved mouse up handler
  const handleMouseUp = (e) => {
    e.preventDefault();
    setDraggedFactor(null);
    setActiveThumb(null);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  // Improved touch event handlers for mobile support
  const handleTouchStart = (factorId, e) => {
    e.stopPropagation();
    setDraggedFactor(factorId);
    setActiveThumb(factorId);
    
    // Add event listeners for touch movement
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchEnd);
  };
  
  // Improved touch movement handler
  const handleTouchMove = (e) => {
    if (!draggedFactor || !sliderRefs.current[draggedFactor]) return;
    
    e.preventDefault(); // Prevent scrolling while dragging
    
    const touch = e.touches[0];
    const sliderRect = sliderRefs.current[draggedFactor].getBoundingClientRect();
    const factor = staticData.environmentalFactors.find(f => f.id === draggedFactor);
    
    if (!factor) return;
    
    // Calculate the new value based on touch position
    let percentage = (touch.clientX - sliderRect.left) / sliderRect.width;
    percentage = Math.max(0, Math.min(1, percentage));
    
    const value = factor.min + percentage * (factor.max - factor.min);
    
    onEnvironmentChange({
      ...environment,
      [draggedFactor]: parseFloat(value.toFixed(2))
    });
  };
  
  // Improved touch end handler
  const handleTouchEnd = (e) => {
    if (e) e.preventDefault();
    setDraggedFactor(null);
    setActiveThumb(null);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    document.removeEventListener('touchcancel', handleTouchEnd);
  };
  
  // Handle zoom change
  const handleZoom = (direction) => {
    const newZoom = direction === 'in' 
      ? Math.min(zoom + 0.1, 3)
      : Math.max(zoom - 0.1, 0.5);
    onZoomChange(newZoom);
  };
  
  // Get selected body shape name
  const getSelectedBodyShapeName = () => {
    const shape = staticData.bodyShapes.find(shape => shape.id === selectedBodyShape);
    return shape ? shape.name : 'Select Body Shape';
  };
  
  // Render environmental factor slider with enhanced draggable functionality
  const renderEnvironmentalSlider = (factor) => {
    const value = environment[factor.id] !== undefined 
      ? environment[factor.id] 
      : factor.default;
    
    const percentage = (value / (factor.max - factor.min)) * 100;
    
    return (
      <div className={classes.sliderContainer} key={factor.id}>
        <div className={classes.sliderHeader}>
          <span className={classes.sliderLabel}>{factor.name}</span>
          <span className={classes.sliderValue}>{value.toFixed(2)}</span>
        </div>
        
        <div 
          className={classes.sliderTrack}
          ref={el => sliderRefs.current[factor.id] = el}
          onClick={(e) => handleSliderClick(factor.id, e)}
        >
          <div 
            className={classes.sliderFill}
            style={{ 
              width: `${percentage}%`,
              backgroundColor: factor.color
            }}
          />
          <div 
            className={`${classes.sliderThumb} ${activeThumb === factor.id ? classes.activeThumb : ''}`}
            style={{ 
              left: `${percentage}%`,
              cursor: draggedFactor === factor.id ? 'grabbing' : 'grab'
            }}
            onMouseDown={(e) => handleThumbMouseDown(factor.id, e)}
            onTouchStart={(e) => handleTouchStart(factor.id, e)}
            aria-label={`${factor.name} slider`}
            role="slider"
            aria-valuemin={factor.min}
            aria-valuemax={factor.max}
            aria-valuenow={value}
          />
        </div>
        
        <div className={classes.sliderScale}>
          <span>{factor.minLabel}</span>
          <span>{factor.maxLabel}</span>
        </div>
      </div>
    );
  };

  // Render section with minimize toggle
  const renderSectionHeader = (sectionId, title) => (
    <div className={classes.sectionHeader}>
      <h3 className={classes.sectionTitle}>{title}</h3>
      <button 
        className={classes.minimizeButton}
        onClick={() => toggleSectionMinimize(sectionId)}
        aria-label={minimizedSections[sectionId] ? `Expand ${title} section` : `Minimize ${title} section`}
      >
        {minimizedSections[sectionId] ? '▼' : '▲'}
      </button>
    </div>
  );
  
  return (
    <div className={classes.navContainer}>
      {/* Upper navigation bar with title */}
      <div className={classes.upperNav}>
        <div className={classes.titleSection}>
          <div className={classes.logoIcon}></div>
          <h1 className={classes.title}>Crescent Evolution System</h1>
        </div>
        
        {/* View controls (zoom, etc.) */}
        <div className={classes.viewControls}>
          <button 
            className={classes.viewButton}
            onClick={() => handleZoom('in')}
            title="Zoom in to see more detail"
            aria-label="Zoom in"
          >
            +
          </button>
          <button 
            className={classes.viewButton}
            onClick={() => handleZoom('out')}
            title="Zoom out to see more of the network"
            aria-label="Zoom out"
          >
            -
          </button>
        </div>
      </div>
      
      {/* Control bar with uniform sections */}
      <div className={classes.controlBar}>
        {/* Body Shape Section */}
        <div className={classes.controlSection}>
          <h3 className={classes.sectionTitle}>Body Shape</h3>
          <div className={classes.dropdownSelector}>
            <button 
              className={classes.selectorButton}
              onClick={() => {
                setShowBodyShapeMenu(!showBodyShapeMenu);
                setShowFilterMenu(false);
              }}
              aria-haspopup="listbox"
              aria-expanded={showBodyShapeMenu}
            >
              <span>{getSelectedBodyShapeName()}</span>
              <span>▼</span>
            </button>
            
            <AnimatePresence>
              {showBodyShapeMenu && (
                <motion.div
                  className={classes.selectorMenu}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  role="listbox"
                >
                  {staticData.bodyShapes.map(shape => (
                    <div 
                      key={shape.id}
                      className={`${classes.menuItem} ${selectedBodyShape === shape.id ? classes.menuItemActive : ''}`}
                      onClick={() => handleBodyShapeSelect(shape.id)}
                      role="option"
                      aria-selected={selectedBodyShape === shape.id}
                    >
                      <div className={classes.menuItemName}>{shape.name}</div>
                      <div className={classes.menuItemDesc}>{shape.description}</div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Filter Section */}
        <div className={classes.controlSection}>
          <h3 className={classes.sectionTitle}>Filter</h3>
          <div className={classes.dropdownSelector}>
            <button 
              className={classes.selectorButton}
              onClick={() => {
                setShowFilterMenu(!showFilterMenu);
                setShowBodyShapeMenu(false);
              }}
              aria-haspopup="listbox"
              aria-expanded={showFilterMenu}
            >
              <span>{!selectedCategory ? 'All Categories' : 
                staticData.traitCategories.find(c => c.id === selectedCategory)?.name || 'All Categories'}</span>
              <span>▼</span>
            </button>
            
            <AnimatePresence>
              {showFilterMenu && (
                <motion.div
                  className={classes.selectorMenu}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  role="listbox"
                >
                  <div 
                    className={`${classes.menuItem} ${selectedCategory === null ? classes.menuItemActive : ''}`}
                    onClick={() => handleCategorySelect(null)}
                    role="option"
                    aria-selected={selectedCategory === null}
                  >
                    <div className={classes.menuItemName}>All Categories</div>
                  </div>
                  
                  {staticData.traitCategories.map(category => (
                    <div 
                      key={category.id}
                      className={`${classes.menuItem} ${selectedCategory === category.id ? classes.menuItemActive : ''}`}
                      onClick={() => handleCategorySelect(category.id)}
                      role="option"
                      aria-selected={selectedCategory === category.id}
                    >
                      <div className={classes.menuItemName} style={{ color: category.color }}>{category.name}</div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Network Visualization Section */}
        <div className={classes.controlSection}>
          <h3 className={classes.sectionTitle}>Network Visualization</h3>
          <div className={classes.buttonGroup}>
            <button 
              className={`${classes.visualButton} ${visualizationMode === 'direct' ? classes.visualButtonActive : ''}`}
              onClick={() => onVisualizationModeChange('direct')}
              aria-pressed={visualizationMode === 'direct'}
            >
              Direct Connections
            </button>
            <button 
              className={`${classes.visualButton} ${visualizationMode === 'tree' ? classes.visualButtonActive : ''}`}
              onClick={() => onVisualizationModeChange('tree')}
              aria-pressed={visualizationMode === 'tree'}
            >
              Evolutionary Tree
            </button>
            <button 
              className={`${classes.visualButton} ${visualizationMode === 'category' ? classes.visualButtonActive : ''}`}
              onClick={() => onVisualizationModeChange('category')}
              aria-pressed={visualizationMode === 'category'}
            >
              Trait Category
            </button>
          </div>
        </div>
        
        {/* Trait Probabilities Section */}
        <div className={classes.controlSection}>
          <h3 className={classes.sectionTitle}>Trait Probabilities</h3>
          <button 
            className={classes.visualButton}
            onClick={onToggleEmergence}
            style={{ 
              width: '100%',
              backgroundColor: showEmergence ? 'rgba(125, 107, 158, 0.3)' : 'rgba(15, 15, 20, 0.6)',
              borderColor: showEmergence ? 'rgba(125, 107, 158, 0.6)' : 'rgba(191, 173, 127, 0.4)'
            }}
            aria-pressed={showEmergence}
          >
            {showEmergence ? 'Hide' : 'Show'} Emergence Probabilities
          </button>
        </div>
      </div>
      
      {/* Rest of the component (tabs, content panels, etc.) using references to staticData */}
      {/* Main content tabs */}
      <div className={classes.mainTabs}>
        <button 
          className={`${classes.mainTab} ${activeTab === 'traits' ? classes.mainTabActive : ''}`}
          onClick={() => onTabChange('traits')}
          role="tab"
          aria-selected={activeTab === 'traits'}
        >
          Fundamental Traits
        </button>
        <button 
          className={`${classes.mainTab} ${activeTab === 'environment' ? classes.mainTabActive : ''}`}
          onClick={() => onTabChange('environment')}
          role="tab"
          aria-selected={activeTab === 'environment'}
        >
          Environment
        </button>
        <button 
          className={`${classes.mainTab} ${activeTab === 'synthesis' ? classes.mainTabActive : ''}`}
          onClick={() => onTabChange('synthesis')}
          role="tab"
          aria-selected={activeTab === 'synthesis'}
        >
          Synthesis
        </button>
      </div>
      
      {/* Tab content */}
      <div className={classes.contentPanel} role="tabpanel">
        {/* Fundamental Traits Tab */}
        {activeTab === 'traits' && (
          <>
            {renderSectionHeader('traits', 'Fundamental Traits')}
            
            <AnimatePresence>
              {!minimizedSections.traits && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={classes.categoryFilters}>
                    <button 
                      className={`${classes.categoryButton} ${selectedCategory === null ? classes.categoryButtonActive : ''}`}
                      onClick={() => onCategoryFilterChange(null)}
                      aria-pressed={selectedCategory === null}
                    >
                      All Categories
                    </button>
                    
                    {staticData.traitCategories.map(category => (
                      <button 
                        key={category.id}
                        className={`${classes.categoryButton} ${selectedCategory === category.id ? classes.categoryButtonActive : ''}`}
                        onClick={() => onCategoryFilterChange(category.id)}
                        style={{ borderLeft: `3px solid ${category.color}` }}
                        aria-pressed={selectedCategory === category.id}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                  
                  <div className={classes.traitsContainer}>
                    {staticData.traitCategories
                      .filter(category => selectedCategory === null || selectedCategory === category.id)
                      .map(category => (
                      <div className={classes.categorySection} key={category.id}>
                        <div className={classes.categoryHeader}>
                          <div 
                            className={classes.categoryIcon}
                            style={{ backgroundColor: category.color }}
                          />
                          <h3 className={classes.categoryName}>{category.name}</h3>
                        </div>
                        
                        <div className={classes.traitCards}>
                          {staticData.traitsByCategory[category.id].map(trait => (
                            <div 
                              key={trait.id}
                              className={`${classes.traitCard} ${selectedTraits[category.id] === trait.id ? classes.traitCardActive : ''}`}
                              onClick={() => handleTraitSelect(category.id, trait.id)}
                              onDoubleClick={() => setExpandedTrait({ ...trait, category })}
                              role="button"
                              aria-pressed={selectedTraits[category.id] === trait.id}
                            >
                              <div className={classes.traitHeader}>
                                <h4 className={classes.traitName}>{trait.name}</h4>
                              </div>
                              <p className={classes.traitDesc}>{trait.description}</p>
                              <div className={classes.traitFooter}>
                                <span className={classes.probabilityBadge}>
                                  {(trait.probability * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
        
        {/* Environment Tab */}
        {activeTab === 'environment' && (
          <>
            {renderSectionHeader('environment', 'Environment')}
            
            <AnimatePresence>
              {!minimizedSections.environment && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={classes.environmentGrid}>
                    <div>
                      {staticData.environmentalFactors.slice(0, 3).map(factor => renderEnvironmentalSlider(factor))}
                    </div>
                    <div>
                      {staticData.environmentalFactors.slice(3).map(factor => renderEnvironmentalSlider(factor))}
                      
                      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'rgba(30, 30, 40, 0.4)', borderRadius: '4px' }}>
                        <h3 style={{ color: '#bfad7f', margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Environmental Stress</h3>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ color: '#e0e0e0' }}>Total Effective Stress:</span>
                          <span style={{ 
                            color: effectiveStress < 0.4 ? '#5C9D8B' : effectiveStress < 0.7 ? '#C99846' : '#B54B4B',
                            fontWeight: 'bold'
                          }}>
                            {(effectiveStress * 100).toFixed(0)}%
                          </span>
                        </div>
                        
                        <div style={{
                          width: '100%',
                          height: '8px',
                          backgroundColor: 'rgba(15, 15, 20, 0.6)',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          marginBottom: '1rem'
                        }}
                        role="progressbar"
                        aria-valuenow={effectiveStress * 100}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        >
                          <div style={{
                            width: `${effectiveStress * 100}%`,
                            height: '100%',
                            backgroundColor: effectiveStress < 0.4 ? '#5C9D8B' : effectiveStress < 0.7 ? '#C99846' : '#B54B4B',
                            transition: 'width 0.3s ease, background-color 0.3s ease'
                          }} />
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(224, 224, 224, 0.6)' }}>
                          <span>Stable</span>
                          <span>Moderate</span>
                          <span>Critical</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
        
        {/* Synthesis Tab */}
        {activeTab === 'synthesis' && (
          <>
            {renderSectionHeader('synthesis', 'Synthesis')}
            
            <AnimatePresence>
              {!minimizedSections.synthesis && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={classes.synthesisContainer}>
                    {staticData.synthesisOptions.map(synthesis => (
                      <div className={classes.synthesisCard} key={synthesis.id}>
                        <div className={classes.synthesisHeader}>
                          <h3 className={classes.synthesisTitle}>{synthesis.name}</h3>
                          <span className={classes.synthesisProbability}>
                            {(synthesis.probability * 100).toFixed(0)}%
                          </span>
                        </div>
                        
                        <p style={{ color: 'rgba(224, 224, 224, 0.8)', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                          {synthesis.description}
                        </p>
                        
                        <div style={{ 
                          backgroundColor: 'rgba(15, 15, 20, 0.5)', 
                          padding: '0.75rem',
                          borderRadius: '4px'
                        }}>
                          <h4 style={{ color: '#bfad7f', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                            Requirements
                          </h4>
                          
                          <ul style={{ 
                            margin: 0,
                            padding: '0 0 0 1.25rem',
                            color: 'rgba(224, 224, 224, 0.7)',
                            fontSize: '0.85rem'
                          }}>
                            {synthesis.requirements.map((req, index) => (
                              <li key={index} style={{ marginBottom: '0.25rem' }}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
      
      {/* Expanded trait overlay */}
      <AnimatePresence>
        {expandedTrait && (
          <motion.div 
            className={classes.expandedTraitOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedTrait(null)}
            role="dialog"
            aria-label={`Details for ${expandedTrait.name}`}
          >
            <motion.div 
              className={classes.expandedTraitContent}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <button 
                className={classes.closeButton}
                onClick={() => setExpandedTrait(null)}
                aria-label="Close trait details"
              >
                ×
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%',
                  backgroundColor: expandedTrait.category?.color || '#bfad7f'
                }} />
                <h2 style={{ color: '#bfad7f', margin: 0, fontSize: '1.75rem' }}>
                  {expandedTrait.name}
                </h2>
              </div>
              
              <p style={{ 
                color: '#e0e0e0', 
                fontSize: '1.1rem', 
                lineHeight: 1.6,
                margin: '0 0 2rem 0'
              }}>
                {expandedTrait.description}
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <h3 style={{ color: '#bfad7f', marginTop: 0 }}>Environmental Affinities</h3>
                  {/* This would show trait affinities to environment factors */}
                  <div style={{ 
                    backgroundColor: 'rgba(30, 30, 40, 0.4)',
                    padding: '1rem',
                    borderRadius: '4px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Eldritch Influence</span>
                      <span style={{ color: '#7D6B9E' }}>+0.3</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Corruption Level</span>
                      <span style={{ color: '#B54B4B' }}>-0.2</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Resource Scarcity</span>
                      <span style={{ color: '#5C9D8B' }}>+0.6</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Ambient Magic</span>
                      <span style={{ color: '#bfad7f' }}>+0.2</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Darkness</span>
                      <span style={{ color: '#e0e0e0' }}>0.0</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 style={{ color: '#bfad7f', marginTop: 0 }}>Connected Traits</h3>
                  {/* This would show traits connected to this one */}
                  <div style={{ 
                    backgroundColor: 'rgba(30, 30, 40, 0.4)',
                    padding: '1rem',
                    borderRadius: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      gap: '0.75rem', 
                      padding: '0.5rem',
                      backgroundColor: 'rgba(15, 15, 20, 0.3)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(15, 15, 20, 0.5)'
                      }
                    }}
                    role="button"
                    >
                      <div style={{ 
                        width: '16px', 
                        height: '16px', 
                        borderRadius: '50%',
                        backgroundColor: '#5C9D8B',
                        marginTop: '0.25rem'
                      }} />
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#bfad7f' }}>Direct Absorption</div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(224, 224, 224, 0.7)' }}>Metabolism</div>
                      </div>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      gap: '0.75rem', 
                      padding: '0.5rem',
                      backgroundColor: 'rgba(15, 15, 20, 0.3)',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    role="button"
                    >
                      <div style={{ 
                        width: '16px', 
                        height: '16px', 
                        borderRadius: '50%',
                        backgroundColor: '#B54B4B',
                        marginTop: '0.25rem'
                      }} />
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#bfad7f' }}>Dimensional Anchor</div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(224, 224, 224, 0.7)' }}>Etheric Adaptation</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ color: '#bfad7f' }}>Synthesis Potential</h3>
                <div style={{ 
                  backgroundColor: 'rgba(30, 30, 40, 0.4)',
                  padding: '1rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(125, 107, 158, 0.3)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ color: '#7D6B9E', margin: '0 0 0.5rem 0' }}>Dimensional Fluidity</h4>
                    <span style={{ 
                      backgroundColor: 'rgba(125, 107, 158, 0.3)',
                      color: '#e0e0e0',
                      padding: '0.1rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.85rem'
                    }}>19%</span>
                  </div>
                  <p style={{ color: 'rgba(224, 224, 224, 0.8)', margin: '0.5rem 0 1rem 0' }}>
                    Ability to flow between dimensional planes, existing partially in multiple realities simultaneously.
                  </p>
                  
                  <h5 style={{ color: '#bfad7f', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                    Trigger Conditions
                  </h5>
                  <ul style={{ 
                    margin: 0,
                    padding: '0 0 0 1.25rem',
                    color: 'rgba(224, 224, 224, 0.7)',
                    fontSize: '0.85rem'
                  }}>
                    <li>Requires Ether Channeling trait</li>
                    <li>High Eldritch Influence ({'>'}0.7)</li>
                    <li>30+ days of exposure to these conditions</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EvoSimShowcaseBar;