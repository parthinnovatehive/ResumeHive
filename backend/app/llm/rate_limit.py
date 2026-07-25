from datetime import date
from sqlalchemy.orm import Session
from app.modules.llm.models import LlmUsageLog, LlmDailyUsage

def check_and_increment_rate_limit(user_id: int, db: Session, max_requests: int = 15) -> bool:
    today = date.today()
    usage = db.query(LlmDailyUsage).filter(
        LlmDailyUsage.user_id == user_id,
        LlmDailyUsage.usage_date == today
    ).first()
    
    if not usage:
        usage = LlmDailyUsage(user_id=user_id, usage_date=today, request_count=0)
        db.add(usage)
        db.commit()
        db.refresh(usage)
        
    if usage.request_count >= max_requests:
        return False
        
    usage.request_count += 1
    db.commit()
    return True

def log_llm_usage(user_id: int, endpoint: str, tokens: int, db: Session):
    log_entry = LlmUsageLog(user_id=user_id, endpoint=endpoint, tokens_used=tokens)
    db.add(log_entry)
    db.commit()
