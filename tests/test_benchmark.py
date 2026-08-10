import pytest
from skillforge.benchmark import BenchmarkSuite
from skillforge.memory import SkillMemory
from skillforge.llm.gemini import GeminiLLM
from skillforge.models.skill import SkillDraft

def test_benchmark_persistence(tmp_path):
    db_path = tmp_path / "test.db"
    memory = SkillMemory(db_path)
    
    class DummyLLM:
        def generate(self, prompt):
            # Mock generating benchmark cases
            return '{"cases": [{"category": "Basic", "description": "t1", "expected_behavior": "e1"}]}'
            
    llm = DummyLLM()
    suite = BenchmarkSuite(llm, memory)
    
    class DummyTask:
        task_id = "test-task"
    
    # First call should generate and save
    cases1 = suite.get_or_create_cases(DummyTask())
    assert len(cases1) == 1
    assert cases1[0]["description"] == "t1"
    
    # Second call should retrieve the exact same cases without generating (we can test this by changing the mock)
    class TrapLLM:
        def generate(self, prompt):
            raise Exception("Should not be called")
            
    suite2 = BenchmarkSuite(TrapLLM(), memory)
    cases2 = suite2.get_or_create_cases(DummyTask())
    
    assert cases1 == cases2
