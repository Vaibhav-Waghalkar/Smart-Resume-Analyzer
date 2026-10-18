# Smart Resume Analyzer

A full-stack application for analyzing resumes using AI and machine learning. Upload a PDF resume, extract key information, score it against job requirements, and get personalized improvement suggestions.

## Features

- **PDF Resume Upload**: Drag-and-drop or click to upload PDF resumes
- **Text Extraction**: Extract text from PDFs using pdfplumber with PyPDF2 fallback
- **Resume Parsing**: Extract name, email, phone, skills, education, and experience using spaCy NER
- **Job-Specific Scoring**: Score resumes against 10+ predefined job roles with weighted factors
- **Skill Analysis**: Match resume skills against job requirements with TF-IDF similarity for unknown roles
- **Improvement Suggestions**: Get actionable suggestions grouped by priority (high/medium/low)
- **Modern UI**: Beautiful, responsive React interface with Tailwind CSS and Recharts visualizations

## Project Structure

```
/smart-resume-analyzer
  /backend/
    main.py                    # FastAPI application entry point
    requirements.txt           # Python dependencies
    run.bat / stop.bat         # Windows start/stop scripts
    /routes/
      resume_routes.py         # API endpoints for resume operations
    /services/
      text_extractor.py        # PDF text extraction service
      resume_parser.py         # Resume parsing service (spaCy)
      resume_scorer.py         # Resume scoring service
      suggestion_engine.py     # Improvement suggestions service
    /models/                   # Pydantic models
    /utils/                    # Utility functions
  /frontend/
    src/
      App.jsx                  # Main React component
      /components/
        UploadSection.jsx       # File upload component
        ResultsDashboard.jsx    # Results display component
      /api/
        resumeApi.js            # API service layer
    index.css                   # Tailwind CSS directives
    tailwind.config.js         # Tailwind configuration
    run-frontend.bat            # Windows start script
  /sample-resumes/             # Sample resume PDFs for testing
  README.md                    # This file
```

## Backend Setup

### Prerequisites
- Python 3.11 or higher
- pip (Python package manager)

### Installation
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   ```bash
   # Windows
   .\venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Download spaCy model:
   ```bash
   python -m spacy download en_core_web_sm
   ```

### Running the Backend
- **Windows**: Run `run.bat` to start the server on port 8000
- **Manual**: 
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Stopping the Backend
- **Windows**: Run `stop.bat`
- **Manual**: Press `Ctrl+C` in the terminal

## Frontend Setup

### Prerequisites
- Node.js 16 or higher
- npm (comes with Node.js)

### Installation
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Frontend
- **Windows**: Run `run-frontend.bat`
- **Manual**:
   ```bash
   npm run dev
   ```
The frontend will run on port 5173.

## API Endpoints

### Health Check
**GET** `/api/health`

Returns server health status.

**Response:**
```json
{
  "status": "healthy"
}
```

### Upload Resume
**POST** `/api/upload-resume`

Upload a PDF resume and extract text.

**Request:** `multipart/form-data`
- `file`: PDF file

**Response:**
```json
{
  "success": true,
  "data": {
    "filename": "resume.pdf",
    "page_count": 2,
    "word_count": 450,
    "file_size": 102400,
    "extracted_text": "Full resume text..."
  }
}
```

**Error Responses:**
- `400` - Invalid file format or empty file
- `422` - Failed to extract text from PDF
- `500` - Server error

### Parse Resume
**POST** `/api/parse-resume`

Parse resume text and extract structured information.

**Request:**
```json
{
  "text": "Full resume text..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-123-4567",
    "skills": ["Python", "JavaScript", "SQL"],
    "education": [
      {
        "degree": "Bachelor of Science in Computer Science",
        "institution": "University Name",
        "years": "2018-2022"
      }
    ],
    "experience": [
      {
        "job_title": "Software Developer",
        "company": "Company Name",
        "duration": "2022-Present"
      }
    ],
    "total_experience_years": 3.5
  }
}
```

### Score Resume
**POST** `/api/score-resume`

Score a resume against a target job title.

**Request:**
```json
{
  "resume_text": "Full resume text...",
  "target_job_title": "Data Scientist",
  "parsed_data": { ... }  // Optional, from parse-resume endpoint
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overall_score": 75.5,
    "skill_match_score": 80.0,
    "matched_skills": ["Python", "SQL", "Machine Learning"],
    "missing_skills": ["TensorFlow", "PyTorch"],
    "education_score": 70.0,
    "experience_score": 75.0,
    "completeness_score": 80.0,
    "target_job_title": "Data Scientist"
  }
}
```

**Scoring Weights:**
- Skill Match: 50%
- Education: 15%
- Experience: 20%
- Formatting/Completeness: 15%

### Get Suggestions
**POST** `/api/get-suggestions`

Generate improvement suggestions based on score breakdown.

**Request:**
```json
{
  "resume_text": "Full resume text...",
  "score_data": { ... },  // From score-resume endpoint
  "target_job_title": "Data Scientist"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "category": "Skills",
        "priority": "high",
        "message": "Add these skills to your resume: TensorFlow, PyTorch..."
      },
      {
        "category": "Experience",
        "priority": "medium",
        "message": "Highlight quantifiable achievements..."
      }
    ]
  }
}
```

## Supported Job Titles

The system supports scoring against the following job titles:
- Data Scientist
- Frontend Developer
- Backend Developer
- Full Stack Developer
- DevOps Engineer
- ML Engineer
- Android Developer
- UI/UX Designer
- Business Analyst
- QA Engineer

For unknown job titles, the system uses TF-IDF cosine similarity to find the closest match.

## Technology Stack

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **Python 3.11** - Programming language
- **pdfplumber** - PDF text extraction (primary)
- **PyPDF2** - PDF text extraction (fallback)
- **spaCy** - NLP library for named entity recognition
- **scikit-learn** - Machine learning for TF-IDF similarity
- **nltk** - Natural language processing
- **pandas** - Data manipulation
- **pydantic** - Data validation

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Chart library for data visualization
- **Axios** - HTTP client for API requests

## Usage

1. Start the backend server (port 8000)
2. Start the frontend server (port 5173)
3. Open `http://localhost:5173` in your browser
4. Upload a PDF resume
5. Select a target job title
6. Click "Analyze Resume"
7. View the comprehensive analysis results and suggestions

## Testing

Place sample resume PDFs in the `/sample-resumes` folder for testing. See `sample-resumes/README.md` for recommendations.

## Troubleshooting

### Backend Issues
- **spaCy model not found**: Run `python -m spacy download en_core_web_sm`
- **CORS errors**: Ensure backend is running on port 8000 and frontend on port 5173
- **PDF extraction fails**: Try a different PDF or check if it's password-protected

### Frontend Issues
- **API connection errors**: Ensure backend is running
- **Build errors**: Run `npm install` to ensure all dependencies are installed
- **Port already in use**: Change port in Vite config or stop the process using the port

## License

This project is for educational and demonstration purposes.
