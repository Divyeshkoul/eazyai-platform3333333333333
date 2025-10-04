import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './header';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      background: '#f8f9fa'
    },
    main: {
      flex: 1,
      marginLeft: sidebarOpen ? '280px' : '72px',
      transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      flexDirection: 'column'
    },
    content: {
      flex: 1,
      padding: '24px',
      maxWidth: '1600px',
      width: '100%',
      margin: '0 auto'
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div style={styles.main}>
        <Header />
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;