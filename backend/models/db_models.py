import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    resume_scores = relationship("ResumeScore", back_populates="user", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="user", cascade="all, delete-orphan")
    activities = relationship("DailyActivity", back_populates="user", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    filename = Column(String(255), nullable=False)
    extracted_text = Column(Text, nullable=False)
    parsed_json = Column(Text, nullable=True)  # JSON-encoded string
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="resumes")
    scores = relationship("ResumeScore", back_populates="resume", cascade="all, delete-orphan")


class ResumeScore(Base):
    __tablename__ = "resume_scores"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    target_job_title = Column(String(255), nullable=False)
    overall_score = Column(Float, nullable=False)
    breakdown_json = Column(Text, nullable=False)    # JSON string of all subscores
    suggestions_json = Column(Text, nullable=True)   # JSON string of rule-based & AI suggestions
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="resume_scores")
    resume = relationship("Resume", back_populates="scores")


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    target_role = Column(String(255), nullable=False)
    difficulty = Column(String(50), default="Medium")  # Easy, Medium, Hard
    status = Column(String(50), default="in_progress") # in_progress, completed, abandoned
    questions_json = Column(Text, nullable=False)      # JSON list of generated questions
    final_report_json = Column(Text, nullable=True)    # JSON with final scores, critique & exemplar answers
    overall_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="interviews")
    answers = relationship("InterviewAnswer", back_populates="interview", cascade="all, delete-orphan")


class InterviewAnswer(Base):
    __tablename__ = "interview_answers"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"), nullable=False)
    question_index = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), nullable=True) # HR, technical, project
    user_answer = Column(Text, nullable=False)
    duration_seconds = Column(Integer, default=0)
    score = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    interview = relationship("Interview", back_populates="answers")


class DailyActivity(Base):
    __tablename__ = "daily_activity"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    activity_date = Column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    activity_type = Column(String(50), nullable=False) # resume_analysis, mock_interview
    metadata_info = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="activities")
