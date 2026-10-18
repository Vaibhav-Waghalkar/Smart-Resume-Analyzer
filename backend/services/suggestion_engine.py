from typing import Dict, List, Optional


def generate_suggestions(resume_text: str, score_data: Dict, target_job_title: str) -> List[Dict]:
    """
    Generate rule-based improvement suggestions based on score breakdown.
    
    Args:
        resume_text: The full text of the resume
        score_data: Score breakdown from resume_scorer
        target_job_title: The target job title
        
    Returns:
        List of suggestions with category, priority, and message
    """
    suggestions = []
    
    # Check for missing skills
    missing_skills = score_data.get('missing_skills', [])
    if missing_skills:
        top_missing = missing_skills[:3]
        suggestions.append({
            "category": "Skills",
            "priority": "high",
            "message": f"Add these skills to your resume: {', '.join(missing_skills)}. Consider taking a course on {', '.join(top_missing)} to strengthen your profile."
        })
    
    # Check for missing contact info (inferred from completeness score)
    completeness_score = score_data.get('completeness_score', 0)
    if completeness_score < 35:  # Missing both email and phone
        suggestions.append({
            "category": "Contact Information",
            "priority": "high",
            "message": "Add a professional email address and phone number to your resume header."
        })
    elif completeness_score < 50:  # Missing one of them
        suggestions.append({
            "category": "Contact Information",
            "priority": "high",
            "message": "Add a professional email address and phone number to ensure recruiters can contact you."
        })
    
    # Check experience score
    experience_score = score_data.get('experience_score', 0)
    if experience_score < 60:
        suggestions.append({
            "category": "Experience",
            "priority": "high",
            "message": "Highlight quantifiable achievements (e.g., 'Increased sales by 25%', 'Reduced bug count by 40%') in your experience section to demonstrate impact."
        })
    elif experience_score < 80:
        suggestions.append({
            "category": "Experience",
            "priority": "medium",
            "message": "Add more specific metrics and outcomes to your experience descriptions. Use numbers and percentages where possible."
        })
    
    # Check education score
    education_score = score_data.get('education_score', 0)
    if education_score < 50:
        suggestions.append({
            "category": "Education",
            "priority": "high",
            "message": "Add your degree, institution name, and graduation year to your education section."
        })
    elif education_score < 70:
        suggestions.append({
            "category": "Education",
            "priority": "medium",
            "message": "Include relevant coursework, certifications, or academic achievements to strengthen your education section."
        })
    
    # Check resume word count
    word_count = len(resume_text.split())
    if word_count < 200:
        suggestions.append({
            "category": "Content Length",
            "priority": "high",
            "message": f"Your resume seems too short ({word_count} words). Add more details about your projects, responsibilities, and achievements to reach at least 300-400 words."
        })
    elif word_count > 1000:
        suggestions.append({
            "category": "Content Length",
            "priority": "medium",
            "message": f"Your resume is quite long ({word_count} words). Consider trimming it to 1-2 pages (400-600 words) for better readability and recruiter focus."
        })
    
    # Check for Projects section
    if not has_projects_section(resume_text):
        suggestions.append({
            "category": "Projects",
            "priority": "high",
            "message": f"Add a Projects section showcasing relevant work, especially for {target_job_title} positions. Include project descriptions, technologies used, and outcomes."
        })
    
    # Check skill match score
    skill_match_score = score_data.get('skill_match_score', 0)
    if skill_match_score < 40:
        suggestions.append({
            "category": "Skills",
            "priority": "high",
            "message": f"Your skill match for {target_job_title} is low ({skill_match_score}%). Focus on acquiring and highlighting the key skills required for this role."
        })
    elif skill_match_score < 70:
        suggestions.append({
            "category": "Skills",
            "priority": "medium",
            "message": f"Improve your skill match for {target_job_title} by gaining experience with the missing skills and adding them to your resume."
        })
    
    # Check overall score
    overall_score = score_data.get('overall_score', 0)
    if overall_score < 50:
        suggestions.append({
            "category": "Overall",
            "priority": "high",
            "message": f"Your resume score is {overall_score}%. Significant improvements are needed. Focus on addressing the high-priority suggestions above."
        })
    elif overall_score < 70:
        suggestions.append({
            "category": "Overall",
            "priority": "medium",
            "message": f"Your resume score is {overall_score}%. Good foundation, but address the medium-priority suggestions to increase your chances."
        })
    elif overall_score < 85:
        suggestions.append({
            "category": "Overall",
            "priority": "low",
            "message": f"Your resume score is {overall_score}%. Strong resume! Consider the low-priority suggestions for further optimization."
        })
    
    # Check for action verbs in experience
    if not has_action_verbs(resume_text):
        suggestions.append({
            "category": "Experience",
            "priority": "medium",
            "message": "Use strong action verbs (e.g., 'Developed', 'Implemented', 'Led', 'Achieved') at the beginning of your experience bullet points."
        })
    
    # Check for summary/objective section
    if not has_summary_section(resume_text):
        suggestions.append({
            "category": "Structure",
            "priority": "medium",
            "message": "Add a professional summary or objective at the top of your resume to quickly highlight your key qualifications and career goals."
        })
    
    return suggestions


def has_projects_section(resume_text: str) -> bool:
    """
    Check if resume has a Projects section.
    """
    text_lower = resume_text.lower()
    project_keywords = ['projects', 'project experience', 'personal projects', 'academic projects']
    return any(keyword in text_lower for keyword in project_keywords)


def has_action_verbs(resume_text: str) -> bool:
    """
    Check if resume uses action verbs in experience section.
    """
    action_verbs = [
        'developed', 'implemented', 'led', 'achieved', 'created', 'managed',
        'designed', 'built', 'launched', 'increased', 'decreased', 'improved',
        'optimized', 'streamlined', 'coordinated', 'executed', 'delivered'
    ]
    text_lower = resume_text.lower()
    return any(verb in text_lower for verb in action_verbs)


def has_summary_section(resume_text: str) -> bool:
    """
    Check if resume has a summary or objective section.
    """
    text_lower = resume_text.lower()
    summary_keywords = ['summary', 'objective', 'profile', 'about me', 'professional summary']
    return any(keyword in text_lower for keyword in summary_keywords)


def prioritize_suggestions(suggestions: List[Dict]) -> List[Dict]:
    """
    Sort suggestions by priority (high > medium > low).
    """
    priority_order = {'high': 0, 'medium': 1, 'low': 2}
    return sorted(suggestions, key=lambda x: priority_order.get(x['priority'], 3))
