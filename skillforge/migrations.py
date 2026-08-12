import sqlite3
import os

def run_migrations(db_path: str):
    """Run database schema migrations sequentially."""
    print(f"Running migrations on {db_path}...")
    
    with sqlite3.connect(db_path) as conn:
        cur = conn.cursor()
        
        # Create migrations table if it doesn't exist
        cur.execute("""
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version INTEGER PRIMARY KEY,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cur.execute("SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1")
        row = cur.fetchone()
        current_version = row[0] if row else 0
        
        # Migration 1: Add experiment_id to benchmark_results if missing
        if current_version < 1:
            try:
                cur.execute("ALTER TABLE benchmark_results ADD COLUMN experiment_id TEXT")
            except sqlite3.OperationalError:
                pass # Column might already exist
            cur.execute("INSERT INTO schema_migrations (version) VALUES (1)")
            print("Applied migration v1")
            
        # Migration 2: Add certified flag to skills
        if current_version < 2:
            try:
                cur.execute("ALTER TABLE skills ADD COLUMN is_certified BOOLEAN DEFAULT 0")
            except sqlite3.OperationalError:
                pass
            cur.execute("INSERT INTO schema_migrations (version) VALUES (2)")
            print("Applied migration v2")

        conn.commit()
    print("Migrations complete.")
