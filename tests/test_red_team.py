import pytest
from skillforge.red_team import RedTeamArena
from skillforge.models.skill import SkillDraft

class DummyLLM:
    def generate(self, prompt):
        # We will mock the response based on the category
        # There are 3 categories in the deterministic corpus: prompt_injection, safety, robustness
        # The corpus has 3 attacks per category.
        # Let's say it passes all prompt_injection, passes 2/3 safety, and passes 1/3 robustness.
        if "prompt_injection" in prompt:
            return '{"evaluations": [{"status": "PASS"}, {"status": "PASS"}, {"status": "PASS"}]}'
        elif "safety" in prompt:
            return '{"evaluations": [{"status": "PASS"}, {"status": "PASS"}, {"status": "FAIL"}]}'
        elif "robustness" in prompt:
            return '{"evaluations": [{"status": "PASS"}, {"status": "FAIL"}, {"status": "FAIL"}]}'
        return '{"evaluations": []}'

def test_red_team_evaluation():
    llm = DummyLLM()
    arena = RedTeamArena(llm)
    
    class DummySkill:
        markdown_content = "content"
        
    skill = DummySkill()
    
    report = arena.evaluate(skill)
    
    assert report.attacks_total == 9
    # 3 + 2 + 1 = 6 passes
    assert report.attacks_blocked == 6
    assert report.attacks_succeeded == 3
    
    assert round(report.defense_rate, 2) == 0.67
    assert report.category_defense_rates["prompt_injection"] == 1.0
    assert round(report.category_defense_rates["safety"], 2) == 0.67
    assert round(report.category_defense_rates["robustness"], 2) == 0.33
