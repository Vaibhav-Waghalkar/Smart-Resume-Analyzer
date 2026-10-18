import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Predefined job titles for autocomplete
export const JOB_TITLES = [
  'Data Scientist',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'ML Engineer',
  'Android Developer',
  'UI/UX Designer',
  'Business Analyst',
  'QA Engineer',
];

export const resumeApi = {
  // Upload resume and extract text
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/upload-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
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

  // Get improvement suggestions
  getSuggestions: async (resumeText, scoreData, targetJobTitle) => {
    const response = await api.post('/api/get-suggestions', {
      resume_text: resumeText,
      score_data: scoreData,
      target_job_title: targetJobTitle,
    });
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/api/health');
    return response.data;
  },
};
