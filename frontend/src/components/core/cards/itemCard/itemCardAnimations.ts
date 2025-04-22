// Animation variants for ItemCard component
export const ANIMATIONS = {
    item: {
      hidden: { opacity: 0, scale: 1 },
      visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    },
  
    glow: { // Used for the icon glow effect
      initial: {
        opacity: 0,
        scale: 0.6
      },
      hover: {
        opacity: 1,
        scale: 1,
        transition: {
          opacity: { duration: 0.8, ease: "easeOut" },
          scale: { duration: 0.9, ease: "easeOut" }
        }
      },
      press: {
        opacity: 0.7,
        scale: 0.9,
        transition: {
          duration: 0.3,
          ease: "easeOut"
        }
      },
      exit: {
        opacity: 0,
        scale: 0.6,
        transition: {
          opacity: { duration: 0.5, ease: "easeOut" },
          scale: { duration: 0.5, ease: "easeOut" }
        }
      }
    },
  
    label: { // Used for the label text
      initial: {
        y: 0
      },
      hover: {
        y: -3,
        transition: {
          duration: 0.3,
          ease: "easeOut"
        }
      },
      press: {
        y: 1,
        transition: {
          duration: 0.2,
          ease: "easeOut"
        }
      }
    },
  
    goldenTab: { // Passed into useTabEffect
      initial: {
        height: '20%',
        top: '40%',
        opacity: 0.9
      },
      hover: {
        height: '70%',
        top: '15%',
        opacity: 1,
        transition: {
          height: { type: "spring", stiffness: 300, damping: 20, duration: 0.5 },
          top: { type: "spring", stiffness: 300, damping: 20, duration: 0.5 },
          opacity: { duration: 0.3, ease: "easeOut" }
        }
      },
      press: {
        opacity: 0.7,
        transition: { // Note: Opacity transition here might be overridden by hook's dynamic style calculation
          opacity: { duration: 0.3, ease: "easeOut" }
        }
      }
    },
  
    tabGlow: { // Passed into useTabEffect
      initial: {
        opacity: 0.2,
        width: '100%',
        height: '100%'
      },
      hover: {
        opacity: 0.4,
        width: '100%',
        height: '100%',
        transition: {
          opacity: { duration: 0.3, ease: "easeOut" }
        }
      },
      press: {
        opacity: 0.2,
        width: '100%',
        height: '100%',
        transition: {
          opacity: { duration: 0.2 }
        }
      }
    },
  };
  
  // Setup CSS variable for ripple scaling
  if (typeof document !== 'undefined') {
    const styleEl = document.createElement('style');
    styleEl.textContent = ':root { --ripple-scale: 2.5; }';
    document.head.appendChild(styleEl);
  }