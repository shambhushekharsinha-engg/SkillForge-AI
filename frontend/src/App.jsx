import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Beaker, Library, Workflow, Loader2, Server } from 'lucide-react';
import Dashboard from './components/Dashboard';
import SkillStudio from './components/SkillStudio';
import SkillLibrary from './components/SkillLibrary';
import { API_BASE_URL } from './config';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [backendStatus, setBackendStatus] = useState('checking'); // checking, ok, waking, error

  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const checkHealth = () => {
      fetch(`${API_BASE_URL}/`)
        .then(res => {
          if (res.ok) {
            if (isMounted) setBackendStatus('ok');
          } else {
            // Render might return 502 or 503 while waking up
            if (isMounted && backendStatus !== 'waking') {
               setBackendStatus('waking');
            }
            timeoutId = setTimeout(checkHealth, 3000);
          }
        })
        .catch(err => {
          // Network error (CORS or fully offline)
          if (isMounted && backendStatus !== 'waking') {
             setBackendStatus('waking');
          }
          timeoutId = setTimeout(checkHealth, 3000);
        });
    };

    // Give it 1.5 seconds before we show the waking banner if it hasn't connected
    setTimeout(() => {
      if (isMounted && backendStatus === 'checking') {
        setBackendStatus('waking');
      }
    }, 1500);

    checkHealth();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

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
        {(backendStatus === 'waking' || backendStatus === 'checking') && (
          <div style={{ backgroundColor: '#2d3748', color: '#fff', padding: '12px 24px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <Loader2 className="spin" size={20} style={{ animation: 'spin 2s linear infinite' }} />
            <div>
              <strong style={{ display: 'block', fontSize: '14px' }}>Waking up the backend...</strong>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>The demo backend is starting from an idle state. This can take up to about a minute.</span>
            </div>
          </div>
        )}
        
        {backendStatus === 'error' && (
          <div style={{ backgroundColor: '#fed7d7', color: '#c53030', padding: '12px 24px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Server size={20} />
            <div>
              <strong style={{ display: 'block', fontSize: '14px' }}>Backend Offline</strong>
              <span style={{ fontSize: '12px' }}>Could not connect to the API. Make sure the Render backend is deployed and running.</span>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'studio' && <SkillStudio />}
        {activeTab === 'library' && <SkillLibrary />}
      </div>
    </div>
  );
}

export default App;
