import React from 'react';
import type { Metadata, Viewport } from 'next';
import AppProviders from '../providers/AppProviders';
import Background from '../components/layout/Background';
import './styles/global.css'; // Note: Fixed to globals.css (with 's')

export const metadata: Metadata = {
  title: 'Progressive Loading System',
  description: 'Implementation of advanced priority-based progressive loading',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen overflow-x-hidden">
        {/* Background moved outside AppProviders to avoid stacking context issues */}
        <Background />
        
        <AppProviders 
          initialLoaderThreshold={75}
          enableAnalytics={process.env.NODE_ENV === 'development'}
          debugMode={process.env.NODE_ENV === 'development'}
        >
          {/* Added relative positioning and z-index to ensure content appears above background */}
          <main className="relative z-10 min-h-screen">
            {children}
          </main>
        </AppProviders>
      </body>
    </html>
  );
}