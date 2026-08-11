import React from 'react';
import { ShieldAlert, CheckCircle, AlertTriangle, Lock } from 'lucide-react';

export default function SafetyCenter() {
  return (
    <div style={{ paddingBottom: '40px' }}>
      <h1 style={{ marginBottom: '8px' }}>Safety & Ethics Center</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Monitor agent behavior, configure guardrails, and audit safety logs.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* Left Column: Guardrails */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={20} color="var(--accent-primary)" />
            Active Guardrails
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Code Execution Sandbox</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Isolate generated skills</div>
              </div>
              <div style={{ width: '36px', height: '20px', backgroundColor: 'var(--accent-success)', borderRadius: '10px', position: 'relative' }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }}></div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Toxicity Filter</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Block harmful content</div>
              </div>
              <div style={{ width: '36px', height: '20px', backgroundColor: 'var(--accent-success)', borderRadius: '10px', position: 'relative' }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }}></div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Network Access Restriction</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Prevent unauthorized APIs</div>
              </div>
              <div style={{ width: '36px', height: '20px', backgroundColor: 'var(--accent-success)', borderRadius: '10px', position: 'relative' }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Audit Log */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={20} color="#eab308" />
            Recent Security Audits
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', borderLeft: '4px solid var(--accent-success)', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <CheckCircle size={20} color="var(--accent-success)" />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Skill "web_scraper_v2" cleared</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Passed automated sandbox containment tests. (2 mins ago)</div>
              </div>
            </div>
            
            <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #eab308', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <AlertTriangle size={20} color="#eab308" />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Potential PII leak prevented</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Agent attempted to log sensitive data; action blocked by guardrail. (1 hour ago)</div>
              </div>
            </div>
            
            <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', borderLeft: '4px solid var(--accent-success)', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <CheckCircle size={20} color="var(--accent-success)" />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>System Integrity Check</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>All environment variables and secret stores verified intact. (3 hours ago)</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
