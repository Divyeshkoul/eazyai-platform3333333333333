import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import CandidateCard from '../components/screener/CandidateCard';
import Breadcrumb from '../components/layout/breadcrumb';
import { Download, Filter } from 'lucide-react';
import { screenerService } from '../services/screener.service';
import { downloadFile } from '../utils/helpers';

const ScreenerResults = () => {
  const location = useLocation();
  const results = location.state?.results;
  const [candidates, setCandidates] = useState(results?.candidates || []);
  const [filter, setFilter] = useState('all');

  const handleExportCSV = async (verdict) => {
    try {
      const blob = await screenerService.exportCSV(verdict === 'all' ? null : verdict);
      downloadFile(blob, `candidates_${verdict}_${Date.now()}.csv`);
      alert('CSV exported successfully!');
    } catch (error) {
      alert('Export failed. Please try again.');
    }
  };

  const handleDownloadSummary = async (email) => {
    try {
      const blob = await screenerService.generateSummary(email);
      downloadFile(blob, `candidate_summary_${email}.pdf`);
      alert('Summary downloaded successfully!');
    } catch (error) {
      alert('Download failed. Please try again.');
    }
  };

  const handleEmailClick = async (candidate) => {
    const subject = `Interview Opportunity - ${candidate.jd_role || 'Position'}`;
    let body = '';
    
    if (candidate.verdict === 'shortlist') {
      body = `Dear ${candidate.name},\n\nCongratulations! We are pleased to inform you that you have been shortlisted for the next round.\n\nBest regards,\nRecruitment Team`;
    } else {
      body = `Dear ${candidate.name},\n\nThank you for your interest. We will review your application and get back to you.\n\nBest regards,\nRecruitment Team`;
    }
    
    try {
      await screenerService.sendEmail(candidate.email, subject, body);
      alert(`Email sent to ${candidate.email}!`);
    } catch (error) {
      alert(`Failed to send email: ${error.message}`);
    }
  };

  const handleUpdateNotes = async (email, notes) => {
    try {
      await screenerService.updateCandidate(email, { recruiter_notes: notes });
      
      // Update local state
      setCandidates(prev => prev.map(c => 
        c.email === email ? { ...c, recruiter_notes: notes } : c
      ));
      
      alert('Notes saved successfully!');
    } catch (error) {
      alert('Failed to save notes.');
    }
  };

  const styles = {
    container: {
      animation: 'fadeIn 0.3s ease'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    titleSection: {
      flex: 1
    },
    title: {
      fontSize: '28px',
      fontWeight: 400,
      color: '#202124',
      margin: '0 0 8px 0'
    },
    stats: {
      fontSize: '14px',
      color: '#5f6368'
    },
    actions: {
      display: 'flex',
      gap: '12px'
    },
    button: {
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: 500,
      border: '1px solid #dadce0',
      borderRadius: '4px',
      background: '#ffffff',
      color: '#5f6368',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s'
    },
    filterBar: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
      padding: '16px',
      background: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #dadce0'
    },
    filterButton: (active) => ({
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: 500,
      border: active ? '1px solid #1a73e8' : '1px solid #dadce0',
      borderRadius: '4px',
      background: active ? '#e8f0fe' : '#ffffff',
      color: active ? '#1a73e8' : '#5f6368',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }),
    candidatesList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    emptyState: {
      textAlign: 'center',
      padding: '80px 20px',
      color: '#5f6368'
    }
  };

  if (!results) {
    return (
      <div style={styles.emptyState}>
        <h2>No Results Available</h2>
        <p>Please run an analysis first from the Resume Screener page.</p>
      </div>
    );
  }

  const filteredCandidates = filter === 'all' 
    ? candidates 
    : candidates.filter(c => c.verdict === filter);

  return (
    <div style={styles.container}>
      <Breadcrumb items={[
        { label: 'Resume Screener', path: '/screener' },
        { label: 'Results' }
      ]} />

      <div style={styles.header}>
        <div style={styles.titleSection}>
          <h1 style={styles.title}>Screening Results</h1>
          <p style={styles.stats}>
            {results?.total_processed || 0} candidates analyzed • 
            {results?.shortlisted || 0} shortlisted • 
            {results?.under_review || 0} under review • 
            {results?.rejected || 0} rejected
          </p>
        </div>
        <div style={styles.actions}>
          <button
            style={styles.button}
            onClick={() => handleExportCSV(filter)}
            onMouseEnter={(e) => e.target.style.background = '#f1f3f4'}
            onMouseLeave={(e) => e.target.style.background = '#ffffff'}
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div style={styles.filterBar}>
        <Filter size={20} style={{ color: '#5f6368' }} />
        {['all', 'shortlist', 'review', 'reject'].map((verdict) => (
          <button
            key={verdict}
            style={styles.filterButton(filter === verdict)}
            onClick={() => setFilter(verdict)}
          >
            {verdict.charAt(0).toUpperCase() + verdict.slice(1)}
            {verdict !== 'all' && ` (${candidates.filter(c => c.verdict === verdict).length})`}
          </button>
        ))}
      </div>

      <div style={styles.candidatesList}>
        {filteredCandidates.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No candidates match the selected filter.</p>
          </div>
        ) : (
          filteredCandidates.map((candidate, index) => (
            <CandidateCard
              key={index}
              candidate={candidate}
              onEmailClick={handleEmailClick}
              onDownloadSummary={handleDownloadSummary}
              onUpdateNotes={handleUpdateNotes}
            />
          ))
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ScreenerResults;