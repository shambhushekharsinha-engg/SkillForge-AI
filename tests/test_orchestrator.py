import pytest
import asyncio
from skillforge.orchestrator import EvolutionOrchestrator, EvolutionBudget
from skillforge.memory import SkillMemory

class DummyLLM:
    def generate(self, prompt):
        if "benchmark test cases" in prompt:
            return '{"cases": []}'
        return '{"evaluations": []}'

def test_orchestrator_compiles(tmp_path):
    db_path = tmp_path / "test3.db"
    memory = SkillMemory(db_path)
    llm = DummyLLM()
    orchestrator = EvolutionOrchestrator(llm, memory)
    
    budget = EvolutionBudget(max_generations=1, target_score=0.9)
    events = []
    
    # Mock out the generator and analyzer to avoid complex LLM mocking
    class DummyTaskAnalysis:
        task_id = "test-task"
        description = "desc"
        
    class DummySkillDraft:
        name = "test_skill"
        task_id = "test-task"
        markdown_content = "code"
        def model_dump_json(self):
            return "{}"
        def model_dump(self):
            return {}
        
    orchestrator.analyzer.analyze = lambda *args: DummyTaskAnalysis()
    orchestrator.generator.generate = lambda *args: DummySkillDraft()
    orchestrator.refiner.refine = lambda *args: DummySkillDraft()
    
    async def run_test():
        async for event in orchestrator.evolve("test-task", "desc", budget):
            events.append(event)
            
    asyncio.run(run_test())
        
    assert len(events) > 0
    assert events[0]["type"] == "generation_started"
