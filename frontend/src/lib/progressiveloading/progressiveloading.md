'use client'

import React, { createContext, useContext, useEffect, useCallback, useMemo, useRef, memo, useReducer, useState } from 'react';
import { usePathname } from 'next/navigation';

// ========================================================
// TYPES AND INTERFACES
// ========================================================

export type LoadPriority = 'critical' | 'important' | 'secondary' | 'deferred';
export type ResponseType = 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData';

export interface ResourceOptions {
  trackImages?: boolean;
  trackFonts?: boolean;
  trackScripts?: boolean;
  trackStyles?: boolean;
}

export interface LoaderAppearance {
  width?: number;
  height?: number;
  radius?: number;
  speed?: number;
  trailLength?: number;
  cometSize?: number;
  cometHeadScale?: number;
  coreColor?: string;
  glowColor?: string;
  trailColor?: string;
}

export interface PageTransitionOptions {
  minDisplayTime?: number;
  fadeOutDuration?: number;
  transitionDuration?: number;
  showInitialLoaderOnly?: boolean;
  maxWaitTime?: number;
}

export interface FetchConfig<T = unknown> {
  /** URL to fetch data from */
  url: string;
  
  /** Request method (GET, POST, etc.) */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  
  /** Request headers */
  headers?: HeadersInit;
  
  /** Body for POST/PUT requests */
  body?: string | FormData | Record<string, unknown>;
  
  /** Content type (auto-detects if not specified) */
  contentType?: ResponseType;
  
  /** Whether to use credentials */
  withCredentials?: boolean;
  
  /** Cache strategy */
  cacheStrategy?: RequestCache;
  
  /** Max retries on failure */
  retries?: number;
  
  /** Timeout in milliseconds */
  timeout?: number;
  
  /** Whether to cache the response */
  enableCache?: boolean;
  
  /** Cache key */
  cacheKey?: string;
  
  /** Cache expiration time in milliseconds */
  cacheExpiration?: number;
  
  /** Transform response before returning */
  transform?: (data: unknown) => T;
}

interface ComponentState {
  id: string;
  loaded: boolean;
  priority: LoadPriority;
  weight: number;
  dependencies: string[];
  registeredAt: number;
  loadedAt: number | null;
  error: Error | null;
}

interface LoadingError {
  componentId: string;
  error: Error;
  timestamp: number;
}

interface LoadingAnalytics {
  totalComponents: number;
  loadedComponents: number;
  criticalPathTime: number;
  totalLoadTime: number;
  errors: LoadingError[];
  slowestComponents: Array<{id: string, loadTime: number}>;
  deviceInfo: {
    memory?: number;
    cores?: number;
    connection?: string;
    isMobile: boolean;
  };
}

interface LoadingContextProps {
  isPageLoaded: boolean;
  isInitialLoadComplete: boolean;
  isAnimationComplete: boolean;
  setAnimationComplete: (complete: boolean) => void;
  progress: number;
  criticalProgress: number;
  registerComponent: (id: string, priority: LoadPriority, weight: number, dependencies: string[]) => void;
  markComponentLoaded: (id: string) => void;
  isComponentLoaded: (id: string) => boolean;
  areAllComponentsWithPriorityLoaded: (priority: LoadPriority) => boolean;
  shouldShowLoader: () => boolean;
  getPriorityWeight: (priority: LoadPriority) => number;
  resetLoading: () => void;
  notifyError: (componentId: string, error: Error) => void;
  getAnalytics: () => LoadingAnalytics;
  setLoaderThresholds: (thresholds: {
    hideLoaderProgress?: number;
    criticalThreshold?: number;
  }) => void;
}

interface ResourceTrackingState {
  images: boolean;
  fonts: boolean;
  scripts: boolean;
  styles: boolean;
  dom: boolean;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

// ========================================================
// SAFETY TIMEOUT MANAGER
// ========================================================

/**
 * SafetyTimeoutManager coordinates all timeouts to prevent conflicts
 * and ensures that loading continues even if some resources fail to load
 */
class SafetyTimeoutManager {
  private timeouts: Map<string, NodeJS.Timeout> = new Map();
  private checkpoints: Array<{time: number, callback: () => void}> = [];
  private startTime: number;
  private maxTime: number;
  private running: boolean = false;
  
  constructor(maxTime: number) {
    this.startTime = performance.now();
    this.maxTime = maxTime;
  }
  
  /**
   * Add a checkpoint to be triggered at a specific time
   */
  addCheckpoint(relativeTime: number, callback: () => void): void {
    this.checkpoints.push({
      time: relativeTime,
      callback
    });
    
    // Sort checkpoints by time
    this.checkpoints.sort((a, b) => a.time - b.time);
    
    if (this.running) {
      this.scheduleNextCheckpoint();
    }
  }
  
  /**
   * Start the safety timer system
   */
  start(): void {
    if (this.running) return;
    
    this.running = true;
    this.scheduleNextCheckpoint();
  }
  
  /**
   * Schedule the next checkpoint timeout
   */
  private scheduleNextCheckpoint(): void {
    if (!this.running || this.checkpoints.length === 0) return;
    
    const now = performance.now();
    const elapsed = now - this.startTime;
    
    // Find the next checkpoint that hasn't been reached yet
    const nextCheckpoint = this.checkpoints.find(cp => cp.time > elapsed);
    
    if (nextCheckpoint) {
      const timeUntilNextCheckpoint = Math.max(0, nextCheckpoint.time - elapsed);
      
      const id = setTimeout(() => {
        nextCheckpoint.callback();
        this.timeouts.delete('checkpoint');
        this.scheduleNextCheckpoint();
      }, timeUntilNextCheckpoint);
      
      this.timeouts.set('checkpoint', id);
    }
  }
  
  /**
   * Set a named timeout
   */
  setTimeout(id: string, callback: () => void, delay: number): void {
    this.clearTimeout(id);
    
    const timeout = setTimeout(() => {
      callback();
      this.timeouts.delete(id);
    }, delay);
    
    this.timeouts.set(id, timeout);
  }
  
  /**
   * Clear a specific timeout by ID
   */
  clearTimeout(id: string): void {
    if (this.timeouts.has(id)) {
      clearTimeout(this.timeouts.get(id)!);
      this.timeouts.delete(id);
    }
  }
  
