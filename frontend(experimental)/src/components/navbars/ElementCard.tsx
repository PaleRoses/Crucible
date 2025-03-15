import React, { useCallback, useRef, memo } from 'react';

// TypeScript interfaces
interface Tag {
  id?: string | number;
  text: string;
}

interface Project {
  id?: string | number;
  title: string;
  category: string;
  description: string;
  image: string;
  tags?: Tag[];
}

interface ElementCardsProps {
  project: Project;
  lowPerformanceMode?: boolean;
  onClick?: (project: Project) => void;
}

/**
 * ElementCards
 * 
 * A highly optimized project card component with performance enhancements:
 * - Uses CSS variables for animations
 * - Minimal DOM nodes
 * - Optimized for low-end devices with feature detection
 * - Properly memoized to prevent unnecessary re-renders
 * 
 * @param {ElementCardsProps} props - Component props
 */
const ElementCards: React.FC<ElementCardsProps> = ({
  project,
  lowPerformanceMode = false,
  onClick
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Memoized hardware capability check
  const useLightMode = React.useMemo(() => {
    if (lowPerformanceMode) return true;
    
    // Only run this check on client-side
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches || 
        (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
    }
    return false;
  }, [lowPerformanceMode]);
  
  // Memoized click handler
  const handleClick = useCallback(() => {
    if (onClick) onClick(project);
  }, [onClick, project]);
  
  // Dynamic styles for animations using CSS variables
  const cardStyle = {
    '--card-transform': 'translate3d(0,0,0)',
    '--card-shadow': '0 8px 25px rgba(0, 0, 0, 0.25)',
    '--image-scale': '1',
    '--overlay-opacity': '0.5',
    '--glow-opacity': '0',
  } as React.CSSProperties;

  // Hover styles for light mode (reduced animations)
  const lightModeHoverClass = useLightMode ? '' : 
    'hover:translate-y-[-5px] hover:scale-[1.02] hover:shadow-lg hover:[--image-scale:1.05] hover:[--overlay-opacity:0.2] hover:[--glow-opacity:1]';
  
  return (
    <div 
      ref={cardRef}
      className={`
        relative h-full rounded-lg overflow-hidden bg-[rgba(15,15,15,0.7)] 
        shadow-[0_8px_25px_rgba(0,0,0,0.25)] border border-[rgba(160,142,97,0.2)]
        flex flex-col transform transition-all duration-300 ease-in-out
        ${onClick ? 'cursor-pointer' : ''}
        ${lightModeHoverClass}
      `}
      style={cardStyle}
      onClick={onClick ? handleClick : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Border glow effect */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-lg shadow-[inset_0_0_20px_rgba(191,173,127,0.2),0_0_30px_rgba(191,173,127,0.15)] z-10 transition-opacity duration-500"
        style={{ opacity: 'var(--glow-opacity)' }}
        aria-hidden="true" 
      />
      
      {/* Image section */}
      <div className="h-[220px] relative overflow-hidden">
        <img
          src={project.image}
          alt=""
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out"
          style={{ transform: 'scale(var(--image-scale))' }}
          loading="lazy"
          decoding="async"
        />
        <div 
          className="absolute inset-0 bg-gradient-to-b from-[rgba(15,15,15,0.1)] to-[rgba(15,15,15,0.3)] transition-opacity duration-500"
          style={{ opacity: 'var(--overlay-opacity)' }}
          aria-hidden="true" 
        />
      </div>
      
      {/* Content section */}
      <div className="p-[1.5rem_1.8rem] flex flex-col flex-1">
        <div className="mb-3">
          <h2 className="text-[1.6rem] text-[#bfad7f] tracking-[0.04em] m-0 font-light leading-[1.2]">
            {project.title}
          </h2>
          <p className="text-[0.95rem] text-[rgba(191,173,127,0.7)] tracking-[0.05em] font-light italic mt-[0.4rem] mb-0">
            {project.category}
          </p>
        </div>
        
        <p className="text-[0.9rem] text-[rgba(224,224,224,0.9)] leading-[1.6] font-['Garamond','Adobe_Caslon_Pro',serif] font-light my-[0.5rem_0_1.5rem_0] flex-1">
          {project.description}
        </p>
        
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-[rgba(160,142,97,0.15)]">
            {project.tags.map((tag, index) => (
              <span 
                key={tag.id || index} 
                className="inline-flex items-center py-[0.3rem] px-[0.7rem] rounded bg-[rgba(191,173,127,0.1)] border border-[rgba(191,173,127,0.2)] text-[rgba(191,173,127,0.9)] text-[0.75rem] font-normal tracking-[0.02em]"
              >
                {tag.text}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Add display name for better debugging
ElementCards.displayName = 'ElementCards';

// Export memoized component to prevent unnecessary re-renders
export default memo(ElementCards);