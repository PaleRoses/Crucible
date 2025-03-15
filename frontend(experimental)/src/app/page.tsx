'use client'

import React from 'react';
import {
  PageLoader,
  LoadableComponent,
  ResourceLoader,
  useLoading
} from '../lib/progressiveloading';

// Component that displays loading progress information
function LoadingStats() {
  const { progress, criticalProgress, isPageLoaded } = useLoading();
  
  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg shadow-lg text-sm z-50">
      <div>Overall Progress: {progress}%</div>
      <div>Critical Progress: {criticalProgress}%</div>
      <div>Page Loaded: {isPageLoaded ? 'Yes' : 'No'}</div>
    </div>
  );
}

// Main page component
export default function Home() {
  return (
    <PageLoader>
      <main className="relative min-h-screen flex items-center justify-center z-10">
        <LoadingStats />
        
        <LoadableComponent
          id="simple-content"
          priority="critical"
        >
          <div className="relative z-10 text-white">
            <h1 className="text-6xl font-bold">Hi</h1>
          </div>
        </LoadableComponent>
        
        <ResourceLoader 
          id="page-resources"
          priority="critical"
          options={{
            trackImages: true,
            trackFonts: true,
            trackScripts: true,
            trackStyles: true
          }}
        />
      </main>
    </PageLoader>
  );
}