  /**
   * Cancel all timeouts and stop the system
   */
  cancel(): void {
    this.running = false;
    
    // Clear all timeouts
    for (const timeout of this.timeouts.values()) {
      clearTimeout(timeout);
    }
    
    this.timeouts.clear();
    this.checkpoints = [];
  }
}

// ========================================================
// PERFORMANCE SELECTORS
// ========================================================

/**
 * Selectors for efficiently extracting derived state
 */
const selectors = {
  /**
   * Calculate weighted progress values from component states
   */
  getWeightedProgress: (components: Record<string, ComponentState>): { 
    progress: number; 
    criticalProgress: number 
  } => {
    if (Object.keys(components).length === 0) {
      return { progress: 0, criticalProgress: 100 };
    }
    
    let totalWeight = 0;
    let loadedWeight = 0;
    let criticalTotalWeight = 0;
    let criticalLoadedWeight = 0;

    Object.values(components).forEach(component => {
      const { weight, loaded, priority } = component;
      
      totalWeight += weight;
      
      if (loaded) {
        loadedWeight += weight;
      }
      
      if (priority === 'critical') {
        criticalTotalWeight += weight;
        if (loaded) {
          criticalLoadedWeight += weight;
        }
      }
    });

    const progress = totalWeight > 0 
      ? Math.round((loadedWeight / totalWeight) * 100) 
      : 0;
    
    const criticalProgress = criticalTotalWeight > 0 
      ? Math.round((criticalLoadedWeight / criticalTotalWeight) * 100) 
      : 100;
    
    return { progress, criticalProgress };
  },
  
  /**
   * Check if all components are loaded
   */
  areAllComponentsLoaded: (components: Record<string, ComponentState>): boolean => {
    const componentList = Object.values(components);
    if (componentList.length === 0) return false;
    return componentList.every(comp => comp.loaded);
  },
  
  /**
   * Get loading times for analytics
   */
  getComponentLoadTimes: (components: Record<string, ComponentState>): Array<{id: string, loadTime: number}> => {
    return Object.values(components)
      .filter(comp => comp.loaded && comp.loadedAt !== null)
      .map(comp => ({
        id: comp.id,
        loadTime: (comp.loadedAt as number) - comp.registeredAt
      }))
      .sort((a, b) => b.loadTime - a.loadTime);
  }
};

// ========================================================
// UTILITY FUNCTIONS
// ========================================================

/**
 * Compare two arrays for equality (for memoization)
 */
function arrayEquals(a: unknown[], b: unknown[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  
  return true;
}

/**
 * Get device memory if available
 */
const getDeviceMemory = (): number | undefined => {
  if (typeof navigator !== 'undefined') {
    const nav = navigator as Navigator & { deviceMemory?: number };
    return nav.deviceMemory;
  }
  return undefined;
};

/**
 * Get network connection info if available
 */
const getConnectionInfo = (): { effectiveType?: string } => {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const nav = navigator as Navigator & { 
      connection?: { effectiveType?: string } 
    };
    return nav.connection || {};
  }
  return {};
};

/**
 * Check if device is mobile
 */
const isMobileDevice = (): boolean => {
  if (typeof navigator !== 'undefined') {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  return false;
};

// ========================================================
// STATE MANAGEMENT WITH REDUCER PATTERN
// ========================================================

// Loading state type
interface LoadingState {
  components: Record<string, ComponentState>;
  errors: LoadingError[];
  isAnimationComplete: boolean;
  isPageLoaded: boolean;
  isInitialLoadComplete: boolean;
  progress: number;
  criticalProgress: number;
  thresholds: {
    hideLoaderProgress: number;
    criticalThreshold: number;
  };
  analytics: LoadingAnalytics;
}

// Action types for the reducer
type LoadingAction = 
  | { type: 'REGISTER_COMPONENT'; id: string; priority: LoadPriority; weight: number; dependencies: string[] }
  | { type: 'MARK_COMPONENT_LOADED'; id: string }
  | { type: 'SET_ANIMATION_COMPLETE'; complete: boolean }
  | { type: 'SET_PAGE_LOADED'; loaded: boolean }
  | { type: 'SET_INITIAL_LOAD_COMPLETE'; complete: boolean }
  | { type: 'UPDATE_PROGRESS'; progress: number; criticalProgress: number }
  | { type: 'NOTIFY_ERROR'; componentId: string; error: Error }
  | { type: 'SET_THRESHOLDS'; thresholds: { hideLoaderProgress?: number; criticalThreshold?: number } }
  | { type: 'UPDATE_ANALYTICS'; analytics: Partial<LoadingAnalytics> }
  | { type: 'RESET_LOADING' };

/**
 * Main reducer for loading state management
 */
function loadingReducer(state: LoadingState, action: LoadingAction): LoadingState {
  switch (action.type) {
    case 'REGISTER_COMPONENT': {
      // Skip if already registered
      if (action.id in state.components) {
        return state;
      }
      
      // Validate dependencies (prevent self-dependency)
      const validDependencies = action.dependencies.filter(depId => depId !== action.id);
      
      // Create new component state
      const newComponent: ComponentState = {
        id: action.id,
        loaded: false,
        priority: action.priority,
        weight: action.weight,
        dependencies: validDependencies,
        registeredAt: performance.now(),
        loadedAt: null,
        error: null
      };
      
      return {
        ...state,
        components: {
          ...state.components,
          [action.id]: newComponent
        }
      };
    }
    
    case 'MARK_COMPONENT_LOADED': {
      // Skip if component doesn't exist or is already loaded
      if (!state.components[action.id] || state.components[action.id].loaded) {
        return state;
      }
      
      const now = performance.now();
      
      return {
        ...state,
        components: {
          ...state.components,
          [action.id]: {
            ...state.components[action.id],
            loaded: true,
            loadedAt: now
          }
        }
      };
    }
    
    case 'SET_ANIMATION_COMPLETE':
      return {
        ...state,
        isAnimationComplete: action.complete
      };
    
    case 'SET_PAGE_LOADED':
      return {
        ...state,
        isPageLoaded: action.loaded
      };
    
    case 'SET_INITIAL_LOAD_COMPLETE':
      return {
        ...state,
        isInitialLoadComplete: action.complete
      };
    
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        progress: action.progress,
        criticalProgress: action.criticalProgress
      };
    
    case 'NOTIFY_ERROR': {
      const componentError = {
        componentId: action.componentId,
        error: action.error,
        timestamp: performance.now()
      };
      
      // Update component error state
      const updatedComponents = { ...state.components };
      if (action.componentId in updatedComponents) {
        updatedComponents[action.componentId] = {
          ...updatedComponents[action.componentId],
          error: action.error
        };
      }
      
      return {
        ...state,
        components: updatedComponents,
        errors: [...state.errors, componentError]
      };
    }
    
    case 'SET_THRESHOLDS':
      return {
        ...state,
        thresholds: {
          ...state.thresholds,
          ...action.thresholds
        }
      };
    
    case 'UPDATE_ANALYTICS':
      return {
        ...state,
        analytics: {
          ...state.analytics,
          ...action.analytics
        }
      };
    
    case 'RESET_LOADING':
      return {
        ...state,
        components: {},
        errors: [],
        isPageLoaded: false,
        isInitialLoadComplete: false,
        isAnimationComplete: false,
        progress: 0,
        criticalProgress: 0
      };
    
    default:
      return state;
  }
}

// ========================================================
// CONTEXT AND PROVIDER
// ========================================================

const defaultContext: LoadingContextProps = {
  isPageLoaded: false,
  isInitialLoadComplete: false,
  isAnimationComplete: false,
  setAnimationComplete: () => {},
  progress: 0,
  criticalProgress: 0,
  registerComponent: () => {},
  markComponentLoaded: () => {},
  isComponentLoaded: () => false,
  areAllComponentsWithPriorityLoaded: () => false,
  shouldShowLoader: () => true,
  getPriorityWeight: () => 1,
  resetLoading: () => {},
  notifyError: () => {},
  getAnalytics: () => ({
    totalComponents: 0,
    loadedComponents: 0,
    criticalPathTime: 0,
    totalLoadTime: 0,
    errors: [],
    slowestComponents: [],
    deviceInfo: { isMobile: false }
  }),
  setLoaderThresholds: () => {}
};

const LoadingContext = createContext<LoadingContextProps>(defaultContext);

interface LoadingProviderProps {
  children: React.ReactNode;
  onComplete?: () => void;
  initialLoaderThreshold?: number;
  debugMode?: boolean;
  maxLoadingTime?: number;
}

// Global cache for shared data with proper typing
const dataCache: Record<string, CacheItem<unknown>> = {};

// ========================================================
// LOADING PROVIDER IMPLEMENTATION
// ========================================================

const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
  onComplete,
  initialLoaderThreshold = 75,
  debugMode = false,
  maxLoadingTime = 15000
}) => {
  // Initialize state with reducer
  const initialState: LoadingState = {
    components: {},
    errors: [],
    isAnimationComplete: false,
    isPageLoaded: false,
    isInitialLoadComplete: false,
    progress: 0,
    criticalProgress: 0,
    thresholds: {
      hideLoaderProgress: initialLoaderThreshold,
      criticalThreshold: 100
    },
    analytics: {
      totalComponents: 0,
      loadedComponents: 0,
      criticalPathTime: 0,
      totalLoadTime: 0,
      errors: [],
      slowestComponents: [],
      deviceInfo: {
        memory: getDeviceMemory(),
        cores: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : undefined,
        connection: getConnectionInfo().effectiveType,
        isMobile: isMobileDevice()
      }
    }
  };
  
  // Create reducer
  const [state, dispatch] = useReducer(loadingReducer, initialState);
  
  // Destructure state for easier access
  const { 
    components, 
    errors, 
    isAnimationComplete, 
    isPageLoaded, 
    isInitialLoadComplete,
    progress,
    criticalProgress,
    thresholds,
    analytics
  } = state;
  
  // Refs for optimized performance
  const onCompleteCalledRef = useRef(false);
  const componentsRef = useRef<Record<string, ComponentState>>({});
  const startTimeRef = useRef(performance.now());
  const criticalPathTimeRef = useRef<number | null>(null);
  const safetySystemRef = useRef<SafetyTimeoutManager | null>(null);
  
  // Route change detection
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);
  
  // Debug logging helper
  const logDebug = useCallback((message: string, data?: unknown) => {
    if (debugMode) {
      console.debug(`[ProgressiveLoading] ${message}`, data);
    }
  }, [debugMode]);

  // Keep componentsRef in sync with state
  useEffect(() => {
    componentsRef.current = components;
  }, [components]);

  // Set custom thresholds for loader behavior
  const setLoaderThresholds = useCallback((newThresholds: {
    hideLoaderProgress?: number;
    criticalThreshold?: number;
  }) => {
    dispatch({ 
      type: 'SET_THRESHOLDS', 
      thresholds: newThresholds 
    });
  }, []);

  // Get the weight for a priority level
  const getPriorityWeight = useCallback((priority: LoadPriority): number => {
    switch (priority) {
      case 'critical': return 4;
      case 'important': return 2;
      case 'secondary': return 1;
      case 'deferred': return 0.5;
      default: return 1;
    }
  }, []);

  // Register a component that needs to be loaded
  const registerComponent = useCallback((
    id: string, 
    priority: LoadPriority = 'important',
    weight: number = 1,
    dependencies: string[] = []
  ) => {
    logDebug(`Registering component: ${id}`);
    
    dispatch({
      type: 'REGISTER_COMPONENT',
      id,
      priority,
      weight,
      dependencies
    });
  }, [logDebug]);

  // Handle onComplete callback safely
  const handleCompletion = useCallback(() => {
    if (!onCompleteCalledRef.current && onComplete) {
      onCompleteCalledRef.current = true;
      
      // Ensure this runs only once
      try {
        onComplete();
      } catch (error) {
        console.error('[ProgressiveLoading] Error in onComplete callback:', error);
      }
    }
  }, [onComplete]);

  // Mark a component as loaded
  const markComponentLoaded = useCallback((id: string) => {
    logDebug(`Marking component as loaded: ${id}`);
    
    // Skip if component is unknown or already loaded
    if (!componentsRef.current[id] || componentsRef.current[id].loaded) {
      return;
    }
    
    dispatch({
      type: 'MARK_COMPONENT_LOADED',
      id
    });
  }, [logDebug]);

  // Set animation complete state
  const setAnimationComplete = useCallback((complete: boolean) => {
    dispatch({
      type: 'SET_ANIMATION_COMPLETE',
      complete
    });
  }, []);

  // Report an error during component loading
  const notifyError = useCallback((componentId: string, error: Error) => {
    logDebug(`Component ${componentId} reported error:`, error);
    
    dispatch({
      type: 'NOTIFY_ERROR',
      componentId,
      error
    });
  }, [logDebug]);

  // Check if a specific component is loaded
  const isComponentLoaded = useCallback((id: string): boolean => {
    return !!componentsRef.current[id]?.loaded;
  }, []);

  // Check if all components with a given priority are loaded
  const areAllComponentsWithPriorityLoaded = useCallback((priority: LoadPriority): boolean => {
    const componentsWithPriority = Object.values(componentsRef.current).filter(
      comp => comp.priority === priority
    );
    
    if (componentsWithPriority.length === 0) return true;
    
    return componentsWithPriority.every(comp => comp.loaded);
  }, []);

  // Determine if loader should be shown
  const shouldShowLoader = useCallback((): boolean => {
    // Don't show loader if loading is complete
    if (isPageLoaded || isAnimationComplete) {
      return false;
    }
    
    // Always show loader if critical components aren't loaded
    if (!areAllComponentsWithPriorityLoaded('critical')) {
      return true;
    }
    
    // If progress is below threshold
    if (!areAllComponentsWithPriorityLoaded('important') && progress < thresholds.hideLoaderProgress) {
      return true;
    }
    
    // Don't show for just secondary/deferred components
    return false;
  }, [
    areAllComponentsWithPriorityLoaded, 
    progress, 
    thresholds.hideLoaderProgress, 
    isPageLoaded, 
    isAnimationComplete
  ]);

  // Reset loading state
  const resetLoading = useCallback(() => {
    logDebug('Resetting loading state');
    
    dispatch({ type: 'RESET_LOADING' });
    
    // Reset refs
    startTimeRef.current = performance.now();
    criticalPathTimeRef.current = null;
    onCompleteCalledRef.current = false;
    
    // Cancel any existing safety system
    if (safetySystemRef.current) {
      safetySystemRef.current.cancel();
      safetySystemRef.current = null;
    }
  }, [logDebug]);

  // Get loading analytics data
  const getAnalytics = useCallback((): LoadingAnalytics => {
    return analytics;
  }, [analytics]);

  // Initialize safety timeout system
  useEffect(() => {
    // Only set up if not already initialized and there are components
    if (!safetySystemRef.current && Object.keys(components).length > 0 && !isPageLoaded) {
      const safetySystem = new SafetyTimeoutManager(maxLoadingTime);
      safetySystemRef.current = safetySystem;
      
      // Add checkpoints
      
      // Halfway checkpoint - force critical components
      safetySystem.addCheckpoint(maxLoadingTime / 2, () => {
        logDebug('Intermediate safety checkpoint: forcing critical components to complete');
        
        Object.keys(componentsRef.current).forEach(id => {
          if (componentsRef.current[id].priority === 'critical' && !componentsRef.current[id].loaded) {
            markComponentLoaded(id);
          }
        });
        
        dispatch({ type: 'SET_INITIAL_LOAD_COMPLETE', complete: true });
      });
      
      // Three-quarter checkpoint - force important components
      safetySystem.addCheckpoint(maxLoadingTime * 0.75, () => {
        logDebug('Three-quarter safety checkpoint: forcing important components to complete');
        
        Object.keys(componentsRef.current).forEach(id => {
          if (componentsRef.current[id].priority === 'important' && !componentsRef.current[id].loaded) {
            markComponentLoaded(id);
          }
        });
      });
      
      // Final checkpoint - force all components
      safetySystem.addCheckpoint(maxLoadingTime, () => {
        logDebug('Final safety checkpoint: forcing all components to complete');
        
        Object.keys(componentsRef.current).forEach(id => {
          if (!componentsRef.current[id].loaded) {
            markComponentLoaded(id);
          }
        });
        
        dispatch({ type: 'SET_PAGE_LOADED', loaded: true });
        dispatch({ type: 'SET_INITIAL_LOAD_COMPLETE', complete: true });
        
        console.warn(`⚠️ Loading forced to complete after ${maxLoadingTime}ms due to timeout`);
        
        handleCompletion();
      });
      
      // Start the safety system
      safetySystem.start();
    }
    
    return () => {
      if (safetySystemRef.current) {
        safetySystemRef.current.cancel();
        safetySystemRef.current = null;
      }
    };
  }, [components, isPageLoaded, maxLoadingTime, logDebug, markComponentLoaded, handleCompletion]);

  // Calculate progress based on loaded components and their weights
  useEffect(() => {
    const componentList = Object.values(components);
    if (componentList.length === 0) {
      return;
    }

    // Use selectors for efficient calculation
    const { progress: calculatedProgress, criticalProgress: calculatedCriticalProgress } = 
      selectors.getWeightedProgress(components);
    
    // Update progress in state
    dispatch({
      type: 'UPDATE_PROGRESS',
      progress: calculatedProgress,
      criticalProgress: calculatedCriticalProgress
    });

    // Calculate load times for analytics
    const componentLoadTimes = selectors.getComponentLoadTimes(components);

    // Update analytics
    dispatch({
      type: 'UPDATE_ANALYTICS',
      analytics: {
        totalComponents: componentList.length,
        loadedComponents: componentList.filter(comp => comp.loaded).length,
        criticalPathTime: criticalPathTimeRef.current ? 
          criticalPathTimeRef.current - startTimeRef.current : 0,
        totalLoadTime: isPageLoaded ? 
          performance.now() - startTimeRef.current : 0,
        errors,
        slowestComponents: componentLoadTimes.slice(0, 5)
      }
    });

    // Handle critical path completion
    const criticalTotalWeight = componentList
      .filter(comp => comp.priority === 'critical')
      .reduce((sum, comp) => sum + comp.weight, 0);
    
    if (calculatedCriticalProgress >= thresholds.criticalThreshold && 
        criticalTotalWeight > 0 && 
        !criticalPathTimeRef.current) {
      criticalPathTimeRef.current = performance.now();
      dispatch({ type: 'SET_INITIAL_LOAD_COMPLETE', complete: true });
      logDebug('Initial load complete (critical path)');
    }

    // Handle full page load completion
    if (calculatedProgress === 100 && componentList.length > 0 && !isPageLoaded) {
      dispatch({ type: 'SET_PAGE_LOADED', loaded: true });
      handleCompletion();
    }
    
    // Also check if all components are loaded
    if (!isPageLoaded && selectors.areAllComponentsLoaded(components) && componentList.length > 0) {
      dispatch({ type: 'SET_PAGE_LOADED', loaded: true });
      handleCompletion();
    }
  }, [
    components, 
    isPageLoaded, 
    thresholds.criticalThreshold, 
    errors, 
    logDebug, 
    handleCompletion
  ]);

  // Reset loading state when route changes
  useEffect(() => {
    if (pathname !== prevPathRef.current) {
      logDebug(`Route changed from ${prevPathRef.current} to ${pathname}`);
      resetLoading();
      prevPathRef.current = pathname;
    }
  }, [pathname, resetLoading, logDebug]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<LoadingContextProps>(() => ({
    isPageLoaded,
    isInitialLoadComplete,
    isAnimationComplete,
    setAnimationComplete,
    progress,
    criticalProgress,
    registerComponent,
    markComponentLoaded,
    isComponentLoaded,
    areAllComponentsWithPriorityLoaded,
    shouldShowLoader,
    getPriorityWeight,
    resetLoading,
    notifyError,
    getAnalytics,
    setLoaderThresholds
  }), [
    isPageLoaded,
    isInitialLoadComplete,
    isAnimationComplete,
    progress,
    criticalProgress,
    registerComponent,
    markComponentLoaded,
    isComponentLoaded,
    areAllComponentsWithPriorityLoaded,
    shouldShowLoader,
    getPriorityWeight,
    resetLoading,
    notifyError,
    getAnalytics,
    setLoaderThresholds,
    setAnimationComplete
  ]);

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
};

