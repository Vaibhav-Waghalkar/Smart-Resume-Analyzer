from datetime import datetime, date, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from models.db_models import DailyActivity, ResumeScore, Interview

def record_activity(db: Session, user_id: int, activity_type: str, metadata_info: str = "") -> DailyActivity:
    """
    Records an activity for today if not already recorded, or adds to records.
    """
    today_str = date.today().isoformat()
    existing = db.query(DailyActivity).filter(
        DailyActivity.user_id == user_id,
        DailyActivity.activity_date == today_str,
        DailyActivity.activity_type == activity_type
    ).first()

    if not existing:
        act = DailyActivity(
            user_id=user_id,
            activity_date=today_str,
            activity_type=activity_type,
            metadata_info=metadata_info
        )
        db.add(act)
        db.commit()
        db.refresh(act)
        return act
    return existing


def get_user_streak_and_heatmap(db: Session, user_id: int) -> Dict[str, Any]:
    """
    Calculates current streak, longest streak, total active days, and a 90-day heatmap.
    """
    records = db.query(DailyActivity.activity_date).filter(
        DailyActivity.user_id == user_id
    ).distinct().order_by(DailyActivity.activity_date.desc()).all()

    active_dates = set(r[0] for r in records)
    today = date.today()
    
    # Calculate current streak
    current_streak = 0
    check_day = today
    # If not active today, check yesterday
    if today.isoformat() not in active_dates:
        check_day = today - timedelta(days=1)

    while check_day.isoformat() in active_dates:
        current_streak += 1
        check_day -= timedelta(days=1)

    # Calculate longest streak
    sorted_dates = sorted([datetime.strptime(d, "%Y-%m-%d").date() for d in active_dates])
    longest_streak = 0
    temp_streak = 0
    prev_d = None

    for d in sorted_dates:
        if prev_d is None or d == prev_d + timedelta(days=1):
            temp_streak += 1
        else:
            temp_streak = 1
        if temp_streak > longest_streak:
            longest_streak = temp_streak
        prev_d = d

    # 90-day Heatmap items
    heatmap = []
    for i in range(89, -1, -1):
        day = today - timedelta(days=i)
        day_str = day.isoformat()
        heatmap.append({
            "date": day_str,
            "active": day_str in active_dates,
            "day_of_week": day.strftime("%a")
        })

    return {
        "current_streak": current_streak,
        "longest_streak": max(longest_streak, current_streak),
        "total_active_days": len(active_dates),
        "heatmap": heatmap
    }
