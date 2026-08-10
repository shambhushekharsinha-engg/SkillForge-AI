import React, { useState, useRef, useEffect } from 'react';
import { Hammer, Loader2, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import ProgressStepper from './ProgressStepper';
import DiffViewer from './DiffViewer';
import Playground from './Playground';
import ExplainableCritique from './ExplainableCritique';
import BenchmarkResults from './BenchmarkResults';
import QualityRadar from './QualityRadar';
import { WS_BASE_URL } from '../config';

export default function SkillStudio() {
  const [taskDesc, setTaskDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [result, setResult] = useState(null);
  const [isDone, setIsDone] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleGenerate = async () => {
    if (!taskDesc) return;
    setLoading(true);
    setResult(null);
    setEvents([]);
    setIsDone(false);
    
    if (wsRef.current) {
      wsRef.current.close();
    }

    let retries = 0;
    const maxRetries = 5;

    const connect = () => {
      const ws = new WebSocket(`${WS_BASE_URL}/api/ws/generate`);
      wsRef.current = ws;

      ws.onopen = () => {
        retries = 0;
        ws.send(JSON.stringify({ task_id: `ui-task-${Date.now()}`, description: taskDesc }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setEvents(prev => [...prev, data]);
        
        if (data.stage === 'COMPLETED' && data.status === 'completed') {
          setIsDone(true);
          setLoading(false);
        } else if (data.stage === 'COMPLETED' && data.status === 'completed' && data.payload) {
          setResult({ 
            evaluation: data.payload.evaluation, 
            v1_evaluation: data.payload.v1_evaluation, 
            diff: data.payload.diff,
            critic: data.payload.critic,
            safety: data.payload.safety,
            benchmark: data.payload.benchmark
          });
        } else if (data.stage === 'ERROR') {
          setIsDone(true);
          setLoading(false);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
      
      ws.onclose = () => {
        if (!isDone && retries < maxRetries) {
          retries++;
          const timeout = Math.min(1000 * Math.pow(2, retries), 10000);
          console.log(`WebSocket disconnected. Retrying in ${timeout}ms...`);
          setTimeout(connect, timeout);
        } else if (!isDone) {
          setIsDone(true);
          setLoading(false);
        }
      };
    };

    connect();
  };



  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ marginBottom: '8px' }}>Skill Studio</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Paste a task description to interactively forge and refine a new skill.
      </p>

      <div className="glass-card">
        <div className="input-group">
          <label className="input-label">Task Description</label>
          <textarea 
            className="studio-input" 
            placeholder="e.g. Read all unread emails and append action items to a daily note..."
            value={taskDesc}
            onChange={(e) => setTaskDesc(e.target.value)}
          />
        </div>

        <button 
          className="btn-primary" 
          onClick={handleGenerate} 
          disabled={loading || !taskDesc}
        >
          {loading ? <Loader2 size={18} className="spin" /> : <Hammer size={18} />}
          {loading ? 'Forging Skill...' : 'Forge Skill'}
        </button>

        {events.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <ProgressStepper events={events} />
          </div>
        )}

        {isDone && result?.v1_evaluation && result?.evaluation && (
          <>
            <ExplainableCritique critic={result.critic} safety={result.safety} />
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ flex: 1 }}>
                <BenchmarkResults 
                  v1_benchmark={events.find(e => e.stage === 'EVALUATING' && e.status === 'completed')?.payload?.benchmark} 
                  v2_benchmark={events.find(e => e.stage === 'RE_EVALUATING' && e.status === 'completed')?.payload?.benchmark} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <QualityRadar evaluation={result.evaluation} />
              </div>
            </div>
            <DiffViewer 
              diff={result.diff} 
              v1Evaluation={result.v1_evaluation} 
              v2Evaluation={result.evaluation} 
            />
            {result.evaluation.skill_id && (
              <Playground skillContent={taskDesc} />
            )}
          </>
        )}
      </div>
      
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
