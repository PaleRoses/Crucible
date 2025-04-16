import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/router'; // Import Next.js router

// Define the options the hook accepts
interface UseScrollSpyOptions {
  containerRef: React.RefObject<HTMLElement>; // Ref to the scrollable container
  sectionIds: string[];                     // Array of all section IDs to observe
  offsetTop?: number;                       // Offset for sticky elements (e.g., nav height)
  enableHashSync?: boolean;                 // Flag to enable/disable URL hash updates
  scrollToOnLoad?: boolean;                 // Flag to scroll to hash on initial load
}

/**
 * Custom hook for scroll spying, section detection, and URL hash synchronization
 * specifically designed to work with Next.js router and cooperate with an
 * external smooth scroll mechanism that uses a 'data-scrolling-programmatically' attribute.
 */
export function useScrollSpy({
  containerRef,
  sectionIds,
  offsetTop = 0,       // Default offset to 0
  enableHashSync = true, // Default to enabling hash sync
  scrollToOnLoad = true, // Default to scrolling on load
}: UseScrollSpyOptions): string | null { // Returns the active section ID or null

  const router = useRouter(); // Get router instance
  const [activeSection, setActiveSection] = useState<string | null>(null); // State for the active section ID
  const observerRef = useRef<IntersectionObserver | null>(null); // Ref to store the observer instance
  const initialScrollDoneRef = useRef<boolean>(false); // Ref to track if initial scroll has happened

  // --- Internal Scroll Function (for initial load ONLY) ---
  // Uses native scroll for simplicity on load. Clicks use useSmoothScroll.
  const scrollToIdOnLoad = useCallback((id: string) => {
    const container = containerRef.current;
    if (!container) return;

    // Find the target element using ID or data-attribute
    const target = container.querySelector<HTMLElement>(
      `#${CSS.escape(id)}, [data-section-id="${CSS.escape(id)}"]`
    );
    if (!target) return;

    console.log(`[useScrollSpy] Initial scroll triggered for: #${id}`);
    const top = target.offsetTop - offsetTop; // Calculate position including offset
    container.scrollTo({ top, behavior: 'auto' }); // Use 'auto' for instant jump on load

    // Immediately set the active section state AFTER the initial scroll/jump
    // to ensure the UI reflects the loaded section correctly.
    setActiveSection(id);

  }, [containerRef, offsetTop]);

  // --- Effect 1: Scroll to Hash on Initial Load ---
  useEffect(() => {
    // Only run if scrollToOnLoad is enabled, router is ready, and initial scroll hasn't happened yet
    if (!scrollToOnLoad || !router.isReady || initialScrollDoneRef.current) {
      return;
    }

    const hash = router.asPath.split('#')[1]; // Get hash from current Next.js path

    if (hash && sectionIds.includes(hash)) {
      // Use setTimeout to ensure the layout is stable before scrolling.
      // This is a common workaround, adjust delay if needed.
      const timerId = setTimeout(() => {
        scrollToIdOnLoad(hash);
        initialScrollDoneRef.current = true; // Mark initial scroll as done
      }, 150); // Small delay (e.g., 100-200ms)

      return () => clearTimeout(timerId); // Cleanup timeout
    } else {
      // If no valid hash, mark initial scroll as done anyway
      initialScrollDoneRef.current = true;
    }

  }, [scrollToOnLoad, router.isReady, router.asPath, sectionIds, scrollToIdOnLoad]);

  // --- Effect 2: Setup IntersectionObserver ---
  useEffect(() => {
    const container = containerRef.current;
    // Ensure container exists and we have section IDs to observe
    if (!container || sectionIds.length === 0) {
      return;
    }

    // Disconnect any previous observer instance before creating a new one
    observerRef.current?.disconnect();

    // Create the IntersectionObserver instance
    const observer = new IntersectionObserver(
      (entries) => {
        // --- CRITICAL CHECK: Ignore observer if scrolling programmatically ---
        if (containerRef.current?.hasAttribute('data-scrolling-programmatically')) {
          console.log('[useScrollSpy] Observer ignored: Programmatic scroll detected.');
          return; // Do nothing if the main scroll function is active
        }
        // --- End Critical Check ---

        // Filter entries that are currently intersecting the viewport
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);

        // Find the entry whose top is closest to the offset line (from the top)
        let bestCandidate: IntersectionObserverEntry | null = null;
        let smallestTopDistance = Infinity;

        visibleEntries.forEach((entry) => {
          const topDistance = entry.boundingClientRect.top - offsetTop;
          // Consider entries that are at or below the offset line
          if (topDistance >= 0 && topDistance < smallestTopDistance) {
            smallestTopDistance = topDistance;
            bestCandidate = entry;
          }
          // If no entry is below the line, consider the one closest *above* the line
          // (This handles cases where the top of a section is slightly above the offset line but still the most prominent)
          else if (bestCandidate === null && topDistance < 0 && Math.abs(topDistance) < smallestTopDistance) {
             smallestTopDistance = Math.abs(topDistance); // Use absolute distance here
             bestCandidate = entry; // Tentative candidate
          }
        });


        if (bestCandidate !== null) {
          const id = (bestCandidate as IntersectionObserverEntry).target.getAttribute('data-section-id'); // Get the section ID

          // Update state only if the ID is valid and different from the current active section
          if (id && id !== activeSection) {
             console.log(`[useScrollSpy] Observer detected new active section: ${id}`);
            setActiveSection(id);
          }
        }
      },
      {
        root: container, // Observe within the specified container
        // Adjust rootMargin:
        // - Negative top margin pushes the intersection line down by the offsetTop amount.
        // - Negative bottom margin (-40%) means the element needs to be further up from the bottom
        //   before it's considered "out". This helps keep sections active longer when scrolling down.
        rootMargin: `-${offsetTop}px 0px -40% 0px`,
        // Thresholds trigger the callback when these percentages of the element are visible
        threshold: [0, 0.1, 0.5, 0.9, 1.0], // More granular thresholds might help
      }
    );

    // Observe each section element identified by ID or data-attribute
    sectionIds.forEach((id) => {
      const el = container.querySelector<HTMLElement>(
        `#${CSS.escape(id)}, [data-section-id="${CSS.escape(id)}"]`
      );
      if (el) {
        // Ensure the element has the data-section-id attribute for the observer callback
        el.setAttribute('data-section-id', id);
        observer.observe(el);
      } else {
        console.warn(`[useScrollSpy] Could not find element for section ID: ${id}`);
      }
    });

    // Store the observer instance in the ref
    observerRef.current = observer;

    // Cleanup function: Disconnect the observer when the component unmounts or dependencies change
    return () => {
      console.log('[useScrollSpy] Disconnecting observer.');
      observer.disconnect();
    };
    // Dependencies: Re-run this effect if sections, container, or offset changes
  }, [sectionIds, containerRef, offsetTop, activeSection]); // Include activeSection to ensure comparison logic is up-to-date

  // --- Effect 3: Sync URL Hash with Active Section ---
  useEffect(() => {
    // Only run if hash sync is enabled, router is ready, and we have a valid active section
    if (!enableHashSync || !router.isReady || !activeSection || !initialScrollDoneRef.current) {
      return;
    }

    const currentHash = router.asPath.split('#')[1]; // Get current hash

    // Update URL only if the active section ID is different from the current hash
    if (currentHash !== activeSection) {
       console.log(`[useScrollSpy] Syncing hash: #${activeSection}`);
      router.replace(
        { pathname: router.pathname, query: router.query, hash: activeSection }, // Include existing path and query
        undefined, // 'as' path (can be undefined)
        { shallow: true, scroll: false } // Shallow routing prevents data refetching, scroll: false prevents browser auto-scroll on hash change
      );
    }
  }, [activeSection, enableHashSync, router, initialScrollDoneRef]); // Dependencies: Run when active section or router instance changes

  // Return the currently active section ID
  return activeSection;
}
