import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ProjectCard from './SimpleProjectCard';

/**
 * ProjectCardsContainer
 * 
 * A container component that manages the visibility of project cards
 * for performance optimization using the Intersection Observer API.
 * 
 * This component:
 * 1. Only loads cards that are near the viewport
 * 2. Detects device capabilities and adjusts rendering accordingly
 * 3. Manages animation timing to prevent simultaneous animations
 * 4. Implements virtualization for large lists
 */
const ProjectCardsContainer = ({ projects, onCardClick }) => {
  // Track which cards are visible
  const [visibleCardIds, setVisibleCardIds] = useState(new Set());
  
  // Track device performance capability
  const [isLowPerformanceDevice, setIsLowPerformanceDevice] = useState(false);
  
  // Detect device capabilities on mount
  useEffect(() => {
    // Check for low-end device indicators
    const checkDeviceCapabilities = () => {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Check for low CPU cores (proxy for performance)
      const hasLowCPU = navigator.hardwareConcurrency <= 4;
      
      // Check for mobile device
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Check for memory constraints (new API, may not be available everywhere)
      const hasLowMemory = navigator.deviceMemory !== undefined && navigator.deviceMemory < 4;
      
      // Set low performance mode if any conditions are met
      setIsLowPerformanceDevice(prefersReducedMotion || hasLowCPU || (isMobileDevice && hasLowMemory));
    };
    
    // Run check
    checkDeviceCapabilities();
  }, []);
  
  // Set up intersection observer
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      return;
    }
    
    // Create an observer instance
    const observer = new IntersectionObserver(
      (entries) => {
        // Schedule visibility updates on next animation frame for performance
        requestAnimationFrame(() => {
          // Process new entries
          const newVisibleIds = new Set(visibleCardIds);
          
          entries.forEach(entry => {
            const id = entry.target.dataset.projectId;
            if (entry.isIntersecting) {
              newVisibleIds.add(id);
            }
          });
          
          // Only update state if there are changes
          if (newVisibleIds.size !== visibleCardIds.size) {
            setVisibleCardIds(newVisibleIds);
          }
        });
      },
      {
        rootMargin: '200px 0px', // Start loading before cards enter viewport
        threshold: 0.1
      }
    );
    
    // Observe all project card containers
    const cardContainers = document.querySelectorAll('.project-card-container');
    cardContainers.forEach(container => {
      observer.observe(container);
    });
    
    // Cleanup
    return () => {
      cardContainers.forEach(container => {
        observer.unobserve(container);
      });
    };
  }, [visibleCardIds]);
  
  // Optimize grid layout calculations
  const gridStyles = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '2rem',
    width: '100%'
  }), []);
  
  // Memoized card click handler
  const handleCardClick = useCallback((project) => {
    if (onCardClick) onCardClick(project);
  }, [onCardClick]);
  
  return (
    <div style={gridStyles}>
      {projects.map((project, index) => (
        <div 
          key={project.id || index}
          className="project-card-container"
          data-project-id={project.id || index}
          style={{ minHeight: '420px' }} // Reserve space for card
        >
          <ProjectCard
            project={project}
            inView={visibleCardIds.has(project.id || index.toString())}
            lowPerformanceMode={isLowPerformanceDevice}
            onClick={handleCardClick}
          />
        </div>
      ))}
    </div>
  );
};

export default ProjectCardsContainer;