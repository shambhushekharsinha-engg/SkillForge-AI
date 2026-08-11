import hashlib
import json
from typing import Dict, Any

class IntegrityManager:
    @staticmethod
    def generate_hash(payload: Dict[str, Any]) -> str:
        """Generates a SHA-256 hash of a canonical JSON representation."""
        canonical_json = json.dumps(payload, sort_keys=True, separators=(',', ':'))
        return hashlib.sha256(canonical_json.encode('utf-8')).hexdigest()

    @staticmethod
    def build_experiment_payload(
        manifest: Dict[str, Any],
        initial_skill: Dict[str, Any],
        final_skill: Dict[str, Any],
        benchmark_results: Dict[str, float],
        red_team_results: Dict[str, float],
        certification_status: str
    ) -> Dict[str, Any]:
        return {
            "manifest": manifest,
            "initial_skill": initial_skill,
            "final_skill": final_skill,
            "benchmark_results": benchmark_results,
            "red_team_results": red_team_results,
            "certification_status": certification_status,
            "registry": {
                "benchmark": manifest.get("benchmark_version", "BENCH-v1.3"),
                "red_team": manifest.get("red_team_version", "RT-v1.2"),
                "firewall": manifest.get("policy_version", "POLICY-v1.4")
            }
        }
