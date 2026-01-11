import axios from 'axios';

const API_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token header to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  signup: (signupRequest) => api.post('/api/auth/signup', signupRequest),
  login: (loginRequest) => api.post('/api/auth/login', loginRequest),
};

export const jobApplicationService = {
  // PUT /api/job-application/update-job-application/{id}
  updateJobApplication: (id, data) => 
    api.put(`/api/job-application/update-job-application/${id}`, data),

  // PUT /api/job-application/update-job-application-status/{id}
  updateJobApplicationStatus: (id, status) => 
    api.put(`/api/job-application/update-job-application-status/${id}`, null, { 
      params: { jobApplicationStatus: status } 
    }),

  // POST /api/job-application/add-job-application
  addJobApplication: (data) => 
    api.post('/api/job-application/add-job-application', data),

  // GET /api/job-application/get-job-application/{id}
  getJobApplication: (id) => 
    api.get(`/api/job-application/get-job-application/${id}`),

  // GET /api/job-application/get-candidate-job-applications/{id}
  getCandidateJobApplications: (id) => 
    api.get(`/api/job-application/get-candidate-job-applications/${id}`),

  // GET /api/job-application/get-all-job-applications
  getAllJobApplications: () => 
    api.get('/api/job-application/get-all-job-applications'),

  // DELETE /api/job-application/delete-job-application/{id}
  deleteJobApplication: (id) => 
    api.delete(`/api/job-application/delete-job-application/${id}`),
};

export const candidateResumeService = {
  // PUT /api/candidate-resume/update-candidate-resume/{resumeId}
  updateCandidateResume: (resumeId, title, resumeUrl, optionalUserPrompt, resumeFile) => {
    const formData = new FormData();
    if (optionalUserPrompt) formData.append('optionalUserPrompt', optionalUserPrompt);
    if (resumeFile) formData.append('resumeFile', resumeFile);
    
    return api.put(`/api/candidate-resume/update-candidate-resume/${resumeId}`, formData, {
      params: { title, resumeUrl },
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // POST /api/candidate-resume/add-candidate-resume
  addCandidateResume: (title, resumeFile, optionalUserPrompt) => {
    const formData = new FormData();
    formData.append('resumeFile', resumeFile);
    
    return api.post('/api/candidate-resume/add-candidate-resume', formData, {
      params: { title, optionalUserPrompt },
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // GET /api/candidate-resume/get-resume/{id}
  getResume: (id) => 
    api.get(`/api/candidate-resume/get-resume/${id}`),

  // GET /api/candidate-resume/get-candidate-resumes
  getCandidateResumes: () => 
    api.get('/api/candidate-resume/get-candidate-resumes'),

  // GET /api/candidate-resume/get-all-resumes
  getAllResumes: () => 
    api.get('/api/candidate-resume/get-all-resumes'),

  // DELETE /api/candidate-resume/delete-resume/{id}
  deleteResume: (id) => 
    api.delete(`/api/candidate-resume/delete-resume/${id}`),
};

export const candidateProfileService = {
  // PUT /api/candidate-profile/update-active/{id}
  updateActive: (id) => 
    api.put(`/api/candidate-profile/update-active/${id}`),

  // POST /api/candidate-profile/create-candidate-profile
  createCandidateProfile: (data) => 
    api.post('/api/candidate-profile/create-candidate-profile', data),

  // GET /api/candidate-profile/get-candidate/{id}
  getCandidate: (id) => 
    api.get(`/api/candidate-profile/get-candidate/${id}`),

  // GET /api/candidate-profile/get-all-candidates
  getAllCandidates: () => 
    api.get('/api/candidate-profile/get-all-candidates'),

  // DELETE /api/candidate-profile/delete-candidate/{id}
  deleteCandidate: (id) => 
    api.delete(`/api/candidate-profile/delete-candidate/${id}`),
};

export const aiGenerationService = {
  // POST /api/ai/generate-cover-letter
  generateCoverLetter: (candidateId, resumeId, jobApplicationId, data) => 
    api.post('/api/ai/generate-cover-letter', data, {
      params: { candidateId, resumeId, jobApplicationId }
    }),
};

export const healthService = {
  checkAlive: () => api.get('/alive'),
};

export default api;
