// src/styled-system/recipes/cosmicTabs.ts

import { cva } from '../../styled-system/css';

/**
 * Cosmic Tabs - A sophisticated tabs component with luxury styling
 * 
 * Features:
 * - Multiple visual variants (underline, filled, minimal, cosmic)
 * - Horizontal and vertical orientation options
 * - Animated active indicator with smooth transitions
 * - Support for icons in tab triggers
 * - Responsive design with mobile considerations
 * - Elegant animations and transitions
 * - Fully accessible with keyboard navigation support
 */

// Main container that wraps the entire tabs component
export const cosmicTabsContainer = cva({
  base: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    position: 'relative',
    fontFamily: 'body',
    
    // Vertical orientation
    '&[data-orientation="vertical"]': {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
  },
  
  variants: {
    // Visual variants for the overall container
    variant: {
      // Standard tabs - default style
      standard: {},
      
      // Underlined tabs - subtle bottom border indicator
      underline: {},
      
      // Filled tabs - background fill for active tab
      filled: {},
      
      // Minimal tabs - extra subtle styling
      minimal: {},
      
      // Cosmic tabs - premium styling with glow effects
      cosmic: {
        '&::before': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, var(--color-primary) 20%, var(--color-primary) 80%, transparent)',
          opacity: 0.5,
          zIndex: 1,
        },
      },
    },
    
    // Size variants
    size: {
      sm: {},
      md: {},
      lg: {},
    },
    
    // Orientation of the tabs (horizontal or vertical)
    orientation: {
      horizontal: {
        flexDirection: 'column',
      },
      vertical: {
        flexDirection: 'row',
      },
    },
    
    // Spacing between tab triggers
    spacing: {
      tight: {},
      normal: {},
      loose: {},
    },
    
    // Full width tabs vs auto width
    fullWidth: {
      true: {},
      false: {},
    },
  },
  
  defaultVariants: {
    variant: 'standard',
    size: 'md',
    orientation: 'horizontal',
    spacing: 'normal',
    fullWidth: false,
  },
});

// Tab list - container for all tab triggers
export const cosmicTabsList = cva({
  base: {
    display: 'flex',
    position: 'relative',
    width: '100%',
    borderBottom: '1px solid',
    borderColor: 'border',
    margin: 0,
    padding: 0,
    
    // Vertical orientation
    '&[data-orientation="vertical"]': {
      flexDirection: 'column',
      borderBottom: 'none',
      borderRight: '1px solid',
      borderColor: 'border',
      width: 'auto',
      minWidth: '150px',
    },
  },
  
  variants: {
    // Visual variants for the tab list
    variant: {
      standard: {},
      
      underline: {
        borderBottom: '1px solid',
        borderColor: 'border',
        
        '&[data-orientation="vertical"]': {
          borderRight: '1px solid',
          borderBottom: 'none',
          borderColor: 'border',
        },
      },
      
      filled: {
        backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 95%, var(--color-primary))',
        borderRadius: 'md',
        padding: '2px',
        border: 'none',
        
        '&[data-orientation="vertical"]': {
          borderRight: 'none',
        },
      },
      
      minimal: {
        borderBottom: '1px solid',
        borderColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)',
        
        '&[data-orientation="vertical"]': {
          borderRight: '1px solid',
          borderBottom: 'none',
          borderColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)',
        },
      },
      
      cosmic: {
        borderBottom: 'none',
        marginBottom: '1px', // Space for the gradient line created in the container
        
        '&[data-orientation="vertical"]': {
          borderRight: 'none',
          marginRight: '1px',
          marginBottom: 0,
        },
      },
    },
    
    // Size variants
    size: {
      sm: {
        gap: '1',
      },
      md: {
        gap: '2',
      },
      lg: {
        gap: '3',
      },
    },
    
    // Orientation
    orientation: {
      horizontal: {
        flexDirection: 'row',
      },
      vertical: {
        flexDirection: 'column',
      },
    },
    
    // Spacing between tabs
    spacing: {
      tight: {
        gap: '1',
      },
      normal: {
        gap: '3',
      },
      loose: {
        gap: '5',
      },
    },
    
    // Full width tabs
    fullWidth: {
      true: {
        '& > *': {
          flex: 1,
        },
      },
      false: {},
    },
  },
  
  defaultVariants: {
    variant: 'standard',
    size: 'md',
    orientation: 'horizontal',
    spacing: 'normal',
    fullWidth: false,
  },
});

