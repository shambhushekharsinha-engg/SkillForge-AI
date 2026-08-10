# SkillForge-AI: Empirical Self-Improvement for Safe Agent Skills

## 1. The Problem: The Unmeasured Cost of Skills

In the rapidly evolving landscape of applied artificial intelligence, agent skills have emerged as one of the most critical abstractions for extending reasoning and executing complex workflows. By encapsulating instructions, reference material, and execution scripts into modular folders, developers can dramatically extend an agent’s capabilities beyond its foundational training. However, the proliferation of self-authored and dynamically generated skills introduces profound systemic instability. While highly curated, human-verified skills measurably lift task performance across evaluation suites, self-authored skills exhibit a highly volatile impact. They can silently degrade an agent’s capabilities, induce catastrophic safety violations, or introduce regressions in previously solved tasks. 

The fundamental issue across the ecosystem is that a skill is traditionally treated as a static artifact rather than a measurable, evolvable, and falsifiable scientific hypothesis. When an agent succeeds at a complex workflow, the attribution problem remains unsolved: was the success a result of the foundational model's zero-shot reasoning, or did the injected skill actually scaffold the solution? The SkillsBench evaluation framework exposed this reality. Across eighty-four expert tasks, curated skills lifted pass rates by an average of sixteen percentage points. Yet, nearly a quarter of those tasks saw performance regressions, and skills written autonomously by models for themselves resulted in a net negative lift. 

Skill creation is not computationally or operationally free. It carries a heavy burden of reliability and safety. If we cannot quantitatively prove that a generated skill improves performance without crossing strict safety boundaries, the skill itself is a liability. 

We built SkillForge-AI to bring empirical, quantitative rigor to the process of skill generation. By treating skill authoring as an iterative scientific process governed by a rigorous evolutionary loop, SkillForge-AI transforms the unpredictable art of prompting into a deterministic, observable optimization problem.

## 2. Our Approach: The Fail-Fast Evolution Loop

We purposefully chose to compete in Track Two for Meta-Skills of the BenchFlow Skill Lift hackathon. The core of our submission is a Meta-Skill that fundamentally rewrites how the Benchflow Agent authors and refines other skills. Rather than relying on a zero-shot, single-pass generation attempt, our meta-skill instructs the agent to follow a highly structured, multi-stage evolutionary lifecycle for every skill it attempts to write. This lifecycle is designed to enforce quality, ensure structural compliance, and absolutely guarantee safety through a strict fail-fast gate.

The evolutionary loop consists of the following six sequential stages.

First, the Generate stage begins the process with the synthesis of an initial candidate skill. The agent is instructed to perform a deep contextual analysis of the target task, the sandbox environment, and the ultimate objective. It identifies the exact required capabilities. The agent then drafts a structurally compliant skill document, meticulously filling out the necessary frontmatter, defining explicit execution triggers, and drafting a concrete, step-by-step procedural guide. This initial draft is explicitly treated as an unverified hypothesis.

Second, in the Critique stage, before any external testing occurs, the agent is forced to step out of its generative role and assume the persona of a harsh, adversarial critic. It self-evaluates the draft against the original task requirements. The critique phase specifically looks for unhandled edge cases, vague instructions that could lead to non-deterministic execution, missing constraints, and semantic clarity. The agent is forced to explicitly list out the weaknesses of its own draft and propose concrete, targeted refinements that will address these gaps.

Third is the Safety Audit, which acts as a Fail-Fast Gate. This is the most critical stage of the SkillForge-AI pipeline. We recognized early on that capability optimization is entirely irrelevant if the resulting skill is unsafe. We implemented a strict, non-negotiable safety audit modeled directly on the ClawsBench safety criteria. The agent evaluates the skill draft for potential violations across four distinct risk vectors. Destructive Actions ensure the skill does not delete or overwrite critical files without explicit user intent. Confidentiality Breaches prevent exfiltrating or exposing private keys. Unauthorized Permissions block privilege escalation, and Sandbox Escapes prevent attempts to bypass environment restrictions. If a skill violates any of these principles, it triggers a Fail-Fast response. The progression of the skill is completely halted. The agent is forced to completely rewrite the offending sections of the procedure to strictly forbid those actions, embedding explicit prohibition constraints directly into the generated Markdown text.

Fourth is the Evaluate stage. Once the conceptual safety and capability checks are complete, the agent executes our locally provided benchmark utility. This Python script performs deterministic structural and heuristic verification. It ensures the frontmatter is valid, the requisite sections exist, and it scans the generated Markdown for risky keywords to ensure they are adequately bracketed by safety guardrails. This script does not rely on external programming interfaces; it is fully deterministic and executes cleanly within the restricted BenchFlow sandbox.

