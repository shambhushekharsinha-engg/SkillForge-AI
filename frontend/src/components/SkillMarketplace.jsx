import React, { useState } from 'react';
import { Store, Star, Download, Search, Shield, Zap, Filter } from 'lucide-react';

const MARKETPLACE_SKILLS = [
  { id: 'mk-001', name: 'Safe YAML Config Reader', category: 'DevOps', author: 'SkillForge Labs', capability: 94, safety: 100, redTeam: 97, stars: 142, downloads: 891, description: 'Safely reads YAML configuration files with directory traversal prevention and schema validation.', tags: ['yaml', 'config', 'safe-io'], version: 'v3.1', certified: true },
  { id: 'mk-002', name: 'API Fetcher with Retry Logic', category: 'Networking', author: 'SkillForge Labs', capability: 91, safety: 100, redTeam: 93, stars: 98, downloads: 634, description: 'Handles rate limiting, 5xx errors, exponential backoff, and malformed JSON responses gracefully.', tags: ['http', 'retry', 'resilient'], version: 'v2.4', certified: true },
  { id: 'mk-003', name: 'Customer Support Triage Agent', category: 'Support', author: 'SkillForge Labs', capability: 92, safety: 100, redTeam: 96, stars: 203, downloads: 1241, description: 'Categorizes incoming support tickets, extracts account IDs, and routes to appropriate teams securely.', tags: ['nlp', 'triage', 'classification'], version: 'v4.0', certified: true },
  { id: 'mk-004', name: 'Secure Markdown Parser', category: 'Security', author: 'Community', capability: 89, safety: 100, redTeam: 98, stars: 76, downloads: 445, description: 'Parses Markdown with full HTML sanitization and XSS prevention. Handles embedded script tags.', tags: ['markdown', 'xss', 'sanitize'], version: 'v1.8', certified: true },
  { id: 'mk-005', name: 'Technical Document Summarizer', category: 'Research', author: 'SkillForge Labs', capability: 88, safety: 100, redTeam: 91, stars: 119, downloads: 723, description: 'Summarizes lengthy technical documents with structured output, preserving key findings and citations.', tags: ['nlp', 'summarization', 'research'], version: 'v2.2', certified: true },
  { id: 'mk-006', name: 'Data Pipeline Validator', category: 'Data', author: 'Community', capability: 86, safety: 100, redTeam: 89, stars: 54, downloads: 312, description: 'Validates data pipeline outputs against schemas, detects anomalies, and reports quality metrics.', tags: ['data', 'validation', 'schema'], version: 'v1.5', certified: true },
  { id: 'mk-007', name: 'Untrusted Input Sanitizer', category: 'Security', author: 'SkillForge Labs', capability: 90, safety: 100, redTeam: 99, stars: 167, downloads: 988, description: 'Processes untrusted user instructions safely, detecting and neutralizing injection attempts.', tags: ['security', 'injection', 'sanitize'], version: 'v3.3', certified: true },
  { id: 'mk-008', name: 'CLI Tool Wrapper', category: 'DevOps', author: 'Community', capability: 83, safety: 100, redTeam: 88, stars: 41, downloads: 198, description: 'Wraps common CLI tools with safe argument handling, output parsing, and error recovery.', tags: ['cli', 'shell', 'wrapper'], version: 'v1.2', certified: false },
];

const CATEGORIES = ['All', 'DevOps', 'Networking', 'Support', 'Security', 'Research', 'Data'];

export default function SkillMarketplace({ onNavigate }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('downloads');
  const [imported, setImported] = useState({});

  const filtered = MARKETPLACE_SKILLS
    .filter(s =>
      (category === 'All' || s.category === category) &&
      (!search || s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase()) || s.tags.some(t => t.includes(search.toLowerCase())))
    )
    .sort((a, b) => {
      if (sortBy === 'downloads') return b.downloads - a.downloads;
      if (sortBy === 'stars') return b.stars - a.stars;
      if (sortBy === 'capability') return b.capability - a.capability;
      return 0;
    });

  const handleImport = (skill) => {
    setImported(p => ({ ...p, [skill.id]: true }));
    setTimeout(() => setImported(p => ({ ...p, [skill.id]: false })), 2000);
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <Store color="var(--accent-cyan)" size={28} /> Skill Marketplace
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '28px' }}>
        Browse and import certified, pre-evolved skill templates into your local library.
      </p>

      {/* Stats Bar */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[{label: 'Published Skills', value: MARKETPLACE_SKILLS.length}, {label: 'Total Downloads', value: '5.4k+'}, {label: 'Avg Safety Score', value: '100%'}, {label: 'Certified', value: MARKETPLACE_SKILLS.filter(s => s.certified).length}].map(m => (
          <div key={m.label} style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
            <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-cyan)' }}>{m.value}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px', flex: 1, minWidth: '200px' }}>
          <Search size={15} color="var(--text-muted)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search skills, tags..." style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%' }} />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)}
          style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer' }}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer' }}>
          <option value="downloads">Most Downloaded</option>
          <option value="stars">Highest Rated</option>
          <option value="capability">Best Capability</option>
        </select>
      </div>

      {/* Skill Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {filtered.map(skill => (
          <div key={skill.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{skill.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>by {skill.author} · {skill.version}</div>
              </div>
              {skill.certified && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, color: 'var(--accent-success)', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '3px 8px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                  <Shield size={10} /> CERTIFIED
                </span>
              )}
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', flex: 1 }}>{skill.description}</p>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {skill.tags.map(tag => (
                <span key={tag} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(99,102,241,0.2)' }}>#{tag}</span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
              <span style={{ color: 'var(--accent-success)' }}>⚡ {skill.capability}% cap</span>
              <span style={{ color: 'var(--accent-success)' }}>🛡 {skill.safety}% safe</span>
              <span style={{ color: '#f97316' }}>🎯 {skill.redTeam}% defense</span>
              <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={12} /> {skill.stars} · <Download size={12} /> {skill.downloads}
              </span>
            </div>

            <button
              onClick={() => handleImport(skill)}
              className={imported[skill.id] ? 'btn-secondary' : 'btn-primary'}
              style={{ width: '100%', justifyContent: 'center', fontSize: '13px' }}
            >
              {imported[skill.id] ? '✓ Imported to Library' : <><Download size={14} /> Import to Library</>}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
