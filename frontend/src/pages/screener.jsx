import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, RefreshCw, ChevronRight, ChevronLeft, Trash2, FileText } from 'lucide-react';
import JobConfiguration from '../components/screener/JobConfiguration';
import Breadcrumb from '../components/layout/breadcrumb';
import { screenerService } from '../services/screener.service';
import Loader from '../components/common/loader';
import api from '../services/api';

const Screener = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [sliderOpen, setSliderOpen] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [blobFiles, setBlobFiles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadBlobFiles();
  }, []);

  const loadBlobFiles = async () => {
    try {
      const response = await api.get('/api/screener/list-blob-files');
      setBlobFiles(response.data.data?.files || []);
    } catch (error) {
      console.error('Failed to load blob files:', error);
    }
  };

  const handleFileUploadTemp = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const uploadedList = [];
      
      for (let file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/api/screener/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (response.data.success) {
          uploadedList.push(file.name);
        }
      }
      
      setUploadedFiles(prev => [...prev, ...uploadedList]);
      alert(`✓ Uploaded ${uploadedList.length} file(s) to temporary storage!\n\nUNCHECK "Load from Azure" checkbox and click "Start Analysis".`);
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`✗ Upload failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleFileUploadBlob = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const uploadedList = [];
      
      for (let file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/api/screener/upload-to-blob', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (response.data.success) {
          uploadedList.push(file.name);
        }
      }
      
      await loadBlobFiles();
      alert(`✓ Uploaded ${uploadedList.length} file(s) to Azure Blob Storage!\n\nCHECK "Load from Azure" checkbox and click "Start Analysis".`);
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`✗ Upload failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDeleteTemp = async (filename) => {
    try {
      await api.delete(`/api/screener/delete-temp/${encodeURIComponent(filename)}`);
      setUploadedFiles(prev => prev.filter(f => f !== filename));
      alert(`✓ Deleted ${filename} from temporary storage`);
    } catch (error) {
      alert(`✗ Failed to delete: ${error.message}`);
    }
  };

  const handleDeleteBlob = async (filename) => {
    try {
      await api.delete(`/api/screener/delete-blob/${encodeURIComponent(filename)}`);
      await loadBlobFiles();
      alert(`✓ Deleted ${filename} from Azure Blob`);
    } catch (error) {
      alert(`✗ Failed to delete: ${error.message}`);
    }
  };

  const handleGmailSync = async () => {
    try {
      setSyncing(true);
      await api.post('/api/gmail/sync');
      alert('Gmail sync started! Files will be uploaded to Azure Blob.');
      
      setTimeout(async () => {
        const response = await api.get('/api/gmail/status');
        const status = response.data;
        await loadBlobFiles();
        alert(`✓ Sync complete!\n\nEmails: ${status.emails_processed}\nResumes: ${status.files_uploaded}`);
        setSyncing(false);
      }, 5000);
    } catch (error) {
      console.error('Gmail sync failed:', error);
      alert(`✗ Gmail sync failed: ${error.response?.data?.detail || error.message}`);
      setSyncing(false);
    }
  };

  // ✅ UPDATED FUNCTION: Save before navigation
  const handleAnalyze = async (config) => {
    try {
      setAnalyzing(true);
      const result = await screenerService.analyzeResumes(config);

      // 💾 Save results to sessionStorage before navigating
      sessionStorage.setItem("screenerResults", JSON.stringify(result));

      alert(`✓ Analysis Complete!\n\nProcessed: ${result.total_processed} candidates\nTime: ${result.processing_time.toFixed(1)}s\nAvg: ${result.metrics.avg_time_per_resume}s per resume`);
      
      setTimeout(() => {
        navigate('/screener-results', { 
          state: { results: result },
          replace: false 
        });
      }, 500);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      alert(`✗ Analysis failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const styles = {
    container: {
      display: 'flex',
      gap: '0',
      animation: 'fadeIn 0.3s ease',
      position: 'relative'
    },
    mainContent: {
      flex: 1,
      maxWidth: sliderOpen ? 'calc(100% - 420px)' : '100%',
      transition: 'all 0.3s ease',
      paddingRight: sliderOpen ? '0' : '20px'
    },
    header: { marginBottom: '24px' },
    title: { fontSize: '28px', fontWeight: 400, color: '#202124', margin: '0 0 8px 0' },
    subtitle: { fontSize: '14px', color: '#5f6368' },
    actionsBar: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '12px',
      marginBottom: '24px'
    },
    uploadCard: {
      background: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #dadce0',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    cardTitle: {
      fontSize: '14px',
      fontWeight: 500,
      color: '#202124',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    uploadLabel: {
      padding: '10px 16px',
      fontSize: '13px',
      fontWeight: 500,
      borderRadius: '4px',
      cursor: uploading ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.2s',
      opacity: uploading ? 0.6 : 1,
      border: 'none',
      textAlign: 'center'
    },
    uploadTempButton: { background: '#f9ab00', color: '#ffffff' },
    uploadBlobButton: { background: '#1a73e8', color: '#ffffff' },
    syncButton: {
      padding: '10px 16px',
      fontSize: '13px',
      fontWeight: 500,
      background: '#34a853',
      color: '#ffffff',
      border: 'none',
      borderRadius: '4px',
      cursor: syncing ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.2s',
      opacity: syncing ? 0.6 : 1
    },
    filesList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      maxHeight: '200px',
      overflowY: 'auto'
    },
    fileItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 12px',
      background: '#f8f9fa',
      borderRadius: '4px',
      fontSize: '13px'
    },
    fileName: {
      flex: 1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    deleteButton: {
      background: 'none',
      border: 'none',
      color: '#d93025',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center'
    },
    hiddenInput: { display: 'none' },
    sliderContainer: {
      position: 'fixed',
      right: sliderOpen ? '0' : '-400px',
      top: '64px',
      width: '400px',
      height: 'calc(100vh - 64px)',
      background: '#ffffff',
      boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
      transition: 'right 0.3s ease',
      zIndex: 100,
      overflowY: 'auto'
    },
    toggleButton: {
      position: 'fixed',
      right: sliderOpen ? '400px' : '0',
      top: '50%',
      transform: 'translateY(-50%)',
      background: '#1E3A8A',
      color: '#ffffff',
      border: 'none',
      borderRadius: sliderOpen ? '8px 0 0 8px' : '0 8px 8px 0',
      padding: '12px 8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      zIndex: 101,
      boxShadow: '-2px 0 8px rgba(0,0,0,0.1)'
    },
    emptyState: { textAlign: 'center', padding: '20px', color: '#5f6368', fontSize: '13px' }
  };

  if (analyzing) {
    return (
      <Loader 
        size="large" 
        fullScreen 
        text="Analyzing resumes with AI... This may take a few minutes"
      />
    );
  }

  return (
    <>
      <div style={styles.container}>
        <div style={styles.mainContent}>
          <Breadcrumb items={[{ label: 'Resume Screener', path: '/screener' }]} />
          
          <div style={styles.header}>
            <h1 style={styles.title}>Resume Screener</h1>
            <p style={styles.subtitle}>Upload resumes and configure analysis settings</p>
          </div>

          {/* Upload Actions */}
          <div style={styles.actionsBar}>
            {/* Temporary Upload */}
            <div style={styles.uploadCard}>
              <div style={styles.cardTitle}><Upload size={16}/> Temporary Storage</div>
              <input type="file" id="resume-upload-temp" multiple accept=".pdf,.doc,.docx" onChange={handleFileUploadTemp} style={styles.hiddenInput}/>
              <label htmlFor="resume-upload-temp" style={{ ...styles.uploadLabel, ...styles.uploadTempButton }}>
                {uploading ? 'Uploading...' : 'Browse Files'}
              </label>

              <div style={styles.filesList}>
                {uploadedFiles.length === 0 ? (
                  <div style={styles.emptyState}>No files uploaded</div>
                ) : (
                  uploadedFiles.map((file, index) => (
                    <div key={index} style={styles.fileItem}>
                      <div style={styles.fileName}><FileText size={14}/> {file}</div>
                      <button style={styles.deleteButton} onClick={() => handleDeleteTemp(file)}><Trash2 size={14}/></button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Azure Upload */}
            <div style={styles.uploadCard}>
              <div style={styles.cardTitle}><Upload size={16}/> Azure Blob Storage</div>
              <input type="file" id="resume-upload-blob" multiple accept=".pdf,.doc,.docx" onChange={handleFileUploadBlob} style={styles.hiddenInput}/>
              <label htmlFor="resume-upload-blob" style={{ ...styles.uploadLabel, ...styles.uploadBlobButton }}>
                {uploading ? 'Uploading...' : 'Upload to Azure'}
              </label>

              <div style={styles.filesList}>
                {blobFiles.length === 0 ? (
                  <div style={styles.emptyState}>No files in Azure</div>
                ) : (
                  blobFiles.slice(0, 10).map((file, index) => (
                    <div key={index} style={styles.fileItem}>
                      <div style={styles.fileName}><FileText size={14}/> {file}</div>
                      <button style={styles.deleteButton} onClick={() => handleDeleteBlob(file)}><Trash2 size={14}/></button>
                    </div>
                  ))
                )}
                {blobFiles.length > 10 && (
                  <div style={styles.emptyState}>+{blobFiles.length - 10} more files</div>
                )}
              </div>
            </div>

            {/* Gmail Sync */}
            <div style={styles.uploadCard}>
              <div style={styles.cardTitle}><RefreshCw size={16}/> Gmail Integration</div>
              <button style={styles.syncButton} onClick={handleGmailSync} disabled={syncing}>
                {syncing ? 'Syncing...' : 'Sync Gmail Now'}
              </button>
              <div style={styles.emptyState}>Syncs to Azure Blob</div>
            </div>
          </div>
        </div>

        {/* Slider */}
        <button style={styles.toggleButton} onClick={() => setSliderOpen(!sliderOpen)}>
          {sliderOpen ? <ChevronRight size={20}/> : <ChevronLeft size={20}/>}
        </button>

        <div style={styles.sliderContainer}>
          <JobConfiguration onAnalyze={handleAnalyze} loading={analyzing}/>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default Screener;
