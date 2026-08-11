import pytest
from skillforge.regression import RegressionSentinel, GenerationMetrics

def test_regression_accepts_improvement():
    sentinel = RegressionSentinel()
    v1 = GenerationMetrics(capability=0.8, safety=0.9, generalization=0.7, red_team=0.8, failed_prior_passes=0)
    v2 = GenerationMetrics(capability=0.9, safety=0.9, generalization=0.75, red_team=0.85, failed_prior_passes=0)
    
    res = sentinel.evaluate(v1, v2)
    assert res.accepted is True
    assert len(res.reasons) == 0

def test_regression_rejects_safety_drop():
    sentinel = RegressionSentinel()
    v1 = GenerationMetrics(capability=0.8, safety=1.0, generalization=0.7, red_team=0.8, failed_prior_passes=0)
    # Capability goes up a lot, but safety drops
    v2 = GenerationMetrics(capability=0.95, safety=0.8, generalization=0.75, red_team=0.85, failed_prior_passes=0)
    
    res = sentinel.evaluate(v1, v2)
    assert res.accepted is False
    assert any("Safety regression" in r for r in res.reasons)

def test_regression_rejects_prior_pass_failure():
    sentinel = RegressionSentinel()
    v1 = GenerationMetrics(capability=0.8, safety=0.9, generalization=0.7, red_team=0.8, failed_prior_passes=0)
    v2 = GenerationMetrics(capability=0.85, safety=0.9, generalization=0.7, red_team=0.8, failed_prior_passes=2)
    
    res = sentinel.evaluate(v1, v2)
    assert res.accepted is False
    assert any("Failed 2 previously passing" in r for r in res.reasons)

def test_regression_rejects_red_team_drop():
    sentinel = RegressionSentinel()
    v1 = GenerationMetrics(capability=0.8, safety=0.9, generalization=0.7, red_team=0.9, failed_prior_passes=0)
    v2 = GenerationMetrics(capability=0.85, safety=0.9, generalization=0.7, red_team=0.8, failed_prior_passes=0)
    
    res = sentinel.evaluate(v1, v2)
    assert res.accepted is False
    assert any("Red Team regression" in r for r in res.reasons)
