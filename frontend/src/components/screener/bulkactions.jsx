import React from 'react';
import { Mail, Download } from 'lucide-react';

const BulkActions = ({ selectedCandidates, onBulkEmail, onBulkExport }) => {
  const styles = {
    container: {
      padding: '16px',
      background: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #dadce0',
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    },
    button: {
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: 500,
      border: '1px solid #dadce0',
      borderRadius: '4px',
      background: '#ffffff',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s'
    }
  };

  return (
    <div style={styles.container}>
      <span style={{ fontSize: '14px', color: '#5f6368' }}>
        {selectedCandidates?.length || 0} selected
      </span>
      <button 
        style={styles.button}
        onClick={onBulkEmail}
        onMouseEnter={(e) => e.target.style.background = '#f1f3f4'}
        onMouseLeave={(e) => e.target.style.background = '#ffffff'}
      >
        <Mail size={14} />
        Send Email
      </button>
      <button 
        style={styles.button}
        onClick={onBulkExport}
        onMouseEnter={(e) => e.target.style.background = '#f1f3f4'}
        onMouseLeave={(e) => e.target.style.background = '#ffffff'}
      >
        <Download size={14} />
        Export
      </button>
    </div>
  );
};

export default BulkActions;