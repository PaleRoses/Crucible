import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import styled from 'styled-components';

// Note: This implementation assumes you have the 'styled-components' package installed

// Styled Components
const Container = styled(motion.div)`
  display: flex;
  flex-direction: ${props => props.isMobile ? 'column' : 'row'};
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
  min-height: ${props => props.isMobile ? 'auto' : '70vh'};
  position: relative;
  padding-top: ${props => props.isMobile ? '80px' : '0'};
`;

const SidebarWrapper = styled.div`
  width: ${props => `${props.width}%`};
  position: relative;
`;

const Sidebar = styled.div`
  padding: 3rem 2rem 2rem 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  top: 0;
`;

const ContentSection = styled.div`
  width: ${props => props.isMobile ? '100%' : `${props.width}%`};
  padding: ${props => props.isMobile ? 
    '2rem 1.5rem' : 
    `3rem 0 2rem ${props.contentPadding}rem`};
  margin-left: ${props => props.isMobile ? '0' : 'auto'};
`;

const Section = styled.div`
  margin-bottom: 3rem;
  scroll-margin-top: ${props => props.isMobile ? '80px' : '2rem'};
`;

const SectionTitle = styled.h3`
  font-size: 1.4rem;
  color: ${props => props.highlightColor};
  margin-bottom: 1rem;
  font-weight: 300;
`;

const ProfileInfoContainer = styled.div`
  margin-bottom: 2rem;
  padding-left: 5px;
  text-align: ${props => props.isMobile ? 'center' : 'left'};
  width: 100%;
`;

const ProfileName = styled.h1`
  font-weight: 300;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  font-size: ${props => props.isMobile ? '2.2rem' : '2.8rem'};
  color: ${props => props.highlightColor};
`;

const ProfileRole = styled.h2`
  font-weight: 300;
  margin-bottom: 2rem;
  letter-spacing: 0.05em;
  font-style: italic;
  font-size: ${props => props.isMobile ? '1.1rem' : '1.2rem'};
  color: ${props => props.color};
  font-family: ${props => props.fontFamily};
`;

const ProfileTagline = styled.p`
  line-height: 1.6;
  margin-bottom: 3rem;
  font-weight: 300;
  font-size: 1.1rem;
  max-width: ${props => props.isMobile ? '100%' : '90%'};
  color: ${props => props.color};
  font-family: ${props => props.fontFamily};
`;

const NavLinks = styled.div`
  margin-top: 3rem;
`;

const NavLinkContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
`;

const NavLine = styled.div`
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 0.75px;
  width: ${props => props.expanded ? `${props.maxWidth}px` : `${props.minWidth}px`};
  background-color: ${props => props.expanded ? props.activeColor : props.inactiveColor};
  transition: width 0.3s ease, background-color 0.3s ease;
`;

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
  cursor: pointer;
  width: fit-content;
  color: ${props => props.active ? props.activeColor : props.inactiveColor};
  transform: ${props => props.active ? 'translateX(10px)' : 'none'};
`;

const MobileNav = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-around;
  align-items: center;
  transform: ${props => props.visible ? 'translateY(0)' : 'translateY(-100%)'};
  opacity: ${props => props.visible ? 1 : 0};
`;

const MobileNavItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MobileNavButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  outline: none;
`;

const MobileNavLine = styled.div`
  width: ${props => props.active ? `${props.maxWidth}px` : `${props.minWidth}px`};
  height: 2px;
  background-color: ${props => props.active ? props.activeColor : props.inactiveColor};
  transition: width 0.3s ease, background-color 0.3s ease;
  margin-bottom: 0.5rem;
`;

const MobileNavLabel = styled.div`
  font-size: 0.75rem;
  color: ${props => props.active ? props.activeColor : props.inactiveColor};
  letter-spacing: 0.1em;
  transition: color 0.3s ease;
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: ${props => props.isMobile ? 'center' : 'space-between'};
  flex-wrap: wrap;
  margin-top: 3rem;
  width: 100%;
  gap: ${props => props.isMobile ? '2rem' : '0'};
`;

