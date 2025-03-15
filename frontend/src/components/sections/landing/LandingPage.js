import React, { useState } from 'react';
import './landingPage.css';

// Import components
import Background from '../../layout/Background';
import IntroSequence from '../../core/IntroSequence';
import LandingNavigation from './LandingNavigation';
import LandingFooter from './LandingFooter';

const LandingPage = () => {
  // State management
  const [activeSection, setActiveSection] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [expandedSubsection, setExpandedSubsection] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showIntro, setShowIntro] = useState(true); // Always show intro by default
  const [animatingLayout, setAnimatingLayout] = useState(false);
  
  // Main sections data
  const mainSections = [
    {
      id: "cycles",
      title: "Cycles",
      description: "Endless cycles of creation and destruction.",
      icon: "circles",
      path: "/cycles",
      expandable: true,
      subsections: [
        {
          id: "new-world",
          title: "New Cycle",
          description: "Paint a new world onto an empty canvas",
          path: "/cycles/new-world"
        },
        {
          id: "revisit",
          title: "Load Cycle",
          description: "Revisit a fading echo",
          path: "/cycles/revisit"
        }
      ]
    },
    {
      id: "codex",
      title: "Codex",
      description: "Repository of knowledge and rules",
      icon: "triangle",
      path: "/codex",
      expandable: true,
      subsections: [
        {
          id: "creators",
          title: "Creators",
          description: "The minds behind the mysteries.",
          path: "/codex/creators/"
        },
        {
          id: "visualizations",
          title: "Visualizations",
          description: "Complex systems revealed through dynamic visual representations.",
          path: "/codex/visualizations",
          expandable: true,
          subsections: [
            {
              id: "creature-traits",
              title: "Creature Trait Visualization",
              description: "Explore how creatures adapt and evolve in response to environmental pressures.",
              path: "/codex/visualizations/creature-traits"
            },
            {
              id: "environmental",
              title: "Environmental Visualization",
              description: "Witness the formation and transformation of worlds and their ecosystems.",
              path: "/codex/visualizations/environmental"
            }
          ]
        },
        {
          id: "basics",
          title: "Basics",
          description: "Fundamental concepts and essential knowledge for beginners.",
          path: "/codex/basics"
        },
        {
          id: "advanced",
          title: "Advanced",
          description: "Complex theories and elaborate mechanics for seasoned explorers.",
          path: "/codex/advanced"
        }
      ]
    },
    {
      id: "characters",
      title: "Characters",
      description: "Beings shaped by their environments, each with a unique story to tell.",
      icon: "targetCircle",
      path: "/characters"
    }
  ];


  return (
    <div 
      className="landing-container"
      onClick={showIntro ? () => setShowIntro(false) : undefined}
    >
      {/* Background */}
      <Background/>
      
      {/* Intro Sequence */}
      <IntroSequence 
        showIntro={showIntro} 
        setShowIntro={setShowIntro} 
        setIsLoaded={setIsLoaded}
      />
      
      <div className={`content-wrapper ${isLoaded ? 'loaded' : ''}`}>
        <div className="content-container">
          <div className="title-container">
            <h1 className="main-title">CRESCENT</h1>
            <div className="title-divider" />
            <p className="subtitle">The world is locked into an endlessly recurring cycle of destruction and rebirth. Each new beginning brings a different world, shaped by the remnants of the past and the whims of the Moon.</p>
          </div>
          
          {/* Navigation */}
          <LandingNavigation 
            mainSections={mainSections}
            activeSection={activeSection}
            expandedSection={expandedSection}
            expandedSubsection={expandedSubsection}
            animatingLayout={animatingLayout}
            setActiveSection={setActiveSection}
            setExpandedSection={setExpandedSection}
            setExpandedSubsection={setExpandedSubsection}
            setAnimatingLayout={setAnimatingLayout}
          />
        </div>
        
        {/* Footer */}
        <LandingFooter />
      </div>
    </div>
  );
};

export default LandingPage;