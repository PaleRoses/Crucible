import { useEffect, useRef } from 'react';

/**
 * Custom hook that adds a subtle twinkling effect to an element
 * The effect is applied when the element is hovered or active
 * 
 * @param isActive Boolean to indicate if the element is active
 * @returns Ref to attach to the element that should receive the effect
 */
const useTwinkleEffect = (isActive: boolean = false) => {
  const elementRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    let animationFrame: number;
    let twinkleIntensity = 0;
    let increasing = true;
    const maxIntensity = 0.3; // Maximum brightness increase
    const twinkleSpeed = 0.005; // Speed of the twinkling effect
    
    // Define the base color values
    const goldR = 191;
    const goldG = 173;
    const goldB = 127;
    
    const baseColor = isActive ?
      `rgba(${goldR}, ${goldG}, ${goldB}, 1)` : // Gold color when active
      'rgba(224, 224, 224, 0.7)'; // Text color when not active
    
    const hoverColor = `rgba(${goldR}, ${goldG}, ${goldB}, 1)`; // Gold color on hover
    
    const applyTwinkleEffect = () => {
      if (!element) return;
      
      // Only animate if element is active or being hovered
      if (isActive || element.matches(':hover')) {
        // Update twinkle intensity
        if (increasing) {
          twinkleIntensity += twinkleSpeed;
          if (twinkleIntensity >= maxIntensity) {
            twinkleIntensity = maxIntensity;
            increasing = false;
          }
        } else {
          twinkleIntensity -= twinkleSpeed;
          if (twinkleIntensity <= 0) {
            twinkleIntensity = 0;
            increasing = true;
          }
        }
        
        // Apply the color with brightness variation for twinkling
        if (element.matches(':hover') || isActive) {
          // Use the same gold color values from hoverColor
          const r = goldR + Math.round(twinkleIntensity * (255 - goldR));
          const g = goldG + Math.round(twinkleIntensity * (255 - goldG));
          const b = goldB + Math.round(twinkleIntensity * (255 - goldB));
          element.style.color = `rgb(${r}, ${g}, ${b})`;
          
          // Apply a subtle text shadow for glow effect
          const shadowIntensity = Math.round(twinkleIntensity * 10);
          element.style.textShadow = `0 0 ${shadowIntensity}px ${hoverColor.replace('1)', `${twinkleIntensity + 0.2})}`)}`;
        } else {
          element.style.color = baseColor;
          element.style.textShadow = 'none';
        }
      } else {
        // Reset when not hovered or active
        element.style.color = '';
        element.style.textShadow = '';
        twinkleIntensity = 0;
        increasing = true;
      }
      
      // Continue animation loop
      animationFrame = requestAnimationFrame(applyTwinkleEffect);
    };
    
    // Start animation
    animationFrame = requestAnimationFrame(applyTwinkleEffect);
    
    // Set up event listeners for hover
    const handleMouseEnter = () => {
      twinkleIntensity = 0; // Reset intensity on hover start
      increasing = true;
    };
    
    element.addEventListener('mouseenter', handleMouseEnter);
    
    // Clean up animation and event listeners on unmount
    return () => {
      cancelAnimationFrame(animationFrame);
      element.removeEventListener('mouseenter', handleMouseEnter);
      
      // Clean up styles
      if (element) {
        element.style.color = '';
        element.style.textShadow = '';
      }
    };
  }, [isActive]);
  
  return elementRef;
};

export default useTwinkleEffect;