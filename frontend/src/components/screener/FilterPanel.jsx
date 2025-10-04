import React from 'react';
import { Filter } from 'lucide-react';

const FilterPanel = ({ onFilterChange }) => {
  return (
    <div style={{
      padding: '16px',
      background: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #dadce0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Filter size={20} />
        <span style={{ fontSize: '14px', fontWeight: 500 }}>Filters</span>
      </div>
    </div>
  );
};

export default FilterPanel;