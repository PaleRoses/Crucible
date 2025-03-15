'use client'

import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { useLoading } from './loading-core';
import { ResourceLoader, ResourceOptions } from './resource-tracking';

// Types preserved but simplified
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

interface PageLoaderProps {
  children: React.ReactNode;
  options?: PageTransitionOptions;
  appearance?: LoaderAppearance;
  resourceOptions?: ResourceOptions;
  maxWaitTime?: number;
}

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
  maxWaitTime = 0
}) {
  // Options with defaults
  const {
    minDisplayTime = 0,
    fadeOutDuration = 600,
    transitionDuration = 400,
    showProgressBar = false,
    showPercentage = true
  } = options;

  // Use only needed loading state
  const { isPageLoaded, progress } = useLoading();

  // Core component state
  const [minTimeElapsed, setMinTimeElapsed] = useState(minDisplayTime === 0);
  const [visualState, setVisualState] = useState<'loading' | 'fadeOut' | 'complete'>(
    isPageLoaded ? 'complete' : 'loading'
  );

  // Animation refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const transitionStartRef = useRef<number | null>(null);
  const rotationRef = useRef(0);
  const lastTimeRef = useRef(0);

  // Loader configuration
  const loaderConfig = {
    width: appearance.width || 240,
    height: appearance.height || 240, // Increased for proper aspect ratio
    radius: appearance.radius || 80,
    speed: appearance.speed || 0.12,
    trailLength: appearance.trailLength || 120,
    trailSegments: appearance.trailSegments || 20,
    cometSize: appearance.cometSize || 3,
    cometHeadScale: appearance.cometHeadScale || 0.6,
    coreColor: appearance.coreColor || 'rgba(255, 250, 235, 1)',
    glowColor: appearance.glowColor || 'rgba(255, 215, 0, 0.8)',
    trailColor: appearance.trailColor || 'rgba(218, 165, 32, 0.6)'
  };

  // Minimum display time effect
  useEffect(() => {
    if (minDisplayTime <= 0) return;
    const timer = setTimeout(() => setMinTimeElapsed(true), minDisplayTime);
    return () => clearTimeout(timer);
  }, [minDisplayTime]);

  // Transition handler
  useEffect(() => {
    // Handle normal completion transition
    if (isPageLoaded && minTimeElapsed && visualState === 'loading') {
      setVisualState('fadeOut');
      transitionStartRef.current = performance.now();
      const timer = setTimeout(() => setVisualState('complete'), fadeOutDuration);
      return () => clearTimeout(timer);
    }

    // Safety timeout
    if (visualState === 'loading') {
      const safetyTimer = setTimeout(() => {
        if (visualState === 'loading') {
          console.warn('Safety timeout triggered - forcing loader completion');
          setVisualState('fadeOut');
          setTimeout(() => setVisualState('complete'), fadeOutDuration);
        }
      }, maxWaitTime);
      return () => clearTimeout(safetyTimer);
    }
  }, [isPageLoaded, minTimeElapsed, visualState, fadeOutDuration, maxWaitTime]);

  // Comet drawing function (preserved as is since user mentioned it's good)
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

  // Animation start/cleanup
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
    <div className="progressive-loader-container relative">
      {/* Resource tracking - simplified priority */}
      <ResourceLoader 
        priority="critical"
        maxWaitTime={maxWaitTime}
        options={resourceOptions}
      />
      
      {/* Loader overlay - FIXED with proper z-index and positioning */}
      {visualState !== 'complete' && (
        <div 
          className="fixed inset-0 flex items-center justify-center"
          style={{
            zIndex: 9999, // Very high z-index to ensure it's on top
            backgroundColor: 'rgba(17, 17, 17, 0.9)',
            opacity: visualState === 'fadeOut' ? 0 : 1,
            transition: `opacity ${fadeOutDuration}ms ease-out`
          }}
        >
          <div className="relative flex flex-col items-center justify-center">
            {/* Canvas positioned absolutely */}
            <canvas 
              ref={canvasRef} 
              width={loaderConfig.width} 
              height={loaderConfig.height}
              style={{ 
                display: 'block',
                maxWidth: '100vw',
                maxHeight: '100vh'
              }} 
              data-testid="comet-loader-canvas"
            />
            
            {/* Progress indicators */}
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
      
      {/* Page content */}
      <div
        className="relative"
        style={{
          opacity: visualState === 'complete' ? 1 : 0,
          visibility: visualState === 'complete' ? 'visible' : 'hidden',
          transition: `opacity ${transitionDuration}ms ease-in-out, visibility ${transitionDuration}ms ease-in-out`,
          zIndex: visualState === 'complete' ? 1 : -1
        }}
      >
        {children}
      </div>
    </div>
  );
});

PageLoader.displayName = 'PageLoader';

export { ResourceLoader } from './resource-tracking';
export { useLoading } from './loading-core';