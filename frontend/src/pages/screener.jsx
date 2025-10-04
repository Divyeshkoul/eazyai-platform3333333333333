import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Mail, RefreshCw } from 'lucide-react';
import JobConfiguration from '../components/screener/JobConfiguration';
import Breadcrumb from '../components/layout/breadcrumb';
import { screenerService } from '../services/screener.service';
import Loader from '../components/common/loader';
import api from '../services/api';

const Screener = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      let successCount = 0;
      
      for (let file of files) {
        await screenerService.uploadResume(file);
        successCount++;
      }
      
      alert(`Successfully uploaded ${successCount} resume(s)!`);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      event.target.value = ''; // Reset input
    }
  };

  const handleGmailSync = async () => {
    try {
      setSyncing(true);
      await api.post('/api/gmail/sync');
      alert('Gmail sync started! Check notifications for updates.');
      
      // Check status after 5 seconds
      setTimeout(async () => {
        const response = await api.get('/api/gmail/status');
        const status = response.data;
        alert(`Sync complete! Processed ${status.emails_processed} emails, uploaded ${status.files_uploaded} resumes.`);
        setSyncing(false);
      }, 5000);
    } catch (error) {
      console.error('Gmail sync failed:', error);
      alert('Gmail sync failed. Please check your settings.');
      setSyncing(false);
    }
  };

  const handleAnalyze = async (config) => {
    try {
      setAnalyzing(true);
      const result = await screenerService.analyzeResumes(config);
      
      alert(`Analysis complete! Processed ${result.total_processed} candidates`);
      
      setTimeout(() => {
        navigate('/screener-results', { 
          state: { results: result },
          replace: false 
        });
      }, 500);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      alert(`Analysis failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const styles = {
    container: {
      maxWidth: '1000px',
      animation: 'fadeIn 0.3s ease'
    },
    header: {
      marginBottom: '24px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 400,
      color: '#202124',
      margin: '0 0 8px 0'
    },
    subtitle: {
      fontSize: '14px',
      color: '#5f6368'
    },
    actionsBar: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
      padding: '16px',
      background: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #dadce0'
    },
    uploadLabel: {
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: 500,
      background: '#1a73e8',
      color: '#ffffff',
      borderRadius: '4px',
      cursor: uploading ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s',
      opacity: uploading ? 0.6 : 1
    },
    syncButton: {
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: 500,
      background: '#34a853',
      color: '#ffffff',
      border: 'none',
      borderRadius: '4px',
      cursor: syncing ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s',
      opacity: syncing ? 0.6 : 1
    },
    hiddenInput: {
      display: 'none'
    }
  };

  if (analyzing) {
    return (
      <Loader 
        size="large" 
        fullScreen 
        text="Analyzing resumes with AI... This may take 1-2 minutes"
      />
    );
  }

  return (
    <div style={styles.container}>
      <Breadcrumb items={[{ label: 'Resume Screener', path: '/screener' }]} />
      
      <div style={styles.header}>
        <h1 style={styles.title}>Resume Screener</h1>
        <p style={styles.subtitle}>Upload resumes, configure requirements, and start analysis</p>
      </div>

      {/* Upload & Sync Actions */}
      <div style={styles.actionsBar}>
        <input
          type="file"
          id="resume-upload"
          multiple
          accept=".pdf,.doc,.docx"
          onChange={handleFileUpload}
          style={styles.hiddenInput}
        />
        <label 
          htmlFor="resume-upload" 
          style={styles.uploadLabel}
          onMouseEnter={(e) => !uploading && (e.target.style.background = '#1557b0')}
          onMouseLeave={(e) => !uploading && (e.target.style.background = '#1a73e8')}
        >
          <Upload size={16} />
          {uploading ? 'Uploading...' : 'Upload Resumes'}
        </label>

        <button
          style={styles.syncButton}
          onClick={handleGmailSync}
          disabled={syncing}
          onMouseEnter={(e) => !syncing && (e.target.style.background = '#188038')}
          onMouseLeave={(e) => !syncing && (e.target.style.background = '#34a853')}
        >
          <RefreshCw size={16} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
          {syncing ? 'Syncing Gmail...' : 'Sync from Gmail'}
        </button>
      </div>

      <JobConfiguration onAnalyze={handleAnalyze} loading={analyzing} />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Screener;