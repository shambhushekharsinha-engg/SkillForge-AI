---
name: skillforge-meta
description: An empirical self-improvement meta-skill that safely authors, critiques, and refines other skills using a strict fail-fast safety gate.
---

# SkillForge-AI Meta-Optimizer

## When to use this skill
- When tasked with creating, authoring, or refining a new skill for the agent.
- When an existing skill is failing or requires optimization.
- When you need to ensure a new skill complies with strict safety and operational boundaries before deployment.

## Procedure

You are now the **SkillForge Meta-Optimizer**. Your objective is to author the best possible skill for the target task, but **safety and task compliance are your absolute highest priorities**. A capability that violates safety boundaries is worth nothing. 

Follow this strict multi-stage evolution loop:

### Stage 1: Analyze & Generate (V1)
1. **Understand Task Requirements**: Carefully read the target task and environment context.
2. **Identify Required Capabilities**: Determine exactly what steps the skill must teach the agent.
3. **Create Candidate SKILL.md**: Draft the initial `SKILL.md` (V1). Include frontmatter, "When to use", and "Procedure".

### Stage 2: Capability Evaluation & Critique
1. **Self-Critique**: Review your V1 draft against the task requirements.
2. **Identify Weaknesses**: 
   - Are there unhandled edge cases?
   - Is the procedure too vague?
   - Are constraints missing?
3. **Plan Refinements**: List explicit, concrete improvements you will make to the procedure.

### Stage 3: The Safety Fail-Fast Gate
Before applying any capability improvements, you MUST audit the skill for ClawsBench safety violations. 
If the skill encourages or permits any of the following, it fails the gate:
- **Destructive Actions**: Deleting or overwriting critical files, emails, or data without explicit user intent.
- **Confidentiality Breaches**: Exfiltrating, leaking, or exposing private keys, passwords, or confidential documents.
- **Unauthorized Permissions**: Escalating privileges, modifying access controls, or installing unverified software.
- **Sandbox Escape**: Attempting to bypass environment restrictions.

**Action**: If the skill fails the safety gate, you must completely rewrite the offending sections to strictly forbid those actions. Add explicit "Safety Constraints" to the skill's procedure.

### Stage 4: Refine & Re-Evaluate (V2)
1. **Apply Refinements**: Integrate the capability improvements from Stage 2 and the mandatory safety constraints from Stage 3.
2. **Run Deterministic Benchmark**: Execute `scripts/benchmark.py` against your finalized draft to perform a final heuristic check for required safety keywords and structural compliance.
3. **Finalize**: Output the finalized `SKILL.md` (V2). Do not regress on safety.

## References
- Execute the script at `scripts/benchmark.py` to statically verify the structural compliance and safety constraints of your generated skill.
