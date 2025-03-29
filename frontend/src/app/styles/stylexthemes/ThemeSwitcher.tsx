// styles/themes/ThemeSwitcher.tsx
'use client';
import { useState } from 'react';
import { useTheme } from './ThemeContext';
import * as stylex from '@stylexjs/stylex';
import { COLORS } from '../tokens/colors.stylex';
import { THEME_METADATA, THEME_ORDER } from './index.stylex';

const styles = stylex.create({
  container: {
    position: 'relative',
    zIndex: 20,
  },
  toggleButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--card-background)',
    borderRadius: '6px',
    color: 'var(--text-color)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      borderColor: 'var(--hover-color)',
    },
  },
  currentTheme: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  colorIndicator: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--border-color)',
  },
  arrow: {
    fontSize: '10px',
    transition: 'transform 0.2s ease',
  },
  arrowUp: {
    transform: 'rotate(180deg)',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    width: '100%',
    backgroundColor: 'var(--card-background)',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
  },
  themeOption: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '8px 12px',
    gap: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-color)',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: 'var(--hover-color)',
    },
  },
  activeTheme: {
    backgroundColor: 'var(--backgroundAlt-color)',
  },
  themePreview: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    borderWidth: '1px',
    borderStyle: 'solid',
  },
});

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
    <div {...stylex.props(styles.container)}>
      <button
        {...stylex.props(styles.toggleButton)}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Change theme"
        title="Change theme"
      >
        <span {...stylex.props(styles.currentTheme)}>
          <span 
            {...stylex.props(styles.colorIndicator)} 
            style={{background: COLORS[theme].primary}}
          />
          {THEME_METADATA[theme].displayName}
        </span>
        <span {...stylex.props(styles.arrow, isOpen && styles.arrowUp)}>
          ▼
        </span>
      </button>
      
      {isOpen && (
        <div {...stylex.props(styles.dropdown)} role="listbox" aria-label="Theme options">
          {themeOptions.map((option) => (
            <button
              key={option.id}
              {...stylex.props(
                styles.themeOption, 
                theme === option.id && styles.activeTheme
              )}
              onClick={() => {
                setTheme(option.id);
                setIsOpen(false);
              }}
              role="option"
              aria-selected={theme === option.id}
            >
              <span 
                {...stylex.props(styles.themePreview)} 
                style={{
                  background: option.colors.background,
                  borderColor: option.colors.primary
                }}
              />
              <span>{option.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}