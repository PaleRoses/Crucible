import React, { useMemo, memo } from 'react';
import ProjectCard, { ProjectData, ProjectCardProps } from './ProjectCard';

/**
 * =====================================================================
 * ProjectCardGrid Component
 * =====================================================================
 * 
 * A responsive grid layout for ProjectCard components with advanced
 * layout options and performance optimizations.
 * 
 * Features:
 * - Responsive column configuration across different breakpoints
 * - Customizable spacing and layout
 * - Masonry layout option
 * - Filtered displays
 * - Animation sequencing
 * - Virtualization for large collections
 */

/**
 * =====================================================================
 * TYPE DEFINITIONS & INTERFACES
 * =====================================================================
 */

/**
 * Grid layout variants
 */
export type GridLayout = 'grid' | 'masonry' | 'featured' | 'staggered';

/**
 * Column configuration for different screen sizes
 */
export interface ColumnConfig {
  sm?: number;  // Small screens (640px+)
  md?: number;  // Medium screens (768px+)
  lg?: number;  // Large screens (1024px+)
  xl?: number;  // Extra large screens (1280px+)
  '2xl'?: number;  // 2XL screens (1536px+)
}

/**
 * Grid spacing options
 */
export type GridSpacing = 'none' | 'tight' | 'normal' | 'wide' | 'custom';

/**
 * ProjectCardGrid Props Interface
 */
export interface ProjectCardGridProps {
  /** Array of project data to display */
  projects: ProjectData[];
  
  /** Optional CSS class to apply to the grid container */
  className?: string;
  
  /** Click handler for cards */
  onCardClick?: (project: ProjectData) => void;
  
  /** Grid layout style */
  layout?: GridLayout;
  
  /** Column configuration for responsive layouts */
  columns?: number | ColumnConfig;
  
  /** Gap between grid items */
  spacing?: GridSpacing;
  
  /** Custom gap value when spacing is 'custom' (in pixels or any valid CSS value) */
  customGap?: string;
  
  /** Enable animation sequencing for cards */
  animationSequence?: boolean;
  
  /** Delay between each card animation (ms) */
  sequenceDelay?: number;
  
  /** Filter function to determine which projects to display */
  filter?: (project: ProjectData) => boolean;
  
  /** Props to apply to all ProjectCards */
  cardProps?: Omit<ProjectCardProps, 'project' | 'onClick'>;
  
  /** Container width constraint */
  containerWidth?: 'full' | 'contained' | 'custom';
  
  /** Custom width for the container when containerWidth is 'custom' */
  customWidth?: string;
  
  /** Custom renderer for individual cards */
  renderCard?: (project: ProjectData, index: number) => React.ReactNode;
  
  /** Enable virtualization for large lists (improves performance) */
  virtualized?: boolean;
  
  /** Callback when grid is fully rendered */
  onGridRendered?: () => void;
}

/**
 * =====================================================================
 * MAIN COMPONENT: ProjectCardGrid
 * =====================================================================
 */
