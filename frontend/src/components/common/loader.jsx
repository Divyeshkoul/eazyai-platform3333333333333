import React from 'react';

const Loader = ({ 
  size = 'medium', 
  color = '#1a73e8',
  text = '',
  fullScreen = false 
}) => {
  const sizes = {
    small: 20,
    medium: 40,
    large: 60
  };

  const spinnerSize = sizes[size];

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      ...(fullScreen && {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        zIndex: 9999
      })
    },
    spinner: {
      width: spinnerSize,
      height: spinnerSize,
      border: `${spinnerSize / 10}px solid #f1f3f4`,
      borderTop: `${spinnerSize / 10}px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    },
    text: {
      fontSize: '14px',
      color: '#5f6368',
      fontWeight: 500
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.spinner} />
      {text && <div style={styles.text}>{text}</div>}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;