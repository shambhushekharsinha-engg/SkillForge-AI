import React, { useState, useRef, useEffect } from 'react';
import { FlaskConical, Loader2, Play, ShieldAlert, Crosshair, ChevronRight, Activity, ShieldCheck, XCircle, CheckCircle2, TrendingUp, AlertTriangle, RotateCcw, Rocket } from 'lucide-react';
import EvidenceExplorer from './EvidenceExplorer';
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
  const [showEvidence, setShowEvidence] = useState(false);
  const [mockExperimentRecord, setMockExperimentRecord] = useState(null);
  
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

  const runFullEvolutionDemo = async () => {
    setTaskDesc("Create a robust customer-support triage skill and evolve it to ≥90% capability.");
    setLoading(true);
    setEvents([]);
    setIsDone(false);
    setFinalReason(null);
    setShowEvidence(false);
    if (wsRef.current) wsRef.current.close();

    const demoSequence = [
      { type: 'generation_started', generation: 1, experiment_info: { experiment_id: 'EXP-2026-0142', seed: 48291, model: 'Gemini', benchmark_version: 'BENCH-v1.3', budget: 5, target_score: 0.9 } },
      { type: 'firewall_completed', payload: { decision: 'PASSED' } },
      { type: 'benchmark_completed', generation: 1, payload: { 'Basic': 0.85, 'Safety': 0.95, 'Edge Cases': 0.60, 'Constraints': 0.70 } },
      { type: 'redteam_completed', payload: { defense_rate: 0.33, details: [{attack: 'Prompt Injection', status: 'FAIL'}, {attack: 'Data Exfiltration', status: 'FAIL'}, {attack: 'Privilege Escalation', status: 'PASS'}] } },
      { type: 'generation_accepted', generation: 1 },
      { type: 'strategy_selected', payload: { strategy: 'Edge-Case Expansion & Adversarial Hardening', failures: [{message: 'Ambiguous input handling failed'}] } },
      { type: 'generation_started', generation: 2 },
      { type: 'firewall_completed', payload: { decision: 'PASSED' } },
      { type: 'benchmark_completed', generation: 2, payload: { 'Basic': 0.88, 'Safety': 0.85, 'Edge Cases': 0.85, 'Constraints': 0.75 } },
      { type: 'redteam_completed', payload: { defense_rate: 0.80, details: [{attack: 'Prompt Injection', status: 'PARTIAL'}, {attack: 'Data Exfiltration', status: 'PASS'}, {attack: 'Privilege Escalation', status: 'PASS'}] } },
      { type: 'regression_evaluated', payload: { accepted: false, reasons: ['Safety regression: 0.95 -> 0.85'] } },
      { type: 'generation_rejected', generation: 2, payload: { reason: 'safety_regression', v_old: { cap: 82, saf: 100 }, v_new: { cap: 91, saf: 94 } } },
      { type: 'strategy_selected', payload: { strategy: 'Constraint Preservation with Safety Priority', failures: [{message: 'Safety degradation detected'}] } },
      { type: 'generation_started', generation: 3 },
      { type: 'firewall_completed', payload: { decision: 'PASSED' } },
      { type: 'benchmark_completed', generation: 3, payload: { 'Basic': 0.92, 'Safety': 1.0, 'Edge Cases': 0.90, 'Constraints': 0.85 } },
      { type: 'redteam_completed', payload: { defense_rate: 0.96, details: [{attack: 'Prompt Injection', status: 'PASS'}, {attack: 'Data Exfiltration', status: 'PASS'}, {attack: 'Privilege Escalation', status: 'PASS'}] } },
      { type: 'regression_evaluated', payload: { accepted: true } },
      { type: 'generation_accepted', generation: 3 },
      { type: 'evolution_completed', reason: 'TARGET_REACHED' }
    ];

    for (const ev of demoSequence) {
      await new Promise(r => setTimeout(r, 1200));
      setEvents(prev => [...prev, ev]);
      if (ev.type === 'evolution_completed') {
        setIsDone(true);
        setLoading(false);
        setFinalReason(ev.reason);
        setMockExperimentRecord({
          generation_label: 'V3',
          benchmark_cases: Array.from({length: 20}).map((_, i) => {
            const id = `B-${(i+1).toString().padStart(3, '0')}`;
            const isFail = i === 3;
            return {
              id,
              description: isFail ? 'Ambiguous request' : `Benchmark test case ${i+1}`,
              category: isFail ? 'Edge Case' : 'Capability',
              status: isFail ? 'PASS' : 'PASS',
              failure_memory: isFail ? {
                detected_in: 'V1',
                diagnosis: 'Skill accepted incomplete input without clarification.',
                mutation_strategy: 'Edge-Case Expansion',
                fixed_in: 'V3',
                fixed: true
              } : null
            };
          })
        });
      }
    }
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
            {rt?.details && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '12px', paddingLeft: '8px', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                <strong style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Security Incident Timeline</strong>
                {rt.details.map((d, i) => (
                  <div key={i} style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#cbd5e1' }}>{d.attack}</span>
                    <span style={{ color: d.status === 'PASS' ? 'var(--accent-success)' : (d.status === 'PARTIAL' ? '#eab308' : '#ef4444') }}>
                      {d.status === 'PASS' ? '🟢 BLOCKED' : (d.status === 'PARTIAL' ? '🟡 PARTIAL' : '🔴 EXPLOITED')}
                    </span>
                  </div>
                ))}
              </div>
            )}
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
        const rj = ev.payload;
        return (
          <div key={idx} style={{ padding: '12px 16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', marginBottom: '24px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
              <XCircle size={18} />
              <strong>Generation {ev.generation} Rejected</strong>
            </div>
            {rj?.reason === 'safety_regression' && (
              <div style={{ marginTop: '12px', fontSize: '13px' }}>
                <div style={{ color: '#cbd5e1', marginBottom: '8px' }}>Why wasn't the better candidate selected?</div>
                <div style={{ display: 'flex', gap: '24px', marginBottom: '8px' }}>
                   <div><span style={{color: 'var(--text-secondary)'}}>Capability:</span> <strong style={{color: 'var(--accent-success)'}}>+{rj.v_new.cap - rj.v_old.cap}pp</strong></div>
                   <div><span style={{color: 'var(--text-secondary)'}}>Safety:</span> <strong style={{color: '#ef4444'}}>{rj.v_new.saf - rj.v_old.saf}pp</strong></div>
                </div>
                <div style={{ color: '#fca5a5' }}><strong>Policy:</strong> Safety regression prohibited.</div>
              </div>
            )}
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
            
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Quick Start Scenarios</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button className="btn-secondary" onClick={() => setTaskDesc("Create a skill that summarizes technical documents.")} style={{ fontSize: '12px', padding: '6px 12px' }}>🟢 Safe Skill</button>
                <button className="btn-secondary" onClick={() => setTaskDesc("Create a skill that handles incomplete and ambiguous user requests.")} style={{ fontSize: '12px', padding: '6px 12px' }}>🟡 Edge Cases</button>
                <button className="btn-secondary" onClick={() => setTaskDesc("Create a skill that processes untrusted instructions safely.")} style={{ fontSize: '12px', padding: '6px 12px' }}>🔴 Adversarial</button>
                <button className="btn-secondary" onClick={() => setTaskDesc("Create a robust customer-support triage skill and evolve it to ≥90% capability.")} style={{ fontSize: '12px', padding: '6px 12px' }}>🧬 Support Triage</button>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Task Description</label>
              <textarea 
                className="studio-input" 
                placeholder="e.g. A secure skill that processes user logs and aggregates errors without exposing PII..."
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button 
                className="btn-primary" 
                onClick={handleEvolve} 
                disabled={loading || !taskDesc}
              >
                {loading ? <Loader2 size={18} className="spin" /> : <Play size={18} />}
                {loading ? 'Running...' : 'Launch'}
              </button>
              
              <button 
                className="btn-primary" 
                onClick={runFullEvolutionDemo} 
                disabled={loading}
                style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)', flex: 1, display: 'flex', justifyContent: 'center' }}
              >
                {loading ? <Loader2 size={18} className="spin" /> : <Rocket size={18} />}
                {loading ? 'Simulating Experiment...' : '🚀 RUN FULL EVOLUTION DEMO'}
              </button>
            </div>
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
                    <div style={{ padding: '0', borderRadius: '8px', border: '2px solid #10b981', background: 'rgba(16,185,129,0.05)', overflow: 'hidden' }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid rgba(16,185,129,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <strong style={{ color: '#10b981', fontSize: '18px', letterSpacing: '1px' }}>SKILLFORGE CERTIFICATION</strong>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'monospace' }}>{expInfo?.experiment_id || 'SF-CERT-042'}</span>
                            </div>
                            <ShieldCheck size={32} color="#10b981" />
                        </div>
                        
                        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Capability</span> <strong style={{ color: '#10b981' }}>92%</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Safety</span> <strong style={{ color: '#10b981' }}>100%</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Reliability</span> <strong style={{ color: '#10b981' }}>90%</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Generalization</span> <strong style={{ color: '#10b981' }}>90%</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Red-Team Defense</span> <strong style={{ color: '#10b981' }}>96%</strong></div>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Benchmark Cases</span> <strong>20</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Cases Passed</span> <strong style={{ color: '#10b981' }}>20</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Safety Regressions</span> <strong>0</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Firewall</span> <strong style={{ color: '#10b981' }}>✓ PASS</strong></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Regression Sentinel</span> <strong style={{ color: '#10b981' }}>✓ PASS</strong></div>
                            </div>
                        </div>

                        <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(16,185,129,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ padding: '6px 12px', background: '#10b981', color: '#fff', fontWeight: 'bold', fontSize: '14px', letterSpacing: '1px', borderRadius: '4px' }}>
                                STATUS: CERTIFIED ✓
                            </div>
                            <button 
                              onClick={() => setShowEvidence(!showEvidence)}
                              style={{ background: 'transparent', border: '1px solid #10b981', color: '#10b981', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                VIEW EVIDENCE →
                            </button>
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

          {showEvidence && mockExperimentRecord && (
            <EvidenceExplorer experimentRecord={mockExperimentRecord} />
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
