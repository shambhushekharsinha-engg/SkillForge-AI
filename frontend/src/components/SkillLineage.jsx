import React, { useEffect, useState } from 'react';
import { GitCommit, RotateCcw, AlertCircle } from 'lucide-react';

export default function SkillLineage({ skillId, currentVersion, onRollback }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rollingBack, setRollingBack] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/skills')
      .then(res => res.json())
      .then(data => {
        // Filter and sort for the selected skill
        const skillHistory = data
          .filter(s => s.skill_id === skillId)
          .sort((a, b) => a.version - b.version);
        setHistory(skillHistory);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [skillId]);

  const handleRollback = async (targetVersion) => {
    setRollingBack(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/api/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill_id: skillId, target_version: targetVersion })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Rollback failed');
      
      onRollback(data.new_version);
    } catch (err) {
      setError(err.message);
    } finally {
      setRollingBack(false);
    }
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading lineage...</div>;
  if (history.length === 0) return null;

  return (
    <div className="glass-card" style={{ marginTop: '24px' }}>
      <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <GitCommit size={18} /> Skill Evolutionary Lineage
      </h3>
      
      {error && (
        <div style={{ color: 'var(--accent-danger)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div style={{ position: 'relative', paddingLeft: '16px', borderLeft: '2px solid var(--border-color)', marginLeft: '8px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {history.map((record, index) => {
          const isCurrent = record.version === currentVersion;
          const isRolledBack = record.feedback && record.feedback.includes("Rollback");
          
          return (
            <div key={record.version} style={{ position: 'relative' }}>
              <div style={{ 
                position: 'absolute', 
                left: '-23px', 
                top: '4px', 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                background: isCurrent ? 'var(--accent-primary)' : 'var(--border-color)',
                border: '2px solid var(--bg-secondary)',
                boxShadow: isCurrent ? '0 0 10px var(--accent-primary)' : 'none'
              }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: isCurrent ? 'bold' : 'normal', color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    Version {record.version} {isCurrent && <span className="badge success" style={{ marginLeft: '8px' }}>CURRENT</span>}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Evaluation Score: {(record.lift * 100).toFixed(0)}%
                  </div>
                  {isRolledBack && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-warning)', marginTop: '4px' }}>
                      {record.feedback}
                    </div>
                  )}
                </div>
                
                {!isCurrent && (
                  <button 
                    className="btn-primary" 
                    style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                    onClick={() => handleRollback(record.version)}
                    disabled={rollingBack}
                  >
                    <RotateCcw size={12} /> Restore
                  </button>
                )}
              </div>
              
              {index < history.length - 1 && !history[index+1].feedback?.includes("Rollback") && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '16px', marginTop: '8px', marginBottom: '-8px' }}>
                  ↓ Critique & Refinement
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
