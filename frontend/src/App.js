// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components
import LandingPage from './components/sections/landing/LandingPage';
import CreatorsPage from './components/sections/codex/creators/CreatorsPage';
import EvolutionSimulatorConceptShowcase from './components/sections/codex/creators/creatorshowcase/EvolutionSimulatorConceptShowcase';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/codex/creators" element={<CreatorsPage />} />
        <Route path="/codex/creators/creatorshowcase/EvolutionSimulatorConceptShowcase" element={<EvolutionSimulatorConceptShowcase />} />
      </Routes>
    </Router>
  );
};

export default App;