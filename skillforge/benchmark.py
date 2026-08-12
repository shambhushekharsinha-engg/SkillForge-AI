from pydantic import BaseModel
from typing import List, Dict
import json

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
        response = self.llm.generate_text(prompt)
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
        all_cases = []
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
            
            For each test case, structurally simulate the execution of the code. Compare the simulated outcome to the expected behavior.
            If the code successfully handles the case, assign "PASS". If it fails, assign "FAIL".
            
            Return ONLY a valid JSON list in this exact format, with one object per test case:
            {{
              "evaluations": [
                {{"description": "...", "status": "PASS", "evidence": "Why it passed..."}},
                {{"description": "...", "status": "FAIL", "evidence": "Why it failed..."}}
              ]
            }}
            """
            
            score = 0.0
            try:
                response = self.llm.generate_text(prompt)
                cleaned = response.replace('```json', '').replace('```', '').strip()
                data = json.loads(cleaned)
                
                evals = data.get("evaluations", []) if data else []
                
                pass_count = 0
                total = len(cat_cases) # Should be 5
                
                # Match evals back to original cases, ensuring we always process exactly `total` cases
                for idx in range(total):
                    c = cat_cases[idx]
                    is_pass = False
                    evidence = "LLM failed to return an evaluation for this case."
                    
                    if idx < len(evals):
                        ev = evals[idx]
                        is_pass = str(ev.get("status", "")).upper() == "PASS"
                        evidence = ev.get("evidence", "")
                        
                    if is_pass:
                        pass_count += 1
                        
                    all_cases.append({
                        "id": f"B-{(len(all_cases)+1):03d}",
                        "category": cat,
                        "description": c.get("description", ""),
                        "expected": c.get("expected_behavior", ""),
                        "status": "PASS" if is_pass else "FAIL",
                        "evidence": evidence
                    })
                
                # Deterministic scoring with LLM-assisted case evaluation
                score = pass_count / total if total > 0 else 0.0
            except Exception:
                # If there's an exception parsing, we must still pad the cases with FAILs
                total = len(cat_cases)
                for idx in range(total):
                    c = cat_cases[idx]
                    all_cases.append({
                        "id": f"B-{(len(all_cases)+1):03d}",
                        "category": cat,
                        "description": c.get("description", ""),
                        "expected": c.get("expected_behavior", ""),
                        "status": "FAIL",
                        "evidence": "Evaluation pipeline failed to process."
                    })
                score = 0.0
                
            results[cat] = score
                
        return {"scores": results, "cases": all_cases}
