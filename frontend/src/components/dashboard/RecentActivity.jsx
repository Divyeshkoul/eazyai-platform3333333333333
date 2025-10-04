import React from 'react';
import { Clock, FileText, Mail, Upload, TrendingUp } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const RecentActivity = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    const icons = {
      analysis_completed: <TrendingUp size={20} />,
      resume_uploaded: <Upload size={20} />,
      email_sent: <Mail size={20} />,
      report_generated: <FileText size={20} />
    };
    return icons[type] || <Clock size={20} />;
  };

  const getActivityColor = (type) => {
    const colors = {
      analysis_completed: '#1e8e3e',
      resume_uploaded: '#1a73e8',
      email_sent: '#f9ab00',
      report_generated: '#ea4335'
    };
    return colors[type] || '#5f6368';
  };

  const styles = {
    container: {
      background: '#ffffff',
      borderRadius: '8px',
      padding: '24px',
      border: '1px solid #dadce0'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    title: {
      fontSize: '16px',
      fontWeight: 500,
      color: '#202124'
    },
    viewAll: {
      fontSize: '14px',
      color: '#1a73e8',
      textDecoration: 'none',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'color 0.2s'
    },
    list: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    item: {
      display: 'flex',
      gap: '16px',
      padding: '12px',
      borderRadius: '8px',
      transition: 'background 0.2s',
      cursor: 'pointer'
    },
    iconWrapper: (color) => ({
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      background: `${color}15`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: color,
      flexShrink: 0
    }),
    content: {
      flex: 1
    },
    activityTitle: {
      fontSize: '14px',
      fontWeight: 500,
      color: '#202124',
      marginBottom: '4px'
    },
    activityDesc: {
      fontSize: '13px',
      color: '#5f6368'
    },
    timestamp: {
      fontSize: '12px',
      color: '#5f6368',
      marginTop: '4px'
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#5f6368'
    }
  };

  const [hoveredIndex, setHoveredIndex] = React.useState(null);

  const getActivityDescription = (activity) => {
    switch (activity.type) {
      case 'analysis_completed':
        return `Analyzed ${activity.details?.total_candidates || 0} candidates`;
      case 'resume_uploaded':
        return `Uploaded ${activity.details?.count || 1} resume(s)`;
      case 'email_sent':
        return `Sent email to ${activity.details?.recipient || 'candidate'}`;
      case 'report_generated':
        return `Generated ${activity.details?.report_type || 'summary'} report`;
      default:
        return 'Activity completed';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Recent Activity</h3>
        <a 
          href="#" 
          style={styles.viewAll}
          onMouseEnter={(e) => e.target.style.color = '#1557b0'}
          onMouseLeave={(e) => e.target.style.color = '#1a73e8'}
        >
          View all
        </a>
      </div>

      {activities.length === 0 ? (
        <div style={styles.emptyState}>
          <Clock size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
          <p>No recent activity</p>
        </div>
      ) : (
        <div style={styles.list}>
          {activities.slice(0, 5).map((activity, index) => (
            <div
              key={index}
              style={{
                ...styles.item,
                background: hoveredIndex === index ? '#f8f9fa' : 'transparent'
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div style={styles.iconWrapper(getActivityColor(activity.type))}>
                {getActivityIcon(activity.type)}
              </div>
              <div style={styles.content}>
                <div style={styles.activityTitle}>
                  {activity.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div style={styles.activityDesc}>
                  {getActivityDescription(activity)}
                </div>
                <div style={styles.timestamp}>
                  {formatDate(activity.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;