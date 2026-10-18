from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import os
import tempfile
import uuid
from services.text_extractor import extract_text_from_pdf, get_pdf_metadata
from services.resume_parser import parse_resume
from services.resume_scorer import score_resume
from services.suggestion_engine import generate_suggestions

router = APIRouter()


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
async def upload_resume(file: UploadFile = File(...)):
    """
    Upload and extract text from a PDF resume.
    
    Args:
        file: PDF file upload
        
    Returns:
        JSON response with extracted text and metadata
    """
    # Validate file is a PDF
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Only PDF files are allowed."
        )
    
    # Check if file is empty
    if file.size == 0:
        raise HTTPException(
            status_code=400,
            detail="Empty file uploaded."
        )
    
    # Create temporary file
    temp_dir = tempfile.gettempdir()
    temp_filename = f"{uuid.uuid4()}_{file.filename}"
    temp_file_path = os.path.join(temp_dir, temp_filename)
    
    try:
        # Save uploaded file to temporary location
        with open(temp_file_path, "wb") as temp_file:
            content = await file.read()
            temp_file.write(content)
        
        # Validate file size after saving (additional check)
        if os.path.getsize(temp_file_path) == 0:
            raise HTTPException(
                status_code=400,
                detail="Empty file uploaded."
            )
        
        # Extract text from PDF
        extracted_text, error = extract_text_from_pdf(temp_file_path)
        
        if error:
            raise HTTPException(
                status_code=422,
                detail=f"Failed to extract text from PDF: {error}"
            )
        
        # Get metadata
        metadata = get_pdf_metadata(temp_file_path)
        
        # Calculate word count
        word_count = len(extracted_text.split()) if extracted_text else 0
        
        # Prepare response
        response_data = {
            "success": True,
            "data": {
                "filename": file.filename,
                "page_count": metadata.get("page_count", 0),
                "word_count": word_count,
                "file_size": metadata.get("file_size", 0),
                "extracted_text": extracted_text
            }
        }
        
        return JSONResponse(status_code=200, content=response_data)
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )
    finally:
        # Clean up temporary file
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass  # Best effort cleanup


@router.post("/api/parse-resume")
async def parse_resume_endpoint(request: ResumeTextRequest):
    """
    Parse resume text and extract structured information.
    
    Args:
        request: ResumeTextRequest containing the text to parse
        
    Returns:
        JSON response with parsed resume data (name, email, phone, skills, education, experience, total_experience_years)
    """
    try:
        # Validate input
        if not request.text or not request.text.strip():
            raise HTTPException(
                status_code=400,
                detail="Resume text cannot be empty."
            )
        
        # Parse resume using the service
        parsed_data = parse_resume(request.text)
        
        # Prepare response
        response_data = {
            "success": True,
            "data": parsed_data
        }
        
        return JSONResponse(status_code=200, content=response_data)
        
    except ImportError as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred during parsing: {str(e)}"
        )


@router.post("/api/score-resume")
async def score_resume_endpoint(request: ScoreResumeRequest):
    """
    Score a resume against a target job title.
    
    Args:
        request: ScoreResumeRequest containing resume_text, target_job_title, and optional parsed_data
        
    Returns:
        JSON response with scoring breakdown
    """
    try:
        # Validate input
        if not request.resume_text or not request.resume_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Resume text cannot be empty."
            )
        
        if not request.target_job_title or not request.target_job_title.strip():
            raise HTTPException(
                status_code=400,
                detail="Target job title cannot be empty."
            )
        
        # Score the resume
        score_data = score_resume(
            request.resume_text,
            request.target_job_title,
            request.parsed_data
        )
        
        # Prepare response
        response_data = {
            "success": True,
            "data": score_data
        }
        
        return JSONResponse(status_code=200, content=response_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred during scoring: {str(e)}"
        )


@router.post("/api/get-suggestions")
async def get_suggestions_endpoint(request: SuggestionsRequest):
    """
    Generate improvement suggestions based on score breakdown.
    
    Args:
        request: SuggestionsRequest containing resume_text, score_data, and target_job_title
        
    Returns:
        JSON response with suggestions list
    """
    try:
        # Validate input
        if not request.resume_text or not request.resume_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Resume text cannot be empty."
            )
        
        if not request.score_data:
            raise HTTPException(
                status_code=400,
                detail="Score data cannot be empty."
            )
        
        if not request.target_job_title or not request.target_job_title.strip():
            raise HTTPException(
                status_code=400,
                detail="Target job title cannot be empty."
            )
        
        # Generate suggestions
        suggestions = generate_suggestions(
            request.resume_text,
            request.score_data,
            request.target_job_title
        )
        
        # Prepare response
        response_data = {
            "success": True,
            "data": {
                "suggestions": suggestions
            }
        }
        
        return JSONResponse(status_code=200, content=response_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred during suggestion generation: {str(e)}"
        )
