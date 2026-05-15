import React, { useState, useEffect } from 'react';
import { useAppStore } from './store';
import Dashboard from './sections/Dashboard';
import CompoundEngine from './sections/CompoundEngine';
import RiskLab from './sections/RiskLab';
import SessionEngine from './sections/SessionEngine';
import History from './sections/History';
import Settings from './sections/Settings';
import Navigation from './components/Navigation';

const App = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { initializeStore } = useAppStore();

  useEffect(() => {
    initializeStore();
  }, []);

  const renderSection = () => {
    const sections = {
      dashboard: <Dashboard />,
      'compound-engine': <CompoundEngine />,
      'risk-lab': <RiskLab />,
      'session-engine': <SessionEngine />,
      history: <History />,
      settings: <Settings />,
    };
    return sections[activeSection] || sections.dashboard;
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-void-black via-void-dark to-void-graphite flex flex-col overflow-hidden">
      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        <div className="w-full h-full overflow-y-auto pb-24">
          {renderSection()}
        </div>
      </div>

      {/* Premium Bottom Navigation */}
      <Navigation activeSection={activeSection} onNavigate={setActiveSection} />
    </div>
  );
};

export default App;