Fifth, during the Refine stage, armed with the adversarial critique, the mandatory safety guardrails from the fail-fast gate, and the deterministic feedback from the evaluation script, the agent applies targeted improvements. It synthesizes a highly refined version of the skill. Unlike blind prompt regeneration, this refinement is surgically applied only to the areas identified as weak or unsafe.

Finally, in the Re-evaluate stage, the new skill is pushed through the evaluation cycle once more. The agent ensures that the finalized skill demonstrates measurable qualitative improvement over the original draft and that all safety constraints remain strictly intact.

## 3. Meta-Skill Architecture and Design Rationale

The architecture of our submission was meticulously designed to comply with the stringent requirements of the BenchFlow evaluation harness. Our submission contains a minimalist, self-contained, but highly constrained Meta-Skill. 

The central nervous system of our submission is the Markdown file within the skillforge-meta directory. This is not a passive document; it is an active, executable instruction manual for the frontier model acting as the Benchflow Agent. We deliberately designed the meta-prompt to avoid relying on external services, private keys, or hidden cloud infrastructure. By forcing the evaluating frontier model to act as its own strictest critic, we ensure that our meta-skill is completely self-contained and universally executable across any model panel the organizers choose to employ. The meta-prompt enforces the multi-stage evolution loop outlined above, turning the agent into an autonomous skill-optimizing factory.

Accompanying the meta-prompt is a deterministic local Python script. Early in development, we experimented with using secondary model calls for evaluation. However, recognizing the restricted nature of the private BenchFlow evaluation sandbox and the risks of external dependency, we pivoted to a purely deterministic, heuristic approach for the submission artifact. The script uses regular expressions and static string analysis to verify structural compliance and detect hazardous keywords. The agent is instructed via the meta-prompt to execute this script and parse its output as a mandatory condition for finalizing a skill. This hybrid approach maximizes reliability while remaining safely within sandbox constraints.

## 4. Evidence-Driven Optimization: The SkillForge-AI Platform

To design, calibrate, and prove the efficacy of our meta-skill submission, we developed a comprehensive internal application platform. While this platform is not included in the submission file as per competition rules, it served as our primary development and regression instrument, and it forms the empirical foundation of our approach.

One of the core challenges in developing a meta-skill is proving that the refinement loop actually works. If the first iteration and the second iteration are evaluated against different criteria, the comparison is invalid. To solve this, we implemented a persistent, task-specific benchmark suite built on top of a local relational database. 

For every task we tested during development, our platform generated and persisted exactly twenty distinct benchmark test cases across four categories. Basic Execution tests if the skill handles the optimal path correctly. Edge Cases tests if the skill gracefully handles unexpected inputs or missing environment variables. Constraints tests if the skill adheres to specific formatting or procedural requirements. Finally, Safety tests if the skill explicitly avoids dangerous operations.

During the evolution loop, every skill mutation was scored against this exact same suite of twenty test cases. This allowed us to measure true percentage-point lift. For example, if the initial draft scored seventy-five percent on edge cases and the refined draft scored ninety percent, we had quantitative proof of a fifteen percent lift. This empirical rigor allowed us to tune our meta-skill prompt until we consistently observed positive lift across diverse task domains.

Because skill evolution is not strictly monotonic and sometimes a refinement introduces a regression, we built an append-only versioning system into our platform. Every iteration of a skill is saved as an immutable record. If a third iteration scores lower than the second iteration on our internal benchmarks, the system can instantly roll back to the previous state, creating a new iteration derived explicitly from the known-good state. This lineage tracking proved invaluable for identifying which meta-prompt instructions were causing performance regressions.

## 5. Safety as a First-Class Citizen

The Skill Lift hackathon rules explicitly state that safety violations can drive a task's score negative, potentially as low as negative one. A critical safety violation, such as a destructive action, a confidentiality breach, or an unauthorized permission change, will override the task score regardless of capability. In short, capability you cannot get safely is worth less than nothing.

Because of this, safety is the absolute strongest component of the SkillForge-AI architecture. We enforce the competition’s defining principle: Never optimize capability at the expense of safety.

Our meta-skill enforces this through the Fail-Fast Gate. When the agent critiques a skill, it does not just look for bugs; it actively hunts for vulnerabilities. If a candidate skill for a file-management task casually suggests using a destructive command to clean up a directory, the safety audit catches it. The pipeline does not merely flag the issue; it forces a rewrite. The agent must inject explicit prohibition constraints into the document it is generating. 

For example, a refined skill will explicitly state that under no circumstances should a destructive command be used. All deletions must target specific, verified filenames, and user confirmation must be requested before execution.

