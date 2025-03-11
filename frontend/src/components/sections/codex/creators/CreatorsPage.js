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
    paddingTop: '40vh', // Space for header and title
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
  },
  
  subtitle: {
    fontSize: '1.1rem',
    color: 'rgba(224, 224, 224, 0.7)',
    maxWidth: '700px',
    margin: '0 auto',
    lineHeight: 1.6,
    fontFamily: '"Garamond", "Adobe Caslon Pro", serif',
    fontWeight: 300,
    '@media (max-width: 768px)': {
      fontSize: '0.9rem',
    }
  },
  
  projectsSection: {
    paddingTop: '4rem',
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
    background: 'linear-gradient(to right, rgba(160, 142, 97, 0), rgba(160, 142, 97, 0.6), rgba(160, 142, 97, 0))',
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
    background: 'radial-gradient(circle at center, rgba(15, 15, 15, 0.5) 0%, rgba(8, 8, 8, 0.8) 70%)',
    '@media (max-width: 768px)': {
      padding: '3rem 1.5rem',
    }
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
    role: "Aspiring Systems Designer & Technical Artist",
    tagline: 
      <>
        Crafting immersive systems and experiences<br />
        with a artistic touch
      </>,
    image: "/assets/images/creators/rosalia.png",
    bio: [
      "I strive to create accessible and well-structured systems that balance technical excellence with user experience. My personal projects are born from my fascination with cycles of rebirth and destruction—the eternal dance between light and darkness. I try to weave together mathematical modeling, narrative structure, and visual aesthetics to craft immersive tools, simulations, and models.",
      "I aspire to blend software engineering knowledge with creative vision. I'm in my element when I'm crafting high-quality, reusable (I hate seeing a good program not find multiple homes!) systems across frontend interfaces and backend architectures. Combining mathematical modeling with aesthetic intuition and developing modular components is fun!"
    ],
    stats: [
      { value: "Stellar", label: "Motivation to Design" },
      { 
        value: <span className="math-formula">tanh(σ(i))</span>, 
        label: "Favorite Function" 
      },
      { value: "∞", label: "Cycles of Debugging" }
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
  
  // Define additional content sections for the profile card
  const additionalSections = [
    {
      title: "Design Philosophy",
      content: "I believe in creating systems that are both elegant and adaptable, capable of evolving alongside user needs. My approach draws inspiration from both natural processes and cultural narratives about transformation and growth."
    },
    {
      title: "Technical Framework",
      content: "My work combines traditional software engineering practices with experimental approaches to user experience. I'm particularly interested in the intersection of mathematical modeling, procedural generation, and narrative design."
    }
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
            <h1 className={classes.mainTitle}>About the Author</h1>
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
            </RevealText>
          </section>
          
          {/* Enhanced profile card section */}
          <section className={`${classes.section} ${classes.profileSection}`}>
            <PersonProfileCard
              person={creatorData}
              sections={additionalSections}
              animationConfig={{
                threshold: 0.2,
                once: true,
                initialY: 30,
                duration: 0.8
              }}
              cometConfig={{
                size: 1.5,
                trailLength: 100,
                speed: 0.001,
                targetFPS: 30,
                respectReducedMotion: true
              }}
              imagePosition={{
                x: 50,
                y: 0,
                scale: 1
              }}
              showProfileImage={false}
              allowImageToggle={false}
              navigationItems={[
                { id: 'about', label: 'ABOUT', content: null },
                { id: 'projects', label: 'PROJECTS', content: null }
              ]}
            />
          </section>
          
          {/* Projects section */}
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