// Hook to access the LoadingContext
const useLoading = (): LoadingContextProps => {
  const context = useContext(LoadingContext);
  
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  
  return context;
};

// ========================================================
// RESOURCE LOADER COMPONENT
// ========================================================

interface ResourceLoaderProps {
  id?: string;
  priority?: LoadPriority;
  options?: ResourceOptions;
  maxWaitTime?: number;
}

const ResourceLoader: React.FC<ResourceLoaderProps> = ({
  id = 'page-resources',
  priority = 'critical',
  options = {
    trackImages: true,
    trackFonts: true,
    trackScripts: true,
    trackStyles: true
  },
  maxWaitTime = 8000
}) => {
  const { 
    registerComponent, 
    markComponentLoaded, 
    getPriorityWeight,
    isComponentLoaded 
  } = useLoading();
  
  const { trackImages, trackFonts, trackScripts, trackStyles } = options;
  
  // Track mounted state
  const isMountedRef = useRef(true);
  
  // Resource tracking state
  const resourcesRef = useRef<ResourceTrackingState>({
    images: false,
    fonts: false,
    scripts: false,
    styles: false,
    dom: false
  });
  
  // Track if component is fully loaded
  const isRegisteredRef = useRef(false);
  const isLoadedRef = useRef(false);
  
  // Safety timeouts manager
  const safetyTimeoutsRef = useRef<SafetyTimeoutManager | null>(null);
  
  // Helper function to safely mark a component as loaded
  const safeMarkLoaded = useCallback((componentId: string) => {
    if (isMountedRef.current && !isComponentLoaded(componentId)) {
      markComponentLoaded(componentId);
    }
  }, [isComponentLoaded, markComponentLoaded]);
  
  // Check if all resources are loaded
  const checkAllResourcesLoaded = useCallback(() => {
    if (isLoadedRef.current) return; // Skip if already loaded
    
    const { images, fonts, scripts, styles, dom } = resourcesRef.current;
    const allTrackedResourcesLoaded = 
      (!trackImages || images) && 
      (!trackFonts || fonts) && 
      (!trackScripts || scripts) && 
      (!trackStyles || styles) && 
      dom;
    
    if (allTrackedResourcesLoaded) {
      safeMarkLoaded(id);
      isLoadedRef.current = true;
    }
  }, [id, safeMarkLoaded, trackFonts, trackImages, trackScripts, trackStyles]);

  // Create safety timeout manager
  useEffect(() => {
    safetyTimeoutsRef.current = new SafetyTimeoutManager(maxWaitTime);
    safetyTimeoutsRef.current.start();
    
    return () => {
      if (safetyTimeoutsRef.current) {
        safetyTimeoutsRef.current.cancel();
      }
    };
  }, [maxWaitTime]);

  // Main effect for resource tracking
  useEffect(() => {
    // Skip if already registered
    if (isRegisteredRef.current) return;
    
    // Register components
    const weight = getPriorityWeight(priority);
    registerComponent(id, priority, weight, []);
    isRegisteredRef.current = true;
    
    // Register subcomponents
    if (trackImages) registerComponent(`${id}-images`, priority, weight * 0.4, []);
    if (trackFonts) registerComponent(`${id}-fonts`, priority, weight * 0.2, []);
    if (trackScripts) registerComponent(`${id}-scripts`, priority, weight * 0.3, []);
    if (trackStyles) registerComponent(`${id}-styles`, priority, weight * 0.1, []);
    registerComponent(`${id}-dom`, priority, weight * 0.5, []);
    
    // Safety timeouts manager
    const safetySystem = safetyTimeoutsRef.current!;
    
    // Track document ready state
    const trackDocumentReady = () => {
      if (document.readyState === 'interactive' || document.readyState === 'complete') {
        safeMarkLoaded(`${id}-dom`);
        resourcesRef.current.dom = true;
        checkAllResourcesLoaded();
      }
    };
    
    // Track when page is fully loaded
    const trackPageFullyLoaded = () => {
      if (document.readyState === 'complete') {
        if (trackImages) safeMarkLoaded(`${id}-images`);
        if (trackFonts) safeMarkLoaded(`${id}-fonts`);
        if (trackScripts) safeMarkLoaded(`${id}-scripts`);
        if (trackStyles) safeMarkLoaded(`${id}-styles`);
        safeMarkLoaded(`${id}-dom`);
        safeMarkLoaded(id);
        
        // Update tracking state
        resourcesRef.current = {
          images: true,
          fonts: true,
          scripts: true,
          styles: true,
          dom: true
        };
        
        isLoadedRef.current = true;
      }
    };
    
    // Check initial state
    trackDocumentReady();
    trackPageFullyLoaded();
    
    // Add event listeners
    window.addEventListener('load', trackPageFullyLoaded);
    document.addEventListener('DOMContentLoaded', trackDocumentReady);
    
    // --------------------------------------------------------
    // IMPROVED IMAGE LOADING TRACKING
    // --------------------------------------------------------
    if (trackImages) {
      const markImagesLoaded = () => {
        safeMarkLoaded(`${id}-images`);
        resourcesRef.current.images = true;
        checkAllResourcesLoaded();
      };
      
      try {
        // Get all images including those in picture elements and background images
        const getAllImages = () => {
          const images = Array.from(document.images);
          
          // Add images from picture elements
          const pictureElements = document.querySelectorAll('picture');
          pictureElements.forEach(picture => {
            const img = picture.querySelector('img');
            if (img && !images.includes(img)) {
              images.push(img);
            }
          });
          
          return images;
        };
        
        const images = getAllImages();
        
        if (images.length === 0) {
          markImagesLoaded();
        } else {
          let loadedCount = 0;
          const totalImages = images.length;
          
          // Create intersection observer to prioritize visible images
          let observer: IntersectionObserver | null = null;
          
          try {
            observer = new IntersectionObserver(
              (entries) => {
                entries.forEach(entry => {
                  if (entry.isIntersecting) {
                    observer?.unobserve(entry.target);
                    // Prioritize loading this image
                    const img = entry.target as HTMLImageElement;
                    if (!img.complete) {
                      // Force load by setting src to itself if needed
                      const currentSrc = img.src;
                      if (currentSrc) {
                        img.src = currentSrc;
                      }
                    }
                  }
                });
              },
              { rootMargin: "50%" }
            );
          } catch (e) {
            // Intersection Observer not supported, continue without it
            console.warn('[ResourceLoader] IntersectionObserver not supported:', e);
          }
          
          const handleImageLoad = () => {
            loadedCount++;
            if (loadedCount >= totalImages) {
              markImagesLoaded();
              
              // Clean up observer
              if (observer) {
                observer.disconnect();
              }
            }
          };
          
          // Observer to track dynamically added images
          let mutationObserver: MutationObserver | null = null;
          
          try {
            mutationObserver = new MutationObserver((mutations) => {
              const newImages: HTMLImageElement[] = [];
              
              // Check for new images in the mutations
              mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                  mutation.addedNodes.forEach(node => {
                    if (node.nodeName === 'IMG') {
                      newImages.push(node as HTMLImageElement);
                    } else if (node instanceof Element) {
                      node.querySelectorAll('img').forEach(img => {
                        newImages.push(img);
                      });
                    }
                  });
                }
              });
              
              // Process new images
              if (newImages.length > 0) {
                newImages.forEach(img => {
                  if (img.complete) {
                    handleImageLoad();
                  } else {
                    img.addEventListener('load', handleImageLoad, { once: true });
                    img.addEventListener('error', handleImageLoad, { once: true });
                    
                    // Observe for visibility
                    if (observer) {
                      observer.observe(img);
                    }
                  }
                });
              }
            });
            
            // Start observing
            mutationObserver.observe(document.documentElement, {
              childList: true,
              subtree: true
            });
          } catch (e) {
            // MutationObserver not supported, continue without it
            console.warn('[ResourceLoader] MutationObserver not supported:', e);
          }
          
          // Check initial state and attach listeners
          images.forEach(img => {
            if (img.complete) {
              loadedCount++;
            } else {
              img.addEventListener('load', handleImageLoad, { once: true });
              img.addEventListener('error', handleImageLoad, { once: true });
              
              // Observe for visibility
              if (observer) {
                observer.observe(img);
              }
            }
          });
          
          // If all images were already complete
          if (loadedCount >= totalImages) {
            markImagesLoaded();
            
            // Clean up observers
            if (observer) {
              observer.disconnect();
            }
            
            if (mutationObserver) {
              mutationObserver.disconnect();
            }
          }
          
          // Safety timeout at 75% of maxWaitTime
          safetySystem.setTimeout('images', () => {
            if (!resourcesRef.current.images) {
              markImagesLoaded();
              
              // Clean up observers
              if (observer) {
                observer.disconnect();
              }
              
              if (mutationObserver) {
                mutationObserver.disconnect();
              }
            }
          }, maxWaitTime * 0.75);
        }
      } catch (error) {
        console.warn('[ResourceLoader] Error tracking images:', error);
        markImagesLoaded(); // Fail gracefully
      }
    }
    
    // --------------------------------------------------------
    // IMPROVED FONT LOADING TRACKING
    // --------------------------------------------------------
    if (trackFonts) {
      const markFontsLoaded = () => {
        safeMarkLoaded(`${id}-fonts`);
        resourcesRef.current.fonts = true;
        checkAllResourcesLoaded();
      };
      
      try {
        if ('fonts' in document && document.fonts) {
          // Check if fonts have already loaded
          if (document.fonts.status === 'loaded') {
            markFontsLoaded();
          } else {
            // Better handling with race promise
            Promise.race([
              // Wait for fonts to be ready
              document.fonts.ready.then(() => {
                if (isMountedRef.current && !resourcesRef.current.fonts) {
                  markFontsLoaded();
                }
              }).catch((error) => {
                console.warn('[ResourceLoader] Font Loading API error:', error);
                if (isMountedRef.current && !resourcesRef.current.fonts) {
                  markFontsLoaded();
                }
              }),
              
              // Timeout after 3 seconds
              new Promise(resolve => {
                safetySystem.setTimeout('font-promise', () => {
                  resolve(null);
                  if (isMountedRef.current && !resourcesRef.current.fonts) {
                    markFontsLoaded();
                  }
                }, 3000);
              })
            ]).catch(() => {
              // Handle race promise errors
              if (isMountedRef.current && !resourcesRef.current.fonts) {
                markFontsLoaded();
              }
            });
            
            // Also track dynamic font loading
            if ('addEventListener' in document.fonts) {
              document.fonts.addEventListener('loadingdone', () => {
                if (isMountedRef.current && !resourcesRef.current.fonts) {
                  markFontsLoaded();
                }
              });
            }
          }
        } else {
          // Fallback for browsers without Font Loading API
          // Use CSS Font Face Observer pattern
          const checkFontFaceLoadStatus = () => {
            try {
              const fontTestElement = document.createElement('span');
              fontTestElement.style.visibility = 'hidden';
              fontTestElement.style.position = 'absolute';
              fontTestElement.style.fontSize = '40px';
              fontTestElement.style.fontFamily = 'sans-serif';
              fontTestElement.innerHTML = 'BESbswy';
              document.body.appendChild(fontTestElement);
              
              const initialWidth = fontTestElement.offsetWidth;
              fontTestElement.style.fontFamily = 'var(--font-body, sans-serif)';
              
              // Check for width changes indicating font is loaded
              const checkWidth = () => {
                if (initialWidth !== fontTestElement.offsetWidth || 
                    document.fonts?.status === 'loaded') {
                  // Font has loaded
                  document.body.removeChild(fontTestElement);
                  markFontsLoaded();
                } else if (isMountedRef.current && !resourcesRef.current.fonts) {
                  safetySystem.setTimeout('font-check', checkWidth, 50);
                }
              };
              
              checkWidth();
              
              // Safety timeout
              safetySystem.setTimeout('font-test', () => {
                if (document.body.contains(fontTestElement)) {
                  document.body.removeChild(fontTestElement);
                }
                if (!resourcesRef.current.fonts) {
                  markFontsLoaded();
                }
              }, 2000);
            } catch {
              // If any error, just mark fonts as loaded
              markFontsLoaded();
            }
          };
          
          if (document.body) {
            checkFontFaceLoadStatus();
          } else {
            // Wait for body to be available
            document.addEventListener('DOMContentLoaded', checkFontFaceLoadStatus);
          }
        }
      } catch (error) {
        console.warn('[ResourceLoader] Font loading error:', error);
        markFontsLoaded(); // Fail gracefully
      }
      
      // Safety timeout at 50% of maxWaitTime
      safetySystem.setTimeout('fonts', () => {
        if (!resourcesRef.current.fonts) {
          markFontsLoaded();
        }
      }, maxWaitTime * 0.5);
    }
    
    // --------------------------------------------------------
    // IMPROVED SCRIPT LOADING TRACKING
    // --------------------------------------------------------
    if (trackScripts) {
      const markScriptsLoaded = () => {
        safeMarkLoaded(`${id}-scripts`);
        resourcesRef.current.scripts = true;
        checkAllResourcesLoaded();
      };
      
      try {
        // Find all script elements
        const scripts = Array.from(document.querySelectorAll('script'));
        
        // Check if there are any scripts to track
        if (scripts.length === 0) {
          markScriptsLoaded();
        } else {
          let loadedCount = 0;
          let totalScripts = scripts.length;
          
          // Observer to track dynamic script additions
          let scriptObserver: MutationObserver | null = null;
          
          try {
            scriptObserver = new MutationObserver((mutations) => {
              let newScriptsCount = 0;
              
              mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                  mutation.addedNodes.forEach(node => {
                    if (node.nodeName === 'SCRIPT') {
                      newScriptsCount++;
                      // For dynamically added scripts, we don't get load events reliably
                      // so assume they load after a short delay
                      setTimeout(() => {
                        loadedCount++;
                        
                        // If all scripts are now loaded
                        if (loadedCount >= totalScripts + newScriptsCount) {
                          markScriptsLoaded();
                          if (scriptObserver) scriptObserver.disconnect();
                        }
                      }, 200);
                    }
                  });
                }
              });
              
              // Update total scripts count
              if (newScriptsCount > 0) {
                totalScripts += newScriptsCount;
              }
            });
            
            // Start observing
            scriptObserver.observe(document.documentElement, { 
              childList: true, 
              subtree: true 
            });
          } catch (e) {
            console.warn('[ResourceLoader] MutationObserver not supported:', e);
          }
          
          const handleScriptLoad = () => {
            loadedCount++;
            if (loadedCount >= totalScripts) {
              markScriptsLoaded();
              if (scriptObserver) scriptObserver.disconnect();
            }
          };
          
          // Track existing scripts
          scripts.forEach(script => {
            if (!script.hasAttribute('src')) {
              // Inline scripts are loaded immediately
              loadedCount++;
            } else if (script.hasAttribute('async') || script.hasAttribute('defer')) {
              // Async or defer scripts are counted as loaded for simplicity
              loadedCount++;
            } else {
              // External scripts without async/defer: wait for the load event
              script.addEventListener('load', handleScriptLoad, { once: true });
              script.addEventListener('error', handleScriptLoad, { once: true });
            }
          });
          
          // If all scripts are already loaded
          if (loadedCount >= totalScripts) {
            markScriptsLoaded();
            if (scriptObserver) scriptObserver.disconnect();
          }
          
          // Safety timeout at 40% of maxWaitTime
          safetySystem.setTimeout('scripts', () => {
            if (!resourcesRef.current.scripts) {
              markScriptsLoaded();
              if (scriptObserver) scriptObserver.disconnect();
            }
          }, maxWaitTime * 0.4);
        }
      } catch (error) {
        console.warn('[ResourceLoader] Error tracking scripts:', error);
        markScriptsLoaded(); // Fail gracefully
      }
    }
    
    // --------------------------------------------------------
    // IMPROVED STYLESHEET LOADING TRACKING
    // --------------------------------------------------------
    if (trackStyles) {
      const markStylesLoaded = () => {
        safeMarkLoaded(`${id}-styles`);
        resourcesRef.current.styles = true;
        checkAllResourcesLoaded();
      };
      
      try {
        // Find all stylesheet links
        const styleLinks = Array.from(
          document.querySelectorAll('link[rel="stylesheet"]')
        );
        
        // Get all style elements too
        const styleElements = Array.from(document.querySelectorAll('style'));
        
        // Check if there are any styles to track
        if (styleLinks.length === 0 && styleElements.length === 0) {
          markStylesLoaded();
        } else {
          let loadedCount = 0;
          let totalStylesCount = styleLinks.length;
          
          // Style elements are always loaded
          loadedCount += styleElements.length;
          
          // Observer to track dynamic style additions
          let styleObserver: MutationObserver | null = null;
          
          try {
            styleObserver = new MutationObserver((mutations) => {
              let newStylesCount = 0;
              
              mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                  mutation.addedNodes.forEach(node => {
                    if (node.nodeName === 'LINK' && 
                        (node as HTMLLinkElement).rel === 'stylesheet') {
                      newStylesCount++;
                      const link = node as HTMLLinkElement;
                      
                      // For dynamically added stylesheets
                      if (link.sheet) {
                        loadedCount++;
                      } else {
                        link.addEventListener('load', handleStyleLoad, { once: true });
                        link.addEventListener('error', handleStyleLoad, { once: true });
                      }
                    } else if (node.nodeName === 'STYLE') {
                      // Style elements are always loaded
                      loadedCount++;
                    }
                  });
                }
              });
              
              // Update total styles count
              if (newStylesCount > 0) {
                totalStylesCount += newStylesCount;
              }
              
              // Check if all styles are now loaded
              if (loadedCount >= totalStylesCount) {
                markStylesLoaded();
                if (styleObserver) styleObserver.disconnect();
              }
            });
            
            // Start observing
            styleObserver.observe(document.documentElement, { 
              childList: true, 
              subtree: true 
            });
          } catch (error) {
            console.warn('[ResourceLoader] MutationObserver not supported:', error);
          }
          
          const handleStyleLoad = () => {
            loadedCount++;
            if (loadedCount >= totalStylesCount) {
              markStylesLoaded();
              if (styleObserver) styleObserver.disconnect();
            }
          };
          
          // Check loaded state of stylesheets
          styleLinks.forEach(link => {
            // Most reliable cross-browser check for stylesheet loaded state
            if ((link as HTMLLinkElement).sheet) {
              loadedCount++;
            } else {
              link.addEventListener('load', handleStyleLoad, { once: true });
              link.addEventListener('error', handleStyleLoad, { once: true });
            }
          });
          
          // If all styles are already loaded
          if (loadedCount >= totalStylesCount) {
            markStylesLoaded();
            if (styleObserver) styleObserver.disconnect();
          }
          
          // Safety timeout at 30% of maxWaitTime (styles typically load quickly)
          safetySystem.setTimeout('styles', () => {
            if (!resourcesRef.current.styles) {
              markStylesLoaded();
              if (styleObserver) styleObserver.disconnect();
            }
          }, maxWaitTime * 0.3);
        }
      } catch (error) {
        console.warn('[ResourceLoader] Error tracking stylesheets:', error);
        markStylesLoaded(); // Fail gracefully
      }
    }
    
    // --------------------------------------------------------
    // OVERALL SAFETY TIMEOUT
    // --------------------------------------------------------
    // Ultimate fallback
    safetySystem.setTimeout('ultimate', () => {
      // Force mark all resources as loaded
      if (trackImages && !resourcesRef.current.images) {
        safeMarkLoaded(`${id}-images`);
        resourcesRef.current.images = true;
      }
      
      if (trackFonts && !resourcesRef.current.fonts) {
        safeMarkLoaded(`${id}-fonts`);
        resourcesRef.current.fonts = true;
      }
      
      if (trackScripts && !resourcesRef.current.scripts) {
        safeMarkLoaded(`${id}-scripts`);
        resourcesRef.current.scripts = true;
      }
      
      if (trackStyles && !resourcesRef.current.styles) {
        safeMarkLoaded(`${id}-styles`);
        resourcesRef.current.styles = true;
      }
      
      if (!resourcesRef.current.dom) {
        safeMarkLoaded(`${id}-dom`);
        resourcesRef.current.dom = true;
      }
      
      // Mark main component as loaded
      safeMarkLoaded(id);
      isLoadedRef.current = true;
    }, maxWaitTime);
    
    // Cleanup
    return () => {
      isMountedRef.current = false;
      
      // Remove event listeners
      window.removeEventListener('load', trackPageFullyLoaded);
      document.removeEventListener('DOMContentLoaded', trackDocumentReady);
      
      // Cancel safety timeouts
      if (safetyTimeoutsRef.current) {
        safetyTimeoutsRef.current.cancel();
      }
    };
  }, [
    id, priority, trackImages, trackFonts, trackScripts, trackStyles,
    maxWaitTime, registerComponent, getPriorityWeight,
    safeMarkLoaded, checkAllResourcesLoaded
  ]);
  
  // No UI output
  return null;
};

