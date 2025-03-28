import React, { useCallback, useMemo, memo, forwardRef } from 'react';

// Extend CSSProperties to include custom CSS variables
declare module 'react' {
  interface CSSProperties {
    '--image-scale'?: string;
    '--glow-opacity'?: string;
    '--overlay-opacity'?: string;
  }
}
import Image from 'next/image';

/**
 * =====================================================================
 * ProjectCard Component
 * =====================================================================
 * 
 * A highly versatile, performant card component for displaying project information.
 * 
 * Features:
 * - Multiple border, size, and animation variants
 * - Transparency and golden shadow options
 * - Hardware-accelerated animations with performance optimizations
 * - Responsive design with mobile considerations
 * - Accessibility enhancements
 * - Comprehensive theming options
 * - Custom content rendering capabilities
 * 
 * The component is designed to be highly customizable while maintaining
 * excellent performance characteristics through careful memoization and
 * optimized rendering.
 */

/**
 * =====================================================================
 * TYPE DEFINITIONS & INTERFACES
 * =====================================================================
 */

/**
 * Project data interface with comprehensive typing
 */
export interface ProjectData {
  /** Unique identifier for the project */
  id?: string | number;
  
  /** Project title (required) */
  title: string;
  
  /** Project category classification */
  category?: string;
  
  /** Short description of the project */
  description?: string;
  
  /** URL to the project's image */
  image?: string;
  
  /** Alt text for the image (for accessibility) */
  imageAlt?: string;
  
  /** Array of tags associated with the project */
  tags?: string[];
  
  /** Link to the project */
  url?: string;
  
  /** Whether this project should be highlighted as featured */
  featured?: boolean;
  
  /** Additional metadata as key-value pairs */
  metadata?: Record<string, unknown>;
}

/**
 * Border options for the ProjectCard
 */
export type BorderStyle = 'bordered' | 'borderless' | 'linedborder';

/**
 * Size variants for the ProjectCard
 */
export type SizeVariant = 'small' | 'medium' | 'large' | 'custom';

/**
 * Animation intensity options
 */
export type AnimationVariant = 'none' | 'subtle' | 'standard' | 'dramatic';

/**
 * ProjectCard Props Interface
 */
export interface ProjectCardProps {
  /** Project data to display */
  project: ProjectData;
  
  /** Optional CSS class to apply to the root element */
  className?: string;
  
  /** Click handler for the card */
  onClick?: (project: ProjectData) => void;
  
  /** Border styling option */
  border?: BorderStyle;
  
  /** Size variant */
  size?: SizeVariant;
  
  /** Animation intensity */
  animation?: AnimationVariant;
  
  /** Whether to enable transparency in the card */
  enableTransparency?: boolean;
  
  /** Whether to display the golden shadow effect */
  goldShadow?: boolean;
  
  /** Whether to reduce animations for performance */
  lowPerformanceMode?: boolean;
  
  /** Whether to show the image */
  showImage?: boolean;
  
  /** Whether to show tags */
  showTags?: boolean;
  
  /** Custom rendering for content section */
  renderContent?: (project: ProjectData) => React.ReactNode;
  
  /** Whether the card is embedded in another component */
  isEmbedded?: boolean;
  
  /** Whether to show the category */
  showCategory?: boolean;
  
  /** Custom image height (overrides size variant) */
  imageHeight?: string;
  
  /** Hover effect intensity (0-1) */
  hoverIntensity?: number;
  
  /** Custom width for the card (valid CSS value) */
  customWidth?: string;
  
  /** Custom padding for the content area */
  contentPadding?: string;
  
  /** Text color theme (defaults to gold palette) */
  textTheme?: 'gold' | 'light' | 'dark' | 'custom';
  
  /** Custom text color (only used when textTheme is 'custom') */
  customTextColor?: string;
  
  /** Border color (defaults to gold) */
  borderColor?: string;
  
  /** Internal usage flag for ElementCard integration */
  isElementCardChild?: boolean;
}

/**
 * =====================================================================
 * MAIN COMPONENT: ProjectCard
 * =====================================================================
 */
