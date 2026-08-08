from .models.skill import SkillDraft
from .models.evaluation import CriticResult
from .llm.base import BaseLLM
from .config import config

class SkillCritic:
    def __init__(self, llm: BaseLLM):
        self.llm = llm

    def critique(self, skill_draft: SkillDraft) -> CriticResult:
        prompt = f"""
        You are an expert AI agent skill critic. Your job is to strictly evaluate the following skill draft.
        Evaluate it on:
        1. Capability: Does it actually solve the task? Are instructions actionable and highly specific?
        2. Reliability: Does it include verification? What happens when operations fail? You MUST penalize skills heavily if they do not explicitly handle edge cases (e.g., timezone differences, missing data, API rate limits).
        3. Generalization: Is it overfitted to one example, or does it encode a robust, reusable workflow?
        
        Skill Draft:
        {skill_draft.model_dump_json(indent=2)}
        
        Provide scores between 0.0 and 1.0. List specific issues and improvements.
        If the skill needs major changes, set 'should_refine' to true.
        """
        
        return self.llm.generate_structured(prompt, CriticResult, temperature=config.TEMPERATURE_CRITIC)
