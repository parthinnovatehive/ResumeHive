from fastapi.testclient import TestClient
from app.main import app
from app.core.security import get_current_user_id
import json

app.dependency_overrides[get_current_user_id] = lambda: 1

client = TestClient(app)

res = client.post("/resumes", json={"full_name": "Download Test", "section_order": ["summary", "experience", "education"]})
resume_id = res.json()["data"]["id"]

print("Patching...")
patch_res = client.patch(f"/resumes/{resume_id}", json={"section_order": ["experience", "education", "summary"]})
print(f"Patch Status: {patch_res.status_code}")

print("Generating PDF...")
gen_res = client.post(f"/resumes/{resume_id}/generate?template=classic")
print(f"Generate Status: {gen_res.status_code}")
if gen_res.status_code != 200:
    print(f"Generate Error: {gen_res.text}")
else:
    print(f"Generate Success: {gen_res.json()}")
