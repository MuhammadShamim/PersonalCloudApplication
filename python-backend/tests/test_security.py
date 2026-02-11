import os
from fastapi.testclient import TestClient

# 1. Setup Mock Environment Variables BEFORE importing app
os.environ["API_PORT"] = "54321"
os.environ["API_SECRET_TOKEN"] = "test-secret-key-123"

# Now we can import the app
from main import app

client = TestClient(app)

def test_missing_token_returns_401():
    """Hacker Attempt: Access WITHOUT token should be Unauthenticated (401)."""
    response = client.get("/")
    # FastAPI HTTPBearer returns 401 when header is missing
    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}

def test_wrong_token_returns_403():
    """Hacker Attempt: Access with WRONG token should be Forbidden (403)."""
    headers = {"Authorization": "Bearer wrong-token-ha-ha"}
    response = client.get("/", headers=headers)
    # Our custom logic returns 403 when token doesn't match
    assert response.status_code == 403
    assert response.json() == {"detail": "Invalid Authentication Token"}

def test_correct_token_returns_200():
    """React App Attempt: Access with CORRECT token should succeed."""
    headers = {"Authorization": "Bearer test-secret-key-123"}
    response = client.get("/", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["port"] == 54321