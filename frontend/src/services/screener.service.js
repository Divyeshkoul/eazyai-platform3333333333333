import api from './api';
import { ENDPOINTS } from '../utils/constants';

// Session storage keys
const STORAGE_KEYS = {
  LAST_RESULTS: 'eazyai_last_results',
  SESSION_ID: 'eazyai_session_id'
};

export const screenerService = {
  analyzeResumes: async (jobConfig) => {
    const { load_from_blob, ...configWithoutFlag } = jobConfig;
    
    const response = await api.post(ENDPOINTS.ANALYZE, {
      job_config: configWithoutFlag,
      load_from_blob: load_from_blob !== false
    });
    
    // Save results to session storage automatically
    if (response.data) {
      sessionStorage.setItem(STORAGE_KEYS.LAST_RESULTS, JSON.stringify(response.data));
      if (response.data.metrics?.session_id) {
        sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, response.data.metrics.session_id);
      }
    }
    
    return response.data;
  },
  
  // Get cached results from session storage
  getCachedResults: () => {
    try {
      const cached = sessionStorage.getItem(STORAGE_KEYS.LAST_RESULTS);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Failed to parse cached results:', error);
      return null;
    }
  },
  
  // Get results from backend by session ID
  getResultsBySessionId: async (sessionId) => {
    const response = await api.get(`/api/screener/results/${sessionId}`);
    return response.data;
  },
  
  // Clear cached results
  clearCache: () => {
    sessionStorage.removeItem(STORAGE_KEYS.LAST_RESULTS);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_ID);
  },
  
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(ENDPOINTS.UPLOAD_RESUME, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  exportCSV: async (verdict = null) => {
    const url = verdict ? `${ENDPOINTS.EXPORT_CSV}?verdict=${verdict}` : ENDPOINTS.EXPORT_CSV;
    const response = await api.get(url, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  generateSummary: async (email) => {
    const response = await api.get(`${ENDPOINTS.GENERATE_SUMMARY}/${email}`, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  updateCandidate: async (candidateId, updates) => {
    const response = await api.patch(ENDPOINTS.UPDATE_CANDIDATE, {
      candidate_id: candidateId,
      ...updates
    });
    
    // Update cached results if they exist
    const cached = screenerService.getCachedResults();
    if (cached && cached.candidates) {
      cached.candidates = cached.candidates.map(c => 
        c.email === candidateId ? { ...c, ...updates } : c
      );
      sessionStorage.setItem(STORAGE_KEYS.LAST_RESULTS, JSON.stringify(cached));
    }
    
    return response.data;
  },
  
  sendEmail: async (email, subject, body) => {
    const response = await api.post('/api/screener/email/send', {
      email: email,
      subject: subject,
      body: body
    });
    return response.data;
  },
  
  sendBulkEmail: async (emails, verdict, role, companyName) => {
    const response = await api.post(ENDPOINTS.BULK_EMAIL, {
      candidate_emails: emails,
      verdict,
      role,
      company_name: companyName
    });
    return response.data;
  },

  clearUploadCache: async () => {
    const response = await api.delete('/api/screener/clear-cache');
    return response.data;
  }
};