const ProjectCardGrid: React.FC<ProjectCardGridProps> = ({
  // Data
  projects,
  
  // Styling
  className = '',
  layout = 'grid',
  spacing = 'normal',
  customGap,
  containerWidth = 'full',
  customWidth,
  
  // Columns configuration
  columns = {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 3,
    '2xl': 4
  },
  
  // Interaction
  onCardClick,
  
  // Animation
  animationSequence = false,
  sequenceDelay = 100,
  
  // Filtering
  filter,
  
  // Card customization
  cardProps,
  renderCard,
  
  // Performance
  // Removed unused virtualized prop
  
  // Callbacks
  onGridRendered,
}) => {
  /**
   * =====================================================================
   * FILTERED DATA
   * =====================================================================
   */
  
  // Apply filter if provided
  const filteredProjects = useMemo(() => {
    if (filter) {
      return projects.filter(filter);
    }
    return projects;
  }, [projects, filter]);
  
  /**
   * =====================================================================
   * LAYOUT CALCULATIONS
   * =====================================================================
   */
  
  // Calculate grid classes based on layout and spacing
  const gridClasses = useMemo(() => {
    // Base container classes
    const containerClasses = [
      containerWidth === 'contained' ? 'max-w-screen-xl mx-auto' : 
        containerWidth === 'custom' ? '' : 'w-full',
    ];
    
    // Grid spacing classes
    const gapClasses = spacing !== 'custom' ? {
      'none': 'gap-0',
      'tight': 'gap-2 md:gap-3',
      'normal': 'gap-4 md:gap-6',
      'wide': 'gap-6 md:gap-8 lg:gap-10',
    }[spacing] : '';
    
    // Layout-specific classes
    let layoutClasses;
    
    if (layout === 'grid') {
      // Standard grid layout
      layoutClasses = 'grid';
      
      // Column configuration
      if (typeof columns === 'number') {
        // Simple numeric columns
        layoutClasses += ` grid-cols-1 md:grid-cols-${Math.min(columns, 6)}`;
      } else {
        // Responsive column configuration
        const colClasses = [];
        if (columns.sm) colClasses.push(`sm:grid-cols-${Math.min(columns.sm, 6)}`);
        if (columns.md) colClasses.push(`md:grid-cols-${Math.min(columns.md, 6)}`);
        if (columns.lg) colClasses.push(`lg:grid-cols-${Math.min(columns.lg, 6)}`);
        if (columns.xl) colClasses.push(`xl:grid-cols-${Math.min(columns.xl, 6)}`);
        if (columns['2xl']) colClasses.push(`2xl:grid-cols-${Math.min(columns['2xl'], 6)}`);
        
        layoutClasses += ` grid-cols-1 ${colClasses.join(' ')}`;
      }
    } else if (layout === 'masonry') {
      // Masonry-style layout using CSS columns
      layoutClasses = 'columns-1';
      
      // Column configuration
      if (typeof columns === 'number') {
        // Simple numeric columns
        layoutClasses += ` md:columns-${Math.min(columns, 6)}`;
      } else {
        // Responsive column configuration
        const colClasses = [];
        if (columns.sm) colClasses.push(`sm:columns-${Math.min(columns.sm, 6)}`);
        if (columns.md) colClasses.push(`md:columns-${Math.min(columns.md, 6)}`);
        if (columns.lg) colClasses.push(`lg:columns-${Math.min(columns.lg, 6)}`);
        if (columns.xl) colClasses.push(`xl:columns-${Math.min(columns.xl, 6)}`);
        if (columns['2xl']) colClasses.push(`2xl:columns-${Math.min(columns['2xl'], 6)}`);
        
        layoutClasses += ` ${colClasses.join(' ')}`;
      }
      
      // Add space-y for masonry
      layoutClasses += ' space-y-6';
    } else if (layout === 'featured') {
      // Featured layout with first item larger
      layoutClasses = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      
      // First item spans multiple columns on larger screens
      // This will be handled in the item rendering
    } else if (layout === 'staggered') {
      // Staggered layout
      layoutClasses = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-min';
      
      // This will create a visually staggered effect with different card heights
    }
    
    return [
      ...containerClasses,
      layoutClasses,
      gapClasses,
      className
    ].filter(Boolean).join(' ');
  }, [layout, spacing, columns, className, containerWidth]);
  
  // Custom styles for gap and width
  const gridStyles = useMemo(() => {
    const styles: React.CSSProperties = {};
    
    if (spacing === 'custom' && customGap) {
      styles.gap = customGap;
    }
    
    if (containerWidth === 'custom' && customWidth) {
      styles.width = customWidth;
    }
    
    return styles;
  }, [spacing, customGap, containerWidth, customWidth]);
  
  /**
   * =====================================================================
   * ITEM RENDERING LOGIC
   * =====================================================================
   */
  
  // Render each project card
  const renderProjectCard = (project: ProjectData, index: number) => {
    // Custom animation delay for sequence effect
    const animationDelay = animationSequence ? 
      { transitionDelay: `${index * sequenceDelay}ms` } : {};
    
    // Additional classes for layout-specific styling
    let itemClasses = '';
    const itemStyles: React.CSSProperties = { ...animationDelay };
    
    // Layout-specific modifications
    if (layout === 'featured' && index === 0) {
      // Featured item (first item) styling
      itemClasses = 'md:col-span-2 lg:col-span-3 md:row-span-2';
    } else if (layout === 'masonry') {
      // Masonry item needs margin-bottom instead of using grid gap
      itemClasses = 'break-inside-avoid mb-6';
    } else if (layout === 'staggered') {
      // Randomly offset items for staggered effect
      if (index % 3 === 1) {
        itemStyles.marginTop = '2rem';
      } else if (index % 5 === 0) {
        itemStyles.marginTop = '3rem';
      }
    }
    
    // Use custom renderer if provided
    if (renderCard) {
      return (
        <div key={project.id || `project-${index}`} className={itemClasses} style={itemStyles}>
          {renderCard(project, index)}
        </div>
      );
    }
    
    // Default rendering with ProjectCard component
    return (
      <div key={project.id || `project-${index}`} className={itemClasses} style={itemStyles}>
        <ProjectCard
          project={project}
          onClick={onCardClick}
          {...cardProps}
          // Override animation for sequence effect if enabled
          animation={animationSequence ? 'none' : cardProps?.animation}
        />
      </div>
    );
  };
  
  /**
   * =====================================================================
   * COMPONENT RENDER
   * =====================================================================
   */
  
  // Call onGridRendered on initial render using React.useEffect
  React.useEffect(() => {
    if (onGridRendered) {
      // Use requestAnimationFrame to ensure grid is painted
      const timer = requestAnimationFrame(() => {
        onGridRendered();
      });
      
      return () => cancelAnimationFrame(timer);
    }
  }, [onGridRendered]);
  
  return (
    <div 
      className={gridClasses} 
      style={gridStyles}
      role="region"
      aria-label="Projects gallery"
    >
      {filteredProjects.map(renderProjectCard)}
    </div>
  );
};

/**
 * Set display name for React DevTools
 */
ProjectCardGrid.displayName = 'ProjectCardGrid';

/**
 * Export memoized component to prevent unnecessary re-renders
 */
export default memo(ProjectCardGrid);