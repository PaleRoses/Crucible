import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useInView, useAnimation, useScroll, useTransform, useSpring } from 'framer-motion';
import styled, {} from 'styled-components';

/**
 * PersonProfileCard Component
 * 
 * A sophisticated profile card component with smooth animations, responsive design, and 
 * physics-based scroll behavior that provides an elegant user experience.
 * 
 * FEATURES:
 * - Framer Motion based smooth scrolling sidebar
 * - Animated navigation with staggered reveal effects
 * - Responsive design with mobile-specific optimizations
 * - Performant scroll handling with spring physics
 * - Optional statistics display with hover animations
 * - Customizable colors, sizes, and animations
 * 
 * @param {Object} props - Component props
 */
const PersonProfileCard = ({
  /**
   * Person data object containing profile information
   * @type {Object}
   * @property {string} name - Person's name
   * @property {string} role - Person's professional role or title
   * @property {string} [tagline] - Brief description or personal statement
   * @property {Array<string>} [bio] - Array of biography paragraphs
   * @property {Array<Object>} [stats] - Array of statistics objects with value and label
   * @property {Array<Object>} [experience] - Array of experience items with content
   * @property {Array<Object>} [projects] - Array of project items with content
   */
  person = {}, 

  /**
   * Animation configuration for the main component reveal
   * @type {Object}
   * @property {number} [threshold=0.2] - Visibility threshold to trigger animation (0-1)
   * @property {boolean} [once=true] - Whether animation should only play once
   * @property {number} [initialY=30] - Initial Y offset for animation
   * @property {number} [duration=0.8] - Animation duration in seconds
   */
  animationConfig = {
    threshold: 0.2,
    once: true,
    initialY: 30,
    duration: 0.8
  },

  /**
   * Additional content sections to display after the main navigation sections
   * @type {Array<Object>}
   * @property {string} [title] - Section title
   * @property {string|React.ReactNode} [content] - Section content
   */
  additionalSections = [],

  /**
   * Callback function when active section changes
   * @type {Function}
   * @param {string} sectionId - ID of the newly active section
   */
  onSectionChange = null,

  /**
   * Top offset in pixels for the fixed sidebar phase
   * Controls when the sidebar switches to the fixed position
   * @type {number}
   */
  topOffset = 100,

  /**
   * Whether to show statistics section
   * @type {boolean}
   */
  showStats = true,

  /**
   * Primary highlight color for headings and interactive elements
   * @type {string}
   */
  highlightColor = '#bfad7f',

  /**
   * Main text color for content
   * @type {string}
   */
  textColor = 'rgba(224, 224, 224, 0.7)',

  /**
   * Minimum width for navigation indicator lines in pixels
   * @type {number}
   */
  minLineWidth = 10,

  /**
   * Maximum width for navigation indicator lines in pixels
   * @type {number}
   */
  maxLineWidth = 40,

  /**
   * Font family for text content
   * @type {string}
   */
  fontFamily = '"Garamond", "Adobe Caslon Pro", serif',

  /**
   * Navigation items for the sidebar
   * @type {Array<Object>}
   * @property {string} id - Unique identifier for the section
   * @property {string} label - Display label for the navigation item
   * @property {React.ReactNode|null} [content] - Optional content to override default section content
   */
  navigationItems = [
    { id: 'about', label: 'ABOUT', content: null },
    { id: 'experience', label: 'EXPERIENCE', content: null },
    { id: 'projects', label: 'PROJECTS', content: null }
  ],

  /**
   * Content compression level (0-10)
   * Controls the width distribution between sidebar and content.
   * Higher values give more space to content, less to sidebar.
   * @type {number}
   */
  contentCompression = 0,

  /**
   * Navigation animation configuration
   * @type {Object}
   * @property {number} [staggerDelay=0.1] - Delay between each nav item animation
   * @property {number} [initialY=20] - Initial Y offset for nav items
   * @property {number} [finalY=0] - Final Y position for nav items
   * @property {number} [initialOpacity=0] - Initial opacity for nav items
   * @property {number} [finalOpacity=1] - Final opacity for nav items
   * @property {number} [duration=0.6] - Animation duration in seconds
   * @property {number} [bounce=0.2] - Amount of bounce in the animation (0 = no bounce)
   */
  navAnimationConfig = {
    staggerDelay: 0.1,
    initialY: 20,
    finalY: 0,
    initialOpacity: 0,
    finalOpacity: 1,
    duration: 0.6,
    bounce: 0.2
  }
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [activeSection, setActiveSection] = useState(navigationItems[0]?.id || 'about');
  const [expandedNavItem, setExpandedNavItem] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // ============================================================================
  // LAYOUT CALCULATIONS
  // ============================================================================
  /**
   * Calculate responsive widths based on contentCompression (0-10 scale)
   * Higher compression values give more space to the content area
   * and less to the sidebar, enabling a responsive experience
   */
  const compressionFactor = Math.min(Math.max(contentCompression, 0), 10) / 10;
  const sidebarWidth = 45 - (compressionFactor * 5); // 40-45% range
  const contentWidth = 55 - (compressionFactor * 5); // 55-60% range
  const contentPadding = 2 + (compressionFactor * 2); // 2-4rem range

  // ============================================================================
  // REFS
  // ============================================================================
  // DOM element references for manipulation and measurement
  const containerRef = useRef(null);
  const sidebarRef = useRef(null);
  const contentRef = useRef(null);
  const sidebarWrapperRef = useRef(null);
  const navRef = useRef(null);
  
  // ============================================================================
  // ANIMATION CONTROLS
  // ============================================================================
  const controls = useAnimation();
  const navControls = useAnimation();
  
  // Detect when components come into view to trigger animations
  const isInView = useInView(containerRef, {
    threshold: animationConfig?.threshold ?? 0.2,
    once: animationConfig?.once ?? true
  });
  
  const isNavInView = useInView(navRef, {
    threshold: 0.1,
    once: true
  });

  // ============================================================================
  // SECTION REFS
  // ============================================================================
  /**
   * Create refs for each section to enable scroll tracking and navigation
   * We pre-allocate a fixed number of refs to efficiently support dynamic sections
   */
  const section0Ref = useRef(null);
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section3Ref = useRef(null);
  const section4Ref = useRef(null);
  const section5Ref = useRef(null);
  const section6Ref = useRef(null);
  const section7Ref = useRef(null);
  
  // Memoize the array of refs to prevent unnecessary re-renders
  const sectionRefs = useMemo(() => [
    section0Ref, section1Ref, section2Ref, section3Ref,
    section4Ref, section5Ref, section6Ref, section7Ref
  ], []);
  
  // Create a mapping between section IDs and their corresponding refs
  const sectionRefsMap = useMemo(() => {
    const refsMap = {};
    navigationItems.forEach((item, index) => {
      if (index < sectionRefs.length) {
        refsMap[item.id] = sectionRefs[index];
      }
    });
    return refsMap;
  }, [navigationItems, sectionRefs]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  /**
   * Handle navigation item hover state
   * The expanded state affects the visual appearance of the navigation item
   */
  const handleNavItemHover = useCallback((section) => {
    setExpandedNavItem(section);
  }, []);
  
  const handleNavItemLeave = useCallback(() => {
    setExpandedNavItem(null);
  }, []);

  /**
   * Scroll to the specified section with smooth behavior
   * Updates the active section state and triggers the onSectionChange callback
   */
  const scrollToSection = useCallback((sectionId) => {
    setActiveSection(sectionId);
    
    if (onSectionChange) {
      onSectionChange(sectionId);
    }
    
    const sectionRef = sectionRefsMap[sectionId];
    if (sectionRef?.current) {
      sectionRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [onSectionChange, sectionRefsMap]);

  // ============================================================================
  // EFFECTS
  // ============================================================================
  /**
   * Initial entrance animation effect
   * Triggers when the component comes into view
   */
  useEffect(() => {
    if (isInView) {
      controls.start({ 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: animationConfig?.duration ?? 0.8,
          ease: "easeOut",
          delay: 0.1
        }
      });
      
      // Mark as initialized after animation completes to enable other behaviors
      const timeout = setTimeout(() => {
        setIsInitialized(true);
      }, (animationConfig?.duration ?? 0.8) * 1000 + 100);
      
      return () => clearTimeout(timeout);
    }
  }, [isInView, controls, animationConfig?.duration]);

  /**
   * Navigation menu staggered animation effect
   * Creates a cascading reveal of navigation items
   */
  useEffect(() => {
    if (isNavInView) {
      navControls.start(i => ({
        opacity: navAnimationConfig.finalOpacity,
        y: navAnimationConfig.finalY,
        transition: {
          duration: navAnimationConfig.duration,
          delay: i * navAnimationConfig.staggerDelay,
          ease: [0.215, 0.61, 0.355, 1 + navAnimationConfig.bounce]
        }
      }));
    }
  }, [isNavInView, navControls, navAnimationConfig]);

  /**
   * Set up intersection observer to detect which section is currently in view
   * This enables automatic navigation highlighting as the user scrolls
   */
  useEffect(() => {
    const sectionElements = Object.values(sectionRefsMap)
      .map(ref => ref.current)
      .filter(Boolean);
    
    if (sectionElements.length === 0) return;
    
    // Configure the intersection observer with appropriate thresholds
    // The rootMargin is carefully tuned to provide a natural-feeling activation zone
    const options = {
      root: null,
      rootMargin: '-10% 0px -70% 0px', // Top margin, right margin, bottom margin, left margin
      threshold: 0
    };
    
    // Callback fires whenever an observed element enters or exits the viewport
    const callback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('data-section');
          if (sectionId && sectionId !== activeSection) {
            setActiveSection(sectionId);
            
            if (onSectionChange) {
              onSectionChange(sectionId);
            }
          }
        }
      });
    };
    
    const observer = new IntersectionObserver(callback, options);
    sectionElements.forEach(element => observer.observe(element));
    
    return () => observer.disconnect();
  }, [activeSection, onSectionChange, sectionRefsMap]);

  /**
   * Implement smooth scroll-based animations for the sidebar using Framer Motion
   * 
   * This approach uses spring physics for natural feeling, buttery-smooth animations
   * that respond dynamically to the user's scroll position
   */
  const { scrollY } = useScroll();
  const [sidebarDimensions, setSidebarDimensions] = useState({
    containerTop: 0,
    containerBottom: 0,
    sidebarHeight: 0,
    wrapperWidth: 0,
    wrapperLeft: 0,
    scrollRange: [0, 0],
    yRange: [0, 0]
  });

  // Update dimensions and calculate animation ranges
  const updateDimensions = useCallback(() => {
    if (!isInitialized || !containerRef.current || !sidebarRef.current || !sidebarWrapperRef.current) {
      return;
    }

    // Skip on mobile - simplified behavior for small screens
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      return;
    }

    const container = containerRef.current;
    const sidebar = sidebarRef.current;
    const sidebarWrapper = sidebarWrapperRef.current;
    const containerRect = container.getBoundingClientRect();
    const wrapperRect = sidebarWrapper.getBoundingClientRect();
    const sidebarHeight = sidebar.offsetHeight;
    
    // Container position relative to document
    const containerTop = containerRect.top + window.scrollY;
    const containerBottom = containerRect.bottom + window.scrollY;
    const containerHeight = containerRect.height;
    
    // Calculate the range values for scroll transform
    const scrollStart = containerTop - topOffset;
    const scrollEnd = containerBottom - sidebarHeight - topOffset;
    const yStart = 0;
    const yEnd = containerHeight - sidebarHeight;
    
    // Store all the dimensions needed for animation
    setSidebarDimensions({
      containerTop,
      containerBottom,
      sidebarHeight,
      wrapperWidth: wrapperRect.width,
      wrapperLeft: wrapperRect.left,
      scrollRange: [scrollStart, scrollEnd],
      yRange: [yStart, yEnd]
    });
  }, [isInitialized, topOffset]);

  // Set up transform for the sidebar position based on scroll
  const sidebarY = useTransform(
    scrollY,
    sidebarDimensions.scrollRange,
    sidebarDimensions.yRange,
    { clamp: true }
  );
  
  // Apply spring physics for smooth animation
  const springSidebarY = useSpring(sidebarY, {
    stiffness: 30,
    damping: 50,
    mass: 0.5,
    restDelta: 0.001,
    restSpeed: 0.001
  });

  // Update dimensions when component initializes or window resizes
  useEffect(() => {
    if (!isInitialized) return;
    
    updateDimensions();
    
    const handleResize = () => {
      updateDimensions();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initial update
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isInitialized, updateDimensions]);

  // ============================================================================
  // RENDERING FUNCTIONS
  // ============================================================================
  /**
   * Render the profile information section with name, role, and tagline
   * Uses consistent styling to maintain visual hierarchy
   */
  const renderProfileInfo = () => (
    <ProfileInfo>
      <ProfileName highlightColor={highlightColor}>
        {person?.name || 'Profile Name'}
      </ProfileName>
      
      <ProfileRole 
        highlightColor={highlightColor}
        fontFamily={fontFamily}
      >
        {person?.role || 'Role'}
      </ProfileRole>
      
      {person?.tagline && (
        <ProfileTagline 
          textColor={textColor}
          fontFamily={fontFamily}
        >
          {person.tagline}
        </ProfileTagline>
      )}
    </ProfileInfo>
  );

  /**
   * Render the navigation links with animated indicators
   * Uses Framer Motion for staggered animations and smooth transitions
   */
  const renderNavLinks = () => (
    <NavLinks ref={navRef}>
      {navigationItems.map((navItem, index) => (
        <motion.div 
          key={navItem.id}
          className="nav-link-container"
          custom={index}
          initial={{ 
            opacity: navAnimationConfig.initialOpacity, 
            y: navAnimationConfig.initialY 
          }}
          animate={navControls}
          style={{
            position: 'relative',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            willChange: 'transform, opacity',
            transformOrigin: 'left center',
          }}
          onMouseEnter={() => handleNavItemHover(navItem.id)}
          onMouseLeave={handleNavItemLeave}
        >
          <NavLine 
            active={activeSection === navItem.id || expandedNavItem === navItem.id}
            highlightColor={highlightColor}
            minLineWidth={minLineWidth}
            maxLineWidth={maxLineWidth}
          />
          <NavButton
            onClick={() => scrollToSection(navItem.id)}
            active={activeSection === navItem.id || expandedNavItem === navItem.id}
            highlightColor={highlightColor}
            textColor={textColor}
          >
            {navItem.label}
          </NavButton>
        </motion.div>
      ))}
    </NavLinks>
  );

  /**
   * Render statistics section with animated hover effects
   * Shows quantifiable achievements or metrics in an engaging way
   */
  const renderStats = () => {
    if (!showStats || !person?.stats || person.stats.length === 0) return null;
    
    return (
      <StatsContainer>
        {person.stats.map((stat, statIdx) => (
          <Stat key={statIdx}>
            <StatValue highlightColor={highlightColor}>
              {stat.value}
            </StatValue>
            <StatLabel textColor={textColor}>
              {stat.label}
            </StatLabel>
          </Stat>
        ))}
      </StatsContainer>
    );
  };

  /**
   * Render generic section content with appropriate styling
   * Handles both string content and React nodes
   */
  const renderSectionContent = (content) => {
    if (!content) return null;
    
    if (typeof content === 'string') {
      return (
        <SectionContent 
          textColor={textColor}
          fontFamily={fontFamily}
        >
          {content}
        </SectionContent>
      );
    }
    
    return content;
  };

  /**
   * Render the About section with biography paragraphs and statistics
   */
  const renderAboutSection = (section) => {
    return (
      <>
        {person?.bio && person.bio.map((paragraph, idx) => (
          <SectionContent 
            key={idx}
            textColor={textColor}
            fontFamily={fontFamily}
          >
            {paragraph}
          </SectionContent>
        ))}
        
        {renderStats()}
      </>
    );
  };

  /**
   * Render the Experience section with professional history
   */
  const renderExperienceSection = (section) => {
    if (person?.experience) {
      return person.experience.map((item, expIdx) => (
        <React.Fragment key={expIdx}>
          {renderSectionContent(item.content)}
        </React.Fragment>
      ));
    }
    
    return renderSectionContent(
      "Throughout my career, I've specialized in developing software systems that seamlessly " +
      "integrate front-end experiences with robust back-end architectures. My experience spans " +
      "various domains, from interactive media to data visualization systems."
    );
  };

  /**
   * Render the Projects section showcasing key work
   */
  const renderProjectsSection = (section) => {
    if (person?.projects) {
      return person.projects.map((item, projIdx) => (
        <React.Fragment key={projIdx}>
          {renderSectionContent(item.content)}
        </React.Fragment>
      ));
    }
    
    return null;
  };

  /**
   * Render appropriate content based on section ID
   * Allows for both default section renderers and custom content override
   */
  const renderSection = (section) => {
    if (section.content) {
      return renderSectionContent(section.content);
    }
    
    switch (section.id) {
      case 'about':
        return renderAboutSection(section);
      case 'experience':
        return renderExperienceSection(section);
      case 'projects':
        return renderProjectsSection(section);
      default:
        return null;
    }
  };

  return (
    <Container 
      ref={containerRef}
      initial={{ opacity: 0, y: animationConfig?.initialY ?? 30 }}
      animate={controls}
    >
      {/* Left sidebar wrapper */}
      <SidebarWrapper 
        ref={sidebarWrapperRef}
        sidebarWidth={sidebarWidth}
      >
        {/* Profile sidebar with Framer Motion animations */}
        <Sidebar 
          as={motion.div}
          ref={sidebarRef}
          style={{ 
            y: window.innerWidth <= 768 ? 0 : springSidebarY 
          }}
        >
          {renderProfileInfo()}
          {renderNavLinks()}
        </Sidebar>
      </SidebarWrapper>
      
      {/* Right content section */}
      <ContentSection 
        ref={contentRef}
        contentWidth={contentWidth}
        contentPadding={contentPadding}
      >
        {/* Render sections based on navigationItems */}
        {navigationItems.map((section, index) => {
          if (index >= sectionRefs.length) return null;
          
          return (
            <Section 
              key={section.id}
              ref={sectionRefs[index]}
              data-section={section.id}
              id={section.id}
            >
              {renderSection(section)}
            </Section>
          );
        })}
        
        {/* Additional sections */}
        {additionalSections.map((section, index) => (
          <Section 
            key={`additional-${index}`}
          >
            {section.title && (
              <SectionTitle highlightColor={highlightColor}>
                {section.title}
              </SectionTitle>
            )}
            {renderSectionContent(section.content)}
          </Section>
        ))}
      </ContentSection>
    </Container>
  );
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

/**
 * Main container for the profile card
 * Uses Framer Motion for entrance animations
 */
const Container = styled(motion.div)`
  display: flex;
  flex-direction: row;
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
  min-height: 70vh;
  position: relative;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

/**
 * Wrapper for the sidebar to establish sizing
 */
const SidebarWrapper = styled.div`
  width: ${props => props.sidebarWidth}%;
  position: relative;

  @media (max-width: 768px) {
    width: 100% !important;
  }
`;

/**
 * Sidebar containing profile info and navigation
 * Uses Framer Motion for scroll-based animations
 */
const Sidebar = styled.div`
  padding: 3rem 2rem 2rem 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;

  @media (max-width: 768px) {
    position: relative !important;
    padding: 2rem 1rem !important;
    align-items: center;
    text-align: center;
  }
`;

/**
 * Content section containing all main profile information
 */
const ContentSection = styled.div`
  width: ${props => props.contentWidth}%;
  padding: 3rem 0 2rem ${props => props.contentPadding}rem;
  margin-left: auto;

  @media (max-width: 768px) {
    width: 100% !important;
    padding: 2rem 1rem !important;
    margin-left: 0 !important;
  }
`;

/**
 * Individual content section (about, experience, etc.)
 */
const Section = styled.div`
  margin-bottom: 3rem;
  scroll-margin-top: 2rem;
`;

/**
 * Profile information container
 */
const ProfileInfo = styled.div`
  margin-bottom: 2rem;
  padding-left: 5px;

  @media (max-width: 768px) {
    text-align: center;
  }
`;

/**
 * Profile name with highlight styling
 */
const ProfileName = styled.h1`
  font-size: 2.8rem;
  font-weight: 300;
  color: ${props => props.highlightColor};
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 2.2rem !important;
  }
