/**
 * Progressive Loading System - Loadable Component
 * 
 * This module provides a component that integrates with the loading system,
 * supporting data fetching, component dependencies, and conditional rendering.
 */

import React, { useReducer, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLoading, LoadPriority } from './loading-core';

// ========================================================
// TYPES AND INTERFACES
// ========================================================

export interface FetchConfig<T = unknown> {
  /** URL to fetch data from */
  url: string;
  
  /** Request method */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  
  /** Request headers */
  headers?: HeadersInit;
  
  /** Body for POST/PUT requests */
  body?: string | FormData | Record<string, unknown>;
  
  /** Response type */
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData';
  
  /** Whether to use credentials */
  withCredentials?: boolean;
  
  /** Cache strategy */
  cacheStrategy?: RequestCache;
  
  /** Max retries on failure */
  retries?: number;
  
  /** Timeout in milliseconds */
  timeout?: number;
  
  /** Transform response before returning */
  transform?: (data: unknown) => T;
}

export interface LoadableComponentProps<T = unknown> {
  /** Unique identifier for this component in the loading system */
  id: string;
  
  /** Content to render when component is visible */
  children: React.ReactNode | ((data: T, error: Error | null) => React.ReactNode);
  
  /** Loading priority that determines when this component appears */
  priority?: LoadPriority;
  
  /** Whether component should wait for all critical components to load before showing */
  waitForCritical?: boolean;
  
  /** Array of component IDs that must be loaded before this component can appear */
  dependencies?: string[];
  
  /** Content to show while component is loading (null means nothing is shown) */
  fallback?: React.ReactNode;
  
  /** Simulated load time in milliseconds (for development/testing) */
  delayMs?: number;
  
  /** Custom loading logic function that returns true when the component is ready */
  loadingStrategy?: () => Promise<boolean>;
  
  /** Data fetching configuration */
  fetchConfig?: FetchConfig<T>;
  
  /** Initial data (useful for SSR) */
  initialData?: T;
  
  /** CSS classes to apply to the wrapper element */
  className?: string;
  
  /** ARIA attributes for accessibility */
  ariaLive?: 'polite' | 'assertive' | 'off';
  
  /** Whether the component should fade in when becoming visible */
  enableFadeIn?: boolean;
  
  /** Transition duration in milliseconds */
  transitionDuration?: number;
  
  /** Callback for successful data load */
  onDataLoaded?: (data: T) => void;
  
  /** Callback for data fetch error */
  onError?: (error: Error) => void;
  
  /** Maximum time to wait before considering the component loaded (ms) */
  maxWaitTime?: number;
}

// Component state type for reducer
interface LoadableState<T> {
  isVisible: boolean;
  isLoaded: boolean;
  hasError: boolean;
  error: Error | null;
  data: T | undefined;
}

// Action types for the reducer
type LoadableAction<T> = 
  | { type: 'SET_VISIBLE'; visible: boolean }
  | { type: 'SET_LOADED'; loaded: boolean }
  | { type: 'SET_ERROR'; error: Error }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_DATA'; data: T };

// Data cache for global state sharing
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

// Global cache for shared data
const dataCache: Record<string, CacheItem<unknown>> = {};

// ========================================================
// UTILITY FUNCTIONS
// ========================================================

/**
 * Generate a cache key from fetch config
 */
function getCacheKey(fetchConfig: FetchConfig<unknown>): string {
  return fetchConfig.cacheStrategy === 'only-if-cached' 
    ? `${fetchConfig.url}|${fetchConfig.method || 'GET'}`
    : '';
}

/**
 * Check if array values have changed
 */
function haveDependenciesChanged(prev: string[] = [], next: string[] = []): boolean {
  if (prev.length !== next.length) return true;
  return prev.some((dep, i) => dep !== next[i]);
}

/**
 * Reducer for managing loadable component state
 */
function loadableReducer<T>(state: LoadableState<T>, action: LoadableAction<T>): LoadableState<T> {
  switch (action.type) {
    case 'SET_VISIBLE':
      return { ...state, isVisible: action.visible };
    
    case 'SET_LOADED':
      return { ...state, isLoaded: action.loaded };
    
    case 'SET_ERROR':
      return { 
        ...state, 
        hasError: true, 
        error: action.error,
        isLoaded: true // Mark as loaded even on error
      };
    
    case 'CLEAR_ERROR':
      return { ...state, hasError: false, error: null };
    
    case 'SET_DATA':
      return { ...state, data: action.data };
    
    default:
      return state;
  }
}

// ========================================================
// LOADABLE COMPONENT IMPLEMENTATION
// ========================================================

/**
 * Component that integrates with the loading system and supports 
 * data fetching, dependencies, and conditional rendering
 */
