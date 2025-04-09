// src/components/layout/ClientLayout.tsx

'use client'; // Essential: Marks this as a Client Component

import React, { useState, useEffect, useRef } from 'react';
// Adjust these import paths based on your actual project structure
import { StyledComponentsRegistry } from '@/lib/registry';
import Background from '@/components/layout/StarBackground';
import NavLayout from '@/components/layout/NavLayout';
import { ThemeProvider } from '@/app/styles/themes/ThemeContext';
// import { ThemeSelector } from '@/components/ui/ThemeSelector'; // Uncomment if used visually here
import { SidebarProvider } from '@/contexts/SideBarContext';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  // == State Variables ==
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [isChangingRoute, setIsChangingRoute] = useState(false);

  // == Refs ==
  const contentRef = useRef<HTMLDivElement>(null);

  // == Effects ==

  // --- Font Loading useEffect ---
  useEffect(() => {
    // (Keep your exact font loading logic here - accessing document/window)
    try {
        if (document.fonts) {
            document.fonts.ready.then(() => {
            console.log("Document fonts ready."); // Added log for debugging
            setFontsLoaded(true);
            });
        }
        const typekitLoad = () => {
            if (window.Typekit) {
            try {
                console.log("Loading Typekit..."); // Added log
                window.Typekit.load({ async: true });
                // Use Typekit events if possible for more reliability
                // For now, fallback timeout
                setTimeout(() => {
                    console.log("Typekit load timeout reached."); // Added log
                    setFontsLoaded(true);
                }, 800);
            } catch (e) { console.error('Error loading Adobe fonts:', e); setFontsLoaded(true); }
            } else {
                console.log("Typekit not found, using timeout."); // Added log
                setTimeout(() => setFontsLoaded(true), 500);
            }
        };
        setTimeout(typekitLoad, 100);
        } catch (e) { console.error('Error in font loading process:', e); setFontsLoaded(true); }
  }, []);

  // --- Route Change & Content Ready useEffect ---
  useEffect(() => {
    // (Keep your exact route change listening logic here - accessing window)
    const handleRouteChangeStart = () => {
        console.log("Route change start detected."); // Added log
        setIsChangingRoute(true);
        if (contentRef.current) contentRef.current.classList.add('transitioning');
    };
    const handleRouteChangeComplete = () => {
        // Add a small delay to allow content to potentially repaint before fading in
        setTimeout(() => {
            console.log("Route change complete."); // Added log
            setIsChangingRoute(false);
            if (contentRef.current) contentRef.current.classList.remove('transitioning');
        }, 50); // Keep this delay
    };

    // Setup route change listeners (Your existing logic)
    console.log("Setting up route change listeners."); // Added log
    window.addEventListener('navigate', handleRouteChangeStart);
    window.addEventListener('navigatesuccess', handleRouteChangeComplete);
    // Add other listeners (beforeunload, Router.events fallback) if needed

    // Set content ready ONLY after fonts are loaded
    if (fontsLoaded) {
        console.log("Fonts loaded, setting content ready soon."); // Added log
        // Maybe add a slightly longer delay for content readiness if needed
        setTimeout(() => {
            console.log("Setting content ready."); // Added log
            setContentReady(true);
        }, 100); // Keep or adjust this delay
    }

    return () => {
        // Cleanup listeners (Your existing logic)
        console.log("Cleaning up route change listeners."); // Added log
        window.removeEventListener('navigate', handleRouteChangeStart);
        window.removeEventListener('navigatesuccess', handleRouteChangeComplete);
        // Add other cleanup if needed
    };
  }, [fontsLoaded]); // Dependency array is crucial


  // == JSX Structure ==
  // This is the structure previously inside <body>
  return (
    <StyledComponentsRegistry>
      <ThemeProvider>
        <SidebarProvider>
          {/* Loading overlay - depends on contentReady state */}
          <div className={`loading-overlay ${contentReady ? 'content-hidden' : 'content-visible'}`}>
            <div className="loading-spinner"></div> {/* Optional spinner */}
          </div>

          {/* Main layout container */}
          <div className="relative min-h-screen">
            {/* Background component */}
            <Background />

            {/* Persistent Navigation */}
            <div className="persistent-element">
              <NavLayout />
            </div>

            {/* Persistent Theme Selector? (Uncomment if needed) */}
            {/* <div className="persistent-element"> <ThemeSelector /> </div> */}

            {/* Main Content Area (handles transitions) */}
            <div
              ref={contentRef}
              // Apply classes based on state
              className={`main-content ${contentReady ? 'content-visible' : 'content-hidden'} ${isChangingRoute ? 'transitioning' : ''}`}
            >
              <main className="pt-[100px]">
                 {children} {/* Render the actual page content */}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </ThemeProvider>
    </StyledComponentsRegistry>
  );
}