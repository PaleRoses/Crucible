'use client'

import React, { useEffect } from 'react';
import './styles/global.css';
import Background from '../components/layout/Layout';
import NavigationBar from '../components/navbars/primarynavbar/NavigationBar';

/**
 * Root Layout component for Next.js App Router
 * Must include <html> and <body> tags
 */
interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  // Font loading with WebFontLoader
  useEffect(() => {
    import('webfontloader').then((WebFontModule) => {
      const WebFont = WebFontModule.default || WebFontModule;
      WebFont.load({
        typekit: {
          id: 'hcw7ssx'
        },
        active: function() {
          console.log('Adobe fonts successfully loaded');
        },
        inactive: function() {
          console.log('Adobe fonts failed to load');
        }
      });
    }).catch(err => {
      console.error('Error loading WebFontLoader:', err);
    });
  }, []);
  
  return (
    <html lang="en">
      <body>
        <div className="relative min-h-screen">
          {/* Background component persists across page transitions */}
          <Background />
          
          {/* Navigation bar fixed at the top */}
          <NavigationBar />
          
          {/* Main content area with top padding to accommodate fixed navbar */}
          <main className="transition-opacity duration-300 ease-in-out pt-[100px]">
            {children}
          </main>
          
          <style jsx>{`
            /* Transition animations */
            .fade-enter {
              opacity: 0;
            }
            
            .fade-enter-active {
              opacity: 1;
              transition: opacity 300ms ease-in;
            }
            
            .fade-exit {
              opacity: 1;
            }
            
            .fade-exit-active {
              opacity: 0;
              transition: opacity 300ms ease-out;
            }
          `}</style>
        </div>
      </body>
    </html>
  );
}