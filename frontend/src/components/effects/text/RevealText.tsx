import React, { useRef, useEffect, useState } from 'react';
import { useInView } from 'framer-motion';

type RevealMode = 'Default' | 'RevealWordsAsYouScroll' | 'HighlightAsYouScroll' | 'RevealLinesAsYouScroll';

interface RevealTextProps {
  children: React.ReactNode;
  threshold?: number;
  delay?: number;
  mode?: RevealMode;
  highlightColor?: string;
}

/**
 * RevealText Component
 * 
 * Creates animated text reveal effects when the component enters the viewport.
 * Offers multiple animation modes for different reveal effects.
 * 
 * @param children - Content to be revealed
 * @param threshold - Visibility threshold to trigger animation (0-1)
 * @param delay - Animation delay in milliseconds
 * @param mode - Animation style to use
 * @param highlightColor - Color for highlight effect (only used with HighlightAsYouScroll)
 */
const RevealText: React.FC<RevealTextProps> = ({
  children,
  threshold = 0.5,
  delay = 0,
  mode = 'Default',
  highlightColor = '#bfad7f'
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: threshold });
  const [content, setContent] = useState<React.ReactNode>(children);

  // Process content based on the selected mode
  useEffect(() => {
    if (typeof children !== 'string') {
      // If children is not string, use default mode
      return;
    }

    switch (mode) {
      case 'RevealWordsAsYouScroll':
        const words = children.split(' ');
        setContent(
          <span className="inline-block">
            {words.map((word, index) => (
              <span 
                key={index} 
                className={`inline-block translate-y-8 opacity-0 transition-all duration-800 ease-out`}
                style={{ 
                  transitionDelay: `${delay + index * 120}ms`,
                  transform: isInView ? 'translateY(0)' : 'translateY(30px)',
                  opacity: isInView ? 1 : 0
                }}
              >
                {word}{' '}
              </span>
            ))}
          </span>
        );
        break;

      case 'HighlightAsYouScroll':
        setContent(
          <span 
            className={`inline relative transition-all duration-800 ease-out`}
            style={{ 
              transitionDelay: `${delay}ms`,
            }}
          >
            <span 
              className="absolute bottom-0 left-0 h-[0.12em] bg-opacity-70 w-0 transition-all duration-1000 ease-out"
              style={{ 
                backgroundColor: highlightColor,
                width: isInView ? '100%' : '0%',
                transitionDelay: `${delay + 200}ms`,
              }}
            />
            {children}
          </span>
        );
        break;

      case 'RevealLinesAsYouScroll':
        const lines = children.split('\n');
        setContent(
          <div>
            {lines.map((line, index) => (
              <div 
                key={index} 
                className="overflow-hidden mb-1"
              >
                <div
                  className="translate-y-8 opacity-0 transition-all duration-800 ease-out"
                  style={{ 
                    transitionDelay: `${delay + index * 200}ms`,
                    transform: isInView ? 'translateY(0)' : 'translateY(30px)',
                    opacity: isInView ? 1 : 0
                  }}
                >
                  {line}
                </div>
              </div>
            ))}
          </div>
        );
        break;

      default:
        // Default animation for the entire text block
        setContent(children);
        break;
    }
  }, [children, delay, highlightColor, isInView, mode]);

  return (
    <div ref={ref} className="overflow-hidden mb-6">
      {mode === 'Default' ? (
        <div
          className="transition-all duration-800 ease-out"
          style={{
            transitionDelay: `${delay}ms`,
            transform: isInView ? 'translateY(0)' : 'translateY(30px)',
            opacity: isInView ? 1 : 0
          }}
        >
          {children}
        </div>
      ) : (
        content
      )}
    </div>
  );
};

export default RevealText;