'use client'

import React, { useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { LoadingProvider } from '../lib/progressiveloading';

interface AppProvidersProps {
  children: React.ReactNode;
  initialLoaderThreshold?: number;
  enableAnalytics?: boolean;
  debugMode?: boolean;
  maxLoadingTime?: number;
}

export default function AppProviders({
  children,
  initialLoaderThreshold = 75,
  enableAnalytics = false,
  debugMode = false,
  maxLoadingTime = 20000
}: AppProvidersProps) {
  // Create a stable query client instance
  const queryClient = useRef(
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1 minute
          refetchOnWindowFocus: false,
          retry: 1,
          gcTime: 5 * 60 * 1000, // 5 minutes
        },
      },
    })
  ).current;

  const handleComplete = () => {
    // Performance metrics reporting
    if (typeof window !== 'undefined' && window.performance) {
      const loadTime = performance.now();
      console.info('Application fully loaded');
      
      try {
        const navigationEntries = performance.getEntriesByType('navigation');
        if (navigationEntries.length > 0) {
          const navigationTiming = navigationEntries[0] as PerformanceNavigationTiming;
          const pageLoadTime = navigationTiming.loadEventEnd - navigationTiming.startTime;
          
          console.info(`Page loaded in ${Math.round(pageLoadTime)}ms`);
          
          if (enableAnalytics) {
            // Report detailed metrics
            console.info('Performance metrics:', {
              totalLoadTime: pageLoadTime,
              domContentLoaded: navigationTiming.domContentLoadedEventEnd - navigationTiming.startTime,
              firstPaint: navigationTiming.responseEnd - navigationTiming.startTime,
              resourceLoad: navigationTiming.loadEventEnd - navigationTiming.domContentLoadedEventEnd
            });
          }
        }
      } catch {
        console.info(`Application loaded in approximately ${Math.round(loadTime)}ms`);
      }
    }
  };

  return (
    <LoadingProvider
      onComplete={handleComplete}
      initialLoaderThreshold={initialLoaderThreshold}
      debugMode={debugMode}
      maxLoadingTime={maxLoadingTime}
    >
      <QueryClientProvider client={queryClient}>
        {children}
        {debugMode && <ReactQueryDevtools initialIsOpen={false} position="bottom" />}
      </QueryClientProvider>
    </LoadingProvider>
  );
}