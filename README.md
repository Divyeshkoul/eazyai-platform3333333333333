# EazyAI Platform - Complete Setup & User Guide

## 📋 Table of Contents
- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Features & Usage](#features--usage)
- [Component Documentation](#component-documentation)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Configuration](#configuration)

---

## 🎯 Overview

**EazyAI Platform** is an AI-powered recruitment automation system that intelligently screens resumes, analyzes candidates against job descriptions, and provides comprehensive analytics. Built with React (frontend) and FastAPI (backend), it leverages Azure OpenAI for intelligent matching and scoring.

### Key Capabilities
- **AI-Powered Analysis**: Semantic matching using Azure OpenAI embeddings
- **Multi-Format Support**: PDF, DOC, DOCX resume parsing
- **Gmail Integration**: Auto-sync resumes from email
- **Smart Scoring**: Multi-factor scoring (Skills, Domain, Experience, JD Similarity)
- **Fraud Detection**: Automated quality control and red flag identification
- **Email Automation**: Bulk email candidates with custom templates
- **Analytics Dashboard**: Real-time insights and visualizations

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Landing  │  │Dashboard │  │ Screener │  │ Results  │   │
│  │   Page   │  │   Page   │  │   Page   │  │   Page   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│         │              │              │              │       │
│         └──────────────┴──────────────┴──────────────┘      │
│                         │ Axios API                          │
└─────────────────────────┼────────────────────────────────────┘
                          │
┌─────────────────────────┼────────────────────────────────────┐
│                  Backend (FastAPI)                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Screener │  │Dashboard │  │  Gmail   │  │  Upload  │   │
│  │   API    │  │   API    │  │   API    │  │   API    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│         │              │              │              │       │
│         └──────────────┴──────────────┴──────────────┘      │
│                         │                                    │
│  ┌──────────────────────┴────────────────────────────────┐ │
│  │              Services Layer                           │ │
│  │  - Screener Service (GPT Analysis)                    │ │
│  │  - Email Service (SMTP)                               │ │
│  │  - Gmail Service (IMAP)                               │ │
│  │  - PDF Service (Summary Generation)                   │ │
│  │  - Azure Storage Service (Blob Storage)               │ │
│  └───────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────┼────────────────────────────────────┐
│                External Services                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Azure OpenAI │  │ Azure Blob   │  │    Gmail     │     │
│  │   (GPT-4)    │  │   Storage    │  │  (IMAP/SMTP) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

---

## 📦 Prerequisites

### Required Software
- **Python 3.10+** (Backend)
- **Node.js 16+** and npm (Frontend)
- **Git** (Version control)

### Required Services
- **Azure OpenAI Account** (GPT-4 & Embeddings)
- **Azure Storage Account** (Blob storage)
- **Gmail Account** with App Password (Email integration)

---

## 🚀 Installation & Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/eazyai-platform.git
cd eazyai-platform
```

### Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Backend Configuration

Create `backend/.env` file:

```env
# Azure OpenAI Configuration
AZURE_OPENAI_KEY=your_azure_openai_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_API_VERSION=2024-04-01-preview

# Azure Storage Configuration
AZURE_STORAGE_CONNECTION_STRING=your_storage_connection_string
AZURE_RESUMES_CONTAINER=resumes
AZURE_SUMMARIES_CONTAINER=summaries
AZURE_CSV_CONTAINER=csvdata

# Gmail Configuration
GMAIL_EMAIL=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_app_password
GMAIL_IMAP_SERVER=imap.gmail.com
GMAIL_IMAP_PORT=993

# SMTP Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_smtp_email@gmail.com
SMTP_PASSWORD=your_smtp_password
HR_EMAIL=hr_email@gmail.com

# Model Configuration
FAST_GPT_MODEL=gpt-35-turbo
DEEP_GPT_MODEL=gpt-4
EMBEDDING_MODEL=text-embedding-ada-002

# Server Configuration
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
FRONTEND_URL=http://localhost:3000
```

**Getting Azure Credentials:**
1. Go to [Azure Portal](https://portal.azure.com)
2. Create OpenAI resource → Get API key & endpoint
3. Create Storage Account → Get connection string
4. Create containers: `resumes`, `summaries`, `csvdata`

**Getting Gmail App Password:**
1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account → Security → App Passwords
3. Generate password for "Mail"

### Step 4: Frontend Setup

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install
```

### Step 5: Frontend Configuration

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_API_TIMEOUT=60000
REACT_APP_ENV=development
```

---

## 🎮 Running the Application

### Start Backend Server

```bash
cd backend
python -m app.main
```

**Expected Output:**
```
INFO:     Starting EazyAI Platform...
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Access Points:**
- API: http://localhost:8000
- Interactive Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

### Start Frontend Server

```bash
# New terminal
cd frontend
npm start
```

**Expected Output:**
```
Compiled successfully!
Local:            http://localhost:3000
```

**Access:** http://localhost:3000

---

## 💡 Features & Usage

### 1. Landing Page
**Route:** `/`

Beautiful gradient landing page with feature highlights.

**Actions:**
- Click "Get Started" → Navigate to Dashboard

---

### 2. Dashboard
**Route:** `/dashboard`

**Features:**
- **Quick Stats Cards**: Total candidates, shortlisted, under review, rejected
- **Score Distribution Chart**: Histogram of candidate scores
- **Verdict Breakdown**: Pie chart of screening verdicts
- **Average Scores**: Bar chart by category
- **Recent Activity Feed**: Latest analysis sessions

**Usage:**
- Auto-refreshes after each analysis
- Download charts as CSV
- Click maximize to zoom charts

---

### 3. Resume Screener
**Route:** `/screener`

**Step-by-Step Usage:**

#### Upload Resumes
**Option 1: Manual Upload**
```
1. Click "Upload Resumes" button
2. Select PDF/DOC/DOCX files (multiple allowed)
3. Wait for upload confirmation
4. Files stored in Azure Blob Storage
```

**Option 2: Gmail Sync**
```
1. Send resumes to configured Gmail (eazyhire111@gmail.com)
2. Click "Sync from Gmail" button
3. System processes unread emails
4. Extracts attachments → Uploads to blob
```

#### Configure Job Requirements

**Job Description:**
```
1. Paste full JD in textarea (min 50 characters)
2. System auto-extracts role (e.g., "Software Engineer")
3. Displayed below JD textarea
```

**Basic Configuration:**
- **Domain**: Industry/sector (e.g., Healthcare, Fintech)
- **Required Skills**: Comma-separated (e.g., Python, React, AWS)
- **Experience Range**: Dropdown (0-1 yrs, 1-3 yrs, 2-4 yrs, 4+ yrs)

**Advanced Thresholds** (Click "Show Advanced Thresholds"):
- **JD Similarity** (0-100): Minimum semantic match with JD
- **Skills Match** (0-100): Required skills coverage percentage
- **Domain Match** (0-100): Industry experience alignment
- **Experience Match** (0-100): Years of experience fit
- **Shortlist Threshold** (0-100): Auto-shortlist if score ≥ this
- **Reject Threshold** (0-100): Auto-reject if score < this

**Default Values:**
```javascript
jd_threshold: 60
skills_threshold: 65
domain_threshold: 50
experience_threshold: 55
shortlist_threshold: 75
reject_threshold: 40
```

#### Start Analysis

```
1. Click "Start Analysis" button
2. Loading screen: "Analyzing resumes with AI..."
3. Backend processes:
   - Downloads resumes from Azure Blob
   - Parses content (PDF/DOC extraction)
   - Generates embeddings
   - GPT-4 analysis per resume
   - Multi-factor scoring
   - Verdict assignment
4. Auto-navigates to Results page
```

**Processing Time:** 30-90 seconds (depends on resume count)

---

### 4. Screening Results
**Route:** `/screener-results`

**Layout:**
- **Header Stats**: Total processed, shortlisted, under review, rejected
- **Filter Bar**: View all, shortlisted only, review only, rejected only
- **Candidate Cards**: Detailed view per candidate

#### Candidate Card Details

**Header Section:**
- Name, email, phone, resume filename
- Verdict badge (color-coded)
- Overall score (large display)

**Metrics Grid:**
- JD Match, Skills, Domain, Experience (with progress bars)

**Expanded View** (Click "Show More"):
- **Fitment Summary**: AI-generated 2-line summary
- **Highlights**: Positive points (certifications, projects, etc.)
- **Red Flags**: Issues detected (inconsistencies, gaps, etc.)
- **Recruiter Notes**: Editable textarea (auto-saves on blur)

**Actions:**
- **Email Button**: Send automated email (shortlist/review/reject templates)
- **Summary Button**: Download PDF summary of candidate analysis

**Export Options:**
- **Export CSV**: Download filtered results (all/shortlist/review/reject)

---

### 5. AI Interview Bot
**Route:** `/interview`

**Status:** Coming Soon (Placeholder page)

---

## 🔧 Component Documentation

### Frontend Structure

```
frontend/src/
├── components/
│   ├── common/            # Reusable UI components
│   │   ├── Button.jsx     # Styled button with variants
│   │   ├── Card.jsx       # Container with hover effects
│   │   ├── Loader.jsx     # Loading spinner
│   │   ├── Modal.jsx      # Popup dialog
│   │   └── Slider.jsx     # Range input with label
│   │
│   ├── layout/            # Page layout components
│   │   ├── Sidebar.jsx    # Left navigation
│   │   ├── Header.jsx     # Top bar with search/notifications
│   │   ├── MainLayout.jsx # Wrapper with sidebar + header
│   │   └── Breadcrumb.jsx # Navigation path
│   │
│   ├── dashboard/         # Dashboard widgets
│   │   ├── AnalyticsCard.jsx  # Stat card with icon
│   │   ├── ChartWidget.jsx    # Recharts wrapper
│   │   ├── QuickStats.jsx     # 4-card stats grid
│   │   └── RecentActivity.jsx # Activity feed
│   │
│   └── screener/          # Screener specific
│       ├── JobConfiguration.jsx  # JD input form
│       ├── CandidateCard.jsx     # Result card
│       ├── FilterPanel.jsx       # Filter controls
│       ├── ScoringPanel.jsx      # Score breakdown
│       ├── BulkActions.jsx       # Multi-select actions
│       └── GmailSync.jsx         # Gmail status widget
│
├── pages/                 # Route pages
│   ├── LandingPage.jsx
│   ├── Dashboard.jsx
│   ├── Screener.jsx
│   ├── ScreenerResults.jsx
│   ├── Interview.jsx
│   └── NotFound.jsx
│
├── services/              # API communication
│   ├── api.js             # Axios instance
│   ├── screener.service.js
│   ├── dashboard.service.js
│   └── auth.service.js
│
├── utils/                 # Helper functions
│   ├── constants.js       # Config constants
│   ├── helpers.js         # Utility functions
│   └── validators.js      # Form validation
│
├── hooks/                 # Custom React hooks
│   ├── useScreener.js
│   ├── useDashboard.js
│   └── useDebounce.js
│
└── styles/                # Global CSS
    ├── globals.css
    ├── variables.css
    └── animations.css
```

### Backend Structure

```
backend/app/
├── api/endpoints/         # API routes
│   ├── screener.py        # Resume analysis endpoints
│   ├── dashboard.py       # Analytics endpoints
│   ├── gmail.py           # Gmail sync endpoints
│   └── upload.py          # File upload endpoints
│
├── services/              # Business logic
│   ├── screener_service.py   # GPT analysis
│   ├── gmail_service.py      # Email processing
│   ├── email_service.py      # SMTP sending
│   ├── pdf_service.py        # PDF generation
│   └── azure_service.py      # Blob storage
│
├── models/                # Database models (future)
│   ├── candidate.py
│   └── analysis.py
│
├── schemas/               # Pydantic models
│   ├── candidate.py       # Request/response schemas
│   ├── analysis.py
│   └── response.py
│
├── utils/                 # Helper functions
│   ├── parse_resume.py    # Multi-format parser
│   ├── embeddings.py      # Vector operations
│   ├── contact_extractor.py
│   └── validators.py
│
├── core/                  # App configuration
│   ├── config.py          # Environment settings
│   ├── constants.py       # Static values
│   └── security.py        # Auth (future)
│
└── main.py                # FastAPI app entry point
```

---

## 📡 API Documentation

### Base URL
`http://localhost:8000`

### Screener Endpoints

#### 1. Analyze Resumes
```http
POST /api/screener/analyze
Content-Type: application/json

{
  "job_config": {
    "jd": "Job description text...",
    "role": "Software Engineer",
    "domain": "Technology",
    "skills": "Python, React, AWS",
    "experience_range": "2–4 yrs",
    "jd_threshold": 60,
    "skills_threshold": 65,
    "domain_threshold": 50,
    "experience_threshold": 55,
    "shortlist_threshold": 75,
    "reject_threshold": 40,
    "top_n": 0
  },
  "load_from_blob": true
}
```

**Response:**
```json
{
  "success": true,
  "total_processed": 10,
  "shortlisted": 3,
  "under_review": 5,
  "rejected": 2,
  "processing_time": 45.23,
  "candidates": [ /* array of candidate objects */ ]
}
```

#### 2. Upload Resume
```http
POST /api/upload/resume
Content-Type: multipart/form-data

file: <PDF/DOC/DOCX file>
```

#### 3. Export CSV
```http
GET /api/screener/export/csv?verdict=shortlist
```

#### 4. Send Email
```http
POST /api/screener/email/send
Content-Type: application/json

{
  "email": "candidate@example.com",
  "subject": "Interview Opportunity",
  "body": "Email body..."
}
```

### Dashboard Endpoints

#### 1. Get Statistics
```http
GET /api/dashboard/stats
```

**Response:**
```json
{
  "total_candidates": 50,
  "shortlisted": 15,
  "under_review": 25,
  "rejected": 10,
  "avg_score": 65.4,
  "recent_analyses": [],
  "format_breakdown": {"pdf": 30, "docx": 20}
}
```

#### 2. Get Analytics
```http
GET /api/dashboard/analytics
```

### Gmail Endpoints

#### 1. Sync Gmail
```http
POST /api/gmail/sync
```

#### 2. Get Status
```http
GET /api/gmail/status
```

---

## 🐛 Troubleshooting

### Backend Won't Start

**Error:** `ImportError: cannot import name...`
```bash
# Solution: Check all imports in main.py
# Ensure all service files exist
# Verify no circular dependencies
```

**Error:** `ModuleNotFoundError: No module named 'app'`
```bash
# Solution: Run from backend directory
cd backend
python -m app.main
```

### Frontend Errors

**Error:** `Module not found: Can't resolve './App.jsx'`
```bash
# Solution: Ensure file names match (case-sensitive)
# App.jsx not app.jsx
```

**Error:** `Element type is invalid`
```bash
# Solution: Check component exports
# Ensure: export default ComponentName
# Not: export { ComponentName }
```

### Analysis Fails

**Error:** `Analysis failed: Network Error`
```bash
# Check backend is running on port 8000
# Verify CORS settings in main.py
# Check browser console for exact error
```

**Error:** `No resumes found in Azure Blob`
```bash
# Upload resumes first
# Verify Azure connection string
# Check container names match
```

### Gmail Sync Fails

**Error:** `Gmail authentication failed`
```bash
# Verify Gmail credentials in .env
# Check app password (not regular password)
# Enable IMAP in Gmail settings
```

---

## ⚙️ Configuration

### Performance Tuning

**Backend:** `backend/app/core/constants.py`
```python
PERFORMANCE_CONFIG = {
    "max_resume_chunks": 2,     # Reduce for faster processing
    "chunk_size": 1500,         # Token limit per chunk
    "batch_size": 5,            # Concurrent processing
    "request_timeout": 30.0,    # GPT request timeout
    "max_retries": 3            # Retry failed requests
}
```

### Scoring Weights

```python
WEIGHTS = {
    "jd_similarity": 0.35,   # 35% weight
    "skills_match": 0.35,    # 35% weight
    "domain_match": 0.20,    # 20% weight
    "experience_match": 0.10 # 10% weight
}
```

**Formula:**
```
Final Score = (JD_Similarity × 0.35) + 
              (Skills_Match × 0.35) + 
              (Domain_Match × 0.20) + 
              (Experience_Match × 0.10)
```

### Email Templates

**Location:** `backend/app/core/constants.py`

```python
EMAIL_TEMPLATES = {
    "shortlist": {
        "subject": "Congratulations! You've been shortlisted",
        "body": "Template with {name}, {role}, {highlights}"
    }
}
```

---

## 📊 Data Persistence

**Current State:** In-memory storage (Python dict)
- Data persists during server runtime
- Lost on server restart

**Production Recommendation:**
```
Option 1: PostgreSQL
- Full relational database
- Complex queries
- Historical data

Option 2: Redis
- Fast in-memory cache
- Session management
- Real-time updates

Option 3: MongoDB
- Document-based
- Flexible schema
- JSON-like storage
```

---

## 🔒 Security Considerations

### Current Setup (Development)
- ⚠️ No authentication
- ⚠️ No rate limiting
- ⚠️ Credentials in .env files

### Production Recommendations
```
1. Add JWT authentication
2. Implement rate limiting (FastAPI-Limiter)
3. Use environment-specific secrets (Azure Key Vault)
4. Enable HTTPS
5. Add API key validation
6. Implement RBAC (Role-Based Access Control)
7. Add audit logging
8. Sanitize user inputs
```

---

## 📈 Scaling Considerations

**Current Limits:**
- Single server instance
- Synchronous resume processing
- In-memory data storage

**Scale Solutions:**
```
1. Horizontal Scaling
   - Load balancer (Nginx)
   - Multiple FastAPI instances
   - Redis for shared state

2. Async Processing
   - Celery for background tasks
   - RabbitMQ/Redis as message broker
   - Separate worker processes

3. Database
   - PostgreSQL with connection pooling
   - Read replicas for analytics

4. Caching
   - Redis for embeddings cache
   - CDN for static assets

5. Monitoring
   - Prometheus + Grafana
   - Error tracking (Sentry)
   - Performance monitoring
```

---

## 📝 License

This project is proprietary software. All rights reserved.

---

## 🤝 Support

For issues or questions:
1. Check logs in terminal
2. Review troubleshooting section
3. Check browser console (F12)
4. Verify all credentials in .env files

---

**Version:** 2.0.0  
**Last Updated:** October 2025
