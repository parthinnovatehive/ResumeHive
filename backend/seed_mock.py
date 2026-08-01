import os
import sys
import json
from datetime import datetime, timedelta

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.modules.interviews.models import InterviewCategory, InterviewSession
from app.modules.auth.models import User

def seed_mock_data():
    db = SessionLocal()
    
    # Ensure there is a user
    user = db.query(User).first()
    if not user:
        user = User(email="test@example.com", name="Test User", hashed_password="pw")
        db.add(user)
        db.commit()
        db.refresh(user)

    # Ensure there are categories
    cat_hr = db.query(InterviewCategory).filter_by(slug="hr-behavioral").first()
    if not cat_hr:
        cat_hr = InterviewCategory(
            name="HR / Behavioral",
            slug="hr-behavioral",
            system_prompt_template="You are an HR interviewer. Evaluate soft skills.",
            is_active=True
        )
        db.add(cat_hr)
        db.commit()
        db.refresh(cat_hr)

    # Create 3 mock sessions
    mock_sessions = [
        {
            "user_id": user.id,
            "category_id": cat_hr.id,
            "status": "completed",
            "transcript": [
                {"role": "system", "message": "You are an HR interviewer.", "timestamp": (datetime.utcnow() - timedelta(days=2)).isoformat()},
                {"role": "interviewer", "message": "Hi, tell me about a time you had a conflict with a teammate.", "timestamp": (datetime.utcnow() - timedelta(days=2)).isoformat()},
                {"role": "candidate", "message": "I just talked to them and we fixed it.", "timestamp": (datetime.utcnow() - timedelta(days=2)).isoformat()},
                {"role": "interviewer", "message": "Can you elaborate on how you approached the conversation?", "timestamp": (datetime.utcnow() - timedelta(days=2)).isoformat()},
                {"role": "candidate", "message": "I just told them they were wrong and they agreed.", "timestamp": (datetime.utcnow() - timedelta(days=2)).isoformat()}
            ],
            "report": {
                "overall_score": 45,
                "summary": "The candidate lacked detail in their answers and showed poor conflict resolution strategies.",
                "parameters": {
                    "communication": {"score": 50, "feedback": "Needs to provide more structured answers."},
                    "conflict_resolution": {"score": 40, "feedback": "Approach to conflict seemed confrontational."}
                },
                "strengths": ["Direct communication"],
                "areas_to_improve": ["Use the STAR method", "Show empathy in conflict"]
            },
            "created_at": datetime.utcnow() - timedelta(days=2),
            "completed_at": datetime.utcnow() - timedelta(days=2)
        },
        {
            "user_id": user.id,
            "category_id": cat_hr.id,
            "status": "completed",
            "transcript": [
                {"role": "system", "message": "You are an HR interviewer.", "timestamp": (datetime.utcnow() - timedelta(days=1)).isoformat()},
                {"role": "interviewer", "message": "Hi, tell me about a time you failed.", "timestamp": (datetime.utcnow() - timedelta(days=1)).isoformat()},
                {"role": "candidate", "message": "I missed a deadline once because I didn't estimate the work properly. I learned to break tasks down smaller.", "timestamp": (datetime.utcnow() - timedelta(days=1)).isoformat()},
                {"role": "interviewer", "message": "That's a good learning. How do you estimate now?", "timestamp": (datetime.utcnow() - timedelta(days=1)).isoformat()},
                {"role": "candidate", "message": "I use story points and historical velocity.", "timestamp": (datetime.utcnow() - timedelta(days=1)).isoformat()}
            ],
            "report": {
                "overall_score": 85,
                "summary": "Good self-awareness and clear learning from past failures.",
                "parameters": {
                    "self_awareness": {"score": 90, "feedback": "Great introspection."},
                    "communication": {"score": 80, "feedback": "Clear and concise."}
                },
                "strengths": ["Self-awareness", "Clear communication"],
                "areas_to_improve": ["Could elaborate more on the specific project"]
            },
            "created_at": datetime.utcnow() - timedelta(days=1),
            "completed_at": datetime.utcnow() - timedelta(days=1)
        }
    ]

    for data in mock_sessions:
        sess = InterviewSession(**data)
        db.add(sess)
    
    db.commit()
    print("Mock sessions seeded successfully!")

if __name__ == "__main__":
    seed_mock_data()
