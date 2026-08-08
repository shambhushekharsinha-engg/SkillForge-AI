from pydantic import BaseModel, Field
from typing import Optional, List

class SafetyResult(BaseModel):
    safe: bool
    risk_level: str = Field(..., description="LOW, MEDIUM, HIGH, CRITICAL")
    violations: List[str]
    required_changes: List[str]
