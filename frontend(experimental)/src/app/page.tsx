'use client'
import React from 'react';
import dynamic from 'next/dynamic';
import { NextPage } from 'next';

const ElementCard = dynamic(
  () => import('../components/navbars/ElementCard'),
  { ssr: false }
);
import MeteorShower from '../components/effects/cosmic/MeteorShower';

const HomePage: NextPage = () => {
  // Define the data object for the new ElementCard component
  const data = {
    title: "Mythic Realms",
    subheader: "Fantasy Environments",
    tagline: "Explore the uncharted territories of imagination",
    description: ["Mythic Realms is a vast fantasy world comprising diverse regions, each with unique environments, creatures, and magic systems. From enchanted forests to floating isles, every corner offers new adventures and discoveries."],

  };
  
  // Navigation items with section-specific content and subsection headers
  const navigationItems = [
    { id: "overview", label: "ABOUT", content: null }, // Will use data.description
    {
      id: "regions",
      label: "REGIONS",
      sectionTitle: "Geographical Landscapes", // Added subsection header
      content: "There are six main regions in Mythic Realms: The Enchanted Forest, The Mystic Mountains, The Shadowed Vale, The Crystal Caves, The Eternal Desert, and The Floating Isles.",
      stats: [
        { label: "Area", value: "1.2M sq km" },
        { label: "Kingdoms", value: "24" }
      ]
    },
    {
      id: "creatures",
      label: "CREATURES",
      sectionTitle: "Mythical Inhabitants", // Added subsection header
      content: "Over a thousand creatures inhabit Mythic Realms, ranging from benevolent fairies to fearsome dragons, each adapted to their specific environments."
    },
    {
      id: "magic",
      label: "MAGIC",
      sectionTitle: "Arcane Systems", // Added subsection header
      content: "Twelve distinct magic systems govern the use of mystical energies in Mythic Realms, including elemental magic, necromancy, and rune crafting.",
      stats: [
        { label: "Elements", value: "8" },
        { label: "Schools", value: "12" }
      ]
    }
  ];
  
  return (
    <div className="relative">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <ElementCard
          data={data}
          navigationItems={navigationItems}
          statsPosition="bottom"
          topOffset={0}
        />
      </div>
      
      {/* Large space after the card */}
      <div style={{ height: '100vh' }}></div>
      
      {/* Background Effect */}
      <MeteorShower
        height="400vh"
        zIndex={-1}
        trailColor="rgba(191, 173, 127, 0.8)"
        glowColor="rgba(207, 185, 130, 0.6)"
        coreColor="rgba(255, 248, 220, 1)"
        meteorDensity={8}
        meteorMinSize={0.8}
        meteorMaxSize={2.0}
        meteorSpeed={0.04}
        trailLength={400}
        trailSegments={200}
        enableParallax={true}
        parallaxIntensity={0.10}
        mode="linear"
        direction="top"
        baseAngle={30}
        angleVariation={15}
        burstParticleSize={2}
        burstParticleCount={8}
        burstProbability={0.55}
      />
    </div>
  );
};

export default HomePage;