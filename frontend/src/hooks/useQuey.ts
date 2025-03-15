'use client';

import { 
  useQuery as useReactQuery, 
  UseQueryOptions, 
  QueryKey, 
  QueryFunction 
} from '@tanstack/react-query';
import { useLoading } from '../lib/progressiveloading/loading-core';
import { useEffect, useRef, useCallback } from 'react';

export type LoadPriority = 'critical' | 'important' | 'secondary' | 'deferred';

/**
 * UseQuery hook that integrates with the progressive loading system
 * 
 * This hook wraps TanStack's useQuery and registers the query as a component
 * with the loading system, allowing for coordinated loading states, dependencies,
 * and progress tracking.
 * 
 * @param componentId - Unique identifier for the component in the loading system
 * @param queryKey - TanStack React Query key for caching and deduplication
 * @param queryFn - Function that returns a promise resolving to data
 * @param options - Extended UseQueryOptions with additional loading system parameters
 * @returns The standard TanStack useQuery result
 */
export function useQuery<TData = unknown, TError = unknown>(
  componentId: string,
  queryKey: QueryKey,
  queryFn: QueryFunction<TData>,
  options?: UseQueryOptions<TData, TError> & {
    priority?: LoadPriority;
    weight?: number;
    dependencies?: string[];
    maxWaitTime?: number;
  }
) {
  const {
    registerComponent,
    markComponentLoaded,
    notifyError,
    isComponentLoaded,
    getPriorityWeight
  } = useLoading();
  
  // Extract loading-specific options and default values
  const {
    priority = 'important',
    weight,
    dependencies = [],
    maxWaitTime = 10000,
    ...queryOptions
  } = options || {};
  
  // Calculate weight based on priority if not explicitly provided
  const finalWeight = weight ?? getPriorityWeight(priority);
  
  // Track component registration and loading state
  const registeredRef = useRef(false);
  const loadedRef = useRef(false);
  const isMountedRef = useRef(true);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clear any safety timeouts, ensuring proper cleanup
  const clearSafetyTimeout = useCallback(() => {
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
  }, []);
  
  // Helper function to safely mark component as loaded
  const ensureComponentLoaded = useCallback(() => {
    if (isMountedRef.current && !loadedRef.current && !isComponentLoaded(componentId)) {
      if (process.env.NODE_ENV !== 'production') {
        console.debug(`[useQuery] Marking component as loaded: ${componentId}`);
      }
      markComponentLoaded(componentId);
      loadedRef.current = true;
    }
  }, [componentId, isComponentLoaded, markComponentLoaded]);
  
  // Ensure component is registered on mount
  useEffect(() => {
    isMountedRef.current = true;
    
    if (!registeredRef.current) {
      registerComponent(componentId, priority, finalWeight, dependencies);
      registeredRef.current = true;
      
      if (process.env.NODE_ENV !== 'production') {
        console.debug(`[useQuery] Registered component: ${componentId} with priority ${priority}`);
      }
    }
    
    // Safety timeout - ensures the component is marked as loaded even if the query hangs
    safetyTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current && !loadedRef.current) {
        console.warn(`[useQuery] Safety timeout triggered for component ${componentId} after ${maxWaitTime}ms`);
        ensureComponentLoaded();
      }
    }, maxWaitTime);
    
    // Cleanup on unmount - this fixes potential memory leaks and stale closures
    return () => {
      isMountedRef.current = false;
      clearSafetyTimeout();
    };
  }, [
    componentId, 
    registerComponent, 
    priority, 
    finalWeight, 
    dependencies, 
    maxWaitTime, 
    ensureComponentLoaded, 
    clearSafetyTimeout
  ]);
  
  // Execute the query with React Query
  const queryResult = useReactQuery<TData, TError>({
    queryKey,
    queryFn,
    ...queryOptions,
  });
  
  // Watch for query state changes to update loading state
  useEffect(() => {
    // Only proceed if the component is still mounted
    if (!isMountedRef.current) return;
    
    // Consider terminal states where loading should be considered complete
    const isTerminalState = queryResult.isSuccess || 
                            queryResult.isError || 
                            (queryResult.isFetched && !queryResult.isFetching && !queryResult.isLoading);
    
    if (isTerminalState) {
      ensureComponentLoaded();
      clearSafetyTimeout();
    }
    
    // Handle errors - report to loading system but still mark as loaded
    if (queryResult.isError && queryResult.error) {
      const errorObject = queryResult.error instanceof Error
        ? queryResult.error
        : new Error(String(queryResult.error));
      
      console.error(`[useQuery] Error in query ${componentId}:`, errorObject);
      
      // Only notify if component is still mounted
      if (isMountedRef.current) {
        notifyError(componentId, errorObject);
        ensureComponentLoaded();
      }
    }
  }, [
    componentId,
    ensureComponentLoaded,
    notifyError,
    clearSafetyTimeout,
    queryResult.isSuccess,
    queryResult.isError,
    queryResult.isFetched,
    queryResult.isFetching,
    queryResult.isLoading,
    queryResult.error
  ]);
  
  return queryResult;
}