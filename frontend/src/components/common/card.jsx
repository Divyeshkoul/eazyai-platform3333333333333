import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle,
  icon: Icon,
  hoverable = true,
  padding = 'normal',
  className = '',
  headerAction
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const styles = {
    card: {
      background: '#ffffff',
      border: '1px solid #dadce0',
      borderRadius: '8px',
      boxShadow: isHovered && hoverable 
        ? '0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)'
        : '0 1px 2px 0 rgba(60,64,67,0.3)',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: isHovered && hoverable ? 'translateY(-2px)' : 'translateY(0)',
      overflow: 'hidden'
    },
    header: {
      padding: padding === 'compact' ? '12px 16px' : '16px 24px',
      borderBottom: '1px solid #f1f3f4',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    iconWrapper: {
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      background: '#e8f0fe',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#1a73e8'
    },
    titleWrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    },
    title: {
      fontSize: '16px',
      fontWeight: 500,
      color: '#202124',
      margin: 0
    },
    subtitle: {
      fontSize: '13px',
      color: '#5f6368',
      margin: 0
    },
    body: {
      padding: padding === 'compact' ? '12px 16px' : '16px 24px'
    }
  };

  return (
    <div 
      className={className}
      style={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {(title || Icon) && (
        <div style={styles.header}>
          <div style={styles.headerContent}>
            {Icon && (
              <div style={styles.iconWrapper}>
                <Icon size={20} />
              </div>
            )}
            {title && (
              <div style={styles.titleWrapper}>
                <h3 style={styles.title}>{title}</h3>
                {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
              </div>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div style={styles.body}>
        {children}
      </div>
    </div>
  );
};

export default Card;