const ProjectCard = forwardRef<HTMLDivElement, ProjectCardProps>(
  (
    {
      // Core data
      project,
      
      // Styling options
      className = '',
      border = 'bordered',
      size = 'medium',
      animation = 'standard',
      enableTransparency = false,
      goldShadow = true,
      
      // Performance options
      lowPerformanceMode = false,
      
      // Display options
      showImage = true,
      showTags = true,
      showCategory = true,
      
      // Interaction handlers
      onClick,
      renderContent,
      
      // Layout and sizing
      isEmbedded = false,
      imageHeight,
      customWidth,
      contentPadding,
      
      // Effect customization
      hoverIntensity = 1,
      
      // Theme customization
      textTheme = 'gold',
      customTextColor,
      borderColor = 'rgba(191, 173, 127, 0.2)',
      
      // Integration flags
      isElementCardChild = false,
    },
    ref
  ) => {
    /**
     * =====================================================================
     * STATE DERIVATION & CALCULATIONS
     * =====================================================================
     */
    
    /**
     * Determine if animations should be reduced based on:
     * - Explicit lowPerformanceMode prop
     * - User's prefers-reduced-motion setting
     * - Device hardware capabilities
     */
    const reducedMotion = useMemo(() => {
      // Check user preferences or device capabilities
      const prefersReducedMotion = typeof window !== 'undefined' 
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
        : false;
      
      const isLowEndDevice = typeof navigator !== 'undefined'
        ? (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
        : false;
        
      return lowPerformanceMode || prefersReducedMotion || isLowEndDevice;
    }, [lowPerformanceMode]);
    
    /**
     * =====================================================================
     * EVENT HANDLERS
     * =====================================================================
     */
    
    /**
     * Click handler with proper memoization to prevent recreating
     * on each render unless dependencies change
     */
    const handleClick = useCallback(() => {
      if (onClick) onClick(project);
    }, [onClick, project]);
    
    /**
     * Keyboard event handler for accessibility
     */
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (onClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleClick();
      }
    }, [onClick, handleClick]);
    
    /**
     * =====================================================================
     * STYLE CALCULATIONS
     * =====================================================================
     */
    
    /**
     * Calculate CSS class names based on component props
     * All classes are generated once and memoized for performance
     */
    const cardClasses = useMemo(() => {
      // Base classes
      const baseClasses = [
        'relative flex flex-col overflow-hidden transition-all',
        'backface-visibility-hidden transform-gpu will-change-transform',
      ];
      
      // Background classes based on transparency
      const bgClasses = enableTransparency 
        ? 'bg-opacity-80 backdrop-blur-sm' 
        : 'bg-surface-card';
      
      // Border variants
      const borderClasses = {
        'bordered': 'border border-gold-20 rounded-large',
        'borderless': 'border-0',
        'linedborder': 'border-l border-r border-gold-20',
      };
      
      // Size variants
      const sizeClasses = {
        'small': customWidth ? '' : 'max-w-sm',
        'medium': customWidth ? '' : 'max-w-md',
        'large': customWidth ? '' : 'max-w-lg',
        'custom': '',
      };
      
      // Shadow classes based on goldShadow prop
      const shadowClasses = isEmbedded 
        ? '' 
        : goldShadow
          ? 'shadow-card hover:shadow-card-hover' 
          : 'shadow-md hover:shadow-lg';
      
      // Animation intensity - skip if reduced motion
      let animationClasses = '';
      if (!reducedMotion) {
        const animationIntensity = {
          'none': '',
          'subtle': 'hover:-translate-y-1 hover:scale-[1.01] transition-transform duration-300',
          'standard': 'hover:-translate-y-2 hover:scale-[1.02] transition-transform duration-300',
          'dramatic': 'hover:-translate-y-3 hover:scale-[1.03] transition-transform duration-300',
        };
        animationClasses = animationIntensity[animation];
      }
      
      // Embedded specific classes
      const embeddedClasses = isEmbedded || isElementCardChild
        ? 'h-full'
        : '';
      
      // Clickable state with accessibility improvements
      const clickableClasses = onClick 
        ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-30 focus-visible:ring-2' 
        : '';
      
      return [
        ...baseClasses,
        bgClasses,
        borderClasses[border],
        sizeClasses[size],
        shadowClasses,
        animationClasses,
        embeddedClasses,
        clickableClasses,
        className
      ].filter(Boolean).join(' ');
    }, [
      border, 
      size, 
      animation, 
      reducedMotion, 
      isEmbedded,
      isElementCardChild,
      onClick,
      className,
      enableTransparency,
      goldShadow,
      customWidth
    ]);
    
    /**
     * Custom CSS properties for animation and styling effects
     * These are applied as inline styles
     */
    const customProps = useMemo(() => {
      const styles: React.CSSProperties = {};
      
      // Custom width if specified
      if (customWidth) {
        styles.width = customWidth;
      }
      
      // Custom border color if specified
      if (border !== 'borderless') {
        styles.borderColor = borderColor;
      }
      
      // Animation and hover effect properties
      if (!reducedMotion) {
        const customIntensity = Math.max(0, Math.min(1, hoverIntensity));
        styles['--image-scale'] = `1.0${Math.round(customIntensity * 5)}`;
        styles['--glow-opacity'] = goldShadow ? `${customIntensity}` : '0';
        styles['--overlay-opacity'] = `0.${5 - Math.round(customIntensity * 3)}`;
      } else {
        styles['--image-scale'] = '1';
        styles['--glow-opacity'] = '0';
        styles['--overlay-opacity'] = '0.5';
      }
      
      return styles;
    }, [reducedMotion, hoverIntensity, goldShadow, customWidth, border, borderColor]);
    
    /**
     * Image container classes calculation
     */
    const imageContainerClasses = useMemo(() => {
      const heightClass = imageHeight || {
        'small': 'h-40',
        'medium': 'h-52',
        'large': 'h-64',
        'custom': 'h-48', // Default for custom size
      }[size];
      
      return `relative overflow-hidden w-full ${heightClass}`;
    }, [size, imageHeight]);
    
    /**
     * Text color theme classes calculation
     */
    const textClasses = useMemo(() => {
      const themeMap = {
        'gold': {
          title: 'text-gold lg:text-2xl',
          category: 'text-gold-70',
          description: 'text-text-70',
        },
        'light': {
          title: 'text-white lg:text-2xl',
          category: 'text-gray-300',
          description: 'text-gray-200',
        },
        'dark': {
          title: 'text-gray-900 lg:text-2xl',
          category: 'text-gray-700',
          description: 'text-gray-800',
        },
        'custom': {
          title: 'lg:text-2xl',
          category: 'opacity-70',
          description: 'opacity-90',
        },
      };
      
      return themeMap[textTheme];
    }, [textTheme]);
    
    /**
     * Custom text color style for the 'custom' theme
     */
    const customTextStyle = useMemo(() => {
      return textTheme === 'custom' && customTextColor 
        ? { color: customTextColor } 
        : {};
    }, [textTheme, customTextColor]);
    
    /**
     * Content padding class calculation
     */
    const contentPaddingClass = contentPadding 
      ? '' 
      : 'p-5 lg:p-6';
    
    /**
     * =====================================================================
     * CONTENT RENDERING
     * =====================================================================
     */
    
    /**
     * Render content - either custom content from renderContent prop
     * or default content based on project data
     */
    const content = renderContent 
      ? renderContent(project) 
      : (
        <div 
          className={`flex flex-col flex-1 ${contentPaddingClass}`}
          style={contentPadding ? { padding: contentPadding } : undefined}
        >
          {/* Title and category section */}
          <div className="mb-3">
            <h3 
              className={`m-0 text-xl font-light tracking-wider ${textClasses.title}`}
              style={customTextStyle}
            >
              {project.title}
            </h3>
            
            {showCategory && project.category && (
              <p 
                className={`mt-1 text-sm italic font-light ${textClasses.category}`}
                style={customTextStyle}
              >
                {project.category}
              </p>
            )}
          </div>
          
          {/* Description section */}
          {project.description && (
            <p 
              className={`flex-1 text-sm leading-relaxed font-body ${textClasses.description}`}
              style={customTextStyle}
            >
              {project.description}
            </p>
          )}
          
          {/* Tags section */}
          {showTags && project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gold-15">
              {project.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 text-xs rounded-medium bg-gold-10 border border-gold-20 text-gold-90"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    
    /**
     * =====================================================================
     * COMPONENT RENDER
     * =====================================================================
     */
    return (
      <div
        ref={ref}
        className={cardClasses}
        onClick={onClick ? handleClick : undefined}
        onKeyDown={onClick ? handleKeyDown : undefined}
        style={customProps}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={onClick ? `View ${project.title} project details` : undefined}
      >
        {/* Border glow effect - only rendered when goldShadow is true */}
        {goldShadow && (
          <div 
            className="absolute inset-0 pointer-events-none rounded-large opacity-0 transition-opacity duration-500 z-1 hover:opacity-100"
            style={{ 
              boxShadow: `inset 0 0 20px ${borderColor}, 0 0 30px ${borderColor.replace('0.2', '0.15')}`,
              opacity: 'var(--glow-opacity, 0)'
            }} 
            aria-hidden="true" 
          />
        )}
        
        {/* Image section - only rendered when showImage is true and project has an image */}
        {showImage && project.image && (
          <div className={imageContainerClasses}>
            {/* Image overlay gradient for better text contrast */}
            <div 
              className="absolute inset-0 bg-gradient-to-b from-[rgba(15,15,15,0.1)] to-[rgba(15,15,15,0.3)] transition-opacity duration-500 z-1"
              style={{ opacity: 'var(--overlay-opacity, 0.5)' }}
              aria-hidden="true" 
            />
            
            {/* Project image with optimized loading */}
            <Image
              src={project.image}
              alt={project.imageAlt || project.title || 'Project image'}
              className="object-cover w-full h-full transition-transform duration-700 ease-out"
              style={{ transform: `scale(var(--image-scale, 1))` }}
              fill={true}
              sizes={size === 'small' ? '384px' : size === 'medium' ? '448px' : '512px'}
              priority={false}
              loading="lazy"
            />
          </div>
        )}
        
        {/* Content section */}
        {content}
      </div>
    );
  }
);

/**
 * Set display name for React DevTools
 */
ProjectCard.displayName = 'ProjectCard';

/**
 * Export memoized component to prevent unnecessary re-renders
 */
export default memo(ProjectCard);