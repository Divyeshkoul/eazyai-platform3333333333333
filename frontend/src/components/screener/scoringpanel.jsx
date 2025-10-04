import React from 'react';
import { BarChart3 } from 'lucide-react';

const ScoringPanel = ({ scores }) => {
  return (
    <div style={{
      padding: '16px',
      background: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #dadce0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BarChart3 size={20} />
        <span style={{ fontSize: '14px', fontWeight: 500 }}>Scoring Breakdown</span>
      </div>
    </div>
  );
};

export default ScoringPanel;