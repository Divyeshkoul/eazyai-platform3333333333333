from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class CandidateBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None

class CandidateAnalysis(BaseModel):
    name: str
    email: str
    phone: str
    jd_role: str
    skills_match: float
    domain_match: float
    experience_match: float
    jd_similarity: float
    score: float
    fitment: str
    summary_5_lines: str
    red_flags: List[str] = []
    missing_gaps: List[str] = []
    fraud_detected: bool = False
    reasons_if_rejected: List[str] = []
    recommendation: str
    highlights: List[str] = []
    verdict: str
    resume_file: str
    processing_time: Optional[float] = None
    recruiter_notes: Optional[str] = ""

class JobConfiguration(BaseModel):
    jd: str = Field(..., description="Job Description text")
    role: Optional[str] = None
    domain: Optional[str] = ""
    skills: Optional[str] = ""
    experience_range: str = "0–1 yrs"
    jd_threshold: int = 60
    skills_threshold: int = 65
    domain_threshold: int = 50
    experience_threshold: int = 55
    shortlist_threshold: int = 75
    reject_threshold: int = 40
    top_n: int = 0

class ScreenerRequest(BaseModel):
    job_config: JobConfiguration
    load_from_blob: bool = True

class BulkEmailRequest(BaseModel):
    candidate_emails: List[str]
    verdict: str
    role: str
    company_name: str = "Our Company"

class UpdateCandidateRequest(BaseModel):
    candidate_id: str
    recruiter_notes: Optional[str] = None
    verdict: Optional[str] = None