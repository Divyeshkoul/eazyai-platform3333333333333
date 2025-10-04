import React from 'react';
import { Users, CheckCircle, Clock, XCircle } from 'lucide-react';
import AnalyticsCard from './AnalyticsCard';

const QuickStats = ({ stats, loading = false }) => {
  const statsConfig = [
    {
      title: 'Total Candidates',
      value: stats?.total_candidates || 0,
      icon: Users,
      color: '#1a73e8',
      trend: 'up',
      trendValue: '+12%',
      subtitle: 'vs last week'
    },
    {
      title: 'Shortlisted',
      value: stats?.shortlisted || 0,
      icon: CheckCircle,
      color: '#1e8e3e',
      trend: 'up',
      trendValue: '+8%',
      subtitle: 'Ready for interview'
    },
    {
      title: 'Under Review',
      value: stats?.under_review || 0,
      icon: Clock,
      color: '#f9ab00',
      trend: 'neutral',
      subtitle: 'Pending decision'
    },
    {
      title: 'Rejected',
      value: stats?.rejected || 0,
      icon: XCircle,
      color: '#d93025',
      trend: 'down',
      trendValue: '-5%',
      subtitle: 'Below threshold'
    }
  ];

  const styles = {
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px',
      marginBottom: '24px'
    }
  };

  return (
    <div style={styles.grid}>
      {statsConfig.map((stat, index) => (
        <AnalyticsCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          trend={stat.trend}
          trendValue={stat.trendValue}
          subtitle={stat.subtitle}
          loading={loading}
        />
      ))}
    </div>
  );
};

export default QuickStats;