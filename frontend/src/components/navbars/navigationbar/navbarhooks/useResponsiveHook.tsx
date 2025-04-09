import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Hook for managing responsive navigation behavior
 * Handles mobile detection, scroll-based visibility, mobile menu toggling,
 * and body scroll locking when the mobile menu is open
 * 
 * @param mobileBreakpoint - Width threshold to switch to mobile view (in pixels)
 * @param hideOnScroll - Whether to hide navigation bar when scrolling down
 * @param scrollThreshold - Minimum scroll distance required to hide/show the navigation
 */
export function useResponsiveNavigation(
  mobileBreakpoint: number, 
  hideOnScroll: boolean, 
  scrollThreshold: number
) {
  const [isClient, setIsClient] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const scrollPositionRef = useRef(0);

  // Initialize and set up resize event listener
  useEffect(() => {
    setIsClient(true);
    if (typeof window === 'undefined') return;
    
    setPrevScrollPos(window.scrollY);
    
    const checkMobileView = () => {
      const currentlyMobile = window.innerWidth <= mobileBreakpoint;
      setIsMobileView(currentlyMobile);
      
      // Close menu on resize to desktop
      if (!currentlyMobile && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, [mobileBreakpoint, isMobileMenuOpen]);

  // Mobile menu toggle handler
  const toggleMobileMenu = useCallback(() => {
    if (!isMobileView) return;
    setIsMobileMenuOpen(prev => !prev);
  }, [isMobileView]);

  // Handle scroll-based visibility
  useEffect(() => {
    if (!isClient || !hideOnScroll || typeof window === 'undefined') {
      setVisible(true); // Ensure visible if not hiding or SSR
      return;
    }
    
    let frameId: number | null = null;
    
    const handleScroll = () => {
      if (frameId) cancelAnimationFrame(frameId);
      
      frameId = requestAnimationFrame(() => {
        const currentScrollPos = window.scrollY;
        const scrollingUp = prevScrollPos > currentScrollPos;
        const atTop = currentScrollPos < 10;
        const significantChange = Math.abs(currentScrollPos - prevScrollPos) > scrollThreshold;

        if (atTop || (scrollingUp && significantChange)) {
          setVisible(true);
        } else if (!scrollingUp && significantChange && !isMobileMenuOpen) {
          setVisible(false);
        }
        
        setPrevScrollPos(currentScrollPos);
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isClient, prevScrollPos, isMobileMenuOpen, hideOnScroll, scrollThreshold]);

  // Handle body scroll locking for mobile menu
  useEffect(() => {
    if (!isClient || typeof document === 'undefined') return;
    
    const scrollRef = scrollPositionRef;
    let scrollbarWidth = 0;
    const body = document.body;
    const html = document.documentElement;

    if (isMobileMenuOpen && isMobileView) {
      // Lock scrolling when mobile menu is open
      const currentScrollPos = window.pageYOffset || html.scrollTop;
      scrollRef.current = currentScrollPos;
      scrollbarWidth = window.innerWidth - html.clientWidth;
      
      // Lock HTML
      html.style.overflow = 'hidden';
      html.style.paddingRight = `${scrollbarWidth}px`;
      
      // Lock body
      body.style.overflow = 'hidden';
      body.style.paddingRight = `${scrollbarWidth}px`;
      body.style.touchAction = 'none';
      body.style.position = 'fixed';
      body.style.width = '100%';
      body.style.top = `-${currentScrollPos}px`;
    } else {
      // Unlock scrolling when mobile menu is closed
      // Only unlock if it was locked by this effect
      if (html.style.overflow === 'hidden') {
        html.style.overflow = '';
        html.style.paddingRight = '';
      }
      
      if (body.style.position === 'fixed') {
        body.style.overflow = '';
        body.style.paddingRight = '';
        body.style.touchAction = '';
        body.style.position = '';
        body.style.width = '';
        body.style.top = '';
        
        // Restore scroll position
        requestAnimationFrame(() => { 
          window.scrollTo(0, scrollRef.current); 
        });
      }
    }

    // Cleanup function
    return () => {
      if (html.style.overflow === 'hidden') {
        html.style.overflow = '';
        html.style.paddingRight = '';
      }
      
      if (body.style.position === 'fixed') {
        body.style.overflow = '';
        body.style.paddingRight = '';
        body.style.touchAction = '';
        body.style.position = '';
        body.style.width = '';
        body.style.top = '';
        
        // Restore scroll on cleanup IF it was locked
        window.scrollTo(0, scrollRef.current);
      }
    };
  }, [isMobileMenuOpen, isMobileView, isClient]);

  return { 
    isClient, 
    isMobileView, 
    isMobileMenuOpen, 
    visible, 
    toggleMobileMenu 
  };
}

export default useResponsiveNavigation;