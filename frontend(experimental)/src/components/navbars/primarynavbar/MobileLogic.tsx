import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';

import { 
  ActiveProps, 
  EnhancedNavItem,
  mobileMenuVariants,
  mobileItemVariants,
  submenuVariants,
  submenuItemVariants,
  arrowVariants
} from './types';
import { ArrowIcon, getIconByName } from './icons';

// ==========================================================
// Styled Components
// ==========================================================

const MobileMenuButton = styled.button`
  display: none;
  background: transparent;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  font-size: 1.5rem;
  position: absolute;
  right: 1.5rem;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    right: 1rem;
  }
`;

const MobileMenu = styled(motion.div)`
  display: none;
  position: fixed;
  top: 60px;
  left: 0;
  width: 100%;
  height: calc(100vh - 60px);
  background: rgba(8, 8, 8, 0.95);
  z-index: 99;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileNavItems = styled(motion.div)`
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  gap: 1.5rem;
`;

const NavItem = styled(motion.div)<ActiveProps>`
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-heading);
  font-weight: 100;
  letter-spacing: 0.1em;
  font-size: 0.8rem;
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

const MobileSubmenuContainer = styled(motion.div)`
  margin-top: 0.5rem;
  margin-left: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 0;
  background: rgba(10, 10, 10, 0.75);
  backdrop-filter: blur(8px);
`;

interface SubmenuItemProps {
  $isActive: boolean;
}

const MobileSubmenuHeader = styled.div`
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.25rem;
  font-family: var(--font-heading);
  color: var(--gold);
  font-size: 0.9rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

const MobileSubmenuDescription = styled.div`
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.8rem;
  color: rgba(224, 224, 224, 0.7);
  line-height: 1.4;
`;

const MobileSubmenuItemWrapper = styled(motion.div)<SubmenuItemProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 1rem;
  cursor: pointer;
  color: ${props => props.$isActive ? 'rgba(46, 213, 115, 0.9)' : 'rgba(224, 224, 224, 0.7)'};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(46, 213, 115, 0.08);
    color: rgba(46, 213, 115, 0.9);
  }
`;

const SubmenuItemLink = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: column;
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
  margin-bottom: 0.5rem;
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const SubmenuItemLabel = styled.span`
  font-size: 0.9rem;
  font-weight: 400;
  margin-bottom: 0.25rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const SubmenuItemDescription = styled.div`
  font-size: 0.75rem;
  color: rgba(224, 224, 224, 0.5);
  line-height: 1.4;
`;

// ==========================================================
// Components
// ==========================================================

/**
 * Mobile navigation item with accordion-style dropdown
 */
export const MobileNavItemComponent: React.FC<{ 
  item: EnhancedNavItem; 
  isActive: boolean; 
}> = ({ item, isActive }) => {
  const router = useRouter();
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);

  return (
    <motion.div 
      variants={mobileItemVariants}
    >
      <NavItem
        $isActive={isActive}
        onClick={() => setIsSubmenuOpen(!isSubmenuOpen)}
      >
        <NavItemContent>
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
          <MobileSubmenuContainer
            variants={submenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <MobileSubmenuHeader>{item.label}</MobileSubmenuHeader>
            {item.id && (
              <MobileSubmenuDescription>
                {item.id && item.id in { codex: '', cycles: '', characters: '' } && 
                  (item.id === 'codex' ? 
                    "Explore the foundational elements of our world including rules, lore, and creator information." :
                    item.id === 'cycles' ?
                    "Navigate through current and previous story cycles in our evolving narrative." :
                    "Create new characters or revisit existing ones from past adventures."
                  )
                }
              </MobileSubmenuDescription>
            )}

            {item.submenu.map((subItem) => (
              <MobileSubmenuItemWrapper
                key={subItem.id}
                as={motion.div}
                $isActive={false}
                variants={submenuItemVariants}
                onClick={() => router.push(subItem.href)}
              >
                <SubmenuItemIcon>
                  {typeof subItem.icon === 'string' 
                    ? getIconByName(subItem.icon as string)
                    : subItem.icon}
                </SubmenuItemIcon>
                <SubmenuItemLink>
                  <SubmenuItemLabel>{subItem.label}</SubmenuItemLabel>
                  {subItem.description && (
                    <SubmenuItemDescription>
                      {subItem.description}
                    </SubmenuItemDescription>
                  )}
                </SubmenuItemLink>
              </MobileSubmenuItemWrapper>
            ))}
          </MobileSubmenuContainer>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * Mobile menu container with toggle button
 */
export const MobileMenuComponent: React.FC<{
  isOpen: boolean;
  toggleMenu: () => void;
  items: EnhancedNavItem[];
  isActiveRoute: (href: string) => boolean;
}> = ({ isOpen, toggleMenu, items, isActiveRoute }) => {
  return (
    <>
      <MobileMenuButton onClick={toggleMenu}>
        {isOpen ? '✕' : '☰'}
      </MobileMenuButton>

      <AnimatePresence>
        {isOpen && (
          <MobileMenu
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <MobileNavItems>
              {items.map((item) => (
                <MobileNavItemComponent
                  key={item.id}
                  item={item}
                  isActive={isActiveRoute(item.href)}
                />
              ))}
            </MobileNavItems>
          </MobileMenu>
        )}
      </AnimatePresence>
    </>
  );
};