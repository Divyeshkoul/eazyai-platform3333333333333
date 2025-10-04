import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Maximize2 } from 'lucide-react';

const ChartWidget = ({ 
  title, 
  data, 
  type = 'bar',
  dataKey = 'value',
  nameKey = 'name',
  colors = ['#1a73e8', '#34a853', '#fbbc04', '#ea4335'],
  height = 300
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isMaximized, setIsMaximized] = React.useState(false);

  const styles = {
    container: {
      background: '#ffffff',
      borderRadius: '8px',
      padding: '24px',
      border: '1px solid #dadce0',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
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
    actions: {
      display: 'flex',
      gap: '8px'
    },
    iconButton: {
      width: '32px',
      height: '32px',
      borderRadius: '4px',
      border: 'none',
      background: 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#5f6368',
      transition: 'background 0.2s'
    },
    chartContainer: {
      width: '100%',
      height: height
    }
  };
  
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#ffffff',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          border: '1px solid #dadce0'
        }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#5f6368' }}>
            {payload[0].name}
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: 500, color: '#202124' }}>
            {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
              <XAxis dataKey={nameKey} stroke="#5f6368" style={{ fontSize: '12px' }} />
              <YAxis stroke="#5f6368" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={colors[0]} 
                strokeWidth={2}
                dot={{ fill: colors[0], r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={dataKey}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );
      default: // bar
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
              <XAxis dataKey={nameKey} stroke="#5f6368" style={{ fontSize: '12px' }} />
              <YAxis stroke="#5f6368" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey={dataKey} fill={colors[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div 
      style={{
        ...styles.container,
        position: isMaximized ? 'fixed' : 'relative',
        top: isMaximized ? '0' : 'auto',
        left: isMaximized ? '0' : 'auto',
        right: isMaximized ? '0' : 'auto',
        bottom: isMaximized ? '0' : 'auto',
        zIndex: isMaximized ? 9999 : 1,
        width: isMaximized ? '100vw' : 'auto',
        height: isMaximized ? '100vh' : 'auto',
        margin: isMaximized ? '0' : 'auto',
        boxShadow: isHovered 
          ? '0 4px 12px rgba(0,0,0,0.1)' 
          : '0 1px 2px rgba(60,64,67,0.3)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.header}>
        <h3 style={styles.title}>{title}</h3>
        <div style={styles.actions}>
          {/* Download Button */}
          <button
            style={styles.iconButton}
            onClick={() => {
              const csvContent = data.map(item => `${item.name},${item.value}`).join('\n');
              const blob = new Blob([`Name,Value\n${csvContent}`], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${title.replace(/\s+/g, '_')}.csv`;
              a.click();
              window.URL.revokeObjectURL(url);
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f3f4'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            title="Download"
          >
            <Download size={16} />
          </button>

          {/* Maximize/Restore Button */}
          <button
            style={styles.iconButton}
            onClick={() => setIsMaximized(!isMaximized)}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f3f4'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            title={isMaximized ? "Restore" : "Expand"}
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      <div style={styles.chartContainer}>
        {renderChart()}
      </div>
    </div>
  );
};

export default ChartWidget;
