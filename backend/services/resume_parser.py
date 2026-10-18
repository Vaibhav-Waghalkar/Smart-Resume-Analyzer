import re
from typing import Dict, List, Optional, Tuple
from datetime import datetime

# spaCy replaced with lightweight regex-based name extraction


# Predefined skills database (150+ tech skills)
SKILLS_DATABASE = [
    # Programming Languages
    "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "Go", "Rust", "PHP", "Ruby",
    "Swift", "Kotlin", "Scala", "R", "MATLAB", "Perl", "Lua", "Shell", "Bash", "PowerShell",
    "SQL", "NoSQL", "GraphQL", "HTML", "CSS", "SASS", "LESS",
    
    # Web Frameworks
    "React", "ReactJS", "React.js", "Vue", "VueJS", "Vue.js", "Angular", "AngularJS", "Angular.js",
    "Next.js", "Nuxt.js", "Svelte", "Ember", "Backbone", "jQuery", "Django", "Flask", "FastAPI",
    "Spring", "Spring Boot", "Express", "Node.js", "NestJS", "Laravel", "Rails", "ASP.NET",
    
    # Frontend Libraries
    "Redux", "MobX", "Axios", "Fetch", "Webpack", "Vite", "Parcel", "Babel", "Tailwind", "Bootstrap",
    "Material UI", "Ant Design", "Chakra UI", "Styled Components", "CSS Modules", "SASS",
    
    # Backend & API
    "REST", "RESTful", "SOAP", "gRPC", "WebSocket", "GraphQL", "API", "Microservices",
    "Docker", "Kubernetes", "K8s", "CI/CD", "Jenkins", "GitLab CI", "GitHub Actions",
    
    # Cloud & DevOps
    "AWS", "Amazon Web Services", "Azure", "GCP", "Google Cloud Platform", "Heroku",
    "DigitalOcean", "Vercel", "Netlify", "Cloudflare", "Terraform", "Ansible", "Puppet",
    "Chef", "Nginx", "Apache", "Linux", "Unix", "Windows Server",
    
    # Databases
    "MySQL", "PostgreSQL", "MongoDB", "Redis", "Elasticsearch", "SQLite", "Oracle",
    "Cassandra", "DynamoDB", "Firebase", "Supabase", "Prisma", "Sequelize", "Hibernate",
    
    # Data Science & ML
    "Machine Learning", "ML", "Deep Learning", "DL", "Data Science", "TensorFlow",
    "PyTorch", "Keras", "Scikit-learn", "Pandas", "NumPy", "Matplotlib", "Seaborn",
    "Jupyter", "NLTK", "Spacy", "OpenCV", "NLP", "Computer Vision", "AI",
    
    # Mobile Development
    "React Native", "Flutter", "Ionic", "Xamarin", "Android", "iOS", "SwiftUI",
    "Jetpack Compose", "Kotlin Multiplatform",
    
    # Testing
    "Jest", "Mocha", "Chai", "Selenium", "Cypress", "Playwright", "PyTest",
    "Unit Testing", "Integration Testing", "E2E Testing", "TDD", "BDD",
    
    # Version Control
    "Git", "GitHub", "GitLab", "Bitbucket", "SVN", "Mercurial",
    
    # Development Tools
    "VS Code", "Visual Studio", "IntelliJ IDEA", "PyCharm", "Eclipse", "Xcode",
    "Android Studio", "Postman", "Swagger", "OpenAPI",
    
    # Other Technologies
    "Agile", "Scrum", "Kanban", "Jira", "Confluence", "Slack", "Trello",
    "Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator",
    "Markdown", "LaTeX", "Excel", "PowerPoint", "Word"
]


def parse_resume(text: str) -> Dict:
    """
    Parse resume text and extract structured information.
    
    Args:
        text: Resume text content
        
    Returns:
        Dictionary with parsed resume data
    """
    # Extract information
    name = extract_name(text)
    email = extract_email(text)
    phone = extract_phone(text)
    skills = extract_skills(text)
    education = extract_education(text)
    experience = extract_experience(text)
    total_experience = calculate_total_experience(experience)
    
    return {
        "name": name,
        "email": email,
        "phone": phone,
        "skills": skills,
        "education": education,
        "experience": experience,
        "total_experience_years": total_experience
    }


