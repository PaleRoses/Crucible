import React, { useRef, useEffect, useState, useCallback } from 'react';

/**
 * SlidingBackground Component
 * 
 * A highly configurable background component with parallax and fade effects
 * that integrates seamlessly into existing page layouts.
 * 
 * @param {Object} props - Component props
 * @param {string} props.image - URL of the background image
 * @param {string} [props.position='top'] - Position of the focused area ('top', 'middle', 'bottom')
 * @param {string|number} [props.height='100%'] - Height of the component
 * @param {number} [props.parallaxIntensity=0.2] - Intensity of the parallax effect (0-1)
 * @param {number} [props.parallaxLimitPercent=30] - Maximum percentage of component height the image can move
 * @param {boolean} [props.clampParallax=true] - Whether to clamp parallax movement
 * @param {boolean} [props.enableParallax=true] - Enable/disable parallax effect
 * @param {number} [props.fadeSize=0.4] - Size of the fade effect (0-1, as a fraction of the component)
 * @param {string} [props.backgroundColor='#000'] - Background color for the fade effect
 * @param {number} [props.zIndex=0] - z-index of the component
 * @param {number} [props.blurAmount=0] - Amount of blur for the fade transition (px)
 * @param {number} [props.opacity=1] - Opacity of the background image
 * @param {string} [props.backgroundSize='cover'] - Background size property
 * @param {string} [props.backgroundPosition] - Background position (overrides position setting)
 * @param {string} [props.transitionEffect='gradient'] - Type of transition effect ('gradient', 'dissolve')
 * @param {boolean} [props.fitContainer=true] - Whether the background should fit its container
 * @param {number} [props.heightMultiplier=1.2] - How much larger the background image should be
 * @param {Object} [props.containerStyle={}] - Additional styles for the container
 * @param {boolean} [props.createContainer=true] - Whether to create a container div
 * @param {React.ReactNode} [props.children] - Content to render on top of the background
 * @param {string} [props.className=''] - Additional CSS classes for the container
 */
