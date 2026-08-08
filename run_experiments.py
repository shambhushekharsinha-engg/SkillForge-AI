import json
import os
import time
from pathlib import Path
from skillforge.llm.gemini import GeminiLLM
from skillforge.analyzer import TaskAnalyzer
from skillforge.generator import SkillGenerator
from skillforge.critic import SkillCritic
from skillforge.safety import SafetyAuditor
from skillforge.refiner import SkillRefiner
from skillforge.evaluator import ProxyEvaluator
from skillforge.memory import SkillMemory
from skillforge.versioning import VersionManager
from skillforge.regression import RegressionProtector
from skillforge.config import config

def run_experiments():
    tasks_path = Path("evaluation/tasks/public_tasks.json")
    if not tasks_path.exists():
        print(f"Dataset not found at {tasks_path}")
        return

    with open(tasks_path, "r") as f:
        tasks = json.load(f)

    # Initialize components
    if not os.getenv("GEMINI_API_KEY"):
        os.environ["GEMINI_API_KEY"] = "dummy_key_for_testing"
        
    try:
        llm = GeminiLLM()
    except Exception as e:
        print(f"Error initializing LLM: {e}")
        return

    analyzer = TaskAnalyzer(llm)
    generator = SkillGenerator(llm)
    critic = SkillCritic(llm)
    auditor = SafetyAuditor(llm)
    refiner = SkillRefiner(llm)
    evaluator = ProxyEvaluator(llm)
    memory = SkillMemory()
    version_manager = VersionManager(memory)
    regression_protector = RegressionProtector(memory)

    print(f"Starting experiments on {len(tasks)} tasks...\n")
    
    for i, t in enumerate(tasks):
        print(f"--- Task {i+1}/{len(tasks)}: {t['task_id']} ---")
        
        # We wrap in try-except in a real scenario, but here we just trace logic
        print("  -> Analyzing task...")
        task_analysis = analyzer.analyze(t['task_id'], t['description'])
        
        print("  -> Drafting skill...")
        draft = generator.generate(task_analysis)
        
        print("  -> Critiquing & Safety Check...")
        critic_res = critic.critique(draft)
        safety_res = auditor.audit(task_analysis, draft)
        
        print("  -> Evaluating Lift...")
        eval_res = evaluator.evaluate(task_analysis, draft)
        print(f"     [Lift: {eval_res.lift:.2f}]")
        
        print("  -> Committing to memory...")
        skill_id = draft.name.lower().replace(" ", "_")
        version = version_manager.get_next_version(skill_id)
        is_reg, msg = regression_protector.check_regression(eval_res, version)
        if not is_reg:
            memory.save_skill(skill_id, version, t['task_id'], draft)
            memory.save_evaluation(eval_res, version)
        
        print("  -> Completed.")
        print()
        
        # Respect free-tier rate limits between tasks
        time.sleep(5)

    print("Experiment run finished.")

if __name__ == "__main__":
    run_experiments()
