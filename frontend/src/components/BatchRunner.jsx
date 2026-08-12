import React, { useState } from 'react';
import { ListChecks, Plus, Play, Trash2, Clock, CheckCircle2, Loader2, XCircle } from 'lucide-react';

const PRIORITIES = ['HIGH', 'NORMAL', 'LOW'];

export default function BatchRunner({ onNavigate }) {
  const [jobs, setJobs] = useState([
    { id: 1, task: 'Create a robust file management skill with rollback support', priority: 'HIGH', status: 'pending' },
    { id: 2, task: 'Build a customer support triage agent with PII detection', priority: 'NORMAL', status: 'pending' },
    { id: 3, task: 'Generate a secure API integration skill with OAuth2 support', priority: 'NORMAL', status: 'pending' },
  ]);
  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState('NORMAL');
  const [running, setRunning] = useState(false);

  const addJob = () => {
    if (!newTask.trim()) return;
    setJobs(prev => [...prev, { id: Date.now(), task: newTask.trim(), priority: newPriority, status: 'pending' }]);
    setNewTask('');
  };

  const removeJob = (id) => setJobs(prev => prev.filter(j => j.id !== id));

  const runBatch = async () => {
    if (running || jobs.length === 0) return;
    setRunning(true);
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'running' } : j));
      await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
      const success = Math.random() > 0.15;
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: success ? 'done' : 'failed' } : j));
    }
    setRunning(false);
  };

  const priorityColor = (p) => ({ HIGH: '#ef4444', NORMAL: 'var(--accent-primary)', LOW: '#94a3b8' })[p];
  const statusIcon = (s) => ({
    pending: <Clock size={16} color="var(--text-muted)" />,
    running: <Loader2 size={16} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />,
    done: <CheckCircle2 size={16} color="var(--accent-success)" />,
    failed: <XCircle size={16} color="var(--accent-danger)" />,
  })[s];

  const done = jobs.filter(j => j.status === 'done').length;
  const failed = jobs.filter(j => j.status === 'failed').length;
  const pending = jobs.filter(j => j.status === 'pending').length;

  return (
    <div style={{ paddingBottom: '40px' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <ListChecks color="var(--accent-purple)" size={28} /> Batch Runner
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '28px' }}>
        Queue multiple skill evolution experiments to run sequentially with priority scheduling.
      </p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[{label:'Queued', value: pending, color:'var(--text-muted)'}, {label:'Running', value: jobs.filter(j=>j.status==='running').length, color:'var(--accent-primary)'}, {label:'Completed', value: done, color:'var(--accent-success)'}, {label:'Failed', value: failed, color:'var(--accent-danger)'}].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add Job */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '14px' }}>Add Job to Queue</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            className="input-primary"
            placeholder="Describe the skill evolution task..."
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addJob()}
            style={{ flex: 1 }}
          />
          <select value={newPriority} onChange={e => setNewPriority(e.target.value)}
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer' }}>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
          <button onClick={addJob} className="btn-secondary" style={{ whiteSpace: 'nowrap' }}>
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* Job List */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '14px' }}>Job Queue ({jobs.length})</h3>
          <button onClick={runBatch} disabled={running || pending === 0} className="btn-primary" style={{ fontSize: '13px' }}>
            {running ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Running...</> : <><Play size={14} /> Run All Jobs</>}
          </button>
        </div>
        {jobs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No jobs in queue. Add a task above.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {jobs.map((job, i) => (
              <div key={job.id} style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '14px', background: job.status === 'running' ? 'rgba(99,102,241,0.04)' : 'transparent' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', width: '24px', textAlign: 'center' }}>#{i+1}</div>
                {statusIcon(job.status)}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{job.task}</div>
                  {job.status === 'running' && (
                    <div style={{ fontSize: '12px', color: 'var(--accent-primary)', marginTop: '2px' }}>Evolving... running benchmark suite</div>
                  )}
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: priorityColor(job.priority), padding: '2px 8px', border: `1px solid ${priorityColor(job.priority)}44`, borderRadius: '12px' }}>
                  {job.priority}
                </span>
                {job.status === 'pending' && (
                  <button onClick={() => removeJob(job.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', display: 'flex' }}>
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {done > 0 && (
        <div className="glass-card" style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <h3 style={{ marginBottom: '12px', color: 'var(--accent-success)', fontSize: '14px' }}>Batch Summary</h3>
          <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
            <span>✅ {done} completed</span>
            {failed > 0 && <span style={{ color: 'var(--accent-danger)' }}>❌ {failed} failed</span>}
            <span style={{ color: 'var(--text-muted)', marginLeft: 'auto', fontSize: '12px' }}>View results in Skill Library →</span>
          </div>
        </div>
      )}
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
