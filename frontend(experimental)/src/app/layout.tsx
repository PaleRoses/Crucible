'use client'

import React from 'react';
import './styles/global.css'; // Corrected import path with specific file
import Background from '../components/layout/Layout';

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
      <body>
        <div className="relative min-h-screen">
          {/* Background component persists across page transitions */}
          <Background />
          
          {/* Main content area where your route components are rendered */}
          <main className="transition-opacity duration-300 ease-in-out">
            {children}
          </main>
          
          {/*
            CSS classes for transitions - these can be applied dynamically
            with a state management library or transition component
          */}
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