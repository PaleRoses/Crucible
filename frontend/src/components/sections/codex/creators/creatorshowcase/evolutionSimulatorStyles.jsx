import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  evolutionSimulator: {
    position: 'relative',
    width: '100%',
    minHeight: '100vh',
    overflow: 'hidden',
    color: '#e0e0e0',
    fontFamily: '"Garamond", "Adobe Caslon Pro", serif',
    display: 'flex',
    flexDirection: 'column',
    padding: '2rem 0'
  },
  
  // Header
  header: {
    textAlign: 'center',
    padding: '1rem 2rem',
    position: 'relative',
    zIndex: 10,
    marginBottom: '2rem'
  },
  title: {
    color: '#bfad7f',
    fontSize: '3rem',
    fontWeight: 300,
    letterSpacing: '0.1em',
    margin: '0 0 0.5rem',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.7)'
  },
  subtitle: {
    color: 'rgba(224, 224, 224, 0.8)',
    fontSize: '1.2rem',
    maxWidth: '800px',
    margin: '0 auto',
    fontWeight: 300,
    lineHeight: 1.5,
    fontStyle: 'italic',
    textShadow: '0 1px 4px rgba(0, 0, 0, 0.8)'
  },
  
  // Main content
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    padding: '0 2rem 2rem',
    opacity: 0,
    transform: 'translateY(20px)',
    transition: 'opacity 1s ease, transform 1s ease',
    maxWidth: '1800px',
    width: '100%',
    margin: '0 auto',
    flexGrow: 1,
    zIndex: 10,
    position: 'relative'
  },
  loaded: {
    opacity: 1,
    transform: 'translateY(0)'
  },
  
  // Filter controls
  filterControls: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginBottom: '1rem'
  },
  filterButton: {
    background: 'rgba(10, 10, 15, 0.6)',
    border: '1px solid rgba(191, 173, 127, 0.3)',
    color: '#e0e0e0',
    padding: '0.5rem 1.25rem',
    borderRadius: '4px',
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: 'rgba(191, 173, 127, 0.2)',
      borderColor: 'rgba(191, 173, 127, 0.6)'
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
      '&:hover': {
        background: 'rgba(10, 10, 15, 0.6)',
        borderColor: 'rgba(191, 173, 127, 0.3)'
      }
    }
  },
  active: {
    background: 'rgba(191, 173, 127, 0.3) !important',
    borderColor: 'rgba(191, 173, 127, 0.8) !important',
    boxShadow: '0 0 10px rgba(191, 173, 127, 0.2)',
  },
  
  // Main layout structure
  networkContainer: {
    position: 'relative',
    flexGrow: 1,
    display: 'flex',
    height: '70vh',
    minHeight: '600px',
    backgroundColor: 'rgba(10, 10, 15, 0.3)',
    borderRadius: '6px',
    overflow: 'hidden',
    border: '1px solid rgba(191, 173, 127, 0.2)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
  },
  networkCanvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  },
  sidePanel: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  
  // Trait tooltip
  traitTooltip: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '300px',
    backgroundColor: 'rgba(15, 15, 15, 0.9)',
    borderRadius: '4px',
    overflow: 'hidden',
    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.6)',
    zIndex: 20,
    pointerEvents: 'none'
  },
  traitTooltipHeader: {
    padding: '0.75rem 1rem',
    '& h3': {
      margin: 0,
      fontSize: '1.1rem',
      fontWeight: 'normal',
      color: '#000',
    },
    '& span': {
      fontSize: '0.8rem',
      opacity: 0.7,
      color: '#000'
    }
  },
  traitTooltipContent: {
    padding: '0.75rem 1rem',
    '& p': {
      margin: '0 0 0.75rem',
      fontSize: '0.9rem',
      lineHeight: 1.5
    }
  },
  traitTooltipStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  traitTooltipStat: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    '& > span:first-child': {
      color: 'rgba(224, 224, 224, 0.7)'
    }
  },
  traitTooltipStatValue: {
    fontWeight: 'bold'
  },
  
  // Body shape selector
  bodyShapeSelector: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(15, 15, 15, 0.95)',
    border: '1px solid rgba(191, 173, 127, 0.4)',
    borderRadius: '6px',
    padding: '1.5rem',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80%',
    overflow: 'auto',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)',
    zIndex: 30
  },
  selectorTitle: {
    margin: '0 0 1rem',
    color: '#bfad7f',
    fontSize: '1.5rem',
    fontWeight: 'normal',
    textAlign: 'center',
    borderBottom: '1px solid rgba(191, 173, 127, 0.3)',
    paddingBottom: '0.75rem'
  },
  bodyShapeOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  bodyShapeOption: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    border: '1px solid rgba(191, 173, 127, 0.2)',
    borderRadius: '4px',
    padding: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(191, 173, 127, 0.2)',
      borderColor: 'rgba(191, 173, 127, 0.4)'
    }
  },
  selected: {
    backgroundColor: 'rgba(191, 173, 127, 0.3) !important',
    borderColor: 'rgba(191, 173, 127, 0.6) !important',
    boxShadow: '0 0 15px rgba(191, 173, 127, 0.2)'
  },
  bodyShapeName: {
    fontSize: '1.1rem',
    marginBottom: '0.25rem',
    color: '#bfad7f'
  },
  bodyShapeDescription: {
    fontSize: '0.9rem',
    color: 'rgba(224, 224, 224, 0.7)',
    lineHeight: 1.5
  },
  
  // Environment controls panel
  environmentControls: {
    backgroundColor: 'rgba(15, 15, 15, 0.7)',
    border: '1px solid rgba(191, 173, 127, 0.2)',
    borderRadius: '6px',
    padding: '1.5rem',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.3)'
  },
  controlsTitle: {
    margin: '0 0 1rem',
    color: '#bfad7f',
    fontSize: '1.25rem',
    fontWeight: 'normal',
    borderBottom: '1px solid rgba(191, 173, 127, 0.3)',
    paddingBottom: '0.5rem'
  },
  environmentSliders: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  sliderContainer: {
    width: '100%'
  },
  sliderLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.25rem',
    fontSize: '0.9rem'
  },
  sliderValue: {
    fontWeight: 'bold'
  },
  slider: {
    width: '100%',
    height: '6px',
    WebkitAppearance: 'none',
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: '3px',
    outline: 'none',
    '&::-webkit-slider-thumb': {
      WebkitAppearance: 'none',
      width: '14px',
      height: '14px',
      borderRadius: '50%',
      backgroundColor: '#bfad7f',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: '#d4c59a',
        transform: 'scale(1.1)'
      }
    },
    '&::-moz-range-thumb': {
      width: '14px',
      height: '14px',
      borderRadius: '50%',
      backgroundColor: '#bfad7f',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: '#d4c59a',
        transform: 'scale(1.1)'
      }
    }
  },
  adaptationStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  adaptationStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    '& > span': {
      fontSize: '0.9rem'
    }
  },
  stressBar: {
    width: '100%',
    height: '12px',
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: '6px',
    overflow: 'hidden',
    position: 'relative',
    '& > span': {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: '0.8rem',
      fontWeight: 'bold',
      color: '#fff',
      textShadow: '0 0 3px rgba(0, 0, 0, 0.8)',
      zIndex: 2
    }
  },
  stressBarFill: {
    height: '100%',
    transition: 'width 0.5s ease, background-color 0.5s ease'
  },
  
  // Trait details panel
  traitDetails: {
    backgroundColor: 'rgba(15, 15, 15, 0.7)',
    border: '1px solid rgba(191, 173, 127, 0.2)',
    borderRadius: '6px',
    width: '100%',
    maxWidth: '500px',
    overflow: 'hidden',
    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.3)'
  },
  traitDetailsHeader: {
    padding: '1rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  traitHeaderContent: {
    '& h2': {
      margin: 0,
      color: '#000',
      fontSize: '1.5rem',
      fontWeight: 'normal'
    }
  },
  traitName: {
    marginBottom: '0.25rem'
  },
  traitMeta: {
    fontSize: '0.9rem',
    opacity: 0.7,
    color: '#000'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'rgba(0, 0, 0, 0.8)',
    fontSize: '1.75rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    width: '28px',
    height: '28px',
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'scale(1.1)'
    }
  },
  traitDetailsContent: {
    padding: '1.5rem',
    maxHeight: '60vh',
    overflowY: 'auto'
  },
  traitDescription: {
    fontSize: '1rem',
    lineHeight: 1.6,
    marginBottom: '1.5rem',
    fontStyle: 'italic',
    color: 'rgba(224, 224, 224, 0.9)'
  },
  traitDetailsSection: {
    marginBottom: '1.5rem'
  },
  sectionTitle: {
    margin: '0 0 1rem',
    color: '#bfad7f',
    fontSize: '1.1rem',
    fontWeight: 'normal',
    borderBottom: '1px solid rgba(191, 173, 127, 0.3)',
    paddingBottom: '0.5rem'
  },
  affinitiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
    marginBottom: '1rem'
  },
  affinityItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem'
  },
  affinityName: {
    color: 'rgba(224, 224, 224, 0.8)'
  },
  affinityValue: {
    fontWeight: 'bold'
  },
  environmentalRelevance: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    padding: '0.75rem 1rem',
    borderRadius: '4px',
    marginTop: '1rem'
  },
  relevanceLabel: {
    fontSize: '0.9rem',
    color: '#bfad7f'
  },
  relevanceValue: {
    fontSize: '1.1rem',
    fontWeight: 'bold'
  },
  parentTrait: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    padding: '0.75rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(30, 30, 30, 0.8)'
    }
  },
  parentTraitIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    flexShrink: 0
  },
  parentTraitDetails: {
    display: 'flex',
    flexDirection: 'column'
  },
  parentTraitName: {
    fontSize: '1rem',
    marginBottom: '0.25rem'
  },
  parentTraitCategory: {
    fontSize: '0.8rem',
    color: 'rgba(224, 224, 224, 0.7)'
  },
  connectionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  connectionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    padding: '0.75rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(30, 30, 30, 0.8)'
    }
  },
  connectionItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  connectionDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    flexShrink: 0
  },
  connectionDetails: {
    display: 'flex',
    flexDirection: 'column'
  },
  connectionName: {
    fontSize: '0.95rem',
    marginBottom: '0.25rem'
  },
  connectionCategory: {
    fontSize: '0.8rem',
    color: 'rgba(224, 224, 224, 0.7)'
  },
  compatibilityBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  },
  highCompatibility: {
    backgroundColor: 'rgba(92, 157, 139, 0.3)',
    color: '#5C9D8B'
  },
  mediumCompatibility: {
    backgroundColor: 'rgba(201, 152, 70, 0.3)',
    color: '#C99846'
  },
  lowCompatibility: {
    backgroundColor: 'rgba(181, 75, 75, 0.3)',
    color: '#B54B4B'
  },
  synthesisPotential: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    padding: '1rem',
    borderRadius: '4px',
    border: '1px solid rgba(191, 173, 127, 0.3)'
  },
  synthesisName: {
    fontSize: '1.1rem',
    color: '#bfad7f',
    marginBottom: '0.5rem'
  },
  synthesisDescription: {
    fontSize: '0.95rem',
    color: 'rgba(224, 224, 224, 0.9)',
    lineHeight: 1.6,
    marginBottom: '0.75rem'
  },
  synthesisCondition: {
    fontSize: '0.9rem',
    display: 'flex',
    gap: '0.5rem',
    '& > span:first-child': {
      color: 'rgba(224, 224, 224, 0.7)'
    }
  },
  conditionName: {
    color: '#bfad7f',
    fontStyle: 'italic'
  },
  
  // Category legend
  categoryLegend: {
    backgroundColor: 'rgba(15, 15, 15, 0.7)',
    border: '1px solid rgba(191, 173, 127, 0.2)',
    borderRadius: '6px',
    padding: '1.5rem',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.3)'
  },
  legendItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  legendColor: {
    width: '16px',
    height: '16px',
    borderRadius: '50%'
  },
  legendName: {
    fontSize: '0.95rem'
  },
  
  // Utility classes
  positive: {
    color: '#5C9D8B'
  },
  negative: {
    color: '#B54B4B'
  },
  
  // Helper text
  instructions: {
    textAlign: 'center',
    fontSize: '0.9rem',
    color: 'rgba(191, 173, 127, 0.6)',
    padding: '1rem',
    position: 'relative',
    zIndex: 10
  },
  
  // Accessibility
  skipLink: {
    position: 'absolute',
    top: '-40px',
    left: 0,
    backgroundColor: '#bfad7f',
    color: '#000',
    padding: '0.5rem',
    zIndex: 1000,
    transition: 'top 0.3s ease',
    '&:focus': {
      top: 0
    }
  },
  
  // Media queries
  '@media (max-width: 768px)': {
    content: {
      padding: '0 1rem 1rem'
    },
    title: {
      fontSize: '2.25rem'
    },
    subtitle: {
      fontSize: '1rem'
    },
    networkContainer: {
      height: '50vh'
    },
    sidePanel: {
      flexDirection: 'column'
    }
  }
});

export default useStyles;