`;

/**
 * Profile role or title
 */
const ProfileRole = styled.h2`
  font-size: 1.2rem;
  font-weight: 300;
  margin-bottom: 2rem;
  color: ${props => props.highlightColor}B3; /* 70% opacity */
  letter-spacing: 0.05em;
  font-family: ${props => props.fontFamily};
  font-style: italic;
`;

/**
 * Profile tagline or brief description
 */
const ProfileTagline = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 3rem;
  max-width: 90%;
  color: ${props => props.textColor};
  font-family: ${props => props.fontFamily};
  font-weight: 300;

  @media (max-width: 768px) {
    max-width: 100% !important;
    text-align: center;
  }
`;

/**
 * Navigation links container
 */
const NavLinks = styled.div`
  margin-top: 3rem;
  will-change: transform, opacity;
  transform: translate3d(0,0,0);
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }
`;

/**
 * Navigation indicator line
 * Expands when active or hovered
 */
const NavLine = styled.div`
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: ${props => props.active ? props.maxLineWidth : props.minLineWidth}px;
  height: 0.75px;
  background-color: ${props => props.active 
    ? `${props.highlightColor}E6` /* 90% opacity */ 
    : `${props.highlightColor}80` /* 50% opacity */};
  transition: width 0.3s ease, background-color 0.3s ease;
`;

