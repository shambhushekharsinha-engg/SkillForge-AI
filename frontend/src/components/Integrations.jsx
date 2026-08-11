import React from 'react';
import { Key, Puzzle, Zap, Server } from 'lucide-react';

export default function Integrations() {
  return (
    <div style={{ paddingBottom: '40px' }}>
      <h1 style={{ marginBottom: '8px' }}>Integrations & APIs</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Connect SkillForge-AI with external models, tools, and environments.
      </p>

      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Server size={20} color="var(--accent-primary)" />
          System Architecture Status
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
          
          <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ color: '#000', fontWeight: 'bold', fontSize: '12px' }}>GEM</span>
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Gemini LLM</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Model Provider</div>
              </div>
            </div>
            <span style={{ backgroundColor: 'rgba(163, 190, 140, 0.2)', color: 'var(--accent-success)', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>● Connected</span>
          </div>

          <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Zap size={20} color="#8b5cf6" />
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Evolution Orchestrator</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Core Engine</div>
              </div>
            </div>
            <span style={{ backgroundColor: 'rgba(163, 190, 140, 0.2)', color: 'var(--accent-success)', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>● Active</span>
          </div>

          <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Puzzle size={20} color="#3b82f6" />
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Deterministic Benchmark</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Evaluation Layer</div>
              </div>
            </div>
            <span style={{ backgroundColor: 'rgba(163, 190, 140, 0.2)', color: 'var(--accent-success)', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>● Active</span>
          </div>
          
          <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Key size={20} color="#ef4444" />
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Skill Firewall</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Security Gate</div>
              </div>
            </div>
            <span style={{ backgroundColor: 'rgba(163, 190, 140, 0.2)', color: 'var(--accent-success)', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>● Active</span>
          </div>

        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Puzzle size={20} color="var(--accent-primary)" />
          Infrastructure Components
        </h3>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px 8px' }}>Component Name</th>
              <th style={{ padding: '12px 8px' }}>Type</th>
              <th style={{ padding: '12px 8px' }}>Status</th>
              <th style={{ padding: '12px 8px' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '12px 8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><Server size={14} color="var(--text-secondary)" /> Red-Team Corpus</td>
              <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Dataset</td>
              <td style={{ padding: '12px 8px' }}><span style={{ backgroundColor: 'rgba(163, 190, 140, 0.2)', color: 'var(--accent-success)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>Loaded</span></td>
              <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>24 attacks</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '12px 8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><Server size={14} color="var(--text-secondary)" /> Failure Memory</td>
              <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Persistence</td>
              <td style={{ padding: '12px 8px' }}><span style={{ backgroundColor: 'rgba(163, 190, 140, 0.2)', color: 'var(--accent-success)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>Active</span></td>
              <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>SQLite Connected</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '12px 8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><Puzzle size={14} color="var(--text-secondary)" /> Mock Sandbox</td>
              <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Execution</td>
              <td style={{ padding: '12px 8px' }}><span style={{ backgroundColor: 'rgba(234, 179, 8, 0.2)', color: '#eab308', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>Simulation Mode</span></td>
              <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Safe Environment</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