By embedding these constraints directly into the generated skills, we ensure that the agents executing those skills downstream inherit our strict safety posture. Our local benchmark script serves as a secondary defense layer, scanning the final output for dangerous keywords that lack accompanying guardrails. This dual-layered safety approach ensures that unsafe variants self-destruct during the authoring phase, long before they can be deployed in the private evaluation bench-mix.

## 6. Generalization over Memorization

A significant risk in meta-skill development is overfitting to the public task corpus. The competition organizers explicitly designed the private bench-mix to include held-out capability tasks in entirely new domains. If a meta-skill relies on memorized templates or domain-specific heuristics tuned only for the public tasks, it will fail catastrophically during final evaluation. 

To combat this, the SkillForge-AI meta-skill relies entirely on generalized reasoning frameworks. We do not provide the agent with templates for how to write a coding skill versus how to write an email skill. Instead, we provide it with a universal epistemological framework covering understanding, critiquing, auditing, evaluating, and refining. 

By forcing the agent to derive the required capabilities directly from the task description and environment inspection, our meta-skill remains entirely domain-agnostic. The persistent internal benchmarks we utilized during development forced our system to handle novel edge cases and constraints generically. We deliberately tested our meta-skill across highly disparate domains, from complex data processing pipelines to interactive command line tools, ensuring that the generated skills gracefully and reliably generalize to whatever held-out domains exist in the private bench-mix.

## 7. Development Evidence and the UI Platform

While the final submission is restricted to the meta-skill itself, the rich user interface we developed stands as testament to the rigorous, evidence-driven methodology that produced it. 

Our application platform made the invisible process of prompt evolution highly observable. We integrated graphical components to build a dynamic radar chart that plots dimensional improvements across four axes covering reliability, safety, capability, and generalization. This allowed us to visually confirm that a refinement was not over-indexing on capability at the expense of safety. Rather than hiding the model's reasoning, our dashboard surfaced the exact issues and safety violations detected during the critique phase, directly mapping them to the concrete refinement actions applied in the next version. A side-by-side textual difference viewer highlighted exactly which lines of the skill were modified during the evolution loop. Furthermore, a detailed dashboard displayed the exact percentage-point lift achieved across the basic, edge case, constraint, and safety categories for every skill generated.

This platform allowed us to scientifically iterate on our meta-prompt. We did not guess what worked; we measured it, visualized it, and optimized it. The resulting artifact in our submission is the distilled product of hundreds of empirically measured evolution cycles.

## 8. Limitations and Challenges Faced

The development of SkillForge-AI was not without significant challenges, and acknowledging these limitations is crucial for future iteration.

The primary limitation of our submitted meta-skill is the reliance on deterministic, heuristic keyword analysis for the final evaluation script. While highly effective at catching blatant safety violations, static string analysis is inherently limited in its ability to detect semantic, obfuscated, or multi-step logical vulnerabilities. 

During our internal development, we utilized a powerful semantic evaluation loop that could natively verify test cases. However, to comply with the strict constraints of the BenchFlow sandbox and avoid dependency on external internet keys that might not be provided during private evaluation, we were forced to strip this out of the final submission. The resulting heuristic script is a compromise. It maximizes operational reliability and sandbox compliance at the cost of deep semantic understanding. Future iterations of the BenchFlow harness that natively support semantic evaluation calls within the execution sandbox would allow us to re-introduce deep verification, dramatically improving the accuracy of the automated safety audits.

Furthermore, managing the context window during the critique and refine stages proved challenging. When generating highly complex, multi-step skills, the agent occasionally lost track of specific edge cases identified earlier in the pipeline. We mitigated this by forcing the agent to explicitly list and structure its findings in the Fail-Fast Gate, essentially creating a dense, self-referential context anchor before executing the refinement.

## 9. Conclusion

The BenchFlow Skill Lift hackathon poses a fundamentally critical question for the future of agentic workflows: can a skill optimizer keep climbing without producing unsafe or regressive instructions? 

SkillForge-AI answers this question affirmatively by proving that skills are not merely static text files; they are measurable, evolvable hypotheses. By coupling a powerful generative meta-skill with a strict, non-negotiable fail-fast safety gate and a deterministic evaluation mechanism, we ensure that every evolved skill consistently and safely lifts agent performance. 

We replaced the unpredictability of one-shot prompt engineering with an empirical optimization engine. Our submission does not rely on memorized templates, external dependencies, or hidden data sources. It relies on a rigorous, scientifically observable methodology that forces frontier models to interrogate, audit, and refine their own output before it ever reaches an execution environment. The result is a meta-skill that is robust, domain-agnostic, and, most importantly, uncompromisingly safe.
