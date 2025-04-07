// src/app/motivations/page.tsx (Example location for App Router)

"use client"; // Required because ScrollingContentWithNav uses client hooks

import React from 'react';
// Import the main component
import ScrollingContentWithNav, { Section } from '../../../../components/navbars/ScrollingContentWithNav'; // Adjust path as needed
// Assuming you might use PandaCSS utilities here too
import { css } from '../../../../../styled-system/css'; // Adjust path as needed


// --- Data Definitions ---
// (Keep your existing data definitions for motivationsCardData and motivationsNavItems)
const motivationsCardData = {
    title: "MOTIVATIONS",
    subheader: "Exploring the Driving Forces Within",
};

const motivationsNavItems = [
    {
      id: 'discovery',
      label: 'DISCOVERY',
      sectionTitle: 'DISCOVERY',
      content: [
        "Knowledge, beauty, and wonder are the only things that matter. There's no greater pleasure than searching for new thrills, knowing the valleys and mountains of the mind, or contemplating the unknowable. You will know everything."
      ]
    },
    {
      id: 'kinship',
      label: 'KINSHIP',
      sectionTitle: 'KINSHIP',
      content: [
        "All people are linked; we experience the same emotions and endure the same hardships. Nothing is more important than the bonds that bind us. For better or worse, reason takes second place to the war drums of the heart."
      ]
    },
    {
      id: 'martyrdom',
      label: 'MARTYRDOM',
      sectionTitle: 'MARTYRDOM',
      content: [
        "You’re the first to enter a battle and the last to leave; you’re always willing to bear the burdens of others long past your breaking point. You will protect that which you care about, and you will sacrifice everything to do it."
      ]
    },
    {
      id: 'immortality',
      label: 'IMMORTALITY',
      sectionTitle: 'IMMORTALITY',
      content: [
        "You will burn a searing mark onto the chronicle of history. Wealth dwindles, power dissolves, and grand edifices crumble; legacy is the only thing that matters. No sacrifice is too great for a chance to reach into eternity."
      ]
    },
    {
      id: 'ideology',
      label: 'IDEOLOGY',
      sectionTitle: 'IDEOLOGY',
      content: [
        "You are unshakable. The world is a simple duality. You stand on the side of righteousness, and you will see evil destroyed. You judge others but teach them to be better with wisdom, temperance, and a helping hand."
      ]
    },
    {
      id: 'domination',
      label: 'DOMINATION',
      sectionTitle: 'DOMINATION',
      content: [
        "The world is unraveling. Chaos breeds like maggots in an open wound. You long for control, not for its own sake, but to soothe the jagged disarray of existence. Structures, hierarchies, and predictability are not cages but foundations for a better world."
      ]
    },
    {
      id: 'envy',
      label: 'ENVY',
      sectionTitle: 'ENVY',
      content: [
        "Envy is born from yearning and loss. You want to recreate something from your past, long for a utopian future, or want everything in the world. So you fight, struggle, and steal to fill an endless void—yet the deeper you reach, the hollower it becomes."
      ]
    },
    {
      id: 'freedom',
      label: 'FREEDOM',
      sectionTitle: 'FREEDOM',
      content: [
        "Experience matters, not the insides of dusty tomes or immortal thrones. You balk at anything that restricts the will of others. Your heart desires absolute freedom of action, unconstrained by tyrants, dogma, or want."
      ]
    },
];


// --- The Page Component ---

export default function MotivationsPage() {
  // Prepare the 'sections' prop for the navigation component
  const navSections: Section[] = motivationsNavItems.map(item => ({
    id: item.id, // The ID the nav component will use to link and track
    title: item.label, // Use 'label' for the shorter nav text
  }));

  // Dummy handler (optional, as internal scrolling is handled by the component)
  // const handleNavClick = (id: string) => {
  //     console.log(`Navigating to: ${id}`);
  // };

  return (
    // Using a simple div wrapper. You might apply global layout styles here.
    // The ScrollingContentWithNav component manages its own height (100vh).
    <div>
      <ScrollingContentWithNav
        sections={navSections}
        // activeSection={null} // Let the component manage active state internally
        // onNavClick={handleNavClick} // Provide handler only if needed for external logic
        navTitle={motivationsCardData.title} // Title for the navigation area
        headerContent={ // Example Header Content
            <div className={css({ display: 'flex', justifyContent: 'space-between', alignItems: 'center' })}>
                <h1 className={css({ paddingLeft: "302", fontSize: 'lg', fontWeight: '200', background:'background' })}>{motivationsCardData.title}</h1>
                {/* Add other header elements like buttons or logos here */}
            </div>
        }
        // enableAutoDetection={true} // Default is true, explicitly set if needed
      >
        {/* === Render ONLY the CONTENT for each section === */}
        {/* ScrollingContentWithNav will wrap each of these divs in a <section> */}
        {motivationsNavItems.map((item) => (
          // Use a simple div or React.Fragment as the direct child
          // The key should be on this top-level element passed as a child
          <div key={item.id}>
            {/* Use PandaCSS utilities or regular CSS classes for styling */}
            <h2 className={css({ fontSize: 'xl', fontWeight: 'semibold', mb: '4' })}>
              {item.sectionTitle} {/* Use the longer title for the content heading */}
            </h2>
            {item.content.map((paragraph, index) => (
              <p key={index} className={css({ mb: '4', lineHeight: 'relaxed' })}>
                {paragraph}
              </p>
            ))}
          </div>
        ))}
      </ScrollingContentWithNav>
    </div>
  );
}
