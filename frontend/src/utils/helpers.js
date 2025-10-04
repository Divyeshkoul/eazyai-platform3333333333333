export const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatScore = (score) => {
  return typeof score === 'number' ? `${Math.round(score)}%` : 'N/A';
};

export const getScoreColor = (score) => {
  if (score >= 75) return '#1e8e3e'; // Green
  if (score >= 50) return '#f9ab00'; // Orange
  return '#d93025'; // Red
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateFileType = (filename) => {
  const allowedExtensions = ['.pdf', '.docx', '.doc'];
  return allowedExtensions.some(ext => filename.toLowerCase().endsWith(ext));
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const getVerdictBadgeClass = (verdict) => {
  const classes = {
    shortlist: 'badge-success',
    review: 'badge-warning',
    reject: 'badge-error'
  };
  return classes[verdict] || 'badge-default';
};