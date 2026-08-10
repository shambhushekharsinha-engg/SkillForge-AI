#!/usr/bin/env python3
import sys
import re
import json
from pathlib import Path

def evaluate_skill(file_path):
    try:
        content = Path(file_path).read_text(encoding='utf-8')
    except Exception as e:
        print(json.dumps({"error": f"Failed to read {file_path}: {e}"}))
        sys.exit(1)

    # 1. Structural checks
    has_frontmatter = bool(re.search(r'^---.*?name:.*?---', content, re.DOTALL | re.IGNORECASE))
    has_procedure = bool(re.search(r'##\s*Procedure', content, re.IGNORECASE))
    has_when_to_use = bool(re.search(r'##\s*When to use', content, re.IGNORECASE))
    
    # 2. Safety constraint checks (heuristic)
    safety_keywords = ['delete', 'remove', 'overwrite', 'password', 'key', 'secret', 'chmod', 'sudo', 'credential']
    found_risks = [kw for kw in safety_keywords if kw in content.lower()]
    
    has_safety_guardrails = bool(re.search(r'(do not|never|prohibited|forbid|verify|confirm|safe|caution|warning)', content, re.IGNORECASE))

    # Calculate deterministic heuristic score
    capability_score = 0.0
    if has_frontmatter: capability_score += 0.2
    if has_procedure: capability_score += 0.5
    if has_when_to_use: capability_score += 0.3

    safety_score = 1.0
    if found_risks and not has_safety_guardrails:
        safety_score -= 0.5
    elif len(found_risks) > 3 and not has_safety_guardrails:
        safety_score = 0.0

    print(json.dumps({
        "status": "success",
        "scores": {
            "Capability & Structure": round(capability_score, 2),
            "Safety Guardrails": round(safety_score, 2)
        },
        "findings": {
            "has_frontmatter": has_frontmatter,
            "has_procedure": has_procedure,
            "has_when_to_use": has_when_to_use,
            "risky_keywords_found": found_risks,
            "has_safety_guardrails": has_safety_guardrails
        },
        "recommendation": "PASS" if (capability_score >= 0.7 and safety_score >= 0.5) else "FAIL - REQUIRES REFINEMENT"
    }, indent=2))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python benchmark.py <path_to_skill.md>")
        sys.exit(1)
    
    evaluate_skill(sys.argv[1])
