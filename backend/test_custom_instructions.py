from fastapi.testclient import TestClient
from app.main import app
from app.core.security import get_current_user_id

app.dependency_overrides[get_current_user_id] = lambda: 1

client = TestClient(app)

res = client.post("/api/interview/sessions", json={
    "category_id": 1,
    "custom_instructions": "Focus on distributed systems and system design."
})

print(res.status_code)
print(res.json())
