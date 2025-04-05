// src/app/motivations/page.tsx (Example location for App Router)

"use client"; // Essential for hooks used in ElementCard within App Router

import React from 'react';
import ElementCard from '../../../../components/navbars/ElementCard'; // Adjust path if your components folder is elsewhere

// --- Data Definitions (Previously in motivationsData.ts) ---

// Data for the main header section of ElementCard
// No explicit type needed here; ElementCard's props will enforce it.
const motivationsCardData = {
    title: "Motivations",
    subheader: "Exploring the Driving Forces Within",
  };
  
  // UPDATED: Added sectionTitle to each item
  const motivationsNavItems = [
    {
      id: 'discovery',
      label: 'DISCOVERY',
      sectionTitle: 'DISCOVERY', // <<< ADDED: Title for the content section
      content: [
        "Knowledge, beauty, and wonder are the only things that matter. There's no greater pleasure than searching for new thrills, knowing the valleys and mountains of the mind, or contemplating the unknowable. You will know everything."
      ]
    },
    {
      id: 'kinship',
      label: 'KINSHIP',
      sectionTitle: 'KINSHIP', // <<< ADDED
      content: [
        "All people are linked; we experience the same emotions and endure the same hardships. Nothing is more important than the bonds that bind us. For better or worse, reason takes second place to the war drums of the heart."
      ]
    },
    {
      id: 'martyrdom',
      label: 'MARTYRDOM',
      sectionTitle: 'MARTYRDOM', // <<< ADDED
      content: [
        "You’re the first to enter a battle and the last to leave; you’re always willing to bear the burdens of others long past your breaking point. You will protect that which you care about, and you will sacrifice everything to do it."
      ]
    },
    {
      id: 'immortality',
      label: 'IMMORTALITY',
      sectionTitle: 'IMMORTALITY', // <<< ADDED
      content: [
        "You will burn a searing mark onto the chronicle of history. Wealth dwindles, power dissolves, and grand edifices crumble; legacy is the only thing that matters. No sacrifice is too great for a chance to reach into eternity."
      ]
    },
    {
      id: 'ideology',
      label: 'IDEOLOGY',
      sectionTitle: 'IDEOLOGY', // <<< ADDED
      content: [
        "You are unshakable. The world is a simple duality. You stand on the side of righteousness, and you will see evil destroyed. You judge others but teach them to be better with wisdom, temperance, and a helping hand."
      ]
    },
    {
      id: 'domination',
      label: 'DOMINATION',
      sectionTitle: 'DOMINATION', // <<< ADDED
      content: [
        "The world is unraveling. Chaos breeds like maggots in an open wound. You long for control, not for its own sake, but to soothe the jagged disarray of existence. Structures, hierarchies, and predictability are not cages but foundations for a better world."
      ]
    },
    {
      id: 'envy',
      label: 'ENVY',
      sectionTitle: 'ENVY', // <<< ADDED
      content: [
        "Envy is born from yearning and loss. You want to recreate something from your past, long for a utopian future, or want everything in the world. So you fight, struggle, and steal to fill an endless void—yet the deeper you reach, the hollower it becomes."
      ]
    },
    {
      id: 'freedom',
      label: 'FREEDOM',
      sectionTitle: 'FREEDOM', // <<< ADDED
      content: [
        "Experience matters, not the insides of dusty tomes or immortal thrones. You balk at anything that restricts the will of others. Your heart desires absolute freedom of action, unconstrained by tyrants, dogma, or want."
      ]
    },
  ];
  
  // --- The Page Component ---
  
  export default function MotivationsPage() {
    return (
      <div style={{ padding: '2rem 0' }}>
        <ElementCard
          data={motivationsCardData}
          navigationItems={motivationsNavItems} // Pass the UPDATED data
          showOverview={false}

        // --- Optional Customizations (same as before) ---
        contentCompression={50}
        // columnSpacing={3}
        // mobileBreakpoint={900}
        // virtualListThreshold={5}
        // animationConfig={{ threshold: 0.3, once: true, initialY: 20, duration: 0.7 }}
        // topOffset={80}
        // minLineWidth={15}
        // maxLineWidth={50}
        // etc.
      />
    </div>
  );
}