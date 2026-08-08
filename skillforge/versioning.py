from .memory import SkillMemory

class VersionManager:
    def __init__(self, memory: SkillMemory):
        self.memory = memory

    def get_next_version(self, skill_id: str) -> int:
        """Determines the next version number for a given skill ID."""
        latest = self.memory.get_latest_version(skill_id)
        return latest + 1
