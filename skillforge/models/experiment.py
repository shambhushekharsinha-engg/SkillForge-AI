from pydantic import BaseModel
from typing import Optional
import datetime

class ExperimentManifest(BaseModel):
    experiment_id: str
    task: str
    model: str
    seed: int
    budget: int
    target_capability: float
    benchmark_version: str = "BENCH-v1.3"
    red_team_version: str = "RT-v1.2"
    policy_version: str = "POLICY-v1.4"
    timestamp: str = ""
    initial_skill_hash: Optional[str] = None
    final_experiment_hash: Optional[str] = None
    status: str = "STARTED"

    def __init__(self, **data):
        super().__init__(**data)
        if not self.timestamp:
            self.timestamp = datetime.datetime.utcnow().isoformat()