// Individual tab trigger (the clickable tab item)
export const cosmicTabTrigger = cva({
  base: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2',
    padding: '3 4',
    backgroundColor: 'transparent',
    color: 'textMuted',
    fontFamily: 'heading',
    fontSize: 'base',
    fontWeight: 'normal',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    
    // Active state (applied via data-state attribute)
    '&[data-state="active"]': {
      color: 'primary',
      fontWeight: 'medium',
    },
    
    // Focus visible state
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
    
    // Disabled state
    '&[data-disabled]': {
      opacity: 0.4,
      cursor: 'not-allowed',
      pointerEvents: 'none',
    },
    
    // Icon styling
    '& .tab-icon': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'inherit',
      transition: 'color 0.3s ease',
    },
  },
  
  variants: {
    // Visual variants
    variant: {
      standard: {
        borderBottom: '2px solid transparent',
        marginBottom: '-1px',
        
        '&[data-state="active"]': {
          borderColor: 'primary',
        },
        
        '&[data-orientation="vertical"]': {
          borderBottom: 'none',
          borderRight: '2px solid transparent',
          marginBottom: 0,
          marginRight: '-1px',
          
          '&[data-state="active"]': {
            borderRightColor: 'primary',
          },
        },
      },
      
      underline: {
        borderRadius: '0',
        borderBottom: '2px solid transparent',
        marginBottom: '-1px',
        
        '&[data-state="active"]': {
          borderColor: 'primary',
        },
        
        _hover: {
          color: 'primary',
          backgroundColor: 'color-mix(in srgb, var(--color-hover) 30%, transparent)',
        },
        
        '&[data-orientation="vertical"]': {
          borderBottom: 'none',
          borderRight: '2px solid transparent',
          marginBottom: 0,
          marginRight: '-1px',
          
          '&[data-state="active"]': {
            borderRightColor: 'primary',
          },
        },
      },
      
      filled: {
        borderRadius: 'md',
        
        '&[data-state="active"]': {
          backgroundColor: 'backgroundAlt',
          color: 'primary',
        },
        
        _hover: {
          backgroundColor: 'color-mix(in srgb, var(--color-backgroundAlt) 50%, transparent)',
        },
      },
      
      minimal: {
        padding: '2 3',
        
        '&[data-state="active"]': {
          color: 'primary',
          
          _after: {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '20%',
            right: '20%',
            height: '1px',
            backgroundColor: 'primary',
            transition: 'all 0.3s ease',
          },
        },
        
        _hover: {
          color: 'primary',
        },
        
        '&[data-orientation="vertical"]': {
          '&[data-state="active"]': {
            _after: {
              right: 0,
              top: '20%',
              bottom: '20%',
              left: 'auto',
              width: '1px',
              height: 'auto',
            },
          },
        },
      },
      
      cosmic: {
        padding: '3 4',
        
        '&[data-state="active"]': {
          color: 'primary',
          
          _before: {
            content: '""',
            position: 'absolute',
            bottom: '-1px',
            left: '10%',
            right: '10%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, var(--color-primary) 30%, var(--color-primary) 70%, transparent)',
            boxShadow: '0 0 8px var(--color-glow)',
            borderRadius: 'full',
            zIndex: 2,
          },
        },
        
        _hover: {
          color: 'primary',
          
          _after: {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: 'radial-gradient(circle at center, var(--color-hover) 1%, transparent 70%)',
            opacity: 0.2,
            zIndex: -1,
          },
        },
        
        '&[data-orientation="vertical"]': {
          '&[data-state="active"]': {
            _before: {
              top: '10%',
              bottom: '10%',
              right: '-1px',
              left: 'auto',
              width: '2px',
              height: 'auto',
              background: 'linear-gradient(180deg, transparent, var(--color-primary) 30%, var(--color-primary) 70%, transparent)',
            },
          },
          
          _hover: {
            _after: {
              background: 'radial-gradient(circle at center, var(--color-hover) 1%, transparent 70%)',
            },
          },
        },
      },
    },
    
    // Size variants
    size: {
      sm: {
        fontSize: 'sm',
        padding: '2 3',
        gap: '1.5',
      },
      md: {
        fontSize: 'base',
        padding: '3 4',
        gap: '2',
      },
      lg: {
        fontSize: 'lg',
        padding: '4 5',
        gap: '2.5',
      },
    },
    
    // Orientation
    orientation: {
      horizontal: {},
      vertical: {
        justifyContent: 'flex-start',
        width: '100%',
        textAlign: 'left',
      },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
    size: 'md',
    orientation: 'horizontal',
  },
});

