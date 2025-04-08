// components/icons/iconComponents.tsx
import React from 'react';

// Define a type for standard SVG component props
type SVGIconProps = React.SVGProps<SVGSVGElement>;

//=============================================================================
// ICON COMPONENTS
//=============================================================================
// Define individual icon components using React.memo for performance optimization
// and TypeScript for type safety.

export const MoonIcon: React.FC = React.memo(() => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
    // className prop is implicitly handled by React.FC and SVGProps
    className="inline-block"
  >
    <defs>
      <mask id="moonMask">
        <rect x="0" y="0" width="24" height="24" fill="white" />
        <circle cx="14.4" cy="12" r="9" fill="black" />
      </mask>
    </defs>
    <circle cx="12" cy="12" r="10.8" fill="currentColor" mask="url(#moonMask)" />
  </svg>
));

export const ArrowIcon: React.FC = React.memo(() => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
    className="inline-block"
  >
    <path
      d="M2 4L6 8L10 4"
      stroke="currentColor"
      strokeWidth="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
));

// Use SVGIconProps for components accepting standard SVG attributes
export const RulesIcon: React.FC<SVGIconProps> = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    viewBox="0 0 570 470" // Example viewBox, replace with actual if available
    // Combine default classes with any passed className prop
    className={`inline-block w-[170px] h-[128px] ${props.className || ''}`}
    {...props} // Spread the rest of the props (like style, onClick, etc.)
  >
    {/* Placeholder path - replace with actual SVG path data */}
    <path d="M10 10 H 90 V 90 H 10 L 10 10"
      fill="currentColor"
      opacity="0.5"
    />
  </svg>
));

export const LoreIcon: React.FC<SVGIconProps> = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    viewBox="0 0 570 470" // Example viewBox, replace with actual if available
    className={`inline-block w-[170px] h-[128px] ${props.className || ''}`}
    {...props}
  >
    {/* Placeholder path - replace with actual SVG path data */}
    <path d="M50 10 Q 90 50 50 90 T 10 50"
      fill="currentColor"
      opacity="0.5"
    />
  </svg>
));

export const CreatorsIcon: React.FC<SVGIconProps> = React.memo((props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    viewBox="0 0 570 470" // Example viewBox, replace with actual if available
    className={`inline-block w-[170px] h-[128px] ${props.className || ''}`}
    {...props}
  >
    {/* Placeholder path - replace with actual SVG path data */}
    <path d="M10 90 C 30 70, 70 70, 90 90"
      fill="currentColor"
      opacity="0.5"
    />
  </svg>
));

export const NewCycleIcon: React.FC = React.memo(() => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
    className="inline-block"
  >
    <path
      d="M13 7H9V3H7V7H3V9H7V13H9V9H13V7Z"
      fill="currentColor"
    />
  </svg>
));

export const PreviousCycleIcon: React.FC = React.memo(() => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
    className="inline-block"
  >
    <path
      d="M8 3C5.24 3 3 5.24 3 8C3 10.76 5.24 13 8 13C10.76 13 13 10.76 13 8H11C11 9.66 9.66 11 8 11C6.34 11 5 9.66 5 8C5 6.34 6.34 5 8 5V3Z"
      fill="currentColor"
    />
    <path d="M9 7L13 3V7H9Z" fill="currentColor" />
  </svg>
));

export const NewCharacterIcon: React.FC = React.memo(() => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
    className="inline-block"
  >
    <path
      d="M10 7C11.1 7 12 6.1 12 5C12 3.9 11.1 3 10 3C8.9 3 8 3.9 8 5C8 6.1 8.9 7 10 7Z"
      fill="currentColor"
    />
    <path
      d="M10 8C8.33 8 5 8.83 5 10.5V12H15V10.5C15 8.83 11.67 8 10 8Z"
      fill="currentColor"
    />
    <path d="M7 7H4V4H2V7H-1V9H2V12H4V9H7V7Z" fill="currentColor" />
  </svg>
));

export const PreviousCharacterIcon: React.FC = React.memo(() => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
    className="inline-block"
  >
    <path
      d="M5 6C6.1 6 7 5.1 7 4C7 2.9 6.1 2 5 2C3.9 2 3 2.9 3 4C3 5.1 3.9 6 5 6Z"
      fill="currentColor"
    />
    <path
      d="M5 7C3.33 7 0 7.83 0 9.5V11H10V9.5C10 7.83 6.67 7 5 7Z"
      fill="currentColor"
    />
    <path
      d="M11 6C12.1 6 13 5.1 13 4C13 2.9 12.1 2 11 2C9.9 2 9 2.9 9 4C9 5.1 9.9 6 11 6Z"
      fill="currentColor"
    />
    <path
      d="M16 9.5C16 7.83 12.67 7 11 7C10.42 7 9.54 7.1 8.66 7.29C9.5 7.9 10 8.7 10 9.5V11H16V9.5Z"
      fill="currentColor"
    />
  </svg>
));

//=============================================================================
// COMPONENT DISPLAY NAMES
//=============================================================================
// Assign display names for easier debugging in React DevTools.
// TypeScript doesn't change how display names are assigned.
MoonIcon.displayName = 'MoonIcon';
ArrowIcon.displayName = 'ArrowIcon';
RulesIcon.displayName = 'RulesIcon';
LoreIcon.displayName = 'LoreIcon';
CreatorsIcon.displayName = 'CreatorsIcon';
NewCycleIcon.displayName = 'NewCycleIcon';
PreviousCycleIcon.displayName = 'PreviousCycleIcon';
NewCharacterIcon.displayName = 'NewCharacterIcon';
PreviousCharacterIcon.displayName = 'PreviousCharacterIcon';
