// src/components/layout/Layout.js
import React from 'react';
import Background from './Background';// Update this path to match your Background component location
import './layout.css';

/**
 * Layout component that maintains a persistent background
 * across all page transitions in your application
 */
const Layout = ({ children }) => {
  return (
    <div className="app-container">
      {/* Background component persists across page transitions */}
      <Background />
      
      {/* Main content area where your route components are rendered */}
      <main className="app-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;