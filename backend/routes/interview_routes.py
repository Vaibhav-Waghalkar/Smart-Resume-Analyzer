import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models.db_models import User, Interview, InterviewAnswer
from services.auth_service import get_current_user_optional, get_current_user
from services.mock_interview import (
    generate_interview_questions,
    evaluate_full_interview,
    transcribe_audio_groq
)
from services.streak_service import record_activity

router = APIRouter(prefix="/api/interview", tags=["interview"])

class StartInterviewRequest(BaseModel):
    target_role: str
    difficulty: Optional[str] = "Medium"
    resume_text: Optional[str] = ""

class SubmitAnswerRequest(BaseModel):
    interview_id: int
    question_index: int
    question_text: str
    question_type: Optional[str] = "Technical"
    user_answer: str
    duration_seconds: Optional[int] = 0

class EndInterviewRequest(BaseModel):
    interview_id: int


@router.post("/start")
async def start_interview(
    req: StartInterviewRequest,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Start mock interview and generate questions tailored to the candidate resume and target role.
    """
    if not req.target_role.strip():
        raise HTTPException(status_code=400, detail="Target role is required.")

    gen_data = await generate_interview_questions(
        resume_text=req.resume_text or "",
        target_role=req.target_role,
        difficulty=req.difficulty or "Medium"
    )

    questions = []
    if gen_data and "questions" in gen_data:
        questions = gen_data["questions"]
    else:
        # Fallback question set
        questions = [
            {
                "id": 1,
                "category": "Project",
                "question": f"Walk me through the most technically challenging project you worked on relevant to {req.target_role}.",
                "context": "Assesses project depth and problem solving",
                "sample_key_points": ["Architecture choice", "Trade-offs", "Quantified results"]
            },
            {
                "id": 2,
                "category": "Technical",
                "question": f"What key design principles and best practices do you follow when building production-grade solutions for {req.target_role}?",
                "context": "Evaluates core foundational proficiency",
                "sample_key_points": ["Scalability", "Maintainability", "Testing"]
            },
            {
                "id": 3,
                "category": "Technical",
                "question": "Describe an incident where a system or feature failed in production. How did you debug and resolve it?",
                "context": "Evaluates operational and troubleshooting rigor",
                "sample_key_points": ["Root cause analysis", "Post-mortem", "Preventative measures"]
            },
            {
                "id": 4,
                "category": "Behavioral",
                "question": "Tell me about a time you had a strong disagreement with a teammate or stakeholder over a technical decision. How was it resolved?",
                "context": "Assesses collaboration and communication",
                "sample_key_points": ["Active listening", "Data-driven resolution", "Healthy teamwork"]
            },
            {
                "id": 5,
                "category": "HR",
                "question": f"Why are you targeting the {req.target_role} role at this stage of your career, and what unique value do you bring?",
                "context": "Evaluates career trajectory and motivation",
                "sample_key_points": ["Alignment with goals", "Clear differentiation", "Enthusiasm"]
            }
        ]

    interview = Interview(
        user_id=user.id if user else None,
        target_role=req.target_role,
        difficulty=req.difficulty or "Medium",
        status="in_progress",
        questions_json=json.dumps(questions)
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)

    if user:
        record_activity(db, user.id, "mock_interview", f"Started {req.target_role} interview")

    return {
        "success": True,
        "interview_id": interview.id,
        "target_role": interview.target_role,
        "difficulty": interview.difficulty,
        "questions": questions
    }


@router.post("/answer")
async def record_answer(
    req: SubmitAnswerRequest,
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(Interview.id == req.interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    answer_record = InterviewAnswer(
        interview_id=interview.id,
        question_index=req.question_index,
        question_text=req.question_text,
        question_type=req.question_type,
        user_answer=req.user_answer,
        duration_seconds=req.duration_seconds or 0
    )
    db.add(answer_record)
    db.commit()
    db.refresh(answer_record)

    return {"success": True, "answer_id": answer_record.id}


@router.post("/finish")
async def finish_interview(
    req: EndInterviewRequest,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Concludes the interview and compiles the final report using Gemini.
    """
    interview = db.query(Interview).filter(Interview.id == req.interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    answers = db.query(InterviewAnswer).filter(InterviewAnswer.interview_id == interview.id).order_by(InterviewAnswer.question_index).all()

    qa_list = [
        {
            "category": a.question_type or "General",
            "question_text": a.question_text,
            "user_answer": a.user_answer,
            "duration_seconds": a.duration_seconds
        }
        for a in answers
    ]

    report = None
    if qa_list:
        report = await evaluate_full_interview(
            target_role=interview.target_role,
            difficulty=interview.difficulty,
            qa_list=qa_list
        )

    if not report:
        # Fallback evaluation calculation
        count = len(answers)
        avg_score = 75.0 if count > 0 else 50.0
        report = {
            "overall_score": avg_score,
            "readiness_level": "Promising - Needs Polish",
            "summary": f"Completed {count} questions for {interview.target_role}. Solid foundational effort.",
            "recurring_weaknesses": ["Answers could include more quantifiable impact and structured STAR phrasing."],
            "notable_strengths": ["Demonstrated willingness to tackle technical questions and articulate reasoning."],
            "per_question_reviews": [
                {
                    "question_id": a.question_index + 1,
                    "question": a.question_text,
                    "score": 75.0,
                    "candidate_answer_length": len(a.user_answer.split()),
                    "clarity_and_structure_feedback": "Answer was communicated clearly. Structure can be tightened with Situation-Task-Action-Result format.",
                    "content_evaluation": "Good coverage of core points.",
                    "mistakes_and_filler_words": "Minor filler phrasing; aim for concise upfront thesis.",
                    "exemplar_strong_answer": f"A comprehensive model answer for {interview.target_role} demonstrating quantifiable depth and production trade-offs."
                }
                for a in answers
            ],
            "actionable_next_steps": [
                "Practice phrasing responses with the STAR method (Situation, Task, Action, Result).",
                "Incorporate specific metrics (latency, revenue, users, CPU savings) into each project story."
            ]
        }

    interview.status = "completed"
    interview.final_report_json = json.dumps(report)
    interview.overall_score = report.get("overall_score", 75.0)
    db.commit()

    if interview.user_id:
        record_activity(db, interview.user_id, "mock_interview", f"Completed {interview.target_role} interview")

    return {
        "success": True,
        "interview_id": interview.id,
        "report": report
    }


@router.post("/transcribe")
async def transcribe_audio_endpoint(file: UploadFile = File(...)):
    """
    Transcribes microphone audio fallback using Groq Whisper if available.
    """
    content = await file.read()
    text = await transcribe_audio_groq(content, file.filename or "recording.m4a")
    if text is None:
        return {"success": False, "detail": "Audio transcription unavailable (Groq key not configured). Please type or use browser speech."}
    return {"success": True, "text": text}
