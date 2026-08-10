import React, { useState } from 'react';
import { LayoutDashboard, Beaker, Library, Workflow } from 'lucide-react';
import Dashboard from './components/Dashboard';
import SkillStudio from './components/SkillStudio';
import SkillLibrary from './components/SkillLibrary';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="brand">
          <Workflow className="brand-icon" size={28} />
          <span>SkillForge-AI</span>
        </div>
        
        <button 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'studio' ? 'active' : ''}`}
          onClick={() => setActiveTab('studio')}
        >
          <Beaker size={20} />
          Skill Studio
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'library' ? 'active' : ''}`}
          onClick={() => setActiveTab('library')}
        >
          <Library size={20} />
          Skill Library
        </button>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'studio' && <SkillStudio />}
        {activeTab === 'library' && <SkillLibrary />}
      </div>
    </div>
  );
}

export default App;
