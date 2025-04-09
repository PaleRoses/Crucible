// useSidebarResponsive.ts
import { useState, useEffect, useRef } from 'react';

/**
 * Hook to manage responsive behavior and hydration for the sidebar
 * 
 * Handles:
 * - Client-side hydration
 * - Detecting mobile vs desktop
 * - Managing expanded state
 * - Managing drawer state for mobile
 * 
 * @param initiallyExpanded - Whether the sidebar should start expanded
 * @param onToggleExternal - Optional callback for external toggle handling
 * @returns Object containing state and setters for sidebar responsive behavior
 */
const useSidebarResponsive = (
  initiallyExpanded: boolean, 
  onToggleExternal: ((isExpanded: boolean) => void) | null
) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const isDrawerOpenRef = useRef(isDrawerOpen);
  const onToggleExternalRef = useRef(onToggleExternal);

  // Update refs when values change
  useEffect(() => {
    isDrawerOpenRef.current = isDrawerOpen;
  }, [isDrawerOpen]);

  useEffect(() => {
    onToggleExternalRef.current = onToggleExternal;
  }, [onToggleExternal]);

  // Handle hydration and initial state
  useEffect(() => {
    setIsHydrated(true);
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
    }
  }, []);

  // Handle resize and update mobile state
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        const currentIsMobile = window.innerWidth < 768;
        setIsMobile(currentIsMobile);

        if (!currentIsMobile && isDrawerOpenRef.current) {
          setIsDrawerOpen(false);
          if (onToggleExternalRef.current) {
            onToggleExternalRef.current(false);
          }
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isHydrated,
    isMobile,
    isExpanded,
    isDrawerOpen,
    setIsExpanded,
    setIsDrawerOpen,
    isDrawerOpenRef,
    onToggleExternalRef
  };
};

export default useSidebarResponsive;