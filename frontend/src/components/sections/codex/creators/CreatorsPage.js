import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';
import Background from '../../../core/Background';
import RevealText from '../../../core/effects/RevealText';
import ProjectCard from '../../../core/effects/ProjectCard';
import PersonProfileCard from '../../../core/effects/holdereffects/PersonProfileCard';
import ScrollingTextAnimation from '../../../core/effects/ScrollingTextAnimation';
import MeteorShower from '../../../core/effects/cosmiceffects/MeteorShower';
import './creatorsPage.css';

/**
 * CreatorsPage Component
 * 
 * Main component for the Creator profile page featuring:
 * - Scroll-based title animation with configurable parameters
 * - Background with mouse-based parallax effect
 * - Animated sections that reveal on scroll
 * - Meteor shower effect in the header area
 */
const CreatorsPage = () => {
  // State management
  const [isLoaded, setIsLoaded] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [showMeteors] = useState(true);
  
  // References for elements and animations
  const creatorProfileRef = useRef(null);
  const headerRef = useRef(null);
  
  // Creator profile data
  const creatorData = {
    name: "Rosalia Fialkova",
    role: "Systems Designer & Technical Artist",
    image: "/assets/images/creators/rosalia.png",
    bio: [
      "I blend software engineering knowledge with creative vision. I'm in my element when I'm crafting high-quality, reusable (I hate seeing a good program not find mulitiple homes!) systems across frontend interfaces and backend architectures. Combining mathematical modeling with aesthetic intuition and developing modular components is fun!.",
      "My personal projects merge the scientific principles of evolution and adaptation with mythological themes of rebirth and renewal. I create 'things' that are both mechanically sound and narratively compelling, allowing users to explore complex themes through immersive experiences."
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
  
  // Project data array
  const projects = [
    {
      id: "crescent",
      title: "Crescent TTRPG",
      description: "A dark fantasy tabletop roleplaying game centered around cycles of creation, evolution, and destruction.",
      image: "/assets/images/backgrounds/Melting_Moon.png",
      tags: ["Game Design", "World Building", "System Design"]
    },
    {
      id: "crescent-website",
      title: "Crucible Platform",
      description: "A web platform for managing and algorithmically visualizing the cycles, character creation, and rule of Crescent. You're on it!",
      image: "/assets/images/backgrounds/Forest.png",
      tags: ["React", "UI/UX", "D3 visualization", "Javascript", "Styled Components"]
    },
    {
      id: "crucible",
      title: "Evolution Simulator",
      description: "A concept piece for my simulation system modeling trait-driven evolution within a dark fantasy framework. Click to see more!",
      image: "/assets/images/backgrounds/Jellyfish.png",
      path: "/codex/creators/creatorshowcase/EvolutionSimulatorConceptShowcase",
      tags: ["C++", "Data Modeling", "REST API", "Procedural Generation", "Complex Systems"]
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
  
  // Determine when the creator profile enters viewport
  const profileInView = useInView(creatorProfileRef, { 
    once: true, 
    threshold: 0.2 
  });
  
  // Track mouse position for parallax background effect
  const handleMouseMove = (e) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
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
    <div 
      className="crescent-creators-page"
      onMouseMove={handleMouseMove}
    >
      {/* Background component with interactive stars */}
      <Background cursorPosition={cursorPosition} setCursorPosition={setCursorPosition} />
      
      {/* Meteor Shower Effect */}
      {showMeteors && (
        <MeteorShower 
          height="100vh"
          zIndex={3}
          trailColor="rgba(191, 173, 127, 0.8)"
          glowColor="rgba(207, 185, 130, 0.6)"   
          coreColor="rgba(255, 248, 220, 1)"
          meteorDensity={8}
          meteorMinSize={1}
          meteorMaxSize={2}
          meteorSpeed={0.08}
          trailLength={400}
          trailSegments={120}
          enableParallax={true}
          parallaxIntensity={0.10}
          mode="linear"           // Switch to linear mode
          direction="top"        
          baseAngle={30}          // Base angle for meteors (degrees)
          angleVariation={15}     // Add randomness to the angle
        />
      )}
      
      {/* Main content area */}
      <div className="crescent-creators-page__content">
        {/* Title with scroll-then-stop effect */}
        <header ref={headerRef} className="crescent-creators-page__header">
          <ScrollingTextAnimation scrollConfig={titleScrollConfig}>
            <h1 className="crescent-creators-page__main-title">About the Author</h1>
          </ScrollingTextAnimation>
        </header>
        
        {/* Scrollable content that fades in on load */}
        <div className={`crescent-creators-page__scrollable-content ${isLoaded ? 'crescent-creators-page__scrollable-content--loaded' : ''}`}>
          {/* Introduction section with reveal animations */}
          <section className="crescent-creators-page__section crescent-creators-page__intro">
            <RevealText threshold={0.2}>
              <p className="crescent-creators-page__intro-quote">
                "Though my soul may set in darkness,<br />
                it will rise in perfect light;<br />
                I have loved the stars too fondly<br />
                to be fearful of the night."
              </p>
              <p className="crescent-creators-page__quote-author">— Sarah Williams, "The Old Astronomer to His Pupil"</p>
            </RevealText>
            
            <RevealText delay={300}>
              <p className="crescent-creators-page__subtitle">
                My personal projects are born from my fascination with cycles of rebirth and destruction—the eternal dance between light and darkness. I try to weave together mathematical modeling, narrative structure, and visual aesthetics to craft immersive tools, simulations, and models.
              </p>
            </RevealText>
          </section>
          
          {/* Creator profile section with motion animation */}
          <section className="crescent-creators-page__section">
            <PersonProfileCard
              person={creatorData}
              animationConfig={{
                useInternalRef: false,
                ref: creatorProfileRef,
                isInView: profileInView,
                threshold: 0.2,
                once: true
              }}
            />
          </section>
          
          {/* Projects section */}
          <section className="crescent-creators-page__section crescent-creators-page__projects">
            <RevealText>
              <h2 className="crescent-creators-page__section-title">Works</h2>
              <div className="crescent-creators-page__title-divider"></div>
            </RevealText>
            
            <div className="crescent-creators-page__projects-grid">
              {projects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          </section>
          
          {/* Inspiration section */}
          <section className="crescent-creators-page__section crescent-creators-page__inspiration">
            <div className="crescent-creators-page__inspiration-bg"></div>
            
            <RevealText>
              <h2 className="crescent-creators-page__section-title">Inspirations</h2>
              <div className="crescent-creators-page__title-divider"></div>
            </RevealText>
            
            <div className="crescent-creators-page__inspiration-categories">
              <div className="crescent-creators-page__inspiration-category">
                <RevealText delay={200}>
                  <h3 className="crescent-creators-page__inspiration-heading">Literary & Media</h3>
                  <ul className="crescent-creators-page__inspiration-list">
                    <li className="crescent-creators-page__inspiration-item">Berserk by Kentaro Miura</li>
                    <li className="crescent-creators-page__inspiration-item">Made in Abyss by Akihito Tsukushi</li>
                    <li className="crescent-creators-page__inspiration-item">Bloodborne by FromSoft</li>
                    <li className="crescent-creators-page__inspiration-item">Scavenger's Reign by Joseph Bennett & Christopher Huettner</li>
                  </ul>
                </RevealText>
              </div>
              
              <div className="crescent-creators-page__inspiration-category">
                <RevealText delay={400}>
                  <h3 className="crescent-creators-page__inspiration-heading">Tabletop RPG</h3>
                  <ul className="crescent-creators-page__inspiration-list">
                    <li className="crescent-creators-page__inspiration-item">Blades in the Dark by John Harper</li>
                    <li className="crescent-creators-page__inspiration-item">Mouse Guard by Luke Crane</li>
                    <li className="crescent-creators-page__inspiration-item">Ironsworn by Shaun Tomkin</li>
                    <li className="crescent-creators-page__inspiration-item">Heart by Grant Howitt & Christopher Taylor</li>
                  </ul>
                </RevealText>
              </div>
            </div>
          </section>
          
          {/* Final cosmic message */}
          <section className="crescent-creators-page__section crescent-creators-page__final">
            <RevealText>
              <p className="crescent-creators-page__final-text">
                "In each beginning, the Moon gives birth to the skies and earth. 
                Ether, the life-sustaining substance of the Moon, swells across the newborn world.
                With ether comes life. With that life comes profound light and shadow."
              </p>
            </RevealText>
          </section>
        </div>
      </div>
      
      {/* Accessibility skip link */}
      <a href="#content" className="crescent-creators-page__skip-link">
        Skip to main content
      </a>
    </div>
  );
};

export default CreatorsPage;