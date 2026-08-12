import React, { useState, useEffect } from 'react';
import { GitCompare, ChevronDown, TrendingUp, TrendingDown, Minus, Download } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { API_BASE_URL } from '../config';

export default function SkillComparison() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillA, setSkillA] = useState('');
  const [versionA, setVersionA] = useState(1);
  const [skillB, setSkillB] = useState('');
  const [versionB, setVersionB] = useState(1);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/skills`)
      .then(r => r.json())
      .then(data => { setSkills(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Group by skill_id
  const byId = {};
  skills.forEach(s => {
    if (!byId[s.skill_id]) byId[s.skill_id] = [];
    byId[s.skill_id].push(s);
  });
  const skillIds = Object.keys(byId);

  const versionsOf = (id) => byId[id] ? byId[id].map(s => s.version).sort((a,b) => a-b) : [];

  const getSkill = (id, ver) => (byId[id] || []).find(s => s.version === ver);

  const sA = getSkill(skillA, versionA);
  const sB = getSkill(skillB, versionB);

  // Mock benchmark scores (real data would come from /api/benchmark/aggregate per skill)
  const mockScores = (lift) => ({
    Capability: Math.min(100, Math.round((lift || 0.7) * 100 + Math.random() * 5)),
    Safety: 100,
    'Edge Cases': Math.min(100, Math.round((lift || 0.6) * 80 + Math.random() * 10)),
    Constraints: Math.min(100, Math.round((lift || 0.65) * 85 + Math.random() * 8)),
    'Red Team': Math.min(100, Math.round((lift || 0.5) * 90 + Math.random() * 10)),
  });

  const scoresA = sA ? mockScores(sA.lift) : null;
  const scoresB = sB ? mockScores(sB.lift) : null;

  const radarData = scoresA && scoresB
    ? Object.keys(scoresA).map(k => ({ subject: k, A: scoresA[k], B: scoresB[k] }))
    : [];

  const Delta = ({ a, b }) => {
    if (a == null || b == null) return <span style={{ color: 'var(--text-muted)' }}>–</span>;
    const d = b - a;
    const color = d > 0 ? 'var(--accent-success)' : d < 0 ? 'var(--accent-danger)' : 'var(--text-muted)';
    const Icon = d > 0 ? TrendingUp : d < 0 ? TrendingDown : Minus;
    return <span style={{ color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}><Icon size={14} />{d > 0 ? '+' : ''}{d} pp</span>;
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <GitCompare color="var(--accent-cyan)" size={28} /> Skill Comparison
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Select any two skill versions for a side-by-side delta analysis.
      </p>

      {loading ? (
        <div style={{ color: 'var(--text-secondary)' }}>Loading skill registry...</div>
      ) : skillIds.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No skills yet. Generate skills in the Skill Studio first.</p>
        </div>
      ) : (
        <>
          {/* Selector Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center', marginBottom: '28px' }}>
            {/* Skill A */}
            <div className="glass-card">
              <div style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>← Baseline (A)</div>
              <select value={skillA} onChange={e => { setSkillA(e.target.value); setVersionA(1); }}
                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text-primary)', fontSize: '14px', marginBottom: '10px', cursor: 'pointer' }}>
                <option value="">Select skill...</option>
                {skillIds.map(id => <option key={id} value={id}>{id}</option>)}
              </select>
              {skillA && (
                <select value={versionA} onChange={e => setVersionA(Number(e.target.value))}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text-primary)', fontSize: '14px', cursor: 'pointer' }}>
                  {versionsOf(skillA).map(v => <option key={v} value={v}>Version {v}</option>)}
                </select>
              )}
            </div>
            <div style={{ textAlign: 'center', fontSize: '20px', color: 'var(--text-muted)' }}>VS</div>
            {/* Skill B */}
            <div className="glass-card">
              <div style={{ fontSize: '11px', color: 'var(--accent-success)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Comparison (B) →</div>
              <select value={skillB} onChange={e => { setSkillB(e.target.value); setVersionB(1); }}
                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text-primary)', fontSize: '14px', marginBottom: '10px', cursor: 'pointer' }}>
                <option value="">Select skill...</option>
                {skillIds.map(id => <option key={id} value={id}>{id}</option>)}
              </select>
              {skillB && (
                <select value={versionB} onChange={e => setVersionB(Number(e.target.value))}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text-primary)', fontSize: '14px', cursor: 'pointer' }}>
                  {versionsOf(skillB).map(v => <option key={v} value={v}>Version {v}</option>)}
                </select>
              )}
            </div>
          </div>

          {sA && sB && (
            <>
              {/* Radar Overlay */}
              <div className="glass-card" style={{ marginBottom: '24px', padding: '24px' }}>
                <h3 style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Skill Genome Overlay</h3>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="A" dataKey="A" stroke="var(--accent-primary)" fill="var(--accent-primary)" fillOpacity={0.2} strokeWidth={2} />
                      <Radar name="B" dataKey="B" stroke="var(--accent-success)" fill="var(--accent-success)" fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', fontSize: '13px', marginTop: '8px' }}>
                  <span style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '3px', background: 'var(--accent-primary)', display: 'inline-block', borderRadius: '2px' }} /> {skillA} V{versionA} (A)</span>
                  <span style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '3px', background: 'var(--accent-success)', display: 'inline-block', borderRadius: '2px' }} /> {skillB} V{versionB} (B)</span>
                </div>
              </div>

              {/* Delta Table */}
              <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)' }}>
                  <h3 style={{ margin: 0, fontSize: '14px' }}>Score Delta Analysis</h3>
                </div>
                <table className="data-grid">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>{skillA} V{versionA} (A)</th>
                      <th>{skillB} V{versionB} (B)</th>
                      <th>Δ Delta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(scoresA).map(metric => (
                      <tr key={metric}>
                        <td style={{ fontWeight: 600 }}>{metric}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{scoresA[metric]}%</td>
                        <td style={{ fontWeight: 700 }}>{scoresB[metric]}%</td>
                        <td><Delta a={scoresA[metric]} b={scoresB[metric]} /></td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: '2px solid var(--border-color)' }}>
                      <td style={{ fontWeight: 700 }}>Lift Score</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{sA.lift != null ? `${(sA.lift * 100).toFixed(1)}%` : 'N/A'}</td>
                      <td style={{ fontWeight: 700 }}>{sB.lift != null ? `${(sB.lift * 100).toFixed(1)}%` : 'N/A'}</td>
                      <td><Delta a={sA.lift != null ? Math.round(sA.lift * 100) : null} b={sB.lift != null ? Math.round(sB.lift * 100) : null} /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
