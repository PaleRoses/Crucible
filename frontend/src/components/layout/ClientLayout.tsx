// src/components/layout/ClientLayout.tsx - Updated to use the hook

'use client';

import React from 'react'; // No longer need useState, useEffect, useRef from here
// Adjust these import paths based on your actual project structure
import { StyledComponentsRegistry } from '@/lib/registry';
import Background from '@/components/layout/StarBackground';
import NavLayout from '@/components/layout/NavLayout';
import { ThemeProvider } from '@/app/styles/themes/ThemeContext';
import { ThemeScript } from '@/app/styles/themes/ThemeContext';
import {ThemeSelector } from '@/components/ui/ThemeSelector'
// Import the SidebarProvider from your context
import { SidebarProvider } from '@/contexts/SideBarContext';

// Import the custom hook
import { useLayoutLifecycle } from './useLayoutLifecycle';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  // == Use the Custom Hook ==
  // Get all the state variables and the ref from the hook
  const {
    fontsLoaded,  // We might not need fontsLoaded directly in JSX anymore
    contentReady,
    isChangingRoute,
    contentRef,
  } = useLayoutLifecycle();

  // == JSX Structure ==
  // This structure remains the same, but uses values from the hook
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
              ref={contentRef} // Assign the ref from the hook
              // Apply classes based on state from the hook
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