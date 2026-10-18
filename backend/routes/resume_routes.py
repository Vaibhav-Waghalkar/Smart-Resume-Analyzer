import os
import json
import uuid
import tempfile
from typing import Optional, Dict, Any
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models.db_models import User, Resume, ResumeScore
from services.auth_service import get_current_user_optional
from services.text_extractor import extract_text_from_pdf, get_pdf_metadata
from services.resume_parser import parse_resume
from services.resume_scorer import score_resume
from services.suggestion_engine import generate_suggestions
from services.ai_suggestions import get_enhanced_ai_suggestions
from services.streak_service import record_activity

router = APIRouter(tags=["resume"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB limit


class ResumeTextRequest(BaseModel):
    text: str


class ScoreResumeRequest(BaseModel):
    resume_text: str
    target_job_title: str
    parsed_data: Optional[dict] = None


class SuggestionsRequest(BaseModel):
    resume_text: str
    score_data: dict
    target_job_title: str


@router.post("/api/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Upload and extract text from a PDF resume with size and format validation.
    """
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Only PDF files are supported."
        )

    # Read and validate file content
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds maximum allowed size of 10MB.")

    temp_dir = tempfile.gettempdir()
    temp_filename = f"{uuid.uuid4()}_{file.filename}"
    temp_file_path = os.path.join(temp_dir, temp_filename)

    try:
        with open(temp_file_path, "wb") as temp_file:
            temp_file.write(content)

        extracted_text, error = extract_text_from_pdf(temp_file_path)
        if error:
            raise HTTPException(
                status_code=422,
                detail=f"Failed to extract text from PDF: {error}"
            )

        metadata = get_pdf_metadata(temp_file_path)
        word_count = len(extracted_text.split()) if extracted_text else 0

        # Persist resume record in database
        resume_record = Resume(
            user_id=user.id if user else None,
            filename=file.filename,
            extracted_text=extracted_text
        )
        db.add(resume_record)
        db.commit()
        db.refresh(resume_record)

        if user:
            record_activity(db, user.id, "resume_analysis", f"Uploaded {file.filename}")

        return JSONResponse(status_code=200, content={
            "success": True,
            "data": {
                "resume_id": resume_record.id,
                "filename": file.filename,
                "page_count": metadata.get("page_count", 0),
                "word_count": word_count,
                "file_size": len(content),
                "extracted_text": extracted_text
            }
        })
    finally:
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass


@router.post("/api/parse-resume")
async def parse_resume_endpoint(request: ResumeTextRequest):
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty.")
    
    parsed_data = parse_resume(request.text)
    return JSONResponse(status_code=200, content={"success": True, "data": parsed_data})


@router.post("/api/score-resume")
async def score_resume_endpoint(
    request: ScoreResumeRequest,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional)
):
    if not request.resume_text or not request.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty.")
    if not request.target_job_title or not request.target_job_title.strip():
        raise HTTPException(status_code=400, detail="Target job title cannot be empty.")

    score_data = score_resume(
        request.resume_text,
        request.target_job_title,
        request.parsed_data
    )

    # Persist score if user or session
    score_record = ResumeScore(
        user_id=user.id if user else None,
        target_job_title=request.target_job_title,
        overall_score=score_data.get("overall_score", 0),
        breakdown_json=json.dumps(score_data)
    )
    db.add(score_record)
    db.commit()

    if user:
        record_activity(db, user.id, "resume_analysis", f"Scored resume for {request.target_job_title}")

    return JSONResponse(status_code=200, content={"success": True, "data": score_data})


@router.post("/api/get-suggestions")
async def get_suggestions_endpoint(request: SuggestionsRequest):
    """
    Generate combined rule-based and AI-powered (Gemini/Groq) suggestions.
    """
    if not request.resume_text or not request.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty.")
    if not request.score_data:
        raise HTTPException(status_code=400, detail="Score data cannot be empty.")
    if not request.target_job_title or not request.target_job_title.strip():
        raise HTTPException(status_code=400, detail="Target job title cannot be empty.")

    # 1. Rule-based suggestions (fast & guaranteed baseline)
    rule_suggestions = generate_suggestions(
        request.resume_text,
        request.score_data,
        request.target_job_title
    )

    # 2. Advanced AI suggestions via Gemini (with Groq fallback)
    ai_enhanced = await get_enhanced_ai_suggestions(
        request.resume_text,
        request.target_job_title,
        request.score_data
    )

    return JSONResponse(status_code=200, content={
        "success": True,
        "data": {
            "suggestions": rule_suggestions,
            "ai_enhanced": ai_enhanced
        }
    })
