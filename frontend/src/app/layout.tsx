// app/layout.tsx - SERVER COMPONENT
import type { Metadata, Viewport } from 'next'; // Add Viewport import
import { ThemeScript } from './styles/themes/ThemeContext';
import ClientLayout from '@/components/layout/ClientLayout';
import '../../styled-system/css';
import './styles/global.css';

// Metadata Export (without themeColor)
export const metadata: Metadata = {
  // Add other metadata like title, description
};

// Add a separate viewport export
export const viewport: Viewport = {
  themeColor: 'var(--color-background)',
};

// Critical Styles (unchanged)
const criticalStyles = `
  /* ... your critical styles ... */
  .loading-overlay { background-color: var(--color-background); /* ... other styles */ }
  .content-hidden { opacity: 0; visibility: hidden; }
  .content-visible { opacity: 1; visibility: visible; transition: opacity 0.5s ease-in-out; }
  .main-content { transition: opacity 300ms ease-in-out; }
  .main-content.transitioning { opacity: 0; }
  .persistent-element { position: relative; z-index: 100; opacity: 1 !important; visibility: visible !important; }
`;

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        {/* Static head elements */}
        <ThemeScript />
        
        <style dangerouslySetInnerHTML={{ __html: criticalStyles }} />
        <link rel="preload" href="https://use.typekit.net/hcw7ssx.css" as="style" />
        <link rel="stylesheet" href="https://use.typekit.net/hcw7ssx.css" />
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
      </head>
      <body>
        {/* Render the Client Component, passing children */}
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}