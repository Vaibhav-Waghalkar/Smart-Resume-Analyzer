import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# Load environment configuration
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

# Import database models and initialize tables
from database import engine, Base
import models.db_models
Base.metadata.create_all(bind=engine)

# Import routes
from routes.resume_routes import router as resume_router
from routes.auth_routes import router as auth_router
from routes.interview_routes import router as interview_router
from routes.progress_routes import router as progress_router

app = FastAPI(
    title="Smart Resume Analyzer API",
    description="Next-Generation AI Resume Evaluation, Mock Interview Simulator & Career Progression Platform",
    version="2.0.0"
)

# Parse CORS Origins from environment
cors_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(resume_router)
app.include_router(auth_router)
app.include_router(interview_router)
app.include_router(progress_router)

@app.get("/api/health")
async def health_check():
    gemini_ready = bool(os.getenv("GEMINI_API_KEY", "").strip())
    groq_ready = bool(os.getenv("GROQ_API_KEY", "").strip())
    return {
        "status": "healthy",
        "service": "Smart Resume Analyzer API v2.0",
        "providers": {
            "gemini": "configured" if gemini_ready else "missing",
            "groq": "configured" if groq_ready else "optional_missing"
        }
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
