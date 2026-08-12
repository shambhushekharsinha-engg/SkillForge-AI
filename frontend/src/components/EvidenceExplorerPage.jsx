import React, { useState, useEffect } from 'react';
import { Target, Search, Download, ShieldCheck, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function EvidenceExplorerPage({ onNavigate }) {
  const [experiments, setExperiments] = useState([]);
  const [selectedExp, setSelectedExp] = useState('');
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/experiments`)
      .then(res => res.json())
      .then(data => setExperiments(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedExp) {
      setEvidence([]);
      return;
    }
    setLoading(true);
    fetch(`${API_BASE_URL}/api/evidence?experiment_id=${selectedExp}`)
      .then(res => res.json())
      .then(data => {
        setEvidence(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedExp]);

  return (
    <div style={{ paddingBottom: '40px' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <Target color="var(--accent-primary)" size={28} /> Evidence Explorer
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Drill into case-level benchmark evidence to prove exactly why each skill was accepted or rejected.
      </p>
      
      <div className="glass-card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>Select Experiment:</span>
          <select 
            value={selectedExp} 
            onChange={e => setSelectedExp(e.target.value)}
            style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text-primary)', fontSize: '14px', cursor: 'pointer' }}
          >
            <option value="">-- Choose an experiment --</option>
            {experiments.map(exp => (
              <option key={exp.experiment_id} value={exp.experiment_id}>
                {exp.experiment_id} - {exp.task?.substring(0, 50)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedExp ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <Target size={48} color="var(--accent-primary)" style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <h3 style={{ marginBottom: '12px' }}>Select an Experiment to Explore Evidence</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '480px', margin: '0 auto 24px' }}>
            Choose an experiment from the dropdown above to view the exact benchmark cases and execution traces used to certify it.
          </p>
        </div>
      ) : loading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
          <Loader2 size={32} className="spin" style={{ margin: '0 auto 16px', color: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
          <div>Loading evidence records...</div>
        </div>
      ) : evidence.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          No evidence records found for this experiment.
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontSize: '14px' }}>Benchmark Cases ({evidence.length})</h3>
            <button className="btn-secondary" style={{ fontSize: '12px', padding: '4px 10px' }}><Download size={14} /> Export PDF</button>
          </div>
          <table className="data-grid">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Category</th>
                <th>Input</th>
                <th>Expected Outcome</th>
                <th>Actual Outcome</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {evidence.map((ev, i) => (
                <tr key={ev.id || i}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>CASE-{i+1}</td>
                  <td>
                    <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                      {ev.category || 'General'}
                    </span>
                  </td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.input}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.expected_outcome || 'N/A'}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: ev.score === 1.0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                    {ev.actual_outcome || 'N/A'}
                  </td>
                  <td style={{ fontWeight: 'bold', color: ev.score === 1.0 ? 'var(--accent-success)' : ev.score > 0 ? 'var(--accent-warning)' : 'var(--accent-danger)' }}>
                    {ev.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
