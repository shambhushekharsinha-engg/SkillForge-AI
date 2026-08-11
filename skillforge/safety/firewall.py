from pydantic import BaseModel
from typing import List

class FirewallResult(BaseModel):
    destructive_operations_safe: bool
    data_exfiltration_safe: bool
    credential_access_safe: bool
    privilege_escalation_safe: bool
    external_network_safe: bool
    risk_score: float
    decision: str  # ALLOW, BLOCKED
    blocked_reasons: List[str]

class SkillFirewall:
    def __init__(self):
        import re
        self.re = re
        # Deterministic regex patterns for detecting dangerous capabilities
        self.rules = {
            "destructive_operations": [
                r"os\.remove", r"shutil\.rmtree", r"DROP\s+TABLE", r"DELETE\s+FROM", 
                r"rm\s+-rf", r"truncate", r"\.unlink"
            ],
            "data_exfiltration": [
                r"requests\.post", r"urllib", r"ftp\.", r"scp\s", r"curl\s+-X\s+POST",
                r"socket\."
            ],
            "credential_access": [
                r"os\.environ\.get\(['\"]AWS_", r"os\.environ\.get\(['\"]SECRET_",
                r"\.aws/credentials", r"\.ssh/id_rsa", r"password", r"api_key"
            ],
            "privilege_escalation": [
                r"sudo\s", r"chmod\s+777", r"chown\s+root", r"setuid"
            ],
            "external_network": [
                r"http://", r"https://"
            ]
        }

        # Weights for risk score calculation
        self.weights = {
            "destructive_operations": 0.4,
            "data_exfiltration": 0.3,
            "credential_access": 0.3,
            "privilege_escalation": 0.4,
            "external_network": 0.05
        }

    def evaluate(self, skill_content: str) -> FirewallResult:
        findings = {k: False for k in self.rules.keys()}
        reasons = []
        
        # Scan content against deterministic rules
        for category, patterns in self.rules.items():
            for pattern in patterns:
                if self.re.search(pattern, skill_content, self.re.IGNORECASE):
                    findings[category] = True
                    reasons.append(f"[{category.upper()}] Detected risky pattern: {pattern}")
                    break
                    
        # Calculate risk score
        risk = 0.0
        for cat, found in findings.items():
            if found:
                risk += self.weights.get(cat, 0.0)
                
        risk = min(1.0, risk)
        
        # Make deterministic decision
        # We reject if any of the major categories trigger (risk >= 0.3)
        decision = "BLOCKED" if risk >= 0.3 else "ALLOW"

        return FirewallResult(
            destructive_operations_safe=not findings["destructive_operations"],
            data_exfiltration_safe=not findings["data_exfiltration"],
            credential_access_safe=not findings["credential_access"],
            privilege_escalation_safe=not findings["privilege_escalation"],
            external_network_safe=not findings["external_network"],
            risk_score=round(risk, 2),
            decision=decision,
            blocked_reasons=reasons
        )
