import re
from typing import Dict, List, Optional, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Job titles to required skills mapping
JOB_SKILL_MAPPING = {
    "Data Scientist": [
        "Python", "R", "SQL", "Machine Learning", "Deep Learning", "TensorFlow",
        "PyTorch", "Scikit-learn", "Pandas", "NumPy", "Statistics", "Data Visualization",
        "Jupyter", "NLP", "Computer Vision", "AWS", "Spark", "Hadoop"
    ],
    "Frontend Developer": [
        "JavaScript", "TypeScript", "React", "Vue", "Angular", "HTML", "CSS",
        "Tailwind", "Redux", "Webpack", "REST APIs", "Git", "Responsive Design",
        "UI/UX", "Testing", "Performance Optimization"
    ],
    "Backend Developer": [
        "Python", "Java", "Node.js", "Go", "SQL", "NoSQL", "REST APIs",
        "Microservices", "Docker", "Kubernetes", "Git", "CI/CD", "Authentication",
        "OAuth", "Message Queues", "Caching", "API Design"
    ],
    "Full Stack Developer": [
        "JavaScript", "TypeScript", "React", "Vue", "Node.js", "Python", "SQL",
        "NoSQL", "REST APIs", "GraphQL", "Docker", "Git", "CI/CD", "AWS",
        "Authentication", "Testing", "System Design"
    ],
    "DevOps Engineer": [
        "Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "Jenkins",
        "GitLab CI", "Terraform", "Ansible", "Linux", "Bash", "Monitoring",
        "Logging", "Networking", "Security", "Infrastructure as Code"
    ],
    "ML Engineer": [
        "Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch",
        "Scikit-learn", "MLOps", "AWS", "Docker", "Kubernetes", "SQL",
        "Data Engineering", "Model Deployment", "A/B Testing", "Statistics"
    ],
    "Android Developer": [
        "Kotlin", "Java", "Android SDK", "Jetpack Compose", "XML", "Gradle",
        "REST APIs", "SQLite", "Room", "Firebase", "Git", "MVVM",
        "Material Design", "Testing", "Performance Optimization"
    ],
    "UI/UX Designer": [
        "Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator", "User Research",
        "Wireframing", "Prototyping", "Design Systems", "CSS", "HTML",
        "JavaScript", "Accessibility", "User Testing", "Visual Design"
    ],
    "Business Analyst": [
        "SQL", "Excel", "Python", "Tableau", "Power BI", "Data Analysis",
        "Statistics", "Requirements Gathering", "Process Mapping", "Agile",
        "Stakeholder Management", "Data Visualization", "Reporting", "Communication"
    ],
    "QA Engineer": [
        "Testing", "Selenium", "Cypress", "Playwright", "Java", "Python",
        "API Testing", "Performance Testing", "Security Testing", "CI/CD",
        "JIRA", "Bug Tracking", "Test Automation", "Agile", "SQL"
    ]
}

# Typical experience requirements for each job (in years)
TYPICAL_EXPERIENCE_REQUIREMENTS = {
    "Data Scientist": 3,
    "Frontend Developer": 2,
    "Backend Developer": 2,
    "Full Stack Developer": 3,
    "DevOps Engineer": 3,
    "ML Engineer": 3,
    "Android Developer": 2,
    "UI/UX Designer": 2,
    "Business Analyst": 2,
    "QA Engineer": 2
}

# Generic job descriptions for TF-IDF matching
GENERIC_JOB_DESCRIPTIONS = {
    "Data Scientist": "Data scientist responsible for analyzing large datasets, building machine learning models, creating data visualizations, and providing insights to drive business decisions using Python, R, SQL, and statistical methods.",
    "Frontend Developer": "Frontend developer responsible for building user interfaces, implementing responsive designs, optimizing web performance, and collaborating with designers to create seamless user experiences using JavaScript, React, and modern CSS frameworks.",
    "Backend Developer": "Backend developer responsible for designing and implementing server-side logic, database interactions, API development, and ensuring system scalability and security using various programming languages and cloud technologies.",
    "Full Stack Developer": "Full stack developer responsible for end-to-end web application development, including both frontend and backend components, database management, and deployment using modern web technologies and cloud services.",
    "DevOps Engineer": "DevOps engineer responsible for infrastructure automation, CI/CD pipelines, cloud management, monitoring, and ensuring smooth deployment and operation of software systems using containerization and orchestration tools.",
    "ML Engineer": "Machine learning engineer responsible for deploying ML models, building ML pipelines, optimizing model performance, and integrating ML solutions into production systems using MLOps practices and cloud platforms.",
    "Android Developer": "Android developer responsible for building mobile applications for Android devices, implementing user interfaces, integrating APIs, and ensuring app performance and compatibility across different Android versions.",
    "UI/UX Designer": "UI/UX designer responsible for creating user-centered designs, conducting user research, building prototypes, and ensuring intuitive and accessible user interfaces across digital products.",
    "Business Analyst": "Business analyst responsible for analyzing business processes, gathering requirements, creating documentation, and providing data-driven insights to improve business operations and decision-making.",
    "QA Engineer": "Quality assurance engineer responsible for testing software applications, creating test plans, automating tests, and ensuring product quality through various testing methodologies and tools."
}


