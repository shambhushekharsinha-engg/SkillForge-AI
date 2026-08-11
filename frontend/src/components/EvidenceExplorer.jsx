import React, { useState } from 'react';
import { CheckCircle2, XCircle, ChevronRight, ChevronDown, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function EvidenceExplorer({ experimentRecord }) {
  const [expandedCase, setExpandedCase] = useState(null);

  if (!experimentRecord || !experimentRecord.benchmark_cases) {
    return <div style={{ color: 'var(--text-secondary)' }}>No detailed case evidence available for this generation.</div>;
  }

  const cases = experimentRecord.benchmark_cases;
  const passedCount = cases.filter(c => c.status === 'PASS').length;

  return (
    <div className="glass-card" style={{ marginTop: '24px' }}>
      <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Activity size={20} color="var(--accent-primary)" />
        Case-Level Evidence Explorer
      </h3>
      
      <div style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
        <strong>{passedCount} / {cases.length}</strong> benchmark cases passed in {experimentRecord.generation_label}.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {cases.map((c) => (
          <div key={c.id} style={{ border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
            <div 
              onClick={() => setExpandedCase(expandedCase === c.id ? null : c.id)}
              style={{ 
                padding: '12px 16px', 
                backgroundColor: 'rgba(0,0,0,0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {c.status === 'PASS' ? <CheckCircle2 size={18} color="var(--accent-success)" /> : <XCircle size={18} color="#ef4444" />}
                <strong style={{ fontFamily: 'monospace', width: '60px' }}>{c.id}</strong>
                <span>{c.description}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                  {c.category}
                </span>
                {expandedCase === c.id ? <ChevronDown size={16} color="var(--text-secondary)" /> : <ChevronRight size={16} color="var(--text-secondary)" />}
              </div>
            </div>

            {expandedCase === c.id && c.failure_memory && (
              <div style={{ padding: '16px', backgroundColor: 'rgba(0,0,0,0.4)', borderTop: '1px solid var(--border-color)' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Failure Memory & Causal Chain</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', marginLeft: '12px', borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: '16px' }}>
                  
                  {/* Diagnosis */}
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-22px', top: '2px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                    <strong style={{ color: '#ef4444' }}>Observed Failure ({c.failure_memory.detected_in})</strong>
                    <div style={{ marginTop: '4px', color: '#cbd5e1' }}>{c.failure_memory.diagnosis}</div>
                  </div>

                  {/* Mutation */}
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-22px', top: '2px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#8b5cf6' }}></div>
                    <strong style={{ color: '#8b5cf6' }}>Mutation Selected</strong>
                    <div style={{ marginTop: '4px', color: '#cbd5e1' }}>{c.failure_memory.mutation_strategy}</div>
                  </div>

                  {/* Result */}
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-22px', top: '2px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent-success)' }}></div>
                    <strong style={{ color: 'var(--accent-success)' }}>{c.failure_memory.fixed_in} Result</strong>
                    <div style={{ marginTop: '4px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                       {c.failure_memory.fixed ? <CheckCircle2 size={14} color="var(--accent-success)"/> : <XCircle size={14} color="#ef4444"/>}
                       {c.failure_memory.fixed ? 'PASS' : 'FAIL'}
                    </div>
                  </div>
                  
                  {/* Empirical Evidence */}
                  <div style={{ position: 'relative', marginTop: '4px', padding: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                     <strong style={{ color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase' }}>Evidence Chain</strong>
                     <div style={{ marginTop: '4px', fontFamily: 'monospace' }}>
                         {c.failure_memory.detected_in}: <span style={{ color: '#ef4444' }}>FAIL</span> → {c.failure_memory.fixed_in}: <span style={{ color: 'var(--accent-success)' }}>PASS</span>
                     </div>
                  </div>

                </div>
              </div>
            )}
            
            {expandedCase === c.id && !c.failure_memory && (
               <div style={{ padding: '16px', backgroundColor: 'rgba(0,0,0,0.4)', borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Case passed successfully on first attempt. No failure memory generated.
               </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
