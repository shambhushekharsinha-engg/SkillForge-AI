import sqlite3
import json
import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any

from .config import config
from .models.skill import SkillDraft
from .models.evaluation import EvaluationResult
from .models.experiment import ExperimentManifest

class SkillMemory:
    def __init__(self, db_path: Optional[Path] = None):
        self.db_path = db_path or config.MEMORY_DB_PATH
        # Ensure directory exists
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Skills table with versions and promotion status
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS skills (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    skill_id TEXT NOT NULL,
                    version INTEGER NOT NULL,
                    experiment_id TEXT,
                    name TEXT,
                    task_id TEXT,
                    content_json TEXT,
                    status TEXT DEFAULT 'DRAFT',
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
            
            # Benchmark cases persistent for a task
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS benchmark_cases (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    task_id TEXT NOT NULL,
                    category TEXT NOT NULL,
                    description TEXT NOT NULL,
                    expected_behavior TEXT NOT NULL,
                    UNIQUE(task_id, category, description)
                )
            ''')
            
            # Benchmark results for a specific skill version
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS benchmark_results (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    skill_id TEXT NOT NULL,
                    version INTEGER NOT NULL,
                    category TEXT NOT NULL,
                    score REAL NOT NULL,
                    FOREIGN KEY(skill_id, version) REFERENCES skills(skill_id, version)
                )
            ''')
            
            # Failure memory to track historical failures
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS failure_records (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    skill_id TEXT NOT NULL,
                    version INTEGER NOT NULL,
                    category TEXT NOT NULL,
                    failure_message TEXT NOT NULL,
                    severity TEXT,
                    attempted_strategy TEXT,
                    resolved BOOLEAN DEFAULT 0,
                    FOREIGN KEY(skill_id, version) REFERENCES skills(skill_id, version)
                )
            ''')
            
            # Experiments Table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS experiments (
                    experiment_id TEXT PRIMARY KEY,
                    task TEXT,
                    model TEXT,
                    seed INTEGER,
                    budget INTEGER,
                    target_capability REAL,
                    benchmark_version TEXT,
                    red_team_version TEXT,
                    policy_version TEXT,
                    timestamp TEXT,
                    initial_skill_hash TEXT,
                    final_experiment_hash TEXT,
                    status TEXT
                )
            ''')
            
            # Audit Logs Table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS audit_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    experiment_id TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    event_type TEXT NOT NULL,
                    status TEXT NOT NULL,
                    details TEXT
                )
            ''')
            
            conn.commit()

    def save_experiment(self, manifest: ExperimentManifest):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO experiments 
                (experiment_id, task, model, seed, budget, target_capability, benchmark_version, red_team_version, policy_version, timestamp, initial_skill_hash, final_experiment_hash, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (manifest.experiment_id, manifest.task, manifest.model, manifest.seed, manifest.budget, manifest.target_capability, manifest.benchmark_version, manifest.red_team_version, manifest.policy_version, manifest.timestamp, manifest.initial_skill_hash, manifest.final_experiment_hash, manifest.status))
            conn.commit()
            
    def update_experiment_hash(self, experiment_id: str, final_hash: str):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('UPDATE experiments SET final_experiment_hash = ?, status = ? WHERE experiment_id = ?', (final_hash, "COMPLETED", experiment_id))
            conn.commit()

    def log_audit_event(self, experiment_id: str, event_type: str, status: str, details: str = ""):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            timestamp = datetime.datetime.utcnow().isoformat()
            cursor.execute('''
                INSERT INTO audit_events (experiment_id, timestamp, event_type, status, details)
                VALUES (?, ?, ?, ?, ?)
            ''', (experiment_id, timestamp, event_type, status, details))
            conn.commit()

    def get_audit_events(self, experiment_id: str) -> List[Dict[str, Any]]:
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM audit_events WHERE experiment_id = ? ORDER BY id ASC', (experiment_id,))
            return [dict(row) for row in cursor.fetchall()]

    def update_skill_status(self, skill_id: str, version: int, status: str):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('UPDATE skills SET status = ? WHERE skill_id = ? AND version = ?', (status, skill_id, version))
            conn.commit()

    def save_skill(self, skill_id: str, version: int, task_id: str, skill: SkillDraft, experiment_id: str = None, status: str = 'DRAFT'):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO skills (skill_id, version, name, task_id, content_json, experiment_id, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (skill_id, version, skill.name, task_id, skill.model_dump_json(), experiment_id, status))
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

    def get_benchmark_cases(self, task_id: str) -> List[Dict[str, Any]]:
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM benchmark_cases WHERE task_id = ?', (task_id,))
            return [dict(row) for row in cursor.fetchall()]

    def save_benchmark_cases(self, task_id: str, cases: List[Dict[str, str]]):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            for case in cases:
                cursor.execute('''
                    INSERT OR IGNORE INTO benchmark_cases (task_id, category, description, expected_behavior)
                    VALUES (?, ?, ?, ?)
                ''', (task_id, case['category'], case['description'], case['expected_behavior']))
            conn.commit()

    def save_benchmark_results(self, skill_id: str, version: int, results: Dict[str, float]):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            for category, score in results.items():
                cursor.execute('''
                    INSERT INTO benchmark_results (skill_id, version, category, score)
                    VALUES (?, ?, ?, ?)
                ''', (skill_id, version, category, score))
            conn.commit()

    def get_benchmark_results(self, skill_id: str, version: int) -> Dict[str, float]:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT category, score FROM benchmark_results 
                WHERE skill_id = ? AND version = ?
            ''', (skill_id, version))
            return {row[0]: row[1] for row in cursor.fetchall()}

    def save_failure(self, skill_id: str, version: int, category: str, message: str, severity: str, strategy: str = None):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO failure_records (skill_id, version, category, failure_message, severity, attempted_strategy)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (skill_id, version, category, message, severity, strategy))
            conn.commit()

    def get_unresolved_failures(self, skill_id: str) -> List[Dict[str, Any]]:
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM failure_records 
                WHERE skill_id = ? AND resolved = 0
                ORDER BY id DESC
            ''', (skill_id,))
            return [dict(row) for row in cursor.fetchall()]
            
    def mark_failure_resolved(self, failure_id: int):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('UPDATE failure_records SET resolved = 1 WHERE id = ?', (failure_id,))
            conn.commit()
