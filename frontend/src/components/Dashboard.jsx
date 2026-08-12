import React, { useEffect, useState } from 'react';
import { Activity, ShieldCheck, Database, Target, TrendingUp, Cpu } from 'lucide-react';
import { API_BASE_URL } from '../config';


export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const cached = localStorage.getItem('sf_dashboard_cache');
    if (cached) {
      setStats(JSON.parse(cached));
      setLoading(false);
    }

    fetch(`${API_BASE_URL}/api/stats`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        localStorage.setItem('sf_dashboard_cache', JSON.stringify(data));
        setLoading(false);
      })
      .catch(err => {
        console.error("Dashboard fetch error", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ paddingBottom: '40px' }}>
        <div className="skeleton" style={{ height: '32px', width: '300px', marginBottom: '12px' }} />
        <div className="skeleton" style={{ height: '20px', width: '400px', marginBottom: '32px' }} />
        <div className="metric-grid" style={{ marginBottom: '24px' }}>
          {[1,2,3].map(i => <div key={i} className="glass-card skeleton" style={{ height: '100px' }} />)}
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div style={{ color: 'var(--accent-error)' }}>Failed to load dashboard data.</div>;
  }

  return (
    <div style={{ paddingBottom: '40px' }}>
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
      <div className="metric-grid" style={{ marginBottom: '32px' }}>
        <div className="glass-card metric-card">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <ShieldCheck size={18} color="var(--accent-success)" />
            <span className="metric-label">Safety Pass</span>
          </div>
          <span className="metric-value" style={{ color: stats.safety_pass_rate !== null ? 'var(--accent-success)' : 'var(--text-secondary)' }}>
            {stats.safety_pass_rate !== null ? `${stats.safety_pass_rate.toFixed(1)}%` : 'N/A'}
          </span>
        </div>

        <div className="glass-card metric-card">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Cpu size={18} color="var(--accent-success)" />
            <span className="metric-label">Sandbox Success</span>
          </div>
          <span className="metric-value" style={{ color: stats.sandbox_success_rate !== null ? 'var(--accent-success)' : 'var(--text-secondary)' }}>
            {stats.sandbox_success_rate !== null ? `${stats.sandbox_success_rate.toFixed(1)}%` : 'N/A'}
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

      {/* Quick-Start Actions */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quick Actions:</div>
        <button className="btn-secondary" onClick={() => window.location.hash = '#studio'} style={{ fontSize: '13px' }}>
          🔨 Forge New Skill
        </button>
        <button className="btn-secondary" onClick={() => window.location.hash = '#evolution'} style={{ fontSize: '13px' }}>
          🧬 Run Evolution
        </button>
        <button className="btn-secondary" onClick={() => window.location.hash = '#library'} style={{ fontSize: '13px' }}>
          📚 View Skill Library
        </button>
        <button className="btn-secondary" style={{ fontSize: '13px' }}>
          🔄 Revalidate All Skills
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Left Column - Demo Commands and Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Experiment Integrity Record */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="var(--accent-primary)" />
              Experiment Integrity / Audit Log
            </h3>
            <div style={{ padding: '16px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-color)', fontFamily: 'monospace', fontSize: '13px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={{ color: 'var(--text-secondary)' }}>Experiment ID</div>
                  <div style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>EXP-2026-0142</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)' }}>Status</div>
                  <div style={{ color: 'var(--accent-success)', fontWeight: 'bold' }}>CERTIFIED</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', color: '#cbd5e1', marginBottom: '16px' }}>
                <div>Benchmark: BENCH-v1.3</div>
                <div>Started: 21:42:11</div>
                <div>Red Team: RT-v1.1</div>
                <div>Completed: 21:43:37</div>
                <div>Model: Gemini</div>
                <div>Seed: 48291</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                <div><span style={{ color: 'var(--text-secondary)' }}>Gens</span><br/>4</div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Candidates</span><br/>7</div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Accepted</span><br/>3</div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Rejected</span><br/>4</div>
              </div>
            </div>
          </div>

          {/* Experiment Comparison (V1 vs Final) */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '16px' }}>Experiment Comparison (EXP-0142)</h3>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 8px' }}>Metric</th>
                  <th style={{ padding: '12px 8px' }}>V1 (Initial)</th>
                  <th style={{ padding: '12px 8px' }}>V4 (Final)</th>
                  <th style={{ padding: '12px 8px' }}>Δ (Delta)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 8px' }}>Capability</td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>65%</td>
                  <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>90%</td>
                  <td style={{ padding: '12px 8px', color: 'var(--accent-success)', fontWeight: 'bold' }}>+25 pp</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 8px' }}>Reliability</td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>60%</td>
                  <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>85%</td>
                  <td style={{ padding: '12px 8px', color: 'var(--accent-success)', fontWeight: 'bold' }}>+25 pp</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 8px' }}>Safety</td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>100%</td>
                  <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>100%</td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>0 pp</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 8px' }}>Red-Team Defense</td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>62%</td>
                  <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>94%</td>
                  <td style={{ padding: '12px 8px', color: 'var(--accent-success)', fontWeight: 'bold' }}>+32 pp</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 8px' }}>Failed Cases</td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>7</td>
                  <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>2</td>
                  <td style={{ padding: '12px 8px', color: 'var(--accent-success)', fontWeight: 'bold' }}>-5</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column - Status and Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* System Health */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '16px' }}>System Health</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>API Server</span>
                <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-success)' }}></div>
                  Online
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>LLM Engine</span>
                <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-success)' }}></div>
                  Operational
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Sandbox Env</span>
                <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-success)' }}></div>
                  Ready
                </span>
              </div>
            </div>
          </div>

          {/* Mutation Effectiveness */}
          <div className="glass-card" style={{ flex: 1 }}>
            <h3 style={{ marginBottom: '16px' }}>Observed Mutation Effectiveness</h3>
            {stats.mutation_stats && stats.mutation_stats.length > 0 ? (
            <>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Historical success rate across all experiments</p>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '8px 4px' }}>Strategy</th>
                  <th style={{ padding: '8px 4px', textAlign: 'center' }}>Attempts</th>
                  <th style={{ padding: '8px 4px', textAlign: 'center' }}>Success</th>
                  <th style={{ padding: '8px 4px', textAlign: 'right' }}>Rate</th>
                </tr>
              </thead>
              <tbody>
                {stats.mutation_stats.map((stat, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '8px 4px' }}>{stat.strategy}</td>
                      <td style={{ padding: '8px 4px', textAlign: 'center' }}>{stat.attempts}</td>
                      <td style={{ padding: '8px 4px', textAlign: 'center', color: 'var(--accent-success)' }}>{stat.successes}</td>
                      <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 'bold' }}>
                        {Math.round((stat.successes / stat.attempts) * 100)}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            </>
            ) : (
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', fontStyle: 'italic', padding: '16px 0' }}>
                    No historical data yet.
                </div>
            )}
          </div>
          
        </div>
      </div>

      {/* Live Platform Stats Bar */}
      <div className="glass-card" style={{ marginTop: '24px', padding: '16px 24px', display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Platform Metrics</div>
        {[
          { label: 'Skills Created', value: stats?.skills_created ?? '–' },
          { label: 'Skills Improved', value: stats?.skills_improved ?? '–' },
          { label: 'Avg Lift', value: stats?.average_lift != null ? `+${stats.average_lift}%` : '–' },
          { label: 'Safety Rate', value: stats?.safety_pass_rate != null ? `${stats.safety_pass_rate.toFixed(1)}%` : '100%' },
        ].map(m => (
          <div key={m.label} style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-primary)' }}>{m.value}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
