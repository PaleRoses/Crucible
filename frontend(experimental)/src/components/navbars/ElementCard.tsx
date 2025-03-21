import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

// Types
export interface Stat {
  value: string | number;
  label: string;
}

export interface Section {
  id: string;
  title?: string;
  content: React.ReactNode;
}

export interface NavItem {
  id: string;
  label: string;
}

export interface AnimationConfig {
  threshold?: number;
  once?: boolean;
  initialY?: number;
  duration?: number;
}

export interface ElementCardProps {
  // Core data
  sections: Section[];
  profile: {
    name: string;
    role: string;
    tagline?: string;
    bio?: string[];
    stats?: Stat[];
  };
  
  // Layout and styling
  className?: string;
  style?: React.CSSProperties;
  contentCompression?: number;
  
  // Component configuration
  topOffset?: number;
  variant?: 'standard' | 'minimal' | 'premium';
  showStats?: boolean;
  breakpoints?: {
    mobile: number;
  };
  
  // Animation configuration
  animationConfig?: AnimationConfig;
  disableAnimations?: string[];
  
  // Events
  onSectionChange?: (sectionId: string) => void;
}

/**
 * ElementCard: Advanced Interactive Component
 * 
 * A sophisticated React component designed to present information with premium interactivity
 * and exceptional visual fluidity. Features three-phase scrolling behavior, intelligent
 * navigation, and responsive adaptation across all device types.
 *
 * @example
 * ```tsx
 * <ElementCard
 *   profile={{
 *     name: "Jane Doe",
 *     role: "Product Designer",
 *     tagline: "Creating experiences that matter"
 *   }}
 *   sections={[
 *     { id: "about", title: "About", content: "..." },
 *     { id: "projects", title: "Projects", content: "..." }
 *   ]}
 * />
 * ```
 */