def score_resume(resume_text: str, job_title: str, parsed_data: Optional[Dict] = None) -> Dict:
    """
    Score a resume against a job title.
    
    Args:
        resume_text: The full text of the resume
        job_title: The target job title
        parsed_data: Optional pre-parsed resume data (name, email, skills, education, experience)
        
    Returns:
        Dictionary with scoring breakdown
    """
    # Normalize job title
    normalized_job_title = normalize_job_title(job_title)
    
    # Get required skills for the job
    required_skills = get_required_skills(normalized_job_title, resume_text)
    
    # Extract skills from resume if not provided
    if parsed_data and 'skills' in parsed_data:
        resume_skills = parsed_data['skills']
    else:
        resume_skills = extract_skills_from_text(resume_text)
    
    # Calculate skill match score
    skill_match_score, matched_skills, missing_skills = calculate_skill_match(
        resume_skills, required_skills
    )
    
    # Calculate education score
    education_score = calculate_education_score(
        parsed_data.get('education', []) if parsed_data else [], 
        normalized_job_title
    )
    
    # Calculate experience score
    experience_score = calculate_experience_score(
        parsed_data.get('experience', []) if parsed_data else [],
        parsed_data.get('total_experience_years', 0) if parsed_data else 0,
        normalized_job_title
    )
    
    # Calculate formatting/completeness score
    completeness_score = calculate_completeness_score(parsed_data if parsed_data else {}, resume_text)
    
    # Calculate overall weighted score
    overall_score = (
        skill_match_score * 0.50 +
        education_score * 0.15 +
        experience_score * 0.20 +
        completeness_score * 0.15
    )
    
    return {
        "overall_score": round(overall_score, 1),
        "skill_match_score": round(skill_match_score, 1),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "education_score": round(education_score, 1),
        "experience_score": round(experience_score, 1),
        "completeness_score": round(completeness_score, 1),
        "target_job_title": normalized_job_title
    }


def normalize_job_title(job_title: str) -> str:
    """
    Normalize job title to match predefined keys.
    """
    job_title_lower = job_title.lower().strip()
    
    # Direct match
    for key in JOB_SKILL_MAPPING.keys():
        if key.lower() == job_title_lower:
            return key
    
    # Partial match
    for key in JOB_SKILL_MAPPING.keys():
        if key.lower() in job_title_lower or job_title_lower in key.lower():
            return key
    
    # Return original if no match found
    return job_title


def get_required_skills(job_title: str, resume_text: str) -> List[str]:
    """
    Get required skills for a job title.
    If job title not in predefined list, use TF-IDF to find most similar job.
    """
    if job_title in JOB_SKILL_MAPPING:
        return JOB_SKILL_MAPPING[job_title]
    
    # Use TF-IDF to find most similar job
    most_similar_job = find_most_similar_job(job_title, resume_text)
    
    if most_similar_job and most_similar_job in JOB_SKILL_MAPPING:
        return JOB_SKILL_MAPPING[most_similar_job]
    
    # Default to a generic skill set if no match
    return ["Python", "JavaScript", "SQL", "Communication", "Problem Solving", "Teamwork"]


def find_most_similar_job(job_title: str, resume_text: str) -> Optional[str]:
    """
    Find the most similar job title using TF-IDF and cosine similarity.
    """
    try:
        # Create job descriptions
        job_descriptions = list(GENERIC_JOB_DESCRIPTIONS.values())
        job_titles = list(GENERIC_JOB_DESCRIPTIONS.keys())
        
        # Combine job title with resume for better matching
        combined_text = f"{job_title} {resume_text}"
        
        # Create TF-IDF vectors
        vectorizer = TfidfVectorizer(stop_words='english')
        all_texts = job_descriptions + [combined_text]
        
        tfidf_matrix = vectorizer.fit_transform(all_texts)
        
        # Calculate cosine similarity
        resume_vector = tfidf_matrix[-1]  # Last vector is the resume + job title
        job_vectors = tfidf_matrix[:-1]  # All other vectors are job descriptions
        
        similarities = cosine_similarity(resume_vector, job_vectors).flatten()
        
        # Get most similar job
        most_similar_index = np.argmax(similarities)
        
        if similarities[most_similar_index] > 0.1:  # Threshold for similarity
            return job_titles[most_similar_index]
        
        return None
    except Exception:
        return None


def extract_skills_from_text(text: str) -> List[str]:
    """
    Extract skills from resume text using the skills database.
    """
    from services.resume_parser import SKILLS_DATABASE
    
    found_skills = set()
    text_lower = text.lower()
    
    for skill in SKILLS_DATABASE:
        skill_variations = [skill.lower()]
        
        if "js" in skill.lower():
            skill_variations.append(skill.lower().replace("js", "js"))
            skill_variations.append(skill.lower().replace(".js", "js"))
        if ".js" in skill.lower():
            skill_variations.append(skill.lower().replace(".js", ""))
            skill_variations.append(skill.lower().replace(".js", "js"))
        
        for variation in skill_variations:
            if variation in text_lower:
                found_skills.add(skill)
                break
    
    return sorted(list(found_skills))


