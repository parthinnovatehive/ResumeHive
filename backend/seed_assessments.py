import os
import sys
import csv

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(backend_dir)

from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.modules.practice.models import Assessment, AssessmentQuestion

def seed():
    # Make sure all tables are created
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        project_root = os.path.abspath(os.path.join(backend_dir, ".."))
        assessments_csv = os.path.join(project_root, "assessments.csv")
        questions_csv = os.path.join(project_root, "assessment_questions.csv")

        print(f"Reading assessments from: {assessments_csv}")
        with open(assessments_csv, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                a_id = int(row["id"])
                title = row["title"].strip()
                duration = int(row["duration_minutes"])

                existing = db.query(Assessment).filter(Assessment.id == a_id).first()
                if existing:
                    existing.title = title
                    existing.duration_minutes = duration
                    print(f"Updated assessment {a_id}: {title}")
                else:
                    new_a = Assessment(
                        id=a_id,
                        title=title,
                        duration_minutes=duration
                    )
                    db.add(new_a)
                    print(f"Inserted assessment {a_id}: {title}")

        db.commit()

        print(f"\nReading assessment questions from: {questions_csv}")
        with open(questions_csv, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                q_id = int(row["id"])
                assessment_id = int(row["assessment_id"])
                title = row["title"].strip()
                description_html = row["description_html"].strip()
                difficulty = row["difficulty"].strip()
                constraints = row["constraints"].strip() if row.get("constraints") else None
                test_cases_json = row["test_cases_json"].strip()
                js_stub = row.get("js_stub")
                python_stub = row.get("python_stub")
                java_stub = row.get("java_stub")
                cpp_stub = row.get("cpp_stub")
                c_stub = row.get("c_stub")

                existing_q = db.query(AssessmentQuestion).filter(AssessmentQuestion.id == q_id).first()
                if existing_q:
                    existing_q.assessment_id = assessment_id
                    existing_q.title = title
                    existing_q.description_html = description_html
                    existing_q.difficulty = difficulty
                    existing_q.constraints = constraints
                    existing_q.test_cases_json = test_cases_json
                    existing_q.js_stub = js_stub
                    existing_q.python_stub = python_stub
                    existing_q.java_stub = java_stub
                    existing_q.cpp_stub = cpp_stub
                    existing_q.c_stub = c_stub
                    print(f"Updated question {q_id}: {title} (Assessment {assessment_id})")
                else:
                    new_q = AssessmentQuestion(
                        id=q_id,
                        assessment_id=assessment_id,
                        title=title,
                        description_html=description_html,
                        difficulty=difficulty,
                        constraints=constraints,
                        test_cases_json=test_cases_json,
                        js_stub=js_stub,
                        python_stub=python_stub,
                        java_stub=java_stub,
                        cpp_stub=cpp_stub,
                        c_stub=c_stub
                    )
                    db.add(new_q)
                    print(f"Inserted question {q_id}: {title} (Assessment {assessment_id})")

        db.commit()

        # Print summary
        total_assessments = db.query(Assessment).count()
        total_questions = db.query(AssessmentQuestion).count()
        print(f"\nSuccessfully seeded! Total Assessments: {total_assessments}, Total Questions: {total_questions}")

    except Exception as e:
        db.rollback()
        print(f"Error seeding assessments and questions: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed()
