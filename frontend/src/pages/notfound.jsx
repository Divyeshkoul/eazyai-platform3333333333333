import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  const styles = {
    container: {
      textAlign: 'center',
      padding: '80px 20px'
    },
    code: {
      fontSize: '72px',
      fontWeight: 600,
      color: '#1a73e8',
      marginBottom: '16px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 500,
      color: '#202124',
      marginBottom: '12px'
    },
    button: {
      marginTop: '24px',
      padding: '12px 24px',
      fontSize: '14px',
      fontWeight: 500,
      background: '#1a73e8',
      color: '#ffffff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.code}>404</div>
      <h2 style={styles.title}>Page Not Found</h2>
      <button style={styles.button} onClick={() => navigate('/dashboard')}>
        <Home size={16} />
        Go to Dashboard
      </button>
    </div>
  );
};

export default NotFound;