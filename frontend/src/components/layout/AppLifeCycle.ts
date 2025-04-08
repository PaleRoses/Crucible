// hooks/useAppLifecycle.ts
'use client';

import { useState, useEffect, useRef } from 'react';

// --- Navigation API Type Definitions ---
// NOTE: It's best practice to put these in a global .d.ts file (e.g., navigation.d.ts or global.d.ts)
// Add this to your project if you don't have @types/wicg-navigation-api installed
declare global {
  interface Window {
    // FIX: Removed the local Typekit definition below.
    // TypeScript will now rely on the definition provided in your global .d.ts file
    // (e.g., src/app/styles/types/types.d.ts) to avoid conflict TS2717.

    // Add Navigation API types
    navigation?: Navigation;
  }

  interface NavigationEventMap {
    navigate: NavigateEvent;
    navigatesuccess: Event; // Standard Event type for success
    navigateerror: ErrorEvent; // Standard ErrorEvent type for errors
    // Add other navigation events if needed (e.g., currententrychange)
  }

  interface Navigation extends EventTarget {
    addEventListener<K extends keyof NavigationEventMap>(type: K, listener: (this: Navigation, ev: NavigationEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof NavigationEventMap>(type: K, listener: (this: Navigation, ev: NavigationEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    // Add other Navigation API methods and properties if you use them (e.g., back(), forward(), entries())
  }

  interface NavigateEvent extends Event {
      // Define properties of NavigateEvent you might use
      canIntercept: boolean;
      destination: { url: string; /* other properties */ };
      intercept(options?: { handler: () => Promise<void> }): void;
      // Add other NavigateEvent properties as needed
  }
}
// --- End Navigation API Type Definitions ---


// Define the structure for the hook's return value
interface AppLifecycleState {
  fontsLoaded: boolean;
  contentReady: boolean;
  isChangingRoute: boolean;
  contentRef: React.RefObject<HTMLDivElement | null>;
}


/**
 * Custom hook to manage application lifecycle events:
 * - Font loading detection (Native and Adobe Typekit)
 * - Content readiness state
 * - Route change transitions for Next.js App Router and Pages Router (fallback)
 */
export function useAppLifecycle(): AppLifecycleState {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [isChangingRoute, setIsChangingRoute] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const fontLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentReadyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const routeChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to handle font loading
  useEffect(() => {
    let isMounted = true; // Track component mount status

    const handleFontLoadSuccess = () => {
      if (isMounted) {
        console.log('Fonts loaded successfully.');
        setFontsLoaded(true);
        if (fontLoadTimeoutRef.current) {
          clearTimeout(fontLoadTimeoutRef.current); // Clear fallback timeout
        }
      }
    };

    const handleFontLoadFailure = (error: unknown) => {
      if (isMounted) {
        console.error('Error loading fonts:', error);
        setFontsLoaded(true); // Mark as loaded even on failure to prevent blocking
      }
    };

    const loadTypekitOrFallback = () => {
      // Now relies on the globally defined window.Typekit type
      if (window.Typekit) {
        try {
          console.log('Attempting to load Typekit fonts...');
          window.Typekit.load({ async: true });
          fontLoadTimeoutRef.current = setTimeout(() => {
             console.log('Font load timeout reached, assuming fonts loaded.');
             handleFontLoadSuccess();
          }, 1500);
        } catch (e) {
          handleFontLoadFailure(e);
        }
      } else {
         if (!document.fonts) {
           console.log('No Typekit found, setting font load timeout.');
           fontLoadTimeoutRef.current = setTimeout(handleFontLoadSuccess, 500);
         }
      }
    };

    // --- Font Loading Logic ---
    try {
      if (document.fonts) {
        document.fonts.ready
          .then(handleFontLoadSuccess)
          .catch(handleFontLoadFailure);
        loadTypekitOrFallback();
      } else {
        console.warn('document.fonts API not supported, relying on Typekit/timeout.');
        loadTypekitOrFallback();
      }
    } catch (e) {
      handleFontLoadFailure(e);
    }

    // Cleanup function
    return () => {
      isMounted = false;
      if (fontLoadTimeoutRef.current) {
        clearTimeout(fontLoadTimeoutRef.current);
      }
    };
  }, []); // Run only once on mount

  // Effect to handle route change transitions
  useEffect(() => {
    let isMounted = true;

    const handleRouteChangeStart = (event?: Event) => {
      if (isMounted) {
        console.log('Route change started...');
        setIsChangingRoute(true);
        if (contentRef.current) {
          contentRef.current.classList.add('transitioning');
        }
      }
    };

    const handleRouteChangeComplete = () => {
       if (isMounted) {
         console.log('Route change complete.');
         routeChangeTimeoutRef.current = setTimeout(() => {
           if (isMounted) {
             setIsChangingRoute(false);
             if (contentRef.current) {
               contentRef.current.classList.remove('transitioning');
             }
           }
         }, 50);
       }
    };

    // --- Route Change Listeners ---
    if (typeof window !== 'undefined' && window.navigation) {
      console.log('Using Navigation API for transitions.');
      window.navigation.addEventListener('navigate', handleRouteChangeStart as EventListener);
      window.navigation.addEventListener('navigatesuccess', handleRouteChangeComplete);
      window.navigation.addEventListener('navigateerror', handleRouteChangeComplete);
    } else if (typeof window !== 'undefined') {
      try {
        import('next/router').then(Router => {
          if (Router && Router.default.events) {
             console.log('Using next/router events for transitions.');
            Router.default.events.on('routeChangeStart', handleRouteChangeStart);
            Router.default.events.on('routeChangeComplete', handleRouteChangeComplete);
            Router.default.events.on('routeChangeError', handleRouteChangeComplete);
          } else {
             console.warn('next/router events not available.');
          }
        }).catch(() => {
           console.warn('Could not import next/router.');
        });
      } catch (e) {
        console.warn('Error setting up next/router events:', e);
      }
      window.addEventListener('beforeunload', handleRouteChangeStart);
    }

    // Cleanup listeners
    return () => {
      isMounted = false;
      if (routeChangeTimeoutRef.current) {
        clearTimeout(routeChangeTimeoutRef.current);
      }

      if (typeof window !== 'undefined' && window.navigation) {
        window.navigation.removeEventListener('navigate', handleRouteChangeStart as EventListener);
        window.navigation.removeEventListener('navigatesuccess', handleRouteChangeComplete);
        window.navigation.removeEventListener('navigateerror', handleRouteChangeComplete);
      } else if (typeof window !== 'undefined') {
         try {
           import('next/router').then(Router => {
             if (Router && Router.default.events) {
               Router.default.events.off('routeChangeStart', handleRouteChangeStart);
               Router.default.events.off('routeChangeComplete', handleRouteChangeComplete);
               Router.default.events.off('routeChangeError', handleRouteChangeComplete);
             }
           }).catch(() => {});
         } catch (e) {}
        window.removeEventListener('beforeunload', handleRouteChangeStart);
      }
    };
  }, []); // Run only once on mount

  // Effect to set content ready state based on font loading
  useEffect(() => {
    let isMounted = true;
    if (fontsLoaded) {
      contentReadyTimeoutRef.current = setTimeout(() => {
        if (isMounted) {
          console.log('Content marked as ready.');
          setContentReady(true);
        }
      }, 100);
    }
    return () => {
       isMounted = false;
      if (contentReadyTimeoutRef.current) {
        clearTimeout(contentReadyTimeoutRef.current);
      }
    };
  }, [fontsLoaded]);

  return { fontsLoaded, contentReady, isChangingRoute, contentRef };
}
