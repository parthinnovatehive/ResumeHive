from fastapi.testclient import TestClient
from app.main import app
from app.core.security import get_current_user_id

app.dependency_overrides[get_current_user_id] = lambda: 1

client = TestClient(app)

res = client.post("/resumes", json={"full_name": "Download Test"})
resume_id = res.json()["data"]["id"]

print("Testing download...")
dl_res = client.get(f"/resumes/{resume_id}/download?template=classic")
print(f"Status: {dl_res.status_code}")
if dl_res.status_code != 200:
    print(f"Response: {dl_res.text}")
else:
    print(f"Got {len(dl_res.content)} bytes.")
