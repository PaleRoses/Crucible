"use client";
import React from 'react';
import ScrollingContentWithNav from '../../../../components/navbars/scrollingcontentwithnav/ScrollingContentWithNav'; // Adjust path as needed
import ItemCard, { NavigationItem } from '@/components/core/cards/itemCard/ItemCard'; // Adjust path as needed

// Icons - Replace with your actual icon imports
import { 
  Brain, // Discovery
  Heart, // Kinship
  Shield, // Martyrdom
  Star, // Immortality
  Scale, // Ideology
  Layers, // Domination
  Worm, // Envy
  Wind // Freedom
} from 'lucide-react'; // Assuming you're using lucide icons

// --- Data Definitions ---
const motivationsCardData = {
  title: "MOTIVATIONS",
  subheader: "Exploring the Driving Forces Within",
};

// Create navigation items for each motivation
const createNavigationItem = (id: string, label: string, description: string, icon: React.ReactNode): NavigationItem => ({
  id,
  label,
  description,
  icon,
  color: 'var(--colors-primary)'
});

// Example people with each motivation
const discoveryExample = "The professor who forgoes tenure to pursue independent research in remote locations, living frugally to fund explorations that may yield no practical benefit but satisfy an insatiable curiosity.";

const kinshipExample = "The community organizer who knows every neighbor by name, hosts regular gatherings for those who might otherwise be alone, and builds connections that transcend cultural barriers.";

const martyrdomExample = "The first responder who rushes into burning buildings while others flee, works double shifts during disasters, and never hesitates to place themselves between danger and those who need protection.";

const immortalityExample = "The artist who works obsessively on a masterpiece, sacrificing relationships and comfort, driven by the vision of work that will outlive them and speak to generations yet unborn.";

const ideologyExample = "The activist who has constructed a complete moral framework and judges all actions by it, willingly facing arrest and social ostracism to advance principles they believe are objectively true.";

const dominationExample = "The city planner who sees the chaos of urban growth and implements comprehensive systems to create order, believing that properly structured environments can elevate human potential.";

const envyExample = "The social climber who meticulously studies those they wish to emulate, constantly feeling the sharp ache of not quite belonging, forever acquiring the markers of status they once coveted from afar.";

const freedomExample = "The nomad who refuses permanent housing, steady employment, or long-term commitments, prioritizing the ability to move when inspiration strikes over security or material comfort.";

