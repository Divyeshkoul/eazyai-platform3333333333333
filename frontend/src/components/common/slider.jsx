import React from 'react';

const Slider = ({ 
  label, 
  value, 
  onChange, 
  min = 0, 
  max = 100, 
  step = 1,
  showValue = true,
  disabled = false,
  helperText = ''
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  const styles = {
    container: {
      width: '100%',
      marginBottom: '16px'
    },
    labelRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px'
    },
    label: {
      fontSize: '14px',
      fontWeight: 500,
      color: '#202124'
    },
    valueDisplay: {
      fontSize: '14px',
      fontWeight: 500,
      color: '#1a73e8',
      background: '#e8f0fe',
      padding: '2px 8px',
      borderRadius: '4px'
    },
    sliderWrapper: {
      position: 'relative',
      height: '4px',
      background: '#e8eaed',
      borderRadius: '2px',
      marginBottom: helperText ? '4px' : 0
    },
    sliderFill: {
      position: 'absolute',
      height: '100%',
      background: disabled ? '#dadce0' : '#1a73e8',
      borderRadius: '2px',
      width: `${percentage}%`,
      transition: 'width 0.2s ease'
    },
    input: {
      position: 'absolute',
      width: '100%',
      height: '4px',
      opacity: 0,
      cursor: disabled ? 'not-allowed' : 'pointer',
      margin: 0
    },
    thumb: {
      position: 'absolute',
      width: '16px',
      height: '16px',
      borderRadius: '50%',
      background: '#1a73e8',
      border: '2px solid #ffffff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      left: `calc(${percentage}% - 8px)`,
      top: '-6px',
      transition: 'left 0.2s ease, transform 0.2s ease',
      pointerEvents: 'none'
    },
    helperText: {
      fontSize: '12px',
      color: '#5f6368',
      marginTop: '4px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.labelRow}>
        {label && <label style={styles.label}>{label}</label>}
        {showValue && (
          <span style={styles.valueDisplay}>{value}</span>
        )}
      </div>
      <div style={styles.sliderWrapper}>
        <div style={styles.sliderFill} />
        <div style={styles.thumb} />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          style={styles.input}
        />
      </div>
      {helperText && <div style={styles.helperText}>{helperText}</div>}
    </div>
  );
};

export default Slider;