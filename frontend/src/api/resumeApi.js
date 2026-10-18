import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization token to requests if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sra_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const JOB_TITLES = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Scientist',
  'ML Engineer',
  'DevOps Engineer',
  'Cloud Solutions Architect',
  'Android Developer',
  'iOS Developer',
  'UI/UX Designer',
  'Product Manager',
  'Business Analyst',
  'QA Automation Engineer',
  'Cybersecurity Analyst'
];

export const resumeApi = {
  // Upload resume and extract text
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/upload-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Parse resume text
  parseResume: async (text) => {
    const response = await api.post('/api/parse-resume', { text });
    return response.data;
  },

  // Score resume against job title
  scoreResume: async (resumeText, targetJobTitle, parsedData = null) => {
    const response = await api.post('/api/score-resume', {
      resume_text: resumeText,
      target_job_title: targetJobTitle,
      parsed_data: parsedData,
    });
    return response.data;
  },

  // Get improvement suggestions (rule-based + Gemini enhanced)
  getSuggestions: async (resumeText, scoreData, targetJobTitle) => {
    const response = await api.post('/api/get-suggestions', {
      resume_text: resumeText,
      score_data: scoreData,
      target_job_title: targetJobTitle,
    });
    return response.data;
  },

  // Auth APIs
  login: async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    if (res.data?.access_token) {
      localStorage.setItem('sra_token', res.data.access_token);
      localStorage.setItem('sra_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  register: async (email, password, name) => {
    const res = await api.post('/api/auth/register', { email, password, name });
    if (res.data?.access_token) {
      localStorage.setItem('sra_token', res.data.access_token);
      localStorage.setItem('sra_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/api/auth/me');
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('sra_token');
    localStorage.removeItem('sra_user');
  },

  // Mock Interview APIs
  startInterview: async (targetRole, difficulty, resumeText = '') => {
    const res = await api.post('/api/interview/start', {
      target_role: targetRole,
      difficulty: difficulty,
      resume_text: resumeText
    });
    return res.data;
  },

  submitInterviewAnswer: async (interviewId, questionIndex, questionText, questionType, userAnswer, durationSeconds) => {
    const res = await api.post('/api/interview/answer', {
      interview_id: interviewId,
      question_index: questionIndex,
      question_text: questionText,
      question_type: questionType,
      user_answer: userAnswer,
      duration_seconds: durationSeconds
    });
    return res.data;
  },

  finishInterview: async (interviewId) => {
    const res = await api.post('/api/interview/finish', {
      interview_id: interviewId
    });
    return res.data;
  },

  transcribeAudio: async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'speech_recording.webm');
    const res = await api.post('/api/interview/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  // Progress & Analytics APIs
  getProgressOverview: async () => {
    const res = await api.get('/api/progress/overview');
    return res.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/api/health');
    return response.data;
  },
};
