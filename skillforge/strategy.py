from typing import List, Dict, Any

class StrategySelector:
    def __init__(self):
        self.strategies = [
            "Safety Hardening",
            "Edge-Case Expansion",
            "Instruction Clarification",
            "Generalization",
            "Failure Recovery",
            "Minimal-Diff Optimization",
            "Adversarial Hardening"
        ]

    def select_strategy(self, failures: List[Dict[str, Any]]) -> str:
        if not failures:
            return "Minimal-Diff Optimization"
            
        # Get the most recent/severe failure
        primary_failure = failures[0]
        cat = primary_failure.get("category", "").lower()
        
        if "safety" in cat:
            return "Safety Hardening"
        elif "prompt_injection" in cat or "adversarial" in cat or "red_team" in cat:
            return "Adversarial Hardening"
        elif "edge_case" in cat or "edge case" in cat:
            return "Edge-Case Expansion"
        elif "constraint" in cat:
            return "Instruction Clarification"
        else:
            return "Failure Recovery"
