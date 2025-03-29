'use client';

import React from 'react';
import './styles/global.css';
import { StyledComponentsRegistry } from '../lib/registry';
import Background from '../components/layout/Layout';
import NavLayout from '../components/layout/ NavLayout'; // New import for the navigation component
import Script from 'next/script';

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
  return (
    <html lang="en">
      <head>
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
          onLoad={() => {
            try {
              // @ts-expect-error - Typekit is added to window by the script but not typed
              Typekit.load({ async: false });
            } catch (e) {
              console.error('Error loading Adobe fonts:', e);
            }
          }}
        />
        
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
            color: #e0e0e0;
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
            background: rgba(8, 8, 8, 0.7);
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            backdrop-filter: blur(8px);
            padding: 0 1.5rem;
          }
          
          /* Custom colors from original theme */
          :root {
            --gold: #BFAD7F;
            --gold-light: #D6C69F;
            --color-text: rgba(224, 224, 224, 0.8);
            --color-accent: var(--gold);
            --radius-small: 6px;
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
          <div className="relative min-h-screen">
            <Background />
            
            {/* Navigation component extracted to separate file */}
            <NavLayout />
            
            {/* 
              Main content area
              - Added padding-top to account for the fixed navigation
              - Transition effects for smooth page changes
            */}
            <main className="transition-opacity duration-300 ease-in-out pt-[100px]">
              {children}
            </main>
          </div>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}