export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const ENDPOINTS = {
  // Screener
  ANALYZE: '/api/screener/analyze',
  UPLOAD_RESUME: '/api/upload/resume',
  EXPORT_CSV: '/api/screener/export/csv',
  GENERATE_SUMMARY: '/api/screener/summary',
  UPDATE_CANDIDATE: '/api/screener/candidate/update',
  SEND_EMAIL: '/api/screener/email/send',
  BULK_EMAIL: '/api/screener/email/bulk',
  
  // Dashboard
  DASHBOARD_STATS: '/api/dashboard/stats',
  ANALYTICS: '/api/dashboard/analytics',
  RECENT_ACTIVITY: '/api/dashboard/recent-activity',
  
  // Gmail
  GMAIL_STATUS: '/api/gmail/status',
  GMAIL_SYNC: '/api/gmail/sync',
  GMAIL_HISTORY: '/api/gmail/history',
  
  // Health
  HEALTH: '/health'
};

export const VERDICTS = {
  SHORTLIST: 'shortlist',
  REVIEW: 'review',
  REJECT: 'reject'
};

export const VERDICT_COLORS = {
  shortlist: '#1e8e3e',
  review: '#f9ab00',
  reject: '#d93025'
};

export const VERDICT_LABELS = {
  shortlist: 'Shortlisted',
  review: 'Under Review',
  reject: 'Rejected'
};

export const EXPERIENCE_RANGES = [
  '0–1 yrs',
  '1–3 yrs',
  '2–4 yrs',
  '4+ yrs'
];

export const DEFAULT_THRESHOLDS = {
  jd_threshold: 60,
  skills_threshold: 65,
  domain_threshold: 50,
  experience_threshold: 55,
  shortlist_threshold: 75,
  reject_threshold: 40
};

export const FILE_FORMATS = {
  PDF: '.pdf',
  DOCX: '.docx',
  DOC: '.doc'
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB