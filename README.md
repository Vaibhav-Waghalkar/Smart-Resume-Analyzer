# Smart Resume Analyzer AI v2.0 🚀

[![FastAPI](https://img.shields.io/badge/FastAPI-0.138.0-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini_3.8_Flash-Google_AI-4285F4.svg?logo=google&logoColor=white)](https://ai.google.dev/)
[![Groq](https://img.shields.io/badge/Groq-Inference_Llama_3.3_&_Whisper-F55036.svg)](https://groq.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An intelligent, full-stack career acceleration platform combining **ATS Resume Scoring**, **Google Gemini 3.8 Flash bullet point rewrites**, **Voice-powered AI Mock Interviews with Web Speech & Groq Whisper fallback**, and **Daily Practice Streaks with 90-day activity heatmaps**.

---

## 📸 Key Features & Architecture Preview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SMART RESUME ANALYZER v2.0                            │
├───────────────────────────────┬─────────────────────────────────────────────┤
│  🎯 1. Resume ATS Scorer      │  🎙️ 2. AI Mock Interview Simulator          │
│  • PDF text extraction        │  • Personalized questions from resume & role│
│  • Multi-factor match gauge   │  • Voice mode (Web Speech API + Whisper)    │
│  • Skill match vs missing bars│  • SpeechSynthesis audio playback           │
│  • Google XYZ formula rewrites│  • Gemini post-interview evaluation report  │
├───────────────────────────────┼─────────────────────────────────────────────┤
│  🔥 3. Daily Streaks & Habits │  📈 4. Performance Analytics                │
│  • Active practice streak     │  • Recharts score progression over time     │
│  • 90-day visual heatmap grid │  • Weak area identification & action plans  │
│  • JWT Auth & SQLite database │  • Production ready: Docker + CORS          │
└───────────────────────────────┴─────────────────────────────────────────────┘
```

---

## 🌟 Core Capabilities

### 1. ATS Scoring & Executive Suggestions
- **PDF Extraction**: Fast and reliable text extraction with `pdfplumber` and `PyPDF2`.
- **Competency Subscores**: Real-time breakdown across Skill Match, Years of Experience, Education, and Section Completeness.
- **Gemini 3.8 Flash Enhancements**:
  - Automatically rewrites weak bullet points using Google's **XYZ Formula** (*Accomplished [X] as measured by [Y] by doing [Z]*).
  - Flags critical missing keywords for 14+ target roles.
  - ATS formatting checklists and quantifiable achievement tips.
  - Strict JSON schema validation via **Pydantic** with automatic retries and Groq fallback.

### 2. Voice-Enabled AI Mock Interview Simulator
- **Dynamic Question Generation**: Generates technical, project, and behavioral questions blended directly from the candidate's actual resume projects.
- **Dual Voice Support**:
  - Speak your answers naturally with the **Web Speech API** or backend **Groq Whisper** (`/api/transcribe`).
  - Listen to interviewer questions with built-in `speechSynthesis` (with an instant mute toggle).
  - Live recording visualizer and speaking duration timer.
- **Comprehensive Post-Interview Report**:
  - No disruptive mid-interview feedback.
  - Deep per-question grading, filler words audit, structure critique, and **what a 95%+ model answer looks like**.

### 3. Habit Building, Streaks & Progress Tracking
- **Daily Streak Engine**: Tracks daily activity (resume analysis or completed mock interview).
- **Interactive 90-Day Heatmap**: GitHub-style activity contribution calendar.
- **Score Progression Curves**: Multi-attempt progression charts rendered with **Recharts**.
- **Recurring Weaknesses**: Identifies patterns where the candidate consistently loses points across sessions.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design Tokens (Dark / Light mode toggle)
- **Visualizations**: Recharts (Radial Gauge, Bar Charts, Score Curves)
- **Icons & Motion**: Lucide React, Framer Motion, Canvas Confetti
- **Audio & Voice**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)

### Backend
- **Framework**: FastAPI (Async, Python 3.11+)
- **Database**: SQLite (SQLAlchemy ORM, structured for straightforward PostgreSQL / Supabase migration)
- **Security & Auth**: JWT Tokens, Password Hashing (`passlib[bcrypt]`), Rate Limiting (`slowapi`)
- **AI Providers**:
  - Primary: **Google Gemini 3.8 Flash** via REST JSON schema API
  - Fallback / Whisper: **Groq** (`llama-3.3-70b-versatile` & `whisper-large-v3`)

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Python 3.10+ (or 3.11 recommended)
- Node.js 18+ and npm

### 1. Clone the Repository
```bash
git clone https://github.com/Vaibhav-Waghalkar/Smart-Resume-Analyzer.git
cd Smart-Resume-Analyzer
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
```
Open `backend/.env` and insert your Gemini API Key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=optional_groq_api_key_here
JWT_SECRET=supersecret_jwt_key_min_32_chars
DATABASE_URL=sqlite:///./smart_resume.db
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Start the backend:
```bash
uvicorn main:app --reload --port 8000
```
API Documentation will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🐳 Docker Deployment

To build and run the backend inside a Docker container:
```bash
cd backend
docker build -t smart-resume-backend .
docker run -p 8000:8000 --env-file .env smart-resume-backend
```

---

## 🌐 Production Deployment Guide

### Deploy Frontend on Vercel
1. Push your repository to GitHub.
2. In [Vercel Dashboard](https://vercel.com), click **Add New Project** and select `Smart-Resume-Analyzer`.
3. Set the **Root Directory** to `frontend`.
4. In **Environment Variables**, set:
   - `VITE_API_URL`: Your deployed backend URL (e.g., `https://smart-resume-api.onrender.com`).
5. Click **Deploy**.

### Deploy Backend on Render
1. In [Render Dashboard](https://render.com), create a new **Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3` (or `Docker` using the included `backend/Dockerfile`)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. In **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google AI Studio API key
   - `GROQ_API_KEY`: (Optional) Groq Cloud key
   - `JWT_SECRET`: A secure random 32-character string
   - `CORS_ORIGINS`: Your Vercel frontend domain (e.g., `https://smart-resume-analyzer.vercel.app`)
5. Click **Create Web Service**.

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).
