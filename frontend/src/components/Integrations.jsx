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
          <Zap size={20} color="var(--accent-primary)" />
          LLM Providers
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
          
          <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ color: '#000', fontWeight: 'bold', fontSize: '12px' }}>OAI</span>
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>OpenAI</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Connected (GPT-4o)</div>
              </div>
            </div>
            <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>Manage</button>
          </div>

          <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#eab308', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ color: '#000', fontWeight: 'bold', fontSize: '12px' }}>ANTH</span>
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Anthropic</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Connected (Claude 3.5 Sonnet)</div>
              </div>
            </div>
            <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>Manage</button>
          </div>

          <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', border: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.7 }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'transparent', border: '1px solid var(--text-secondary)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Key size={16} color="var(--text-secondary)" />
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Add Provider</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Cohere, Gemini, etc.</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Puzzle size={20} color="var(--accent-primary)" />
          Agent Tools & APIs
        </h3>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px 8px' }}>Integration Name</th>
              <th style={{ padding: '12px 8px' }}>Type</th>
              <th style={{ padding: '12px 8px' }}>Status</th>
              <th style={{ padding: '12px 8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '12px 8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><Server size={14} color="var(--text-secondary)" /> Render Backend</td>
              <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Compute</td>
              <td style={{ padding: '12px 8px' }}><span style={{ backgroundColor: 'rgba(163, 190, 140, 0.2)', color: 'var(--accent-success)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>Healthy</span></td>
              <td style={{ padding: '12px 8px' }}><button style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}>Config</button></td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '12px 8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><Puzzle size={14} color="var(--text-secondary)" /> GitHub Integration</td>
              <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>VCS</td>
              <td style={{ padding: '12px 8px' }}><span style={{ backgroundColor: 'rgba(163, 190, 140, 0.2)', color: 'var(--accent-success)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>Active</span></td>
              <td style={{ padding: '12px 8px' }}><button style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}>Config</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
