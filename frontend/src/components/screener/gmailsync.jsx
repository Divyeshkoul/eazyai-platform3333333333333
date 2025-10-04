import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const GmailSync = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await api.get('/api/gmail/status');
      setStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch Gmail status:', error);
    }
  };

  const triggerSync = async () => {
    try {
      setLoading(true);
      await api.post('/api/gmail/sync');
      setTimeout(fetchStatus, 2000);
    } catch (error) {
      console.error('Failed to trigger sync:', error);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      padding: '20px',
      background: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #dadce0'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    title: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '16px',
      fontWeight: 500,
      color: '#202124'
    },
    button: {
      padding: '8px 16px',
      fontSize: '14px',
      border: '1px solid #dadce0',
      borderRadius: '4px',
      background: '#ffffff',
      cursor: loading ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      opacity: loading ? 0.6 : 1
    },
    stat: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      fontSize: '14px',
      color: '#5f6368',
      borderBottom: '1px solid #f1f3f4'
    },
    statusBadge: (active) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 500,
      background: active ? '#e6f4ea' : '#fce8e6',
      color: active ? '#137333' : '#c5221f'
    })
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <Mail size={20} />
          Gmail Sync
        </div>
        <button 
          style={styles.button} 
          onClick={triggerSync}
          disabled={loading}
          onMouseEnter={(e) => !loading && (e.target.style.background = '#f1f3f4')}
          onMouseLeave={(e) => !loading && (e.target.style.background = '#ffffff')}
        >
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Sync Now
        </button>
      </div>

      <div style={styles.stat}>
        <span>Status</span>
        <div style={styles.statusBadge(status?.is_active)}>
          {status?.is_active ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
          {status?.is_active ? 'Active' : 'Inactive'}
        </div>
      </div>

      <div style={styles.stat}>
        <span>Emails Processed</span>
        <strong>{status?.emails_processed || 0}</strong>
      </div>

      <div style={styles.stat}>
        <span>Files Uploaded</span>
        <strong>{status?.files_uploaded || 0}</strong>
      </div>

       <div style={{ ...styles.stat, borderBottom: 'none' }}>

        <span>Last Sync</span>
        <span>{status?.last_sync || 'Never'}</span>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default GmailSync;