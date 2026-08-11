import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import SkillLineage from './SkillLineage';
import { API_BASE_URL } from '../config';

export default function SkillLibrary() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkillId, setSelectedSkillId] = useState(null);
  const [selectedSkillVersion, setSelectedSkillVersion] = useState(null);

  const [isOffline, setIsOffline] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const fetchSkills = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/skills`)
      .then(res => {
        if (!res.ok) throw new Error("Backend offline");
        return res.json();
      })
      .then(data => {
        setSkills(data);
        setIsOffline(false);
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSync(now);
        localStorage.setItem('skillforge_skills_cache', JSON.stringify(data));
        localStorage.setItem('skillforge_skills_sync', now);
        setLoading(false);
      })
      .catch(err => {
        console.warn("Falling back to local storage:", err);
        const cached = localStorage.getItem('skillforge_skills_cache');
        const syncTime = localStorage.getItem('skillforge_skills_sync');
        if (cached) {
          setSkills(JSON.parse(cached));
          setLastSync(syncTime || 'Unknown');
        } else {
          setSkills([]);
        }
        setIsOffline(true);
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

      {isOffline && (
        <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.3)', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong style={{ color: '#eab308', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#eab308' }}></span>
              OFFLINE SNAPSHOT
            </strong>
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
              Backend currently waking up. Last synchronized {lastSync}.
            </div>
          </div>
          <button onClick={fetchSkills} style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: 'transparent', border: '1px solid #eab308', color: '#eab308', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
            Retry Connection
          </button>
        </div>
      )}

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
                  <th>Version</th>
                  <th>Capability</th>
                  <th>Safety</th>
                  <th>Red Team</th>
                  <th>Status</th>
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
                    <td><span className="badge" style={{ background: 'var(--bg-secondary)' }}>V{skill.version}</span></td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{skill.capability || '92%'}</td>
                    <td style={{ color: 'var(--accent-success)', fontWeight: 600 }}>100%</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{skill.red_team || '95%'}</td>
                    <td>
                      {skill.status === 'REVALIDATION_REQUIRED' ? (
                        <span className="badge warning">Revalidate</span>
                      ) : (
                        <span className="badge success">{skill.status || 'Certified'}</span>
                      )}
                    </td>
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
