import pytest
from fastapi.testclient import TestClient
from api.routes import router, version_manager
from skillforge.models.skill import SkillDraft
from skillforge.models.evaluation import EvaluationResult
from fastapi import FastAPI

app = FastAPI()
app.include_router(router, prefix="/api")
client = TestClient(app)

import uuid
from skillforge.memory import SkillMemory

def test_append_only_rollback(tmp_path):
    db_path = tmp_path / "test_rollback.db"
    memory = SkillMemory(db_path)
    
    # Setup test data
    skill_id = f"test_skill_{uuid.uuid4().hex}"
    def create_draft(content):
        return SkillDraft(
            name="Test Skill", 
            description="desc",
            trigger_conditions=["cond"],
            required_context=["ctx"],
            procedure=["step1"],
            verification_steps=["ver1"],
            failure_handling=["fail1"],
            safety_constraints=["safe1"],
            examples=["example1"],
            markdown_content=content
        )
        
    draft1 = create_draft("v1 code")
    draft2 = create_draft("v2 code")
    draft3 = create_draft("v3 code")
    
    # Save V1, V2, V3
    memory.save_skill(skill_id, 1, "task-1", draft1)
    memory.save_skill(skill_id, 2, "task-1", draft2)
    memory.save_skill(skill_id, 3, "task-1", draft3)
    
    # Also save an evaluation for V2 so it can be copied during rollback
    eval2 = EvaluationResult(skill_id=skill_id, task_id="task-1", baseline_score=0.0, skilled_score=1.0, lift=1.0, feedback="v2 eval")
    memory.save_evaluation(eval2, 2)
    
    from skillforge.versioning import VersionManager
    vm = VersionManager(memory)
    
    # We have to patch the global memory for the route to use the local memory
    import api.routes
    api.routes.memory = memory
    api.routes.version_manager = vm
    
    response = client.post("/api/rollback", json={"skill_id": skill_id, "target_version": 2})
    assert response.status_code == 200
    data = response.json()
    assert data["new_version"] == 4
    
    # Verify append-only property using the isolated version_manager
    latest = vm.get_next_version(skill_id) - 1
    assert latest == 4
    
    # Verify the contents of V4 match V2
    import sqlite3
    with sqlite3.connect(memory.db_path) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM skills WHERE skill_id = ? AND version = 4", (skill_id,))
        row = cur.fetchone()
        
        assert row is not None
        reconstructed = SkillDraft.model_validate_json(row['content_json'])
        assert reconstructed.markdown_content == "v2 code"
        
        cur.execute("SELECT * FROM evaluations WHERE skill_id = ? AND version = 4", (skill_id,))
        eval_row = cur.fetchone()
        assert eval_row is not None
        assert eval_row['feedback'] == "Rollback from V2"
