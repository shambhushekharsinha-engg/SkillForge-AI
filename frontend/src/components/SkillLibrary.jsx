import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

export default function SkillLibrary() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/skills')
      .then(res => res.json())
      .then(data => {
        setSkills(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: '8px' }}>Skill Library</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        A historical archive of all generated and versioned skills in memory.
      </p>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Search size={18} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Search skills by name or task ID..." 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-primary)', 
              outline: 'none',
              width: '100%',
              fontSize: '0.875rem'
            }} 
          />
        </div>

        {loading ? (
          <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>Loading memory bank...</div>
        ) : (
          <table className="data-grid">
            <thead>
              <tr>
                <th>Skill Name</th>
                <th>Task ID</th>
                <th>Version</th>
                <th>Lift</th>
                <th>Safety</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((skill, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{skill.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{skill.task_id}</td>
                  <td><span className="badge" style={{ background: 'var(--bg-tertiary)' }}>v{skill.version}</span></td>
                  <td style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>+{Number(skill.lift || 0).toFixed(2)}</td>
                  <td><span className="badge success">Passed</span></td>
                </tr>
              ))}
              {skills.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No skills found in memory.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
