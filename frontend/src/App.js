// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components
import LandingPage from './components/sections/landing/LandingPage';
import CreatorsPage from './components/sections/codex/creators/CreatorsPage';
import EvolutionSimulatorConceptShowcase from './components/sections/codex/creators/creatorshowcase/EvolutionSimulatorConceptShowcase';
import Layout from './components/layout/Layout'; // Import the Layout component

const App = () => {
  return (
    <Router>
      {/* Wrap all routes in the Layout component to maintain persistent background */}
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/codex/creators" element={<CreatorsPage />} />
          <Route path="/codex/creators/creatorshowcase/EvolutionSimulatorConceptShowcase" element={<EvolutionSimulatorConceptShowcase />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;