import React, { useState } from 'react';
import { Play, Loader2, Info } from 'lucide-react';

export default function Playground({ skillContent }) {
  const [payloadStr, setPayloadStr] = useState('{\n  "input": "test data"\n}');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleRun = async () => {
    let payload;
    try {
      payload = JSON.parse(payloadStr);
    } catch (e) {
      alert("Invalid JSON payload");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('http://localhost:8000/api/sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill_content: skillContent,
          payload: payload
        })
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: "Failed to connect to sandbox" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="playground" style={{ marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <h3>Mock Sandbox Playground</h3>
        <span className="badge warning" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Info size={12} /> Simulation
        </span>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.9rem' }}>
        Test the generated skill against sample input payloads. Note: This environment simulates deterministic execution for safety. Arbitrary code execution is disabled.
      </p>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <label className="input-label">Sample Payload (JSON)</label>
          <textarea 
            className="studio-input"
            style={{ fontFamily: 'monospace', height: '150px' }}
            value={payloadStr}
            onChange={(e) => setPayloadStr(e.target.value)}
          />
          <button 
            className="btn-primary" 
            style={{ marginTop: '16px' }}
            onClick={handleRun}
            disabled={loading}
          >
            {loading ? <Loader2 size={16} className="spin" /> : <Play size={16} />}
            Run Simulation
          </button>
        </div>

        <div style={{ flex: 1 }}>
          <label className="input-label">Sandbox Output</label>
          <div style={{ 
            backgroundColor: '#1e1e1e', 
            borderRadius: '8px', 
            height: '150px', 
            padding: '16px',
            color: '#d4d4d4',
            fontFamily: 'monospace',
            overflowY: 'auto',
            fontSize: '0.9rem'
          }}>
            {result ? (
              <pre style={{ margin: 0 }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : (
              <div style={{ color: 'var(--text-secondary)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Run the simulation to see output
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
