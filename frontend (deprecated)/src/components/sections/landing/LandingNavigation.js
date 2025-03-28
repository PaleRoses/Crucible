import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './landingNavigation.css';

const LandingNavigation = ({ 
  mainSections,
  activeSection,
  expandedSection,
  expandedSubsection,
  animatingLayout,
  setActiveSection,
  setExpandedSection,
  setExpandedSubsection,
  setAnimatingLayout
}) => {
  const navigate = useNavigate();
  const animationTimeoutRef = useRef(null);
  const sectionRefs = useRef({});
  const [isAnimating, setIsAnimating] = useState(false);

  // Clear any pending timeouts to prevent animation conflicts
  const clearPendingAnimations = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  }, []);

  // Navigate to section - UPDATED to use React Router
  const handleNavigate = (path, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    // Use React Router navigation
    navigate(path);
  };
  
  // Handle section expand/collapse with controlled animation
  const handleSectionClick = useCallback((sectionId, event, isExpandable) => {
    event.stopPropagation();
    
    if (!isExpandable || isAnimating) {
      return;
    }
    
    clearPendingAnimations();
    setIsAnimating(true);
    
    // Use a single setState callback to avoid re-renders
    if (expandedSection === sectionId) {
      // If clicking on already expanded section, collapse it
      setTimeout(() => {
        setExpandedSection(null);
        setExpandedSubsection(null);
        
        // Allow time for exit animations before releasing animation lock
        animationTimeoutRef.current = setTimeout(() => {
          setIsAnimating(false);
        }, 450);
      }, 10);
    } else {
      // Otherwise expand this section and collapse any expanded subsection
      setTimeout(() => {
        setExpandedSection(sectionId);
        setExpandedSubsection(null);
        
        // Allow time for enter animations before releasing animation lock
        animationTimeoutRef.current = setTimeout(() => {
          setIsAnimating(false);
        }, 450);
      }, 10);
    }
  }, [expandedSection, isAnimating, clearPendingAnimations, setExpandedSection, setExpandedSubsection]);
  
  // Handle subsection expand/collapse - using same approach as sections
  const handleSubsectionClick = useCallback((subsectionId, event, isExpandable) => {
    event.stopPropagation();
    
    if (!isExpandable || isAnimating) {
      return;
    }
    
    clearPendingAnimations();
    setIsAnimating(true);
    
    // Use a single setState callback to avoid re-renders
    if (expandedSubsection === subsectionId) {
      // If clicking on already expanded subsection, collapse it
      setTimeout(() => {
        setExpandedSubsection(null);
        
        // Allow time for exit animations before releasing animation lock
        animationTimeoutRef.current = setTimeout(() => {
          setIsAnimating(false);
        }, 450);
      }, 10);
    } else {
      // Otherwise expand this subsection
      setTimeout(() => {
        setExpandedSubsection(subsectionId);
        
        // Allow time for enter animations before releasing animation lock
        animationTimeoutRef.current = setTimeout(() => {
          setIsAnimating(false);
        }, 450);
      }, 10);
    }
  }, [expandedSubsection, isAnimating, clearPendingAnimations, setExpandedSubsection]);

  // Render SVG icons for main sections
  const renderIcon = (iconType) => {
    switch(iconType) {
      case 'circles':
        return (
          <div className="icon-container">
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="21" cy="21" r="14" stroke="#A08E61" strokeWidth="1.5" opacity="0.9" />
              <circle cx="16" cy="21" r="9" stroke="#A08E61" strokeWidth="1.5" opacity="0.7" />
              <circle cx="26" cy="21" r="9" stroke="#A08E61" strokeWidth="1.5" opacity="0.7" />
            </svg>
          </div>
        );
      case 'triangle':
        return (
          <div className="icon-container">
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 7L35 32H7L21 7Z" stroke="#A08E61" strokeWidth="1.5" opacity="0.9" />
            </svg>
          </div>
        );
      case 'targetCircle':
        return (
          <div className="icon-container">
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="21" cy="21" r="14" stroke="#A08E61" strokeWidth="1.5" opacity="0.9" />
              <circle cx="21" cy="21" r="5" fill="#A08E61" opacity="0.7" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  // Animation variants for container and children
  const containerVariants = {
    hidden: { 
      opacity: 0, 
      height: 0, 
      overflow: 'hidden' 
    },
    visible: { 
      opacity: 1, 
      height: 'auto', 
      overflow: 'visible',
      transition: {
        height: { duration: 0.3, ease: "easeOut" },
        opacity: { duration: 0.3, ease: "easeOut" },
        overflow: { delay: 0.25 },
        staggerChildren: 0.07,
        delayChildren: 0.05
      }
    },
    exit: { 
      opacity: 0, 
      height: 0, 
      overflow: 'hidden',
      transition: {
        height: { duration: 0.2, ease: "easeIn" },
        opacity: { duration: 0.2, ease: "easeIn" }
      }
    }
  };

  // Animation variants for individual items
  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.25, ease: "easeOut" }
    }
  };
  
  return (
    <div className={`sections-container ${isAnimating ? 'animating' : ''}`}>
      {mainSections.map((section, index) => (
        <motion.div 
          key={section.id} 
          className={`section-wrapper ${expandedSection === section.id ? 'expanded-section' : ''}`}
          ref={el => sectionRefs.current[section.id] = el}
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            duration: 0.4, 
            ease: "easeInOut",
            delay: index * 0.15 + 0.3
          }}
        >
          <div 
            className={`section-row ${activeSection === section.id ? 'active' : ''} ${expandedSection === section.id ? 'expanded' : ''}`}
            onMouseEnter={() => setActiveSection(section.id)}
            onMouseLeave={() => setActiveSection(null)}
            onClick={(e) => {
              if (section.expandable) {
                handleSectionClick(section.id, e, section.expandable);
              } else {
                handleNavigate(section.path, e);
              }
            }}
            style={{ animationDelay: `${index * 0.15 + 0.3}s` }}
          >
            <div className="section-content">
              <div className="section-icon-wrapper">
                {renderIcon(section.icon)}
              </div>
              <div className="section-text">
                <h2 className="section-title">{section.title}</h2>
                <p className="section-description">{section.description}</p>
              </div>
              {section.expandable && (
                <div className={`expand-indicator ${expandedSection === section.id ? 'expanded' : ''}`}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6L8 10L12 6" stroke="#A08E61" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </div>
            <div className="diagonal-cut" />
          </div>
          
          {/* Expandable Subsections */}
          {section.expandable && (
            <div className="subsections-outer-container">
              <AnimatePresence mode="wait">
                {expandedSection === section.id && (
                  <motion.div 
                    className="subsections-container"
                    key={`section-${section.id}-subsections`}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    {section.subsections.map((subsection, subIndex) => (
                      <motion.div 
                        key={subsection.id} 
                        className={`subsection-wrapper ${expandedSubsection === subsection.id ? 'expanded-subsection' : ''}`}
                        data-id={subsection.id}
                        variants={itemVariants}
                      >
                        <div 
                          className={`subsection-row ${expandedSubsection === subsection.id ? 'active' : ''}`}
                          onClick={(e) => {
                            if (subsection.expandable) {
                              handleSubsectionClick(subsection.id, e, subsection.expandable);
                            } else {
                              handleNavigate(subsection.path, e);
                            }
                          }}
                        >
                          <div className="subsection-content">
                            <h3 className="subsection-title">{subsection.title}</h3>
                            <p className="subsection-description">{subsection.description}</p>
                            {subsection.expandable && (
                              <div 
                                className={`expand-indicator small ${expandedSubsection === subsection.id ? 'expanded' : ''}`}
                              >
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M4 6L8 10L12 6" stroke="#A08E61" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Nested Subsections - Using same animation approach */}
                        {subsection.expandable && (
                          <div className="nested-subsections-outer-container">
                            <AnimatePresence mode="wait">
                              {expandedSubsection === subsection.id && (
                                <motion.div 
                                  className="nested-subsections-container"
                                  key={`subsection-${subsection.id}-nested`}
                                  variants={containerVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="exit"
                                >
                                  {subsection.subsections.map((nestedSubsection, nestedIndex) => (
                                    <motion.div 
                                      key={nestedSubsection.id}
                                      className="nested-subsection-row"
                                      onClick={(e) => handleNavigate(nestedSubsection.path, e)}
                                      variants={itemVariants}
                                    >
                                      <div className="nested-subsection-content">
                                        <h4 className="nested-subsection-title">{nestedSubsection.title}</h4>
                                        <p className="nested-subsection-description">{nestedSubsection.description}</p>
                                      </div>
                                    </motion.div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default LandingNavigation;