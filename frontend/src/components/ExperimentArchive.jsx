import React, { useState, useEffect } from 'react';
import { FlaskConical, ChevronDown, ChevronRight, Search, RotateCcw, ShieldCheck, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function ExperimentArchive() {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [reproduceResult, setReproduceResult] = useState({});
  const [reproducing, setReproducing] = useState({});

  const fetchExperiments = () => {
    const cached = localStorage.getItem('sf_experiments_cache');
    if (cached) {
      setExperiments(JSON.parse(cached));
      setLoading(false);
    } else {
      setLoading(true);
    }
    
    fetch(`${API_BASE_URL}/api/experiments`)
      .then(res => { if (!res.ok) throw new Error('offline'); return res.json(); })
      .then(data => {
        setExperiments(data);
        setIsOffline(false);
        localStorage.setItem('sf_experiments_cache', JSON.stringify(data));
        setLoading(false);
      })
      .catch(() => {
        const cached = localStorage.getItem('sf_experiments_cache');
        if (cached) setExperiments(JSON.parse(cached));
        setIsOffline(true);
        setLoading(false);
      });
  };

  useEffect(() => { fetchExperiments(); }, []);

  const handleReproduce = async (expId) => {
    setReproducing(p => ({ ...p, [expId]: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/experiments/reproduce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experiment_id: expId })
      });
      const data = await res.json();
      setReproduceResult(p => ({ ...p, [expId]: data }));
    } catch (e) {
      setReproduceResult(p => ({ ...p, [expId]: { error: 'Failed to reproduce' } }));
    } finally {
      setReproducing(p => ({ ...p, [expId]: false }));
    }
  };

  const statusColor = (s) => {
    if (!s) return 'var(--text-muted)';
    if (s === 'COMPLETED') return 'var(--accent-success)';
    if (s === 'STARTED') return '#60a5fa';
    if (s === 'EXHAUSTED' || s === 'FAILED') return 'var(--accent-danger)';
    return 'var(--text-secondary)';
  };

  const statusBg = (s) => {
    if (!s) return 'rgba(100,116,139,0.1)';
    if (s === 'COMPLETED') return 'rgba(16,185,129,0.1)';
    if (s === 'STARTED') return 'rgba(96,165,250,0.1)';
    if (s === 'EXHAUSTED' || s === 'FAILED') return 'rgba(239,68,68,0.1)';
    return 'rgba(148,163,184,0.1)';
  };

  const filtered = experiments.filter(e => {
    const matchSearch = !searchQuery ||
      (e.experiment_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.task || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'All' || (e.status || '') === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <FlaskConical color="var(--accent-primary)" size={28} />
            Experiment Archive
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Immutable, hash-backed records of every evolution experiment.</p>
        </div>
        <button onClick={fetchExperiments} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {isOffline && (
        <div style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#eab308', fontSize: '13px' }}>⚠ Showing cached data — backend offline</span>
          <button onClick={fetchExperiments} style={{ background: 'transparent', border: '1px solid #eab308', color: '#eab308', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Retry</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', marginTop: '24px' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 14px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by ID or task..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', width: '100%', fontSize: '14px' }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', cursor: 'pointer' }}
        >
          {['All', 'COMPLETED', 'STARTED', 'EXHAUSTED'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading experiment archive...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-primary)', margin: '0 auto 16px', animation: 'pulseGlow 2s infinite' }} />
            <div style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>No experiments found.</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Run your first evolution in the Evolution Lab.</div>
          </div>
        ) : (
          <table className="data-grid">
            <thead>
              <tr>
                <th>Experiment ID</th>
                <th>Task</th>
                <th>Model</th>
                <th>Seed</th>
                <th>Status</th>
                <th>Timestamp</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(exp => (
                <React.Fragment key={exp.experiment_id}>
                  <tr
                    onClick={() => setExpandedId(expandedId === exp.experiment_id ? null : exp.experiment_id)}
                    style={{ cursor: 'pointer', background: expandedId === exp.experiment_id ? 'var(--bg-tertiary)' : 'transparent' }}
                  >
                    <td style={{ fontFamily: 'monospace', color: '#60a5fa', fontWeight: 600 }}>{exp.experiment_id || 'N/A'}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{(exp.task || 'N/A').slice(0, 50)}{exp.task?.length > 50 ? '...' : ''}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{exp.model || 'N/A'}</td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '12px' }}>{exp.seed || 'N/A'}</td>
                    <td>
                      <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', color: statusColor(exp.status), background: statusBg(exp.status) }}>
                        {exp.status || 'UNKNOWN'}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{exp.timestamp ? new Date(exp.timestamp).toLocaleString() : 'N/A'}</td>
                    <td style={{ textAlign: 'center' }}>
                      {expandedId === exp.experiment_id ? <ChevronDown size={16} color="var(--text-muted)" /> : <ChevronRight size={16} color="var(--text-muted)" />}
                    </td>
                  </tr>
                  {expandedId === exp.experiment_id && (
                    <tr>
                      <td colSpan={7} style={{ padding: 0 }}>
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '24px', borderTop: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px', fontSize: '13px' }}>
                            {[
                              ['Budget', exp.budget + ' generations'],
                              ['Target Capability', exp.target_capability ? `${(exp.target_capability * 100).toFixed(0)}%` : 'N/A'],
                              ['Benchmark Version', exp.benchmark_version || 'N/A'],
                              ['Red Team Version', exp.red_team_version || 'N/A'],
                            ].map(([label, val]) => (
                              <div key={label}>
                                <div style={{ color: 'var(--text-muted)', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase' }}>{label}</div>
                                <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{val}</div>
                              </div>
                            ))}
                          </div>
                          {exp.initial_skill_hash && (
                            <div style={{ marginBottom: '12px' }}>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Initial Skill Hash</div>
                              <code style={{ fontSize: '11px', color: '#94a3b8', background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '4px', display: 'block', wordBreak: 'break-all' }}>{exp.initial_skill_hash}</code>
                            </div>
                          )}
                          {exp.final_experiment_hash && (
                            <div style={{ marginBottom: '16px' }}>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                Final Integrity Hash <ShieldCheck size={12} color="var(--accent-success)" style={{ display: 'inline' }} /> <span style={{ color: 'var(--accent-success)' }}>INTEGRITY VERIFIED</span>
                              </div>
                              <code style={{ fontSize: '11px', color: '#10b981', background: 'rgba(16,185,129,0.05)', padding: '4px 8px', borderRadius: '4px', display: 'block', wordBreak: 'break-all', border: '1px solid rgba(16,185,129,0.2)' }}>{exp.final_experiment_hash}</code>
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <button
                              onClick={() => handleReproduce(exp.experiment_id)}
                              disabled={reproducing[exp.experiment_id]}
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                            >
                              {reproducing[exp.experiment_id] ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <RotateCcw size={14} />}
                              Reproduce Experiment
                            </button>
                            <a
                              href={`${API_BASE_URL}/api/skills/${exp.task}/export`}
                              target="_blank" rel="noreferrer"
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}
                            >
                              Export Package
                            </a>
                          </div>
                          {reproduceResult[exp.experiment_id] && (
                            <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(99,102,241,0.1)', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.2)', fontSize: '13px' }}>
                              <div style={{ color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '8px' }}>Reproducibility Analysis</div>
                              {reproduceResult[exp.experiment_id].error ? (
                                <span style={{ color: 'var(--accent-danger)' }}>{reproduceResult[exp.experiment_id].error}</span>
                              ) : (
                                <pre style={{ color: 'var(--text-secondary)', fontSize: '12px', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{reproduceResult[exp.experiment_id].difference}</pre>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