// Updated sections with the ItemCard component
const motivationsItems = [
  {
    id: 'discovery',
    title: 'DISCOVERY', // Used for navigation sidebar
    sectionTitle: 'DISCOVERY', // Used for content heading
    content: [
      "Knowledge, beauty, and wonder are the only things that matter. There's no greater pleasure than searching for new thrills, knowing the valleys and mountains of the mind, or contemplating the unknowable. You will know everything."
    ],
    // Add custom component using ItemCard
    customComponent: ({ isScrolling }: { isScrolling: boolean }) => (
      <ItemCard
        item={createNavigationItem(
          'discovery',
          'DISCOVERY',
          discoveryExample,
          <Brain size={24} />
        )}
        showDescription={true}
      />
    )
  },
  {
    id: 'kinship',
    title: 'KINSHIP',
    sectionTitle: 'KINSHIP',
    content: [
      "All people are linked; we experience the same emotions and endure the same hardships. Nothing is more important than the bonds that bind us. For better or worse, reason takes second place to the   war drums of the heart."
    ],
    customComponent: ({ isScrolling }: { isScrolling: boolean }) => (
      <ItemCard
        item={createNavigationItem(
          'kinship',
          'KINSHIP',
          kinshipExample,
          <Heart size={24} />
        )}
        showDescription={false}
      />
    )
  },
  {
    id: 'martyrdom',
    title: 'MARTYRDOM',
    sectionTitle: 'MARTYRDOM',
    content: [
      "You're the first to enter a battle and the last to leave; you're always willing to bear the burdens of others long past your breaking point. You will protect that which you care about, and you will sacrifice everything to do it."
    ],
    customComponent: ({ isScrolling }: { isScrolling: boolean }) => (
      <ItemCard
        item={createNavigationItem(
          'martyrdom',
          'MARTYRDOM',
          martyrdomExample,
          <Shield size={24} />
        )}
        showDescription={true}
      />
    )
  },
  {
    id: 'immortality',
    title: 'IMMORTALITY',
    sectionTitle: 'IMMORTALITY',
    content: [
      "You will burn a searing mark onto the chronicle of history. Wealth dwindles, power dissolves, and grand edifices crumble; legacy is the only thing that matters. No sacrifice is too great for a chance to reach into eternity."
    ],
    customComponent: ({ isScrolling }: { isScrolling: boolean }) => (
      <ItemCard
        item={createNavigationItem(
          'immortality',
          'IMMORTALITY',
          immortalityExample,
          <Star size={24} />
        )}
        showDescription={true}
      />
    )
  },
  {
    id: 'ideology',
    title: 'IDEOLOGY',
    sectionTitle: 'IDEOLOGY',
    content: [
      "You are unshakable. The world is a simple duality. You stand on the side of righteousness, and you will see evil destroyed. You judge others but teach them to be better with wisdom, temperance, and a helping hand."
    ],
    customComponent: ({ isScrolling }: { isScrolling: boolean }) => (
      <ItemCard
        item={createNavigationItem(
          'ideology',
          'IDEOLOGY',
          ideologyExample,
          <Scale size={24} />
        )}
        showDescription={true}
      />
    )
  },
  {
    id: 'domination',
    title: 'DOMINATION',
    sectionTitle: 'DOMINATION',
    content: [
      "The world is unraveling. Chaos breeds like maggots in an open wound. You long for control, not for its own sake, but to soothe the jagged disarray of existence. Structures, hierarchies, and predictability are not cages but foundations for a better world."
    ],
    customComponent: ({ isScrolling }: { isScrolling: boolean }) => (
      <ItemCard
        item={createNavigationItem(
          'domination',
          'DOMINATION',
          dominationExample,
          <Layers size={24} />
        )}
        showDescription={true}
      />
    )
  },
  {
    id: 'envy',
    title: 'ENVY',
    sectionTitle: 'ENVY',
    content: [
      "Envy is born from yearning and loss. You want to recreate something from your past, long for a utopian future, or want everything in the world. So you fight, struggle, and steal to fill an endless void—yet the deeper you reach, the hollower it becomes."
    ],
    customComponent: ({ isScrolling }: { isScrolling: boolean }) => (
      <ItemCard
        item={createNavigationItem(
          'envy',
          'ENVY',
          envyExample,
          <Worm size={24} />
        )}
        showDescription={true}
      />
    )
  },
  {
    id: 'freedom',
    title: 'FREEDOM',
    sectionTitle: 'FREEDOM',
    content: [
      "Experience matters, not the insides of dusty tomes or immortal thrones. You balk at anything that restricts the will of others. Your heart desires absolute freedom of action, unconstrained by tyrants, dogma, or want."
    ],
    customComponent: ({ isScrolling }: { isScrolling: boolean }) => (
      <ItemCard
        item={createNavigationItem(
          'freedom',
          'FREEDOM',
          freedomExample,
          <Wind size={24} />
        )}
        showDescription={true}
      />
    )
  },
];

export default function MotivationsPage() {
  return (
    <div className="motivations-container">
      {/* Updated component with header description and footer */}
      <ScrollingContentWithNav
        sections={motivationsItems}
        headerTitle={motivationsCardData.title}
        navTitle={motivationsCardData.title}

        footerTitle="Understanding Motivations"
        
        autoFocusContainerOnMount={true}
      />
    </div>
  );
}