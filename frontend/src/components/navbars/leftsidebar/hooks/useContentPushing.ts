// useContentPushing.ts
import { useRef, useEffect } from 'react';

/**
 * Hook to manage content pushing functionality
 * 
 * Handles pushing the main content to make room for the sidebar
 * in desktop mode, with appropriate transitions.
 * 
 * @param pushContent - Whether content pushing is enabled
 * @param isHydrated - Whether the component has been hydrated on client-side
 * @param isMobile - Whether the current view is mobile
 * @param isExpanded - Whether the sidebar is expanded
 * @param contentSelector - CSS selector for the content element to push
 * @param expandedWidth - Width of expanded sidebar
 * @param collapsedWidth - Width of collapsed sidebar
 * @param transitionDuration - Duration of transition animation in ms
 * @returns Reference to the content element
 */
const useContentPushing = (
  pushContent: boolean,
  isHydrated: boolean,
  isMobile: boolean,
  isExpanded: boolean,
  contentSelector: string,
  expandedWidth: string,
  collapsedWidth: string,
  transitionDuration: number
) => {
  const contentRef = useRef<HTMLElement | null>(null);

  // Setup initial content pushing
  useEffect(() => {
    if (!pushContent || !isHydrated) return;

    // Find content element only once
    if (!contentRef.current) {
      try {
        const contentElement = document.querySelector<HTMLElement>(contentSelector);
        if (contentElement) {
          contentRef.current = contentElement;
        } else {
          console.warn(`[LeftSidebar] Content element not found: ${contentSelector}`);
          return;
        }
      } catch (error) {
        console.error(`[LeftSidebar] Invalid selector: ${contentSelector}`, error);
        return;
      }
    }
    
    const content = contentRef.current;
    if (!content) return;

    // Apply initial styles based on state (desktop only)
    if (!isMobile) {
      content.style.transition = 'none';
      content.style.marginLeft = isExpanded ? expandedWidth : collapsedWidth;
      
      // Add transition after initial paint to avoid animating on load
      requestAnimationFrame(() => {
        if (contentRef.current) {
          contentRef.current.style.transition = `margin-left ${transitionDuration}ms ease`;
        }
      });
    } else {
      content.style.marginLeft = '';
      content.style.transition = '';
    }
    
    // Cleanup styles on unmount
    return () => {
      if (contentRef.current) {
        contentRef.current.style.marginLeft = '';
        contentRef.current.style.transition = '';
      }
    };
  }, [
    pushContent, 
    contentSelector, 
    expandedWidth, 
    collapsedWidth, 
    transitionDuration, 
    isHydrated, 
    isMobile, 
    isExpanded
  ]);

  // Update content pushing on state change
  useEffect(() => {
    if (!pushContent || !isHydrated) return;
    
    const content = contentRef.current;
    if (!content) return;

    if (!isMobile) {
      content.style.marginLeft = isExpanded ? expandedWidth : collapsedWidth;
      
      if (!content.style.transition || !content.style.transition.includes('margin-left')) {
        content.style.transition = `margin-left ${transitionDuration}ms ease`;
      }
    } else {
      content.style.marginLeft = '';
      content.style.transition = '';
    }
  }, [
    isExpanded, 
    isMobile, 
    pushContent, 
    expandedWidth, 
    collapsedWidth, 
    transitionDuration, 
    isHydrated
  ]);

  return contentRef;
};

export default useContentPushing;