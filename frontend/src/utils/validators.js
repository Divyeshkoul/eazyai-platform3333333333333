export const validateJobConfig = (config) => {
  const errors = {};
  
  if (!config.jd || config.jd.trim().length < 50) {
    errors.jd = 'Job description must be at least 50 characters';
  }
  
  if (config.skills && config.skills.split(',').length > 20) {
    errors.skills = 'Maximum 20 skills allowed';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateThresholds = (thresholds) => {
  const errors = {};
  
  Object.entries(thresholds).forEach(([key, value]) => {
    if (value < 0 || value > 100) {
      errors[key] = 'Value must be between 0 and 100';
    }
  });
  
  if (thresholds.shortlist_threshold <= thresholds.reject_threshold) {
    errors.shortlist_threshold = 'Shortlist threshold must be higher than reject threshold';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};