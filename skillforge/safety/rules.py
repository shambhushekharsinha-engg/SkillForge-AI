import re
from typing import List

class RuleScanner:
    # A basic set of regex rules for destructive or dangerous commands
    DANGEROUS_PATTERNS = [
        r"rm -rf /",
        r"mkfs",
        r"chmod -R 777",
        r"chown -R",
        r"> /dev/sda",
        r"curl .* \| bash",
        r"wget .* \| bash",
        r"nc -e",
        r"netcat -e"
    ]

    def scan(self, content: str) -> List[str]:
        violations = []
        for pattern in self.DANGEROUS_PATTERNS:
            if re.search(pattern, content, re.IGNORECASE):
                violations.append(f"Rule violation: Found suspicious pattern matching '{pattern}'")
        return violations
