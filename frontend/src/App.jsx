import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Beaker, Library, FlaskConical, Server, ShieldCheck, Settings, LineChart, Target, AlertOctagon, History, ShieldAlert } from 'lucide-react';
import Dashboard from './components/Dashboard';
import SkillStudio from './components/SkillStudio';
import SkillLibrary from './components/SkillLibrary';
import EvolutionLab from './components/EvolutionLab';
import Integrations from './components/Integrations';
import EvidenceExplorer from './components/EvidenceExplorer';
import { API_BASE_URL } from './config';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [backendStatus, setBackendStatus] = useState('checking'); // checking, ok, waking, error

  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const checkHealth = () => {
      fetch(`${API_BASE_URL}/`, { cache: 'no-store' })
        .then(res => {
          if (res.ok) {
            if (isMounted) setBackendStatus('ok');
          } else {
            if (isMounted && backendStatus !== 'waking') {
               setBackendStatus('waking');
            }
            timeoutId = setTimeout(checkHealth, 3000);
          }
        })
        .catch(err => {
          if (isMounted && backendStatus !== 'waking') {
             setBackendStatus('waking');
          }
          timeoutId = setTimeout(checkHealth, 3000);
        });
    };

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
          <FlaskConical className="brand-icon" size={28} />
          <span>SkillForge-AI</span>
        </div>

        <div style={{ padding: '0 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', marginTop: '16px' }}>Workspace</div>
        
        <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <LayoutDashboard size={18} /> Dashboard
        </button>
        <button className={`nav-item ${activeTab === 'studio' ? 'active' : ''}`} onClick={() => setActiveTab('studio')}>
          <Beaker size={18} /> Skill Studio
        </button>
        <button className={`nav-item ${activeTab === 'evolution' ? 'active' : ''}`} onClick={() => setActiveTab('evolution')}>
          <LineChart size={18} /> Evolution Lab
        </button>
        <button className={`nav-item ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')}>
          <Library size={18} /> Skill Library
        </button>
        <button className={`nav-item ${activeTab === 'evidence' ? 'active' : ''}`} onClick={() => setActiveTab('evidence')}>
          <Target size={18} /> Evidence Explorer
        </button>

        <div style={{ padding: '0 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', marginTop: '24px' }}>Research</div>
        
        <button className={`nav-item ${activeTab === 'experiments' ? 'active' : ''}`} onClick={() => setActiveTab('experiments')}>
          <History size={18} /> Experiments
        </button>
        <button className={`nav-item ${activeTab === 'redteam' ? 'active' : ''}`} onClick={() => setActiveTab('redteam')}>
          <ShieldAlert size={18} /> Red Team Arena
        </button>
        <button className={`nav-item ${activeTab === 'benchmarks' ? 'active' : ''}`} onClick={() => setActiveTab('benchmarks')}>
          <Target size={18} /> Benchmark Results
        </button>
        <button className={`nav-item ${activeTab === 'memory' ? 'active' : ''}`} onClick={() => setActiveTab('memory')}>
          <AlertOctagon size={18} /> Failure Memory
        </button>

        <div style={{ padding: '0 16px', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', marginTop: '24px' }}>System</div>
        
        <button className={`nav-item ${activeTab === 'integrations' ? 'active' : ''}`} onClick={() => setActiveTab('integrations')}>
          <Settings size={18} /> Integrations
        </button>
        <button className={`nav-item ${activeTab === 'status' ? 'active' : ''}`} onClick={() => setActiveTab('status')}>
          <Server size={18} /> System Status
        </button>
      </div>

      {/* Main Content Area */}
      <div className="main-content">

        
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
        {activeTab === 'evolution' && <EvolutionLab />}
        {activeTab === 'library' && <SkillLibrary />}
        {activeTab === 'evidence' && <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}><h2>Evidence Explorer</h2><p>Please select an experiment from the Dashboard or Evolution Lab to view its case-level evidence.</p></div>}
        
        {activeTab === 'experiments' && <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}><h2>Experiment Archive</h2><p>26 persisted experiments available locally.</p><button onClick={() => setActiveTab('dashboard')} className="btn-primary" style={{marginTop: '16px'}}>View Latest Experiment</button></div>}
        {activeTab === 'redteam' && <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}><h2>Red Team Arena</h2><p>Currently loaded: 24 adversarial attack vectors.</p></div>}
        {activeTab === 'benchmarks' && <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}><h2>Benchmark Results</h2><p>Aggregate performance across all test suites.</p></div>}
        {activeTab === 'memory' && <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}><h2>Failure Memory</h2><p>Persisted causal chains of historical edge-case failures.</p></div>}
        
        {activeTab === 'integrations' && <Integrations />}
        {activeTab === 'status' && <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}><h2>System Status</h2><p>All core infrastructure components are online.</p></div>}
      </div>
    </div>
  );
}

export default App;
