import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

// TypeScript interfaces
interface PersonInfo {
  name: string;
  role: string;
  tagline?: string;
  bio?: (string | React.ReactNode)[];
  stats?: Array<{ label: string; value: string | number }>;
  experience?: Array<{ content: string | React.ReactNode }>;
  projects?: Array<{ content: string | React.ReactNode }>;
}

interface AnimationConfig {
  threshold?: number;
  once?: boolean;
  initialY?: number;
  duration?: number;
}

interface NavigationItem {
  id: string;
  label: string;
  content?: string | React.ReactNode;
}

interface AdditionalSection {
  title?: string;
  content: string | React.ReactNode;
}

interface ScrollableInformationCardProps {
  person: PersonInfo;
  animationConfig?: AnimationConfig;
  additionalSections?: AdditionalSection[];
  onSectionChange?: (sectionId: string) => void;
  topOffset?: number;
  showStats?: boolean;
  highlightColor?: string;
  textColor?: string;
  minLineWidth?: number;
  maxLineWidth?: number;
  fontFamily?: string;
  navigationItems?: NavigationItem[];
  contentCompression?: number;
}

// Subcomponents props interfaces
interface ProfileInfoProps {
  person: PersonInfo;
  isMobile: boolean;
  highlightColor: string;
  textColor: string;
  fontFamily: string;
}

interface MobileNavItemProps {
  navItem: NavigationItem;
  activeSection: string;
  highlightColor: string;
  textColor: string;
  minLineWidth: number;
  maxLineWidth: number;
}

interface NavLinkProps {
  navItem: NavigationItem;
  activeSection: string;
  expandedNavItem: string | null;
  onMouseEnter: (id: string) => void;
  onMouseLeave: () => void;
  highlightColor: string;
  textColor: string;
  minLineWidth: number;
  maxLineWidth: number;
}

interface StatItemProps {
  stat: { label: string; value: string | number };
  isMobile: boolean;
  highlightColor: string;
  textColor: string;
}

interface SectionContentProps {
  content: string | React.ReactNode;
  textColor: string;
  fontFamily: string;
}

// ProfileInfo component
const ProfileInfo = React.memo<ProfileInfoProps>(({ 
  person, 
  isMobile, 
  highlightColor, 
  textColor, 
  fontFamily 
}) => {
  return (
    <div className={`mb-8 pl-[5px] ${isMobile ? 'text-center' : 'text-left'} w-full`}>
      <h1 
        className={`font-light tracking-wider mb-2 ${isMobile ? 'text-[2.2rem]' : 'text-[2.8rem]'}`}
        style={{ color: highlightColor }}
      >
        {person.name}
      </h1>
      
      <h2 
        className={`font-light mb-8 tracking-wider italic ${isMobile ? 'text-[1.1rem]' : 'text-[1.2rem]'}`}
        style={{ color: `${highlightColor}B3`, fontFamily }}
      >
        {person.role}
      </h2>
      
      {person.tagline && (
        <p 
          className={`leading-relaxed mb-12 font-light text-[1.1rem] ${isMobile ? 'max-w-full' : 'max-w-[90%]'}`}
          style={{ color: textColor, fontFamily }}
        >
          {person.tagline}
        </p>
      )}
    </div>
  );
});
ProfileInfo.displayName = 'ProfileInfo';

// MobileNavItem component
const MobileNavItem = React.memo<MobileNavItemProps>(({ 
  navItem, 
  activeSection, 
  highlightColor, 
  textColor,
  minLineWidth,
  maxLineWidth 
}) => {
  const isActive = activeSection === navItem.id;
  
  return (
    <div className="flex flex-col items-center">
      <button 
        className="flex flex-col items-center bg-transparent border-none cursor-pointer p-2 outline-none"
        data-section-id={navItem.id}
      >
        <div 
          className="h-[2px] mb-2 transition-all duration-300"
          style={{ 
            width: isActive ? `${maxLineWidth}px` : `${minLineWidth}px`,
            backgroundColor: isActive ? highlightColor : `${highlightColor}80`
          }}
        />
        <div 
          className="text-[0.75rem] tracking-wider transition-colors duration-300"
          style={{ color: isActive ? highlightColor : textColor }}
        >
          {navItem.label}
        </div>
      </button>
    </div>
  );
});
MobileNavItem.displayName = 'MobileNavItem';

