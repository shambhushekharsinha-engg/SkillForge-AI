import React, { useState, useRef, useEffect } from 'react';
import { FlaskConical, Loader2, Play, ShieldAlert, Crosshair, ChevronRight, Activity, ShieldCheck, XCircle, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { WS_BASE_URL } from '../config';

export default function EvolutionLab() {
  const [taskDesc, setTaskDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [isDone, setIsDone] = useState(false);
  const [finalReason, setFinalReason] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const handleEvolve = async () => {
    if (!taskDesc) return;
    setLoading(true);
    setEvents([]);
    setIsDone(false);
    setFinalReason(null);
    
    if (wsRef.current) wsRef.current.close();

    const connect = () => {
      const ws = new WebSocket(`${WS_BASE_URL}/api/ws/evolve`);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ task_id: `evo-${Date.now()}`, description: taskDesc }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'error') {
           setIsDone(true);
           setLoading(false);
           return;
        }
        
        setEvents(prev => [...prev, data]);
        
        if (data.type === 'evolution_completed') {
          setIsDone(true);
          setLoading(false);
          setFinalReason(data.reason);
        }
      };

      ws.onclose = () => {
        if (!isDone) {
          setIsDone(true);
          setLoading(false);
        }
      };
    };

    connect();
  };

  const renderEventCard = (ev, idx) => {
    switch(ev.type) {
      case 'generation_started':
        return (
          <div key={idx} className="glass-card" style={{ padding: '12px 16px', borderLeft: '4px solid #60a5fa', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FlaskConical size={18} color="#60a5fa" />
              <strong style={{ color: '#60a5fa' }}>Generation {ev.generation} Initiated</strong>
            </div>
            <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-secondary)' }}>
              Spawning new candidate variant...
            </div>
          </div>
        );
      case 'firewall_completed':
        const fw = ev.payload;
        const isBlocked = fw?.decision === "BLOCKED";
        return (
          <div key={idx} className="glass-card" style={{ padding: '12px 16px', borderLeft: `4px solid ${isBlocked ? '#ef4444' : '#10b981'}`, marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isBlocked ? <ShieldAlert size={18} color="#ef4444" /> : <ShieldCheck size={18} color="#10b981" />}
              <strong style={{ color: isBlocked ? '#ef4444' : '#10b981' }}>Safety Firewall {isBlocked ? 'BLOCKED' : 'PASSED'}</strong>
            </div>
            {isBlocked && fw?.matched_rules && (
              <div style={{ fontSize: '12px', marginTop: '4px', color: '#fca5a5' }}>
                Violations: {fw.matched_rules.join(", ")} (Risk: {fw.risk_score.toFixed(2)})
              </div>
            )}
          </div>
        );
      case 'benchmark_completed':
        return (
          <div key={idx} className="glass-card" style={{ padding: '12px 16px', borderLeft: '4px solid #8b5cf6', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="#8b5cf6" />
              <strong style={{ color: '#8b5cf6' }}>Empirical Benchmark Executed</strong>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              {ev.payload && Object.entries(ev.payload).map(([k, v]) => (
                <div key={k} style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                  {k}: <span style={{ fontWeight: 'bold' }}>{Math.round(v * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'redteam_completed':
        const rt = ev.payload;
        return (
          <div key={idx} className="glass-card" style={{ padding: '12px 16px', borderLeft: '4px solid #f97316', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Crosshair size={18} color="#f97316" />
              <strong style={{ color: '#f97316' }}>Red Team Arena Defense: {rt ? Math.round(rt.defense_rate * 100) : 0}%</strong>
            </div>
            <div style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-secondary)' }}>
              Attacks Blocked: {rt?.attacks_blocked} / {rt?.attacks_total}
            </div>
          </div>
        );
      case 'regression_evaluated':
        const gate = ev.payload;
        return (
          <div key={idx} className="glass-card" style={{ padding: '12px 16px', borderLeft: `4px solid ${gate?.accepted ? '#10b981' : '#f59e0b'}`, marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {gate?.accepted ? <TrendingUp size={18} color="#10b981" /> : <AlertTriangle size={18} color="#f59e0b" />}
              <strong style={{ color: gate?.accepted ? '#10b981' : '#f59e0b' }}>Regression Gate: {gate?.accepted ? 'CLEARED' : 'FAILED'}</strong>
            </div>
            {!gate?.accepted && gate?.reasons && (
              <div style={{ fontSize: '12px', marginTop: '4px', color: '#fcd34d' }}>
                Reasons: {gate.reasons.join(" | ")}
              </div>
            )}
          </div>
        );
      case 'generation_rejected':
        return (
          <div key={idx} style={{ padding: '12px 16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', marginBottom: '24px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
              <XCircle size={18} />
              <strong>Generation {ev.generation} Rejected</strong>
            </div>
          </div>
        );
      case 'generation_accepted':
        return (
          <div key={idx} style={{ padding: '12px 16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '8px', marginBottom: '24px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
              <CheckCircle2 size={18} />
              <strong>Generation {ev.generation} Accepted into Lineage!</strong>
            </div>
          </div>
        );
      case 'strategy_selected':
        return (
          <div key={idx} style={{ padding: '8px 16px', color: '#94a3b8', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
             <ChevronRight size={14} /> Applying targeted mutation strategy: <strong style={{ color: '#e2e8f0' }}>{ev.payload}</strong>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FlaskConical color="#8b5cf6" size={32} />
          Evolution Laboratory
        </h1>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Enter a task to launch an autonomous skill evolution experiment. The system will iteratively generate, aggressively test, and conditionally mutate variants until the pareto frontier is reached.
      </p>

      <div className="glass-card" style={{ marginBottom: '32px' }}>
        <div className="input-group">
          <label className="input-label">Task Description</label>
          <textarea 
            className="studio-input" 
            placeholder="e.g. A secure skill that processes user logs and aggregates errors without exposing PII..."
            value={taskDesc}
            onChange={(e) => setTaskDesc(e.target.value)}
          />
        </div>

        <button 
          className="btn-primary" 
          onClick={handleEvolve} 
          disabled={loading || !taskDesc}
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}
        >
          {loading ? <Loader2 size={18} className="spin" /> : <Play size={18} />}
          {loading ? 'Running Evolution Engine...' : 'Launch Autonomous Evolution'}
        </button>
      </div>

      {events.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h3 style={{ marginBottom: '16px', color: '#e2e8f0' }}>Experiment Live Feed</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '12px', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
            {events.map((ev, idx) => renderEventCard(ev, idx))}
          </div>
          
          {loading && (
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', padding: '16px' }}>
               <Loader2 size={16} className="spin" /> Processing next epoch...
             </div>
          )}
          
          {isDone && finalReason && (
            <div style={{ marginTop: '24px', padding: '16px', borderRadius: '8px', background: finalReason === 'TARGET_REACHED' ? 'rgba(16,185,129,0.15)' : 'rgba(148,163,184,0.1)', border: `1px solid ${finalReason === 'TARGET_REACHED' ? '#10b981' : '#475569'}` }}>
              <h3 style={{ margin: 0, color: finalReason === 'TARGET_REACHED' ? '#10b981' : '#cbd5e1' }}>
                Evolution Terminated: {finalReason}
              </h3>
            </div>
          )}
        </div>
      )}
      
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