export function LoadableComponent<T = unknown>(props: LoadableComponentProps<T>): React.ReactElement {
  const {
    id,
    children,
    priority = 'important',
    waitForCritical = true,
    dependencies = [],
    fallback = null,
    delayMs = 0,
    loadingStrategy,
    fetchConfig,
    initialData,
    className = '',
    ariaLive = 'polite',
    enableFadeIn = true,
    transitionDuration = 300,
    onDataLoaded,
    onError,
    maxWaitTime = 10000
  } = props;
  
  // Get loading functions from context
  const {
    registerComponent,
    markComponentLoaded,
    isComponentLoaded,
    areAllComponentsWithPriorityLoaded,
    getPriorityWeight,
    notifyError
  } = useLoading();
  
  // Initialize component state with reducer
  const initialState: LoadableState<T> = {
    isVisible: !waitForCritical,
    isLoaded: false,
    hasError: false,
    error: null,
    data: initialData
  };
  
  const [state, dispatch] = useReducer(loadableReducer<T>, initialState);
  const { isVisible, isLoaded, hasError, error, data } = state;
  
  // Refs for tracking state and cleanup
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingCompleteRef = useRef(false);
  const prevDependenciesRef = useRef<string[]>(dependencies);
  
  // Safety cleanup function
  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);
  
  // Helper function to safely mark a component as loaded
  const safeMarkLoaded = useCallback(() => {
    if (mountedRef.current && !loadingCompleteRef.current) {
      markComponentLoaded(id);
      loadingCompleteRef.current = true;
      dispatch({ type: 'SET_LOADED', loaded: true });
    }
  }, [id, markComponentLoaded]);

  // Fetch data from the provided URL
  const fetchData = useCallback(async (): Promise<T | undefined> => {
    if (!fetchConfig) return undefined;
    
    // Create a new AbortController for this request
    abortControllerRef.current = new AbortController();
    
    try {
      // Check cache first if appropriate
      if (fetchConfig.cacheStrategy === 'only-if-cached') {
        const cacheKey = getCacheKey(fetchConfig);
        const cachedItem = dataCache[cacheKey] as CacheItem<T> | undefined;
        
        if (cachedItem && Date.now() < cachedItem.expiry) {
          return cachedItem.data;
        }
      }
      
      // Prepare fetch options
      const fetchOptions: RequestInit = {
        method: fetchConfig.method || 'GET',
        headers: fetchConfig.headers || {},
        signal: abortControllerRef.current.signal,
        credentials: fetchConfig.withCredentials ? 'include' : 'same-origin',
        cache: fetchConfig.cacheStrategy
      };
      
      // Add body for non-GET requests
      if (fetchConfig.method && fetchConfig.method !== 'GET' && fetchConfig.body) {
        if (typeof fetchConfig.body === 'object' && !(fetchConfig.body instanceof FormData)) {
          fetchOptions.headers = {
            'Content-Type': 'application/json',
            ...fetchOptions.headers
          };
          fetchOptions.body = JSON.stringify(fetchConfig.body);
        } else {
          fetchOptions.body = fetchConfig.body as BodyInit;
        }
      }
      
      // Set up timeout if specified
      let timeoutId: NodeJS.Timeout | undefined;
      if (fetchConfig.timeout) {
        timeoutId = setTimeout(() => {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
        }, fetchConfig.timeout);
      }
      
      // Execute fetch request
      const response = await fetch(fetchConfig.url, fetchOptions);
      
      // Clear timeout if set
      if (timeoutId) clearTimeout(timeoutId);
      
      // Handle response status
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      
      // Parse response based on content type
      let responseData: unknown;
      const responseType = fetchConfig.responseType || 'json';
      
      switch (responseType) {
        case 'json':
          responseData = await response.json();
          break;
        case 'text':
          responseData = await response.text();
          break;
        case 'blob':
          responseData = await response.blob();
          break;
        case 'arrayBuffer':
          responseData = await response.arrayBuffer();
          break;
        case 'formData':
          responseData = await response.formData();
          break;
        default:
          responseData = await response.json();
      }
      
      // Apply transformation if provided
      const transformedData: T = fetchConfig.transform ? 
        fetchConfig.transform(responseData) as T : 
        responseData as T;
      
      // Cache the result if appropriate
      if (fetchConfig.cacheStrategy === 'only-if-cached') {
        const cacheKey = getCacheKey(fetchConfig);
        dataCache[cacheKey] = {
          data: transformedData,
          timestamp: Date.now(),
          expiry: Date.now() + (24 * 60 * 60 * 1000) // Default 24h expiry
        };
      }
      
      return transformedData;
    } catch (error) {
      // Handle aborted requests gracefully
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Request was aborted');
      }
      
      throw error;
    }
  }, [fetchConfig]);

  // Load data and handle component state
  const loadData = useCallback(async () => {
    try {
      let result = true;
      let loadedData: T | undefined = undefined;
      
      // Use custom loading strategy if provided
      if (loadingStrategy) {
        try {
          result = await loadingStrategy();
        } catch (error) {
          console.error(`[LoadableComponent] Loading strategy error for component ${id}:`, error);
          result = false;
        }
      } 
      // Use fetch configuration if provided
      else if (fetchConfig) {
        try {
          loadedData = await fetchData();
          
          if (mountedRef.current && loadedData !== undefined) {
            dispatch({ type: 'SET_DATA', data: loadedData });
            if (onDataLoaded) {
              onDataLoaded(loadedData);
            }
          }
        } catch (error) {
          throw error;
        }
      } 
      // Use simulated loading with timeout
      else if (delayMs > 0) {
        await new Promise<void>(resolve => {
          timeoutRef.current = setTimeout(resolve, delayMs);
        });
      }
      
      // Only update state if component is still mounted
      if (mountedRef.current) {
        if (result) {
          safeMarkLoaded();
        } else {
          const loadError = new Error('Loading strategy returned false');
          dispatch({ type: 'SET_ERROR', error: loadError });
          notifyError?.(id, loadError);
          
          if (onError) {
            onError(loadError);
          }
          
          // Mark as loaded even when there's an error
          safeMarkLoaded();
        }
      }
    } catch (error) {
      if (mountedRef.current) {
        const loadError = error instanceof Error ? error : new Error('Unknown loading error');
        dispatch({ type: 'SET_ERROR', error: loadError });
        notifyError?.(id, loadError);
        
        if (onError) {
          onError(loadError);
        }
        
        // Mark as loaded even when there's an error
        safeMarkLoaded();
      }
    }
  }, [
    id,
    loadingStrategy,
    fetchConfig,
    fetchData,
    delayMs,
    notifyError,
    onDataLoaded,
    onError,
    safeMarkLoaded
  ]);

  // Check visibility based on critical component loading and dependencies
  const checkVisibility = useCallback(() => {
    // Skip if already visible
    if (isVisible) return;
    
    // Component is loaded and all dependencies are satisfied
    const dependenciesMet = dependencies.every(depId => isComponentLoaded(depId));
    
    // All critical components must be loaded if this component depends on critical path
    const criticalLoaded = !waitForCritical || 
      priority === 'critical' || 
      areAllComponentsWithPriorityLoaded('critical');
    
    // Make component visible when conditions are met
    if (criticalLoaded && dependenciesMet) {
      dispatch({ type: 'SET_VISIBLE', visible: true });
    }
  }, [
    isVisible,
    dependencies,
    waitForCritical,
    priority,
    isComponentLoaded,
    areAllComponentsWithPriorityLoaded
  ]);

  // Register component with loading system
  useEffect(() => {
    const weight = getPriorityWeight(priority);
    registerComponent(id, priority, weight, dependencies);
    loadingCompleteRef.current = false;
    prevDependenciesRef.current = [...dependencies];
    
    // Start loading process
    loadData();
    
    // Set up safety timeout to ensure component eventually loads
    safetyTimeoutRef.current = setTimeout(() => {
      if (!loadingCompleteRef.current) {
        console.warn(`[LoadableComponent] Safety timeout triggered for component ${id} after ${maxWaitTime}ms`);
        safeMarkLoaded();
      }
    }, maxWaitTime);
    
    return () => {
      mountedRef.current = false;
      clearTimeouts();
    };
  }, [
    id,
    priority,
    getPriorityWeight,
    registerComponent,
    dependencies,
    loadData,
    safeMarkLoaded,
    maxWaitTime,
    clearTimeouts
  ]);

  // Handle dependency changes
  useEffect(() => {
    // Only re-register if dependencies actually changed
    if (haveDependenciesChanged(prevDependenciesRef.current, dependencies)) {
      const weight = getPriorityWeight(priority);
      registerComponent(id, priority, weight, dependencies);
      prevDependenciesRef.current = [...dependencies];
    }
  }, [id, priority, registerComponent, getPriorityWeight, dependencies]);

  // Check visibility whenever dependencies or loading status changes
  useEffect(() => {
    checkVisibility();
  }, [checkVisibility, isLoaded]);

  // Calculate transition styles with memoization
  const transitionStyle = useMemo(() => 
    enableFadeIn 
      ? `opacity ${transitionDuration}ms ease-in-out, visibility ${transitionDuration}ms ease-in-out` 
      : 'none',
    [enableFadeIn, transitionDuration]
  );
  
  // Render error state if error occurs
  if (hasError && error) {
    return (
      <div 
        className={`loadable-component-error ${className}`} 
        role="alert" 
        aria-live="assertive"
      >
        {fallback || (
          <div className="p-4 bg-red-100 border border-red-200 text-red-700 rounded">
            Error loading component: {error.message}
          </div>
        )}
      </div>
    );
  }

  // Render children or fallback based on visibility state
  const renderContent = () => {
    if (!isVisible || !isLoaded) return fallback;
    
    if (typeof children === 'function') {
      return (children as (data: T, error: Error | null) => React.ReactNode)(data as T, error);
    }
    
    return children;
  };

  return (
    <div 
      className={`loadable-component ${className} ${isVisible && isLoaded ? 'is-loaded' : 'is-loading'}`}
      style={{ 
        visibility: isVisible && isLoaded ? 'visible' : 'hidden',
        opacity: isVisible && isLoaded ? 1 : 0,
        transition: transitionStyle
      }}
      data-priority={priority}
      data-component-id={id}
      data-loaded={isLoaded}
      aria-busy={!isLoaded}
      aria-live={ariaLive}
    >
      {renderContent()}
    </div>
  );
}