// NavLink component
const NavLink = React.memo<NavLinkProps>(({ 
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
    <div 
      className="relative mb-4 flex items-center"
      data-section-id={navItem.id}
      onMouseEnter={() => onMouseEnter(navItem.id)}
      onMouseLeave={onMouseLeave}
    >
      <div 
        className="absolute left-0 top-1/2 -translate-y-1/2 h-[0.75px] transition-all duration-300"
        style={{
          width: isActive ? `${maxLineWidth}px` : `${minLineWidth}px`,
          backgroundColor: isActive ? `${highlightColor}E6` : `${highlightColor}80`
        }}
      />
      <button 
        className="relative block py-2 pl-10 text-[0.85rem] tracking-wider bg-transparent border-none text-left outline-none shadow-none transition-all duration-500 cursor-pointer w-fit"
        style={{
          color: isActive ? highlightColor : textColor,
          transform: isActive ? 'translateX(10px)' : 'none'
        }}
      >
        {navItem.label}
      </button>
    </div>
  );
});
NavLink.displayName = 'NavLink';

// StatItem component
const StatItem = React.memo<StatItemProps>(({ 
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
    <div 
      className={`${isMobile ? 'flex-none' : 'flex-1'} text-center px-4 ${isMobile ? 'min-w-[140px]' : 'min-w-[100px]'} transition-transform duration-300`}
      style={{ transform: isHovering ? 'translateY(-5px)' : 'none' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className={`${isMobile ? 'text-[2.2rem]' : 'text-[2.5rem]'} font-thin mb-2`}
        style={{ color: highlightColor }}
      >
        {stat.value}
      </div>
      <div 
        className="text-[0.85rem] uppercase tracking-wider"
        style={{ color: `${textColor}CC` }}
      >
        {stat.label}
      </div>
    </div>
  );
});
StatItem.displayName = 'StatItem';

// SectionContent component
const SectionContent = React.memo<SectionContentProps>(({ 
  content, 
  textColor, 
  fontFamily 
}) => {
  if (!content) return null;
  
  if (typeof content === 'string') {
    return (
      <p 
        className="leading-loose mb-6 font-light text-base"
        style={{ color: textColor, fontFamily }}
      >
        {content}
      </p>
    );
  }
  
  return <>{content}</>;
});
SectionContent.displayName = 'SectionContent';

/**
 * ScrollableInformationCard Component
 * 
 * A profile card with a three-phase scroll behavior:
 * 1. Normal Flow: Initially scrolls with the page
 * 2. Fixed Position: Sticks to viewport when scrolling through content
 * 3. Release: Returns to normal flow after scrolling past component
 *
 * Tailwind CSS implementation with framer-motion for animations
 */
const ScrollableInformationCard: React.FC<ScrollableInformationCardProps> = ({
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
  const [activeSection, setActiveSection] = useState<string>(navigationItems[0]?.id || 'about');
  const [expandedNavItem, setExpandedNavItem] = useState<string | null>(null);
  const [sidebarMode, setSidebarMode] = useState<'normal' | 'fixed' | 'end'>('normal');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mobileNavVisible, setMobileNavVisible] = useState<boolean>(false);
  const [lastScrollY, setLastScrollY] = useState<number>(0);

  // Create individual refs
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarWrapperRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const navLinksRef = useRef<HTMLDivElement>(null);
  
  // Animation controls
  const controls = useAnimation();
  
  // Store DOM element references manually
  const sectionRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  
  // Memoize calculation of compression-based values
  const layoutValues = useMemo(() => {
    const compressionFactor = Math.min(Math.max(contentCompression, 0), 10) / 10;
    return {
      sidebarWidth: 45 - (compressionFactor * 5), // 35-40% range
      contentWidth: 55 - (compressionFactor * 5), // 55-60% range
      contentPadding: 2 + (compressionFactor * 2), // 2-4rem range
    };
  }, [contentCompression]);

  // Animation inView detection - using amount instead of threshold for framer-motion v6+
  const isInView = useInView(containerRef, {
    amount: animationConfig?.threshold ?? 0.2,
    once: animationConfig?.once ?? true
  });

  // Memoized function for checking if we're on mobile
  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  // Scroll to section handler
  const scrollToSection = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    
    if (onSectionChange) {
      onSectionChange(sectionId);
    }
    
    const element = sectionRefs.current[sectionId];
    if (element) {
      // Different scroll behavior for mobile vs desktop
      if (isMobile) {
        const offsetTop = element.getBoundingClientRect().top + window.scrollY;
        const mobileNavHeight = mobileNavRef.current ? mobileNavRef.current.offsetHeight : 0;
        
        window.scrollTo({
          top: offsetTop - mobileNavHeight - 20, // Additional offset for spacing
          behavior: 'smooth'
        });
      } else {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  }, [onSectionChange, isMobile, mobileNavRef]);

  // Event delegation for all navigation items
  const handleNavEvent = useCallback((e: Event) => {
    const target = (e.target as HTMLElement).closest('[data-section-id]');
    if (target) {
      const sectionId = target.getAttribute('data-section-id');
      if (sectionId) {
        e.preventDefault();
        scrollToSection(sectionId);
      }
    }
  }, [scrollToSection]);
  
  // Navigation item hover handlers
  const handleNavItemHover = useCallback((section: string) => {
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
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [checkMobile]);

  // Set up event delegation for navigation
  useEffect(() => {
    const mobileNavElement = mobileNavRef.current;
    const navLinksElement = navLinksRef.current;
    
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
          delay: 0.1
        }
      });
      
      const timeout = setTimeout(() => {
        setIsInitialized(true);
      }, (animationConfig?.duration ?? 0.8) * 1000 + 100);
      
      return () => clearTimeout(timeout);
    }
  }, [isInView, controls, animationConfig?.duration]);

  // Set up intersection observer for section detection
  useEffect(() => {
    // Filter out null elements
    const elements: HTMLDivElement[] = [];
    Object.values(sectionRefs.current).forEach(el => {
      if (el) elements.push(el);
    });
    
    if (elements.length === 0) return;
    
    // Different margins for mobile and desktop
    const options = {
      root: null,
      rootMargin: isMobile 
        ? '-80px 0px -70% 0px'  // For mobile with fixed nav
        : '-10% 0px -70% 0px',  // For desktop
      threshold: [0, 0.25, 0.5, 0.75]
    };
    
    const callback = (entries: IntersectionObserverEntry[]) => {
      const visibleEntries = entries.filter(entry => entry.isIntersecting);
      
      if (visibleEntries.length > 0) {
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
    elements.forEach(element => observer.observe(element));
    
    return () => observer.disconnect();
  }, [activeSection, onSectionChange, isMobile]);

  // Implement scroll behavior for desktop
  useEffect(() => {
    if (!isInitialized || !containerRef.current || !sidebarRef.current || 
        !sidebarWrapperRef.current || isMobile) {
      return;
    }
    
    const container = containerRef.current;
    const sidebar = sidebarRef.current;
    const sidebarWrapper = sidebarWrapperRef.current;
    
    // Add will-change for better performance
    sidebar.style.willChange = 'position, top, left, width, bottom';
    
    // Create measurement variables
    let containerRect: DOMRect;
    let wrapperRect: DOMRect;
    let sidebarHeight: number;
    
    // Update measurements
    const updateMeasurements = () => {
      containerRect = container.getBoundingClientRect();
      wrapperRect = sidebarWrapper.getBoundingClientRect();
      sidebarHeight = sidebar.offsetHeight;
    };
    
    updateMeasurements();
    
    // Scroll handler with position calculations
    const handleScroll = () => {
      updateMeasurements();
      
      const startFixPoint = containerRect.top <= topOffset;
      const endFixPoint = containerRect.bottom <= (sidebarHeight + topOffset);
      
      // Determine the current scroll phase
      let newMode: 'normal' | 'fixed' | 'end';
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
        
        // Apply styles immediately for better performance
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
    
    // Throttled scroll listener
    let ticking = false;
    let lastScrollTime = 0;
    const THROTTLE_MS = 16; // ~60fps
    
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
    
    // Resize handler
    const handleResize = () => {
      if (window.innerWidth <= 768) return;
      updateMeasurements();
      handleScroll();
    };
    
    // ResizeObserver for better performance
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(handleResize);
    });
    resizeObserver.observe(container);
    
    // Initial setup
    handleResize();
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', scrollListener);
      resizeObserver.disconnect();
      sidebar.style.willChange = 'auto';
    };
  }, [isInitialized, topOffset, sidebarMode, isMobile]);

  // Mobile nav scroll behavior with auto-hide
  useEffect(() => {
    if (!isInitialized || !isMobile || !mobileNavRef.current) {
      return;
    }
    
    const mobileNav = mobileNavRef.current;
    mobileNav.style.willChange = 'transform, opacity, background-color';
    
    // Scroll handler for mobile nav
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setMobileNavVisible(true);
      } else {
        setMobileNavVisible(false);
      }
      
      // Update background opacity based on scroll position
      requestAnimationFrame(() => {
        const bgOpacity = currentScrollY > 50 ? 0.95 : 0.7;
        mobileNav.style.backgroundColor = `rgba(17, 17, 17, ${bgOpacity})`;
        mobileNav.style.boxShadow = currentScrollY > 50 ? '0 2px 10px rgba(0, 0, 0, 0.1)' : 'none';
      });
      
      setLastScrollY(currentScrollY);
    };
    
    // Throttled scroll event handling
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
    
    // Initial state
    mobileNav.style.backgroundColor = 'rgba(17, 17, 17, 0.7)';
    mobileNav.style.boxShadow = 'none';
    
    return () => {
      window.removeEventListener('scroll', scrollListener);
      mobileNav.style.willChange = 'auto';
    };
  }, [isInitialized, isMobile, lastScrollY]);

  // Stats section - extracted and memoized
  const renderStats = useMemo(() => {
    if (!showStats || !person.stats || person.stats.length === 0) return null;
    
    return (
      <div className={`flex ${isMobile ? 'justify-center gap-8' : 'justify-between gap-0'} flex-wrap mt-12 w-full`}>
        {person.stats.map((stat, statIdx) => (
          <StatItem
            key={statIdx}
            stat={stat}
            isMobile={isMobile}
            highlightColor={highlightColor}
            textColor={textColor}
          />
        ))}
      </div>
    );
  }, [showStats, person.stats, isMobile, highlightColor, textColor]);

  // Section renderers - separated for clarity and optimization
  const renderAboutSection = useMemo(() => {
    if (!person.bio) return null;
    
    return (
      <>
        {person.bio.map((paragraph, idx) => (
          <SectionContent
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
        <SectionContent
          content="Throughout my career, I've specialized in developing software systems that seamlessly integrate front-end experiences with robust back-end architectures. My experience spans various domains, from interactive media to data visualization systems."
          textColor={textColor}
          fontFamily={fontFamily}
        />
      );
    }
    
    return (
      <>
        {person.experience.map((item, expIdx) => (
          <SectionContent
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
          <SectionContent
            key={projIdx}
            content={item.content}
            textColor={textColor}
            fontFamily={fontFamily}
          />
        ))}
      </>
    );
  }, [person.projects, textColor, fontFamily]);

  // Main section renderer using memoization
  const getRenderedSection = useCallback((sectionId: string) => {
    // Find section from navigationItems
    const section = navigationItems.find(item => item.id === sectionId);
    if (!section) return null;
    
    if (section.content) {
      return (
        <SectionContent
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

  // Safe ref callback for section elements
  const setSectionRef = useCallback((element: HTMLDivElement | null, id: string) => {
    sectionRefs.current[id] = element;
  }, []);

  return (
    <>
      {/* Mobile navigation */}
      {isMobile && (
        <div
          ref={mobileNavRef}
          className="fixed top-0 left-0 w-full z-[100] backdrop-blur-[10px] transition-all duration-300 py-3 px-4 flex justify-around items-center"
          style={{ 
            transform: mobileNavVisible ? 'translateY(0)' : 'translateY(-100%)',
            opacity: mobileNavVisible ? 1 : 0
          }}
        >
          {navigationItems.map((navItem) => (
            <MobileNavItem
              key={navItem.id}
              navItem={navItem}
              activeSection={activeSection}
              highlightColor={highlightColor}
              textColor={textColor}
              minLineWidth={minLineWidth}
              maxLineWidth={maxLineWidth}
            />
          ))}
        </div>
      )}
      
      <motion.div 
        ref={containerRef}
        className={`flex ${isMobile ? 'flex-col' : 'flex-row'} w-full max-w-[1300px] mx-auto ${isMobile ? 'min-h-auto pt-20' : 'min-h-[70vh] pt-0'} relative`}
        initial={{ opacity: 0, y: animationConfig?.initialY ?? 30 }}
        animate={controls}
      >
        {/* Left sidebar wrapper - desktop only */}
        {!isMobile && (
          <div 
            ref={sidebarWrapperRef}
            className="relative"
            style={{ width: `${layoutValues.sidebarWidth}%` }}
          >
            {/* Profile sidebar */}
            <div 
              ref={sidebarRef}
              className="pt-12 pb-8 pr-8 pl-0 flex flex-col w-full relative top-0"
            >
              <ProfileInfo
                person={person}
                isMobile={isMobile}
                highlightColor={highlightColor}
                textColor={textColor}
                fontFamily={fontFamily}
              />
              
              {/* Navigation links */}
              {!isMobile && (
                <div ref={navLinksRef} className="mt-12">
                  {navigationItems.map((navItem) => (
                    <NavLink
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
                </div>
              )}
            </div>
          </div>
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
        <div 
          ref={contentRef}
          className={`${isMobile ? 'w-full px-6 py-8' : `ml-auto py-12 px-0`}`}
          style={{ 
            width: isMobile ? '100%' : `${layoutValues.contentWidth}%`,
            paddingLeft: isMobile ? '' : `${layoutValues.contentPadding}rem`
          }}
        >
          {/* Render sections based on navigationItems */}
          {navigationItems.map((section) => (
            <div 
              key={section.id}
              ref={(el) => setSectionRef(el, section.id)}
              data-section={section.id}
              id={section.id}
              className="mb-12 scroll-mt-8"
              style={{ scrollMarginTop: isMobile ? '80px' : '2rem' }}
            >
              <h3 
                className="text-[1.4rem] mb-4 font-light"
                style={{ color: highlightColor }}
              >
                {section.label}
              </h3>
              {getRenderedSection(section.id)}
            </div>
          ))}
          
          {/* Additional sections */}
          {additionalSections.map((section, index) => (
            <div 
              key={`additional-${index}`}
              className="mb-12"
              style={{ scrollMarginTop: isMobile ? '80px' : '2rem' }}
            >
              {section.title && (
                <h3 
                  className="text-[1.4rem] mb-4 font-light"
                  style={{ color: highlightColor }}
                >
                  {section.title}
                </h3>
              )}
              <SectionContent
                content={section.content}
                textColor={textColor}
                fontFamily={fontFamily}
              />
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
};

ScrollableInformationCard.displayName = 'ScrollableInformationCard';

// Using memo to prevent unnecessary re-renders
export default React.memo(ScrollableInformationCard);