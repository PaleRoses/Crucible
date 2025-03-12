import React, { useState, useEffect } from 'react';
import Background from '../../../layout/Background';
import RevealText from '../../../core/effects/texteffects/RevealText';
import ProjectCard from '../../../core/effects/holdereffects/ProjectCard';
import PersonProfileCard from '../../../core/effects/holdereffects/PersonProfileCard';
import ScrollingTextAnimation from '../../../core/effects/texteffects/ScrollingTextAnimation';
import MeteorShower from '../../../core/effects/cosmiceffects/MeteorShower';
import { createUseStyles } from 'react-jss';

// Styles for the CreatorsPage component
const useStyles = createUseStyles({
  creatorsPage: {
    minHeight: '100vh',
    color: '#fff',
    overflowX: 'hidden',
  },
  
  content: {
    position: 'relative',
    zIndex: 2,
    paddingTop: '60vh', // Space for header and title
    '@media (max-width: 768px)': {
      paddingTop: '30vh',
    }
  },
  
  header: {
    position: 'relative',
    marginBottom: '2rem',
    textAlign: 'center',
    height: '200px',
    overflow: 'visible',
  },
  
  mainTitle: {
    fontSize: '3.5rem',
    fontWeight: 300,
    color: '#bfad7f',
    textTransform: 'uppercase',
    letterSpacing: '0.25em',
    margin: 0,
    textShadow: '0 0 10px rgba(191, 173, 127, 0.3)',
    '@media (max-width: 768px)': {
      fontSize: '2.2rem',
      letterSpacing: '0.2em',
    }
  },
  
  scrollableContent: {
    position: 'relative',
    zIndex: 5,
    opacity: 0,
    transition: 'opacity 0.5s ease',
  },
  
  loaded: {
    opacity: 1,
  },
  
  section: {
    padding: '5rem 2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    position: 'relative',
    '@media (max-width: 768px)': {
      padding: '3rem 1.5rem',
    }
  },
  
  profileSection: {
    padding: '2rem',
    '@media (max-width: 768px)': {
      padding: '1rem',
    }
  },
  
  intro: {
    textAlign: 'center',
    paddingTop: '2rem',
  },
  
  introQuote: {
    fontFamily: '"Garamond", "Adobe Caslon Pro", serif',
    fontSize: '1.3rem',
    lineHeight: 1.7,
    color: 'rgba(191, 173, 127, 0.8)',
    marginBottom: '0.5rem',
    fontWeight: 300,
    fontStyle: 'italic',
    '@media (max-width: 768px)': {
      fontSize: '1.1rem',
    }
  },
  
  quoteAuthor: {
    fontSize: '1rem',
    color: 'rgba(224, 224, 224, 0.6)',
    textAlign: 'right',
    maxWidth: '600px',
    margin: '0 auto 3rem',
    fontWeight: 300,
    marginBottom: '2rem',
  },
  
  subtitle: {
    fontSize: '1.1rem',
    color: 'rgba(224, 224, 224, 0.7)',
    maxWidth: '700px',
    margin: '0 auto',
    lineHeight: 1.6,
    marginBottom: '20rem',
    fontFamily: '"Garamond", "Adobe Caslon Pro", serif',
    fontWeight: 300,
    '@media (max-width: 768px)': {
      fontSize: '0.9rem',
    }
  },
  
  projectsSection: {
    paddingTop: '23rem',
    paddingBottom: '6rem',
  },
  
  sectionTitle: {
    fontSize: '2.2rem',
    textAlign: 'center',
    color: '#bfad7f',
    fontWeight: 300,
    letterSpacing: '0.1em',
    marginBottom: '0.5rem',
    '@media (max-width: 768px)': {
      fontSize: '1.8rem',
    }
  },
  
  titleDivider: {
    width: '150px',
    height: '1px',
    margin: '1rem auto',
  },
  
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '2rem',
    marginTop: '3rem',
    '@media (max-width: 768px)': {
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    }
  },
  
  finalSection: {
    textAlign: 'center',
    padding: '6rem 2rem',
  },
  
  finalText: {
    fontFamily: '"Garamond", "Adobe Caslon Pro", serif',
    fontSize: '1.3rem',
    lineHeight: 1.8,
    color: 'rgba(191, 173, 127, 0.7)',
    fontWeight: 300,
    fontStyle: 'italic',
    maxWidth: '800px',
    margin: '0 auto',
    '@media (max-width: 768px)': {
      fontSize: '1.1rem',
    }
  }
});

