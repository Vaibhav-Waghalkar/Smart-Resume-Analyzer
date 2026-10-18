import os
import json
import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import httpx
from services.ai_service import (
    generate_structured_ai_response,
    call_gemini_json,
    call_groq_json
)

logger = logging.getLogger("mock_interview")

class QuestionItem(BaseModel):
    id: int
    category: str  # HR, Technical, System Design, Behavioral, Project
    question: str
    context: str
    sample_key_points: List[str]

class QuestionGenerationSchema(BaseModel):
    role: str
    difficulty: str
    questions: List[QuestionItem]

class PerQuestionEvaluation(BaseModel):
    question_id: int
    question: str
    score: float  # out of 100
    candidate_answer_length: int
    clarity_and_structure_feedback: str
    content_evaluation: str
    mistakes_and_filler_words: str
    exemplar_strong_answer: str

class FinalInterviewReportSchema(BaseModel):
    overall_score: float
    readiness_level: str  # e.g. "Strong Hire", "Promising - Needs Polish", "Needs Preparation"
    summary: str
    recurring_weaknesses: List[str]
    notable_strengths: List[str]
    per_question_reviews: List[PerQuestionEvaluation]
    actionable_next_steps: List[str]


QUESTION_GEN_SYSTEM_PROMPT = """You are an elite Lead Technical Hiring Bar Raiser conducting an AI Mock Interview.
Given the candidate's resume and target role + difficulty, generate 5-6 highly tailored interview questions.
Rules:
1. Include at least 2 questions directly referencing projects, tech stack, or experience mentioned in their resume.
2. Include 2 technical/coding/architecture questions pertinent to the target role and difficulty.
3. Include 1 behavioral or leadership question (STAR methodology).
Return strict JSON matching the schema:
{
  "role": "Role title",
  "difficulty": "Easy|Medium|Hard",
  "questions": [
    {
      "id": 1,
      "category": "Project",
      "question": "The interview question text",
      "context": "Why this question tests their background or role",
      "sample_key_points": ["Key point 1 to look for", "Key point 2"]
    }
  ]
}
"""

REPORT_GEN_SYSTEM_PROMPT = """You are the Lead Hiring Manager compiling the Final Post-Interview Evaluation Report.
Evaluate all answers provided by the candidate across the entire interview session.
Do NOT sugarcoat; provide constructive, high-value, actionable feedback.
For each answer:
- Assess technical accuracy, depth, structure, clarity, answer length, and filler words or hesitation.
- Provide a full exemplar strong answer demonstrating what a 95%+ score looks like.

You must return valid JSON strictly matching this structure:
{
  "overall_score": 82.5,
  "readiness_level": "Strong Hire | Promising - Needs Polish | Needs Preparation",
  "summary": "High-level summary of candidate performance",
  "recurring_weaknesses": ["Weakness 1", "Weakness 2"],
  "notable_strengths": ["Strength 1", "Strength 2"],
  "per_question_reviews": [
    {
      "question_id": 1,
      "question": "Question text",
      "score": 85.0,
      "candidate_answer_length": 45,
      "clarity_and_structure_feedback": "Critique of structure and delivery",
      "content_evaluation": "Technical accuracy and depth",
      "mistakes_and_filler_words": "Filler words or gaps observed",
      "exemplar_strong_answer": "Complete 95%+ model answer"
    }
  ],
  "actionable_next_steps": ["Step 1", "Step 2"]
}
"""

async def generate_interview_questions(
    resume_text: str,
    target_role: str,
    difficulty: str = "Medium"
) -> Optional[Dict[str, Any]]:
    """
    Generates interview questions personalized to the candidate's resume.
    """
    sample_text = resume_text[:3000] if resume_text else "General candidate for role"
    prompt = f"""
TARGET ROLE: {target_role}
DIFFICULTY LEVEL: {difficulty}

CANDIDATE RESUME HIGHLIGHTS:
\"\"\"
{sample_text}
\"\"\"

Create 5 tailored interview questions ranging across Project, Technical, and Behavioral categories.
"""
    return await generate_structured_ai_response(
        prompt=prompt,
        system_instruction=QUESTION_GEN_SYSTEM_PROMPT,
        pydantic_model=QuestionGenerationSchema
    )


async def evaluate_full_interview(
    target_role: str,
    difficulty: str,
    qa_list: List[Dict[str, Any]]
) -> Optional[Dict[str, Any]]:
    """
    Evaluates all questions and answers at the conclusion of the interview session.
    """
    qa_formatted = []
    for i, qa in enumerate(qa_list):
        qa_formatted.append(f"""
Question {i+1} [{qa.get('category', 'Technical')}]: {qa.get('question_text')}
Candidate Answer:
\"\"\"{qa.get('user_answer', 'No answer provided')}\"\"\"
Time Taken: {qa.get('duration_seconds', 0)} seconds
""")

    prompt = f"""
ROLE: {target_role}
DIFFICULTY: {difficulty}

INTERVIEW TRANSCRIPT:
{''.join(qa_formatted)}

Produce the comprehensive Final Post-Interview Report strictly following JSON format.
"""

    return await generate_structured_ai_response(
        prompt=prompt,
        system_instruction=REPORT_GEN_SYSTEM_PROMPT,
        pydantic_model=FinalInterviewReportSchema
    )


async def transcribe_audio_groq(file_bytes: bytes, filename: str) -> Optional[str]:
    """
    Transcribes spoken audio using Groq Whisper model if Groq key is present.
    """
    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    if not groq_key:
        return None

    url = "https://api.groq.com/openai/v1/audio/transcriptions"
    headers = {"Authorization": f"Bearer {groq_key}"}
    files = {"file": (filename, file_bytes, "audio/m4a")}
    data = {"model": "whisper-large-v3", "response_format": "json"}

    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            res = await client.post(url, headers=headers, files=files, data=data)
            if res.status_code == 200:
                return res.json().get("text", "")
            else:
                logger.warning(f"Groq Whisper transcription failed ({res.status_code}): {res.text}")
    except Exception as e:
        logger.warning(f"Whisper transcription error: {e}")

    return None