// Tab content container (where the tab panels live)
export const cosmicTabsContent = cva({
  base: {
    flexGrow: 1,
    position: 'relative',
    width: '100%',
    
    // Vertical orientation
    '&[data-orientation="vertical"]': {
      marginLeft: '4',
    },
  },
  
  variants: {
    // Visual variants
    variant: {
      standard: {
        padding: '4 0',
      },
      
      underline: {
        padding: '4 0',
      },
      
      filled: {
        backgroundColor: 'backgroundAlt',
        borderRadius: 'md',
        padding: '4',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      },
      
      minimal: {
        padding: '4 0',
      },
      
      cosmic: {
        padding: '6 2',
        
        _after: {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle, var(--color-cosmic1) 1px, transparent 1px), 
            radial-gradient(circle, var(--color-cosmic2) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px, 30px 30px',
          backgroundPosition: '0 0, 10px 10px',
          opacity: 0.03,
          zIndex: -1,
          pointerEvents: 'none',
        },
      },
    },
    
    // Size variants
    size: {
      sm: {
        padding: '3 0',
        
        '&[data-variant="filled"]': {
          padding: '3',
        },
        
        '&[data-variant="cosmic"]': {
          padding: '4 1',
        },
      },
      md: {
        // Base padding already defined
      },
      lg: {
        padding: '5 0',
        
        '&[data-variant="filled"]': {
          padding: '5',
        },
        
        '&[data-variant="cosmic"]': {
          padding: '7 3',
        },
      },
    },
    
    // Orientation
    orientation: {
      horizontal: {},
      vertical: {
        marginLeft: '4',
      },
    },
  },
  
  defaultVariants: {
    variant: 'standard',
    size: 'md',
    orientation: 'horizontal',
  },
});

