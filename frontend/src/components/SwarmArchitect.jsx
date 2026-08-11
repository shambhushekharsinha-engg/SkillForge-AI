import React from 'react';
import { Network, Plus, Settings, Users } from 'lucide-react';

export default function SwarmArchitect() {
  return (
    <div style={{ paddingBottom: '40px' }}>
      <h1 style={{ marginBottom: '8px' }}>Agent Swarm Architect</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Configure multi-agent topologies for complex, distributed skill generation.
      </p>

      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Network size={20} color="var(--accent-primary)" />
            Active Topologies
          </h3>
          <button style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: 'var(--accent-primary)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> New Swarm
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {/* Swarm Card 1 */}
          <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <strong style={{ fontSize: '16px' }}>Research & Synthesis Team</strong>
              <span style={{ fontSize: '12px', backgroundColor: 'rgba(163, 190, 140, 0.2)', color: 'var(--accent-success)', padding: '2px 8px', borderRadius: '12px' }}>Active</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              A 3-agent swarm optimized for deep information retrieval and code synthesis.
            </p>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14} /> 3 Agents</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Settings size={14} /> Auto-scale</span>
            </div>
          </div>

          {/* Swarm Card 2 */}
          <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <strong style={{ fontSize: '16px' }}>Red Team Evaluators</strong>
              <span style={{ fontSize: '12px', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '12px' }}>Idle</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Adversarial agents designed to stress-test generated skills for security flaws.
            </p>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14} /> 5 Agents</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Settings size={14} /> Strict Rules</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Swarm Metrics</h3>
        <div style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', padding: '32px 0' }}>
          Real-time visualization of inter-agent communication will appear here during active task execution.
        </div>
      </div>
    </div>
  );
}