// ========================================================
// UNIFIED PAGE LOADER COMPONENT WITH OPTIMIZED ANIMATION
// ========================================================

interface PageLoaderProps {
  children: React.ReactNode;
  options?: PageTransitionOptions;
  appearance?: LoaderAppearance;
  resourceOptions?: ResourceOptions;
}

/**
 * A unified component to handle page loading transitions and animations
 */
const PageLoader: React.FC<PageLoaderProps> = memo(function PageLoader(props) {
    const {
      children,
      options = {},
      appearance = {},
      resourceOptions = {
        trackImages: true,
        trackFonts: true,
        trackScripts: true,
        trackStyles: true
      }
    } = props;
  
    const {
      minDisplayTime = 0,
      fadeOutDuration = 800,
    transitionDuration = 500,
    showInitialLoaderOnly = false,
    maxWaitTime = 10000
  } = options;
  
  const {
    isPageLoaded,
    isInitialLoadComplete,
    isAnimationComplete,
    setAnimationComplete,
    shouldShowLoader,
    progress
  } = useLoading();
  
  // Unified state for loader and transition
  const [visualState, setVisualState] = useState<'loading' | 'transitioning' | 'complete'>(
    isPageLoaded || isAnimationComplete ? 'complete' : 'loading'
  );
  
  // Canvas ref for animation
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  
  // Animation state tracking
  const fadeStartTimeRef = useRef<number | null>(null);
  const rotationRef = useRef(0);
  const lastTimestampRef = useRef(0);
  const transitionCalledRef = useRef(false);
  
  // Minimum display time tracking
  const [minTimeElapsed, setMinTimeElapsed] = useState(minDisplayTime === 0);
  
  // Handle window dimensions for canvas
  const [canvasDimensions, setCanvasDimensions] = useState({ 
    width: appearance.width || 200, 
    height: appearance.height || 200 
  });
  
  // Configure appearance properties with defaults
  const loaderConfig = useMemo(() => ({
    radius: appearance.radius || 70,
    speed: appearance.speed || 0.12,
    trailLength: appearance.trailLength || 120,
    trailSegments: 20,
    cometSize: appearance.cometSize || 4,
    cometHeadScale: appearance.cometHeadScale || 0.5,
    coreColor: appearance.coreColor || 'rgba(255, 255, 255, 1)',
    glowColor: appearance.glowColor || 'rgba(255, 253, 227, 0.9)',
    trailColor: appearance.trailColor || 'rgba(191, 173, 127, 0.8)'
  }), [appearance]);
  
  // Calculate actual comet head size based on scale factor
  const scaledCometSize = loaderConfig.cometSize * loaderConfig.cometHeadScale;
  
  // Determine if loader should be displayed
  const shouldDisplayLoader = useCallback(() => {
    // Don't display if animation is complete
    if (isAnimationComplete || visualState === 'complete') return false;
    
    // Don't display if minimum time hasn't elapsed
    if (!minTimeElapsed) return true;
    
    // Show loader only until initial load is complete if configured
    if (showInitialLoaderOnly && isInitialLoadComplete) return false;
    
    // Check with loading system
    return shouldShowLoader();
  }, [
    isAnimationComplete,
    visualState,
    minTimeElapsed,
    showInitialLoaderOnly,
    isInitialLoadComplete,
    shouldShowLoader
  ]);
  
  // Start transition to content
  const startTransition = useCallback(() => {
    if (transitionCalledRef.current || visualState !== 'loading') return;
    
    transitionCalledRef.current = true;
    fadeStartTimeRef.current = performance.now();
    setVisualState('transitioning');
    
    // Complete transition after fadeOut and transition durations
    setTimeout(() => {
      setVisualState('complete');
      setAnimationComplete(true);
    }, fadeOutDuration + transitionDuration);
  }, [fadeOutDuration, transitionDuration, setAnimationComplete, visualState]);
  
  // Set canvas dimensions on mount and resize (with debounce)
  useEffect(() => {
    const updateCanvasDimensions = () => {
      if (typeof window !== 'undefined') {
        setCanvasDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }
    };
    
    // Initial update
    updateCanvasDimensions();
    
    // Debounced resize handler
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateCanvasDimensions, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);
  
  // Handle minimum display time
  useEffect(() => {
    if (minDisplayTime === 0) {
      return;
    }
    
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, minDisplayTime);
    
    return () => clearTimeout(timer);
  }, [minDisplayTime]);
  
  // Handle transition between loader and content
  useEffect(() => {
    // Determine when transition should start
    const shouldTransition = showInitialLoaderOnly 
      ? isInitialLoadComplete && minTimeElapsed
      : isPageLoaded && minTimeElapsed;
    
    if (shouldTransition && visualState === 'loading') {
      startTransition();
    }
    
    // Unified safety timeout system
    const safetySystem = new SafetyTimeoutManager(maxWaitTime);
    
    // 50% safety timeout
    safetySystem.addCheckpoint(maxWaitTime * 0.5, () => {
      // If substantial progress but not complete, transition anyway
      if (visualState === 'loading' && progress > 75) {
        startTransition();
      }
    });
    
    // Ultimate safety timeout
    safetySystem.addCheckpoint(maxWaitTime, () => {
      if (visualState === 'loading') {
        startTransition();
      }
    });
    
    // Start the safety system
    safetySystem.start();
    
    return () => {
      safetySystem.cancel();
    };
  }, [
    isPageLoaded,
    isInitialLoadComplete,
    minTimeElapsed,
    showInitialLoaderOnly,
    progress,
    visualState,
    maxWaitTime,
    startTransition
  ]);
  
  // Optimized animation logic
  useEffect(() => {
    if (!canvasRef.current || visualState === 'complete') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Pre-calculate animation constants
    const { 
      radius, 
      speed, 
      trailLength, 
      trailSegments, 
      coreColor,
      glowColor,
      trailColor
    } = loaderConfig;
    
    // Cache patterns and gradients
    const createGlowGradient = (x: number, y: number) => {
        const gradient = ctx.createRadialGradient(
          x, y, 0,
          // Add remaining parameters, e.g.:
          x, y, 50 // Example outer radius
        );
        // Add color stops, e.g.:
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        return gradient;
      };
    
    // Configure for high performance
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Clear canvas on mount
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const drawComet = (timestamp: number) => {
        // Initialize timestamp on first run
        if (lastTimestampRef.current === 0) {
          lastTimestampRef.current = timestamp;
        }
      
        // Calculate time delta (capped at ~60fps)
        const deltaTime = Math.min(timestamp - lastTimestampRef.current, 16.667);
        lastTimestampRef.current = timestamp;
      
        // Calculate opacity based on fade state
        let fadeProgress = 1;
        if (visualState === 'transitioning') {
          if (fadeStartTimeRef.current === null) {
            fadeStartTimeRef.current = timestamp;
          }
          const fadeElapsed = timestamp - fadeStartTimeRef.current;
          fadeProgress = Math.max(0, 1 - fadeElapsed / fadeOutDuration);
      
          if (fadeProgress <= 0) {
            if (animationRef.current) {
              cancelAnimationFrame(animationRef.current);
            }
            return;
          }
        }
      
        // Update rotation at constant speed
        const rotationDelta = speed * deltaTime;
        rotationRef.current = (rotationRef.current + rotationDelta) % 360;
      
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      
        // Calculate comet head position
        const headAngle = (rotationRef.current * Math.PI) / 180;
        const headX = centerX + radius * Math.cos(headAngle);
        const headY = centerY + radius * Math.sin(headAngle);
      
        // Set global opacity for entire drawing
        const smoothFadeProgress =
          visualState === 'transitioning' ? Math.min(1, Math.max(0, fadeProgress * 1.1)) : 1;
      
        // Create glow gradient for current position
        const currentGlowGradient = createGlowGradient(headX, headY);
      
        // Draw comet head using gradient
        ctx.beginPath();
        ctx.arc(headX, headY, 20, 0, Math.PI * 2);
        ctx.fillStyle = currentGlowGradient;
        ctx.fill();
      
        // Draw trail segments with decreasing opacity
        for (let i = 0; i < trailSegments; i++) {
          const segmentAngle =
            ((rotationRef.current - (i * (trailLength / trailSegments))) % 360) * (Math.PI / 180);
          const segmentX = centerX + radius * Math.cos(segmentAngle);
          const segmentY = centerY + radius * Math.sin(segmentAngle);
      
          const nextSegmentAngle =
            ((rotationRef.current - ((i + 1) * (trailLength / trailSegments))) % 360) * (Math.PI / 180);
          const nextSegmentX = centerX + radius * Math.cos(nextSegmentAngle);
          const nextSegmentY = centerY + radius * Math.sin(nextSegmentAngle);
      
          // Calculate opacity based on position in trail
          const baseOpacity = 0.8 * (1 - i / trailSegments);
      
          // Draw trail segment
          ctx.beginPath();
          ctx.moveTo(segmentX, segmentY);
          ctx.lineTo(nextSegmentX, nextSegmentY);
      
          // Vary line width from head to tail
          const segmentWidth = 2.5 * (1 - i / trailSegments) + 0.5;
      
          // Set shadow/glow for trail
          ctx.shadowColor = glowColor.replace(/[\d.]+\)$/, `${baseOpacity * smoothFadeProgress})`);
          ctx.shadowBlur = 10 * (1 - i / trailSegments) + 5;
      
          // Set line style and draw
          ctx.strokeStyle = trailColor.replace(/[\d.]+\)$/, `${baseOpacity * smoothFadeProgress})`);
          ctx.lineWidth = segmentWidth;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      
        // Add twinkle effect during fade-out
        if (visualState === 'transitioning') {
          const twinkleIntensity = Math.sin(timestamp / 100) * 0.2 + 0.8;
          ctx.shadowBlur = 20 * twinkleIntensity;
        } else {
          ctx.shadowBlur = 20;
        }
      
        // Draw comet head with stronger glow
        ctx.shadowColor = glowColor;
      
        // Larger outer glow
        ctx.beginPath();
        ctx.arc(headX, headY, scaledCometSize, 0, Math.PI * 2);
        ctx.fillStyle = glowColor.replace(/[\d.]+\)$/, '0.7)');
        ctx.fill();
      
        // Brighter inner core
        ctx.beginPath();
        ctx.arc(headX, headY, scaledCometSize * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = glowColor.replace(/[\d.]+\)$/, '0.9)');
        ctx.fill();
      
        // Brightest center point
        ctx.beginPath();
        ctx.arc(headX, headY, scaledCometSize * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = coreColor;
        ctx.fill();
      
        // Schedule next frame
        animationRef.current = requestAnimationFrame(drawComet);
      };
      
      
      // Cleanup function
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };

// Start animation if not complete
if (visualState !== 'complete') {
  animationRef.current = requestAnimationFrame(drawComet);
}

// Cleanup function
return () => {
  if (animationRef.current) {
    cancelAnimationFrame(animationRef.current);
  }
};
    
    if (visualState !== 'complete') {
      animationRef.current = requestAnimationFrame(drawComet);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    visualState, 
    loaderConfig,
    scaledCometSize,
    fadeOutDuration,
    canvasDimensions.width,
    canvasDimensions.height
  ]);
  
  // Only render the loader if needed based on current state
  const renderLoader = shouldDisplayLoader();
  
  return (
    <div className="relative min-h-screen">
      {/* Resource tracking */}
      <ResourceLoader 
        priority="critical"
        maxWaitTime={maxWaitTime}
        options={resourceOptions}
      />
      
      {/* Loader component - conditional rendering for better performance */}
      {renderLoader && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-95 z-50">
          <div className="relative flex flex-col items-center">
            <canvas 
              ref={canvasRef} 
              width={canvasDimensions.width} 
              height={canvasDimensions.height}
              className="block"
              data-testid="page-loader-canvas"
            />
            
            <div className="mt-6 text-center">
              <span className="text-amber-200 text-xl font-light">{Math.round(progress)}%</span>
              <div className="mt-2 w-48 h-1 bg-gray-800 rounded overflow-hidden">
                <div 
                  className="h-full bg-amber-200" 
                  style={{ 
                    width: `${Math.min(100, Math.max(0, progress))}%`,
                    transition: 'width 0.3s ease-out'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Page content */}
      <div
        className="transition-opacity"
        style={{
          opacity: visualState === 'complete' ? 1 : 0,
          transitionDuration: `${transitionDuration}ms`,
          visibility: visualState === 'complete' ? 'visible' : 'hidden'
        }}
      >
        {children}
      </div>
    </div>
  );
});

// ========================================================
// OPTIMIZED LOADABLE COMPONENT
// ========================================================

interface LoadableComponentProps<T = unknown> {
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
  estimatedLoadTime?: number;
  
  /** Custom loading logic function that returns true when the component is ready */
  loadingStrategy?: (data?: Record<string, unknown>) => Promise<boolean>;
  
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
  
  /** Refetch data function - pass a dependency array as value to trigger refetch */
  refetchDependencies?: unknown[];
  
  /** Whether to show loading state when refetching */
  showRefetchLoading?: boolean;
  
  /** Error message to display when fetch fails */
  errorMessage?: string | ((error: Error) => string);
  
  /** Whether to throw errors instead of handling them internally */
  throwErrors?: boolean;
  
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
  isRefetching: boolean;
  hasError: boolean;
  error: Error | null;
  data: T | undefined;
}

// Action types for the reducer
type LoadableAction<T> = 
  | { type: 'SET_VISIBLE'; visible: boolean }
  | { type: 'SET_LOADED'; loaded: boolean }
  | { type: 'SET_REFETCHING'; refetching: boolean }
  | { type: 'SET_ERROR'; error: Error }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_DATA'; data: T }
  | { type: 'RESET' };

/**
 * Reducer for managing loadable component state
 */
function loadableReducer<T>(state: LoadableState<T>, action: LoadableAction<T>): LoadableState<T> {
  switch (action.type) {
    case 'SET_VISIBLE':
      return { ...state, isVisible: action.visible };
    
    case 'SET_LOADED':
      return { ...state, isLoaded: action.loaded };
    
    case 'SET_REFETCHING':
      return { ...state, isRefetching: action.refetching };
    
    case 'SET_ERROR':
      return { 
        ...state, 
        hasError: true, 
        error: action.error,
        isLoaded: true, // Mark as loaded even on error
        isRefetching: false
      };
    
    case 'CLEAR_ERROR':
      return { ...state, hasError: false, error: null };
    
    case 'SET_DATA':
      return { ...state, data: action.data };
    
    case 'RESET':
      return {
        ...state,
        isLoaded: false,
        isRefetching: false,
        hasError: false,
        error: null
      };
    
    default:
      return state;
  }
}

/**
 * Optimized component that can be loaded with the loading system
 */
function LoadableComponentImpl<T = unknown>(props: LoadableComponentProps<T>) {
  const {
    id,
    children,
    priority = 'important',
    waitForCritical = true,
    dependencies = [],
    fallback = null,
    estimatedLoadTime = 0,
    loadingStrategy,
    fetchConfig,
    initialData,
    className = '',
    ariaLive = 'polite',
    enableFadeIn = true,
    transitionDuration = 500,
    refetchDependencies = [],
    showRefetchLoading = false,
    errorMessage = 'Failed to load data',
    throwErrors = false,
    onDataLoaded,
    onError,
    maxWaitTime = 10000
  } = props;
  
  // Get required functions from loading context
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
    isRefetching: false,
    hasError: false,
    error: null,
    data: initialData
  };
  
  const [state, dispatch] = useReducer(loadableReducer<T>, initialState);
  const { isVisible, isLoaded, isRefetching, hasError, error, data } = state;
  
  // Refs for cleanup and tracking
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const startTimeRef = useRef(performance.now());
  const retryCountRef = useRef(0);
  const loadingCompleteRef = useRef(false);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevDependenciesRef = useRef<string[]>(dependencies);
  
  // Safety timeout manager for coordinated timeouts
  const safetyManagerRef = useRef<SafetyTimeoutManager | null>(null);
  
  // Initialize safety timeout manager
  useEffect(() => {
    safetyManagerRef.current = new SafetyTimeoutManager(maxWaitTime);
    safetyManagerRef.current.start();
    
    return () => {
      if (safetyManagerRef.current) {
        safetyManagerRef.current.cancel();
      }
    };
  }, [maxWaitTime]);
  
  // Memoized visibility checker to prevent unnecessary recalculations
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

  // Ensure the component is marked as loaded
  const ensureComponentLoaded = useCallback(() => {
    if (!loadingCompleteRef.current) {
      markComponentLoaded(id);
      loadingCompleteRef.current = true;
      
      // Update state to reflect completion
      if (mountedRef.current) {
        dispatch({ type: 'SET_LOADED', loaded: true });
        if (isRefetching) {
          dispatch({ type: 'SET_REFETCHING', refetching: false });
        }
      }
    }
  }, [id, markComponentLoaded, isRefetching]);

  // Enhanced fetch data implementation with memoization and cache
  const fetchData = useCallback(async (isRefetch = false): Promise<T | undefined> => {
    if (!fetchConfig) return undefined;
    
    // Create a new AbortController for this request
    abortControllerRef.current = new AbortController();
    
    try {
      // Check cache first if enabled
      if (fetchConfig.enableCache && !isRefetch) {
        const cacheKey = fetchConfig.cacheKey || fetchConfig.url;
        const cachedItem = dataCache[cacheKey] as CacheItem<T> | undefined;
        
        if (cachedItem) {
          const now = Date.now();
          const expirationTime = fetchConfig.cacheExpiration || 5 * 60 * 1000; // Default 5 minutes
          
          if (now - cachedItem.timestamp < expirationTime) {
            return cachedItem.data as T;
          }
        }
      }
      
      // Prepare fetch options
      const fetchOptions: RequestInit = {
        method: fetchConfig.method || 'GET',
        headers: fetchConfig.headers || {},
        signal: abortControllerRef.current.signal,
        credentials: fetchConfig.withCredentials ? 'include' : 'same-origin',
        cache: fetchConfig.cacheStrategy || 'default'
      };
      
      // Set up timeout if specified
      if (fetchConfig.timeout) {
        safetyManagerRef.current?.setTimeout('fetch-timeout', () => {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
        }, fetchConfig.timeout);
      }
      
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
      
      // Execute fetch request
      const response = await fetch(fetchConfig.url, fetchOptions);
      
      // Clear timeout
      if (fetchConfig.timeout) {
        safetyManagerRef.current?.clearTimeout('fetch-timeout');
      }
      
      // Handle response status
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      
      // Parse response based on content type
      let responseData: unknown;
      const contentTypeHeader = response.headers.get('Content-Type') || '';
      let contentType: ResponseType;
      
      if (fetchConfig.contentType) {
        contentType = fetchConfig.contentType;
      } else if (contentTypeHeader.includes('application/json')) {
        contentType = 'json';
      } else if (contentTypeHeader.includes('text/')) {
        contentType = 'text';
      } else {
        contentType = 'json'; // Default fallback
      }
      
      // Handle different response types
      try {
        switch (contentType) {
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
            break;
        }
      } catch (parseError) {
        console.error('[LoadableComponent] Error parsing response:', parseError);
        throw new Error(`Failed to parse ${contentType} response`);
      }
      
      // Apply transformation if provided
      let transformedData: T;
      
      try {
        transformedData = fetchConfig.transform ? 
          fetchConfig.transform(responseData) as T : 
          responseData as T;
      } catch (transformError) {
        console.error('[LoadableComponent] Error transforming data:', transformError);
        throw new Error('Failed to transform response data');
      }
      
      // Cache the data if caching is enabled
      if (fetchConfig.enableCache) {
        const cacheKey = fetchConfig.cacheKey || fetchConfig.url;
        dataCache[cacheKey] = {
          data: transformedData,
          timestamp: Date.now()
        };
      }
      
      return transformedData;
    } catch (error) {
      // Handle aborted requests gracefully
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Request was aborted due to timeout');
      }
      
      // Handle retry logic
      const maxRetries = fetchConfig.retries || 0;
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        const delay = Math.pow(2, retryCountRef.current) * 300; // Exponential backoff
        
        await new Promise(resolve => {
          safetyManagerRef.current?.setTimeout(
            `retry-${retryCountRef.current}`,
            resolve as () => void,
            delay
          );
        });
        
        return fetchData(isRefetch);
      }
      
      throw error;
    }
  }, [fetchConfig]);

  // Enhanced data loading logic with better error handling
  const handleDataLoading = useCallback(async (isRefetch = false) => {
    if (isRefetch && !showRefetchLoading) {
      dispatch({ type: 'SET_REFETCHING', refetching: true });
    } else {
      dispatch({ type: 'SET_LOADED', loaded: false });
    }
    
    try {
      let result = true;
      let loadedData: T | undefined = undefined;
      
      // Use custom loading strategy if provided
      if (loadingStrategy) {
        try {
          result = await loadingStrategy();
        } catch (error) {
          console.error('[LoadableComponent] Loading strategy error:', error);
          result = false;
        }
      } 
      // Use fetch configuration if provided
      else if (fetchConfig) {
        try {
          loadedData = await fetchData(isRefetch);
          
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
      else if (estimatedLoadTime > 0) {
        await new Promise<void>(resolve => {
          safetyManagerRef.current?.setTimeout('estimated-load', resolve, estimatedLoadTime);
          timerRef.current = setTimeout(resolve, estimatedLoadTime);
        });
        
        // Important: Always ensure result is true after estimated time completes
        result = true;
      }
      
      // Only update state if component is still mounted
      if (mountedRef.current) {
        if (result) {
          ensureComponentLoaded();
          
          if (isRefetch) {
            dispatch({ type: 'SET_REFETCHING', refetching: false });
          } else {
            dispatch({ type: 'SET_LOADED', loaded: true });
          }
        } else {
          const newError = new Error('Loading strategy returned false');
          dispatch({ type: 'SET_ERROR', error: newError });
          notifyError?.(id, newError);
          
          if (onError) {
            onError(newError);
          }
          
          // CRITICAL: Mark as loaded even when there's an error
          ensureComponentLoaded();
          
          if (throwErrors) {
            throw newError;
          }
        }
      }
    } catch (error) {
      if (mountedRef.current) {
        const newError = error instanceof Error ? error : new Error('Unknown loading error');
        dispatch({ type: 'SET_ERROR', error: newError });
        notifyError?.(id, newError);
        
        if (isRefetch) {
          dispatch({ type: 'SET_REFETCHING', refetching: false });
        }
        
        if (onError) {
          onError(newError);
        }
        
        // CRITICAL: Mark as loaded even when there's an error
        ensureComponentLoaded();
        
        if (throwErrors) {
          throw newError;
        }
      }
    }
  }, [
    id,
    loadingStrategy,
    fetchConfig,
    fetchData,
    estimatedLoadTime,
    notifyError,
    showRefetchLoading,
    onDataLoaded,
    onError,
    throwErrors,
    ensureComponentLoaded
  ]);

  // Set up safety timeout to ensure loading completes
  useEffect(() => {
    const safetySystem = safetyManagerRef.current;
    if (!safetySystem) return;
    
    // Half-way checkpoint
    safetySystem.addCheckpoint(maxWaitTime * 0.5, () => {
      if (!loadingCompleteRef.current) {
        console.warn(`[LoadableComponent] Half-way timeout checkpoint for component ${id}`);
        // Don't complete yet, just log warning
      }
    });
    
    // Final safety timeout
    safetySystem.addCheckpoint(maxWaitTime, () => {
      if (!loadingCompleteRef.current) {
        console.warn(`[LoadableComponent] Safety timeout triggered for component ${id} after ${maxWaitTime}ms`);
        ensureComponentLoaded();
      }
    });
  }, [id, maxWaitTime, ensureComponentLoaded]);

  // Register component and set up loading on mount
useEffect(() => {
    const weight = getPriorityWeight(priority);
    registerComponent(id, priority, weight, dependencies);
    startTimeRef.current = performance.now();
    loadingCompleteRef.current = false;
    prevDependenciesRef.current = dependencies;
  
    // Start loading process
    handleDataLoading();
  
    // Capture current ref values at the time of effect execution
    // This ensures cleanup uses the exact instances from this effect run
    const currentTimer = timerRef.current;
    const currentAbortController = abortControllerRef.current;
    const currentSafetyTimeout = safetyTimeoutRef.current;
    const currentSafetyManager = safetyManagerRef.current;
  
    // Clean up on unmount
    return () => {
      mountedRef.current = false;
  
      if (currentTimer) {
        clearTimeout(currentTimer);
      }
  
      if (currentAbortController) {
        currentAbortController.abort();
      }
  
      if (currentSafetyTimeout) {
        clearTimeout(currentSafetyTimeout);
      }
  
      if (currentSafetyManager) {
        currentSafetyManager.cancel();
      }
    };
  }, [
    id,
    priority,
    registerComponent,
    getPriorityWeight,
    handleDataLoading,
    dependencies,
  ]);
  
  // Handle dependency changes
  useEffect(() => {
    // Only re-register if dependencies actually changed
    if (!arrayEquals(dependencies, prevDependenciesRef.current)) {
      const weight = getPriorityWeight(priority);
      registerComponent(id, priority, weight, dependencies);
      prevDependenciesRef.current = [...dependencies];
    }
  }, [id, priority, registerComponent, getPriorityWeight, dependencies]);

  // Handle refetch when refetchDependencies change
  useEffect(() => {
    const refetchDepsLength = refetchDependencies.length;
    
    if (refetchDepsLength > 0 && isLoaded) {
      retryCountRef.current = 0; // Reset retry counter
      handleDataLoading(true);
    }
  }, [refetchDependencies, isLoaded, handleDataLoading]);

  // Check visibility whenever dependencies or loading status changes
  useEffect(() => {
    checkVisibility();
  }, [
    isLoaded,
    checkVisibility
  ]);

  // Calculate transition styles with memoization
  const transitionStyle = useMemo(() => 
    enableFadeIn 
      ? `opacity ${transitionDuration}ms ease-in-out, visibility ${transitionDuration}ms ease-in-out` 
      : 'none',
    [enableFadeIn, transitionDuration]
  );
  
  // Render error state with fallback
  if (hasError && !isLoaded) {
    const errorDisplay = typeof errorMessage === 'function' 
      ? errorMessage(error as Error) 
      : errorMessage;
      
    return (
      <div className="loadable-component-error" role="alert" aria-live="assertive">
        {fallback || <div className="p-4 bg-red-100 border border-red-200 text-red-700 rounded">
          {errorDisplay}
        </div>}
      </div>
    );
  }

  // Render children or fallback based on visibility state
  const renderChildren = () => {
    if (!isVisible) return fallback;
    
    if (typeof children === 'function') {
      return children(data as T, error);
    }
    
    return children;
  };

  // Render the component with appropriate transition and accessibility attributes
  return (
    <div 
      className={`loadable-component ${className} ${isVisible ? 'opacity-100' : 'opacity-0'} ${isRefetching ? 'loadable-refetching' : ''}`}
      style={{ 
        visibility: isVisible ? 'visible' : 'hidden',
        transition: transitionStyle,
        opacity: isVisible ? 1 : 0
      }}
      data-priority={priority}
      data-component-id={id}
      data-loaded={isLoaded}
      data-refetching={isRefetching}
      aria-busy={!isLoaded || isRefetching}
      aria-live={ariaLive}
    >
      {renderChildren()}
    </div>
  );
}

// Create a properly typed memoized component
const LoadableComponent = memo(LoadableComponentImpl) as typeof LoadableComponentImpl;

// Add displayName for debugging
Object.defineProperty(LoadableComponent, 'displayName', {
  value: 'LoadableComponent'
});

// ========================================================
// MAIN EXPORTS
// ========================================================

export {
  LoadingProvider,
  useLoading,
  ResourceLoader,
  PageLoader,
  LoadableComponent
};