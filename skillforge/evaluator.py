from .models.task import TaskAnalysis
from .models.skill import SkillDraft
from .models.evaluation import EvaluationResult
from .llm.base import BaseLLM
from pydantic import BaseModel, Field

class EvaluatorPrediction(BaseModel):
    baseline_success_probability: float = Field(..., ge=0.0, le=1.0)
    skilled_success_probability: float = Field(..., ge=0.0, le=1.0)
    reasoning: str

class ProxyEvaluator:
    """
    A local proxy evaluation system that measures Lift using an LLM-as-a-judge
    to predict the success rate of a generic agent with vs. without the skill.
    """
    def __init__(self, llm: BaseLLM):
        self.llm = llm

    def evaluate(self, task: TaskAnalysis, skill: SkillDraft) -> EvaluationResult:
        prompt = f"""
        You are a neutral evaluation engine (LLM-as-a-judge) for the SkillsBench competition.
        Predict the probability (0.0 to 1.0) of a generic, capable AI agent completing the following task under two conditions:
        1. BASELINE: The agent has NO skill instructions, just the raw task description.
        2. SKILLED: The agent is equipped with the provided SKILL DRAFT.
        
        Task:
        {task.model_dump_json(indent=2)}
        
        Skill Draft:
        {skill.model_dump_json(indent=2)}
        
        Provide reasonable empirical probabilities. A generic task might have a 0.3 baseline, and a good skill might raise it to 0.9. A bad skill might lower it.
        """
        
        prediction = self.llm.generate_structured(prompt, EvaluatorPrediction, temperature=0.1)
        
        lift = prediction.skilled_success_probability - prediction.baseline_success_probability
        
        return EvaluationResult(
            skill_id=skill.name.lower().replace(" ", "_") if skill.name else "unknown_skill",
            task_id=task.task_id,
            baseline_score=prediction.baseline_success_probability,
            skilled_score=prediction.skilled_success_probability,
            lift=lift,
            feedback=prediction.reasoning
        )
