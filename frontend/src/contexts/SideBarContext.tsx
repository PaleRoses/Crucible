'use client';

import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

// Interface for the toggle ref structure
interface SidebarToggleRef {
  toggle: () => void;
  ToggleButton?: () => React.ReactElement;
}

// Interface for sidebar registration data
interface RegisteredSidebar {
  id: string;
  ref: React.RefObject<SidebarToggleRef>;
  displayName: string;
}

// Interface for the context value
interface SidebarContextType {
  // Registration methods
  registerSidebar: (id: string, ref: React.RefObject<SidebarToggleRef>, displayName?: string) => void;
  unregisterSidebar: (id: string) => void;
  
  // State access
  activeSidebarId: string | null;
  activeSidebarRef: React.RefObject<SidebarToggleRef> | null;
  showToggleButton: boolean;
  registeredSidebars: RegisteredSidebar[];
  
  // Control methods
  setActiveSidebar: (id: string) => void;
}

// Create the context with undefined initial value
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

/**
 * Provider component for sidebar management
 */
export const SidebarProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Track the active sidebar ID
  const [activeSidebarId, setActiveSidebarId] = useState<string | null>(null);
  
  // Track whether to show the toggle button
  const [showToggleButton, setShowToggleButton] = useState(false);
  
  // Store all registered sidebars
  const [registeredSidebars, setRegisteredSidebars] = useState<RegisteredSidebar[]>([]);
  
  // Get the active sidebar reference
  const activeSidebarRef = activeSidebarId 
    ? registeredSidebars.find(s => s.id === activeSidebarId)?.ref || null
    : null;
  
  // Register a sidebar
  const registerSidebar = useCallback((id: string, ref: React.RefObject<SidebarToggleRef>, displayName?: string) => {
    setRegisteredSidebars(prev => {
      // Check if already registered
      if (prev.some(s => s.id === id)) {
        return prev.map(s => s.id === id ? { ...s, ref, displayName: displayName || id } : s);
      }
      
      // Add new sidebar
      const newSidebars = [...prev, { id, ref, displayName: displayName || id }];
      
      // If this is the first sidebar, make it active
      if (newSidebars.length === 1) {
        setActiveSidebarId(id);
        setShowToggleButton(true);
      }
      
      return newSidebars;
    });
  }, []);
  
  // Unregister a sidebar
  const unregisterSidebar = useCallback((id: string) => {
    setRegisteredSidebars(prev => {
      const newSidebars = prev.filter(s => s.id !== id);
      
      // Update active sidebar and toggle button visibility
      if (activeSidebarId === id) {
        if (newSidebars.length > 0) {
          setActiveSidebarId(newSidebars[0].id);
        } else {
          setActiveSidebarId(null);
          setShowToggleButton(false);
        }
      }
      
      return newSidebars;
    });
  }, [activeSidebarId]);
  
  // Set the active sidebar
  const setActiveSidebar = useCallback((id: string) => {
    setRegisteredSidebars(prev => {
      if (prev.some(s => s.id === id)) {
        setActiveSidebarId(id);
        setShowToggleButton(true);
        return prev;
      }
      return prev;
    });
  }, []);
  
  // Context value
  const contextValue: SidebarContextType = {
    registerSidebar,
    unregisterSidebar,
    activeSidebarId,
    activeSidebarRef,
    showToggleButton,
    registeredSidebars,
    setActiveSidebar
  };
  
  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
};

/**
 * Hook to access sidebar context
 */
export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};