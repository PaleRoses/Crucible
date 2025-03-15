/**
 * Progressive Loading System - UI Components
 * 
 * This module provides UI components for the progressive loading system,
 * including a customizable comet loader animation with enhanced visual effects.
 */

import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { useLoading } from './loading-core';
import { ResourceLoader, ResourceOptions } from './resource-tracking';

// ========================================================
// TYPES AND INTERFACES
// ========================================================

export interface LoaderAppearance {
  width?: number;
  height?: number;
  radius?: number;
  speed?: number;
  trailLength?: number;
  trailSegments?: number;
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
  showProgressBar?: boolean;
  showPercentage?: boolean;
}

// ========================================================
// PAGE LOADER COMPONENT
// ========================================================

interface PageLoaderProps {
  children: React.ReactNode;
  options?: PageTransitionOptions;
  appearance?: LoaderAppearance;
  resourceOptions?: ResourceOptions;
  maxWaitTime?: number;
}

/**
 * PageLoader component that displays an enhanced comet animation during page loading
 */
export const PageLoader: React.FC<PageLoaderProps> = memo(function PageLoader({
  children,
  options = {},
  appearance = {},
  resourceOptions = {
    trackImages: true,
    trackFonts: true,
    trackScripts: true,
    trackStyles: true
  },
  maxWaitTime = 10000000
}) {
  // Destructure options with defaults
  const {
    minDisplayTime = 500,
    fadeOutDuration = 600,
    transitionDuration = 400,
    showProgressBar = true,
    showPercentage = true
  } = options;

  // Get loading state from context
  const {
    isPageLoaded,
    // Only use the properties we need
    progress
  } = useLoading();

  // Component state
  const [minTimeElapsed, setMinTimeElapsed] = useState(minDisplayTime === 0);
  const [visualState, setVisualState] = useState<'loading' | 'fadeOut' | 'complete'>(
    isPageLoaded ? 'complete' : 'loading'
  );

  // References for animation
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const transitionStartRef = useRef<number | null>(null);
  const rotationRef = useRef(0);
  const lastTimeRef = useRef(0);

  // Configure appearance properties with improved defaults and smaller comet head
  const loaderConfig = {
    width: appearance.width || 240, // Reduced from 300
    height: appearance.height || 240, // Reduced from 300
    radius: appearance.radius || 80, // Reduced from 90
    speed: appearance.speed || 0.12,
    trailLength: appearance.trailLength || 120,
    trailSegments: appearance.trailSegments || 20,
    cometSize: appearance.cometSize || 3, // Reduced from 5 for smaller head
    cometHeadScale: appearance.cometHeadScale || 0.6, // Reduced from 0.7
    coreColor: appearance.coreColor || 'rgba(255, 250, 235, 1)',
    glowColor: appearance.glowColor || 'rgba(255, 215, 0, 0.8)', // Reduced opacity
    trailColor: appearance.trailColor || 'rgba(218, 165, 32, 0.6)' // Reduced opacity
  };

  // Handle minimum display time
  useEffect(() => {
    if (minDisplayTime <= 0) return;

    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime]);

  // Handle transition based on loading state
  useEffect(() => {
    // Start transition when conditions are met
    if (isPageLoaded && minTimeElapsed && visualState === 'loading') {
      setVisualState('fadeOut');
      transitionStartRef.current = performance.now();

      // Complete transition after fadeOut duration
      const timer = setTimeout(() => {
        setVisualState('complete');
      }, fadeOutDuration);

      return () => clearTimeout(timer);
    }

    // Safety timeout - force transition after maxWaitTime
    if (visualState === 'loading') {
      const safetyTimer = setTimeout(() => {
        if (visualState === 'loading') {
          setVisualState('fadeOut');
          transitionStartRef.current = performance.now();
          
          setTimeout(() => {
            setVisualState('complete');
          }, fadeOutDuration);
        }
      }, maxWaitTime);

      return () => clearTimeout(safetyTimer);
    }
  }, [isPageLoaded, minTimeElapsed, visualState, fadeOutDuration, maxWaitTime]);

  // Enhanced draw comet animation on canvas (inspired by introSequence.js)
  const drawComet = useCallback((timestamp: number) => {
    if (!canvasRef.current || visualState === 'complete') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize timestamp on first run
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp;
    }

    // Calculate delta time for smooth animation (capped to prevent jumps)
    const deltaTime = Math.min(timestamp - lastTimeRef.current, 100); 
    lastTimeRef.current = timestamp;

    // Calculate opacity based on fade state
    let fadeProgress = 1;
    if (visualState === 'fadeOut') {
      if (!transitionStartRef.current) {
        transitionStartRef.current = timestamp;
      }
      const fadeElapsed = timestamp - transitionStartRef.current;
      fadeProgress = Math.max(0, 1 - (fadeElapsed / fadeOutDuration));

      if (fadeProgress <= 0) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        return;
      }
    }

    // Update rotation based on speed setting
    const rotationDelta = loaderConfig.speed * deltaTime;
    rotationRef.current = (rotationRef.current + rotationDelta) % 360;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Ensure center coordinates are calculated correctly
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Calculate comet head position
    const headAngle = rotationRef.current * Math.PI / 180;
    const headX = centerX + loaderConfig.radius * Math.cos(headAngle);
    const headY = centerY + loaderConfig.radius * Math.sin(headAngle);
    
    // Smooth fade progress for better visual transition
    const smoothFadeProgress = visualState === 'fadeOut' 
      ? Math.min(1, Math.max(0, fadeProgress * 1.1)) 
      : 1;

    // Draw trail segments with decreasing opacity and improved effects
    for (let i = 0; i < loaderConfig.trailSegments; i++) {
      // Calculate position for this segment
      const segmentAngle = ((rotationRef.current - (i * (loaderConfig.trailLength / loaderConfig.trailSegments))) % 360) * Math.PI / 180;
      const segmentX = centerX + loaderConfig.radius * Math.cos(segmentAngle);
      const segmentY = centerY + loaderConfig.radius * Math.sin(segmentAngle);
      
      // Calculate next segment position (for line drawing)
      const nextSegmentAngle = ((rotationRef.current - ((i + 1) * (loaderConfig.trailLength / loaderConfig.trailSegments))) % 360) * Math.PI / 180;
      const nextSegmentX = centerX + loaderConfig.radius * Math.cos(nextSegmentAngle);
      const nextSegmentY = centerY + loaderConfig.radius * Math.sin(nextSegmentAngle);
      
      // Calculate opacity based on position in trail
      const baseOpacity = 0.7 * (1 - (i / loaderConfig.trailSegments)); // Reduced from 0.8
      
      // Draw trail segment
      ctx.beginPath();
      ctx.moveTo(segmentX, segmentY);
      ctx.lineTo(nextSegmentX, nextSegmentY);
      
      // Vary line width from head to tail - reduced overall
      const segmentWidth = 2 * (1 - (i / loaderConfig.trailSegments)) + 0.5; // Reduced from 2.5
      
      // Set shadow/glow for trail
      const trailOpacity = baseOpacity * smoothFadeProgress;
      ctx.shadowColor = loaderConfig.glowColor.replace(/[\d.]+\)$/, trailOpacity + ')');
      ctx.shadowBlur = 8 * (1 - (i / loaderConfig.trailSegments)) + 4; // Reduced from 10/5
      
      // Set line style and draw
      ctx.strokeStyle = loaderConfig.trailColor.replace(/[\d.]+\)$/, trailOpacity + ')');
      ctx.lineWidth = segmentWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
      
    // Add twinkle effect during fade-out
    if (visualState === 'fadeOut') {
      const twinkleIntensity = Math.sin(timestamp / 100) * 0.2 + 0.8;
      ctx.shadowBlur = 15 * twinkleIntensity; // Reduced from 20
    } else {
      ctx.shadowBlur = 15; // Reduced from 20
    }
    
    // Draw comet head with multiple layers for improved visual effect
    ctx.shadowColor = loaderConfig.glowColor;
    
    // Larger outer glow
    ctx.beginPath();
    ctx.arc(headX, headY, loaderConfig.cometSize, 0, Math.PI * 2);
    ctx.fillStyle = loaderConfig.glowColor.replace(/[\d.]+\)$/, (0.6 * smoothFadeProgress) + ')'); // Reduced from 0.7
    ctx.fill();
    
    // Brighter inner core
    ctx.beginPath();
    ctx.arc(headX, headY, loaderConfig.cometSize * 0.6, 0, Math.PI * 2); // Reduced from 0.7
    ctx.fillStyle = loaderConfig.glowColor.replace(/[\d.]+\)$/, (0.8 * smoothFadeProgress) + ')'); // Reduced from 0.9
    ctx.fill();
    
    // Brightest center point
    ctx.beginPath();
    ctx.arc(headX, headY, loaderConfig.cometSize * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = loaderConfig.coreColor;
    ctx.globalAlpha = smoothFadeProgress;
    ctx.fill();
    ctx.globalAlpha = 1;

    // Schedule next frame
    animationRef.current = requestAnimationFrame(drawComet);
  }, [
    visualState, 
    fadeOutDuration, 
    loaderConfig.speed, 
    loaderConfig.radius, 
    loaderConfig.trailLength,
    loaderConfig.trailSegments, 
    loaderConfig.cometSize, 
    loaderConfig.coreColor,
    loaderConfig.glowColor,
    loaderConfig.trailColor
  ]);

  // Start animation when component mounts
  useEffect(() => {
    if (visualState !== 'complete') {
      animationRef.current = requestAnimationFrame(drawComet);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [drawComet, visualState]);

  return (
    <div className="progressive-loader-container">
      {/* Resource tracking */}
      <ResourceLoader 
        priority="critical"
        maxWaitTime={maxWaitTime}
        options={resourceOptions}
      />
      
      {/* Loader overlay - positioned above background but below content when needed */}
      {visualState !== 'complete' && (
        <div 
          className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-90 z-40"
          style={{
            opacity: visualState === 'fadeOut' ? 0 : 1,
            transition: `opacity ${fadeOutDuration}ms ease-out`,
            pointerEvents: 'none' // Allow clicks to pass through when fading
          }}
        >
          <div className="flex flex-col items-center justify-center w-full h-full pointer-events-auto">
            {/* Canvas for comet animation - with explicit centering styles */}
            <canvas 
              ref={canvasRef} 
              width={loaderConfig.width} 
              height={loaderConfig.height}
              className="block mx-auto" 
              style={{ display: 'block', margin: '0 auto' }} 
              data-testid="comet-loader-canvas"
            />
            
            {/* Progress indicator */}
            {(showPercentage || showProgressBar) && (
              <div className="mt-6 text-center">
                {showPercentage && (
                  <span className="text-amber-200 text-xl font-light">
                    {Math.round(progress)}%
                  </span>
                )}
                
                {showProgressBar && (
                  <div className="mt-2 w-48 h-1 bg-gray-800 rounded overflow-hidden">
                    <div 
                      className="h-full bg-amber-200" 
                      style={{ 
                        width: `${Math.min(100, Math.max(0, progress))}%`,
                        transition: 'width 0.3s ease-out'
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Page content - positioned to appear above loader once completed */}
      <div
        className="transition-opacity relative z-50"
        style={{
          opacity: visualState === 'complete' ? 1 : 0,
          visibility: visualState === 'complete' ? 'visible' : 'hidden',
          transitionDuration: `${transitionDuration}ms`,
          transitionProperty: 'opacity, visibility',
          transitionTimingFunction: 'ease-in-out'
        }}
      >
        {children}
      </div>
    </div>
  );
});

PageLoader.displayName = 'PageLoader';

// ========================================================
// EXPORTS
// ========================================================

export { ResourceLoader } from './resource-tracking';
export { useLoading } from './loading-core';