def extract_name(text: str) -> Optional[str]:
    """
    Extract candidate name using heuristic regex.
    Looks for a 2-4 word title-cased line near the top of the resume.
    """
    lines = text.strip().split('\n')
    # Check first 10 non-empty lines for a name-like pattern
    name_pattern = re.compile(r'^[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,3}$')
    skip_words = {"resume", "curriculum", "vitae", "cv", "profile", "summary", "objective"}
    for line in lines[:10]:
        line = line.strip()
        if not line:
            continue
        if line.lower() in skip_words:
            continue
        if name_pattern.match(line) and len(line) < 60:
            return line
    return None


def extract_email(text: str) -> Optional[str]:
    """
    Extract email address using regex.
    """
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, text, re.IGNORECASE)
    return emails[0] if emails else None


def extract_phone(text: str) -> Optional[str]:
    """
    Extract phone number using regex.
    Supports various formats: (123) 456-7890, 123-456-7890, 123.456.7890, +1-123-456-7890
    """
    phone_patterns = [
        r'\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',  # US format
        r'\+?(\d{1,3})?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',  # International
    ]
    
    for pattern in phone_patterns:
        phones = re.findall(pattern, text)
        if phones:
            return phones[0].strip()
    return None


def extract_skills(text: str) -> List[str]:
    """
    Extract skills from resume text using predefined skills database.
    Case-insensitive matching with handling for variations.
    """
    found_skills = set()
    text_lower = text.lower()
    
    for skill in SKILLS_DATABASE:
        # Create variations for matching
        skill_variations = [skill.lower()]
        
        # Add common variations
        if "js" in skill.lower():
            skill_variations.append(skill.lower().replace("js", "js"))
            skill_variations.append(skill.lower().replace(".js", "js"))
        if ".js" in skill.lower():
            skill_variations.append(skill.lower().replace(".js", ""))
            skill_variations.append(skill.lower().replace(".js", "js"))
        
        # Check if any variation exists in text
        for variation in skill_variations:
            if variation in text_lower:
                found_skills.add(skill)
                break
    
    return sorted(list(found_skills))


def extract_education(text: str) -> List[Dict]:
    """
    Extract education information using keyword-based section detection.
    """
    education_entries = []
    
    # Keywords for education section
    education_keywords = ["education", "academic", "qualification", "degree", "university", "college"]
    
    # Find education section
    lines = text.split('\n')
    education_section = []
    in_education_section = False
    
    for i, line in enumerate(lines):
        line_lower = line.lower().strip()
        
        # Check if we're entering education section
        if any(keyword in line_lower for keyword in education_keywords):
            in_education_section = True
            education_section.append(line)
            continue
        
        # Check if we're leaving education section (next major section)
        if in_education_section:
            if line_lower and not any(keyword in line_lower for keyword in education_keywords):
                # Check if this is a new section header
                if line_lower.isupper() or (len(line_lower) < 50 and ':' in line_lower):
                    break
                education_section.append(line)
    
    # Parse education entries from the section
    education_text = '\n'.join(education_section)
    
    # Extract degree patterns
    degree_patterns = [
        r'(Bachelor|Master|PhD|Doctorate|B\.S\.|M\.S\.|B\.A\.|M\.A\.|B\.Tech|M\.Tech|B\.E\.|M\.E\.)',
        r'(Computer Science|Information Technology|Software Engineering|Data Science|MBA)',
    ]
    
    # Extract institution patterns
    institution_patterns = [
        r'(University|College|Institute|School of|Academy)',
    ]
    
    # Extract year patterns
    year_patterns = [
        r'\b(19|20)\d{2}\b',
        r'\b(19|20)\d{2}\s*-\s*(19|20)\d{2}\b',
    ]
    
    # Simple extraction - group by lines that contain degree/institution keywords
    for line in education_section:
        entry = {}
        
        # Extract degree
        for pattern in degree_patterns:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                entry["degree"] = match.group(0)
                break
        
        # Extract institution
        for pattern in institution_patterns:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                entry["institution"] = line.strip()
                break
        
        # Extract years
        years = re.findall(year_patterns[1], line)
        if years:
            entry["years"] = years[0]
        else:
            single_years = re.findall(year_patterns[0], line)
            if single_years:
                entry["years"] = single_years[0]
        
        if entry:
            education_entries.append(entry)
    
    return education_entries


