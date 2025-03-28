/**
 * Progressive Loading System - Core Module
 * 
 * This module provides the central state management and context for the 
 * progressive loading system. It handles component registration, loading
 * state tracking, and progress calculations.
 */

import React, { createContext, useContext, useReducer, useCallback, useMemo, useRef, useEffect } from 'react';

// ========================================================
// TYPES AND INTERFACES
// ========================================================

export type LoadPriority = 'critical' | 'important' | 'secondary' | 'deferred';

export interface ComponentState {
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

export interface LoadingAnalytics {
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

export interface LoadingContextProps {
  isPageLoaded: boolean;
  isInitialLoadComplete: boolean;
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

// ========================================================
// STATE MANAGEMENT
// ========================================================

// Loading state interface
interface LoadingState {
  components: Record<string, ComponentState>;
  errors: LoadingError[];
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
  | { type: 'SET_PAGE_LOADED'; loaded: boolean }
  | { type: 'SET_INITIAL_LOAD_COMPLETE'; complete: boolean }
  | { type: 'UPDATE_PROGRESS'; progress: number; criticalProgress: number }
  | { type: 'NOTIFY_ERROR'; componentId: string; error: Error }
  | { type: 'SET_THRESHOLDS'; thresholds: { hideLoaderProgress?: number; criticalThreshold?: number } }
  | { type: 'UPDATE_ANALYTICS'; analytics: Partial<LoadingAnalytics> }
  | { type: 'RESET_LOADING' };

// ========================================================
// UTILITY FUNCTIONS
// ========================================================

/**
 * Calculate weighted progress values from component states
 */
function getWeightedProgress(components: Record<string, ComponentState>): { 
  progress: number; 
  criticalProgress: number 
} {
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
}

/**
 * Check if all components are loaded
 */
function areAllComponentsLoaded(components: Record<string, ComponentState>): boolean {
  const componentList = Object.values(components);
  if (componentList.length === 0) return false;
  return componentList.every(comp => comp.loaded);
}

/**
 * Get loading times for analytics
 */
function getComponentLoadTimes(components: Record<string, ComponentState>): Array<{id: string, loadTime: number}> {
  return Object.values(components)
    .filter(comp => comp.loaded && comp.loadedAt !== null)
    .map(comp => ({
      id: comp.id,
      loadTime: (comp.loadedAt as number) - comp.registeredAt
    }))
    .sort((a, b) => b.loadTime - a.loadTime);
}

/**
 * Get device information for analytics
 */
function getDeviceInfo() {
  const isMobile = typeof navigator !== 'undefined' ? 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) : false;

  return {
    memory: typeof navigator !== 'undefined' ? 
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory : undefined,
    cores: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : undefined,
    connection: typeof navigator !== 'undefined' && 'connection' in navigator ? 
      (navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType : undefined,
    isMobile
  };
}

/**
 * Compare two dependency arrays for equality
 */
function dependenciesEqual(a: string[], b: string[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  return a.every(dep => b.includes(dep));
}

/**
 * Main reducer for loading state management
 */
function loadingReducer(state: LoadingState, action: LoadingAction): LoadingState {
  switch (action.type) {
    case 'REGISTER_COMPONENT': {
      // Skip if already registered with the same dependencies
      if (
        action.id in state.components && 
        state.components[action.id].priority === action.priority &&
        dependenciesEqual(state.components[action.id].dependencies, action.dependencies)
      ) {
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
export { LoadingContext };

interface LoadingProviderProps {
  children: React.ReactNode;
  onComplete?: () => void;
  initialLoaderThreshold?: number;
  debugMode?: boolean;
  maxLoadingTime?: number;
}

/**
 * Provider component that manages the loading state
 */
export const LoadingProvider: React.FC<LoadingProviderProps> = ({
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
      deviceInfo: getDeviceInfo()
    }
  };
  
  // Create reducer
  const [state, dispatch] = useReducer(loadingReducer, initialState);
  
  // Destructure state for easier access
  const { 
    components, 
    errors, 
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
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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
    if (isPageLoaded) {
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
    isPageLoaded
  ]);

  // Reset loading state
  const resetLoading = useCallback(() => {
    logDebug('Resetting loading state');
    
    dispatch({ type: 'RESET_LOADING' });
    
    // Reset refs
    startTimeRef.current = performance.now();
    criticalPathTimeRef.current = null;
    onCompleteCalledRef.current = false;
    
    // Clear any existing safety timeout
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
  }, [logDebug]);

  // Get loading analytics data
  const getAnalytics = useCallback((): LoadingAnalytics => {
    return analytics;
  }, [analytics]);

  // Safety timeout to ensure loading completes
  useEffect(() => {
    // Set up safety timeout
    safetyTimeoutRef.current = setTimeout(() => {
      if (!isPageLoaded) {
        logDebug(`Safety timeout triggered after ${maxLoadingTime}ms`);
        
        // Force-mark all components as loaded
        Object.keys(componentsRef.current).forEach(id => {
          if (!componentsRef.current[id].loaded) {
            markComponentLoaded(id);
          }
        });
        
        // Force loading completion
        dispatch({ type: 'SET_PAGE_LOADED', loaded: true });
        dispatch({ type: 'SET_INITIAL_LOAD_COMPLETE', complete: true });
        
        // Call onComplete
        handleCompletion();
      }
    }, maxLoadingTime);
    
    return () => {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
    };
  }, [maxLoadingTime, isPageLoaded, markComponentLoaded, handleCompletion, logDebug]);

  // Calculate progress based on loaded components and their weights
  useEffect(() => {
    const componentList = Object.values(components);
    if (componentList.length === 0) {
      return;
    }

    // Calculate progress
    const { progress: calculatedProgress, criticalProgress: calculatedCriticalProgress } = 
      getWeightedProgress(components);
    
    // Update progress in state (only if changed)
    if (progress !== calculatedProgress || criticalProgress !== calculatedCriticalProgress) {
      dispatch({
        type: 'UPDATE_PROGRESS',
        progress: calculatedProgress,
        criticalProgress: calculatedCriticalProgress
      });
    }

    // Calculate load times for analytics
    const componentLoadTimes = getComponentLoadTimes(components);

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
        !criticalPathTimeRef.current && 
        !isInitialLoadComplete) {
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
    if (!isPageLoaded && areAllComponentsLoaded(components) && componentList.length > 0) {
      dispatch({ type: 'SET_PAGE_LOADED', loaded: true });
      handleCompletion();
    }
  }, [
    components, 
    isPageLoaded,
    isInitialLoadComplete,
    progress,
    criticalProgress,
    thresholds.criticalThreshold, 
    errors, 
    logDebug, 
    handleCompletion
  ]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<LoadingContextProps>(() => ({
    isPageLoaded,
    isInitialLoadComplete,
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
  ]);

  return React.createElement(
    LoadingContext.Provider,
    { value: contextValue },
    children
  );
};

/**
 * Hook to access the LoadingContext
 * Must be used within a LoadingProvider
 */
export const useLoading = (): LoadingContextProps => {
  const context = useContext(LoadingContext);
  
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  
  return context;
};