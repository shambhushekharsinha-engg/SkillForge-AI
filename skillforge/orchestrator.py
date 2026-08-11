from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import datetime

from .llm.gemini import GeminiLLM
from .analyzer import TaskAnalyzer
from .generator import SkillGenerator
from .refiner import SkillRefiner
from .memory import SkillMemory
from .safety.firewall import SkillFirewall, FirewallResult
from .benchmark import BenchmarkSuite
from .red_team import RedTeamArena, RedTeamReport
from .regression import RegressionSentinel, GenerationMetrics, GateResult
from .strategy import StrategySelector
from .versioning import VersionManager
from .models.skill import SkillDraft

class EvolutionRecord(BaseModel):
    experiment_id: str
    generation: int
    parent_version: Optional[int]
    candidate_version: int
    benchmark_scores: Dict[str, float]
    red_team_report: RedTeamReport
    firewall_result: FirewallResult
    regression_result: Optional[GateResult]
    failures: List[Dict[str, Any]]
    refinement_strategy: Optional[str]
    decision: str
    rejection_reason: Optional[str]
    timestamp: str

class EvolutionBudget(BaseModel):
    max_generations: int = 5
    target_score: float = 0.90
    minimum_safety: float = 1.00
    minimum_redteam: float = 0.90

class EvolutionOrchestrator:
    def __init__(self, llm: GeminiLLM, memory: SkillMemory):
        self.llm = llm
        self.memory = memory
        self.analyzer = TaskAnalyzer(llm)
        self.generator = SkillGenerator(llm)
        self.refiner = SkillRefiner(llm)
        self.firewall = SkillFirewall()
        self.benchmark = BenchmarkSuite(llm, memory)
        self.red_team = RedTeamArena(llm)
        self.regression = RegressionSentinel()
        self.strategy_selector = StrategySelector()
        self.version_manager = VersionManager(memory)

    async def evolve(self, task_id: str, description: str, budget: EvolutionBudget):
        experiment_id = f"SF-{datetime.datetime.now().strftime('%Y%m%d')}-EXP"
        
        yield {"type": "generation_started", "message": f"Starting experiment {experiment_id}", "generation": 1}
        
        task_analysis = self.analyzer.analyze(task_id, description)
        draft = self.generator.generate(task_analysis)
        
        current_version = self.version_manager.get_next_version(task_id)
        parent_version = None
        
        prev_metrics = None
        strategy = None
        
        for generation in range(1, budget.max_generations + 1):
            yield {"type": "firewall_started", "generation": generation}
            fw_res = self.firewall.evaluate(draft.markdown_content)
            yield {"type": "firewall_completed", "generation": generation, "payload": fw_res.model_dump()}
            
            if fw_res.decision == "BLOCKED":
                yield {"type": "evolution_failed", "reason": "FIREWALL_BLOCKED", "generation": generation}
                return
                
            yield {"type": "benchmark_started", "generation": generation}
            bm_res = self.benchmark.evaluate_skill(task_analysis, draft)
            yield {"type": "benchmark_completed", "generation": generation, "payload": bm_res}
            
            yield {"type": "redteam_started", "generation": generation}
            rt_res = self.red_team.evaluate(draft)
            yield {"type": "redteam_completed", "generation": generation, "payload": rt_res.model_dump()}
            
            # Compute metrics
            capability = sum(bm_res.values()) / len(bm_res) if bm_res else 0.0
            safety = bm_res.get("Safety", 0.0)
            
            # To compute failed_prior_passes, we'd need historical evals. Simplification for MVP: 0 unless modeled.
            failed_prior = 0 
            
            metrics = GenerationMetrics(
                capability=capability,
                safety=safety,
                generalization=bm_res.get("Edge Cases", 0.0),
                red_team=rt_res.defense_rate,
                failed_prior_passes=failed_prior
            )
            
            gate_res = None
            decision = "ACCEPTED"
            rejection_reason = None
            
            if prev_metrics:
                yield {"type": "regression_started", "generation": generation}
                gate_res = self.regression.evaluate(prev_metrics, metrics)
                yield {"type": "regression_evaluated", "generation": generation, "payload": gate_res.model_dump()}
                if not gate_res.accepted:
                    decision = "REJECTED"
                    rejection_reason = "; ".join(gate_res.reasons)
                    
            record = EvolutionRecord(
                experiment_id=experiment_id,
                generation=generation,
                parent_version=parent_version,
                candidate_version=current_version,
                benchmark_scores=bm_res,
                red_team_report=rt_res,
                firewall_result=fw_res,
                regression_result=gate_res,
                failures=[],
                refinement_strategy=strategy,
                decision=decision,
                rejection_reason=rejection_reason,
                timestamp=datetime.datetime.now().isoformat()
            )
            
            if decision == "ACCEPTED":
                yield {"type": "generation_accepted", "generation": generation, "payload": record.model_dump()}
                
                # Save as new version
                self.memory.save_skill(task_id, current_version, task_id, draft)
                self.memory.save_benchmark_results(task_id, current_version, bm_res)
                
                # Check convergence
                if capability >= budget.target_score and safety >= budget.minimum_safety and rt_res.defense_rate >= budget.minimum_redteam:
                    yield {"type": "evolution_completed", "reason": "TARGET_REACHED", "generation": generation}
                    return
                    
                prev_metrics = metrics
                parent_version = current_version
            else:
                yield {"type": "generation_rejected", "generation": generation, "payload": record.model_dump()}
                # Fallback to parent logic
                
            # Prepare next generation if budget not exhausted
            if generation < budget.max_generations:
                # Analyze failures
                failures = []
                for det in rt_res.details:
                    if not det['defended']:
                        failures.append({"category": "Red Team", "message": det['description']})
                for k, v in bm_res.items():
                    if v < 1.0:
                        failures.append({"category": k, "message": f"{k} scored {v}"})
                        
                strategy = self.strategy_selector.select_strategy(failures)
                yield {"type": "strategy_selected", "generation": generation, "payload": strategy}
                
                yield {"type": "refining_started", "generation": generation}
                # Use strategy in refinement
                class DummyCritic:
                    should_refine = True
                    feedback = f"Apply strategy: {strategy}. Failures: {failures}"
                
                # Mock safety auditor for the legacy refiner
                class DummySafety:
                    safe = True
                    
                draft = self.refiner.refine(task_analysis, draft, DummyCritic(), DummySafety())
                current_version = self.version_manager.get_next_version(task_id)
                yield {"type": "refinement_completed", "generation": generation}
                
        yield {"type": "evolution_completed", "reason": "BUDGET_EXHAUSTED", "generation": generation}
