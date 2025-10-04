import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Shield, BarChart3, Mail, CheckCircle } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    header: {
      padding: '20px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: '#ffffff',
      fontSize: '24px',
      fontWeight: 600
    },
    logoIcon: {
      width: '40px',
      height: '40px',
      background: '#ffffff',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#667eea',
      fontSize: '20px',
      fontWeight: 'bold'
    },
    hero: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '80px 40px',
      textAlign: 'center',
      color: '#ffffff'
    },
    title: {
      fontSize: '56px',
      fontWeight: 600,
      marginBottom: '24px',
      lineHeight: 1.2
    },
    subtitle: {
      fontSize: '20px',
      marginBottom: '40px',
      opacity: 0.95,
      maxWidth: '700px',
      margin: '0 auto 40px'
    },
    ctaButton: {
      padding: '16px 40px',
      fontSize: '16px',
      fontWeight: 500,
      background: '#ffffff',
      color: '#667eea',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '12px',
      transition: 'all 0.3s',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
    },
    features: {
      maxWidth: '1200px',
      margin: '60px auto',
      padding: '0 40px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '30px'
    },
    featureCard: {
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)',
      padding: '30px',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.2)',
      transition: 'all 0.3s'
    },
    featureIcon: {
      width: '50px',
      height: '50px',
      background: '#ffffff',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#667eea',
      marginBottom: '20px'
    },
    featureTitle: {
      fontSize: '20px',
      fontWeight: 500,
      color: '#ffffff',
      marginBottom: '12px'
    },
    featureDesc: {
      fontSize: '15px',
      color: 'rgba(255,255,255,0.9)',
      lineHeight: 1.6
    }
  };

  const features = [
    {
      icon: <Zap size={24} />,
      title: 'AI-Powered Analysis',
      desc: 'Intelligent role extraction, semantic matching, and multi-factor scoring using Azure OpenAI'
    },
    {
      icon: <Mail size={24} />,
      title: 'Gmail Auto-Sync',
      desc: 'Automatically processes resumes sent to your email with real-time notifications'
    },
    {
      icon: <BarChart3 size={24} />,
      title: 'Smart Insights',
      desc: 'Comprehensive analytics dashboard with customizable scoring thresholds'
    },
    {
      icon: <Shield size={24} />,
      title: 'Fraud Detection',
      desc: 'Automated quality control with red flag identification and gap analysis'
    }
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>E</div>
          EazyAI
        </div>
      </header>

      <div style={styles.hero}>
        <h1 style={styles.title}>
          Streamline Your Hiring Process
        </h1>
        <p style={styles.subtitle}>
          Intelligent Resume Screening Platform powered by AI. 
          Save time, make better decisions, hire the best talent.
        </p>
        <button
          style={styles.ctaButton}
          onClick={() => navigate('/dashboard')}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 25px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
          }}
        >
          Get Started
          <ArrowRight size={20} />
        </button>
      </div>

      <div style={styles.features}>
        {features.map((feature, index) => (
          <div
            key={index}
            style={styles.featureCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }}
          >
            <div style={styles.featureIcon}>{feature.icon}</div>
            <h3 style={styles.featureTitle}>{feature.title}</h3>
            <p style={styles.featureDesc}>{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;