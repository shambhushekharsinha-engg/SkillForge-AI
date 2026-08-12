import pytest
from skillforge.benchmark import BenchmarkSuite
from skillforge.memory import SkillMemory
from skillforge.llm.gemini import GeminiLLM
from skillforge.models.skill import SkillDraft

def test_benchmark_persistence(tmp_path):
    db_path = tmp_path / "test.db"
    memory = SkillMemory(db_path)
    
    class DummyLLM:
        def generate_text(self, prompt, temperature=0.7):
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
        def generate_text(self, prompt, temperature=0.7):
            raise Exception("Should not be called")
            
    suite2 = BenchmarkSuite(TrapLLM(), memory)
    cases2 = suite2.get_or_create_cases(DummyTask())
    
    assert cases1 == cases2


def test_deterministic_evaluation(tmp_path):
    db_path = tmp_path / "test2.db"
    memory = SkillMemory(db_path)
    
    class DummySkillDraft:
        name = "test_skill"
        task_id = "test-task"
        markdown_content = "code"
        def model_dump_json(self):
            return "{}"
        def model_dump(self):
            return {}
    
    class DummyTask:
        task_id = "test-eval-task"
        
    class DummySkill:
        markdown_content = "def test(): pass"
    
    # Pre-populate memory with 5 cases for 'Basic' category
    cases = []
    for i in range(5):
        cases.append({"category": "Basic", "description": f"t{i}", "expected_behavior": f"e{i}"})
    memory.save_benchmark_cases("test-eval-task", cases)
    
    # Test 1: 5 PASS -> 1.0
    class LLM5Pass:
        def generate_text(self, prompt, temperature=0.7):
            return '{"evaluations": [{"status": "PASS"}, {"status": "PASS"}, {"status": "PASS"}, {"status": "PASS"}, {"status": "PASS"}]}'
            
    suite = BenchmarkSuite(LLM5Pass(), memory)
    res = suite.evaluate_skill(DummyTask(), DummySkill())
    assert res["scores"]["Basic"] == 1.0

    # Test 2: 3 PASS + 2 FAIL -> 0.6
    class LLM3Pass:
        def generate_text(self, prompt, temperature=0.7):
            return '{"evaluations": [{"status": "PASS"}, {"status": "FAIL"}, {"status": "PASS"}, {"status": "FAIL"}, {"status": "PASS"}]}'
            
    suite = BenchmarkSuite(LLM3Pass(), memory)
    res2 = suite.evaluate_skill(DummyTask(), DummySkill())
    assert res2["scores"]["Basic"] == 0.6

    # Test 3: all FAIL -> 0.0
    class LLMAllFail:
        def generate_text(self, prompt, temperature=0.7):
            return '{"evaluations": [{"status": "FAIL"}, {"status": "FAIL"}, {"status": "FAIL"}, {"status": "FAIL"}, {"status": "FAIL"}]}'
            
    suite = BenchmarkSuite(LLMAllFail(), memory)
    res = suite.evaluate_skill(DummyTask(), DummySkill())
    assert res["scores"]["Basic"] == 0.0

    # Test 4: malformed JSON -> 0.0
    class LLMMalformed:
        def generate_text(self, prompt, temperature=0.7):
            return '{"evaluations": [{"status": "PA'
            
    suite = BenchmarkSuite(LLMMalformed(), memory)
    res = suite.evaluate_skill(DummyTask(), DummySkill())
    assert res["scores"]["Basic"] == 0.0

    # Test 5: invalid status -> treated as FAIL
    class LLMInvalidStatus:
        def generate_text(self, prompt, temperature=0.7):
            return '{"evaluations": [{"status": "PASS"}, {"status": "KINDA"}, {"status": "YES"}, {"status": "PASS"}, {"status": "FAIL"}]}'
            
    suite = BenchmarkSuite(LLMInvalidStatus(), memory)
    res = suite.evaluate_skill(DummyTask(), DummySkill())
    assert res["scores"]["Basic"] == 0.4  # 2 PASS

    # Test 6: wrong number of results (e.g. 2 results returned for 5 cases)
    class LLMWrongNum:
        def generate_text(self, prompt, temperature=0.7):
            return '{"evaluations": [{"status": "PASS"}, {"status": "PASS"}]}'
            
    suite = BenchmarkSuite(LLMWrongNum(), memory)
    res = suite.evaluate_skill(DummyTask(), DummySkill())
    assert res["scores"]["Basic"] == 0.4  # 2 passes / 5 total cases = 0.4

    # Test 7: no benchmark cases -> 0.0
    # Create a task with no cases in memory, which will trigger generation
    class EmptyLLM:
        def generate_text(self, prompt, temperature=0.7):
            if "Generate 20 benchmark test cases" in prompt:
                return '{"cases": []}' # Generate 0 cases
            return '{"evaluations": []}'
            
    suite = BenchmarkSuite(EmptyLLM(), memory)
    class DummyTaskEmpty:
        task_id = "empty-task"
    res = suite.evaluate_skill(DummyTaskEmpty(), DummySkill())
    assert res["scores"]["Basic"] == 0.0
