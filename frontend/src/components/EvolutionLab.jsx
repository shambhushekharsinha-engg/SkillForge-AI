import React, { useState, useRef, useEffect } from 'react';
import { FlaskConical, Loader2, Play, ShieldAlert, Crosshair, ChevronRight, Activity, ShieldCheck, XCircle, CheckCircle2, TrendingUp, AlertTriangle, RotateCcw } from 'lucide-react';
import { WS_BASE_URL } from '../config';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis } from 'recharts';

export default function EvolutionLab() {
  const [taskDesc, setTaskDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [isDone, setIsDone] = useState(false);
  const [finalReason, setFinalReason] = useState(null);
  
  // Replay state
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayEvents, setReplayEvents] = useState([]);
  
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
    setIsReplaying(false);
    setReplayEvents([]);
    
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

  const handleReplay = async () => {
    if (events.length === 0) return;
    setIsReplaying(true);
    setReplayEvents([...events]);
    setEvents([]);
    setIsDone(false);
    setFinalReason(null);

    const fullEvents = [...events];
    
    for (let i = 0; i < fullEvents.length; i++) {
        setEvents(prev => [...prev, fullEvents[i]]);
        if (fullEvents[i].type === 'evolution_completed') {
            setIsDone(true);
            setFinalReason(fullEvents[i].reason);
        }
        await new Promise(r => setTimeout(r, 600)); // 600ms delay between events
    }
    setIsReplaying(false);
  };

  // Derive state from events
  const expInfoEvent = events.find(e => e.type === 'generation_started' && e.experiment_info);
  const expInfo = expInfoEvent ? expInfoEvent.experiment_info : null;

  // Build heatmap and scatter data
  const generationData = {};
  let currentGen = 0;
  
  events.forEach(ev => {
     if (ev.generation) currentGen = ev.generation;
     if (!generationData[currentGen]) {
         generationData[currentGen] = { gen: currentGen, categories: {}, rt: null, accepted: false, rejected: false };
     }
     if (ev.type === 'benchmark_completed' && ev.payload) {
         generationData[currentGen].categories = ev.payload;
     }
     if (ev.type === 'redteam_completed' && ev.payload) {
         generationData[currentGen].rt = ev.payload.defense_rate;
     }
     if (ev.type === 'generation_accepted') {
         generationData[currentGen].accepted = true;
     }
     if (ev.type === 'generation_rejected') {
         generationData[currentGen].rejected = true;
     }
  });

  const scatterData = Object.values(generationData).filter(d => d.categories && Object.keys(d.categories).length > 0).map(d => {
      const cap = Object.values(d.categories).reduce((a, b) => a + b, 0) / Object.keys(d.categories).length;
      const saf = d.categories['Safety'] || 0;
      let status = 'Pending';
      if (d.accepted) status = 'Accepted';
      if (d.rejected) status = 'Rejected';
      return {
          gen: d.gen,
          x: Math.round(cap * 100),
          y: Math.round(saf * 100),
          status
      };
  });

  const latestGen = Object.values(generationData).reverse().find(d => Object.keys(d.categories).length > 0);
  const radarData = latestGen ? [
    { subject: 'Capability', A: latestGen.categories['Basic'] || 0.8 },
    { subject: 'Safety', A: latestGen.categories['Safety'] || 0.8 },
    { subject: 'Generalization', A: latestGen.categories['Edge Cases'] || 0.6 },
    { subject: 'Constraints', A: latestGen.categories['Constraints'] || 0.7 },
    { subject: 'Robustness', A: latestGen.rt || 0.5 },
  ].map(d => ({...d, A: Math.round(d.A * 100)})) : [];

  const allCategories = ['Basic', 'Edge Cases', 'Constraints', 'Safety'];

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
          <div key={idx} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '16px', borderLeft: '4px solid #94a3b8' }}>
             <div style={{ color: '#94a3b8', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
               <ChevronRight size={14} /> Applying targeted mutation strategy: <strong style={{ color: '#e2e8f0' }}>{ev.payload?.strategy}</strong>
             </div>
             {ev.payload?.failures && ev.payload.failures.length > 0 && (
                 <div style={{ fontSize: '12px', color: '#cbd5e1', paddingLeft: '22px' }}>
                     Reason: {ev.payload.failures.length} failures detected (e.g. {ev.payload.failures[0].message})
                 </div>
             )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: '1000px', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FlaskConical color="#8b5cf6" size={32} />
          Evolution Laboratory
        </h1>
        {events.length > 0 && isDone && !isReplaying && (
            <button onClick={handleReplay} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RotateCcw size={16} /> Replay Experiment
            </button>
        )}
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Enter a task to launch an autonomous skill evolution experiment. The system will iteratively generate, aggressively test, and conditionally mutate variants until the pareto frontier is reached.
      </p>

      {/* Input */}
      {(!events.length && !isReplaying) && (
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
      )}

      {/* Experiment Info Panel */}
      {expInfo && (
        <div className="glass-card" style={{ marginBottom: '24px', padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase' }}>Experiment Record</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', fontSize: '14px' }}>
                <div><strong>ID:</strong> <span style={{ color: '#60a5fa' }}>{expInfo.experiment_id}</span></div>
                <div><strong>Seed:</strong> {expInfo.seed}</div>
                <div><strong>Model:</strong> {expInfo.model}</div>
                <div><strong>Benchmark:</strong> {expInfo.benchmark_version}</div>
                <div><strong>Budget:</strong> {expInfo.budget} Generations</div>
                <div><strong>Target:</strong> {expInfo.target_score * 100}%</div>
            </div>
        </div>
      )}

      {/* Grid Layout for visualizers */}
      {events.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
              {/* Skill Genome Radar */}
              <div className="glass-card" style={{ padding: '16px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase' }}>Skill Genome</h3>
                  <div style={{ height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
              </div>

              {/* Pareto Frontier */}
              <div className="glass-card" style={{ padding: '16px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase' }}>Pareto Frontier</h3>
                  <div style={{ height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis type="number" dataKey="x" name="Capability" domain={[0, 100]} stroke="#94a3b8" />
                        <YAxis type="number" dataKey="y" name="Safety" domain={[0, 100]} stroke="#94a3b8" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                        
                        <Scatter name="Accepted" data={scatterData.filter(d => d.status === 'Accepted')} fill="#10b981" />
                        <Scatter name="Rejected" data={scatterData.filter(d => d.status === 'Rejected')} fill="#ef4444" />
                        <Scatter name="Pending" data={scatterData.filter(d => d.status === 'Pending')} fill="#60a5fa" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', fontSize: '12px', marginTop: '8px' }}>
                      <span style={{ color: '#10b981' }}>● Accepted</span>
                      <span style={{ color: '#ef4444' }}>● Rejected</span>
                      <span style={{ color: '#60a5fa' }}>● Pending</span>
                  </div>
              </div>
          </div>
      )}

      {/* Benchmark Heatmap */}
      {events.length > 0 && Object.keys(generationData).length > 0 && (
          <div className="glass-card" style={{ marginBottom: '32px', padding: '16px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase' }}>Benchmark Heatmap</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                  <thead>
                      <tr>
                          <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Category</th>
                          {Object.keys(generationData).map(gen => (
                              <th key={gen} style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>V{gen}</th>
                          ))}
                      </tr>
                  </thead>
                  <tbody>
                      {allCategories.map(cat => (
                          <tr key={cat}>
                              <td style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{cat}</td>
                              {Object.values(generationData).map(d => {
                                  const score = d.categories[cat];
                                  let indicator = '⚪';
                                  if (score >= 0.9) indicator = '🟢';
                                  else if (score >= 0.5) indicator = '🟡';
                                  else if (score !== undefined) indicator = '🔴';
                                  
                                  return (
                                      <td key={d.gen} style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                          {indicator}
                                      </td>
                                  )
                              })}
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      )}

      {/* Timeline Feed */}
      {events.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase' }}>Evolution Timeline</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '12px', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
            {events.map((ev, idx) => renderEventCard(ev, idx))}
          </div>
          
          {loading && (
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', padding: '16px' }}>
               <Loader2 size={16} className="spin" /> Processing next epoch...
             </div>
          )}
          
          {isDone && finalReason && (
            <div style={{ marginTop: '24px' }}>
                {finalReason === 'TARGET_REACHED' ? (
                    <div style={{ padding: '24px', borderRadius: '8px', border: '2px solid #10b981', background: 'rgba(16,185,129,0.1)', textAlign: 'center' }}>
                        <h2 style={{ color: '#10b981', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                            <ShieldCheck size={28} /> SKILL CERTIFICATION
                        </h2>
                        
                        <div style={{ display: 'inline-block', textAlign: 'left', marginBottom: '24px' }}>
                            <div style={{ color: '#cbd5e1', marginBottom: '8px' }}>✓ Firewall Passed</div>
                            <div style={{ color: '#cbd5e1', marginBottom: '8px' }}>✓ Safety Regression: None</div>
                            <div style={{ color: '#cbd5e1', marginBottom: '8px' }}>✓ Red-Team Defense &ge; 90%</div>
                            <div style={{ color: '#cbd5e1', marginBottom: '8px' }}>✓ Capability Target Achieved</div>
                            <div style={{ color: '#cbd5e1' }}>✓ Benchmark Regression: None</div>
                        </div>

                        <div style={{ padding: '12px', background: '#10b981', color: '#fff', fontWeight: 'bold', fontSize: '18px', letterSpacing: '2px', borderRadius: '4px' }}>
                            STATUS: CERTIFIED ✓
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: '24px', borderRadius: '8px', border: '2px solid #ef4444', background: 'rgba(239,68,68,0.1)', textAlign: 'center' }}>
                        <h2 style={{ color: '#ef4444', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                            <ShieldAlert size={28} /> NOT CERTIFIED
                        </h2>
                        
                        <div style={{ color: '#fca5a5', marginBottom: '24px' }}>
                            Evolution terminated due to: <strong>{finalReason}</strong>
                        </div>
                    </div>
                )}
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