// Individual tab panel (the content for each tab)
export const cosmicTabPanel = cva({
  base: {
    width: '100%',
    outline: 'none',
    color: 'text',
    
    // Hidden state - applied via data-state attribute
    '&[data-state="inactive"]': {
      display: 'none',
    },
    
    // Animation for tab panels
    '&[data-state="active"]': {
      animation: 'tabFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    },
  },
  
  variants: {
    // Visual variants
    variant: {
      standard: {},
      underline: {},
      filled: {},
      minimal: {},
      cosmic: {
        position: 'relative',
        
        '&[data-state="active"]': {
          animation: 'tabCosmicFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        },
      },
    },
    
    // Size variants
    size: {
      sm: {},
      md: {},
      lg: {},
    },
  },
  
  defaultVariants: {
    variant: 'standard',
    size: 'md',
  },
});

export const cosmicTabs = {
  container: cosmicTabsContainer,
  list: cosmicTabsList,
  trigger: cosmicTabTrigger,
  content: cosmicTabsContent,
  panel: cosmicTabPanel
};

/**
 * CSS Keyframes to be added to your global styles:
 * 
 * @keyframes tabFadeIn {
 *   from { opacity: 0; transform: translateY(4px); }
 *   to { opacity: 1; transform: translateY(0); }
 * }
 * 
 * @keyframes tabCosmicFadeIn {
 *   0% { opacity: 0; transform: translateY(6px); }
 *   30% { opacity: 0.5; }
 *   100% { opacity: 1; transform: translateY(0); }
 * }
 */

/**
 * Usage Example (in a React component):
 * 
 * import { 
 *   cosmicTabsContainer, 
 *   cosmicTabsList, 
 *   cosmicTabTrigger,
 *   cosmicTabsContent,
 *   cosmicTabPanel
 * } from '../styled-system/recipes/cosmicTabs';
 * import { useState } from 'react';
 * 
 * interface TabsProps {
 *   tabs: Array<{
 *     id: string;
 *     label: string;
 *     icon?: React.ReactNode;
 *     content: React.ReactNode;
 *     disabled?: boolean;
 *   }>;
 *   defaultTab?: string;
 *   variant?: 'standard' | 'underline' | 'filled' | 'minimal' | 'cosmic';
 *   size?: 'sm' | 'md' | 'lg';
 *   orientation?: 'horizontal' | 'vertical';
 *   spacing?: 'tight' | 'normal' | 'loose';
 *   fullWidth?: boolean;
 * }
 * 
 * export function CosmicTabs({
 *   tabs,
 *   defaultTab,
 *   variant = 'standard',
 *   size = 'md',
 *   orientation = 'horizontal',
 *   spacing = 'normal',
 *   fullWidth = false
 * }: TabsProps) {
 *   const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
 *   
 *   // Apply styles from recipes
 *   const containerStyles = cosmicTabsContainer({ variant, size, orientation, spacing, fullWidth });
 *   const listStyles = cosmicTabsList({ variant, size, orientation, spacing, fullWidth });
 *   const contentStyles = cosmicTabsContent({ variant, size, orientation });
 *   
 *   // Handle tab change
 *   const handleTabChange = (tabId: string) => {
 *     setActiveTab(tabId);
 *   };
 *   
 *   return (
 *     <div 
 *       className={containerStyles}
 *       data-orientation={orientation}
 *       data-variant={variant}
 *     >
 *       <div 
 *         className={listStyles}
 *         role="tablist"
 *         aria-orientation={orientation}
 *         data-orientation={orientation}
 *         data-variant={variant}
 *       >
 *         {tabs.map((tab) => {
 *           const isActive = activeTab === tab.id;
 *           const triggerStyles = cosmicTabTrigger({ 
 *             variant, 
 *             size, 
 *             orientation 
 *           });
 *           
 *           return (
 *             <button
 *               key={tab.id}
 *               className={triggerStyles}
 *               role="tab"
 *               aria-selected={isActive}
 *               aria-controls={`panel-${tab.id}`}
 *               id={`tab-${tab.id}`}
 *               tabIndex={isActive ? 0 : -1}
 *               data-state={isActive ? 'active' : 'inactive'}
 *               data-disabled={tab.disabled}
 *               data-orientation={orientation}
 *               disabled={tab.disabled}
 *               onClick={() => !tab.disabled && handleTabChange(tab.id)}
 *             >
 *               {tab.icon && <span className="tab-icon">{tab.icon}</span>}
 *               <span>{tab.label}</span>
 *             </button>
 *           );
 *         })}
 *       </div>
 *       
 *       <div 
 *         className={contentStyles}
 *         data-orientation={orientation}
 *         data-variant={variant}
 *       >
 *         {tabs.map((tab) => {
 *           const isActive = activeTab === tab.id;
 *           const panelStyles = cosmicTabPanel({ variant, size });
 *           
 *           return (
 *             <div
 *               key={tab.id}
 *               className={panelStyles}
 *               role="tabpanel"
 *               id={`panel-${tab.id}`}
 *               aria-labelledby={`tab-${tab.id}`}
 *               tabIndex={0}
 *               hidden={!isActive}
 *               data-state={isActive ? 'active' : 'inactive'}
 *             >
 *               {tab.content}
 *             </div>
 *           );
 *         })}
 *       </div>
 *     </div>
 *   );
 * }
 * 
 * // Example Usage
 * function TabExample() {
 *   const tabs = [
 *     {
 *       id: 'features',
 *       label: 'Features',
 *       content: <div>Features content goes here...</div>
 *     },
 *     {
 *       id: 'specifications',
 *       label: 'Specifications',
 *       content: <div>Specifications content goes here...</div>
 *     },
 *     {
 *       id: 'reviews',
 *       label: 'Reviews',
 *       content: <div>Reviews content goes here...</div>,
 *     }
 *   ];
 *   
 *   return (
 *     <CosmicTabs
 *       tabs={tabs}
 *       variant="cosmic"
 *       orientation="horizontal"
 *     />
 *   );
 * }
 */