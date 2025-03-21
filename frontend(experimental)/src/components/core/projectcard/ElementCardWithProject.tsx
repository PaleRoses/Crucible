import React, { useMemo } from 'react';
import ElementCard from '../../navbars/ElementCard';
import ProjectCard, { ProjectData, ProjectCardProps } from './ProjectCard';

/**
 * =====================================================================
 * ElementCardWithProject Component
 * =====================================================================
 * 
 * An integration component that embeds ProjectCard within ElementCard
 * for seamless presentation of project highlights within content sections.
 * 
 * This component serves as a bridge between the two component systems,
 * preserving the performance advantages of both while providing
 * a cohesive visual experience.
 */

/**
 * =====================================================================
 * TYPE DEFINITIONS & INTERFACES
 * =====================================================================
 */

/**
 * ElementCard data structure
 */
export interface ElementCardData {
  /** Main title of the ElementCard */
  title: string;
  
  /** Subtitle or description below the title */
  subheader: string;
  
  /** Optional tagline to display */
  tagline?: string;
  
  /** Array of description paragraphs */
  description?: (React.ReactNode | string)[];
  
  /** Global statistics to display */
  stats?: Array<{value: string|number, label: string}>;
}

/**
 * Props for the ElementCardWithProject component
 */
export interface ElementCardWithProjectProps {
  /** ElementCard data */
  elementData: ElementCardData;
  
  /** Project to display inside ElementCard */
  project?: ProjectData;
  
  /** Title for the project section (defaults to "Featured Project") */
  projectSectionTitle?: string;
  
  /** Custom styles for the project container */
  projectContainerClassName?: string;
  
  /** Additional padding for the project (valid CSS value) */
  projectPadding?: string;
  
  /** ProjectCard specific props */
  projectCardProps?: Omit<ProjectCardProps, 'project'>;
  
  /** ElementCard specific props */
  elementCardProps?: {
    additionalSections?: Array<{
      title: string;
      content: React.ReactNode;
    }>;
    [key: string]: unknown; // Add this if other dynamic properties are expected
  };
  
  /** Position of the project section ("top", "bottom", or specific index) */
  projectPosition?: 'top' | 'bottom' | number;
  
  /** Optional callback when project card is clicked */
  onProjectClick?: (project: ProjectData) => void;
}

/**
 * =====================================================================
 * MAIN COMPONENT: ElementCardWithProject
 * =====================================================================
 */
const ElementCardWithProject: React.FC<ElementCardWithProjectProps> = ({
  // Core data
  elementData,
  project,
  
  // Section configuration
  projectSectionTitle = 'Featured Project',
  projectPosition = 'bottom',
  
  // Styling
  projectContainerClassName = '',
  projectPadding = '1rem 0',
  
  // Component props
  projectCardProps = {},
  elementCardProps = {},
  
  // Interactions
  onProjectClick,
}) => {
  /**
   * Create project section for embedding in ElementCard
   */
  const projectSection = useMemo(() => {
    if (!project) return undefined;
    
    // Calculate container classes
    const containerClasses = `relative ${projectContainerClassName}`;
    
    // Create content with embedded ProjectCard
    return {
      title: projectSectionTitle,
      content: (
        <div 
          className={containerClasses} 
          style={{ padding: projectPadding }}
        >
          <ProjectCard
            project={project}
            onClick={onProjectClick}
            // Default props optimized for embedding
            border="bordered"
            size="medium"
            animation="subtle"
            isElementCardChild={true}
            lowPerformanceMode={true}
            hoverIntensity={0.7}
            // Override with any custom props
            {...projectCardProps}
          />
        </div>
      )
    };
  }, [
    project, 
    projectSectionTitle, 
    projectContainerClassName, 
    projectPadding, 
    projectCardProps,
    onProjectClick
  ]);
  
  /**
   * Generate the additional sections array based on project position
   */
  const additionalSections = useMemo(() => {
    if (!projectSection) return [];
    
    // Handle different position options
    if (projectPosition === 'top') {
      return [projectSection, ...(elementCardProps.additionalSections || [])];
    } else if (projectPosition === 'bottom' || !elementCardProps.additionalSections) {
      return [projectSection];
    } else if (typeof projectPosition === 'number') {
      // Insert at specific position
      const sections = [...(elementCardProps.additionalSections || [])];
      sections.splice(projectPosition, 0, projectSection);
      return sections;
    }
    
    // Default to bottom
    return [...(elementCardProps.additionalSections || []), projectSection];
  }, [projectSection, projectPosition, elementCardProps.additionalSections]);
  
  /**
   * Create final ElementCard props with additionalSections
   */
  const finalElementCardProps = {
    ...elementCardProps,
    additionalSections,
  };
  
  return (
    <ElementCard
      data={elementData}
      {...finalElementCardProps}
    />
  );
};

/**
 * Set display name for React DevTools
 */
ElementCardWithProject.displayName = 'ElementCardWithProject';

export default ElementCardWithProject;