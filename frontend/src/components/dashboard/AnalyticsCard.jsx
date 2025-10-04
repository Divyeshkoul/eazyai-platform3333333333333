import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const AnalyticsCard = ({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendValue,
  icon: Icon,
  color = '#1a73e8',
  loading = false 
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp size={16} />;
    if (trend === 'down') return <TrendingDown size={16} />;
    return <Minus size={16} />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return '#1e8e3e';
    if (trend === 'down') return '#d93025';
    return '#5f6368';
  };

  const styles = {
    card: {
      background: '#ffffff',
      borderRadius: '8px',
      padding: '24px',
      border: '1px solid #dadce0',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px'
    },
    titleSection: {
      flex: 1
    },
    title: {
      fontSize: '14px',
      color: '#5f6368',
      fontWeight: 500,
      marginBottom: '8px'
    },
    value: {
      fontSize: '32px',
      fontWeight: 400,
      color: '#202124',
      lineHeight: 1.2
    },
    iconWrapper: {
      width: '48px',
      height: '48px',
      borderRadius: '8px',
      background: `${color}15`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: color
    },
    footer: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginTop: '12px'
    },
    trend: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '13px',
      fontWeight: 500,
      color: getTrendColor()
    },
    subtitle: {
      fontSize: '13px',
      color: '#5f6368'
    },
    shimmer: {
      background: 'linear-gradient(90deg, #f1f3f4 0%, #e8eaed 50%, #f1f3f4 100%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      borderRadius: '4px'
    },
    accentBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: color,
      transform: 'scaleX(0)',
      transformOrigin: 'left',
      transition: 'transform 0.3s ease'
    }
  };

  const [isHovered, setIsHovered] = React.useState(false);

  if (loading) {
    return (
      <div style={styles.card}>
        <div style={{ ...styles.title, ...styles.shimmer, height: '16px', width: '60%' }} />
        <div style={{ ...styles.value, ...styles.shimmer, height: '40px', width: '80%', marginTop: '12px' }} />
        <div style={{ ...styles.subtitle, ...styles.shimmer, height: '14px', width: '50%', marginTop: '12px' }} />
      </div>
    );
  }

  return (
    <div 
      style={{
        ...styles.card,
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered 
          ? '0 4px 12px rgba(0,0,0,0.15)' 
          : '0 1px 2px rgba(60,64,67,0.3)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <div style={styles.title}>{title}</div>
          <div style={styles.value}>{value}</div>
        </div>
        {Icon && (
          <div style={styles.iconWrapper}>
            <Icon size={24} />
          </div>
        )}
      </div>

      {(trend || subtitle) && (
        <div style={styles.footer}>
          {trend && trendValue && (
            <div style={styles.trend}>
              {getTrendIcon()}
              <span>{trendValue}</span>
            </div>
          )}
          {subtitle && (
            <div style={styles.subtitle}>{subtitle}</div>
          )}
        </div>
      )}

      <div style={{
        ...styles.accentBar,
        transform: isHovered ? 'scaleX(1)' : 'scaleX(0)'
      }} />

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsCard;