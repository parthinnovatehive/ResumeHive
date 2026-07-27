from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# We need a token to authenticate
# Or we can just mock get_current_user_id

from app.core.security import get_current_user_id
app.dependency_overrides[get_current_user_id] = lambda: 1

def test():
    # create a resume first
    res = client.post("/resumes", json={"full_name": "Test User"})
    resume_id = res.json()["data"]["id"]
    print(f"Created resume {resume_id}")

    # generate pdf
    print("Generating PDF...")
    gen_res = client.post(f"/resumes/{resume_id}/generate?template=classic")
    print(f"Status: {gen_res.status_code}")
    print(f"Response: {gen_res.json()}")

test()
