"use client"; 
import React from 'react';
import ScrollingContentWithNav from '../../../../components/navbars/ScrollingContentWithNav'; // Adjust path as needed

// --- Data Definitions ---
const motivationsCardData = {
    title: "MOTIVATIONS",
    subheader: "Exploring the Driving Forces Within",
};

const motivationsItems = [
    {
      id: 'discovery',
      title: 'DISCOVERY', // Used for navigation sidebar
      sectionTitle: 'DISCOVERY', // Used for content heading
      content: [
        "Knowledge, beauty, and wonder are the only things that matter. There's no greater pleasure than searching for new thrills, knowing the valleys and mountains of the mind, or contemplating the unknowable. You will know everything."
      ]
    },
    {
      id: 'kinship',
      title: 'KINSHIP',
      sectionTitle: 'KINSHIP',
      content: [
        "All people are linked; we experience the same emotions and endure the same hardships. Nothing is more important than the bonds that bind us. For better or worse, reason takes second place to the war drums of the heart."
      ]
    },
    {
      id: 'martyrdom',
      title: 'MARTYRDOM',
      sectionTitle: 'MARTYRDOM',
      content: [
        "You're the first to enter a battle and the last to leave; you're always willing to bear the burdens of others long past your breaking point. You will protect that which you care about, and you will sacrifice everything to do it."
      ]
    },
    {
      id: 'immortality',
      title: 'IMMORTALITY',
      sectionTitle: 'IMMORTALITY',
      content: [
        "You will burn a searing mark onto the chronicle of history. Wealth dwindles, power dissolves, and grand edifices crumble; legacy is the only thing that matters. No sacrifice is too great for a chance to reach into eternity."
      ]
    },
    {
      id: 'ideology',
      title: 'IDEOLOGY',
      sectionTitle: 'IDEOLOGY',
      content: [
        "You are unshakable. The world is a simple duality. You stand on the side of righteousness, and you will see evil destroyed. You judge others but teach them to be better with wisdom, temperance, and a helping hand."
      ]
    },
    {
      id: 'domination',
      title: 'DOMINATION',
      sectionTitle: 'DOMINATION',
      content: [
        "The world is unraveling. Chaos breeds like maggots in an open wound. You long for control, not for its own sake, but to soothe the jagged disarray of existence. Structures, hierarchies, and predictability are not cages but foundations for a better world."
      ]
    },
    {
      id: 'envy',
      title: 'ENVY',
      sectionTitle: 'ENVY',
      content: [
        "Envy is born from yearning and loss. You want to recreate something from your past, long for a utopian future, or want everything in the world. So you fight, struggle, and steal to fill an endless void—yet the deeper you reach, the hollower it becomes."
      ]
    },
    {
      id: 'freedom',
      title: 'FREEDOM',
      sectionTitle: 'FREEDOM',
      content: [
        "Experience matters, not the insides of dusty tomes or immortal thrones. You balk at anything that restricts the will of others. Your heart desires absolute freedom of action, unconstrained by tyrants, dogma, or want."
      ]
    },
];


export default function MotivationsPage() {
  return (
    <div>
      {/* The component now directly uses the complete data structure */}
      <ScrollingContentWithNav
        sections={motivationsItems}
        headerTitle={motivationsCardData.title}
        navTitle={motivationsCardData.title}
      />
    </div>
  );
}