def extract_experience(text: str) -> List[Dict]:
    """
    Extract experience information using section detection and regex patterns.
    """
    experience_entries = []
    
    # Keywords for experience section
    experience_keywords = ["experience", "work history", "employment", "professional experience", "work experience"]
    
    # Find experience section
    lines = text.split('\n')
    experience_section = []
    in_experience_section = False
    
    for i, line in enumerate(lines):
        line_lower = line.lower().strip()
        
        # Check if we're entering experience section
        if any(keyword in line_lower for keyword in experience_keywords):
            in_experience_section = True
            experience_section.append(line)
            continue
        
        # Check if we're leaving experience section (next major section)
        if in_experience_section:
            if line_lower and not any(keyword in line_lower for keyword in experience_keywords):
                # Check if this is a new section header
                if line_lower.isupper() or (len(line_lower) < 50 and ':' in line_lower):
                    break
                experience_section.append(line)
    
    # Parse experience entries from the section
    experience_text = '\n'.join(experience_section)
    
    # Extract company names (capitalized words, often Inc, Ltd, Corp, etc.)
    company_patterns = [
        r'\b[A-Z][a-zA-Z\s&]+(?:Inc|Ltd|Corp|LLC|Company|Technologies|Solutions|Systems)\b',
        r'\b[A-Z][a-zA-Z\s]{2,}\b',  # General capitalized company names
    ]
    
    # Extract job titles
    job_title_patterns = [
        r'(Senior|Lead|Principal|Staff|Junior|Intern)?\s*(Software|Data|Machine Learning|Frontend|Backend|Full Stack|DevOps|Product|Project)?\s*(Engineer|Developer|Manager|Director|Analyst|Scientist|Architect|Consultant)',
        r'(CTO|CFO|CEO|COO|VP|Director)',
    ]
    
    # Extract date ranges
    date_patterns = [
        r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\s*-\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b',
        r'\b\d{1,2}/\d{1,2}/\d{4}\s*-\s*\d{1,2}/\d{1,2}/\d{4}\b',
        r'\b(19|20)\d{2}\s*-\s*(19|20)\d{2}\b',
        r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\s*-\s*(Present|Current|Now)\b',
    ]
    
    # Simple extraction - group by lines that contain job title or company patterns
    for line in experience_section:
        entry = {}
        
        # Extract job title
        for pattern in job_title_patterns:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                entry["job_title"] = match.group(0)
                break
        
        # Extract company
        for pattern in company_patterns:
            matches = re.findall(pattern, line)
            if matches:
                entry["company"] = matches[0].strip()
                break
        
        # Extract date range
        for pattern in date_patterns:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                entry["duration"] = match.group(0)
                break
        
        if entry:
            experience_entries.append(entry)
    
    return experience_entries


def calculate_total_experience(experience_entries: List[Dict]) -> float:
    """
    Calculate total years of experience from experience entries.
    """
    total_years = 0.0
    
    for entry in experience_entries:
        duration = entry.get("duration", "")
        if not duration:
            continue
        
        # Parse date range to calculate years
        years = extract_years_from_duration(duration)
        total_years += years
    
    return round(total_years, 1)


def extract_years_from_duration(duration: str) -> float:
    """
    Extract years from a duration string.
    """
    # Handle "Present" or "Current"
    duration = duration.replace("Present", str(datetime.now().year))
    duration = duration.replace("Current", str(datetime.now().year))
    
    # Try to extract two years
    year_pattern = r'\b(19|20)\d{2}\s*-\s*(19|20)\d{2}\b'
    match = re.search(year_pattern, duration)
    
    if match:
        start_year = int(match.group(1))
        end_year = int(match.group(2))
        return end_year - start_year
    
    # Try month-year format
    month_year_pattern = r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})\s*-\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})\b'
    match = re.search(month_year_pattern, duration, re.IGNORECASE)
    
    if match:
        start_year = int(match.group(1))
        end_year = int(match.group(2))
        return end_year - start_year
    
    return 0.0
