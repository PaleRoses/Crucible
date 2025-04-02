'use client';

import React, { useState, useEffect } from 'react';
import '../../styled-system/css';  // Base styles from Panda
import './styles/global.css';
import { StyledComponentsRegistry } from '../lib/registry';
import Background from '../components/layout/Layout';
import NavLayout from '../components/layout/NavLayout';
import Script from 'next/script';
import { ThemeProvider, ThemeScript } from './styles/themes/ThemeContext';
import { ThemeSelector } from '../components/ui/ThemeSelector';

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

// Client-side only ThemeSelector wrapper
function ClientOnlyThemeSelector() {
  // Track if component is mounted (client-side only)
  const [isMounted, setIsMounted] = useState(false);
  
  // Only run after hydration is complete
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Don't render anything during SSR or initial hydration
  if (!isMounted) {
    return null;
  }
  
  // Only render on client after hydration
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 transition-opacity duration-300">
      <ThemeSelector />
    </div>
  );
}

export default function RootLayout({ children }: RootLayoutProps) {
  // Handle Adobe fonts loading
  const handleFontsLoad = () => {
    try {
      // Use a proper type declaration for the global Typekit object
      const Typekit = window.Typekit;
      if (Typekit) {
        Typekit.load({ async: false });
      }
    } catch (e) {
      console.error('Error loading Adobe fonts:', e);
    }
  };

  return (
    <html lang="en">
      <head>
        {/* Theme script for FOUC prevention - runs before React hydration */}
        <ThemeScript />
        
        {/* Preload Adobe Fonts with high priority */}
        <link
          rel="preload"
          href="https://use.typekit.net/hcw7ssx.css"
          as="style"
        />
        {/* Preload Adobe Fonts CSS */}
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
        
        {/* Load Adobe Fonts JS early with beforeInteractive strategy */}
        <Script
          id="adobe-fonts"
          strategy="beforeInteractive"
          src="https://use.typekit.net/hcw7ssx.js"
          onLoad={handleFontsLoad}
        />
        
        {/* Preconnect to Adobe Fonts for better performance */}
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
        
        {/* Critical CSS to prevent layout shift during font loading */}
        <style dangerouslySetInnerHTML={{ __html: `
          /* Font swap behavior to prevent FOUC */
          @font-face {
            font-family: 'adobe-caslon-pro';
            font-display: swap;
          }
          
          @font-face {
            font-family: 'haboro-soft-condensed';
            font-display: swap;
          }
          
          @font-face {
            font-family: 'ibm-plex-mono';
            font-display: swap;
          }
          
          /* Size-adjusted fallback fonts to minimize layout shift */
          @font-face {
            font-family: 'adobe-caslon-pro-fallback';
            src: local('Georgia');
            size-adjust: 105%;
            ascent-override: 95%;
            descent-override: 22%;
            line-gap-override: 0%;
          }
          
          @font-face {
            font-family: 'haboro-soft-condensed-fallback';
            src: local('Avenir'), local('Helvetica Neue'), local('Helvetica'), local('Arial');
            size-adjust: 100%;
            ascent-override: 90%;
            descent-override: 25%;
            line-gap-override: 0%;
          }
          
          /* Set font loading visibility */
          html {
            visibility: visible;
            opacity: 1;
          }
          
          /* Basic styling to avoid additional layout shifts */
          body {
            margin: 0;
            padding: 0;
            font-family: 'adobe-caslon-pro-fallback', 'adobe-caslon-pro', Georgia, serif;
          }
          
          /* Navbar critical styling to ensure consistent rendering */
          nav {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            z-index: 100;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            backdrop-filter: blur(8px);
            padding: 0 1.5rem;
          }
          
          /* Custom colors from original theme */
          :root {
            --font-heading: 'haboro-soft-condensed', 'Avenir Next', sans-serif;
          }
          
          /* Mobile menu styling */
          @media (max-width: 768px) {
            button[aria-controls="mobile-menu"] {
              display: flex !important;
            }
            
            div[id="mobile-menu"] {
              display: block !important;
            }
          }
        `}} />
      </head>
      <body>
        <StyledComponentsRegistry>
          {/* Theme provider manages theme state */}
          <ThemeProvider>
            <div className="relative min-h-screen">
              <Background />
              
              {/* Navigation component */}
              <NavLayout />
              
              {/* Client-side only ThemeSelector */}
              <ThemeSelector />
              
              {/*
                Main content area
                - Added padding-top to account for the fixed navigation
                - Using transition for smooth appearance
              */}
              <main className="pt-[100px] animate-fadeIn">
                {children}
              </main>
            </div>
          </ThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}