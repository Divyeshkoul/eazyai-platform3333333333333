import React, { useEffect, useState } from 'react';
import QuickStats from '../components/dashboard/QuickStats';
import ChartWidget from '../components/dashboard/ChartWidget';
import RecentActivity from '../components/dashboard/RecentActivity';
import Breadcrumb from '../components/layout/breadcrumb';
import { dashboardService } from '../services/dashboard.service';
import Loader from '../components/common/loader';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, analyticsData, activityData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getAnalytics(),
        dashboardService.getRecentActivity()
      ]);
      
      setStats(statsData);
      setAnalytics(analyticsData);
      setActivities(activityData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      animation: 'fadeIn 0.3s ease'
    },
    header: {
      marginBottom: '24px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 400,
      color: '#202124',
      margin: '0 0 8px 0'
    },
    subtitle: {
      fontSize: '14px',
      color: '#5f6368'
    },
    chartsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '24px',
      marginBottom: '24px'
    }
  };

  if (loading) {
    return <Loader size="large" fullScreen text="Loading dashboard..." />;
  }

  const scoreDistData = analytics?.score_distribution?.map(item => ({
    name: item.range,
    value: item.count
  })) || [];

  const verdictData = analytics?.verdict_breakdown ? 
    Object.entries(analytics.verdict_breakdown).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    })) : [];

  const skillTrendsData = analytics?.skill_trends ? 
    Object.entries(analytics.skill_trends).map(([name, value]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: Math.round(value)
    })) : [];

  return (
    <div style={styles.container}>
      <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }]} />
      
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard</h1>
        <p style={styles.subtitle}>Overview of your recruitment analytics</p>
      </div>

      <QuickStats stats={stats} loading={loading} />

      <div style={styles.chartsGrid}>
        <ChartWidget
          title="Score Distribution"
          data={scoreDistData}
          type="bar"
          dataKey="value"
          nameKey="name"
        />
        <ChartWidget
          title="Verdict Breakdown"
          data={verdictData}
          type="pie"
          dataKey="value"
          nameKey="name"
        />
      </div>

      <div style={styles.chartsGrid}>
        <ChartWidget
          title="Average Scores by Category"
          data={skillTrendsData}
          type="bar"
          dataKey="value"
          nameKey="name"
          colors={['#1a73e8']}
        />
        <RecentActivity activities={activities} />
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;