const StatItem = styled.div`
  flex: ${props => props.isMobile ? '0 0 auto' : '1'};
  text-align: center;
  padding: 0 1rem;
  min-width: ${props => props.isMobile ? '140px' : '100px'};
  transition: transform 0.3s ease;
  transform: ${props => props.isHovering ? 'translateY(-5px)' : 'none'};
`;

const StatValue = styled.div`
  font-size: ${props => props.isMobile ? '2.2rem' : '2.5rem'};
  font-weight: 100;
  color: ${props => props.color};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: ${props => props.color};
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const SectionContent = styled.p`
  line-height: 1.8;
  margin-bottom: 1.5rem;
  font-weight: 300;
  font-size: 1rem;
  color: ${props => props.color};
  font-family: ${props => props.fontFamily};
`;

// Component for ProfileInfo
const ProfileInfo = React.memo(({ 
  person, 
  isMobile, 
  highlightColor, 
  textColor, 
  fontFamily 
}) => {
  return (
    <ProfileInfoContainer isMobile={isMobile}>
      <ProfileName 
        isMobile={isMobile} 
        highlightColor={highlightColor}
      >
        {person.name}
      </ProfileName>
      
      <ProfileRole 
        isMobile={isMobile} 
        color={`${highlightColor}B3`} 
        fontFamily={fontFamily}
      >
        {person.role}
      </ProfileRole>
      
      {person.tagline && (
        <ProfileTagline 
          isMobile={isMobile} 
          color={textColor} 
          fontFamily={fontFamily}
        >
          {person.tagline}
        </ProfileTagline>
      )}
    </ProfileInfoContainer>
  );
});

// Component for MobileNavItem
const MobileNavItemComponent = React.memo(({ 
  navItem, 
  activeSection, 
  highlightColor, 
  textColor,
  minLineWidth,
  maxLineWidth 
}) => {
  return (
    <MobileNavItem>
      <MobileNavButton data-section-id={navItem.id}>
        <MobileNavLine 
          active={activeSection === navItem.id}
          activeColor={highlightColor}
          inactiveColor={`${highlightColor}80`}
          minWidth={minLineWidth}
          maxWidth={maxLineWidth}
        />
        <MobileNavLabel 
          active={activeSection === navItem.id}
          activeColor={highlightColor}
          inactiveColor={textColor}
        >
          {navItem.label}
        </MobileNavLabel>
      </MobileNavButton>
    </MobileNavItem>
  );
});

// Component for NavLink
const NavLinkComponent = React.memo(({ 
  navItem, 
  activeSection, 
  expandedNavItem,
  onMouseEnter,
  onMouseLeave, 
  highlightColor, 
  textColor,
  minLineWidth,
  maxLineWidth 
}) => {
  const isActive = activeSection === navItem.id || expandedNavItem === navItem.id;
  
  return (
    <NavLinkContainer 
      data-section-id={navItem.id}
      onMouseEnter={() => onMouseEnter(navItem.id)}
      onMouseLeave={onMouseLeave}
    >
      <NavLine 
        expanded={isActive}
        activeColor={`${highlightColor}E6`}
        inactiveColor={`${highlightColor}80`}
        minWidth={minLineWidth}
        maxWidth={maxLineWidth}
      />
      <NavButton 
        active={isActive}
        activeColor={highlightColor}
        inactiveColor={textColor}
      >
        {navItem.label}
      </NavButton>
    </NavLinkContainer>
  );
});

// Component for StatItem
const StatItemComponent = React.memo(({ 
  stat, 
  isMobile, 
  highlightColor, 
  textColor 
}) => {
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsHovering(false);
    }
  };

  return (
    <StatItem 
      isMobile={isMobile}
      isHovering={isHovering}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <StatValue 
        isMobile={isMobile} 
        color={highlightColor}
      >
        {stat.value}
      </StatValue>
      <StatLabel color={`${textColor}CC`}>
        {stat.label}
      </StatLabel>
    </StatItem>
  );
});

// Component for SectionContent
const SectionContentComponent = React.memo(({ 
  content, 
  textColor, 
  fontFamily 
}) => {
  if (!content) return null;
  
  if (typeof content === 'string') {
    return (
      <SectionContent 
        color={textColor}
        fontFamily={fontFamily}
      >
        {content}
      </SectionContent>
    );
  }
  
  return content;
});

/**
 * PersonProfileCard Component - Optimized Version with CSS-in-JS
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
 * 
 * Performance optimizations:
 * - Event delegation for navigation
 * - Extracted memoized child components
 * - Throttled scroll handlers
 * - ResizeObserver instead of window resize events
 * - Minimized style recalculations
 * - CSS-in-JS for better style organization
 */
const PersonProfileCard = ({
  person,
  animationConfig = {
    threshold: 0.5,
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
  const navLinksRef = useRef(null);
  
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

  // Event delegation for all navigation items
  const handleNavEvent = useCallback((e) => {
    const target = e.target.closest('[data-section-id]');
    if (target) {
      const sectionId = target.getAttribute('data-section-id');
      if (sectionId) {
        e.preventDefault();
        scrollToSection(sectionId);
      }
    }
  }, [scrollToSection]);
  
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

  // Set up event delegation for navigation
  useEffect(() => {
    // Store current ref values at the time the effect runs
    const mobileNavElement = mobileNavRef.current;
    const navLinksElement = navLinksRef.current;
    
    // Add click event listeners with event delegation
    if (mobileNavElement) {
      mobileNavElement.addEventListener('click', handleNavEvent);
    }
    
    if (navLinksElement) {
      navLinksElement.addEventListener('click', handleNavEvent);
    }
    
    return () => {
      if (mobileNavElement) {
        mobileNavElement.removeEventListener('click', handleNavEvent);
      }
      
      if (navLinksElement) {
        navLinksElement.removeEventListener('click', handleNavEvent);
      }
    };
  }, [handleNavEvent]);

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
      threshold: [0, 0.25, 0.5, 0.75] // Multiple thresholds for smoother transitions
    };
    
    const callback = (entries) => {
      // Find the most visible section
      const visibleEntries = entries.filter(entry => entry.isIntersecting);
      
      if (visibleEntries.length > 0) {
        // Sort by visibility ratio, highest first
        visibleEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const topEntry = visibleEntries[0];
        
        const sectionId = topEntry.target.getAttribute('data-section');
        if (sectionId && sectionId !== activeSection) {
          setActiveSection(sectionId);
          
          if (onSectionChange) {
            onSectionChange(sectionId);
          }
        }
      }
    };
    
    const observer = new IntersectionObserver(callback, options);
    sectionElements.forEach(element => observer.observe(element));
    
    return () => observer.disconnect();
  }, [activeSection, onSectionChange, sectionRefsMap, isMobile]);

  // Implement scroll behavior for desktop with enhanced positioning accuracy
  useEffect(() => {
    if (!isInitialized || !containerRef.current || !sidebarRef.current || 
        !sidebarWrapperRef.current || isMobile) {
      return;
    }
    
    const container = containerRef.current;
    const sidebar = sidebarRef.current;
    const sidebarWrapper = sidebarWrapperRef.current;
    
    // Add will-change to hint browser about upcoming transforms
    sidebar.style.willChange = 'position, top, left, width, bottom';
    
    // Create mutable measurement variables at effect scope
    let containerRect;
    let wrapperRect;
    let sidebarHeight;
    
    // Update measurements - more accurate than using an object
    const updateMeasurements = () => {
      containerRect = container.getBoundingClientRect();
      wrapperRect = sidebarWrapper.getBoundingClientRect();
      sidebarHeight = sidebar.offsetHeight;
    };
    
    // Get initial measurements
    updateMeasurements();
    
    // Scroll handler with more precise position calculations
    const handleScroll = () => {
      // Always update measurements first, before any calculations
      updateMeasurements();
      
      // Calculate phase transition points with more precision
      const startFixPoint = containerRect.top <= topOffset;
      
      // Improved end fix point calculation that better handles the transition
      // This matches the original implementation's logic more closely
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
        
        // Apply styles immediately to avoid visual glitches during rapid scrolling
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
          // Phase 3: End position - critical for correct positioning during rapid scroll changes
          sidebar.style.position = 'absolute';
          sidebar.style.top = 'auto'; // Important: don't set top when in end mode
          sidebar.style.bottom = '0'; 
          sidebar.style.left = '0';
          sidebar.style.width = '';
        }
      }
    };
    
    // Improved scroll listener with reduced throttling for smoother transitions
    let ticking = false;
    let lastScrollTime = 0;
    const THROTTLE_MS = 16; // ~60fps for smoother transitions, especially during direction changes
    
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
    
    // Optimized resize handler with more consistent behavior
    const handleResize = () => {
      // Skip for mobile
      if (window.innerWidth <= 768) return;
      
      // Update measurements and apply current mode
      updateMeasurements();
      handleScroll();
    };
    
    // Use ResizeObserver instead of window resize for better performance
    const resizeObserver = new ResizeObserver(() => {
      // Use requestAnimationFrame to avoid resize calculations during rendering
      requestAnimationFrame(handleResize);
    });
    resizeObserver.observe(container);
    
    // Initial setup
    handleResize();
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', scrollListener);
      resizeObserver.disconnect();
      // Remove will-change to free up resources
      sidebar.style.willChange = 'auto';
    };
  }, [isInitialized, topOffset, sidebarMode, isMobile, containerRef, sidebarRef, sidebarWrapperRef]);

  // Mobile nav scroll behavior with auto-hide - optimized with throttling
  useEffect(() => {
    if (!isInitialized || !isMobile || !mobileNavRef.current) {
      return;
    }
    
    const mobileNav = mobileNavRef.current;
    
    // Add will-change to hint browser about transforms
    mobileNav.style.willChange = 'transform, opacity, background-color';
    
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
      requestAnimationFrame(() => {
        const bgOpacity = currentScrollY > 50 ? 0.95 : 0.7;
        mobileNav.style.backgroundColor = `rgba(17, 17, 17, ${bgOpacity})`;
        mobileNav.style.boxShadow = currentScrollY > 50 ? '0 2px 10px rgba(0, 0, 0, 0.1)' : 'none';
      });
      
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
        requestAnimationFrame(() => {
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
      // Remove will-change to free up resources when not needed
      mobileNav.style.willChange = 'auto';
    };
  }, [isInitialized, isMobile, lastScrollY, mobileNavRef]);

  // Stats section - extracted and memoized
  const renderStats = useMemo(() => {
    if (!showStats || !person.stats || person.stats.length === 0) return null;
    
    return (
      <StatsContainer isMobile={isMobile}>
        {person.stats.map((stat, statIdx) => (
          <StatItemComponent
            key={statIdx}
            stat={stat}
            isMobile={isMobile}
            highlightColor={highlightColor}
            textColor={textColor}
          />
        ))}
      </StatsContainer>
    );
  }, [showStats, person.stats, isMobile, highlightColor, textColor]);

  // Section renderers - separated for clarity and optimization
  const renderAboutSection = useMemo(() => {
    if (!person.bio) return null;
    
    return (
      <>
        {person.bio.map((paragraph, idx) => (
          <SectionContentComponent
            key={idx}
            content={paragraph}
            textColor={textColor}
            fontFamily={fontFamily}
          />
        ))}
        
        {renderStats}
      </>
    );
  }, [person.bio, renderStats, textColor, fontFamily]);

  const renderExperienceSection = useMemo(() => {
    if (!person.experience) {
      return (
        <SectionContentComponent
          content="Throughout my career, I've specialized in developing software systems that seamlessly integrate front-end experiences with robust back-end architectures. My experience spans various domains, from interactive media to data visualization systems."
          textColor={textColor}
          fontFamily={fontFamily}
        />
      );
    }
    
    return (
      <>
        {person.experience.map((item, expIdx) => (
          <SectionContentComponent
            key={expIdx}
            content={item.content}
            textColor={textColor}
            fontFamily={fontFamily}
          />
        ))}
      </>
    );
  }, [person.experience, textColor, fontFamily]);

  const renderProjectsSection = useMemo(() => {
    if (!person.projects) return null;
    
    return (
      <>
        {person.projects.map((item, projIdx) => (
          <SectionContentComponent
            key={projIdx}
            content={item.content}
            textColor={textColor}
            fontFamily={fontFamily}
          />
        ))}
      </>
    );
  }, [person.projects, textColor, fontFamily]);

  // Main section renderer - unified logic for any section type using memoization
  const getRenderedSection = useCallback((sectionId) => {
    // Find section from navigationItems
    const section = navigationItems.find(item => item.id === sectionId);
    if (!section) return null;
    
    if (section.content) {
      return (
        <SectionContentComponent
          content={section.content}
          textColor={textColor}
          fontFamily={fontFamily}
        />
      );
    }
    
    switch (sectionId) {
      case 'about':
        return renderAboutSection;
      case 'experience':
        return renderExperienceSection;
      case 'projects':
        return renderProjectsSection;
      default:
        return null;
    }
  }, [
    navigationItems, 
    renderAboutSection, 
    renderExperienceSection, 
    renderProjectsSection, 
    textColor, 
    fontFamily
  ]);

  return (
    <>
      {/* Mobile navigation with event delegation */}
      {isMobile && (
        <MobileNav
          ref={mobileNavRef}
          visible={mobileNavVisible}
        >
          {navigationItems.map((navItem) => (
            <MobileNavItemComponent
              key={navItem.id}
              navItem={navItem}
              activeSection={activeSection}
              highlightColor={highlightColor}
              textColor={textColor}
              minLineWidth={minLineWidth}
              maxLineWidth={maxLineWidth}
            />
          ))}
        </MobileNav>
      )}
      
      <Container 
        ref={containerRef}
        isMobile={isMobile}
        initial={{ opacity: 0, y: animationConfig?.initialY ?? 30 }}
        animate={controls}
      >
        {/* Left sidebar wrapper - desktop only */}
        {!isMobile && (
          <SidebarWrapper 
            ref={sidebarWrapperRef}
            width={layoutValues.sidebarWidth}
          >
            {/* Profile sidebar */}
            <Sidebar ref={sidebarRef}>
              <ProfileInfo
                person={person}
                isMobile={isMobile}
                highlightColor={highlightColor}
                textColor={textColor}
                fontFamily={fontFamily}
              />
              
              {/* Navigation links with event delegation */}
              {!isMobile && (
                <NavLinks ref={navLinksRef}>
                  {navigationItems.map((navItem) => (
                    <NavLinkComponent
                      key={navItem.id}
                      navItem={navItem}
                      activeSection={activeSection}
                      expandedNavItem={expandedNavItem}
                      onMouseEnter={handleNavItemHover}
                      onMouseLeave={handleNavItemLeave}
                      highlightColor={highlightColor}
                      textColor={textColor}
                      minLineWidth={minLineWidth}
                      maxLineWidth={maxLineWidth}
                    />
                  ))}
                </NavLinks>
              )}
            </Sidebar>
          </SidebarWrapper>
        )}
        
        {/* Profile Info for mobile */}
        {isMobile && (
          <ProfileInfo
            person={person}
            isMobile={isMobile}
            highlightColor={highlightColor}
            textColor={textColor}
            fontFamily={fontFamily}
          />
        )}
        
        {/* Right content section */}
        <ContentSection 
          ref={contentRef}
          isMobile={isMobile}
          width={layoutValues.contentWidth}
          contentPadding={layoutValues.contentPadding}
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
                isMobile={isMobile}
              >
                {getRenderedSection(section.id)}
              </Section>
            );
          })}
          
          {/* Additional sections */}
          {additionalSections.map((section, index) => (
            <Section 
              key={`additional-${index}`}
              isMobile={isMobile}
            >
              {section.title && (
                <SectionTitle highlightColor={highlightColor}>
                  {section.title}
                </SectionTitle>
              )}
              <SectionContentComponent
                content={section.content}
                textColor={textColor}
                fontFamily={fontFamily}
              />
            </Section>
          ))}
        </ContentSection>
      </Container>
    </>
  );
};

// Using memo to prevent unnecessary re-renders
export default React.memo(PersonProfileCard);