import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function ExplainableCritique({ critic, safety }) {
  if (!critic && !safety) return null;

  const issues = [];
  if (critic && critic.issues) {
    issues.push(...critic.issues.map(i => ({ type: 'critic', text: i })));
  }
  if (safety && !safety.safe && safety.violations) {
    issues.push(...safety.violations.map(v => ({ type: 'safety', text: v })));
  }

  const actions = [];
  if (critic && critic.improvements) {
    actions.push(...critic.improvements.map(i => ({ type: 'critic', text: i })));
  }
  if (safety && safety.required_changes) {
    actions.push(...safety.required_changes.map(r => ({ type: 'safety', text: r })));
  }

  if (issues.length === 0 && actions.length === 0) return null;

  return (
    <div className="explainable-critique" style={{ display: 'flex', gap: '24px', margin: '24px 0' }}>
      <div className="glass-card" style={{ flex: 1, borderTop: '4px solid var(--accent-warning)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--accent-warning)' }}>
          <AlertTriangle size={18} /> WHY V1 WAS WEAK
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {issues.map((issue, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-secondary)' }}>
              <span style={{ color: issue.type === 'safety' ? 'var(--accent-danger)' : 'var(--accent-warning)', marginTop: '2px' }}>
                {issue.type === 'safety' ? <ShieldAlert size={14} /> : <Info size={14} />}
              </span>
              <span>{issue.text}</span>
            </li>
          ))}
          {issues.length === 0 && <li style={{ color: 'var(--text-muted)' }}>No major weaknesses detected.</li>}
        </ul>
      </div>

      <div className="glass-card" style={{ flex: 1, borderTop: '4px solid var(--accent-success)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--accent-success)' }}>
          <CheckCircle2 size={18} /> REFINEMENT ACTIONS
        </h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {actions.map((action, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--accent-success)', marginTop: '2px' }}>
                <CheckCircle2 size={14} />
              </span>
              <span>{action.text}</span>
            </li>
          ))}
          {actions.length === 0 && <li style={{ color: 'var(--text-muted)' }}>No explicit actions taken.</li>}
        </ul>
      </div>
    </div>
  );
}
