// styles/themes/ThemeSwitcher.tsx
'use client';
import { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from './ThemeContext';
import { COLORS } from '../tokens/colors.stylex';
import { THEME_METADATA, THEME_ORDER } from './theme';

// Styled components
const Container = styled.div`
  position: relative;
  z-index: 20;
`;

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 6px;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.hover};
  }
`;

const CurrentTheme = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ColorIndicator = styled.span<{ color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.color};
`;

const Arrow = styled.span<{ isOpen: boolean }>`
  font-size: 10px;
  transition: transform 0.2s ease;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 6px;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  overflow: hidden;
`;

const ThemeOption = styled.button<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 12px;
  gap: 8px;
  background-color: ${props => props.isActive ? props.theme.colors.backgroundAlt : 'transparent'};
  border: none;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme.colors.hover};
  }
`;

const ThemePreview = styled.span<{ background: string; borderColor: string }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid ${props => props.borderColor};
  background-color: ${props => props.background};
`;

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  // Generate theme options from metadata and order
  const themeOptions = THEME_ORDER.map(themeId => ({
    id: themeId,
    name: THEME_METADATA[themeId].displayName,
    colors: {
      primary: COLORS[themeId].primary,
      background: COLORS[themeId].background
    }
  }));

  return (
    <Container>
      <ToggleButton
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Change theme"
        title="Change theme"
      >
        <CurrentTheme>
          <ColorIndicator color={COLORS[theme].primary} />
          {THEME_METADATA[theme].displayName}
        </CurrentTheme>
        <Arrow isOpen={isOpen}>
          ▼
        </Arrow>
      </ToggleButton>
      
      {isOpen && (
        <Dropdown role="listbox" aria-label="Theme options">
          {themeOptions.map((option) => (
            <ThemeOption
              key={option.id}
              isActive={theme === option.id}
              onClick={() => {
                setTheme(option.id);
                setIsOpen(false);
              }}
              role="option"
              aria-selected={theme === option.id}
            >
              <ThemePreview 
                background={option.colors.background}
                borderColor={option.colors.primary}
              />
              <span>{option.name}</span>
            </ThemeOption>
          ))}
        </Dropdown>
      )}
    </Container>
  );
}