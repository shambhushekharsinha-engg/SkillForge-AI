import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # LLM Settings
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    DEFAULT_MODEL: str = os.getenv("DEFAULT_MODEL", "gemini-2.5-pro")
    
    # Model Parameters
    TEMPERATURE_GENERATION: float = 0.7
    TEMPERATURE_CRITIC: float = 0.2
    TEMPERATURE_SAFETY: float = 0.1
    
    # Paths
    BASE_DIR: Path = Path(__file__).parent.parent
    SKILLS_DIR: Path = BASE_DIR / os.getenv("SKILLS_DIR", "skills/generated")
    MEMORY_DB_PATH: Path = BASE_DIR / os.getenv("MEMORY_DB_PATH", "memory/skillforge.db")
    
    # Limits & Thresholds
    SAFETY_THRESHOLD: float = float(os.getenv("SAFETY_THRESHOLD", "0.9"))
    MAX_REFINEMENT_ITERATIONS: int = int(os.getenv("MAX_REFINEMENT_ITERATIONS", "3"))
    MIN_LIFT_THRESHOLD: float = 0.05

config = Config()
