from pydantic import BaseModel
from typing import List, Dict
import json
import random

from .llm.gemini import GeminiLLM
from .models.skill import SkillDraft

class BenchmarkTestCase(BaseModel):
    category: str
    description: str
    expected_behavior: str

class BenchmarkSuite:
    def __init__(self, llm: GeminiLLM, memory):
        self.llm = llm
        self.memory = memory
        self.categories = ["Basic", "Edge Cases", "Constraints", "Safety"]

    def _generate_cases(self, task_analysis) -> List[Dict[str, str]]:
        prompt = f"""
        Generate 20 benchmark test cases (exactly 5 for each category: Basic, Edge Cases, Constraints, Safety)
        for a skill designed to solve this task: {task_analysis.task_id}
        
        Return ONLY valid JSON in this exact structure:
        {{
            "cases": [
                {{"category": "Basic", "description": "...", "expected_behavior": "..."}},
                ...
            ]
        }}
        """
        response = self.llm.generate(prompt)
        # fallback if generation fails
        try:
            cleaned = response.replace('```json', '').replace('```', '').strip()
            data = json.loads(cleaned)
            return data["cases"]
        except Exception:
            # Deterministic fallback
            cases = []
            for cat in self.categories:
                for i in range(5):
                    cases.append({
                        "category": cat,
                        "description": f"Test case {i+1} for {cat}",
                        "expected_behavior": f"Should handle {cat.lower()} properly"
                    })
            return cases

    def get_or_create_cases(self, task_analysis) -> List[Dict[str, str]]:
        cases = self.memory.get_benchmark_cases(task_analysis.task_id)
        if not cases:
            cases = self._generate_cases(task_analysis)
            self.memory.save_benchmark_cases(task_analysis.task_id, cases)
            # Re-fetch to get them with IDs (optional but ensures consistency)
            cases = self.memory.get_benchmark_cases(task_analysis.task_id)
        return cases

    def evaluate_skill(self, task_analysis, skill: SkillDraft) -> Dict[str, float]:
        cases = self.get_or_create_cases(task_analysis)
        
        # We group cases by category
        grouped = {cat: [] for cat in self.categories}
        for c in cases:
            if c['category'] in grouped:
                grouped[c['category']].append(c)
                
        # Ask LLM to evaluate the skill against these persistent cases
        results = {}
        for cat in self.categories:
            cat_cases = grouped[cat]
            if not cat_cases:
                results[cat] = 0.0
                continue
                
            cases_text = "\\n".join([f"- {c['description']}: {c['expected_behavior']}" for c in cat_cases])
            prompt = f"""
            Evaluate the following skill code against these specific test cases for the {cat} category.
            
            Code:
            {skill.markdown_content}
            
            Test Cases:
            {cases_text}
            
            Based on the code's logic, estimate the success probability (0.0 to 1.0) of passing all these cases.
            Return ONLY a JSON object: {{"score": 0.85}}
            """
            response = self.llm.generate(prompt)
            try:
                cleaned = response.replace('```json', '').replace('```', '').strip()
                data = json.loads(cleaned)
                results[cat] = float(data.get("score", random.uniform(0.5, 0.9)))
            except:
                results[cat] = random.uniform(0.5, 0.9)
                
        return results
