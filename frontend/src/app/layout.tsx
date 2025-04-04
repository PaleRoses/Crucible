'use client';

import React, { useState, useEffect, useRef } from 'react';
import '../../styled-system/css';  // Base styles from Panda
import './styles/global.css';
import { StyledComponentsRegistry } from '../lib/registry';
import Background from '../components/layout/StarBackground';
import NavLayout from '../components/layout/NavLayout';
import { ThemeProvider, ThemeScript } from './styles/themes/ThemeContext';
import { ThemeSelector } from '../components/ui/ThemeSelector';

// Separate critical styles into distinct sections
const criticalStyles = `
  /* Loading overlay styles */
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--bg-color);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: opacity 0.5s ease-in-out;
  }
  
  /* Content visibility classes */
  .content-hidden {
    opacity: 0;
    visibility: hidden;
  }
  .content-visible {
    opacity: 1;
    visibility: visible;
    transition: opacity 0.5s ease-in-out;
  }
  
  /* Main content transitions - separate from navbar */
  .main-content {
    transition: opacity 300ms ease-in-out;
  }
  .main-content.transitioning {
    opacity: 0;
  }
  
  /* Persistent elements that shouldn't fade during transitions */
  .persistent-element {
    position: relative;
    z-index: 100;
    opacity: 1 !important;
    visibility: visible !important;
  }
`;

//=============================================================================
// ROOT LAYOUT COMPONENT
//=============================================================================

/**
 * Root Layout component for Next.js App Router
 * Must include <html> and <body> tags
 */
interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  // Track loading states
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [isChangingRoute, setIsChangingRoute] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Handle Adobe fonts loading properly
  useEffect(() => {
    try {
      // Create a document.fonts check for native font loading API
      if (document.fonts) {
        // Listen for when fonts are actively loading
        document.fonts.ready.then(() => {
          setFontsLoaded(true);
        });
      }
      
      // Also support Adobe Typekit for fallback
      const typekitLoad = () => {
        if (window.Typekit) {
          try {
            // Use only the async parameter as defined in the TypeKit type
            window.Typekit.load({ async: true });
            
            // Set a timeout to consider fonts loaded after a reasonable duration
            setTimeout(() => setFontsLoaded(true), 800);
          } catch (e) {
            console.error('Error loading Adobe fonts:', e);
            setFontsLoaded(true); // Continue even if fonts fail
          }
        } else {
          // If no Typekit, still mark as loaded after timeout
          setTimeout(() => setFontsLoaded(true), 500);
        }
      };
      
      // Wait a bit to ensure Typekit has loaded or fallback
      setTimeout(typekitLoad, 100);
    } catch (e) {
      console.error('Error in font loading process:', e);
      setFontsLoaded(true); // Ensure we don't block rendering if something fails
    }
  }, []);
  
  // Handle route changes for page transitions
  useEffect(() => {
    const handleRouteChangeStart = () => {
      setIsChangingRoute(true);
      if (contentRef.current) {
        contentRef.current.classList.add('transitioning');
      }
    };
    
    const handleRouteChangeComplete = () => {
      setTimeout(() => {
        setIsChangingRoute(false);
        if (contentRef.current) {
          contentRef.current.classList.remove('transitioning');
        }
      }, 50); // Short delay to ensure DOM is ready
    };
    
    // Setup route change listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleRouteChangeStart);
      
      // For App Router - use navigation events
      window.addEventListener('navigate', handleRouteChangeStart);
      window.addEventListener('navigatesuccess', handleRouteChangeComplete);
      
      // Try to use the Pages Router API as a fallback
      try {
        // Only import this for the Pages Router
        const { Router } = require('next/router');
        if (Router && Router.events) {
          Router.events.on('routeChangeStart', handleRouteChangeStart);
          Router.events.on('routeChangeComplete', handleRouteChangeComplete);
        }
      } catch (e) {
        // If this fails, we already have the navigation events as fallback
        console.log('Using navigation events for transitions');
      }
    }
    
    // Set content ready when fonts are loaded
    if (fontsLoaded) {
      setTimeout(() => {
        setContentReady(true);
      }, 100);
    }
    
    // Cleanup event listeners
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', handleRouteChangeStart);
        window.removeEventListener('navigate', handleRouteChangeStart);
        window.removeEventListener('navigatesuccess', handleRouteChangeComplete);
        
        // Clean up Pages Router events if they exist
        try {
          const { Router } = require('next/router');
          if (Router && Router.events) {
            Router.events.off('routeChangeStart', handleRouteChangeStart);
            Router.events.off('routeChangeComplete', handleRouteChangeComplete);
          }
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    };
  }, [fontsLoaded]);

  return (
    <html lang="en">
      <head>
        {/* Critical inline styles to prevent FOUC */}
        <style 
          dangerouslySetInnerHTML={{ 
            __html: criticalStyles 
          }} 
        />
        
        {/* Theme script for FOUC prevention - runs before React hydration */}
        <ThemeScript />
        
        {/* Preload Adobe Fonts with high priority */}
        <link
          rel="preload"
          href="https://use.typekit.net/hcw7ssx.css"
          as="style"
        />
        
        {/* Load Adobe Fonts directly */}
        <link
          rel="stylesheet"
          href="https://use.typekit.net/hcw7ssx.css"
        />
        
        {/* Preconnect to Adobe Fonts for better performance */}
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
      </head>
      <body>
        <StyledComponentsRegistry>
          {/* Theme provider manages theme state */}
          <ThemeProvider>
            {/* Loading overlay that shows until content is ready */}
            <div className={`loading-overlay ${contentReady ? 'content-hidden' : 'content-visible'}`}>
              {/* You can add a loading spinner here if desired */}
              <div className="loading-spinner"></div>
            </div>
            
            <div className="relative min-h-screen">
              {/* Background remains outside of transition effects */}
              <Background />
              
              {/* NavLayout completely isolated from transition effects */}
              <div className="persistent-element">
                <NavLayout />
              </div>
              
              {/* ThemeSelector also needs to be persistent */}
              <div className="persistent-element">
                <ThemeSelector />
              </div>
              
              {/* Only the main content area transitions */}
              <div 
                ref={contentRef}
                className={`main-content ${contentReady ? 'content-visible' : 'content-hidden'} ${isChangingRoute ? 'transitioning' : ''}`}
              >
                <main className="pt-[100px]">
                  {children}
                </main>
              </div>
            </div>
          </ThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}