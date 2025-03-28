'use client'
import React, { useEffect, useRef, useCallback } from 'react';
import { useLoading, LoadPriority } from './loading-core';

// Types for tracking options
export interface ResourceOptions {
  trackImages?: boolean;
  trackFonts?: boolean;
  trackScripts?: boolean;
  trackStyles?: boolean;
  trackDom?: boolean;
}

// Internal state tracking interface
interface ResourceTrackingState {
  images: boolean;
  fonts: boolean;
  scripts: boolean;
  styles: boolean;
  dom: boolean;
}

/**
 * Component that tracks the loading of page resources
 * and reports their status to the loading system
 */
export const ResourceLoader: React.FC<{
  id?: string;
  priority?: LoadPriority;
  options?: ResourceOptions;
  maxWaitTime?: number;
}> = ({
  id = 'page-resources',
  priority = 'critical',
  options = {
    trackImages: true,
    trackFonts: true,
    trackScripts: true,
    trackStyles: true,
    trackDom: true
  },
  maxWaitTime = 100
}) => {
  const { 
    registerComponent, 
    markComponentLoaded, 
    getPriorityWeight,
    isComponentLoaded 
  } = useLoading();
  
  // Extract options
  const { trackImages, trackFonts, trackScripts, trackStyles, trackDom = true } = options;
  
  // Track mounted state
  const isMountedRef = useRef(true);
  
  // Resource tracking state
  const resourcesRef = useRef<ResourceTrackingState>({
    images: false,
    fonts: false,
    scripts: false,
    styles: false,
    dom: false
  });
  
  // Safety timeouts
  const timeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});
  
  // Track if component is registered
  const isRegisteredRef = useRef(false);
  
  // Safely clear a timeout
  const clearSafetyTimeout = useCallback((key: string) => {
    if (timeoutsRef.current[key]) {
      clearTimeout(timeoutsRef.current[key]);
      delete timeoutsRef.current[key];
    }
  }, []);
  
  // Set a safety timeout
  const setSafetyTimeout = useCallback((key: string, callback: () => void, delay: number) => {
    clearSafetyTimeout(key);
    timeoutsRef.current[key] = setTimeout(() => {
      // Only call the callback if the component is still mounted
      if (isMountedRef.current) {
        callback();
        delete timeoutsRef.current[key];
      }
    }, delay);
  }, [clearSafetyTimeout]);
  
  // Helper function to safely mark a component as loaded
  const safeMarkLoaded = useCallback((componentId: string) => {
    if (isMountedRef.current && !isComponentLoaded(componentId)) {
      markComponentLoaded(componentId);
    }
  }, [isComponentLoaded, markComponentLoaded]);
  
  // Check if all resources are loaded
  const checkAllResourcesLoaded = useCallback(() => {
    const { images, fonts, scripts, styles, dom } = resourcesRef.current;
    const allTrackedResourcesLoaded = 
      (!trackImages || images) && 
      (!trackFonts || fonts) && 
      (!trackScripts || scripts) && 
      (!trackStyles || styles) && 
      (!trackDom || dom);
    
    if (allTrackedResourcesLoaded) {
      safeMarkLoaded(id);
    }
  }, [id, safeMarkLoaded, trackFonts, trackImages, trackScripts, trackStyles, trackDom]);

  // Register component and set up resource tracking
  useEffect(() => {
    // Skip if already registered
    if (isRegisteredRef.current) return;
    
    // Register main component
    const weight = getPriorityWeight(priority);
    registerComponent(id, priority, weight, []);
    isRegisteredRef.current = true;
    
    // Register subcomponents
    if (trackImages) registerComponent(`${id}-images`, priority, weight * 0.4, []);
    if (trackFonts) registerComponent(`${id}-fonts`, priority, weight * 0.2, []);
    if (trackScripts) registerComponent(`${id}-scripts`, priority, weight * 0.3, []);
    if (trackStyles) registerComponent(`${id}-styles`, priority, weight * 0.1, []);
    if (trackDom) registerComponent(`${id}-dom`, priority, weight * 0.5, []);
    
    // Ultimate safety timeout
    setSafetyTimeout('ultimate', () => {
      // Mark all resources as loaded
      if (trackImages && !resourcesRef.current.images) {
        safeMarkLoaded(`${id}-images`);
        resourcesRef.current.images = true;
      }
      
      if (trackFonts && !resourcesRef.current.fonts) {
        safeMarkLoaded(`${id}-fonts`);
        resourcesRef.current.fonts = true;
      }
      
      if (trackScripts && !resourcesRef.current.scripts) {
        safeMarkLoaded(`${id}-scripts`);
        resourcesRef.current.scripts = true;
      }
      
      if (trackStyles && !resourcesRef.current.styles) {
        safeMarkLoaded(`${id}-styles`);
        resourcesRef.current.styles = true;
      }
      
      if (trackDom && !resourcesRef.current.dom) {
        safeMarkLoaded(`${id}-dom`);
        resourcesRef.current.dom = true;
      }
      
      // Mark main component as loaded
      safeMarkLoaded(id);
    }, maxWaitTime);
    
    // Return cleanup function
    return () => {
      // First mark component as unmounted
      isMountedRef.current = false;
      
      // Copy the current timeouts to avoid stale ref issue
      const currentTimeouts = { ...timeoutsRef.current };
      
      // Clear all timeouts directly without using clearSafetyTimeout
      Object.values(currentTimeouts).forEach(timeout => {
        clearTimeout(timeout);
      });
      
      // Clear the timeouts object
      timeoutsRef.current = {};
    };
  }, [
    id, priority, registerComponent, getPriorityWeight, 
    safeMarkLoaded, trackImages, trackFonts, trackScripts, 
    trackStyles, trackDom, maxWaitTime, setSafetyTimeout
  ]);

  // TRACK DOM LOADING
  useEffect(() => {
    if (!trackDom) return;
    
    const trackDocumentReady = () => {
      if (document.readyState === 'interactive' || document.readyState === 'complete') {
        safeMarkLoaded(`${id}-dom`);
        resourcesRef.current.dom = true;
        checkAllResourcesLoaded();
      }
    };
    
    // Check initial state
    trackDocumentReady();
    
    // Add event listener
    document.addEventListener('DOMContentLoaded', trackDocumentReady);
    
    // Handle already complete case
    if (document.readyState === 'complete') {
      trackDocumentReady();
    }
    
    // Safety timeout
    setSafetyTimeout('dom', () => {
      if (!resourcesRef.current.dom) {
        safeMarkLoaded(`${id}-dom`);
        resourcesRef.current.dom = true;
        checkAllResourcesLoaded();
      }
    }, maxWaitTime * 0.3);
    
    return () => {
      document.removeEventListener('DOMContentLoaded', trackDocumentReady);
      clearSafetyTimeout('dom');
    };
  }, [id, trackDom, safeMarkLoaded, checkAllResourcesLoaded, maxWaitTime, setSafetyTimeout, clearSafetyTimeout]);

  // TRACK IMAGE LOADING
  useEffect(() => {
    if (!trackImages) return;
    
    const markImagesLoaded = () => {
      safeMarkLoaded(`${id}-images`);
      resourcesRef.current.images = true;
      checkAllResourcesLoaded();
    };
    
    try {
      // Get all images
      const images = Array.from(document.images);
      
      if (images.length === 0) {
        markImagesLoaded();
        return;
      }
      
      let loadedCount = 0;
      const totalImages = images.length;
      
      const handleImageLoad = () => {
        loadedCount++;
        if (loadedCount >= totalImages) {
          markImagesLoaded();
        }
      };
      
      // Check initial state and attach listeners
      images.forEach(img => {
        if (img.complete) {
          loadedCount++;
        } else {
          img.addEventListener('load', handleImageLoad, { once: true });
          img.addEventListener('error', handleImageLoad, { once: true });
        }
      });
      
      // If all images were already complete
      if (loadedCount >= totalImages) {
        markImagesLoaded();
      }
      
      // Safety timeout
      setSafetyTimeout('images', () => {
        if (!resourcesRef.current.images) {
          markImagesLoaded();
        }
      }, maxWaitTime * 0.7);
      
      return () => {
        clearSafetyTimeout('images');
        images.forEach(img => {
          img.removeEventListener('load', handleImageLoad);
          img.removeEventListener('error', handleImageLoad);
        });
      };
    } catch (error) {
      console.warn('[ResourceLoader] Error tracking images:', error);
      markImagesLoaded(); // Fail gracefully
      return undefined;
    }
  }, [id, trackImages, safeMarkLoaded, checkAllResourcesLoaded, maxWaitTime, setSafetyTimeout, clearSafetyTimeout]);

  // TRACK FONT LOADING
  useEffect(() => {
    if (!trackFonts) return;
    
    const markFontsLoaded = () => {
      safeMarkLoaded(`${id}-fonts`);
      resourcesRef.current.fonts = true;
      checkAllResourcesLoaded();
    };
    
    try {
      if ('fonts' in document && document.fonts) {
        // Check if fonts have already loaded
        if (document.fonts.status === 'loaded') {
          markFontsLoaded();
          return;
        }
        
        // Wait for fonts to be ready
        document.fonts.ready.then(() => {
          if (isMountedRef.current && !resourcesRef.current.fonts) {
            markFontsLoaded();
          }
        }).catch(() => {
          if (isMountedRef.current && !resourcesRef.current.fonts) {
            markFontsLoaded();
          }
        });
        
        // Add event listener if available
        if ('addEventListener' in document.fonts) {
          document.fonts.addEventListener('loadingdone', () => {
            if (isMountedRef.current && !resourcesRef.current.fonts) {
              markFontsLoaded();
            }
          });
        }
      } else {
        // For browsers without Font Loading API, mark as loaded
        markFontsLoaded();
      }
      
      // Safety timeout
      setSafetyTimeout('fonts', () => {
        if (!resourcesRef.current.fonts) {
          markFontsLoaded();
        }
      }, maxWaitTime * 0.5);
      
      return () => {
        clearSafetyTimeout('fonts');
      };
    } catch (error) {
      console.warn('[ResourceLoader] Error tracking fonts:', error);
      markFontsLoaded(); // Fail gracefully
      return undefined;
    }
  }, [id, trackFonts, safeMarkLoaded, checkAllResourcesLoaded, maxWaitTime, setSafetyTimeout, clearSafetyTimeout]);

  // TRACK SCRIPT LOADING
  useEffect(() => {
    if (!trackScripts) return;
    
    const markScriptsLoaded = () => {
      safeMarkLoaded(`${id}-scripts`);
      resourcesRef.current.scripts = true;
      checkAllResourcesLoaded();
    };
    
    try {
      // Find all script elements
      const scripts = Array.from(document.querySelectorAll('script'));
      
      if (scripts.length === 0) {
        markScriptsLoaded();
        return;
      }
      
      let loadedCount = 0;
      const totalScripts = scripts.length;
      
      const handleScriptLoad = () => {
        loadedCount++;
        if (loadedCount >= totalScripts) {
          markScriptsLoaded();
        }
      };
      
      // Check existing scripts
      scripts.forEach(script => {
        if (!script.hasAttribute('src') || script.hasAttribute('async') || script.hasAttribute('defer')) {
          // Inline scripts, async, or defer scripts are counted as loaded immediately
          loadedCount++;
        } else {
          // External synchronous scripts: wait for load
          script.addEventListener('load', handleScriptLoad, { once: true });
          script.addEventListener('error', handleScriptLoad, { once: true });
        }
      });
      
      // If all scripts are already loaded
      if (loadedCount >= totalScripts) {
        markScriptsLoaded();
      }
      
      // Safety timeout
      setSafetyTimeout('scripts', () => {
        if (!resourcesRef.current.scripts) {
          markScriptsLoaded();
        }
      }, maxWaitTime * 0.4);
      
      return () => {
        clearSafetyTimeout('scripts');
        scripts.forEach(script => {
          if (script.hasAttribute('src') && !script.hasAttribute('async') && !script.hasAttribute('defer')) {
            script.removeEventListener('load', handleScriptLoad);
            script.removeEventListener('error', handleScriptLoad);
          }
        });
      };
    } catch (error) {
      console.warn('[ResourceLoader] Error tracking scripts:', error);
      markScriptsLoaded(); // Fail gracefully
      return undefined;
    }
  }, [id, trackScripts, safeMarkLoaded, checkAllResourcesLoaded, maxWaitTime, setSafetyTimeout, clearSafetyTimeout]);

  // TRACK STYLESHEET LOADING
  useEffect(() => {
    if (!trackStyles) return;
    
    const markStylesLoaded = () => {
      safeMarkLoaded(`${id}-styles`);
      resourcesRef.current.styles = true;
      checkAllResourcesLoaded();
    };
    
    try {
      // Find all stylesheet links
      const styleLinks = Array.from(
        document.querySelectorAll('link[rel="stylesheet"]')
      );
      
      // Get all style elements too
      const styleElements = Array.from(document.querySelectorAll('style'));
      
      if (styleLinks.length === 0 && styleElements.length === 0) {
        markStylesLoaded();
        return;
      }
      
      let loadedCount = styleElements.length; // Style elements are always loaded
      const totalStylesCount = styleLinks.length + styleElements.length;
      
      const handleStyleLoad = () => {
        loadedCount++;
        if (loadedCount >= totalStylesCount) {
          markStylesLoaded();
        }
      };
      
      // Check loaded state of stylesheets
      styleLinks.forEach(link => {
        // Most reliable cross-browser check for stylesheet loaded state
        if ((link as HTMLLinkElement).sheet) {
          loadedCount++;
        } else {
          link.addEventListener('load', handleStyleLoad, { once: true });
          link.addEventListener('error', handleStyleLoad, { once: true });
        }
      });
      
      // If all styles are already loaded
      if (loadedCount >= totalStylesCount) {
        markStylesLoaded();
      }
      
      // Safety timeout
      setSafetyTimeout('styles', () => {
        if (!resourcesRef.current.styles) {
          markStylesLoaded();
        }
      }, maxWaitTime * 0.3);
      
      return () => {
        clearSafetyTimeout('styles');
        styleLinks.forEach(link => {
          link.removeEventListener('load', handleStyleLoad);
          link.removeEventListener('error', handleStyleLoad);
        });
      };
    } catch (error) {
      console.warn('[ResourceLoader] Error tracking stylesheets:', error);
      markStylesLoaded(); // Fail gracefully
      return undefined;
    }
  }, [id, trackStyles, safeMarkLoaded, checkAllResourcesLoaded, maxWaitTime, setSafetyTimeout, clearSafetyTimeout]);

  // PAGE LOADED EVENT
  useEffect(() => {
    const handlePageLoad = () => {
      // Mark all resources as loaded when the window load event fires
      if (trackImages && !resourcesRef.current.images) {
        safeMarkLoaded(`${id}-images`);
        resourcesRef.current.images = true;
      }
      
      if (trackFonts && !resourcesRef.current.fonts) {
        safeMarkLoaded(`${id}-fonts`);
        resourcesRef.current.fonts = true;
      }
      
      if (trackScripts && !resourcesRef.current.scripts) {
        safeMarkLoaded(`${id}-scripts`);
        resourcesRef.current.scripts = true;
      }
      
      if (trackStyles && !resourcesRef.current.styles) {
        safeMarkLoaded(`${id}-styles`);
        resourcesRef.current.styles = true;
      }
      
      if (trackDom && !resourcesRef.current.dom) {
        safeMarkLoaded(`${id}-dom`);
        resourcesRef.current.dom = true;
      }
      
      safeMarkLoaded(id);
    };
    
    window.addEventListener('load', handlePageLoad);
    
    return () => {
      window.removeEventListener('load', handlePageLoad);
    };
  }, [
    id, 
    trackImages, 
    trackFonts, 
    trackScripts, 
    trackStyles, 
    trackDom, 
    safeMarkLoaded
  ]);

  // No UI output - this component only does tracking
  return null;
};