/**
 * CreatorsPage Component
 * 
 * Main component for the Creator profile page featuring:
 * - Enhanced split layout profile card
 * - Animated sections that reveal on scroll
 * - Meteor shower effect in the header area
 */

const CreatorsPage = () => {
  // Hooks
  const classes = useStyles();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showMeteors] = useState(true);
  
  // Creator profile data
  const creatorData = {
    name: "Rosalia Fialkova",
    role: "Computer Science Student",
    tagline: 
      <>
        I craft immersive systems<br />
        and experiences.
      </>,
    image: "/assets/images/creators/rosalia.png",
    bio: [
      
      "I strive to create accessible and well-structured systems that balance technical excellence with user experience. My personal projects are born from my fascination with cycles of rebirth and destruction—the eternal dance between light and darkness. I weave mathematical modeling, narrative structure, and visual aesthetics to craft immersive tools and simulations.",
    ],
    stats: [
      { value: "Stellar", label: "Motivation to Design" },
      { 
        value: <span className="math-formula">tanh(σ(i))</span>, 
        label: "Favorite Function" 
      },
      { value: "∞", label: "Cycles of Debugging" }
    ],
    experience: [
      {
        content: (
          <>
            <h3 style={{
              fontSize: '1.4rem',
              color: '#bfad7f',
              marginBottom: '1rem',
              fontWeight: '300',
            }}>
              Models
            </h3>
          </>
        )
      },
      {
        content: "I try to approach complex systems by deconstructing abstract concepts into atomic components. The decomposition process reveals the underlying patterns that drive system behavior. Once isolated, these patterns can be translated into modular, reusable components that form building blocks for robust architectures, allowing elegant solutions to emerge from the complexity."
      },
      {
        content: "In the evolution simulator I'm working on, the trait system organizes attributes hierarchically around a central anchor, with each trait possessing affinities that represent effectiveness against environmental stressors. Traits form dynamic nodal networks where compatibility influences overall effectiveness."
      }
    ],
    projects: [
      {
        content: (
          <>
            <h3 style={{
              fontSize: '1.4rem',
              color: '#bfad7f', // Using the same highlight color
              marginBottom: '1rem',
              fontWeight: '300',
            }}>
              Projects
            </h3>
          </>
        )
      },
      {
        content: "For the Crescent TTRPG, I developed a tension-based character progression system where players must balance competing motivations. This mechanical framework reinforces the game's themes of sacrifice and transformation while providing meaningful player choices."
      },
      {
        content: "My evolution simulator is an ongoing attempt to translate algorithms into interactive dark fantasy creature creation simulator. By applying hyperbolic tangent normalization to multi-trait affinities, I hope to create a system that marries biological plausibility with computational efficiency."
      }
    ]
  };
  
  // Updated project data array with more detailed descriptions
  const projects = [
    {
      id: "crescent",
      title: "Crescent TTRPG",
      description: "A dark fantasy tabletop roleplaying game centered around cycles of creation, evolution, and destruction. This project combines narrative worldbuilding with elegant mechanical systems to create a cohesive player experience. The design focuses on character evolution and meaningful choices within a richly developed setting.",
      image: "/assets/images/backgrounds/Melting_Moon.png",
      tags: ["Game Design", "World Building", "System Design"]
    },
    {
      id: "crescent-website",
      title: "Crucible Platform",
      description: "A comprehensive web platform for managing Crescent gameplay with algorithmic visualizations of character evolution and game rules. This project challenged me to create intuitive interfaces for complex systems while maintaining aesthetic cohesion with the game's themes. Built using modern web technologies with performance and accessibility at the forefront.",
      image: "/assets/images/backgrounds/Forest.png",
      tags: ["React", "UI/UX", "D3 visualization", "Javascript", "Styled Components"]
    },
    {
      id: "crucible",
      title: "Evolution Simulator",
      description: "An ambitious concept piece modeling trait-driven evolution within a dark fantasy framework. This ongoing project aims to create a mathematically sound simulation of evolutionary processes while maintaining narrative coherence. The technical challenges include developing efficient algorithms for population dynamics and creating visually compelling representations of abstract concepts.",
      image: "/assets/images/backgrounds/Jellyfish.png",
      path: "/codex/creators/creatorshowcase/EvolutionSimulatorConceptShowcase",
      tags: ["C++ (SOON)", "Data Modeling", "REST API", "Procedural Generation"]
    }
  ];
  
  // Custom navigation items with properly structured content
  const navigationItems = [
    { id: 'about', label: 'ABOUT', content: null },
    { id: 'experience', label: 'MODELS', content: null },
    { id: 'projects', label: 'PROJECTS', content: null }
  ];
  
  // Define scroll animation configuration for title
  const titleScrollConfig = {
    startPosition: 0,
    endPosition: 300,
    initialY: -100,
    finalY: 185,
    clampValues: true,
    opacityValues: [1, 0.95, 0.9],
    opacityScrollPositions: [0, 300, 400]
  };
  
  // Remove unused navScrollConfig since it's not supported in the updated PersonProfileCard component
  
  // Function to handle section changes
  const handleSectionChange = (sectionId) => {
    console.log(`Active section changed to: ${sectionId}`);
    // Additional logic can be added here if needed
  };
  
  // Initialize loaded state after a short delay
  useEffect(() => {
    const loadTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    // Clean up timer on component unmount
    return () => clearTimeout(loadTimer);
  }, []);
  
  return (
    <div className={classes.creatorsPage}>
      {/* Background component with interactive stars */}
      <Background />
      
      {/* Meteor Shower Effect */}
      {showMeteors && (
        <MeteorShower 
          height="200vh"
          zIndex={3}
          trailColor="rgba(191, 173, 127, 0.8)"
          glowColor="rgba(207, 185, 130, 0.6)"   
          coreColor="rgba(255, 248, 220, 1)"
          meteorDensity={12}
          meteorMinSize={0.8}          
          meteorMaxSize={2.0}          
          meteorSpeed={0.04}
          trailLength={400}
          trailSegments={200}           
          enableParallax={true}
          parallaxIntensity={0.10}
          mode="linear"
          direction="top"
          baseAngle={30}
          angleVariation={15}
          burstParticleSize={2}
          burstParticleCount={8}
          burstProbability={0.55}
        />
      )}
      
      {/* Main content area */}
      <div className={classes.content}>
        {/* Title with scroll-then-stop effect */}
        <header className={classes.header}>
          <ScrollingTextAnimation scrollConfig={titleScrollConfig}>
            <h1 className={classes.mainTitle}>About Me</h1>
          </ScrollingTextAnimation>
        </header>
        
        {/* Scrollable content that fades in on load */}
        <div className={`${classes.scrollableContent} ${isLoaded ? classes.loaded : ''}`}>
          {/* Introduction section with reveal animations */}
          <section className={`${classes.section} ${classes.intro}`}>
            <RevealText threshold={0.2}>
              <p className={classes.introQuote}>
                "Though my soul may set in darkness,<br />
                it will rise in perfect light;<br />
                I have loved the stars too fondly<br />
                to be fearful of the night."
              </p>
              <p className={classes.quoteAuthor}>— Sarah Williams, "The Old Astronomer to His Pupil"</p>
              <p className={classes.subtitle}>
                My personal projects merge the scientific principles of evolution and adaptation with mythological themes of rebirth and renewal. I create 'things' that are both mechanically sound and narratively compelling, allowing users to explore complex themes through immersive experiences.
              </p>
            </RevealText>
          </section>
          
          {/* Enhanced profile card section - updated with proper props */}
          <section className={`${classes.section} ${classes.profileSection}`}>
            <PersonProfileCard
              person={creatorData}
              onSectionChange={handleSectionChange}
              animationConfig={{
                threshold: 0.2,
                once: true,
                initialY: 30,
                duration: 0.8
              }}
              topOffset={100}
              showStats={false}
              highlightColor="#bfad7f"
              textColor="rgba(224, 224, 224, 0.7)"
              minLineWidth={10}
              maxLineWidth={40}
              fontFamily='"Garamond", "Adobe Caslon Pro", serif'
              navigationItems={navigationItems}
              contentCompression={2}
            />
          </section>
          
          {/* Projects section with cards */}
          <section className={`${classes.section} ${classes.projectsSection}`}>
            <RevealText>
              <h2 className={classes.sectionTitle}>Works</h2>
              <div className={classes.titleDivider}></div>
            </RevealText>
            
            <div className={classes.projectsGrid}>
              {projects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          </section>
          
          {/* Final cosmic message */}
          <section className={`${classes.section} ${classes.finalSection}`}>
            <RevealText>
              <p className={classes.finalText}>
                "In each beginning, the Moon gives birth to the skies and earth. 
                Ether, the life-sustaining substance of the Moon, swells across the newborn world.
                With ether comes life. With that life comes profound light and shadow."
              </p>
            </RevealText>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CreatorsPage;