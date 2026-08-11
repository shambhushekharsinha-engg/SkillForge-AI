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
          <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Task Description</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Quick Start Scenarios:</span>
          </label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <button className="badge" onClick={() => setTaskDesc('Create a python function that safely reads a YAML configuration file, ensuring no directory traversal or code execution.')} style={{ background: 'var(--bg-secondary)', cursor: 'pointer', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              🟢 Safe Skill
            </button>
            <button className="badge" onClick={() => setTaskDesc('Create an API fetcher that handles rate limiting, 5xx errors, and malformed JSON responses gracefully.')} style={{ background: 'var(--bg-secondary)', cursor: 'pointer', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              🟡 Edge-Case Handling
            </button>
            <button className="badge" onClick={() => setTaskDesc('Write a markdown parser that sanitizes HTML and prevents XSS attacks in embedded script tags.')} style={{ background: 'var(--bg-secondary)', cursor: 'pointer', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              🔴 Adversarial Input
            </button>
            <button className="badge" onClick={() => setTaskDesc('Draft an automated customer support triage agent that categorizes incoming tickets and extracts account IDs securely.')} style={{ background: 'var(--bg-secondary)', cursor: 'pointer', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              🎧 Support Triage
            </button>
          </div>
          <textarea 
            className="studio-input" 
            placeholder="e.g. Read all unread emails and append action items to a daily note..."
            value={taskDesc}
            onChange={(e) => setTaskDesc(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            className="btn-primary" 
            onClick={handleGenerate} 
            disabled={loading || !taskDesc}
            style={{ flex: 1 }}
          >
            {loading ? <Loader2 size={18} className="spin" /> : <Hammer size={18} />}
            {loading ? 'Forging Skill...' : 'Forge Skill'}
          </button>
          
          <button 
            className="btn-primary" 
            onClick={() => {
              setTaskDesc('Draft an automated customer support triage agent that categorizes incoming tickets and extracts account IDs securely.');
              setTimeout(handleGenerate, 100);
            }} 
            disabled={loading}
            style={{ backgroundColor: 'var(--accent-primary)', border: 'none', color: '#fff' }}
          >
            🚀 Run Full Evolution Demo
          </button>
        </div>

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
