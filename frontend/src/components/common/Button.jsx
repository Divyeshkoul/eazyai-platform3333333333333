import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium',
  icon: Icon,
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  className = ''
}) => {
  const styles = {
    base: {
      fontFamily: "'Google Sans', 'Roboto', sans-serif",
      fontWeight: 500,
      border: 'none',
      borderRadius: '4px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      width: fullWidth ? '100%' : 'auto',
      opacity: disabled ? 0.6 : 1,
    },
    variants: {
      primary: {
        background: '#1a73e8',
        color: '#ffffff',
        boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
      },
      secondary: {
        background: '#ffffff',
        color: '#1a73e8',
        border: '1px solid #dadce0',
        boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3)',
      },
      success: {
        background: '#1e8e3e',
        color: '#ffffff',
        boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3)',
      },
      danger: {
        background: '#d93025',
        color: '#ffffff',
        boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3)',
      },
      ghost: {
        background: 'transparent',
        color: '#5f6368',
        border: 'none',
      }
    },
    sizes: {
      small: {
        padding: '6px 16px',
        fontSize: '13px',
        minHeight: '32px',
      },
      medium: {
        padding: '8px 24px',
        fontSize: '14px',
        minHeight: '36px',
      },
      large: {
        padding: '10px 32px',
        fontSize: '15px',
        minHeight: '40px',
      }
    },
    hover: {
      primary: { background: '#1557b0', boxShadow: '0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)' },
      secondary: { background: '#f8f9fa', borderColor: '#1a73e8' },
      success: { background: '#188038' },
      danger: { background: '#b31412' },
      ghost: { background: '#f1f3f4' }
    }
  };

  const [isHovered, setIsHovered] = React.useState(false);

  const buttonStyle = {
    ...styles.base,
    ...styles.variants[variant],
    ...styles.sizes[size],
    ...(isHovered && !disabled && styles.hover[variant])
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      style={buttonStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {loading ? (
        <div style={{
          width: '16px',
          height: '16px',
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite'
        }} />
      ) : Icon && <Icon size={18} />}
      {children}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

export default Button;