import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

// Move static styles outside component to prevent recreation on each render
const styles = {
  profileName: {
    fontWeight: '300',
    letterSpacing: '0.05em',
    marginBottom: '0.5rem',
  },
  profileRole: {
    fontWeight: '300',
    marginBottom: '2rem',
    letterSpacing: '0.05em',
    fontStyle: 'italic',
  },
  profileTagline: {
    lineHeight: '1.6',
    marginBottom: '3rem',
    fontWeight: '300',
  },
  sectionContent: {
    lineHeight: '1.8',
    marginBottom: '1.5rem',
    fontWeight: '300',
  },
  mobileNav: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    zIndex: 100,
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    padding: '0.75rem 1rem',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navLine: {
    position: 'absolute',
    left: '0',
    top: '50%',
    transform: 'translateY(-50%)',
    height: '0.75px',
    transition: 'width 0.3s ease, background-color 0.3s ease',
  },
  navLink: {
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
    cursor: 'pointer',
    width: 'fit-content',
  }
};

/**
 * PersonProfileCard Component - Optimized Version
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
  const [mobileNavVisible, setMobileNavVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Create individual refs at the top level of the component
  const containerRef = useRef(null);
  const sidebarRef = useRef(null);
  const contentRef = useRef(null);
  const sidebarWrapperRef = useRef(null);
  const mobileNavRef = useRef(null);
  
  // Create individual section refs
  const section0Ref = useRef(null);
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section3Ref = useRef(null);
  const section4Ref = useRef(null);
  const section5Ref = useRef(null);
  const section6Ref = useRef(null);
  const section7Ref = useRef(null);
  
  // Animation controls
  const controls = useAnimation();
  
  // Memoize the array of section refs so it's stable across renders
  const sectionRefs = useMemo(() => [
    section0Ref, section1Ref, section2Ref, section3Ref,
    section4Ref, section5Ref, section6Ref, section7Ref
  ], []);
  
  // Memoize the section refs map to avoid recreating on every render
  const sectionRefsMap = useMemo(() => {
    const refsMap = {};
    navigationItems.forEach((item, index) => {
      if (index < sectionRefs.length) {
        refsMap[item.id] = sectionRefs[index];
      }
    });
    return refsMap;
  }, [navigationItems, sectionRefs]);
  
  // Memoize calculation of compression-based values
  const layoutValues = useMemo(() => {
    const compressionFactor = Math.min(Math.max(contentCompression, 0), 10) / 10;
    return {
      sidebarWidth: 45 - (compressionFactor * 5), // 35-40% range
      contentWidth: 55 - (compressionFactor * 5), // 55-60% range
      contentPadding: 2 + (compressionFactor * 2), // 2-4rem range
    };
  }, [contentCompression]);

  // Animation inView detection
  const isInView = useInView(containerRef, {
    threshold: animationConfig?.threshold ?? 0.2,
    once: animationConfig?.once ?? true
  });

  // Memoized function for checking if we're on mobile
  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  // Navigation item hover handlers - memoized to prevent recreation on every render
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

  // Scroll to section handler - memoized with dependencies
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
  }, [onSectionChange, sectionRefsMap, isMobile, mobileNavRef]);

  // Check mobile on mount and window resize
  useEffect(() => {
    // Initial check
    checkMobile();
    
    // Add resize event listener
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [checkMobile]);

  // Initial animation effect
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

  // Set up intersection observer for section detection - optimized with proper dependencies
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

  // Implement scroll behavior for desktop - optimized by separating logic and reducing recalculations
  useEffect(() => {
    if (!isInitialized || !containerRef.current || !sidebarRef.current || 
        !sidebarWrapperRef.current || isMobile) {
      return;
    }
    
    const container = containerRef.current;
    const sidebar = sidebarRef.current;
    const sidebarWrapper = sidebarWrapperRef.current;
    
    let measurements = {
      containerRect: null,
      wrapperRect: null,
      sidebarHeight: null
    };
    
    // Update measurements - only called when needed
    const updateMeasurements = () => {
      measurements.containerRect = container.getBoundingClientRect();
      measurements.wrapperRect = sidebarWrapper.getBoundingClientRect();
      measurements.sidebarHeight = sidebar.offsetHeight;
    };
    
    // Get initial measurements
    updateMeasurements();
    
    // Optimized scroll handler with throttling
    const handleScroll = () => {
      // Update measurements
      updateMeasurements();
      
      // Calculate phase transition points
      const { containerRect, sidebarHeight } = measurements;
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
          sidebar.style.width = `${measurements.wrapperRect.width}px`;
          sidebar.style.left = `${measurements.wrapperRect.left}px`;
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
    
    // Throttled scroll event handling for better performance
    let ticking = false;
    let lastScrollTime = 0;
    const THROTTLE_MS = 100; // Throttle to max 10 updates per second
    
    const scrollListener = () => {
      const now = Date.now();
      if (!ticking && now - lastScrollTime > THROTTLE_MS) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
          lastScrollTime = now;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', scrollListener, { passive: true });
    
    // Optimized resize handler
    const handleResize = () => {
      // Skip for mobile
      if (window.innerWidth <= 768) return;
      
      // Update measurements and apply current mode
      updateMeasurements();
      handleScroll();
    };
    
    // Use ResizeObserver instead of window resize for better performance
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    
    // Initial setup
    handleResize();
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', scrollListener);
      resizeObserver.disconnect();
    };
  }, [isInitialized, topOffset, sidebarMode, isMobile, containerRef, sidebarRef, sidebarWrapperRef]);

  // Mobile nav scroll behavior with auto-hide - optimized with throttling
  useEffect(() => {
    if (!isInitialized || !isMobile || !mobileNavRef.current) {
      return;
    }
    
    const mobileNav = mobileNavRef.current;
    
    // Optimized scroll handler for mobile nav
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar when scrolling up or at the top of the page
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setMobileNavVisible(true);
      } else {
        // Hide navbar when scrolling down past the threshold
        setMobileNavVisible(false);
      }
      
      // Update background opacity based on scroll position - one-time calculation
      const bgOpacity = currentScrollY > 50 ? 0.95 : 0.7;
      mobileNav.style.backgroundColor = `rgba(17, 17, 17, ${bgOpacity})`;
      mobileNav.style.boxShadow = currentScrollY > 50 ? '0 2px 10px rgba(0, 0, 0, 0.1)' : 'none';
      
      // Store current scroll position
      setLastScrollY(currentScrollY);
    };
    
    // Throttled scroll event handling for better performance
    let ticking = false;
    let lastScrollTime = 0;
    const THROTTLE_MS = 100; // Throttle to max 10 updates per second
    
    const scrollListener = () => {
      const now = Date.now();
      if (!ticking && now - lastScrollTime > THROTTLE_MS) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
          lastScrollTime = now;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', scrollListener, { passive: true });
    
    // Initial state - initialize once
    mobileNav.style.backgroundColor = 'rgba(17, 17, 17, 0.7)';
    mobileNav.style.boxShadow = 'none';
    
    return () => {
      window.removeEventListener('scroll', scrollListener);
    };
  }, [isInitialized, isMobile, lastScrollY, mobileNavRef]);

  // Render functions - memoized to prevent recreation on every render
  
  // Profile info section
  const renderProfileInfo = useCallback(() => (
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
          ...styles.profileName,
          fontSize: isMobile ? '2.2rem' : '2.8rem',
          color: highlightColor,
        }}
      >
        {person.name}
      </h1>
      
      <h2 
        className="profile-role"
        style={{
          ...styles.profileRole,
          fontSize: isMobile ? '1.1rem' : '1.2rem',
          color: `${highlightColor}B3`, // 70% opacity
          fontFamily: fontFamily,
        }}
      >
        {person.role}
      </h2>
      
      {person.tagline && (
        <p 
          className="profile-tagline"
          style={{
            ...styles.profileTagline,
            fontSize: '1.1rem',
            maxWidth: isMobile ? '100%' : '90%',
            color: textColor,
            fontFamily: fontFamily,
          }}
        >
          {person.tagline}
        </p>
      )}
    </div>
  ), [isMobile, person.name, person.role, person.tagline, highlightColor, textColor, fontFamily]);

  // Mobile navigation - extracted and memoized
  const renderMobileNav = useCallback(() => {
    if (!isMobile) return null;
    
    return (
      <div
        ref={mobileNavRef}
        className="mobile-nav"
        style={{
          ...styles.mobileNav,
          transform: mobileNavVisible ? 'translateY(0)' : 'translateY(-100%)',
          opacity: mobileNavVisible ? 1 : 0,
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
  }, [
    isMobile, mobileNavVisible, navigationItems, activeSection, 
    scrollToSection, maxLineWidth, minLineWidth, highlightColor, textColor
  ]);

  // Navigation links for desktop - extracted and memoized
  const renderNavLinks = useCallback(() => {
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
                ...styles.navLine,
                width: activeSection === navItem.id || expandedNavItem === navItem.id 
                  ? `${maxLineWidth}px` 
                  : `${minLineWidth}px`,
                backgroundColor: activeSection === navItem.id || expandedNavItem === navItem.id
                  ? `${highlightColor}E6` // 90% opacity 
                  : `${highlightColor}80`, // 50% opacity
              }}
            ></div>
            <button 
              className="nav-link"
              onClick={() => scrollToSection(navItem.id)}
              style={{
                ...styles.navLink,
                color: activeSection === navItem.id || expandedNavItem === navItem.id 
                  ? highlightColor 
                  : textColor,
                transform: activeSection === navItem.id || expandedNavItem === navItem.id 
                  ? 'translateX(10px)' 
                  : 'none',
              }}
            >
              {navItem.label}
            </button>
          </div>
        ))}
      </div>
    );
  }, [
    isMobile, navigationItems, activeSection, expandedNavItem, 
    handleNavItemHover, handleNavItemLeave, scrollToSection,
    maxLineWidth, minLineWidth, highlightColor, textColor
  ]);

  // Stats section - extracted and memoized
  const renderStats = useCallback(() => {
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
  }, [showStats, person.stats, isMobile, highlightColor, textColor]);

  // Section content renderer - memoized for consistent rendering
  const renderSectionContent = useCallback((content) => {
    if (!content) return null;
    
    if (typeof content === 'string') {
      return (
        <p 
          className="section-content"
          style={{
            ...styles.sectionContent,
            fontSize: '1rem',
            color: textColor,
            fontFamily: fontFamily,
          }}
        >
          {content}
        </p>
      );
    }
    
    return content;
  }, [textColor, fontFamily]);

  // Section renderers - separated for clarity and optimization
  const renderAboutSection = useCallback(() => {
    return (
      <>
        {person.bio && person.bio.map((paragraph, idx) => (
          <p 
            key={idx} 
            className="section-content"
            style={{
              ...styles.sectionContent,
              fontSize: '1rem',
              color: textColor,
              fontFamily: fontFamily,
            }}
          >
            {paragraph}
          </p>
        ))}
        
        {renderStats()}
      </>
    );
  }, [person.bio, renderStats, textColor, fontFamily]);

  const renderExperienceSection = useCallback(() => {
    if (person.experience) {
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
  }, [person.experience, renderSectionContent]);

  const renderProjectsSection = useCallback(() => {
    if (person.projects) {
      return person.projects.map((item, projIdx) => (
        <React.Fragment key={projIdx}>
          {renderSectionContent(item.content)}
        </React.Fragment>
      ));
    }
    
    return null;
  }, [person.projects, renderSectionContent]);

  // Main section renderer - unified logic for any section type
  const renderSection = useCallback((section) => {
    if (section.content) {
      return renderSectionContent(section.content);
    }
    
    switch (section.id) {
      case 'about':
        return renderAboutSection();
      case 'experience':
        return renderExperienceSection();
      case 'projects':
        return renderProjectsSection();
      default:
        return null;
    }
  }, [renderSectionContent, renderAboutSection, renderExperienceSection, renderProjectsSection]);

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
              width: `${layoutValues.sidebarWidth}%`,
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
            width: isMobile ? '100%' : `${layoutValues.contentWidth}%`,
            padding: isMobile 
              ? '2rem 1.5rem' 
              : `3rem 0 2rem ${layoutValues.contentPadding}rem`,
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

// Using memo to prevent unnecessary re-renders
export default React.memo(PersonProfileCard);