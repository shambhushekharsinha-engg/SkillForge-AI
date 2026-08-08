from pydantic import BaseModel, Field
from typing import Optional, List

class SkillDraft(BaseModel):
    name: str
    description: str
    trigger_conditions: List[str]
    required_context: List[str]
    procedure: List[str]
    verification_steps: List[str]
    failure_handling: List[str]
    safety_constraints: List[str]
    examples: List[str]
    markdown_content: str = Field(description="The complete SKILL.md content")
