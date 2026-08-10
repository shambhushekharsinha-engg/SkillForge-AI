import React, { useEffect, useState } from 'react';
import { Activity, ShieldCheck, Database, Target, TrendingUp, Cpu } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/stats`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading Intelligence Dashboard...</div>;
  }

  if (!stats) {
    return <div style={{ color: 'var(--accent-error)' }}>Failed to load dashboard data.</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '8px' }}>Intelligence Dashboard</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Quantitative evidence of SkillForge-AI's self-improvement pipeline.
      </p>

      {/* Top Hero Metrics Row */}
      <div className="metric-grid" style={{ marginBottom: '24px' }}>
        <div className="glass-card metric-card">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Database size={18} color="var(--text-secondary)" />
            <span className="metric-label">Skills Created</span>
          </div>
          <span className="metric-value">{stats.skills_created}</span>
        </div>

        <div className="glass-card metric-card">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Target size={18} color="var(--text-secondary)" />
            <span className="metric-label">Skills Improved</span>
          </div>
          <span className="metric-value">{stats.skills_improved}</span>
        </div>

        <div className="glass-card metric-card">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <TrendingUp size={18} color="var(--accent-primary)" />
            <span className="metric-label">Average Lift</span>
          </div>
          <span className="metric-value" style={{ color: 'var(--accent-primary)' }}>
            +{stats.average_lift}%
          </span>
        </div>
      </div>

      {/* Bottom Hero Metrics Row */}
      <div className="metric-grid" style={{ marginBottom: '48px' }}>
        <div className="glass-card metric-card">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <ShieldCheck size={18} color="var(--accent-success)" />
            <span className="metric-label">Safety Pass</span>
          </div>
          <span className="metric-value" style={{ color: 'var(--accent-success)' }}>
            {stats.safety_pass_rate.toFixed(1)}%
          </span>
        </div>

        <div className="glass-card metric-card">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Cpu size={18} color="var(--accent-success)" />
            <span className="metric-label">Sandbox Success</span>
          </div>
          <span className="metric-value" style={{ color: 'var(--accent-success)' }}>
            {stats.sandbox_success_rate.toFixed(1)}%
          </span>
        </div>

        <div className="glass-card metric-card">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Activity size={18} color="var(--text-secondary)" />
            <span className="metric-label">Avg Refinement</span>
          </div>
          <span className="metric-value">
            {stats.avg_refinement_cycles.toFixed(1)} cycles
          </span>
        </div>
      </div>

      {/* Evaluation Lift Table */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Evaluation Lift (Recent)</h3>
        {stats.lift_table && stats.lift_table.length > 0 ? (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 8px' }}>Skill</th>
                <th style={{ padding: '12px 8px' }}>V1 Score</th>
                <th style={{ padding: '12px 8px' }}>V2 Score</th>
                <th style={{ padding: '12px 8px' }}>Lift</th>
              </tr>
            </thead>
            <tbody>
              {stats.lift_table.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 8px', fontFamily: 'monospace' }}>{row.skill_id}</td>
                  <td style={{ padding: '12px 8px' }}>{(row.v1_score * 100).toFixed(0)}%</td>
                  <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{(row.v2_score * 100).toFixed(0)}%</td>
                  <td style={{ padding: '12px 8px', color: 'var(--accent-success)', fontWeight: 'bold' }}>
                    +{(row.lift * 100).toFixed(0)} pp
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ color: 'var(--text-secondary)', padding: '24px 0', textAlign: 'center' }}>
            No refined skills recorded yet. Forge a skill to see the data!
          </div>
        )}
      </div>
    </div>
  );
}
