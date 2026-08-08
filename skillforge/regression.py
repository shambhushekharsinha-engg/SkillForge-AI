from typing import List, Dict, Any, Tuple
from .memory import SkillMemory
from .models.evaluation import EvaluationResult

class RegressionProtector:
    def __init__(self, memory: SkillMemory):
        self.memory = memory

    def check_regression(self, new_eval: EvaluationResult, current_version: int) -> Tuple[bool, str]:
        """
        Checks if the newly evaluated skill version regresses compared to previous versions.
        Returns a tuple: (is_regression, message).
        """
        history = self.memory.get_evaluations_for_skill(new_eval.skill_id)
        
        # If there's no history (other than potentially this one), it's not a regression
        past_evals = [e for e in history if e['version'] < current_version]
        
        if not past_evals:
            return False, "First version, no regression baseline."
            
        # Find the max lift in history
        best_past_lift = max(e['lift'] for e in past_evals)
        
        if new_eval.lift < best_past_lift:
            msg = f"Regression detected: New lift ({new_eval.lift:.2f}) is worse than best past lift ({best_past_lift:.2f})."
            return True, msg
            
        return False, "No regression. Lift improved or maintained."
