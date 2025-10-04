import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ items }) => {
  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '16px 0',
      fontSize: '14px'
    },
    link: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      color: '#5f6368',
      textDecoration: 'none',
      padding: '4px 8px',
      borderRadius: '4px',
      transition: 'all 0.2s'
    },
    current: {
      color: '#202124',
      fontWeight: 500
    },
    separator: {
      color: '#dadce0'
    }
  };

  return (
    <nav style={styles.container}>
      <Link 
        to="/dashboard" 
        style={styles.link}
        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f3f4'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <Home size={16} />
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={16} style={styles.separator} />
          {index === items.length - 1 ? (
            <span style={{ ...styles.link, ...styles.current }}>{item.label}</span>
          ) : (
            <Link
              to={item.path}
              style={styles.link}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f1f3f4'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;