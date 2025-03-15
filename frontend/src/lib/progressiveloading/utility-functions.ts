/**
 * Progressive Loading System - Utility Functions
 * 
 * This module provides common utility functions used across the progressive loading system.
 */

// ========================================================
// SAFETY TIMEOUT MANAGER
// ========================================================

/**
 * SafetyTimeoutManager coordinates all timeouts to prevent conflicts
 * and ensures that loading continues even if some resources fail to load
 */
export class SafetyTimeoutManager {
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
  // DEVICE AND BROWSER DETECTION
  // ========================================================
  
  /**
   * Get device memory if available
   */
  export const getDeviceMemory = (): number | undefined => {
    if (typeof navigator !== 'undefined') {
      const nav = navigator as Navigator & { deviceMemory?: number };
      return nav.deviceMemory;
    }
    return undefined;
  };
  
  /**
   * Get network connection info if available
   */
  export const getConnectionInfo = (): { effectiveType?: string } => {
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
  export const isMobileDevice = (): boolean => {
    if (typeof navigator !== 'undefined') {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    return false;
  };
  
  // ========================================================
  // ARRAY AND OBJECT UTILITIES
  // ========================================================
  
  /**
   * Compare two arrays for equality (for memoization)
   */
  export function arrayEquals<T>(a: T[], b: T[]): boolean {
    if (a === b) return true;
    if (a.length !== b.length) return false;
    
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    
    return true;
  }
  
  /**
   * Check if dependencies array has changed
   */
  export function haveDependenciesChanged(prev: string[] = [], next: string[] = []): boolean {
    if (prev.length !== next.length) return true;
    return prev.some((dep, i) => dep !== next[i]);
  }
  
  /**
   * Generate a cache key from a URL and method
   */
  export function generateCacheKey(url: string, method: string = 'GET'): string {
    return `${url}|${method}`;
  }
  
  // ========================================================
  // PERFORMANCE UTILITIES
  // ========================================================
  
  /**
   * Simple performance measurement utility
   */
  export class PerformanceMeasure {
    private marks: Record<string, number> = {};
    
    /**
     * Start measuring a named operation
     */
    start(name: string): void {
      this.marks[`${name}_start`] = performance.now();
    }
    
    /**
     * End measuring a named operation and return duration
     */
    end(name: string): number {
      const endTime = performance.now();
      const startMark = this.marks[`${name}_start`];
      
      if (startMark === undefined) {
        console.warn(`No start mark found for "${name}"`);
        return 0;
      }
      
      const duration = endTime - startMark;
      this.marks[`${name}_end`] = endTime;
      this.marks[`${name}_duration`] = duration;
      
      return duration;
    }
    
    /**
     * Get the duration of a completed measurement
     */
    getDuration(name: string): number | undefined {
      return this.marks[`${name}_duration`];
    }
    
    /**
     * Reset all measurements
     */
    reset(): void {
      this.marks = {};
    }
  }