const ElementCard: React.FC<ElementCardProps> = ({
  sections = [],
  profile,
  className = '',
  style = {},
  contentCompression: propCompression = 0,
  topOffset = 100,
  variant = 'standard',
  showStats = true,
  breakpoints = { mobile: 768 },
  animationConfig = {
    threshold: 0.5,
    once: true,
    initialY: 30,
    duration: 0.8
  },
  disableAnimations = [],
  onSectionChange
}) => {
  // Apply variant-specific settings
  const variantSettings = useMemo(() => {
    switch(variant) {
      case 'minimal':
        return {
          compression: 7,
          mobileBreakpoint: 640,
          navIndicatorMin: 5,
          navIndicatorMax: 30,
        };
      case 'premium':
        return {
          compression: 10,
          mobileBreakpoint: 992,
          navIndicatorMin: 15,
          navIndicatorMax: 45,
        };
      default: // standard
        return {
          compression: propCompression,
          mobileBreakpoint: breakpoints.mobile,
          navIndicatorMin: 10,
          navIndicatorMax: 40,
        };
    }
  }, [variant, propCompression, breakpoints.mobile]);

  // States
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '');
  const [expandedNavItem, setExpandedNavItem] = useState<string | null>(null);
  const [sidebarMode, setSidebarMode] = useState<'normal' | 'fixed' | 'end'>('normal');
  const [isMobile, setIsMobile] = useState(false);
  const [mobileNavVisible, setMobileNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [initialized, setInitialized] = useState(false);

  // Calculate layout values based on compression
  const layoutValues = useMemo(() => {
    const compressionFactor = Math.min(Math.max(variantSettings.compression, 0), 10) / 10;
    return {
      sidebarWidth: 45 - (compressionFactor * 10), // 35-45% range
      contentWidth: 55 - (compressionFactor * 0),  // 55% fixed
      contentPadding: 2 + (compressionFactor * 2),  // 2-4rem range
    };
  }, [variantSettings.compression]);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarWrapperRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const navLinksRef = useRef<HTMLDivElement>(null);
  
  // Section refs
  const sectionRefs = useMemo(() => {
    return sections.map(() => React.createRef<HTMLDivElement>());
  }, [sections]);
  
  // Animation controls
  const controls = useAnimation();
  const isInView = useInView(containerRef, {
    amount: animationConfig?.threshold ?? 0.2,
    once: animationConfig?.once ?? true,
  });

  // Check if on mobile
  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth <= variantSettings.mobileBreakpoint);
  }, [variantSettings.mobileBreakpoint]);

  // Scroll to section handler
  const scrollToSection = useCallback((sectionId: string) => {
    if (!sectionId) return;
    
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;
    
    const sectionRef = sectionRefs[sectionIndex];
    if (!sectionRef?.current) return;

    setActiveSection(sectionId);
    if (onSectionChange) onSectionChange(sectionId);
    
    if (isMobile) {
      const mobileNavHeight = mobileNavRef.current?.offsetHeight || 0;
      const offsetTop = sectionRef.current.getBoundingClientRect().top + window.pageYOffset;
      
      window.scrollTo({
        top: offsetTop - mobileNavHeight - 20,
        behavior: 'smooth',
      });
    } else {
      sectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [sections, sectionRefs, isMobile, mobileNavRef, onSectionChange]);

  // Navigation item hover handlers
  const handleNavItemHover = useCallback((sectionId: string) => {
    if (!isMobile) {
      setExpandedNavItem(sectionId);
    }
  }, [isMobile]);
  
  const handleNavItemLeave = useCallback(() => {
    if (!isMobile) {
      setExpandedNavItem(null);
    }
  }, [isMobile]);

  // Event delegation for navigation
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

  // Initialize on mount
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
    const shouldAnimate = !disableAnimations.includes('entrance');
    
    if (isInView && shouldAnimate) {
      controls.start({ 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: animationConfig?.duration ?? 0.8,
          ease: "easeOut",
          delay: 0.1
        }
      });
      
      // Mark as initialized after animation completes
      const timeout = setTimeout(() => {
        setInitialized(true);
      }, (animationConfig?.duration ?? 0.8) * 1000 + 100);
      
      return () => clearTimeout(timeout);
    } else if (isInView) {
      // If entrance animations are disabled, just set as initialized
      setInitialized(true);
    }
  }, [isInView, controls, animationConfig?.duration, disableAnimations]);

  // Desktop sidebar scroll behavior
  useEffect(() => {
    if (!initialized || isMobile || !containerRef.current || !sidebarRef.current || !sidebarWrapperRef.current) {
      return;
    }
    
    const container = containerRef.current;
    const sidebar = sidebarRef.current;
    const wrapper = sidebarWrapperRef.current;
    
    // Add will-change hint
    sidebar.style.willChange = 'position, top, left, width, bottom';
    
    // Measurements
    let containerRect: DOMRect;
    let wrapperRect: DOMRect;
    let sidebarHeight: number;
    
    // Update measurements
    const updateMeasurements = () => {
      containerRect = container.getBoundingClientRect();
      wrapperRect = wrapper.getBoundingClientRect();
      sidebarHeight = sidebar.offsetHeight;
    };
    
    // Get initial measurements
    updateMeasurements();
    
    // Scroll handler
    const handleScroll = () => {
      updateMeasurements();
      
      // Calculate phase transition points
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
        
        // Apply styles immediately
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
    
    // ResizeObserver for better performance
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        updateMeasurements();
        handleScroll();
      });
    });
    resizeObserver.observe(container);
    
    // Initial call
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', scrollListener);
      resizeObserver.disconnect();
      sidebar.style.willChange = 'auto';
    };
  }, [initialized, isMobile, sidebarMode, topOffset]);

  // Mobile navigation behavior
  useEffect(() => {
    if (!initialized || !isMobile || !mobileNavRef.current) {
      return;
    }
    
    const mobileNav = mobileNavRef.current;
    
    // Add will-change hint
    mobileNav.style.willChange = 'transform, opacity, background-color';
    
    // Scroll handler for mobile nav
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar when scrolling up or at the top of the page
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setMobileNavVisible(true);
      } else {
        // Hide navbar when scrolling down past the threshold
        setMobileNavVisible(false);
      }
      
      // Store current scroll position
      setLastScrollY(currentScrollY);
    };
    
    // Throttled scroll event
    let ticking = false;
    let lastScrollTime = 0;
    const THROTTLE_MS = 100;
    
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
    
    return () => {
      window.removeEventListener('scroll', scrollListener);
      mobileNav.style.willChange = 'auto';
    };
  }, [initialized, isMobile, lastScrollY]);

  // Section visibility tracking
  useEffect(() => {
    if (!initialized || sections.length === 0) {
      return;
    }
    
    const sectionElements = sectionRefs
      .map(ref => ref.current)
      .filter(Boolean) as HTMLDivElement[];
    
    if (sectionElements.length === 0) return;
    
    const options = {
      root: null,
      rootMargin: isMobile 
        ? '-80px 0px -70% 0px'  // For mobile with fixed nav
        : '-10% 0px -70% 0px',  // For desktop
      threshold: [0, 0.25, 0.5, 0.75]
    };
    
    const callback = (entries: IntersectionObserverEntry[]) => {
      // Find the most visible section
      const visibleEntries = entries.filter(entry => entry.isIntersecting);
      
      if (visibleEntries.length > 0) {
        // Sort by visibility ratio, highest first
        visibleEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const topEntry = visibleEntries[0];
        
        const sectionId = topEntry.target.getAttribute('data-section-id');
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
  }, [initialized, sections, sectionRefs, isMobile, activeSection, onSectionChange]);

  // Stats section renderer
  const renderStats = useMemo(() => {
    if (!showStats || !profile?.stats || profile.stats.length === 0) return null;
    
    return (
      <div className="flex flex-wrap mt-12 w-full" 
           data-ec-section="stats"
           style={{
             justifyContent: isMobile ? 'center' : 'space-between',
             gap: isMobile ? '2rem' : '0',
           }}>
        {profile.stats.map((stat, index) => (
          <div
            key={index}
            className={`text-center px-4 transition-all duration-default ${!disableAnimations.includes('stats') && !isMobile ? 'hover-lift' : ''}`}
            style={{
              flex: isMobile ? '0 0 auto' : '1',
              minWidth: isMobile ? '140px' : '100px',
            }}
          >
            <div className="text-gold mb-2" style={{ fontSize: isMobile ? '2.2rem' : '2.5rem', fontWeight: 100 }}>
              {stat.value}
            </div>
            <div className="text-text-70 uppercase text-sm tracking-wider">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    );
  }, [
    showStats, 
    profile.stats, 
    isMobile, 
    disableAnimations
  ]);

  // Section content renderer
  const getSectionContent = useCallback((content: React.ReactNode) => {
    if (!content) return null;
    
    if (typeof content === 'string') {
      return (
        <p className="mb-6 text-base font-light body-text">
          {content}
        </p>
      );
    }
    
    return content;
  }, []);

  // Mobile navigation item
  const MobileNavItem = useCallback(({ id, label }: { id: string, label: string }) => {
    const isActive = activeSection === id;
    
    return (
      <div className="flex flex-col items-center">
        <button 
          className="flex flex-col items-center bg-transparent border-none p-2 cursor-pointer outline-none"
          data-section-id={id}
          aria-current={isActive ? 'true' : 'false'}
          onClick={() => scrollToSection(id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              scrollToSection(id);
            }
          }}
        >
          <div
            className={`h-0.5 mb-2 transition-all duration-default ${isActive ? 'bg-gold' : 'bg-gold-50'}`}
            style={{
              width: isActive ? `${variantSettings.navIndicatorMax}px` : `${variantSettings.navIndicatorMin}px`,
            }}
            aria-hidden="true"
          />
          <div className={`text-xs uppercase tracking-wider ${isActive ? 'text-gold' : 'text-text-70'} transition-colors duration-default`}>
            {label}
          </div>
        </button>
      </div>
    );
  }, [activeSection, variantSettings, scrollToSection]);

  // Desktop navigation link
  const NavLink = useCallback(({ id, label }: { id: string, label: string }) => {
    const isActive = activeSection === id || expandedNavItem === id;
    
    return (
      <div 
        className="relative mb-4 flex items-center"
        data-section-id={id}
        onMouseEnter={() => handleNavItemHover(id)}
        onMouseLeave={handleNavItemLeave}
      >
        <div 
          className={`absolute left-0 top-1/2 -translate-y-1/2 h-px transition-all duration-default ${isActive ? 'bg-gold' : 'bg-gold-50'}`}
          style={{
            width: isActive ? `${variantSettings.navIndicatorMax}px` : `${variantSettings.navIndicatorMin}px`,
          }}
          aria-hidden="true"
        />
        <button 
          className={`relative block py-2 pl-10 text-sm uppercase tracking-wider bg-transparent border-none text-left outline-none cursor-pointer w-fit transition-all duration-default ${isActive ? 'text-gold translate-x-3' : 'text-text-70'}`}
          aria-current={activeSection === id ? 'true' : 'false'}
          onClick={() => scrollToSection(id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              scrollToSection(id);
            }
          }}
        >
          {label}
        </button>
      </div>
    );
  }, [
    activeSection, 
    expandedNavItem, 
    handleNavItemHover, 
    handleNavItemLeave, 
    variantSettings,
    scrollToSection
  ]);

  const variantClass = variant === 'premium' 
    ? 'gold-premium' 
    : (variant === 'minimal' ? 'gold-minimal' : 'gold-standard');

  return (
    <>
      {/* Mobile Navigation */}
      {isMobile && (
        <nav
          ref={mobileNavRef}
          className={`fixed top-0 left-0 w-full z-overlay py-3 px-4 flex justify-around items-center backdrop-blur-md bg-surface-panel transition-all duration-default ${mobileNavVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}
          data-ec-section="mobile-navigation"
          aria-label="Section navigation"
        >
          {sections.map((section) => (
            <MobileNavItem 
              key={section.id} 
              id={section.id} 
              label={section.title || section.id} 
            />
          ))}
        </nav>
      )}
      
      {/* Main Container */}
      <motion.div 
        ref={containerRef}
        className={`flex w-full max-w-[1300px] mx-auto relative gpu-accelerated ${
          isMobile ? 'flex-col pt-20' : 'flex-row pt-0 min-h-[70vh]'
        } ${variantClass} ${className}`}
        style={style}
        initial={{ 
          opacity: disableAnimations.includes('entrance') ? 1 : 0, 
          y: disableAnimations.includes('entrance') ? 0 : (animationConfig?.initialY ?? 30) 
        }}
        animate={controls}
        data-ec-component="element-card"
        role="region"
        aria-label="Element Card"
      >
        {/* Left Sidebar - Desktop only */}
        {!isMobile && (
          <div 
            ref={sidebarWrapperRef}
            className="relative"
            style={{ width: `${layoutValues.sidebarWidth}%` }}
            data-ec-section="sidebar-wrapper"
          >
            {/* Profile Sidebar */}
            <div 
              ref={sidebarRef}
              className="py-12 pr-8 flex flex-col w-full relative top-0"
              data-ec-section="sidebar"
            >
              {/* Profile Information */}
              <div className="mb-8 pl-1">
                <h1 className="font-heading font-light tracking-widest mb-2 text-5xl text-gold">
                  {profile?.name}
                </h1>
                
                <h2 className="font-body font-light tracking-wider mb-8 italic text-xl text-gold-70">
                  {profile?.role}
                </h2>
                
                {profile?.tagline && (
                  <p className="leading-relaxed mb-12 font-light text-base w-11/12 body-text">
                    {profile?.tagline}
                  </p>
                )}
              </div>
              
              {/* Navigation Links */}
              <nav 
                ref={navLinksRef}
                className="mt-12"
                data-ec-section="navigation"
                aria-label="Section navigation"
              >
                {sections.map((section) => (
                  <NavLink 
                    key={section.id} 
                    id={section.id} 
                    label={section.title || section.id} 
                  />
                ))}
              </nav>
            </div>
          </div>
        )}
        
        {/* Mobile Profile Info */}
        {isMobile && (
          <div className="mb-8 text-center w-full">
            <h1 className="font-heading font-light tracking-widest mb-2 text-4xl text-gold">
              {profile?.name}
            </h1>
            
            <h2 className="font-body font-light tracking-wider mb-8 italic text-lg text-gold-70">
              {profile?.role}
            </h2>
            
            {profile?.tagline && (
              <p className="leading-relaxed mb-12 font-light text-base w-full body-text">
                {profile?.tagline}
              </p>
            )}
          </div>
        )}
        
        {/* Content Section */}
        <main 
          ref={contentRef}
          className={isMobile ? 'w-full px-6 py-8' : 'pt-12 pb-8 content-section'}
          style={{
            width: isMobile ? '100%' : `${layoutValues.contentWidth}%`,
            paddingLeft: isMobile ? undefined : `${layoutValues.contentPadding}rem`,
            marginLeft: isMobile ? undefined : 'auto',
          }}
          data-ec-section="content"
        >
          {/* Render Sections */}
          {sections.map((section: Section, index: number) => (
            <section 
              key={section.id}
              ref={sectionRefs[index]}
              className="mb-12"
              id={section.id}
              data-section-id={section.id}
              style={{ scrollMarginTop: isMobile ? '80px' : '2rem' }}
              data-ec-section={`content-${section.id}`}
              aria-labelledby={`heading-${section.id}`}
            >
              {section.title && (
                <h3 className="text-2xl font-heading font-light mb-4 heading-gold" id={`heading-${section.id}`}>
                  {section.title}
                </h3>
              )}
              
              {/* Section Content */}
              {getSectionContent(section.content)}
              
              {/* Stats in first section */}
              {index === 0 && renderStats}
            </section>
          ))}
        </main>
      </motion.div>
    </>
  );
};

// Pre-configured variants
export const MinimalCard: React.FC<Omit<ElementCardProps, 'variant'>> = (props) => (
  <ElementCard {...props} variant="minimal" />
);

export const StandardCard: React.FC<Omit<ElementCardProps, 'variant'>> = (props) => (
  <ElementCard {...props} variant="standard" />
);

export const PremiumCard: React.FC<Omit<ElementCardProps, 'variant'>> = (props) => (
  <ElementCard {...props} variant="premium" />
);

export default ElementCard;