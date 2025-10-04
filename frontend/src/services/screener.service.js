import api from './api';
import { ENDPOINTS } from '../utils/constants';

export const screenerService = {
  analyzeResumes: async (jobConfig) => {
    const response = await api.post(ENDPOINTS.ANALYZE, {
      job_config: jobConfig,
      load_from_blob: true
    });
    return response.data;
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
  }
};