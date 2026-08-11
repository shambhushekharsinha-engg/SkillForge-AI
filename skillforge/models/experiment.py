from pydantic import BaseModel
from typing import Optional
import datetime
import json
import os

def load_registry_versions():
    registry_path = os.path.join(os.path.dirname(__file__), "..", "..", "registry.json")
    try:
        with open(registry_path, "r") as f:
            reg = json.load(f)
            return {
                "bench": reg.get("benchmark", {}).get("version", "BENCH-v1.3"),
                "rt": reg.get("red_team", {}).get("version", "RT-v1.2"),
                "policy": reg.get("firewall", {}).get("version", "POLICY-v1.4")
            }
    except Exception:
        return {"bench": "BENCH-v1.3", "rt": "RT-v1.2", "policy": "POLICY-v1.4"}

reg_versions = load_registry_versions()

class ExperimentManifest(BaseModel):
    experiment_id: str
    task: str
    model: str
    seed: int
    budget: int
    target_capability: float
    benchmark_version: str = reg_versions["bench"]
    red_team_version: str = reg_versions["rt"]
    policy_version: str = reg_versions["policy"]
    timestamp: str = ""
    initial_skill_hash: Optional[str] = None
    final_experiment_hash: Optional[str] = None
    status: str = "STARTED"

    def __init__(self, **data):
        super().__init__(**data)
        if not self.timestamp:
            self.timestamp = datetime.datetime.utcnow().isoformat()
