import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CandidateCard from '../components/screener/CandidateCard';
import Breadcrumb from '../components/layout/breadcrumb';
import { Download, Filter, RefreshCw } from 'lucide-react';
import { screenerService } from '../services/screener.service';
import { downloadFile } from '../utils/helpers';

const ScreenerResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // ✅ useCallback used to make loadResults stable and fix ESLint warning
  const loadResults = useCallback(() => {
    let loadedResults = location.state?.results;

    if (!loadedResults) {
      loadedResults = screenerService.getCachedResults();
    }

    if (loadedResults) {
      setResults(loadedResults);
      setCandidates(loadedResults.candidates || []);
    } else {
      setResults(null);
      setCandidates([]);
    }

    setLoading(false);
  }, [location.state]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const handleExportCSV = async (verdict) => {
    try {
      const blob = await screenerService.exportCSV(verdict === 'all' ? null : verdict);
      downloadFile(blob, `candidates_${verdict}_${Date.now()}.csv`);
      alert('✓ CSV exported successfully!');
    } catch (error) {
      alert('✗ Export failed. Please try again.');
    }
  };

  const handleDownloadSummary = async (email) => {
    try {
      const blob = await screenerService.generateSummary(email);
      downloadFile(blob, `candidate_summary_${email}.pdf`);
      alert('✓ Summary downloaded successfully!');
    } catch (error) {
      alert('✗ Download failed. Please try again.');
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
      alert(`✓ Email sent to ${candidate.email}!`);
    } catch (error) {
      alert(`✗ Failed to send email: ${error.message}`);
    }
  };

  const handleUpdateNotes = async (email, notes) => {
    try {
      await screenerService.updateCandidate(email, { recruiter_notes: notes });

      // Update local state
      setCandidates((prev) =>
        prev.map((c) =>
          c.email === email ? { ...c, recruiter_notes: notes } : c
        )
      );

      // Update results object
      if (results) {
        const updatedResults = {
          ...results,
          candidates: candidates.map((c) =>
            c.email === email ? { ...c, recruiter_notes: notes } : c
          ),
        };
        setResults(updatedResults);
        sessionStorage.setItem('eazyai_last_results', JSON.stringify(updatedResults));
      }

      alert('✓ Notes saved successfully!');
    } catch (error) {
      alert('✗ Failed to save notes.');
    }
  };

  const handleRefresh = () => {
    loadResults();
    alert('✓ Results refreshed from cache');
  };

  const handleClearCache = () => {
    if (window.confirm('Clear cached results? This will remove all saved analysis data.')) {
      screenerService.clearCache();
      setResults(null);
      setCandidates([]);
      alert('✓ Cache cleared. Run a new analysis from the Screener page.');
    }
  };

  const styles = {
    container: { animation: 'fadeIn 0.3s ease' },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '16px',
    },
    titleSection: { flex: 1, minWidth: '300px' },
    title: {
      fontSize: '28px',
      fontWeight: 400,
      color: '#202124',
      margin: '0 0 8px 0',
    },
    stats: { fontSize: '14px', color: '#5f6368' },
    actions: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
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
      transition: 'all 0.2s',
    },
    filterBar: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
      padding: '16px',
      background: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #dadce0',
      flexWrap: 'wrap',
      alignItems: 'center',
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
      transition: 'all 0.2s',
    }),
    candidatesList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    emptyState: {
      textAlign: 'center',
      padding: '80px 20px',
      color: '#5f6368',
    },
    emptyIcon: { fontSize: '48px', marginBottom: '16px', opacity: 0.3 },
    emptyTitle: {
      fontSize: '20px',
      fontWeight: 500,
      marginBottom: '8px',
      color: '#202124',
    },
    emptyDesc: { fontSize: '14px', marginBottom: '24px' },
    emptyButton: {
      padding: '12px 24px',
      fontSize: '14px',
      fontWeight: 500,
      background: '#1a73e8',
      color: '#ffffff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    cacheInfo: {
      padding: '12px 16px',
      background: '#e8f0fe',
      borderRadius: '8px',
      marginBottom: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '13px',
      color: '#1a73e8',
    },
  };

  if (loading) {
    return <div style={styles.emptyState}>Loading results...</div>;
  }

  if (!results || !candidates || candidates.length === 0) {
    return (
      <div style={styles.container}>
        <Breadcrumb
          items={[
            { label: 'Resume Screener', path: '/screener' },
            { label: 'Results' },
          ]}
        />
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📊</div>
          <h2 style={styles.emptyTitle}>No Results Available</h2>
          <p style={styles.emptyDesc}>
            No analysis results found. Please run an analysis from the Resume Screener page.
          </p>
          <button
            style={styles.emptyButton}
            onClick={() => navigate('/screener')}
          >
            Go to Resume Screener
          </button>
        </div>
      </div>
    );
  }

  const filteredCandidates =
    filter === 'all'
      ? candidates
      : candidates.filter((c) => c.verdict === filter);

  return (
    <div style={styles.container}>
      <Breadcrumb
        items={[
          { label: 'Resume Screener', path: '/screener' },
          { label: 'Results' },
        ]}
      />

      <div style={styles.cacheInfo}>
        <span>💾 Results cached - Data persists until you close this tab or clear cache</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            style={{ ...styles.button, border: 'none', background: 'transparent', color: '#1a73e8' }}
            onClick={handleRefresh}
            title="Refresh from cache"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            style={{ ...styles.button, border: 'none', background: 'transparent', color: '#d93025' }}
            onClick={handleClearCache}
            title="Clear cache"
          >
            Clear
          </button>
        </div>
      </div>

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
            onMouseEnter={(e) => (e.target.style.background = '#f1f3f4')}
            onMouseLeave={(e) => (e.target.style.background = '#ffffff')}
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
            {verdict !== 'all' &&
              ` (${candidates.filter((c) => c.verdict === verdict).length})`}
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
