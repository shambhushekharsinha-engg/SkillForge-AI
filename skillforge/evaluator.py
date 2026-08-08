from .models.task import TaskAnalysis
from .models.skill import SkillDraft
from .models.evaluation import EvaluationResult

class ProxyEvaluator:
    """
    A local proxy evaluation system that measures Lift by comparing 
    task execution with a Baseline Agent vs. a Skilled Agent.
    """
    def __init__(self):
        # In a real environment, this would initialize Sandboxes or mock endpoints
        pass

    def evaluate(self, task: TaskAnalysis, skill: SkillDraft) -> EvaluationResult:
        # Mocking the baseline agent execution
        baseline_score = self._run_baseline(task)
        
        # Mocking the skilled agent execution
        skilled_score = self._run_skilled(task, skill)
        
        # Calculate lift
        lift = skilled_score - baseline_score
        
        feedback = "Skill successfully executed and improved performance." if lift > 0 else "Skill failed to improve over baseline."
        
        return EvaluationResult(
            skill_id=skill.name.lower().replace(" ", "_"),
            task_id=task.task_id,
            baseline_score=baseline_score,
            skilled_score=skilled_score,
            lift=lift,
            feedback=feedback
        )

    def _run_baseline(self, task: TaskAnalysis) -> float:
        # Simulate an agent trying to solve the task WITHOUT the skill.
        # Often this will fail or be slow.
        return 0.35 # Dummy score

    def _run_skilled(self, task: TaskAnalysis, skill: SkillDraft) -> float:
        # Simulate an agent trying to solve the task WITH the generated skill.
        # Ideally this is much higher.
        return 0.85 # Dummy score
