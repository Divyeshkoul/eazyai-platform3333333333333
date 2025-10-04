import os
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

# Azure Configuration - From environment
AZURE_CONFIG = {
    "openai_key": os.getenv("AZURE_OPENAI_KEY"),
    "azure_endpoint": os.getenv("AZURE_OPENAI_ENDPOINT"),
    "api_version": os.getenv("AZURE_API_VERSION", "2024-04-01-preview"),
    "connection_string": os.getenv("AZURE_STORAGE_CONNECTION_STRING"),
    "resumes_container": os.getenv("AZURE_RESUMES_CONTAINER", "resumes"),
    "summaries_container": os.getenv("AZURE_SUMMARIES_CONTAINER", "summaries"),
    "csv_container": os.getenv("AZURE_CSV_CONTAINER", "csvdata")
}

# Model Configuration
MODEL_CONFIG = {
    "fast_gpt_model": os.getenv("FAST_GPT_MODEL", "gpt-35-turbo"),
    "deep_gpt_model": os.getenv("DEEP_GPT_MODEL", "gpt-4.1"),
    "embedding_model": os.getenv("EMBEDDING_MODEL", "text-embedding-ada-002")
}

# Rest of your constants.py content stays exactly the same
WEIGHTS = {
    "jd_similarity": 0.35,
    "skills_match": 0.35,
    "domain_match": 0.20,
    "experience_match": 0.10
}

DEFAULT_THRESHOLDS = {
    "shortlist_threshold": 75,
    "reject_threshold": 40,
    "jd_similarity_min": 60,
    "skills_match_min": 65,
    "domain_match_min": 50,
    "experience_match_min": 55
}

PERFORMANCE_CONFIG = {
    "max_resume_chunks": 2,
    "chunk_size": 1500,
    "chunk_overlap": 150,
    "batch_size": 5,
    "request_timeout": 30.0,
    "max_retries": 3,
    "rate_limit_delay": 0.5
}

STRICT_GPT_PROMPT = """
You are AIRecruiter — an intelligent, unbiased, and professional virtual recruiter assistant.

Your job is to analyze resumes fairly against a job description, detect exaggerations or inconsistencies, and generate structured, clear insights for the recruiter.

Responsibilities:
1. Parse resume content into structured fields.
2. Score Skill Match, Experience Match, Domain Fit, Project Relevance, Certifications, and Soft Skills (scale of 0–100).
3. Calculate Overall Match Score (0–100%).
4. Flag any potential fraud or exaggeration.
5. Suggest improvement points and decision (shortlist/reject/etc.).

Strict Instructions:
- No assumptions. Only use explicit evidence in the resume.
- Use clear reasoning for all scores and verdicts.
- Rejection must include valid reasons (e.g. Low skill match, Score below threshold, Red flags).
- Output **strictly** in JSON format below — nothing else.

{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "9999999999",
  "jd_role": "Extracted Role from JD",
  "skills_match": 0.0,
  "domain_match": 0.0,
  "experience_match": 0.0,
  "jd_similarity": 0.0,
  "score": 0.0,
  "fitment": "2-line human summary of fitment",
  "summary_5_lines": "Short 5-line summary",
  "red_flags": ["No project names", "Missing certifications"],
  "missing_gaps": ["No email mentioned"],
  "fraud_detected": false,
  "reasons_if_rejected": ["Score below threshold", "Low domain match"],
  "recommendation": "Can be considered for data analyst roles",
  "highlights": ["AWS Certified", "Handled audits", "Worked with Salesforce"],
  "verdict": "shortlist" or "review" or "reject"
}

Be strict. Do not fill values that are missing or uncertain — use "N/A".
Avoid guessing. If fraud or gaps are suspected, flag them clearly.
"""

EMAIL_TEMPLATES = {
    "shortlist": {
        "subject": "Congratulations! You've been shortlisted for {role}",
        "body": """Dear {name},

Congratulations! After reviewing your application for the {role} position, we are pleased to inform you that you have been shortlisted for the next round.

Our team was impressed with your qualifications and experience, particularly:
{highlights}

We will be in touch soon with details about the next steps.

Best regards,
{company_name} Recruitment Team"""
    },
    "review": {
        "subject": "Application Update - Additional Review Required",
        "body": """Dear {name},

Thank you for your application for the {role} position.

Your profile is currently under review by our recruitment team. We may need some additional information to proceed.

Thank you for your patience.

Best regards,
{company_name} Recruitment Team"""
    },
    "reject": {
        "subject": "Application Status Update - {role} Position",
        "body": """Dear {name},

Thank you for your interest in the {role} position at {company_name}.

After careful consideration, we have decided not to proceed with your application at this time.

We wish you success in your career endeavors.

Best regards,
{company_name} Recruitment Team"""
    }
}

FEATURE_FLAGS = {
    "enable_fraud_detection": True,
    "enable_performance_monitoring": True,
    "enable_batch_processing": True,
    "enable_caching": True,
    "enable_detailed_logging": True,
    "enable_auto_email": True,
    "enable_pdf_generation": True,
    "enable_blob_storage": True
}