import React, { useState } from 'react';
import { Mail, Phone, FileText, Download, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { formatScore, getScoreColor } from '../../utils/helpers';

const CandidateCard = ({ candidate, onEmailClick, onDownloadSummary, onUpdateNotes }) => {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(candidate.recruiter_notes || '');
  const [isHovered, setIsHovered] = useState(false);

  const getVerdictStyle = (verdict) => {
    const styles = {
      shortlist: { background: '#e6f4ea', color: '#137333', border: '1px solid #81c995' },
      review: { background: '#fef7e0', color: '#b45309', border: '1px solid #fdd663' },
      reject: { background: '#fce8e6', color: '#c5221f', border: '1px solid #f297a0' }
    };
    return styles[verdict] || styles.review;
  };

  const styles = {
    card: {
      background: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #dadce0',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden'
    },
    header: {
      padding: '20px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '16px'
    },
    mainInfo: {
      flex: 1
    },
    nameRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '8px'
    },
    name: {
      fontSize: '18px',
      fontWeight: 500,
      color: '#202124',
      margin: 0
    },
    verdict: (verdict) => ({
      ...getVerdictStyle(verdict),
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 500,
      textTransform: 'capitalize'
    }),
    contactInfo: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      fontSize: '13px',
      color: '#5f6368',
      marginTop: '8px'
    },
    contactItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    scoreSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '8px'
    },
    overallScore: {
      fontSize: '32px',
      fontWeight: 500,
      lineHeight: 1
    },
    scoreLabel: {
      fontSize: '12px',
      color: '#5f6368'
    },
    metricsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '12px',
      padding: '16px 24px',
      background: '#f8f9fa',
      borderTop: '1px solid #f1f3f4',
      borderBottom: '1px solid #f1f3f4'
    },
    metric: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    metricLabel: {
      fontSize: '12px',
      color: '#5f6368',
      textTransform: 'uppercase',
      letterSpacing: '0.3px'
    },
    metricValue: {
      fontSize: '16px',
      fontWeight: 500
    },
    progressBar: {
      width: '100%',
      height: '4px',
      background: '#e8eaed',
      borderRadius: '2px',
      overflow: 'hidden',
      marginTop: '4px'
    },
    progressFill: (value, color) => ({
      width: `${value}%`,
      height: '100%',
      background: color,
      transition: 'width 0.3s ease',
      borderRadius: '2px'
    }),
    expandedContent: {
      padding: '20px 24px',
      borderTop: '1px solid #f1f3f4'
    },
    section: {
      marginBottom: '16px'
    },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: 500,
      color: '#202124',
      marginBottom: '8px'
    },
    text: {
      fontSize: '13px',
      color: '#5f6368',
      lineHeight: 1.6
    },
    list: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    listItem: {
      padding: '6px 0',
      fontSize: '13px',
      color: '#5f6368',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px'
    },
    bullet: {
      width: '4px',
      height: '4px',
      borderRadius: '50%',
      background: '#5f6368',
      marginTop: '8px',
      flexShrink: 0
    },
    notesTextarea: {
      width: '100%',
      minHeight: '80px',
      padding: '12px',
      border: '1px solid #dadce0',
      borderRadius: '4px',
      fontSize: '13px',
      fontFamily: "'Roboto', sans-serif",
      resize: 'vertical',
      outline: 'none'
    },
    footer: {
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTop: '1px solid #f1f3f4'
    },
    actions: {
      display: 'flex',
      gap: '8px'
    },
    button: {
      padding: '8px 16px',
      fontSize: '13px',
      fontWeight: 500,
      border: '1px solid #dadce0',
      borderRadius: '4px',
      background: '#ffffff',
      color: '#5f6368',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s'
    },
    toggleButton: {
      padding: '8px 16px',
      fontSize: '13px',
      fontWeight: 500,
      border: 'none',
      background: 'transparent',
      color: '#1a73e8',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  };

  const metrics = [
    { label: 'JD Match', value: candidate.jd_similarity || 0 },
    { label: 'Skills', value: candidate.skills_match || 0 },
    { label: 'Domain', value: candidate.domain_match || 0 },
    { label: 'Experience', value: candidate.experience_match || 0 }
  ];

  return (
    <div
      style={{
        ...styles.card,
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.1)' : '0 1px 2px rgba(60,64,67,0.3)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.mainInfo}>
          <div style={styles.nameRow}>
            <h3 style={styles.name}>{candidate.name || 'Unknown'}</h3>
            <span style={styles.verdict(candidate.verdict)}>
              {candidate.verdict || 'review'}
            </span>
          </div>
          <div style={styles.contactInfo}>
            {candidate.email && candidate.email !== 'N/A' && (
              <div style={styles.contactItem}>
                <Mail size={14} />
                <span>{candidate.email}</span>
              </div>
            )}
            {candidate.phone && candidate.phone !== 'N/A' && (
              <div style={styles.contactItem}>
                <Phone size={14} />
                <span>{candidate.phone}</span>
              </div>
            )}
            {candidate.resume_file && (
              <div style={styles.contactItem}>
                <FileText size={14} />
                <span>{candidate.resume_file}</span>
              </div>
            )}
          </div>
        </div>
        <div style={styles.scoreSection}>
          <div style={{ ...styles.overallScore, color: getScoreColor(candidate.score || 0) }}>
            {formatScore(candidate.score || 0)}
          </div>
          <div style={styles.scoreLabel}>Overall Score</div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={styles.metricsGrid}>
        {metrics.map((metric, index) => (
          <div key={index} style={styles.metric}>
            <div style={styles.metricLabel}>{metric.label}</div>
            <div style={{ ...styles.metricValue, color: getScoreColor(metric.value) }}>
              {formatScore(metric.value)}
            </div>
            <div style={styles.progressBar}>
              <div style={styles.progressFill(metric.value, getScoreColor(metric.value))} />
            </div>
          </div>
        ))}
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={styles.expandedContent}>
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Fitment Summary</div>
            <p style={styles.text}>{candidate.fitment || 'No summary available'}</p>
          </div>

          {candidate.highlights && candidate.highlights.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Highlights</div>
              <ul style={styles.list}>
                {candidate.highlights.map((highlight, index) => (
                  <li key={index} style={styles.listItem}>
                    <div style={styles.bullet} />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {candidate.red_flags && candidate.red_flags.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Red Flags</div>
              <ul style={styles.list}>
                {candidate.red_flags.map((flag, index) => (
                  <li key={index} style={{ ...styles.listItem, color: '#d93025' }}>
                    <div style={{ ...styles.bullet, background: '#d93025' }} />
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={styles.section}>
            <div style={styles.sectionTitle}>Recruiter Notes</div>
            <textarea
              style={styles.notesTextarea}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => onUpdateNotes && onUpdateNotes(candidate.email, notes)}
              placeholder="Add your notes about this candidate..."
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        <button
          style={styles.toggleButton}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show Less' : 'Show More'}
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <div style={styles.actions}>
          <button
            style={styles.button}
            onClick={() => onEmailClick && onEmailClick(candidate)}
            onMouseEnter={(e) => e.target.style.background = '#f1f3f4'}
            onMouseLeave={(e) => e.target.style.background = '#ffffff'}
          >
            <MessageSquare size={14} />
            Email
          </button>
          <button
            style={styles.button}
            onClick={() => onDownloadSummary && onDownloadSummary(candidate.email)}
            onMouseEnter={(e) => e.target.style.background = '#f1f3f4'}
            onMouseLeave={(e) => e.target.style.background = '#ffffff'}
          >
            <Download size={14} />
            Summary
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;