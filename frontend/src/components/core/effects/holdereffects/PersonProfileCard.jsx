import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

/**
 * PersonProfileCard Component
 * 
 * A profile card with a three-phase scroll behavior:
 * 1. Normal Flow: Initially scrolls with the page
 * 2. Fixed Position: Sticks to viewport when scrolling through content
 * 3. Release: Returns to normal flow after scrolling past component
 * 
 * Mobile improvements:
 * - Navigation bar moves to top of screen
 * - Content spans full width for better readability
 * - Simplified navigation display
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
  const mobileNavRef = useRef(null);
  
  // Animation controls
  const controls = useAnimation();
  
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

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize event listener
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Navigation item hover handlers
  const handleNavItemHover = useCallback((section) => {
    if (!isMobile) {
      setExpandedNavItem(section);
    }
  }, [isMobile]);
  
  const handleNavItemLeave = useCallback(() => {
    if (!isMobile) {
      setExpandedNavItem(null);
    }
  }, [isMobile]);

  // Scroll to section handler
  const scrollToSection = useCallback((sectionId) => {
    setActiveSection(sectionId);
    
    if (onSectionChange) {
      onSectionChange(sectionId);
    }
    
    const sectionRef = sectionRefsMap[sectionId];
    if (sectionRef?.current) {
      // Use different scroll methods for mobile vs desktop
      if (isMobile) {
        // For mobile, calculate position and use window.scrollTo
        const offsetTop = sectionRef.current.getBoundingClientRect().top + window.pageYOffset;
        const mobileNavHeight = mobileNavRef.current ? mobileNavRef.current.offsetHeight : 0;
        
        window.scrollTo({
          top: offsetTop - mobileNavHeight - 20, // Additional offset for spacing
          behavior: 'smooth'
        });
      } else {
        // For desktop, use the original scrollIntoView method
        sectionRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  }, [onSectionChange, sectionRefsMap, isMobile]);

  // Initial animation
  useEffect(() => {
    if (isInView) {
      controls.start({ 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: animationConfig?.duration ?? 0.8,
          ease: "easeOut",
          delay: 0.1 // Small delay to ensure DOM is settled
        }
      });
      
      // Mark as initialized after animation completes
      const timeout = setTimeout(() => {
        setIsInitialized(true);
      }, (animationConfig?.duration ?? 0.8) * 1000 + 100);
      
      return () => clearTimeout(timeout);
    }
  }, [isInView, controls, animationConfig?.duration]);

  // Set up intersection observer to detect which section is in view
  useEffect(() => {
    const sectionElements = Object.values(sectionRefsMap)
      .map(ref => ref.current)
      .filter(Boolean);
    
    if (sectionElements.length === 0) return;
    
    // Different margins for mobile and desktop to account for different layouts
    const options = {
      root: null,
      rootMargin: isMobile 
        ? '-80px 0px -70% 0px'  // For mobile with fixed nav
        : '-10% 0px -70% 0px',  // For desktop
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
  }, [activeSection, onSectionChange, sectionRefsMap, isMobile]);

  // Implement scroll behavior - but only for desktop
  useEffect(() => {
    if (!isInitialized || !containerRef.current || !sidebarRef.current || !sidebarWrapperRef.current || isMobile) {
      return;
    }
    
    const container = containerRef.current;
    const sidebar = sidebarRef.current;
    const sidebarWrapper = sidebarWrapperRef.current;
    
    let containerRect;
    let wrapperRect;
    let sidebarHeight;
    
    // Update measurements
    const updateMeasurements = () => {
      containerRect = container.getBoundingClientRect();
      wrapperRect = sidebarWrapper.getBoundingClientRect();
      sidebarHeight = sidebar.offsetHeight;
    };
    
    // First, get accurate measurements
    updateMeasurements();
    
    const handleScroll = () => {
      // Update measurements if necessary
      updateMeasurements();
      
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
          sidebar.style.width = `${wrapperRect.width}px`;
          sidebar.style.left = `${wrapperRect.left}px`;
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
    
    // Add scroll event listener
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
    
    // Handle window resize
    const handleResize = () => {
      // Skip for mobile
      if (window.innerWidth <= 768) return;
      
      // Update measurements
      updateMeasurements();
      
      // Apply current mode
      handleScroll();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initial setup
    handleResize();
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', scrollListener);
      window.removeEventListener('resize', handleResize);
    };
  }, [isInitialized, topOffset, sidebarMode, isMobile]);

  // Mobile nav scroll behavior
  useEffect(() => {
    if (!isInitialized || !isMobile || !mobileNavRef.current) {
      return;
    }
    
    const mobileNav = mobileNavRef.current;
    
    const handleScroll = () => {
      if (window.scrollY > 50) {
        mobileNav.style.backgroundColor = 'rgba(17, 17, 17, 0.95)';
        mobileNav.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
      } else {
        mobileNav.style.backgroundColor = 'rgba(17, 17, 17, 0.7)';
        mobileNav.style.boxShadow = 'none';
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial state
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isInitialized, isMobile]);

  // Render profile info section
  const renderProfileInfo = () => (
    <div 
      className="profile-info"
      style={{
        marginBottom: '2rem',
        paddingLeft: '5px',
        textAlign: isMobile ? 'center' : 'left',
        width: '100%',
      }}
    >
      <h1 
        className="profile-name"
        style={{
          fontSize: isMobile ? '2.2rem' : '2.8rem',
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
          fontSize: isMobile ? '1.1rem' : '1.2rem',
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
            maxWidth: isMobile ? '100%' : '90%',
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

  // Render mobile navigation
  const renderMobileNav = () => {
    if (!isMobile) return null;
    
    return (
      <div
        ref={mobileNavRef}
        className="mobile-nav"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 100,
          backgroundColor: 'rgba(17, 17, 17, 0.7)',
          backdropFilter: 'blur(10px)',
          transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
          padding: '0.75rem 1rem',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        {navigationItems.map((navItem) => (
          <div
            key={navItem.id}
            className="mobile-nav-item"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <button
              onClick={() => scrollToSection(navItem.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                outline: 'none',
              }}
            >
              <div
                style={{
                  width: activeSection === navItem.id ? `${maxLineWidth}px` : `${minLineWidth}px`,
                  height: '2px',
                  backgroundColor: activeSection === navItem.id ? highlightColor : `${highlightColor}80`,
                  transition: 'width 0.3s ease, background-color 0.3s ease',
                  marginBottom: '0.5rem',
                }}
              ></div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: activeSection === navItem.id ? highlightColor : textColor,
                  letterSpacing: '0.1em',
                  transition: 'color 0.3s ease',
                }}
              >
                {navItem.label}
              </div>
            </button>
          </div>
        ))}
      </div>
    );
  };

  // Render navigation links (desktop only)
  const renderNavLinks = () => {
    if (isMobile) return null;
    
    return (
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
  };

  // Render stats section
  const renderStats = () => {
    if (!showStats || !person.stats || person.stats.length === 0) return null;
    
    return (
      <div 
        className="stats-container"
        style={{
          display: 'flex',
          justifyContent: isMobile ? 'center' : 'space-between',
          flexWrap: 'wrap',
          marginTop: '3rem',
          width: '100%',
          gap: isMobile ? '2rem' : 0,
        }}
      >
        {person.stats.map((stat, statIdx) => (
          <div 
            key={statIdx} 
            className="stat"
            style={{
              flex: isMobile ? '0 0 auto' : '1',
              textAlign: 'center',
              padding: '0 1rem',
              minWidth: isMobile ? '140px' : '100px',
              transition: 'transform 0.3s ease',
            }}
            onMouseEnter={(e) => {
              if (!isMobile) {
                e.currentTarget.style.transform = 'translateY(-5px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isMobile) {
                e.currentTarget.style.transform = 'none';
              }
            }}
          >
            <div 
              className="stat-value"
              style={{
                fontSize: isMobile ? '2.2rem' : '2.5rem',
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
    <>
      {/* Mobile navigation */}
      {renderMobileNav()}
      
      <motion.div 
        ref={containerRef}
        className="profile-container"
        initial={{ opacity: 0, y: animationConfig?.initialY ?? 30 }}
        animate={controls}
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          width: '100%',
          maxWidth: '1300px',
          margin: '0 auto',
          minHeight: isMobile ? 'auto' : '70vh',
          position: 'relative',
          paddingTop: isMobile ? '80px' : 0, // Add padding for fixed mobile nav
        }}
      >
        {/* Left sidebar wrapper - desktop only */}
        {!isMobile && (
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
        )}
        
        {/* Profile Info for mobile */}
        {isMobile && renderProfileInfo()}
        
        {/* Right content section */}
        <div 
          ref={contentRef}
          className="content-section"
          style={{
            width: isMobile ? '100%' : `${contentWidth}%`,
            padding: isMobile 
              ? '2rem 1.5rem' 
              : `3rem 0 2rem ${contentPadding}rem`,
            marginLeft: isMobile ? 0 : 'auto',
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
                  scrollMarginTop: isMobile ? '80px' : '2rem',
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
                scrollMarginTop: isMobile ? '80px' : '2rem',
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
      </motion.div>
    </>
  );
};

export default PersonProfileCard;