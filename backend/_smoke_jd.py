"""Smoke test: score with/without JD, verify jd_match category + keyword lists."""
import json
import sys

sys.path.insert(0, ".")

RESUME = {
    "full_name": "Priya Sharma",
    "email": "priya@example.com",
    "phone": "9876543210",
    "location": "Bangalore, India",
    "linkedin_url": "https://linkedin.com/in/priya",
    "summary": "Final-year CS student passionate about backend development. "
               "Experienced with Python and REST APIs. Looking for SDE roles.",
    "education": [{"institution": "RV College", "degree": "B.Tech",
                   "field_of_study": "CS", "start_date": "2021-08",
                   "end_date": "2025-05", "gpa": "8.7"}],
    "experience": [{"company": "Zoho", "title": "SWE Intern",
                    "start_date": "2024-01", "end_date": "2024-06",
                    "is_current": False,
                    "description": "Built REST APIs in Python serving 10,000+ daily requests\n"
                                   "Reduced report generation time by 35%"}],
    "projects": [{"name": "CampusConnect", "description":
                  "Developed a student platform with 500+ users using React",
                  "technologies": "React, Node.js, PostgreSQL", "link": ""}],
    "skills": ["Python", "FastAPI", "SQL", "React", "Git", "Docker"],
    "certifications": ["AWS Cloud Practitioner"],
    "section_order": ["summary", "experience", "education", "projects", "skills", "certifications"],
}

JD_MATCHING = """
Software Development Engineer — Backend
We are looking for an SDE to build scalable backend services.
Requirements:
- Strong Python skills; experience with FastAPI or Django
- REST API design, PostgreSQL, SQL query optimization
- Docker, CI/CD pipelines, AWS deployment
- Git version control
Nice to have: Kubernetes, Redis, message queues (Kafka), monitoring with Grafana
"""

JD_UNRELATED = """
Digital Marketing Manager
Lead our social media strategy across Instagram, TikTok and YouTube.
Requirements: SEO, SEM, Google Ads, content marketing, brand campaigns,
influencer partnerships, email marketing automation, HubSpot, copywriting.
"""

if __name__ == "__main__":
    from app.services.ats_scorer import score_resume

    base = score_resume(RESUME)
    print("=== No JD ===")
    print("score:", base["score"])
    print("categories:", list(base["breakdown"].keys()))
    assert "jd_match" not in base["breakdown"]
    assert "jd_match" not in base

    with_jd = score_resume(RESUME, jd_text=JD_MATCHING)
    print("\n=== Matching JD (backend SDE) ===")
    print("score:", with_jd["score"])
    print("breakdown:", json.dumps(with_jd["breakdown"]))
    print("max:", json.dumps(with_jd["max"]))
    jm = with_jd["jd_match"]
    print("similarity:", jm["similarity"], "| match_pct:", jm["match_pct"])
    print("matched:", jm["matched_keywords"][:10])
    print("missing:", [(m["keyword"], m["weight"]) for m in jm["missing_keywords"][:8]])
    assert "jd_match" in with_jd["breakdown"]
    assert abs(sum(with_jd["max"].values()) - 100.0) < 0.5, sum(with_jd["max"].values())

    bad_jd = score_resume(RESUME, jd_text=JD_UNRELATED)
    jm2 = bad_jd["jd_match"]
    print("\n=== Unrelated JD (marketing) ===")
    print("score:", bad_jd["score"])
    print("similarity:", jm2["similarity"], "| match_pct:", jm2["match_pct"])
    print("missing:", [m["keyword"] for m in jm2["missing_keywords"][:8]])

    print("\n=== Checks ===")
    print("matching JD scores higher than unrelated JD:",
          with_jd["score"] > bad_jd["score"], f"({with_jd['score']} vs {bad_jd['score']})")
    assert with_jd["score"] > bad_jd["score"]
    assert jm["match_pct"] > jm2["match_pct"]
    # Empty/whitespace JD behaves like no JD
    assert "jd_match" not in score_resume(RESUME, jd_text="   ")
    print("empty JD ignored: True")
    print("\nALL CHECKS PASSED")
