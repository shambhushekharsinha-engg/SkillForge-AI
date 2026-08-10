import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import SkillLineage from './SkillLineage';

export default function SkillLibrary() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkillId, setSelectedSkillId] = useState(null);
  const [selectedSkillVersion, setSelectedSkillVersion] = useState(null);

  const fetchSkills = () => {
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
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleRollbackSuccess = (newVersion) => {
    fetchSkills();
    setSelectedSkillVersion(newVersion);
  };

  // Group latest skills for the library grid
  const latestSkills = [];
  const map = new Map();
  skills.forEach(s => {
    if (!map.has(s.skill_id) || map.get(s.skill_id).version < s.version) {
      map.set(s.skill_id, s);
    }
  });
  map.forEach(s => latestSkills.push(s));
  latestSkills.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div>
      <h1 style={{ marginBottom: '8px' }}>Skill Library</h1>
      <p style={{ color: 'var(--text-secondary)', margin: '0 0 32px 0' }}>
        A historical archive of all generated and versioned skills in memory.
      </p>

      <div style={{ display: 'flex', gap: '24px' }}>
        <div className="glass-card" style={{ flex: selectedSkillId ? 2 : 1, padding: '0', overflow: 'hidden' }}>
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
                {latestSkills.map((skill, idx) => (
                  <tr 
                    key={idx} 
                    style={{ cursor: 'pointer', background: selectedSkillId === skill.skill_id ? 'var(--bg-tertiary)' : 'transparent' }}
                    onClick={() => {
                      setSelectedSkillId(skill.skill_id);
                      setSelectedSkillVersion(skill.version);
                    }}
                  >
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{skill.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{skill.task_id}</td>
                    <td><span className="badge" style={{ background: 'var(--bg-secondary)' }}>v{skill.version}</span></td>
                    <td style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>+{Number(skill.lift || 0).toFixed(2)}</td>
                    <td><span className="badge success">Passed</span></td>
                  </tr>
                ))}
                {latestSkills.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No skills found in memory.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {selectedSkillId && (
          <div style={{ flex: 1 }}>
            <SkillLineage 
              skillId={selectedSkillId} 
              currentVersion={selectedSkillVersion} 
              onRollback={handleRollbackSuccess}
            />
          </div>
        )}
      </div>
    </div>
  );
}