/**
 * Navigation button/link
 */
const NavButton = styled.button`
  position: relative;
  display: block;
  padding: 0.5rem 0 0.5rem 40px;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  background: transparent;
  border: none;
  text-align: left;
  outline: none;
  box-shadow: none;
  transition: color 0.5s ease, transform 0.5s ease;
  color: ${props => props.active ? props.highlightColor : props.textColor};
  cursor: pointer;
  transform: ${props => props.active ? 'translateX(10px)' : 'none'};
  width: fit-content;

  @media (max-width: 768px) {
    padding: 0.5rem 0 0.5rem 40px;
  }
`;

/**
 * Stats container for displaying statistics
 */
const StatsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 3rem;
  width: 100%;

  @media (max-width: 768px) {
    justify-content: center !important;
    gap: 2rem;
  }

  @media (max-width: 480px) {
    flex-direction: column !important;
    align-items: center !important;
    gap: 1.5rem !important;
  }
`;

/**
 * Individual stat item with hover animation
 */
const Stat = styled.div`
  flex: 1;
  text-align: center;
  padding: 0 1rem;
  min-width: 100px;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  @media (max-width: 480px) {
    width: 100% !important;
    max-width: 180px !important;
  }
`;

/**
 * Stat value (number) styling
 */
const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 100;
  color: ${props => props.highlightColor};
  margin-bottom: 0.5rem;
`;

/**
 * Stat label styling
 */
const StatLabel = styled.div`
  font-size: 0.85rem;
  color: ${props => props.textColor}CC; /* 80% opacity */
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

/**
 * Section content paragraph styling
 */
const SectionContent = styled.p`
  font-size: 1rem;
  line-height: 1.8;
  margin-bottom: 1.5rem;
  color: ${props => props.textColor};
  font-family: ${props => props.fontFamily};
  font-weight: 300;
`;

/**
 * Section title styling for additional sections
 */
const SectionTitle = styled.h3`
  font-size: 1.4rem;
  color: ${props => props.highlightColor};
  margin-bottom: 1rem;
  font-weight: 300;
`;

export default PersonProfileCard;