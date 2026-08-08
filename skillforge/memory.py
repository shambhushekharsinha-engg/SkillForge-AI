import sqlite3
import json
from pathlib import Path
from typing import Optional, List, Dict, Any

from .config import config
from .models.skill import SkillDraft
from .models.evaluation import EvaluationResult

class SkillMemory:
    def __init__(self, db_path: Optional[Path] = None):
        self.db_path = db_path or config.MEMORY_DB_PATH
        # Ensure directory exists
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Skills table with versions
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS skills (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    skill_id TEXT NOT NULL,
                    version INTEGER NOT NULL,
                    name TEXT,
                    task_id TEXT,
                    content_json TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(skill_id, version)
                )
            ''')
            
            # Evaluations table mapped to skills
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS evaluations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    skill_id TEXT NOT NULL,
                    version INTEGER NOT NULL,
                    task_id TEXT,
                    baseline_score REAL,
                    skilled_score REAL,
                    lift REAL,
                    feedback TEXT,
                    FOREIGN KEY(skill_id, version) REFERENCES skills(skill_id, version)
                )
            ''')
            conn.commit()

    def save_skill(self, skill_id: str, version: int, task_id: str, skill: SkillDraft):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO skills (skill_id, version, name, task_id, content_json)
                VALUES (?, ?, ?, ?, ?)
            ''', (skill_id, version, skill.name, task_id, skill.model_dump_json()))
            conn.commit()

    def save_evaluation(self, eval_res: EvaluationResult, version: int):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO evaluations (skill_id, version, task_id, baseline_score, skilled_score, lift, feedback)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (eval_res.skill_id, version, eval_res.task_id, eval_res.baseline_score, eval_res.skilled_score, eval_res.lift, eval_res.feedback))
            conn.commit()

    def get_latest_version(self, skill_id: str) -> int:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT MAX(version) FROM skills WHERE skill_id = ?', (skill_id,))
            res = cursor.fetchone()[0]
            return res if res is not None else 0
            
    def get_evaluations_for_skill(self, skill_id: str) -> List[Dict[str, Any]]:
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM evaluations WHERE skill_id = ? ORDER BY version ASC', (skill_id,))
            return [dict(row) for row in cursor.fetchall()]
