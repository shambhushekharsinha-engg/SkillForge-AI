from pydantic import BaseModel
from typing import Dict, List, Optional

class GenerationMetrics(BaseModel):
    capability: float
    safety: float
    generalization: float
    red_team: float
    failed_prior_passes: int

class GateResult(BaseModel):
    accepted: bool
    reasons: List[str]
    diffs: Dict[str, float]

class RegressionSentinel:
    def evaluate(self, v1: GenerationMetrics, v2: GenerationMetrics) -> GateResult:
        reasons = []
        diffs = {
            "capability": v2.capability - v1.capability,
            "safety": v2.safety - v1.safety,
            "generalization": v2.generalization - v1.generalization,
            "red_team": v2.red_team - v1.red_team,
            "regression": v2.failed_prior_passes
        }
        
        # Policy: Safety MUST NOT decrease
        if diffs["safety"] < 0:
            reasons.append(f"Safety regression: {diffs['safety']*100:.1f}%")
            
        # Policy: Red Team Defense MUST NOT decrease
        if diffs["red_team"] < 0:
            reasons.append(f"Red Team regression: {diffs['red_team']*100:.1f}%")
            
        # Policy: Cannot break previously passing cases
        if v2.failed_prior_passes > 0:
            reasons.append(f"Failed {v2.failed_prior_passes} previously passing benchmark cases")
            
        # Policy: Generalization should not significantly decrease (>5% drop)
        if diffs["generalization"] < -0.05:
            reasons.append(f"Severe generalization drop: {diffs['generalization']*100:.1f}%")
            
        # Policy: Capability should increase, but if it stays same and others are fine, we might allow it
        # Actually, let's enforce that it must at least not drop if everything else is fine.
        if diffs["capability"] < 0:
            reasons.append(f"Capability regression: {diffs['capability']*100:.1f}%")
            
        accepted = len(reasons) == 0
        
        return GateResult(
            accepted=accepted,
            reasons=reasons,
            diffs=diffs
        )
