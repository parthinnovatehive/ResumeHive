import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.modules.interviews.prompts import seed_interview_categories

def main():
    db = SessionLocal()
    try:
        seed_interview_categories(db)
        print("Interview categories seeded successfully!")
    except Exception as e:
        print(f"Error seeding categories: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
