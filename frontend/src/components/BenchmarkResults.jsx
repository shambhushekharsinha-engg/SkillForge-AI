import React from 'react';

export default function BenchmarkResults({ v1_benchmark, v2_benchmark }) {
  if (!v1_benchmark) return null;

  const categories = Object.keys(v1_benchmark);
  
  // If v2_benchmark isn't provided (e.g. no refinement), just show V1
  const showV2 = v2_benchmark != null;

  return (
    <div className="glass-card" style={{ margin: '24px 0' }}>
      <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Empirical Benchmark Suite Results</h3>
      <table className="data-grid">
        <thead>
          <tr>
            <th>Category</th>
            <th>V1 Score</th>
            {showV2 && <th>V2 Score</th>}
            {showV2 && <th>Improvement</th>}
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => {
            const v1Score = v1_benchmark[cat];
            const v2Score = showV2 ? v2_benchmark[cat] : null;
            const diff = showV2 ? v2Score - v1Score : 0;
            
            return (
              <tr key={cat}>
                <td style={{ fontWeight: 500 }}>{cat}</td>
                <td>{(v1Score * 100).toFixed(0)}%</td>
                {showV2 && <td style={{ fontWeight: 'bold' }}>{(v2Score * 100).toFixed(0)}%</td>}
                {showV2 && (
                  <td style={{ color: diff >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)', fontWeight: 'bold' }}>
                    {diff >= 0 ? '+' : ''}{(diff * 100).toFixed(0)} pp
                  </td>
                )}
              </tr>
            );
          })}
          
          {/* Overall row */}
          {(() => {
            const avgV1 = categories.reduce((acc, c) => acc + v1_benchmark[c], 0) / categories.length;
            const avgV2 = showV2 ? categories.reduce((acc, c) => acc + v2_benchmark[c], 0) / categories.length : null;
            const diffAvg = showV2 ? avgV2 - avgV1 : 0;
            return (
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                <td style={{ fontWeight: 'bold' }}>Overall</td>
                <td style={{ fontWeight: 'bold' }}>{(avgV1 * 100).toFixed(0)}%</td>
                {showV2 && <td style={{ fontWeight: 'bold' }}>{(avgV2 * 100).toFixed(0)}%</td>}
                {showV2 && (
                  <td style={{ color: diffAvg >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)', fontWeight: 'bold' }}>
                    {diffAvg >= 0 ? '+' : ''}{(diffAvg * 100).toFixed(0)} pp
                  </td>
                )}
              </tr>
            );
          })()}
        </tbody>
      </table>
    </div>
  );
}
