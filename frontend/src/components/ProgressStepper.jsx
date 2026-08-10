import React from 'react';
import { Hammer, Loader2, Check, AlertTriangle, ShieldCheck, Activity, Target } from 'lucide-react';

const STAGE_ORDER = [
  "ANALYZING",
  "GENERATING",
  "CRITIQUING",
  "SAFETY_AUDIT",
  "EVALUATING",
  "REFINING",
  "RE_EVALUATING",
  "COMPLETED"
];

const STAGE_CONFIG = {
  "ANALYZING": { label: "Analyzing Task Context", icon: Hammer },
  "GENERATING": { label: "Drafting Skill Procedure", icon: Hammer },
  "CRITIQUING": { label: "Critiquing Edge Cases", icon: AlertTriangle },
  "SAFETY_AUDIT": { label: "Multi-Layer Safety Audit", icon: ShieldCheck },
  "EVALUATING": { label: "Evaluating Skill Performance", icon: Activity },
  "REFINING": { label: "Refining Skill Draft", icon: Target },
  "RE_EVALUATING": { label: "Re-Evaluating Refined Skill", icon: Activity },
  "COMPLETED": { label: "Skill Forging Complete", icon: Check }
};

export default function ProgressStepper({ events }) {
  // Determine current active stage index
  let currentStageIndex = -1;
  const completedStages = new Set();
  const failedStages = new Set();
  let currentStatus = null;

  events.forEach(event => {
    const stageIdx = STAGE_ORDER.indexOf(event.stage);
    if (stageIdx !== -1) {
      if (event.status === 'in_progress') {
        currentStageIndex = stageIdx;
        currentStatus = 'in_progress';
      } else if (event.status === 'completed') {
        completedStages.add(event.stage);
        if (stageIdx >= currentStageIndex) {
            currentStageIndex = stageIdx;
            currentStatus = 'completed';
        }
      } else if (event.status === 'failed') {
        failedStages.add(event.stage);
      }
    }
  });

  const getStatusClass = (stage) => {
    const stageIdx = STAGE_ORDER.indexOf(stage);
    
    if (failedStages.has(stage)) return 'failed';
    if (completedStages.has(stage)) return 'completed';
    
    // If it's the current active stage and not completed
    if (stageIdx === currentStageIndex && currentStatus === 'in_progress') return 'active';
    
    // If it's past the current stage
    if (stageIdx > currentStageIndex) return 'pending';
    
    // If it's before the current stage and somehow not in completed (fallback)
    if (stageIdx < currentStageIndex) return 'completed';

    return 'pending';
  };

  const getIcon = (stage, statusClass, Icon) => {
    if (statusClass === 'completed') return <Check size={14} />;
    if (statusClass === 'failed') return <AlertTriangle size={14} style={{color: 'red'}}/>;
    if (statusClass === 'active') return <Loader2 size={14} className="spin" />;
    return <Icon size={14} />;
  };

  return (
    <div className="stepper">
      {STAGE_ORDER.map((stage) => {
        // Skip rendering REFINING and RE_EVALUATING for Gate 1 if they never appeared in events and we're not there
        const isRefinementStage = stage === "REFINING" || stage === "RE_EVALUATING";
        const hasReachedEnd = completedStages.has("COMPLETED");
        const wasSkipped = isRefinementStage && hasReachedEnd && !completedStages.has(stage);
        
        if (wasSkipped) return null;

        const config = STAGE_CONFIG[stage];
        if (!config) return null;
        
        const statusClass = getStatusClass(stage);
        
        // Find latest message for this stage
        const eventForStage = events.slice().reverse().find(e => e.stage === stage);
        const latestEventMessage = eventForStage?.message;

        return (
          <div key={stage} className={`step-item ${statusClass}`}>
            <div className="step-icon">
              {getIcon(stage, statusClass, config.icon)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="step-text">{config.label}</span>
                {statusClass === 'active' && latestEventMessage && (
                  <span className="step-subtext" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{latestEventMessage}</span>
                )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
