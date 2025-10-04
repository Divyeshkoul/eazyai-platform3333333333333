import React from 'react';
import { Bot } from 'lucide-react';

const Interview = () => {
  const styles = {
    container: {
      textAlign: 'center',
      padding: '80px 20px'
    },
    icon: {
      width: '80px',
      height: '80px',
      margin: '0 auto 24px',
      color: '#5f6368',
      opacity: 0.5
    },
    title: {
      fontSize: '24px',
      fontWeight: 500,
      color: '#202124',
      marginBottom: '12px'
    },
    desc: {
      fontSize: '14px',
      color: '#5f6368'
    }
  };

  return (
    <div style={styles.container}>
      <Bot size={80} style={styles.icon} />
      <h2 style={styles.title}>AI Interview Bot</h2>
      <p style={styles.desc}>Coming Soon - Automated interview scheduling and management</p>
    </div>
  );
};

export default Interview;