import pytest
from skillforge.sandbox import MockSandboxProvider

def test_mock_sandbox_provider():
    provider = MockSandboxProvider()
    skill_content = "def hello(): print('world')"
    payload = {"input": "test"}
    
    result = provider.execute(skill_content, payload)
    
    assert result["status"] == "success"
    assert "Mock Execution Completed" in result["message"]
    assert result["output"]["processed_payload"] == payload
