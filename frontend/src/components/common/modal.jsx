import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './button';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'medium',
  closeOnOverlay = true
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    small: '400px',
    medium: '600px',
    large: '800px',
    xlarge: '1000px'
  };

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease',
      padding: '20px'
    },
    modal: {
      background: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
      maxWidth: sizes[size],
      width: '100%',
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideUp 0.3s ease'
    },
    header: {
      padding: '24px',
      borderBottom: '1px solid #e8eaed',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    title: {
      fontSize: '20px',
      fontWeight: 500,
      color: '#202124',
      margin: 0
    },
    closeButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#5f6368',
      padding: '8px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background 0.2s'
    },
    body: {
      padding: '24px',
      overflowY: 'auto',
      flex: 1
    },
    footer: {
      padding: '16px 24px',
      borderTop: '1px solid #e8eaed',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px'
    }
  };

  return (
    <div 
      style={styles.overlay}
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div 
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.header}>
          <h2 style={styles.title}>{title}</h2>
          <button
            style={styles.closeButton}
            onClick={onClose}
            onMouseOver={(e) => e.currentTarget.style.background = '#f1f3f4'}
            onMouseOut={(e) => e.currentTarget.style.background = 'none'}
          >
            <X size={20} />
          </button>
        </div>
        <div style={styles.body}>
          {children}
        </div>
        {footer && (
          <div style={styles.footer}>
            {footer}
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Modal;