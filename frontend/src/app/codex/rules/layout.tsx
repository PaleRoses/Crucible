'use client';

import React, { useRef, useEffect } from 'react';
import LeftSidebar from '@/components/navbars/leftsidebar/LeftSideBar';
import { css } from '../../../../styled-system/css';
import usePersistedState from '@/hooks/usePersistedState';
import sidebarItems from '../../../components/navbars/navbardata/sidebarItems';
// Import sidebar context hook
import { useSidebar } from '@/contexts/SideBarContext';

// Define the sidebar ID
const SIDEBAR_ID = 'codex-sidebar';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use our custom hook for persisted sidebar state
  const [sidebarExpanded, setSidebarExpanded] = usePersistedState<boolean>(
    'codex-sidebar-state',
    true
  );
  
  // Create a ref for the sidebar toggle functions
  const sidebarToggleRef = useRef<{
    toggle: () => void;
    ToggleButton?: () => React.ReactElement;
  }>({ toggle: () => {} });
  
  // Get sidebar context
  const { registerSidebar, unregisterSidebar } = useSidebar();
  

  // Handle toggle from external sources (mobile menu)
  const handleToggleExternal = (isExpanded: boolean) => {
    // This gets called when the mobile drawer opens/closes
    console.log('Mobile sidebar state changed:', isExpanded);
  };
  
  // Register this sidebar with the sidebar context when mounted
  useEffect(() => {
    // Register when component mounts
    registerSidebar(SIDEBAR_ID, sidebarToggleRef, 'CODEX Documentation');
    
    // Unregister when component unmounts
    return () => {
      unregisterSidebar(SIDEBAR_ID);
    };
  }, [registerSidebar, unregisterSidebar]);

  return (
    <div className={css({ display: 'flex', minHeight: '100vh' })}>
      {/* Documentation Sidebar */}
      <LeftSidebar
        title="CODEX"
        variant="cosmic"
        initiallyExpanded={sidebarExpanded}
        sidebarItems={sidebarItems}
        onToggleExternal={handleToggleExternal}
        externalToggleRef={sidebarToggleRef}  // Use our local ref that connects to the context
        pushContent={true}
        contentSelector="#main-content"
        expandedWidth="240px"
        collapsedWidth="64px"
      />
      
      {/* Main Content Area */}
      <main
        id="main-content"
        className={css({
          flex: '1',
          padding: '0',
          marginTop: '0',
          transition: 'margin-left 300ms ease'
        })}
      >
        {children}
      </main>
    </div>
  );
}