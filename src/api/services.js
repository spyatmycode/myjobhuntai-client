import api from './axios';

// ============================================
// AUTH SERVICES
// ============================================

export const authService = {
  /**
   * Login user
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<{token: string}>}
   */
  async login(email, password) {
    const response = await api.post('/api/auth/login', { email, password });
    // Token is at response.data.token (top level of response wrapper)
    const token = response.data.token;
    if (token) {
      localStorage.setItem('token', token);
    }
    return { token, data: response.data.data };
  },

  /**
   * Signup new user
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<void>}
   */
  async signup(email, password) {
    const response = await api.post('/api/auth/signup', { email, password });
    return response.data;
  },

  /**
   * Logout - clear stored credentials
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('candidateId');
  }
};

// ============================================
// CANDIDATE PROFILE SERVICES
// ============================================

export const candidateProfileService = {
  /**
   * Create a new candidate profile
   * @param {Object} profileData 
   * @returns {Promise<Object>}
   */
  async createProfile(profileData) {
    const response = await api.post('/api/candidate-profile/create-candidate-profile', profileData);
    return response.data.data;
  },

  /**
   * Get candidate profile by ID
   * @param {number} id 
   * @returns {Promise<Object>}
   */
  async getProfile(id) {
    const response = await api.get(`/api/candidate-profile/get-candidate/${id}`);
    return response.data.data;
  },

  /**
   * Get all candidates
   * @returns {Promise<Array>}
   */
  async getAllCandidates() {
    const response = await api.get('/api/candidate-profile/get-all-candidates');
    return response.data.data;
  },

  /**
   * Update candidate active status
   * @param {number} id 
   * @returns {Promise<Object>}
   */
  async updateActiveStatus(id) {
    const response = await api.put(`/api/candidate-profile/update-active/${id}`);
    return response.data.data;
  },

  /**
   * Delete candidate profile
   * @param {number} id 
   * @returns {Promise<void>}
   */
  async deleteProfile(id) {
    const response = await api.delete(`/api/candidate-profile/delete-candidate/${id}`);
    return response.data;
  }
};

// ============================================
// JOB APPLICATION SERVICES
// ============================================

export const jobApplicationService = {
  /**
   * Get all job applications for current user's candidate
   * @param {number} candidateId 
   * @returns {Promise<Array>}
   */
  async getCandidateApplications(candidateId) {
    const response = await api.get(`/api/job-application/get-candidate-job-applications/${candidateId}`);
    return response.data.data || [];
  },

  /**
   * Get all job applications (admin)
   * @returns {Promise<Array>}
   */
  async getAllApplications() {
    const response = await api.get('/api/job-application/get-all-job-applications');
    return response.data.data || [];
  },

  /**
   * Get single job application
   * @param {number} id 
   * @returns {Promise<Object>}
   */
  async getApplication(id) {
    const response = await api.get(`/api/job-application/get-job-application/${id}`);
    return response.data.data;
  },

  /**
   * Add new job application
   * @param {Object} applicationData - {companyName, jobTitle, jobDescription, status, candidateId}
   * @returns {Promise<Object>}
   */
  async addApplication(applicationData) {
    const response = await api.post('/api/job-application/add-job-application', applicationData);
    return response.data.data;
  },

  /**
   * Update job application status
   * @param {number} id 
   * @param {string} jobApplicationStatus - INTERESTED, APPLIED, INTERVIEW, OFFER, REJECTED, GHOSTED
   * @returns {Promise<Object>}
   */
  async updateStatus(id, jobApplicationStatus) {
    const response = await api.put(
      `/api/job-application/update-job-application-status/${id}`,
      null,
      { params: { jobApplicationStatus } }
    );
    return response.data.data;
  },

  /**
   * Delete job application
   * @param {number} id 
   * @returns {Promise<void>}
   */
  async deleteApplication(id) {
    const response = await api.delete(`/api/job-application/delete-job-application/${id}`);
    return response.data;
  }
};

// ============================================
// CANDIDATE RESUME SERVICES
// ============================================

export const resumeService = {
  /**
   * Get all resumes for current user
   * @returns {Promise<Array>}
   */
  async getCandidateResumes() {
    const response = await api.get('/api/candidate-resume/get-candidate-resumes');
    return response.data.data || [];
  },

  /**
   * Get all resumes (admin)
   * @returns {Promise<Array>}
   */
  async getAllResumes() {
    const response = await api.get('/api/candidate-resume/get-all-resumes');
    return response.data.data || [];
  },

  /**
   * Get single resume by ID
   * @param {number} id 
   * @returns {Promise<Object>}
   */
  async getResume(id) {
    const response = await api.get(`/api/candidate-resume/get-resume/${id}`);
    return response.data.data;
  },

  /**
   * Add new resume
   * CRITICAL: title and optionalUserPrompt are QUERY PARAMS, only resumeFile in FormData body
   * @param {File} resumeFile 
   * @param {string} title 
   * @param {string} optionalUserPrompt 
   * @returns {Promise<Object>} - Returns AI summary response
   */
  async addResume(resumeFile, title, optionalUserPrompt = '') {
    const formData = new FormData();
    formData.append('resumeFile', resumeFile);

    // Build query params
    const params = new URLSearchParams();
    params.append('title', title);
    if (optionalUserPrompt) {
      params.append('optionalUserPrompt', optionalUserPrompt);
    }

    const response = await api.post(
      `/api/candidate-resume/add-candidate-resume?${params.toString()}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    // Returns AIResumeSummaryResponse: {professionalSummary, skills, id, resumeUrl}
    return response.data.data;
  },

  /**
   * Update existing resume
   * @param {number} resumeId 
   * @param {string} title 
   * @param {string} resumeUrl 
   * @param {File} resumeFile 
   * @param {string} optionalUserPrompt 
   * @returns {Promise<Object>}
   */
  async updateResume(resumeId, title, resumeUrl, resumeFile = null, optionalUserPrompt = '') {
    const formData = new FormData();
    if (resumeFile) {
      formData.append('resumeFile', resumeFile);
    }
    if (optionalUserPrompt) {
      formData.append('optionalUserPrompt', optionalUserPrompt);
    }

    const params = new URLSearchParams();
    params.append('title', title);
    params.append('resumeUrl', resumeUrl);

    const response = await api.put(
      `/api/candidate-resume/update-candidate-resume/${resumeId}?${params.toString()}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data.data;
  },

  /**
   * Delete resume
   * @param {number} id 
   * @returns {Promise<void>}
   */
  async deleteResume(id) {
    const response = await api.delete(`/api/candidate-resume/delete-resume/${id}`);
    return response.data;
  }
};

// ============================================
// AI GENERATION SERVICES
// ============================================

export const aiService = {
  /**
   * Generate cover letter using AI
   * @param {number} candidateId 
   * @param {number} resumeId 
   * @param {number} jobApplicationId 
   * @param {string} title 
   * @param {string} optionalUserPrompt 
   * @returns {Promise<Object>} - AICoverLetterAnalysisResponse
   */
  async generateCoverLetter(candidateId, resumeId, jobApplicationId, title, optionalUserPrompt = '') {
    const params = new URLSearchParams();
    params.append('candidateId', candidateId);
    params.append('resumeId', resumeId);
    params.append('jobApplicationId', jobApplicationId);

    const body = {
      title,
      optionalUserPrompt: optionalUserPrompt || undefined,
    };

    const response = await api.post(
      `/api/ai/generate-cover-letter?${params.toString()}`,
      body
    );
    
    // Returns: {matchPercentage, matchingKeywords, missingKeywords, coverLetter, interviewTips}
    return response.data.data;
  }
};