def calculate_skill_match(resume_skills: List[str], required_skills: List[str]) -> Tuple[float, List[str], List[str]]:
    """
    Calculate skill match percentage.
    
    Returns:
        Tuple of (score, matched_skills, missing_skills)
    """
    if not required_skills:
        return 100.0, [], []
    
    resume_skills_lower = [skill.lower() for skill in resume_skills]
    required_skills_lower = [skill.lower() for skill in required_skills]
    
    matched_skills = []
    missing_skills = []
    
    for i, req_skill in enumerate(required_skills):
        req_skill_lower = required_skills_lower[i]
        if any(req_skill_lower in resume_skill or resume_skill in req_skill_lower 
               for resume_skill in resume_skills_lower):
            matched_skills.append(required_skills[i])
        else:
            missing_skills.append(required_skills[i])
    
    match_percentage = (len(matched_skills) / len(required_skills)) * 100
    return match_percentage, matched_skills, missing_skills


def calculate_education_score(education: List[Dict], job_title: str) -> float:
    """
    Calculate education relevance score based on job requirements.
    """
    if not education:
        return 50.0  # Neutral score if no education info
    
    score = 0.0
    
    # Check for relevant degrees based on job
    relevant_degrees = {
        "Data Scientist": ["Bachelor", "Master", "PhD", "Computer Science", "Mathematics", "Statistics"],
        "ML Engineer": ["Bachelor", "Master", "PhD", "Computer Science", "Mathematics", "Engineering"],
        "Frontend Developer": ["Bachelor", "Computer Science", "Software Engineering", "Information Technology"],
        "Backend Developer": ["Bachelor", "Computer Science", "Software Engineering", "Information Technology"],
        "Full Stack Developer": ["Bachelor", "Computer Science", "Software Engineering", "Information Technology"],
        "DevOps Engineer": ["Bachelor", "Computer Science", "Engineering", "Information Technology"],
        "Android Developer": ["Bachelor", "Computer Science", "Software Engineering", "Mobile Development"],
        "UI/UX Designer": ["Bachelor", "Design", "Human-Computer Interaction", "Fine Arts"],
        "Business Analyst": ["Bachelor", "Master", "Business", "Finance", "Economics", "MBA"],
        "QA Engineer": ["Bachelor", "Computer Science", "Software Engineering", "Information Technology"]
    }
    
    job_relevant_degrees = relevant_degrees.get(job_title, ["Bachelor", "Master", "PhD"])
    
    for edu in education:
        degree = edu.get('degree', '').lower()
        institution = edu.get('institution', '')
        
        # Check for relevant degree
        if any(relevant_degree.lower() in degree for relevant_degree in job_relevant_degrees):
            score += 30.0
        
        # Bonus for advanced degrees
        if 'master' in degree or 'm.s.' in degree or 'm.tech' in degree:
            score += 15.0
        elif 'phd' in degree or 'doctorate' in degree:
            score += 20.0
        
        # Bonus for recognized institutions
        if institution and any(word in institution.lower() for word in ['university', 'institute', 'college']):
            score += 10.0
    
    return min(score, 100.0)


def calculate_experience_score(experience: List[Dict], total_years: float, job_title: str) -> float:
    """
    Calculate experience score based on years and relevance.
    """
    typical_years = TYPICAL_EXPERIENCE_REQUIREMENTS.get(job_title, 2)
    
    if total_years == 0:
        return 30.0  # Low score if no experience
    
    # Base score based on years
    if total_years >= typical_years:
        base_score = 100.0
    elif total_years >= typical_years * 0.75:
        base_score = 80.0
    elif total_years >= typical_years * 0.5:
        base_score = 60.0
    else:
        base_score = 40.0
    
    # Bonus for relevant experience
    relevant_bonus = 0.0
    for exp in experience:
        job_title_lower = exp.get('job_title', '').lower()
        if any(word in job_title_lower for word in ['developer', 'engineer', 'analyst', 'designer']):
            relevant_bonus += 5.0
    
    return min(base_score + relevant_bonus, 100.0)


def calculate_completeness_score(parsed_data: Dict, resume_text: str) -> float:
    """
    Calculate completeness score based on resume formatting and information presence.
    """
    score = 0.0
    
    # Check for contact information
    if parsed_data.get('email'):
        score += 20.0
    if parsed_data.get('phone'):
        score += 15.0
    if parsed_data.get('name'):
        score += 15.0
    
    # Check for skills
    if parsed_data.get('skills') and len(parsed_data['skills']) > 0:
        score += 15.0
    
    # Check for education
    if parsed_data.get('education') and len(parsed_data['education']) > 0:
        score += 15.0
    
    # Check for experience
    if parsed_data.get('experience') and len(parsed_data['experience']) > 0:
        score += 20.0
    
    return score
