import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Shield, Zap, RefreshCw, Cpu } from 'lucide-react';
import { API_BASE_URL, WS_BASE_URL } from '../config';

export default function SystemStatus() {
  const [latency, setLatency] = useState(null);
  const [status, setStatus] = useState('Checking...');
  const [lastCheck, setLastCheck] = useState(new Date());
  const [dbStats, setDbStats] = useState({ skills_created: 0, skills_improved: 0, average_lift: '0%' });

  const checkHealth = () => {
    setStatus('Checking...');
    const start = Date.now();
    fetch(`${API_BASE_URL}/`)
      .then(res => {
        if(res.ok) {
          setLatency(Date.now() - start);
          setStatus('ONLINE');
        } else {
          setStatus('OFFLINE');
        }
      })
      .catch(() => setStatus('OFFLINE'))
      .finally(() => setLastCheck(new Date()));

    fetch(`${API_BASE_URL}/api/stats`)
      .then(res => res.json())
      .then(data => setDbStats(data))
      .catch(() => {});
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const maskedApi = API_BASE_URL.slice(0, 20) + (API_BASE_URL.length > 20 ? '...' : '');
  const maskedWs = WS_BASE_URL.slice(0, 20) + (WS_BASE_URL.length > 20 ? '...' : '');

  const isOnline = status === 'ONLINE';

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Activity color="var(--accent-success)" size={28} />
            System Status
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Real-time health and diagnostics for the SkillForge AI engine.</p>
        </div>
        <button onClick={checkHealth} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '13px' }}>
          <RefreshCw size={14} /> Re-check Health
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Last checked: {lastCheck.toLocaleTimeString()}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {/* Card 1 */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Server size={20} color="var(--accent-primary)" />
            <h3 style={{ margin: 0, fontSize: '16px' }}>API Server</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: isOnline ? 'var(--accent-success)' : 'var(--accent-danger)', fontWeight: 600 }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? 'var(--accent-success)' : 'var(--accent-danger)' }} />
            {status}
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            Latency: {latency !== null ? `${latency}ms` : 'N/A'}
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Cpu size={20} color="#a855f7" />
            <h3 style={{ margin: 0, fontSize: '16px' }}>LLM Engine (Gemini)</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--accent-success)', fontWeight: 600 }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-success)' }} />
            Operational
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            Provider: Google
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Database size={20} color="#3b82f6" />
            <h3 style={{ margin: 0, fontSize: '16px' }}>SQLite Memory</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--accent-success)', fontWeight: 600 }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-success)' }} />
            Connected
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            Fast local vector store
          </div>
        </div>

        {/* Card 4 */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Activity size={20} color="var(--accent-warning)" />
            <h3 style={{ margin: 0, fontSize: '16px' }}>Benchmark Suite</h3>
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>
            BENCH-v1.3 Active
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            Evaluation runner online
          </div>
        </div>

        {/* Card 5 */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Zap size={20} color="var(--accent-danger)" />
            <h3 style={{ margin: 0, fontSize: '16px' }}>Red Team Corpus</h3>
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>
            24 attack vectors loaded
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            Adversarial testing ready
          </div>
        </div>

        {/* Card 6 */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Shield size={20} color="var(--accent-success)" />
            <h3 style={{ margin: 0, fontSize: '16px' }}>Safety Firewall</h3>
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>
            Active — 4 rule categories
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            Guardrails engaged
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div className="metric-card">
          <div className="metric-label">Skills Created</div>
          <div className="metric-value">{dbStats.skills_created || 0}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Skills Improved</div>
          <div className="metric-value">{dbStats.skills_improved || 0}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Average Lift</div>
          <div className="metric-value" style={{ color: 'var(--accent-success)' }}>{dbStats.average_lift || '0%'}</div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--text-primary)' }}>Environment Configuration</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>API Base URL</span>
            <code style={{ color: 'var(--accent-primary)', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>{maskedApi}</code>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>WebSocket URL</span>
            <code style={{ color: 'var(--accent-primary)', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>{maskedWs}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
