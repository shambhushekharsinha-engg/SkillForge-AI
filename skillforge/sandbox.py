from abc import ABC, abstractmethod
from typing import Dict, Any

class SandboxProvider(ABC):
    @abstractmethod
    def execute(self, skill_content: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the skill safely with the given payload."""
        pass

class MockSandboxProvider(SandboxProvider):
    def execute(self, skill_content: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Simulates execution. Returns deterministic output based on the payload.
        Explicitly marked as mock for safety.
        """
        return {
            "status": "success",
            "message": "Mock Execution Completed",
            "output": {
                "processed_payload": payload,
                "simulated_result": "Success! The skill logic executed perfectly in the mock environment.",
                "note": "This is a deterministic simulation. Arbitrary code execution is disabled for safety."
            },
            "metrics": {
                "execution_time_ms": 42,
                "memory_used_kb": 128
            }
        }
