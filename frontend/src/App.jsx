import React, { useState, useEffect, Suspense } from 'react';
import {
  LayoutDashboard, Beaker, Library, FlaskConical, Server, ShieldCheck,
  LineChart, Target, AlertOctagon, History, ShieldAlert, Activity,
  BarChart2, GitCompare, Store, ListChecks
} from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import Dashboard from './components/Dashboard';
import SkillStudio from './components/SkillStudio';
import SkillLibrary from './components/SkillLibrary';
import EvolutionLab from './components/EvolutionLab';
import Integrations from './components/Integrations';
import SafetyCenter from './components/SafetyCenter';
import ExperimentArchive from './components/ExperimentArchive';
import EvidenceExplorerPage from './components/EvidenceExplorerPage';
import FailureMemoryExplorer from './components/FailureMemoryExplorer';
import BenchmarkDashboard from './components/BenchmarkDashboard';
import SystemStatus from './components/SystemStatus';
import RedTeamArena from './components/RedTeamArena';
import SkillComparison from './components/SkillComparison';
import SkillMarketplace from './components/SkillMarketplace';
import BatchRunner from './components/BatchRunner';
import { API_BASE_URL } from './config';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    let isMounted = true;
    let timeoutId;
    let attempts = 0;

    const checkHealth = () => {
      fetch(`${API_BASE_URL}/`, { cache: 'no-store' })
        .then(res => {
          if (res.ok) { if (isMounted) setBackendStatus('ok'); }
          else {
            if (isMounted) setBackendStatus('waking');
            attempts++;
            timeoutId = setTimeout(checkHealth, Math.min(3000 * attempts, 15000));
          }
        })
        .catch(() => {
          if (isMounted) setBackendStatus(attempts > 5 ? 'error' : 'waking');
          attempts++;
          timeoutId = setTimeout(checkHealth, Math.min(3000 * attempts, 15000));
        });
    };

    setTimeout(() => { if (isMounted && backendStatus === 'checking') setBackendStatus('waking'); }, 1500);
    checkHealth();
    return () => { isMounted = false; clearTimeout(timeoutId); };
  }, []);

  const NavItem = ({ tab, icon, label }) => (
    <button
      className={`nav-item ${activeTab === tab ? 'active' : ''}`}
      onClick={() => setActiveTab(tab)}
      title={label}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const NavSection = ({ label }) => (
    <div style={{ padding: '0 8px', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '2px', marginTop: '16px', fontWeight: 700 }}>{label}</div>
  );

  const statusConfig = {
    ok:       { color: 'var(--accent-success)', label: 'API Online',    pulse: false },
    waking:   { color: '#f59e0b',               label: 'Waking up…',   pulse: true  },
    checking: { color: '#60a5fa',               label: 'Connecting…',  pulse: true  },
    error:    { color: 'var(--accent-danger)',   label: 'API Offline',  pulse: false },
  }[backendStatus];

  return (
    <ToastProvider>
      <div className="app-container">
        {/* ── Sidebar ── */}
        <nav className="sidebar">
          <div className="brand">
            <FlaskConical size={22} color="var(--accent-primary)" />
            <span>SkillForge<span style={{ color: 'var(--accent-primary)' }}>-AI</span></span>
          </div>

          {/* Status Pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '7px 10px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-color)',
            marginBottom: '8px', fontSize: '11.5px',
            color: statusConfig.color
          }}>
            <div style={{
              width: '7px', height: '7px', borderRadius: '50%',
              backgroundColor: statusConfig.color, flexShrink: 0,
              animation: statusConfig.pulse ? 'pulseGlow 1.5s infinite' : 'none'
            }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{statusConfig.label}</span>
          </div>

          <NavSection label="Workspace" />
          <NavItem tab="dashboard"    icon={<LayoutDashboard size={16} />} label="Dashboard" />
          <NavItem tab="studio"       icon={<Beaker size={16} />}          label="Skill Studio" />
          <NavItem tab="evolution"    icon={<LineChart size={16} />}       label="Evolution Lab" />
          <NavItem tab="library"      icon={<Library size={16} />}         label="Skill Library" />
          <NavItem tab="compare"      icon={<GitCompare size={16} />}      label="Comparison" />
          <NavItem tab="marketplace"  icon={<Store size={16} />}           label="Marketplace" />

          <NavSection label="Research" />
          <NavItem tab="experiments"  icon={<History size={16} />}         label="Experiments" />
          <NavItem tab="evidence"     icon={<Target size={16} />}          label="Evidence" />
          <NavItem tab="redteam"      icon={<ShieldAlert size={16} />}     label="Red Team" />
          <NavItem tab="benchmarks"   icon={<BarChart2 size={16} />}       label="Benchmarks" />
          <NavItem tab="memory"       icon={<AlertOctagon size={16} />}    label="Failure Memory" />
          <NavItem tab="batch"        icon={<ListChecks size={16} />}      label="Batch Runner" />

          <NavSection label="System" />
          <NavItem tab="safety"       icon={<ShieldCheck size={16} />}     label="Safety Center" />
          <NavItem tab="integrations" icon={<Activity size={16} />}        label="Integrations" />
          <NavItem tab="status"       icon={<Server size={16} />}          label="System Status" />

          {/* Footer */}
          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-muted)' }} className="sidebar-footer">
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '2px' }}>SkillForge-AI v1.0</div>
            <a href="https://github.com/shambhushekharsinha-engg/SkillForge-AI" target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontSize: '11px' }}>GitHub ↗</a>
          </div>
        </nav>

        {/* ── Main ── */}
        <main className="main-content">

          <div className="page-enter">
            <ErrorBoundary key={activeTab}>
              {activeTab === 'dashboard'    && <Dashboard />}
              {activeTab === 'studio'       && <SkillStudio />}
              {activeTab === 'evolution'    && <EvolutionLab />}
              {activeTab === 'library'      && <SkillLibrary />}
              {activeTab === 'compare'      && <SkillComparison />}
              {activeTab === 'marketplace'  && <SkillMarketplace onNavigate={setActiveTab} />}
              {activeTab === 'experiments'  && <ExperimentArchive />}
              {activeTab === 'evidence'     && <EvidenceExplorerPage onNavigate={setActiveTab} />}
              {activeTab === 'redteam'      && <RedTeamArena />}
              {activeTab === 'benchmarks'   && <BenchmarkDashboard onNavigate={setActiveTab} />}
              {activeTab === 'memory'       && <FailureMemoryExplorer />}
              {activeTab === 'batch'        && <BatchRunner onNavigate={setActiveTab} />}
              {activeTab === 'safety'       && <SafetyCenter />}
              {activeTab === 'integrations' && <Integrations />}
              {activeTab === 'status'       && <SystemStatus />}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}

export default App;
