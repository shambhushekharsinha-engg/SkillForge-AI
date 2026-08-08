from typing import List
from ..models.task import TaskAnalysis
from ..models.skill import SkillDraft

class ScopeValidator:
    def validate(self, task: TaskAnalysis, skill: SkillDraft) -> List[str]:
        violations = []
        
        # Simple heuristic: Does the skill mention tools or domains completely outside the task context?
        # A full implementation would compare requested permissions vs used permissions.
        # For now, we stub this out as a placeholder for the multi-layer architecture.
        
        # Example check: if task requires reading emails, but skill writes to databases
        task_text = f"{task.description} {' '.join(task.required_context)}".lower()
        skill_text = skill.markdown_content.lower()
        
        if "sql" in skill_text and "sql" not in task_text and "database" not in task_text:
             violations.append("Scope violation: Skill attempts database operations not mentioned in task.")
             
        return violations
