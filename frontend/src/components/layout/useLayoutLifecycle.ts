// src/components/layout/useLayoutLifecycle.ts

import { useState, useEffect, useRef } from 'react';

export function useLayoutLifecycle() {
  // == State Variables ==
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [isChangingRoute, setIsChangingRoute] = useState(false);

  // == Refs ==
  const contentRef = useRef<HTMLDivElement>(null);

  // == Effects ==

  // --- Font Loading useEffect ---
  useEffect(() => {
    let typekitTimeoutId: NodeJS.Timeout | null = null;
    let fallbackTimeoutId: NodeJS.Timeout | null = null;
    let initialTimeoutId: NodeJS.Timeout | null = null;
    let fontsReady = false; // Flag to prevent duplicate sets

    console.log("Hook: Font loading effect mounted.");

    try {
      // Use document.fonts.ready first if available
      if (document.fonts) {
        document.fonts.ready.then(() => {
          if (!fontsReady) { // Check flag
            console.log("Hook: Document fonts ready.");
            fontsReady = true; // Set flag
            setFontsLoaded(true);
          }
        }).catch(err => {
          console.error("Hook: document.fonts.ready error:", err);
          // Don't set fonts loaded here, let Typekit/fallback handle it
        });
      }

      const typekitLoad = () => {
        // Only attempt Typekit if fonts aren't already confirmed ready
        if (!fontsReady && window.Typekit) {
          try {
            console.log("Hook: Loading Typekit...");
            // *** FIX: Call Typekit.load ONLY with known properties ***
            window.Typekit.load({
              async: true,
              // Removed loading, active, inactive properties due to TS error
            });

            // Set a safety timeout since we don't have active/inactive callbacks here
            typekitTimeoutId = setTimeout(() => {
              if (!fontsReady) { // Check flag again before timeout sets it
                 console.log("Hook: Typekit load safety timeout reached.");
                 fontsReady = true; // Set flag
                 setFontsLoaded(true);
              }
            }, 1500); // Safety timeout if Typekit load takes too long or fails silently

          } catch (e) {
            console.error('Hook: Error loading Adobe fonts:', e);
            if (!fontsReady) { // Check flag
                fontsReady = true; // Set flag
                setFontsLoaded(true); // Mark as loaded even on error to unblock UI
            }
          }
        } else if (!fontsReady) {
          // If Typekit isn't available and document.fonts didn't resolve
          console.log("Hook: Typekit not found or fonts already ready, using fallback timeout.");
          fallbackTimeoutId = setTimeout(() => {
             if (!fontsReady) { // Check flag
                fontsReady = true; // Set flag
                setFontsLoaded(true);
             }
          }, 500);
        }
      };
      // Initial delay before trying to load Typekit
      initialTimeoutId = setTimeout(typekitLoad, 100);

    } catch (e) {
        console.error('Hook: Error in font loading process:', e);
        if (!fontsReady) { // Check flag
            fontsReady = true; // Set flag
            setFontsLoaded(true); // Ensure loading finishes even on outer error
        }
    }

    // Cleanup timeouts on unmount
    return () => {
      console.log("Hook: Font loading effect cleanup.");
      if (typekitTimeoutId) clearTimeout(typekitTimeoutId);
      if (fallbackTimeoutId) clearTimeout(fallbackTimeoutId);
      if (initialTimeoutId) clearTimeout(initialTimeoutId);
    };

  }, []); // Empty dependency array: Runs once on mount

  // --- Route Change & Content Ready useEffect ---
  useEffect(() => {
    // (Keep your exact route change listening logic here - accessing window)
    const handleRouteChangeStart = () => {
        console.log("Hook: Route change start detected.");
        setIsChangingRoute(true);
        if (contentRef.current) contentRef.current.classList.add('transitioning');
    };
    const handleRouteChangeComplete = () => {
        setTimeout(() => {
            console.log("Hook: Route change complete.");
            setIsChangingRoute(false);
            if (contentRef.current) contentRef.current.classList.remove('transitioning');
        }, 50);
    };

    console.log("Hook: Setting up route change listeners.");
    window.addEventListener('navigate', handleRouteChangeStart);
    window.addEventListener('navigatesuccess', handleRouteChangeComplete);
    // Add other listeners (beforeunload, Router.events fallback) if needed

    let contentReadyTimeoutId: NodeJS.Timeout | null = null;
    // Set content ready ONLY after fonts are loaded
    if (fontsLoaded) {
        console.log("Hook: Fonts loaded, setting content ready soon.");
        contentReadyTimeoutId = setTimeout(() => {
            console.log("Hook: Setting content ready.");
            setContentReady(true);
        }, 100); // Delay before showing content after fonts load
    } else {
        console.log("Hook: Waiting for fonts to load before setting content ready.");
    }

    return () => {
        // Cleanup listeners & timeouts
        console.log("Hook: Cleaning up route change listeners.");
        window.removeEventListener('navigate', handleRouteChangeStart);
        window.removeEventListener('navigatesuccess', handleRouteChangeComplete);
        // Add other cleanup if needed
        if (contentReadyTimeoutId) clearTimeout(contentReadyTimeoutId);
    };
  }, [fontsLoaded]); // Re-run this effect if fontsLoaded changes


  // == Return values needed by the component ==
  return {
    fontsLoaded,
    contentReady,
    isChangingRoute,
    contentRef,
  };
}