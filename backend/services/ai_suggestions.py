from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from services.ai_service import generate_structured_ai_response

class BulletPointRewrite(BaseModel):
    original: str
    improved: str
    impact_rationale: str

class KeywordSuggestion(BaseModel):
    keyword: str
    category: str
    importance: str  # Critical, Recommended, Optional
    context: str

class ATSTip(BaseModel):
    category: str
    issue: str
    fix: str

class EnhancedSuggestionsSchema(BaseModel):
    executive_summary: str
    top_strengths: List[str]
    critical_missing_keywords: List[KeywordSuggestion]
    bullet_point_rewrites: List[BulletPointRewrite]
    ats_formatting_tips: List[ATSTip]
    quantifiable_achievement_tips: List[str]


SYSTEM_PROMPT = """You are an elite Executive Tech Recruiter and certified ATS Optimization Specialist.
Analyze the provided candidate resume text, target job role, and preliminary score data.
Produce actionable, premium, quantifiable suggestions for the candidate following strict JSON format matching the schema:
{
  "executive_summary": "1-2 sentence executive appraisal of candidate fit for target role",
  "top_strengths": ["Key strength 1", "Key strength 2"],
  "critical_missing_keywords": [
    {"keyword": "e.g. Docker", "category": "DevOps", "importance": "Critical", "context": "Why it matters"}
  ],
  "bullet_point_rewrites": [
    {
      "original": "Weak bullet point from resume",
      "improved": "Action-oriented rewrite using XYZ formula (Accomplished [X] as measured by [Y] by doing [Z])",
      "impact_rationale": "Why this version wins recruiters"
    }
  ],
  "ats_formatting_tips": [
    {"category": "Headers", "issue": "Observed formatting or structuring flaw", "fix": "Specific fix"}
  ],
  "quantifiable_achievement_tips": [
    "Advice on metrics, latency, revenue, or efficiency numbers to incorporate"
  ]
}
Provide realistic, professional bullet point rewrites based on their actual experience.
"""


async def get_enhanced_ai_suggestions(
    resume_text: str,
    target_job_title: str,
    score_data: Dict[str, Any]
) -> Optional[Dict[str, Any]]:
    """
    Generates in-depth AI suggestions using Gemini with Groq fallback.
    """
    # Sample up to 3500 chars of resume text to prevent prompt overflow
    sample_text = resume_text[:3500]
    
    prompt = f"""
TARGET JOB ROLE: {target_job_title}
PRELIMINARY SCORES:
- Overall Score: {score_data.get('overall_score', 'N/A')}%
- Skill Match: {score_data.get('skill_match_score', 'N/A')}%
- Missing Skills Detected: {', '.join(score_data.get('missing_skills', [])[:8])}
- Experience Score: {score_data.get('experience_score', 'N/A')}%

CANDIDATE RESUME TEXT:
\"\"\"
{sample_text}
\"\"\"

Provide your structured review in strict JSON format.
"""

    return await generate_structured_ai_response(
        prompt=prompt,
        system_instruction=SYSTEM_PROMPT,
        pydantic_model=EnhancedSuggestionsSchema
    )
