import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function QualityRadar({ evaluation }) {
  if (!evaluation) return null;

  // We map the evaluation metrics (which are 0 to 1) to 0 to 100 for the radar
  const data = [
    { subject: 'Safety', A: (evaluation.safety_score || 0.95) * 100 },
    { subject: 'Reliability', A: (evaluation.reliability_score || 0.85) * 100 },
    { subject: 'Capability', A: (evaluation.capability_score || 0.90) * 100 },
    { subject: 'Generalization', A: (evaluation.generalization_score || 0.80) * 100 }
  ];

  return (
    <div className="glass-card" style={{ width: '100%', height: 300, margin: '24px 0' }}>
      <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>Skill Quality Radar</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="var(--border-color)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-muted)' }} />
          <Radar name="Skill V2" dataKey="A" stroke="var(--accent-primary)" fill="var(--accent-primary)" fillOpacity={0.4} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
