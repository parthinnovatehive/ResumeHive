import json
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.db.session import get_db
from app.core.security import get_current_user_id
from app.llm.groq_client import call_groq
from app.modules.resumes.models import Resume
from app.modules.interviews.models import InterviewCategory, InterviewSession, InterviewSessionFlag
from app.modules.interviews.schemas import (
    InterviewCategoryOut,
    InterviewSessionCreate,
    InterviewSessionMessage,
    InterviewSessionOut,
    InterviewSessionFlagCreate,
    InterviewSessionEnd,
    InterviewReportOut,
    CategoryProgress,
    ProgressAttempt
)
from pydantic import ValidationError
from app.modules.interviews.prompts import REPORT_GENERATION_PROMPT

router = APIRouter(prefix="/api/interview", tags=["interview"])

@router.get("/categories", response_model=list[InterviewCategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return db.query(InterviewCategory).all()

@router.post("/sessions", response_model=dict)
async def create_session(
    data: InterviewSessionCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    category = db.query(InterviewCategory).filter(InterviewCategory.id == data.category_id).first()
    if not category or not category.is_active:
        raise HTTPException(status_code=400, detail="Invalid or inactive category")

    system_prompt = category.system_prompt_template

    # Inject resume data if needed
    if category.slug == "resume-deep-dive":
        # Get user's primary resume
        resume = db.query(Resume).filter(Resume.user_id == user_id).first()
        resume_data = {}
        if resume:
            try:
                resume_data = {
                    "experience": json.loads(resume.experience) if resume.experience else [],
                    "projects": json.loads(resume.projects) if resume.projects else [],
                    "skills": json.loads(resume.skills) if resume.skills else []
                }
            except:
                pass
        
        system_prompt = system_prompt.replace("{RESUME_JSON}", json.dumps(resume_data, indent=2))

    if data.custom_instructions:
        system_prompt += f"\n\nCandidate's Custom Instructions:\n{data.custom_instructions}\nEnsure you incorporate these specific requests into your questioning and persona."

    # Initialize transcript with system prompt
    transcript = [{"role": "system", "message": system_prompt, "timestamp": datetime.now().isoformat()}]
    
    # Call Groq for opening message
    try:
        opening_msg, _ = await call_groq(prompt="", messages=[{"role": "system", "content": system_prompt}])
    except Exception as e:
        logging.error(f"Failed to initialize interview AI: {e}")
        raise HTTPException(status_code=500, detail="Failed to initialize interview AI")

    transcript.append({"role": "interviewer", "message": opening_msg, "timestamp": datetime.now().isoformat()})

    session = InterviewSession(
        user_id=user_id,
        category_id=category.id,
        transcript=transcript,
        status="in_progress"
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return {"session_id": session.id, "opening_message": opening_msg}

@router.post("/sessions/{session_id}/respond")
async def respond_to_session(
    session_id: int,
    data: InterviewSessionMessage,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id, InterviewSession.user_id == user_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return await process_interview_turn(session, data.message, db)

async def process_interview_turn(session: InterviewSession, user_message: str, db: Session) -> dict:
    if session.status != "in_progress":
        raise HTTPException(status_code=400, detail="Interview is already completed")

    # Enforce length limit (e.g., 30 turns total = 15 exchanges + 1 system)
    if len(session.transcript) > 31:
        raise HTTPException(status_code=400, detail="Interview has reached the maximum length. Please end the interview.")

    # Append user message
    transcript = list(session.transcript)
    transcript.append({"role": "candidate", "message": user_message, "timestamp": datetime.now().isoformat()})

    # Prepare messages for LLM
    llm_messages = []
    for entry in transcript:
        if entry["role"] == "interviewer":
            role = "assistant"
        elif entry["role"] == "candidate":
            role = "user"
        else:
            role = entry["role"]
        llm_messages.append({"role": role, "content": entry["message"]})

    # Call Groq
    try:
        ai_response, _ = await call_groq(prompt="", messages=llm_messages)
    except Exception as e:
        logging.error(f"Failed to get AI response: {e}")
        raise HTTPException(status_code=500, detail="Failed to get AI response")

    transcript.append({"role": "interviewer", "message": ai_response, "timestamp": datetime.now().isoformat()})
    
    session.transcript = transcript
    flag_modified(session, "transcript")
    db.commit()

    return {"message": ai_response}

@router.post("/sessions/{session_id}/respond-audio")
async def respond_to_session_audio(
    session_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    # Validate file size (max 25MB)
    if not file.filename:
        file.filename = "audio.wav"
        
    audio_bytes = await file.read()
    
    if len(audio_bytes) > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Audio file too large. Max 25MB.")
        
    try:
        from groq import AsyncGroq
        from app.core.config import settings
        client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        transcription = await client.audio.transcriptions.create(
            model='whisper-large-v3-turbo',
            file=(file.filename, audio_bytes)
        )
    except Exception as e:
        logging.error(f"Failed to transcribe audio: {e}")
        raise HTTPException(status_code=500, detail="Couldn't hear that, please try again")
        
    if not transcription.text or not transcription.text.strip():
        raise HTTPException(status_code=400, detail="No speech detected, please try again")
        
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id, InterviewSession.user_id == user_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    result = await process_interview_turn(session, transcription.text, db)
    
    # Return both what they said (so UI can display it) and the AI's response
    return {
        "transcription": transcription.text,
        "message": result["message"]
    }

@router.post("/sessions/{session_id}/flag")
async def flag_session(
    session_id: int,
    data: InterviewSessionFlagCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id, InterviewSession.user_id == user_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if session.status != "in_progress":
        raise HTTPException(status_code=400, detail="Cannot flag a completed session")
        
    flag = InterviewSessionFlag(
        session_id=session.id,
        flag_type=data.flag_type,
        triggered_at=datetime.utcnow()
    )
    db.add(flag)
    db.commit()
    
    tab_switches = db.query(InterviewSessionFlag).filter(
        InterviewSessionFlag.session_id == session.id,
        InterviewSessionFlag.flag_type.in_(["TAB_SWITCH", "WINDOW_BLUR"])
    ).count()
    
    total_flags = db.query(InterviewSessionFlag).filter(
        InterviewSessionFlag.session_id == session.id
    ).count()
    
    return {
        "status": "ok",
        "tab_switches": tab_switches,
        "total_flags": total_flags
    }

@router.post("/sessions/{session_id}/end")
async def end_session(
    session_id: int,
    data: InterviewSessionEnd = None,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id, InterviewSession.user_id == user_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.status == "completed":
        return session.report

    # Check for disqualification due to cheating
    if data and data.is_disqualified:
        reason = data.disqualification_reason or "Session terminated due to multiple tab-switch / anti-cheating violations."
        report_json = {
            "overall_score": 0,
            "integrity_status": "DISQUALIFIED",
            "disqualification_reason": reason,
            "summary": f"DISQUALIFIED FOR CHEATING: {reason} The candidate switched tabs or navigated away from the active interview session multiple times.",
            "parameters": {
                "session_integrity": {
                    "score": 0,
                    "feedback": f"Integrity check failed: {reason}"
                },
                "communication_clarity": {"score": 0, "feedback": "Assessment cancelled due to proctoring disqualification."},
                "structure_of_answers": {"score": 0, "feedback": "Assessment cancelled due to proctoring disqualification."},
                "technical_accuracy": {"score": 0, "feedback": "Assessment cancelled due to proctoring disqualification."}
            },
            "strengths": [],
            "areas_to_improve": [
                "Strictly adhere to interview guidelines: do not switch tabs, minimize windows, or use external aids during proctored sessions."
            ],
            "suggested_focus_areas": [
                "Practice answering questions without switching windows or consulting external notes."
            ]
        }
        session.status = "completed"
        session.completed_at = datetime.now()
        session.report = report_json
        db.commit()
        return report_json

    # Normal report evaluation
    flags = session.flags
    tab_switches = sum(1 for f in flags if f.flag_type in ["TAB_SWITCH", "WINDOW_BLUR"])
    
    transcript = session.transcript
    
    # Check for candidate participation
    candidate_turns = [
        entry for entry in transcript 
        if entry.get("role") == "candidate" and entry.get("message") and entry.get("message").strip() and entry.get("message").strip() != "..."
    ]
    
    if len(candidate_turns) == 0:
        # User started and immediately ended the interview without answering anything
        report_json = {
            "overall_score": 0,
            "integrity_status": "INCOMPLETE",
            "tab_switches_count": tab_switches,
            "summary": "Incomplete Interview Session: The interview was ended immediately without any candidate responses or answers. No score or performance evaluation could be awarded.",
            "parameters": {
                "participation_and_effort": {
                    "score": 0,
                    "feedback": "0 responses provided. The interview was started and exited without answering any questions."
                },
                "communication_clarity": {
                    "score": 0,
                    "feedback": "No candidate responses provided to evaluate."
                },
                "technical_depth_accuracy": {
                    "score": 0,
                    "feedback": "No technical or conceptual answers submitted."
                },
                "structure_of_answers": {
                    "score": 0,
                    "feedback": "No structured responses provided."
                }
            },
            "strengths": [],
            "areas_to_improve": [
                "Engage in the conversation and answer the interviewer's questions thoroughly.",
                "Complete a full mock session (at least 4-6 questions) to receive comprehensive performance analysis."
            ],
            "suggested_focus_areas": [
                "Practice speaking or typing answers to each question thoroughly before ending the session."
            ],
            "turn_evaluations": []
        }
        session.status = "completed"
        session.completed_at = datetime.now()
        session.report = report_json
        db.commit()
        return report_json

    formatted_transcript = ""
    for entry in transcript:
        if entry["role"] == "system": continue
        formatted_transcript += f"{entry['role'].capitalize()}: {entry['message']}\n\n"

    report_prompt = REPORT_GENERATION_PROMPT.replace("{TRANSCRIPT}", formatted_transcript)
    if tab_switches > 0:
        report_prompt += f"\n\nNOTE FOR EVALUATOR: The candidate triggered {tab_switches} tab switch/window unfocus warning(s) during the session. Note this in integrity and areas to improve if relevant."
    
    # Call evaluator
    report_json = None
    for attempt in range(2):
        try:
            raw_report, _ = await call_groq(prompt=report_prompt, max_tokens=3000)
            parsed_raw = json.loads(raw_report)
            validated = InterviewReportOut(**parsed_raw)
            report_json = validated.model_dump() if hasattr(validated, 'model_dump') else validated.dict()
            break
        except json.JSONDecodeError:
            report_prompt += "\n\nCRITICAL: You returned invalid JSON last time. You MUST return ONLY valid, parseable JSON. Do not include markdown ticks."
        except ValidationError as ve:
            logging.error(f"Failed to validate report JSON: {ve} - RAW: {raw_report}")
            # Try to salvage partial data
            try:
                partial = json.loads(raw_report)
                report_json = {
                    "overall_score": partial.get("overall_score", 0),
                    "summary": partial.get("summary", "Validation failed, partial report shown."),
                    "parameters": partial.get("parameters", {}),
                    "strengths": partial.get("strengths", []),
                    "areas_to_improve": partial.get("areas_to_improve", []),
                    "suggested_focus_areas": partial.get("suggested_focus_areas", []),
                    "turn_evaluations": partial.get("turn_evaluations", [])
                }
            except Exception:
                pass
            break
        except Exception as e:
            logging.error(f"Unexpected error generating report: {e}")
            break
            
    if not report_json:
        report_json = {
            "overall_score": 0,
            "parameters": {},
            "strengths": [],
            "areas_to_improve": [],
            "suggested_focus_areas": [],
            "turn_evaluations": [],
            "summary": "Failed to generate report due to an AI error."
        }

    # Strict penalty caps for very few turns or very low word counts
    raw_score = report_json.get("overall_score", 0)
    total_words = sum(len(turn.get("message", "").split()) for turn in candidate_turns)
    avg_words = total_words / max(len(candidate_turns), 1)

    if len(candidate_turns) == 1:
        # Capped strictly at 30
        report_json["overall_score"] = min(raw_score, 30)
        report_json["summary"] = f"{report_json.get('summary', '')} [Incomplete Session: Only 1 response provided (score capped at 30)]."
    elif len(candidate_turns) == 2:
        # Capped strictly at 50
        report_json["overall_score"] = min(raw_score, 50)
        report_json["summary"] = f"{report_json.get('summary', '')} [Incomplete Session: Only 2 responses provided (score capped at 50)]."
    elif len(candidate_turns) == 3:
        # Capped strictly at 65
        report_json["overall_score"] = min(raw_score, 65)
    elif avg_words < 8:
        # Extremely brief / one-word answers
        report_json["overall_score"] = min(raw_score, 35)
        report_json["summary"] = f"{report_json.get('summary', '')} [Answers were extremely brief and lacked necessary technical or behavioral detail]."

    # If tab switches occurred, record integrity info in report_json
    report_json["tab_switches_count"] = tab_switches
    if tab_switches > 2:
        report_json["integrity_status"] = "HIGH_RISK"
    elif tab_switches > 0:
        report_json["integrity_status"] = "WARNING"
    else:
        report_json["integrity_status"] = "VERIFIED_AUTHENTIC"

    session.status = "completed"
    session.completed_at = datetime.now()
    session.report = report_json
    db.commit()

    return report_json

@router.get("/sessions/{session_id}", response_model=InterviewSessionOut)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id, InterviewSession.user_id == user_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return session

@router.get("/progress", response_model=list[CategoryProgress])
def get_progress(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == user_id, 
        InterviewSession.status == "completed"
    ).order_by(InterviewSession.completed_at.asc()).all()
    
    grouped = {}
    for s in sessions:
        cat_id = s.category_id
        if cat_id not in grouped:
            grouped[cat_id] = {
                "category_name": s.category.name,
                "category_slug": s.category.slug,
                "attempts": []
            }
        
        score = 0
        if s.report and isinstance(s.report, dict):
            score = s.report.get("overall_score", 0)
            
    return list(grouped.values())


@router.get("/history")
def get_interview_history(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == user_id
    ).order_by(InterviewSession.started_at.desc()).all()
    
    history = []
    for s in sessions:
        report = s.report or {}
        transcript = s.transcript or []
        candidate_turns = [
            t for t in transcript 
            if isinstance(t, dict) and t.get("role") == "candidate" and t.get("message") and t.get("message").strip() and t.get("message").strip() != "..."
        ]
        
        history.append({
            "id": s.id,
            "category_id": s.category_id,
            "category_name": s.category.name if s.category else "Technical Round",
            "category_slug": s.category.slug if s.category else "hr-behavioral",
            "status": s.status,
            "started_at": s.started_at.isoformat() if s.started_at else None,
            "completed_at": s.completed_at.isoformat() if s.completed_at else None,
            "overall_score": report.get("overall_score", 0) if isinstance(report, dict) else 0,
            "integrity_status": report.get("integrity_status", "VERIFIED_AUTHENTIC") if isinstance(report, dict) else "VERIFIED_AUTHENTIC",
            "tab_switches_count": report.get("tab_switches_count", 0) if isinstance(report, dict) else 0,
            "summary": report.get("summary", "") if isinstance(report, dict) else "",
            "candidate_turns_count": len(candidate_turns),
            "disqualification_reason": report.get("disqualification_reason") if isinstance(report, dict) else None
        })
        
    return history
