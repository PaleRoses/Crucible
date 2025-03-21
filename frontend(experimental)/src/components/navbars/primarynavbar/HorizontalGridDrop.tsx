import React, { useRef, useEffect, useState, useContext } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';

import { 
  ActiveProps, 
  EnhancedNavItem, 
  NavContextType,
  navItemVariants,
  arrowVariants,
  submenuVariants,
  submenuItemVariants,
  submenuDescriptions
} from './types';
import { ArrowIcon, getIconByName } from './icons';

// Context for navigation state
export const NavContext = React.createContext<NavContextType>({
  openSubmenuId: null,
  setOpenSubmenuId: () => {},
});

// ==========================================================
// Styled Components
// ==========================================================

const NavItemWrapper = styled.div`
  position: relative;
`;

const NavItem = styled(motion.div)<ActiveProps>`
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-heading);
  font-weight: 100;
  letter-spacing: 0.2em;
  font-size: 1rem;
  color: ${props => props.$isActive ? 'var(--gold)' : 'var(--color-text)'};

  &:hover {
    color: var(--gold);
  }
`;

const NavItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NavItemIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${NavItem}:hover & {
    transform: scale(1.1);
    color: var(--gold);
  }
`;

const NavItemLabel = styled.span`
  text-transform: uppercase;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${NavItem}:hover & {
    color: var(--gold);
  }
`;

const NavItemArrow = styled(motion.div)`
  display: flex;
  align-items: center;
  margin-top: 2px;
`;

const SubmenuContainer = styled(motion.div)`
  position: fixed;
  top: 80%;
  left: 10%;
  right: 10%;
  align-items: center;
  width: 80%;
  background: rgba(10, 10, 10, 0.75);
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
              inset 0 1px 1px rgba(255, 255, 255, 0.05);
  z-index: 10;
  overflow: hidden;
  border: none;
`;

// Grid container that will include header, description, and items
const SubmenuGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 2rem;
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
`;

// Header is now a grid item spanning full width
const SubmenuHeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
  border-right: 1px solid rgba(191, 173, 127, 0.2);
  padding-bottom: 1rem;
`;

const SubmenuHeader = styled.div`
  font-family: var(--font-heading);
  color: var(--gold);
  font-size: 0.9rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
`;

const SubmenuDescription = styled.div`
  font-size: 0.8rem;
  color: rgba(224, 224, 224, 0.7);
  line-height: 1.4;
`;

const SubmenuItemWrapper = styled(motion.div)<ActiveProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 1.5rem 1rem;
  border-right: 1px solid rgba(191, 173, 127, 0.2);
  border-radius: var(--radius-small);
  cursor: pointer;
  color: ${props => props.$isActive ? 'var(--gold)' : 'rgba(224, 224, 224, 0.7)'};
  
  &:hover {
    background-color: rgba(191, 173, 127, 0.15);
    color: var(--gold-light);
    transform: scale(1.05);
    box-shadow: 0 0 5px rgba(191, 173, 127, 0.3);
  }
`;

const SubmenuItemLink = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  font-family: var(--font-heading);
  font-weight: 100;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
`;

const SubmenuItemIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(46, 213, 115, 0.9);
  margin-bottom: 1.25rem;
  height: 100px;
  
  svg {
    width: 64px;
    height: 64px;
  }
`;

const SubmenuItemLabel = styled.span`
  font-size: 1rem;
  font-weight: 400;
  margin-bottom: 0.25rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition: color 0.2s ease;
  
  ${SubmenuItemWrapper}:hover & {
    color: rgba(46, 213, 115, 0.9);
  }
`;

const SubmenuItemDescription = styled.div`
  font-size: 0.75rem;
  color: rgba(224, 224, 224, 0.5);
  max-width: 200px;
  line-height: 1.4;
`;

// ==========================================================
// Components
// ==========================================================

/**
 * Individual navigation item with hover-triggered dropdown
 */
export const NavItemComponent: React.FC<{ 
  item: EnhancedNavItem; 
  isActive: boolean;
}> = ({ item, isActive }) => {
  const router = useRouter();
  const { openSubmenuId, setOpenSubmenuId } = useContext(NavContext);
  const isSubmenuOpen = openSubmenuId === item.id;
  const navItemRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [, setIsHovering] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced hover effects
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    setIsHovering(true);
    setOpenSubmenuId(item.id);
    
    controls.start({
      color: 'var(--gold)',
      scale: 1.05,
      transition: { duration: 0.3 }
    });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    
    // Close immediately without timeout
    if (!isActive) {
      controls.start({
        color: 'var(--color-text)',
        scale: 1,
        transition: { duration: 0.3 }
      });
    }
    
    setOpenSubmenuId(null);
  };

  // Handle click for navigation
  const handleClick = () => {
    router.push(item.href);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <NavItemWrapper 
      ref={navItemRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <NavItem
        as={motion.div}
        $isActive={isActive}
        variants={navItemVariants}
        initial="idle"
        animate={controls}
        onClick={handleClick}
      >
        <NavItemContent>
          <NavItemIcon>
            {item.icon}
          </NavItemIcon>
          <NavItemLabel>
            {item.label}
          </NavItemLabel>
        </NavItemContent>
        
        <NavItemArrow
          variants={arrowVariants}
          initial="closed"
          animate={isSubmenuOpen ? "open" : "closed"}
        >
          <ArrowIcon />
        </NavItemArrow>
      </NavItem>

      <AnimatePresence>
        {isSubmenuOpen && (
          <SubmenuContainer
            ref={submenuRef}
            variants={submenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <SubmenuGridContainer>
              <SubmenuHeaderContainer>
                <SubmenuHeader>{item.label}</SubmenuHeader>
                <SubmenuDescription>
                  {submenuDescriptions[item.id as keyof typeof submenuDescriptions]}
                </SubmenuDescription>
              </SubmenuHeaderContainer>
              
              {item.submenu.map((subItem) => (
                <SubmenuItemWrapper
                  key={subItem.id}
                  as={motion.div}
                  $isActive={false}
                  variants={submenuItemVariants}
                  onClick={() => {
                    setOpenSubmenuId(null);
                    router.push(subItem.href);
                  }}
                >
                  <SubmenuItemLink as="div">
                    <SubmenuItemIcon>
                      {typeof subItem.icon === 'string' 
                        ? getIconByName(subItem.icon as string)
                        : subItem.icon}
                    </SubmenuItemIcon>
                    <SubmenuItemLabel>{subItem.label}</SubmenuItemLabel>
                    {subItem.description && (
                      <SubmenuItemDescription>
                        {subItem.description}
                      </SubmenuItemDescription>
                    )}
                  </SubmenuItemLink>
                </SubmenuItemWrapper>
              ))}
            </SubmenuGridContainer>
          </SubmenuContainer>
        )}
      </AnimatePresence>
    </NavItemWrapper>
  );
};