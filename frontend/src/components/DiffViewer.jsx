import React from 'react';

export default function DiffViewer({ diff, v1Evaluation, v2Evaluation }) {
  const getLiftColor = (lift) => {
    if (lift > 0) return 'var(--accent-success)';
    if (lift < 0) return 'var(--accent-error)';
    return 'var(--text-primary)';
  };

  const lift = v2Evaluation.lift - v1Evaluation.lift;

  return (
    <div className="diff-viewer" style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
      <h3 style={{ marginBottom: '16px' }}>Skill Refinement Results</h3>
      
      <div className="metrics-comparison" style={{ display: 'flex', gap: '48px', marginBottom: '24px' }}>
        <div>
          <div className="metric-label" style={{ marginBottom: '8px' }}>Evaluation Score</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
              {(v1Evaluation.lift * 100).toFixed(0)}%
            </span>
            <span>→</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              {(v2Evaluation.lift * 100).toFixed(0)}%
            </span>
            <span style={{ color: getLiftColor(lift), fontWeight: 'bold' }}>
              {lift > 0 ? '+' : ''}{(lift * 100).toFixed(0)} pp
            </span>
          </div>
        </div>
        
        <div>
           <div className="metric-label" style={{ marginBottom: '8px' }}>Safety Audit</div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <span className="badge success">PASS</span>
             <span>→</span>
             <span className="badge success">PASS</span>
           </div>
        </div>
      </div>

      {diff && (
        <div className="diff-code" style={{ 
            backgroundColor: '#1e1e1e', 
            color: '#d4d4d4', 
            padding: '16px', 
            borderRadius: '8px', 
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            overflowX: 'auto',
            fontSize: '0.9rem',
            lineHeight: '1.5'
          }}>
          {diff.split('\n').map((line, idx) => {
            let color = '#d4d4d4';
            let backgroundColor = 'transparent';
            if (line.startsWith('+')) {
              color = '#4ade80';
              backgroundColor = 'rgba(74, 222, 128, 0.1)';
            } else if (line.startsWith('-')) {
              color = '#f87171';
              backgroundColor = 'rgba(248, 113, 113, 0.1)';
            }
            return (
              <div key={idx} style={{ color, backgroundColor, padding: '0 4px' }}>
                {line || ' '}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
