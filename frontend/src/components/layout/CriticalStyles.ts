// styles/criticalStyles.ts

/**
 * Critical CSS styles to prevent Flash of Unstyled Content (FOUC)
 * and manage loading/transition states.
 * These styles are intended to be inlined in the <head> of the document.
 */
export const criticalStyles = `
  /* Loading overlay styles */
  .loading-overlay {
    position: fixed; /* Cover the entire viewport */
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--bg-color, #ffffff); /* Use theme variable or fallback */
    z-index: 9999; /* Ensure it's on top */
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 1; /* Start visible */
    visibility: visible;
    transition: opacity 0.5s ease-in-out, visibility 0.5s ease-in-out; /* Smooth fade out */
  }

  .loading-overlay.hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none; /* Prevent interaction when hidden */
  }

  /* Simple spinner for loading overlay */
  .loading-spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-left-color: var(--accent-color, #007bff); /* Use theme variable or fallback */
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Content visibility classes */
  .content-hidden {
    opacity: 0;
    visibility: hidden;
  }
  .content-visible {
    opacity: 1;
    visibility: visible;
    transition: opacity 0.5s ease-in-out 0.1s; /* Slight delay after loading */
  }

  /* Main content transitions - separate from navbar */
  .main-content {
    transition: opacity 300ms ease-in-out;
    will-change: opacity; /* Hint browser for optimization */
  }
  .main-content.transitioning {
    opacity: 0;
  }

  /* Persistent elements that shouldn't fade during transitions */
  .persistent-element {
    /* These elements should remain visible during page transitions */
    /* No specific styles needed here unless overriding other styles */
    position: relative; /* Ensure z-index works if needed */
    z-index: 100; /* Keep above transitioning content if necessary */
  }

  /* Ensure body takes up height and has base font */
  html, body {
    min-height: 100%;
    font-family: sans-serif; /* Basic fallback font */
  }

  body {
     background-color: var(--bg-color, #ffffff); /* Ensure body background matches overlay initially */
     margin: 0; /* Remove default body margin */
  }
`;