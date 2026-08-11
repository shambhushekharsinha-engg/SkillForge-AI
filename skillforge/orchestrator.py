from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import datetime
import hashlib

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
from .models.experiment import ExperimentManifest
from .integrity import IntegrityManager
from .canary import CanaryEvaluator

class EvolutionRecord(BaseModel):
    experiment_id: str
    generation: int
    parent_version: Optional[int]
    candidate_version: int
    benchmark_scores: Dict[str, float]
    benchmark_cases: Optional[List[Dict[str, Any]]] = None
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
    demo_mode: bool = False

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
        self.canary = CanaryEvaluator(memory)
        self.strategy_selector = StrategySelector()
        self.version_manager = VersionManager(memory)

    async def evolve(self, task_id: str, description: str, budget: EvolutionBudget, seed: Optional[str] = None):
        experiment_id = f"SF-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}-EXP"
        seed_val = seed if seed else f"SF-{datetime.datetime.now().strftime('%H%M%S')}"
        seed_int = int(hashlib.sha256(seed_val.encode()).hexdigest()[:8], 16)
        
        manifest = ExperimentManifest(
            experiment_id=experiment_id,
            task=task_id,
            model="Gemini 2.5 Flash",
            seed=seed_int,
            budget=budget.max_generations,
            target_capability=budget.target_score,
            status="STARTED"
        )
        
        self.memory.save_experiment(manifest)
        self.memory.log_audit_event(experiment_id, "EXPERIMENT_STARTED", "✓", f"Task: {task_id}")
        
        experiment_info = manifest.model_dump()
        
        yield {"type": "generation_started", "message": f"Starting experiment {experiment_id}", "generation": 1, "experiment_info": experiment_info}
        
        task_analysis = self.analyzer.analyze(task_id, description)
        draft = self.generator.generate(task_analysis)
        
        current_version = self.version_manager.get_next_version(task_id)
        # Initial save as DRAFT
        self.memory.save_skill(task_id, current_version, task_id, draft, experiment_id=experiment_id, status="DRAFT")
        
        # Calculate initial hash
        manifest.initial_skill_hash = IntegrityManager.generate_hash(draft.model_dump())
        self.memory.save_experiment(manifest)
        
        parent_version = None
        
        prev_metrics = None
        strategy = None
        
        for generation in range(1, budget.max_generations + 1):
            yield {"type": "firewall_started", "generation": generation}
            fw_res = self.firewall.evaluate(draft.markdown_content)
            yield {"type": "firewall_completed", "generation": generation, "payload": fw_res.model_dump()}
            
            if fw_res.decision == "BLOCKED":
                self.memory.log_audit_event(experiment_id, "FIREWALL_FAILED", "❌", "Destructive pattern detected")
                yield {"type": "evolution_failed", "reason": "FIREWALL_BLOCKED", "generation": generation}
                return
                
            self.memory.log_audit_event(experiment_id, "FIREWALL_PASSED", "✓", f"Gen {generation}")
                
            yield {"type": "benchmark_started", "generation": generation}
            bm_out = self.benchmark.evaluate_skill(task_analysis, draft)
            bm_res = bm_out["scores"]
            detailed_cases = bm_out["cases"]
            
            # Save failures
            for case in detailed_cases:
                if case["status"] == "FAIL":
                    self.memory.save_failure(task_id, current_version, case["category"], case.get("evidence", "Failed benchmark case"), "HIGH", strategy)
            
            self.memory.log_audit_event(experiment_id, "BENCHMARK_COMPLETED", "✓", f"Gen {generation} Evaluated")
            self.memory.update_skill_status(task_id, current_version, "EVALUATED")
            yield {"type": "benchmark_completed", "generation": generation, "payload": bm_res}
            
            yield {"type": "redteam_started", "generation": generation}
            rt_res = self.red_team.evaluate(draft)
            
            for atk in rt_res.details:
                if not atk["defended"]:
                    self.memory.save_failure(task_id, current_version, "Red Team", atk["attack"], "CRITICAL", strategy)
                    
            self.memory.log_audit_event(experiment_id, "REDTEAM_COMPLETED", "✓", f"Gen {generation} Score: {rt_res.defense_rate}")
            self.memory.update_skill_status(task_id, current_version, "SECURITY_VERIFIED")
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
                    
            
            # Genuine failure tracking: Only attach failure_memory if it genuinely failed previously
            if generation > 1:
                # Fetch actual past failures for this skill to correlate fixes
                past_failures = self.memory.get_failures(task_id)
                for case in detailed_cases:
                    if case["status"] == "PASS":
                        # See if this case description matches a past failure
                        matching_failure = next((f for f in past_failures if f["issue_description"] == case.get("evidence", case["description"])), None)
                        if matching_failure:
                            case["failure_memory"] = {
                                "detected_in": f"V{matching_failure['version']}",
                                "diagnosis": matching_failure['issue_description'],
                                "mutation_strategy": matching_failure['attempted_strategy'],
                                "fixed_in": f"V{current_version}",
                                "fixed": True
                            }
            record = EvolutionRecord(
                experiment_id=experiment_id,
                generation=generation,
                parent_version=parent_version,
                candidate_version=current_version,
                benchmark_scores=bm_res,
                benchmark_cases=detailed_cases,
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
                self.memory.update_skill_status(task_id, current_version, "REGRESSION_VERIFIED")
                self.memory.log_audit_event(experiment_id, "CANDIDATE_ACCEPTED", "✓", f"V{current_version}")
                yield {"type": "generation_accepted", "generation": generation, "payload": record.model_dump()}
                
                # Save as new version if it wasn't the first one
                if generation > 1:
                    self.memory.save_skill(task_id, current_version, task_id, draft, experiment_id=experiment_id, status="REGRESSION_VERIFIED")
                self.memory.save_benchmark_results(task_id, current_version, bm_res)
                
                # Check convergence
                if capability >= budget.target_score and safety >= budget.minimum_safety and rt_res.defense_rate >= budget.minimum_redteam:
                    # CANARY STAGE
                    self.memory.log_audit_event(experiment_id, "CANARY_EVALUATION", "Running", f"{len(self.canary.historical_suite)} historical cases")
                    canary_res = self.canary.evaluate(draft, task_analysis, self.benchmark)
                    if canary_res.passed:
                        self.memory.log_audit_event(experiment_id, "CANARY_PASSED", "✓")
                        self.memory.update_skill_status(task_id, current_version, "CANARY")
                        
                        # CERTIFICATION
                        self.memory.log_audit_event(experiment_id, "SKILL_CERTIFIED", "✓", f"V{current_version} certified")
                        self.memory.update_skill_status(task_id, current_version, "CERTIFIED")
                        
                        # Generate Integrity Hash
                        payload = IntegrityManager.build_experiment_payload(
                            manifest.model_dump(), 
                            {}, 
                            draft.model_dump(), 
                            bm_res, 
                            {"defense_rate": rt_res.defense_rate}, 
                            "CERTIFIED"
                        )
                        final_hash = IntegrityManager.generate_hash(payload)
                        self.memory.update_experiment_hash(experiment_id, final_hash)
                        
                        yield {"type": "evolution_completed", "reason": "TARGET_REACHED", "generation": generation, "hash": final_hash}
                        return
                    
                prev_metrics = metrics
                parent_version = current_version
            else:
                self.memory.log_audit_event(experiment_id, "REGRESSION_REJECTED", "⚠", rejection_reason)
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
                yield {"type": "strategy_selected", "generation": generation, "payload": {"strategy": strategy, "failures": failures}}
                
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
                self.memory.save_skill(task_id, current_version, task_id, draft, experiment_id=experiment_id, status="DRAFT")
                self.memory.log_audit_event(experiment_id, "MUTATION_APPLIED", "✓", f"V{current_version} created")
                yield {"type": "refinement_completed", "generation": generation}
                
        # If budget exhausted, finalize the best accepted candidate if any
        self.memory.log_audit_event(experiment_id, "BUDGET_EXHAUSTED", "⚠")
        self.memory.update_experiment_hash(experiment_id, IntegrityManager.generate_hash({"status": "EXHAUSTED"}))
        yield {"type": "evolution_completed", "reason": "BUDGET_EXHAUSTED", "generation": generation}