const SlidingBackground = ({
  image,
  position = 'top',
  height = '100%',
  parallaxIntensity = 0.2,
  parallaxLimitPercent = 30,
  clampParallax = true,
  enableParallax = true,
  fadeSize = 0.4,
  backgroundColor = '#000',
  zIndex = 0,
  blurAmount = 0,
  opacity = 1,
  backgroundSize = 'cover',
  backgroundPosition,
  transitionEffect = 'mask',  // Changed default to the new mask approach
  fitContainer = true,
  heightMultiplier = 1.2,
  containerStyle = {},
  createContainer = true,
  children,
  className = '',
}) => {
  const elementRef = useRef(null);
  const canvasRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  /**
   * Renders the dissolve effect on the canvas
   * Creates a smooth transition that completely fades into the background color
   */
  const renderDissolveEffect = useCallback(() => {
    if (!canvasRef.current || !imageRef.current || !dimensions.width || !dimensions.height) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate parallax offset with clamping if enabled
    let parallaxOffset = enableParallax ? scrollPosition * parallaxIntensity : 0;
    
    // Clamp parallax movement if enabled
    if (clampParallax && enableParallax) {
      const maxOffset = (canvas.height * parallaxLimitPercent) / 100;
      parallaxOffset = Math.max(Math.min(parallaxOffset, maxOffset), -maxOffset);
    }
    
    // Calculate image dimensions to maintain aspect ratio while covering the canvas
    const imgAspect = img.width / img.height;
    const canvasAspect = canvas.width / canvas.height;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (fitContainer) {
      // Apply heightMultiplier to make image larger than container if needed
      if (imgAspect > canvasAspect) {
        // Image is wider than canvas (relative to height)
        drawHeight = canvas.height * heightMultiplier;
        drawWidth = drawHeight * imgAspect;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        // Image is taller than canvas (relative to width)
        drawWidth = canvas.width * heightMultiplier;
        drawHeight = drawWidth / imgAspect;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = (canvas.height - drawHeight) / 2;
      }
    } else {
      // Cover the canvas
      if (imgAspect > canvasAspect) {
        drawHeight = canvas.height;
        drawWidth = drawHeight * imgAspect;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = canvas.width;
        drawHeight = drawWidth / imgAspect;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      }
    }
    
    // Adjust based on position setting
    if (position === 'top') {
      offsetY = 0;
    } else if (position === 'bottom') {
      offsetY = canvas.height - drawHeight;
    } else if (position === 'middle') {
      offsetY = (canvas.height - drawHeight) / 2;
    }
    
    // Apply parallax
    offsetY += parallaxOffset;
    
    // Draw the image
    ctx.globalAlpha = opacity;
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    
    // Apply blur if specified
    if (blurAmount > 0) {
      ctx.filter = `blur(${blurAmount}px)`;
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      ctx.filter = 'none';
    }
    
    // Extract RGB components from backgroundColor
    let r = 0, g = 0, b = 0;
    if (backgroundColor.startsWith('#')) {
      // Handle hex color
      const hex = backgroundColor.substring(1);
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      }
    } else if (backgroundColor.startsWith('rgb')) {
      // Handle rgb/rgba color
      const match = backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      if (match) {
        r = parseInt(match[1]);
        g = parseInt(match[2]);
        b = parseInt(match[3]);
      }
    }
    
    // Determine which edges should fade based on position
    const shouldFadeTop = position === 'bottom' || position === 'middle';
    const shouldFadeBottom = position === 'top' || position === 'middle';
    
    // Top fade effect
    if (shouldFadeTop) {
      const fadeHeight = Math.floor(canvas.height * fadeSize);
      const imageData = ctx.getImageData(0, 0, canvas.width, fadeHeight);
      const pixels = imageData.data;
      
      for (let y = 0; y < fadeHeight; y++) {
        // Calculate how much of the background color to show
        // At y=0 (top edge), should be 100% background color
        // At y=fadeHeight (bottom of gradient), should be 0% background color
        const ratio = 1 - (y / fadeHeight);
        
        for (let x = 0; x < canvas.width; x++) {
          const pixelIndex = (y * canvas.width + x) * 4;
          
          // Progressive smooth fade with noise for more organic appearance
          const noise = Math.random() * 0.15; // Small amount of noise
          const fadeAmount = Math.min(1, Math.max(0, ratio + noise * (ratio < 0.2 ? 0 : -1)));
          
          if (fadeAmount > 0.98) {
            // Complete fade to background color at the edge
            pixels[pixelIndex] = r;
            pixels[pixelIndex + 1] = g;
            pixels[pixelIndex + 2] = b;
            pixels[pixelIndex + 3] = 255; // Fully opaque
          } else if (fadeAmount > 0) {
            // Blend between image and background color
            const imgWeight = 1 - fadeAmount;
            pixels[pixelIndex] = Math.round(pixels[pixelIndex] * imgWeight + r * fadeAmount);
            pixels[pixelIndex + 1] = Math.round(pixels[pixelIndex + 1] * imgWeight + g * fadeAmount);
            pixels[pixelIndex + 2] = Math.round(pixels[pixelIndex + 2] * imgWeight + b * fadeAmount);
          }
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
    }
    
    // Bottom fade effect
    if (shouldFadeBottom) {
      const fadeHeight = Math.floor(canvas.height * fadeSize);
      const startY = canvas.height - fadeHeight;
      const imageData = ctx.getImageData(0, startY, canvas.width, fadeHeight);
      const pixels = imageData.data;
      
      for (let y = 0; y < fadeHeight; y++) {
        // Calculate how much of the background color to show
        // At y=fadeHeight-1 (bottom edge), should be 100% background color
        // At y=0 (top of gradient), should be 0% background color
        const ratio = y / fadeHeight;
        
        for (let x = 0; x < canvas.width; x++) {
          const pixelIndex = (y * canvas.width + x) * 4;
          
          // Progressive smooth fade with noise for more organic appearance
          const noise = Math.random() * 0.15; // Small amount of noise
          const fadeAmount = Math.min(1, Math.max(0, ratio + noise * (ratio < 0.2 ? 0 : -1)));
          
          if (fadeAmount > 0.98) {
            // Complete fade to background color at the edge
            pixels[pixelIndex] = r;
            pixels[pixelIndex + 1] = g;
            pixels[pixelIndex + 2] = b;
            pixels[pixelIndex + 3] = 255; // Fully opaque
          } else if (fadeAmount > 0) {
            // Blend between image and background color
            const imgWeight = 1 - fadeAmount;
            pixels[pixelIndex] = Math.round(pixels[pixelIndex] * imgWeight + r * fadeAmount);
            pixels[pixelIndex + 1] = Math.round(pixels[pixelIndex + 1] * imgWeight + g * fadeAmount);
            pixels[pixelIndex + 2] = Math.round(pixels[pixelIndex + 2] * imgWeight + b * fadeAmount);
          }
        }
      }
      
      ctx.putImageData(imageData, 0, startY);
    }
  }, [
    scrollPosition,
    parallaxIntensity,
    parallaxLimitPercent,
    clampParallax,
    enableParallax,
    position,
    opacity,
    blurAmount,
    fadeSize,
    backgroundColor,
    dimensions.width,
    dimensions.height,
    fitContainer,
    heightMultiplier
  ]);
  
  // Set up scroll event listener
  useEffect(() => {
    // Only attach scroll listener if parallax is enabled
    if (!enableParallax) {
      setScrollPosition(0);
      return;
    }
    
    const handleScroll = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      animationFrameRef.current = requestAnimationFrame(() => {
        setScrollPosition(window.scrollY);
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enableParallax]);
  
  // Update canvas when scroll position changes (for parallax)
  useEffect(() => {
    if (imageLoaded && transitionEffect === 'dissolve') {
      renderDissolveEffect();
    }
  }, [scrollPosition, imageLoaded, transitionEffect, renderDissolveEffect]);
  
  // Handle image loading and canvas setup
  useEffect(() => {
    const updateDimensions = () => {
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        const newDimensions = { 
          width: rect.width, 
          height: rect.height 
        };
        
        setDimensions(newDimensions);
        
        if (canvasRef.current && transitionEffect === 'dissolve') {
          canvasRef.current.width = newDimensions.width;
          canvasRef.current.height = newDimensions.height;
          
          if (imageLoaded) {
            renderDissolveEffect();
          }
        }
      }
    };
    
    // Load image if using canvas-based effects
    if (transitionEffect === 'dissolve') {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = image;
      img.onload = () => {
        imageRef.current = img;
        setImageLoaded(true);
        updateDimensions();
      };
    }
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, [image, transitionEffect, renderDissolveEffect, imageLoaded]);
  
  // Calculate parallax transformation
  let parallaxOffset = enableParallax ? scrollPosition * parallaxIntensity : 0;
  
  // Clamp parallax movement if enabled
  if (clampParallax && dimensions.height && enableParallax) {
    const maxOffset = (dimensions.height * parallaxLimitPercent) / 100;
    parallaxOffset = Math.max(Math.min(parallaxOffset, maxOffset), -maxOffset);
  }
  
  // Determine background position based on position setting
  let bgPosition = backgroundPosition;
  if (!bgPosition) {
    switch (position) {
      case 'top':
        bgPosition = 'center top';
        break;
      case 'bottom':
        bgPosition = 'center bottom';
        break;
      case 'middle':
      default:
        bgPosition = 'center center';
    }
  }
  
  // Determine which edges should fade based on position setting
  const shouldFadeTop = position === 'bottom' || position === 'middle';
  const shouldFadeBottom = position === 'top' || position === 'middle';
  
  // Default container styles
  const defaultContainerStyle = {
    position: 'relative',
    width: '100%',
    height,
    overflow: 'hidden',
    zIndex,
  };
  
  // Combine default and custom container styles
  const mergedContainerStyle = {
    ...defaultContainerStyle,
    ...containerStyle
  };
  
  // Content for rendering
  const backgroundContent = (
    <>
      {/* CSS-based gradient transition */}
      {transitionEffect === 'gradient' && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: fitContainer ? `${heightMultiplier * 100}%` : '100%',
              backgroundImage: `url(${image})`,
              backgroundSize: fitContainer ? 'contain' : backgroundSize,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: bgPosition,
              transform: `translateY(${parallaxOffset}px)`,
              transition: 'transform 0.1s ease-out',
              opacity,
              filter: blurAmount > 0 ? `blur(${blurAmount}px)` : 'none'
            }}
          />
          
          {/* Top fade gradient */}
          {shouldFadeTop && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${fadeSize * 100}%`,
                background: `linear-gradient(to bottom, ${backgroundColor} 0%, rgba(0,0,0,0) 100%)`,
                pointerEvents: 'none'
              }}
            />
          )}
          
          {/* Bottom fade gradient */}
          {shouldFadeBottom && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: `${fadeSize * 100}%`,
                background: `linear-gradient(to top, ${backgroundColor} 0%, rgba(0,0,0,0) 100%)`,
                pointerEvents: 'none'
              }}
            />
          )}
        </>
      )}
      
      {/* Canvas-based dissolve transition */}
      {transitionEffect === 'dissolve' && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
        />
      )}
      
      {/* Content container */}
      {children && (
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            height: '100%'
          }}
        >
          {children}
        </div>
      )}
    </>
  );
  
  // Render with or without container based on createContainer prop
  return createContainer ? (
    <div
      ref={elementRef}
      className={className}
      style={mergedContainerStyle}
    >
      {backgroundContent}
    </div>
  ) : (
    <div ref={elementRef} className={className} style={{ position: 'relative' }}>
      {backgroundContent}
    </div>
  );
};

export default SlidingBackground;