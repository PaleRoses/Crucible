import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // Add this import
import { createUseStyles } from 'react-jss';

// Styles defined within the component file
const useStyles = createUseStyles({
  projectCard: {
    backgroundColor: 'rgba(15, 15, 15, 0.6)',
    border: '0.5px solid rgba(160, 142, 97, 0.2)',
    borderRadius: '3px',
    overflow: 'hidden',
    transition: 'transform 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease',
    cursor: 'pointer', // Add cursor pointer to indicate clickability
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3), 0 0 10px rgba(160, 142, 97, 0.15)',
      borderColor: 'rgba(160, 142, 97, 0.4)'
    }
  },
  projectImage: {
    height: '180px',
    width: '100%',
    overflow: 'hidden',
    '& img': {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.6s ease'
    }
  },
  // Image zoom effect on hover
  imageZoom: {
    '$projectCard:hover &': {
      transform: 'scale(1.0)'
    }
  },
  projectDetails: {
    padding: '1.5rem'
  },
  projectTitle: {
    fontSize: '1.3rem',
    color: '#bfad7f',
    fontWeight: 300,
    marginBottom: '0.5rem',
    letterSpacing: '0.05em'
  },
  projectDescription: {
    fontSize: '0.9rem',
    color: 'rgba(224, 224, 224, 0.6)',
    lineHeight: 1.6,
    marginBottom: '1rem',
    fontFamily: '"Garamond", "Adobe Caslon Pro", serif',
    fontWeight: 300
  },
  projectTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '1rem'
  },
  projectTag: {
    fontSize: '0.75rem',
    color: 'rgba(191, 173, 127, 0.7)',
    backgroundColor: 'rgba(160, 142, 97, 0.1)',
    padding: '0.25rem 0.75rem',
    borderRadius: '2px',
    border: '0.5px solid rgba(160, 142, 97, 0.3)'
  }
});

/**
 * ProjectCard Component
 * 
 * Displays project information in an animated card.
 * Cards animate in sequence based on their index.
 * 
 * @param {Object} project - Project data object with title, description, image, and tags
 * @param {number} index - Position in the project list (used for staggered animation)
 */
const ProjectCard = ({ project, index }) => {
  const classes = useStyles();
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, threshold: 0.2 });
  const navigate = useNavigate(); // Add navigation hook
  
  // Add click handler function
  const handleCardClick = () => {
    if (project.path) {
      navigate(project.path);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className={classes.projectCard}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{
        duration: 0.8,
        ease: "easeOut",
        delay: index * 0.15
      }}
      onClick={handleCardClick} // Add the click handler here
    >
      {/* Rest of the component remains unchanged */}
      <div className={classes.projectImage}>
        <img
          src={project.image}
          alt={project.title}
          className={classes.imageZoom}
        />
      </div>
      <div className={classes.projectDetails}>
        <h3 className={classes.projectTitle}>{project.title}</h3>
        <p className={classes.projectDescription}>{project.description}</p>
        <div className={classes.projectTags}>
          {project.tags.map((tag, i) => (
            <span key={i} className={classes.projectTag}>{tag}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;