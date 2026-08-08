from .models.task import TaskAnalysis
from .models.skill import SkillDraft
from .models.evaluation import CriticResult
from .models.safety import SafetyResult
from .llm.base import BaseLLM
from .config import config

class SkillRefiner:
    def __init__(self, llm: BaseLLM):
        self.llm = llm

    def refine(self, task: TaskAnalysis, draft: SkillDraft, critic_result: CriticResult, safety_result: SafetyResult) -> SkillDraft:
        prompt = f"""
        You are an expert AI agent skill engineer. Your previous skill draft needs refinement based on feedback.
        
        Original Task:
        {task.model_dump_json(indent=2)}
        
        Current Draft:
        {draft.model_dump_json(indent=2)}
        
        Critic Feedback:
        {critic_result.model_dump_json(indent=2)}
        
        Safety Violations & Requirements:
        {safety_result.model_dump_json(indent=2)}
        
        Please rewrite the skill to address all criticism and strictly adhere to all safety requirements.
        Output the complete, updated SkillDraft including the final markdown_content.
        """
        
        return self.llm.generate_structured(prompt, SkillDraft, temperature=config.TEMPERATURE_GENERATION)
