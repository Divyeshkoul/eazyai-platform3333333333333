import React, { useState } from 'react';
import { FileText, Settings, Play } from 'lucide-react';
import Slider from '../common/slider';
import { DEFAULT_THRESHOLDS, EXPERIENCE_RANGES } from '../../utils/constants';

const JobConfiguration = ({ onAnalyze, loading = false }) => {
  const [config, setConfig] = useState({
    jd: '',
    domain: '',
    skills: '',
    experience_range: '0–1 yrs',
    ...DEFAULT_THRESHOLDS,
    top_n: 0,
    load_from_blob: true
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const styles = {
    container: {
      background: '#ffffff',
      height: '100%'
    },
    header: {
      padding: '20px 24px',
      borderBottom: '1px solid #f1f3f4',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    headerIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      background: '#e8f0fe',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#1a73e8'
    },
    headerText: {
      flex: 1
    },
    title: {
      fontSize: '16px',
      fontWeight: 500,
      color: '#202124',
      margin: 0
    },
    subtitle: {
      fontSize: '13px',
      color: '#5f6368',
      margin: '4px 0 0 0'
    },
    body: {
      padding: '24px',
      overflowY: 'auto',
      height: 'calc(100% - 180px)'
    },
    section: {
      marginBottom: '24px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: 500,
      color: '#202124',
      marginBottom: '8px'
    },
    required: {
      color: '#d93025',
      marginLeft: '4px'
    },
    textarea: {
      width: '100%',
      minHeight: '120px',
      padding: '12px',
      fontSize: '14px',
      border: '1px solid #dadce0',
      borderRadius: '4px',
      fontFamily: "'Roboto', sans-serif",
      resize: 'vertical',
      transition: 'border-color 0.2s',
      outline: 'none'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      fontSize: '14px',
      border: '1px solid #dadce0',
      borderRadius: '4px',
      fontFamily: "'Roboto', sans-serif",
      transition: 'border-color 0.2s',
      outline: 'none'
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      fontSize: '14px',
      border: '1px solid #dadce0',
      borderRadius: '4px',
      fontFamily: "'Roboto', sans-serif",
      background: '#ffffff',
      cursor: 'pointer',
      outline: 'none'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '16px'
    },
    advancedToggle: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 16px',
      background: '#f8f9fa',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 500,
      color: '#1a73e8',
      marginBottom: '16px',
      width: '100%',
      justifyContent: 'center',
      transition: 'background 0.2s'
    },
    thresholdsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '20px',
      padding: '20px',
      background: '#f8f9fa',
      borderRadius: '8px',
      marginTop: '16px'
    },
    footer: {
      padding: '20px 24px',
      borderTop: '1px solid #f1f3f4',
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#ffffff'
    },
    button: {
      padding: '10px 24px',
      fontSize: '14px',
      fontWeight: 500,
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s'
    },
    primaryButton: {
      background: '#1a73e8',
      color: '#ffffff',
      boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3)'
    },
    secondaryButton: {
      background: '#ffffff',
      color: '#1a73e8',
      border: '1px solid #dadce0'
    },
    helperText: {
      fontSize: '12px',
      color: '#5f6368',
      marginTop: '4px'
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      padding: '12px',
      background: '#f8f9fa',
      borderRadius: '4px',
      border: '1px solid #dadce0'
    },
    checkbox: {
      width: '18px',
      height: '18px',
      cursor: 'pointer'
    }
  };

  const handleSubmit = () => {
    if (!config.jd.trim()) {
      alert('Please enter a job description');
      return;
    }
    onAnalyze(config);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <FileText size={20} />
        </div>
        <div style={styles.headerText}>
          <h3 style={styles.title}>Job Configuration</h3>
          <p style={styles.subtitle}>Configure requirements and thresholds</p>
        </div>
      </div>

      <div style={styles.body}>
        {/* Job Description */}
        <div style={styles.section}>
          <label style={styles.label}>
            Job Description <span style={styles.required}>*</span>
          </label>
          <textarea
            style={styles.textarea}
            placeholder="Paste the complete job description here..."
            value={config.jd}
            onChange={(e) => setConfig({ ...config, jd: e.target.value })}
            onFocus={(e) => e.target.style.borderColor = '#1a73e8'}
            onBlur={(e) => e.target.style.borderColor = '#dadce0'}
          />
          <div style={styles.helperText}>
            Minimum 50 characters required
          </div>
        </div>

        {/* Basic Fields */}
        <div style={styles.grid}>
          <div style={styles.section}>
            <label style={styles.label}>Domain</label>
            <input
              type="text"
              style={styles.input}
              placeholder="e.g., Healthcare, Fintech"
              value={config.domain}
              onChange={(e) => setConfig({ ...config, domain: e.target.value })}
              onFocus={(e) => e.target.style.borderColor = '#1a73e8'}
              onBlur={(e) => e.target.style.borderColor = '#dadce0'}
            />
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Required Skills</label>
            <input
              type="text"
              style={styles.input}
              placeholder="e.g., Python, React, AWS"
              value={config.skills}
              onChange={(e) => setConfig({ ...config, skills: e.target.value })}
              onFocus={(e) => e.target.style.borderColor = '#1a73e8'}
              onBlur={(e) => e.target.style.borderColor = '#dadce0'}
            />
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Experience Range</label>
            <select
              style={styles.select}
              value={config.experience_range}
              onChange={(e) => setConfig({ ...config, experience_range: e.target.value })}
            >
              {EXPERIENCE_RANGES.map((range) => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Resume Source Selection */}
        <div style={styles.section}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={config.load_from_blob}
              onChange={(e) => setConfig({ ...config, load_from_blob: e.target.checked })}
              style={styles.checkbox}
            />
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#202124' }}>
              Load from Azure Blob Storage
            </span>
          </label>
          <div style={styles.helperText}>
            {config.load_from_blob 
              ? '✓ Will scan resumes from Azure (including Gmail sync)' 
              : '✗ Will use manually uploaded resumes only'}
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <button
          style={styles.advancedToggle}
          onClick={() => setShowAdvanced(!showAdvanced)}
          onMouseEnter={(e) => e.target.style.background = '#f1f3f4'}
          onMouseLeave={(e) => e.target.style.background = '#f8f9fa'}
        >
          <Settings size={16} />
          {showAdvanced ? 'Hide' : 'Show'} Advanced Thresholds
        </button>

        {/* Advanced Thresholds */}
        {showAdvanced && (
          <div style={styles.thresholdsGrid}>
            <Slider
              label="JD Similarity"
              value={config.jd_threshold}
              onChange={(value) => setConfig({ ...config, jd_threshold: value })}
              min={0}
              max={100}
              helperText="Minimum semantic match with JD"
            />
            <Slider
              label="Skills Match"
              value={config.skills_threshold}
              onChange={(value) => setConfig({ ...config, skills_threshold: value })}
              min={0}
              max={100}
              helperText="Required skills coverage"
            />
            <Slider
              label="Domain Match"
              value={config.domain_threshold}
              onChange={(value) => setConfig({ ...config, domain_threshold: value })}
              min={0}
              max={100}
              helperText="Industry experience match"
            />
            <Slider
              label="Experience Match"
              value={config.experience_threshold}
              onChange={(value) => setConfig({ ...config, experience_threshold: value })}
              min={0}
              max={100}
              helperText="Years of experience alignment"
            />
            <Slider
              label="Shortlist Threshold"
              value={config.shortlist_threshold}
              onChange={(value) => setConfig({ ...config, shortlist_threshold: value })}
              min={0}
              max={100}
              helperText="Minimum score for shortlisting"
            />
            <Slider
              label="Reject Threshold"
              value={config.reject_threshold}
              onChange={(value) => setConfig({ ...config, reject_threshold: value })}
              min={0}
              max={100}
              helperText="Maximum score for rejection"
            />
          </div>
        )}
      </div>

      <div style={styles.footer}>
        <button
          style={{ ...styles.button, ...styles.secondaryButton }}
          onClick={() => setConfig({ jd: '', domain: '', skills: '', experience_range: '0–1 yrs', ...DEFAULT_THRESHOLDS, top_n: 0, load_from_blob: true })}
          onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
          onMouseLeave={(e) => e.target.style.background = '#ffffff'}
        >
          Reset
        </button>
        <button
          style={{ ...styles.button, ...styles.primaryButton }}
          onClick={handleSubmit}
          disabled={loading}
          onMouseEnter={(e) => !loading && (e.target.style.background = '#1557b0')}
          onMouseLeave={(e) => !loading && (e.target.style.background = '#1a73e8')}
        >
          <Play size={16} />
          {loading ? 'Analyzing...' : 'Start Analysis'}
        </button>
      </div>
    </div>
  );
};

export default JobConfiguration;