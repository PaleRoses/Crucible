'use client'
import React from 'react';
import dynamic from 'next/dynamic';
import { NextPage } from 'next';

const Background = dynamic(
  () => import('../components/effects/3dcosmic/Background'), // Path to your component
  { ssr: false } // This is the crucial part!
);

// Removed MeteorShower import

const HomePage: NextPage = () => {
  

  return (
    // Use a main container div
    <div className="relative"> {/* Ensure parent has positioning context if needed */}

      {/* Background Effect - RENDERED FIRST */}
      {/* The Background component handles its own fixed positioning and z-index */}
      <Background />

      {/* Main Content Area */}
      {/* This div will be layered on top of the Background due to default stacking order */}
      {/* or explicit z-index if needed */}
  
        {/* Large space after the card - for demonstration */}
        <div style={{ height: '200vh' }}></div>

    </div>
  );
};

export default HomePage;
