import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * PersonProfileCard Component
 * 
 * A profile card with a three-phase scroll behavior:
 * 1. Normal Flow: Initially scrolls with the page
 * 2. Fixed Position: Sticks to viewport when scrolling through content
 * 3. Release: Returns to normal flow after scrolling past component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.person - Person data (name, role, bio, stats, etc.)
 * @param {Object} props.animationConfig - Animation configuration
 * @param {Array} props.additionalSections - Additional content sections
 * @param {Function} props.onSectionChange - Callback when active section changes
 * @param {number} props.topOffset - Offset from top for sticky position
 * @param {boolean} props.showStats - Whether to show statistics section
 * @param {string} props.highlightColor - Color for active/hover elements
 * @param {string} props.textColor - Default text color
 * @param {number} props.minLineWidth - Minimum width for nav indicator lines
 * @param {number} props.maxLineWidth - Maximum width for nav indicator lines
 * @param {string} props.fontFamily - Font family for text elements
 * @param {Object} props.navigationItems - Custom navigation items with IDs, labels and content
 * @param {number} props.contentCompression - Adjusts spacing between sidebar and content (0-10)
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

  // Calculate widths based on contentCompression (0-10 scale)
  // Higher compression = more space between sidebar and content
  const compressionFactor = Math.min(Math.max(contentCompression, 0), 10) / 10;
  const sidebarWidth = 45 - (compressionFactor * 5); // 35-40% range
  const contentWidth = 55 - (compressionFactor * 5); // 55-60% range
  const contentPadding = 2 + (compressionFactor * 2); // 2-4rem range

  // Refs for DOM elements
  const containerRef = useRef(null);
  const sidebarRef = useRef(null);
  const contentRef = useRef(null);
  const sidebarWrapperRef = useRef(null);
  
  // Create refs - one for each possible section
  // This approach complies with React's rules of hooks
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section3Ref = useRef(null);
  const section4Ref = useRef(null);
  const section5Ref = useRef(null);
  const section6Ref = useRef(null);
  const section7Ref = useRef(null);
  const section8Ref = useRef(null);
  
  // Array of all section refs memoized to prevent recreation on every render
  const allSectionRefs = useMemo(() => [
    section1Ref, section2Ref, section3Ref, section4Ref,
    section5Ref, section6Ref, section7Ref, section8Ref
  ], []);
  
  // Map section IDs to refs with useMemo to prevent recreation on every render
  const sectionRefs = useMemo(() => {
    const refsMap = {};
    navigationItems.forEach((item, index) => {
      if (index < allSectionRefs.length) {
        refsMap[item.id] = allSectionRefs[index];
      }
    });
    return refsMap;
  }, [navigationItems, allSectionRefs]);

  // Animation inView detection
  const isInView = useInView(containerRef, {
    threshold: animationConfig?.threshold ?? 0.2,
    once: animationConfig?.once ?? true
  });

  // Handle navigation item hover
  const handleNavItemHover = useCallback((section) => {
    setExpandedNavItem(section);
  }, []);
  
  const handleNavItemLeave = useCallback(() => {
    setExpandedNavItem(null);
  }, []);

  // Scroll to section handler
  const scrollToSection = useCallback((sectionId) => {
    setActiveSection(sectionId);
    
    // Notify parent component if callback provided
    if (onSectionChange) {
      onSectionChange(sectionId);
    }
    
    // Scroll to section with smooth behavior
    const sectionRef = sectionRefs[sectionId];
    if (sectionRef?.current) {
      sectionRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [onSectionChange, sectionRefs]);

  // Set up intersection observer to detect which section is in view
  useEffect(() => {
    const sectionElements = Object.values(sectionRefs)
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
            
            // Notify parent component if callback provided
            if (onSectionChange) {
              onSectionChange(sectionId);
            }
          }
        }
      });
    };
    
    const observer = new IntersectionObserver(callback, options);
    
    // Observe all section refs
    sectionElements.forEach(element => observer.observe(element));
    
    return () => {
      observer.disconnect();
    };
  }, [activeSection, onSectionChange, sectionRefs]);

  // Create a state to track the sidebar mode
  const [sidebarMode, setSidebarMode] = useState('normal'); // 'normal', 'fixed', or 'end'
  
  // Implement the three-phase scrolling behavior with improved positioning
  useEffect(() => {
    if (!sidebarRef.current || !containerRef.current || !sidebarWrapperRef.current) return;
    
    // Skip this behavior on mobile
    const checkIsMobile = () => window.innerWidth <= 768;
    let isMobile = checkIsMobile();
    
    // Store original positions once
    const sidebarWrapper = sidebarWrapperRef.current;
    const sidebar = sidebarRef.current;
    const container = containerRef.current;
    
    // Save the sidebar's original position in the document flow
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
    
    // Scroll handler with simplified positioning logic
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
          // Calculate sidebar's relative position within its wrapper
          // This ensures no horizontal jumping
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
    
    // Handle window resize and recalculate dimensions
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
    
    // Throttled scroll handler for better performance
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
      {/* Left sidebar wrapper with position-preserving structure */}
      <div 
        ref={sidebarWrapperRef}
        className="sidebar-wrapper"
        style={{
          width: `${sidebarWidth}%`,
          position: 'relative',
        }}
      >
        {/* Profile sidebar with dynamic positioning handled by JS */}
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
          {/* Profile information */}
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
            
            {/* Short tagline */}
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
          
          {/* Navigation links with fluid expansion on hover */}
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
                    width: 'fit-content', // Make button fit to content
                  }}
                >
                  {navItem.label}
                </button>
              </div>
            ))}
          </div>
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
        {/* Dynamically render sections based on navigationItems */}
        {navigationItems.map((section, index) => {
          // Only render sections that have corresponding refs
          if (index >= allSectionRefs.length) return null;
          
          return (
            <div 
              key={section.id}
              ref={allSectionRefs[index]}
              data-section={section.id}
              className="section"
              id={section.id}
              style={{
                marginBottom: '3rem',
                scrollMarginTop: '2rem',
              }}
            >
              {/* Default 'about' section */}
              {section.id === 'about' && (
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
                  
                  {/* Stats display - conditionally rendered based on showStats prop */}
                  {showStats && person.stats && person.stats.length > 0 && (
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
                  )}
                </>
              )}

              {/* Default 'experience' section */}
              {section.id === 'experience' && (
                <>
                  {person.experience ? (
                    person.experience.map((item, expIdx) => (
                      <p 
                        key={expIdx} 
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
                        {item.content}
                      </p>
                    ))
                  ) : (
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
                      Throughout my career, I've specialized in developing software systems that seamlessly 
                      integrate front-end experiences with robust back-end architectures. My experience spans 
                      various domains, from interactive media to data visualization systems.
                    </p>
                  )}
                </>
              )}

              {/* Default 'projects' section */}
              {section.id === 'projects' && (
                <>
                  {person.projects ? (
                    person.projects.map((item, projIdx) => (
                      <p 
                        key={projIdx} 
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
                        {item.content}
                      </p>
                    ))
                  ) : (
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
                     
                    </p>
                  )}
                </>
              )}

              {/* Custom section content */}
              {section.content && (
                typeof section.content === 'string' 
                  ? <p 
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
                      {section.content}
                    </p>
                  : section.content
              )}
            </div>
          );
        })}
        
        {/* Dynamic sections from props */}
        {additionalSections.length > 0 && (
          additionalSections.map((section, index) => (
            <div 
              key={index} 
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
              {section.content && (
                typeof section.content === 'string' 
                  ? <p 
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
                      {section.content}
                    </p>
                  : section.content
              )}
            </div>
          ))
        )}
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