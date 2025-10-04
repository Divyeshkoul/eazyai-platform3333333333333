import React, { useState, useEffect } from 'react';
import { Search, Bell, HelpCircle } from 'lucide-react';
import api from '../../services/api';

const Header = () => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await api.get('/api/dashboard/recent-activity');
      const activities = response.data.data || [];
      setNotifications(activities.slice(0, 5));
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const styles = {
    header: {
      height: '64px',
      background: '#ffffff',
      borderBottom: '1px solid #dadce0',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: '24px',
      position: 'sticky',
      top: 0,
      zIndex: 90
    },
    searchContainer: {
      flex: 1,
      maxWidth: '720px',
      position: 'relative'
    },
    searchWrapper: {
      display: 'flex',
      alignItems: 'center',
      background: searchFocused ? '#ffffff' : '#f1f3f4',
      border: searchFocused ? '2px solid #1a73e8' : '2px solid transparent',
      borderRadius: '8px',
      padding: '0 16px',
      transition: 'all 0.2s',
      boxShadow: searchFocused ? '0 1px 6px rgba(32, 33, 36, 0.28)' : 'none'
    },
    searchIcon: {
      color: '#5f6368',
      flexShrink: 0
    },
    searchInput: {
      flex: 1,
      border: 'none',
      background: 'transparent',
      padding: '10px 12px',
      fontSize: '14px',
      color: '#202124',
      outline: 'none',
      fontFamily: "'Google Sans', 'Roboto', sans-serif"
    },
    actions: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      position: 'relative'
    },
    iconButton: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      border: 'none',
      background: 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#5f6368',
      transition: 'background 0.2s',
      position: 'relative'
    },
    notificationDot: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: '#ea4335',
      border: '2px solid #ffffff'
    },
    profileButton: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#ffffff',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: 600,
      marginLeft: '8px',
      transition: 'transform 0.2s'
    },
    dropdown: {
      position: 'absolute',
      top: '50px',
      right: 0,
      background: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
      padding: '8px 0',
      minWidth: '320px',
      maxHeight: '400px',
      overflowY: 'auto',
      animation: 'slideDown 0.2s ease',
      zIndex: 1000
    },
    dropdownHeader: {
      padding: '12px 16px',
      fontSize: '16px',
      fontWeight: 500,
      color: '#202124',
      borderBottom: '1px solid #f1f3f4'
    },
    notificationItem: {
      padding: '12px 16px',
      cursor: 'pointer',
      transition: 'background 0.2s',
      borderBottom: '1px solid #f8f9fa'
    },
    notificationTitle: {
      fontSize: '14px',
      fontWeight: 500,
      color: '#202124',
      marginBottom: '4px'
    },
    notificationDesc: {
      fontSize: '13px',
      color: '#5f6368'
    },
    helpItem: {
      padding: '12px 16px',
      cursor: 'pointer',
      transition: 'background 0.2s',
      fontSize: '14px',
      color: '#202124'
    },
    emptyState: {
      padding: '40px 16px',
      textAlign: 'center',
      color: '#5f6368',
      fontSize: '14px'
    }
  };

  const helpItems = [
    'Getting Started Guide',
    'How to Upload Resumes',
    'Understanding Scores',
    'Gmail Integration Setup',
    'Keyboard Shortcuts',
    'Contact Support'
  ];

  const formatActivityType = (type) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <header style={styles.header}>
      <div style={styles.searchContainer}>
        <div style={styles.searchWrapper}>
          <Search size={20} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search candidates, jobs, or documents..."
            style={styles.searchInput}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </div>

      <div style={styles.actions}>
        {/* Help Button */}
        <button
          style={styles.iconButton}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f1f3f4'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          onClick={() => {
            setShowHelp(!showHelp);
            setShowNotifications(false);
          }}
          title="Help"
        >
          <HelpCircle size={20} />
        </button>

        {/* Help Dropdown */}
        {showHelp && (
          <div style={styles.dropdown}>
            <div style={styles.dropdownHeader}>Help & Resources</div>
            {helpItems.map((item, index) => (
              <div
                key={index}
                style={styles.helpItem}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                onClick={() => {
                  alert(`Opening: ${item}`);
                  setShowHelp(false);
                }}
              >
                {item}
              </div>
            ))}
          </div>
        )}

        {/* Notifications Button */}
        <button
          style={styles.iconButton}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f1f3f4'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          onClick={() => {
            setShowNotifications(!showNotifications);
            setShowHelp(false);
          }}
          title="Notifications"
        >
          <Bell size={20} />
          {notifications.length > 0 && <div style={styles.notificationDot} />}
        </button>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div style={styles.dropdown}>
            <div style={styles.dropdownHeader}>Recent Activity</div>
            {notifications.length === 0 ? (
              <div style={styles.emptyState}>No recent activity</div>
            ) : (
              notifications.map((notif, index) => (
                <div
                  key={index}
                  style={styles.notificationItem}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={styles.notificationTitle}>
                    {formatActivityType(notif.type)}
                  </div>
                  <div style={styles.notificationDesc}>
                    {notif.details?.total_candidates 
                      ? `${notif.details.total_candidates} candidates processed`
                      : 'Activity completed'}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Profile Button */}
        <button
          style={styles.profileButton}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="Account"
        >
          EA
        </button>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  );
};

export default Header;