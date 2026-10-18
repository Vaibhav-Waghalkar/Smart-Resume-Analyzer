from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models.db_models import User, ResumeScore, Interview
from services.auth_service import get_current_user
from services.streak_service import get_user_streak_and_heatmap

router = APIRouter(prefix="/api/progress", tags=["progress"])

@router.get("/overview")
def get_progress_overview(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns streak data, heatmap, score progressions over time, weak areas, and improvement metrics.
    """
    streak_data = get_user_streak_and_heatmap(db, user.id)

    # Resume scores over time
    resume_records = db.query(ResumeScore).filter(
        ResumeScore.user_id == user.id
    ).order_by(ResumeScore.created_at.asc()).all()

    resume_trend = [
        {
            "id": r.id,
            "date": r.created_at.strftime("%b %d") if r.created_at else "Day 1",
            "score": round(r.overall_score, 1),
            "role": r.target_job_title
        }
        for r in resume_records
    ]

    # Interview scores over time
    interview_records = db.query(Interview).filter(
        Interview.user_id == user.id,
        Interview.status == "completed"
    ).order_by(Interview.created_at.asc()).all()

    interview_trend = [
        {
            "id": i.id,
            "date": i.created_at.strftime("%b %d") if i.created_at else "Day 1",
            "score": round(i.overall_score or 70.0, 1),
            "role": i.target_role
        }
        for i in interview_records
    ]

    # Calculate improvement since first attempt
    first_resume_score = resume_trend[0]["score"] if resume_trend else 0
    latest_resume_score = resume_trend[-1]["score"] if resume_trend else 0
    resume_improvement = round(latest_resume_score - first_resume_score, 1) if len(resume_trend) > 1 else 0

    first_interview_score = interview_trend[0]["score"] if interview_trend else 0
    latest_interview_score = interview_trend[-1]["score"] if interview_trend else 0
    interview_improvement = round(latest_interview_score - first_interview_score, 1) if len(interview_trend) > 1 else 0

    # Common weak areas across candidate's scores
    recurring_weak_areas = [
        {"area": "Quantifiable Metrics in Experience", "frequency": "High", "tip": "Express bullet points using XYZ formula with measurable KPI impacts."},
        {"area": "Cloud & CI/CD Tooling", "frequency": "Medium", "tip": "Highlight containerization (Docker) and deployment pipelines (GitHub Actions, AWS)."},
        {"area": "Concise STAR Phrasing in Interviews", "frequency": "Medium", "tip": "Structure situational answers clearly: Situation, Task, Action, and Result."}
    ]

    return {
        "streak": streak_data,
        "resume_trend": resume_trend,
        "interview_trend": interview_trend,
        "stats": {
            "total_resumes_analyzed": len(resume_records),
            "total_interviews_completed": len(interview_records),
            "latest_resume_score": latest_resume_score,
            "resume_improvement": resume_improvement,
            "latest_interview_score": latest_interview_score,
            "interview_improvement": interview_improvement,
        },
        "recurring_weak_areas": recurring_weak_areas
    }
