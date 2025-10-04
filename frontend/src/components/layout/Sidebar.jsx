import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Cloud, 
  Server, 
  Database,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      color: '#1a73e8'
    },
    {
      id: 'screener',
      label: 'Resume Screener',
      icon: Cloud,
      path: '/screener',
      color: '#34a853'
    },
    {
      id: 'results',
      label: 'Screening Results',
      icon: Database,
      path: '/screener-results',
      color: '#fbbc04'
    },
    {
      id: 'interview',
      label: 'AI Interview Bot',
      icon: Server,
      path: '/interview',
      color: '#ea4335',
      badge: 'Coming Soon'
    }
  ];

  const styles = {
    sidebar: {
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh',
      width: isOpen ? '280px' : '72px',
      background: '#ffffff',
      borderRight: '1px solid #dadce0',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    },
    header: {
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      borderBottom: '1px solid #f1f3f4',
      minHeight: '72px'
    },
    logo: {
      width: '32px',
      height: '32px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontSize: '18px',
      fontWeight: 'bold',
      flexShrink: 0
    },
    title: {
      fontSize: '20px',
      fontWeight: 500,
      color: '#202124',
      opacity: isOpen ? 1 : 0,
      transition: 'opacity 0.2s',
      whiteSpace: 'nowrap'
    },
    toggleButton: {
      marginLeft: 'auto',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#5f6368',
      transition: 'background 0.2s'
    },
    nav: {
      flex: 1,
      padding: '12px 8px',
      overflowY: 'auto',
      overflowX: 'hidden'
    },
    menuItem: (itemId, isActive) => ({
      display: 'flex',
      alignItems: 'center',
      padding: '12px 16px',
      margin: '4px 0',
      borderRadius: '8px',
      textDecoration: 'none',
      color: isActive ? '#1a73e8' : '#5f6368',
      background: isActive ? '#e8f0fe' : hoveredItem === itemId ? '#f1f3f4' : 'transparent',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    }),
    iconWrapper: (color, isActive) => ({
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      color: isActive ? color : '#5f6368'
    }),
    labelWrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flex: 1,
      opacity: isOpen ? 1 : 0,
      transition: 'opacity 0.2s',
      whiteSpace: 'nowrap',
      marginLeft: '12px'
    },
    label: {
      fontSize: '14px',
      fontWeight: 500
    },
    badge: {
      fontSize: '10px',
      padding: '2px 6px',
      borderRadius: '4px',
      background: '#ea4335',
      color: '#ffffff',
      fontWeight: 500
    },
    activeIndicator: {
      position: 'absolute',
      left: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      width: '3px',
      height: '24px',
      background: '#1a73e8',
      borderRadius: '0 2px 2px 0'
    }
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <div style={styles.logo}>E</div>
        <div style={styles.title}>EazyAI</div>
        <button
          style={styles.toggleButton}
          onClick={onToggle}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f1f3f4'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav style={styles.nav}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.id}
              to={item.path}
              style={styles.menuItem(item.id, isActive)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {isActive && <div style={styles.activeIndicator} />}
              
              <div style={styles.iconWrapper(item.color, isActive)}>
                <Icon size={20} />
              </div>

              {isOpen && (
                <div style={styles.labelWrapper}>
                  <span style={styles.label}>{item.label}</span>
                  {item.badge && <span style={styles.badge}>{item.badge}</span>}
                  {isActive && <ChevronRight size={16} />}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-10px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;