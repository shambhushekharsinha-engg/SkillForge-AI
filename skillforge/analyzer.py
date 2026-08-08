from typing import Type
from .models.task import TaskAnalysis
from .llm.base import BaseLLM

class TaskAnalyzer:
    def __init__(self, llm: BaseLLM):
        self.llm = llm

    def analyze(self, task_id: str, task_description: str) -> TaskAnalysis:
        prompt = f"""
        Analyze the following task description and break it down into structured components.
        Identify trigger conditions, required context, constraints, and the expected outcome.
        
        Task ID: {task_id}
        Task Description: {task_description}
        """
        
        return self.llm.generate_structured(prompt, TaskAnalysis)
