import React, { useRef, useState, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * PersonProfileCard Component
 * 
 * A profile card with a three-phase scroll behavior:
 * 1. Normal Flow: Initially scrolls with the page
 * 2. Fixed Position: Sticks to viewport when scrolling through content
 * 3. Release: Returns to normal flow after scrolling past component
 */
const PersonProfileCard = ({
  person,
  animationConfig = {
    threshold: 0.2,
    once: true,
    initialY: 30,
    duration: 0.8
  },
  additionalSections = [],
  onSectionChange = null,
  topOffset = 100,
  showStats = true,
  highlightColor = '#bfad7f',
  textColor = 'rgba(224, 224, 224, 0.7)',
  minLineWidth = 10,
  maxLineWidth = 40,
  fontFamily = '"Garamond", "Adobe Caslon Pro", serif',
  navigationItems = [
    { id: 'about', label: 'ABOUT', content: null },
    { id: 'experience', label: 'EXPERIENCE', content: null },
    { id: 'projects', label: 'PROJECTS', content: null }
  ],
  contentCompression = 0
}) => {
  // State management
  const [activeSection, setActiveSection] = useState(navigationItems[0]?.id || 'about');
  const [expandedNavItem, setExpandedNavItem] = useState(null);
  const [sidebarMode, setSidebarMode] = useState('normal'); // 'normal', 'fixed', or 'end'

  // Calculate widths based on contentCompression (0-10 scale)
  const compressionFactor = Math.min(Math.max(contentCompression, 0), 10) / 10;
  const sidebarWidth = 45 - (compressionFactor * 5); // 35-40% range
  const contentWidth = 55 - (compressionFactor * 5); // 55-60% range
  const contentPadding = 2 + (compressionFactor * 2); // 2-4rem range

  // Refs for DOM elements
  const containerRef = useRef(null);
  const sidebarRef = useRef(null);
  const contentRef = useRef(null);
  const sidebarWrapperRef = useRef(null);
  
  // Create individual section refs at the top level
  const section0Ref = useRef(null);
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section3Ref = useRef(null);
  const section4Ref = useRef(null);
  const section5Ref = useRef(null);
  const section6Ref = useRef(null);
  const section7Ref = useRef(null);
  
  // Memoize the array of refs so it's stable across renders
  const sectionRefs = useMemo(() => [
    section0Ref, section1Ref, section2Ref, section3Ref,
    section4Ref, section5Ref, section6Ref, section7Ref
  ], []);
  
  // Map section IDs to refs
  const sectionRefsMap = useMemo(() => {
    const refsMap = {};
    navigationItems.forEach((item, index) => {
      if (index < sectionRefs.length) {
        refsMap[item.id] = sectionRefs[index];
      }
    });
    return refsMap;
  }, [navigationItems, sectionRefs]);

  // Animation inView detection
  const isInView = useInView(containerRef, {
    threshold: animationConfig?.threshold ?? 0.2,
    once: animationConfig?.once ?? true
  });

  // Navigation item hover handlers
  const handleNavItemHover = useCallback((section) => {
    setExpandedNavItem(section);
  }, []);
  
  const handleNavItemLeave = useCallback(() => {
    setExpandedNavItem(null);
  }, []);

  // Scroll to section handler
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

  // Set up intersection observer to detect which section is in view
  useEffect(() => {
    const sectionElements = Object.values(sectionRefsMap)
      .map(ref => ref.current)
      .filter(Boolean);
    
    if (sectionElements.length === 0) return;
    
    const options = {
      root: null,
      rootMargin: '-10% 0px -70% 0px', // Consider element in view when in the top 30% of viewport
      threshold: 0
    };
    
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

  // Implement the three-phase scrolling behavior with useLayoutEffect to prevent initial jump
  useLayoutEffect(() => {
    if (!sidebarRef.current || !containerRef.current || !sidebarWrapperRef.current) return;
    
    // Skip this behavior on mobile
    const checkIsMobile = () => window.innerWidth <= 768;
    let isMobile = checkIsMobile();
    
    // Store DOM elements
    const sidebarWrapper = sidebarWrapperRef.current;
    const sidebar = sidebarRef.current;
    const container = containerRef.current;
    
    // Get sidebar wrapper offset
    const getWrapperOffset = () => {
      const wrapperRect = sidebarWrapper.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(sidebarWrapper);
      return {
        left: wrapperRect.left,
        width: wrapperRect.width,
        paddingLeft: parseInt(computedStyle.paddingLeft, 10) || 0,
        paddingRight: parseInt(computedStyle.paddingRight, 10) || 0
      };
    };
    
    let wrapperOffset = getWrapperOffset();
    
    // Scroll handler
    const handleScroll = () => {
      if (isMobile) return;

      const containerRect = container.getBoundingClientRect();
      const sidebarHeight = sidebar.offsetHeight;
      
      // Calculate phase transition points
      const startFixPoint = containerRect.top <= topOffset;
      const endFixPoint = containerRect.bottom <= (sidebarHeight + topOffset);
      
      // Determine the current scroll phase
      let newMode;
      if (!startFixPoint) {
        newMode = 'normal';
      } else if (startFixPoint && !endFixPoint) {
        newMode = 'fixed';
      } else {
        newMode = 'end';
      }
      
      // Only update DOM if the mode changes
      if (sidebarMode !== newMode) {
        setSidebarMode(newMode);
        
        if (newMode === 'normal') {
          // Phase 1: Normal flow
          sidebar.style.position = 'relative';
          sidebar.style.top = '0';
          sidebar.style.left = '0';
          sidebar.style.width = '';
          sidebar.style.bottom = '';
        } 
        else if (newMode === 'fixed') {
          // Phase 2: Fixed position
          sidebar.style.position = 'fixed';
          sidebar.style.top = `${topOffset}px`;
          sidebar.style.width = `${wrapperOffset.width}px`;
          sidebar.style.left = `${wrapperOffset.left}px`;
          sidebar.style.bottom = '';
        } 
        else if (newMode === 'end') {
          // Phase 3: End position
          sidebar.style.position = 'absolute';
          sidebar.style.top = 'auto';
          sidebar.style.bottom = '0';
          sidebar.style.left = '0';
          sidebar.style.width = '';
        }
      }
    };
    
    // Handle window resize
    const handleResize = () => {
      const wasMobile = isMobile;
      isMobile = checkIsMobile();
      
      // Update wrapper offset on resize
      wrapperOffset = getWrapperOffset();
      
      if (wasMobile !== isMobile) {
        if (isMobile) {
          // Reset styles for mobile
          sidebar.style.position = '';
          sidebar.style.top = '';
          sidebar.style.bottom = '';
          sidebar.style.left = '';
          sidebar.style.width = '';
          setSidebarMode('normal');
        } else {
          // Reapply desktop behavior
          handleScroll();
        }
      } else if (!isMobile && sidebarMode === 'fixed') {
        // Update positioning on desktop resize
        sidebar.style.left = `${wrapperOffset.left}px`;
        sidebar.style.width = `${wrapperOffset.width}px`;
      }
    };
    
    // Throttled scroll handler
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', scrollListener, { passive: true });
    window.addEventListener('resize', handleResize);
    
    // Initial setup
    handleResize();
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', scrollListener);
      window.removeEventListener('resize', handleResize);
    };
  }, [sidebarMode, topOffset]);

  // Render profile info section
  const renderProfileInfo = () => (
    <div 
      className="profile-info"
      style={{
        marginBottom: '2rem',
        paddingLeft: '5px',
      }}
    >
      <h1 
        className="profile-name"
        style={{
          fontSize: '2.8rem',
          fontWeight: '300',
          color: highlightColor,
          letterSpacing: '0.05em',
          marginBottom: '0.5rem',
        }}
      >
        {person.name}
      </h1>
      
      <h2 
        className="profile-role"
        style={{
          fontSize: '1.2rem',
          fontWeight: '300',
          marginBottom: '2rem',
          color: `${highlightColor}B3`, // 70% opacity
          letterSpacing: '0.05em',
          fontFamily: fontFamily,
          fontStyle: 'italic',
        }}
      >
        {person.role}
      </h2>
      
      {person.tagline && (
        <p 
          className="profile-tagline"
          style={{
            fontSize: '1.1rem',
            lineHeight: '1.6',
            marginBottom: '3rem',
            maxWidth: '90%',
            color: textColor,
            fontFamily: fontFamily,
            fontWeight: '300',
          }}
        >
          {person.tagline}
        </p>
      )}
    </div>
  );

  // Render navigation links
  const renderNavLinks = () => (
    <div className="nav-links" style={{ marginTop: '3rem' }}>
      {navigationItems.map((navItem) => (
        <div 
          key={navItem.id}
          className="nav-link-container"
          style={{
            position: 'relative',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
          }}
          onMouseEnter={() => handleNavItemHover(navItem.id)}
          onMouseLeave={handleNavItemLeave}
        >
          <div
            className="nav-line"
            style={{
              position: 'absolute',
              left: '0',
              top: '50%',
              transform: 'translateY(-50%)',
              width: activeSection === navItem.id || expandedNavItem === navItem.id 
                ? `${maxLineWidth}px` 
                : `${minLineWidth}px`,
              height: '0.75px',
              backgroundColor: activeSection === navItem.id || expandedNavItem === navItem.id
                ? `${highlightColor}E6` // 90% opacity 
                : `${highlightColor}80`, // 50% opacity
              transition: 'width 0.3s ease, background-color 0.3s ease',
            }}
          ></div>
          <button 
            className="nav-link"
            onClick={() => scrollToSection(navItem.id)}
            style={{
              position: 'relative',
              display: 'block',
              padding: '0.5rem 0 0.5rem 40px',
              fontSize: '0.85rem',
              letterSpacing: '0.1em',
              background: 'transparent',
              border: 'none',
              textAlign: 'left',
              outline: 'none',
              boxShadow: 'none',
              transition: 'color 0.5s ease, transform 0.5s ease',
              color: activeSection === navItem.id || expandedNavItem === navItem.id 
                ? highlightColor 
                : textColor,
              cursor: 'pointer',
              transform: activeSection === navItem.id || expandedNavItem === navItem.id 
                ? 'translateX(10px)' 
                : 'none',
              width: 'fit-content',
            }}
          >
            {navItem.label}
          </button>
        </div>
      ))}
    </div>
  );

  // Render stats section
  const renderStats = () => {
    if (!showStats || !person.stats || person.stats.length === 0) return null;
    
    return (
      <div 
        className="stats-container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          marginTop: '3rem',
          width: '100%',
        }}
      >
        {person.stats.map((stat, statIdx) => (
          <div 
            key={statIdx} 
            className="stat"
            style={{
              flex: '1',
              textAlign: 'center',
              padding: '0 1rem',
              minWidth: '100px',
              transition: 'transform 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
            }}
          >
            <div 
              className="stat-value"
              style={{
                fontSize: '2.5rem',
                fontWeight: '100',
                color: highlightColor,
                marginBottom: '0.5rem'
              }}
            >
              {stat.value}
            </div>
            <div 
              className="stat-label"
              style={{
                fontSize: '0.85rem',
                color: `${textColor}CC`, // 80% opacity
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render section content
  const renderSectionContent = (content) => {
    if (!content) return null;
    
    if (typeof content === 'string') {
      return (
        <p 
          className="section-content"
          style={{
            fontSize: '1rem',
            lineHeight: '1.8',
            marginBottom: '1.5rem',
            color: textColor,
            fontFamily: fontFamily,
            fontWeight: '300',
          }}
        >
          {content}
        </p>
      );
    }
    
    return content;
  };

  // Render about section
  const renderAboutSection = (section) => {
    return (
      <>
        {person.bio && person.bio.map((paragraph, idx) => (
          <p 
            key={idx} 
            className="section-content"
            style={{
              fontSize: '1rem',
              lineHeight: '1.8',
              marginBottom: '1.5rem',
              color: textColor,
              fontFamily: fontFamily,
              fontWeight: '300',
            }}
          >
            {paragraph}
          </p>
        ))}
        
        {renderStats()}
      </>
    );
  };

  // Render experience section
  const renderExperienceSection = (section) => {
    if (person.experience) {
      return person.experience.map((item, expIdx) => (
        renderSectionContent(item.content)
      ));
    }
    
    return renderSectionContent(
      "Throughout my career, I've specialized in developing software systems that seamlessly " +
      "integrate front-end experiences with robust back-end architectures. My experience spans " +
      "various domains, from interactive media to data visualization systems."
    );
  };

  // Render projects section
  const renderProjectsSection = (section) => {
    if (person.projects) {
      return person.projects.map((item, projIdx) => (
        renderSectionContent(item.content)
      ));
    }
    
    return null;
  };

  // Render sections based on section ID
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
    <motion.div 
      ref={containerRef}
      className="profile-container"
      initial={{ opacity: 0, y: animationConfig?.initialY ?? 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: animationConfig?.initialY ?? 30 }}
      transition={{ 
        duration: animationConfig?.duration ?? 0.8, 
        ease: "easeOut" 
      }}
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        maxWidth: '1300px',
        margin: '0 auto',
        minHeight: '70vh',
        position: 'relative',
      }}
    >
      {/* Left sidebar wrapper */}
      <div 
        ref={sidebarWrapperRef}
        className="sidebar-wrapper"
        style={{
          width: `${sidebarWidth}%`,
          position: 'relative',
        }}
      >
        {/* Profile sidebar */}
        <div 
          ref={sidebarRef}
          className="profile-sidebar"
          style={{
            padding: '3rem 2rem 2rem 0',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            position: 'relative',
            top: 0,
          }}
        >
          {renderProfileInfo()}
          {renderNavLinks()}
        </div>
      </div>
      
      {/* Right content section */}
      <div 
        ref={contentRef}
        className="content-section"
        style={{
          width: `${contentWidth}%`,
          padding: `3rem 0 2rem ${contentPadding}rem`,
          marginLeft: 'auto',
        }}
      >
        {/* Render sections based on navigationItems */}
        {navigationItems.map((section, index) => {
          if (index >= sectionRefs.length) return null;
          
          return (
            <div 
              key={section.id}
              ref={sectionRefs[index]}
              data-section={section.id}
              className="section"
              id={section.id}
              style={{
                marginBottom: '3rem',
                scrollMarginTop: '2rem',
              }}
            >
              {renderSection(section)}
            </div>
          );
        })}
        
        {/* Additional sections */}
        {additionalSections.map((section, index) => (
          <div 
            key={`additional-${index}`}
            className="section"
            style={{
              marginBottom: '3rem',
              scrollMarginTop: '2rem',
            }}
          >
            {section.title && (
              <h3 style={{
                fontSize: '1.4rem',
                color: highlightColor,
                marginBottom: '1rem',
                fontWeight: '300',
              }}>
                {section.title}
              </h3>
            )}
            {renderSectionContent(section.content)}
          </div>
        ))}
      </div>
      
      {/* Media query styles for mobile */}
      <style jsx>{`
        @media (max-width: 768px) {
          .profile-container {
            flex-direction: column;
          }
          
          .sidebar-wrapper {
            width: 100% !important;
          }
          
          .profile-sidebar {
            position: relative !important;
            padding: 2rem 1rem !important;
            align-items: center;
            text-align: center;
            top: 0 !important;
            bottom: auto !important;
          }
          
          .profile-name {
            font-size: 2.2rem !important;
          }
          
          .profile-tagline {
            max-width: 100% !important;
            text-align: center;
          }
          
          .content-section {
            width: 100% !important;
            padding: 2rem 1rem !important;
            margin-left: 0 !important;
          }
          
          .stats-container {
            justify-content: center !important;
            gap: 2rem;
          }
          
          .nav-links {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            width: 100%;
          }
          
          .nav-link-container {
            margin: 0.5rem 0 !important;
          }
        }
        
        @media (max-width: 480px) {
          .stats-container {
            flex-direction: column !important;
            align-items: center !important;
            gap: 1.5rem !important;
          }
          
          .stat {
            width: 100% !important;
            max-width: 180px !important;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default PersonProfileCard;

/**
 * USAGE EXAMPLE:
 * --------------
 * This example demonstrates how to use the PersonProfileCard component
 * with custom configuration.
 * 
 * 
 * import React from 'react';
 * import PersonProfileCard from './components/PersonProfileCard';
 * 
 * const ProfilePage = () => {
 *   // Sample person data
 *   const personData = {
 *     name: "Jane Doe",
 *     role: "Full Stack Developer",
 *     tagline: "Building elegant solutions to complex problems with a focus on user experience and scalable architecture.",
 *     bio: [
 *       "I'm a full-stack developer with over 8 years of experience building web applications and digital experiences. My approach combines technical expertise with an eye for design and usability.",
 *       "I specialize in React, Node.js, and cloud infrastructure, with a particular interest in creating accessible and performant web applications."
 *     ],
 *     stats: [
 *       { value: "8+", label: "Years Experience" },
 *       { value: "45+", label: "Projects" },
 *       { value: "12", label: "Industries" }
 *     ],
 *     experience: [
 *       { 
 *         content: "As a Senior Developer at TechCorp, I led the front-end architecture for their flagship product, resulting in a 40% improvement in load times and a significant increase in user engagement metrics."
 *       },
 *       { 
 *         content: "At StartupXYZ, I developed a scalable back-end infrastructure using Node.js and AWS, capable of handling millions of daily requests with 99.9% uptime."
 *       }
 *     ],
 *     projects: [
 *       {
 *         content: "Created an open-source library for data visualization that has been adopted by over a dozen companies and maintained a 4.8-star rating on GitHub."
 *       },
 *       {
 *         content: "Developed an award-winning mobile application that streamlines workflow management for creative professionals, featured in design publications."
 *       }
 *     ]
 *   };
 * 
 *   // Custom navigation items - can include your own React components as content
 *   const customNavItems = [
 *     { id: 'about', label: 'ABOUT ME', content: null },
 *     { id: 'experience', label: 'CAREER', content: null },
 *     { id: 'projects', label: 'PORTFOLIO', content: null },
 *     { 
 *       id: 'testimonials', 
 *       label: 'TESTIMONIALS',
 *       content: (
 *         <div className="testimonials-section">
 *           <blockquote>"Jane is an exceptional developer with a keen eye for detail."</blockquote>
 *           <cite>— John Smith, CTO at TechCorp</cite>
 *         </div>
 *       )
 *     }
 *   ];
 * 
 *   // Additional sections to append after navigation items
 *   const additionalSections = [
 *     {
 *       title: "Publications",
 *       content: "Published articles on modern web development practices in various industry journals."
 *     },
 *     {
 *       title: "Speaking Engagements",
 *       content: (
 *         <ul>
 *           <li>TechConf 2023 - "The Future of Web Interfaces"</li>
 *           <li>DevSummit 2022 - "Scaling React Applications"</li>
 *         </ul>
 *       )
 *     }
 *   ];
 * 
 *   // Section change handler (optional)
 *   const handleSectionChange = (sectionId) => {
 *     console.log(`Active section changed to: ${sectionId}`);
 *     // You can use this to update the URL hash, analytics, etc.
 *   };
 * 
 *   return (
 *     <div className="profile-page">
 *       <PersonProfileCard
 *         person={personData}
 *         navigationItems={customNavItems}
 *         additionalSections={additionalSections}
 *         onSectionChange={handleSectionChange}
 *         topOffset={80}
 *         highlightColor="#4a90e2"
 *         textColor="#333333"
 *         showStats={true}
 *         contentCompression={2}
 *         animationConfig={{
 *           threshold: 0.1,
 *           once: true,
 *           initialY: 50,
 *           duration: 0.6
 *         }}
 *       />
 *     </div>
 *   );
 * };
 * 
 * export default ProfilePage;
 */