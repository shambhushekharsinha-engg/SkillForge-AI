from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class TaskAnalysis(BaseModel):
    task_id: str
    description: str
    trigger_conditions: List[str]
    required_context: List[str]
    constraints: List[str]
    expected_outcome: str
