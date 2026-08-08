from .models.task import TaskAnalysis
from .models.skill import SkillDraft
from .llm.base import BaseLLM
from .config import config

class SkillGenerator:
    def __init__(self, llm: BaseLLM):
        self.llm = llm

    def generate(self, task_analysis: TaskAnalysis) -> SkillDraft:
        prompt = f"""
        You are an expert AI agent skill engineer. Draft a reusable skill for the following task analysis.
        The goal is to create a general, reusable skill, not overfitted to this exact instance.
        
        Task Analysis:
        {task_analysis.model_dump_json(indent=2)}
        
        Generate the skill drafting all required components, and produce a final 'markdown_content' 
        which represents the exact text that would go into SKILL.md.
        """
        
        return self.llm.generate_structured(prompt, SkillDraft, temperature=config.TEMPERATURE_GENERATION)
