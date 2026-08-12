import React, { useState, useEffect } from 'react';
import { AlertTriangle, Search, ChevronDown, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function FailureMemoryExplorer() {
  const [failures, setFailures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');

  const mockFailures = [
    { id: 1, skill_id: 'customer_support_triage', version: 1, category: 'Edge Cases', failure_message: 'Ambiguous input handling failed for empty string input', severity: 'HIGH', attempted_strategy: 'Edge-Case Expansion & Adversarial Hardening', resolved: 1 },
    { id: 2, skill_id: 'customer_support_triage', version: 1, category: 'Red Team', failure_message: 'Prompt injection via nested instructions exploited', severity: 'CRITICAL', attempted_strategy: 'Constraint Preservation with Safety Priority', resolved: 1 },
    { id: 3, skill_id: 'document_summarizer', version: 2, category: 'Constraints', failure_message: 'Output exceeded maximum token budget constraint', severity: 'MEDIUM', attempted_strategy: 'Constraint Tightening', resolved: 0 },
  ];

  const fetchFailures = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/failures`)
      .then(res => { if (!res.ok) throw new Error('offline'); return res.json(); })
      .then(data => {
        setFailures(data);
        setIsOffline(false);
        localStorage.setItem('sf_failures_cache', JSON.stringify(data));
        setLoading(false);
      })
      .catch(() => {
        const cached = localStorage.getItem('sf_failures_cache');
        if (cached) {
          setFailures(JSON.parse(cached));
        } else {
          setFailures(mockFailures); // fallback to mock data
        }
        setIsOffline(true);
        setLoading(false);
      });
  };

  useEffect(() => { fetchFailures(); }, []);

  const totalFailures = failures.length;
  const criticalFailures = failures.filter(f => f.severity === 'CRITICAL').length;
  const resolvedCount = failures.filter(f => f.resolved).length;
  const resolutionRate = totalFailures > 0 ? ((resolvedCount / totalFailures) * 100).toFixed(0) : 0;

  const severityColor = (s) => {
    if (s === 'CRITICAL') return 'var(--accent-danger)';
    if (s === 'HIGH') return 'var(--accent-warning)';
    if (s === 'MEDIUM') return '#facc15';
    return 'var(--text-secondary)';
  };

  const filtered = failures.filter(f => {
    const matchSearch = !searchQuery || 
      (f.skill_id || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (f.failure_message || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === 'All' || f.category === categoryFilter;
    const matchSeverity = severityFilter === 'All' || f.severity === severityFilter;
    return matchSearch && matchCategory && matchSeverity;
  });

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <AlertTriangle color="var(--accent-danger)" size={28} />
          Failure Memory
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Persistent causal chains of historical edge-case failures and their resolutions.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Failures', value: totalFailures },
          { label: 'Critical Failures', value: criticalFailures, color: 'var(--accent-danger)' },
          { label: 'Resolved', value: resolvedCount, color: 'var(--accent-success)' },
          { label: 'Resolution Rate', value: `${resolutionRate}%`, color: 'var(--accent-primary)' },
        ].map((stat, i) => (
          <div key={i} className="metric-card">
            <div className="metric-label">{stat.label}</div>
            <div className="metric-value" style={{ color: stat.color || 'var(--text-primary)' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 14px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by skill ID or message..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', width: '100%', fontSize: '14px' }}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', cursor: 'pointer' }}
        >
          {['All', 'Red Team', 'Basic', 'Edge Cases', 'Constraints', 'Safety'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select
          value={severityFilter}
          onChange={e => setSeverityFilter(e.target.value)}
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', cursor: 'pointer' }}
        >
          {['All', 'CRITICAL', 'HIGH', 'MEDIUM'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No failures recorded. The system is operating within safe parameters.
          </div>
        ) : (
          <table className="data-grid">
            <thead>
              <tr>
                <th>ID</th>
                <th>Skill ID</th>
                <th>Category</th>
                <th>Severity</th>
                <th>Failure Message</th>
                <th>Strategy</th>
                <th>Resolved</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <React.Fragment key={f.id}>
                  <tr
                    onClick={() => setExpandedId(expandedId === f.id ? null : f.id)}
                    style={{ cursor: 'pointer', background: expandedId === f.id ? 'var(--bg-tertiary)' : 'transparent' }}
                  >
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>#{f.id}</td>
                    <td style={{ color: '#60a5fa', fontWeight: 600 }}>
                      {f.skill_id} <span className="badge" style={{ marginLeft: '4px', background: 'var(--bg-tertiary)' }}>V{f.version}</span>
                    </td>
                    <td><span className="badge">{f.category}</span></td>
                    <td>
                      <span style={{ color: severityColor(f.severity), fontWeight: 600, fontSize: '12px' }}>{f.severity}</span>
                    </td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{f.failure_message}</td>
                    <td style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '12px' }}>{f.attempted_strategy || 'None'}</td>
                    <td style={{ textAlign: 'center' }}>
                      {f.resolved ? <CheckCircle2 size={16} color="var(--accent-success)" /> : <XCircle size={16} color="var(--accent-danger)" />}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {expandedId === f.id ? <ChevronDown size={16} color="var(--text-muted)" /> : <ChevronRight size={16} color="var(--text-muted)" />}
                    </td>
                  </tr>
                  {expandedId === f.id && (
                    <tr>
                      <td colSpan={8} style={{ padding: 0 }}>
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '24px', borderTop: '1px solid var(--border-color)' }}>
                          <h4 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Causal Chain Analysis</h4>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '20px' }}>
                            <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', background: 'var(--border-color)' }} />
                            
                            <div style={{ position: 'relative' }}>
                              <div style={{ position: 'absolute', left: '-20px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-danger)', border: '2px solid var(--bg-tertiary)' }} />
                              <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>FAILURE DETECTED (v{f.version})</div>
                              <div style={{ color: 'var(--text-primary)', marginTop: '4px', fontSize: '14px' }}>{f.failure_message}</div>
                            </div>

                            <div style={{ position: 'relative' }}>
                              <div style={{ position: 'absolute', left: '-20px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: '#a855f7', border: '2px solid var(--bg-tertiary)' }} />
                              <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>MUTATION APPLIED</div>
                              <div style={{ color: '#a855f7', marginTop: '4px', fontSize: '14px' }}>{f.attempted_strategy || 'Strategy not recorded'}</div>
                            </div>

                            <div style={{ position: 'relative' }}>
                              <div style={{ position: 'absolute', left: '-20px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: f.resolved ? 'var(--accent-success)' : 'var(--text-muted)', border: '2px solid var(--bg-tertiary)' }} />
                              <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>RESOLUTION</div>
                              <div style={{ color: f.resolved ? 'var(--accent-success)' : 'var(--text-primary)', marginTop: '4px', fontSize: '14px' }}>
                                {f.resolved ? 'Verified: Constraints and edge cases passing.' : 'Failed: Resolution attempt unsuccessful.'}
                              </div>
                            </div>
                          </div>
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
    </div>
  );
}
