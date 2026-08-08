from pydantic import BaseModel, Field
from typing import Optional, List

class CriticResult(BaseModel):
    capability_score: float = Field(..., ge=0.0, le=1.0)
    reliability_score: float = Field(..., ge=0.0, le=1.0)
    generalization_score: float = Field(..., ge=0.0, le=1.0)
    issues: List[str]
    improvements: List[str]
    should_refine: bool

class EvaluationResult(BaseModel):
    skill_id: str
    task_id: str
    baseline_score: float = Field(..., ge=0.0, le=1.0)
    skilled_score: float = Field(..., ge=0.0, le=1.0)
    lift: float
    feedback: str
